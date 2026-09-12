import 'dart:async';
import 'dart:convert';
import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:samadhan_health/core/constants/app_constants.dart';
import 'package:samadhan_health/core/models/telemetry_packet.dart';
import 'package:samadhan_health/modules/risk/tiny_ml_risk_engine.dart';
import 'package:samadhan_health/modules/sync/firebase_sync_service.dart';

class BleGatewayService extends ChangeNotifier {
  final FirebaseSyncService _syncService;
  final TinyMlRiskEngine _riskEngine = TinyMlRiskEngine();

  BluetoothDevice? _connectedDevice;
  StreamSubscription? _scanSubscription;
  StreamSubscription? _notifySubscription;
  Timer? _simulationTimer;

  ConnectionStatus _status = ConnectionStatus.disconnected;
  bool _isScanning = false;
  bool _isSimulationActive = false;
  List<ScanResult> _scanResults = [];

  TelemetryPacket? _latestPacket;
  RiskAssessmentResult? _latestRiskAssessment;
  final List<TelemetryPacket> _telemetryHistory = [];

  String _currentUid = 'demo-patient-uid';

  ConnectionStatus get status => _status;
  bool get isScanning => _isScanning;
  bool get isSimulationActive => _isSimulationActive;
  List<ScanResult> get scanResults => _scanResults;
  BluetoothDevice? get connectedDevice => _connectedDevice;
  TelemetryPacket? get latestPacket => _latestPacket;
  RiskAssessmentResult? get latestRiskAssessment => _latestRiskAssessment;
  List<TelemetryPacket> get telemetryHistory => List.unmodifiable(_telemetryHistory);

  BleGatewayService(this._syncService) {
    // Start in simulation by default so the app is immediately alive and interactive
    startSimulation();
  }

  void setUserUid(String uid) {
    _currentUid = uid;
  }

  /// Start BLE Scan for Samadhan Wearables (Contract Section 3)
  Future<void> startScan() async {
    if (_isScanning) return;
    _scanResults.clear();
    _isScanning = true;
    notifyListeners();

    try {
      if (await FlutterBluePlus.isSupported == false) {
        debugPrint('BLE is not supported on this platform');
        _isScanning = false;
        notifyListeners();
        return;
      }

      await FlutterBluePlus.startScan(
        timeout: const Duration(seconds: 8),
      );

      _scanSubscription = FlutterBluePlus.scanResults.listen((results) {
        _scanResults = results;
        notifyListeners();
      });

      await Future.delayed(const Duration(seconds: 8));
      await stopScan();
    } catch (e) {
      debugPrint('Error starting BLE scan: $e');
      _isScanning = false;
      notifyListeners();
    }
  }

  Future<void> stopScan() async {
    await FlutterBluePlus.stopScan();
    await _scanSubscription?.cancel();
    _isScanning = false;
    notifyListeners();
  }

  /// Connect to physical BLE device
  Future<bool> connectToDevice(BluetoothDevice device) async {
    stopSimulation();
    await stopScan();

    try {
      _status = ConnectionStatus.cached;
      notifyListeners();

      await device.connect(
        license: License.nonprofit,
        timeout: const Duration(seconds: 10),
      );
      _connectedDevice = device;

      // Discover services
      final services = await device.discoverServices();
      for (final service in services) {
        for (final c in service.characteristics) {
          if (c.properties.notify || c.properties.read) {
            await c.setNotifyValue(true);
            _notifySubscription = c.onValueReceived.listen(_onCharacteristicPacketReceived);
            break;
          }
        }
      }

      _status = ConnectionStatus.live;
      notifyListeners();
      return true;
    } catch (e) {
      debugPrint('Failed to connect to device: $e');
      _status = ConnectionStatus.disconnected;
      _connectedDevice = null;
      notifyListeners();
      return false;
    }
  }

  void disconnectDevice() {
    _notifySubscription?.cancel();
    _connectedDevice?.disconnect();
    _connectedDevice = null;
    _status = ConnectionStatus.disconnected;
    notifyListeners();
  }

  void _onCharacteristicPacketReceived(List<int> rawBytes) {
    try {
      final jsonStr = utf8.decode(rawBytes);
      final data = jsonDecode(jsonStr) as Map<String, dynamic>;
      final packet = TelemetryPacket.fromJson(data);
      _handleIncomingPacket(packet);
    } catch (_) {
      // Fallback: parse compact binary packet format if needed
    }
  }

  void _handleIncomingPacket(TelemetryPacket packet) {
    // 1. Run local on-device TinyML & Multi-Sensor Temporal Fusion Engine
    _latestRiskAssessment = _riskEngine.evaluateTelemetry(packet);

    // 2. Attach updated composite risk score
    final evaluatedPacket = TelemetryPacket(
      deviceId: packet.deviceId,
      timestamp: packet.timestamp,
      heartRate: packet.heartRate,
      spo2: packet.spo2,
      hrStatus: packet.hrStatus,
      spo2Status: packet.spo2Status,
      ppgQuality: packet.ppgQuality,
      temperature: packet.temperature,
      humidity: packet.humidity,
      dhtStatus: packet.dhtStatus,
      accelX: packet.accelX,
      accelY: packet.accelY,
      accelZ: packet.accelZ,
      accelMagnitude: packet.accelMagnitude,
      gyroX: packet.gyroX,
      gyroY: packet.gyroY,
      gyroZ: packet.gyroZ,
      gyroActivity: packet.gyroActivity,
      movementState: packet.movementState,
      imuStatus: packet.imuStatus,
      overallDataQuality: packet.overallDataQuality,
      riskScore: _latestRiskAssessment!.compositeRiskScore,
      fallState: packet.fallState,
      battery: packet.battery,
      isSynced: packet.isSynced,
    );

    _latestPacket = evaluatedPacket;
    _telemetryHistory.add(evaluatedPacket);
    if (_telemetryHistory.length > 50) {
      _telemetryHistory.removeAt(0);
    }

    _status = ConnectionStatus.live;
    notifyListeners();

    // 3. Relay to cloud sync gateway (Contract Section 5)
    _syncService.syncPacket(
      uid: _currentUid,
      packet: evaluatedPacket,
    );
  }

  /// -------------------------------------------------------------
  /// Simulation Mode: Generates physiological sensor data matching Contract
  /// -------------------------------------------------------------
  void startSimulation() {
    if (_isSimulationActive) return;
    _isSimulationActive = true;
    _status = ConnectionStatus.live;

    final random = Random();
    int baseHr = 72;
    double baseSpo2 = 98.2;

    _simulationTimer?.cancel();
    _simulationTimer = Timer.periodic(const Duration(seconds: 2), (timer) {
      // Natural sinusoidal heart rate variance
      final hrJitter = (sin(timer.tick * 0.15) * 4 + random.nextInt(3)).round();
      final currentHr = (baseHr + hrJitter).clamp(55, 150);

      final spo2Jitter = (random.nextDouble() * 0.6 - 0.3);
      final currentSpo2 = ((baseSpo2 + spo2Jitter) * 10).round() / 10.0;

      // 6-axis IMU acceleration with earth gravity vector ~1.0g
      final ax = (random.nextDouble() * 0.08 - 0.04);
      final ay = (random.nextDouble() * 0.08 - 0.04);
      final az = 0.98 + (random.nextDouble() * 0.04 - 0.02);
      final mag = sqrt(ax * ax + ay * ay + az * az);

      final packet = TelemetryPacket(
        deviceId: 'SAMADHAN-BAND-A7F39C',
        timestamp: DateTime.now(),
        heartRate: currentHr,
        spo2: currentSpo2.clamp(90.0, 100.0),
        hrStatus: 'VALID',
        spo2Status: 'VALID',
        ppgQuality: 'GOOD',
        temperature: 26.4,
        humidity: 54.0,
        dhtStatus: 'VALID',
        accelX: double.parse(ax.toStringAsFixed(3)),
        accelY: double.parse(ay.toStringAsFixed(3)),
        accelZ: double.parse(az.toStringAsFixed(3)),
        accelMagnitude: double.parse(mag.toStringAsFixed(3)),
        gyroX: 0.2,
        gyroY: 0.1,
        gyroZ: -0.1,
        gyroActivity: 0.05,
        movementState: mag > 1.2 ? 'ACTIVE' : 'RESTING',
        imuStatus: 'VALID',
        overallDataQuality: 'GOOD',
        fallState: 'IDLE',
        battery: 88,
      );

      _handleIncomingPacket(packet);
    });

    notifyListeners();
  }

  void stopSimulation() {
    _simulationTimer?.cancel();
    _simulationTimer = null;
    _isSimulationActive = false;
    notifyListeners();
  }

  /// Trigger simulated high-impact fall (Contract Section 4)
  void simulateEmergencyFall() {
    final fallPacket = TelemetryPacket(
      deviceId: 'SAMADHAN-BAND-A7F39C',
      timestamp: DateTime.now(),
      heartRate: 128,
      spo2: 92.0,
      hrStatus: 'VALID',
      spo2Status: 'VALID',
      ppgQuality: 'FAIR',
      temperature: 26.8,
      humidity: 56.0,
      dhtStatus: 'VALID',
      accelX: 2.45,
      accelY: -1.82,
      accelZ: 3.91,
      accelMagnitude: 4.95, // High impact acceleration spike
      gyroX: 180.5,
      gyroY: 220.0,
      gyroZ: 95.2,
      gyroActivity: 1.85,
      movementState: 'ACTIVE',
      imuStatus: 'VALID',
      overallDataQuality: 'GOOD',
      fallState: 'FALL_CONFIRMED', // Confirmed fall
      battery: 85,
    );

    _handleIncomingPacket(fallPacket);
  }
}
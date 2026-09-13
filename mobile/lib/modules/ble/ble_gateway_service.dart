import 'dart:async';
import 'dart:convert';
import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:samadhan_health/core/constants/app_constants.dart';
import 'package:samadhan_health/core/models/telemetry_packet.dart';
import 'package:samadhan_health/modules/guardian/wearable_guardian_service.dart';
import 'package:samadhan_health/modules/risk/tiny_ml_risk_engine.dart';
import 'package:samadhan_health/modules/sync/firebase_sync_service.dart';

class BleGatewayService extends ChangeNotifier {
  final FirebaseSyncService _syncService;
  final TinyMlRiskEngine _riskEngine = TinyMlRiskEngine();
  WearableGuardianService? _guardianService;

  ConnectionStatus _status = ConnectionStatus.disconnected;
  bool _isScanning = false;
  bool _isSimulationActive = false;
  List<ScanResult> _scanResults = [];
  BluetoothDevice? _connectedDevice;
  String? _lastPairedDeviceId;

  TelemetryPacket? _latestPacket;
  RiskAssessmentResult? _latestRiskAssessment;
  final List<TelemetryPacket> _telemetryHistory = [];

  StreamSubscription? _scanSubscription;
  StreamSubscription? _notifySubscription;
  StreamSubscription? _adapterStateSubscription;
  Timer? _simulationTimer;
  BluetoothAdapterState _adapterState = BluetoothAdapterState.unknown;

  String _currentUid = 'usr_default';

  // Simulation test toggles for verification
  int _simRssi = -65;
  bool _simOffWrist = false;
  bool _simCharging = false;
  int _simBattery = 88;

  // Getters
  ConnectionStatus get status => _status;
  bool get isConnected => _status == ConnectionStatus.live;
  bool get isScanning => _isScanning;
  bool get isSimulationActive => _isSimulationActive;
  List<ScanResult> get scanResults => _scanResults;
  BluetoothDevice? get connectedDevice => _connectedDevice;
  String? get lastPairedDeviceId => _lastPairedDeviceId;
  TelemetryPacket? get latestPacket => _latestPacket;
  RiskAssessmentResult? get latestRiskAssessment => _latestRiskAssessment;
  List<TelemetryPacket> get telemetryHistory => List.unmodifiable(_telemetryHistory);
  BluetoothAdapterState get adapterState => _adapterState;
  bool get isBluetoothOn => _adapterState == BluetoothAdapterState.on;

  BleGatewayService(this._syncService) {
    _initBluetoothLifecycle();
    startSimulation();
  }

  void setGuardianService(WearableGuardianService guardian) {
    _guardianService = guardian;
  }

  void setUserUid(String uid) {
    _currentUid = uid;
  }

  Future<void> _initBluetoothLifecycle() async {
    final prefs = await SharedPreferences.getInstance();
    _lastPairedDeviceId = prefs.getString('last_paired_device_id');

    try {
      if (await FlutterBluePlus.isSupported) {
        _adapterStateSubscription = FlutterBluePlus.adapterState.listen((state) {
          _adapterState = state;
          notifyListeners();

          if (state == BluetoothAdapterState.on) {
            debugPrint('[BLE Gateway] Adapter is ON - Auto-checking paired wearable...');
            autoReconnectIfConfigured();
          } else if (state == BluetoothAdapterState.off) {
            debugPrint('[BLE Gateway] Adapter is OFF');
            if (_connectedDevice != null) {
              disconnectDevice();
            }
          }
        });
      }
    } catch (e) {
      debugPrint('[BLE Gateway] Bluetooth initialization error: $e');
    }
  }

  /// Automatically reconnect to the last known band if Bluetooth is enabled
  Future<void> autoReconnectIfConfigured() async {
    if (_connectedDevice != null || _isScanning) return;

    final prefs = await SharedPreferences.getInstance();
    _lastPairedDeviceId = prefs.getString('last_paired_device_id');

    if (_lastPairedDeviceId != null && _lastPairedDeviceId!.isNotEmpty) {
      debugPrint('[BLE Gateway] Found saved paired device ID: $_lastPairedDeviceId. Attempting auto-reconnect...');
      
      try {
        final device = BluetoothDevice.fromId(_lastPairedDeviceId!);
        final success = await connectToDevice(device);
        if (!success) {
          debugPrint('[BLE Gateway] Direct auto-reconnect failed. Launching discovery scan...');
          startScan();
        }
      } catch (e) {
        debugPrint('[BLE Gateway] Auto-reconnect exception: $e');
      }
    }
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

        // Check if last paired device is found in scan results
        if (_lastPairedDeviceId != null && _connectedDevice == null) {
          for (final res in results) {
            if (res.device.remoteId.str == _lastPairedDeviceId) {
              debugPrint('[BLE Gateway] Target paired device discovered: ${res.device.remoteId.str}');
              connectToDevice(res.device);
              break;
            }
          }
        }
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
      _lastPairedDeviceId = device.remoteId.str;

      // Persist last paired device
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('last_paired_device_id', device.remoteId.str);

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

  /// Send Command to Band to Vibrate / Ring Buzzer ("Find My Device")
  Future<bool> triggerFindDeviceBuzzer() async {
    if (_connectedDevice != null) {
      try {
        final services = await _connectedDevice!.discoverServices();
        for (final s in services) {
          for (final c in s.characteristics) {
            if (c.properties.write) {
              // Standard buzzer/alert command payload: [0xAA, 0x01, 0x55]
              await c.write([0xAA, 0x01, 0x55]);
              return true;
            }
          }
        }
      } catch (e) {
        debugPrint('Find device write failed: $e');
      }
    }
    // In simulation mode, succeed with feedback
    return true;
  }

  void _onCharacteristicPacketReceived(List<int> rawBytes) {
    try {
      final jsonStr = utf8.decode(rawBytes);
      final data = jsonDecode(jsonStr) as Map<String, dynamic>;
      final packet = TelemetryPacket.fromJson(data);
      _handleIncomingPacket(packet);
    } catch (_) {
      // Binary packet decoding fallback if needed
    }
  }

  void _handleIncomingPacket(TelemetryPacket packet) {
    // 1. Run TinyML Risk Engine
    _latestRiskAssessment = _riskEngine.evaluateTelemetry(packet);

    // 2. Attach updated risk score
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
      isCharging: packet.isCharging,
      rssi: packet.rssi,
      isSynced: packet.isSynced,
    );

    _latestPacket = evaluatedPacket;
    _telemetryHistory.add(evaluatedPacket);
    if (_telemetryHistory.length > 50) {
      _telemetryHistory.removeAt(0);
    }

    _status = ConnectionStatus.live;
    notifyListeners();

    // 3. Process guardian heuristics (Proximity, Off-Wrist, Charging)
    _guardianService?.processTelemetry(evaluatedPacket);

    // 4. Relay to Cloud Sync Gateway
    _syncService.syncPacket(
      uid: _currentUid,
      packet: evaluatedPacket,
    );
  }

  /// -------------------------------------------------------------
  /// Simulation Mode: Generates physiological sensor data
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
      final hrJitter = (sin(timer.tick * 0.15) * 4 + random.nextInt(3)).round();
      final currentHr = (baseHr + hrJitter).clamp(55, 150);

      final spo2Jitter = (random.nextDouble() * 0.6 - 0.3);
      final currentSpo2 = ((baseSpo2 + spo2Jitter) * 10).round() / 10.0;

      final ax = (random.nextDouble() * 0.08 - 0.04);
      final ay = (random.nextDouble() * 0.08 - 0.04);
      final az = 0.98 + (random.nextDouble() * 0.04 - 0.02);
      final mag = sqrt(ax * ax + ay * ay + az * az);

      // Normal RSSI slight jitter around base
      final currentRssi = _simRssi + random.nextInt(3) - 1;

      final packet = TelemetryPacket(
        deviceId: 'SAMADHAN-BAND-A7F39C',
        timestamp: DateTime.now(),
        heartRate: _simOffWrist ? null : currentHr,
        spo2: _simOffWrist ? null : currentSpo2.clamp(90.0, 100.0),
        hrStatus: _simOffWrist ? 'INVALID' : 'VALID',
        spo2Status: _simOffWrist ? 'INVALID' : 'VALID',
        ppgQuality: _simOffWrist ? 'POOR' : 'GOOD',
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
        overallDataQuality: _simOffWrist ? 'POOR' : 'GOOD',
        fallState: 'IDLE',
        battery: _simBattery,
        isCharging: _simCharging,
        rssi: currentRssi,
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

  /// Simulation control helpers for testing all guardian conditions
  void simulateMoveAway() {
    _simRssi = -92; // Causes distance to jump to >10 meters
    notifyListeners();
  }

  void simulateMoveClose() {
    _simRssi = -60; // Normal close distance (~1.1 meters)
    notifyListeners();
  }

  void simulateTakeOffWrist() {
    _simOffWrist = true;
    notifyListeners();
  }

  void simulatePutOnWrist() {
    _simOffWrist = false;
    notifyListeners();
  }

  void simulateToggleCharging() {
    _simCharging = !_simCharging;
    notifyListeners();
  }

  void simulateLowBattery() {
    _simBattery = 14;
    _simCharging = false;
    notifyListeners();
  }

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
      accelMagnitude: 4.95,
      gyroX: 180.5,
      gyroY: 220.0,
      gyroZ: 95.2,
      gyroActivity: 1.85,
      movementState: 'ACTIVE',
      imuStatus: 'VALID',
      overallDataQuality: 'GOOD',
      fallState: 'FALL_CONFIRMED',
      battery: _simBattery,
      isCharging: _simCharging,
      rssi: _simRssi,
    );

    _handleIncomingPacket(fallPacket);
  }

  @override
  void dispose() {
    _simulationTimer?.cancel();
    _scanSubscription?.cancel();
    _notifySubscription?.cancel();
    _adapterStateSubscription?.cancel();
    super.dispose();
  }
}

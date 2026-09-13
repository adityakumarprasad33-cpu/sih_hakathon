import 'dart:async';
import 'dart:convert';
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
  List<ScanResult> _scanResults = [];
  BluetoothDevice? _connectedDevice;
  BluetoothCharacteristic? _commandCharacteristic;
  String? _lastPairedDeviceId;

  TelemetryPacket? _latestPacket;
  RiskAssessmentResult? _latestRiskAssessment;
  final List<TelemetryPacket> _telemetryHistory = [];

  StreamSubscription? _scanSubscription;
  StreamSubscription? _telemetrySubscription;
  StreamSubscription? _batterySubscription;
  StreamSubscription? _adapterStateSubscription;
  Timer? _rssiPollTimer;
  BluetoothAdapterState _adapterState = BluetoothAdapterState.unknown;

  String _currentUid = 'usr_default';
  int _currentRssi = -70;
  int _currentBattery = 85;

  // Getters
  ConnectionStatus get status => _status;
  bool get isConnected => _status == ConnectionStatus.live;
  bool get isScanning => _isScanning;
  List<ScanResult> get scanResults => _scanResults;
  BluetoothDevice? get connectedDevice => _connectedDevice;
  String? get lastPairedDeviceId => _lastPairedDeviceId;
  TelemetryPacket? get latestPacket => _latestPacket;
  RiskAssessmentResult? get latestRiskAssessment => _latestRiskAssessment;
  List<TelemetryPacket> get telemetryHistory => List.unmodifiable(_telemetryHistory);
  BluetoothAdapterState get adapterState => _adapterState;
  bool get isBluetoothOn => _adapterState == BluetoothAdapterState.on;
  int get currentRssi => _currentRssi;

  BleGatewayService(this._syncService) {
    _initBluetoothLifecycle();
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
            debugPrint('[BLE Gateway] Adapter is ON. Auto-connecting to real peripheral...');
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
      debugPrint('[BLE Gateway] Bluetooth lifecycle init exception: $e');
    }
  }

  /// Auto-reconnect to real physical wearable if paired previously
  Future<void> autoReconnectIfConfigured() async {
    if (_connectedDevice != null || _isScanning) return;

    final prefs = await SharedPreferences.getInstance();
    _lastPairedDeviceId = prefs.getString('last_paired_device_id');

    if (_lastPairedDeviceId != null && _lastPairedDeviceId!.isNotEmpty) {
      debugPrint('[BLE Gateway] Reconnecting to saved hardware ID: $_lastPairedDeviceId');
      try {
        final device = BluetoothDevice.fromId(_lastPairedDeviceId!);
        final success = await connectToDevice(device);
        if (!success) {
          startScan();
        }
      } catch (e) {
        debugPrint('[BLE Gateway] Direct hardware reconnect failed: $e');
        startScan();
      }
    }
  }

  /// Start BLE scan for real Bluetooth health peripherals and ESP32 bands
  Future<void> startScan() async {
    if (_isScanning) return;
    _scanResults.clear();
    _isScanning = true;
    notifyListeners();

    try {
      if (await FlutterBluePlus.isSupported == false) {
        debugPrint('[BLE Gateway] BLE hardware unsupported on this host');
        _isScanning = false;
        notifyListeners();
        return;
      }

      await FlutterBluePlus.startScan(
        timeout: const Duration(seconds: 10),
      );

      _scanSubscription = FlutterBluePlus.scanResults.listen((results) {
        _scanResults = results;
        notifyListeners();

        // Check if saved hardware device appeared in scan results
        if (_lastPairedDeviceId != null && _connectedDevice == null) {
          for (final res in results) {
            if (res.device.remoteId.str == _lastPairedDeviceId) {
              connectToDevice(res.device);
              break;
            }
          }
        }
      });

      await Future.delayed(const Duration(seconds: 10));
      await stopScan();
    } catch (e) {
      debugPrint('[BLE Gateway] BLE scan error: $e');
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

  /// Connect to real physical Bluetooth hardware peripheral
  Future<bool> connectToDevice(BluetoothDevice device) async {
    await stopScan();

    try {
      _status = ConnectionStatus.cached;
      notifyListeners();

      debugPrint('[BLE Gateway] Connecting to physical device: ${device.platformName} (${device.remoteId.str})');
      await device.connect(
        license: License.nonprofit,
        timeout: const Duration(seconds: 12),
      );
      _connectedDevice = device;
      _lastPairedDeviceId = device.remoteId.str;

      // Save paired hardware ID
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('last_paired_device_id', device.remoteId.str);

      // Discover real GATT Services & Characteristics
      final services = await device.discoverServices();
      for (final service in services) {
        final sUuid = service.uuid.toString().toUpperCase();

        // 1. Samadhan ESP32 Custom UART Service
        if (sUuid.contains("6E400001") || sUuid == BleConstants.serviceUuid) {
          for (final c in service.characteristics) {
            final cUuid = c.uuid.toString().toUpperCase();
            if (cUuid.contains("6E400002") || c.properties.notify) {
              await c.setNotifyValue(true);
              _telemetrySubscription = c.onValueReceived.listen(_onCustomPacketReceived);
            } else if (cUuid.contains("6E400003") || c.properties.write) {
              _commandCharacteristic = c;
            }
          }
        }

        // 2. Standard Bluetooth SIG Heart Rate Service (0x180D)
        if (sUuid.contains("180D")) {
          for (final c in service.characteristics) {
            if (c.uuid.toString().toUpperCase().contains("2A37") || c.properties.notify) {
              await c.setNotifyValue(true);
              _telemetrySubscription = c.onValueReceived.listen(_onStandardHeartRateReceived);
            }
          }
        }

        // 3. Standard Bluetooth SIG Battery Service (0x180F)
        if (sUuid.contains("180F")) {
          for (final c in service.characteristics) {
            if (c.uuid.toString().toUpperCase().contains("2A19")) {
              if (c.properties.read) {
                final val = await c.read();
                if (val.isNotEmpty) _currentBattery = val[0];
              }
              if (c.properties.notify) {
                await c.setNotifyValue(true);
                _batterySubscription = c.onValueReceived.listen((bytes) {
                  if (bytes.isNotEmpty) {
                    _currentBattery = bytes[0];
                    notifyListeners();
                  }
                });
              }
            }
          }
        }
      }

      _status = ConnectionStatus.live;
      _startRssiPolling();
      notifyListeners();
      return true;
    } catch (e) {
      debugPrint('[BLE Gateway] Physical hardware connection failed: $e');
      _status = ConnectionStatus.disconnected;
      _connectedDevice = null;
      notifyListeners();
      return false;
    }
  }

  void disconnectDevice() {
    _rssiPollTimer?.cancel();
    _telemetrySubscription?.cancel();
    _batterySubscription?.cancel();
    _connectedDevice?.disconnect();
    _connectedDevice = null;
    _status = ConnectionStatus.disconnected;
    notifyListeners();
  }

  /// Periodically read real RSSI from the connected hardware device
  void _startRssiPolling() {
    _rssiPollTimer?.cancel();
    _rssiPollTimer = Timer.periodic(const Duration(seconds: 2), (timer) async {
      if (_connectedDevice != null && _status == ConnectionStatus.live) {
        try {
          final rssi = await _connectedDevice!.readRssi();
          _currentRssi = rssi;
          if (_latestPacket != null) {
            _latestPacket = _latestPacket!.copyWith(rssi: rssi);
            _guardianService?.processTelemetry(_latestPacket!);
          }
          notifyListeners();
        } catch (_) {}
      }
    });
  }

  /// Send real command packet to physical band buzzer
  Future<bool> triggerFindDeviceBuzzer() async {
    if (_commandCharacteristic != null) {
      try {
        // Production command: 0xAA (Header), 0x01 (Buzzer Command), 0x55 (Checksum)
        await _commandCharacteristic!.write([0xAA, 0x01, 0x55]);
        return true;
      } catch (e) {
        debugPrint('[BLE Gateway] Command write to hardware characteristic failed: $e');
      }
    }
    return false;
  }

  /// Parse real incoming Samadhan Custom ESP32 JSON / binary telemetry
  void _onCustomPacketReceived(List<int> rawBytes) {
    try {
      final jsonStr = utf8.decode(rawBytes);
      final data = jsonDecode(jsonStr) as Map<String, dynamic>;
      final packet = TelemetryPacket.fromJson(data);
      _handleIncomingPacket(packet);
    } catch (_) {
      // Fallback: binary parsing
      if (rawBytes.length >= 4) {
        final hr = rawBytes[0];
        final spo2 = rawBytes[1].toDouble();
        final temp = rawBytes[2].toDouble();
        final packet = TelemetryPacket(
          deviceId: _connectedDevice?.platformName ?? 'SAMADHAN-BAND',
          timestamp: DateTime.now(),
          heartRate: hr > 30 ? hr : null,
          spo2: spo2 > 70 ? spo2 : null,
          temperature: temp > 0 ? temp : 26.5,
          battery: _currentBattery,
          rssi: _currentRssi,
        );
        _handleIncomingPacket(packet);
      }
    }
  }

  /// Parse standard Bluetooth SIG Heart Rate Measurement (0x2A37)
  void _onStandardHeartRateReceived(List<int> bytes) {
    if (bytes.isEmpty) return;

    final flags = bytes[0];
    final is16Bit = (flags & 0x01) != 0;
    final sensorContactSupported = (flags & 0x04) != 0;
    final sensorContactDetected = (flags & 0x02) != 0;

    int hr = 0;
    if (is16Bit && bytes.length >= 3) {
      hr = bytes[1] | (bytes[2] << 8);
    } else if (!is16Bit && bytes.length >= 2) {
      hr = bytes[1];
    }

    // Real off-wrist detection using Bluetooth SIG sensor contact flag
    final hrStatus = (sensorContactSupported && !sensorContactDetected)
        ? 'INVALID'
        : (hr > 30 && hr < 220 ? 'VALID' : 'LOW_QUALITY');

    final packet = TelemetryPacket(
      deviceId: _connectedDevice?.platformName.isNotEmpty == true
          ? _connectedDevice!.platformName
          : 'SAMADHAN-BAND',
      timestamp: DateTime.now(),
      heartRate: hrStatus == 'VALID' ? hr : null,
      hrStatus: hrStatus,
      ppgQuality: hrStatus == 'VALID' ? 'GOOD' : 'POOR',
      battery: _currentBattery,
      rssi: _currentRssi,
    );

    _handleIncomingPacket(packet);
  }

  void _handleIncomingPacket(TelemetryPacket packet) {
    // 1. Run local on-device TinyML Risk Engine
    _latestRiskAssessment = _riskEngine.evaluateTelemetry(packet);

    // 2. Attach updated risk score, real RSSI, and real battery
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
      battery: packet.battery != 85 ? packet.battery : _currentBattery,
      isCharging: packet.isCharging,
      rssi: _currentRssi,
      isSynced: packet.isSynced,
    );

    _latestPacket = evaluatedPacket;
    _telemetryHistory.add(evaluatedPacket);
    if (_telemetryHistory.length > 50) {
      _telemetryHistory.removeAt(0);
    }

    _status = ConnectionStatus.live;
    notifyListeners();

    // 3. Process Guardian state
    _guardianService?.processTelemetry(evaluatedPacket);

    // 4. Relay to Firebase RTDB Cloud Sync Gateway
    _syncService.syncPacket(
      uid: _currentUid,
      packet: evaluatedPacket,
      latitude: _guardianService?.currentLatitude,
      longitude: _guardianService?.currentLongitude,
    );
  }

  @override
  void dispose() {
    _rssiPollTimer?.cancel();
    _scanSubscription?.cancel();
    _telemetrySubscription?.cancel();
    _batterySubscription?.cancel();
    _adapterStateSubscription?.cancel();
    super.dispose();
  }
}

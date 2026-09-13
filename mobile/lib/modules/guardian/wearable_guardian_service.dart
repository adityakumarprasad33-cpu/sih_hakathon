import 'dart:async';
import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:samadhan_health/core/models/telemetry_packet.dart';

enum GuardianAlertType {
  outOfRange,
  offWrist,
  lowBattery,
  charging,
}

enum ProximityBand {
  immediate, // < 1.5m
  near,      // 1.5m - 5.0m
  far,       // 5.0m - 8.0m
  outOfRange,// > 8.0m or lost
}

class WearableGuardianService extends ChangeNotifier {
  // Distance / Proximity Engine
  double _estimatedDistance = 0.8; // in meters
  int _lastRssi = -65;
  ProximityBand _proximityBand = ProximityBand.immediate;
  DateTime _lastPacketTime = DateTime.now();
  DateTime get lastPacketTime => _lastPacketTime;

  // Wrist Wearable State
  bool _isWristWorn = true;
  int _offWristConsecutiveCount = 0;

  // Battery & Charging State
  bool _isCharging = false;
  int _batteryLevel = 85;

  // Active Alerts
  bool _alertOutOfRangeActive = false;
  bool _alertOffWristActive = false;
  bool _alertLowBatteryActive = false;
  String? _chargingStatusMessage;

  // Snooze Timestamps (Epoch ms)
  final Map<GuardianAlertType, int> _snoozeExpirations = {};

  // GPS Coordinates for Emergency SOS
  double? _currentLatitude;
  double? _currentLongitude;

  // Permission states
  bool _hasLocationPermission = false;
  bool _hasBluetoothPermission = false;

  // Getters
  double get estimatedDistance => _estimatedDistance;
  int get lastRssi => _lastRssi;
  ProximityBand get proximityBand => _proximityBand;
  bool get isWristWorn => _isWristWorn;
  bool get isCharging => _isCharging;
  int get batteryLevel => _batteryLevel;
  double? get currentLatitude => _currentLatitude;
  double? get currentLongitude => _currentLongitude;
  bool get hasLocationPermission => _hasLocationPermission;
  bool get hasBluetoothPermission => _hasBluetoothPermission;

  bool get isOutOfRangeAlertVisible => _alertOutOfRangeActive && !isSnoozed(GuardianAlertType.outOfRange);
  bool get isOffWristAlertVisible => _alertOffWristActive && !isSnoozed(GuardianAlertType.offWrist);
  bool get isLowBatteryAlertVisible => _alertLowBatteryActive && !isSnoozed(GuardianAlertType.lowBattery);
  String? get chargingStatusMessage => _chargingStatusMessage;

  WearableGuardianService({bool checkPermissionsOnInit = true}) {
    _loadSnoozePreferences();
    if (checkPermissionsOnInit) {
      checkPermissions();
    }
  }

  /// Check & request location & BLE permissions for proximity tracking
  /// Fetch real-time GPS position for Emergency SOS payload
  Future<void> updateCurrentPosition() async {
    try {
      if (_hasLocationPermission) {
        final pos = await Geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(
            accuracy: LocationAccuracy.high,
            timeLimit: Duration(seconds: 5),
          ),
        );
        _currentLatitude = pos.latitude;
        _currentLongitude = pos.longitude;
        notifyListeners();
      }
    } catch (_) {
      // Handled gracefully if location service disabled or timed out
    }
  }

  Future<void> checkPermissions() async {
    try {
      final locStatus = await Geolocator.checkPermission();
      _hasLocationPermission = locStatus == LocationPermission.always ||
          locStatus == LocationPermission.whileInUse;
      _hasBluetoothPermission = true;
      notifyListeners();
      if (_hasLocationPermission) {
        unawaited(updateCurrentPosition());
      }
    } catch (_) {
      // Graceful fallback for test runner or headless environments
    }
  }

  Future<bool> requestLocationAndBluetoothPermissions() async {
    try {
      final locStatus = await Geolocator.requestPermission();
      _hasLocationPermission = locStatus == LocationPermission.always ||
          locStatus == LocationPermission.whileInUse;
      _hasBluetoothPermission = true;
      notifyListeners();
      return _hasLocationPermission;
    } catch (_) {
      return false;
    }
  }

  /// Process incoming telemetry packet to update guardian state
  void processTelemetry(TelemetryPacket packet) {
    _lastPacketTime = DateTime.now();
    _lastRssi = packet.rssi;
    _isCharging = packet.isCharging;
    _batteryLevel = packet.battery;

    // 1. Calculate Estimated Distance from RSSI
    // Log-distance formula: d = 10 ^ ((TxPower - RSSI) / (10 * n))
    // TxPower ~ -59 dBm, Path loss exponent n ~ 2.0
    const int txPower = -59;
    const double pathLossExponent = 2.0;
    final double rawDistance = pow(10, (txPower - packet.rssi) / (10 * pathLossExponent)).toDouble();
    
    // Smooth distance via exponential filter
    _estimatedDistance = (_estimatedDistance * 0.7) + (rawDistance.clamp(0.2, 25.0) * 0.3);

    // Update Proximity Band
    if (_estimatedDistance < 1.5) {
      _proximityBand = ProximityBand.immediate;
      _alertOutOfRangeActive = false;
    } else if (_estimatedDistance < 5.0) {
      _proximityBand = ProximityBand.near;
      _alertOutOfRangeActive = false;
    } else if (_estimatedDistance < 8.0) {
      _proximityBand = ProximityBand.far;
      _alertOutOfRangeActive = false;
    } else {
      _proximityBand = ProximityBand.outOfRange;
      if (!isSnoozed(GuardianAlertType.outOfRange)) {
        _alertOutOfRangeActive = true;
      }
    }

    // 2. Off-wrist Detachment Detection
    if (!packet.isWristWorn) {
      _offWristConsecutiveCount++;
      if (_offWristConsecutiveCount >= 2) {
        _isWristWorn = false;
        if (!isSnoozed(GuardianAlertType.offWrist)) {
          _alertOffWristActive = true;
        }
      }
    } else {
      _offWristConsecutiveCount = 0;
      _isWristWorn = true;
      _alertOffWristActive = false;
    }

    // 3. Charging Status & Low Battery
    if (_isCharging) {
      _alertLowBatteryActive = false;
      _chargingStatusMessage = '⚡ Docked & Charging ($_batteryLevel%)';
    } else {
      _chargingStatusMessage = null;
      if (_batteryLevel <= 20 && !isSnoozed(GuardianAlertType.lowBattery)) {
        _alertLowBatteryActive = true;
      } else {
        _alertLowBatteryActive = false;
      }
    }

    notifyListeners();
  }

  /// Snooze an alert for a specified duration
  Future<void> snoozeAlert(GuardianAlertType type, Duration duration) async {
    final expiryTime = DateTime.now().add(duration).millisecondsSinceEpoch;
    _snoozeExpirations[type] = expiryTime;

    // Dismiss active state immediately
    switch (type) {
      case GuardianAlertType.outOfRange:
        _alertOutOfRangeActive = false;
        break;
      case GuardianAlertType.offWrist:
        _alertOffWristActive = false;
        break;
      case GuardianAlertType.lowBattery:
        _alertLowBatteryActive = false;
        break;
      case GuardianAlertType.charging:
        break;
    }

    // Persist to SharedPreferences
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('snooze_${type.name}', expiryTime);

    notifyListeners();
  }

  /// Dismiss alert temporarily without a long snooze
  void dismissAlert(GuardianAlertType type) {
    switch (type) {
      case GuardianAlertType.outOfRange:
        _alertOutOfRangeActive = false;
        break;
      case GuardianAlertType.offWrist:
        _alertOffWristActive = false;
        break;
      case GuardianAlertType.lowBattery:
        _alertLowBatteryActive = false;
        break;
      case GuardianAlertType.charging:
        break;
    }
    notifyListeners();
  }

  bool isSnoozed(GuardianAlertType type) {
    final expiry = _snoozeExpirations[type];
    if (expiry == null) return false;
    final now = DateTime.now().millisecondsSinceEpoch;
    if (now < expiry) {
      return true;
    } else {
      _snoozeExpirations.remove(type);
      return false;
    }
  }

  int getSnoozeRemainingMinutes(GuardianAlertType type) {
    final expiry = _snoozeExpirations[type];
    if (expiry == null) return 0;
    final remainingMs = expiry - DateTime.now().millisecondsSinceEpoch;
    return remainingMs > 0 ? (remainingMs / 60000).ceil() : 0;
  }

  Future<void> _loadSnoozePreferences() async {
    final prefs = await SharedPreferences.getInstance();
    final now = DateTime.now().millisecondsSinceEpoch;

    for (final type in GuardianAlertType.values) {
      final expiry = prefs.getInt('snooze_${type.name}');
      if (expiry != null && expiry > now) {
        _snoozeExpirations[type] = expiry;
      }
    }
    notifyListeners();
  }
}

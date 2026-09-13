import 'dart:math';
import 'package:samadhan_health/core/constants/app_constants.dart';

class TelemetryPacket {
  final String deviceId;
  final DateTime timestamp;

  // Optical Sensor (MAX30102)
  final int? heartRate;
  final double? spo2;
  final String hrStatus; // 'VALID', 'LOW_QUALITY', 'INVALID', 'ERROR'
  final String spo2Status; // 'VALID', 'LOW_QUALITY', 'INVALID', 'ERROR'
  final String ppgQuality; // 'GOOD', 'FAIR', 'POOR', 'ERROR'

  // Environmental Sensor (DHT22)
  final double? temperature; // Ambient temperature in °C
  final double? humidity;
  final String dhtStatus; // 'VALID', 'INVALID', 'STALE'

  // 6-Axis Motion Sensor (MPU6050)
  final double? accelX;
  final double? accelY;
  final double? accelZ;
  final double? accelMagnitude; // sqrt(x^2 + y^2 + z^2)
  final double? gyroX;
  final double? gyroY;
  final double? gyroZ;
  final double? gyroActivity;
  final String movementState; // 'RESTING', 'LOW_ACTIVITY', 'ACTIVE', 'UNKNOWN'
  final String imuStatus; // 'VALID', 'ERROR'

  // Quality, Risk & Device State
  final String overallDataQuality; // 'GOOD', 'FAIR', 'POOR', 'ERROR'
  final double riskScore; // 0 - 100
  final String fallState; // 'IDLE', 'IMPACT_CANDIDATE', 'POST_IMPACT_MONITORING', 'FALL_SUSPECTED', 'FALL_CONFIRMED', 'CANCELLED', 'COOLDOWN'
  final int battery;
  final bool isCharging;
  final int rssi; // Received Signal Strength in dBm
  final bool isSynced;

  TelemetryPacket({
    required this.deviceId,
    required this.timestamp,
    this.heartRate,
    this.spo2,
    this.hrStatus = 'VALID',
    this.spo2Status = 'VALID',
    this.ppgQuality = 'GOOD',
    this.temperature,
    this.humidity,
    this.dhtStatus = 'VALID',
    this.accelX,
    this.accelY,
    this.accelZ,
    this.accelMagnitude,
    this.gyroX,
    this.gyroY,
    this.gyroZ,
    this.gyroActivity,
    this.movementState = 'RESTING',
    this.imuStatus = 'VALID',
    this.overallDataQuality = 'GOOD',
    this.riskScore = 12.0,
    this.fallState = 'IDLE',
    this.battery = 85,
    this.isCharging = false,
    this.rssi = -65,
    this.isSynced = false,
  });

  bool get fallDetected => fallState == 'FALL_CONFIRMED' || fallState == 'FALL_SUSPECTED';

  /// Off-wrist heuristic: if PPG sensor reports INVALID or POOR while resting
  bool get isWristWorn => hrStatus != 'INVALID' && ppgQuality != 'POOR' && heartRate != null;

  RiskLevel get riskLevel {
    if (fallDetected || riskScore >= 75 || (heartRate != null && heartRate! > 130) || (spo2 != null && spo2! < 90)) {
      return RiskLevel.critical;
    } else if (riskScore >= 40 || (heartRate != null && heartRate! > 100) || (spo2 != null && spo2! < 94)) {
      return RiskLevel.elevated;
    }
    return RiskLevel.normal;
  }

  Map<String, dynamic> toJson() {
    return {
      'deviceId': deviceId,
      'timestamp': timestamp.millisecondsSinceEpoch,
      'heartRate': heartRate,
      'spo2': spo2,
      'hrStatus': hrStatus,
      'spo2Status': spo2Status,
      'ppgQuality': ppgQuality,
      'temperature': temperature,
      'humidity': humidity,
      'dhtStatus': dhtStatus,
      'accelX': accelX,
      'accelY': accelY,
      'accelZ': accelZ,
      'accelMagnitude': accelMagnitude,
      'gyroX': gyroX,
      'gyroY': gyroY,
      'gyroZ': gyroZ,
      'gyroActivity': gyroActivity,
      'movementState': movementState,
      'imuStatus': imuStatus,
      'overallDataQuality': overallDataQuality,
      'riskScore': riskScore,
      'fallState': fallState,
      'battery': battery,
      'isCharging': isCharging,
      'rssi': rssi,
      'isSynced': isSynced,
    };
  }

  factory TelemetryPacket.fromJson(Map<String, dynamic> json) {
    DateTime ts;
    if (json['timestamp'] is int) {
      ts = DateTime.fromMillisecondsSinceEpoch(json['timestamp'] as int);
    } else if (json['timestamp'] is String) {
      ts = DateTime.tryParse(json['timestamp'] as String) ?? DateTime.now();
    } else {
      ts = DateTime.now();
    }

    final ax = (json['accelX'] as num?)?.toDouble();
    final ay = (json['accelY'] as num?)?.toDouble();
    final az = (json['accelZ'] as num?)?.toDouble();
    final mag = (json['accelMagnitude'] as num?)?.toDouble() ??
        (ax != null && ay != null && az != null ? sqrt(ax * ax + ay * ay + az * az) : 1.0);

    return TelemetryPacket(
      deviceId: json['deviceId'] as String? ?? 'SAMADHAN-BAND-A7F39C',
      timestamp: ts,
      heartRate: (json['heartRate'] as num?)?.toInt(),
      spo2: (json['spo2'] as num?)?.toDouble(),
      hrStatus: json['hrStatus'] as String? ?? 'VALID',
      spo2Status: json['spo2Status'] as String? ?? 'VALID',
      ppgQuality: json['ppgQuality'] as String? ?? 'GOOD',
      temperature: (json['temperature'] as num?)?.toDouble() ?? 26.5,
      humidity: (json['humidity'] as num?)?.toDouble() ?? 55.0,
      dhtStatus: json['dhtStatus'] as String? ?? 'VALID',
      accelX: ax ?? 0.02,
      accelY: ay ?? 0.05,
      accelZ: az ?? 0.98,
      accelMagnitude: mag,
      gyroX: (json['gyroX'] as num?)?.toDouble() ?? 0.0,
      gyroY: (json['gyroY'] as num?)?.toDouble() ?? 0.0,
      gyroZ: (json['gyroZ'] as num?)?.toDouble() ?? 0.0,
      gyroActivity: (json['gyroActivity'] as num?)?.toDouble() ?? 0.0,
      movementState: json['movementState'] as String? ?? 'RESTING',
      imuStatus: json['imuStatus'] as String? ?? 'VALID',
      overallDataQuality: json['overallDataQuality'] as String? ?? 'GOOD',
      riskScore: (json['riskScore'] as num?)?.toDouble() ?? 12.0,
      fallState: json['fallState'] as String? ?? 'IDLE',
      battery: (json['battery'] as num?)?.toInt() ?? 85,
      isCharging: json['isCharging'] as bool? ?? false,
      rssi: (json['rssi'] as num?)?.toInt() ?? -65,
      isSynced: json['isSynced'] as bool? ?? false,
    );
  }

  TelemetryPacket copyWith({
    bool? isSynced,
    String? fallState,
    bool? isCharging,
    int? battery,
    int? rssi,
    double? riskScore,
  }) {
    return TelemetryPacket(
      deviceId: deviceId,
      timestamp: timestamp,
      heartRate: heartRate,
      spo2: spo2,
      hrStatus: hrStatus,
      spo2Status: spo2Status,
      ppgQuality: ppgQuality,
      temperature: temperature,
      humidity: humidity,
      dhtStatus: dhtStatus,
      accelX: accelX,
      accelY: accelY,
      accelZ: accelZ,
      accelMagnitude: accelMagnitude,
      gyroX: gyroX,
      gyroY: gyroY,
      gyroZ: gyroZ,
      gyroActivity: gyroActivity,
      movementState: movementState,
      imuStatus: imuStatus,
      overallDataQuality: overallDataQuality,
      riskScore: riskScore ?? this.riskScore,
      fallState: fallState ?? this.fallState,
      battery: battery ?? this.battery,
      isCharging: isCharging ?? this.isCharging,
      rssi: rssi ?? this.rssi,
      isSynced: isSynced ?? this.isSynced,
    );
  }
}

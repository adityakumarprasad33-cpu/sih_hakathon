import 'package:flutter_test/flutter_test.dart';
import 'package:samadhan_health/core/constants/app_constants.dart';
import 'package:samadhan_health/core/models/telemetry_packet.dart';
import 'package:samadhan_health/modules/storage/offline_buffer_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  group('Mobile Gateway Contract Telemetry Tests', () {
    test('TelemetryPacket correctly parses contract schema fields', () {
      final json = {
        'deviceId': 'SAMADHAN-BAND-A7F39C',
        'timestamp': 1725890000000,
        'heartRate': 78,
        'spo2': 98.5,
        'hrStatus': 'VALID',
        'spo2Status': 'VALID',
        'ppgQuality': 'GOOD',
        'temperature': 26.5,
        'humidity': 55.0,
        'dhtStatus': 'VALID',
        'accelX': 0.05,
        'accelY': 0.02,
        'accelZ': 0.99,
        'accelMagnitude': 0.991,
        'gyroX': 0.1,
        'gyroY': -0.2,
        'gyroZ': 0.05,
        'gyroActivity': 0.02,
        'movementState': 'RESTING',
        'imuStatus': 'VALID',
        'overallDataQuality': 'GOOD',
        'riskScore': 15.0,
        'fallState': 'IDLE',
        'battery': 90,
      };

      final packet = TelemetryPacket.fromJson(json);

      expect(packet.deviceId, 'SAMADHAN-BAND-A7F39C');
      expect(packet.heartRate, 78);
      expect(packet.spo2, 98.5);
      expect(packet.ppgQuality, 'GOOD');
      expect(packet.dhtStatus, 'VALID');
      expect(packet.movementState, 'RESTING');
      expect(packet.fallState, 'IDLE');
      expect(packet.fallDetected, false);
      expect(packet.riskLevel, RiskLevel.normal);
    });

    test('High-impact fall triggers FALL_CONFIRMED and critical risk level', () {
      final packet = TelemetryPacket(
        deviceId: 'SAMADHAN-BAND-A7F39C',
        timestamp: DateTime.now(),
        heartRate: 135,
        spo2: 91.0,
        accelMagnitude: 4.85,
        movementState: 'ACTIVE',
        fallState: 'FALL_CONFIRMED',
        riskScore: 92.0,
      );

      expect(packet.fallDetected, true);
      expect(packet.riskLevel, RiskLevel.critical);
    });

    test('Offline ring buffer stores packets and preserves un-synced items', () async {
      SharedPreferences.setMockInitialValues({});
      final buffer = OfflineBufferService();

      final packet1 = TelemetryPacket(
        deviceId: 'SAMADHAN-BAND-A7F39C',
        timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
        heartRate: 72,
        isSynced: false,
      );

      final packet2 = TelemetryPacket(
        deviceId: 'SAMADHAN-BAND-A7F39C',
        timestamp: DateTime.now(),
        heartRate: 76,
        isSynced: false,
      );

      await buffer.bufferPacket(packet1);
      await buffer.bufferPacket(packet2);

      final unsynced = await buffer.getUnsyncedPackets();
      expect(unsynced.length, 2);
      expect(unsynced[0].heartRate, 72);
      expect(unsynced[1].heartRate, 76);

      await buffer.markPacketsSynced([packet1.timestamp]);
      final remaining = await buffer.getUnsyncedPackets();
      expect(remaining.length, 1);
      expect(remaining[0].heartRate, 76);
    });
  });
}
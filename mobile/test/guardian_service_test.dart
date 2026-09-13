import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:samadhan_health/core/models/telemetry_packet.dart';
import 'package:samadhan_health/modules/guardian/wearable_guardian_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  group('WearableGuardianService Unit Tests', () {
    test('Calculates distance from RSSI and detects immediate proximity', () {
      final guardian = WearableGuardianService(checkPermissionsOnInit: false);

      final closePacket = TelemetryPacket(
        deviceId: 'SAMADHAN-BAND-TEST',
        timestamp: DateTime.now(),
        heartRate: 72,
        spo2: 98.0,
        hrStatus: 'VALID',
        ppgQuality: 'GOOD',
        rssi: -58, // Very strong RSSI (~0.9m)
        battery: 80,
      );

      guardian.processTelemetry(closePacket);

      expect(guardian.estimatedDistance, lessThan(2.0));
      expect(guardian.isOutOfRangeAlertVisible, isFalse);
    });

    test('Triggers Out of Range alert when distance exceeds threshold', () {
      final guardian = WearableGuardianService(checkPermissionsOnInit: false);

      final farPacket = TelemetryPacket(
        deviceId: 'SAMADHAN-BAND-TEST',
        timestamp: DateTime.now(),
        heartRate: 72,
        spo2: 98.0,
        hrStatus: 'VALID',
        ppgQuality: 'GOOD',
        rssi: -95, // Weak signal -> long distance
        battery: 80,
      );

      // Process multiple packets to allow exponential smoothing filter to climb
      for (int i = 0; i < 5; i++) {
        guardian.processTelemetry(farPacket);
      }

      expect(guardian.estimatedDistance, greaterThan(7.0));
      expect(guardian.isOutOfRangeAlertVisible, isTrue);
    });

    test('Triggers Off-Wrist alert when PPG sensor loses skin contact', () {
      final guardian = WearableGuardianService(checkPermissionsOnInit: false);

      final offWristPacket = TelemetryPacket(
        deviceId: 'SAMADHAN-BAND-TEST',
        timestamp: DateTime.now(),
        heartRate: null,
        spo2: null,
        hrStatus: 'INVALID',
        ppgQuality: 'POOR',
        rssi: -60,
        battery: 80,
      );

      expect(guardian.isWristWorn, isTrue);

      // Process 3 consecutive packets
      guardian.processTelemetry(offWristPacket);
      guardian.processTelemetry(offWristPacket);
      guardian.processTelemetry(offWristPacket);

      expect(guardian.isWristWorn, isFalse);
      expect(guardian.isOffWristAlertVisible, isTrue);
    });

    test('Detects charging state and low battery alerts', () {
      final guardian = WearableGuardianService(checkPermissionsOnInit: false);

      // 1. Low battery when discharging
      final lowBatteryPacket = TelemetryPacket(
        deviceId: 'SAMADHAN-BAND-TEST',
        timestamp: DateTime.now(),
        heartRate: 72,
        spo2: 98.0,
        battery: 15,
        isCharging: false,
      );

      guardian.processTelemetry(lowBatteryPacket);
      expect(guardian.isLowBatteryAlertVisible, isTrue);
      expect(guardian.isCharging, isFalse);

      // 2. Docked to charger
      final chargingPacket = TelemetryPacket(
        deviceId: 'SAMADHAN-BAND-TEST',
        timestamp: DateTime.now(),
        heartRate: 72,
        spo2: 98.0,
        battery: 16,
        isCharging: true,
      );

      guardian.processTelemetry(chargingPacket);
      expect(guardian.isCharging, isTrue);
      expect(guardian.isLowBatteryAlertVisible, isFalse);
      expect(guardian.chargingStatusMessage, contains('Charging'));
    });

    test('Snooze silences active alerts', () async {
      final guardian = WearableGuardianService(checkPermissionsOnInit: false);

      final farPacket = TelemetryPacket(
        deviceId: 'SAMADHAN-BAND-TEST',
        timestamp: DateTime.now(),
        rssi: -95,
      );

      for (int i = 0; i < 5; i++) {
        guardian.processTelemetry(farPacket);
      }
      expect(guardian.isOutOfRangeAlertVisible, isTrue);

      // Snooze alert for 10 minutes
      await guardian.snoozeAlert(GuardianAlertType.outOfRange, const Duration(minutes: 10));

      expect(guardian.isOutOfRangeAlertVisible, isFalse);
      expect(guardian.isSnoozed(GuardianAlertType.outOfRange), isTrue);
    });
  });
}

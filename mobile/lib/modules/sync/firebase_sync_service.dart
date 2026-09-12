import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:samadhan_health/core/constants/app_constants.dart';
import 'package:samadhan_health/core/models/telemetry_packet.dart';
import 'package:samadhan_health/modules/storage/offline_buffer_service.dart';

class FirebaseSyncService extends ChangeNotifier {
  final OfflineBufferService _bufferService = OfflineBufferService();
  final String _rtdbUrl = FirebaseConstants.defaultRtdbUrl;

  bool _isSyncing = false;
  DateTime? _lastSyncedAt;
  int _unsyncedCount = 0;
  String? _lastError;
  int _historySampleCounter = 0;

  bool get isSyncing => _isSyncing;
  DateTime? get lastSyncedAt => _lastSyncedAt;
  int get unsyncedCount => _unsyncedCount;
  String? get lastError => _lastError;

  FirebaseSyncService() {
    _refreshUnsyncedCount();
  }

  Future<void> _refreshUnsyncedCount() async {
    _unsyncedCount = await _bufferService.getUnsyncedCount();
    notifyListeners();
  }

  /// Synchronize according to MOBILE_GATEWAY_CONTRACT Section 4 & 5
  Future<bool> syncPacket({
    required String uid,
    required TelemetryPacket packet,
  }) async {
    try {
      final timestampMs = packet.timestamp.millisecondsSinceEpoch;
      final payload = packet.toJson();

      // 1. Live stream update to /telemetry/{uid}/live.json
      final liveUrl = Uri.parse('$_rtdbUrl/telemetry/$uid/live.json');
      final res = await http.put(
        liveUrl,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 4));

      if (res.statusCode >= 200 && res.statusCode < 300) {
        // 2. Periodic history downsample to /telemetry/{uid}/history/{timestampMs}.json (every 5 packets)
        _historySampleCounter++;
        if (_historySampleCounter >= 5) {
          _historySampleCounter = 0;
          final historyUrl = Uri.parse('$_rtdbUrl/telemetry/$uid/history/$timestampMs.json');
          await http.put(
            historyUrl,
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode(payload),
          ).timeout(const Duration(seconds: 4));
        }

        // 3. Update /devices/{deviceId}.json (Contract Section 3)
        final deviceUrl = Uri.parse('$_rtdbUrl/devices/${packet.deviceId}.json');
        await http.patch(
          deviceUrl,
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'ownerUid': uid,
            'model': 'Samadhan Health Wearable (ESP32-S3)',
            'firmwareVersion': 'v1.0.0-esp32s3',
            'status': 'PAIRED',
            'lastSeen': timestampMs,
            'battery': packet.battery,
            'sensors': {
              'max30102': packet.hrStatus == 'VALID' ? 'ACTIVE' : 'DEGRADED',
              'mpu6050': packet.imuStatus == 'VALID' ? 'ACTIVE' : 'ERROR',
              'dht22': packet.dhtStatus == 'VALID' ? 'ACTIVE' : 'STALE',
            },
          }),
        ).timeout(const Duration(seconds: 4));

        // 4. Critical Alert Dispatch (Fall or severe vitals)
        if (packet.fallDetected || packet.riskLevel == RiskLevel.critical) {
          await triggerAlert(
            uid: uid,
            deviceId: packet.deviceId,
            type: packet.fallDetected ? 'FALL_CONFIRMED' : 'CRITICAL_VITALS',
            message: packet.fallDetected
                ? 'High-impact fall detected by wearable MPU6050 IMU accelerometer (Acc: ${packet.accelMagnitude?.toStringAsFixed(2)}g)'
                : 'Abnormal vitals: HR ${packet.heartRate ?? "--"} BPM, SpO2 ${packet.spo2 ?? "--"}%',
          );
        }

        _lastSyncedAt = DateTime.now();
        _lastError = null;
        await _refreshUnsyncedCount();
        notifyListeners();
        return true;
      } else {
        throw Exception('Server returned ${res.statusCode}');
      }
    } catch (e) {
      _lastError = e.toString();
      // Store in offline buffer on failure
      await _bufferService.bufferPacket(packet.copyWith(isSynced: false));
      await _refreshUnsyncedCount();
      notifyListeners();
      return false;
    }
  }

  /// Flushes all offline buffered packets to /telemetry/{uid}/history/{timestamp}
  Future<void> flushOfflineBuffer(String uid) async {
    if (_isSyncing) return;
    _isSyncing = true;
    notifyListeners();

    try {
      final unsynced = await _bufferService.getUnsyncedPackets();
      if (unsynced.isEmpty) {
        _isSyncing = false;
        notifyListeners();
        return;
      }

      final successfullySynced = <DateTime>[];

      for (final packet in unsynced) {
        final timestampMs = packet.timestamp.millisecondsSinceEpoch;
        final historyUrl = Uri.parse('$_rtdbUrl/telemetry/$uid/history/$timestampMs.json');

        final res = await http.put(
          historyUrl,
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(packet.toJson()),
        ).timeout(const Duration(seconds: 4));

        if (res.statusCode >= 200 && res.statusCode < 300) {
          successfullySynced.add(packet.timestamp);
        } else {
          break; // Stop if network fails again
        }
      }

      if (successfullySynced.isNotEmpty) {
        await _bufferService.markPacketsSynced(successfullySynced);
        _lastSyncedAt = DateTime.now();
      }
    } catch (e) {
      _lastError = e.toString();
    } finally {
      _isSyncing = false;
      await _refreshUnsyncedCount();
      notifyListeners();
    }
  }

  Future<bool> triggerAlert({
    required String uid,
    required String deviceId,
    required String type,
    required String message,
  }) async {
    try {
      final alertUrl = Uri.parse('$_rtdbUrl/alerts/$uid.json');
      final res = await http.post(
        alertUrl,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'type': type,
          'message': message,
          'deviceId': deviceId,
          'timestamp': DateTime.now().millisecondsSinceEpoch,
          'acknowledged': false,
        }),
      );
      return res.statusCode >= 200 && res.statusCode < 300;
    } catch (_) {
      return false;
    }
  }
}
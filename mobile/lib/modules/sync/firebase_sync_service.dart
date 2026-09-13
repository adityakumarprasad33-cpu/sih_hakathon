import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:samadhan_health/core/constants/app_constants.dart';
import 'package:samadhan_health/core/models/telemetry_packet.dart';
import 'package:samadhan_health/modules/storage/offline_buffer_service.dart';

enum CloudSyncStatus {
  online,
  offlineBuffer,
  syncing,
}

class FirebaseSyncService extends ChangeNotifier {
  final OfflineBufferService _bufferService = OfflineBufferService();
  String _rtdbUrl = FirebaseConstants.defaultRtdbUrl;
  String? _idToken;

  bool _isSyncing = false;
  DateTime? _lastSyncedAt;
  int _unsyncedCount = 0;
  String? _lastError;
  int _historySampleCounter = 0;
  CloudSyncStatus _cloudStatus = CloudSyncStatus.offlineBuffer;

  bool get isSyncing => _isSyncing;
  DateTime? get lastSyncedAt => _lastSyncedAt;
  int get unsyncedCount => _unsyncedCount;
  String? get lastError => _lastError;
  CloudSyncStatus get cloudStatus => _cloudStatus;
  String get rtdbUrl => _rtdbUrl;

  FirebaseSyncService() {
    _refreshUnsyncedCount();
  }

  void setIdToken(String? token) {
    _idToken = token;
  }

  void setCustomRtdbUrl(String url) {
    if (url.isNotEmpty) {
      _rtdbUrl = url;
      notifyListeners();
    }
  }

  String _buildUrl(String path) {
    if (_idToken != null && _idToken!.isNotEmpty) {
      return '$_rtdbUrl$path?auth=$_idToken';
    }
    return '$_rtdbUrl$path';
  }

  Future<void> _refreshUnsyncedCount() async {
    _unsyncedCount = await _bufferService.getUnsyncedCount();
    notifyListeners();
  }

  /// Real connectivity check to production Firebase RTDB
  Future<bool> testDatabaseConnection() async {
    try {
      final pingUrl = Uri.parse(_buildUrl('/.json?shallow=true'));
      final res = await http.get(pingUrl).timeout(const Duration(seconds: 4));
      final reachable = res.statusCode >= 200 && res.statusCode < 400;
      _cloudStatus = reachable ? CloudSyncStatus.online : CloudSyncStatus.offlineBuffer;
      notifyListeners();
      return reachable;
    } catch (_) {
      _cloudStatus = CloudSyncStatus.offlineBuffer;
      notifyListeners();
      return false;
    }
  }

  /// Synchronize real telemetry packet according to MOBILE_GATEWAY_CONTRACT Section 4 & 5
  Future<bool> syncPacket({
    required String uid,
    required TelemetryPacket packet,
    double? latitude,
    double? longitude,
  }) async {
    try {
      final timestampMs = packet.timestamp.millisecondsSinceEpoch;
      final payload = packet.toJson();

      if (latitude != null && longitude != null) {
        payload['latitude'] = latitude;
        payload['longitude'] = longitude;
      }

      // 1. Live stream update to /telemetry/{uid}/live.json
      final liveUrl = Uri.parse(_buildUrl('/telemetry/$uid/live.json'));
      final res = await http.put(
        liveUrl,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 5));

      if (res.statusCode >= 200 && res.statusCode < 300) {
        _cloudStatus = CloudSyncStatus.online;

        // 2. Periodic history downsample to /telemetry/{uid}/history/{timestampMs}.json
        _historySampleCounter++;
        if (_historySampleCounter >= 5) {
          _historySampleCounter = 0;
          final historyUrl = Uri.parse(_buildUrl('/telemetry/$uid/history/$timestampMs.json'));
          await http.put(
            historyUrl,
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode(payload),
          ).timeout(const Duration(seconds: 4));
        }

        // 3. Update /devices/{deviceId}.json (Contract Section 3)
        final deviceUrl = Uri.parse(_buildUrl('/devices/${packet.deviceId}.json'));
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
            'isCharging': packet.isCharging,
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
                ? 'High-impact fall detected by wearable MPU6050 accelerometer (Acc: ${packet.accelMagnitude?.toStringAsFixed(2)}g)'
                : 'Critical vitals detected: HR ${packet.heartRate ?? "--"} BPM, SpO2 ${packet.spo2 ?? "--"}%',
            latitude: latitude,
            longitude: longitude,
          );
        }

        _lastSyncedAt = DateTime.now();
        _lastError = null;
        await _refreshUnsyncedCount();
        notifyListeners();
        return true;
      } else {
        throw Exception('Firebase RTDB returned status ${res.statusCode}: ${res.body}');
      }
    } catch (e) {
      _lastError = e.toString();
      _cloudStatus = CloudSyncStatus.offlineBuffer;
      // Store in offline buffer on network drop or failure
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
    _cloudStatus = CloudSyncStatus.syncing;
    notifyListeners();

    try {
      final unsynced = await _bufferService.getUnsyncedPackets();
      if (unsynced.isEmpty) {
        _isSyncing = false;
        _cloudStatus = CloudSyncStatus.online;
        notifyListeners();
        return;
      }

      final successfullySynced = <DateTime>[];

      for (final packet in unsynced) {
        final timestampMs = packet.timestamp.millisecondsSinceEpoch;
        final historyUrl = Uri.parse(_buildUrl('/telemetry/$uid/history/$timestampMs.json'));

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
      _cloudStatus = CloudSyncStatus.online;
    } catch (e) {
      _lastError = e.toString();
      _cloudStatus = CloudSyncStatus.offlineBuffer;
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
    double? latitude,
    double? longitude,
  }) async {
    try {
      final alertUrl = Uri.parse(_buildUrl('/alerts/$uid.json'));
      final payload = {
        'patientUid': uid,
        'deviceId': deviceId,
        'type': type,
        'message': message,
        'createdAt': DateTime.now().millisecondsSinceEpoch,
        'acknowledged': false,
      };

      if (latitude != null && longitude != null) {
        payload['latitude'] = latitude;
        payload['longitude'] = longitude;
      }

      final res = await http.post(
        alertUrl,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      );
      return res.statusCode >= 200 && res.statusCode < 300;
    } catch (_) {
      return false;
    }
  }
}

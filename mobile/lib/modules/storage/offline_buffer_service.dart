import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:samadhan_health/core/models/telemetry_packet.dart';

class OfflineBufferService {
  static const String _bufferKey = 'samadhan_offline_telemetry_buffer';
  static const int _maxBufferSize = 200;

  Future<void> bufferPacket(TelemetryPacket packet) async {
    final prefs = await SharedPreferences.getInstance();
    final rawList = prefs.getStringList(_bufferKey) ?? [];

    rawList.add(jsonEncode(packet.toJson()));

    // Keep ring buffer within max buffer size (FIFO)
    while (rawList.length > _maxBufferSize) {
      rawList.removeAt(0);
    }

    await prefs.setStringList(_bufferKey, rawList);
  }

  Future<List<TelemetryPacket>> getUnsyncedPackets() async {
    final prefs = await SharedPreferences.getInstance();
    final rawList = prefs.getStringList(_bufferKey) ?? [];

    final packets = <TelemetryPacket>[];
    for (final item in rawList) {
      try {
        final data = jsonDecode(item) as Map<String, dynamic>;
        final packet = TelemetryPacket.fromJson(data);
        if (!packet.isSynced) {
          packets.add(packet);
        }
      } catch (_) {}
    }
    return packets;
  }

  Future<void> markPacketsSynced(List<DateTime> timestamps) async {
    final prefs = await SharedPreferences.getInstance();
    final rawList = prefs.getStringList(_bufferKey) ?? [];

    final updated = <String>[];
    final msTimestamps = timestamps.map((t) => t.millisecondsSinceEpoch).toSet();

    for (final item in rawList) {
      try {
        final data = jsonDecode(item) as Map<String, dynamic>;
        final packet = TelemetryPacket.fromJson(data);
        if (msTimestamps.contains(packet.timestamp.millisecondsSinceEpoch)) {
          updated.add(jsonEncode(packet.copyWith(isSynced: true).toJson()));
        } else {
          updated.add(item);
        }
      } catch (_) {
        updated.add(item);
      }
    }

    await prefs.setStringList(_bufferKey, updated);
  }

  Future<int> getUnsyncedCount() async {
    final unsynced = await getUnsyncedPackets();
    return unsynced.length;
  }
}
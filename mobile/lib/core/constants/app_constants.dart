class BleConstants {
  // Samadhan Wearable GATT Service UUIDs
  static const String serviceUuid = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";
  static const String telemetryCharacteristicUuid = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E";
  static const String commandCharacteristicUuid = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E";
  static const String devicePrefix = "SAMADHAN-BAND";
}

class FirebaseConstants {
  static const String defaultRtdbUrl = "https://healthtech-qualcomm-default-rtdb.asia-southeast1.firebasedatabase.app";
  static const String defaultProjectId = "healthtech-qualcomm";
}

enum ConnectionStatus {
  live,
  cached,
  stale,
  disconnected,
}

enum RiskLevel {
  normal,
  elevated,
  critical,
}
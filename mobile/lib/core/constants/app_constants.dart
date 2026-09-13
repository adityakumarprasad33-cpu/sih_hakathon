class LlmConstants {
  // Production Modal LLM Endpoint
  static const String defaultLlmUrl = "https://prasadaditya666--samadhan-health-api-api-endpoint.modal.run";
  static const int requestTimeoutSeconds = 12;
  static const String maintenanceMessage =
      "AI Doctor is currently under maintenance. Our clinical intelligence service is undergoing scheduled updates. Please check back shortly. Your continuous wearable vitals tracking and emergency fall protection remain fully active.";
}

class BleConstants {
  // Samadhan Wearable Custom ESP32 GATT Service UUIDs
  static const String serviceUuid = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";
  static const String telemetryCharacteristicUuid = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E";
  static const String commandCharacteristicUuid = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E";
  static const String devicePrefix = "SAMADHAN-BAND";

  // Standard Bluetooth SIG GATT Service UUIDs (Compatible with standard health sensors)
  static const String heartRateServiceUuid = "0000180D-0000-1000-8000-00805F9B34FB";
  static const String heartRateMeasurementUuid = "00002A37-0000-1000-8000-00805F9B34FB";
  static const String batteryServiceUuid = "0000180F-0000-1000-8000-00805F9B34FB";
  static const String batteryLevelUuid = "00002A19-0000-1000-8000-00805F9B34FB";
  static const String environmentalSensingServiceUuid = "0000181A-0000-1000-8000-00805F9B34FB";
}

class FirebaseConstants {
  static const String defaultRtdbUrl = "https://healthtech-qualcomm-default-rtdb.asia-southeast1.firebasedatabase.app";
  static const String defaultProjectId = "healthtech-qualcomm";
  static const String apiKey = "AIzaSyBqJBQOkkJc7PLSkpYEAK7u9sMPe1Q4HCQ";
  static const String authSignInUrl = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword";
  static const String authSignUpUrl = "https://identitytoolkit.googleapis.com/v1/accounts:signUp";
  static const String tokenRefreshUrl = "https://securetoken.googleapis.com/v1/token";
  static const String authUpdateProfileUrl = "https://identitytoolkit.googleapis.com/v1/accounts:update";
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

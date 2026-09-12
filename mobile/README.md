# Samadhan Health — Mobile Gateway Application

Unified cross-platform Flutter application (Android APK & iOS) serving as the primary hardware gateway for the **Samadhan Health Wearable (ESP32-S3)**.

---

## 📱 Supported Platforms & Build Targets
- **Android**: Target SDK 34+ (Builds APK & AAB)
- **iOS**: iOS 14.0+ (Universal iPhone & iPad)

---

## 🛠️ Key Capabilities & Contract Conformance
Matches `docs/MOBILE_GATEWAY_CONTRACT.md` and `docs/10-MOBILE-APP-SPEC.md`:

1. **Hardware Gateway (BLE GATT Central)**:
   - Scans and connects to `SAMADHAN-BAND-*` ESP32-S3 peripherals.
   - Subscribes to live GATT notifications for MAX30102 PPG, MPU6050 6-axis IMU, and DHT22 telemetry.
   - Includes a built-in Hardware Simulator mode for instant testing without physical hardware.
2. **Offline Ring Buffer**:
   - Stores up to 200 telemetry packets locally in FIFO storage during network outages.
   - Flushes un-synced batches to Firebase upon network restoration.
3. **Realtime Database Synchronization**:
   - Updates `/telemetry/{uid}/live` on every packet.
   - Downsamples history records to `/telemetry/{uid}/history/{timestamp}`.
   - Manages device lifecycle in `/devices/{deviceId}` and `/userDevices/{uid}/{deviceId}`.
4. **Clinical Risk & Fall Detection**:
   - Live acceleration magnitude calculation ($\sqrt{x^2 + y^2 + z^2}$).
   - Detects `IMPACT_CANDIDATE` and `FALL_CONFIRMED` states.
   - Automatically posts critical emergency escalations to `/alerts/{uid}`.
5. **Samadhan AI Health Companion**:
   - Interactive clinical AI guidance explaining vital telemetry, cardiac rhythm, and oxygen trends.

---

## 🚀 Build & Run Instructions

### Prerequisites
- Flutter SDK 3.19+ or 3.41+
- Dart SDK 3.3+
- Android Studio / Android SDK (for Android build)
- Xcode (macOS only, for iOS build)

### 1. Install Dependencies
```bash
flutter pub get
```

### 2. Run Tests
```bash
flutter test
```

### 3. Run in Development Mode
```bash
# Detect connected devices (Android, iOS, or simulator)
flutter devices

# Run on selected device
flutter run
```

### 4. Build Android Release APK
```bash
flutter build apk --release
```
The compiled APK will be located at:
`build/app/outputs/flutter-apk/app-release.apk`

### 5. Build for iOS
```bash
flutter build ios --no-codesign
```
Or open `ios/Runner.xcworkspace` in Xcode to archive and sign for TestFlight / App Store.
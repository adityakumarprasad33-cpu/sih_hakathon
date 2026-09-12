# Samadhan Mobile Hardware Gateway Specification & Contract

## 1. Architectural Overview

```
┌─────────────────────────┐
│  PHYSICAL ESP32-S3      │
│  - MAX30102 (PPG)       │
│  - MPU6050 (6-Axis IMU) │
│  - DHT22 (Temp/Humidity)│
└───────────┬─────────────┘
            │ BLE GATT
            ▼
┌─────────────────────────┐
│   FLUTTER MOBILE APP    │
│   (Android & iOS)       │
│   - MobileBLETransport  │
│   - Offline Buffer      │
│   - Authenticated Sync  │
└───────────┬─────────────┘
            │ Firebase Auth Bearer Token / Direct RTDB
            ▼
┌─────────────────────────┐
│  FIREBASE RTDB          │
│  - /devices/{deviceId}  │
│  - /telemetry/{uid}     │
│  - /risk/{uid}          │
│  - /alerts/{uid}        │
└───────────┬─────────────┘
            │ Real-time Stream
            ▼
┌─────────────────────────┐
│   WEB APPLICATION       │
│   - Patient Dashboard   │
│   - Clinical Health UI  │
│   - Doctor Portal       │
│   - Device Hub          │
└─────────────────────────┘
```

The Flutter mobile application acts as the primary hardware gateway. The web application operates purely as an authorized consumer of synchronized data.

---

## 2. Device Identity Format

- **Human Identity**: Authenticated Firebase User `UID` (e.g., `a7b9c1d3-4e5f-6a7b...`).
- **Physical Device ID**: Hardware identifier formatted as `SAMADHAN-BAND-[HEX6]` derived from ESP32 MAC address (e.g. `SAMADHAN-BAND-A7F39C`).
- **Device Model**: `Samadhan Health Wearable (ESP32-S3)`.
- **Firmware Versioning**: Semantic release format `v1.0.0-esp32s3`.

---

## 3. Pairing & Ownership Lifecycle

1. **Discovery**: Mobile app scans BLE advertisement packets filtering by Service UUID.
2. **Identity Verification**: Mobile app scans physical QR code on packaging containing `deviceId`. Mobile app verifies `QR.deviceId == BLE.deviceId`.
3. **Claiming**:
   - Mobile app signs in with Firebase Auth (`auth.uid`).
   - Writes device registration to `/devices/{deviceId}`:
     ```json
     {
       "ownerUid": "user_uid",
       "model": "Samadhan Health Wearable (ESP32-S3)",
       "firmwareVersion": "v1.0.0-esp32s3",
       "status": "PAIRED",
       "lastSeen": 1725890000000,
       "sensors": {
         "max30102": "ACTIVE",
         "mpu6050": "ACTIVE",
         "dht22": "ACTIVE"
       }
     }
     ```
   - Links ownership in `/userDevices/{uid}/{deviceId}`:
     ```json
     {
       "pairedAt": 1725890000000,
       "customName": "My Samadhan Band"
     }
     ```
4. **Unpairing / Revocation**:
   - Patient or doctor unpairs via app or web portal.
   - Deletes `/userDevices/{uid}/{deviceId}`.
   - Updates `/devices/{deviceId}/status` to `UNPAIRED`.

---

## 4. Telemetry Packet Schema

Synchronized to `/telemetry/{uid}/live` and `/telemetry/{uid}/history/{timestamp}`:

```typescript
interface HealthTelemetry {
  deviceId: string;              // "SAMADHAN-BAND-A7F39C"
  timestamp: number;             // Unix timestamp in milliseconds (UTC)
  
  // Optical Sensor (MAX30102)
  heartRate: number | null;      // BPM (e.g. 72) or null if finger/wrist not detected
  spo2: number | null;           // % SpO2 (e.g. 98) or null if unreadable
  hrStatus: "VALID" | "LOW_QUALITY" | "INVALID" | "ERROR";
  spo2Status: "VALID" | "LOW_QUALITY" | "INVALID" | "ERROR";
  ppgQuality: "GOOD" | "FAIR" | "POOR" | "ERROR";

  // Environmental Sensor (DHT22)
  temperature: number | null;    // Ambient temperature in °C
  humidity: number | null;       // Relative humidity %
  dhtStatus: "VALID" | "INVALID" | "STALE";

  // 6-Axis Motion Sensor (MPU6050)
  accelX: number | null;         // In g-units (-2g to +2g)
  accelY: number | null;
  accelZ: number | null;
  accelMagnitude: number | null; // sqrt(x^2 + y^2 + z^2)
  gyroX: number | null;          // In deg/s
  gyroY: number | null;
  gyroZ: number | null;
  gyroActivity: number | null;
  movementState: "RESTING" | "LOW_ACTIVITY" | "ACTIVE" | "UNKNOWN";
  imuStatus: "VALID" | "ERROR";

  // Data Quality & Health Risk
  overallDataQuality: "GOOD" | "FAIR" | "POOR" | "ERROR";
  risk?: RiskResult;

  // Fall Detection Subsystem
  fallState?: "IDLE" | "IMPACT_CANDIDATE" | "POST_IMPACT_MONITORING" | "FALL_SUSPECTED" | "FALL_CONFIRMED" | "CANCELLED" | "COOLDOWN";
  fallEvent?: FallEvent | null;
}
```

---

## 5. Synchronization, Buffering & Offline Expectations

1. **Normal Online Flow**:
   - ESP32 transmits telemetry over BLE GATT notification every 1–2 seconds.
   - Mobile app validates checksum and updates Firebase `/telemetry/{uid}/live`.
   - App logs periodic downsampled records (e.g., every 5–10s) to `/telemetry/{uid}/history/{timestamp}`.
   - App updates `/devices/{deviceId}/lastSeen` and `/devices/{deviceId}/batteryPercent`.
2. **Offline Buffering**:
   - If mobile device loses Internet connectivity, store packets locally in SQLite / Hive storage on the phone.
   - Limit local buffer to last 24 hours of data.
   - Prioritize critical alert events (such as `FALL_CONFIRMED` or severe tachy/bradycardia).
3. **Recovery Sync & Idempotency**:
   - When connection is restored, upload buffered batches sorted by `timestamp`.
   - Unique key is `timestamp` (`/telemetry/{uid}/history/{timestamp}`), ensuring idempotency.
   - Disallow rewriting records older than 7 days.
4. **Retry & Backoff**:
   - Exponential backoff on 5xx or network drops (1s, 2s, 4s, 8s, up to 30s max interval).

---

## 6. Security Invariants

- Never transmit unauthenticated packets.
- The web app never accesses raw BLE peripherals directly in production.
- Doctors only observe patients who have explicitly granted consent in `doctorPatients`.
- Stale data (> 5 minutes without packet) must honestly reflect `STALE` or `OFFLINE` in the UI.

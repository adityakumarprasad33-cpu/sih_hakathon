# System Architecture

```text
                     Firebase
              Auth + RTDB + Functions
                       /     \
                      /       \
             Patient App     Doctor Portal
               Flutter        Next.js
                  |
                 BLE
                  |
              ESP32-S3
                  |
        +---------+---------+
        |         |         |
     MAX30102    IMU      BME280
```

## Identity
- Firebase Auth `uid` identifies a human account.
- `deviceId` identifies a physical device.
- Doctor access is represented by an explicit relationship.
- Never hard-code a user's identity into firmware.

## Data flow
1. Sensors produce samples.
2. ESP32 filters/processes them.
3. Edge engine calculates quality/features/risk.
4. Device sends compact data over BLE.
5. Patient app validates and buffers data.
6. App syncs authorized data to Firebase.
7. Doctor portal reads only authorized patient data.
8. Cloudinary stores profile images; Firebase stores required media metadata.

## Trust boundaries
- Wearable ↔ phone
- App ↔ Firebase
- Doctor ↔ patient authorization
- Application ↔ Cloudinary
- Admin ↔ production data

Authorization is enforced server-side, not merely by hiding UI.

# MVP Build Plan

## Phase 0
Repository, Firebase dev/emulator, Flutter, Next.js, ESP32 toolchain, Cloudinary dev configuration.

## Phase 1
Bring up ESP32-S3 + MAX30102 + IMU + BME280 + OLED + local alert hardware.

## Phase 2
BLE GATT, telemetry packets, timestamps, reconnect and acknowledgements.

## Phase 3
Patient app: Firebase Auth, onboarding, pairing, live data and local cache.

## Phase 4
Firebase RTDB, security rules, emulator tests, device ownership and doctor-patient relationships.

## Phase 5
Doctor portal: authentication, invitations, patient list, patient detail and alerts.

## Phase 6
Cloudinary profile-image upload, metadata, transformations and deletion.

## Phase 7
Baseline, signal quality, rule-based risk, trajectory and alert state machine.

## Phase 8
Collect/label data, train models, evaluate and deploy suitable TinyML models.

## Phase 9
Security, offline, battery, failure testing, privacy and production hardening.

## First vertical slice
```text
ESP32-S3 → MAX30102 → HR/SpO2 → BLE → Flutter
→ Firebase Auth/RTDB → Next.js → authorized doctor view
```

## Definition of done
Patient can securely authenticate; device can pair; data reaches app/Firebase; patient can authorize doctor; doctor sees only authorized data; unauthorized access tests fail; Cloudinary image flow works; offline behavior works; basic alerts work; deployment documentation exists.

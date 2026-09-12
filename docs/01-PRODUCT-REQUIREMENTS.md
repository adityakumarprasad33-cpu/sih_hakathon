# Product Requirements

## Vision
Samadhan Health connects patients, wearable devices, AI-assisted risk monitoring and healthcare professionals.

## Actors
### Patient
Owns the device, views personal information, receives alerts, manages consent and emergency contacts.

### Doctor
Manages authorized patients, views permitted health trends and alerts, and reviews individual patient profiles.

### Admin
Handles narrowly scoped platform operations. Privileged access must be minimized and audited.

## MVP
- Firebase authentication
- Patient and doctor accounts
- Doctor-patient invitation and patient approval
- Device registration/ownership
- ESP32-S3 sensing and local processing
- BLE to patient phone
- Firebase synchronization
- Patient dashboard
- Doctor patient-list dashboard
- Individual patient dashboard
- Risk summaries
- Alerts
- Cloudinary profile images
- Offline buffering/synchronization

## Non-goals
- Definitive diagnosis
- Autonomous treatment
- Replacing doctors
- High-frequency raw sensor storage in Firebase
- Unvalidated medical claims
- Hospital/EHR integration in the first release

## Product principle
Display measurements, trends, risk indicators, confidence and actions. Do not present model output as a diagnosis.

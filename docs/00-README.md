# Samadhan Health — Documentation Index

Samadhan Health is a privacy-first doctor-connected health monitoring platform.

## Core stack
- ESP32-S3 + health/environment sensors
- Flutter patient mobile app
- Next.js/TypeScript doctor dashboard
- Firebase Authentication
- Firebase Realtime Database
- Firebase Cloud Functions where backend processing is required
- Cloudinary for user/profile images and approved media
- Edge risk engine / TinyML
- LLM for explanation and conversation

## Documentation
- `01-PRODUCT-REQUIREMENTS.md` — product scope and requirements
- `02-SYSTEM-ARCHITECTURE.md` — complete architecture
- `03-USER-ROLES-AND-PERMISSIONS.md` — access control
- `04-FIREBASE-DATA-MODEL.md` — RTDB schema
- `05-FIREBASE-SECURITY-RULES.md` — security requirements
- `06-CLOUDINARY-MEDIA-ARCHITECTURE.md` — image/media flow
- `07-DOCTOR-PATIENT-MODEL.md` — consent and relationships
- `08-BLE-GATT-PROTOCOL.md` — ESP32/mobile protocol
- `09-API-DATA-CONTRACTS.md` — data contracts
- `10-MOBILE-APP-SPEC.md` — Flutter app
- `11-DOCTOR-DASHBOARD-SPEC.md` — doctor portal
- `12-DEVICE-FIRMWARE-SPEC.md` — ESP32
- `13-AI-RISK-ENGINE.md` — risk/ML architecture
- `14-LLM-AI-COMPANION.md` — LLM safety
- `15-OFFLINE-SYNC.md` — offline-first behavior
- `16-SECURITY-THREAT-MODEL.md` — threats/mitigations
- `17-PRIVACY-DATA-GOVERNANCE.md` — privacy/retention
- `18-EMERGENCY-ALERTS.md` — escalation
- `19-TESTING-VALIDATION.md` — test strategy
- `20-DEPLOYMENT-ENVIRONMENTS.md` — dev/staging/prod
- `21-OBSERVABILITY-OPERATIONS.md` — operations
- `22-UI-UX-FLOWS.md` — user journeys
- `23-PATENT-RND.md` — IP/R&D direction
- `24-MVP-BUILD-PLAN.md` — implementation order

Critical rule: Firebase/cloud availability must never be required for the wearable's core local sensing and alert loop.

# Samadhan Health — Smart India Hackathon

**Samadhan Health** is a privacy-first, doctor-connected health monitoring and AI-assisted companion platform.

---

## 🌟 Key Features
- **Doctor & Patient Workspaces**: Real-time health monitoring, consultation workflows, and vital sign tracking.
- **Edge Risk Engine / TinyML**: On-device anomaly detection and localized sensing.
- **AI Health Companion**: LLM-powered context-aware health advisory and symptom assessment.
- **Offline-First Synchronization**: Uninterrupted local operation with deferred cloud sync.
- **Privacy & Security**: Granular Firebase Security Rules, end-to-end data governance, and role-based access control.

---

## 🏗️ Tech Stack
- **Web App**: Next.js 15, React 19, TypeScript, Tailwind CSS, Motion, Lucide React
- **Backend & Realtime Data**: Firebase Authentication & Realtime Database (RTDB)
- **AI & Cloud Functions**: Modal-hosted LLM Service, Python Edge Inference
- **Media & Assets**: Cloudinary Media Pipeline
- **Hardware Integration**: ESP32-S3 BLE GATT protocol & health sensors

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### Installation
`ash
# Clone the repository
git clone https://github.com/adityakumarprasad33-cpu/sih_hakathon.git
cd sih_hakathon

# Install dependencies
npm install
`

### Environment Setup
Create a .env.local file by copying the example:
`ash
cp .env.example .env.local
`
Fill in your Firebase credentials, Cloudinary cloud name, and LLM endpoints.

### Development Server
`ash
npm run dev
`
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📚 Project Documentation
Comprehensive architecture, specifications, and data contracts are documented in the [docs/](./docs) directory:
- [01 - Product Requirements](./docs/01-PRODUCT-REQUIREMENTS.md)
- [02 - System Architecture](./docs/02-SYSTEM-ARCHITECTURE.md)
- [03 - User Roles & Permissions](./docs/03-USER-ROLES-AND-PERMISSIONS.md)
- [04 - Firebase Data Model](./docs/04-FIREBASE-DATA-MODEL.md)
- [05 - Firebase Security Rules](./docs/05-FIREBASE-SECURITY-RULES.md)
- [08 - BLE GATT Protocol](./docs/08-BLE-GATT-PROTOCOL.md)
- [13 - AI Risk Engine](./docs/13-AI-RISK-ENGINE.md)
- [14 - LLM AI Companion](./docs/14-LLM-AI-COMPANION.md)
- [16 - Security Threat Model](./docs/16-SECURITY-THREAT-MODEL.md)

---

## 🧪 Testing & Validation
`ash
npm run test:all
`
Runs rules simulator, web-hardware collaboration tests, and LLM integration suites.

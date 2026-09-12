# Firebase Data Model

Firebase Authentication stores identity. Realtime Database stores application data.

```text
/
├── users/{uid}
│   ├── role
│   ├── profile
│   ├── preferences
│   ├── healthProfile
│   └── emergencyContacts/{id}
├── doctors/{doctorUid}/professionalProfile
├── patients/{patientUid}/settings
├── devices/{deviceId}
│   ├── ownerUid
│   ├── model
│   ├── firmwareVersion
│   ├── status
│   ├── battery
│   └── lastSeen
├── userDevices/{uid}/{deviceId}: true
├── doctorPatients/{doctorUid}/{patientUid}
│   ├── status
│   ├── consentStatus
│   ├── permissions
│   ├── createdAt
│   └── revokedAt
├── patientDoctors/{patientUid}/{doctorUid}
├── telemetry/{patientUid}/{deviceId}/{timestamp}
├── risk/{patientUid}/{timestamp}
├── alerts/{patientUid}/{alertId}
├── devicePairingRequests/{requestId}
└── auditEvents/{eventId}
```

Use Firebase Auth UID rather than email as the ownership key.

Do not store passwords, service-account keys, Cloudinary secrets or other secrets in RTDB.

Normal operation should store derived measurements/features/events rather than high-frequency raw PPG.

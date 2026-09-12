# Firebase Security Rules Specification

## Required invariants
1. Unauthenticated users cannot read private data.
2. Patients can access only their own protected resources.
3. Doctors can read a patient only when the doctor-patient relationship is active and permitted.
4. Patients can control/revoke doctor access.
5. Clients cannot freely modify device-generated telemetry/risk.
6. Device ownership is validated before association.
7. Role fields cannot be freely escalated by clients.
8. Admin operations use trusted backend mechanisms and are audited.
9. Writes validate types, ranges and immutable fields.

## Authorization pseudocode
```text
patient read:
    auth.uid == patientUid

doctor read:
    auth.uid == doctorUid
    AND doctorPatients/{doctorUid}/{patientUid}.status == "active"
    AND consentStatus == "active"

device write:
    authenticated ingestion path
    AND device belongs to patient
    AND schema valid
```

The actual deployed rules must be implemented and tested using Firebase Emulator Suite before production.

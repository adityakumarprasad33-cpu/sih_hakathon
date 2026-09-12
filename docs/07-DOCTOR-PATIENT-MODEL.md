# Doctor–Patient Relationship

Doctor access is never granted merely because a doctor knows a patient's identifier.

## Lifecycle
```text
NONE → INVITED → PATIENT_APPROVED → ACTIVE → REVOKED
```

## Invitation
Contains doctor UID, patient contact/identifier, requested permissions, expiry and timestamps.

## Consent
Patient can approve or reject requested access and revoke it later.

Potential permissions:
- view current vitals
- view risk
- view historical trends
- receive alerts

## Dashboard
Doctor sees:
- active patient count
- patient list
- risk state
- recent alerts
- last-seen/device status

Clicking a patient reveals only authorized data.

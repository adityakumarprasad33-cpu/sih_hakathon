# User Roles and Permissions

## Roles
`patient`, `doctor`, `admin`

## Patient
Can read/write allowed fields of their own profile, read their own health data, manage devices, emergency contacts and doctor consent.

Cannot read another patient's data or directly overwrite device-generated risk/telemetry.

## Doctor
Can view patients only when an active authorized doctor-patient relationship exists.

Can view permitted:
- current vitals
- risk
- history/trends
- alerts
- device status

Cannot browse arbitrary patients or modify measurements.

## Admin
No blanket unrestricted client-side bypass. Administrative operations must use trusted backend mechanisms and audit logs.

## Authorization
```text
Firebase Auth
    ↓
Role
    ↓
Resource ownership / relationship
    ↓
Permission
    ↓
Allow or deny
```

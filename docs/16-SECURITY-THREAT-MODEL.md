# Security Threat Model

## Assets
Patient health data, identities, doctor relationships, device ownership, emergency contacts, profile images, model/configuration and audit records.

## Threats and mitigations
### Unauthorized health-data access
Firebase Auth + strict RTDB rules + relationship authorization + emulator tests.

### Account takeover
Secure Firebase Auth configuration, recovery protections and optional MFA.

### Device impersonation
Secure pairing/bonding, device identity and authenticated provisioning.

### Malicious telemetry
Schema/range validation, ownership checks, sequence/timestamp checks.

### Cloudinary abuse
Controlled upload, file validation, size limits and no client-side secrets.

### Insider misuse
Least privilege, auditing and controlled privileged access.

Security is part of every release, not a final checkbox.

# Observability and Operations

Track:
- active devices/patients/doctors
- BLE connection success
- sync latency/failures
- offline duration
- alert rates
- firmware reboots
- battery indicators
- authentication failures
- model regressions

Avoid logging unnecessary health data. Prefer event types and opaque IDs.

Release flow:
```text
change → tests → security tests → staging → hardware validation → controlled release → monitor
```

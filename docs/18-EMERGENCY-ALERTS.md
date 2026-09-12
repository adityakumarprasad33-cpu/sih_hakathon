# Emergency and Alerts

```text
Sensor
 ↓
Quality
 ↓
Risk engine
 ↓
Persistence/trajectory
 ↓
Alert state
 ↓
Patient notification
 ↓
Doctor notification
 ↓
Emergency contact workflow
```

Use hysteresis, persistence, cooldown, duplicate suppression and acknowledgment.

If internet is unavailable, local device/phone alerts can still work where technically supported; cloud escalation becomes pending until connectivity returns.

Never promise guaranteed emergency delivery unless the complete communication path has been validated.

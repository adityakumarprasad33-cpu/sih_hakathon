# API and Data Contracts

All cross-component data must be versioned.

## Envelope
```json
{
  "schemaVersion": 1,
  "timestamp": 0,
  "source": "device",
  "deviceId": "...",
  "patientUid": "...",
  "payload": {}
}
```

## Telemetry
```json
{
  "schemaVersion": 1,
  "hr": 76,
  "spo2": 98,
  "temperature": 36.7,
  "humidity": 55,
  "activity": "walking",
  "quality": {"hr": 0.92, "spo2": 0.89}
}
```

## Risk
```json
{
  "schemaVersion": 1,
  "overall": 0.24,
  "heat": 0.11,
  "respiratory": 0.18,
  "cardiovascular": 0.20,
  "fatigue": 0.32,
  "fall": 0.00,
  "confidence": 0.84,
  "state": "WATCH"
}
```

Use fixed units, UTC timestamps, explicit schema versions, range validation and backward-compatible parsing.

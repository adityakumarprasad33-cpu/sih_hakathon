# Offline and Synchronization

## Device offline
Continue sensing, local risk calculation, local alerts and local buffering.

## Phone offline
Keep a local cache and unsynced queue. Sync automatically after connectivity returns.

## Firebase unavailable
Do not block the core health loop.

## Record
```text
recordId
deviceId
patientUid
timestamp
schemaVersion
payload
syncState
retryCount
```

Time-series telemetry is append-oriented. Always display the timestamp and staleness of the latest data.

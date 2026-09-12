# BLE GATT Protocol

ESP32-S3 is the BLE peripheral/server. Flutter is the central/client.

## Services
1. Device Information
2. Telemetry
3. Risk Status
4. Battery
5. Configuration
6. Command
7. Emergency

## Telemetry
Development may use JSON. Production should use compact versioned binary packets.

```text
version
sequence
timestamp
heartRate
spo2
temperature
humidity
activity
risk
qualityFlags
battery
crc
```

## Commands
`GET_DEVICE_INFO`, `START_STREAM`, `STOP_STREAM`, `REQUEST_STATUS`, `SET_INTERVAL`, `SYNC_TIME`, `PING`, `ACK`

Use sequence numbers, timestamps, retry/timeout handling, duplicate detection and protocol versioning.

BLE discovery is not sufficient authorization; pairing/bonding and application-level device authentication must be designed before production.

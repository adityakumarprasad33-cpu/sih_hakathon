# ESP32-S3 Firmware

## Responsibilities
Sensor acquisition, timestamps, filtering, signal quality, feature extraction, risk calculation, local alerts, BLE, local buffering, watchdog/recovery and battery-aware scheduling.

## MVP hardware
- MAX30102
- MPU6050/BMI270
- BME280
- OLED
- vibration motor/buzzer
- optional microSD

## Runtime
```text
BOOT
 ↓
SELF TEST
 ↓
SENSOR INIT
 ↓
TIME SYNC
 ↓
MAIN LOOP
 ├─ sample
 ├─ filter
 ├─ quality
 ├─ features
 ├─ risk
 ├─ alerts
 ├─ BLE
 └─ storage
```

Use watchdogs, sensor timeout detection, reconnect logic, bounded memory and ring-buffered offline storage.

Cloud availability must not be required for local sensing/alerting.

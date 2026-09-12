/**
 * Production Device Identity and Hardware State Contracts
 * Identifies physical ESP32-S3 wearable peripherals mapped to authenticated Firebase users.
 */

export type DeviceConnectionState = 
  | "CONNECTED" 
  | "DISCONNECTED" 
  | "OFFLINE" 
  | "PAIRING" 
  | "WAITING_FOR_DEVICE" 
  | "STALE";

export type SensorHealthStatus = "READY" | "ACTIVE" | "ERROR" | "DEGRADED" | "INITIALIZED";

export interface DeviceSensorsHealth {
  max30102?: SensorHealthStatus;
  mpu6050?: SensorHealthStatus;
  dht22?: SensorHealthStatus;
}

export interface SamadhanDevice {
  /** Unique physical hardware serial identifier (e.g. SAMADHAN-BAND-A7F39C) */
  id: string;
  /** Friendly custom display name */
  name: string;
  /** Device model descriptor */
  model?: string;
  /** Embedded firmware release tag */
  firmwareVersion: string;
  /** Battery charge percentage (0-100) if reporting */
  batteryPercent?: number;
  /** Millisecond unix timestamp of last gateway sync / packet */
  lastSeen: number;
  /** Real-time gateway connection status */
  connectionState: DeviceConnectionState;
  /** Bluetooth MAC address / BLE Peripheral UUID if known */
  macAddress?: string;
  /** Authenticated Firebase user UID who owns this device */
  ownerUid?: string;
  /** Health status of onboard sensors */
  sensors?: DeviceSensorsHealth;
  /** Timestamp of most recently recorded telemetry packet */
  lastTelemetryTimestamp?: number;
  /** Timestamp when user claimed/paired this hardware */
  pairedAt?: number;
}

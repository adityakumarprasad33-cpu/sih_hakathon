/**
 * Hardware Communication Abstraction & Gateway Sync Contracts
 * 
 * Production Path:
 *   ESP32-S3 Sensors -> (BLE) -> Flutter Mobile App -> (Authenticated Sync) -> Firebase RTDB -> Web
 * 
 * Note:
 *   The web application consumes Firebase data.
 *   This abstraction specifies the common contract mirrored by the future Mobile BLE gateway.
 */

import type { HealthTelemetry, FallEvent, FallState, RiskResult } from "@/types/health";
import type { DeviceConnectionState, SensorHealthStatus } from "@/types/device";

export interface NormalizedHardwarePacket {
  /** Physical hardware identifier (e.g. SAMADHAN-BAND-A7F39C) */
  deviceId: string;
  /** Millisecond epoch timestamp from hardware or gateway clock */
  timestamp: number;
  /** Hardware firmware release */
  firmwareVersion?: string;
  /** Battery charge percentage (0-100) */
  batteryPercent?: number;
  
  // --- Sensor Stack: MAX30102 (PPG) ---
  heartRate: number | null;
  spo2: number | null;
  hrStatus: "VALID" | "LOW_QUALITY" | "INVALID" | "ERROR";
  spo2Status: "VALID" | "LOW_QUALITY" | "INVALID" | "ERROR";
  ppgQuality: "GOOD" | "FAIR" | "POOR" | "ERROR";
  
  // --- Sensor Stack: MPU6050 (6-Axis IMU) ---
  accelX: number | null;
  accelY: number | null;
  accelZ: number | null;
  accelMagnitude: number | null;
  gyroX: number | null;
  gyroY: number | null;
  gyroZ: number | null;
  gyroActivity: number | null;
  movementState: "RESTING" | "LOW_ACTIVITY" | "ACTIVE" | "UNKNOWN";
  imuStatus: "VALID" | "ERROR";
  
  // --- Sensor Stack: DHT22 (Environmental) ---
  temperature: number | null;
  humidity: number | null;
  dhtStatus: "VALID" | "INVALID" | "STALE";
  
  // --- Embedded Subsystems ---
  fallState?: FallState;
  fallEvent?: FallEvent | null;
  risk?: RiskResult;
  
  // --- Data Integrity ---
  sequenceNumber?: number;
  qualityFlags?: number;
}

export interface MobileGatewaySyncPayload {
  /** Authenticated patient user UID */
  uid: string;
  /** Hardware peripheral identifier */
  deviceId: string;
  /** Sync batch timestamp */
  syncTimestamp: number;
  /** Primary live telemetry packet */
  liveTelemetry: NormalizedHardwarePacket;
  /** Optional buffered historical records (for offline recovery) */
  bufferedTelemetry?: NormalizedHardwarePacket[];
  /** Device status update */
  deviceState?: {
    batteryPercent?: number;
    connectionState: DeviceConnectionState;
    firmwareVersion: string;
    sensors?: {
      max30102?: SensorHealthStatus;
      mpu6050?: SensorHealthStatus;
      dht22?: SensorHealthStatus;
    };
  };
}

export interface GatewaySyncResponse {
  success: boolean;
  syncedPacketsCount: number;
  timestamp: number;
  status: "SYNCED" | "QUEUED" | "REJECTED";
  error?: string;
}

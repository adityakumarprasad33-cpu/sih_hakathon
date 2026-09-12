/**
 * Hardware Transport Interface
 * 
 * Defines the common transport interface contract.
 * - In production: Mirrored by the Flutter MobileBLETransport on Android/iOS.
 * - In development: Optionally usable by isolated desktop diagnostic tools.
 * 
 * The production website NEVER depends directly on local transport; it consumes Firebase RTDB.
 */

import type { NormalizedHardwarePacket } from "./hardwareTypes";

export type TransportConnectionState = 
  | "DISCONNECTED"
  | "SCANNING"
  | "CONNECTING"
  | "CONNECTED"
  | "STREAMING"
  | "ERROR";

export interface HardwareTransport {
  readonly transportName: string;
  getConnectionState(): TransportConnectionState;
  connect(deviceId?: string): Promise<boolean>;
  disconnect(): Promise<void>;
  onTelemetry(callback: (packet: NormalizedHardwarePacket) => void): () => void;
  onStateChange(callback: (state: TransportConnectionState) => void): () => void;
}

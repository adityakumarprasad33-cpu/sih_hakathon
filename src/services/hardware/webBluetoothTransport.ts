/**
 * Web Bluetooth Transport (DEVELOPMENT & DESKTOP DIAGNOSTIC TOOLING ONLY)
 * 
 * IMPORTANT ARCHITECTURAL NOTE:
 * - This module is strictly an isolated developer utility for bench testing.
 * - In production, the Flutter mobile app is the hardware BLE gateway.
 * - The patient website (health/page.tsx, device/page.tsx) does NOT depend on this module.
 */

import type { HardwareTransport, TransportConnectionState } from "./hardwareTransport";
import type { NormalizedHardwarePacket } from "./hardwareTypes";

export class WebBluetoothTransport implements HardwareTransport {
  public readonly transportName = "WebBluetoothDevTool";
  private state: TransportConnectionState = "DISCONNECTED";
  private telemetryCallbacks: Set<(packet: NormalizedHardwarePacket) => void> = new Set();
  private stateCallbacks: Set<(state: TransportConnectionState) => void> = new Set();

  public isSupported(): boolean {
    return typeof navigator !== "undefined" && "bluetooth" in navigator;
  }

  public getConnectionState(): TransportConnectionState {
    return this.state;
  }

  private setState(newState: TransportConnectionState) {
    this.state = newState;
    this.stateCallbacks.forEach((cb) => cb(newState));
  }

  public async connect(): Promise<boolean> {
    if (!this.isSupported()) {
      this.setState("ERROR");
      return false;
    }
    this.setState("SCANNING");
    // Isolated dev mock / GATT hook for hardware engineers on desktop
    return true;
  }

  public async disconnect(): Promise<void> {
    this.setState("DISCONNECTED");
  }

  public onTelemetry(callback: (packet: NormalizedHardwarePacket) => void): () => void {
    this.telemetryCallbacks.add(callback);
    return () => this.telemetryCallbacks.delete(callback);
  }

  public onStateChange(callback: (state: TransportConnectionState) => void): () => void {
    this.stateCallbacks.add(callback);
    return () => this.stateCallbacks.delete(callback);
  }
}

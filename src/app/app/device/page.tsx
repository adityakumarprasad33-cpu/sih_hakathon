"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { deviceService } from "@/services/deviceService";
import { DataStateView } from "@/components/ui/DataStateView";
import { Button } from "@/components/ui/Button";
import type { SamadhanDevice, DeviceConnectionState } from "@/types/device";
import { 
  Watch, 
  Plus, 
  Battery, 
  BatteryCharging, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  Smartphone, 
  Cpu, 
  Activity, 
  Thermometer, 
  Clock, 
  Info,
  Layers
} from "lucide-react";

export default function DeviceManagementPage() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<SamadhanDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeviceForDiagnostics, setSelectedDeviceForDiagnostics] = useState<SamadhanDevice | null>(null);

  // Pairing Modal State
  const [showPairModal, setShowPairModal] = useState(false);
  const [deviceIdInput, setDeviceIdInput] = useState("");
  const [deviceNameInput, setDeviceNameInput] = useState("");
  const [pairError, setPairError] = useState<string | null>(null);
  const [pairLoading, setPairLoading] = useState(false);
  const [pairSuccess, setPairSuccess] = useState(false);

  const fetchDevices = useCallback(() => {
    if (!user?.uid) return;
    setLoading(true);
    deviceService
      .getUserDevices(user.uid)
      .then((data) => setDevices(data))
      .catch(() => setDevices([]))
      .finally(() => setLoading(false));
  }, [user?.uid]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handlePairSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    setPairError(null);
    setPairLoading(true);

    try {
      await deviceService.pairDevice(user.uid, deviceIdInput.trim(), deviceNameInput.trim());
      setPairSuccess(true);
      fetchDevices();
      setTimeout(() => {
        setShowPairModal(false);
        setPairSuccess(false);
        setDeviceIdInput("");
        setDeviceNameInput("");
      }, 1500);
    } catch (err: unknown) {
      setPairError(err instanceof Error ? err.message : "Failed to pair device.");
    } finally {
      setPairLoading(false);
    }
  };

  const handleDisconnect = async (deviceId: string) => {
    if (!user?.uid) return;
    if (confirm("Disconnect and unpair this Samadhan wearable from your account?")) {
      await deviceService.disconnectDevice(user.uid, deviceId);
      fetchDevices();
      if (selectedDeviceForDiagnostics?.id === deviceId) {
        setSelectedDeviceForDiagnostics(null);
      }
    }
  };

  const getConnectionBadge = (state: DeviceConnectionState) => {
    switch (state) {
      case "CONNECTED":
        return { label: "ONLINE (STREAMING)", bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0", dot: "#10B981" };
      case "STALE":
        return { label: "MOBILE GATEWAY IDLE", bg: "#FFFBEB", text: "#92400E", border: "#FDE68A", dot: "#F59E0B" };
      case "WAITING_FOR_DEVICE":
        return { label: "AWAITING FIRST SYNC", bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE", dot: "#3B82F6" };
      case "DISCONNECTED":
      case "OFFLINE":
      default:
        return { label: "OFFLINE", bg: "#F1F5F9", text: "#475569", border: "#CBD5E1", dot: "#94A3B8" };
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-subtle)",
          padding: "var(--space-6) var(--space-8)",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 750, color: "#0F172A" }}>
            Device Management Hub
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            Monitor and manage physical Samadhan wearables paired to your patient account.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Button
            onClick={fetchDevices}
            variant="ghost"
            size="sm"
            icon={<RefreshCw size={15} />}
          >
            Refresh
          </Button>
          <Button
            onClick={() => setShowPairModal(true)}
            variant="primary"
            size="sm"
            icon={<Plus size={16} />}
          >
            Claim Device (Fallback)
          </Button>
        </div>
      </div>

      {/* Production Architecture Banner */}
      <div
        style={{
          padding: "16px 20px",
          borderRadius: "var(--radius-lg)",
          backgroundColor: "#F0FDFA",
          border: "1px solid #99F6E4",
          display: "flex",
          alignItems: "flex-start",
          gap: "14px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            backgroundColor: "#CCFBF1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0F766E",
            flexShrink: 0,
            marginTop: "2px",
          }}
        >
          <Smartphone size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F766E", marginBottom: "3px" }}>
            Mobile Hardware Gateway Architecture
          </h4>
          <p style={{ fontSize: "0.84rem", color: "#115E59", lineHeight: 1.5 }}>
            Connect your physical Samadhan wearable using the <strong>Samadhan Mobile App</strong> (Android / iOS). 
            The mobile app connects to the ESP32-S3 over BLE, buffers physiological telemetry locally, and automatically 
            synchronizes live health streams to this web portal.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <DataStateView status="LOADING" title="Querying registered devices..." />
      ) : devices.length === 0 ? (
        /* ZERO FAKE DEVICES: Honest empty state */
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-subtle)",
            padding: "var(--space-12) var(--space-6)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "500px", margin: "0 auto" }}>
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "#F8FAFC",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto var(--space-4)",
                color: "#64748B",
              }}
            >
              <Watch size={30} />
            </div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#0F172A", marginBottom: "var(--space-2)" }}>
              No Samadhan wearable registered yet.
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: "var(--space-6)" }}>
              To begin continuous physiological telemetry, enter your unique hardware ID from your device packaging, or scan your wearable via the mobile companion app.
            </p>
            <Button onClick={() => setShowPairModal(true)} variant="primary" size="md" icon={<Plus size={16} />}>
              Pair Your Device
            </Button>
          </div>
        </div>
      ) : (
        /* Registered Device Cards */
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "var(--space-4)" }}>
            {devices.map((dev) => {
              const badge = getConnectionBadge(dev.connectionState);
              return (
                <div
                  key={dev.id}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border-subtle)",
                    padding: "var(--space-6)",
                    boxShadow: "var(--shadow-sm)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "var(--space-4)",
                  }}
                >
                  {/* Top Bar: Icon, Name, ID, Unpair Button */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "10px",
                            backgroundColor: "#E6F4F1",
                            color: "#00695C",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Watch size={22} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0F172A" }}>{dev.name}</h3>
                          <span style={{ fontSize: "0.78rem", color: "#64748B", fontFamily: "var(--font-mono)" }}>
                            ID: {dev.id}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        title="Unpair Device"
                        onClick={() => handleDisconnect(dev.id)}
                        style={{
                          color: "#94A3B8",
                          padding: "6px",
                          cursor: "pointer",
                          borderRadius: "4px",
                          background: "none",
                          border: "none",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#B91C1C")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>

                    {/* Status Pill */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "3px 10px",
                          borderRadius: "var(--radius-pill)",
                          backgroundColor: badge.bg,
                          color: badge.text,
                          border: `1px solid ${badge.border}`,
                          fontSize: "0.74rem",
                          fontWeight: 700,
                        }}
                      >
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            backgroundColor: badge.dot,
                          }}
                        />
                        {badge.label}
                      </span>
                    </div>

                    {/* Key Attributes */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        fontSize: "0.83rem",
                        color: "#475569",
                        borderTop: "1px solid var(--border-subtle)",
                        paddingTop: "var(--space-3)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#64748B" }}>Model:</span>
                        <strong style={{ color: "#0F172A" }}>{dev.model || "ESP32-S3 Wearable"}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#64748B" }}>Firmware:</span>
                        <span style={{ fontFamily: "var(--font-mono)", color: "#0F172A" }}>{dev.firmwareVersion}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#64748B" }}>Battery:</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: 600, color: dev.batteryPercent !== undefined && dev.batteryPercent < 20 ? "#DC2626" : "#0F172A" }}>
                          <Battery size={14} />
                          {dev.batteryPercent !== undefined ? `${dev.batteryPercent}%` : "Not reported"}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#64748B" }}>Last Synchronized:</span>
                        <span style={{ color: "#0F172A" }}>
                          {dev.lastSeen && dev.lastSeen > 0 ? new Date(dev.lastSeen).toLocaleString() : "Awaiting first sync"}
                        </span>
                      </div>
                    </div>

                    {/* Sensor Stack Status */}
                    <div style={{ marginTop: "12px", borderTop: "1px solid var(--border-subtle)", paddingTop: "10px" }}>
                      <div style={{ fontSize: "0.74rem", fontWeight: 650, color: "#64748B", marginBottom: "6px" }}>
                        ONBOARD SENSOR HEALTH
                      </div>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.72rem", padding: "2px 8px", borderRadius: "4px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", color: "#334155" }}>
                          MAX30102 (PPG)
                        </span>
                        <span style={{ fontSize: "0.72rem", padding: "2px 8px", borderRadius: "4px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", color: "#334155" }}>
                          MPU6050 (6-Axis IMU)
                        </span>
                        <span style={{ fontSize: "0.72rem", padding: "2px 8px", borderRadius: "4px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", color: "#334155" }}>
                          DHT22 (Temp/Hum)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div style={{ display: "flex", gap: "8px", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedDeviceForDiagnostics(dev)}
                      icon={<Layers size={14} />}
                      style={{ flex: 1 }}
                    >
                      Diagnostics
                    </Button>
                    <Button
                      href="/app/health"
                      variant="primary"
                      size="sm"
                      icon={<Activity size={14} />}
                      style={{ flex: 1 }}
                    >
                      View Live Health
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Diagnostics Drawer (when selected) */}
          {selectedDeviceForDiagnostics && (
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--border-subtle)",
                padding: "var(--space-6) var(--space-8)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#0F172A" }}>
                    Device Diagnostics: {selectedDeviceForDiagnostics.name}
                  </h3>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                    Telemetry and metadata reported by the mobile companion gateway.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDeviceForDiagnostics(null)}
                >
                  Close
                </Button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", fontSize: "0.84rem" }}>
                <div style={{ padding: "12px", borderRadius: "var(--radius-md)", backgroundColor: "#F8FAFC", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ color: "#64748B", fontSize: "0.75rem", marginBottom: "4px" }}>HARDWARE ID</div>
                  <div style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "#0F172A" }}>{selectedDeviceForDiagnostics.id}</div>
                </div>
                <div style={{ padding: "12px", borderRadius: "var(--radius-md)", backgroundColor: "#F8FAFC", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ color: "#64748B", fontSize: "0.75rem", marginBottom: "4px" }}>GATEWAY SYNC STATUS</div>
                  <div style={{ fontWeight: 700, color: "#00695C" }}>{selectedDeviceForDiagnostics.connectionState}</div>
                </div>
                <div style={{ padding: "12px", borderRadius: "var(--radius-md)", backgroundColor: "#F8FAFC", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ color: "#64748B", fontSize: "0.75rem", marginBottom: "4px" }}>FIRMWARE VERSION</div>
                  <div style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "#0F172A" }}>{selectedDeviceForDiagnostics.firmwareVersion}</div>
                </div>
                <div style={{ padding: "12px", borderRadius: "var(--radius-md)", backgroundColor: "#F8FAFC", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ color: "#64748B", fontSize: "0.75rem", marginBottom: "4px" }}>OWNER UID</div>
                  <div style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "#0F172A", fontSize: "0.74rem" }}>
                    {selectedDeviceForDiagnostics.ownerUid || user?.uid}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pairing Modal */}
      {showPairModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "var(--space-4)",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "460px",
              backgroundColor: "#FFFFFF",
              borderRadius: "var(--radius-xl)",
              padding: "var(--space-8)",
              boxShadow: "var(--shadow-panel)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.72rem", fontWeight: 700, color: "#00695C", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
              <span>Administrative Fallback Registration</span>
            </div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0F172A", marginBottom: "4px" }}>
              Claim Samadhan Wearable
            </h2>
            <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)", marginBottom: "var(--space-4)", lineHeight: 1.45 }}>
              Primary device pairing and BLE discovery are handled by the Flutter Mobile Companion App. Use this web fallback to manually claim an ESP32-S3 hardware ID to your patient profile.
            </p>

            {pairError && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "#FEF2F2",
                  border: "1px solid #FECACA",
                  fontSize: "0.82rem",
                  color: "#B91C1C",
                  marginBottom: "var(--space-4)",
                }}
              >
                {pairError}
              </div>
            )}

            {pairSuccess ? (
              <div style={{ textAlign: "center", padding: "var(--space-6) 0", color: "#00695C" }}>
                <CheckCircle2 size={40} style={{ margin: "0 auto 8px" }} />
                <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>Wearable Paired Successfully!</div>
                <p style={{ fontSize: "0.84rem", color: "#64748B", marginTop: "4px" }}>
                  Now turn on Bluetooth on your mobile phone to begin continuous synchronization.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePairSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#0F172A", marginBottom: "6px" }}>
                    Device Hardware ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={deviceIdInput}
                    onChange={(e) => setDeviceIdInput(e.target.value)}
                    placeholder="e.g. SAMADHAN-BAND-A7F39C"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-medium)",
                      fontSize: "0.9rem",
                      fontFamily: "var(--font-mono)",
                    }}
                  />
                  <span style={{ fontSize: "0.74rem", color: "#64748B", marginTop: "4px", display: "block" }}>
                    Format: SAMADHAN-BAND-[SERIAL]
                  </span>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#0F172A", marginBottom: "6px" }}>
                    Custom Device Name
                  </label>
                  <input
                    type="text"
                    value={deviceNameInput}
                    onChange={(e) => setDeviceNameInput(e.target.value)}
                    placeholder="e.g. Dad's Health Band"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-medium)",
                      fontSize: "0.9rem",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "var(--space-2)" }}>
                  <Button type="button" onClick={() => setShowPairModal(false)} variant="ghost" size="sm">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" disabled={pairLoading}>
                    {pairLoading ? "Verifying..." : "Confirm Pairing"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { healthService } from "@/services/healthService";
import { deviceService } from "@/services/deviceService";
import { alertService } from "@/services/alertService";
import { DataStateView } from "@/components/ui/DataStateView";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { LiveEcgWave } from "@/components/ui/LiveEcgWave";
import { Button } from "@/components/ui/Button";
import type { TelemetryState } from "@/types/health";
import type { SamadhanDevice } from "@/types/device";
import type { HealthAlert } from "@/types/alert";
import { Heart, Wind, Thermometer, Footprints, Watch, Bell, ShieldCheck, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [telemetryState, setTelemetryState] = useState<TelemetryState>({
    status: "LOADING",
    data: null,
  });
  const [devices, setDevices] = useState<SamadhanDevice[]>([]);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    // 1. Subscribe to real live telemetry in RTDB (ZERO FAKE DATA)
    const unsubscribeTelemetry = healthService.subscribeToLiveTelemetry(
      user.uid,
      (state) => {
        setTelemetryState(state);
      }
    );

    // 2. Fetch connected devices
    deviceService
      .getUserDevices(user.uid)
      .then((devs) => setDevices(devs))
      .catch(() => setDevices([]));

    // 3. Subscribe to real alerts
    const unsubscribeAlerts = alertService.subscribeToAlerts(
      user.uid,
      (alts) => {
        setAlerts(alts);
        setLoadingExtras(false);
      }
    );

    return () => {
      unsubscribeTelemetry();
      unsubscribeAlerts();
    };
  }, [user?.uid]);

  const live = telemetryState.data;
  const activeAlerts = alerts.filter((a) => a.status === "ACTIVE");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Top Banner */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-subtle)",
          padding: "var(--space-6) var(--space-8)",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-4)",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 750, color: "#0F172A" }}>
            Welcome, {user?.displayName || "Patient"}
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            Continuous physiological telemetry & context-aware baseline monitoring.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Button href="/app/device" variant="secondary" size="sm" icon={<Watch size={15} />}>
            {devices.length > 0 ? `${devices.length} Device Connected` : "Pair Device"}
          </Button>
          <Button href="/app/health" variant="primary" size="sm" icon={<ArrowRight size={15} />}>
            View Health Telemetry
          </Button>
        </div>
      </div>

      {/* Main Status Area */}
      {telemetryState.status === "LOADING" ? (
        <DataStateView status="LOADING" title="Connecting to live sensor stream..." />
      ) : telemetryState.status === "EMPTY" || !live ? (
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-subtle)",
            padding: "var(--space-10) var(--space-6)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <DataStateView
            status="EMPTY"
            title="Waiting for health data"
            description="No active sensor stream detected. Connect your Samadhan device to begin continuous health monitoring."
            actionText="Pair Your Device"
            actionHref="/app/device"
          />
        </div>
      ) : (
        /* Real Telemetry Rendering (ZERO FAKE DATA) */
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {/* Data freshness & risk banner */}
          <div
            style={{
              padding: "12px 18px",
              borderRadius: "var(--radius-md)",
              backgroundColor: telemetryState.status === "STALE" ? "#FFFBEB" : "#F0FDFA",
              border: `1px solid ${telemetryState.status === "STALE" ? "#FDE68A" : "#99F6E4"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: telemetryState.status === "STALE" ? "#B45309" : "#00695C",
                }}
                className="animate-radar"
              />
              <span style={{ fontSize: "0.84rem", fontWeight: 600, color: telemetryState.status === "STALE" ? "#92400E" : "#004D40" }}>
                {telemetryState.status === "STALE" ? "Stream Stale — Awaiting Packet" : "Live Sensor Stream Synchronized"}
              </span>
              <span style={{ fontSize: "0.78rem", color: "#64748B" }}>
                Measured: {new Date(live.timestamp).toLocaleTimeString()}
              </span>
            </div>

            {live.riskLevel && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "0.82rem", color: "#64748B", fontWeight: 550 }}>
                  Current Risk Tier:
                </span>
                <RiskBadge level={live.riskLevel} />
              </div>
            )}
          </div>

          {/* 4 Metric Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--space-4)" }}>
            {/* Heart Rate */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-subtle)",
                padding: "var(--space-6)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748B", fontSize: "0.76rem", marginBottom: "6px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Heart size={15} color="#00695C" />
                  Heart Rate
                </span>
                <span style={{ fontFamily: "var(--font-mono)" }}>PPG Sensor</span>
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 700, color: "#0F172A", fontFamily: "var(--font-mono)" }}>
                {live.heartRate !== undefined ? `${live.heartRate} BPM` : "Not available"}
              </div>
              {live.heartRate !== undefined && <LiveEcgWave height={28} />}
            </div>

            {/* SpO2 */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-subtle)",
                padding: "var(--space-6)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748B", fontSize: "0.76rem", marginBottom: "6px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Wind size={15} color="#0284C7" />
                  Oxygen Saturation
                </span>
                <span style={{ fontFamily: "var(--font-mono)" }}>Optical</span>
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 700, color: "#0F172A", fontFamily: "var(--font-mono)" }}>
                {live.spo2 !== undefined ? `${live.spo2}%` : "Not available"}
              </div>
              <div style={{ fontSize: "0.78rem", color: "#64748B", marginTop: "4px" }}>
                Pulse oximetry stability
              </div>
            </div>

            {/* Ambient Temperature & Humidity (DHT22) */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-subtle)",
                padding: "var(--space-6)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748B", fontSize: "0.76rem", marginBottom: "6px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Thermometer size={15} color="#B45309" />
                  Ambient Temperature
                </span>
                <span style={{ fontFamily: "var(--font-mono)" }}>DHT22</span>
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 700, color: "#0F172A", fontFamily: "var(--font-mono)" }}>
                {live.temperature !== null && live.temperature !== undefined 
                  ? `${live.temperature.toFixed(1)}°C` 
                  : (live.ambientTemp !== undefined ? `${live.ambientTemp.toFixed(1)}°C` : "Not available")}
              </div>
              <div style={{ fontSize: "0.78rem", color: "#64748B", marginTop: "4px" }}>
                Humidity: {live.humidity !== null && live.humidity !== undefined ? `${live.humidity.toFixed(0)}% RH` : "N/A"}
              </div>
            </div>

            {/* Activity State */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-subtle)",
                padding: "var(--space-6)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748B", fontSize: "0.76rem", marginBottom: "6px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Footprints size={15} color="#00695C" />
                  Activity Posture
                </span>
                <span style={{ fontFamily: "var(--font-mono)" }}>6-Axis IMU</span>
              </div>
              <div style={{ fontSize: "1.65rem", fontWeight: 700, color: "#0F172A", lineHeight: 1.3, paddingTop: "4px" }}>
                {live.activityState || "Not available"}
              </div>
              <div style={{ fontSize: "0.78rem", color: "#64748B", marginTop: "4px" }}>
                Signal Quality: {live.signalQuality || "OPTIMAL"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auxiliary Sections: Alerts & Devices Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "var(--space-6)" }}>
        {/* Active Alerts List */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-subtle)",
            padding: "var(--space-6)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Bell size={18} color="#00695C" />
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0F172A" }}>
                Active Alerts & Events
              </h2>
            </div>
            <Link href="/app/alerts" style={{ fontSize: "0.82rem", color: "#00695C", fontWeight: 600 }}>
              View All →
            </Link>
          </div>

          {activeAlerts.length === 0 ? (
            <div style={{ padding: "var(--space-6) 0", textAlign: "center", color: "#64748B", fontSize: "0.9rem" }}>
              No alerts have been generated.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {activeAlerts.slice(0, 3).map((alt) => (
                <div
                  key={alt.id}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "#FEF2F2",
                    border: "1px solid #FECACA",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.86rem", fontWeight: 650, color: "#991B1B" }}>{alt.title}</div>
                    <div style={{ fontSize: "0.78rem", color: "#7F1D1D" }}>{alt.description}</div>
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "#991B1B", fontFamily: "var(--font-mono)" }}>
                    {new Date(alt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Connected Devices Summary */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-subtle)",
            padding: "var(--space-6)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Watch size={18} color="#00695C" />
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0F172A" }}>
                Connected Wearable
              </h2>
            </div>
            <Link href="/app/device" style={{ fontSize: "0.82rem", color: "#00695C", fontWeight: 600 }}>
              Device Settings →
            </Link>
          </div>

          {devices.length === 0 ? (
            <div style={{ padding: "var(--space-6) 0", textAlign: "center" }}>
              <p style={{ color: "#64748B", fontSize: "0.9rem", marginBottom: "var(--space-3)" }}>
                No Samadhan device connected.
              </p>
              <Button href="/app/device" variant="secondary" size="sm">
                Pair Your Device
              </Button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {devices.map((dev) => (
                <div
                  key={dev.id}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "#F8FAFC",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 650, color: "#0F172A" }}>{dev.name}</div>
                    <div style={{ fontSize: "0.76rem", color: "#64748B" }}>
                      Firmware {dev.firmwareVersion} • ID: {dev.id}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "0.74rem",
                      fontWeight: 650,
                      color: dev.connectionState === "CONNECTED" ? "#00695C" : "#94A3B8",
                    }}
                  >
                    {dev.connectionState}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

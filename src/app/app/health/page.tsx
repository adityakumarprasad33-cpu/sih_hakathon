"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { healthService } from "@/services/healthService";
import { DataStateView } from "@/components/ui/DataStateView";
import { TelemetryGraph } from "@/components/telemetry/TelemetryGraph";
import { HealthAiCompanionCard } from "@/components/health/HealthAiCompanionCard";
import type { TelemetryState, HistoryRange, HealthTelemetry } from "@/types/health";
import { 
  Thermometer, 
  Droplets, 
  Activity, 
  Compass, 
  Clock, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Radio,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  RefreshCw,
  Heart,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Wind,
  Zap,
  Info,
  Volume2,
  Bell,
  BellOff
} from "lucide-react";

export default function PatientHealthPage() {
  const { user } = useAuth();
  const [telemetryState, setTelemetryState] = useState<TelemetryState>({
    status: "LOADING",
    data: null,
  });

  const [range, setRange] = useState<HistoryRange>("5m");
  const [historyRecords, setHistoryRecords] = useState<HealthTelemetry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setTelemetryState({ status: "EMPTY", data: null });
      return;
    }
    const unsubscribe = healthService.subscribeToLiveTelemetry(user.uid, (state) => {
      setTelemetryState(state);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  const loadHistory = useCallback(async (r: HistoryRange) => {
    if (!user?.uid) return;
    setHistoryLoading(true);
    const durationMs = r === "1m" ? 60 * 1000 : r === "5m" ? 5 * 60 * 1000 : 30 * 60 * 1000;
    const startTime = Date.now() - durationMs;
    const records = await healthService.getTelemetryHistory(user.uid, startTime, Date.now(), 300);
    setHistoryRecords(records);
    setHistoryLoading(false);
  }, [user?.uid]);

  // Fetch history when range changes
  useEffect(() => {
    loadHistory(range);
  }, [range, loadHistory]);

  // Real-time synchronization: Append incoming live packet to active graph window
  useEffect(() => {
    if (telemetryState.data && telemetryState.data.timestamp) {
      const newPacket = telemetryState.data;
      setHistoryRecords((prev) => {
        if (prev.some((p) => p.timestamp === newPacket.timestamp)) {
          return prev;
        }
        const durationMs = range === "1m" ? 60 * 1000 : range === "5m" ? 5 * 60 * 1000 : 30 * 60 * 1000;
        const cutoff = Date.now() - durationMs;
        const updated = [...prev, newPacket].filter((p) => (p.timestamp || 0) >= cutoff);
        return updated.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      });
    }
  }, [telemetryState.data, range]);

  const { status, data, lastUpdated } = telemetryState;

  // Freshness Badge Helper
  const getFreshnessConfig = (s: string) => {
    switch (s) {
      case "CONNECTED":
      case "LIVE":
        return { label: "LIVE STREAM", bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0", dot: "#10B981" };
      case "STALE":
        return { label: "AWAITING PACKET", bg: "#FFFBEB", text: "#92400E", border: "#FDE68A", dot: "#F59E0B" };
      case "DISCONNECTED":
      case "OFFLINE":
        return { label: "DEVICE OFFLINE", bg: "#F1F5F9", text: "#475569", border: "#CBD5E1", dot: "#94A3B8" };
      case "ERROR":
        return { label: "SENSOR ERROR", bg: "#FEF2F2", text: "#991B1B", border: "#FECACA", dot: "#EF4444" };
      case "LOADING":
        return { label: "CONNECTING...", bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE", dot: "#3B82F6" };
      case "EMPTY":
      default:
        return { label: "NO TELEMETRY", bg: "#F8FAFC", text: "#64748B", border: "#E2E8F0", dot: "#94A3B8" };
    }
  };

  // Physiological Status Badge Helper
  const getPhysioBadgeConfig = (s?: string) => {
    switch (s) {
      case "VALID":
        return { label: "VALID", bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" };
      case "LOW_QUALITY":
        return { label: "LOW QUALITY", bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" };
      case "ERROR":
        return { label: "SENSOR ERROR", bg: "#FEF2F2", text: "#991B1B", border: "#FECACA" };
      case "INVALID":
      default:
        return { label: "INVALID", bg: "#F8FAFC", text: "#64748B", border: "#E2E8F0" };
    }
  };

  // Step 5 Activity Badge Helper
  const getActivityBadgeConfig = (s?: string) => {
    switch (s) {
      case "RESTING":
        return { label: "RESTING", bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" };
      case "LOW_ACTIVITY":
        return { label: "LOW ACTIVITY", bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE" };
      case "ACTIVE":
        return { label: "ACTIVE", bg: "#FFF7ED", text: "#C2410C", border: "#FFEDD5" };
      case "UNKNOWN":
      default:
        return { label: "UNKNOWN", bg: "#F8FAFC", text: "#64748B", border: "#E2E8F0" };
    }
  };

  // Step 5 Data Quality Badge Helper (Telemetry Reliability - NOT health risk)
  const getDataQualityBadgeConfig = (q?: string) => {
    switch (q) {
      case "GOOD":
        return { label: "GOOD QUALITY", bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" };
      case "FAIR":
        return { label: "FAIR QUALITY", bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" };
      case "POOR":
        return { label: "POOR QUALITY", bg: "#FEF2F2", text: "#991B1B", border: "#FECACA" };
      case "ERROR":
      default:
        return { label: "SENSOR ERROR", bg: "#450A0A", text: "#FEF2F2", border: "#7F1D1D" };
    }
  };

  // Step 5 Baseline Status Badge Helper
  const getBaselineBadgeConfig = (b?: string, count?: number) => {
    switch (b) {
      case "BASELINE_READY":
        return { label: "BASELINE READY", bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" };
      case "BASELINE_BUILDING":
        return { label: `BUILDING (${count ?? 0}/20)`, bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE" };
      case "BASELINE_STALE":
        return { label: "BASELINE STALE", bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" };
      case "BASELINE_NOT_READY":
      default:
        return { label: "NOT READY", bg: "#F8FAFC", text: "#64748B", border: "#E2E8F0" };
    }
  };

  // Step 6 Risk State Badge Helper
  const getRiskStateBadgeConfig = (s?: string) => {
    switch (s) {
      case "CRITICAL":
        return { label: "CRITICAL", bg: "#FEF2F2", text: "#991B1B", border: "#FECACA", dot: "#DC2626" };
      case "WARNING":
        return { label: "WARNING", bg: "#FFF7ED", text: "#C2410C", border: "#FFEDD5", dot: "#EA580C" };
      case "WATCH":
        return { label: "WATCH", bg: "#FFFBEB", text: "#92400E", border: "#FDE68A", dot: "#F59E0B" };
      case "NORMAL":
        return { label: "NORMAL", bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0", dot: "#10B981" };
      case "EMERGENCY":
        return { label: "EMERGENCY (RESERVED)", bg: "#450A0A", text: "#FEF2F2", border: "#7F1D1D", dot: "#EF4444" };
      case "INSUFFICIENT_DATA":
      default:
        return { label: "INSUFFICIENT DATA", bg: "#F1F5F9", text: "#475569", border: "#CBD5E1", dot: "#94A3B8" };
    }
  };

  // Step 6 Dominant Risk Badge Helper
  const getDominantRiskBadgeConfig = (d?: string) => {
    switch (d) {
      case "HEAT":
        return { label: "HEAT STRESS", color: "#EA580C", bg: "#FFF7ED", border: "#FFEDD5" };
      case "CARDIOVASCULAR":
        return { label: "CARDIOVASCULAR", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" };
      case "RESPIRATORY":
        return { label: "RESPIRATORY", color: "#0284C7", bg: "#F0F9FF", border: "#BAE6FD" };
      case "FATIGUE":
        return { label: "FATIGUE (PROXY)", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" };
      case "FALL":
        return { label: "FALL (SEPARATE SUBSYSTEM)", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" };
      case "NONE":
      default:
        return { label: "NONE (BALANCED)", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" };
    }
  };

  // Step 7 Fall State Badge Helper
  const getFallStateBadgeConfig = (s?: string) => {
    switch (s) {
      case "FALL_CONFIRMED":
        return { label: "FALL CONFIRMED", bg: "#FEF2F2", text: "#991B1B", border: "#FECACA", dot: "#DC2626", pulse: true };
      case "FALL_SUSPECTED":
        return { label: "FALL SUSPECTED", bg: "#FFF7ED", text: "#C2410C", border: "#FFEDD5", dot: "#EA580C", pulse: true };
      case "POST_IMPACT_MONITORING":
        return { label: "POST-IMPACT MONITORING", bg: "#FFFBEB", text: "#92400E", border: "#FDE68A", dot: "#F59E0B", pulse: false };
      case "IMPACT_CANDIDATE":
        return { label: "IMPACT CANDIDATE", bg: "#FEF3C7", text: "#B45309", border: "#FCD34D", dot: "#D97706", pulse: false };
      case "CANCELLED":
        return { label: "CANCELLED (RECOVERED)", bg: "#F0F9FF", text: "#0369A1", border: "#BAE6FD", dot: "#0284C7", pulse: false };
      case "COOLDOWN":
        return { label: "COOLDOWN", bg: "#F8FAFC", text: "#475569", border: "#E2E8F0", dot: "#64748B", pulse: false };
      case "UNAVAILABLE":
        return { label: "SENSOR UNAVAILABLE", bg: "#F1F5F9", text: "#475569", border: "#CBD5E1", dot: "#94A3B8", pulse: false };
      case "IDLE":
      default:
        return { label: "IDLE (ARMED)", bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0", dot: "#10B981", pulse: false };
    }
  };

  const freshness = getFreshnessConfig(status);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Header Banner */}
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 750, color: "#0F172A" }}>
              Current Health Signals
            </h1>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
                padding: "3px 8px",
                borderRadius: "var(--radius-pill)",
                backgroundColor: "#F1F5F9",
                color: "#00695C",
                border: "1px solid #CCECE6",
              }}
            >
              Source = WOKWI SIMULATION
            </span>
          </div>
          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>
            Live sensor telemetry stream from virtual hardware test bench (ESP32-S3).
          </p>
        </div>

        {/* Global Connection & Freshness Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "var(--radius-pill)",
              backgroundColor: freshness.bg,
              border: `1px solid ${freshness.border}`,
              fontSize: "0.82rem",
              fontWeight: 700,
              color: freshness.text,
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: freshness.dot,
                display: "inline-block",
              }}
            />
            {freshness.label}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {status === "LOADING" ? (
        <DataStateView status="LOADING" title="Connecting to live health telemetry stream..." />
      ) : status === "EMPTY" || !data ? (
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-subtle)",
            padding: "var(--space-12) var(--space-6)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <DataStateView
            status="EMPTY"
            title="Waiting for device telemetry"
            description="No active sensor stream detected. Connect your Samadhan wearable using the Samadhan Mobile App to start streaming continuous physiological telemetry."
            actionText="Manage Devices"
            actionHref="/app/device"
          />
        </div>
      ) : data ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {/* Metadata & Sensor Health Overview Bar */}
          <div
            style={{
              padding: "14px 20px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--border-subtle)",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Cpu size={16} color="#64748B" />
                <span style={{ fontSize: "0.82rem", color: "#475569" }}>
                  Device: <strong style={{ color: "#0F172A", fontFamily: "var(--font-mono)" }}>{data.deviceId || "Samadhan Wearable"}</strong>
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={16} color="#64748B" />
                <span style={{ fontSize: "0.82rem", color: "#475569" }}>
                  Last Updated: <strong style={{ color: "#0F172A" }}>{lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "N/A"}</strong>
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Radio size={16} color="#64748B" />
                <span style={{ fontSize: "0.82rem", color: "#475569" }}>
                  Device State: <strong style={{ color: status === "CONNECTED" ? "#00695C" : status === "STALE" ? "#B45309" : "#64748B" }}>
                    {status === "CONNECTED" ? "ONLINE (STREAMING)" : status === "STALE" ? "STALE" : "OFFLINE"}
                  </strong>
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              {/* MAX30102 PPG Status Badge */}
              <div
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 650,
                  padding: "4px 10px",
                  borderRadius: "var(--radius-pill)",
                  backgroundColor: data.ppgQuality === "GOOD" ? "#ECFDF5" : data.ppgQuality === "FAIR" ? "#FFFBEB" : "#FEF2F2",
                  color: data.ppgQuality === "GOOD" ? "#065F46" : data.ppgQuality === "FAIR" ? "#92400E" : "#991B1B",
                  border: `1px solid ${data.ppgQuality === "GOOD" ? "#A7F3D0" : data.ppgQuality === "FAIR" ? "#FDE68A" : "#FECACA"}`,
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                {data.ppgQuality === "GOOD" ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                MAX30102 PPG: {data.ppgQuality || "UNKNOWN"}
              </div>

              {/* DHT22 Status Badge */}
              <div
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 650,
                  padding: "4px 10px",
                  borderRadius: "var(--radius-pill)",
                  backgroundColor: data.dhtStatus === "VALID" ? "#ECFDF5" : data.dhtStatus === "STALE" ? "#FFFBEB" : "#FEF2F2",
                  color: data.dhtStatus === "VALID" ? "#065F46" : data.dhtStatus === "STALE" ? "#92400E" : "#991B1B",
                  border: `1px solid ${data.dhtStatus === "VALID" ? "#A7F3D0" : data.dhtStatus === "STALE" ? "#FDE68A" : "#FECACA"}`,
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                {data.dhtStatus === "VALID" ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                DHT22: {data.dhtStatus || "UNKNOWN"}
              </div>

              {/* MPU6050 Status Badge */}
              <div
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 650,
                  padding: "4px 10px",
                  borderRadius: "var(--radius-pill)",
                  backgroundColor: data.imuStatus === "VALID" ? "#ECFDF5" : "#FEF2F2",
                  color: data.imuStatus === "VALID" ? "#065F46" : "#991B1B",
                  border: `1px solid ${data.imuStatus === "VALID" ? "#A7F3D0" : "#FECACA"}`,
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                {data.imuStatus === "VALID" ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                MPU6050: {data.imuStatus || "UNKNOWN"}
              </div>
            </div>
          </div>

          {/* SENSOR MEASUREMENTS GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)" }}>
            {/* 1. MAX30102 Heart Rate */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                padding: "var(--space-6)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748B", fontSize: "0.82rem", marginBottom: "8px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Heart size={16} color="#DC2626" /> Heart Rate
                </span>
                <span style={{ fontFamily: "var(--font-mono)" }}>MAX30102 PPG</span>
              </div>
              <div style={{ fontSize: "2.4rem", fontWeight: 700, color: "#0F172A", fontFamily: "var(--font-mono)" }}>
                {data.heartRate !== null && data.heartRate !== undefined && data.hrStatus === "VALID"
                  ? `${data.heartRate.toFixed(1)} BPM`
                  : <span style={{ color: "#94A3B8", fontSize: "1.4rem" }}>N/A</span>}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
                <div style={{ fontSize: "0.8rem", color: "#64748B" }}>
                  Status:{" "}
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "var(--radius-pill)",
                      backgroundColor: getPhysioBadgeConfig(data.hrStatus).bg,
                      color: getPhysioBadgeConfig(data.hrStatus).text,
                      border: `1px solid ${getPhysioBadgeConfig(data.hrStatus).border}`,
                    }}
                  >
                    {getPhysioBadgeConfig(data.hrStatus).label}
                  </span>
                </div>
                <span style={{ fontSize: "0.72rem", color: "#94A3B8" }}>Algorithm estimate</span>
              </div>
            </div>

            {/* 2. MAX30102 SpO2 Estimate */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                padding: "var(--space-6)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748B", fontSize: "0.82rem", marginBottom: "8px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Activity size={16} color="#0284C7" /> SpO2 Estimate
                </span>
                <span style={{ fontFamily: "var(--font-mono)" }}>MAX30102 Ratio</span>
              </div>
              <div style={{ fontSize: "2.4rem", fontWeight: 700, color: "#0F172A", fontFamily: "var(--font-mono)" }}>
                {data.spo2 !== null && data.spo2 !== undefined && data.spo2Status === "VALID"
                  ? `${data.spo2.toFixed(1)} %`
                  : <span style={{ color: "#94A3B8", fontSize: "1.4rem" }}>N/A</span>}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
                <div style={{ fontSize: "0.8rem", color: "#64748B" }}>
                  Status:{" "}
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "var(--radius-pill)",
                      backgroundColor: getPhysioBadgeConfig(data.spo2Status).bg,
                      color: getPhysioBadgeConfig(data.spo2Status).text,
                      border: `1px solid ${getPhysioBadgeConfig(data.spo2Status).border}`,
                    }}
                  >
                    {getPhysioBadgeConfig(data.spo2Status).label}
                  </span>
                </div>
                <span style={{ fontSize: "0.70rem", color: "#94A3B8" }}>Dev estimate — not clinical</span>
              </div>
            </div>

            {/* 3. DHT22 Ambient Temperature */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                padding: "var(--space-6)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748B", fontSize: "0.82rem", marginBottom: "8px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Thermometer size={16} color="#B45309" /> Ambient Temperature
                </span>
                <span style={{ fontFamily: "var(--font-mono)" }}>DHT22</span>
              </div>
              <div style={{ fontSize: "2.4rem", fontWeight: 700, color: "#0F172A", fontFamily: "var(--font-mono)" }}>
                {data.temperature !== null && data.temperature !== undefined
                  ? `${data.temperature.toFixed(2)} °C`
                  : <span style={{ color: "#94A3B8", fontSize: "1.4rem" }}>N/A (Invalid Read)</span>}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
                <div style={{ fontSize: "0.8rem", color: "#64748B" }}>
                  Status: <strong style={{ color: data.dhtStatus === "VALID" ? "#00695C" : "#B45309" }}>{data.dhtStatus}</strong>
                </div>
                <span style={{ fontSize: "0.70rem", color: "#94A3B8" }}>Environmental (not body temp)</span>
              </div>
            </div>

            {/* 4. DHT22 Relative Humidity */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                padding: "var(--space-6)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748B", fontSize: "0.82rem", marginBottom: "8px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Droplets size={16} color="#0284C7" /> Relative Humidity
                </span>
                <span style={{ fontFamily: "var(--font-mono)" }}>DHT22</span>
              </div>
              <div style={{ fontSize: "2.4rem", fontWeight: 700, color: "#0F172A", fontFamily: "var(--font-mono)" }}>
                {data.humidity !== null && data.humidity !== undefined
                  ? `${data.humidity.toFixed(2)} %`
                  : <span style={{ color: "#94A3B8", fontSize: "1.4rem" }}>N/A (Invalid Read)</span>}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#64748B", marginTop: "4px" }}>
                Status: <strong style={{ color: data.dhtStatus === "VALID" ? "#00695C" : "#B45309" }}>{data.dhtStatus}</strong>
              </div>
            </div>

            {/* 5. MPU6050 Total Acceleration Magnitude */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                padding: "var(--space-6)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748B", fontSize: "0.82rem", marginBottom: "8px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Activity size={16} color="#00695C" /> Acceleration Magnitude
                </span>
                <span style={{ fontFamily: "var(--font-mono)" }}>MPU6050 3D Vector</span>
              </div>
              <div style={{ fontSize: "2.4rem", fontWeight: 700, color: "#0F172A", fontFamily: "var(--font-mono)" }}>
                {data.accelMagnitude !== null && data.accelMagnitude !== undefined
                  ? `${data.accelMagnitude.toFixed(3)} g`
                  : <span style={{ color: "#94A3B8", fontSize: "1.4rem" }}>N/A (Comm Error)</span>}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#64748B", marginTop: "4px" }}>
                Formula: √(ax² + ay² + az²) • Earth gravity normalized
              </div>
            </div>
          </div>

          {/* KINEMATICS DETAIL PANELS: ACCEL & GYRO */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            {/* Tri-Axial Acceleration */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                padding: "var(--space-6)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Compass size={17} color="#00695C" />
                  Tri-Axial Acceleration (g)
                </h3>
                <span style={{ fontSize: "0.78rem", color: "#64748B" }}>MPU6050</span>
              </div>

              {data.imuStatus === "VALID" ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                  <div style={{ backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: "0.74rem", fontWeight: 650, color: "#64748B" }}>Accel X</div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0F172A", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                      {data.accelX !== null && data.accelX !== undefined ? `${data.accelX.toFixed(3)} g` : "N/A"}
                    </div>
                  </div>

                  <div style={{ backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: "0.74rem", fontWeight: 650, color: "#64748B" }}>Accel Y</div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0F172A", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                      {data.accelY !== null && data.accelY !== undefined ? `${data.accelY.toFixed(3)} g` : "N/A"}
                    </div>
                  </div>

                  <div style={{ backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: "0.74rem", fontWeight: 650, color: "#64748B" }}>Accel Z</div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0F172A", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                      {data.accelZ !== null && data.accelZ !== undefined ? `${data.accelZ.toFixed(3)} g` : "N/A"}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "16px", backgroundColor: "#FEF2F2", borderRadius: "8px", color: "#991B1B", fontSize: "0.86rem" }}>
                  Sensor communication error. Tri-axial acceleration data unavailable.
                </div>
              )}
            </div>

            {/* Tri-Axial Gyroscope */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                padding: "var(--space-6)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Activity size={17} color="#00695C" />
                  Tri-Axial Angular Velocity (Gyro)
                </h3>
                <span style={{ fontSize: "0.78rem", color: "#64748B" }}>MPU6050</span>
              </div>

              {data.imuStatus === "VALID" ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                  <div style={{ backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: "0.74rem", fontWeight: 650, color: "#64748B" }}>Gyro X</div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0F172A", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                      {data.gyroX !== null && data.gyroX !== undefined ? data.gyroX.toFixed(3) : "N/A"}
                    </div>
                  </div>

                  <div style={{ backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: "0.74rem", fontWeight: 650, color: "#64748B" }}>Gyro Y</div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0F172A", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                      {data.gyroY !== null && data.gyroY !== undefined ? data.gyroY.toFixed(3) : "N/A"}
                    </div>
                  </div>

                  <div style={{ backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: "0.74rem", fontWeight: 650, color: "#64748B" }}>Gyro Z</div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0F172A", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                      {data.gyroZ !== null && data.gyroZ !== undefined ? data.gyroZ.toFixed(3) : "N/A"}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "16px", backgroundColor: "#FEF2F2", borderRadius: "8px", color: "#991B1B", fontSize: "0.86rem" }}>
                  Sensor communication error. Gyroscope data unavailable.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* ---------------------------------------------------- */}
      {/* STEP 5: PERSONAL BASELINE & ACTIVITY CONTEXT         */}
      {/* ---------------------------------------------------- */}
      {data ? (
        <div
          id="baseline-context-panel"
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-subtle)",
            padding: "var(--space-6) var(--space-8)",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-6)",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShieldCheck size={20} color="#00695C" />
                  Development Personalization Baseline & Context
                </h2>
                <span
                  style={{
                    fontSize: "0.70rem",
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: "var(--radius-pill)",
                    backgroundColor: "#F0FDFA",
                    color: "#0F766E",
                    border: "1px solid #CCFBF1",
                  }}
                >
                  STEP 5 CONTEXT LAYER
                </span>
              </div>
              <p style={{ fontSize: "0.82rem", color: "#64748B", maxWidth: "800px" }}>
                Development device baseline computed from resting PPG & IMU telemetry synchronized via the mobile gateway.
                Contextual physiological inputs for future risk analysis — <strong>not a medical risk score or clinical diagnosis</strong>.
              </p>
            </div>

            {/* Baseline Readiness Badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                id="baseline-status-badge"
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  padding: "4px 12px",
                  borderRadius: "var(--radius-pill)",
                  backgroundColor: getBaselineBadgeConfig(data.baselineStatus, data.baselineSampleCount).bg,
                  color: getBaselineBadgeConfig(data.baselineStatus, data.baselineSampleCount).text,
                  border: `1px solid ${getBaselineBadgeConfig(data.baselineStatus, data.baselineSampleCount).border}`,
                }}
              >
                {getBaselineBadgeConfig(data.baselineStatus, data.baselineSampleCount).label}
              </span>
            </div>
          </div>

          {/* Context Overview Bar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "var(--space-4)",
            }}
          >
            {/* 1. Activity Classifier */}
            <div
              id="context-activity-card"
              style={{
                backgroundColor: "#F8FAFC",
                padding: "16px",
                borderRadius: "var(--radius-lg)",
                border: "1px solid #E2E8F0",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 650, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  Activity State
                </span>
                <span
                  id="activity-state-badge"
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "var(--radius-pill)",
                    backgroundColor: getActivityBadgeConfig(data.movementState || data.activityState).bg,
                    color: getActivityBadgeConfig(data.movementState || data.activityState).text,
                    border: `1px solid ${getActivityBadgeConfig(data.movementState || data.activityState).border}`,
                  }}
                >
                  {getActivityBadgeConfig(data.movementState || data.activityState).label}
                </span>
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0F172A" }}>
                {data.movementState || data.activityState || "UNKNOWN"}
              </div>
              <div style={{ fontSize: "0.74rem", color: "#64748B" }}>
                Dynamic Accel: {data.accelMagnitude !== null && data.accelMagnitude !== undefined ? `${Math.abs(data.accelMagnitude - 1.0).toFixed(3)} g` : "N/A"}
                {data.gyroActivity !== undefined && data.gyroActivity !== null ? ` | Gyro: ${data.gyroActivity.toFixed(3)} rad/s` : ""}
              </div>
            </div>

            {/* 2. Overall Data Quality */}
            <div
              id="context-quality-card"
              style={{
                backgroundColor: "#F8FAFC",
                padding: "16px",
                borderRadius: "var(--radius-lg)",
                border: "1px solid #E2E8F0",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 650, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  Data Quality
                </span>
                <span
                  id="data-quality-badge"
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "var(--radius-pill)",
                    backgroundColor: getDataQualityBadgeConfig(data.overallDataQuality).bg,
                    color: getDataQualityBadgeConfig(data.overallDataQuality).text,
                    border: `1px solid ${getDataQualityBadgeConfig(data.overallDataQuality).border}`,
                  }}
                >
                  {getDataQualityBadgeConfig(data.overallDataQuality).label}
                </span>
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0F172A" }}>
                {data.overallDataQuality || "UNKNOWN"}
              </div>
              <div style={{ fontSize: "0.74rem", color: "#64748B" }}>
                Telemetry reliability only — does <em>not</em> represent patient health status
              </div>
            </div>

            {/* 3. Baseline Buffer Sample Accounting */}
            <div
              id="context-accounting-card"
              style={{
                backgroundColor: "#F8FAFC",
                padding: "16px",
                borderRadius: "var(--radius-lg)",
                border: "1px solid #E2E8F0",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 650, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  Baseline Buffer
                </span>
                <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#64748B" }}>
                  Target: 20 Samples
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0F172A" }}>
                  <span id="baseline-accepted-count">{data.baselineSampleCount ?? 0}</span> accepted
                </div>
                <div style={{ fontSize: "0.85rem", color: "#64748B" }}>
                  (<span id="baseline-rejected-count">{data.baselineRejectedCount ?? 0}</span> rejected)
                </div>
              </div>
              <div style={{ fontSize: "0.74rem", color: "#64748B" }}>
                {data.baselineStatus === "BASELINE_READY" 
                  ? "Buffer primed with validated resting samples (robust median)" 
                  : data.baselineStatus === "BASELINE_STALE"
                  ? "Baseline STALE (>60s since last resting sample)"
                  : "Requires RESTING + VALID HR + SpO2 + PPG GOOD"}
              </div>
            </div>
          </div>

          {/* Baseline Deviations Grid (Resting HR & SpO2) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))",
              gap: "20px",
            }}
          >
            {/* Resting HR Baseline & Delta */}
            <div
              id="baseline-hr-card"
              style={{
                backgroundColor: "#FFFFFF",
                padding: "var(--space-5)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 650, color: "#0F172A", fontSize: "0.92rem" }}>
                  <Heart size={16} color="#DC2626" />
                  Resting Heart Rate Baseline
                </div>
                <span style={{ fontSize: "0.74rem", color: "#64748B" }}>30-Sample Circular Buffer</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", textAlign: "center" }}>
                {/* Baseline Value */}
                <div style={{ backgroundColor: "#F8FAFC", padding: "10px 6px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: "0.70rem", fontWeight: 600, color: "#64748B" }}>BASELINE</div>
                  <div id="hr-baseline-value" style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0F172A", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                    {data.heartRateBaseline !== null && data.heartRateBaseline !== undefined
                      ? `${data.heartRateBaseline.toFixed(1)}`
                      : <span style={{ color: "#94A3B8", fontSize: "1rem" }}>N/A</span>}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#64748B" }}>BPM</div>
                </div>

                {/* Current Value */}
                <div style={{ backgroundColor: "#F8FAFC", padding: "10px 6px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: "0.70rem", fontWeight: 600, color: "#64748B" }}>CURRENT</div>
                  <div id="hr-current-value" style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0F172A", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                    {data.heartRate !== null && data.heartRate !== undefined && data.hrStatus === "VALID"
                      ? `${data.heartRate.toFixed(1)}`
                      : <span style={{ color: "#94A3B8", fontSize: "1rem" }}>N/A</span>}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#64748B" }}>BPM</div>
                </div>

                {/* Delta Value */}
                <div style={{ backgroundColor: "#F8FAFC", padding: "10px 6px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: "0.70rem", fontWeight: 600, color: "#64748B" }}>HR DELTA</div>
                  <div
                    id="hr-delta-value"
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      marginTop: "2px",
                      color: data.heartRateDelta === null || data.heartRateDelta === undefined
                        ? "#94A3B8"
                        : data.heartRateDelta > 0
                        ? "#0284C7"
                        : "#0D9488",
                    }}
                  >
                    {data.heartRateDelta !== null && data.heartRateDelta !== undefined && data.baselineStatus === "BASELINE_READY"
                      ? `${data.heartRateDelta > 0 ? "+" : ""}${data.heartRateDelta.toFixed(1)}`
                      : <span style={{ color: "#94A3B8", fontSize: "1rem" }}>N/A</span>}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#64748B" }}>BPM</div>
                </div>
              </div>

              <div style={{ fontSize: "0.72rem", color: "#64748B", marginTop: "10px" }}>
                {data.baselineStatus === "BASELINE_READY"
                  ? "Delta computed against validated resting baseline"
                  : data.baselineStatus === "BASELINE_STALE"
                  ? "Baseline is STALE — deviation calculations suspended"
                  : "Delta disabled until baseline reaches 20 valid samples"}
              </div>
            </div>

            {/* Resting SpO2 Baseline & Delta */}
            <div
              id="baseline-spo2-card"
              style={{
                backgroundColor: "#FFFFFF",
                padding: "var(--space-5)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 650, color: "#0F172A", fontSize: "0.92rem" }}>
                  <Activity size={16} color="#0284C7" />
                  Resting SpO2 Baseline
                </div>
                <span style={{ fontSize: "0.74rem", color: "#64748B" }}>30-Sample Circular Buffer</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", textAlign: "center" }}>
                {/* Baseline Value */}
                <div style={{ backgroundColor: "#F8FAFC", padding: "10px 6px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: "0.70rem", fontWeight: 600, color: "#64748B" }}>BASELINE</div>
                  <div id="spo2-baseline-value" style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0F172A", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                    {data.spo2Baseline !== null && data.spo2Baseline !== undefined
                      ? `${data.spo2Baseline.toFixed(1)}`
                      : <span style={{ color: "#94A3B8", fontSize: "1rem" }}>N/A</span>}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#64748B" }}>%</div>
                </div>

                {/* Current Value */}
                <div style={{ backgroundColor: "#F8FAFC", padding: "10px 6px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: "0.70rem", fontWeight: 600, color: "#64748B" }}>CURRENT</div>
                  <div id="spo2-current-value" style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0F172A", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                    {data.spo2 !== null && data.spo2 !== undefined && data.spo2Status === "VALID"
                      ? `${data.spo2.toFixed(1)}`
                      : <span style={{ color: "#94A3B8", fontSize: "1rem" }}>N/A</span>}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#64748B" }}>%</div>
                </div>

                {/* Delta Value */}
                <div style={{ backgroundColor: "#F8FAFC", padding: "10px 6px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: "0.70rem", fontWeight: 600, color: "#64748B" }}>SpO2 DELTA</div>
                  <div
                    id="spo2-delta-value"
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      marginTop: "2px",
                      color: data.spo2Delta === null || data.spo2Delta === undefined
                        ? "#94A3B8"
                        : data.spo2Delta > 0
                        ? "#0284C7"
                        : "#0D9488",
                    }}
                  >
                    {data.spo2Delta !== null && data.spo2Delta !== undefined && data.baselineStatus === "BASELINE_READY"
                      ? `${data.spo2Delta > 0 ? "+" : ""}${data.spo2Delta.toFixed(1)}`
                      : <span style={{ color: "#94A3B8", fontSize: "1rem" }}>N/A</span>}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#64748B" }}>%</div>
                </div>
              </div>

              <div style={{ fontSize: "0.72rem", color: "#64748B", marginTop: "10px" }}>
                {data.baselineStatus === "BASELINE_READY"
                  ? "SpO2 deviation against development resting baseline"
                  : data.baselineStatus === "BASELINE_STALE"
                  ? "Baseline is STALE — deviation calculations suspended"
                  : "Delta disabled until baseline reaches 20 valid samples"}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* ---------------------------------------------------- */}
      {/* STEP 6: SENSOR-DRIVEN RISK ENGINE (rule-v0.1)        */}
      {/* ---------------------------------------------------- */}
      {data ? (
        <div
          id="risk-engine-panel"
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-subtle)",
            padding: "var(--space-6) var(--space-8)",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-6)",
          }}
        >
          {/* Header & Badges */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShieldAlert size={20} color="#7C3AED" />
                  Sensor-Driven Risk Engine
                </h2>
                <span
                  style={{
                    fontSize: "0.70rem",
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: "var(--radius-pill)",
                    backgroundColor: "#F5F3FF",
                    color: "#6D28D9",
                    border: "1px solid #DDD6FE",
                  }}
                >
                  rule-v0.1 DETERMINISTIC
                </span>
              </div>
              <p style={{ fontSize: "0.84rem", color: "#64748B", margin: 0 }}>
                Transparent multi-sensor rule-based relative risk indicators with quality gating, hysteresis, and rolling trajectory.
              </p>
            </div>

            {/* Top-level Badges: State, Dominant, Quality */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              {(() => {
                const rState = getRiskStateBadgeConfig(data.risk?.state);
                return (
                  <div
                    id="risk-state-badge"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "5px 12px",
                      borderRadius: "var(--radius-pill)",
                      backgroundColor: rState.bg,
                      border: `1px solid ${rState.border}`,
                      fontSize: "0.76rem",
                      fontWeight: 750,
                      color: rState.text,
                    }}
                  >
                    <span
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        backgroundColor: rState.dot,
                        display: "inline-block",
                      }}
                    />
                    STATE: {rState.label}
                  </div>
                );
              })()}

              {(() => {
                const dom = getDominantRiskBadgeConfig(data.risk?.dominantRisk);
                return (
                  <div
                    id="dominant-risk-badge"
                    style={{
                      padding: "5px 12px",
                      borderRadius: "var(--radius-pill)",
                      backgroundColor: dom.bg,
                      border: `1px solid ${dom.border}`,
                      fontSize: "0.76rem",
                      fontWeight: 750,
                      color: dom.color,
                    }}
                  >
                    {dom.label}
                  </div>
                );
              })()}

              <div
                style={{
                  padding: "5px 12px",
                  borderRadius: "var(--radius-pill)",
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  fontSize: "0.76rem",
                  fontWeight: 650,
                  color: "#475569",
                }}
              >
                CONFIDENCE: {data.risk?.confidence !== null && data.risk?.confidence !== undefined ? `${Math.round(data.risk.confidence * 100)}%` : "0%"}
              </div>
            </div>
          </div>

          {/* Development Medical Disclaimer Banner */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              padding: "12px 16px",
              borderRadius: "8px",
              backgroundColor: "#FFFBEB",
              border: "1px solid #FDE68A",
              color: "#92400E",
              fontSize: "0.80rem",
              lineHeight: 1.45,
            }}
          >
            <AlertTriangle size={17} style={{ flexShrink: 0, marginTop: "2px", color: "#D97706" }} />
            <div>
              <strong>DEVELOPMENT HEALTH RISK ESTIMATE DISCLAIMER:</strong> Scores (0.00–1.00) represent algorithmic relative risk indicators for hardware engineering evaluation, <em>NOT calibrated clinical probabilities or medical diagnoses</em>. This system does not diagnose illness, predict diseases, or automate emergency alerts.
            </div>
          </div>

          {/* Top Overview Cards: Overall Risk Score & Trajectory */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
              gap: "16px",
            }}
          >
            {/* Card 1: Overall Risk Score & Gauge */}
            <div
              id="overall-risk-card"
              style={{
                backgroundColor: "#F8FAFC",
                padding: "var(--space-5)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid #E2E8F0",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Multimodal Overall Risk Score
                </span>
                <span style={{ fontSize: "0.72rem", color: "#94A3B8" }}>
                  0.70 × r_max + 0.30 × r_mean
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "12px" }}>
                <div
                  id="overall-risk-score"
                  style={{
                    fontSize: "2.6rem",
                    fontWeight: 800,
                    color: data.risk?.overallRisk !== null && data.risk?.overallRisk !== undefined
                      ? (data.risk.overallRisk >= 0.75 ? "#DC2626" : data.risk.overallRisk >= 0.50 ? "#EA580C" : data.risk.overallRisk >= 0.20 ? "#D97706" : "#059669")
                      : "#94A3B8",
                    fontFamily: "var(--font-mono)",
                    lineHeight: 1,
                  }}
                >
                  {data.risk?.overallRisk !== null && data.risk?.overallRisk !== undefined
                    ? data.risk.overallRisk.toFixed(2)
                    : "N/A"}
                </div>
                <span style={{ fontSize: "0.95rem", color: "#64748B", fontWeight: 600 }}>/ 1.00 relative score</span>
              </div>

              {/* Progress Bar / Scale */}
              <div style={{ height: "8px", backgroundColor: "#E2E8F0", borderRadius: "4px", overflow: "hidden", position: "relative", marginBottom: "8px" }}>
                <div
                  style={{
                    height: "100%",
                    width: data.risk?.overallRisk !== null && data.risk?.overallRisk !== undefined
                      ? `${Math.min(100, Math.max(0, data.risk.overallRisk * 100))}%`
                      : "0%",
                    backgroundColor: data.risk?.overallRisk !== null && data.risk?.overallRisk !== undefined
                      ? (data.risk.overallRisk >= 0.75 ? "#DC2626" : data.risk.overallRisk >= 0.50 ? "#EA580C" : data.risk.overallRisk >= 0.20 ? "#F59E0B" : "#10B981")
                      : "#CBD5E1",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>

              {/* Scale Labels */}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "#94A3B8", fontWeight: 600 }}>
                <span>0.00 NORMAL</span>
                <span>0.20 WATCH</span>
                <span>0.50 WARNING</span>
                <span>0.75 CRITICAL</span>
                <span>1.00</span>
              </div>
            </div>

            {/* Card 2: Trajectory & Persistence Dynamics */}
            <div
              id="risk-trajectory-card"
              style={{
                backgroundColor: "#F8FAFC",
                padding: "var(--space-5)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid #E2E8F0",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Trajectory & Persistence Dynamics
                </span>
                <span style={{ fontSize: "0.72rem", color: "#94A3B8" }}>5-Sample Rolling FIFO</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", textAlign: "center", margin: "8px 0" }}>
                <div style={{ backgroundColor: "#FFFFFF", padding: "10px 6px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: "0.68rem", fontWeight: 650, color: "#64748B" }}>DIRECTION</div>
                  <div
                    id="trajectory-direction"
                    style={{
                      fontSize: "0.92rem",
                      fontWeight: 750,
                      marginTop: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      color: data.risk?.trajectory?.direction === "RISING"
                        ? "#DC2626"
                        : data.risk?.trajectory?.direction === "FALLING"
                        ? "#059669"
                        : "#0284C7",
                    }}
                  >
                    {data.risk?.trajectory?.direction === "RISING" ? (
                      <TrendingUp size={15} />
                    ) : data.risk?.trajectory?.direction === "FALLING" ? (
                      <TrendingDown size={15} />
                    ) : (
                      <Minus size={15} />
                    )}
                    {data.risk?.trajectory?.direction || "STABLE"}
                  </div>
                </div>

                <div style={{ backgroundColor: "#FFFFFF", padding: "10px 6px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: "0.68rem", fontWeight: 650, color: "#64748B" }}>SLOPE (Δ/SAMPLE)</div>
                  <div id="trajectory-slope" style={{ fontSize: "1.05rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "#0F172A", marginTop: "2px" }}>
                    {data.risk?.trajectory?.slope !== null && data.risk?.trajectory?.slope !== undefined
                      ? `${data.risk.trajectory.slope > 0 ? "+" : ""}${data.risk.trajectory.slope.toFixed(4)}`
                      : <span style={{ color: "#94A3B8", fontSize: "0.85rem" }}>N/A</span>}
                  </div>
                </div>

                <div style={{ backgroundColor: "#FFFFFF", padding: "10px 6px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: "0.68rem", fontWeight: 650, color: "#64748B" }}>PERSISTENCE</div>
                  <div id="trajectory-persistence" style={{ fontSize: "1.05rem", fontWeight: 700, fontFamily: "var(--font-mono)", color: "#0F172A", marginTop: "2px" }}>
                    {data.risk?.trajectory?.persistenceSeconds !== undefined
                      ? `${data.risk.trajectory.persistenceSeconds}s`
                      : "0s"}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: "0.72rem", color: "#64748B", marginTop: "4px" }}>
                Hysteresis deadband: 0.05 • Warning requires 2 cycles • Critical requires 3 cycles
              </div>
            </div>
          </div>

          {/* Individual Risk Indicator Cards (5 Dimensions) */}
          <div>
            <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#0F172A", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <BarChart3 size={16} color="#00695C" />
              Individual Risk Dimension Indicators
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "14px",
              }}
            >
              {/* Indicator 1: Environmental Heat Risk */}
              <div
                id="indicator-heat-card"
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: "16px",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--shadow-sm)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 650, color: "#0F172A", fontSize: "0.88rem" }}>
                      <Flame size={16} color="#EA580C" />
                      Heat Stress
                    </div>
                    <span style={{ fontSize: "0.68rem", color: "#64748B" }}>DHT22 + HR</span>
                  </div>

                  <div
                    id="heat-risk-score"
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: 800,
                      fontFamily: "var(--font-mono)",
                      color: data.risk?.heatRisk !== null && data.risk?.heatRisk !== undefined
                        ? (data.risk.heatRisk >= 0.50 ? "#EA580C" : "#0F172A")
                        : "#94A3B8",
                      lineHeight: 1.1,
                      margin: "6px 0",
                    }}
                  >
                    {data.risk?.heatRisk !== null && data.risk?.heatRisk !== undefined
                      ? data.risk.heatRisk.toFixed(2)
                      : <span style={{ fontSize: "1.2rem", color: "#94A3B8" }}>N/A</span>}
                  </div>
                </div>

                <div style={{ fontSize: "0.72rem", color: "#64748B", borderTop: "1px solid #F1F5F9", paddingTop: "8px", marginTop: "8px" }}>
                  {data.baselineStatus === "BASELINE_READY"
                    ? "Personalized baseline HR deviation coupled"
                    : "Non-personalized development heuristic HR coupling"}
                </div>
              </div>

              {/* Indicator 2: Cardiovascular Risk */}
              <div
                id="indicator-cardio-card"
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: "16px",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--shadow-sm)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 650, color: "#0F172A", fontSize: "0.88rem" }}>
                      <Heart size={16} color="#DC2626" />
                      Cardiovascular
                    </div>
                    <span style={{ fontSize: "0.68rem", color: "#64748B" }}>MAX30102</span>
                  </div>

                  <div
                    id="cardio-risk-score"
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: 800,
                      fontFamily: "var(--font-mono)",
                      color: data.risk?.cardiovascularRisk !== null && data.risk?.cardiovascularRisk !== undefined
                        ? (data.risk.cardiovascularRisk >= 0.50 ? "#DC2626" : "#0F172A")
                        : "#94A3B8",
                      lineHeight: 1.1,
                      margin: "6px 0",
                    }}
                  >
                    {data.risk?.cardiovascularRisk !== null && data.risk?.cardiovascularRisk !== undefined
                      ? data.risk.cardiovascularRisk.toFixed(2)
                      : <span style={{ fontSize: "1.2rem", color: "#94A3B8" }}>N/A</span>}
                  </div>
                </div>

                <div style={{ fontSize: "0.72rem", color: "#64748B", borderTop: "1px solid #F1F5F9", paddingTop: "8px", marginTop: "8px" }}>
                  Conditioned on activity: {data.movementState || "RESTING"} (piecewise HR deviation response)
                </div>
              </div>

              {/* Indicator 3: Respiratory Risk */}
              <div
                id="indicator-resp-card"
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: "16px",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--shadow-sm)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 650, color: "#0F172A", fontSize: "0.88rem" }}>
                      <Wind size={16} color="#0284C7" />
                      Respiratory
                    </div>
                    <span style={{ fontSize: "0.68rem", color: "#64748B" }}>PPG GOOD Only</span>
                  </div>

                  <div
                    id="resp-risk-score"
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: 800,
                      fontFamily: "var(--font-mono)",
                      color: data.risk?.respiratoryRisk !== null && data.risk?.respiratoryRisk !== undefined
                        ? (data.risk.respiratoryRisk >= 0.50 ? "#DC2626" : "#0F172A")
                        : "#94A3B8",
                      lineHeight: 1.1,
                      margin: "6px 0",
                    }}
                  >
                    {data.risk?.respiratoryRisk !== null && data.risk?.respiratoryRisk !== undefined
                      ? data.risk.respiratoryRisk.toFixed(2)
                      : <span style={{ fontSize: "1.2rem", color: "#94A3B8" }}>N/A</span>}
                  </div>
                </div>

                <div style={{ fontSize: "0.72rem", color: "#64748B", borderTop: "1px solid #F1F5F9", paddingTop: "8px", marginTop: "8px" }}>
                  {data.ppgQuality === "GOOD"
                    ? "Strict quality gated: SpO2 desaturation + delta"
                    : `Gated to N/A (PPG Quality is ${data.ppgQuality || "UNKNOWN"})`}
                </div>
              </div>

              {/* Indicator 4: Indirect Fatigue Risk Indicator */}
              <div
                id="indicator-fatigue-card"
                style={{
                  backgroundColor: "#FFFFFF",
                  padding: "16px",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--shadow-sm)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 650, color: "#0F172A", fontSize: "0.88rem" }}>
                      <Zap size={16} color="#7C3AED" />
                      Fatigue Proxy
                    </div>
                    <span style={{ fontSize: "0.64rem", padding: "2px 6px", borderRadius: "4px", backgroundColor: "#F5F3FF", color: "#7C3AED", fontWeight: 700 }}>
                      INDIRECT
                    </span>
                  </div>

                  <div
                    id="fatigue-risk-score"
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: 800,
                      fontFamily: "var(--font-mono)",
                      color: data.risk?.fatigueRisk !== null && data.risk?.fatigueRisk !== undefined
                        ? (data.risk.fatigueRisk >= 0.50 ? "#7C3AED" : "#0F172A")
                        : "#94A3B8",
                      lineHeight: 1.1,
                      margin: "6px 0",
                    }}
                  >
                    {data.risk?.fatigueRisk !== null && data.risk?.fatigueRisk !== undefined
                      ? data.risk.fatigueRisk.toFixed(2)
                      : <span style={{ fontSize: "1.2rem", color: "#94A3B8" }}>N/A</span>}
                  </div>
                </div>

                <div style={{ fontSize: "0.70rem", color: "#64748B", borderTop: "1px solid #F1F5F9", paddingTop: "8px", marginTop: "8px" }}>
                  {data.baselineStatus === "BASELINE_READY"
                    ? "Indirect fatigue proxy: sustained exertion + heat"
                    : "Fatigue indicator requires a READY development HR baseline in rule-v0.1"}
                </div>
              </div>

              {/* Indicator 5: Fall Risk (DEFERRED) */}
              <div
                id="indicator-fall-card"
                style={{
                  backgroundColor: "#F8FAFC",
                  padding: "16px",
                  borderRadius: "var(--radius-lg)",
                  border: "1px dashed #CBD5E1",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 650, color: "#64748B", fontSize: "0.88rem" }}>
                      <Activity size={16} color="#94A3B8" />
                      Fall Risk
                    </div>
                    <span style={{ fontSize: "0.64rem", padding: "2px 6px", borderRadius: "4px", backgroundColor: "#F1F5F9", color: "#64748B", fontWeight: 700 }}>
                      DEFERRED
                    </span>
                  </div>

                  <div
                    id="fall-risk-score"
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: 800,
                      fontFamily: "var(--font-mono)",
                      color: "#94A3B8",
                      lineHeight: 1.1,
                      margin: "6px 0",
                    }}
                  >
                    N/A
                  </div>
                </div>

                <div style={{ fontSize: "0.72rem", color: "#64748B", borderTop: "1px solid #E2E8F0", paddingTop: "8px", marginTop: "8px" }}>
                  Deferred to dedicated fall subsystem. Step 6 strictly maintains fallRisk = null.
                </div>
              </div>
            </div>
          </div>

          {/* Contributing Factors Section */}
          <div
            id="risk-contributing-factors"
            style={{
              backgroundColor: "#F8FAFC",
              borderRadius: "var(--radius-lg)",
              padding: "14px 18px",
              border: "1px solid #E2E8F0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <Info size={15} color="#00695C" />
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                Deterministic Contributing Factors (Transparent Rules)
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {data.risk?.contributingFactors && data.risk.contributingFactors.length > 0 ? (
                data.risk.contributingFactors.map((factor, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "#334155" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#00695C", display: "inline-block", flexShrink: 0 }} />
                    <span>{factor}</span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: "0.82rem", color: "#64748B" }}>
                  All physiological signals within normal limits.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* ---------------------------------------------------- */}
      {/* STEP 7: OFFLINE-CAPABLE FALL DETECTION SUBSYSTEM     */}
      {/* ---------------------------------------------------- */}
      {data ? (
        (() => {
          const currentFallState = data.fallState || data.fallEvent?.state || "IDLE";
          const fallBadge = getFallStateBadgeConfig(currentFallState);
          const isConfirmed = currentFallState === "FALL_CONFIRMED";
          const isSuspected = currentFallState === "FALL_SUSPECTED";
          const isMonitoring = currentFallState === "POST_IMPACT_MONITORING" || currentFallState === "IMPACT_CANDIDATE";
          const isCancelled = currentFallState === "CANCELLED";

          const peakG = data.fallEvent?.peakAcceleration ?? data.fallEvent?.evidence?.peakAcceleration;
          const postureDeg = data.fallEvent?.orientationChangeDeg ?? data.fallEvent?.evidence?.orientationChangeDeg;
          const inactivityMs = data.fallEvent?.inactivityDurationMs ?? data.fallEvent?.evidence?.inactivityDurationMs;
          const fallScore = data.risk?.fallRisk ?? data.fallEvent?.confidenceOrScore ?? (isConfirmed ? 0.95 : isSuspected ? 0.75 : 0.00);

          return (
            <div
              id="fall-detection-panel"
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "var(--radius-xl)",
                border: isConfirmed ? "2px solid #EF4444" : "1px solid var(--border-subtle)",
                padding: "var(--space-6) var(--space-8)",
                boxShadow: isConfirmed ? "0 4px 20px rgba(239, 68, 68, 0.15)" : "var(--shadow-sm)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-6)",
                transition: "all 0.3s ease",
              }}
            >
              {/* Header & Badges */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", display: "flex", alignItems: "center", gap: "8px" }}>
                      <ShieldAlert size={20} color={isConfirmed ? "#DC2626" : "#D97706"} />
                      Offline Fall Detection Subsystem
                    </h2>
                    <span
                      style={{
                        fontSize: "0.70rem",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "var(--radius-pill)",
                        backgroundColor: "#FFFBEB",
                        color: "#B45309",
                        border: "1px solid #FCD34D",
                      }}
                    >
                      fall-rule-v0.1 DETERMINISTIC
                    </span>
                    <span
                      style={{
                        fontSize: "0.70rem",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "var(--radius-pill)",
                        backgroundColor: "#ECFDF5",
                        color: "#065F46",
                        border: "1px solid #A7F3D0",
                      }}
                    >
                      100% OFFLINE AUTONOMOUS
                    </span>
                  </div>
                  <p style={{ fontSize: "0.84rem", color: "#64748B", margin: 0 }}>
                    Deterministic MPU6050 multi-stage confirmation pipeline running locally on ESP32-S3 hardware with zero cloud/network dependency.
                  </p>
                </div>

                {/* State Badges */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <div
                    id="fall-state-badge"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "5px 12px",
                      borderRadius: "var(--radius-pill)",
                      backgroundColor: fallBadge.bg,
                      border: `1px solid ${fallBadge.border}`,
                      fontSize: "0.76rem",
                      fontWeight: 750,
                      color: fallBadge.text,
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: fallBadge.dot,
                        display: "inline-block",
                      }}
                    />
                    STATE: {fallBadge.label}
                  </div>

                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: "var(--radius-pill)",
                      backgroundColor: "#F1F5F9",
                      color: "#475569",
                      border: "1px solid #CBD5E1",
                    }}
                  >
                    DEV HEURISTIC ONLY
                  </span>
                </div>
              </div>

              {/* Local Alert Active Banner (FALL_CONFIRMED) */}
              {isConfirmed ? (
                <div
                  id="fall-confirmed-alert-banner"
                  style={{
                    backgroundColor: "#FEF2F2",
                    borderRadius: "var(--radius-lg)",
                    border: "1.5px solid #EF4444",
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "14px",
                  }}
                >
                  <AlertTriangle size={24} color="#DC2626" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#991B1B" }}>
                        LOCAL EMERGENCY ALERT ACTIVE ON WEARABLE HARDWARE
                      </span>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          backgroundColor: "#FEE2E2",
                          color: "#991B1B",
                          border: "1px solid #FCA5A5",
                        }}
                      >
                        BUZZER TOGGLING (250ms) + TFT WARNING
                      </span>
                    </div>
                    <p style={{ fontSize: "0.84rem", color: "#7F1D1D", margin: "6px 0 0 0", lineHeight: 1.45 }}>
                      The wearable confirmed a high-impact fall (&ge; 2.5g) with sustained post-impact immobility (&ge; 2500ms). The hardware acoustic piezo buzzer and ILI9341 display are actively sounding and flashing.
                    </p>
                    <div
                      style={{
                        marginTop: "10px",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #FECACA",
                        fontSize: "0.78rem",
                        color: "#475569",
                      }}
                    >
                      <strong style={{ color: "#991B1B" }}>Display-Only Mirror Notice:</strong> In accordance with safety invariants, alert cancellation can only be initiated on the local physical device button. Remote cancellation via web UI is strictly prohibited.
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Suspected Alert Banner (FALL_SUSPECTED) */}
              {isSuspected ? (
                <div
                  id="fall-suspected-alert-banner"
                  style={{
                    backgroundColor: "#FFFBEB",
                    borderRadius: "var(--radius-lg)",
                    border: "1.5px solid #F59E0B",
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <Clock size={20} color="#D97706" style={{ flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: "0.88rem", fontWeight: 750, color: "#92400E" }}>
                      FALL SUSPECTED — VERIFYING POST-IMPACT IMMOBILITY (STAGE 3)
                    </span>
                    <p style={{ fontSize: "0.80rem", color: "#78350F", margin: "2px 0 0 0" }}>
                      Preliminary inactivity window (&ge; 1000ms) reached. Sustaining verification window (&ge; 2500ms) to distinguish from active recovery movement.
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Pipeline Confirmation Stages */}
              <div>
                <div style={{ fontSize: "0.76rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>
                  Multi-Stage Fall Confirmation Pipeline
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                  {/* Stage 1 */}
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: isConfirmed || isSuspected || isMonitoring ? "#F0FDF4" : "#F8FAFC",
                      border: `1px solid ${isConfirmed || isSuspected || isMonitoring ? "#86EFAC" : "#E2E8F0"}`,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: isConfirmed || isSuspected || isMonitoring ? "#166534" : "#64748B" }}>
                        STAGE 1: IMPACT
                      </span>
                      {isConfirmed || isSuspected || isMonitoring ? (
                        <CheckCircle2 size={14} color="#16A34A" />
                      ) : (
                        <Minus size={14} color="#94A3B8" />
                      )}
                    </div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 650, color: "#0F172A", marginTop: "4px" }}>
                      &ge; 2.50 g Impact
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#64748B", marginTop: "2px" }}>
                      Trigger Candidate (&le; 1200ms)
                    </div>
                  </div>

                  {/* Stage 2 */}
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: isConfirmed || isSuspected || (isMonitoring && currentFallState === "POST_IMPACT_MONITORING") ? "#F0FDF4" : "#F8FAFC",
                      border: `1px solid ${isConfirmed || isSuspected || (isMonitoring && currentFallState === "POST_IMPACT_MONITORING") ? "#86EFAC" : "#E2E8F0"}`,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: isConfirmed || isSuspected || (isMonitoring && currentFallState === "POST_IMPACT_MONITORING") ? "#166534" : "#64748B" }}>
                        STAGE 2: POSTURE
                      </span>
                      {isConfirmed || isSuspected || (isMonitoring && currentFallState === "POST_IMPACT_MONITORING") ? (
                        <CheckCircle2 size={14} color="#16A34A" />
                      ) : (
                        <Minus size={14} color="#94A3B8" />
                      )}
                    </div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 650, color: "#0F172A", marginTop: "4px" }}>
                      &ge; 45.0° Orientation Shift
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#64748B", marginTop: "2px" }}>
                      Gravity Vector Dot Product
                    </div>
                  </div>

                  {/* Stage 3 */}
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: isConfirmed || isSuspected ? "#F0FDF4" : "#F8FAFC",
                      border: `1px solid ${isConfirmed || isSuspected ? "#86EFAC" : "#E2E8F0"}`,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: isConfirmed || isSuspected ? "#166534" : "#64748B" }}>
                        STAGE 3: SUSPECTED
                      </span>
                      {isConfirmed || isSuspected ? (
                        <CheckCircle2 size={14} color="#16A34A" />
                      ) : (
                        <Minus size={14} color="#94A3B8" />
                      )}
                    </div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 650, color: "#0F172A", marginTop: "4px" }}>
                      &ge; 1000 ms Inactivity
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#64748B", marginTop: "2px" }}>
                      Low Motion Dynamic Check
                    </div>
                  </div>

                  {/* Stage 4 */}
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: isConfirmed ? "#FEF2F2" : "#F8FAFC",
                      border: `1px solid ${isConfirmed ? "#FECACA" : "#E2E8F0"}`,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: isConfirmed ? "#991B1B" : "#64748B" }}>
                        STAGE 4: CONFIRMED
                      </span>
                      {isConfirmed ? (
                        <CheckCircle2 size={14} color="#DC2626" />
                      ) : (
                        <Minus size={14} color="#94A3B8" />
                      )}
                    </div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 650, color: isConfirmed ? "#991B1B" : "#0F172A", marginTop: "4px" }}>
                      &ge; 2500 ms Sustained
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#64748B", marginTop: "2px" }}>
                      Triggers Local Alert & Cooldown
                    </div>
                  </div>
                </div>
              </div>

              {/* Evidence & Metrics Cards Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "var(--space-4)" }}>
                {/* Peak Impact Acceleration */}
                <div
                  style={{
                    backgroundColor: "#F8FAFC",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border-subtle)",
                    padding: "var(--space-4)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#64748B" }}>PEAK IMPACT</span>
                    <Activity size={14} color="#D97706" />
                  </div>
                  <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "#0F172A" }}>
                    {typeof peakG === "number" ? `${peakG.toFixed(2)} g` : "--"}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#64748B" }}>
                    Threshold: &ge; 2.50 g (Dev heuristic)
                  </div>
                </div>

                {/* Posture / Orientation Change */}
                <div
                  style={{
                    backgroundColor: "#F8FAFC",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border-subtle)",
                    padding: "var(--space-4)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#64748B" }}>POSTURE CHANGE</span>
                    <Compass size={14} color="#0284C7" />
                  </div>
                  <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "#0F172A" }}>
                    {typeof postureDeg === "number" ? `${postureDeg.toFixed(1)}°` : "--"}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#64748B" }}>
                    Threshold: &ge; 45.0° (Dev heuristic)
                  </div>
                </div>

                {/* Inactivity Duration */}
                <div
                  style={{
                    backgroundColor: "#F8FAFC",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border-subtle)",
                    padding: "var(--space-4)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#64748B" }}>INACTIVITY DURATION</span>
                    <Clock size={14} color="#00695C" />
                  </div>
                  <div style={{ fontSize: "1.45rem", fontWeight: 800, color: "#0F172A" }}>
                    {typeof inactivityMs === "number" ? `${inactivityMs} ms` : "--"}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#64748B" }}>
                    Threshold: &ge; 2500 ms (Dev heuristic)
                  </div>
                </div>

                {/* Fall Risk Score (Exposed Indicator) */}
                <div
                  style={{
                    backgroundColor: "#F8FAFC",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border-subtle)",
                    padding: "var(--space-4)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#64748B" }}>FALL RISK INDICATOR</span>
                    <ShieldCheck size={14} color="#7C3AED" />
                  </div>
                  <div style={{ fontSize: "1.45rem", fontWeight: 800, color: isConfirmed ? "#DC2626" : "#0F172A" }}>
                    {typeof fallScore === "number" ? fallScore.toFixed(2) : "0.00"}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#64748B" }}>
                    Exposed indicator (Excluded from Step 6 fusion)
                  </div>
                </div>
              </div>

              {/* Diagnostic Evidence Details */}
              <div
                style={{
                  backgroundColor: "#F8FAFC",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-subtle)",
                  padding: "14px 18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div style={{ fontSize: "0.76rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Detector Event Diagnostics
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px", fontSize: "0.82rem" }}>
                  <div>
                    <span style={{ color: "#64748B" }}>Event ID: </span>
                    <strong style={{ color: "#0F172A" }}>{data.fallEvent?.id || "None active"}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748B" }}>Acoustic Buzzer: </span>
                    <strong style={{ color: data.fallEvent?.alertActive ? "#DC2626" : "#059669" }}>
                      {data.fallEvent?.alertActive ? "ACTIVE (Toggling 250ms)" : "OFF / SILENT"}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748B" }}>Reason: </span>
                    <strong style={{ color: "#0F172A" }}>
                      {data.fallEvent?.evidence?.confirmationReason || data.fallEvent?.evidence?.cancellationReason || "Monitoring baseline orientation"}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748B" }}>Version: </span>
                    <strong style={{ color: "#0F172A" }}>{data.fallEvent?.detectorVersion || "fall-rule-v0.1"}</strong>
                  </div>
                </div>
              </div>

              {/* Safety Disclaimers */}
              <div
                style={{
                  backgroundColor: "#F1F5F9",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 14px",
                  borderLeft: "3px solid #64748B",
                  fontSize: "0.75rem",
                  color: "#475569",
                  lineHeight: 1.45,
                }}
              >
                <strong>SAFETY & HEURISTIC DISCLAIMER:</strong> All fall detection thresholds (2.50g impact, 45.0° orientation change, 2500ms inactivity window) are <strong>DEVELOPMENT HEURISTICS ONLY</strong> and <strong>NOT CLINICALLY VALIDATED THRESHOLDS</strong>. This subsystem evaluates edge embedded confirmation logic on ESP32-S3 hardware and does not constitute a certified medical diagnosis, clinical alert, or emergency dispatch service.
              </div>
            </div>
          );
        })()
      ) : null}

      {/* ---------------------------------------------------- */}
      {/* SAMADHAN HEALTH AI COMPANION (MODAL DEPLOYMENT)      */}
      {/* ---------------------------------------------------- */}
      <HealthAiCompanionCard telemetry={data} patientUid={user?.uid} />

      {/* ---------------------------------------------------- */}
      {/* HISTORICAL TELEMETRY & REAL-TIME GRAPHS (STEP 3)     */}
      {/* ---------------------------------------------------- */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-subtle)",
          padding: "var(--space-6) var(--space-8)",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-6)",
        }}
      >
        {/* Section Header & Range Selectors */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            borderBottom: "1px solid var(--border-subtle)",
            paddingBottom: "16px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <TrendingUp size={20} color="#00695C" />
              <h2 style={{ fontSize: "1.25rem", fontWeight: 750, color: "#0F172A", margin: 0 }}>
                Historical Telemetry Trends
              </h2>
            </div>
            <p style={{ fontSize: "0.82rem", color: "#64748B", margin: "4px 0 0 0" }}>
              Real telemetry time-series originating from Wokwi virtual hardware (zero synthetic interpolation).
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 650, color: "#64748B" }}>Time Window:</span>
            <div style={{ display: "flex", backgroundColor: "#F1F5F9", padding: "3px", borderRadius: "8px", gap: "4px" }}>
              {(["1m", "5m", "30m"] as HistoryRange[]).map((r) => {
                const isSelected = range === r;
                const label = r === "1m" ? "Last 1 min" : r === "5m" ? "Last 5 mins" : "Last 30 mins";
                return (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    style={{
                      padding: "6px 14px",
                      fontSize: "0.8rem",
                      fontWeight: isSelected ? 700 : 550,
                      color: isSelected ? "#0F172A" : "#64748B",
                      backgroundColor: isSelected ? "#FFFFFF" : "transparent",
                      borderRadius: "6px",
                      border: "none",
                      boxShadow: isSelected ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => loadHistory(range)}
              disabled={historyLoading}
              title="Refresh historical query"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "34px",
                height: "34px",
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
                backgroundColor: "#FFFFFF",
                cursor: historyLoading ? "not-allowed" : "pointer",
                color: "#64748B",
              }}
            >
              <RefreshCw size={15} className={historyLoading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* 6 Real Historical Graphs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {/* Graph 1: Overall Risk Score (0.00 – 1.00) */}
          <TelemetryGraph
            title="Overall Risk Score (0.00 – 1.00)"
            unit=""
            color="#7C3AED"
            decimals={2}
            data={historyRecords.map((r) => ({
              timestamp: r.timestamp,
              value: r.risk?.overallRisk !== undefined && r.risk?.overallRisk !== null ? r.risk.overallRisk : null,
            }))}
            emptyMessage={`No valid risk engine history records found in the last ${range === "1m" ? "minute" : range === "5m" ? "5 minutes" : "30 minutes"}.`}
          />

          {/* Graph 2: Heart Rate (BPM) */}
          <TelemetryGraph
            title="Heart Rate (BPM)"
            unit=" BPM"
            color="#DC2626"
            decimals={1}
            data={historyRecords.map((r) => ({
              timestamp: r.timestamp,
              value: r.heartRate !== undefined ? r.heartRate : null,
            }))}
            emptyMessage={`No valid MAX30102 heart rate records found in the last ${range === "1m" ? "minute" : range === "5m" ? "5 minutes" : "30 minutes"}.`}
          />

          {/* Graph 3: SpO2 Estimate (%) */}
          <TelemetryGraph
            title="SpO2 Estimate (%)"
            unit="%"
            color="#0284C7"
            decimals={1}
            data={historyRecords.map((r) => ({
              timestamp: r.timestamp,
              value: r.spo2 !== undefined ? r.spo2 : null,
            }))}
            emptyMessage={`No valid MAX30102 SpO2 estimate records found in the last ${range === "1m" ? "minute" : range === "5m" ? "5 minutes" : "30 minutes"}.`}
          />

          {/* Graph 4: Ambient Temperature */}
          <TelemetryGraph
            title="Ambient Temperature (°C)"
            unit="°C"
            color="#00695C"
            decimals={1}
            data={historyRecords.map((r) => ({
              timestamp: r.timestamp,
              value: r.temperature !== undefined ? r.temperature : null,
            }))}
            emptyMessage={`No valid DHT22 temperature records found in the last ${range === "1m" ? "minute" : range === "5m" ? "5 minutes" : "30 minutes"}.`}
          />

          {/* Graph 5: Relative Humidity */}
          <TelemetryGraph
            title="Relative Humidity (%)"
            unit="%"
            color="#0284C7"
            decimals={1}
            data={historyRecords.map((r) => ({
              timestamp: r.timestamp,
              value: r.humidity !== undefined ? r.humidity : null,
            }))}
            emptyMessage={`No valid DHT22 humidity records found in the last ${range === "1m" ? "minute" : range === "5m" ? "5 minutes" : "30 minutes"}.`}
          />

          {/* Graph 6: 3D Acceleration Magnitude */}
          <TelemetryGraph
            title="3D Acceleration Magnitude (g)"
            unit="g"
            color="#D97706"
            decimals={3}
            data={historyRecords.map((r) => ({
              timestamp: r.timestamp,
              value: r.accelMagnitude !== undefined ? r.accelMagnitude : null,
            }))}
            emptyMessage={`No valid MPU6050 motion records found in the last ${range === "1m" ? "minute" : range === "5m" ? "5 minutes" : "30 minutes"}.`}
          />
        </div>
      </div>
    </div>
  );
}

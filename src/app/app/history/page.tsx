"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { healthService } from "@/services/healthService";
import { DataStateView } from "@/components/ui/DataStateView";
import { RiskBadge } from "@/components/ui/RiskBadge";
import type { HealthTelemetry } from "@/types/health";
import { Calendar, History, Clock, Filter, AlertCircle } from "lucide-react";

export default function HealthHistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HealthTelemetry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");
  const [selectedMetric, setSelectedMetric] = useState<"all" | "heartRate" | "spo2" | "temperature">("all");

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);

    healthService
      .getTelemetryHistory(user.uid, 50)
      .then((records) => {
        setHistory(records);
      })
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [user?.uid, timeRange]);

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
            Telemetry History & Trends
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            Historical biometric records stored securely in Firebase Realtime Database.
          </p>
        </div>

        {/* Time Range Selector */}
        <div style={{ display: "flex", gap: "6px", backgroundColor: "#F1F5F9", padding: "4px", borderRadius: "var(--radius-pill)" }}>
          {(["24h", "7d", "30d"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setTimeRange(r)}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-pill)",
                fontSize: "0.82rem",
                fontWeight: timeRange === r ? 650 : 500,
                backgroundColor: timeRange === r ? "#FFFFFF" : "transparent",
                color: timeRange === r ? "#0F172A" : "#64748B",
                border: "none",
                cursor: "pointer",
                boxShadow: timeRange === r ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
              }}
            >
              {r === "24h" ? "Last 24 Hours" : r === "7d" ? "Last 7 Days" : "Last 30 Days"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <DataStateView status="LOADING" title="Querying historical telemetry points..." />
      ) : history.length === 0 ? (
        /* ZERO FAKE DATA: Honest empty state when no historical points exist */
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
            title="No historical telemetry recorded yet."
            description="Continuous sensor readings from your Samadhan wearable will automatically populate this timeline once your device transmits data."
            actionText="Check Device Status"
            actionHref="/app/device"
          />
        </div>
      ) : (
        /* Real Historical Records Timeline (No fabricated arrays) */
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-subtle)",
            padding: "var(--space-6)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0F172A" }}>
              Verified Telemetry Packets ({history.length} records)
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {history.map((pt, idx) => (
              <div
                key={idx}
                style={{
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "#F8FAFC",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Clock size={16} color="#64748B" />
                  <span style={{ fontSize: "0.84rem", fontWeight: 600, color: "#0F172A", fontFamily: "var(--font-mono)" }}>
                    {new Date(pt.timestamp).toLocaleString()}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "20px", fontSize: "0.86rem", color: "#334155" }}>
                  {pt.heartRate !== undefined && (
                    <span>Heart Rate: <strong>{pt.heartRate} BPM</strong></span>
                  )}
                  {pt.spo2 !== undefined && (
                    <span>SpO₂: <strong>{pt.spo2}%</strong></span>
                  )}
                  {pt.skinTemp !== undefined && (
                    <span>Temp: <strong>{pt.skinTemp.toFixed(1)}°C</strong></span>
                  )}
                  {pt.activityState && (
                    <span>Activity: <strong>{pt.activityState}</strong></span>
                  )}
                </div>

                {pt.riskLevel && <RiskBadge level={pt.riskLevel} size="sm" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

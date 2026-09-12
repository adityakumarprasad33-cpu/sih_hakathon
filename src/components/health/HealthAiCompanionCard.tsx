"use client";

import React, { useState, useEffect, useCallback } from "react";
import { companionClientService } from "@/services/companionClientService";
import type { SamadhanLlmResponse, LlmUrgency } from "@/types/llm";
import type { HealthTelemetry } from "@/types/health";
import {
  Sparkles,
  RefreshCw,
  Info,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Heart,
  CheckCircle2,
  Activity,
} from "lucide-react";

interface HealthAiCompanionCardProps {
  telemetry: HealthTelemetry | null;
  patientUid?: string;
}

export const HealthAiCompanionCard: React.FC<HealthAiCompanionCardProps> = ({
  telemetry,
  patientUid,
}) => {
  const [response, setResponse] = useState<SamadhanLlmResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<number | null>(null);

  const fetchAiExplanation = useCallback(async () => {
    if (!telemetry || loading) return;
    setLoading(true);
    try {
      const res = await companionClientService.getExplanation({ patientUid });
      setResponse(res);
      setLastRefreshed(Date.now());
    } catch (err) {
      console.warn("Failed to fetch AI explanation:", err);
    } finally {
      setLoading(false);
    }
  }, [telemetry, patientUid, loading]);

  // Initial fetch when telemetry is first ready
  useEffect(() => {
    if (telemetry && !response && !loading) {
      fetchAiExplanation();
    }
  }, [telemetry, response, loading, fetchAiExplanation]);

  const riskState = telemetry?.risk?.state || "INSUFFICIENT_DATA";
  const dominantRisk = telemetry?.risk?.dominantRisk || "NONE";
  const isFallAlert = telemetry?.fallState === "FALL_CONFIRMED";

  const getUrgencyBadge = (u?: LlmUrgency) => {
    switch (u) {
      case "CRITICAL":
        return { bg: "#FEF2F2", text: "#991B1B", border: "#FECACA", label: "URGENCY: CRITICAL" };
      case "WARNING":
        return { bg: "#FFF7ED", text: "#C2410C", border: "#FFEDD5", label: "URGENCY: WARNING" };
      case "WATCH":
        return { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A", label: "URGENCY: WATCH" };
      case "NORMAL":
      default:
        return { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0", label: "URGENCY: NORMAL" };
    }
  };

  return (
    <div
      id="ai-companion-card"
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "var(--radius-xl)",
        border: "1px solid var(--border-subtle)",
        padding: "var(--space-6) var(--space-8)",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-5)",
      }}
    >
      {/* Card Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "#0F172A",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Sparkles size={20} color="#7C3AED" />
              Samadhan Health Companion
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
              NON-DIAGNOSTIC AI EXPLANATION
            </span>
          </div>
          <p style={{ fontSize: "0.84rem", color: "#64748B", margin: 0 }}>
            Contextual interpretation of multi-sensor signals and circadian baseline shifts. Explains structured evidence without replacing deterministic hardware risk decisions.
          </p>
        </div>

        {/* Refresh & Urgency Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {response && (
            <span
              id="ai-urgency-badge"
              style={{
                fontSize: "0.76rem",
                fontWeight: 750,
                padding: "4px 10px",
                borderRadius: "var(--radius-pill)",
                backgroundColor: getUrgencyBadge(response.urgency).bg,
                color: getUrgencyBadge(response.urgency).text,
                border: `1px solid ${getUrgencyBadge(response.urgency).border}`,
              }}
            >
              {getUrgencyBadge(response.urgency).label}
            </span>
          )}

          <button
            id="refresh-ai-companion-btn"
            onClick={fetchAiExplanation}
            disabled={loading || !telemetry}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              color: "#334155",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: loading || !telemetry ? "not-allowed" : "pointer",
            }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>{loading ? "Analyzing..." : "Refresh Explanation"}</span>
          </button>
        </div>
      </div>

      {/* Authoritative State Anchor Banner */}
      <div
        id="authoritative-state-anchor"
        style={{
          padding: "10px 16px",
          borderRadius: "var(--radius-lg)",
          backgroundColor: "#F8FAFC",
          border: "1px solid #E2E8F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
          fontSize: "0.82rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <span style={{ color: "#475569", fontWeight: 600 }}>
            Authoritative Status:
          </span>
          <span
            id="authoritative-risk-state"
            style={{
              fontWeight: 750,
              padding: "2px 8px",
              borderRadius: "4px",
              backgroundColor: riskState === "CRITICAL" ? "#FEF2F2" : riskState === "WARNING" ? "#FFF7ED" : "#ECFDF5",
              color: riskState === "CRITICAL" ? "#991B1B" : riskState === "WARNING" ? "#C2410C" : "#065F46",
            }}
          >
            {riskState} ({dominantRisk})
          </span>
          {isFallAlert && (
            <span
              style={{
                fontWeight: 750,
                padding: "2px 8px",
                borderRadius: "4px",
                backgroundColor: "#FEF2F2",
                color: "#DC2626",
                border: "1px solid #FECACA",
              }}
            >
              FALL ALERT CONFIRMED
            </span>
          )}
        </div>

        <div style={{ fontSize: "0.74rem", color: "#64748B" }}>
          Deterministic Edge Engine v0.1 &bull; {lastRefreshed ? `Updated ${new Date(lastRefreshed).toLocaleTimeString()}` : "Awaiting initial context"}
        </div>
      </div>

      {/* Content Rendering: Loaded vs Fallback vs Loading */}
      {loading && !response ? (
        <div
          style={{
            padding: "24px",
            textAlign: "center",
            color: "#64748B",
            fontSize: "0.86rem",
            backgroundColor: "#F8FAFC",
            borderRadius: "var(--radius-lg)",
            border: "1px dashed #CBD5E1",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
            <RefreshCw size={20} className="animate-spin" color="#7C3AED" />
          </div>
          Analyzing multi-sensor telemetry against personal circadian baseline...
        </div>
      ) : response?.status === "SUCCESS" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Explanation Paragraph */}
          <div
            id="ai-explanation-text"
            style={{
              fontSize: "0.92rem",
              lineHeight: 1.6,
              color: "#1E293B",
              backgroundColor: "#FAF5FF",
              padding: "16px 20px",
              borderRadius: "var(--radius-lg)",
              border: "1px solid #EDE9FE",
            }}
          >
            {response.explanation}
          </div>

          {/* Evidence and Guidance Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {/* Structured Evidence */}
            <div
              id="ai-evidence-box"
              style={{
                backgroundColor: "#F8FAFC",
                padding: "16px",
                borderRadius: "var(--radius-lg)",
                border: "1px solid #E2E8F0",
              }}
            >
              <div
                style={{
                  fontSize: "0.76rem",
                  fontWeight: 700,
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Activity size={14} color="#00695C" />
                Structured Evidence
              </div>
              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "0.84rem", color: "#334155", display: "flex", flexDirection: "column", gap: "6px" }}>
                {telemetry?.temperature !== null && telemetry?.temperature !== undefined && (
                  <li>Ambient Temperature: <strong>{telemetry.temperature.toFixed(1)} &deg;C</strong></li>
                )}
                {telemetry?.humidity !== null && telemetry?.humidity !== undefined && (
                  <li>Relative Humidity: <strong>{telemetry.humidity.toFixed(0)}%</strong></li>
                )}
                {telemetry?.heartRate !== null && telemetry?.heartRate !== undefined && (
                  <li>Heart Rate: <strong>{telemetry.heartRate} BPM</strong> {telemetry.heartRateBaseline ? `(Baseline: ${telemetry.heartRateBaseline} BPM)` : ""}</li>
                )}
                {telemetry?.movementState && (
                  <li>Movement State: <strong>{telemetry.movementState}</strong></li>
                )}
                {telemetry?.risk?.contributingFactors?.map((factor, idx) => (
                  <li key={idx}>{factor}</li>
                ))}
              </ul>
            </div>

            {/* Actionable Guidance */}
            <div
              id="ai-guidance-box"
              style={{
                backgroundColor: "#F8FAFC",
                padding: "16px",
                borderRadius: "var(--radius-lg)",
                border: "1px solid #E2E8F0",
              }}
            >
              <div
                style={{
                  fontSize: "0.76rem",
                  fontWeight: 700,
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <CheckCircle2 size={14} color="#16A34A" />
                Wellness Guidance
              </div>
              {response.guidance && response.guidance.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "0.84rem", color: "#334155", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {response.guidance.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: "0.82rem", color: "#64748B", margin: 0 }}>
                  Maintain normal hydration and follow active monitoring recommendations.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* OFFLINE / FALLBACK VIEW: AI_ASSISTANT_UNAVAILABLE */
        <div
          id="ai-assistant-unavailable-banner"
          style={{
            padding: "16px 20px",
            borderRadius: "var(--radius-lg)",
            backgroundColor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <Info size={18} color="#64748B" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#334155" }}>
              AI_ASSISTANT_UNAVAILABLE
            </div>
            <p style={{ fontSize: "0.80rem", color: "#64748B", margin: "4px 0 0 0", lineHeight: 1.4 }}>
              The Samadhan AI explanatory service is currently offline or unconfigured. <strong>Primary sensor telemetry, resting baselines, live charts, and deterministic hardware risk calculations remain 100% active and authoritative.</strong>
            </p>
          </div>
        </div>
      )}

      {/* Medical Safety Disclaimer */}
      <div
        id="ai-medical-disclaimer"
        style={{
          fontSize: "0.74rem",
          color: "#94A3B8",
          borderTop: "1px solid #F1F5F9",
          paddingTop: "10px",
          lineHeight: 1.4,
        }}
      >
        <strong>Clinical Disclaimer: </strong>
        {response?.disclaimer || "Non-diagnostic clinical explanation generated by AI. Sensor telemetry and risk indicators are algorithmic estimates. Seek professional medical care for health emergencies."}
      </div>
    </div>
  );
};

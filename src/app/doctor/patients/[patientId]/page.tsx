"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { doctorService } from "@/services/doctorService";
import { DataStateView } from "@/components/ui/DataStateView";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { LiveEcgWave } from "@/components/ui/LiveEcgWave";
import { HealthAiCompanionCard } from "@/components/health/HealthAiCompanionCard";
import type { HealthTelemetry } from "@/types/health";
import { Heart, Wind, Thermometer, Footprints, ShieldAlert, ArrowLeft, Clock, Lock } from "lucide-react";

export default function DoctorPatientDetailPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = use(params);
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [telemetry, setTelemetry] = useState<HealthTelemetry | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid || !patientId) return;
    setLoading(true);

    // 1. Enforce strict authorization verification
    doctorService
      .verifyAuthorization(user.uid, patientId)
      .then(async (isAuth) => {
        setAuthorized(isAuth);
        if (!isAuth) {
          setLoading(false);
          return;
        }
        // 2. Fetch live telemetry only if authorized
        try {
          const liveData = await doctorService.getAuthorizedPatientTelemetry(user.uid, patientId);
          setTelemetry(liveData);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Error querying patient stream.");
        } finally {
          setLoading(false);
        }
      })
      .catch(() => {
        setAuthorized(false);
        setLoading(false);
      });
  }, [user?.uid, patientId]);

  if (loading) {
    return <DataStateView status="LOADING" title="Verifying clinical relationship & authorization..." />;
  }

  // SECURITY ENFORCEMENT: Block unauthorized doctor access
  if (!authorized) {
    return (
      <div style={{ padding: "var(--space-12) 0" }}>
        <DataStateView
          status="UNAUTHORIZED"
          title="Access not authorized."
          description={`Patient ID "${patientId}" has not established an active clinical consent agreement with your physician UID. Telemetry records cannot be exposed.`}
          actionText="Return to Patient Roster"
          actionHref="/doctor/patients"
        />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Back button */}
      <div>
        <Link
          href="/doctor/patients"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.86rem",
            color: "#64748B",
            textDecoration: "none",
            marginBottom: "var(--space-2)",
          }}
        >
          <ArrowLeft size={16} /> Back to Patient Roster
        </Link>
      </div>

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
            Patient Clinical Record
          </h1>
          <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", marginTop: "2px", fontFamily: "var(--font-mono)" }}>
            Subject UID: {patientId} • Relationship Verified
          </p>
        </div>

        {telemetry?.riskLevel && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "0.84rem", color: "#64748B", fontWeight: 550 }}>
              Triage Level:
            </span>
            <RiskBadge level={telemetry.riskLevel} />
          </div>
        )}
      </div>

      {/* Telemetry View (Zero Fake Data) */}
      {!telemetry ? (
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
            title="No live health data currently transmitting."
            description="The patient's wearable device is currently disconnected or has not pushed a recent telemetry packet to the database."
          />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--space-4)" }}>
          {/* Heart Rate */}
          <div style={{ backgroundColor: "#FFFFFF", padding: "var(--space-6)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#64748B", fontSize: "0.78rem", marginBottom: "6px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Heart size={15} color="#00695C" /> Pulse Rate</span>
              <span>PPG</span>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "#0F172A", fontFamily: "var(--font-mono)" }}>
              {telemetry.heartRate !== undefined ? `${telemetry.heartRate} BPM` : "Not available"}
            </div>
            {telemetry.heartRate !== undefined && <LiveEcgWave height={28} />}
          </div>

          {/* SpO2 */}
          <div style={{ backgroundColor: "#FFFFFF", padding: "var(--space-6)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#64748B", fontSize: "0.78rem", marginBottom: "6px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Wind size={15} color="#0284C7" /> Oxygen Saturation</span>
              <span>Optical</span>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "#0F172A", fontFamily: "var(--font-mono)" }}>
              {telemetry.spo2 !== undefined ? `${telemetry.spo2}%` : "Not available"}
            </div>
          </div>

          {/* Temperature */}
          <div style={{ backgroundColor: "#FFFFFF", padding: "var(--space-6)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#64748B", fontSize: "0.78rem", marginBottom: "6px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Thermometer size={15} color="#B45309" /> Peripheral Skin Temp</span>
              <span>Thermal</span>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "#0F172A", fontFamily: "var(--font-mono)" }}>
              {telemetry.skinTemp !== undefined ? `${telemetry.skinTemp.toFixed(1)}°C` : "Not available"}
            </div>
          </div>

          {/* Activity State */}
          <div style={{ backgroundColor: "#FFFFFF", padding: "var(--space-6)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#64748B", fontSize: "0.78rem", marginBottom: "6px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><Footprints size={15} color="#00695C" /> Activity Posture</span>
              <span>6-Axis</span>
            </div>
            <div style={{ fontSize: "1.65rem", fontWeight: 700, color: "#0F172A", paddingTop: "4px" }}>
              {telemetry.activityState || "Not available"}
            </div>
          </div>

          {/* Clinical Health AI Explanation (Authorized Patient Context Only) */}
          <div style={{ gridColumn: "1 / -1", marginTop: "var(--space-4)" }}>
            <HealthAiCompanionCard telemetry={telemetry} patientUid={patientId} />
          </div>
        </div>
      )}
    </div>
  );
}

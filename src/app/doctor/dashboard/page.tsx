"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { doctorService } from "@/services/doctorService";
import { DataStateView } from "@/components/ui/DataStateView";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { Button } from "@/components/ui/Button";
import type { DoctorPatientRelationship } from "@/types/doctor";
import { Stethoscope, Users, AlertTriangle, ShieldCheck, ArrowRight, Clock } from "lucide-react";

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<DoctorPatientRelationship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    doctorService
      .getAuthorizedPatients(user.uid)
      .then((roster) => setPatients(roster))
      .catch(() => setPatients([]))
      .finally(() => setLoading(false));
  }, [user?.uid]);

  const escalatedPatients = patients.filter(
    (p) => p.currentRisk === "CRITICAL" || p.currentRisk === "EMERGENCY" || p.currentRisk === "WARNING"
  );

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
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 750, color: "#0F172A" }}>
            Doctor Clinical Overview
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            Oversee authorized patient streams and review escalated multi-signal triage alerts.
          </p>
        </div>

        <Button href="/doctor/patients" variant="primary" size="sm" icon={<Users size={16} />}>
          View Authorized Patients ({patients.length})
        </Button>
      </div>

      {loading ? (
        <DataStateView status="LOADING" title="Querying authorized patient registry..." />
      ) : patients.length === 0 ? (
        /* ZERO FAKE PATIENTS: Honest empty state */
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-subtle)",
            padding: "var(--space-12) var(--space-6)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "480px", margin: "0 auto" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "#EFF6FF",
                border: "1px solid #BFDBFE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto var(--space-4)",
                color: "#1D4ED8",
              }}
            >
              <Users size={28} />
            </div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#0F172A", marginBottom: "var(--space-2)" }}>
              No patients connected yet.
            </h3>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>
              Patients who have granted consent for clinical remote monitoring will appear in your clinical queue once authorized in the database.
            </p>
          </div>
        </div>
      ) : (
        /* Real Authorized Patient Cohort */
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {/* Summary Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "var(--space-4)" }}>
            <div style={{ backgroundColor: "#FFFFFF", padding: "var(--space-6)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.8rem", color: "#64748B", marginBottom: "4px" }}>Authorized Cohort Size</div>
              <div style={{ fontSize: "2rem", fontWeight: 750, color: "#0F172A" }}>{patients.length}</div>
            </div>
            <div style={{ backgroundColor: "#FFFFFF", padding: "var(--space-6)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.8rem", color: "#64748B", marginBottom: "4px" }}>Escalated Risk Alerts</div>
              <div style={{ fontSize: "2rem", fontWeight: 750, color: escalatedPatients.length > 0 ? "#C2410C" : "#00695C" }}>
                {escalatedPatients.length}
              </div>
            </div>
          </div>

          {/* Patient Roster List */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border-subtle)",
              padding: "var(--space-6)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0F172A", marginBottom: "var(--space-4)" }}>
              Consented Patient Registry
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {patients.map((p) => (
                <Link
                  key={p.patientUid}
                  href={`/doctor/patients/${p.patientUid}`}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "#F8FAFC",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    textDecoration: "none",
                    transition: "all var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F1F5F9";
                    e.currentTarget.style.borderColor = "#94A3B8";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#F8FAFC";
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.92rem", fontWeight: 650, color: "#0F172A" }}>{p.patientName}</div>
                    <div style={{ fontSize: "0.76rem", color: "#64748B", fontFamily: "var(--font-mono)" }}>
                      UID: {p.patientUid} • Consent: {p.consentStatus}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {p.currentRisk && <RiskBadge level={p.currentRisk} size="sm" />}
                    <span style={{ fontSize: "0.84rem", color: "#00695C", fontWeight: 600 }}>Review →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

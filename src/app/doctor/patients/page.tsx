"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { doctorService } from "@/services/doctorService";
import { DataStateView } from "@/components/ui/DataStateView";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { Button } from "@/components/ui/Button";
import type { DoctorPatientRelationship, PermissionScope } from "@/types/doctor";
import {
  Search,
  Users,
  UserPlus,
  Clock,
  ShieldCheck,
  AlertCircle,
  X,
  CheckCircle2,
  Mail,
  Activity,
  AlertTriangle,
} from "lucide-react";

export default function DoctorPatientListPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "PENDING">("ACTIVE");
  const [activePatients, setActivePatients] = useState<DoctorPatientRelationship[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<DoctorPatientRelationship[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Invite Modal State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionScope[]>([
    "READ_VITALS",
    "READ_RISK",
    "RECEIVE_ALERTS",
    "READ_TRENDS",
  ]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const [roster, pending] = await Promise.all([
        doctorService.getAuthorizedPatients(user.uid),
        doctorService.getDoctorPendingInvitations(user.uid),
      ]);
      setActivePatients(roster);
      setPendingInvitations(pending);
    } catch {
      setActivePatients([]);
      setPendingInvitations([]);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTogglePermission = (scope: PermissionScope) => {
    setSelectedPermissions((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    setInviteError(null);
    setInviteSuccess(null);

    if (!inviteEmail.trim()) {
      setInviteError("Please enter the patient's registered email address.");
      return;
    }

    if (selectedPermissions.length === 0) {
      setInviteError("Please select at least one clinical permission scope.");
      return;
    }

    setInviteLoading(true);
    try {
      await doctorService.invitePatient({
        doctorUid: user.uid,
        doctorName: user.displayName || "Dr. Physician",
        doctorEmail: user.email || "doctor@samadhanhealth.com",
        patientEmail: inviteEmail.trim(),
        permissions: selectedPermissions,
      });

      setInviteSuccess(`Invitation sent successfully to ${inviteEmail.trim()}.`);
      setInviteEmail("");
      await loadData();
      setTimeout(() => {
        setIsInviteOpen(false);
        setInviteSuccess(null);
        setActiveTab("PENDING");
      }, 1500);
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Failed to dispatch invitation.");
    } finally {
      setInviteLoading(false);
    }
  };

  const filteredPatients = activePatients.filter(
    (p) =>
      p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientUid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPending = pendingInvitations.filter(
    (p) =>
      p.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      {/* Top Header Card */}
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
            Patient Clinical Management
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            Manage remote patient invitations and oversee authorized telemetry access.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {/* Search Bar */}
          <div style={{ position: "relative", minWidth: "240px" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by name, email, or UID..."
              style={{
                width: "100%",
                padding: "8px 12px 8px 34px",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--border-medium)",
                fontSize: "0.86rem",
                outline: "none",
              }}
            />
            <Search
              size={15}
              color="#64748B"
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
            />
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setIsInviteOpen(true);
              setInviteError(null);
              setInviteSuccess(null);
            }}
            icon={<UserPlus size={16} />}
            iconPosition="left"
          >
            Invite Patient
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid var(--border-subtle)",
          paddingBottom: "2px",
        }}
      >
        <button
          onClick={() => setActiveTab("ACTIVE")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 18px",
            fontSize: "0.9rem",
            fontWeight: activeTab === "ACTIVE" ? 700 : 500,
            color: activeTab === "ACTIVE" ? "#00695C" : "var(--text-secondary)",
            borderBottom: activeTab === "ACTIVE" ? "2px solid #00695C" : "2px solid transparent",
            backgroundColor: "transparent",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
            transition: "all var(--transition-fast)",
          }}
        >
          <Users size={16} />
          <span>Authorized Cohort</span>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "var(--radius-pill)",
              fontSize: "0.75rem",
              backgroundColor: activeTab === "ACTIVE" ? "#E0F2F1" : "#F1F5F9",
              color: activeTab === "ACTIVE" ? "#00695C" : "#64748B",
            }}
          >
            {activePatients.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("PENDING")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 18px",
            fontSize: "0.9rem",
            fontWeight: activeTab === "PENDING" ? 700 : 500,
            color: activeTab === "PENDING" ? "#00695C" : "var(--text-secondary)",
            borderBottom: activeTab === "PENDING" ? "2px solid #00695C" : "2px solid transparent",
            backgroundColor: "transparent",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
            transition: "all var(--transition-fast)",
          }}
        >
          <Clock size={16} />
          <span>Pending Invitations</span>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "var(--radius-pill)",
              fontSize: "0.75rem",
              backgroundColor: activeTab === "PENDING" ? "#E0F2F1" : "#F1F5F9",
              color: activeTab === "PENDING" ? "#00695C" : "#64748B",
            }}
          >
            {pendingInvitations.length}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <DataStateView status="LOADING" title="Querying clinical relationship registry..." />
      ) : activeTab === "ACTIVE" ? (
        activePatients.length === 0 ? (
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
              title="No patients connected yet."
              description="When patients approve your remote clinical monitoring invitation, their records and telemetry will appear here."
              actionText="Invite a Patient"
              onAction={() => setIsInviteOpen(true)}
            />
          </div>
        ) : filteredPatients.length === 0 ? (
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border-subtle)",
              padding: "var(--space-8)",
              textAlign: "center",
              color: "#64748B",
              fontSize: "0.9rem",
            }}
          >
            No authorized patient matching &ldquo;{searchQuery}&rdquo; found.
          </div>
        ) : (
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border-subtle)",
              padding: "var(--space-6)",
              boxShadow: "var(--shadow-sm)",
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "0.88rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--border-subtle)",
                    color: "#64748B",
                    fontSize: "0.76rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  <th style={{ padding: "12px 14px" }}>Patient Name</th>
                  <th style={{ padding: "12px 14px" }}>Email / Contact</th>
                  <th style={{ padding: "12px 14px" }}>UID</th>
                  <th style={{ padding: "12px 14px" }}>Status</th>
                  <th style={{ padding: "12px 14px" }}>Authorized Scopes</th>
                  <th style={{ padding: "12px 14px" }}>Connected Since</th>
                  <th style={{ padding: "12px 14px", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p) => (
                  <tr key={p.patientUid} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "14px", fontWeight: 650, color: "#0F172A" }}>
                      {p.patientName}
                    </td>
                    <td style={{ padding: "14px", color: "var(--text-secondary)", fontSize: "0.84rem" }}>
                      {p.patientEmail}
                    </td>
                    <td
                      style={{
                        padding: "14px",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.78rem",
                        color: "#64748B",
                      }}
                    >
                      {p.patientUid}
                    </td>
                    <td style={{ padding: "14px" }}>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "3px 9px",
                          borderRadius: "var(--radius-pill)",
                          backgroundColor: "#F0FDFA",
                          color: "#00695C",
                          border: "1px solid #99F6E4",
                        }}
                      >
                        ACTIVE
                      </span>
                    </td>
                    <td style={{ padding: "14px" }}>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {p.permissions?.map((perm) => (
                          <span
                            key={perm}
                            style={{
                              fontSize: "0.68rem",
                              fontWeight: 600,
                              padding: "2px 6px",
                              borderRadius: "4px",
                              backgroundColor: "#F1F5F9",
                              color: "#475569",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            {perm.replace("READ_", "")}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: "14px", color: "#64748B", fontSize: "0.82rem" }}>
                      {new Date(p.approvedAt || p.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "14px", textAlign: "right" }}>
                      <Link
                        href={`/doctor/patients/${p.patientUid}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "0.84rem",
                          fontWeight: 600,
                          color: "#00695C",
                          textDecoration: "none",
                        }}
                      >
                        Open Telemetry →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* PENDING INVITATIONS TAB */
        pendingInvitations.length === 0 ? (
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
              title="No pending patient invitations."
              description="Invitations you dispatch to patients awaiting consent will be listed here until approved."
              actionText="Invite Patient"
              onAction={() => setIsInviteOpen(true)}
            />
          </div>
        ) : filteredPending.length === 0 ? (
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border-subtle)",
              padding: "var(--space-8)",
              textAlign: "center",
              color: "#64748B",
              fontSize: "0.9rem",
            }}
          >
            No pending invitation matching &ldquo;{searchQuery}&rdquo; found.
          </div>
        ) : (
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border-subtle)",
              padding: "var(--space-6)",
              boxShadow: "var(--shadow-sm)",
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "0.88rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--border-subtle)",
                    color: "#64748B",
                    fontSize: "0.76rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  <th style={{ padding: "12px 14px" }}>Invited Patient</th>
                  <th style={{ padding: "12px 14px" }}>Email</th>
                  <th style={{ padding: "12px 14px" }}>Requested Scopes</th>
                  <th style={{ padding: "12px 14px" }}>Sent Date</th>
                  <th style={{ padding: "12px 14px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPending.map((p) => (
                  <tr key={p.patientUid} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "14px", fontWeight: 650, color: "#0F172A" }}>
                      {p.patientName}
                    </td>
                    <td style={{ padding: "14px", color: "var(--text-secondary)", fontSize: "0.84rem" }}>
                      {p.patientEmail}
                    </td>
                    <td style={{ padding: "14px" }}>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {p.permissions?.map((perm) => (
                          <span
                            key={perm}
                            style={{
                              fontSize: "0.68rem",
                              fontWeight: 600,
                              padding: "2px 6px",
                              borderRadius: "4px",
                              backgroundColor: "#F8FAFC",
                              color: "#64748B",
                              border: "1px solid #E2E8F0",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: "14px", color: "#64748B", fontSize: "0.82rem" }}>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "14px" }}>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "3px 9px",
                          borderRadius: "var(--radius-pill)",
                          backgroundColor: "#FEF3C7",
                          color: "#92400E",
                          border: "1px solid #FDE68A",
                        }}
                      >
                        PENDING PATIENT APPROVAL
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* INVITE PATIENT MODAL */}
      {isInviteOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-modal-title"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-4)",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "520px",
              backgroundColor: "#FFFFFF",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border-subtle)",
              padding: "var(--space-8)",
              boxShadow: "var(--shadow-panel)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-6)",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 id="invite-modal-title" style={{ fontSize: "1.3rem", fontWeight: 750, color: "#0F172A" }}>
                  Invite Patient for Clinical Monitoring
                </h2>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                  Dispatch an invitation. Telemetry access is activated once the patient grants consent.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsInviteOpen(false);
                  setInviteError(null);
                  setInviteSuccess(null);
                }}
                aria-label="Close modal"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748B",
                  padding: "4px",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSendInvite} style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
              {inviteError && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "#FEF2F2",
                    border: "1px solid #FECACA",
                    color: "#B91C1C",
                    fontSize: "0.86rem",
                  }}
                >
                  <AlertCircle size={16} style={{ marginTop: "2px", flexShrink: 0 }} />
                  <span>{inviteError}</span>
                </div>
              )}

              {inviteSuccess && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "#F0FDF4",
                    border: "1px solid #BBF7D0",
                    color: "#15803D",
                    fontSize: "0.86rem",
                  }}
                >
                  <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                  <span>{inviteSuccess}</span>
                </div>
              )}

              {/* Patient Email */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.84rem", fontWeight: 650, color: "#0F172A" }}>
                  Patient Account Email
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="patient@example.com"
                    disabled={inviteLoading}
                    style={{
                      width: "100%",
                      padding: "10px 12px 10px 36px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-medium)",
                      fontSize: "0.9rem",
                      outline: "none",
                    }}
                  />
                  <Mail
                    size={16}
                    color="#94A3B8"
                    style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
                  />
                </div>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Must match the email address of the patient&apos;s registered Samadhan Health account.
                </span>
              </div>

              {/* Permission Scopes */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.84rem", fontWeight: 650, color: "#0F172A" }}>
                  Requested Clinical Permission Scopes
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    {
                      scope: "READ_VITALS" as PermissionScope,
                      title: "Current Vitals (READ_VITALS)",
                      description: "Real-time Pulse Rate, SpO2, and peripheral skin temperature.",
                    },
                    {
                      scope: "READ_RISK" as PermissionScope,
                      title: "Cardiovascular Risk Analysis (READ_RISK)",
                      description: "Triage tier, autonomic cardiac load, and computed risk indicators.",
                    },
                    {
                      scope: "RECEIVE_ALERTS" as PermissionScope,
                      title: "Safety Alerts (RECEIVE_ALERTS)",
                      description: "Escalated critical vital warnings and anomaly notifications.",
                    },
                    {
                      scope: "READ_TRENDS" as PermissionScope,
                      title: "Historical Trends (READ_TRENDS)",
                      description: "Longitudinal multi-signal correlation and trend telemetry.",
                    },
                  ].map((item) => (
                    <label
                      key={item.scope}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        padding: "10px 12px",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: selectedPermissions.includes(item.scope) ? "#F0FDFA" : "#F8FAFC",
                        border: `1px solid ${
                          selectedPermissions.includes(item.scope) ? "#99F6E4" : "var(--border-subtle)"
                        }`,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(item.scope)}
                        onChange={() => handleTogglePermission(item.scope)}
                        style={{ marginTop: "3px", accentColor: "#00695C" }}
                      />
                      <div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#0F172A" }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: "0.76rem", color: "#64748B", marginTop: "1px" }}>
                          {item.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsInviteOpen(false)}
                  disabled={inviteLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={inviteLoading}
                >
                  {inviteLoading ? "Sending Invitation..." : "Send Invitation"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

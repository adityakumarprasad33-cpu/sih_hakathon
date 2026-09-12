"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { doctorService } from "@/services/doctorService";
import type { PatientCareTeamResponse, DoctorPatientRelationship } from "@/types/doctor";
import {
  Users,
  ShieldCheck,
  Bell,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Lock,
  UserCheck,
  UserX,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const { user } = useAuth();

  // Notification Preferences
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [thermalNotifications, setThermalNotifications] = useState(true);
  const [prefSaved, setPrefSaved] = useState(false);

  // Care Team & Invitations State
  const [careTeam, setCareTeam] = useState<PatientCareTeamResponse>({
    pending: [],
    active: [],
    history: [],
  });
  const [careTeamLoading, setCareTeamLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [revokingDoctorUid, setRevokingDoctorUid] = useState<string | null>(null);

  const loadCareTeam = useCallback(async () => {
    if (!user?.uid) return;
    setCareTeamLoading(true);
    try {
      const data = await doctorService.getPatientCareTeam(user.uid);
      setCareTeam(data);
    } catch {
      setCareTeam({ pending: [], active: [], history: [] });
    } finally {
      setCareTeamLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadCareTeam();
  }, [loadCareTeam]);

  // Handle Approve
  const handleApprove = async (doctorUid: string, doctorName: string) => {
    if (!user?.uid) return;
    setActionLoadingId(doctorUid);
    setActionMessage(null);
    try {
      await doctorService.approveInvitation(user.uid, doctorUid);
      setActionMessage({
        type: "success",
        text: `Clinical access granted to ${doctorName}. They can now view your authorized vitals.`,
      });
      await loadCareTeam();
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to approve invitation.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Decline
  const handleDecline = async (doctorUid: string, doctorName: string) => {
    if (!user?.uid) return;
    setActionLoadingId(doctorUid);
    setActionMessage(null);
    try {
      await doctorService.declineInvitation(user.uid, doctorUid);
      setActionMessage({
        type: "success",
        text: `Invitation from ${doctorName} declined.`,
      });
      await loadCareTeam();
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to decline invitation.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Revoke
  const handleRevoke = async (doctorUid: string, doctorName: string) => {
    if (!user?.uid) return;
    setActionLoadingId(doctorUid);
    setActionMessage(null);
    try {
      await doctorService.revokeConsent(user.uid, doctorUid);
      setActionMessage({
        type: "success",
        text: `Clinical access for ${doctorName} has been revoked. They can no longer access your health data.`,
      });
      setRevokingDoctorUid(null);
      await loadCareTeam();
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to revoke consent.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setPrefSaved(true);
    setTimeout(() => setPrefSaved(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", maxWidth: "880px" }}>
      {/* Page Title */}
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 750, color: "#0F172A" }}>
          Account & Clinical Privacy Settings
        </h1>
        <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginTop: "2px" }}>
          Control doctor access consents, review pending clinical invitations, and manage alerts.
        </p>
      </div>

      {/* Action Feedback Banner */}
      {actionMessage && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            backgroundColor: actionMessage.type === "success" ? "#F0FDF4" : "#FEF2F2",
            border: `1px solid ${actionMessage.type === "success" ? "#BBF7D0" : "#FECACA"}`,
            color: actionMessage.type === "success" ? "#15803D" : "#B91C1C",
            fontSize: "0.88rem",
          }}
        >
          {actionMessage.type === "success" ? (
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          ) : (
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* SECTION 1: CARE TEAM & CLINICAL ACCESS */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-subtle)",
          padding: "var(--space-6)",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-6)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Users size={20} color="#00695C" />
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0F172A" }}>
              Clinical Care Team & Remote Doctor Access
            </h2>
            <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", marginTop: "1px" }}>
              Healthcare professionals cannot view your health telemetry unless explicitly authorized by you.
            </p>
          </div>
        </div>

        {careTeamLoading ? (
          <div style={{ padding: "var(--space-8)", textAlign: "center", color: "#64748B", fontSize: "0.88rem" }}>
            Loading care team and clinical access records...
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            {/* SUBSECTION: PENDING INVITATIONS */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "var(--space-3)" }}>
                <Clock size={16} color="#D97706" />
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172A" }}>
                  Pending Clinical Invitations ({careTeam.pending.length})
                </h3>
              </div>

              {careTeam.pending.length === 0 ? (
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "#F8FAFC",
                    border: "1px dashed var(--border-medium)",
                    color: "#64748B",
                    fontSize: "0.86rem",
                  }}
                >
                  No pending doctor invitations. When your physician invites you, their request will appear here for your explicit approval.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {careTeam.pending.map((inv) => (
                    <div
                      key={inv.doctorUid}
                      style={{
                        padding: "16px",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: "#FFFBEB",
                        border: "1px solid #FDE68A",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "14px",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172A" }}>
                          {inv.doctorName}
                        </div>
                        <div style={{ fontSize: "0.82rem", color: "#64748B", marginTop: "2px" }}>
                          {inv.doctorEmail} • Invited {new Date(inv.createdAt).toLocaleDateString()}
                        </div>
                        <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "0.76rem", fontWeight: 600, color: "#92400E" }}>
                            Requested Access:
                          </span>
                          {inv.permissions?.map((p) => (
                            <span
                              key={p}
                              style={{
                                fontSize: "0.72rem",
                                fontWeight: 600,
                                padding: "2px 6px",
                                borderRadius: "4px",
                                backgroundColor: "#FFFFFF",
                                color: "#78350F",
                                border: "1px solid #FCD34D",
                                fontFamily: "var(--font-mono)",
                              }}
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionLoadingId === inv.doctorUid}
                          onClick={() => handleDecline(inv.doctorUid, inv.doctorName)}
                        >
                          Decline
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={actionLoadingId === inv.doctorUid}
                          onClick={() => handleApprove(inv.doctorUid, inv.doctorName)}
                        >
                          {actionLoadingId === inv.doctorUid ? "Updating..." : "Approve Access"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SUBSECTION: ACTIVE CONNECTED DOCTORS */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "var(--space-3)" }}>
                <ShieldCheck size={16} color="#00695C" />
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172A" }}>
                  Authorized Healthcare Professionals ({careTeam.active.length})
                </h3>
              </div>

              {careTeam.active.length === 0 ? (
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "#F8FAFC",
                    border: "1px dashed var(--border-medium)",
                    color: "#64748B",
                    fontSize: "0.86rem",
                  }}
                >
                  No healthcare professionals currently connected. You have not granted clinical monitoring access to any physician.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {careTeam.active.map((doc) => (
                    <div
                      key={doc.doctorUid}
                      style={{
                        padding: "16px",
                        borderRadius: "var(--radius-md)",
                        backgroundColor: "#F0FDFA",
                        border: "1px solid #99F6E4",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "14px",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172A" }}>
                            {doc.doctorName}
                          </span>
                          <span
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              padding: "2px 6px",
                              borderRadius: "var(--radius-pill)",
                              backgroundColor: "#CCFBF1",
                              color: "#0F766E",
                            }}
                          >
                            AUTHORIZED
                          </span>
                        </div>
                        <div style={{ fontSize: "0.82rem", color: "#64748B", marginTop: "2px" }}>
                          {doc.doctorEmail} • Active since{" "}
                          {new Date(doc.approvedAt || doc.createdAt).toLocaleDateString()}
                        </div>
                        <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "0.76rem", fontWeight: 600, color: "#0F766E" }}>
                            Granted Scopes:
                          </span>
                          {doc.permissions?.map((p) => (
                            <span
                              key={p}
                              style={{
                                fontSize: "0.72rem",
                                fontWeight: 600,
                                padding: "2px 6px",
                                borderRadius: "4px",
                                backgroundColor: "#FFFFFF",
                                color: "#00695C",
                                border: "1px solid #99F6E4",
                                fontFamily: "var(--font-mono)",
                              }}
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>

                      {revokingDoctorUid === doc.doctorUid ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "0.8rem", color: "#B91C1C", fontWeight: 600 }}>
                            Confirm revoke?
                          </span>
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={actionLoadingId === doc.doctorUid}
                            onClick={() => handleRevoke(doc.doctorUid, doc.doctorName)}
                            style={{ backgroundColor: "#B91C1C", borderColor: "#B91C1C" }}
                          >
                            Yes, Revoke
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRevokingDoctorUid(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRevokingDoctorUid(doc.doctorUid)}
                          style={{ color: "#B91C1C", borderColor: "#FECACA" }}
                        >
                          Revoke Access
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SUBSECTION: ACCESS AUDIT HISTORY */}
            {careTeam.history.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "var(--space-3)" }}>
                  <History size={16} color="#64748B" />
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172A" }}>
                    Clinical Consent Audit History ({careTeam.history.length})
                  </h3>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {careTeam.history.map((item) => (
                    <div
                      key={item.doctorUid}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "#F8FAFC",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "0.82rem",
                        color: "#64748B",
                      }}
                    >
                      <div>
                        <strong style={{ color: "#0F172A" }}>{item.doctorName}</strong> ({item.doctorEmail})
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: "var(--radius-pill)",
                            backgroundColor: item.status === "REVOKED" ? "#FEE2E2" : "#F1F5F9",
                            color: item.status === "REVOKED" ? "#991B1B" : "#475569",
                          }}
                        >
                          {item.status}
                        </span>
                        <span>
                          {item.revokedAt
                            ? `Revoked on ${new Date(item.revokedAt).toLocaleDateString()}`
                            : item.declinedAt
                            ? `Declined on ${new Date(item.declinedAt).toLocaleDateString()}`
                            : `Updated ${new Date(item.updatedAt).toLocaleDateString()}`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2: NOTIFICATION & DISPATCH RULES */}
      <form onSubmit={handleSavePreferences} style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        <div
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-subtle)",
            padding: "var(--space-6)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "var(--space-2)" }}>
            <Bell size={18} color="#00695C" />
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0F172A" }}>
              Notification & Dispatch Rules
            </h2>
          </div>
          <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)", marginBottom: "var(--space-4)" }}>
            Configure thresholds for vital variance notifications and alerts.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "#F8FAFC",
                cursor: "pointer",
              }}
            >
              <div>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#0F172A" }}>
                  Critical Triage Alert Dispatches
                </div>
                <div style={{ fontSize: "0.78rem", color: "#64748B" }}>
                  Dispatch notifications when calculated risk tier escalates to WARNING or CRITICAL.
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                style={{ width: "18px", height: "18px", accentColor: "#00695C" }}
              />
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "#F8FAFC",
                cursor: "pointer",
              }}
            >
              <div>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#0F172A" }}>
                  Environmental Thermal Load Advisories
                </div>
                <div style={{ fontSize: "0.78rem", color: "#64748B" }}>
                  Alert when ambient heat index exceeds your personal tolerance baseline.
                </div>
              </div>
              <input
                type="checkbox"
                checked={thermalNotifications}
                onChange={(e) => setThermalNotifications(e.target.checked)}
                style={{ width: "18px", height: "18px", accentColor: "#00695C" }}
              />
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Button type="submit" variant="primary" size="md">
            Save Preferences
          </Button>
          {prefSaved && (
            <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.86rem", color: "#00695C" }}>
              <CheckCircle2 size={16} /> Preferences updated.
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

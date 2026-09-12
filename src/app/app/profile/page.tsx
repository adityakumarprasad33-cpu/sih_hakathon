"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, ShieldCheck, Camera, Calendar, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");

  if (!user) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", maxWidth: "800px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 750, color: "#0F172A" }}>
          User Profile
        </h1>
        <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginTop: "2px" }}>
          Your verified account credentials and access permissions stored in Firebase.
        </p>
      </div>

      {/* Main Profile Card */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-subtle)",
          padding: "var(--space-8)",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-6)",
        }}
      >
        {/* Avatar & Core Identity */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-6)", flexWrap: "wrap" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "#E6F4F1",
              border: "2px solid #B2DFDB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#00695C",
              fontSize: "1.8rem",
              fontWeight: 700,
              position: "relative",
            }}
          >
            {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0F172A" }}>
                {user.displayName || "Samadhan Patient"}
              </h2>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 650,
                  padding: "2px 8px",
                  borderRadius: "var(--radius-pill)",
                  backgroundColor: user.role === "doctor" ? "#EFF6FF" : "#F0FDFA",
                  color: user.role === "doctor" ? "#1D4ED8" : "#00695C",
                  border: `1px solid ${user.role === "doctor" ? "#BFDBFE" : "#99F6E4"}`,
                  fontFamily: "var(--font-mono)",
                }}
              >
                ROLE: {user.role.toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: "0.88rem", color: "#64748B", display: "flex", alignItems: "center", gap: "6px" }}>
              <Mail size={14} />
              <span>{user.email}</span>
            </div>
          </div>
        </div>

        {/* Detailed Metadata Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--space-4)",
            borderTop: "1px solid var(--border-subtle)",
            paddingTop: "var(--space-6)",
          }}
        >
          <div style={{ padding: "var(--space-4)", borderRadius: "var(--radius-md)", backgroundColor: "#F8FAFC" }}>
            <span style={{ fontSize: "0.82rem", color: "#64748B", fontWeight: 500, display: "block", marginBottom: "4px" }}>
              Unique Identifier (UID)
            </span>
            <span style={{ fontSize: "0.86rem", fontWeight: 600, color: "#0F172A", fontFamily: "var(--font-mono)", wordBreak: "break-all" }}>
              {user.uid}
            </span>
          </div>

          <div style={{ padding: "var(--space-4)", borderRadius: "var(--radius-md)", backgroundColor: "#F8FAFC" }}>
            <span style={{ fontSize: "0.82rem", color: "#64748B", fontWeight: 500, display: "block", marginBottom: "4px" }}>
              Account Created
            </span>
            <span style={{ fontSize: "0.86rem", fontWeight: 600, color: "#0F172A" }}>
              {new Date(user.createdAt || Date.now()).toLocaleDateString()}
            </span>
          </div>

          {user.doctorStatus && (
            <div style={{ padding: "var(--space-4)", borderRadius: "var(--radius-md)", backgroundColor: "#FFF7ED", border: "1px solid #FED7AA" }}>
              <span style={{ fontSize: "0.82rem", color: "#9A3412", fontWeight: 500, display: "block", marginBottom: "4px" }}>
                Doctor Verification Status
              </span>
              <span style={{ fontSize: "0.86rem", fontWeight: 650, color: "#C2410C" }}>
                {user.doctorStatus}
              </span>
            </div>
          )}

          <div style={{ padding: "var(--space-4)", borderRadius: "var(--radius-md)", backgroundColor: "#F8FAFC" }}>
            <span style={{ fontSize: "0.82rem", color: "#64748B", fontWeight: 500, display: "block", marginBottom: "4px" }}>
              Image Architecture
            </span>
            <span style={{ fontSize: "0.84rem", color: "#475569" }}>
              Cloudinary Asset Proxy • Metadata Synced
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

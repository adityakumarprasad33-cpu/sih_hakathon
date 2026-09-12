"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User, ShieldCheck } from "lucide-react";

export const AppHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const isDoctor = user?.role === "doctor";

  return (
    <header
      style={{
        height: "64px",
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 var(--space-6)",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Official Brand Logo */}
      <Link
        href={isDoctor ? "/doctor/dashboard" : "/app/dashboard"}
        aria-label="Samadhan Health Portal Home"
        style={{
          display: "inline-flex",
          alignItems: "center",
          textDecoration: "none",
        }}
      >
        <Image
          src="/images/logo.png"
          alt="Samadhan Health"
          width={150}
          height={36}
          priority
          style={{
            height: "32px",
            width: "auto",
            objectFit: "contain",
            display: "block",
          }}
        />
      </Link>

      {/* User Info & Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: user.role === "doctor" ? "#EFF6FF" : "#F0FDFA",
                color: user.role === "doctor" ? "#1D4ED8" : "#0F766E",
                border: `1px solid ${user.role === "doctor" ? "#BFDBFE" : "#CCFBF1"}`,
              }}
            >
              {user.role === "doctor" ? "Doctor Account" : "Patient Account"}
            </span>

            <Link
              href="/app/profile"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.86rem",
                fontWeight: 500,
                color: "#334155",
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  backgroundColor: "#F1F5F9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748B",
                }}
              >
                <User size={15} />
              </div>
              <span>{user.displayName || user.email}</span>
            </Link>

            <button
              type="button"
              onClick={() => logout()}
              title="Sign Out"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 12px",
                fontSize: "0.82rem",
                color: "#64748B",
                borderRadius: "6px",
                border: "1px solid var(--border-subtle)",
                backgroundColor: "#FFFFFF",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#B91C1C";
                e.currentTarget.style.borderColor = "#FECACA";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#64748B";
                e.currentTarget.style.borderColor = "var(--border-subtle)";
              }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            style={{
              fontSize: "0.86rem",
              fontWeight: 600,
              color: "#00695C",
            }}
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};

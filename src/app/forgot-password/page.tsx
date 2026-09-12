"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const { isConfigured } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage("Please enter your email address.");
      setStatus("ERROR");
      return;
    }

    setLoading(true);
    setStatus("IDLE");

    try {
      await authService.resetPassword(email);
      setStatus("SUCCESS");
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Unable to process password reset request. Please verify email format."
      );
      setStatus("ERROR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-6)",
      }}
    >
      <div style={{ marginBottom: "var(--space-6)" }}>
        <Link
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.9rem",
            color: "#475569",
            textDecoration: "none",
          }}
        >
          ← Return to Sign In
        </Link>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "#FFFFFF",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-subtle)",
          padding: "var(--space-8)",
          boxShadow: "var(--shadow-panel)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "var(--space-4)" }}>
            <Image
              src="/images/logo.png"
              alt="Samadhan Health"
              width={160}
              height={40}
              priority
              style={{
                height: "36px",
                width: "auto",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>
          <h1 style={{ fontSize: "1.45rem", fontWeight: 700, color: "#0F172A", marginBottom: "4px" }}>
            Password Recovery
          </h1>
          <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)" }}>
            Enter your registered email to receive a password reset link
          </p>
        </div>

        {status === "SUCCESS" ? (
          <div
            style={{
              padding: "var(--space-6)",
              textAlign: "center",
              backgroundColor: "#F0FDFA",
              borderRadius: "var(--radius-md)",
              border: "1px solid #99F6E4",
            }}
          >
            <CheckCircle2 size={36} color="#00695C" style={{ margin: "0 auto var(--space-2)" }} />
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#004D40", marginBottom: "var(--space-2)" }}>
              Reset Link Dispatched
            </h3>
            <p style={{ fontSize: "0.86rem", color: "#00695C", lineHeight: 1.5, marginBottom: "var(--space-4)" }}>
              A password reset link has been dispatched to <strong>{email}</strong> via Firebase Authentication. Please check your inbox.
            </p>
            <Button href="/login" variant="secondary" size="sm">
              Back to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {status === "ERROR" && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "#FEF2F2",
                  border: "1px solid #FECACA",
                  fontSize: "0.84rem",
                  color: "#B91C1C",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#0F172A", marginBottom: "6px" }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 38px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-medium)",
                    fontSize: "0.92rem",
                    backgroundColor: "#FFFFFF",
                    fontFamily: "inherit",
                  }}
                />
                <Mail
                  size={16}
                  color="#64748B"
                  style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading || !isConfigured}
              style={{ width: "100%", justifyContent: "center" }}
              icon={loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            >
              {loading ? "Dispatching..." : "Send Reset Link"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

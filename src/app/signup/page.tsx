"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, User, ShieldAlert, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function SignupPage() {
  const router = useRouter();
  const { register, isConfigured } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"PATIENT" | "DOCTOR">("PATIENT");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password, role);
      router.push("/app/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please verify your information.");
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
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.9rem",
            color: "#475569",
            textDecoration: "none",
          }}
        >
          ← Return to Public Website
        </Link>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: "460px",
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
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0F172A", marginBottom: "4px" }}>
            Create Samadhan Account
          </h1>
          <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)" }}>
            Begin intelligent physiological monitoring
          </p>
        </div>

        {!isConfigured && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "#FFFBEB",
              border: "1px solid #FDE68A",
              fontSize: "0.78rem",
              color: "#B45309",
              lineHeight: 1.5,
              marginBottom: "var(--space-4)",
            }}
          >
            <strong>Notice:</strong> Firebase configuration is currently pending in <code>.env.local</code>. Account initialization requires active credentials.
          </div>
        )}

        {error && (
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
              marginBottom: "var(--space-4)",
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {/* Account Type Selection */}
          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#0F172A", marginBottom: "6px" }}>
              Account Type
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setRole("PATIENT")}
                style={{
                  padding: "10px",
                  borderRadius: "var(--radius-sm)",
                  border: `1px solid ${role === "PATIENT" ? "#00695C" : "var(--border-medium)"}`,
                  backgroundColor: role === "PATIENT" ? "#E6F4F1" : "#FFFFFF",
                  color: role === "PATIENT" ? "#004D40" : "var(--text-secondary)",
                  fontWeight: role === "PATIENT" ? 650 : 500,
                  fontSize: "0.86rem",
                  cursor: "pointer",
                }}
              >
                Patient Account
              </button>
              <button
                type="button"
                onClick={() => setRole("DOCTOR")}
                style={{
                  padding: "10px",
                  borderRadius: "var(--radius-sm)",
                  border: `1px solid ${role === "DOCTOR" ? "#00695C" : "var(--border-medium)"}`,
                  backgroundColor: role === "DOCTOR" ? "#E6F4F1" : "#FFFFFF",
                  color: role === "DOCTOR" ? "#004D40" : "var(--text-secondary)",
                  fontWeight: role === "DOCTOR" ? 650 : 500,
                  fontSize: "0.86rem",
                  cursor: "pointer",
                }}
              >
                Doctor / Clinical
              </button>
            </div>

            {role === "DOCTOR" && (
              <div
                style={{
                  marginTop: "8px",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "#FFF7ED",
                  border: "1px solid #FED7AA",
                  fontSize: "0.76rem",
                  color: "#9A3412",
                  lineHeight: 1.45,
                }}
              >
                <ShieldAlert size={14} style={{ display: "inline", verticalAlign: "text-bottom", marginRight: "4px" }} />
                <strong>Security Protocol: </strong>
                Doctor accounts initialize in pending status and require institutional verification before clinical patient access is granted.
              </div>
            )}
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#0F172A", marginBottom: "6px" }}>
              Full Name
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ananya Patel"
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
              <User
                size={16}
                color="#64748B"
                style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
          </div>

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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#0F172A", marginBottom: "6px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  style={{
                    width: "100%",
                    padding: "10px 10px 10px 34px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-medium)",
                    fontSize: "0.88rem",
                    backgroundColor: "#FFFFFF",
                    fontFamily: "inherit",
                  }}
                />
                <Lock
                  size={15}
                  color="#64748B"
                  style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#0F172A", marginBottom: "6px" }}>
                Confirm
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat pass"
                  style={{
                    width: "100%",
                    padding: "10px 10px 10px 34px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-medium)",
                    fontSize: "0.88rem",
                    backgroundColor: "#FFFFFF",
                    fontFamily: "inherit",
                  }}
                />
                <Lock
                  size={15}
                  color="#64748B"
                  style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}
                />
              </div>
            </div>
          </div>

          <div style={{ paddingTop: "var(--space-2)" }}>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading}
              style={{ width: "100%", justifyContent: "center" }}
              icon={loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </div>
        </form>

        <div
          style={{
            marginTop: "var(--space-6)",
            paddingTop: "var(--space-4)",
            borderTop: "1px solid var(--border-subtle)",
            textAlign: "center",
            fontSize: "0.84rem",
            color: "var(--text-secondary)",
          }}
        >
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#00695C", fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

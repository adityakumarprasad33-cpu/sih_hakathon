"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/app/dashboard";

  const { login, isConfigured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      router.push(redirectPath);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
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
          Sign In to Samadhan Health
        </h1>
        <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)" }}>
          Access your personal health intelligence portal
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
          <strong>Notice:</strong> Firebase configuration is currently pending in <code>.env.local</code>. Authentication requests require active backend credentials.
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

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#0F172A" }}>
              Password
            </label>
            <Link
              href="/forgot-password"
              style={{ fontSize: "0.78rem", color: "#00695C", textDecoration: "none" }}
            >
              Forgot Password?
            </Link>
          </div>
          <div style={{ position: "relative" }}>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
            <Lock
              size={16}
              color="#64748B"
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
            />
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
            {loading ? "Authenticating..." : "Sign In"}
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
        Don&apos;t have an account?{" "}
        <Link href="/signup" style={{ color: "#00695C", fontWeight: 600 }}>
          Create Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
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

      <Suspense fallback={<Loader2 size={24} className="animate-spin" color="#00695C" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

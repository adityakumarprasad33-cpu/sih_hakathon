import React from "react";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Navbar } from "@/components/Navbar";
import { ShieldCheck, Lock, EyeOff, FileText } from "lucide-react";

export const metadata = {
  title: "Privacy Protocol | Samadhan Health",
  description: "Samadhan Health privacy standards, encrypted telemetry architecture, and consent management protocol.",
};

export default function PrivacyPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#FFFFFF" }}>
      <AnnouncementBar />
      <Navbar />

      <main style={{ flex: 1, padding: "var(--space-16) 0 var(--space-20)" }}>
        <div className="container" style={{ maxWidth: "840px" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#0F172A", marginBottom: "var(--space-4)" }}>
            Samadhan Privacy Protocol
          </h1>
          <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "var(--space-8)" }}>
            Your physiological data belongs exclusively to you. The Samadhan architecture is engineered so that telemetry cannot be accessed by third parties or clinicians without explicit, revocable patient consent.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", color: "#334155", lineHeight: 1.7, fontSize: "0.95rem" }}>
            <section style={{ padding: "var(--space-6)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", backgroundColor: "#F8FAFC" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
                1. End-to-End Encrypted Telemetry
              </h2>
              <p>
                All physiological signals captured by the Samadhan Edge device are encrypted prior to transmission. Realtime Database nodes enforce cryptographic access rules tied directly to your authenticated UID.
              </p>
            </section>

            <section style={{ padding: "var(--space-6)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", backgroundColor: "#F8FAFC" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
                2. Explicit Clinical Consent
              </h2>
              <p>
                A verified medical doctor cannot query or view your telemetry stream unless an active doctor-patient relationship record with <code>consentStatus: &quot;GRANTED&quot;</code> exists. You can revoke access at any time through your settings portal.
              </p>
            </section>

            <section style={{ padding: "var(--space-6)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", backgroundColor: "#F8FAFC" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
                3. Zero Third-Party Telemetry Monetization
              </h2>
              <p>
                Samadhan Health does not sell, broker, or license personal biometric records to advertising networks or third-party insurers.
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer style={{ borderTop: "1px solid var(--border-subtle)", padding: "var(--space-8) 0", backgroundColor: "#FFFFFF" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
          <span>© {new Date().getFullYear()} Samadhan Health Technologies</span>
          <div style={{ display: "flex", gap: "20px" }}>
            <a href="/terms">Terms of Service</a>
            <a href="/contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

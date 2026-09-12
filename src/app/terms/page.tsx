import React from "react";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Navbar } from "@/components/Navbar";
import { AlertCircle } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Samadhan Health",
  description: "Terms of Service and legal compliance guidelines for Samadhan Health.",
};

export default function TermsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#FFFFFF" }}>
      <AnnouncementBar />
      <Navbar />

      <main style={{ flex: 1, padding: "var(--space-16) 0 var(--space-20)" }}>
        <div className="container" style={{ maxWidth: "840px" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#0F172A", marginBottom: "var(--space-4)" }}>
            Terms of Service
          </h1>

          <div
            style={{
              padding: "16px 20px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "#FFFBEB",
              border: "1px solid #FDE68A",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              marginBottom: "var(--space-8)",
            }}
          >
            <AlertCircle size={20} color="#B45309" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div style={{ fontSize: "0.88rem", color: "#92400E", lineHeight: 1.55 }}>
              <strong>Critical Clinical Disclaimer: </strong>
              Samadhan Health is an assistive physiological intelligence platform. It does not provide medical diagnoses, replace certified physicians, or guarantee emergency detection. In any urgent medical situation, contact emergency medical services immediately.
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", color: "#334155", lineHeight: 1.7, fontSize: "0.95rem" }}>
            <section>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
                1. Scope of Services
              </h2>
              <p>
                Samadhan Health provides hardware sensing tools, web software, and AI-assisted summaries to assist individuals in observing longitudinal vital patterns. No content on this platform constitutes formal clinical advice.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
                2. User Account Integrity
              </h2>
              <p>
                Users are responsible for safeguarding their login credentials. Any unauthorized credential sharing or attempted role escalation is prohibited.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
                3. Device Operation & Telemetry
              </h2>
              <p>
                Wearable sensor readings depend on proper skin placement, contact pressure, battery levels, and wireless connectivity. Inaccurate placement may result in signal degradation or missing telemetry packets.
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer style={{ borderTop: "1px solid var(--border-subtle)", padding: "var(--space-8) 0", backgroundColor: "#FFFFFF" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
          <span>© {new Date().getFullYear()} Samadhan Health Technologies</span>
          <div style={{ display: "flex", gap: "20px" }}>
            <a href="/privacy">Privacy Protocol</a>
            <a href="/contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React from "react";
import Image from "next/image";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Navbar } from "@/components/Navbar";
import { Watch, Smartphone, Stethoscope, Bot, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Products | Samadhan Health Ecosystem",
  description: "The Samadhan Health product suite: hardware sensor band, patient mobile application, clinical doctor platform, and AI companion.",
};

export default function ProductsPage() {
  const products = [
    {
      name: "Samadhan Health Wearable Sensor Band",
      status: "DEVELOPMENT PROTOTYPE",
      category: "Hardware Sensing",
      icon: <Watch size={24} color="#00695C" />,
      image: "/images/wearable-white-band.jpg",
      purpose: "Continuous physical acquisition of photoplethysmography (PPG), peripheral skin temperature, and motion dynamics.",
      capabilities: [
        "Multi-wavelength optical sensor module",
        "Peripheral thermal probe with 0.1°C resolution",
        "6-axis inertial measurement unit for activity gating",
        "Low-energy Bluetooth / WiFi telemetry transmission",
      ],
      relationship: "Serves as the physical telemetry source transmitting raw physiological data packets to the edge pipeline.",
    },
    {
      name: "Samadhan Patient Mobile App",
      status: "INTERNAL ALPHA",
      category: "Patient Interface",
      icon: <Smartphone size={24} color="#0284C7" />,
      image: "/images/samadhan-mobile-concept.jpg",
      purpose: "Provides individuals with transparent visibility into personal health trends, circadian patterns, and alert history.",
      capabilities: [
        "Real-time synchronized vital telemetry view",
        "Longitudinal baseline trends and anomaly flagging",
        "Granular doctor-sharing consent management",
        "Encrypted local data caching",
      ],
      relationship: "The primary consumer touchpoint for monitoring physiological baselines and granting clinician access.",
    },
    {
      name: "Samadhan Doctor Clinical Platform",
      status: "STAGE 2 ARCHITECTURE",
      category: "Clinical Software",
      icon: <Stethoscope size={24} color="#0F766E" />,
      image: null,
      purpose: "A dedicated web portal for verified physicians to oversee consented patient cohorts and review risk escalations.",
      capabilities: [
        "Consent-verified patient roster access",
        "Multi-signal comparative timeline views",
        "Standardized risk triage status (NORMAL to EMERGENCY)",
        "Audit trail logging for patient privacy compliance",
      ],
      relationship: "Receives escalated risk signals and enables doctors to review longitudinal context before consultation.",
    },
    {
      name: "Samadhan AI Companion",
      status: "DEVELOPMENT INTEGRATION",
      category: "Intelligent Assistant",
      icon: <Bot size={24} color="#7C3AED" />,
      image: null,
      purpose: "Contextual assistant that translates raw multi-sensor telemetry shifts into accessible explanations for patients.",
      capabilities: [
        "Multi-sensor context fusion (Cardiovascular + Thermal + Movement)",
        "Non-diagnostic behavioral and recovery tips",
        "Structured explanation of risk score rationale",
      ],
      relationship: "Interprets backend risk engine outputs without overriding physiological algorithms.",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#FFFFFF" }}>
      <AnnouncementBar />
      <Navbar />

      <main style={{ flex: 1 }}>
        <section
          style={{
            padding: "var(--space-16) 0 var(--space-12)",
            backgroundColor: "#F8FAFC",
            borderBottom: "1px solid var(--border-subtle)",
            textAlign: "center",
          }}
        >
          <div className="container">
            <h1
              style={{
                fontSize: "clamp(2.4rem, 4.5vw, 3.6rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
                maxWidth: "22ch",
                margin: "0 auto var(--space-4)",
              }}
            >
              The Samadhan Product Ecosystem
            </h1>
            <p
              style={{
                fontSize: "1.12rem",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                maxWidth: "60ch",
                margin: "0 auto",
              }}
            >
              Hardware sensing, mobile interfaces, clinical oversight, and contextual AI working together as a unified healthcare technology platform.
            </p>
          </div>
        </section>

        {/* Product Cards */}
        <section style={{ padding: "var(--space-16) 0 var(--space-20)" }}>
          <div className="container">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-12)" }}>
              {products.map((prod) => (
                <div
                  key={prod.name}
                  style={{
                    padding: "var(--space-8)",
                    borderRadius: "var(--radius-xl)",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "var(--shadow-sm)",
                    display: "grid",
                    gridTemplateColumns: prod.image ? "1.2fr 1fr" : "1fr",
                    gap: "var(--space-8)",
                    alignItems: "center",
                  }}
                  className="product-card"
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "var(--space-2)" }}>
                      {prod.icon}
                      <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#0F172A" }}>
                        {prod.name}
                      </h2>
                    </div>

                    <div style={{ fontSize: "0.82rem", color: "#64748B", marginBottom: "var(--space-3)" }}>
                      Status: <strong style={{ color: "#0F172A" }}>{prod.status}</strong>
                    </div>

                    <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "0.98rem", marginBottom: "var(--space-4)" }}>
                      {prod.purpose}
                    </p>

                    <div style={{ marginBottom: "var(--space-6)" }}>
                      <h3 style={{ fontSize: "0.95rem", fontWeight: 650, color: "#334155", marginBottom: "8px" }}>
                        Core Capabilities
                      </h3>
                      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "6px" }}>
                        {prod.capabilities.map((cap) => (
                          <li key={cap} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", color: "#0F172A" }}>
                            <CheckCircle2 size={16} color="#00695C" />
                            <span>{cap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "#F8FAFC",
                        border: "1px solid var(--border-subtle)",
                        fontSize: "0.84rem",
                        color: "#475569",
                      }}
                    >
                      <strong style={{ color: "#0F172A" }}>System Role: </strong>
                      {prod.relationship}
                    </div>
                  </div>

                  {prod.image && (
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "280px",
                        borderRadius: "var(--radius-lg)",
                        overflow: "hidden",
                        border: "1px solid var(--border-subtle)",
                        backgroundColor: "#F8FAFC",
                      }}
                    >
                      <Image
                        src={prod.image}
                        alt={prod.name}
                        fill
                        sizes="(max-width: 860px) 100vw, 480px"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: "1px solid var(--border-subtle)", padding: "var(--space-8) 0", backgroundColor: "#FFFFFF" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
          <span>© {new Date().getFullYear()} Samadhan Health Technologies</span>
          <div style={{ display: "flex", gap: "20px" }}>
            <a href="/privacy">Privacy Protocol</a>
            <a href="/terms">Terms of Service</a>
            <a href="/contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

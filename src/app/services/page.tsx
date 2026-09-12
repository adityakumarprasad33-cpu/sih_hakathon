import React from "react";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Navbar } from "@/components/Navbar";
import { Activity, Bot, Stethoscope, CloudSun, Radio, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Services | Samadhan Health",
  description: "Explore the Samadhan Health platform service ecosystem: personal monitoring, AI companion, and doctor-connected telemetry.",
};

export default function ServicesPage() {
  const services = [
    {
      title: "Personal Health Monitoring",
      icon: <Activity size={24} color="#00695C" />,
      desc: "Continuous wearable sensing capturing heart rate pulse contour, estimated blood oxygen saturation, peripheral skin temperature, and motion cadence to maintain your unique physiological baseline.",
      capabilities: [
        "Continuous multi-sensor telemetry acquisition",
        "Individual baseline circadian modeling",
        "Signal quality indexing to prevent false alerts",
      ],
    },
    {
      title: "AI Health Companion",
      icon: <Bot size={24} color="#7C3AED" />,
      desc: "An intelligent conversational assistant that translates complex sensor patterns, thermal differentials, and cardiovascular trends into clear, plain-language explanations.",
      capabilities: [
        "Context-aware explanations of vital shifts",
        "Structured multi-sensor context translation",
        "Non-diagnostic lifestyle and hydration guidance",
      ],
    },
    {
      title: "Doctor-Connected Monitoring",
      icon: <Stethoscope size={24} color="#0284C7" />,
      desc: "Enables patients to connect their health stream directly with authorized clinical doctors. Physicians review longitudinal trends and triage alerts through a dedicated clinical dashboard.",
      capabilities: [
        "Patient-controlled consent access",
        "Longitudinal multi-signal timeline view",
        "Triage risk stratification indexing",
      ],
    },
    {
      title: "Environmental Health Awareness",
      icon: <CloudSun size={24} color="#B45309" />,
      desc: "Integrated ambient temperature and humidity tracking that provides essential context to vital sign fluctuations caused by external heat stress.",
      capabilities: [
        "Ambient heat index correlation",
        "Environmental thermal load alerts",
        "Circadian exposure pattern analysis",
      ],
    },
    {
      title: "Consent-Based Remote Monitoring",
      icon: <Radio size={24} color="#0F766E" />,
      desc: "Secure end-to-end telemetry synchronization from personal wearable devices to Firebase Realtime Database for real-time care oversight.",
      capabilities: [
        "Low-latency telemetry packets",
        "Role-isolated access rights",
        "Revocable doctor-patient sharing permissions",
      ],
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
              The Samadhan Service Ecosystem
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
              A cohesive architecture connecting continuous wearable sensing, context-aware AI interpretation, and authorized clinical oversight.
            </p>
          </div>
        </section>

        {/* Services List */}
        <section style={{ padding: "var(--space-16) 0 var(--space-20)" }}>
          <div className="container">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
              {services.map((svc) => (
                <div
                  key={svc.title}
                  style={{
                    padding: "var(--space-8)",
                    borderRadius: "var(--radius-xl)",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "var(--shadow-sm)",
                    display: "grid",
                    gridTemplateColumns: "1fr 1.2fr",
                    gap: "var(--space-8)",
                    alignItems: "center",
                  }}
                  className="service-card"
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "var(--space-3)" }}>
                      {svc.icon}
                      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0F172A" }}>
                        {svc.title}
                      </h2>
                    </div>
                    <p style={{ color: "var(--text-secondary)", lineHeight: 1.65, fontSize: "0.95rem" }}>
                      {svc.desc}
                    </p>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#F8FAFC",
                      borderRadius: "var(--radius-md)",
                      padding: "var(--space-6)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 650, color: "#334155", marginBottom: "var(--space-3)" }}>
                      Engineered Capabilities
                    </h3>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                      {svc.capabilities.map((cap) => (
                        <li key={cap} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", color: "#0F172A" }}>
                          <ShieldCheck size={16} color="#00695C" />
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
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

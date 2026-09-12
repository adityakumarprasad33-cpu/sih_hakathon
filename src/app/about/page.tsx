import React from "react";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Navbar } from "@/components/Navbar";
import { ShieldCheck, Cpu, Heart, Thermometer, Users, Lock, Bot, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "About Samadhan Health | Intelligent Personal Health Monitoring",
  description: "Learn about the mission, architecture, and technology behind the Samadhan Health continuous intelligence platform.",
};

export default function AboutPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#FFFFFF" }}>
      <AnnouncementBar />
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* Hero Section */}
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
              Why Samadhan Health Exists
            </h1>
            <p
              style={{
                fontSize: "1.15rem",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                maxWidth: "64ch",
                margin: "0 auto",
              }}
            >
              Traditional healthcare is episodic and reactive — assessing people only after acute symptoms appear. Samadhan Health was founded to build continuous, context-aware physiological tracking that surfaces early risk indicators before events escalate.
            </p>
          </div>
        </section>

        {/* The Problem & Samadhan Approach */}
        <section style={{ padding: "var(--space-16) 0", borderBottom: "1px solid var(--border-subtle)" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--space-8)" }}>
              {/* Problem */}
              <div
                style={{
                  padding: "var(--space-8)",
                  borderRadius: "var(--radius-xl)",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 var(--space-4)", color: "#0F172A" }}>
                  Isolated Signals Miss The Human Context
                </h2>
                <p style={{ color: "var(--text-secondary)", lineHeight: 1.65, fontSize: "0.95rem" }}>
                  Most consumer wearables capture single data points in isolation — like a high heart rate without recognizing the ambient 40°C temperature or physical exertion. Without environmental correlation and baseline modeling, vital warnings are buried in noise or false alerts.
                </p>
              </div>

              {/* Samadhan Approach */}
              <div
                style={{
                  padding: "var(--space-8)",
                  borderRadius: "var(--radius-xl)",
                  backgroundColor: "#E6F4F1",
                  border: "1px solid #B2DFDB",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 var(--space-4)", color: "#004D40" }}>
                  Multi-Factor Physiological Correlation
                </h2>
                <p style={{ color: "#004D40", lineHeight: 1.65, fontSize: "0.95rem" }}>
                  Samadhan connects continuous photoplethysmography (PPG), peripheral skin temperature, ambient environmental sensors, and motion states into an integrated edge-computed stream. Changes are evaluated against the individual&apos;s longitudinal circadian baseline.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6 Structural Pillars */}
        <section style={{ padding: "var(--space-16) 0 var(--space-20)", backgroundColor: "#FFFFFF" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "var(--space-12)" }}>
              <h2 style={{ fontSize: "2.2rem", fontWeight: 750, color: "#0F172A" }}>
                Built on Verified Engineering Principles
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--space-6)" }}>
              {[
                {
                  icon: <Heart size={22} color="#00695C" />,
                  title: "Personal Health Monitoring",
                  desc: "Continuous acquisition of pulse dynamics, estimated oxygenation stability, and autonomic recovery curves.",
                },
                {
                  icon: <Thermometer size={22} color="#B45309" />,
                  title: "Environmental Awareness",
                  desc: "Continuous ambient temperature and exposure tracking to differentiate physiological strain from environmental stress.",
                },
                {
                  icon: <Cpu size={22} color="#0284C7" />,
                  title: "Edge Intelligence",
                  desc: "Low-power microcontroller firmware extracts clean statistical features locally before transmitting to reduce latency and bandwidth.",
                },
                {
                  icon: <Bot size={22} color="#7C3AED" />,
                  title: "AI Health Companion",
                  desc: "Translates complex sensor correlations into plain-language summaries and context-aware explanations without medical overreach.",
                },
                {
                  icon: <Users size={22} color="#00695C" />,
                  title: "Doctor-Connected Monitoring",
                  desc: "Enables patients to securely share longitudinal biometrics with authorized clinical personnel under explicit consent.",
                },
                {
                  icon: <Lock size={22} color="#0F172A" />,
                  title: "Privacy-First Architecture",
                  desc: "End-to-end encrypted telemetry, strict role isolation, and granular data access rights.",
                },
              ].map((pillar) => (
                <div
                  key={pillar.title}
                  style={{
                    padding: "var(--space-6)",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "#F8FAFC",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "var(--space-3)" }}>
                    {pillar.icon}
                    <h3 style={{ fontSize: "1.12rem", fontWeight: 650, color: "#0F172A" }}>
                      {pillar.title}
                    </h3>
                  </div>
                  <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {pillar.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Compliance note */}
            <div
              style={{
                marginTop: "var(--space-12)",
                padding: "var(--space-6)",
                borderRadius: "var(--radius-md)",
                backgroundColor: "#F1F5F9",
                border: "1px solid var(--border-subtle)",
                fontSize: "0.82rem",
                color: "#475569",
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: "#0F172A" }}>Regulatory Notice: </strong>
              Samadhan Health is an assistive personal health intelligence and physiological monitoring system.
              It is not intended to diagnose diseases, replace medical doctors, cure conditions, or guarantee emergency detection.
              Always seek the advice of a qualified healthcare professional regarding any medical concerns.
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
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

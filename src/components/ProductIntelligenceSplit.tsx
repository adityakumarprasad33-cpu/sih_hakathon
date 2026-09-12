"use client";

import React, { useState } from "react";
import { 
  Heart, 
  Wind, 
  Thermometer, 
  Footprints, 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle2, 
  SlidersHorizontal,
  Info,
  Layers,
  Cpu
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RiskBadge } from "@/components/ui/RiskBadge";

/**
 * Sensor Channels Architecture Specifications
 * Real engineering specifications — zero fake patient telemetry
 */
const SENSOR_CHANNELS = {
  Cardiovascular: {
    title: "Optical PPG Sensor Array",
    metricName: "Pulse Dynamics & HRV",
    sensorType: "Dual-Wavelength Photodiode",
    frequency: "25 Hz Sampling",
    description: "Captures reflected optical signals through peripheral dermal capillaries to compute real-time inter-beat intervals and heart rate variability (RMSSD).",
    role: "Autonomic baseline & physical exertion index",
    standardMargin: "Resting nominal: 50 – 100 BPM",
  },
  Thermal: {
    title: "Dual Temperature Sensing",
    metricName: "Skin & Ambient Differential",
    sensorType: "Precision NTC Thermistor Probe",
    frequency: "0.2 Hz Continuous Logging",
    description: "Correlates peripheral skin temperature with ambient environmental heat index to isolate physiological heat strain from external ambient conditions.",
    role: "Thermal load & peripheral perfusion index",
    standardMargin: "Nominal skin margin: 31.0°C – 34.5°C",
  },
  Kinematic: {
    title: "6-Axis Motion & Cadence",
    metricName: "Movement & Posture Gating",
    sensorType: "MEMS Accelerometer & Gyroscope",
    frequency: "50 Hz Interrupt-Driven",
    description: "Detects physical ambulation, resting recumbency, and abrupt movement shifts to gate cardiorespiratory metrics and prevent motion artifact corruption.",
    role: "Motion gating & activity classification",
    standardMargin: "States: Resting, Walking, Active, Recovery",
  },
};

export const ProductIntelligenceSplit: React.FC = () => {
  const [activeChannel, setActiveChannel] = useState<"Cardiovascular" | "Thermal" | "Kinematic">("Cardiovascular");
  const channel = SENSOR_CHANNELS[activeChannel];

  return (
    <section
      id="split-telemetry"
      aria-labelledby="split-title"
      style={{
        position: "relative",
        paddingTop: "64px",
        paddingBottom: "80px",
        backgroundColor: "#F8FAFC",
        borderTop: "1px solid #E2E8F0",
        borderBottom: "1px solid #E2E8F0",
        scrollMarginTop: "128px",
        fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
      }}
    >
      <div className="container">
        <div
          className="wireframe-split-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "32px",
            alignItems: "stretch",
          }}
        >
          {/* WIREFRAME LEFT BOX: Product Overview & Direct Actions */}
          <div
            className="split-left-card"
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              border: "1px solid #E2E8F0",
              padding: "36px",
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "#00695C",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "12px",
                }}
              >
                <span>Integrated Biosensing</span>
              </div>

              <h2
                id="split-title"
                style={{
                  fontSize: "clamp(1.85rem, 3vw, 2.5rem)",
                  fontWeight: 800,
                  lineHeight: 1.2,
                  letterSpacing: "-0.03em",
                  color: "#0F172A",
                  marginBottom: "16px",
                  fontFamily: "inherit",
                }}
              >
                Health monitoring that watches the bigger picture.
              </h2>

              <p
                style={{
                  fontSize: "1rem",
                  color: "#475569",
                  lineHeight: 1.65,
                  marginBottom: "24px",
                  fontFamily: "inherit",
                }}
              >
                Single-parameter sensors miss physiological context. Samadhan integrates continuous cardiovascular signals, skin temperature variations, and ambient environmental exposure to surface early risk indicators with clinical clarity.
              </p>

              {/* Architecture Core Highlights */}
              <ul
                style={{
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  marginBottom: "32px",
                  padding: 0,
                }}
              >
                {[
                  "Continuous physiological tracking across motion states",
                  "Environmental thermal & humidity context integration",
                  "Edge-computed baseline models tailored to individual physiology",
                  "Standardized risk stratification for seamless clinical escalation",
                ].map((item) => (
                  <li
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      fontSize: "0.92rem",
                      color: "#1E293B",
                      fontFamily: "inherit",
                    }}
                  >
                    <CheckCircle2
                      size={18}
                      color="#00695C"
                      style={{ flexShrink: 0, marginTop: "2px" }}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons: Get Started & View Architecture */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  flexWrap: "wrap",
                }}
              >
                <a
                  href="/signup"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 26px",
                    fontSize: "0.92rem",
                    fontWeight: 650,
                    color: "#FFFFFF",
                    backgroundColor: "#00695C",
                    border: "1px solid #00695C",
                    borderRadius: "9999px",
                    textDecoration: "none",
                    boxShadow: "0 2px 8px rgba(0, 105, 92, 0.25)",
                    transition: "all 150ms ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#004D40";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#00695C";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <span>Get Started</span>
                  <ArrowRight size={16} strokeWidth={2.2} />
                </a>

                <a
                  href="/products"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "12px 22px",
                    fontSize: "0.92rem",
                    fontWeight: 600,
                    color: "#0F172A",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "9999px",
                    textDecoration: "none",
                    transition: "all 150ms ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F8FAFC";
                    e.currentTarget.style.borderColor = "#94A3B8";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#FFFFFF";
                    e.currentTarget.style.borderColor = "#CBD5E1";
                  }}
                >
                  View Product Architecture
                </a>
              </div>

              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#64748B",
                  marginTop: "16px",
                  fontFamily: "inherit",
                }}
              >
                Engineered for continuous non-intrusive personal monitoring.
              </div>
            </div>
          </div>

          {/* WIREFRAME RIGHT BOX: Dynamic Sensor Channel Inspector */}
          <div
            className="split-right-card"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              borderRadius: "20px",
              border: "1px solid #E2E8F0",
              padding: "36px",
              boxShadow: "0 10px 30px -4px rgba(15, 23, 42, 0.08)",
              position: "relative",
            }}
          >
            {/* Header with Channel Identifier */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
                paddingBottom: "12px",
                borderBottom: "1px solid #E2E8F0",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Cpu size={18} color="#00695C" />
                <span
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "#0F172A",
                  }}
                >
                  Sensor Specifications & Architecture
                </span>
              </div>
            </div>

            {/* Interactive Channel Selector */}
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.84rem",
                    fontWeight: 600,
                    color: "#475569",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <SlidersHorizontal size={14} />
                  <span>Channel Configuration</span>
                </div>
                <span style={{ fontSize: "0.78rem", color: "#00695C", fontWeight: 600 }}>
                  Select channel to inspect
                </span>
              </div>

              {/* Slider Track with Sliding Pills */}
              <div
                role="tablist"
                aria-label="Sensor Channel Selector"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "4px",
                  backgroundColor: "#F1F5F9",
                  padding: "4px",
                  borderRadius: "9999px",
                  border: "1px solid #E2E8F0",
                }}
              >
                {(["Cardiovascular", "Thermal", "Kinematic"] as const).map((tab) => {
                  const isActive = activeChannel === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveChannel(tab)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "9999px",
                        fontSize: "0.84rem",
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? "#FFFFFF" : "#475569",
                        backgroundColor: isActive ? "#00695C" : "transparent",
                        transition: "all 150ms ease",
                        textAlign: "center",
                        cursor: "pointer",
                      }}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Channel Details (Real Specifications) */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "14px",
                border: "1px solid #E2E8F0",
                padding: "24px",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
                marginBottom: "24px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A" }}>
                    {channel.title}
                  </h3>
                  <div style={{ fontSize: "0.84rem", color: "#00695C", fontWeight: 650, marginTop: "2px" }}>
                    {channel.sensorType}
                  </div>
                </div>
                <span style={{ fontSize: "0.76rem", color: "#64748B", fontWeight: 600 }}>
                  {channel.frequency}
                </span>
              </div>

              <p style={{ fontSize: "0.92rem", color: "#475569", lineHeight: 1.6, marginBottom: "16px" }}>
                {channel.description}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  fontSize: "0.84rem",
                  paddingTop: "12px",
                  borderTop: "1px solid #E2E8F0",
                }}
              >
                <div>
                  <span style={{ color: "#64748B", display: "block", fontSize: "0.74rem" }}>Physiological Role</span>
                  <strong style={{ color: "#0F172A" }}>{channel.role}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748B", display: "block", fontSize: "0.74rem" }}>Standard Margins</span>
                  <strong style={{ color: "#0F172A" }}>{channel.standardMargin}</strong>
                </div>
              </div>
            </div>

            {/* Cross-Platform Risk Engine Standardization */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <ShieldAlert size={18} color="#00695C" />
                <div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                    Standardized Triage Architecture
                  </div>
                  <div style={{ fontSize: "0.84rem", color: "var(--text-primary)", fontWeight: 600 }}>
                    NORMAL • WATCH • WARNING • CRITICAL • EMERGENCY
                  </div>
                </div>
              </div>

              <RiskBadge level="NORMAL" />
            </div>

            {/* Telemetry Contract Note */}
            <div
              style={{
                backgroundColor: "#F8FAFC",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "10px 14px",
                fontSize: "0.78rem",
                color: "#64748B",
                lineHeight: 1.5,
              }}
            >
              Live health streams synchronize to authenticated user accounts via Firebase Realtime Database at <code>/telemetry/&#123;uid&#125;/live</code>.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

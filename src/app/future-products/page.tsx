import React from "react";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Navbar } from "@/components/Navbar";
import { Clock, Compass, Microscope, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Future Products & Research Roadmap | Samadhan Health",
  description: "Explore the verified product roadmap of Samadhan Health: categorized by Active Development, Planned Horizons, and Ongoing Research.",
};

export default function FutureProductsPage() {
  const categories = [
    {
      tier: "Current Milestone",
      icon: <CheckCircle2 size={22} color="#00695C" />,
      items: [
        {
          title: "Samadhan Edge Wearable Band (Core Module)",
          desc: "Dual-wavelength optical PPG, peripheral skin temperature probe, and low-power ESP32 edge processing architecture.",
          status: "Hardware validation & firmware optimization.",
        },
        {
          title: "Patient Health Portal & Telemetry Sync",
          desc: "Secure web and mobile interface connecting to Firebase Realtime Database for live telemetry display.",
          status: "Client interface & session management active.",
        },
      ],
    },
    {
      tier: "Planned Horizons",
      icon: <Compass size={22} color="#0284C7" />,
      items: [
        {
          title: "Environmental Sensing Pod",
          desc: "A standalone or clip-on environmental monitor measuring ambient wet-bulb temperature, indoor particulate matter, and acoustic stress.",
          status: "Scheduled for schematic layout & component procurement.",
        },
        {
          title: "Doctor Clinic Cohort Manager",
          desc: "Expanded physician dashboard with batch patient escalation queues and multi-patient risk stratification sorting.",
          status: "Specification stage; pending clinical protocol review.",
        },
        {
          title: "Smartwatch Companion Integration",
          desc: "Companion applications for Wear OS and Apple Watch to receive edge alert notifications and sensor stream mirrors.",
          status: "Architecture planning.",
        },
      ],
    },
    {
      tier: "Exploratory Research",
      icon: <Microscope size={22} color="#7C3AED" />,
      items: [
        {
          title: "Multi-Spectral Continuous Bio-Impedance",
          desc: "Investigating micro-electrical impedance spectroscopy for non-invasive hydration baseline shifts.",
          status: "Early laboratory feasibility inquiry. Non-commercial.",
        },
        {
          title: "On-Chip TinyML Arrhythmia Pattern Flagging",
          desc: "Exploring micro-neural network models executing entirely within low-power wearable flash memory.",
          status: "Academic literature benchmark and algorithmic exploration.",
        },
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
              Future Directions & Research
            </h1>
            <p
              style={{
                fontSize: "1.12rem",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                maxWidth: "64ch",
                margin: "0 auto",
              }}
            >
              We believe in honest technology communication. Here is a transparent breakdown of what is currently built, what is actively planned, and what remains exploratory research.
            </p>
          </div>
        </section>

        {/* Roadmap Tiers */}
        <section style={{ padding: "var(--space-16) 0 var(--space-20)" }}>
          <div className="container">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-12)" }}>
              {categories.map((cat) => (
                <div
                  key={cat.tier}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "var(--radius-xl)",
                    border: "1px solid var(--border-subtle)",
                    padding: "var(--space-8)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "var(--space-6)" }}>
                    {cat.icon}
                    <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#0F172A" }}>
                      {cat.tier}
                    </h2>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--space-6)" }}>
                    {cat.items.map((item) => (
                      <div
                        key={item.title}
                        style={{
                          backgroundColor: "#F8FAFC",
                          borderRadius: "var(--radius-md)",
                          padding: "var(--space-6)",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#0F172A", marginBottom: "var(--space-2)" }}>
                          {item.title}
                        </h3>
                        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "var(--space-4)" }}>
                          {item.desc}
                        </p>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)", paddingTop: "8px" }}>
                          <strong style={{ color: "#0F172A" }}>Stage: </strong> {item.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <div
              style={{
                marginTop: "var(--space-12)",
                padding: "var(--space-6)",
                borderRadius: "var(--radius-md)",
                backgroundColor: "#F8FAFC",
                border: "1px solid var(--border-subtle)",
                fontSize: "0.82rem",
                color: "#64748B",
                textAlign: "center",
              }}
            >
              Items in Planned and Research categories are not commercially available products and do not represent final technical specifications.
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

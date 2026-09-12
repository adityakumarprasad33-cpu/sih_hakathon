import React from "react";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ProductIntelligenceSplit } from "@/components/ProductIntelligenceSplit";
import { Info } from "lucide-react";

export default function HomePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#FFFFFF" }}>
      {/* SECTION 1: Thin Announcement / Notification Bar ("NOTIFICATION AND ANNOUNCEMT WITH CLICABLE THING") */}
      <AnnouncementBar />

      {/* SECTION 2: Sticky Desktop/Mobile Navigation ("LOGO", "PAGE MENUES...", "LOGIN OR SIGNUP") */}
      <Navbar />

      {/* Main Content Area */}
      <main>
        {/* SECTION 3: Hero Section ("HERO SECTION IMAGES IN THE BACKGROUND") */}
        <HeroSection />

        {/* SECTION 4: Split Section ("ANY BUTTON LIKE GET STARTED", "STATS AND FEATURES WITH TRANSPARENT BG AND SLIDING THING") */}
        <ProductIntelligenceSplit />
      </main>

      {/* Milestone 1 Review Footer & Regulatory Compliance Disclaimer */}
      <footer
        style={{
          borderTop: "1px solid var(--border-subtle)",
          backgroundColor: "#FFFFFF",
          padding: "var(--space-12) 0 var(--space-8)",
          marginTop: "auto",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-6)",
            }}
          >
            {/* Top row: Brand & Milestone Status */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "var(--space-4)",
                paddingBottom: "var(--space-6)",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Samadhan <span style={{ color: "var(--brand-primary)" }}>Health</span>
                </span>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                  Intelligent personal health monitoring & multi-factor physiological correlation.
                </p>
              </div>
            </div>

            {/* Medical Compliance Language Notice */}
            <div
              style={{
                backgroundColor: "#F8FAFC",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
                padding: "16px 20px",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
              }}
            >
              <Info size={18} color="var(--brand-primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>
                <strong style={{ color: "var(--text-primary)" }}>Regulatory & Compliance Notice: </strong>
                Samadhan Health is an assistive personal health intelligence and physiological monitoring platform.
                Samadhan Health does not diagnose medical conditions, replace certified medical doctors, predict acute clinical episodes, or guarantee emergency detection.
                Always consult a qualified healthcare professional for clinical advice.
              </div>
            </div>

            {/* Bottom copyright */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "var(--space-3)",
                fontSize: "0.82rem",
                color: "var(--text-muted)",
              }}
            >
              <span>© {new Date().getFullYear()} Samadhan Health Technologies. All rights reserved.</span>
              <div style={{ display: "flex", gap: "20px" }}>
                <a href="/privacy" style={{ color: "var(--text-muted)" }}>Privacy Protocol</a>
                <a href="/terms" style={{ color: "var(--text-muted)" }}>Terms of Service</a>
                <a href="/contact" style={{ color: "var(--text-muted)" }}>Contact & Support</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

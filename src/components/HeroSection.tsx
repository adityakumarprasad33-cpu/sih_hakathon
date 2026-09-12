"use client";

import React from "react";
import Image from "next/image";
import { Heart, ArrowRight } from "lucide-react";

export const HeroSection: React.FC = () => {
  return (
    <section
      aria-labelledby="hero-title"
      style={{
        position: "relative",
        minHeight: "680px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: "#0F172A",
      }}
    >
      {/* FULL-WIDTH BACKGROUND PHOTOGRAPHY (Matching User Reference Image) */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      >
        <Image
          src="/images/hero-health-family.jpg"
          alt="Warm healthcare family and patient care background"
          fill
          priority
          sizes="100vw"
          style={{
            objectFit: "cover",
            objectPosition: "center 30%",
          }}
        />

        {/* Cinematic Scrim Overlay (Matches exact dark vignette in reference screenshot) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at center, rgba(15, 23, 42, 0.65) 0%, rgba(15, 23, 42, 0.8) 100%)",
          }}
        />
      </div>

      {/* Centered Hero Typography & Dual Pill CTAs */}
      <div
        className="container"
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "var(--space-16)",
          paddingBottom: "var(--space-16)",
        }}
      >
        {/* Main Heading (Big, Bold, White, Centered like Reference) */}
        <h1
          id="hero-title"
          style={{
            fontSize: "clamp(2.8rem, 6vw, 4.5rem)",
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: "-0.03em",
            color: "#FFFFFF",
            maxWidth: "20ch",
            margin: "0 auto var(--space-6)",
            textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
          }}
        >
          Understand your health.
          <br />
          Before it becomes an emergency.
        </h1>

        {/* Centered Supporting Copy */}
        <p
          style={{
            fontSize: "clamp(1.05rem, 1.8vw, 1.25rem)",
            fontWeight: 400,
            color: "rgba(255, 255, 255, 0.92)",
            lineHeight: 1.6,
            maxWidth: "68ch",
            margin: "0 auto var(--space-8)",
            textShadow: "0 1px 6px rgba(0, 0, 0, 0.4)",
          }}
        >
          Empower yourself and your loved ones with continuous multi-signal physiological tracking, personal baselines, and environmental awareness to recognize changes and respond earlier.
        </p>

        {/* Dual Pill Action Buttons (Matching User Reference: Teal + Dark Translucent) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          {/* Primary Teal Pill: Get Started (Matching "Donate Now" in reference) */}
          <a
            href="#split-telemetry"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "13px 28px",
              fontSize: "1rem",
              fontWeight: 650,
              color: "#FFFFFF",
              backgroundColor: "#00695C", // Deep rich teal
              border: "1px solid #00695C",
              borderRadius: "9999px",
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(0, 105, 92, 0.4)",
              transition: "all var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#004D40";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#00695C";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <Heart size={18} strokeWidth={2.4} fill="currentColor" fillOpacity={0.25} />
            <span>Get Started</span>
          </a>

          {/* Secondary Translucent Pill with Arrow (Matching "Become a Volunteer →" in reference) */}
          <a
            href="#how-it-works"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "13px 28px",
              fontSize: "1rem",
              fontWeight: 550,
              color: "#FFFFFF",
              backgroundColor: "rgba(30, 41, 59, 0.75)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "9999px",
              textDecoration: "none",
              transition: "all var(--transition-fast)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(45, 55, 72, 0.9)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(30, 41, 59, 0.75)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span>Explore Samadhan</span>
            <ArrowRight size={17} strokeWidth={2.2} />
          </a>
        </div>
      </div>
    </section>
  );
};

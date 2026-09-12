"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sun, Heart, Menu, X, ChevronRight, Activity } from "lucide-react";

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Products", href: "/products" },
    { label: "Future Products", href: "/future-products" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header
      role="banner"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.96)" : "#FFFFFF",
        backdropFilter: isScrolled ? "blur(10px)" : "none",
        borderBottom: isScrolled ? "1px solid #E2E8F0" : "1px solid #EEF2F6",
        transition: "all var(--transition-fast)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "70px",
        }}
      >
        {/* Left: Official Brand Logo & Identity */}
        <Link
          href="/"
          aria-label="Samadhan Health Homepage"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              backgroundColor: "#00695C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0, 105, 92, 0.28)",
              flexShrink: 0,
            }}
          >
            <Activity size={20} color="#FFFFFF" strokeWidth={2.6} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
            <span
              style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "#0F172A",
                letterSpacing: "-0.03em",
              }}
            >
              Samadhan <span style={{ color: "#00695C" }}>Health</span>
            </span>
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 600,
                color: "#64748B",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Intelligent Monitoring
            </span>
          </div>
        </Link>

        {/* Center: Main Navigation Menus */}
        <nav
          aria-label="Primary Navigation"
          className="desktop-nav"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "28px",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              style={{
                fontSize: "0.92rem",
                fontWeight: 550,
                color: "#334155",
                transition: "color var(--transition-fast)",
                padding: "6px 0",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#00695C";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#334155";
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div
          className="desktop-actions"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          {/* Theme / Mode hint */}
          <button
            type="button"
            aria-label="Clinical standard theme"
            style={{
              color: "#64748B",
              backgroundColor: "transparent",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "6px",
              cursor: "pointer",
              transition: "color var(--transition-fast)",
            }}
            title="Standard Clinical Mode"
          >
            <Sun size={18} strokeWidth={2.2} />
          </button>

          {/* Secondary Pill Button: Log In */}
          <Link
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px 20px",
              fontSize: "0.88rem",
              fontWeight: 550,
              color: "#0F172A",
              backgroundColor: "#FFFFFF",
              border: "1px solid #CBD5E1",
              borderRadius: "9999px",
              textDecoration: "none",
              transition: "all var(--transition-fast)",
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
            Log In
          </Link>

          {/* Primary Teal Pill Button: Get Started */}
          <Link
            href="/signup"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              padding: "8px 20px",
              fontSize: "0.88rem",
              fontWeight: 600,
              color: "#FFFFFF",
              backgroundColor: "#00695C",
              border: "1px solid #00695C",
              borderRadius: "9999px",
              textDecoration: "none",
              boxShadow: "0 2px 4px rgba(0, 105, 92, 0.2)",
              transition: "all var(--transition-fast)",
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
            <Heart size={15} strokeWidth={2.4} fill="currentColor" fillOpacity={0.2} />
            <span>Get Started</span>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            width: "38px",
            height: "38px",
            borderRadius: "6px",
            color: "#0F172A",
            backgroundColor: "#F1F5F9",
            border: "1px solid #E2E8F0",
          }}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer"
          style={{
            borderTop: "1px solid #E2E8F0",
            backgroundColor: "#FFFFFF",
            padding: "16px var(--space-4) 24px",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
          }}
        >
          <nav
            aria-label="Mobile Navigation"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginBottom: "20px",
            }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  color: "#0F172A",
                  padding: "10px 12px",
                  borderRadius: "6px",
                  backgroundColor: "#F8FAFC",
                  textDecoration: "none",
                }}
              >
                <span>{link.label}</span>
                <ChevronRight size={16} color="#94A3B8" />
              </Link>
            ))}
          </nav>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "12px",
                borderRadius: "9999px",
                backgroundColor: "#00695C",
                color: "#FFFFFF",
                fontWeight: 600,
                textAlign: "center",
                textDecoration: "none",
              }}
            >
              <Heart size={16} fill="currentColor" fillOpacity={0.2} />
              <span>Get Started</span>
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "11px",
                borderRadius: "9999px",
                backgroundColor: "#FFFFFF",
                border: "1px solid #CBD5E1",
                color: "#0F172A",
                fontWeight: 500,
                textAlign: "center",
                textDecoration: "none",
              }}
            >
              Log In
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

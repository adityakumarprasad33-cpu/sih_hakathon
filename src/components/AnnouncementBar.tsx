"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

export const AnnouncementBar: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside
      aria-label="Announcement banner"
      style={{
        width: "100%",
        backgroundColor: "#00695C", // Deep rich clinical teal matching user reference
        color: "#FFFFFF",
        fontSize: "0.86rem",
        fontWeight: 450,
        position: "relative",
        zIndex: 50,
        padding: "8px 16px",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            textAlign: "center",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <span>
            Introducing <strong>Samadhan Health</strong> — intelligent personal health monitoring and early risk signals.
          </span>
          <a
            href="#split-telemetry"
            style={{
              color: "#FFFFFF",
              fontWeight: 650,
              textDecoration: "underline",
              textUnderlineOffset: "3px",
              cursor: "pointer",
            }}
          >
            Explore Platform
          </a>
        </div>

        {/* Dismiss 'x' button on right, exactly like user reference */}
        <button
          type="button"
          aria-label="Dismiss announcement"
          onClick={() => setDismissed(true)}
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            color: "rgba(255, 255, 255, 0.8)",
            backgroundColor: "transparent",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4px",
            borderRadius: "4px",
            transition: "color var(--transition-fast)",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#FFFFFF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
          }}
        >
          <X size={16} strokeWidth={2.2} />
        </button>
      </div>
    </aside>
  );
};

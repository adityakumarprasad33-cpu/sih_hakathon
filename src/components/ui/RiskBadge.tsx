"use client";

import React from "react";
import type { RiskLevel } from "@/types/health";

interface RiskBadgeProps {
  level: RiskLevel;
  size?: "sm" | "md";
  showLabel?: boolean;
}

const RISK_CONFIG: Record<
  RiskLevel,
  { label: string; color: string; bg: string; border: string }
> = {
  NORMAL: {
    label: "NORMAL",
    color: "var(--risk-normal)",
    bg: "var(--risk-normal-bg)",
    border: "var(--risk-normal-border)",
  },
  WATCH: {
    label: "WATCH",
    color: "var(--risk-watch)",
    bg: "var(--risk-watch-bg)",
    border: "var(--risk-watch-border)",
  },
  WARNING: {
    label: "WARNING",
    color: "var(--risk-warning)",
    bg: "var(--risk-warning-bg)",
    border: "var(--risk-warning-border)",
  },
  CRITICAL: {
    label: "CRITICAL",
    color: "var(--risk-critical)",
    bg: "var(--risk-critical-bg)",
    border: "var(--risk-critical-border)",
  },
  EMERGENCY: {
    label: "EMERGENCY",
    color: "var(--risk-emergency)",
    bg: "var(--risk-emergency-bg)",
    border: "var(--risk-emergency-border)",
  },
};

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  size = "md",
  showLabel = true,
}) => {
  const config = RISK_CONFIG[level] || RISK_CONFIG.NORMAL;
  const isSmall = size === "sm";

  return (
    <span
      role="status"
      aria-label={`Risk Level: ${config.label}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: isSmall ? "5px" : "6px",
        padding: isSmall ? "2px 7px" : "3px 9px",
        borderRadius: "var(--radius-pill)",
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
        fontSize: isSmall ? "0.68rem" : "0.74rem",
        fontWeight: 650,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        fontFamily: "var(--font-mono)",
        userSelect: "none",
        lineHeight: 1,
      }}
    >
      <span
        style={{
          width: isSmall ? "5px" : "6px",
          height: isSmall ? "5px" : "6px",
          borderRadius: "50%",
          backgroundColor: config.color,
          display: "inline-block",
        }}
        className="animate-radar"
      />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};

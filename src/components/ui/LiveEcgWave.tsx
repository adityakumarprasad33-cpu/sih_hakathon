"use client";

import React from "react";

interface LiveEcgWaveProps {
  color?: string;
  width?: number | string;
  height?: number;
  strokeWidth?: number;
  speedSec?: number;
}

export const LiveEcgWave: React.FC<LiveEcgWaveProps> = ({
  color = "var(--brand-primary)",
  width = "100%",
  height = 40,
  strokeWidth = 1.8,
  speedSec = 3.2,
}) => {
  const pathD = "M 0 20 L 25 20 L 32 17 L 38 22 L 44 20 L 58 20 L 64 20 L 69 12 L 74 30 L 80 2 L 86 32 L 91 20 L 105 20 L 114 15 L 123 20 L 150 20 L 157 17 L 163 22 L 169 20 L 183 20 L 189 20 L 194 12 L 199 30 L 205 2 L 211 32 L 216 20 L 230 20 L 239 15 L 248 20 L 275 20 L 282 17 L 288 22 L 294 20 L 308 20 L 314 20 L 319 12 L 324 30 L 330 2 L 336 32 L 341 20 L 355 20 L 364 15 L 373 20 L 400 20";

  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 400 40"
        preserveAspectRatio="none"
        style={{
          width: "100%",
          height: "100%",
          overflow: "visible",
        }}
      >
        {/* Crisp subtle baseline */}
        <line
          x1="0"
          y1="20"
          x2="400"
          y2="20"
          stroke="#E2E8F0"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        {/* Animated ECG Pulse */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: "400",
            animation: `ecgPulse ${speedSec}s linear infinite`,
          }}
        />
      </svg>
      <style jsx>{`
        @keyframes ecgPulse {
          0% { stroke-dashoffset: 400; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};

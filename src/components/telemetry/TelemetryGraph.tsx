"use client";

import React, { useState } from "react";

export interface TelemetryGraphPoint {
  timestamp: number;
  value: number | null;
}

interface TelemetryGraphProps {
  title: string;
  unit: string;
  color: string;
  data: TelemetryGraphPoint[];
  emptyMessage?: string;
  decimals?: number;
}

export const TelemetryGraph: React.FC<TelemetryGraphProps> = ({
  title,
  unit,
  color,
  data,
  emptyMessage = "No historical telemetry points recorded in this timeframe.",
  decimals = 1,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Filter valid points to derive min/max bounds
  const validPoints = data.filter(
    (p): p is { timestamp: number; value: number } =>
      typeof p.value === "number" && !isNaN(p.value)
  );

  const hasData = validPoints.length > 0;

  // Derive Min/Max/Latest statistics
  let minVal = 0;
  let maxVal = 10;
  let latestVal: number | null = null;

  if (hasData) {
    minVal = Math.min(...validPoints.map((p) => p.value));
    maxVal = Math.max(...validPoints.map((p) => p.value));
    latestVal = validPoints[validPoints.length - 1].value;

    // Add padding to range
    if (minVal === maxVal) {
      minVal -= 1;
      maxVal += 1;
    } else {
      const pad = (maxVal - minVal) * 0.15;
      minVal -= pad;
      maxVal += pad;
    }
  }

  const width = 600;
  const height = 180;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;

  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  // Build SVG path with gaps for null values (never plot 0 for invalid data)
  const segments: string[] = [];
  let currentSegment: { x: number; y: number }[] = [];

  const getX = (idx: number) => {
    if (data.length <= 1) return padLeft + chartWidth / 2;
    return padLeft + (idx / (data.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const norm = (val - minVal) / (maxVal - minVal);
    return padTop + (1 - norm) * chartHeight;
  };

  data.forEach((p, idx) => {
    if (p.value !== null && !isNaN(p.value)) {
      currentSegment.push({ x: getX(idx), y: getY(p.value) });
    } else {
      if (currentSegment.length > 0) {
        // Close segment
        const d = currentSegment
          .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
          .join(" ");
        segments.push(d);
        currentSegment = [];
      }
    }
  });

  if (currentSegment.length > 0) {
    const d = currentSegment
      .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
      .join(" ");
    segments.push(d);
  }

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-subtle)",
        padding: "var(--space-6)",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      {/* Header with Title & Live/Min/Max Quick Stats */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172A", margin: 0 }}>
            {title}
          </h4>
          <span style={{ fontSize: "0.76rem", color: "#64748B" }}>
            {hasData ? `${data.length} telemetry samples recorded` : "Waiting for stream packets..."}
          </span>
        </div>

        {hasData && (
          <div style={{ display: "flex", gap: "16px", alignItems: "baseline" }}>
            <div>
              <span style={{ fontSize: "0.72rem", color: "#64748B", fontWeight: 600 }}>LATEST: </span>
              <span style={{ fontSize: "1.1rem", fontWeight: 750, color, fontFamily: "var(--font-mono)" }}>
                {latestVal !== null ? `${latestVal.toFixed(decimals)}${unit}` : "N/A"}
              </span>
            </div>
            <div style={{ fontSize: "0.76rem", color: "#64748B" }}>
              MIN: <span style={{ fontWeight: 650, color: "#1E293B" }}>{Math.min(...validPoints.map(p => p.value)).toFixed(decimals)}{unit}</span>
              {" · "}
              MAX: <span style={{ fontWeight: 650, color: "#1E293B" }}>{Math.max(...validPoints.map(p => p.value)).toFixed(decimals)}{unit}</span>
            </div>
          </div>
        )}
      </div>

      {/* Graph Area or Empty State */}
      {!hasData ? (
        <div
          style={{
            height: "180px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#F8FAFC",
            borderRadius: "8px",
            border: "1px dashed #CBD5E1",
            color: "#64748B",
            fontSize: "0.85rem",
            gap: "6px",
          }}
        >
          <div style={{ fontWeight: 650, color: "#475569" }}>NO HISTORICAL DATA</div>
          <div style={{ fontSize: "0.78rem" }}>{emptyMessage}</div>
        </div>
      ) : (
        <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            style={{ width: "100%", height: "auto", display: "block" }}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              <linearGradient id={`grad-${title.replace(/\s+/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={color} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            {[0, 0.5, 1].map((pct, idx) => {
              const y = padTop + pct * chartHeight;
              const labelVal = maxVal - pct * (maxVal - minVal);
              return (
                <g key={idx}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={width - padRight}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeDasharray={pct === 0.5 ? "3 3" : "none"}
                    strokeWidth="1"
                  />
                  <text
                    x={padLeft - 6}
                    y={y + 4}
                    fill="#94A3B8"
                    fontSize="10"
                    textAnchor="end"
                    fontFamily="var(--font-mono)"
                  >
                    {labelVal.toFixed(decimals)}
                  </text>
                </g>
              );
            })}

            {/* Line Segments */}
            {segments.map((dStr, i) => (
              <path
                key={i}
                d={dStr}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {/* Data Points / Circles */}
            {data.map((p, idx) => {
              if (p.value === null) return null;
              const cx = getX(idx);
              const cy = getY(p.value);
              const isHovered = hoverIndex === idx;

              return (
                <circle
                  key={idx}
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 5 : 3}
                  fill={isHovered ? "#FFFFFF" : color}
                  stroke={color}
                  strokeWidth={isHovered ? 3 : 1.5}
                  style={{ cursor: "pointer", transition: "r 0.15s ease" }}
                  onMouseEnter={() => setHoverIndex(idx)}
                />
              );
            })}

            {/* X-Axis Timestamps */}
            {data.length > 0 && (
              <>
                <text
                  x={padLeft}
                  y={height - 8}
                  fill="#94A3B8"
                  fontSize="10"
                  textAnchor="start"
                  fontFamily="var(--font-mono)"
                >
                  {formatTime(data[0].timestamp)}
                </text>
                {data.length > 1 && (
                  <text
                    x={width - padRight}
                    y={height - 8}
                    fill="#94A3B8"
                    fontSize="10"
                    textAnchor="end"
                    fontFamily="var(--font-mono)"
                  >
                    {formatTime(data[data.length - 1].timestamp)}
                  </text>
                )}
              </>
            )}
          </svg>

          {/* Hover Tooltip Overlay */}
          {hoverIndex !== null && data[hoverIndex] && data[hoverIndex].value !== null && (
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "14px",
                backgroundColor: "#0F172A",
                color: "#FFFFFF",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "0.78rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                pointerEvents: "none",
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#94A3B8" }}>{formatTime(data[hoverIndex].timestamp)}:</span>
              <span style={{ fontWeight: 750, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>
                {data[hoverIndex].value?.toFixed(decimals)}{unit}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

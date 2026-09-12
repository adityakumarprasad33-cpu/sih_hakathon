"use client";

import React from "react";
import { 
  Loader2, 
  Inbox, 
  WifiOff, 
  Clock, 
  AlertCircle, 
  ShieldAlert, 
  CheckCircle2 
} from "lucide-react";
import { Button } from "./Button";
import type { TelemetryStateStatus } from "@/types/health";

interface DataStateViewProps {
  status: TelemetryStateStatus;
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  lastUpdated?: number;
}

export const DataStateView: React.FC<DataStateViewProps> = ({
  status,
  title,
  description,
  actionText,
  actionHref,
  onAction,
  lastUpdated,
}) => {
  const formatTimeAgo = (ts?: number) => {
    if (!ts) return null;
    const diffMin = Math.max(1, Math.round((Date.now() - ts) / 60000));
    return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  };

  const getStatusConfig = () => {
    switch (status) {
      case "LOADING":
        return {
          icon: <Loader2 size={28} className="animate-spin" color="var(--brand-primary)" />,
          defaultTitle: "Loading health intelligence...",
          defaultDesc: "Synchronizing telemetry from secure edge gateway.",
          bg: "#FFFFFF",
        };
      case "EMPTY":
        return {
          icon: <Inbox size={28} color="#64748B" />,
          defaultTitle: "No health data available yet.",
          defaultDesc: "Connect your Samadhan device to begin continuous health monitoring.",
          actionDefaultText: "Manage Devices",
          actionDefaultHref: "/app/device",
          bg: "#F8FAFC",
        };
      case "DISCONNECTED":
        return {
          icon: <WifiOff size={28} color="#C2410C" />,
          defaultTitle: "Device disconnected.",
          defaultDesc: "No active sensor stream detected. Please check your wearable Bluetooth or WiFi connection.",
          actionDefaultText: "Pair Device",
          actionDefaultHref: "/app/device",
          bg: "#FFF7ED",
        };
      case "STALE":
        return {
          icon: <Clock size={28} color="#B45309" />,
          defaultTitle: `Data stale (last updated ${formatTimeAgo(lastUpdated) || "earlier"}).`,
          defaultDesc: "Awaiting recent data packet transmission from your sensor band.",
          bg: "#FFFBEB",
        };
      case "ERROR":
        return {
          icon: <AlertCircle size={28} color="#B91C1C" />,
          defaultTitle: "Unable to load health data.",
          defaultDesc: "A network or transmission error occurred while querying telemetry records.",
          actionDefaultText: "Retry",
          bg: "#FEF2F2",
        };
      case "UNAUTHORIZED":
        return {
          icon: <ShieldAlert size={28} color="#B91C1C" />,
          defaultTitle: "Access not authorized.",
          defaultDesc: "You do not have authorized permissions or active patient consent to view this record.",
          actionDefaultText: "Return to Dashboard",
          actionDefaultHref: "/app/dashboard",
          bg: "#FEF2F2",
        };
      case "CONNECTED":
        return {
          icon: <CheckCircle2 size={28} color="var(--brand-primary)" />,
          defaultTitle: "Telemetry active.",
          defaultDesc: "Stream is synchronized and healthy.",
          bg: "#F0FDFA",
        };
    }
  };

  const config = getStatusConfig();
  const displayTitle = title || config.defaultTitle;
  const displayDesc = description || config.defaultDesc;
  const displayActionText = actionText || config.actionDefaultText;
  const displayActionHref = actionHref || config.actionDefaultHref;

  return (
    <div
      role="status"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "var(--space-12) var(--space-6)",
        borderRadius: "var(--radius-lg)",
        backgroundColor: config.bg,
        border: "1px solid var(--border-subtle)",
        maxWidth: "520px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "var(--space-4)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {config.icon}
      </div>

      <h3
        style={{
          fontSize: "1.08rem",
          fontWeight: 650,
          color: "var(--text-primary)",
          marginBottom: "var(--space-2)",
        }}
      >
        {displayTitle}
      </h3>

      <p
        style={{
          fontSize: "0.88rem",
          color: "var(--text-secondary)",
          lineHeight: 1.55,
          maxWidth: "40ch",
          marginBottom: displayActionText ? "var(--space-6)" : 0,
        }}
      >
        {displayDesc}
      </p>

      {displayActionText && (
        <div>
          {displayActionHref ? (
            <Button href={displayActionHref} variant="secondary" size="sm">
              {displayActionText}
            </Button>
          ) : (
            <Button onClick={onAction} variant="secondary" size="sm">
              {displayActionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

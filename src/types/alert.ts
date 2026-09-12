import type { RiskLevel } from "./health";

export type AlertSeverity = "INFO" | "WATCH" | "WARNING" | "CRITICAL" | "EMERGENCY";

export type AlertStatus = "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";

export interface HealthAlert {
  id: string;
  timestamp: number;
  severity: AlertSeverity;
  title: string;
  description: string;
  source: "CARDIOVASCULAR" | "THERMAL" | "ENVIRONMENTAL" | "DEVICE_OFFLINE";
  status: AlertStatus;
  relevantValue?: string;
  resolvedAt?: number;
}

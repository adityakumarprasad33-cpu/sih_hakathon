/**
 * Samadhan Health LLM Contracts
 * 
 * Invariants:
 * 1. The LLM is an explanatory and guidance layer only.
 * 2. Deterministic sensor telemetry, RiskResult, and FallState are authoritative.
 * 3. The LLM cannot calculate primary risk, invent sensor values, diagnose diseases,
 *    or override the deterministic risk engine or fall detector.
 */

import type { RiskLevel, RiskState, DominantRisk, FallState } from "./health";

export type LlmUrgency = "NORMAL" | "WATCH" | "WARNING" | "CRITICAL";
export type LlmStatus = "SUCCESS" | "AI_ASSISTANT_UNAVAILABLE";

export interface BoundedChatMessage {
  role: "user" | "assistant";
  text: string;
}

export interface CompactCurrentVitals {
  heartRate: number | null;
  spo2: number | null;
  temperature: number | null;
  humidity: number | null;
  activity: string;
}

export interface CompactBaseline {
  heartRate: number | null;
  spo2: number | null;
}

export interface CompactRiskDimensions {
  heat: number | null;
  cardio: number | null;
  respiratory: number | null;
  fatigue: number | null;
  fall: number | null;
}

export interface CompactRiskContext {
  overall: number | null;
  state: RiskState;
  dominantRisk: DominantRisk | string;
  confidence: number | null;
  dimensions: CompactRiskDimensions;
}

export interface CompactFallContext {
  state: FallState | string;
  alertActive: boolean;
}

/**
 * Authoritative Compact Health Context fed to the LLM
 * Constructed strictly server-side from verified Firebase RTDB data.
 */
export interface SamadhanHealthContext {
  contextVersion: "health-context-v1";
  current: CompactCurrentVitals;
  baseline: CompactBaseline;
  risk: CompactRiskContext;
  fall: CompactFallContext;
  evidence: string[];
  userQuery?: string;
  conversationHistory?: BoundedChatMessage[];
}

/**
 * Validated Structured LLM Response returned to client
 */
export interface SamadhanLlmResponse {
  status: LlmStatus;
  explanation: string;
  guidance: string[];
  urgency: LlmUrgency;
  disclaimer: string;
  authoritativeState: {
    riskState: string;
    overallRisk: number | null;
    dominantRisk: string;
    fallState: string;
    fallAlertActive: boolean;
  };
  latencyMs?: number;
  error?: string;
}

/**
 * Client-facing API Request Payload to POST /api/ai/companion
 * Note: patientUid is UNTRUSTED from client; server verifies via Firebase ID Token and RBAC.
 */
export interface CompanionApiRequest {
  patientUid?: string;
  userQuery?: string;
  conversationHistory?: BoundedChatMessage[];
  /** Allowed only in strictly isolated development/testing environments */
  _devOverrideContext?: Partial<SamadhanHealthContext>;
}

/**
 * Modal Internal Request Payload
 */
export interface ModalRequestPayload {
  context: SamadhanHealthContext;
  prompt?: string;
  apiKey?: string;
}

/**
 * Modal Raw Response format
 */
export interface ModalRawResponse {
  explanation?: string;
  guidance?: string[] | string;
  urgency?: string;
  disclaimer?: string;
  text?: string;
  response?: string;
  output?: string;
  error?: string;
}

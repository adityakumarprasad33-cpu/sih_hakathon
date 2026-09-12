/**
 * Client-Side Companion API Caller
 * 
 * SECURITY INVARIANTS:
 * 1. Obtains valid Firebase Authentication ID Token from active session.
 * 2. Transmits 'Authorization: Bearer <ID_TOKEN>'.
 * 3. Never transmits or handles raw Modal API keys.
 * 4. Never sends unverified client-side vitals as authoritative state.
 */

import { auth } from "@/lib/firebase/config";
import type {
  SamadhanLlmResponse,
  BoundedChatMessage,
} from "@/types/llm";

export interface QueryCompanionParams {
  patientUid?: string;
  userQuery?: string;
  conversationHistory?: BoundedChatMessage[];
}

export const companionClientService = {
  /**
   * Request structured physiological explanation from server-side companion API
   */
  async getExplanation(params: QueryCompanionParams = {}): Promise<SamadhanLlmResponse> {
    const currentUser = auth?.currentUser;

    if (!currentUser) {
      return {
        status: "AI_ASSISTANT_UNAVAILABLE",
        explanation: "",
        guidance: [],
        urgency: "NORMAL",
        disclaimer: "Please sign in to receive personalized AI health interpretations.",
        authoritativeState: {
          riskState: "INSUFFICIENT_DATA",
          overallRisk: null,
          dominantRisk: "NONE",
          fallState: "IDLE",
          fallAlertActive: false,
        },
        error: "UNAUTHENTICATED",
      };
    }

    try {
      const idToken = await currentUser.getIdToken();

      const res = await fetch("/api/ai/companion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          patientUid: params.patientUid,
          userQuery: params.userQuery,
          conversationHistory: params.conversationHistory,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        return {
          status: "AI_ASSISTANT_UNAVAILABLE",
          explanation: "",
          guidance: [],
          urgency: "NORMAL",
          disclaimer: "AI Companion is temporarily offline. Live telemetry and risk indicators remain active.",
          authoritativeState: {
            riskState: "NORMAL",
            overallRisk: null,
            dominantRisk: "NONE",
            fallState: "IDLE",
            fallAlertActive: false,
          },
          error: errData.error || `HTTP_${res.status}`,
        };
      }

      const response: SamadhanLlmResponse = await res.json();
      return response;
    } catch (err: unknown) {
      console.warn("Companion client query warning:", err);
      return {
        status: "AI_ASSISTANT_UNAVAILABLE",
        explanation: "",
        guidance: [],
        urgency: "NORMAL",
        disclaimer: "AI Companion is temporarily unreachable. Sensor telemetry remains authoritative.",
        authoritativeState: {
          riskState: "NORMAL",
          overallRisk: null,
          dominantRisk: "NONE",
          fallState: "IDLE",
          fallAlertActive: false,
        },
        error: (err as Error).message || "NETWORK_ERROR",
      };
    }
  },
};

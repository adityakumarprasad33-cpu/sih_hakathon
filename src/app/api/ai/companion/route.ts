import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseIdToken, getServerUserProfile, verifyServerDoctorPatientConsent, AuthenticationError } from "@/lib/firebase/serverAuth";
import { samadhanLlmService } from "@/services/llm/samadhanLlmService";
import type {
  CompanionApiRequest,
  SamadhanHealthContext,
  BoundedChatMessage,
} from "@/types/llm";
import type { HealthTelemetry, RiskResult } from "@/types/health";

// In-memory sliding-window rate limiter keyed by VERIFIED UID
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS_PER_WINDOW = 15;
const WINDOW_DURATION_MS = 60 * 1000; // 1 minute

function checkRateLimit(verifiedUid: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(verifiedUid);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(verifiedUid, { count: 1, resetAt: now + WINDOW_DURATION_MS });
    return true;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  entry.count += 1;
  return true;
}

const MAX_PAYLOAD_BYTES = 16 * 1024; // 16KB
const MAX_QUERY_LENGTH = 500;
const MAX_MESSAGES = 6;
const MAX_MESSAGE_TEXT_LENGTH = 500;

export async function POST(req: NextRequest) {
  try {
    // 1. Anti-DoS: Fast Payload Size Check (Reject before allocating memory or verifying token)
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
      return NextResponse.json(
        { error: "Payload exceeds maximum allowed size (16KB).", code: "PAYLOAD_TOO_LARGE" },
        { status: 413 }
      );
    }

    // 2. Mandatory Server-Side Firebase Authentication
    // Rejects x-patient-uid, x-doctor-uid, and Bearer <uid>
    const authHeader = req.headers.get("authorization");
    let verifiedUser;
    try {
      verifiedUser = await verifyFirebaseIdToken(authHeader);
    } catch (authErr) {
      const isAuthError = authErr instanceof AuthenticationError;
      return NextResponse.json(
        {
          error: isAuthError ? authErr.message : "Authentication required.",
          code: isAuthError ? authErr.code : "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const { uid: callerUid } = verifiedUser;

    // 3. Rate Limiting keyed by verified UID
    if (!checkRateLimit(callerUid)) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Maximum 15 requests per minute allowed.",
          code: "RATE_LIMITED",
        },
        { status: 429 }
      );
    }

    let body: CompanionApiRequest;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Malformed JSON request body.", code: "BAD_REQUEST" },
        { status: 400 }
      );
    }

    // 4. Request Validation & Sanitization
    const requestedPatientUid = typeof body.patientUid === "string" && body.patientUid.trim()
      ? body.patientUid.trim()
      : callerUid;

    let targetPatientUid = callerUid;

    // 5. Strict Authorization / RBAC
    if (requestedPatientUid !== callerUid) {
      // Caller wants context for another UID -> Must be an authorized Doctor with active consent
      const callerProfile = await getServerUserProfile(callerUid);
      const isDoctor = callerProfile?.role === "doctor";

      if (!isDoctor) {
        return NextResponse.json(
          {
            error: "Forbidden: Patients are strictly prohibited from accessing another patient's health context.",
            code: "FORBIDDEN",
          },
          { status: 403 }
        );
      }

      // Check active consent relationship
      const { authorized } = await verifyServerDoctorPatientConsent(callerUid, requestedPatientUid);
      if (!authorized) {
        return NextResponse.json(
          {
            error: "Forbidden: Physician does not possess an active, consented relationship with this patient.",
            code: "FORBIDDEN",
          },
          { status: 403 }
        );
      }

      targetPatientUid = requestedPatientUid;
    }

    // 6. Sanitize User Query and Bounded Conversation History
    let userQuery = "";
    if (typeof body.userQuery === "string") {
      userQuery = body.userQuery.trim().slice(0, MAX_QUERY_LENGTH);
    }

    const boundedHistory: BoundedChatMessage[] = [];
    if (Array.isArray(body.conversationHistory)) {
      for (const msg of body.conversationHistory.slice(-MAX_MESSAGES)) {
        if (!msg || typeof msg !== "object") continue;
        const role = (msg as { role?: unknown }).role;
        // Invariant: Only 'user' and 'assistant' roles are permitted; reject or strip 'system'/'developer'
        if (role !== "user" && role !== "assistant") {
          continue;
        }
        const text = typeof msg.text === "string" ? msg.text.trim().slice(0, MAX_MESSAGE_TEXT_LENGTH) : "";
        if (text) {
          boundedHistory.push({ role, text });
        }
      }
    }

    // 7. Construct Authoritative Health Context Server-Side from Firebase RTDB
    // Client-supplied health numbers are NEVER trusted in production.
    const isTestEnvironment = process.env.NODE_ENV === "test";
    let healthContext: SamadhanHealthContext;

    if (isTestEnvironment && body._devOverrideContext) {
      // Deterministic fixture for unit/integration testing ONLY
      healthContext = {
        contextVersion: "health-context-v1",
        current: {
          heartRate: body._devOverrideContext.current?.heartRate ?? 72,
          spo2: body._devOverrideContext.current?.spo2 ?? 98,
          temperature: body._devOverrideContext.current?.temperature ?? 36.6,
          humidity: body._devOverrideContext.current?.humidity ?? 50,
          activity: body._devOverrideContext.current?.activity ?? "RESTING",
        },
        baseline: {
          heartRate: body._devOverrideContext.baseline?.heartRate ?? 70,
          spo2: body._devOverrideContext.baseline?.spo2 ?? 98,
        },
        risk: {
          overall: body._devOverrideContext.risk?.overall ?? 0.1,
          state: body._devOverrideContext.risk?.state ?? "NORMAL",
          dominantRisk: body._devOverrideContext.risk?.dominantRisk ?? "NONE",
          confidence: body._devOverrideContext.risk?.confidence ?? 0.9,
          dimensions: {
            heat: body._devOverrideContext.risk?.dimensions?.heat ?? 0.1,
            cardio: body._devOverrideContext.risk?.dimensions?.cardio ?? 0.1,
            respiratory: body._devOverrideContext.risk?.dimensions?.respiratory ?? 0.1,
            fatigue: body._devOverrideContext.risk?.dimensions?.fatigue ?? 0.1,
            fall: body._devOverrideContext.risk?.dimensions?.fall ?? null,
          },
        },
        fall: {
          state: body._devOverrideContext.fall?.state ?? "IDLE",
          alertActive: body._devOverrideContext.fall?.alertActive ?? false,
        },
        evidence: body._devOverrideContext.evidence ?? ["Vitals within normal baseline"],
        userQuery,
        conversationHistory: boundedHistory,
      };
    } else {
      // Authoritative Production Path: Read /telemetry/{targetPatientUid}/live
      const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
        "https://healthtech-qualcomm-default-rtdb.asia-southeast1.firebasedatabase.app";

      let liveTelemetry: HealthTelemetry | null = null;
      try {
        const liveRes = await fetch(`${dbUrl}/telemetry/${targetPatientUid}/live.json`);
        if (liveRes.ok) {
          liveTelemetry = await liveRes.json();
        }
      } catch (err) {
        console.warn("Failed to read live telemetry for AI context:", err);
      }

      const t = liveTelemetry;
      const risk: RiskResult | undefined = t?.risk;

      // Extract Evidence strings
      const evidence: string[] = [];
      if (t?.temperature && t.temperature > 37.8) {
        evidence.push(`Ambient temperature elevated (${t.temperature.toFixed(1)}°C)`);
      }
      if (t?.humidity && t.humidity > 70) {
        evidence.push(`Humidity elevated (${t.humidity.toFixed(0)}%)`);
      }
      if (t?.heartRate && t.heartRateBaseline && t.heartRate - t.heartRateBaseline > 20) {
        evidence.push(`Heart rate ${Math.round(t.heartRate - t.heartRateBaseline)} BPM above personal baseline`);
      }
      if (risk?.contributingFactors && Array.isArray(risk.contributingFactors)) {
        for (const factor of risk.contributingFactors) {
          if (!evidence.includes(factor)) evidence.push(factor);
        }
      }
      if (t?.fallState === "FALL_CONFIRMED") {
        evidence.push("Physical fall impact and posture shift confirmed by hardware IMU");
      }
      if (evidence.length === 0) {
        evidence.push("Sensor telemetry nominal; aligned with circadian baseline");
      }

      healthContext = {
        contextVersion: "health-context-v1",
        current: {
          heartRate: typeof t?.heartRate === "number" ? t.heartRate : null,
          spo2: typeof t?.spo2 === "number" ? t.spo2 : null,
          temperature: typeof t?.temperature === "number" ? t.temperature : (typeof t?.ambientTemp === "number" ? t.ambientTemp : null),
          humidity: typeof t?.humidity === "number" ? t.humidity : null,
          activity: String(t?.activityState || t?.movementState || "RESTING"),
        },
        baseline: {
          heartRate: typeof t?.heartRateBaseline === "number" ? t.heartRateBaseline : null,
          spo2: typeof t?.spo2Baseline === "number" ? t.spo2Baseline : null,
        },
        risk: {
          overall: typeof risk?.overallRisk === "number" ? risk.overallRisk : null,
          state: risk?.state || "NORMAL",
          dominantRisk: risk?.dominantRisk || "NONE",
          confidence: typeof risk?.confidence === "number" ? risk.confidence : null,
          dimensions: {
            heat: typeof risk?.heatRisk === "number" ? risk.heatRisk : null,
            cardio: typeof risk?.cardiovascularRisk === "number" ? risk.cardiovascularRisk : null,
            respiratory: typeof risk?.respiratoryRisk === "number" ? risk.respiratoryRisk : null,
            fatigue: typeof risk?.fatigueRisk === "number" ? risk.fatigueRisk : null,
            fall: typeof risk?.fallRisk === "number" ? risk.fallRisk : null,
          },
        },
        fall: {
          state: t?.fallState || "IDLE",
          alertActive: t?.fallState === "FALL_CONFIRMED" || Boolean(t?.fallEvent?.alertActive),
        },
        evidence,
        userQuery,
        conversationHistory: boundedHistory,
      };
    }

    // 8. Invoke Server-Side LLM Service & Isolated Modal Adapter
    const llmResponse = await samadhanLlmService.generateExplanation(healthContext);

    // 9. Return safe structured output (No API keys or sensitive auth tokens in response)
    return NextResponse.json(llmResponse, { status: 200 });
  } catch (err: unknown) {
    console.error("Internal companion endpoint error:", err);
    return NextResponse.json(
      {
        error: "An error occurred while generating the health explanation.",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

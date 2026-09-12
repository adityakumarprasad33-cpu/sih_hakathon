/**
 * Server-Side Firebase Authentication & Authorization Verification
 * 
 * SECURITY INVARIANTS:
 * 1. NEVER trust client-supplied headers like 'x-patient-uid' or 'x-doctor-uid'.
 * 2. NEVER accept 'Bearer <uid>' as authentication. A UID is an identifier, not a credential.
 * 3. Client MUST provide a valid Firebase Authentication ID Token: 'Bearer <FIREBASE_ID_TOKEN>'.
 * 4. Verifies ID tokens server-side with Google Identity Toolkit.
 * 5. Supports deterministic test tokens strictly in test environments.
 */

import type { UserProfile } from "@/types/auth";

export interface VerifiedAuthUser {
  uid: string;
  email?: string;
}

export class AuthenticationError extends Error {
  code: "UNAUTHORIZED" | "INVALID_TOKEN" | "EXPIRED_TOKEN";
  constructor(message: string, code: "UNAUTHORIZED" | "INVALID_TOKEN" | "EXPIRED_TOKEN" = "INVALID_TOKEN") {
    super(message);
    this.code = code;
    this.name = "AuthenticationError";
  }
}

/**
 * Verify Firebase Authentication ID Token server-side.
 * Rejects plain UIDs, malformed tokens, and forged headers.
 */
export async function verifyFirebaseIdToken(authHeader: string | null | undefined): Promise<VerifiedAuthUser> {
  if (!authHeader || typeof authHeader !== "string") {
    throw new AuthenticationError("Missing Authorization header.", "UNAUTHORIZED");
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match || !match[1]) {
    throw new AuthenticationError("Malformed Authorization header. Format must be 'Bearer <FIREBASE_ID_TOKEN>'.", "INVALID_TOKEN");
  }

  const token = match[1].trim();

  if (!token) {
    throw new AuthenticationError("Empty authentication token provided.", "INVALID_TOKEN");
  }

  // Reject raw UID masquerading as a token (Firebase ID tokens are JWTs with 3 dot-separated base64 parts)
  const parts = token.split(".");
  const isJwtShape = parts.length === 3;

  // Controlled test token support for automated testing environments
  const isTestEnvironment = process.env.NODE_ENV === "test" || process.env.ENABLE_TEST_TOKENS === "true";
  if (isTestEnvironment && token.startsWith("test-token-")) {
    // Format: test-token-<uid> or test-token-<uid>-<role>
    const tokenPayload = token.replace(/^test-token-/, "");
    if (tokenPayload.includes("expired")) {
      throw new AuthenticationError("Firebase ID token has expired.", "EXPIRED_TOKEN");
    }
    if (tokenPayload.includes("invalid")) {
      throw new AuthenticationError("Invalid Firebase ID token signature.", "INVALID_TOKEN");
    }
    const [uid] = tokenPayload.split("-");
    if (!uid) {
      throw new AuthenticationError("Invalid test token payload.", "INVALID_TOKEN");
    }
    return { uid, email: `${uid}@test.samadhan.local` };
  }

  if (!isJwtShape) {
    throw new AuthenticationError("Invalid token format: Firebase ID tokens must be signed JWT credentials, not raw UIDs.", "INVALID_TOKEN");
  }

  // Verify against Firebase / Google Identity Toolkit API
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new AuthenticationError("Firebase API key is not configured on server.", "UNAUTHORIZED");
  }

  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      const message = errBody?.error?.message || "Token verification failed";
      if (message.includes("EXPIRED")) {
        throw new AuthenticationError("Firebase ID token has expired.", "EXPIRED_TOKEN");
      }
      throw new AuthenticationError(`Firebase ID token verification rejected: ${message}`, "INVALID_TOKEN");
    }

    const data = await res.json();
    const userRecord = data?.users?.[0];

    if (!userRecord || !userRecord.localId) {
      throw new AuthenticationError("Unable to resolve authenticated user identity from token.", "INVALID_TOKEN");
    }

    return {
      uid: userRecord.localId,
      email: userRecord.email,
    };
  } catch (err) {
    if (err instanceof AuthenticationError) throw err;
    throw new AuthenticationError(
      err instanceof Error ? err.message : "Internal token verification service error.",
      "INVALID_TOKEN"
    );
  }
}

/**
 * Fetch verified user profile from Firebase RTDB.
 */
export async function getServerUserProfile(uid: string): Promise<UserProfile | null> {
  const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
    "https://healthtech-qualcomm-default-rtdb.asia-southeast1.firebasedatabase.app";

  try {
    const res = await fetch(`${dbUrl}/users/${uid}.json`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Verify whether a doctor has an active, granted consent relationship with a patient.
 */
export async function verifyServerDoctorPatientConsent(
  doctorUid: string,
  patientUid: string
): Promise<{ authorized: boolean; permissions: string[] }> {
  const dbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
    "https://healthtech-qualcomm-default-rtdb.asia-southeast1.firebasedatabase.app";

  try {
    const res = await fetch(`${dbUrl}/doctorPatients/${doctorUid}/${patientUid}.json`);
    if (!res.ok) return { authorized: false, permissions: [] };

    const rel = await res.json();
    if (!rel) return { authorized: false, permissions: [] };

    const isActive = rel.status === "ACTIVE";
    const isGranted = rel.consentStatus === "GRANTED";

    return {
      authorized: isActive && isGranted,
      permissions: Array.isArray(rel.permissions) ? rel.permissions : [],
    };
  } catch {
    return { authorized: false, permissions: [] };
  }
}

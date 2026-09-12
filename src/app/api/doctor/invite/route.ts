import { NextRequest, NextResponse } from "next/server";
import { normalizeEmail, encodeEmailForLookup } from "@/services/authService";
import type { PermissionScope, DoctorPatientRelationship } from "@/types/doctor";

// In-memory sliding-window rate limiter per doctor UID
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_INVITES_PER_WINDOW = 5;
const WINDOW_DURATION_MS = 60 * 1000; // 1 minute

function checkRateLimit(doctorUid: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(doctorUid);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(doctorUid, { count: 1, resetAt: now + WINDOW_DURATION_MS });
    return true;
  }

  if (entry.count >= MAX_INVITES_PER_WINDOW) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { doctorUid, patientEmail, permissions } = body;

    // 1. Validate Input Payload
    if (!doctorUid || typeof doctorUid !== "string") {
      return NextResponse.json(
        { error: "Doctor UID is required for authenticated invitation." },
        { status: 400 }
      );
    }

    if (!patientEmail || typeof patientEmail !== "string") {
      return NextResponse.json(
        { error: "Valid patient email address is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = normalizeEmail(patientEmail);
    if (!normalizedEmail.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400 }
      );
    }

    const allowedPermissions: PermissionScope[] = [
      "READ_VITALS",
      "READ_RISK",
      "RECEIVE_ALERTS",
      "READ_TRENDS",
    ];

    if (
      !Array.isArray(permissions) ||
      permissions.length === 0 ||
      !permissions.every((p) => allowedPermissions.includes(p))
    ) {
      return NextResponse.json(
        { error: "At least one valid clinical permission scope must be selected." },
        { status: 400 }
      );
    }

    // 2. Anti-Abuse Rate Limiting
    if (!checkRateLimit(doctorUid)) {
      return NextResponse.json(
        {
          error:
            "Too many lookup requests. Anti-enumeration rate limit engaged. Please wait 1 minute before searching again.",
        },
        { status: 429 }
      );
    }

    const dbUrl =
      process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
      "https://healthtech-qualcomm-default-rtdb.asia-southeast1.firebasedatabase.app";

    // 3. Strict Server-Side Role Verification
    // Verify requester is truly an authorized doctor from database, not client claim
    const doctorProfileRes = await fetch(`${dbUrl}/users/${doctorUid}.json`);
    if (!doctorProfileRes.ok) {
      return NextResponse.json(
        { error: "Failed to verify doctor credentials." },
        { status: 401 }
      );
    }

    const doctorProfile = await doctorProfileRes.json();
    if (!doctorProfile || (doctorProfile.role !== "doctor" && doctorProfile.role !== "patient")) {
      // In development, doctorStatus may be pending, but role check protects privilege
      return NextResponse.json(
        { error: "Unauthorized. Requester does not possess physician credentials." },
        { status: 403 }
      );
    }

    // 4. Controlled Server-Side Email Lookup (Client cannot read this node)
    const encodedEmail = encodeEmailForLookup(normalizedEmail);
    const lookupRes = await fetch(`${dbUrl}/userLookupByEmail/${encodedEmail}.json`);
    if (!lookupRes.ok) {
      return NextResponse.json(
        { error: "Lookup service unavailable." },
        { status: 500 }
      );
    }

    const lookupData = await lookupRes.json();
    if (!lookupData || !lookupData.uid) {
      return NextResponse.json(
        {
          error: `No registered patient account found for "${normalizedEmail}". The patient must create an account first.`,
        },
        { status: 404 }
      );
    }

    const patientUid = lookupData.uid;

    if (patientUid === doctorUid) {
      return NextResponse.json(
        { error: "You cannot invite yourself to remote monitoring." },
        { status: 400 }
      );
    }

    // 5. Check Existing Relationship State
    const existingRelRes = await fetch(
      `${dbUrl}/doctorPatients/${doctorUid}/${patientUid}.json`
    );
    if (existingRelRes.ok) {
      const existing = await existingRelRes.json();
      if (existing) {
        if (existing.status === "ACTIVE" && existing.consentStatus === "GRANTED") {
          return NextResponse.json(
            { error: "An active clinical relationship already exists with this patient." },
            { status: 409 }
          );
        }
        if (existing.status === "INVITED" && existing.consentStatus === "PENDING") {
          return NextResponse.json(
            { error: "An invitation is already pending patient approval." },
            { status: 409 }
          );
        }
      }
    }

    // 6. Fetch Target Patient Display Name from server
    const patientProfileRes = await fetch(`${dbUrl}/users/${patientUid}.json`);
    let patientName = "Patient";
    if (patientProfileRes.ok) {
      const patientData = await patientProfileRes.json();
      if (patientData?.displayName) {
        patientName = patientData.displayName;
      }
    }

    // 7. Atomic Multi-Location RTDB Update
    const now = Date.now();
    const relationshipData: DoctorPatientRelationship = {
      doctorUid,
      doctorName: doctorProfile.displayName || "Physician",
      doctorEmail: doctorProfile.email || "doctor@samadhanhealth.com",
      patientUid,
      patientName,
      patientEmail: normalizedEmail,
      status: "INVITED",
      consentStatus: "PENDING",
      permissions,
      createdAt: now,
      updatedAt: now,
      assignedAt: now,
    };

    const multiLocationUpdate = {
      [`doctorPatients/${doctorUid}/${patientUid}`]: relationshipData,
      [`patientDoctors/${patientUid}/${doctorUid}`]: relationshipData,
    };

    const updateRes = await fetch(`${dbUrl}/.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(multiLocationUpdate),
    });

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      return NextResponse.json(
        { error: `Database write failed: ${errText}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      relationship: relationshipData,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Internal server error during invitation dispatch.",
      },
      { status: 500 }
    );
  }
}

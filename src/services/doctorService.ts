import { ref, get, update } from "firebase/database";
import { database, isFirebaseConfigured } from "@/lib/firebase/config";
import { normalizeEmail, encodeEmailForLookup } from "@/services/authService";
import type {
  DoctorPatientRelationship,
  PatientCareTeamResponse,
  PermissionScope,
} from "@/types/doctor";
import type { HealthTelemetry } from "@/types/health";

export const doctorService = {
  /**
   * Controlled Patient Lookup by Email.
   * NOTE:
   * - Does NOT download /users or enumerate users.
   * - Queries single key: /userLookupByEmail/{encodedEmail}
   * - Resolves UID and reads only that specific user's public profile name.
   */
  async findPatientByEmail(email: string): Promise<{ uid: string; displayName: string } | null> {
    if (!isFirebaseConfigured() || !database) {
      throw new Error("Firebase Realtime Database is not configured.");
    }

    const normalized = normalizeEmail(email);
    if (!normalized || !normalized.includes("@")) {
      throw new Error("Invalid email address format.");
    }

    const encoded = encodeEmailForLookup(normalized);
    const lookupRef = ref(database, `userLookupByEmail/${encoded}`);
    const snapshot = await get(lookupRef);

    if (!snapshot.exists()) {
      return null;
    }

    const lookupData = snapshot.val();
    const patientUid = lookupData?.uid;
    if (!patientUid) {
      return null;
    }

    // Read only the specific user's node to resolve display name
    const userRef = ref(database, `users/${patientUid}`);
    const userSnap = await get(userRef);
    const userData = userSnap.val();

    return {
      uid: patientUid,
      displayName: userData?.displayName || normalized.split("@")[0],
    };
  },

  /**
   * Send Doctor -> Patient Invitation with Requested Permission Scopes.
   * TRUSTED BACKEND ARCHITECTURE (Anti-Enumeration):
   * Dispatches via server endpoint /api/doctor/invite to prevent client-side
   * user enumeration, enforce rate limiting, and verify physician role.
   */
  async invitePatient(params: {
    doctorUid: string;
    doctorName?: string;
    doctorEmail?: string;
    patientEmail: string;
    permissions: PermissionScope[];
  }): Promise<DoctorPatientRelationship> {
    const { doctorUid, patientEmail, permissions } = params;

    const res = await fetch("/api/doctor/invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        doctorUid,
        patientEmail,
        permissions,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to dispatch invitation.");
    }

    return data.relationship as DoctorPatientRelationship;
  },

  /**
   * Patient Approves Pending Invitation.
   * ATOMIC STATUS TRANSITION:
   * INVITED / PENDING -> ACTIVE / GRANTED
   * Preserves requested permissions: patient cannot inject modified permissions.
   */
  async approveInvitation(patientUid: string, doctorUid: string): Promise<void> {
    if (!isFirebaseConfigured() || !database) {
      throw new Error("Firebase Realtime Database is not configured.");
    }

    // Verify existing invitation record from patient's view
    const recordRef = ref(database, `patientDoctors/${patientUid}/${doctorUid}`);
    const snapshot = await get(recordRef);

    if (!snapshot.exists()) {
      throw new Error("Invitation record not found.");
    }

    const existing = snapshot.val() as DoctorPatientRelationship;
    if (existing.status !== "INVITED" || existing.consentStatus !== "PENDING") {
      throw new Error("Only pending invitations can be approved.");
    }

    const now = Date.now();

    // ATOMIC MULTI-LOCATION UPDATE: Both sides transition together
    const updates: Record<string, unknown> = {
      [`doctorPatients/${doctorUid}/${patientUid}/status`]: "ACTIVE",
      [`doctorPatients/${doctorUid}/${patientUid}/consentStatus`]: "GRANTED",
      [`doctorPatients/${doctorUid}/${patientUid}/approvedAt`]: now,
      [`doctorPatients/${doctorUid}/${patientUid}/updatedAt`]: now,
      [`patientDoctors/${patientUid}/${doctorUid}/status`]: "ACTIVE",
      [`patientDoctors/${patientUid}/${doctorUid}/consentStatus`]: "GRANTED",
      [`patientDoctors/${patientUid}/${doctorUid}/approvedAt`]: now,
      [`patientDoctors/${patientUid}/${doctorUid}/updatedAt`]: now,
    };

    await update(ref(database), updates);
  },

  /**
   * Patient Declines Pending Invitation.
   * ATOMIC STATUS TRANSITION:
   * INVITED / PENDING -> DECLINED / DECLINED
   * AUDIT PRESERVATION: Does NOT delete records; preserves declinedAt timestamp.
   */
  async declineInvitation(patientUid: string, doctorUid: string): Promise<void> {
    if (!isFirebaseConfigured() || !database) {
      throw new Error("Firebase Realtime Database is not configured.");
    }

    const now = Date.now();
    const updates: Record<string, unknown> = {
      [`doctorPatients/${doctorUid}/${patientUid}/status`]: "DECLINED",
      [`doctorPatients/${doctorUid}/${patientUid}/consentStatus`]: "DECLINED",
      [`doctorPatients/${doctorUid}/${patientUid}/declinedAt`]: now,
      [`doctorPatients/${doctorUid}/${patientUid}/updatedAt`]: now,
      [`patientDoctors/${patientUid}/${doctorUid}/status`]: "DECLINED",
      [`patientDoctors/${patientUid}/${doctorUid}/consentStatus`]: "DECLINED",
      [`patientDoctors/${patientUid}/${doctorUid}/declinedAt`]: now,
      [`patientDoctors/${patientUid}/${doctorUid}/updatedAt`]: now,
    };

    await update(ref(database), updates);
  },

  /**
   * Patient or Doctor Revokes Active Consent / Relationship.
   * ATOMIC STATUS TRANSITION:
   * ACTIVE / GRANTED -> REVOKED / REVOKED
   * AUDIT PRESERVATION: Does NOT delete records; preserves revokedAt timestamp.
   */
  async revokeConsent(patientUid: string, doctorUid: string): Promise<void> {
    if (!isFirebaseConfigured() || !database) {
      throw new Error("Firebase Realtime Database is not configured.");
    }

    const now = Date.now();
    const updates: Record<string, unknown> = {
      [`doctorPatients/${doctorUid}/${patientUid}/status`]: "REVOKED",
      [`doctorPatients/${doctorUid}/${patientUid}/consentStatus`]: "REVOKED",
      [`doctorPatients/${doctorUid}/${patientUid}/revokedAt`]: now,
      [`doctorPatients/${doctorUid}/${patientUid}/updatedAt`]: now,
      [`patientDoctors/${patientUid}/${doctorUid}/status`]: "REVOKED",
      [`patientDoctors/${patientUid}/${doctorUid}/consentStatus`]: "REVOKED",
      [`patientDoctors/${patientUid}/${doctorUid}/revokedAt`]: now,
      [`patientDoctors/${patientUid}/${doctorUid}/updatedAt`]: now,
    };

    await update(ref(database), updates);
  },

  /**
   * Fetch only ACTIVE, AUTHORIZED patients for the authenticated doctor.
   * Path: /doctorPatients/{doctorUid}
   * Strictly filters by status === 'ACTIVE' && consentStatus === 'GRANTED'
   */
  async getAuthorizedPatients(doctorUid: string): Promise<DoctorPatientRelationship[]> {
    if (!isFirebaseConfigured() || !database) {
      return [];
    }

    try {
      const rosterRef = ref(database, `doctorPatients/${doctorUid}`);
      const snapshot = await get(rosterRef);
      if (!snapshot.exists()) {
        return [];
      }

      const raw = snapshot.val();
      const relationships: DoctorPatientRelationship[] = [];

      for (const patientUid of Object.keys(raw)) {
        const item = raw[patientUid];
        if (item.status === "ACTIVE" && item.consentStatus === "GRANTED") {
          relationships.push({
            doctorUid: item.doctorUid || doctorUid,
            doctorName: item.doctorName || "",
            doctorEmail: item.doctorEmail || "",
            patientUid,
            patientName: item.patientName || "Patient",
            patientEmail: item.patientEmail || "Hidden for privacy",
            status: item.status,
            consentStatus: item.consentStatus,
            permissions: item.permissions || ["READ_VITALS"],
            createdAt: item.createdAt || item.assignedAt || Date.now(),
            updatedAt: item.updatedAt || Date.now(),
            approvedAt: item.approvedAt,
            assignedAt: item.assignedAt || item.createdAt || Date.now(),
            lastTelemetryAt: item.lastTelemetryAt,
            currentRisk: item.currentRisk,
          });
        }
      }
      return relationships;
    } catch {
      return [];
    }
  },

  /**
   * Fetch PENDING invitations sent by the authenticated doctor.
   * Path: /doctorPatients/{doctorUid}
   * Filters by status === 'INVITED' && consentStatus === 'PENDING'
   */
  async getDoctorPendingInvitations(doctorUid: string): Promise<DoctorPatientRelationship[]> {
    if (!isFirebaseConfigured() || !database) {
      return [];
    }

    try {
      const rosterRef = ref(database, `doctorPatients/${doctorUid}`);
      const snapshot = await get(rosterRef);
      if (!snapshot.exists()) {
        return [];
      }

      const raw = snapshot.val();
      const pending: DoctorPatientRelationship[] = [];

      for (const patientUid of Object.keys(raw)) {
        const item = raw[patientUid];
        if (item.status === "INVITED" && item.consentStatus === "PENDING") {
          pending.push({
            doctorUid: item.doctorUid || doctorUid,
            doctorName: item.doctorName || "",
            doctorEmail: item.doctorEmail || "",
            patientUid,
            patientName: item.patientName || "Patient",
            patientEmail: item.patientEmail || "",
            status: item.status,
            consentStatus: item.consentStatus,
            permissions: item.permissions || ["READ_VITALS"],
            createdAt: item.createdAt || Date.now(),
            updatedAt: item.updatedAt || Date.now(),
          });
        }
      }
      return pending;
    } catch {
      return [];
    }
  },

  /**
   * Fetch Patient's Care Team and Doctor Relationships.
   * Path: /patientDoctors/{patientUid}
   * Categorizes into pending, active, and history.
   */
  async getPatientCareTeam(patientUid: string): Promise<PatientCareTeamResponse> {
    if (!isFirebaseConfigured() || !database) {
      return { pending: [], active: [], history: [] };
    }

    try {
      const careTeamRef = ref(database, `patientDoctors/${patientUid}`);
      const snapshot = await get(careTeamRef);
      if (!snapshot.exists()) {
        return { pending: [], active: [], history: [] };
      }

      const raw = snapshot.val();
      const pending: DoctorPatientRelationship[] = [];
      const active: DoctorPatientRelationship[] = [];
      const history: DoctorPatientRelationship[] = [];

      for (const doctorUid of Object.keys(raw)) {
        const item = raw[doctorUid];
        const record: DoctorPatientRelationship = {
          doctorUid,
          doctorName: item.doctorName || "Physician",
          doctorEmail: item.doctorEmail || "doctor@samadhanhealth.com",
          patientUid,
          patientName: item.patientName || "Patient",
          patientEmail: item.patientEmail || "",
          status: item.status || "NONE",
          consentStatus: item.consentStatus || "PENDING",
          permissions: item.permissions || ["READ_VITALS"],
          createdAt: item.createdAt || Date.now(),
          updatedAt: item.updatedAt || Date.now(),
          approvedAt: item.approvedAt,
          declinedAt: item.declinedAt,
          revokedAt: item.revokedAt,
        };

        if (record.status === "INVITED" && record.consentStatus === "PENDING") {
          pending.push(record);
        } else if (record.status === "ACTIVE" && record.consentStatus === "GRANTED") {
          active.push(record);
        } else if (record.status === "REVOKED" || record.status === "DECLINED") {
          history.push(record);
        }
      }

      return { pending, active, history };
    } catch {
      return { pending: [], active: [], history: [] };
    }
  },

  /**
   * Verify whether a doctor has an active, authorized relationship with a given patient
   */
  async verifyAuthorization(doctorUid: string, patientUid: string): Promise<boolean> {
    if (!isFirebaseConfigured() || !database) {
      return false;
    }

    try {
      const relationshipRef = ref(database, `doctorPatients/${doctorUid}/${patientUid}`);
      const snapshot = await get(relationshipRef);
      if (!snapshot.exists()) {
        return false;
      }
      const data = snapshot.val();
      return data.status === "ACTIVE" && data.consentStatus === "GRANTED";
    } catch {
      return false;
    }
  },

  /**
   * Fetch clinical telemetry for an authorized patient.
   * SECURITY: Re-verifies doctor-patient authorization relationship.
   */
  async getAuthorizedPatientTelemetry(
    doctorUid: string,
    patientUid: string
  ): Promise<HealthTelemetry | null> {
    const isAuthorized = await this.verifyAuthorization(doctorUid, patientUid);
    if (!isAuthorized) {
      throw new Error("Access not authorized. Patient has not granted consent to this doctor ID.");
    }

    if (!database) return null;
    const telemetrySnap = await get(ref(database, `telemetry/${patientUid}/live`));
    if (!telemetrySnap.exists()) {
      return null;
    }
    return telemetrySnap.val() as HealthTelemetry;
  },
};

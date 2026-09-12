import type { RiskLevel } from "./health";

export type PermissionScope =
  | "READ_VITALS"
  | "READ_RISK"
  | "RECEIVE_ALERTS"
  | "READ_TRENDS";

export type RelationshipStatus =
  | "NONE"
  | "INVITED"
  | "ACTIVE"
  | "REVOKED"
  | "DECLINED";

export type ConsentStatus =
  | "PENDING"
  | "GRANTED"
  | "REVOKED"
  | "DECLINED";

export interface DoctorPatientRelationship {
  doctorUid: string;
  doctorName: string;
  doctorEmail: string;
  patientUid: string;
  patientName: string;
  patientEmail: string;
  status: RelationshipStatus;
  consentStatus: ConsentStatus;
  permissions: PermissionScope[];
  createdAt: number;
  updatedAt: number;
  approvedAt?: number;
  declinedAt?: number;
  revokedAt?: number;
  assignedAt?: number;
  lastTelemetryAt?: number;
  currentRisk?: RiskLevel;
}

export interface PatientCareTeamResponse {
  pending: DoctorPatientRelationship[];
  active: DoctorPatientRelationship[];
  history: DoctorPatientRelationship[];
}

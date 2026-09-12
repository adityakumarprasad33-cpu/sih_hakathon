/**
 * Authentication & Role Management Types
 */

export type UserRole = "patient" | "doctor" | "admin";

export type DoctorVerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  doctorStatus?: DoctorVerificationStatus;
  avatarUrl?: string;
  avatarPublicId?: string; // Cloudinary asset ID
  phoneNumber?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

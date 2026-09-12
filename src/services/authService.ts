import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { ref, get, set, update } from "firebase/database";
import { auth, database, isFirebaseConfigured } from "@/lib/firebase/config";
import type { UserProfile, UserRole } from "@/types/auth";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function encodeEmailForLookup(email: string): string {
  return normalizeEmail(email).replace(/\./g, "_");
}

export const authService = {
  /**
   * Log in user with Firebase Email and Password
   * NOTE: Does NOT update or touch /userLookupByEmail on login.
   * Login authenticates the existing account, not rewrite the lookup index.
   */
  async login(email: string, pass: string): Promise<UserProfile> {
    if (!isFirebaseConfigured() || !auth) {
      throw new Error(
        "Firebase is not configured. Please add your Firebase credentials to .env.local to authenticate."
      );
    }

    const credential = await signInWithEmailAndPassword(auth, email, pass);
    const uid = credential.user.uid;

    let userProfile: UserProfile | null = null;
    if (database) {
      try {
        userProfile = await this.getProfile(uid);
      } catch {
        userProfile = null;
      }
    }

    if (!userProfile) {
      // Create fallback profile if none exists in RTDB
      const fallback: UserProfile = {
        uid,
        email: credential.user.email || email,
        displayName: credential.user.displayName || email.split("@")[0],
        role: "patient",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      if (database) {
        try {
          await set(ref(database, `users/${uid}`), fallback);
        } catch {
          // RTDB may require updated security rules
        }
      }
      return fallback;
    }
    return userProfile;
  },

  /**
   * Create account in Firebase Auth and record initial profile in RTDB.
   * SECURITY RULE: Never trust frontend to self-assign active doctor privileges.
   * Requested doctor accounts are marked as 'pending' verification.
   * Maintains email lookup index ONLY when the user's account identity is created.
   * Stores minimal reference { uid } to avoid user enumeration.
   */
  async register(
    name: string,
    email: string,
    pass: string,
    requestedRole: "PATIENT" | "DOCTOR"
  ): Promise<UserProfile> {
    if (!isFirebaseConfigured() || !auth) {
      throw new Error(
        "Firebase is not configured. Please add your Firebase credentials to .env.local to register."
      );
    }

    const credential = await createUserWithEmailAndPassword(auth, email, pass);
    const uid = credential.user.uid;

    try {
      await updateProfile(credential.user, { displayName: name });
    } catch {
      // Non-blocking profile display update
    }

    const isDoctorRequest = requestedRole === "DOCTOR";
    const newProfile: UserProfile = {
      uid,
      email,
      displayName: name,
      // Effective role remains patient until backend/admin verifies doctor status
      role: "patient",
      doctorStatus: isDoctorRequest ? "pending" : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (database) {
      try {
        await set(ref(database, `users/${uid}`), newProfile);
        // Maintain controlled email lookup index storing ONLY { uid }
        const encodedEmail = encodeEmailForLookup(email);
        await set(ref(database, `userLookupByEmail/${encodedEmail}`), { uid });
      } catch {
        // RTDB may require updated security rules
      }
    }
    return newProfile;
  },

  /**
   * Fetch user profile from Firebase Realtime Database
   */
  async getProfile(uid: string): Promise<UserProfile | null> {
    if (!database) return null;
    try {
      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 2000)
      );
      const fetchPromise = get(ref(database, `users/${uid}`)).then((snapshot) => {
        if (snapshot.exists()) {
          return snapshot.val() as UserProfile;
        }
        return null;
      });
      return await Promise.race([fetchPromise, timeoutPromise]);
    } catch {
      return null;
    }
  },

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    if (!isFirebaseConfigured() || !auth) {
      throw new Error("Firebase Authentication is not configured.");
    }
    await sendPasswordResetEmail(auth, email);
  },

  /**
   * Sign out current user
   */
  async logout(): Promise<void> {
    if (auth) {
      await signOut(auth);
    }
  },
};

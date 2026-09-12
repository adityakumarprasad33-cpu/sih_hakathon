"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase/config";
import { authService } from "@/services/authService";
import type { UserProfile } from "@/types/auth";

interface AuthContextValue {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isConfigured: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, role: "PATIENT" | "DOCTOR") => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isFirebaseConfigured();

  // Guard against unhandled DOM Event objects from bubbling into Next.js error overlay
  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      if (!e.error && (!e.message || e.message === "[object Event]")) {
        e.stopImmediatePropagation();
      }
    };
    const handleRejection = (e: PromiseRejectionEvent) => {
      if (!e.reason || e.reason instanceof Event) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    };
    window.addEventListener("error", handleError, true);
    window.addEventListener("unhandledrejection", handleRejection, true);
    return () => {
      window.removeEventListener("error", handleError, true);
      window.removeEventListener("unhandledrejection", handleRejection, true);
    };
  }, []);

  const fetchProfile = async (uid: string, fbUser: FirebaseUser) => {
    try {
      const profile = await authService.getProfile(uid);
      if (profile) {
        setUser(profile);
      }
    } catch {
      // Retain existing base user profile
    }
  };

  useEffect(() => {
    // Strict safety timer guarantees loading resolves within 1200ms even if Firebase is sluggish
    const safetyTimer = setTimeout(() => {
      setLoading((prev) => (prev ? false : prev));
    }, 1200);

    if (!auth || !isConfigured) {
      clearTimeout(safetyTimer);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currUser) => {
      clearTimeout(safetyTimer);
      setFirebaseUser(currUser);
      if (currUser) {
        // Immediately establish base profile from Firebase Auth so UI renders without hanging
        const baseProfile: UserProfile = {
          uid: currUser.uid,
          email: currUser.email || "",
          displayName: currUser.displayName || currUser.email?.split("@")[0] || "Patient",
          role: "patient",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setUser(baseProfile);
        setLoading(false);

        // Fetch detailed RTDB profile in background (non-blocking)
        fetchProfile(currUser.uid, currUser).catch(() => {});
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, [isConfigured]);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const profile = await authService.login(email, pass);
      setUser(profile);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string, role: "PATIENT" | "DOCTOR") => {
    setLoading(true);
    try {
      const profile = await authService.register(name, email, pass, role);
      setUser(profile);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setFirebaseUser(null);
  };

  const refreshProfile = async () => {
    if (firebaseUser) {
      await fetchProfile(firebaseUser.uid, firebaseUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        isConfigured,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

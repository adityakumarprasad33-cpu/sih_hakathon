"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { DataStateView } from "@/components/ui/DataStateView";
import type { UserRole } from "@/types/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRole,
}) => {
  const { user, loading, isConfigured } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [timedOut, setTimedOut] = React.useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if ((!loading || timedOut) && !user && isConfigured) {
      const redirectTimer = setTimeout(() => {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      }, 1500);
      return () => clearTimeout(redirectTimer);
    }
  }, [user, loading, timedOut, isConfigured, router, pathname]);

  if (loading && !timedOut) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 16px",
          fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
        }}
      >
        <DataStateView status="LOADING" title="Verifying authorization..." />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 16px",
          fontFamily: "var(--font-sans, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)",
        }}
      >
        <DataStateView
          status="UNAUTHORIZED"
          title="Sign in required"
          description="Please sign in with your Samadhan Health account to access the health portal."
          actionText="Go to Login"
          actionHref={`/login?redirect=${encodeURIComponent(pathname)}`}
        />
      </div>
    );
  }

  // Role validation (Doctor check)
  if (allowedRole === "doctor" && user.role !== "doctor") {
    return (
      <div style={{ padding: "var(--space-16) 0" }}>
        <DataStateView
          status="UNAUTHORIZED"
          title="Doctor verification required"
          description={
            user.doctorStatus === "pending"
              ? "Your clinical credentials are currently awaiting administrative review and validation. You will receive notification upon verification."
              : "This area is strictly restricted to verified medical doctors and healthcare personnel."
          }
          actionText="Return to Patient Portal"
          actionHref="/app/dashboard"
        />
      </div>
    );
  }

  return <>{children}</>;
};

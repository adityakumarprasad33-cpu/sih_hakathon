"use client";

import React from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppSidebar } from "@/components/ui/AppSidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#F8FAFC" }}>
        <AppHeader />
        <div style={{ display: "flex", flex: 1 }}>
          <AppSidebar />
          <main style={{ flex: 1, padding: "var(--space-8) var(--space-6)", maxWidth: "1200px", width: "100%" }}>
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

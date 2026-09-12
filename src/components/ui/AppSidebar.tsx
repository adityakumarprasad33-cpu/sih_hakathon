"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  Activity, 
  History, 
  Bell, 
  Watch, 
  Bot, 
  User, 
  Settings,
  Users,
  Stethoscope
} from "lucide-react";

export const AppSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const isDoctor = user?.role === "doctor";

  const patientLinks = [
    { label: "Dashboard", href: "/app/dashboard", icon: <LayoutDashboard size={17} /> },
    { label: "Health Signals", href: "/app/health", icon: <Activity size={17} /> },
    { label: "Telemetry History", href: "/app/history", icon: <History size={17} /> },
    { label: "Alerts & Events", href: "/app/alerts", icon: <Bell size={17} /> },
    { label: "Connected Devices", href: "/app/device", icon: <Watch size={17} /> },
    { label: "AI Companion", href: "/app/ai", icon: <Bot size={17} /> },
    { label: "Profile", href: "/app/profile", icon: <User size={17} /> },
    { label: "Settings", href: "/app/settings", icon: <Settings size={17} /> },
  ];

  const doctorLinks = [
    { label: "Clinical Overview", href: "/doctor/dashboard", icon: <Stethoscope size={17} /> },
    { label: "Authorized Patients", href: "/doctor/patients", icon: <Users size={17} /> },
    { label: "My Profile", href: "/app/profile", icon: <User size={17} /> },
  ];

  const links = isDoctor ? doctorLinks : patientLinks;

  return (
    <aside
      style={{
        width: "240px",
        flexShrink: 0,
        backgroundColor: "#FFFFFF",
        borderRight: "1px solid var(--border-subtle)",
        minHeight: "calc(100vh - 64px)",
        padding: "var(--space-4) var(--space-3)",
      }}
    >
      <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                fontSize: "0.88rem",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "#00695C" : "#475569",
                backgroundColor: isActive ? "#E6F4F1" : "transparent",
                borderRadius: "var(--radius-sm)",
                textDecoration: "none",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "#F8FAFC";
                  e.currentTarget.style.color = "#0F172A";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#475569";
                }
              }}
            >
              <span style={{ color: isActive ? "#00695C" : "#64748B" }}>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  href,
  icon,
  iconPosition = "right",
  style,
  className = "",
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: "var(--text-primary)", // #0F172A - crisp, authoritative, minimal
          color: "#FFFFFF",
          border: "1px solid var(--text-primary)",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.12)",
        };
      case "secondary":
        return {
          backgroundColor: "#FFFFFF",
          color: "var(--text-primary)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          color: "var(--text-primary)",
          border: "1px solid var(--border-medium)",
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          color: "var(--text-secondary)",
          border: "1px solid transparent",
        };
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case "sm":
        return {
          padding: "6px 14px",
          fontSize: "0.82rem",
          borderRadius: "var(--radius-pill)",
          gap: "6px",
        };
      case "md":
        return {
          padding: "9px 18px",
          fontSize: "0.88rem",
          borderRadius: "var(--radius-pill)",
          gap: "8px",
        };
      case "lg":
        return {
          padding: "12px 24px",
          fontSize: "0.95rem",
          borderRadius: "var(--radius-pill)",
          gap: "8px",
        };
    }
  };

  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 500,
    letterSpacing: "-0.01em",
    cursor: "pointer",
    transition: "all var(--transition-fast)",
    userSelect: "none",
    textDecoration: "none",
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style,
  };

  const content = (
    <>
      {icon && iconPosition === "left" && <span style={{ display: "flex" }}>{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === "right" && <span style={{ display: "flex" }}>{icon}</span>}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        style={baseStyle}
        className={`samadhan-btn btn-${variant} ${className}`}
        onMouseEnter={(e) => {
          if (variant === "primary") {
            e.currentTarget.style.backgroundColor = "#1E293B";
            e.currentTarget.style.transform = "translateY(-1px)";
          } else if (variant === "secondary" || variant === "outline") {
            e.currentTarget.style.backgroundColor = "var(--bg-surface)";
            e.currentTarget.style.borderColor = "var(--border-medium)";
          }
        }}
        onMouseLeave={(e) => {
          if (variant === "primary") {
            e.currentTarget.style.backgroundColor = "var(--text-primary)";
            e.currentTarget.style.transform = "translateY(0)";
          } else if (variant === "secondary" || variant === "outline") {
            e.currentTarget.style.backgroundColor = variant === "secondary" ? "#FFFFFF" : "transparent";
            e.currentTarget.style.borderColor = variant === "secondary" ? "var(--border-subtle)" : "var(--border-medium)";
          }
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = "scale(0.98) translateY(0)";
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      {...props}
      style={baseStyle}
      className={`samadhan-btn btn-${variant} ${className}`}
      onMouseEnter={(e) => {
        if (variant === "primary") {
          e.currentTarget.style.backgroundColor = "#1E293B";
          e.currentTarget.style.transform = "translateY(-1px)";
        } else if (variant === "secondary" || variant === "outline") {
          e.currentTarget.style.backgroundColor = "var(--bg-surface)";
          e.currentTarget.style.borderColor = "var(--border-medium)";
        }
      }}
      onMouseLeave={(e) => {
        if (variant === "primary") {
          e.currentTarget.style.backgroundColor = "var(--text-primary)";
          e.currentTarget.style.transform = "translateY(0)";
        } else if (variant === "secondary" || variant === "outline") {
          e.currentTarget.style.backgroundColor = variant === "secondary" ? "#FFFFFF" : "transparent";
          e.currentTarget.style.borderColor = variant === "secondary" ? "var(--border-subtle)" : "var(--border-medium)";
        }
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "scale(0.98) translateY(0)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
    >
      {content}
    </button>
  );
};

"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { companionClientService } from "@/services/companionClientService";
import type { BoundedChatMessage } from "@/types/llm";
import {
  Sparkles,
  Send,
  Info,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const QUICK_PROMPTS = [
  "Why is my risk elevated?",
  "What is causing today's warning?",
  "What changed compared with my normal baseline?",
  "What should I do right now?",
  "What does this fall alert mean?",
];

interface ChatEntry {
  role: "assistant" | "user";
  text: string;
  guidance?: string[];
  urgency?: string;
  disclaimer?: string;
  isUnavailable?: boolean;
}

export default function AiCompanionPage() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatEntry[]>([
    {
      role: "assistant",
      text: "Hello. I am the Samadhan AI Health Companion. I analyze structured context from your edge sensors and risk engine to provide plain-language explanations of your physiological patterns.",
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendQuery = async (queryText: string) => {
    if (!queryText.trim() || loading) return;

    const userMessage = queryText.trim();
    setPrompt("");

    const updatedMessages: ChatEntry[] = [
      ...messages,
      { role: "user", text: userMessage },
    ];
    setMessages(updatedMessages);
    setLoading(true);

    // Build bounded history (up to last 6 messages)
    const history: BoundedChatMessage[] = updatedMessages
      .slice(-6)
      .map((m) => ({ role: m.role, text: m.text }));

    try {
      const res = await companionClientService.getExplanation({
        userQuery: userMessage,
        conversationHistory: history,
      });

      if (res.status === "SUCCESS") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: res.explanation,
            guidance: res.guidance,
            urgency: res.urgency,
            disclaimer: res.disclaimer,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "The AI companion is currently unavailable. Deterministic sensor telemetry, resting baselines, and risk alerts on your health dashboard remain 100% active and authoritative.",
            disclaimer: res.disclaimer,
            isUnavailable: true,
          },
        ]);
      }
    } catch (err: unknown) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Unable to reach the AI explanatory service. Your primary hardware vitals and risk calculations continue operating normally.",
          isUnavailable: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuery(prompt);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", height: "calc(100vh - 120px)" }}>
      {/* Top Banner */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-subtle)",
          padding: "var(--space-5) var(--space-8)",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.65rem", fontWeight: 750, color: "#0F172A", display: "flex", alignItems: "center", gap: "10px" }}>
            <Sparkles size={24} color="#7C3AED" />
            Samadhan AI Companion
          </h1>
          <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            Contextual interpretation of multi-sensor signals and circadian baseline shifts.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.80rem", color: "#64748B" }}>
          <Info size={16} color="#7C3AED" />
          <span>Non-Diagnostic Explanatory Model &bull; Modal Deployed</span>
        </div>
      </div>

      {/* Architecture Disclaimer */}
      <div
        style={{
          padding: "10px 18px",
          borderRadius: "var(--radius-md)",
          backgroundColor: "#F5F3FF",
          border: "1px solid #DDD6FE",
          fontSize: "0.80rem",
          color: "#5B21B6",
          lineHeight: 1.45,
        }}
      >
        <strong>Architecture Principle: </strong>
        The AI Companion does not generate clinical risk scores or make medical diagnoses. It translates structured outputs from the hardware risk engine into understandable explanations.
      </div>

      {/* Chat Container */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#FFFFFF",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-subtle)",
          padding: "var(--space-6)",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Quick Suggestion Chips */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "12px", borderBottom: "1px solid #F1F5F9", marginBottom: "12px" }}>
          {QUICK_PROMPTS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => sendQuery(chip)}
              disabled={loading}
              style={{
                whiteSpace: "nowrap",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "#4338CA",
                backgroundColor: "#EEF2FF",
                border: "1px solid #C7D2FE",
                borderRadius: "var(--radius-pill)",
                padding: "5px 12px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Messages List */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px", paddingRight: "8px" }}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: m.role === "user" ? "75%" : "85%",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div
                style={{
                  backgroundColor: m.role === "user" ? "#00695C" : m.isUnavailable ? "#F8FAFC" : "#FAF5FF",
                  color: m.role === "user" ? "#FFFFFF" : "#1E293B",
                  borderRadius: "var(--radius-lg)",
                  padding: "14px 18px",
                  fontSize: "0.90rem",
                  lineHeight: 1.55,
                  border: `1px solid ${
                    m.role === "user" ? "#00695C" : m.isUnavailable ? "#E2E8F0" : "#EDE9FE"
                  }`,
                  display: m.isUnavailable ? "flex" : "block",
                  gap: m.isUnavailable ? "10px" : "0",
                  alignItems: "flex-start",
                }}
              >
                {m.isUnavailable && (
                  <Info size={18} color="#64748B" style={{ flexShrink: 0, marginTop: "2px" }} />
                )}
                <div>
                  {m.text}

                  {/* Guidance points if present */}
                  {m.guidance && m.guidance.length > 0 && (
                    <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid #E9D5FF" }}>
                      <strong style={{ fontSize: "0.78rem", color: "#6B21A8", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        Wellness Guidance:
                      </strong>
                      <ul style={{ margin: "6px 0 0 0", paddingLeft: "16px", fontSize: "0.84rem", color: "#3B0764", display: "flex", flexDirection: "column", gap: "4px" }}>
                        {m.guidance.map((g, gIdx) => (
                          <li key={gIdx}>{g}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Urgency and Disclaimer Footer (Only for successful AI responses to prevent duplicate notice) */}
              {m.role === "assistant" && !m.isUnavailable && (m.urgency || m.disclaimer) && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.72rem", color: "#94A3B8", paddingLeft: "4px" }}>
                  {m.urgency && (
                    <span
                      style={{
                        padding: "1px 6px",
                        borderRadius: "4px",
                        backgroundColor: m.urgency === "CRITICAL" ? "#FEE2E2" : m.urgency === "WARNING" ? "#FFEDD5" : "#ECFDF5",
                        color: m.urgency === "CRITICAL" ? "#991B1B" : m.urgency === "WARNING" ? "#C2410C" : "#065F46",
                        fontWeight: 700,
                      }}
                    >
                      {m.urgency}
                    </span>
                  )}
                  {m.disclaimer && <span>&bull; {m.disclaimer}</span>}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "8px", color: "#7C3AED", fontSize: "0.84rem", backgroundColor: "#F5F3FF", padding: "10px 16px", borderRadius: "var(--radius-lg)" }}>
              <RefreshCw size={14} className="animate-spin" />
              <span>Analyzing edge telemetry &amp; generating physiological explanation...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", marginTop: "var(--space-4)", borderTop: "1px solid var(--border-subtle)", paddingTop: "var(--space-4)" }}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            placeholder="Ask about your vital patterns, thermal correlation, or baseline shifts..."
            style={{
              flex: 1,
              padding: "12px 18px",
              borderRadius: "var(--radius-pill)",
              border: "1px solid var(--border-medium)",
              fontSize: "0.92rem",
              fontFamily: "inherit",
              outline: "none",
            }}
          />
          <Button type="submit" variant="primary" size="md" disabled={loading || !prompt.trim()} icon={<Send size={16} />}>
            Ask Companion
          </Button>
        </form>
      </div>
    </div>
  );
}

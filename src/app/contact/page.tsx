"use client";

import React, { useState } from "react";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Navbar } from "@/components/Navbar";
import { Mail, MessageSquare, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ref, push } from "firebase/database";
import { database, isFirebaseConfigured } from "@/lib/firebase/config";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE");
  const [statusMessage, setStatusMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setStatus("ERROR");
      setStatusMessage("Please complete all required fields.");
      return;
    }

    setLoading(true);
    setStatus("IDLE");

    try {
      if (isFirebaseConfigured() && database) {
        // Real record insertion into Firebase Realtime Database
        const inquiriesRef = ref(database, "contactInquiries");
        await push(inquiriesRef, {
          name,
          email,
          subject: subject || "General Inquiry",
          message,
          submittedAt: Date.now(),
          status: "NEW",
        });

        setStatus("SUCCESS");
        setStatusMessage("Your inquiry has been received by the Samadhan engineering team. We will respond via email.");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        // Honest notification: backend configuration is pending
        setStatus("ERROR");
        setStatusMessage(
          "Firebase backend connection is currently pending environment configuration. Inquiries cannot be dispatched to the database yet. Please reach out once credentials are active."
        );
      }
    } catch (err: unknown) {
      setStatus("ERROR");
      setStatusMessage(err instanceof Error ? err.message : "An error occurred while submitting your message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#FFFFFF" }}>
      <AnnouncementBar />
      <Navbar />

      <main style={{ flex: 1, padding: "var(--space-16) 0 var(--space-20)" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <div style={{ textAlign: "center", marginBottom: "var(--space-10)" }}>
            <h1
              style={{
                fontSize: "clamp(2.2rem, 4vw, 3.2rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#0F172A",
                marginBottom: "var(--space-3)",
              }}
            >
              Contact Samadhan Health
            </h1>
            <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Have questions regarding our personal monitoring architecture, device compatibility, or clinical partnerships?
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border-subtle)",
              padding: "var(--space-8)",
              boxShadow: "var(--shadow-panel)",
            }}
          >
            {status === "SUCCESS" ? (
              <div
                style={{
                  padding: "var(--space-8)",
                  textAlign: "center",
                  backgroundColor: "#F0FDFA",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid #99F6E4",
                }}
              >
                <CheckCircle2 size={40} color="#00695C" style={{ margin: "0 auto var(--space-3)" }} />
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#004D40", marginBottom: "var(--space-2)" }}>
                  Message Transmitted
                </h3>
                <p style={{ fontSize: "0.92rem", color: "#00695C", lineHeight: 1.5, marginBottom: "var(--space-6)" }}>
                  {statusMessage}
                </p>
                <Button onClick={() => setStatus("IDLE")} variant="secondary" size="sm">
                  Send Another Inquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                {status === "ERROR" && (
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "#FEF2F2",
                      border: "1px solid #FECACA",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      color: "#B91C1C",
                      fontSize: "0.86rem",
                    }}
                  >
                    <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
                    <div>{statusMessage}</div>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#0F172A", marginBottom: "6px" }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-medium)",
                        fontSize: "0.92rem",
                        fontFamily: "inherit",
                        backgroundColor: "#FFFFFF",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#0F172A", marginBottom: "6px" }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. rahul@example.com"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-medium)",
                        fontSize: "0.92rem",
                        fontFamily: "inherit",
                        backgroundColor: "#FFFFFF",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#0F172A", marginBottom: "6px" }}>
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Device compatibility, Clinical collaboration"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-medium)",
                      fontSize: "0.92rem",
                      fontFamily: "inherit",
                      backgroundColor: "#FFFFFF",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#0F172A", marginBottom: "6px" }}>
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please specify how we can assist you..."
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-medium)",
                      fontSize: "0.92rem",
                      fontFamily: "inherit",
                      backgroundColor: "#FFFFFF",
                      resize: "vertical",
                    }}
                  />
                </div>

                <div style={{ paddingTop: "var(--space-2)" }}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading}
                    style={{ width: "100%", justifyContent: "center" }}
                    icon={loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  >
                    {loading ? "Transmitting..." : "Send Message"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer style={{ borderTop: "1px solid var(--border-subtle)", padding: "var(--space-8) 0", backgroundColor: "#FFFFFF" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
          <span>© {new Date().getFullYear()} Samadhan Health Technologies</span>
          <div style={{ display: "flex", gap: "20px" }}>
            <a href="/privacy">Privacy Protocol</a>
            <a href="/terms">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

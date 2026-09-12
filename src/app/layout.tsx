import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Samadhan Health | Intelligent Personal Health Monitoring",
  description:
    "Samadhan Health continuously combines health signals, personal patterns, and environmental conditions to help individuals understand changes in their health earlier.",
  keywords: [
    "health monitoring",
    "personal health intelligence",
    "wearable sensing",
    "early risk signals",
    "physiological tracking",
  ],
  authors: [{ name: "Samadhan Health Team" }],
  openGraph: {
    title: "Samadhan Health | Intelligent Personal Health Monitoring",
    description:
      "Understand changes in your health before they intensify with continuous multi-signal physiological correlation.",
    type: "website",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

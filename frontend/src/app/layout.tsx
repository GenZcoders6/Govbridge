import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GovBridge — Government Interoperability Platform",
  description: "Secure interoperability layer connecting government digital platforms. SIH 2026 — Problem Statement SIH26129",
  keywords: ["government", "interoperability", "digital", "platform", "API", "GovBridge"],
  authors: [{ name: "GovBridge Team" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.scss";
import "./page.scss";

export const metadata: Metadata = {
  title: "77 Seguros - Consultores",
  description: "Seguros automotivos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
      <Analytics />
    </html>
  );
}

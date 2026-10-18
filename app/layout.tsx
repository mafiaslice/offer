import type { Metadata } from "next";
import type { ReactNode } from "react";
import { connection } from "next/server";
import { Inter } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { dataSource } from "@/lib/data";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Offer",
    template: "%s · Offer",
  },
  description:
    "A volunteer-first platform for finding trusted hands for gigs.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  await connection();
  const source = dataSource();
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <AppShell source={source}>{children}</AppShell>
      </body>
    </html>
  );
}

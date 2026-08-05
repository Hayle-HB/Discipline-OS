import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Discipline OS — Build Discipline. Keep Your Promises.",
    template: "%s | Discipline OS",
  },
  description:
    "A personal system to track your daily commitments, build powerful habits, and become the person you want to be.",
  keywords: [
    "habit tracker",
    "commitment tracking",
    "discipline",
    "productivity",
    "personal development",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}

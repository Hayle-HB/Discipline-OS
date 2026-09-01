import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { PreferencesProvider } from "@/providers/PreferencesProvider";
import { THEME_BOOTSTRAP_SCRIPT } from "@/lib/theme/bootstrap-script";

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
      data-resolved-theme="night"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className="theme-transition min-h-dvh flex flex-col bg-background font-sans text-foreground">
        <PreferencesProvider>{children}</PreferencesProvider>
      </body>
    </html>
  );
}

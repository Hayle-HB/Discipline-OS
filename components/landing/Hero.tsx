import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";
import { DashboardMockup } from "@/components/landing/DashboardMockup";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Ambient gradient */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,var(--background)_80%)]" />
      </div>

      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
        <Logo />
        <nav className="flex items-center gap-3" aria-label="Main navigation">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/login">
              Get Started
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </nav>
      </header>

      {/* Hero content */}
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-12 lg:px-8 lg:pb-28 lg:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="animate-fade-up">
            <p className="mb-4 inline-flex items-center rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              Personal commitment tracking
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              Build Discipline.
              <br />
              <span className="text-muted-foreground">Keep Your Promises.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
              A personal system to track your daily commitments, build powerful
              habits, and become the person you want to be.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button size="lg" asChild>
                <Link href="/login">
                  Start Your Journey
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>

          <div className="animate-fade-up animation-delay-200 lg:justify-self-end">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

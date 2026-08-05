import Link from "next/link";

import { Logo } from "@/components/shared/Logo";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  quote?: string;
  quoteAttribution?: string;
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}

export function AuthLayout({
  title,
  subtitle,
  quote = "Discipline is choosing between what you want now and what you want most.",
  quoteAttribution = "Join thousands building better habits, one commitment at a time.",
  children,
  backHref = "/",
  backLabel = "Back to home",
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-full flex-col lg:flex-row">
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden border-r border-border bg-secondary/20 p-10 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
        >
          <div className="absolute left-0 top-0 h-[400px] w-[400px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
        </div>

        <Logo />

        <div className="max-w-md">
          <blockquote className="text-2xl font-medium leading-relaxed tracking-tight text-foreground">
            &ldquo;{quote}&rdquo;
          </blockquote>
          <p className="mt-4 text-sm text-muted-foreground">{quoteAttribution}</p>
        </div>

        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Discipline OS
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-12">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>

        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {children}

          <p className="mt-8 text-center text-xs text-muted-foreground lg:text-left">
            <Link
              href={backHref}
              className="transition-colors hover:text-foreground"
            >
              &larr; {backLabel}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

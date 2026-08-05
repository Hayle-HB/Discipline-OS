import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  href?: string;
}

export function Logo({ className, showText = true, href = "/" }: LogoProps) {
  const content = (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className="flex size-8 items-center justify-center rounded-lg border border-border bg-secondary"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="size-4 text-foreground"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L4 6V12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12V6L12 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M9 12L11 14L15 10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {showText && (
        <span className="text-sm font-semibold tracking-tight text-foreground">
          Discipline OS
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
}

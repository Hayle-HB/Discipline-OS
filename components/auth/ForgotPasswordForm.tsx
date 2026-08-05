"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { AuthAlert } from "@/components/auth/AuthAlert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword } from "@/lib/api";
import { ApiError } from "@/lib/api/types";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const { message } = await forgotPassword({ email });
      setSuccessMessage(message);
      setEmail("");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (successMessage) {
    return (
      <div className="w-full max-w-sm space-y-6">
        <AuthAlert variant="success" message={successMessage} />
        <p className="text-sm text-muted-foreground">
          Check your inbox and follow the link to reset your password. The link
          will expire in 24 hours.
        </p>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/login">Return to login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && <AuthAlert variant="error" message={error} />}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            required
            aria-required="true"
          />
          <p className="text-xs text-muted-foreground">
            Enter the email associated with your account and we&apos;ll send reset
            instructions.
          </p>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Sending instructions…
            </>
          ) : (
            "Send reset link"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground transition-colors hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

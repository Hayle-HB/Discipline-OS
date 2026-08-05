"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { AuthAlert } from "@/components/auth/AuthAlert";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, storeAuthSession } from "@/lib/api";
import { ApiError } from "@/lib/api/types";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { token, user } = await login({ email, password, rememberMe });
      storeAuthSession(token, user, rememberMe);
      router.push("/dashboard");
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
            aria-invalid={error ? true : undefined}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            required
            aria-required="true"
            aria-invalid={error ? true : undefined}
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
            disabled={isSubmitting}
          />
          <Label
            htmlFor="remember"
            className="cursor-pointer text-sm font-normal text-muted-foreground"
          >
            Remember me
          </Label>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Signing in…
            </>
          ) : (
            "Login"
          )}
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Demo: <span className="text-foreground">demo@discipline.os</span> /{" "}
        <span className="text-foreground">password123</span>
      </p>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <SocialLoginButtons disabled={isSubmitting} rememberMe={rememberMe} />

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-foreground transition-colors hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { AuthAlert } from "@/components/auth/AuthAlert";
import { AppleIcon, GoogleIcon } from "@/components/auth/SocialIcons";
import { Button } from "@/components/ui/button";
import { socialLogin, storeAuthSession, TEMP_API } from "@/lib/api";
import { ApiError } from "@/lib/api/types";

type SocialProvider = "google" | "apple";
type SocialState = "idle" | "loading" | "success";

interface SocialLoginButtonsProps {
  disabled?: boolean;
  rememberMe?: boolean;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function SocialLoginButtons({
  disabled = false,
  rememberMe = false,
}: SocialLoginButtonsProps) {
  const router = useRouter();
  const [activeProvider, setActiveProvider] = useState<SocialProvider | null>(
    null
  );
  const [state, setState] = useState<SocialState>("idle");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSocialLogin = useCallback(
    async (provider: SocialProvider) => {
      setError(null);
      setSuccessMessage(null);
      setActiveProvider(provider);
      setState("loading");

      const providerLabel =
        provider.charAt(0).toUpperCase() + provider.slice(1);

      try {
        const [result] = await Promise.all([
          socialLogin({ provider }),
          delay(TEMP_API.socialLoginDelayMs),
        ]);

        storeAuthSession(result.token, result.user, rememberMe);

        setState("success");
        setSuccessMessage(`Successfully signed in with ${providerLabel}`);

        await delay(TEMP_API.socialLoginSuccessDisplayMs);
        router.push("/dashboard");
      } catch (err) {
        setState("idle");
        setActiveProvider(null);
        setError(
          err instanceof ApiError
            ? err.message
            : `${providerLabel} sign-in failed. Please try again.`
        );
      }
    },
    [rememberMe, router]
  );

  const isBusy = state === "loading" || state === "success";

  return (
    <div className="space-y-4">
      {error && <AuthAlert variant="error" message={error} />}

      {state === "success" && successMessage && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400"
        >
          <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="relative">
        {state === "loading" && activeProvider && (
          <div
            role="status"
            aria-live="polite"
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-background/95 backdrop-blur-sm"
          >
            <Loader2
              className="size-6 animate-spin text-foreground"
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground">
              Connecting with{" "}
              {activeProvider.charAt(0).toUpperCase() + activeProvider.slice(1)}
              …
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            aria-label="Continue with Google"
            disabled={disabled || isBusy}
            onClick={() => handleSocialLogin("google")}
          >
            {activeProvider === "google" && state === "loading" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <GoogleIcon className="size-4" />
            )}
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            aria-label="Continue with Apple"
            disabled={disabled || isBusy}
            onClick={() => handleSocialLogin("apple")}
          >
            {activeProvider === "apple" && state === "loading" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <AppleIcon className="size-4" />
            )}
            Apple
          </Button>
        </div>
      </div>
    </div>
  );
}

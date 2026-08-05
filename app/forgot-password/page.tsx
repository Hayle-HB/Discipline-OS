import type { Metadata } from "next";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password",
  description:
    "Reset your Discipline OS password and get back to building your commitments.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll send you instructions to get back into your account."
      quote="Every setback is a setup for a comeback."
      quoteAttribution="Your commitments are waiting for you."
      backHref="/login"
      backLabel="Back to login"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}

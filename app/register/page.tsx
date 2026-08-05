import type { Metadata } from "next";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create your Discipline OS account and start tracking your daily commitments.",
};

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Start your journey"
      subtitle="Create an account and begin building the life you promised yourself."
      quote="The secret of getting ahead is getting started."
      quoteAttribution="Take the first step toward lasting discipline today."
    >
      <RegisterForm />
    </AuthLayout>
  );
}

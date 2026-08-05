import type { Metadata } from "next";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Sign in to Discipline OS and continue building the life you promised yourself.",
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back 👋"
      subtitle="Continue building the life you promised yourself."
    >
      <LoginForm />
    </AuthLayout>
  );
}

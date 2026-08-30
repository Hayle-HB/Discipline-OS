"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  clearAuthSession,
  getCurrentUser,
  getStoredToken,
  getStoredUser,
} from "@/lib/api";
import type { AuthUser } from "@/lib/api/types";

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      setIsLoading(false);
      router.replace("/login");
      return;
    }

    const cachedUser = getStoredUser();
    if (cachedUser) {
      setUser(cachedUser);
    }

    getCurrentUser()
      .then(setUser)
      .catch(() => {
        clearAuthSession();
        router.replace("/login");
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  return { user, isLoading };
}

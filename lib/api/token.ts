import { jwtVerify } from "jose";

import { parseMockToken } from "@/lib/api/mock-users";

function getJwtSecret(): Uint8Array | null {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

/** Extract and verify user id from a Bearer token (JWT or legacy mock token). */
export async function parseUserIdFromToken(token: string): Promise<string | null> {
  const secret = getJwtSecret();

  if (secret) {
    try {
      const { payload } = await jwtVerify(token, secret);
      if (typeof payload.sub === "string" && payload.sub.length > 0) {
        return payload.sub;
      }
    } catch {
      // Fall through to mock token parser for local/demo mode
    }
  }

  return parseMockToken(token);
}

export function getBearerToken(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7).trim();
}

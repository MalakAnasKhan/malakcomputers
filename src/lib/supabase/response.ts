import "server-only";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv } from "@/lib/env/public";
import { privateAuthHeaders } from "@/modules/auth/policy";
import { validateDevelopmentPublicEnvironment } from "../../../config/development-environment";

type CookieUpdate = { name: string; value: string; options: CookieOptions };

export function createCookieBridge(request: NextRequest) {
  const updates = new Map<string, CookieUpdate>();
  const headers = new Map<string, string>();
  const apply = (response: NextResponse) => {
    for (const { name, value, options } of updates.values()) {
      response.cookies.set(name, value, { ...options, secure: process.env.NODE_ENV === "production" });
    }
    for (const [name, value] of headers) response.headers.set(name, value);
    // Never let a later SDK write or replacement response remove this policy.
    for (const [name, value] of Object.entries(privateAuthHeaders)) response.headers.set(name, value);
    return response;
  };
  return {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookies: CookieUpdate[], cacheHeaders: Record<string, string>) {
        for (const cookie of cookies) {
          request.cookies.set(cookie.name, cookie.value);
          updates.set(cookie.name, cookie);
        }
        for (const [name, value] of Object.entries(cacheHeaders)) headers.set(name, value);
      },
    },
    finish: apply,
    // Build after refresh so Server Components receive the updated request cookies.
    continuation: () => apply(NextResponse.next({ request })),
  };
}

export function createResponseClient(request: NextRequest) {
  validateDevelopmentPublicEnvironment();
  const bridge = createCookieBridge(request);
  const { url, publishableKey } = getSupabasePublicEnv();
  const client = createServerClient(url, publishableKey, {
    cookieOptions: { path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" },
    cookies: bridge.cookies,
  });
  return { client, ...bridge };
}

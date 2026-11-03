import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { createCookieBridge, createResponseClient } from "./response";
import { isAdminPath } from "@/modules/auth/policy";
import { getAppOrigin } from "@/modules/auth/session";

type SessionFactory = typeof createResponseClient;

export async function updateSession(request: NextRequest, factory: SessionFactory = createResponseClient) {
  const protectedPath = isAdminPath(request.nextUrl.pathname);
  let session: ReturnType<SessionFactory> | undefined;
  let signedIn = false;
  try {
    session = factory(request);
    const { data, error } = await session.client.auth.getClaims();
    signedIn = !error && typeof data?.claims?.sub === "string";
  } catch {
    // Provider/configuration failures never allow a protected request through.
  }
  const bridge = session ?? createCookieBridge(request);
  if (protectedPath) {
    if (request.nextUrl.pathname.startsWith("/api/") || !["GET", "HEAD"].includes(request.method)) {
      return bridge.finish(NextResponse.json({ error: "Access is not authorized." }, { status: signedIn ? 403 : 401 }));
    }
    // No role provider exists yet: every signed-in user is still denied.
    const destination = signedIn ? "/auth/access-denied" : "/auth/login";
    // Next middleware requires an absolute URL. Use trusted configuration, not Host.
    try {
      return bridge.finish(NextResponse.redirect(new URL(destination, getAppOrigin()), 303));
    } catch {
      return bridge.finish(NextResponse.json({ error: "Access is not authorized." }, { status: signedIn ? 403 : 401 }));
    }
  }
  return bridge.continuation();
}

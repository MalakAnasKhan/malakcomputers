import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "";

  const isLoginPage = request.nextUrl.pathname === "/admin/login";
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  if (!isAdminRoute) {
    return response;
  }

  // If Supabase is not configured yet, allow viewing login page with setup notice
  if (!url || !key) {
    if (!isLoginPage) {
      return NextResponse.redirect(new URL("/admin/login?error=unconfigured", request.url));
    }
    return response;
  }

  try {
    const supabase = createServerClient(url, key, {
      cookieOptions: {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              ...options,
              secure: process.env.NODE_ENV === "production",
            })
          );
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();

    if (!user && !isLoginPage) {
      const redirectUrl = new URL("/admin/login", request.url);
      redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (user && isLoginPage) {
      return NextResponse.redirect(new URL("/admin/products", request.url));
    }
  } catch (error) {
    console.error("Middleware auth check error:", error);
    if (!isLoginPage) {
      return NextResponse.redirect(new URL("/admin/login?error=auth_failed", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};


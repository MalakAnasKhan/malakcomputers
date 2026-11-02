"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction } from "./actions";
import { Icon } from "@/components/ui/icon";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/admin/products";
  const urlError = searchParams.get("error");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#101114] px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-[#2B2F38] bg-[#181A1F] p-8 shadow-2xl sm:p-10">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D6FF43]"
          >
            <span>Malak Computers</span>
            <Icon name="arrow" width="14" height="14" />
          </Link>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Admin Portal
          </h1>
          <p className="mt-2 text-xs text-[#8A929C]">
            Sign in to manage inventory, catalog, and product listings.
          </p>
        </div>

        {urlError === "unconfigured" && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
            <strong>Supabase configuration notice:</strong> Set{" "}
            <code className="text-[#D6FF43]">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="text-[#D6FF43]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in{" "}
            <code>.env.local</code>.
          </div>
        )}

        {state?.error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium tracking-wide text-[#AEB4BB]"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="admin@malakcomputers.pk"
              className="mt-2 w-full rounded-xl border border-[#2E333C] bg-[#101114] px-4 py-3 text-sm text-white placeholder-[#505763] transition focus:border-[#D6FF43] focus:outline-none focus:ring-1 focus:ring-[#D6FF43]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-xs font-medium tracking-wide text-[#AEB4BB]"
              >
                Password
              </label>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••••••"
              className="mt-2 w-full rounded-xl border border-[#2E333C] bg-[#101114] px-4 py-3 text-sm text-white placeholder-[#505763] transition focus:border-[#D6FF43] focus:outline-none focus:ring-1 focus:ring-[#D6FF43]"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#D6FF43] py-3.5 text-sm font-semibold text-[#101114] transition hover:bg-[#c4ed36] disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Icon name="refresh" className="animate-spin" width="16" height="16" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <Icon name="lock" width="16" height="16" />
                <span>Sign In to Portal</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-[#252830] pt-6 text-center text-xs text-[#6B7280]">
          <Link href="/" className="transition hover:text-white">
            ← Back to Malak Computers Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}


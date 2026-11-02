import type { ReactNode } from "react";
import Link from "next/link";
import { logoutAction } from "./login/actions";
import { Icon } from "@/components/ui/icon";

export const metadata = {
  title: "Admin Portal — Malak Computers",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#101114] text-[#E5E7EB]">
      <header className="sticky top-0 z-40 border-b border-[#24272D] bg-[#14161A]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-6">
            <Link
              href="/admin/products"
              className="flex items-center gap-2.5 font-bold tracking-tight text-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D6FF43] text-sm font-black text-[#101114]">
                M
              </span>
              <span className="text-sm tracking-wide">Malak Admin</span>
              <span className="rounded-full bg-[#24272D] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#D6FF43]">
                Portal
              </span>
            </Link>

            <nav className="hidden items-center gap-1 sm:flex" aria-label="Admin Navigation">
              <Link
                href="/admin/products"
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-[#AEB4BB] transition hover:bg-[#1E2127] hover:text-white"
              >
                Products
              </Link>
              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#AEB4BB] transition hover:bg-[#1E2127] hover:text-white"
              >
                <Icon name="plus" width="14" height="14" />
                <span>Add Product</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#2B2F38] bg-[#181A1F] px-3 py-1.5 text-xs font-medium text-[#D1D5DB] transition hover:border-[#3D424F] hover:text-white"
            >
              <Icon name="eye" width="14" height="14" />
              <span className="hidden sm:inline">View Storefront</span>
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#9CA3AF] transition hover:bg-red-500/10 hover:text-red-400"
                title="Log Out"
              >
                <Icon name="logout" width="14" height="14" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}


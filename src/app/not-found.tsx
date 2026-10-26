import Link from "next/link";
export default function NotFound() {
  return <main id="main-content" className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-6 py-16"><p className="text-xs uppercase tracking-widest text-neutral-500">404 / Malak Computers</p><h1 className="mt-4 text-4xl font-semibold tracking-tight">Page not found.</h1><p className="mt-5 text-neutral-600">The page you are looking for is not available.</p><Link href="/" className="button mt-8 self-start">Return to the storefront ↗</Link></main>;
}

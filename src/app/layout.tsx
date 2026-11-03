import type { Metadata } from "next";
import type { ReactNode } from "react";
import { site } from "@/lib/site";
import localFont from "next/font/local";
import { publicOrigin } from "@/lib/urls";
import "./globals.css";
import { MotionSurface } from "@/components/storefront/motion-surface";
import { isPreviewDeployment } from "@/modules/storefront/deployment";
import { organizationStructuredData } from "@/modules/storefront/structured-data";
import { JsonLd } from "@/components/storefront/json-ld";

const poppins = localFont({
  src: [
    { path: "../../public/fonts/poppins-latin-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/poppins-latin-500.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/poppins-latin-600.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/poppins-latin-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-poppins", display: "swap", fallback: ["Arial"],
});
const origin = publicOrigin(site.url);

export const metadata: Metadata = {
  applicationName: site.name,
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
  appleWebApp: {
    title: site.name,
    capable: true,
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: origin ?? site.url ?? undefined,
    siteName: site.name,
    title: site.name,
    description: site.description,
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: site.name,
      },
    ],
  },
  ...(site.googleSiteVerification ? { verification: { google: site.googleSiteVerification } } : {}),
  ...(origin ? { metadataBase: new URL(origin) } : {}),
  robots: site.preview || !origin || isPreviewDeployment() ? { index: false, follow: false } : { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="antialiased">
        <JsonLd data={organizationStructuredData()} />
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <MotionSurface>{children}</MotionSurface>
      </body>
    </html>
  );
}

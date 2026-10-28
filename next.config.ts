import type { NextConfig } from "next";
import { isPreviewDeployment } from "./src/modules/storefront/deployment";

const nextConfig: NextConfig = {
  experimental: {
    agentUpgrade: "security",
  },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ...(isPreviewDeployment() ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] : []),
      ],
    }];
  },
  /* config options here */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

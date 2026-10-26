import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/generated/prisma/**",
    ".storefront-check/**",
    // Local archives and original assets are never lint inputs. Avoid traversing
    // credential directories, including when Windows correctly restricts access.
    ".secrets/**",
    "certs/**",
    "product-images-original/**",
    ".image-cache/**",
    ".agents/**",
    ".codex/**",
    ".aws/**",
  ]),
]);

export default eslintConfig;

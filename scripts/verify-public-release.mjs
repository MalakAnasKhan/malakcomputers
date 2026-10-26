import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { forbiddenReleasePath } from "./scan-release-secrets.mjs";

// Inspect generated artifacts only. Never load environment files or print their contents.
const manifest = JSON.parse(readFileSync(".next/server/app-paths-manifest.json", "utf8"));
assert.ok(Object.keys(manifest).some((route) => route.includes("(storefront)/page")));
for (const route of Object.keys(manifest)) {
  assert.doesNotMatch(route, /(?:auth|admin|api|proxy)/, "Non-public route found in build.");
}
function files(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}
for (const path of files("public")) {
  const normalized = path.replaceAll("\\", "/");
  if (forbiddenReleasePath(normalized) || /\.(?:md|sql|prisma|env)$/i.test(normalized) || /(?:^|\/)(?:docs|backend-preserved|\.git)(?:\/|$)/.test(normalized)) {
    throw new Error("Internal or private material found in public assets. Values withheld.");
  }
}
const artifacts = [...files(".next/static"), ...files(".next/server/app")]
  .filter((path) => /\.(?:js|html|json|rsc)$/.test(path));
for (const path of artifacts) {
  const content = readFileSync(path, "utf8");
  if (/postgres(?:ql)?:\/\/|supabase\.co|sb_secret_|SUPABASE_SERVICE_ROLE_KEY|oedglbkztistrniwnnfe/.test(content)) {
    throw new Error("Backend configuration found in a public artifact. Values withheld.");
  }
}
const traces = files(".next/server").filter((path) => path.endsWith(".nft.json"));
for (const trace of traces) {
  const paths = JSON.parse(readFileSync(trace, "utf8")).files;
  for (const path of paths) {
    const normalized = path.replaceAll("\\", "/");
    if (/(?:^|\/)(?:\.env[^/]*|\.secrets|certs|docs|backend-preserved)(?:\/|$)|node_modules\/(?:@supabase|@prisma|prisma|pg)\//.test(normalized)) {
      throw new Error("Private files or backend dependencies found in public deployment trace. Values withheld.");
    }
  }
}
console.log(`PASS: ${Object.keys(manifest).length} public route entries, ${artifacts.length} artifacts and ${traces.length} route traces checked; no backend configuration or private files found.`);

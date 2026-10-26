import { existsSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tests = readdirSync(resolve(root, "tests")).filter(name => /\.test\.(?:ts|mjs)$/.test(name)).sort().map(name => `tests/${name}`);
function run(args) {
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: "inherit" });
  if (result.error || result.status !== 0) process.exit(result.status || 1);
}
// A public checkout contains only storefront/image/release tests. The original
// workspace additionally retains private suites and their locked offline config.
if (tests.includes("tests/schema-security.test.ts")) {
  if (!existsSync(resolve(root, "prisma.config.ts"))) {
    console.error("Private tests require the preserved local offline configuration.");
    process.exit(1);
  }
  run(["node_modules/prisma/build/index.js", "generate"]);
}
run(["--import", "./tests/register.mjs", "--test", ...tests]);

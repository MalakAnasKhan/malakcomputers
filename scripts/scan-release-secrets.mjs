import { spawnSync } from "node:child_process";
import { existsSync, lstatSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export function forbiddenReleasePath(path) {
  return /(?:^|\/)(?:\.env[^/]*|\.envrc|\.secrets|certs|product-images-original|\.image-cache|\.storefront-check|\.aws|\.codex|\.agents|backups)(?:\/|$)|\.(?:key|pem|pfx|p12|p8|dump|backup|pgpass|crt|cer|der)$|(?:^|\/)pgpass\.conf$/i.test(path);
}

export function privateRepositoryPath(path) {
  return /^(?:backend-preserved|config|prisma|Reference Images)\//.test(path) ||
    /^(?:prisma\.config\.ts|tsconfig\.backend\.json|index\.html|style\.css)$/.test(path) ||
    /^src\/(?:lib\/(?:env|supabase)\/|lib\/prisma\.ts$|modules\/(?:auth|access-control)\/)/.test(path) ||
    /^src\/.*\.(?:md|sql)$/i.test(path) ||
    /^docs\//.test(path) && !["docs/storefront-launch.md", "docs/product-images.md"].includes(path) ||
    /^tests\//.test(path) && !["tests/storefront.test.ts", "tests/catalog-storefront.test.ts", "tests/images.test.ts", "tests/release-secrets.test.mjs", "tests/register.mjs", "tests/server-only.mjs", "tests/smoke.mjs"].includes(path) ||
    path === "scripts/validate-development.mjs";
}

/** Findings contain rule names only. Never return, log or persist matched values. */
export function secretFindings(text, filename = "") {
  const findings = new Set();
  if (/-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----/.test(text)) findings.add("private key");
  if (/\bsb_secret_[A-Za-z0-9_-]{20,}\b/.test(text)) findings.add("privileged Supabase key");
  if (/\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}|AKIA[A-Z0-9]{16}|AIza[A-Za-z0-9_-]{35})\b/.test(text)) findings.add("access token");
  for (const match of text.matchAll(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g)) {
    try { if (JSON.parse(Buffer.from(match[0].split(".")[1], "base64url").toString()).role === "service_role") findings.add("privileged Supabase JWT"); } catch { /* Not a JWT payload. */ }
  }
  for (const match of text.matchAll(/postgres(?:ql)?:\/\/[^\s"'`<>]+/gi)) {
    const knownTemplate = 'postgresql:' + '//postgres.${developmentProjectReference}:offline-placeholder@aws-0-example.pooler.supabase.com:${variable';
    if (filename === "tests/environments.test.ts" && match[0] === knownTemplate) continue;
    try {
      const url = new URL(match[0]);
      // Existing, narrowly identified offline fixtures. No directory-wide exemption.
      const fixture = filename === "tests/environments.test.ts" && url.hostname === "aws-0-example.pooler.supabase.com" && url.password === "offline-placeholder";
      const reserved = /(?:^|\.)(?:example|test|invalid)$|^(?:localhost|127\.0\.0\.1|\[::1\])$/.test(url.hostname);
      if ((url.username || url.password) && !fixture && !reserved) findings.add("database connection credentials");
    } catch { findings.add("unparseable database URL"); }
  }
  if (/\b(?:SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SECRET_KEY|VERCEL_TOKEN|GITHUB_TOKEN)\s*[:=]\s*["'](?!["']|process\.|\$\{|<)[A-Za-z0-9_.-]{20,}["']/.test(text)) findings.add("assigned privileged token");
  return [...findings];
}

function command(args, options = {}) {
  const result = spawnSync("git", args, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024, ...options });
  if (result.error) throw new Error("Git must be installed for the release scan.");
  return result;
}

export function scanRelease(rootPath = process.cwd()) {
  const root = resolve(rootPath);
  const repository = command(["-C", root, "rev-parse", "--show-toplevel"]);
  let temporary;
  let args;
  const hasRepository = repository.status === 0;
  if (!hasRepository && existsSync(join(root, ".git"))) throw new Error("Existing Git repository could not be inspected.");
  if (hasRepository && resolve(repository.stdout.trim()) !== root) throw new Error("Run the scan at the repository root.");
  try {
    if (hasRepository) args = ["-C", root];
    else {
      temporary = mkdtempSync(join(tmpdir(), "malak-release-scan-"));
      if (command(["init", "--quiet", temporary]).status !== 0) throw new Error("Could not prepare an isolated ignore-rule check.");
      args = [`--git-dir=${join(temporary, ".git")}`, `--work-tree=${root}`];
    }
    const git = (more, options) => command([...args, ...more], options);
    const list = (more) => {
      const result = git(more);
      if (result.status !== 0) throw new Error("Git file enumeration failed; scan incomplete.");
      return result.stdout.split("\0").filter(Boolean);
    };
    const tracked = hasRepository ? list(["ls-files", "--cached", "-z"]) : [];
    const prospective = list(["ls-files", "--others", "--exclude-standard", "-z"]);
    const stagedNames = hasRepository ? list(["diff", "--cached", "--name-only", "-z", "--diff-filter=ACMR"]) : [];
    const findings = [];
    let checked = 0, stagedChecked = 0;
    // Test protection for representative secrets without reading any ignored file.
    const mustIgnore = [".env.local", ".env.production", ".secrets/production.env", "certs/development/root.crt", "private.key", "product-images-original/example.jpg", ".image-cache/state.json"];
    for (const path of mustIgnore) if (git(["check-ignore", "--no-index", "--quiet", path]).status !== 0) findings.push({ source: "ignore rules", path, rules: ["missing exclusion"] });
    function inspect(path, bytes, source) {
      checked++;
      if (bytes.includes(0)) return; // Binary assets, not textual credentials.
      const rules = secretFindings(bytes.toString("utf8"), path);
      if (rules.length) findings.push({ source, path, rules });
    }
    for (const path of new Set([...tracked, ...prospective])) {
      if (forbiddenReleasePath(path) || privateRepositoryPath(path)) { findings.push({ source: "candidate path", path, rules: ["private file included"] }); continue; }
      const absolute = resolve(root, path), rel = relative(root, absolute);
      if (isAbsolute(rel) || rel === ".." || rel.startsWith(`..${sep}`)) throw new Error("Unexpected Git path; scan stopped.");
      let stat;
      try { stat = lstatSync(absolute); } catch (error) { if (error.code === "ENOENT") continue; throw error; }
      if (stat.isSymbolicLink()) { findings.push({ source: "candidate path", path, rules: ["symlink requires review"] }); continue; }
      if (stat.isFile()) inspect(path, readFileSync(absolute), "working file");
    }
    // Inspect index blobs independently: removing a secret from a working file
    // does not remove it from the staged version. Read all tracked index blobs.
    for (const path of tracked) {
      if (forbiddenReleasePath(path) || privateRepositoryPath(path)) continue;
      const blob = git(["show", `:${path}`], { encoding: null });
      if (blob.status !== 0) throw new Error("Could not inspect an indexed file; scan incomplete.");
      inspect(path, blob.stdout, "Git index");
      stagedChecked++;
    }
    return { hasRepository, tracked: tracked.length, staged: stagedNames.length, prospective: prospective.length, checked, indexedBlobsChecked: stagedChecked, findings };
  } finally {
    if (temporary) {
      const parent = resolve(tmpdir());
      if (!resolve(temporary).startsWith(parent + sep) || !relative(parent, temporary).startsWith("malak-release-scan-")) throw new Error("Unsafe temporary cleanup path.");
      rmSync(temporary, { recursive: true, force: true });
    }
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = scanRelease();
    console.log(result.hasRepository ? `Repository scan: ${result.tracked} tracked files, ${result.staged} staged changes; ${result.indexedBlobsChecked} index blobs checked.` : "No Git repository: tracked/staged scan unavailable. Scanning prospective first-commit files using the actual ignore rules.");
    console.log(`${result.checked} text/binary candidates inspected; ${result.prospective} untracked/prospective files.`);
    for (const finding of result.findings) console.error(`FAIL: ${JSON.stringify(finding.path)} (${finding.source}: ${finding.rules.join(", ")}). Values withheld.`);
    if (result.findings.length) process.exitCode = 1;
    else console.log("PASS: ignore protections verified; no supported credential patterns found. Git history and repository visibility are not inspected.");
  } catch {
    console.error("FAIL: release secret scan incomplete. Check Git availability, repository root and file access. Values withheld.");
    process.exitCode = 1;
  }
}

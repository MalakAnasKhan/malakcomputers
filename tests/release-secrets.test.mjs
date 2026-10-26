import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve, sep } from "node:path";
import { tmpdir } from "node:os";
import { forbiddenReleasePath, privateRepositoryPath, scanRelease, secretFindings } from "../scripts/scan-release-secrets.mjs";

test("release scan recognizes privileged tokens, connection credentials and private keys without returning values", () => {
  const token = "sb_secret_" + "x".repeat(32);
  const url = "postgresql:" + "//fixture-user:fixture-password@db.fixture-host.com/postgres";
  const key = ["-----BEGIN", "PRIVATE KEY-----"].join(" ");
  const jwt = [Buffer.from('{"alg":"HS256"}').toString("base64url"), Buffer.from('{"role":"service_role"}').toString("base64url"), "testSignature"].join(".");
  const findings = secretFindings([token, url, key, jwt].join("\n"));
  assert.deepEqual(findings.sort(), ["privileged Supabase key", "database connection credentials", "private key", "privileged Supabase JWT"].sort());
  for (const value of [token, url, "fixture-password", jwt]) assert.ok(!JSON.stringify(findings).includes(value));
  assert.deepEqual(secretFindings('https://wa.me/923109806478?text=Hello'), []);
  assert.deepEqual(secretFindings('postgresql://test:synthetic-password@dev.example:5432/postgres'), []);
});

test("private source paths cannot be force-added safely even when their content looks harmless", () => {
  for (const path of [".env.local", ".secrets/production.env", "certs/root.crt", "product-images-original/photo.jpg", "nested/private.key", ".image-cache/state.json", "tests/fixtures/root.crt"]) assert.equal(forbiddenReleasePath(path), true);
  for (const path of ["src/lib/site.ts", "public/products/fixture/1.webp"]) assert.equal(forbiddenReleasePath(path), false);
  for (const path of ["docs/authorization-schema.md", "docs/migration-drafts/dev-bootstrap.sql", "backend-preserved/README.md", "src/lib/prisma.ts", "config/supabase-projects.ts"]) assert.equal(privateRepositoryPath(path), true);
  for (const path of ["docs/product-images.md", "docs/storefront-launch.md", "tests/storefront.test.ts"]) assert.equal(privateRepositoryPath(path), false);
});

function fixture(run) {
  // Keep pre-Git fixtures outside the real repository so Git cannot discover
  // the parent workspace's newly initialized .git directory.
  const base = resolve(tmpdir());
  const root = mkdtempSync(resolve(base, "malak-release-test-"));
  try {
    writeFileSync(resolve(root, ".gitignore"), readFileSync(".gitignore"));
    run(root);
  } finally {
    assert.ok(root.startsWith(base + sep) && root !== base);
    rmSync(root, { recursive: true, force: true });
  }
}

test("pre-Git scan respects the real ignore file and does not initialize the project repository", () => {
  fixture(root => {
    writeFileSync(resolve(root, "public-settings.txt"), "WhatsApp: 923109806478");
    writeFileSync(resolve(root, ".env.local"), "sb_secret_" + "x".repeat(32));
    const result = scanRelease(root);
    assert.equal(result.hasRepository, false);
    assert.equal(result.tracked, 0);
    assert.deepEqual(result.findings, []);
    assert.equal(spawnSync("git", ["-C", root, "rev-parse", "--show-toplevel"], { encoding: "utf8" }).status, 128);
  });
});

test("tracked index blobs are scanned even after a staged secret is removed from the working copy", () => {
  fixture(root => {
    const git = (...args) => {
      const result = spawnSync("git", ["-C", root, ...args], { encoding: "utf8" });
      assert.equal(result.status, 0);
    };
    git("init", "--quiet");
    writeFileSync(resolve(root, "staged.txt"), "sb_secret_" + "x".repeat(32));
    git("add", "staged.txt");
    writeFileSync(resolve(root, "staged.txt"), "Safe working copy");
    const result = scanRelease(root);
    assert.equal(result.hasRepository, true);
    assert.equal(result.staged, 1);
    assert.equal(result.indexedBlobsChecked, 1);
    assert.ok(result.findings.some(finding => finding.source === "Git index" && finding.rules.includes("privileged Supabase key")));
    writeFileSync(resolve(root, ".env.local"), "not actually a secret");
    git("add", "--force", ".env.local");
    assert.ok(scanRelease(root).findings.some(finding => finding.path === ".env.local" && finding.rules.includes("private file included")));
  });
});

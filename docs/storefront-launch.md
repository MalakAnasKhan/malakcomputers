# GitHub and Vercel guide

## Repository and publication boundary

The exact remote is `https://github.com/MalakAnasKhan/malakcomputers.git` and the
branch is `main`. The repository is already **public**. Preparation does not change
its visibility, push commits or deploy the application.

Only the public storefront source, public assets, image/release tooling, public
tests and these public guides belong in the initial commit. `.gitignore` excludes
local environment files, archived secrets, certificates, original images, caches,
build outputs, backend code, database configuration, migration SQL and internal
documentation. All excluded files remain on the original computer. Keep a separate
private backup of that work; this public commit is not its backup.

Never force-add ignored files. `.vercelignore` controls deployment uploads, not
GitHub source visibility. Any file committed to a public repository can be read by
others even when it is never served by Next.js.

## Before any push

```powershell
git status --short
git remote -v
git diff --cached --name-only
npm.cmd run release:secrets
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd run release:check
```

The secret scanner checks tracked working files and index blobs independently,
rejects private/internal paths even if force-added, and reports rule names without
printing matched values. It is pattern-based and does not audit remote Git history.
Inspect the complete commit file list as well; a passing scanner is not permission
to publish excluded internal material.

Only after explicit push approval:

```powershell
git push -u origin main
```

Do not force-push. If the remote changes before the first push, stop and review the
new history rather than overwriting it. Publication does not approve a sales launch
or authorize a deployment.

## Vercel setup (requires separate approval)

Import `MalakAnasKhan/malakcomputers` and select:

| Setting | Value |
| --- | --- |
| Framework | Next.js |
| Root directory | Repository root |
| Node.js | 24.x |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | Next.js default; no override |
| Required environment variables | None |

Do not copy local environment files, archived production values or database keys.
Do not add database integrations or migration, image-import, backend-validation or
Prisma generation hooks. `.vercelignore` restricts uploads to required public source,
assets and build inputs. `release:check` rejects private material in public assets
and generated deployment traces. Incomplete admin/Auth routes return 404.

The public test runner selects tests present in the checkout. Private workspace
suites and their configuration are deliberately absent from the public repository.
Pinned dependency versions are retained in `package-lock.json`. Optional legacy
backend commands in package metadata are not part of the storefront setup.

Official documentation: [Vercel Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions),
[Vercel exclusions](https://vercel.com/docs/deployments/vercel-ignore),
[Vercel build configuration](https://vercel.com/docs/builds/configure-a-build).

## Content approval and indexing

- WhatsApp **923109806478** is approved and general chat is enabled.
- Add owner-approved catalog records to `src/modules/catalog/data.ts`; never invent
  prices, stock or specifications. Samples remain unpriced and cannot be ordered.
- Match approved photography using the [image workflow](product-images.md).
- Enter the approved public HTTPS domain in `src/lib/site.ts`. Product enquiries
  require it to include a full product URL; no deployment domain is guessed.
- Approve the seller information and shipping, returns/warranty, privacy and terms
  text before the real sales launch. Unapproved contact details remain absent.
- Keep `site.preview: true`. Page noindex, robots disallow-all and the empty sitemap
  remain until final content approval. Do not relax indexing for a demonstration.

Orders only prepare an encoded WhatsApp enquiry containing product name, SKU,
PKR price, full product link and a request for stock, delivery charges, payment
instructions and final confirmation. No order or payment is confirmed automatically.

## HTTP review

After a production build, start the server on loopback:

```powershell
npm.cmd run start -- --hostname 127.0.0.1 --port 3108
# In another terminal:
npm.cmd run test:smoke
```

These tests inspect internal pages, section/navigation links, sample ordering
restrictions, WhatsApp targets, indexing controls and private-route 404s without
visiting external links. Finish with mobile/desktop browser and WhatsApp-app
handoff review before a separately approved real launch.

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
- The approved canonical origin is `https://malakcomputers.vercel.app`, configured
  in `src/lib/site.ts`. Product enquiries include its full canonical product URL.
- The business name, Mingora office address and four policy texts are approved.
  No business hours, email address, additional locations or social profiles are inferred.
- `site.preview` is now false under the owner's indexing approval. Production public
  pages and approved policies are indexable. Samples and categories containing only
  samples retain noindex. Unpublished products (`published: false`) have no public route.
- Vercel preview/development contexts and unknown Vercel environments receive noindex
  metadata, a disallow-all robots file, an empty sitemap and an `X-Robots-Tag` header.
  Keep Vercel's automatic system variables exposed: the guard uses `VERCEL_ENV` and
  `VERCEL`. Local development is also noindex. No secret or database configuration
  is needed. Vercel additionally supplies preview noindex headers by default.

Orders only prepare an encoded WhatsApp enquiry containing product name, SKU,
PKR price, full product link and a request for stock, delivery charges, payment
instructions and final confirmation. No order or payment is confirmed automatically.

Unknown price or stock uses Enquire on WhatsApp, asking for current price,
availability, condition, warranty and shipping. A product's `checkingWarrantyEligible`
must be explicitly true before a seven-day checking-warranty claim is rendered.
Missing eligibility displays neutral wording. Samples cannot be ordered or receive
product-specific enquiry links. No prices, availability or approvals are generated
from images. The image-import workflow is unchanged.

## SEO and structured data

Every public page has a unique title/description, production canonical URL and
Open Graph/Twitter metadata. Real product pages use their actual local photographs
as social images. JSON-LD describes Organization, WebSite, breadcrumbs and real
published products using supplied facts. It contains no invented offers, ratings,
reviews, product condition, stock, opening hours, social profiles or coordinates.
User-provided text is escaped before JSON-LD is embedded in HTML.

The current Product data is descriptive Schema.org markup. It does **not** promise
Google product rich-result eligibility: Google requires an offer or review/rating
for product snippets. Do not add invented values to satisfy a validator. Product
rich-result enhancements can be reviewed after real pricing and other facts are approved.

Sources: [Next.js JSON-LD](https://nextjs.org/docs/app/guides/json-ld),
[Google product snippet requirements](https://developers.google.com/search/docs/appearance/structured-data/product-snippet),
[Vercel preview indexing](https://vercel.com/kb/guide/are-vercel-preview-deployment-indexed-by-search-engines),
[Vercel system variables](https://vercel.com/docs/environment-variables/system-environment-variables).

## Manual Google Search Console setup

These are owner actions after separately approved publication; no Google account,
Search Console property or sitemap submission is created by application code.

1. In Google Search Console, add a **URL-prefix** property for
   `https://malakcomputers.vercel.app/`. Use URL-prefix verification for this hosted
   address; you do not control the parent `vercel.app` DNS zone. A future custom
   domain you control can instead use a Domain property with its required DNS proof.
2. Select the HTML tag method. Copy only the actual `content` value supplied by
   Google into `site.googleSiteVerification` in `src/lib/site.ts`. It is currently
   null, so no fake tag is rendered. The verification token is public, not a password.
3. Review, approve, commit and publish that change. Confirm the homepage source has
   one `google-site-verification` meta tag, then click Verify in Search Console.
   Keep the token in place after verification; Google may check it again.
4. Confirm production `/robots.txt` allows public crawling and references
   `https://malakcomputers.vercel.app/sitemap.xml`. Confirm the sitemap contains only
   canonical approved routes and real published products, with no sample or internal URLs.
5. In the Sitemaps section, submit `https://malakcomputers.vercel.app/sitemap.xml`.
   Inspect the homepage, shop and real product canonical URL using URL Inspection.
   Request indexing where appropriate and monitor indexing reports.

Never submit a Vercel preview URL or remove its indexing safeguards. Sitemaps and
requests do not guarantee indexing, rankings or a particular rich result.
Official guidance: [Google ownership verification](https://support.google.com/webmasters/answer/9008080).

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

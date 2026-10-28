# MALAK COMPUTERS

Responsive Next.js App Router storefront with a typed local product catalog,
product galleries, search and filters, category pages and WhatsApp enquiries.
No database, authentication service or environment variables are required to
build or run the public storefront.

Approved WhatsApp contacts are **+92 310 9806478** and **+92 322 9124952**.
Product enquiries use the first number; both are available on Contact and in the footer.
Demonstration products are
clearly labeled samples and cannot be ordered. Photo-discovered products accept
general price/stock enquiries without asserting availability. Approved production pages
are indexable; samples, unpublished listings and Vercel previews are excluded.

## Local development

Use Node.js 24 and npm. On Windows:

```powershell
npm.cmd ci
npm.cmd run dev
```

Open http://localhost:3000.

## Validation

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd run release:check
npm.cmd run release:secrets
```

The test runner runs all test files available in the checkout. A public checkout
contains only storefront, image and release-security tests, with no Prisma
configuration or client generation required. The original private workspace can
additionally run its preserved offline suites without publishing them.

`test:storefront` runs only storefront unit tests. Backend/database-specific npm
commands are optional legacy local tools; their private configuration is excluded
from this public repository. Never add them to installation or deployment hooks.

## Content and images

- `src/modules/catalog/data.ts`: typed product records and explicit sample status.
- `src/modules/catalog/products.ts`: catalog validation and generated image galleries.
- `src/modules/catalog/discovered-products.json`: generated photo-backed product identities.
- `src/lib/site.ts`: approved public brand, WhatsApp, contact and HTTPS origin settings.
- `src/lib/whatsapp.ts`: encoded general-chat and product enquiry links.
- `public/products/`: optimized product photography.
- `src/app/(storefront)/`: public pages and the four owner-approved policies.

Add exactly four numbered originals per product to `product-images-original/`,
then run `npm.cmd run images`. Originals are preserved and ignored by Git.
Read the [image workflow](docs/product-images.md) before importing. Importing an
image creates an enquiry listing when its four-image group is valid, but never
approves business information, invents stock/prices or enables orders. Commit the
generated catalog and optimized images, then push when approved, for Vercel to update.

## Visual system

The storefront uses graphite `#101114`, charcoal `#24272D`, warm white `#F5F5F2`,
electric lime `#D6FF43` and white, with self-hosted Poppins. Shared card, gallery,
form and editorial components keep secondary pages consistent with the homepage.

Lenis 1.3.27 smooth scrolling is available across all pages through the root motion
surface on capable desktop devices. GSAP 3.15.0 and ScrollTrigger are loaded only
for homepage reveals and parallax. Mobile, save-data and reduced-motion users
keep native scrolling and fully visible content. Cleanup
restores inline styles, listeners, scrolling and animation timers on navigation
or preference changes. Same-document anchors preserve focus and browser history.
Each animated element owns its ref and starts GSAP only from its own post-hydration
effect. The root scrolling controller never styles streamed page descendants.

The two images in `public/images/editorial/` are labeled AI-generated decorative
concepts. They never represent a catalog model, specification or stock claim and
are never substituted for product gallery photographs. Approved real product
photography is still required for actual listings.

## GitHub and deployment

Repository: [MalakAnasKhan/malakcomputers](https://github.com/MalakAnasKhan/malakcomputers).
This public repository includes only the reviewed storefront file set. Local
backend code, internal documentation, migrations, credentials, CA certificates,
original photos, editor settings and build outputs are excluded by `.gitignore`.
Never force-add excluded files or publish local archives. Ignore rules cannot
remove files already committed, so run the staged/index security scan before pushing.

See the [GitHub/Vercel guide](docs/storefront-launch.md). Vercel uses Node.js 24.x,
`npm ci`, `npm run build` and Next.js defaults. No Supabase or Prisma credentials
are required. `.vercelignore` further limits deployment uploads to public build
inputs. No push or deployment is performed by any validation command.

The approved origin is https://malakcomputers.vercel.app. Contact and footer show
the approved Mingora office address and a Google Maps address-search link. No hours,
email, social profiles or GPS coordinates are inferred.

Product-level `checkingWarrantyEligible: true` is required before a seven-day
checking warranty is shown. Missing eligibility displays a neutral warranty enquiry;
samples receive no coverage claim. `published: false` removes a product from public
listings, detail routes and the sitemap. Manual catalog data remains authoritative.

Prices, stock, condition and warranty eligibility still need product-specific
approval. All orders and payments require manual WhatsApp confirmation. See the
[deployment guide](docs/storefront-launch.md) for indexing and manual Search Console setup.

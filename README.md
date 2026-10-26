# MALAK COMPUTERS

Responsive Next.js App Router storefront with a typed local product catalog,
product galleries, search and filters, category pages and WhatsApp enquiries.
No database, authentication service or environment variables are required to
build or run the public storefront.

The approved WhatsApp number is **923109806478**. The current products are
clearly labeled samples and cannot be ordered. Search indexing remains disabled
until real product data, policies and business details are approved.

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
- `src/lib/site.ts`: approved public brand, WhatsApp, contact and HTTPS origin settings.
- `src/lib/whatsapp.ts`: encoded general-chat and product enquiry links.
- `public/products/`: optimized product photography.
- `src/app/(storefront)/`: public pages and clearly marked draft policies.

Add exactly four numbered originals per product to `product-images-original/`,
then run `npm.cmd run images`. Originals are preserved and ignored by Git.
Read the [image workflow](docs/product-images.md) before importing. Importing an
image never creates or approves a product, invents stock/prices or enables orders.

## Visual system

The storefront uses graphite `#101114`, charcoal `#24272D`, warm white `#F5F5F2`,
electric lime `#D6FF43` and white, with self-hosted Poppins. Shared card, gallery,
form and editorial components keep secondary pages consistent with the homepage.

GSAP 3.15.0, ScrollTrigger and Lenis 1.3.27 are dynamically loaded only by the
homepage motion surface on capable desktop devices. Mobile, save-data and
reduced-motion users keep native scrolling and fully visible content. Cleanup
restores inline styles, listeners, scrolling and animation timers on navigation
or preference changes. Same-document anchors preserve focus and browser history.

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

A real sales launch still requires approved product records and images, prices,
stock, final policies and the public HTTPS origin in `site.url`. General WhatsApp
chat works now; all product orders and payments require manual confirmation.

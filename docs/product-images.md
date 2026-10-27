# Image-based product catalog

Run from the project root with Node 24 and the existing npm dependencies:

    npm.cmd run images

The command uses the existing Sharp dependency. It never loads environment files,
backend modules or network resources.

## Add a product

Place exactly four original photographs directly in product-images-original/:

    Z890 Aorus Pro Ice 1.jpg
    Z890 Aorus Pro Ice 2.jpg
    Z890 Aorus Pro Ice 3.jpg
    Z890 Aorus Pro Ice 4.jpg

Only the final space and number 1 through 4 are removed. The remaining name is used
for display. Case-only variations share a group; spaces and punctuation normalize
to stable lowercase URL slugs. Conflicting names producing the same slug are
reported, including collisions with previously generated listings. Do not rename
an existing source group merely to edit its name: review its existing ID and URL
and add approved metadata to the manual catalog instead.

Extensions are case insensitive: JPG/JPEG, PNG, WebP, AVIF, TIFF/TIF, HEIC/HEIF and
single-frame GIF. Codec support depends on the installed Sharp build. Animated or
multipage inputs, SVG, subdirectories, links/junctions, files over 100 MiB and images
over 80 megapixels are rejected or reported. Missing numbers, duplicate slots,
invalid names and ambiguous manual matches are never guessed.

Originals remain untouched and Git-ignored. Use only photographs you may publish:
optimized outputs are public and source metadata is stripped.

## Generated files and manual information

Complete groups produce public/products/<slug>/1.webp through 4.webp. Images are
oriented correctly and fitted inside 1200 by 1200 without cropping or enlargement.
WebP quality 90, 86 or 82 targets at most 250 KiB while preserving detail. Small
files are never padded. See Sharp's official documentation:
https://sharp.pixelplumbing.com/api-resize/
https://sharp.pixelplumbing.com/api-output/#webp

The importer writes two deterministic public files:

- src/modules/catalog/discovered-products.json: stable image-derived ID, slug,
  display name and four numerical image paths for newly discovered products.
- src/modules/catalog/imported-images.json: gallery bindings for matched manual
  products, preserving their existing IDs and canonical URLs.

src/modules/catalog/data.ts remains the owner-approved typed manual catalog.
Matching uses normalized names or existing slugs. Manual metadata takes precedence;
only images change. When adding approved information for a discovered product,
retain its generated ID and slug in the manual entry to preserve links, then rerun
images. Do not edit generated JSON to supply prices, stock or other business facts.

products.ts merges both sources into the storefront catalog. New photo-backed
entries have null price, unconfirmed availability, unspecified brand/category,
empty description/specifications and no featured status. Photographs never approve
stock, pricing, specifications or ordering. Samples remain clearly marked and
cannot receive product ordering or product enquiry buttons.

Imported listings appear in All Products, case-insensitive search and static product
routes. Approved manual categories drive category pages and filters; unknown
categories are not guessed from names. Cards use image 1. Detail galleries retain
four interactive numbered thumbnails using next/image.

Unknown price displays Price on request; unverified stock displays Availability to
be confirmed. Enquire on WhatsApp asks for price, stock and details without claiming
an order or payment. Order on WhatsApp still requires non-sample approved price and
availability plus a configured HTTPS site origin. If site.url is unset, general
product enquiries include a relative product path. Set the approved deployed origin
in src/lib/site.ts to include full links.

## Incremental processing and recovery

.image-cache/state.json records source/output SHA-256 hashes and encoder settings.
Unchanged images are not encoded or rewritten. Changed originals regenerate only
affected images. Missing outputs are recreated. A lock prevents simultaneous runs.
The ignored .image-cache/report.json and terminal output report groups, issues,
missing images, incomplete metadata, source/output sizes, quality and savings.

Invalid input preserves both published catalog manifests. Valid groups may produce
optimized files but no partial gallery is published. Resolve issues and rerun.
Missing originals never delete existing listings, gallery bindings or optimized
outputs; the report flags them for review. Intentional retirement requires separate
manual catalog and output review.

The importer refuses to overwrite outputs not matching its local ownership cache.
A fresh checkout includes images but not this ignored cache. Before regenerating
there, back up and review generated files, and manually move affected outputs aside.
Do not delete the cache just to force encoding. After interruption, confirm no
importer is running before removing a stale .image-cache/import.lock. Filesystem
write failures can leave unbound outputs: review before retrying.

## Publish changes

Optimization is an explicit local command, never an install/build hook. Vercel needs
only committed optimized images and catalog JSON, not originals, cache or database
credentials. For future imports:

    npm.cmd run images
    npm.cmd test
    npm.cmd run lint
    npm.cmd run typecheck
    npm.cmd run build
    git add -- public/products src/modules/catalog/discovered-products.json src/modules/catalog/imported-images.json
    git diff --cached --stat
    npm.cmd run release:secrets
    git commit -m "Import product photographs and catalog discoveries"
    git push origin main

Review staged changes before committing; stage intentional manual metadata edits
separately. Push only when publication is approved. The connected Vercel project
then rebuilds from GitHub. Running images alone does not update the live website.

## Current import and verification

Z890 Aorus Pro Ice is discovered at /products/z890-aorus-pro-ice with ID
image-z890-aorus-pro-ice. Four JPEGs produce four 1200-square WebPs: approximately
190.8, 217.9, 191.5 and 204.4 KiB. Combined size falls from 12,757.8 to 804.6 KiB
(93.69% saved). Cached outputs are reused. Price, availability, brand, category,
description and specifications still need approved details.

npm.cmd test covers grouping, conflicts, missing/corrupt inputs, ordering, bounds,
metadata removal, unchanged originals, incremental imports, listing retention and
manual metadata precedence. Storefront tests cover Z890 search, placeholder details
and enquiry/order separation. Also run lint, TypeScript and a production build.

# Product photography import

Run `npm.cmd run images` from the project root (Node 24, `npm.cmd ci` installed).
Sharp 0.35.5 is pinned as a development dependency; the importer never loads `.env`
files, database clients, authentication modules, or network resources.

## Originals and naming

Place files directly in `product-images-original/`:

```
Z890 Aorus Pro Ice 1.jpg
Z890 Aorus Pro Ice 2.jpg
Z890 Aorus Pro Ice 3.jpg
Z890 Aorus Pro Ice 4.jpg
```

Each product needs exactly one image for each number, with a space, hyphen or
underscore separating the name and number. Extensions are case insensitive:
JPEG/JPG, PNG, WebP, AVIF, TIFF/TIF, HEIC/HEIF and single-frame GIF. Actual codec
availability depends on the installed Sharp build; undecodable files are reported
and skipped. Animated/multipage inputs, SVG, subdirectories, symlinks/junctions,
files over 100 MiB and images over 80 megapixels are not imported.

The originals folder is ignored by Git. Originals are read only: never renamed,
overwritten or deleted. Do not store private photos there: generated images in
`public/` will be publicly accessible if the website is eventually deployed.

## Outputs and catalog matching

Complete groups produce `public/products/<normalized-product-slug>/1.webp` through
`4.webp`. Orientation is corrected before resizing. Sharp fits images inside
1200 × 1200 without cropping or enlargement and strips source metadata. Quality
starts at 90 and can decrease to 86 or 82 to target at most 250 KiB; detail is
prioritized over a strict size ceiling. Small images are not padded to reach
100 KiB. This uses Sharp's documented
[resize](https://sharp.pixelplumbing.com/api-resize/),
[orientation](https://sharp.pixelplumbing.com/api-operation/) and
[WebP](https://sharp.pixelplumbing.com/api-output/#webp) options.

Manual business data lives in `src/modules/catalog/data.ts`; this is the existing
typed catalog, extracted without changing any product facts. The importer compares
normalized group names to catalog names and slugs. Only a unique match receives
four numerical image paths in the generated `src/modules/catalog/imported-images.json`.
`products.ts` applies that manifest using `image-galleries.ts`, which only replaces
images and validates the four ordered local paths. Existing `next/image` gallery
and card components display the resulting images.

Unmatched images are optimized but do not create products, prices, stock claims,
routes or order buttons. Importing a photograph never approves a sample listing.
Add only owner-approved product data to the typed catalog, then rerun `images` to
bind an existing optimized group without encoding again.

Duplicate slots, missing images, ambiguous filenames/matches and output-slug
collisions are reported rather than guessed. Invalid groups are skipped. Any input
issue preserves the previous gallery manifest as a whole. Fix the issues and rerun.
With a fully valid scan, bindings are rebuilt from current complete groups; removed
groups fall back to the manually specified catalog images. Old optimized outputs
are never deleted automatically.

## Incremental processing and recovery

`.image-cache/state.json` records source/output SHA-256 hashes and processing settings.
Unchanged images with intact outputs are reused without encoding or rewriting.
Changed originals or settings regenerate only the affected images. Missing outputs
are recreated. A local lock prevents simultaneous runs. `.image-cache/report.json`
contains the latest groups, missing/duplicate issues, original/optimized byte counts,
dimensions, quality, cache hits and compression savings. Console output summarizes
the same information. Both cache and report are ignored by Git.

The importer refuses to overwrite outputs whose bytes do not match its ownership
cache, including files created manually or checked out without the local cache.
Do not delete the cache just to force a run. If the cache is lost or outputs were
edited, first back up and review those generated files; move the affected generated
outputs aside manually before regenerating. Originals are always retained. After
an interrupted run, confirm no importer is active before removing a stale
`.image-cache/import.lock`. Partial disk-write failures can leave unbound outputs;
review them before retrying. Source and destination paths must remain regular
local paths with no links or junctions.

Commit generated WebPs and the gallery manifest along with the importer and typed
catalog. Optimization is an explicit development command, not an install/build hook.

## Current import

One group: **Z890 Aorus Pro Ice**, four JPEGs, no missing/duplicate images.
All outputs are 1200 × 1200. Original total 12,757.8 KiB; optimized total 804.6 KiB;
93.69% saved. The four outputs are approximately 190.8, 217.9, 191.5 and 204.4 KiB.
This group is **unmatched** because the catalog contains only the four existing
sample listings. No product was added or approved, and ordering remains disabled.

## Verification

`npm.cmd test` includes isolated image fixtures testing grouping, ambiguity, missing
and corrupt inputs, output ownership, numerical galleries, resizing, no enlargement,
orientation, metadata removal, unchanged originals, incremental cache behavior and
preservation of sample approval/order guards. Run `npm.cmd run lint`,
`npm.cmd run typecheck`, `npm.cmd run typecheck:backend` and `npm.cmd run build`
after changes. All image tests are offline and use disposable fixture directories
inside `.storefront-check/`.

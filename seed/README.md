# Seed content

Local-first fixture data per [ADR 0004](../../lvhomesbygigi/docs/adr/0004-local-content-fixtures.md).
Documents use their real (published) `_id` — no `drafts.` prefix — and must validate against
the schema shipped in the same commit.

## Contents

- `seed.ndjson` — `siteSettings` (fixed `_id: "siteSettings"`), `serviceArea` (fixed
  `_id: "serviceArea"`), and 12 `pricingSheet` docs (deterministic
  `_id: pricingSheet-<propertyType>-<furnished|unfurnished>-<language>`).
- `assets/*.pdf` — the 12 placeholder pricing PDFs referenced by the `pricingSheet` docs via
  `_sanityAsset: "file@file://./assets/<name>.pdf"`. Regenerate with
  `bun run scripts/generate-placeholder-pdfs.ts` (real, selectable text — not scanned images).
- 4 `listing` docs (3 rentals + 1 sale, readable seed IDs like `listing-seed-windmere-rental`
  — ordinary listings get Sanity-generated IDs once created for real; these fixed IDs are a
  seed-only convenience) with placeholder photos in `assets/*.jpg` + one shared
  `assets/floorplan-3br-2ba.svg`.
- 5 `recentSale` docs (readable seed IDs, same convention as `listing`), sold dates spread
  over the last ~18 months, mixing address-style and neighborhood-only display strings and
  with/without `soldPrice`/`note` to exercise genuine field absence.

## Consuming this seed

The site repo's `bun run content:sync` script reads this directory to build
`content-fixtures/dataset.json` for local GROQ evaluation (`groq-js`) — no publish required.

## Publishing (deferred — user-triggered, tracked with site#18)

```sh
sanity schema deploy   # or MCP deploy_schema
sanity dataset import seed/seed.ndjson production --replace
```

## Placeholder values in this seed

Flagged in `<scratchpad>/team/placeholders.md`:

- `licenses[].licenseNumber` for Jessica (Property Management + Sales) and Gigi (Sales) —
  real Nevada license numbers unconfirmed; `isPlaceholder: true` on each entry.
- `buildiumOwnerPortalUrl` / `buildiumTenantPortalUrl` — placeholder URLs; no real Buildium
  portal links exist yet (no production credentials this run — charter override #3).
- `socialLinks` is intentionally omitted from this seed (optional field, no real URLs to seed yet).
- All 12 `pricingSheet` PDFs (`assets/pricing-*.pdf`) are placeholder pricing content —
  real, selectable text with a visible PLACEHOLDER banner, not final pricing. Launch-content
  TODO: replace with Jessica's real pricing before publish.
- All 4 `listing` addresses, prices, and bilingual descriptions are invented placeholder
  content (real free-license stock photos, though — not gray boxes). The
  `tourUrl` on the Rainbow Ridge listing is a placeholder Matterport-style URL; its
  `videoUrl` is a real, currently-public YouTube house-tour video used only as a stand-in.
- All 5 `recentSale` addresses, prices, and dates are invented placeholder content (real
  stock photos, reused from the `listing` set). `serviceArea.managedAreas`' two extra ZIPs
  (89129, 89131) are illustrative "legacy managed property" examples, not confirmed real
  currently-managed ZIPs — flagged for Jessica/Gigi to confirm the actual list.

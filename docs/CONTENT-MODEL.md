# Sanity Content Model — Spec

Derived from `../lvhomesbygigi/docs/PRD.md` (canonical) and `../lvhomesbygigi/CONTEXT.md`. This is the build spec for `schemaTypes/`. **When the PRD and this doc disagree, the PRD wins — then fix this doc.**

**Status:** `siteSettings` + i18n foundation (studio#2), `serviceArea` + `pricingSheet` (studio#3), `listing` (studio#4), and `recentSale` + `serviceArea.managedAreas` (studio#5) built + seeded. The bootstrap `post` type is gone. Remaining types land in later slices per the parent PRD's build order.

## Conventions

- Each type in its own file under `schemaTypes/`, registered in `index.ts`.
- `defineType` / `defineField` everywhere.
- **Bilingual editorial text (EN + ES) — approach decided in [ADR 0002 (i18n)](../../lvhomesbygigi/docs/adr/0002-i18n.md):** structured content uses **field-level** localization via `sanity-plugin-internationalized-array` (`internationalizedArrayString` / `internationalizedArrayText` / a `simpleBlockContent` Portable Text variant). Language-agnostic fields (price, photos, coordinates, status, dates) stay single. **In the tables below, a `Xen`/`Xes` pair denotes ONE localized field, not two.** Presentation pages (e.g. homepage) use **document-level** localization via `@sanity/document-internationalization`. (PRD §12)
- Add `validation`, human-readable `title`s, and list `preview`s so the Studio stays approachable for non-technical editors. (PRD §14)
- Images that render on the site require **alt text** (WCAG 2.1 AA — PRD §13).

## Document types

### listing (rentals + for-sale) — PRD §6, §7 — **built + seeded, studio#4**
Shared template; `kind: 'rental' | 'sale'`.

| Field | Type | Notes |
|---|---|---|
| kind | string (rental/sale) | drives status options; agent lane + index page arrive with teamMember (studio#7) |
| title / slug | string / slug | |
| address | object | street, **neighborhood** (added — see decision below), city, zip |
| showNeighborhoodOnly | boolean | render neighborhood + zip instead of street (owner discretion); validated to require `address.neighborhood` be set |
| beds / baths / sqft | number | all required |
| price | number | monthly rent (rental) or sale price (sale) |
| status | string | rental: available/pending/rented · sale: active/pending/sold — one shared field; cross-field validation rejects a mismatched kind/status pair (e.g. a sale with status "rented") |
| furnished | boolean | rentals primarily, but modeled on both kinds |
| description | `internationalizedArraySimpleBlockContent` | **localized EN/ES** Portable Text (a `Xen`/`Xes` pair per the convention above) |
| neighborhoodNotes | `internationalizedArrayText` | **localized EN/ES** "about the area" copy |
| photos | array(image, max 30) | alt text required per photo; one explicit `isHero` flag (not array order — see decision below); validation enforces the cap and exactly one hero |
| videoUrl | url | YouTube/Vimeo, optional |
| tourUrl | url | Matterport/3D, optional — the site only renders a tour block if this is set |
| floorPlan | image | optional, alt text required |
| areaInfographics | array(image) | optional, alt text required per image |
| coordinates | geopoint | **manual entry in v1** — see decision below |

**Decisions made while building this type:**
- **Hero photo = explicit flag, not "first item."** Array order isn't a stable editorial
  signal in Sanity Studio (drag-to-reorder), so `photos[].isHero` (boolean) marks the hero;
  validation requires exactly one `true`. Documented in `schemaTypes/listing.ts`'s header.
- **`address.neighborhood` added** (not in the original table) — needed so
  `showNeighborhoodOnly` has something to actually render besides `city`+`zip`; validation
  requires it be set before the toggle can be turned on.
- **Geocoding is manual-entry only in v1.** Auto-geocode-on-save (e.g. a Sanity Function
  hitting a geocoding API on publish) is a real nice-to-have but no such automation exists —
  deferred, not built.

### recentSale (sold gallery / credibility wall) — PRD §7, §8 — **built + seeded, studio#5**
`hero` image (alt required) · `addressOrNeighborhood` (one display string, editor discretion per entry) · `soldPrice` (optional) · `soldDate` (required) · `note` (`internationalizedArrayText`, **localized EN/ES**, optional) · `coordinates` (geopoint, **required** — unlike `listing`, sold pins are address-precise by design since closed transactions are public record, PRD §8). Renders as **specific** pins on the Portfolio Map.

### serviceArea (single source of truth) — PRD §5, §14, CONTEXT.md — **built + seeded, studio#3**
Fixed `_id: "serviceArea"`, pinned in Structure. Two **independent** lists (deliberately not
foreign-keyed — see below):

| Field | Type | Notes |
|---|---|---|
| zipEntries | array(object `zipEntry`) | `{zip, areaLabel}` — `areaLabel` is the PRD §5 per-zip "Area" table value (`docs/PRD.md:104-115`), now `internationalizedArrayString` (**localized EN/ES**, changed studio#5 — may surface on the service-area map for ES visitors, not just in the Studio) |
| namedRegions | array(object `namedRegion`) | `{name, displayName}` — `name` is an editor-only internal label; `displayName` is `internationalizedArrayString` (**localized EN/ES**), the public-facing name |
| managedAreas | array(string) | **studio#5, closes a PRD §8 gap** — bare ZIPs (validated 5-digit) used only to shade currently-managed properties on the Portfolio Map. Deliberately NOT foreign-keyed to `zipEntries`; may include ZIPs outside the serviced list (legacy managed properties predating the serviced-area definition, per CONTEXT.md). **Never stores a property address** — shading only. |

**PRD gap, surfaced not silently resolved:** the PRD's per-zip Area labels (10 zips) are
compound/overlapping (e.g. "Spring Valley / Mountains Edge") and do **not** reduce 1:1 to the
PRD's separate 5 canonical "named areas (display to user)" list. Rather than invent a mapping
the PRD doesn't specify, `zipEntries` and `namedRegions` are seeded as two independent lists;
`zipEntries[].areaLabel` is free text, not constrained to the 5 `namedRegions[].name` values.
Current zips: `89117, 89146, 89148, 89135, 89113, 89139, 89118, 89123, 89183, 89044`.
Named regions (5): Spring Valley · Mountains Edge · Enterprise / Southwest Las Vegas ·
Summerlin South · Henderson (Inspirada area — **89044 only**; `displayName` reads "select
areas of Henderson" / "zonas selectas de Henderson", never bare "Henderson", per PRD §8).

### pricingSheet — PRD §5, CONTEXT.md — **built + seeded, studio#3**
One document per `(propertyType, furnished, language)` ⇒ **12 total** (3 property types × 2 furnished states × 2 languages). Fields: `propertyType` (condo/townhouse/single-family, radio) · `furnished` (bool) · `language` (en/es, radio) · `pdf` (file, `application/pdf`, required). The wizard selects the matching sheet and emails it. `furnished` selects the PDF only — it is not a qualification input.
Duplicate-combo prevention is two-layered: (1) seeded docs use deterministic
`_id: pricingSheet-<propertyType>-<furnished|unfurnished>-<language>`, so following the
convention makes duplicates structurally impossible; (2) the `language` field also runs an
async client-query validation (`count()` of other docs sharing the same combo) as a
belt-and-suspenders check against an editor creating a second doc via the generic "Create
new" path with a random `_id`. All 12 placeholder PDFs are real, selectable text (generated
by `scripts/generate-placeholder-pdfs.ts`, committed) — not scanned images — with a visible
PLACEHOLDER banner; real pricing content is a launch-content TODO.

### teamMember — PRD §3, §13
`name` · `role` · `headshot` (alt text) · `bioEn` / `bioEs` · `licenseNumbers` · `phone` / `email` · `lane` (PM vs sales — drives listing agent + lead routing).

### testimonial — PRD §18
`quoteEn` / `quoteEs` · `attribution` · `source` (owner/tenant/google) · `featured` (bool). Manual curation; no live reviews widget in v1.

### siteSettings (singleton) — PRD §13, §15, §17 — **built, studio#2**
Fixed `_id: "siteSettings"`, pinned in Structure (no create-new path). Fields, grouped in the Studio:

| Field | Type | Notes |
|---|---|---|
| pmPhone / salesPhone | string | `702-337-3028` / `702-271-2074` |
| leadInboxEmail | string | `pmteam@lasvegashomesbygigi.com` |
| officeAddress | object | street/suite/city/state/zip — 8921 W. Sahara Ave, Suite A, LV NV 89117 |
| officeHours | `internationalizedArrayText` | **localized EN/ES** — e.g. "Mon–Fri 9–4 or by appointment" |
| equalHousingStatement | `internationalizedArrayText` | **localized EN/ES** compliance footer text |
| independentlyOwnedStatement | `internationalizedArrayText` | **localized EN/ES** — RE/MAX franchise disclosure |
| brokerageName | string | "RE/MAX Central" |
| licenses | array(object `license`) | `{personName, licenseType: 'Property Management'\|'Sales', licenseNumber, isPlaceholder}` — one entry per person + license type |
| dutiesOwedFormUrl | url | NRED Form 525 (real link, verified) |
| socialLinks | object | facebook/instagram/youtube/linkedin — optional, not yet seeded |
| buildiumOwnerPortalUrl / buildiumTenantPortalUrl | url | **placeholder** — no real Buildium links yet |

Seeded in `../studio-lvhomesbygigi/seed/seed.ndjson` per ADR 0004. i18n foundation (locales `en`+`es`) lives in `sanity.config.ts`: `sanity-plugin-internationalized-array` (field-level: `internationalizedArrayString`/`Text`/`SimpleBlockContent` — the last backed by the `simpleBlockContent` type in `schemaTypes/objects/simpleBlockContent.ts`) + `@sanity/document-internationalization` (document-level, currently wired to `['homePage']`).

### homepage / featured (singleton) — PRD §5 — **stub only, studio#8 builds it out**
Curated featured rentals/sales · hero configuration · owner-section content. A minimal `homePage` type (`title` + hidden `language`) exists today (`schemaTypes/homePage.ts`) solely so `@sanity/document-internationalization`'s `schemaTypes` option — which requires at least one real type — has something to target. studio#8 extends this file in place (don't replace it) and adds the localized-singleton structure entry (`homePage-en` / `homePage-es`).

## Not modeled in v1 (PRD §21)
No Buildium sync · no MLS/IDX · no online applications/payments · no auth portals · no live reviews widget. Listings are entered manually (~10 min each).

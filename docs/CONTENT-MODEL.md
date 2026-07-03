# Sanity Content Model — Spec

Derived from `../lvhomesbygigi/docs/PRD.md` (canonical) and `../lvhomesbygigi/CONTEXT.md`. This is the build spec for `schemaTypes/`. **When the PRD and this doc disagree, the PRD wins — then fix this doc.**

**Status:** content model complete for v1 — see "Content model — complete for v1" at the end of this doc. `siteSettings` + i18n foundation (studio#2), `serviceArea` + `pricingSheet` (studio#3), `listing` (studio#4), `recentSale` + `serviceArea.managedAreas` (studio#5), rental-application PDFs + `payRentDetails` on `siteSettings` (studio#6), `teamMember` + `testimonial` (studio#7), and `homePage` (studio#8) all built + seeded. The bootstrap `post` type is gone.

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
| kind | string (rental/sale) | drives status options + index page. Listing agent is **not** a field on `listing` — `teamMember.lane` ('pm' for rentals, 'sales' for sales) is looked up at query time by matching `kind`, same join-by-value pattern as `teamMember`↔`siteSettings.licenses[]` (no reference field needed while there's exactly one PM + one sales agent) |
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

### serviceArea (single source of truth) — PRD §5, §14, CONTEXT.md — **built + seeded, studio#3, extended studio#5**
Fixed `_id: "serviceArea"`, pinned in Structure. Three **independent** lists (deliberately not
foreign-keyed to each other — see below):

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

### teamMember — PRD §3, §13 — **built + seeded, studio#7**
`name` · `role` (`internationalizedArrayString`, **localized EN/ES**, the public-facing title) · `lane` ('pm'\|'sales', stable non-localized enum — drives listing agent display + lead routing, never rendered directly; same split pattern as `siteSettings.licenses[].licenseType`/`licenseTypeLabel`) · `headshot` (image, alt required) · `bio` (`internationalizedArrayText`, **localized EN/ES**) · `phone` / `email` · `order` (manual, number).

**License numbers are NOT duplicated here.** `siteSettings.licenses[]` stays the one source of truth (already built in studio#2/#5, already consumed by the compliance footer) — the site joins a `teamMember` to their license(s) at query time by matching `siteSettings.licenses[].personName == teamMember.name` (GROQ: `*[_type=="siteSettings"][0].licenses[personName == ^.name]`). Seeded `teamMember.name` values (`Jessica`, `Gigi`) match their `personName` counterparts exactly.

### testimonial — PRD §18 — **built + seeded, studio#7**
`quote` (`internationalizedArrayText`, **localized EN/ES**) · `attribution` · `source` (owner/tenant/google) · `featured` (bool) · `order` (manual, number). Manual curation; no live reviews widget in v1.

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
| licenses | array(object `license`) | `{personName, licenseType: 'Property Management'\|'Sales' (stable enum, code-facing, never rendered directly), licenseTypeLabel (`internationalizedArrayString`, **localized EN/ES**, the public-facing text — QA fix, studio#5), licenseNumber, isPlaceholder}` — one entry per person + license type |
| dutiesOwedFormUrl | url | NRED Form 525 (real link, verified) |
| socialLinks | object | facebook/instagram/youtube/linkedin — optional, not yet seeded |
| buildiumOwnerPortalUrl / buildiumTenantPortalUrl | url | **placeholder** — no real Buildium links yet |
| rentalApplicationPdfEn / rentalApplicationPdfEs | file | **added studio#6** — two named file fields (not a localized-file abstraction: the i18n plugin doesn't register `file` as a field type, and two obviously-named fields are simpler for Jessica than an array UI for just two languages). CMS-uploadable so she can replace the application without a deploy. Text-based/selectable placeholder PDFs seeded. |
| payRentDetails | object | **added studio#6, closes a CONTENT-MODEL gap** — `{zelleHandle, checkPayee, checkMailingAddress (street/suite/city/state/zip), dueDay, gracePeriodDays, lateFeePolicy (`internationalizedArrayText`, **localized EN/ES**)}`. Structured (not one text blob) so the site renders each piece individually. `zelleHandle`/real `checkMailingAddress` are PRD §25 open items — seeded with clearly-flagged placeholders (`checkMailingAddress` currently mirrors `officeAddress` as a stand-in). |

**Why tenant resources live here, not a dedicated `tenantResources` doc:** there's only ever one of each (same true-singleton shape as everything else in this file), and Jessica already knows to look in Site Settings for "things that apply everywhere" — see `schemaTypes/siteSettings.ts`'s header for the full reasoning.

Seeded in `../studio-lvhomesbygigi/seed/seed.ndjson` per ADR 0004. i18n foundation (locales `en`+`es`) lives in `sanity.config.ts`: `sanity-plugin-internationalized-array` (field-level: `internationalizedArrayString`/`Text`/`SimpleBlockContent` — the last backed by the `simpleBlockContent` type in `schemaTypes/objects/simpleBlockContent.ts`) + `@sanity/document-internationalization` (document-level, currently wired to `['homePage']`).

### homePage (document-level localized singleton) — PRD §5 — **built + seeded, studio#8**
Two documents, `homePage-en` + `homePage-es`, linked through a `translation.metadata` doc
(`@sanity/document-internationalization`, per ADR 0002) — **not** field-level localization:
each document IS one locale, so every content field below is a plain type
(`string`/`text`/`image`), never `internationalizedArray*`. Originated as a minimal stub in
studio#2 (`title` + hidden `language`) purely so the plugin's `schemaTypes` option — which
throws on an empty array — had a real type to target; extended in place here, per that file's
own instruction, so the `homePage-en`/`homePage-es` IDs and plugin wiring stayed stable across
slices.

| Field | Type | Notes |
|---|---|---|
| language | string, hidden, readOnly | set by the per-locale initial-value template, never edited directly |
| title | string | editor-facing only, not rendered |
| hero | object | `{headline, subhead, image (alt required), ctaLabel, ctaTarget}` — `ctaTarget` is a locale-agnostic relative path (e.g. `/owners/pricing`); the site prepends the locale prefix via `getRelativeLocaleUrl` (ADR 0002), so the same value is correct in both `homePage-en` and `homePage-es` |
| ownerSection | object | `{heading, body, wizardCtaLabel}` — the block that leads owners toward `/owners/pricing` |
| featuredListings | array(reference → `listing`) | curated, validated 2–4, unique |
| featuredTestimonials | array(reference → `testimonial`) | curated, validated ≥1, unique |
| serviceAreaTeaser | object | `{heading, body}` — short copy pointing to the full service-area map |

Structure: pinned as a **localized singleton** (`structure/index.ts`'s
`createLocalizedSingleton` helper) — one "Home Page" list item expands to "Home Page
(English)" / "Home Page (Español)", each opening its fixed `homePage-<locale>` document.
`sanity.config.ts` registers a `homePage-en`/`homePage-es` initial-value template per locale
and filters both (plus Sanity's default `homePage` template) out of the global "+ New
document" menu — there is no path to create a stray `homePage` document anywhere, matching
`siteSettings`/`serviceArea`. Seeded `translation.metadata` doc links the two by reference
(`internationalizedArrayReference`, the plugin's own internal type — not something to hand-
author elsewhere).

### Owners-pages content decision (`/owners`, `/owners/why-us`, `/owners/faq`) — studio#8
**Code-managed in the site repo for v1** (MDX/static, same pattern as the site's other
stub pages), not CMS page documents. Rationale: the real copy for these pages is a PRD §22
human content TODO regardless of where it's modeled, so modeling them in Sanity now buys
nothing today; it would add 6 more document-level-localized page documents (3 pages × 2
locales) to maintain before there's real content to put in them; and migrating static
MDX → CMS-driven pages later is a clean, well-understood v2 step (add the schema, one-time
content migration) rather than a risky one. If a future slice needs more editor control over
these specific pages, revisit then — this isn't a permanent architectural commitment, just
the right amount of investment for where the content actually stands today.

## Not modeled in v1 (PRD §21)
No Buildium sync · no MLS/IDX · no online applications/payments · no auth portals · no live reviews widget. Listings are entered manually (~10 min each).

## Content model — complete for v1

Every document type named in this spec is now built and seeded (studio#2 through studio#8):
`siteSettings`, `serviceArea`, `pricingSheet`, `listing`, `recentSale`, `teamMember`,
`testimonial`, `homePage`. The two schema-design patterns worth carrying into any future
addition: (1) **field-level vs document-level i18n** — `internationalizedArray*` for
structured "things" reused across many documents, a separate document per locale for
presentation pages (ADR 0002); (2) **stable enum vs localized label** — when a field's raw
value needs to stay a fixed, code-comparable string (`licenseType`, `lane`), pair it with a
second, purely-cosmetic localized field for what actually renders (`licenseTypeLabel`,
`teamMember.role`) rather than localizing the enum itself.

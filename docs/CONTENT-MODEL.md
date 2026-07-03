# Sanity Content Model — Spec

Derived from `../lvhomesbygigi/docs/PRD.md` (canonical) and `../lvhomesbygigi/CONTEXT.md`. This is the build spec for `schemaTypes/`. **When the PRD and this doc disagree, the PRD wins — then fix this doc.**

**Status:** not yet built. The Studio currently has only the bootstrap `post` type. Delete it once the real model exists.

## Conventions

- Each type in its own file under `schemaTypes/`, registered in `index.ts`.
- `defineType` / `defineField` everywhere.
- **Bilingual editorial text (EN + ES) — approach decided in [ADR 0002 (i18n)](../../lvhomesbygigi/docs/adr/0002-i18n.md):** structured content uses **field-level** localization via `sanity-plugin-internationalized-array` (`internationalizedArrayString` / `internationalizedArrayText` / a `simpleBlockContent` Portable Text variant). Language-agnostic fields (price, photos, coordinates, status, dates) stay single. **In the tables below, a `Xen`/`Xes` pair denotes ONE localized field, not two.** Presentation pages (e.g. homepage) use **document-level** localization via `@sanity/document-internationalization`. (PRD §12)
- Add `validation`, human-readable `title`s, and list `preview`s so the Studio stays approachable for non-technical editors. (PRD §14)
- Images that render on the site require **alt text** (WCAG 2.1 AA — PRD §13).

## Document types

### listing (rentals + for-sale) — PRD §6, §7
Shared template; `kind: 'rental' | 'sale'`.

| Field | Type | Notes |
|---|---|---|
| kind | string (rental/sale) | drives status options, agent, and index page |
| title / slug | string / slug | |
| address | object | street, city, zip |
| showNeighborhoodOnly | boolean | render neighborhood + zip instead of street (owner discretion) |
| beds / baths / sqft | number | |
| price | number | monthly rent (rental) or sale price (sale) |
| status | string | rental: available/pending/rented · sale: active/pending/sold |
| furnished | boolean | rentals primarily |
| descriptionEn / descriptionEs | portable text | bilingual |
| neighborhoodNotesEn / …Es | text | bilingual "about the area" |
| photos | array(image) | up to 30, alt text required; one designated hero |
| videoUrl | url | YouTube/Vimeo, optional |
| tourUrl | url | Matterport/3D, optional — only renders if set |
| floorPlan | image | optional |
| areaInfographics | array(image) | optional |
| coordinates | geopoint | geocoded from address on save |

### recentSale (sold gallery / credibility wall) — PRD §7, §8
`hero` image · `addressOrNeighborhood` (editor discretion per entry) · `soldPrice` (optional) · `soldDate` · `noteEn` / `noteEs` (optional). Renders as **specific** pins on the Portfolio Map (closed transactions are public record).

### serviceArea (single source of truth) — PRD §5, §14, CONTEXT.md
Zip entries (`zip` + `areaLabel`) + named-region copy (EN/ES). Consumed by the Owner Qualification Wizard, the service-area map, and marketing copy. **One document — never duplicate the zip list elsewhere.**
Current zips: `89117, 89146, 89148, 89135, 89113, 89139, 89118, 89123, 89183, 89044`.
Named regions: Spring Valley · Mountains Edge · Enterprise / SW Las Vegas · Summerlin South · Inspirada-area Henderson (**89044 only**).

### pricingSheet — PRD §5, CONTEXT.md
One document per `(propertyType, furnished, language)` ⇒ **12 total** (3 property types × 2 furnished states × 2 languages). Fields: `propertyType` (condo/townhouse/single-family) · `furnished` (bool) · `language` (en/es) · `pdf` (file). The wizard selects the matching sheet and emails it. `furnished` selects the PDF only — it is not a qualification input.

### teamMember — PRD §3, §13
`name` · `role` · `headshot` (alt text) · `bioEn` / `bioEs` · `licenseNumbers` · `phone` / `email` · `lane` (PM vs sales — drives listing agent + lead routing).

### testimonial — PRD §18
`quoteEn` / `quoteEs` · `attribution` · `source` (owner/tenant/google) · `featured` (bool). Manual curation; no live reviews widget in v1.

### siteSettings (singleton) — PRD §13, §15, §17
Compliance footer content · license numbers · PM phone `702-337-3028` · sales phone `702-271-2074` · lead inbox `pmteam@lasvegashomesbygigi.com` · office address (8921 W. Sahara Ave, Suite A, LV NV 89117) + hours · social links · Buildium owner + tenant portal URLs · Nevada "Duties Owed" form link.

### homepage / featured (singleton) — PRD §5
Curated featured rentals/sales · hero configuration · owner-section content.

## Not modeled in v1 (PRD §21)
No Buildium sync · no MLS/IDX · no online applications/payments · no auth portals · no live reviews widget. Listings are entered manually (~10 min each).

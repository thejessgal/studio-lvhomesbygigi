# lvhomesbygigi — Sanity Studio (content model + editing)

> `CLAUDE.md` is a symlink to this file. Edit **`AGENTS.md`**; Claude Code and other agents read the same content.

Sanity Studio for **Las Vegas Homes by Gigi** (RE/MAX Central). This repo owns the **content model** (schema) and the editing UI Jessica/Gigi use. The public Astro site consumes this content.

## Companion repos (all live under `~/projects/`)

| Repo | Path | Role |
|---|---|---|
| **Site** | `../lvhomesbygigi` | Astro frontend. Queries this studio's content via GROQ. |
| Archive | `../lvhomesbygigi-archive` | Original planning docs/markdown only. **Ignore `prototype/index.html` — throwaway slop, never a reference.** |

Shared Sanity backend: **project `d4yh3822`, dataset `production`** — see [sanity.config.ts](sanity.config.ts) and [sanity.cli.ts](sanity.cli.ts).

## Product source of truth

- **`../lvhomesbygigi/docs/PRD.md`** — approved v1 PRD (canonical scope). Lives in the site repo.
- **`../lvhomesbygigi/CONTEXT.md`** — domain glossary (Serviced Area, Qualification, Pricing Sheet, Owner Qualification Wizard).
- **[docs/CONTENT-MODEL.md](docs/CONTENT-MODEL.md)** — the schema spec for THIS repo: the document types + fields the model must support, derived from the PRD. **Start here before adding schema.**

## Stack

- **Sanity Studio v6.3** · plugins: `structureTool`, `visionTool` (GROQ playground) · React 19.
- **Package manager: bun.**
- Prettier: no semicolons, single quotes, no bracket spacing, printWidth 100. ESLint via `@sanity/eslint-config-studio`.

## Commands

```sh
bun install
bun dev            # sanity dev → Studio at http://localhost:3333
bun run build      # sanity build
bun run deploy     # sanity deploy → hosted Studio (auto-updates enabled in sanity.cli.ts)
```

Use the **Vision** tool inside the running Studio to prototype GROQ before wiring queries into the site.

## Schema layout

```
schemaTypes/
  index.ts               # aggregates all types into the `schemaTypes` array
  siteSettings.ts        # singleton — compliance footer, contact, licenses, portals, rental application PDFs, pay-rent details
  serviceArea.ts         # singleton — zip list + named regions + managedAreas (single source of truth)
  pricingSheet.ts        # 12 docs — propertyType × furnished × language
  listing.ts             # rentals + for-sale shared template
  recentSale.ts          # sold gallery — address-precise map pins
  teamMember.ts          # Jessica/Gigi — licenses joined from siteSettings.licenses[] by name, not duplicated
  testimonial.ts         # curated quotes — owner/tenant/google, manual featured + order
  homePage.ts            # document-level localized singleton — homePage-en/homePage-es
  objects/
    simpleBlockContent.ts  # Portable Text variant registered with the i18n plugin
structure/
  index.ts               # Structure resolver — pins siteSettings/serviceArea as singletons + homePage as a localized singleton
scripts/
  generate-placeholder-pdfs.ts  # regenerates the 12 seed/assets/*.pdf pricing-sheet placeholders
  generate-rental-application-pdfs.ts  # regenerates the 2 seed/assets/rental-application-*.pdf placeholders
```

Define each document/object type with `defineType` + `defineField`, export it from its own file, and register it in `index.ts`. i18n plugins (`sanity-plugin-internationalized-array`, `@sanity/document-internationalization`) are configured in `sanity.config.ts` per ADR 0002.

**Current state:** the bootstrap `post` type is gone. The full v1 content model is built and
seeded (studio#2 through studio#8) — `siteSettings`, `serviceArea`, `pricingSheet`, `listing`,
`recentSale`, `teamMember`, `testimonial`, `homePage`. Full spec + build history:
[docs/CONTENT-MODEL.md](docs/CONTENT-MODEL.md).

## Content model (summary — full spec + field tables in [docs/CONTENT-MODEL.md](docs/CONTENT-MODEL.md))

- **listing** — rentals + for-sale (shared template, `kind` field): address w/ "neighborhood only" toggle, beds/baths/sqft, price, status, furnished, **bilingual** description + neighborhood notes, ≤30 photos + explicit hero flag (alt text), video/tour/floorplan URLs, area infographics, geo coordinates.
- **recentSale** — sold gallery: hero, address-or-neighborhood, optional sold price, sold date, note. (Renders as *specific* map pins.)
- **serviceArea** — single source of truth: zip list + named regions + managed-area map-shading zips. Consumed by wizard, map, and copy.
- **pricingSheet** — one per `(propertyType, furnished, language)` → 12 PDFs total. `furnished` selects the PDF, it is *not* a qualification input.
- **teamMember** — Jessica, Gigi: bilingual bio, headshot, license numbers (joined from `siteSettings.licenses[]`, not duplicated), contact, lane.
- **testimonial** — curated quotes (owner/tenant/Google), manual.
- **siteSettings** (singleton) — footer disclosures, license numbers, phones, address/hours, social, Buildium portal links, rental application PDFs, pay-rent details.
- **homePage** (document-level localized singleton, `homePage-en`/`homePage-es`) — hero, owner-section content, curated featured listings/testimonials, service-area teaser.

## Content-model rules (load-bearing)

- **Bilingual (EN + ES) is v1 standard** for all editorial text — approach decided in [ADR 0002 (i18n)](../lvhomesbygigi/docs/adr/0002-i18n.md): field-level `sanity-plugin-internationalized-array` for structured content, `@sanity/document-internationalization` for pages. Don't defer ES to v2. (PRD §12)
- **Serviced Area is one document, one source of truth.** Wizard, maps, and copy all read it. Don't duplicate the zip list. (PRD §5, §14)
- **Never model "qualified"/"unqualified" as editor- or user-facing labels** — internal engineering terms only. Editor/owner copy uses warm area/type language. (CONTEXT.md)
- **Address privacy:** listings need a "show neighborhood only" toggle; managed/active properties are never exposed at street precision on aggregate maps (only sold ones are). (PRD §8)
- **Pricing sheets are 12** across propertyType × furnished × language. (CONTEXT.md)
- **Keep the Studio approachable** for non-technical editors (Jessica is Wordpress/Squarespace-comfortable): clear titles, list previews, sensible field grouping, validation. (PRD §14)

## Working with Sanity

- Use the **`sanity-best-practices` skill** for schema design, GROQ, TypeGen, Portable Text, localization, and Studio structure.
- Use the **Sanity MCP**: `get_sanity_rules` (`schema`, `groq`, `get-started`), `get_schema`, `search_docs` / `read_docs` before writing schema or queries.
- After schema changes, redeploy the Studio and regenerate types so the site's queries stay in sync.

## Where work is tracked

- **Issues:** per-repo GitHub Issues — schema/Studio work here (`gh issue list -R thejessgal/studio-lvhomesbygigi`); site work lives in the site repo.
- **Board:** GitHub **Project #1** ("LV Homes by Gigi", owner `thejessgal`) spans both repos. Labels: `ready-for-agent` · `ready-for-human` · `needs-triage`.

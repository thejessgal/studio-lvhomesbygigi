# Seed content

Local-first fixture data per [ADR 0004](../../lvhomesbygigi/docs/adr/0004-local-content-fixtures.md).
Documents use their real (published) `_id` — no `drafts.` prefix — and must validate against
the schema shipped in the same commit.

## Contents

- `seed.ndjson` — `siteSettings` (fixed `_id: "siteSettings"`).

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

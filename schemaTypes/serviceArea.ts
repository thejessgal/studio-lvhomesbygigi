import {PinIcon} from '@sanity/icons/Pin'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Singleton — pinned to a fixed `_id: "serviceArea"` in Structure (see
 * `structure/index.ts`). The Owner Qualification Wizard, the service-area map, and
 * marketing copy all read this one document — never duplicate the zip list elsewhere
 * (CLAUDE.md non-negotiables, PRD §5/§14).
 *
 * Two independent lists, deliberately NOT foreign-keyed to each other:
 * - `zipEntries` carries the PRD §5 per-zip "Area" label verbatim (docs/PRD.md:104-115) —
 *   those labels are compound/overlapping (e.g. "Spring Valley / Mountains Edge") and do not
 *   reduce 1:1 to the five canonical named regions below, so forcing a join would invent
 *   data the PRD doesn't specify. Flagged to the team lead — see studio-3 report.
 * - `namedRegions` is the PRD's separate, unambiguous "named areas (display to user)" list —
 *   used for marketing copy / the service-area map's public-facing region names.
 */
export const serviceAreaType = defineType({
  name: 'serviceArea',
  title: 'Service Area',
  type: 'document',
  icon: PinIcon,
  groups: [
    {name: 'zips', title: 'Zip Codes'},
    {name: 'regions', title: 'Named Regions'},
  ],
  fields: [
    defineField({
      name: 'zipEntries',
      title: 'Zip codes served',
      type: 'array',
      group: 'zips',
      description:
        'The canonical serviced zip list (PRD §5). Never duplicate this list anywhere else.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'zipEntry',
          fields: [
            defineField({
              name: 'zip',
              title: 'ZIP',
              type: 'string',
              validation: (rule) =>
                rule.required().regex(/^\d{5}$/, {name: '5-digit ZIP'}),
            }),
            defineField({
              name: 'areaLabel',
              title: 'Area label',
              type: 'string',
              description: 'Warm, editor-facing area description for this ZIP (PRD §5 table).',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {zip: 'zip', areaLabel: 'areaLabel'},
            prepare: ({zip, areaLabel}) => ({title: zip, subtitle: areaLabel}),
          },
        }),
      ],
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .custom((entries: Array<{zip?: string}> | undefined) => {
            if (!entries) return true
            const zips = entries.map((entry) => entry.zip).filter(Boolean)
            const duplicates = zips.filter((zip, i) => zips.indexOf(zip) !== i)
            return duplicates.length === 0 || `Duplicate ZIP(s): ${[...new Set(duplicates)].join(', ')}`
          }),
    }),
    defineField({
      name: 'namedRegions',
      title: 'Named regions',
      type: 'array',
      group: 'regions',
      description:
        'The PRD\'s public "named areas" list — used in marketing copy and the service-area ' +
        'map. Henderson\'s display name must never read as bare "Henderson" (PRD §5/§8) — say ' +
        '"select areas of Henderson" (EN) or the equivalent warm ES phrasing instead.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'namedRegion',
          fields: [
            defineField({
              name: 'name',
              title: 'Internal name',
              type: 'string',
              description: 'Editor-facing label only — not rendered publicly.',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'displayName',
              title: 'Public display name',
              type: 'internationalizedArrayString',
              description: 'What renders to visitors. Localized EN/ES.',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {name: 'name'},
            prepare: ({name}) => ({title: name}),
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {zipCount: 'zipEntries.length', regionCount: 'namedRegions.length'},
    prepare: ({zipCount, regionCount}) => ({
      title: 'Service Area',
      subtitle: `${zipCount ?? 0} zips · ${regionCount ?? 0} named regions`,
    }),
  },
})

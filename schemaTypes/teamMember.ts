import {UserIcon} from '@sanity/icons/User'
import {defineField, defineType} from 'sanity'

/**
 * `lane` vs `role`: same split as `siteSettings.licenses[].licenseType`/`licenseTypeLabel`
 * (studio#5) — `lane` ('pm' | 'sales') is a stable, non-localized enum that drives listing
 * agent display + lead routing logic; `role` is the localized, public-facing job title
 * actually rendered on the page. Never render `lane` directly to visitors.
 *
 * License numbers: NOT duplicated here. `siteSettings.licenses[]` (studio#2/#5) is the one
 * source of truth for license numbers, already consumed by the compliance footer. The site
 * joins a `teamMember` to their license(s) at query time by matching
 * `siteSettings.licenses[].personName == teamMember.name` — so seeded `name` values here
 * must exactly match the corresponding `personName` in `siteSettings.licenses[]`.
 *
 * `name`'s validation runs an async, client-query-based check (same pattern as
 * `pricingSheet`'s duplicate-combo check) that warns — doesn't block — if no
 * `siteSettings.licenses[]` entry's `personName` matches, since that join silently fails
 * (renders no license) rather than erroring if the names ever drift apart.
 */
export const teamMemberType = defineType({
  name: 'teamMember',
  title: 'Team Member',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'Must exactly match the matching entry\'s `personName` in siteSettings.licenses[].',
      validation: (rule) =>
        rule
          .required()
          .custom(async (name, context) => {
            if (!name) return true
            const client = context.getClient({apiVersion: '2026-02-01'})
            const count = await client.fetch(
              `count(*[_type == "siteSettings"][0].licenses[personName == $name])`,
              {name},
            )
            return (
              count > 0 ||
              'No license entry matches this name; the About page license display joins by exact name.'
            )
          })
          .warning(),
    }),
    defineField({
      name: 'role',
      title: 'Public role / title',
      type: 'internationalizedArrayString',
      description: 'What renders on the page, e.g. "Property Manager & Broker". Localized EN/ES.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'lane',
      title: 'Lane',
      type: 'string',
      description: 'Internal — drives listing agent display + lead routing. Never rendered directly.',
      options: {list: [{title: 'Property Management', value: 'pm'}, {title: 'Sales', value: 'sales'}]},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'headshot',
      title: 'Headshot',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Required — WCAG 2.1 AA (PRD §13).',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'internationalizedArrayText',
      description: 'Localized EN/ES.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (rule) =>
        rule.required().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {name: 'email', invert: false}),
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      description: 'Lower numbers show first.',
      initialValue: 0,
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    {title: 'Display order', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]},
  ],
  preview: {
    select: {name: 'name', lane: 'lane', media: 'headshot'},
    prepare: ({name, lane, media}) => ({
      title: name,
      subtitle: lane === 'pm' ? 'Property Management' : lane === 'sales' ? 'Sales' : undefined,
      media,
    }),
  },
})

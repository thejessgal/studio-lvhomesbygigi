import {CogIcon} from '@sanity/icons/Cog'
import {defineField, defineType} from 'sanity'

/**
 * Singleton — pinned to a fixed `_id: "siteSettings"` in Structure (see
 * `structure/index.ts`). Holds the compliance footer, contact numbers, office
 * details, and portal links every page reads. Never duplicate these values
 * elsewhere (CLAUDE.md non-negotiables).
 *
 * `licenses[].licenseType` vs `licenses[].licenseTypeLabel`: `licenseType` stays a plain,
 * stable enum ('Property Management' | 'Sales') for code/filtering — it's not localized on
 * purpose, so string comparisons keep working regardless of locale. `licenseTypeLabel`
 * (internationalizedArrayString) is the actual public-facing text; render that, never
 * `licenseType` directly, on any user-visible surface (QA finding from slice 1 — the footer
 * was printing the English enum untranslated on the ES site).
 */
export const siteSettingsType = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    {name: 'contact', title: 'Contact'},
    {name: 'compliance', title: 'Compliance & Footer'},
    {name: 'social', title: 'Social & Portals'},
  ],
  fields: [
    defineField({
      name: 'pmPhone',
      title: 'Property management phone',
      type: 'string',
      description: 'Displayed for owner/tenant inquiries.',
      group: 'contact',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'salesPhone',
      title: 'Sales phone',
      type: 'string',
      description: 'Displayed for buyer/seller inquiries.',
      group: 'contact',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'leadInboxEmail',
      title: 'Lead inbox email',
      type: 'string',
      description: 'Shared PM team inbox that most lead forms route to alongside Jessica/Gigi (PRD §15).',
      group: 'contact',
      validation: (rule) =>
        rule
          .required()
          .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {name: 'email', invert: false}),
    }),
    defineField({
      name: 'officeAddress',
      title: 'Office address',
      type: 'object',
      group: 'contact',
      fields: [
        defineField({name: 'street', title: 'Street', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'suite', title: 'Suite / unit', type: 'string'}),
        defineField({name: 'city', title: 'City', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'state', title: 'State', type: 'string', initialValue: 'NV', validation: (rule) => rule.required()}),
        defineField({name: 'zip', title: 'ZIP', type: 'string', validation: (rule) => rule.required()}),
      ],
      preview: {
        select: {street: 'street', city: 'city'},
        prepare: ({street, city}) => ({title: [street, city].filter(Boolean).join(', ')}),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'officeHours',
      title: 'Office hours',
      type: 'internationalizedArrayText',
      description: 'e.g. "Mon–Fri 9–4 or by appointment". Localized EN/ES.',
      group: 'contact',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'equalHousingStatement',
      title: 'Equal Housing Opportunity statement',
      type: 'internationalizedArrayText',
      description: 'Compliance footer text (PRD §13). Localized EN/ES.',
      group: 'compliance',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'independentlyOwnedStatement',
      title: '"Each Office Independently Owned and Operated" statement',
      type: 'internationalizedArrayText',
      description: 'RE/MAX-required franchise disclosure. Localized EN/ES.',
      group: 'compliance',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'brokerageName',
      title: 'Brokerage name',
      type: 'string',
      group: 'compliance',
      initialValue: 'RE/MAX Central',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'licenses',
      title: 'License numbers',
      type: 'array',
      group: 'compliance',
      description:
        'One entry per person + license type. Flag placeholder numbers in `isPlaceholder` until confirmed.',
      of: [
        {
          type: 'object',
          name: 'license',
          fields: [
            defineField({name: 'personName', title: 'Name', type: 'string', validation: (rule) => rule.required()}),
            defineField({
              name: 'licenseType',
              title: 'License type',
              type: 'string',
              description:
                'Internal category, used for logic/filtering — never rendered to visitors directly. See `licenseTypeLabel` for the public-facing text.',
              options: {list: ['Property Management', 'Sales']},
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'licenseTypeLabel',
              title: 'Public license type label',
              type: 'internationalizedArrayString',
              description:
                'What renders on the public footer (e.g. ES visitors see "Administración de propiedades", not the English `licenseType` value). Localized EN/ES.',
              validation: (rule) => rule.required(),
            }),
            defineField({name: 'licenseNumber', title: 'License number', type: 'string', validation: (rule) => rule.required()}),
            defineField({
              name: 'isPlaceholder',
              title: 'Placeholder value',
              type: 'boolean',
              description: 'Check while the real license number is unconfirmed.',
              initialValue: true,
            }),
          ],
          preview: {
            select: {title: 'personName', subtitle: 'licenseType', number: 'licenseNumber', placeholder: 'isPlaceholder'},
            prepare: ({title, subtitle, number, placeholder}) => ({
              title: `${title} — ${subtitle}`,
              subtitle: placeholder ? `${number} (placeholder)` : number,
            }),
          },
        },
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'dutiesOwedFormUrl',
      title: 'Nevada "Duties Owed" form link',
      type: 'url',
      description: 'NRED Form 525 — mandatory disclosure link (PRD §13).',
      group: 'compliance',
      validation: (rule) => rule.required().uri({scheme: ['https']}),
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      type: 'object',
      group: 'social',
      fields: [
        defineField({name: 'facebook', title: 'Facebook', type: 'url'}),
        defineField({name: 'instagram', title: 'Instagram', type: 'url'}),
        defineField({name: 'youtube', title: 'YouTube', type: 'url'}),
        defineField({name: 'linkedin', title: 'LinkedIn', type: 'url'}),
      ],
    }),
    defineField({
      name: 'buildiumOwnerPortalUrl',
      title: 'Buildium owner portal URL',
      type: 'url',
      description: 'PLACEHOLDER — replace with the real Buildium owner-portal login URL before publish.',
      group: 'social',
      validation: (rule) => rule.required().uri({scheme: ['https']}),
    }),
    defineField({
      name: 'buildiumTenantPortalUrl',
      title: 'Buildium tenant portal URL',
      type: 'url',
      description: 'PLACEHOLDER — replace with the real Buildium tenant-portal login URL before publish.',
      group: 'social',
      validation: (rule) => rule.required().uri({scheme: ['https']}),
    }),
  ],
  preview: {
    select: {pmPhone: 'pmPhone', salesPhone: 'salesPhone'},
    prepare: ({pmPhone, salesPhone}) => ({
      title: 'Site Settings',
      subtitle: [pmPhone, salesPhone].filter(Boolean).join(' · '),
    }),
  },
})

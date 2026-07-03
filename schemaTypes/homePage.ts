import {HomeIcon} from '@sanity/icons/Home'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Localized singleton — one document per locale (`homePage-en` / `homePage-es`), linked via
 * `translation.metadata`, via `@sanity/document-internationalization` (ADR 0002). Pinned in
 * Structure (see `structure/index.ts`'s `createLocalizedSingleton`) — no "create new homePage"
 * path exists anywhere (filtered out of the global "+" menu in `sanity.config.ts` too).
 *
 * Because localization here is **document-level** (the whole document IS one locale), every
 * content field below is a plain type (`string`/`text`/`image`) — NOT an
 * `internationalizedArray*` type. Mixing field-level localization into a document that's
 * already locale-scoped would be redundant and wrong; that pattern is reserved for
 * structured "things" reused across many documents (see `serviceArea`, `siteSettings`, etc).
 *
 * Originally a stub in studio#2 (existed only so `@sanity/document-internationalization`'s
 * `schemaTypes` option — which requires a real registered type — had something to target).
 * Extended in place here per that file's own instruction, so the plugin wiring and the
 * `homePage-en`/`homePage-es` singleton IDs stay stable.
 */
export const homePageType = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  icon: HomeIcon,
  groups: [
    {name: 'hero', title: 'Hero'},
    {name: 'ownerSection', title: 'Owner Section'},
    {name: 'featured', title: 'Featured Curation'},
    {name: 'serviceAreaTeaser', title: 'Service Area Teaser'},
  ],
  fields: [
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'title',
      title: 'Internal title',
      type: 'string',
      description: 'Editor-facing only — not rendered on the page.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'hero',
      title: 'Hero',
      type: 'object',
      group: 'hero',
      fields: [
        defineField({name: 'headline', title: 'Headline', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'subhead', title: 'Subhead', type: 'text'}),
        defineField({
          name: 'image',
          title: 'Hero image',
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
        defineField({name: 'ctaLabel', title: 'CTA label', type: 'string', validation: (rule) => rule.required()}),
        defineField({
          name: 'ctaTarget',
          title: 'CTA target',
          type: 'string',
          description: 'A relative site path (e.g. "/owners/pricing") or full URL.',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'ownerSection',
      title: 'Owner Section',
      type: 'object',
      group: 'ownerSection',
      description: 'The homepage block that leads owners toward the Qualification Wizard.',
      fields: [
        defineField({name: 'heading', title: 'Heading', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'body', title: 'Body', type: 'text', validation: (rule) => rule.required()}),
        defineField({
          name: 'wizardCtaLabel',
          title: 'Wizard CTA label',
          type: 'string',
          description: 'Links to the Owner Qualification Wizard (/owners/pricing) — target is fixed, not editable here.',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featuredListings',
      title: 'Featured listings',
      type: 'array',
      group: 'featured',
      description: 'Curated rentals/sales for the homepage. 2–4 listings.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'listing'}]})],
      validation: (rule) => rule.required().min(2).max(4).unique(),
    }),
    defineField({
      name: 'featuredTestimonials',
      title: 'Featured testimonials',
      type: 'array',
      group: 'featured',
      of: [defineArrayMember({type: 'reference', to: [{type: 'testimonial'}]})],
      validation: (rule) => rule.required().min(1).unique(),
    }),
    defineField({
      name: 'serviceAreaTeaser',
      title: 'Service Area Teaser',
      type: 'object',
      group: 'serviceAreaTeaser',
      description: 'Short homepage copy pointing visitors to the full service-area map.',
      fields: [
        defineField({name: 'heading', title: 'Heading', type: 'string', validation: (rule) => rule.required()}),
        defineField({name: 'body', title: 'Body', type: 'text', validation: (rule) => rule.required()}),
      ],
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {title: 'title', language: 'language'},
    prepare: ({title, language}) => ({
      title: title || 'Home Page',
      subtitle: language?.toUpperCase(),
    }),
  },
})

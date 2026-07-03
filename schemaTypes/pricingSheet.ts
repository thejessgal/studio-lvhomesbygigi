import {DocumentPdfIcon} from '@sanity/icons/DocumentPdf'
import {defineField, defineType} from 'sanity'

const PROPERTY_TYPES = [
  {title: 'Condo', value: 'condo'},
  {title: 'Townhouse', value: 'townhouse'},
  {title: 'Single-Family Home', value: 'single-family'},
]

const LANGUAGES = [
  {title: 'English', value: 'en'},
  {title: 'Spanish', value: 'es'},
]

/**
 * One document per (propertyType, furnished, language) — 12 total, no more (PRD §5,
 * CONTEXT.md). `furnished` selects which PDF the wizard attaches; it is NEVER a
 * qualification input.
 *
 * Duplicate-combo prevention is two-layered:
 * 1. The seed (and any future editor-created doc, if it follows this convention) uses a
 *    deterministic `_id`: `pricingSheet-<propertyType>-<furnished|unfurnished>-<language>`.
 *    Two documents can't occupy the same `_id`, so following the convention makes
 *    duplicates structurally impossible.
 * 2. Because Studio's generic "Create new" still allows an editor to create a *second*
 *    document with a random `_id` but the same three field values, `language`'s validation
 *    below also runs an async, client-query-based check for existing docs sharing the same
 *    combo (excluding the current document) — belt-and-suspenders against that path.
 */
export const pricingSheetType = defineType({
  name: 'pricingSheet',
  title: 'Pricing Sheet',
  type: 'document',
  icon: DocumentPdfIcon,
  fields: [
    defineField({
      name: 'propertyType',
      title: 'Property type',
      type: 'string',
      options: {list: PROPERTY_TYPES, layout: 'radio'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'furnished',
      title: 'Furnished',
      type: 'boolean',
      description:
        'Affects which pricing sheet is sent — does not affect whether we service the property.',
      initialValue: false,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'language',
      title: 'Language',
      type: 'string',
      options: {list: LANGUAGES, layout: 'radio'},
      validation: (rule) =>
        rule
          .required()
          .custom(async (language, context) => {
            const {propertyType, furnished} = (context.document ?? {}) as {
              propertyType?: string
              furnished?: boolean
            }
            if (!language || !propertyType || furnished === undefined) return true

            const client = context.getClient({apiVersion: '2026-02-01'})
            const id = context.document?._id?.replace(/^drafts\./, '')
            const count = await client.fetch(
              `count(*[
                _type == "pricingSheet" &&
                propertyType == $propertyType &&
                furnished == $furnished &&
                language == $language &&
                _id != $id && _id != "drafts." + $id
              ])`,
              {propertyType, furnished, language, id},
            )
            return count === 0 || 'A pricing sheet for this property type, furnished state, and language already exists.'
          }),
    }),
    defineField({
      name: 'pdf',
      title: 'Pricing PDF',
      type: 'file',
      options: {accept: 'application/pdf'},
      description: 'Text-based (selectable text), not a scanned image — WCAG 2.1 AA (PRD §13).',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {propertyType: 'propertyType', furnished: 'furnished', language: 'language'},
    prepare: ({propertyType, furnished, language}) => {
      const propertyLabel =
        PROPERTY_TYPES.find((p) => p.value === propertyType)?.title ?? propertyType ?? 'Unset'
      const furnishedLabel = furnished ? 'Furnished' : 'Unfurnished'
      const languageLabel = language ? language.toUpperCase() : '??'
      return {title: `${propertyLabel} · ${furnishedLabel} · ${languageLabel}`}
    },
  },
})

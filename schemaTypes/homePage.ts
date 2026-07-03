import {HomeIcon} from '@sanity/icons/Home'
import {defineField, defineType} from 'sanity'

/**
 * Stub — full field set lands in studio#8 (S7: homePage singleton, document-level i18n).
 * Exists now only because @sanity/document-internationalization's `schemaTypes` option
 * requires at least one real, registered document type (it throws on an empty array) —
 * see sanity.config.ts. Extend this file in S7 rather than replacing it, so the plugin
 * wiring and any seeded `homePage-en`/`homePage-es` singleton IDs stay stable.
 */
export const homePageType = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  icon: HomeIcon,
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

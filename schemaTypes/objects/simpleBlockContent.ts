import {defineArrayMember, defineType} from 'sanity'

/**
 * Restricted Portable Text variant for internationalized fields.
 * Registered with sanity-plugin-internationalized-array's `fieldTypes`
 * (ADR 0002) so localized rich text becomes `internationalizedArraySimpleBlockContent`.
 * Kept intentionally plain (no custom blocks/annotations) for bilingual editorial copy.
 */
export const simpleBlockContentType = defineType({
  name: 'simpleBlockContent',
  title: 'Simple block content',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [{title: 'Normal', value: 'normal'}],
      lists: [],
      marks: {
        decorators: [
          {title: 'Bold', value: 'strong'},
          {title: 'Italic', value: 'em'},
        ],
        annotations: [],
      },
    }),
  ],
})

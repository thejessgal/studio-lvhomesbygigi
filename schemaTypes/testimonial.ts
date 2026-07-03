import {CommentIcon} from '@sanity/icons/Comment'
import {defineField, defineType} from 'sanity'

/**
 * Manually curated testimonials (PRD §18) — no live reviews widget in v1.
 */
export const testimonialType = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  icon: CommentIcon,
  fields: [
    defineField({
      name: 'quote',
      title: 'Quote',
      type: 'internationalizedArrayText',
      description: 'Localized EN/ES.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'attribution',
      title: 'Attribution',
      type: 'string',
      description: 'e.g. "Sarah M., homeowner" — editor discretion on how much detail to include.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      options: {list: [{title: 'Owner', value: 'owner'}, {title: 'Tenant', value: 'tenant'}, {title: 'Google', value: 'google'}]},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Featured testimonials surface first / on the homepage.',
      initialValue: false,
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
    select: {attribution: 'attribution', source: 'source', featured: 'featured'},
    prepare: ({attribution, source, featured}) => ({
      title: attribution,
      subtitle: `${source}${featured ? ' · featured' : ''}`,
    }),
  },
})

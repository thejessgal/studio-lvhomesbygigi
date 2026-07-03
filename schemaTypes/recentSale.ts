import {ThLargeIcon} from '@sanity/icons/ThLarge'
import {defineField, defineType} from 'sanity'

/**
 * Sold-gallery / credibility-wall entries (PRD §7, §8). Unlike `listing`, sold transactions
 * are public record, so these render as **address-precise** pins on the Portfolio Map —
 * `coordinates` is required here (it's manual-entry-optional on `listing`).
 */
export const recentSaleType = defineType({
  name: 'recentSale',
  title: 'Recent Sale',
  type: 'document',
  icon: ThLargeIcon,
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero photo',
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
      name: 'addressOrNeighborhood',
      title: 'Address or neighborhood',
      type: 'string',
      description:
        'One display string, editor\'s discretion per entry — the full street address, or ' +
        'just a neighborhood name, whichever feels right for this sale.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'soldPrice',
      title: 'Sold price',
      type: 'number',
      description: 'Optional — omit to not display a price.',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'soldDate',
      title: 'Sold date',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'note',
      title: 'Note',
      type: 'internationalizedArrayText',
      description: 'Optional short note about the sale. Localized EN/ES.',
    }),
    defineField({
      name: 'coordinates',
      title: 'Coordinates',
      type: 'geopoint',
      description: 'Required — sold pins are address-precise by design (PRD §8), public record.',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {media: 'hero', label: 'addressOrNeighborhood', soldDate: 'soldDate'},
    prepare: ({media, label, soldDate}) => ({
      title: label,
      subtitle: soldDate ? `Sold ${soldDate}` : undefined,
      media,
    }),
  },
})

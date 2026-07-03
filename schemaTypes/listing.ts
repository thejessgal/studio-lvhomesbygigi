import {HomeIcon} from '@sanity/icons/Home'
import {defineArrayMember, defineField, defineType} from 'sanity'

const RENTAL_STATUSES = ['available', 'pending', 'rented']
const SALE_STATUSES = ['active', 'pending', 'sold']

const STATUS_OPTIONS = [
  {title: 'Available (rental)', value: 'available'},
  {title: 'Pending', value: 'pending'},
  {title: 'Rented (rental)', value: 'rented'},
  {title: 'Active (for sale)', value: 'active'},
  {title: 'Sold', value: 'sold'},
]

/**
 * Shared rental + for-sale template (PRD §6, §7). `kind` drives which `status` values are
 * valid, and — once teamMember lands (studio#7) — which agent lane and index page a listing
 * belongs to.
 *
 * Two schema decisions worth documenting (also in docs/CONTENT-MODEL.md):
 * - **Hero photo:** an explicit `isHero` boolean per photo, not "first item in the array."
 *   Array order is not a stable signal in Sanity Studio (drag-to-reorder, and array items
 *   don't guarantee stable positional semantics the way a dedicated flag does) — an explicit
 *   flag survives reordering and is unambiguous for both editors and the frontend.
 * - **Geocoding:** `coordinates` is manual-entry only in v1. Auto-geocode-on-save (e.g. via a
 *   Sanity Function hitting a geocoding API on document publish) is a nice-to-have deferred
 *   to a later slice — no such automation exists yet.
 */
export const listingType = defineType({
  name: 'listing',
  title: 'Listing',
  type: 'document',
  icon: HomeIcon,
  groups: [
    {name: 'core', title: 'Core Details'},
    {name: 'description', title: 'Description'},
    {name: 'media', title: 'Media'},
  ],
  fields: [
    defineField({
      name: 'kind',
      title: 'Kind',
      type: 'string',
      group: 'core',
      options: {list: [{title: 'Rental', value: 'rental'}, {title: 'For Sale', value: 'sale'}], layout: 'radio'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'core',
      description: 'Internal + list title, e.g. "3BR Townhouse near Mountains Edge".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'core',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'object',
      group: 'core',
      fields: [
        defineField({name: 'street', title: 'Street', type: 'string', validation: (rule) => rule.required()}),
        defineField({
          name: 'neighborhood',
          title: 'Neighborhood',
          type: 'string',
          description:
            'General area name shown instead of the street address when "Show neighborhood only" is on.',
        }),
        defineField({name: 'city', title: 'City', type: 'string', validation: (rule) => rule.required()}),
        defineField({
          name: 'zip',
          title: 'ZIP',
          type: 'string',
          validation: (rule) => rule.required().regex(/^\d{5}$/, {name: '5-digit ZIP'}),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'showNeighborhoodOnly',
      title: 'Show neighborhood only',
      type: 'boolean',
      group: 'core',
      description:
        'When on, the site renders the neighborhood + ZIP instead of the street address (owner discretion, PRD §8). Requires `address.neighborhood` to be set.',
      initialValue: false,
      validation: (rule) =>
        rule.custom((value, context) => {
          const address = (context.document as {address?: {neighborhood?: string}} | undefined)?.address
          if (value && !address?.neighborhood) {
            return 'Set address.neighborhood before enabling "show neighborhood only".'
          }
          return true
        }),
    }),
    defineField({name: 'beds', title: 'Beds', type: 'number', group: 'core', validation: (rule) => rule.required().min(0)}),
    defineField({name: 'baths', title: 'Baths', type: 'number', group: 'core', validation: (rule) => rule.required().min(0)}),
    defineField({name: 'sqft', title: 'Square feet', type: 'number', group: 'core', validation: (rule) => rule.required().min(1)}),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      group: 'core',
      description: 'Monthly rent (rental) or list/sale price (sale).',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'core',
      options: {list: STATUS_OPTIONS},
      description: 'Options are shared across rentals and sales — validation below rejects a mismatched kind/status pair.',
      validation: (rule) =>
        rule.required().custom((status, context) => {
          const kind = (context.document as {kind?: string} | undefined)?.kind
          if (!status || !kind) return true
          if (kind === 'rental' && !RENTAL_STATUSES.includes(status)) {
            return `Rentals must be one of: ${RENTAL_STATUSES.join(', ')}`
          }
          if (kind === 'sale' && !SALE_STATUSES.includes(status)) {
            return `Sale listings must be one of: ${SALE_STATUSES.join(', ')}`
          }
          return true
        }),
    }),
    defineField({
      name: 'furnished',
      title: 'Furnished',
      type: 'boolean',
      group: 'core',
      initialValue: false,
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'internationalizedArraySimpleBlockContent',
      group: 'description',
      description: 'Localized EN/ES.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'neighborhoodNotes',
      title: 'Neighborhood notes',
      type: 'internationalizedArrayText',
      group: 'description',
      description: '"About the area" copy. Localized EN/ES.',
    }),
    defineField({
      name: 'photos',
      title: 'Photos',
      type: 'array',
      group: 'media',
      description: 'Up to 30. Exactly one must be marked as the hero photo.',
      of: [
        defineArrayMember({
          type: 'image',
          name: 'listingPhoto',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
              description: 'Required — WCAG 2.1 AA (PRD §13).',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'isHero',
              title: 'Hero photo',
              type: 'boolean',
              initialValue: false,
            }),
          ],
        }),
      ],
      validation: (rule) =>
        rule
          .max(30)
          .custom((photos: Array<{isHero?: boolean}> | undefined) => {
            if (!photos || photos.length === 0) return true
            const heroCount = photos.filter((p) => p.isHero).length
            if (heroCount === 0) return 'Mark exactly one photo as the hero photo.'
            if (heroCount > 1) return 'Only one photo can be marked as the hero photo.'
            return true
          }),
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      group: 'media',
      description: 'YouTube/Vimeo. Optional.',
    }),
    defineField({
      name: 'tourUrl',
      title: '3D tour URL',
      type: 'url',
      group: 'media',
      description: 'Matterport/3D. Optional — the site only renders a tour block if this is set.',
    }),
    defineField({
      name: 'floorPlan',
      title: 'Floor plan',
      type: 'image',
      group: 'media',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'areaInfographics',
      title: 'Area infographics',
      type: 'array',
      group: 'media',
      of: [
        defineArrayMember({
          type: 'image',
          name: 'infographic',
          fields: [
            defineField({name: 'alt', title: 'Alt text', type: 'string', validation: (rule) => rule.required()}),
          ],
        }),
      ],
    }),
    defineField({
      name: 'coordinates',
      title: 'Coordinates',
      type: 'geopoint',
      group: 'media',
      description: 'Manual entry in v1 — auto-geocode-on-save is deferred (see file header).',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      kind: 'kind',
      status: 'status',
      street: 'address.street',
      neighborhood: 'address.neighborhood',
      showNeighborhoodOnly: 'showNeighborhoodOnly',
    },
    prepare: ({title, kind, status, street, neighborhood, showNeighborhoodOnly}) => ({
      title: (showNeighborhoodOnly ? neighborhood : street) || title,
      subtitle: `${kind === 'sale' ? 'FOR SALE' : 'RENTAL'} · ${status ?? 'no status'}`,
    }),
  },
})

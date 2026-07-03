import {CogIcon} from '@sanity/icons/Cog'
import type {StructureResolver} from 'sanity/structure'

/**
 * Document types excluded from the generic type list below: `siteSettings` is
 * pinned as a true singleton; `homePage` is a document-internationalization
 * stub (schemaTypes/homePage.ts) hidden from nav until studio#8 builds its
 * real localized-singleton structure entry.
 */
const HIDDEN_FROM_GENERIC_LIST = ['siteSettings', 'homePage']

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings')
        .icon(CogIcon)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings').title('Site Settings')),

      S.divider(),

      ...S.documentTypeListItems().filter(
        (listItem) => !HIDDEN_FROM_GENERIC_LIST.includes(listItem.getId() as string),
      ),
    ])

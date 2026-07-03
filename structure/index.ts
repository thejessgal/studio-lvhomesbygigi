import {CogIcon} from '@sanity/icons/Cog'
import {PinIcon} from '@sanity/icons/Pin'
import type {StructureResolver} from 'sanity/structure'

/**
 * Document types excluded from the generic type list below: `siteSettings` and
 * `serviceArea` are pinned as true singletons; `homePage` is a
 * document-internationalization stub (schemaTypes/homePage.ts) hidden from nav
 * until studio#8 builds its real localized-singleton structure entry.
 */
const HIDDEN_FROM_GENERIC_LIST = ['siteSettings', 'serviceArea', 'homePage']

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings')
        .icon(CogIcon)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings').title('Site Settings')),

      S.listItem()
        .title('Service Area')
        .icon(PinIcon)
        .child(S.document().schemaType('serviceArea').documentId('serviceArea').title('Service Area')),

      S.divider(),

      ...S.documentTypeListItems().filter(
        (listItem) => !HIDDEN_FROM_GENERIC_LIST.includes(listItem.getId() as string),
      ),
    ])

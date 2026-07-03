import {CogIcon} from '@sanity/icons/Cog'
import {HomeIcon} from '@sanity/icons/Home'
import {PinIcon} from '@sanity/icons/Pin'
import type {StructureBuilder, StructureResolver} from 'sanity/structure'

/**
 * Document types excluded from the generic type list below: `siteSettings` and
 * `serviceArea` are pinned as true singletons; `homePage` is a
 * document-level-localized singleton (its own dedicated list item below, per
 * locale — see `createLocalizedSingleton`).
 */
const HIDDEN_FROM_GENERIC_LIST = ['siteSettings', 'serviceArea', 'homePage']

const LOCALES = [
  {id: 'en', title: 'English'},
  {id: 'es', title: 'Español'},
]

/** One list item per locale, each pinned to its fixed `<typeName>-<locale>` document ID. */
function createLocalizedSingleton(
  S: StructureBuilder,
  typeName: string,
  title: string,
  icon: React.ComponentType,
) {
  return S.listItem()
    .title(title)
    .icon(icon)
    .child(
      S.list()
        .title(title)
        .items(
          LOCALES.map((locale) =>
            S.listItem()
              .title(`${title} (${locale.title})`)
              .icon(icon)
              .child(
                S.document()
                  .schemaType(typeName)
                  .documentId(`${typeName}-${locale.id}`)
                  .initialValueTemplate(`${typeName}-${locale.id}`)
                  .title(`${title} (${locale.title})`),
              ),
          ),
        ),
    )
}

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

      createLocalizedSingleton(S, 'homePage', 'Home Page', HomeIcon),

      S.divider(),

      ...S.documentTypeListItems().filter(
        (listItem) => !HIDDEN_FROM_GENERIC_LIST.includes(listItem.getId() as string),
      ),
    ])

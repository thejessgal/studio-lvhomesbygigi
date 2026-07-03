import {documentInternationalization} from '@sanity/document-internationalization'
import {defineConfig, type Template} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {internationalizedArray} from 'sanity-plugin-internationalized-array'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

/** Locales — ADR 0002. Hardcoded list is acceptable for v1 (no `locale` document yet). */
const LOCALES = [
  {id: 'en', title: 'English'},
  {id: 'es', title: 'Español'},
]

export default defineConfig({
  name: 'default',
  title: 'LVHomesByGigi',

  projectId: 'd4yh3822',
  dataset: 'production',

  plugins: [
    structureTool({structure}),
    visionTool(),
    internationalizedArray({
      languages: LOCALES,
      fieldTypes: ['string', 'text', 'simpleBlockContent'],
    }),
    documentInternationalization({
      supportedLanguages: LOCALES,
      // Presentation/page singletons only (ADR 0002). Extend this list as more
      // page singletons land.
      schemaTypes: ['homePage'],
    }),
  ],

  schema: {
    types: schemaTypes,
  },

  // Document-level i18n for homePage (ADR 0002): one initial-value template per
  // locale, each pre-setting the hidden `language` field so the fixed
  // homePage-en/homePage-es IDs (see structure/index.ts) always land in the
  // right locale.
  templates: (prev: Template[]) => [
    ...prev,
    ...LOCALES.map(
      (locale): Template => ({
        id: `homePage-${locale.id}`,
        title: `Home Page (${locale.title})`,
        schemaType: 'homePage',
        parameters: [{name: 'language', type: 'string'}],
        value: {language: locale.id},
      }),
    ),
  ],

  document: {
    // homePage is a true singleton (only ever homePage-en/homePage-es, both
    // pre-seeded and reachable only via the Structure entry below) — hide it
    // from the global "+ New document" menu entirely, same as siteSettings/
    // serviceArea having no create-new path. Matches both Sanity's default
    // 'homePage' template and the two per-locale ones registered above.
    newDocumentOptions: (prev) => prev.filter((item) => !item.templateId.startsWith('homePage')),
  },
})

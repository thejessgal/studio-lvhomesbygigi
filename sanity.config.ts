import {documentInternationalization} from '@sanity/document-internationalization'
import {defineConfig} from 'sanity'
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
      // Presentation/page singletons only (ADR 0002). `homePage` is currently a
      // stub (see schemaTypes/homePage.ts) — extend this list as more page
      // singletons land.
      schemaTypes: ['homePage'],
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})

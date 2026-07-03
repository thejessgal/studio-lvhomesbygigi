/**
 * Generates the 12 placeholder pricing-sheet PDFs (3 propertyType × furnished × 2 language)
 * referenced by `seed/seed.ndjson` (ADR 0004). Real, selectable text — not a rasterized
 * image — so they stay WCAG 2.1 AA compliant even as placeholders. Real pricing content is
 * a launch-content TODO (see <scratchpad>/team/placeholders.md).
 *
 * Run: `bun run scripts/generate-placeholder-pdfs.ts`
 */
import {mkdir, writeFile} from 'node:fs/promises'
import path from 'node:path'
import {PDFDocument, StandardFonts, rgb} from 'pdf-lib'

const ASSETS_DIR = path.join(import.meta.dirname, '../seed/assets')

type PropertyType = 'condo' | 'townhouse' | 'single-family'
type Language = 'en' | 'es'

const PROPERTY_TYPES: PropertyType[] = ['condo', 'townhouse', 'single-family']
const FURNISHED_STATES = [true, false]
const LANGUAGES: Language[] = ['en', 'es']

const PROPERTY_TYPE_LABEL: Record<PropertyType, Record<Language, string>> = {
  condo: {en: 'Condo', es: 'Condominio'},
  townhouse: {en: 'Townhouse', es: 'Casa Adosada'},
  'single-family': {en: 'Single-Family Home', es: 'Casa Unifamiliar'},
}

const FURNISHED_LABEL: Record<'furnished' | 'unfurnished', Record<Language, string>> = {
  furnished: {en: 'Furnished', es: 'Amueblado'},
  unfurnished: {en: 'Unfurnished', es: 'Sin Amueblar'},
}

const COPY: Record<
  Language,
  {
    docTitle: (property: string, furnished: string) => string
    heading: (property: string, furnished: string) => string
    placeholderBanner: string
    intro: string
    tableHeaders: [string, string]
    tableRows: [string, string][]
    footnote: string
  }
> = {
  en: {
    docTitle: (property, furnished) =>
      `${property} — ${furnished} — Property Management Pricing (Placeholder)`,
    heading: (property, furnished) => `${property} · ${furnished} · Pricing Sheet`,
    placeholderBanner: 'PLACEHOLDER CONTENT — FOR INTERNAL PREVIEW ONLY, NOT FINAL PRICING',
    intro:
      'Las Vegas Homes by Gigi — Property Management Pricing Overview. This structure is a ' +
      'placeholder for Jessica to mirror with real, final pricing before launch.',
    tableHeaders: ['Monthly Rent', 'Management Fee'],
    tableRows: [
      ['Up to $1,500', '8% of monthly rent'],
      ['$1,501 – $2,500', '7% of monthly rent'],
      ['$2,501 and up', '6% of monthly rent'],
    ],
    footnote:
      'Leasing fee: 50% of one month’s rent (placeholder). Renewal fee: $150 (placeholder). ' +
      'Furnished properties may carry an additional service fee (placeholder).',
  },
  es: {
    docTitle: (property, furnished) =>
      `${property} — ${furnished} — Tarifas de Administración de Propiedades (Marcador de Posición)`,
    heading: (property, furnished) => `${property} · ${furnished} · Hoja de Tarifas`,
    placeholderBanner:
      'CONTENIDO DE MARCADOR DE POSICIÓN — SOLO VISTA PREVIA INTERNA, NO SON TARIFAS FINALES',
    intro:
      'Las Vegas Homes by Gigi — Resumen de Tarifas de Administración de Propiedades. Esta ' +
      'estructura es un marcador de posición para que Jessica la reemplace con tarifas ' +
      'reales y definitivas antes del lanzamiento.',
    tableHeaders: ['Renta Mensual', 'Tarifa de Administración'],
    tableRows: [
      ['Hasta $1,500', '8% de la renta mensual'],
      ['$1,501 – $2,500', '7% de la renta mensual'],
      ['$2,501 en adelante', '6% de la renta mensual'],
    ],
    footnote:
      'Tarifa de arrendamiento: 50% de un mes de renta (marcador de posición). Tarifa de ' +
      'renovación: $150 (marcador de posición). Las propiedades amuebladas pueden tener un ' +
      'cargo de servicio adicional (marcador de posición).',
  },
}

function slug(propertyType: PropertyType, furnishedKey: 'furnished' | 'unfurnished', lang: Language) {
  return `pricing-${propertyType}-${furnishedKey}-${lang}`
}

async function generateOne(propertyType: PropertyType, furnished: boolean, lang: Language) {
  const furnishedKey = furnished ? 'furnished' : 'unfurnished'
  const propertyLabel = PROPERTY_TYPE_LABEL[propertyType][lang]
  const furnishedLabel = FURNISHED_LABEL[furnishedKey][lang]
  const copy = COPY[lang]

  const pdfDoc = await PDFDocument.create()
  pdfDoc.setTitle(copy.docTitle(propertyLabel, furnishedLabel))
  pdfDoc.setLanguage(lang)
  pdfDoc.setAuthor('Las Vegas Homes by Gigi')
  pdfDoc.setSubject('Property management pricing (placeholder)')

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const page = pdfDoc.addPage([612, 792]) // US Letter
  const margin = 56
  let y = 792 - margin

  const drawLine = (text: string, opts: {size?: number; bold?: boolean; color?: [number, number, number]; gap?: number} = {}) => {
    const size = opts.size ?? 11
    page.drawText(text, {
      x: margin,
      y,
      size,
      font: opts.bold ? fontBold : font,
      color: opts.color ? rgb(...opts.color) : rgb(0.1, 0.1, 0.1),
      maxWidth: 612 - margin * 2,
    })
    y -= (opts.gap ?? size + 10)
  }

  drawLine('Las Vegas Homes by Gigi', {size: 18, bold: true})
  drawLine(copy.heading(propertyLabel, furnishedLabel), {size: 14, bold: true, gap: 28})

  drawLine(copy.placeholderBanner, {size: 11, bold: true, color: [0.7, 0.05, 0.05], gap: 24})

  drawLine(copy.intro, {size: 10, gap: 30})

  // Pricing table — real selectable text laid out in two columns.
  const col1X = margin
  const col2X = margin + 260
  page.drawText(copy.tableHeaders[0], {x: col1X, y, size: 11, font: fontBold})
  page.drawText(copy.tableHeaders[1], {x: col2X, y, size: 11, font: fontBold})
  y -= 18
  page.drawLine({
    start: {x: margin, y: y + 6},
    end: {x: 612 - margin, y: y + 6},
    thickness: 0.5,
    color: rgb(0.6, 0.6, 0.6),
  })
  for (const [left, right] of copy.tableRows) {
    page.drawText(left, {x: col1X, y, size: 10, font})
    page.drawText(right, {x: col2X, y, size: 10, font})
    y -= 20
  }

  y -= 10
  drawLine(copy.footnote, {size: 9, gap: 14})

  const bytes = await pdfDoc.save()
  const filename = `${slug(propertyType, furnishedKey, lang)}.pdf`
  await writeFile(path.join(ASSETS_DIR, filename), bytes)
  return filename
}

async function main() {
  await mkdir(ASSETS_DIR, {recursive: true})
  const generated: string[] = []
  for (const propertyType of PROPERTY_TYPES) {
    for (const furnished of FURNISHED_STATES) {
      for (const lang of LANGUAGES) {
        generated.push(await generateOne(propertyType, furnished, lang))
      }
    }
  }
  console.log(`Generated ${generated.length} placeholder PDFs in ${ASSETS_DIR}:`)
  for (const name of generated) console.log(`  - ${name}`)
}

main()

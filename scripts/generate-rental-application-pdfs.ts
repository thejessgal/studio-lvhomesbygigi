/**
 * Generates the 2 placeholder rental-application PDFs (EN + ES) referenced by
 * `siteSettings.rentalApplicationPdfEn`/`Es` (studio#6). Real, selectable text — not a
 * rasterized image — so it stays WCAG 2.1 AA compliant even as a placeholder. Real
 * application content/legal review is a launch-content TODO (see
 * <scratchpad>/team/placeholders.md).
 *
 * Run: `bun run scripts/generate-rental-application-pdfs.ts`
 */
import {mkdir, writeFile} from 'node:fs/promises'
import path from 'node:path'
import {PDFDocument, StandardFonts, rgb} from 'pdf-lib'

const ASSETS_DIR = path.join(import.meta.dirname, '../seed/assets')

type Language = 'en' | 'es'

const COPY: Record<
  Language,
  {
    title: string
    banner: string
    intro: string
    sections: Array<{heading: string; fields: string[]}>
    authorization: string
    signatureLine: string
  }
> = {
  en: {
    title: 'Rental Application (Placeholder)',
    banner: 'PLACEHOLDER CONTENT — FOR INTERNAL PREVIEW ONLY, NOT THE FINAL APPLICATION',
    intro:
      'Las Vegas Homes by Gigi — Property Management. Please complete all sections. Incomplete applications may delay processing.',
    sections: [
      {
        heading: 'Applicant Information',
        fields: ['Full legal name', 'Date of birth', 'Phone', 'Email', 'Current address'],
      },
      {
        heading: 'Residence History (past 2 years)',
        fields: ['Current landlord name & phone', 'Move-in / move-out dates', 'Reason for leaving', 'Monthly rent paid'],
      },
      {
        heading: 'Employment & Income',
        fields: ['Employer name & phone', 'Position & length of employment', 'Monthly gross income', 'Additional income sources'],
      },
      {
        heading: 'Additional Occupants & Pets',
        fields: ['Names & ages of other occupants', 'Pets (type, breed, weight)'],
      },
    ],
    authorization:
      'By signing below, I authorize Las Vegas Homes by Gigi to verify the information provided, including a background and credit check, in accordance with applicable law.',
    signatureLine: 'Applicant signature ___________________________  Date ______________',
  },
  es: {
    title: 'Solicitud de Alquiler (Marcador de Posición)',
    banner: 'CONTENIDO DE MARCADOR DE POSICIÓN — SOLO VISTA PREVIA INTERNA, NO ES LA SOLICITUD FINAL',
    intro:
      'Las Vegas Homes by Gigi — Administración de Propiedades. Complete todas las secciones. Las solicitudes incompletas pueden retrasar el proceso.',
    sections: [
      {
        heading: 'Información del Solicitante',
        fields: ['Nombre legal completo', 'Fecha de nacimiento', 'Teléfono', 'Correo electrónico', 'Dirección actual'],
      },
      {
        heading: 'Historial de Residencia (últimos 2 años)',
        fields: [
          'Nombre y teléfono del arrendador actual',
          'Fechas de entrada / salida',
          'Motivo de salida',
          'Renta mensual pagada',
        ],
      },
      {
        heading: 'Empleo e Ingresos',
        fields: ['Nombre y teléfono del empleador', 'Puesto y antigüedad', 'Ingreso mensual bruto', 'Fuentes de ingreso adicionales'],
      },
      {
        heading: 'Ocupantes Adicionales y Mascotas',
        fields: ['Nombres y edades de otros ocupantes', 'Mascotas (tipo, raza, peso)'],
      },
    ],
    authorization:
      'Al firmar a continuación, autorizo a Las Vegas Homes by Gigi a verificar la información proporcionada, incluida una verificación de antecedentes y crédito, de acuerdo con la ley aplicable.',
    signatureLine: 'Firma del solicitante ___________________________  Fecha ______________',
  },
}

async function generateOne(lang: Language) {
  const copy = COPY[lang]
  const pdfDoc = await PDFDocument.create()
  pdfDoc.setTitle(copy.title)
  pdfDoc.setLanguage(lang)
  pdfDoc.setAuthor('Las Vegas Homes by Gigi')
  pdfDoc.setSubject('Rental application (placeholder)')

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const page = pdfDoc.addPage([612, 792])
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
    y -= (opts.gap ?? size + 8)
  }

  drawLine('Las Vegas Homes by Gigi', {size: 18, bold: true})
  drawLine(copy.title, {size: 14, bold: true, gap: 24})
  drawLine(copy.banner, {size: 10, bold: true, color: [0.7, 0.05, 0.05], gap: 20})
  drawLine(copy.intro, {size: 9, gap: 22})

  for (const section of copy.sections) {
    drawLine(section.heading, {size: 12, bold: true, gap: 16})
    for (const field of section.fields) {
      drawLine(`- ${field}: _______________________________`, {size: 9, gap: 15})
    }
    y -= 6
  }

  drawLine(copy.authorization, {size: 9, gap: 24})
  drawLine(copy.signatureLine, {size: 10, gap: 14})

  const bytes = await pdfDoc.save()
  const filename = `rental-application-${lang}.pdf`
  await writeFile(path.join(ASSETS_DIR, filename), bytes)
  return filename
}

async function main() {
  await mkdir(ASSETS_DIR, {recursive: true})
  const generated = [await generateOne('en'), await generateOne('es')]
  console.log(`Generated ${generated.length} placeholder rental-application PDFs in ${ASSETS_DIR}:`)
  for (const name of generated) console.log(`  - ${name}`)
}

main()

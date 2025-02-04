import HTMLtoDOCX from '@turbodocx/html-to-docx'
import type { DocumentOptions } from '@turbodocx/html-to-docx'

export type { DocumentOptions }

export const convertToDocx = async (
  html: string,
  header: string | null = null,
  options: DocumentOptions = {}
): Promise<ArrayBuffer> => {
  try {
    const buffer = await HTMLtoDOCX(html, header || undefined, {
      orientation: options.orientation || 'portrait',
      pageSize: {
        width: options.pageSize?.width || 12240, // U.S. letter width in TWIP
        height: options.pageSize?.height || 15840, // U.S. letter height in TWIP
      },
      margins: {
        top: options.margins?.top || 1440,
        right: options.margins?.right || 1800,
        bottom: options.margins?.bottom || 1440,
        left: options.margins?.left || 1800,
        header: options.margins?.header || 720,
        footer: options.margins?.footer || 720,
        gutter: options.margins?.gutter || 0,
      },
      font: options.font || 'Times New Roman',
      fontSize: options.fontSize || 22, // 11pt in HIP
      complexScriptFontSize: options.complexScriptFontSize || 22,
      table: {
        row: {
          cantSplit: options.table?.row?.cantSplit || false,
        },
      },
      header: !!header,
      footer: options.footer || false,
      lang: options.lang || 'en-US',
      decodeUnicode: options.decodeUnicode || true,
      title: options.title,
      subject: options.subject,
      creator: options.creator || 'Umo Editor',
      keywords: options.keywords || ['umo-editor'],
      description: options.description,
      lastModifiedBy: options.lastModifiedBy || 'Umo Editor',
      revision: options.revision || 1,
      createdAt: options.createdAt || new Date(),
      modifiedAt: options.modifiedAt || new Date(),
    })

    return buffer
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`HTML to DOCX conversion failed: ${error.message}`)
    }
    throw new Error('An unexpected error occurred during DOCX conversion')
  }
}

export default convertToDocx 
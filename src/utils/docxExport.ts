import { convertToDocx } from './html-to-docx-wrapper'
import type { UmoDocumentOptions } from './html-to-docx-wrapper'

interface DocxExportOptions extends UmoDocumentOptions {
  headerHtml?: string
  footerHtml?: string
  pageBreakClass?: string
  listStyleTypes?: {
    ordered?: 'decimal' | 'upper-alpha' | 'lower-alpha' | 'upper-roman' | 'lower-roman' | 'decimal-bracket-end' | 'decimal-bracket'
  }
}

/**
 * Converts HTML content to a DOCX file with enhanced features
 * @param htmlContent - The HTML string to convert
 * @param options - Optional configuration for the DOCX output
 * @returns Promise resolving with a Blob containing the DOCX file
 */
export async function exportHtmlToDocx(
  html: string,
  options: DocxExportOptions = {}
): Promise<Blob> {
  try {
    // Sanitize and prepare HTML content
    let sanitizedHtml = html.trim()
    
    if (!sanitizedHtml) {
      throw new Error('HTML content cannot be empty')
    }

    // Handle page breaks
    if (options.pageBreakClass) {
      sanitizedHtml = sanitizedHtml.replace(
        new RegExp(`<div class="${options.pageBreakClass}"[^>]*>.*?</div>`, 'g'),
        '<div style="page-break-after: always;"></div>'
      )
    }

    // Configure conversion options
    const convertOptions: UmoDocumentOptions = {
      layout: {
        orientation: options.layout?.orientation || 'portrait',
        pageSize: {
          width: options.layout?.pageSize?.width || 12240,    // U.S. letter width in TWIP
          height: options.layout?.pageSize?.height || 15840,  // U.S. letter height in TWIP
        },
        margins: {
          top: options.layout?.margins?.top || 1440,
          right: options.layout?.margins?.right || 1800,
          bottom: options.layout?.margins?.bottom || 1440,
          left: options.layout?.margins?.left || 1800,
          header: options.layout?.margins?.header || 720,
          footer: options.layout?.margins?.footer || 720,
          gutter: options.layout?.margins?.gutter || 0,
        },
      },
      fonts: {
        main: options.fonts?.main || 'Times New Roman',
        size: options.fonts?.size || 22, // 11pt in HIP
        complexScriptSize: options.fonts?.complexScriptSize || 22,
      },
      table: {
        row: {
          cantSplit: options.table?.row?.cantSplit || false,
        },
      },
      sections: {
        header: !!options.headerHtml,
        footer: !!options.footerHtml,
      },
      localization: {
        lang: options.localization?.lang || 'en-US',
        decodeUnicode: options.localization?.decodeUnicode ?? true,
      },
      metadata: {
        title: options.metadata?.title,
        subject: options.metadata?.subject,
        creator: options.metadata?.creator || 'Umo Editor',
        keywords: options.metadata?.keywords || ['umo-editor'],
        description: options.metadata?.description,
        lastModifiedBy: options.metadata?.lastModifiedBy || 'Umo Editor',
        revision: options.metadata?.revision || 1,
        createdAt: options.metadata?.createdAt || new Date(),
        modifiedAt: options.metadata?.modifiedAt || new Date(),
      },
    }

    // Convert HTML to DOCX format
    const docxBuffer = await convertToDocx(
      sanitizedHtml,
      options.headerHtml || null,
      convertOptions
    )

    return new Blob([docxBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    })
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to convert HTML to DOCX: ${error.message}`)
    }
    throw new Error('An unexpected error occurred during DOCX conversion')
  }
}

/**
 * Helper function to trigger immediate download of the DOCX file
 * @param blob - The DOCX file as a Blob
 * @param filename - The name for the downloaded file
 */
export function downloadDocx(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.docx`
  a.click()
  URL.revokeObjectURL(url)
}
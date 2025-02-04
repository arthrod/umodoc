import { convertToDocx, type DocumentOptions } from './html-to-docx-wrapper'

interface DocxExportOptions extends DocumentOptions {
  orientation?: 'portrait' | 'landscape'
  margins?: {
    top?: number
    right?: number
    bottom?: number
    left?: number
    header?: number
    footer?: number
    gutter?: number
  }
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
export const exportHtmlToDocx = async (
  htmlContent: string,
  options: DocxExportOptions = {}
): Promise<Blob> => {
  try {
    // Sanitize and prepare HTML content
    let sanitizedHtml = htmlContent.trim()
    
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
    const convertOptions: DocumentOptions = {
      orientation: options.orientation || 'portrait',
      pageSize: {
        width: options.margins?.top || 12240,    // U.S. letter width in TWIP
        height: options.margins?.right || 15840,  // U.S. letter height in TWIP
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
      header: !!options.headerHtml,
      footer: !!options.footerHtml,
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
export const downloadDocx = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.docx') ? filename : `${filename}.docx`
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
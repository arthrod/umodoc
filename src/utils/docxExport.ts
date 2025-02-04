import htmlDocx from 'html-docx-js'

interface DocxExportOptions {
  orientation?: 'portrait' | 'landscape'
  margins?: {
    top?: number
    right?: number
    bottom?: number
    left?: number
  }
}

/**
 * Converts HTML content to a DOCX file
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
    const sanitizedHtml = htmlContent.trim()
    
    if (!sanitizedHtml) {
      throw new Error('HTML content cannot be empty')
    }

    // Configure conversion options
    const convertOptions = {
      orientation: options.orientation || 'portrait',
      margins: {
        top: options.margins?.top || 1440,    // 1 inch in twips
        right: options.margins?.right || 1440,
        bottom: options.margins?.bottom || 1440,
        left: options.margins?.left || 1440
      }
    }

    // Convert HTML to DOCX format
    const docxContent = htmlDocx.asBlob(sanitizedHtml, convertOptions)

    return new Blob([docxContent], {
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
import mammoth from 'mammoth'
import { Document, Packer, Paragraph, TextRun } from 'docx'

/**
 * Converts a DOCX file to HTML content
 * @param file The DOCX file to convert
 * @returns Promise<string> The HTML content
 */
export const convertDocxToHTML = async (file: File): Promise<string> => {
  if (!file) {
    throw new Error('No file provided')
  }

  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.convertToHtml({ arrayBuffer })
  return result.value
}

/**
 * Creates a DOCX file from text content
 * @param content The text content to convert to DOCX
 * @returns Promise<Blob> The DOCX file as a Blob
 */
export const createDocxFromContent = async (content: string): Promise<Blob> => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun(content)],
          }),
        ],
      },
    ],
  })

  const buffer = await Packer.toBuffer(doc)
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
}

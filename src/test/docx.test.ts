import { describe, it, expect } from 'vitest'
import { convertDocxToHTML, createDocxFromContent } from '../utils/docxHandler'

describe('DOCX Compatibility', () => {
  it('should create DOCX from content', async () => {
    const docxBlob = await createDocxFromContent('Test Content')
    expect(docxBlob).toBeInstanceOf(Blob)
    expect(docxBlob.type).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    )
  })

  it('should throw error when no file provided', async () => {
    await expect(convertDocxToHTML(null as any)).rejects.toThrow(
      'No file provided',
    )
  })
})

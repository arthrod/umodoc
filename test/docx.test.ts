import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportHtmlToDocx } from '../src/utils/docxExport';
import type { UmoDocumentOptions } from '../src/utils/html-to-docx-wrapper';
import * as htmlToDocxWrapper from '../src/utils/html-to-docx-wrapper';

// Create mock module
const mockConvertToDocx = vi.fn().mockImplementation((html) => {
  return Promise.resolve(new Uint8Array([1, 2, 3, 4]));
});

// Mock the module
vi.spyOn(htmlToDocxWrapper, 'convertToDocx').mockImplementation(mockConvertToDocx);

describe('exportHtmlToDocx', () => {
  beforeEach(() => {
    mockConvertToDocx.mockClear();
  });

  it('should convert HTML to DOCX', async () => {
    const html = '<p>Test content</p>';
    const result = await exportHtmlToDocx(html);
    expect(result).toBeInstanceOf(Blob);
    expect(mockConvertToDocx).toHaveBeenCalledWith(html, null, expect.any(Object));
  });

  it('should handle empty content', async () => {
    const htmlContent = '';
    await expect(exportHtmlToDocx(htmlContent)).rejects.toThrow('HTML content cannot be empty');
  });

  it('should handle export options', async () => {
    const htmlContent = '<p>Test Content</p>';
    const options: UmoDocumentOptions = {
      layout: {
        orientation: 'landscape' as const,
        margins: {
          top: 100,
          right: 100,
          bottom: 100,
          left: 100
        }
      }
    };
    const docxBlob = await exportHtmlToDocx(htmlContent, options);
    expect(docxBlob).toBeInstanceOf(Blob);
    expect(mockConvertToDocx).toHaveBeenCalledWith(
      htmlContent,
      null,
      expect.objectContaining({
        layout: expect.objectContaining({
          orientation: 'landscape',
          margins: expect.objectContaining({
            top: 100,
            right: 100,
            bottom: 100,
            left: 100
          })
        })
      })
    );
  });
});

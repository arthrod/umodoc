import { Node } from 'prosemirror-model';
import { serializeToDocx } from './docxSerializer';

interface DocxExportOptions {
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
    description?: string;
    lastModifiedBy?: string;
    revision?: number;
    created?: Date;
    modified?: Date;
  };
  layout?: {
    pageSize?: {
      width: number;  // in twips (1/20th of a point)
      height: number;
    };
    margins?: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    orientation?: 'portrait' | 'landscape';
  };
}

/**
 * Converts a ProseMirror document directly to DOCX format
 * @param doc - The ProseMirror document node to convert
 * @param options - Optional configuration for the DOCX output
 * @returns Promise resolving with a Blob containing the DOCX file
 */
export async function exportToDocx(
  doc: Node,
  options: DocxExportOptions = {}
): Promise<Blob> {
  try {
    if (!doc) {
      throw new Error('Document cannot be empty');
    }

    // Default page settings for US Letter
    const defaultPageSize = {
      width: 12240,  // 8.5 inches in twips
      height: 15840  // 11 inches in twips
    };

    const defaultMargins = {
      top: 1440,     // 1 inch in twips
      right: 1440,
      bottom: 1440,
      left: 1440
    };

    // Merge options with defaults
    const exportOptions = {
      metadata: {
        title: options.metadata?.title || 'Untitled Document',
        author: options.metadata?.author || 'Unknown',
        subject: options.metadata?.subject || '',
        keywords: options.metadata?.keywords || [],
        description: options.metadata?.description || '',
        lastModifiedBy: options.metadata?.lastModifiedBy || options.metadata?.author || 'Unknown',
        revision: options.metadata?.revision || 1,
        created: options.metadata?.created || new Date(),
        modified: options.metadata?.modified || new Date()
      },
      layout: {
        pageSize: {
          ...defaultPageSize,
          ...options.layout?.pageSize
        },
        margins: {
          ...defaultMargins,
          ...options.layout?.margins
        },
        orientation: options.layout?.orientation || 'portrait'
      }
    };

    // Convert document using the direct serializer
    const buffer = await serializeToDocx(doc, exportOptions);

    return new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to convert document to DOCX: ${error.message}`);
    }
    throw new Error('An unexpected error occurred during DOCX conversion');
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

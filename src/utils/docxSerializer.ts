import { Node } from 'prosemirror-model';
import { defaultDocxSerializer, writeDocx, DocxSerializer, type NodeSerializer, type MarkSerializer } from 'prosemirror-docx';
import { customNodes } from './docxNodes';
import { customMarks } from './docxMarks';

interface DocxMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  description?: string;
  lastModifiedBy?: string;
  revision?: number;
  created?: Date;
  modified?: Date;
}

interface DocxLayoutOptions {
  pageSize?: {
    width: number;
    height: number;
  };
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  orientation?: 'portrait' | 'landscape';
}

interface SerializeOptions {
  metadata?: DocxMetadata;
  layout?: DocxLayoutOptions;
}

// Create custom serializer with extended node and mark handlers
const customDocxSerializer = new DocxSerializer(
  defaultDocxSerializer.nodes as NodeSerializer,
  defaultDocxSerializer.marks as MarkSerializer
);

/**
 * Serializes a ProseMirror document to DOCX format
 * @param doc ProseMirror document node
 * @param options Serialization options including metadata and layout
 * @returns Buffer containing the DOCX document
 */
export async function serializeToDocx(
  doc: Node,
  options: SerializeOptions = {}
): Promise<Buffer> {
  try {
    const { metadata = {}, layout = {} } = options;

    // Default layout settings
    const defaultLayout: DocxLayoutOptions = {
      pageSize: { width: 8.5 * 72 * 20, height: 11 * 72 * 20 }, // Letter size in twips
      margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 }, // 1 inch margins in twips
      orientation: 'portrait'
    };

    // Merge default and custom layout options
    const finalLayout = {
      ...defaultLayout,
      ...layout,
      pageSize: { ...defaultLayout.pageSize, ...layout.pageSize },
      margins: { ...defaultLayout.margins, ...layout.margins }
    };

    // Create document configuration
    const docxConfig = {
      creator: metadata.author || 'Unknown',
      title: metadata.title || 'Untitled Document',
      subject: metadata.subject || '',
      keywords: metadata.keywords || [],
      description: metadata.description || '',
      lastModifiedBy: metadata.lastModifiedBy || metadata.author || 'Unknown',
      revision: metadata.revision || 1,
      created: metadata.created || new Date(),
      modified: metadata.modified || new Date(),
      layout: {
        pageSize: finalLayout.pageSize,
        margins: finalLayout.margins,
        orientation: finalLayout.orientation
      }
    };

    // Serialize document content
    const serializedContent = customDocxSerializer.serialize(doc, {
      getImageBuffer: (src: string) => Buffer.from([]) // Placeholder for image handling
    });

    // Generate DOCX buffer
    const buffer = await new Promise<Buffer>((resolve) => {
      writeDocx(serializedContent, resolve);
    });
    
    return buffer;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to serialize document to DOCX: ${message}`);
  }
}
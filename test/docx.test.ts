import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportToDocx } from '../src/utils/docxExport';
import { Schema, Node } from 'prosemirror-model';

// Create a basic schema for testing
const schema = new Schema({
  nodes: {
    doc: {
      content: 'paragraph+'
    },
    paragraph: {
      content: 'text*',
      toDOM() { return ['p', 0] }
    },
    text: {
      group: 'inline'
    }
  }
});

// Create mock module
const mockConvertToDocx = vi.fn().mockImplementation((html) => {
  return Promise.resolve(new Uint8Array([1, 2, 3, 4]));
});

describe('exportToDocx', () => {
  beforeEach(() => {
    mockConvertToDocx.mockClear();
  });
  
  it('should convert document to DOCX', async () => {
    const doc = schema.node('doc', {}, [
      schema.node('paragraph', {}, [
        schema.text('Test content')
      ])
    ]);
    const result = await exportToDocx(doc);
    expect(result).toBeInstanceOf(Blob);
  });

  it('should handle empty document', async () => {
    const emptyDoc = null as unknown as Node;
    await expect(exportToDocx(emptyDoc)).rejects.toThrow('Document cannot be empty');
  });

  it('should handle export options', async () => {
    const doc = schema.node('doc', {}, [
      schema.node('paragraph', {}, [
        schema.text('Test content')
      ])
    ]);
    const options = {
      metadata: {
        title: 'Test Document',
        author: 'Test Author'
      },
      layout: {
        pageSize: {
          width: 12240,
          height: 15840
        }
      }
    };
    const docxBlob = await exportToDocx(doc, options);
    expect(docxBlob).toBeInstanceOf(Blob);
  });
});

import { defaultNodes } from 'prosemirror-docx'
import type { DocxSerializerState } from 'prosemirror-docx'
import type { Node } from 'prosemirror-model'

interface DocxSerializerStateExtended extends DocxSerializerState {
  write: (content: any) => void;
}

interface NodeHandler {
  (state: DocxSerializerStateExtended, node: Node, ...args: any[]): void
}

export const customNodes: Record<string, NodeHandler> = {
  ...defaultNodes,
  
  hardBreak: (state: DocxSerializerStateExtended, node) => {
    state.write({ type: 'break' })
  },

  codeBlock: (state: DocxSerializerStateExtended, node) => {
    state.write({
      type: 'paragraph',
      style: 'Code',
      children: [{
        type: 'run',
        font: 'Courier New',
        size: 20,
        text: node.textContent,
        properties: {
          language: node.attrs.language,
          className: node.attrs.className
        }
      }]
    })
  },

  math: (state: DocxSerializerStateExtended, node) => {
    state.write({
      type: 'oMathPara',
      children: [{
        type: 'oMath',
        latex: node.attrs.tex,
        displayMode: node.attrs.displayMode
      }]
    })
  },

  table: (state: DocxSerializerStateExtended, node) => {
    const rows = node.attrs.rows || 1
    const cols = node.attrs.cols || 1
    
    state.write({
      type: 'table',
      properties: {
        width: {
          size: node.attrs.cellMinWidth * cols,
          type: 'dxa'
        },
        borders: {
          top: { style: 'single', size: 2, color: '000000' },
          bottom: { style: 'single', size: 2, color: '000000' },
          left: { style: 'single', size: 2, color: '000000' },
          right: { style: 'single', size: 2, color: '000000' },
          insideH: { style: 'single', size: 2, color: '000000' },
          insideV: { style: 'single', size: 2, color: '000000' }
        }
      },
      rows: rows,
      cols: cols,
      headerRow: node.attrs.headerRow
    })
  },

  textBox: (state: DocxSerializerStateExtended, node) => {
    state.write({
      type: 'textBox',
      properties: {
        width: node.attrs.width,
        height: node.attrs.height,
        borders: {
          width: node.attrs.borderWidth,
          color: node.attrs.borderColor,
          style: node.attrs.borderStyle
        },
        background: {
          color: node.attrs.backgroundColor
        }
      }
    })
  }
}
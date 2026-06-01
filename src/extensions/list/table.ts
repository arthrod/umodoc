import { Table } from '@tiptap/extension-table'
import { TextSelection } from '@tiptap/pm/state'
import type { DOMOutputSpec, Fragment, Node as ProsemirrorNode, Schema } from '@tiptap/pm/model'
import { TableView } from '@tiptap/pm/tables'

export class CustomTableView extends TableView {
  constructor(node: ProsemirrorNode, cellMinWidth: number) {
    super(node, cellMinWidth)
    this.updateAttrs(node.attrs)
  }

  update(node: ProsemirrorNode): boolean {
    this.updateAttrs(node.attrs)
    return super.update(node)
  }

  private updateAttrs(attrs: Record<string, any>) {
    if (attrs?.class) this.table.className = attrs.class

    if (attrs?.id) this.table.id = attrs.id
  }
}

export default Table.extend({
  content: 'tableRow*',

  addOptions() {
    return {
      ...this.parent?.(),
      View: CustomTableView as any
    }
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: null,
      }
    }
  },

  addCommands() {
    return {
      ...this.parent?.(),
      /** @ts-ignore */
      insertTable: ({ rows = 3, cols = 3, withHeaderRow = true }) => ({ editor, tr, dispatch }) => {
        const node = createTable(editor.schema, rows + 2, cols, withHeaderRow);

        if (dispatch) {
          const offset = tr.selection.from + 1

          tr.replaceSelectionWith(node)
            .scrollIntoView()
            .setSelection(TextSelection.near(tr.doc.resolve(offset)))
        }

        return true
      }
    }
  }
})

export function createTable(
  schema: Schema,
  rowsCount: number,
  colsCount: number,
  withHeaderRow: boolean,
  cellContent?: Fragment | ProsemirrorNode | Array<ProsemirrorNode>,
): ProsemirrorNode {
  const types = schema.cached.tableNodeTypes
  const headerCells: ProsemirrorNode[] = []
  const cells: ProsemirrorNode[] = []
  const cells2: ProsemirrorNode[] = [types.cell.createAndFill({ colspan: colsCount })];

  for (let index = 0; index < colsCount; index += 1) {
    const cell: ProsemirrorNode = types.cell.createAndFill()

    if (cell) cells.push(cell)

    if (withHeaderRow) {
      const headerCell = types.header_cell.createAndFill()

      if (headerCell) {
        headerCells.push(headerCell)
      }
    }
  }

  const rows: ProsemirrorNode[] = []

  const withHeaderRowNumber = Number(withHeaderRow)
  rowsCount = rowsCount + withHeaderRowNumber

  for (let index = 0; index < rowsCount; index += 1) {
    if ([withHeaderRowNumber, rowsCount - 1].includes(index)) {
      rows.push(types.row.createChecked({ class: 'hide-render' }, cells2))
      continue
    }

    rows.push(types.row.createChecked(
      null,
      withHeaderRow && index === 0 ? headerCells : cells,
    ))
  }

  return types.table.createChecked(null, rows)
}

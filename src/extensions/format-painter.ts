import { Extension } from '@tiptap/core'
import type { Mark } from '@tiptap/pm/model'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { useStore } from '@/composables/store'
import { debugReadability } from '@/utils/logger'

const store = useStore()
const { painter, setPainter } = store

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    setFormatPainter: {
      setFormatPainter: (once: boolean) => ReturnType
    }
    unsetFormatPainter: {
      unsetFormatPainter: () => ReturnType
    }
  }
}

interface PainterState {
  enabled: boolean
  once: boolean
  marks: Mark[]
}

export default Extension.create({
  name: 'painter',
  addCommands() {
    return {
      setFormatPainter:
        (once: boolean) =>
        ({ editor, view }) => {
          debugReadability('FormatPainter', 'setFormatPainter', { once })
          const { tr } = view.state
          const marks = editor.state.selection.$head.marks()
          const painterState: PainterState = {
            enabled: true,
            once,
            marks: [...marks],
          }
          setPainter(painterState)
          view.dispatch(tr.setMeta('painterAction', { type: 'start', marks }))
          return true
        },
      unsetFormatPainter:
        () =>
        ({ view }) => {
          debugReadability('FormatPainter', 'unsetFormatPainter')
          const { tr } = view.state
          const painterState: PainterState = {
            enabled: false,
            once: true,
            marks: [],
          }
          setPainter(painterState)
          view.dispatch(tr.setMeta('painterAction', { type: 'end' }))
          return true
        },
    }
  },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('painter'),
        props: {
          handleClick(view, pos) {
            if (!painter.value.enabled) return false

            const { tr } = view.state
            const node = view.state.doc.nodeAt(pos)
            if (!node) return false

            debugReadability('FormatPainter', 'applyingFormat', { 
              pos,
              marks: painter.value.marks.length 
            })

            painter.value.marks.forEach((mark: Mark) => {
              tr.addMark(pos, pos + node.nodeSize, mark.type.create(mark.attrs))
            })

            view.dispatch(tr)

            if (painter.value.once) {
              const painterState: PainterState = {
                enabled: false,
                once: true,
                marks: [],
              }
              setPainter(painterState)
            }

            return true
          },
        },
      }),
    ]
  },
})

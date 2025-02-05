import { defaultMarks } from 'prosemirror-docx'
import type { DocxSerializerState } from 'prosemirror-docx'
import type { Mark } from '@tiptap/pm/model'

interface DocxSerializerStateExtended extends DocxSerializerState {
  renderHighlight: (mark: Mark, attrs: { color: string }) => void;
  renderColor: (mark: Mark, attrs: { color: string }) => void;
  renderFontSize: (mark: Mark, attrs: { size: string | number }) => void;
  renderFontFamily: (mark: Mark, attrs: { fontName: string }) => void;
  renderLineHeight: (mark: Mark, attrs: { height: string | number }) => void;
}

export const customMarks = {
  ...defaultMarks,
  highlight: (state: DocxSerializerStateExtended, mark: Mark) => {
    state.renderHighlight(mark, {
      color: mark.attrs.color,
    })
  },
  color: (state: DocxSerializerStateExtended, mark: Mark) => {
    state.renderColor(mark, {
      color: mark.attrs.color,
    })
  },
  fontSize: (state: DocxSerializerStateExtended, mark: Mark) => {
    state.renderFontSize(mark, {
      size: mark.attrs.size,
    })
  },
  fontFamily: (state: DocxSerializerStateExtended, mark: Mark) => {
    state.renderFontFamily(mark, {
      fontName: mark.attrs.fontName,
    })
  },
  lineHeight: (state: DocxSerializerStateExtended, mark: Mark) => {
    state.renderLineHeight(mark, {
      height: mark.attrs.height,
    })
  },
}
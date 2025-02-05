<template>
  <div class="umo-editor" :style="{ height }">
    <div v-if="editor" class="editor-content">
      <editor-content :editor="editor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Bold from '@tiptap/extension-bold'
import BulletList from '@tiptap/extension-bullet-list'
import Document from '@tiptap/extension-document'
import Heading from '@tiptap/extension-heading'
import Image from '@tiptap/extension-image'
import Italic from '@tiptap/extension-italic'
import Link from '@tiptap/extension-link'
import ListItem from '@tiptap/extension-list-item'
import OrderedList from '@tiptap/extension-ordered-list'
import Paragraph from '@tiptap/extension-paragraph'
import Strike from '@tiptap/extension-strike'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import Text from '@tiptap/extension-text'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'
import { onBeforeUnmount, onMounted, ref } from '@vue/composition-api'

import type { UmoEditorOptions } from '../../types'

const props = defineProps<{
  height?: string
  content?: string
  options?: UmoEditorOptions
}>()

const height = props.height ?? '100%'
const content = props.content ?? ''
const options = props.options ?? {}

const editor = ref<Editor | null>(null)

onMounted(() => {
  editor.value = new Editor({
    extensions: [
      StarterKit,
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Strike,
      Heading,
      BulletList,
      OrderedList,
      ListItem,
      Link,
      Image,
      Table,
      TableRow,
      TableCell,
      TableHeader,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  })
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style>
.umo-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.editor-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.ProseMirror {
  height: 100%;
  outline: none;
}

.ProseMirror > * + * {
  margin-top: 0.75em;
}

.ProseMirror ul,
.ProseMirror ol {
  padding: 0 1rem;
}

.ProseMirror h1,
.ProseMirror h2,
.ProseMirror h3,
.ProseMirror h4,
.ProseMirror h5,
.ProseMirror h6 {
  line-height: 1.1;
}

.ProseMirror table {
  border-collapse: collapse;
  margin: 0;
  overflow: hidden;
  table-layout: fixed;
  width: 100%;
}

.ProseMirror td,
.ProseMirror th {
  border: 2px solid #ced4da;
  box-sizing: border-box;
  min-width: 1em;
  padding: 3px 5px;
  position: relative;
  vertical-align: top;
}

.ProseMirror th {
  background-color: #f8f9fa;
  font-weight: bold;
  text-align: left;
}

.ProseMirror img {
  height: auto;
  max-width: 100%;
}

.ProseMirror blockquote {
  border-left: 3px solid #999;
  margin-left: 0;
  margin-right: 0;
  padding-left: 1rem;
}

.ProseMirror hr {
  border: none;
  border-top: 2px solid #999;
  margin: 2rem 0;
}

.ProseMirror a {
  color: #0366d6;
  text-decoration: underline;
}
</style>

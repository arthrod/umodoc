<template>
  <menus-button 
    :text="t('export.word')"
    ico="word" 
    huge 
    :loading="isExporting"
    @menu-click="handleExport" 
  />
</template>

<script setup lang="ts">
import { ref } from '@vue/reactivity'
import { useStore } from '@/composables/store'
import { useI18n } from 'vue-i18n'
import { exportToDocx, downloadDocx } from '@/utils/docxExport'

const store = useStore()
const { t } = useI18n()
const isExporting = ref(false)

const handleExport = async () => {
  if (!store.editor.value || isExporting.value) return
  
  isExporting.value = true
  try {
    // Get current editor state
    const doc = store.editor.value.state.doc
    
    // Configure export options based on current page settings and metadata
    const exportOptions = {
      metadata: {
        title: store.options.value.document?.title || 'Untitled Document',
        author: store.options.value.document?.author,
        modified: new Date()
      },
      layout: {
        orientation: store.page.value.orientation,
        margins: {
          top: store.page.value.margin?.top || 1440,
          right: store.page.value.margin?.right || 1440,
          bottom: store.page.value.margin?.bottom || 1440,
          left: store.page.value.margin?.left || 1440
        }
      }
    }

    // Convert ProseMirror doc directly to DOCX
    const docxBlob = await exportToDocx(doc, exportOptions)

    // Generate filename from document title or use default
    const filename = store.options.value.document?.title || 'document'

    // Trigger download
    downloadDocx(docxBlob, filename)
  } catch (error) {
    console.error('Failed to export document:', error)
    // Here you might want to show a notification to the user
    // using your app's notification system
  } finally {
    isExporting.value = false
  }
}
</script>

<style lang="less" scoped></style>

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
import { exportHtmlToDocx, downloadDocx } from '@/utils/docxExport'

const store = useStore()
const { t } = useI18n()
const isExporting = ref(false)

const handleExport = async () => {
  if (!store.editor.value || isExporting.value) return
  
  isExporting.value = true
  try {
    // Get current editor content as HTML
    const htmlContent = store.editor.value.getHTML()
    
    // Configure export options based on current page settings
    const exportOptions = {
      orientation: store.page.value.orientation,
      margins: {
        top: store.page.value.margin?.top,
        right: store.page.value.margin?.right,
        bottom: store.page.value.margin?.bottom,
        left: store.page.value.margin?.left
      }
    }

    // Convert HTML to DOCX
    const docxBlob = await exportHtmlToDocx(htmlContent, exportOptions)

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

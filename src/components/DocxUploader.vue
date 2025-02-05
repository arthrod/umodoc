<!-- DocxUploader.vue -->
<template>
  <div class="docx-uploader">
    <input
      ref="fileInput"
      type="file"
      accept=".docx"
      class="hidden"
      @change="handleFileUpload"
    />
    <button
      class="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
      @click="triggerFileInput"
    >
      Import DOCX
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from '@vue/composition-api'

import { convertDocxToHTML } from '../utils/docxHandler'

const fileInput = ref<HTMLInputElement | null>(null)
const emit = defineEmits<{
  (e: 'docxContent', content: string): void
}>()

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;

  try {
    const htmlContent = await convertDocxToHTML(file);
    emit('docxContent', htmlContent);
  } catch (error) {
    console.error('Error converting DOCX:', error);
    // You might want to show an error message to the user here
  }
  
  // Clear the input so the same file can be uploaded again
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};
</script>

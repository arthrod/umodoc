<template>
  <menus-button
    v-if="options.toolbar?.importWord?.enabled"
    ico="word"
    :text="t('base.importWord.text')"
    huge
    @menu-click="importWord"
  />
</template>

<script setup lang="ts">
const { editor, options } = useStore()

// 动态导入 mammoth.js
onMounted(() => {
  const mammothScriptElement = document.querySelector('#mammoth-script')
  if (
    mammothScriptElement === null &&
    options.value.toolbar?.importWord.enabled
  ) {
    const style = document.createElement('script')
    style.src = `${options.value.cdnUrl}/libs/mammoth/mammoth.browser.min.js`
    style.id = 'mammoth-script'
    document.querySelector('head')?.append(style)
  }
})

const importWord = () => {
  // @ts-expect-error, global variable injected by script
  if (!mammoth) {
    const dialog = useAlert({
      theme: 'warning',
      header: t('base.importWord.loadScript.title'),
      body: t('base.importWord.loadScript.message'),
      onConfirm() {
        dialog.destroy()
      },
    })
    return
  }
  const { open, onChange } = useFileDialog({
    accept: '.docx',
    reset: true,
    multiple: false,
  })
  // 打开文件对话框
  open()
  // 插入文件
  onChange(async (files: FileList | null) => {
    const [file] = Array.from(files ?? [])
    if (!file) {
      return
    }
    if (file.size > 1024 * 1024 * 5) {
      useMessage('error', t('base.importWord.limitSize'))
      return
    }
    const message = await useMessage('loading', t('base.importWord.converting'))

    // 使用用户自定义导入方法
    if (options.value.toolbar?.importWord?.useCustomMethod) {
      const result =
        await options.value.toolbar?.importWord.onCustomImportWordMethod?.(file)
      message.close()
      try {
        if (result?.messages?.type === 'error') {
          useMessage(
            'error',
            `${t('base.importWord.convertError')} (${result.messages.message})`,
          )
          return
        }
        if (result?.value) {
          editor.value?.commands.setContent(result.value)
        } else {
          useMessage('error', t('base.importWord.importError'))
        }
      } catch {
        useMessage('error', t('base.importWord.importError'))
      }
      return
    }

    // 默认使用 Mammoth 导入
    const arrayBuffer = file.arrayBuffer()
    // @ts-expect-error, global variable injected by script
    if (!mammoth) {
      return
    }
    // @ts-expect-error, global variable injected by script
    const { messages, value } = await mammoth.convertToHtml(
      { arrayBuffer },
      {
        ...(options.value.toolbar?.importWord?.options || {}),
        // Ensure consistent styling conversion
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          // Handle custom paragraph alignments
          "p[style-name='text-align-left'] => p.text-align-left:fresh",
          "p[style-name='text-align-center'] => p.text-align-center:fresh",
          "p[style-name='text-align-right'] => p.text-align-right:fresh",
          // Preserve list structures
          "p[style-name='bullet'] => ul > li:fresh",
          "p[style-name='numbering'] => ol > li:fresh",
        ],
        transformDocument: (element: { type: string; children?: any[] }) => {
          // Clean up empty paragraphs that might break round-trip
          if (element.type === 'paragraph' && !element.children?.length) {
            return [];
          }
          return element;
        },
      },
    )
    message.close()
    const errorMessages = messages.filter((msg: any) => msg.type === 'error')
    if (errorMessages.length > 0) {
      const errorMessage = errorMessages.map((msg: any) => msg.message).join(', ')
      useMessage(
        'error',
        `${t('base.importWord.convertError')} (${errorMessage})`,
      )
      return
    }
    try {
      // 解析和加工 Mammoth 返回的 HTML 内容
      const domparser = new DOMParser()
      const doc = domparser.parseFromString(value, 'text/html')
      for (const img of doc.querySelectorAll('img')) {
        const parent = img.parentElement
        if (parent?.tagName === 'P') {
          parent.insertAdjacentElement('beforebegin', img)
          if (!parent.hasChildNodes() && parent.textContent === '') {
            parent.remove()
          }
        }
      }
      // Enhanced post-processing of imported content
      // Handle nested structures and clean up artifacts
      for (const list of doc.querySelectorAll('ul, ol')) {
        const parent = list.parentElement
        if (parent?.tagName === 'P') {
          parent.insertAdjacentElement('beforebegin', list)
          if (!parent.hasChildNodes()) {
            parent.remove()
          }
        }
      }

      // Preserve text alignment classes
      for (const p of doc.querySelectorAll('p')) {
        const style = p.getAttribute('style') || ''
        if (style.includes('text-align: center')) {
          p.classList.add('text-align-center')
        } else if (style.includes('text-align: right')) {
          p.classList.add('text-align-right')
        } else if (style.includes('text-align: justify')) {
          p.classList.add('text-align-justify')
        }
      }

      const content = doc.body.innerHTML.toString()
      
      // Set content with proper sanitization
      editor.value?.commands.setContent(content, {
        preserveWhitespace: true,
        preserveMarks: true,
      })
    } catch {
      useMessage('error', t('base.importWord.importError'))
    }
  })
}
</script>

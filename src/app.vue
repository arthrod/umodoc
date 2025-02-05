<template>
  <div class="box">
    <UmoEditor ref="editorRef" v-bind="editorOptions" />
  </div>
</template>

<script setup lang="ts">
import UmoEditor from '@/components/UmoEditor.vue'
import { convertDocxToHTML } from '@/utils/docxHandler'
import { shortId } from '@/utils/short-id'

import type { UmoEditorOptions } from '../types'

const editorRef = $ref(null)
const templates = [
  {
    title: '工作任务',
    description: '工作任务模板',
    value: 'task',
    content:
      '<h1>工作任务</h1><h3>任务名称：</h3><p>[任务的简短描述]</p><h3>负责人：</h3><p>[执行任务的个人姓名]</p><h3>截止日期：</h3><p>[任务需要完成的日期]</p><h3>任务详情：</h3><ol><li>[任务步骤1]</li><li>[任务步骤2]</li><li>[任务步骤3]...</li></ol><h3>目标：</h3><p>[任务需要达成的具体目标或结果]</p><h3>备注：</h3><p>[任何额外信息或注意事项]</p>',
  },
  {
    title: '工作周报',
    description: '工作周报模板',
    value: 'weekly',
    content:
      '<h1>工作周报</h1><h2>本周工作总结</h2><hr /><h3>已完成工作：</h3><ul><li>[任务1名称]：[简要描述任务内容及完成情况]</li><li>[任务2名称]：[简要描述任务内容及完成情况]</li><li>...</li></ul><h3>进行中工作：</h3><ul><li>[任务1名称]：[简要描述任务当前进度和下一步计划]</li><li>[任务2名称]：[简要描述任务当前进度和下一步计划]</li><li>...</li></ul><h3>问题与挑战：</h3><ul><li>[问题1]：[描述遇到的问题及当前解决方案或需要的支持]</li><li>[问题2]：[描述遇到的问题及当前解决方案或需要的支持]</li><li>...</li></ul><hr /><h2>下周工作计划</h2><h3>计划开展工作：</h3><ul><li>[任务1名称]：[简要描述下周计划开始的任务内容]</li><li>[任务2名称]：[简要描述下周计划开始的任务内容]</li><li>...</li></ul><h3>需要支持与资源：</h3><ul><li>[资源1]：[描述需要的资源或支持]</li><li>[资源2]：[描述需要的资源或支持]</li><li>...</li></ul>',
  },
]

const editorOptions: UmoEditorOptions = $ref({
  editorKey: 'umoeditor',
  locale: 'en-US',
  theme: 'light',
  height: '100%',
  toolbar: {
    defaultMode: 'classic',
    menus: ['base', 'insert', 'table', 'tools', 'page', 'export', 'advanced'],
    disableMenuItems: [],
    enableSourceEditor: true,
    importWord: {
      enabled: true,
      options: {},
      useCustomMethod: true,
      onCustomImportWordMethod: async (file: File) => {
        try {
          const htmlContent = await convertDocxToHTML(file)
          return {
            id: shortId(),
            url: URL.createObjectURL(file),
            value: htmlContent,
            messages: { type: 'success', message: 'Successfully imported DOCX file' }
          }
        } catch (error) {
          console.error('Error importing Word document:', error)
          throw new Error('Failed to import Word document')
        }
      }
    }
  },
  document: {
    title: 'Document',
    content: localStorage.getItem('document.content') ?? '<p>New Document</p>',
    enableSpellcheck: true,
    enableMarkdown: true,
    enableBubbleMenu: true,
    enableBlockMenu: true,
    readOnly: false,
    autofocus: 'end',
    autoSave: {
      enabled: true,
      interval: 5000
    }
  },
  page: {
    defaultOrientation: 'portrait',
    defaultBackground: '#ffffff',
    showBreakMarks: true,
    showLineNumber: false,
    showToc: false,
    zoomLevel: 100,
    autoWidth: true,
    preview: {
      enabled: true,
      laserPointer: false
    }
  },
  templates,
  cdnUrl: 'https://cdn.umodoc.com',
  shareUrl: 'https://umodoc.com',
  file: {
    allowedMimeTypes: [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf',
      'image/svg+xml',
      'video/mp4',
      'audio/*'
    ],
    maxSize: 50 * 1024 * 1024, // 50MB
    preview: []
  },
  assistant: {
    enabled: true,
    maxlength: 2000,
    commands: []
  },
  user: {
    userId: 'umoeditor',
    nickName: 'Umo Editor',
    avatarUrl: 'https://tdesign.gtimg.com/site/avatar.jpg',
  },
  onSave(content: string) {
    localStorage.setItem('document.content', content)
    return 'Document saved successfully'
  },
  onFileUpload(file: File) {
    if (!file) {
      throw new Error('No file provided')
    }
    console.log('onUpload', file)
    return new Promise((resolve) => setTimeout(resolve, 1000)).then(() => {
      return {
        id: shortId(),
        url: URL.createObjectURL(file)
      }
    })
  },
  onFileDelete(id: string, url: string) {
    console.log('onFileDelete', { id, url })
  },
  onAssistant() {
    return '<p>AI Assistant Test</p>'
  }
})
</script>

<style>
.box {
  margin: 20px;
  height: calc(100vh - 40px);
  border: solid 1px #ddd;
  box-sizing: border-box;
  position: relative;
}

html,
body {
  height: 100vh;
  overflow: hidden;
}
</style>

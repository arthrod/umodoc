import 'virtual:svg-icons-register'

import type { UmoEditorOptions } from '@/types'
import { initializeI18n } from '@/utils/i18nLoader'

import UmoEditor from './index.vue'
import UmoMenuButton from './menus/button.vue'
import UmoDialog from './modal.vue'
import UmoTooltip from './tooltip.vue'

const useUmoEditor = {
  install: async (app: any, options: UmoEditorOptions) => {
    // Initialize i18n first
    const i18n = await initializeI18n()
    app.use(i18n)
    
    // 组件配置
    const { setOptions } = useStore()
    setOptions(options)
    // 使用组件
    app.component(UmoEditor.name ?? 'UmoEditor instance', UmoEditor)
  },
}

export {
  UmoEditor as default,
  UmoDialog,
  UmoEditor,
  UmoMenuButton,
  UmoTooltip,
  useUmoEditor,
}

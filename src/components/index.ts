import 'virtual:svg-icons-register'

import type { UmoEditorOptions } from '@/types'
import { useStore } from '@/composables/store'
import UmoEditor from './index.vue'
import UmoMenuButton from './menus/button.vue'
import UmoDialog from './modal.vue'
import UmoTooltip from './tooltip.vue'

const store = useStore()

const useUmoEditor = {
  install: (app: any, options: UmoEditorOptions) => {
    // Initialize store with options
    store.setOptions(options)
    // Register component
    app.component(UmoEditor.name ?? 'UmoEditor instance', UmoEditor)
  },
}

<<<<<<< Updated upstream
export {
  UmoEditor as default,
  UmoDialog,
  UmoEditor,
  UmoMenuButton,
  UmoTooltip,
  useUmoEditor,
}
=======
export { useUmoEditor, UmoEditor, UmoMenuButton, UmoDialog, UmoTooltip }
>>>>>>> Stashed changes

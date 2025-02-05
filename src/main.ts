import { createApp } from 'vue'
import type { UmoEditorOptions } from '@/types'
import 'virtual:svg-icons-register'

import App from './app.vue'
import { useUmoEditor } from './components'

const app = createApp(App)
const options = {}

app.use(useUmoEditor, options as unknown as UmoEditorOptions)

app.mount('#app')

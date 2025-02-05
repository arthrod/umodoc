import { isRecord } from '@tool-belt/type-predicates'
import { merge } from 'ts-deepmerge'
import { createI18n } from 'vue-i18n'
import { useStore } from '@/composables/store'
import { debugReadability } from '@/utils/logger'

import type { SupportedLocale } from '@/types'

import en_US from './locales/en-US.json'
import zh_CN from './locales/zh-CN.json'
import ru_RU from './locales/ru-RU.json'

const store = useStore()
const { options } = store

const getLocale = (lang: SupportedLocale) => {
  const translations = options.value.translations?.[lang]
  if (isRecord(translations)) {
    debugReadability('i18n', 'customTranslations', { lang })
    return translations
  }
  debugReadability('i18n', 'defaultTranslations', { lang })
  return {}
}

export const i18n = createI18n({
  legacy: false,
  locale: options.value.locale || 'zh-CN',
  defaultLocale: 'zh-CN',
  messages: {
    'en-US': merge(en_US, getLocale('en-US')),
    'zh-CN': merge(zh_CN, getLocale('zh-CN')),
    'ru-RU': merge(ru_RU, getLocale('ru-RU')),
  },
})

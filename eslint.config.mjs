import eslint from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import tseslint from 'typescript-eslint'
import eslintPluginVue from 'eslint-plugin-vue'
import tsParser from '@typescript-eslint/parser'
import { readFileSync } from 'node:fs'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginSimpleImportSort from 'eslint-plugin-simple-import-sort'
import eslintPluginUnusedImports from 'eslint-plugin-unused-imports'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import eslintTS from 'typescript-eslint'
import pluginVitest from '@vitest/eslint-plugin'

const componentsContent = readFileSync('./types/components.d.ts', 'utf8')
const importsContent = readFileSync('./types/imports.d.ts', 'utf8')

export default tseslint.config(
  {
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
    ignores: ['**/node_modules/**', '**/dist/**', '**/*.vue'],
    languageOptions: {
      globals: {
        // Allow common globals
        console: true,
        document: true,
        window: true,
        navigator: true,
        location: true,
        // Vue/Vite globals
        defineProps: true,
        defineEmits: true,
        defineExpose: true,
        withDefaults: true,
        // Test globals
        describe: true,
        it: true,
        expect: true,
        vi: true,
        // Vue Composition API
        ref: true,
        computed: true,
        watch: true,
        onMounted: true,
        createApp: true,
        useStore: true,
        useState: true,
        useI18n: true,
        useTimeAgo: true,
        useAlert: true,
        useMessage: true,
        useFileDialog: true,
        useStorage: true,
        t: true,
      },
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      }
    },
    rules: {
      // Disable all rules by default
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-console': 'off',
    }
  },
  // TypeScript files
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
      },
    },
    rules: {
      // Disable all TypeScript rules
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/prefer-regexp-exec': 'off',
      '@typescript-eslint/prefer-string-starts-ends-with': 'off',
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  // {
  //   files: [
  //     '**/*.{spec,test}.{ts,tsx}',
  //     '**/{tests,test,__tests__,__mock__,__mocks__}/*.{ts,tsx}',
  //   ],
  //   rules: {
  //     // Only include rules that are not set to "off" in the general configuration
  //     '@typescript-eslint/no-unused-expressions': 'off', // Changed to "off" for tests
  //     '@typescript-eslint/no-useless-constructor': 'off', // Changed to "off" for tests
  //   },
  // },
  {
    files: [
      '**/*.{spec,test}.{ts,tsx}',
      '**/{tests,test,__tests__,__mock__,__mocks__}/*.{ts,tsx}',
    ],
    ...pluginVitest.configs.recommended,
  },
  eslintConfigPrettier,
)

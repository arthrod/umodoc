declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<
    Record<string, any>,
    Record<string, any>,
    any
  >
  export default component
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    t: (key: string, ...args: any[]) => any
  }
}

declare function t(key: string, ...args: any[]): any

declare module 'dom-to-image-more' {
  export function toBlob(node: HTMLElement, options?: any): Promise<Blob>
  export function toJpeg(node: HTMLElement, options?: any): Promise<Blob>
  export function toPng(node: HTMLElement, options?: any): Promise<Blob>
}

declare module '@turbodocx/html-to-docx' {
  export interface DocumentOptions {
    orientation?: 'portrait' | 'landscape'
    pageSize?: {
      width?: number
      height?: number
    }
    margins?: {
      top?: number
      right?: number
      bottom?: number
      left?: number
      header?: number
      footer?: number
      gutter?: number
    }
    font?: string
    fontSize?: number
    complexScriptFontSize?: number
    table?: {
      row?: {
        cantSplit?: boolean
      }
    }
    header?: boolean
    footer?: boolean
    lang?: string
    decodeUnicode?: boolean
    title?: string
    subject?: string
    creator?: string
    keywords?: string[]
    description?: string
    lastModifiedBy?: string
    revision?: number
    createdAt?: Date
    modifiedAt?: Date
  }

  export default function HTMLtoDOCX(
    htmlString: string,
    headerHTMLString?: string,
    documentOptions?: DocumentOptions,
    footerHTMLString?: string
  ): Promise<ArrayBuffer>
}

import HTMLtoDOCX from '@turbodocx/html-to-docx'
import type { DocumentOptions } from '@turbodocx/html-to-docx'
import { isString } from '@tool-belt/type-predicates'

export type { DocumentOptions }

export interface UmoDocumentOptions extends DocumentOptions {
  /** Document metadata */
  metadata?: {
    /** Document title */
    title?: string
    /** Document subject */
    subject?: string
    /** Document creator */
    creator?: string
    /** Document keywords */
    keywords?: string[]
    /** Document description */
    description?: string
    /** Last modified by */
    lastModifiedBy?: string
    /** Document revision number */
    revision?: number
    /** Document creation date */
    createdAt?: Date
    /** Document modification date */
    modifiedAt?: Date
  }
  /** Page layout options */
  layout?: {
    /** Page orientation */
    orientation?: 'portrait' | 'landscape'
    /** Page size in TWIPs (1/20th of a point) */
    pageSize?: {
      width?: number // Default: 12240 (U.S. letter width)
      height?: number // Default: 15840 (U.S. letter height)
    }
    /** Page margins in TWIPs */
    margins?: {
      top?: number // Default: 1440 (1 inch)
      right?: number // Default: 1800
      bottom?: number // Default: 1440
      left?: number // Default: 1800
      header?: number // Default: 720
      footer?: number // Default: 720
      gutter?: number // Default: 0
    }
  }
  /** Font settings */
  fonts?: {
    /** Main font family */
    main?: string
    /** Font size in half-points (HIP) */
    size?: number
    /** Complex script font size in HIP */
    complexScriptSize?: number
  }
  /** Table settings */
  table?: {
    row?: {
      /** Prevent table rows from splitting across pages */
      cantSplit?: boolean
    }
  }
  /** Header and footer settings */
  sections?: {
    /** Enable header */
    header?: boolean
    /** Enable footer */
    footer?: boolean
  }
  /** Language and encoding */
  localization?: {
    /** Document language code */
    lang?: string
    /** Handle Unicode characters */
    decodeUnicode?: boolean
  }
}

const DEFAULT_OPTIONS: UmoDocumentOptions = {
  metadata: {
    creator: 'Umo Editor',
    lastModifiedBy: 'Umo Editor',
    keywords: ['umo-editor'],
    revision: 1,
    createdAt: new Date(),
    modifiedAt: new Date(),
  },
  layout: {
    orientation: 'portrait',
    pageSize: {
      width: 12240, // U.S. letter width in TWIP
      height: 15840, // U.S. letter height in TWIP
    },
    margins: {
      top: 1440, // 1 inch in TWIP
      right: 1800,
      bottom: 1440,
      left: 1800,
      header: 720,
      footer: 720,
      gutter: 0,
    },
  },
  fonts: {
    main: 'Times New Roman',
    size: 22, // 11pt in HIP
    complexScriptSize: 22,
  },
  table: {
    row: {
      cantSplit: false,
    },
  },
  localization: {
    lang: 'en-US',
    decodeUnicode: true,
  },
}

/**
 * Converts HTML content to a DOCX document
 * @param html - The HTML content to convert
 * @param header - Optional header HTML content
 * @param options - Document conversion options
 * @returns Promise resolving to ArrayBuffer containing the DOCX document
 * @throws {Error} If conversion fails
 */
export const convertToDocx = async (
  html: string,
  header: string | null = null,
  options: UmoDocumentOptions = {}
): Promise<Uint8Array> => {
  if (!isString(html)) {
    throw new TypeError('HTML content must be a string')
  }

  if (header !== null && !isString(header)) {
    throw new TypeError('Header content must be a string or null')
  }

  try {
    const mergedOptions = {
      ...DEFAULT_OPTIONS,
      ...options,
      // Map our enhanced options structure to the library's expected format
      orientation: options.layout?.orientation ?? DEFAULT_OPTIONS.layout?.orientation,
      pageSize: options.layout?.pageSize ?? DEFAULT_OPTIONS.layout?.pageSize,
      margins: options.layout?.margins ?? DEFAULT_OPTIONS.layout?.margins,
      font: options.fonts?.main ?? DEFAULT_OPTIONS.fonts?.main,
      fontSize: options.fonts?.size ?? DEFAULT_OPTIONS.fonts?.size,
      complexScriptFontSize: options.fonts?.complexScriptSize ?? DEFAULT_OPTIONS.fonts?.complexScriptSize,
      table: options.table ?? DEFAULT_OPTIONS.table,
      header: header !== null,
      footer: options.sections?.footer ?? false,
      lang: options.localization?.lang ?? DEFAULT_OPTIONS.localization?.lang,
      decodeUnicode: options.localization?.decodeUnicode ?? DEFAULT_OPTIONS.localization?.decodeUnicode,
      title: options.metadata?.title,
      subject: options.metadata?.subject,
      creator: options.metadata?.creator ?? DEFAULT_OPTIONS.metadata?.creator,
      keywords: options.metadata?.keywords ?? DEFAULT_OPTIONS.metadata?.keywords,
      description: options.metadata?.description,
      lastModifiedBy: options.metadata?.lastModifiedBy ?? DEFAULT_OPTIONS.metadata?.lastModifiedBy,
      revision: options.metadata?.revision ?? DEFAULT_OPTIONS.metadata?.revision,
      createdAt: options.metadata?.createdAt ?? DEFAULT_OPTIONS.metadata?.createdAt,
      modifiedAt: options.metadata?.modifiedAt ?? DEFAULT_OPTIONS.metadata?.modifiedAt,
    }

    const result = await HTMLtoDOCX(html, header || undefined, mergedOptions)
    if (result instanceof Blob) {
      const arrayBuffer = await result.arrayBuffer()
      return new Uint8Array(arrayBuffer)
    }
    return new Uint8Array(result)
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`HTML to DOCX conversion failed: ${error.message}`)
    }
    throw new Error('An unexpected error occurred during DOCX conversion')
  }
}

export default convertToDocx 
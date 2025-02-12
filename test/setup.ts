import { vi } from 'vitest'
import '@testing-library/jest-dom'

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn()
global.URL.revokeObjectURL = vi.fn()

// Mock document.createElement for anchor tags
const mockAnchor = {
  href: '',
  download: '',
  click: vi.fn(),
} as unknown as HTMLAnchorElement

// Store the original createElement method
const originalCreateElement = document.createElement.bind(document)

global.document.createElement = vi.fn((tag: string) => {
  if (tag === 'a') {
    return mockAnchor
  }
  return originalCreateElement(tag)
}) 
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock ResizeObserver which isn't available in test environment
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Add any other global test setup here 
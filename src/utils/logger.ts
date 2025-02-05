interface LogData {
  component: string
  action: string
  data?: unknown
  timestamp: string
  stack?: string
}

export const debugReadability = (component: string, action: string, data?: unknown) => {
  if (process.env.NODE_ENV === 'development') {
    const logData: LogData = {
      component,
      action,
      data,
      timestamp: new Date().toISOString(),
      stack: new Error().stack
    }
    
    console.group(`🔍 [${component}] ${action}`)
    console.log('Data:', data)
    console.log('Stack:', logData.stack)
    console.groupEnd()

    return logData
  }
  return null
}

export const createLogger = (enabled: boolean = process.env.NODE_ENV === 'development') => ({
  log: (message: string, data?: unknown) => {
    if (enabled) {
      console.log(`📝 ${message}`, data || '')
    }
  },
  warn: (message: string, data?: unknown) => {
    if (enabled) {
      console.warn(`⚠️ ${message}`, data || '')
    }
  },
  error: (message: string, error?: unknown) => {
    if (enabled) {
      console.error(`❌ ${message}`, error || '')
    }
  },
  group: (label: string) => {
    if (enabled) {
      console.group(`📦 ${label}`)
    }
  },
  groupEnd: () => {
    if (enabled) {
      console.groupEnd()
    }
  }
})

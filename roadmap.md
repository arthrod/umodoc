# State Machine Implementation Roadmap

## 1. File Structure

```
src/
├── composables/
│   ├── state.ts       # State machine implementation
│   └── store.ts       # Enhanced store using state machine
├── types/
│   └── editor.ts      # Type definitions
└── utils/
    └── logger.ts      # Debug utilities
```

## 2. Implementation Steps

### Step 1: Type Definitions (src/types/editor.ts)

```typescript
import type { Mark } from '@tiptap/pm/model'
import type { Editor } from '@tiptap/vue-3'
import type { TableOfContentDataItem } from '@tiptap-pro/extension-table-of-contents'
import type { PageOption, UmoEditorOptions } from '@/types'

export type TableOfContentItem = TableOfContentDataItem & { title: string }

// Core state interface
export interface EditorState {
  // Editor core
  toolbarKey: string
  options: UmoEditorOptions
  page: PageOption
  editorInstance: Editor | undefined
  container: string

  // UI state
  painter: {
    enabled: boolean
    once: boolean
    marks: Mark[]
  }
  bookmark: boolean
  blockMenu: boolean
  assistantBox: boolean
  commentBox: boolean
  tableOfContents: TableOfContentItem[]
  imageViewer: {
    visible: boolean
    current: string | null
  }

  // Feature flags
  searchReplace: boolean
  savedAt: number | null
  printing: boolean
  exportImage: boolean
  exportPDF: boolean
  editorDestroyed: boolean
}

// All possible events that can modify state
export type EditorEvents =
  // Core events
  | { type: 'SET_TOOLBAR_KEY'; payload: string }
  | { type: 'SET_OPTIONS'; payload: UmoEditorOptions }
  | { type: 'SET_PAGE'; payload: PageOption }
  | { type: 'SET_EDITOR_INSTANCE'; payload: Editor | undefined }
  | { type: 'SET_CONTAINER'; payload: string }

  // UI events
  | { type: 'SET_PAINTER'; payload: { enabled: boolean; once: boolean; marks: Mark[] } }
  | { type: 'SET_BOOKMARK_VISIBILITY'; payload: boolean }
  | { type: 'SET_BLOCK_MENU_VISIBILITY'; payload: boolean }
  | { type: 'SET_ASSISTANT_BOX_VISIBILITY'; payload: boolean }
  | { type: 'SET_COMMENT_BOX_VISIBILITY'; payload: boolean }
  | { type: 'SET_TABLE_OF_CONTENTS'; payload: TableOfContentItem[] }
  | { type: 'SET_IMAGE_VIEWER'; payload: { visible: boolean; current: string | null } }

  // Feature events
  | { type: 'SET_SEARCH_REPLACE_VISIBILITY'; payload: boolean }
  | { type: 'SET_SAVED_AT'; payload: number | null }
  | { type: 'SET_PRINTING'; payload: boolean }
  | { type: 'SET_EXPORT_IMAGE'; payload: boolean }
  | { type: 'SET_EXPORT_PDF'; payload: boolean }
  | { type: 'SET_EDITOR_DESTROYED'; payload: boolean }
  | { type: 'RESET_STORE' }

// State machine configuration interface
export interface StateMachineOptions<State, Events extends EditorEvents> {
  initialState: State
  transitions: Record<Events['type'], (state: State, event: Events) => State>
  debug?: boolean
}
```

### Step 2: Debug Utilities (src/utils/logger.ts)

```typescript
export const createLogger = (enabled: boolean = false) => ({
  log: (message: string, data?: unknown) => {
    if (enabled) {
      console.log(`[StateMachine] ${message}`, data)
    }
  },
  warn: (message: string, data?: unknown) => {
    if (enabled) {
      console.warn(`[StateMachine] ${message}`, data)
    }
  },
  error: (message: string, data?: unknown) => {
    if (enabled) {
      console.error(`[StateMachine] ${message}`, data)
    }
  }
})
```

### Step 3: State Machine Implementation (src/composables/state.ts)

```typescript
import { reactive, readonly } from 'vue'
import type { EditorState, EditorEvents, StateMachineOptions } from '@/types/editor'
import { createLogger } from '@/utils/logger'

export function useStateMachine<State extends EditorState, Events extends EditorEvents>(
  options: StateMachineOptions<State, Events>
) {
  const logger = createLogger(options.debug)
  const state = reactive<State>(options.initialState)

  const transition = (event: Events) => {
    logger.log('Event received', { type: event.type, payload: event.payload })

    const transitionFunction = options.transitions[event.type]
    if (transitionFunction) {
      const nextState = transitionFunction(state, event)
      logger.log('State updated', { 
        prev: state,
        next: nextState,
        event: event.type 
      })
      Object.assign(state, nextState)
    } else {
      logger.warn(`No transition defined for event type: ${event.type}`)
    }
  }

  return {
    state: readonly(state),
    transition
  }
}
```

### Step 4: Enhanced Store Implementation (src/composables/store.ts)

```typescript
import { createGlobalState, watch, useState } from '@vueuse/core'
import { computed } from 'vue'
import { isRecord } from '@tool-belt/type-predicates'
import { defaultOptions, ojbectSchema } from '@/options'
import { shortId } from '@/utils/short-id'
import { useStateMachine } from './state'
import type { 
  EditorState, 
  EditorEvents,
  TableOfContentItem 
} from '@/types/editor'

// Initial state definition
const initialState: EditorState = {
  toolbarKey: shortId(),
  options: defaultOptions,
  page: defaultOptions.page,
  editorInstance: undefined,
  container: `#umo-editor-${shortId(4)}`,
  painter: {
    enabled: false,
    once: true,
    marks: [],
  },
  bookmark: true,
  blockMenu: false,
  assistantBox: false,
  commentBox: false,
  tableOfContents: [],
  imageViewer: {
    visible: false,
    current: null,
  },
  searchReplace: false,
  savedAt: null,
  printing: false,
  exportImage: false,
  exportPDF: false,
  editorDestroyed: false,
}

// State transitions
const transitions: StateMachineOptions<EditorState, EditorEvents>['transitions'] = {
  'SET_TOOLBAR_KEY': (state, event) => ({ 
    ...state, 
    toolbarKey: event.payload 
  }),

  'SET_OPTIONS': (state, event) => {
    const opts = isRecord(event.payload) && Object.keys(event.payload).includes('value')
      ? event.payload.value
      : event.payload

    const newOptions = ojbectSchema.merge(
      state.options,
      Object.keys(opts).reduce<Record<string, unknown>>(
        (acc, key) => {
          if (opts[key] !== undefined) {
            acc[key] = opts[key]
          }
          return acc
        },
        {},
      ),
    )
    return { ...state, options: newOptions }
  },

  'SET_PAGE': (state, event) => ({ 
    ...state, 
    page: event.payload 
  }),

  'SET_EDITOR_INSTANCE': (state, event) => ({ 
    ...state, 
    editorInstance: event.payload 
  }),

  'SET_PAINTER': (state, event) => ({ 
    ...state, 
    painter: event.payload 
  }),

  'SET_BOOKMARK_VISIBILITY': (state, event) => ({ 
    ...state, 
    bookmark: event.payload 
  }),

  'SET_BLOCK_MENU_VISIBILITY': (state, event) => ({ 
    ...state, 
    blockMenu: event.payload 
  }),

  'SET_ASSISTANT_BOX_VISIBILITY': (state, event) => ({ 
    ...state, 
    assistantBox: event.payload 
  }),

  'SET_COMMENT_BOX_VISIBILITY': (state, event) => ({ 
    ...state, 
    commentBox: event.payload 
  }),

  'SET_TABLE_OF_CONTENTS': (state, event) => ({ 
    ...state, 
    tableOfContents: event.payload 
  }),

  'SET_IMAGE_VIEWER': (state, event) => ({ 
    ...state, 
    imageViewer: event.payload 
  }),

  'SET_SEARCH_REPLACE_VISIBILITY': (state, event) => ({ 
    ...state, 
    searchReplace: event.payload 
  }),

  'SET_SAVED_AT': (state, event) => ({ 
    ...state, 
    savedAt: event.payload 
  }),

  'SET_PRINTING': (state, event) => ({ 
    ...state, 
    printing: event.payload 
  }),

  'SET_EXPORT_IMAGE': (state, event) => ({ 
    ...state, 
    exportImage: event.payload 
  }),

  'SET_EXPORT_PDF': (state, event) => ({ 
    ...state, 
    exportPDF: event.payload 
  }),

  'SET_EDITOR_DESTROYED': (state, event) => ({ 
    ...state, 
    editorDestroyed: event.payload 
  }),

  'RESET_STORE': (state) => ({
    ...state,
    editorInstance: undefined,
    tableOfContents: [],
    searchReplace: false,
    savedAt: null,
    editorDestroyed: true,
  }),

  'SET_CONTAINER': (state, event) => ({ 
    ...state, 
    container: event.payload 
  }),
}

// Enhanced store with state machine
export const useStore = createGlobalState(() => {
  const stateMachine = useStateMachine<EditorState, EditorEvents>({
    initialState,
    transitions,
    debug: process.env.NODE_ENV === 'development'
  })

  const { state, transition } = stateMachine

  // Existing logic adapted to use state machine
  const setOptions = (value: unknown) => {
    transition({ type: 'SET_OPTIONS', payload: value as UmoEditorOptions })
    const $locale = useState('locale')
    if (!$locale.value) {
      $locale.value = state.options.locale
    }
    return state.options
  }

  const setPainter = ({
    enabled,
    once,
    marks,
  }: {
    enabled: boolean
    once: boolean
    marks: Mark[]
  }) => {
    transition({ 
      type: 'SET_PAINTER', 
      payload: { enabled, once, marks } 
    })
  }

  const setEditor = (editorInstance: Editor) => {
    transition({ 
      type: 'SET_EDITOR_INSTANCE', 
      payload: editorInstance 
    })
  }

  const resetStore = () => {
    transition({ type: 'RESET_STORE' })
  }

  // Watchers
  watch(
    () => state.options.page,
    ({
      defaultBackground,
      defaultMargin,
      defaultOrientation,
      watermark,
      showBreakMarks,
    }) => {
      transition({
        type: 'SET_PAGE',
        payload: {
          size: state.options.dicts?.pageSizes.find(
            (item: { default: boolean }) => item.default,
          ),
          margin: defaultMargin,
          background: defaultBackground,
          orientation: defaultOrientation,
          showBreakMarks,
          watermark,
          showLineNumber: false,
          showToc: false,
          zoomLevel: 100,
          autoWidth: false,
          preview: {
            enabled: false,
            laserPointer: true,
          },
        },
      })
    },
    { immediate: true, once: true }
  )

  watch(
    () => state.options.document?.readOnly,
    (val: boolean) => {
      state.editorInstance?.setEditable(!val)
      transition({ 
        type: 'SET_TOOLBAR_KEY', 
        payload: shortId() 
      })
    }
  )

  // Return computed properties for reactive access
  return {
    // State getters
    toolbarKey: computed(() => state.toolbarKey),
    container: computed(() => state.container),
    options: computed(() => state.options),
    page: computed(() => state.page),
    editor: computed(() => state.editorInstance),
    painter: computed(() => state.painter),
    bookmark: computed(() => state.bookmark),
    blockMenu: computed(() => state.blockMenu),
    assistantBox: computed(() => state.assistantBox),
    commentBox: computed(() => state.commentBox),
    tableOfContents: computed(() => state.tableOfContents),
    imageViewer: computed(() => state.imageViewer),
    searchReplace: computed(() => state.searchReplace),
    savedAt: computed(() => state.savedAt),
    printing: computed(() => state.printing),
    exportImage: computed(() => state.exportImage),
    exportPDF: computed(() => state.exportPDF),
    editorDestroyed: computed(() => state.editorDestroyed),

    // Actions
    setOptions,
    setEditor,
    setPainter,
    resetStore,

    // Expose state machine for advanced usage
    transition
  }
})
```

## 3. Usage Example

```typescript
const store = useStore()

// Read state
console.log(store.options.value)

// Update state
store.setOptions({ /* ... */ })

// Direct state transitions
store.transition({
  type: 'SET_PRINTING',
  payload: true
})

// Watch for changes
watch(store.printing, (isPrinting) => {
  console.log('Printing state changed:', isPrinting)
})
```

## 4. Migration Strategy

1. **Phase 1: Parallel Implementation**
   - Implement new state machine
   - Keep existing functionality
   - Add logging in development

2. **Phase 2: Gradual Migration**
   - Move state updates to use transitions
   - Update components to use computed properties
   - Test each migration step

3. **Phase 3: Cleanup**
   - Remove old state management
   - Remove temporary computed wrappers
   - Update documentation

## 5. Benefits

1. **Type Safety**
   - Full TypeScript support
   - Event-driven architecture
   - Immutable state updates

2. **Debugging**
   - State transition logging
   - Event tracing
   - Development tools support

3. **Maintainability**
   - Clear state structure
   - Predictable updates
   - Centralized state logic

4. **Performance**
   - Optimized reactivity
   - Computed property caching
   - Minimal re-renders

## 6. Critical Assessment and Immediate Error Resolution

### 6.1 Current Error Analysis
```typescript
TypeError: null is not an object (evaluating 'readabilityResult.textContent')
```

#### Error Context Checklist
- [ ] Locate exact file and line number where error occurs
- [ ] Identify where `readabilityResult` is defined
- [ ] Document the expected type and purpose of `readabilityResult`
- [ ] Track the lifecycle of `readabilityResult` (creation to usage)
- [ ] Identify all code paths that could lead to `null` value

#### Potential Root Causes
1. **Timing Issues**
   - [ ] Check if `readabilityResult` depends on async operations
   - [ ] Verify DOM element availability
   - [ ] Review component mounting sequence

2. **State Dependencies**
   - [ ] Map `readabilityResult` dependencies
   - [ ] Document state requirements for valid `readabilityResult`
   - [ ] Identify potential race conditions

3. **Component Lifecycle**
   - [ ] Review component initialization
   - [ ] Check cleanup on unmount
   - [ ] Verify proper event handling

### 6.2 Immediate Error Resolution Plan

#### Phase 1: Debug and Document
```typescript
// Add comprehensive logging
const debugReadability = (component: string, action: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Readability][${component}] ${action}`, {
      readabilityResult,
      state: store.state,
      timestamp: new Date().toISOString()
    })
  }
}

// Add type safety
interface ReadabilityResult {
  textContent: string
  // Add other expected properties
}

// Add null checks
const getTextContent = (result: ReadabilityResult | null): string => {
  if (!result) {
    debugReadability('getTextContent', 'Result is null')
    return ''
  }
  return result.textContent
}
```

#### Phase 2: Safe Integration with State Machine
```typescript
// Add readability-specific state
export interface EditorState {
  // ... existing state ...
  readability: {
    result: ReadabilityResult | null
    status: 'idle' | 'loading' | 'ready' | 'error'
    error: Error | null
  }
}

// Add readability events
export type EditorEvents =
  // ... existing events ...
  | { type: 'SET_READABILITY_RESULT'; payload: ReadabilityResult | null }
  | { type: 'SET_READABILITY_STATUS'; payload: 'idle' | 'loading' | 'ready' | 'error' }
  | { type: 'SET_READABILITY_ERROR'; payload: Error | null }
```

### 6.3 Enhanced State Machine Integration

#### Readability-Specific Transitions
```typescript
const transitions = {
  // ... existing transitions ...
  'SET_READABILITY_RESULT': (state, event) => {
    debugReadability('transition', 'Setting result')
    return {
      ...state,
      readability: {
        ...state.readability,
        result: event.payload,
        status: event.payload ? 'ready' : 'error'
      }
    }
  }
}
```

#### Safe Access Patterns
```typescript
// In components
const useReadability = () => {
  const store = useStore()
  
  const getContent = computed(() => {
    const result = store.readability.value.result
    return result?.textContent ?? ''
  })

  const isReady = computed(() => 
    store.readability.value.status === 'ready'
  )

  return {
    getContent,
    isReady
  }
}
```

### 6.4 Implementation Checklist

#### Immediate Error Fix
- [ ] Add null checks for `readabilityResult`
- [ ] Implement debug logging
- [ ] Add type definitions
- [ ] Create safe access utilities

#### State Machine Integration
- [ ] Add readability state to `EditorState`
- [ ] Implement readability events
- [ ] Add readability transitions
- [ ] Create readability composable

#### Testing
- [ ] Unit tests for null handling
- [ ] Integration tests for state transitions
- [ ] E2E tests for readability workflow

#### Documentation
- [ ] Document readability lifecycle
- [ ] Add debug guide
- [ ] Update component usage examples

### 6.5 Verification Steps

1. **Error Reproduction**
   ```typescript
   // Add instrumentation to verify fix
   const verifyReadability = () => {
     try {
       // Attempt to reproduce error
       const content = readabilityResult.textContent
       console.log('Success:', content)
     } catch (error) {
       console.error('Error still exists:', error)
     }
   }
   ```

2. **State Validation**
   ```typescript
   // Add state invariant checks
   const validateReadabilityState = (state: EditorState) => {
     const { readability } = state
     if (readability.status === 'ready' && !readability.result) {
       console.error('Invalid state: ready status with null result')
     }
   }
   ```

### 6.6 Performance Considerations

1. **Memory Management**
```typescript
// Add cleanup
onBeforeUnmount(() => {
  store.transition({
    type: 'SET_READABILITY_RESULT',
    payload: null
  })
})
```

2. **State Updates Optimization**
```typescript
// Batch readability updates
const updateReadability = (result: ReadabilityResult) => {
  batch(() => {
    store.transition({ type: 'SET_READABILITY_RESULT', payload: result })
    store.transition({ type: 'SET_READABILITY_STATUS', payload: 'ready' })
  })
}
```

### 6.7 Future Improvements

1. **Error Recovery**
   - [ ] Implement automatic retry logic
   - [ ] Add fallback content handling
   - [ ] Create error boundary components

2. **Performance**
   - [ ] Add result caching
   - [ ] Implement lazy loading
   - [ ] Add debounced updates

3. **Monitoring**
   - [ ] Add error tracking
   - [ ] Implement performance metrics
   - [ ] Create status dashboard

This critical assessment ensures that while we improve the overall architecture with the state machine, we directly address and fix the immediate `readabilityResult.textContent` error through proper typing, null checks, and lifecycle management.

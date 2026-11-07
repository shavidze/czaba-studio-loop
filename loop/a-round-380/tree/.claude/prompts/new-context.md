# New React Context Template

ახალი React Context-ის შექმნისას დაიცავი ეს pattern-ები (AudioContext, StudioContext მაგალითებიდან).

---

## ფაილის სტრუქტურა

```typescript
// app/contexts/{ContextName}Context.tsx

import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode
} from 'react';

// ========================================
// Types
// ========================================

// State interface - რა მონაცემებს ვინახავთ
interface ContextState {
  // მონაცემები
  items: Item[];
  currentItem: Item | null;

  // Loading/Error states
  isLoading: boolean;
  error: string | null;

  // UI states
  isOpen: boolean;
}

// Context value - state + actions
interface ContextNameContextValue {
  state: ContextState;

  // Actions
  loadItems: () => Promise<void>;
  selectItem: (item: Item) => void;
  clearSelection: () => void;

  // Setters
  setIsOpen: (open: boolean) => void;
}

// ========================================
// Context Creation
// ========================================

const ContextNameContext = createContext<ContextNameContextValue | undefined>(undefined);

// ========================================
// Initial State
// ========================================

const initialState: ContextState = {
  items: [],
  currentItem: null,
  isLoading: false,
  error: null,
  isOpen: false,
};

// ========================================
// Provider Component
// ========================================

export function ContextNameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ContextState>(initialState);

  // Refs for non-reactive data (audio elements, timers, etc.)
  const someRef = useRef<SomeType | null>(null);

  // ========================================
  // Effects
  // ========================================

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup logic: cancel timers, close connections, etc.
      if (someRef.current) {
        someRef.current.cleanup();
      }
    };
  }, []);

  // ========================================
  // Actions (useCallback for stability)
  // ========================================

  const loadItems = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const items = await SomeService.getItems();
      setState(prev => ({ ...prev, items, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }, []);

  const selectItem = useCallback((item: Item) => {
    // Functional update pattern - always use prev =>
    setState(prev => ({
      ...prev,
      currentItem: item,
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, currentItem: null }));
  }, []);

  const setIsOpen = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, isOpen: open }));
  }, []);

  // ========================================
  // Context Value (memoization optional)
  // ========================================

  const value: ContextNameContextValue = {
    state,
    loadItems,
    selectItem,
    clearSelection,
    setIsOpen,
  };

  return (
    <ContextNameContext.Provider value={value}>
      {children}
    </ContextNameContext.Provider>
  );
}

// ========================================
// Custom Hook with Error Boundary
// ========================================

export function useContextName() {
  const context = useContext(ContextNameContext);

  if (context === undefined) {
    throw new Error('useContextName must be used within a ContextNameProvider');
  }

  return context;
}
```

---

## State Update Patterns

```typescript
// CORRECT - Functional update with prev
setState(prev => ({ ...prev, isLoading: true }));

// CORRECT - Multiple updates atomically
setState(prev => ({
  ...prev,
  items: newItems,
  currentItem: null,
  isLoading: false,
}));

// WRONG - Direct state mutation
state.items.push(newItem); // NEVER DO THIS

// WRONG - Reading stale state
setState({ ...state, isLoading: true }); // May use stale state
```

---

## Ref Usage for Non-Reactive Data

```typescript
// Audio elements (must persist across renders)
const audioRef = useRef<HTMLAudioElement | null>(null);

// Web Audio API nodes
const audioContextRef = useRef<AudioContext | null>(null);
const gainNodesRef = useRef<Map<string, GainNode>>(new Map());

// Animation frames
const animationFrameRef = useRef<number | null>(null);

// Timers
const timerRef = useRef<NodeJS.Timeout | null>(null);

// Previous values for comparison
const prevValueRef = useRef<string | null>(null);
```

---

## Cleanup Pattern

```typescript
useEffect(() => {
  // Setup
  const audio = new Audio();
  audioRef.current = audio;

  // Event listeners
  const handleTimeUpdate = () => {
    setState(prev => ({ ...prev, currentTime: audio.currentTime }));
  };

  audio.addEventListener('timeupdate', handleTimeUpdate);

  // Cleanup function (REQUIRED!)
  return () => {
    audio.removeEventListener('timeupdate', handleTimeUpdate);
    audio.pause();
    audio.src = '';

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };
}, []);
```

---

## Provider Composition (root.tsx)

```tsx
// app/root.tsx
export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AudioProvider>
          <ToastProvider>
            <Outlet />
          </ToastProvider>
        </AudioProvider>
      </CartProvider>
    </AuthProvider>
  );
}
```

---

## გამოყენება კომპონენტებში

```tsx
import { useContextName } from '~/contexts/ContextNameContext';

function MyComponent() {
  const { state, loadItems, selectItem } = useContextName();

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  if (state.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {state.items.map(item => (
        <button key={item.id} onClick={() => selectItem(item)}>
          {item.title}
        </button>
      ))}
    </div>
  );
}
```

---

## Complex State Example (Studio-style)

```typescript
interface ComplexState {
  // Core data
  productId: string | null;
  stems: StemState[];

  // Playback
  isPlaying: boolean;
  currentTime: number;
  masterDuration: number;

  // Loading
  isLoading: boolean;
  allLoaded: boolean;

  // UI
  zoomLevel: number;
  selectedIds: Set<string>;

  // History (undo/redo)
  history: HistoryEntry[];
  historyIndex: number;
}

// Helper function for complex logic
const shouldItemBeActive = (item: ItemState, anySelected: boolean): boolean => {
  if (item.isDisabled) return false;
  if (anySelected) return item.isSelected;
  return true;
};
```

---

## Checklist

Context შექმნის წინ შეამოწმე:

- [ ] Types განსაზღვრულია (State, ContextValue)
- [ ] Initial state სრულია
- [ ] Context created with `undefined` default
- [ ] Provider component exports state + actions
- [ ] Custom hook has error boundary
- [ ] Actions use `useCallback`
- [ ] State updates use functional pattern (`prev =>`)
- [ ] Refs used for non-reactive data
- [ ] Cleanup in useEffect return
- [ ] Error handling in async actions
- [ ] Provider added to root.tsx
- [ ] Hook name follows `useContextName` convention

# New Custom Hook Template

ახალი custom hook-ის შექმნისას დაიცავი ეს pattern-ები.

---

## ფაილის სტრუქტურა

```typescript
// app/hooks/useCamelCase.ts

import { useState, useEffect, useCallback, useRef, type RefObject } from 'react';

// ========================================
// Types
// ========================================

interface UseHookNameOptions {
  initialValue?: string;
  debounceMs?: number;
  enabled?: boolean;
}

interface UseHookNameReturn {
  value: string;
  setValue: (value: string) => void;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

// ========================================
// Hook Implementation
// ========================================

/**
 * Hook description - what it does
 *
 * @param options - Configuration options
 * @returns Object with value, setValue, isLoading, error, reset
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { value, setValue, isLoading } = useHookName({ initialValue: 'test' });
 *   return <input value={value} onChange={e => setValue(e.target.value)} />;
 * }
 * ```
 */
export function useHookName(options: UseHookNameOptions = {}): UseHookNameReturn {
  const { initialValue = '', debounceMs = 300, enabled = true } = options;

  // State
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Refs (for cleanup, previous values, etc.)
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Track mounted state for async operations
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Main effect
  useEffect(() => {
    if (!enabled) return;

    // Debounce logic
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      // Do something with value
    }, debounceMs);

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, debounceMs, enabled]);

  // Callbacks
  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
  }, [initialValue]);

  return {
    value,
    setValue,
    isLoading,
    error,
    reset,
  };
}
```

---

## სხვადასხვა ტიპის Hooks

### 1. Simple State Hook

```typescript
// app/hooks/useToggle.ts

import { useState, useCallback } from 'react';

export function useToggle(initialValue = false): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(prev => !prev), []);
  const set = useCallback((newValue: boolean) => setValue(newValue), []);

  return [value, toggle, set];
}
```

### 2. Event Listener Hook

```typescript
// app/hooks/useClickOutside.ts

import { useEffect, type RefObject } from 'react';

/**
 * Detects clicks outside of the specified element
 */
export function useClickOutside(
  ref: RefObject<HTMLElement>,
  handler: () => void
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref, handler]);
}
```

### 3. DOM Manipulation Hook

```typescript
// app/hooks/useScrollLock.ts

import { useEffect } from 'react';

/**
 * Locks body scroll when isLocked is true
 */
export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isLocked]);
}
```

### 4. Async Data Hook

```typescript
// app/hooks/useAsyncData.ts

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAsyncDataOptions<T> {
  initialData?: T;
  enabled?: boolean;
}

interface UseAsyncDataReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  options: UseAsyncDataOptions<T> = {}
): UseAsyncDataReturn<T> {
  const { initialData = null, enabled = true } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Track mounted state
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refetch = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();

      // Only update state if still mounted
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [fetcher, enabled]);

  // Initial fetch
  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}
```

### 5. Debounced Value Hook

```typescript
// app/hooks/useDebounce.ts

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

---

## Dependency Array Rules

```typescript
// CORRECT - All external values in deps
useEffect(() => {
  doSomething(value, callback);
}, [value, callback]);

// CORRECT - Empty deps for "on mount only"
useEffect(() => {
  initializeOnce();
}, []);

// WRONG - Missing dependency
useEffect(() => {
  doSomething(value); // value is external but not in deps!
}, []);

// CORRECT - Using ref to avoid deps (stable reference)
const callbackRef = useRef(callback);
callbackRef.current = callback;

useEffect(() => {
  callbackRef.current();
}, []); // callback not needed in deps
```

---

## Error Handling

```typescript
export function useData() {
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const data = await service.getData();
      return data;
    } catch (err) {
      // Type-safe error handling
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error; // Re-throw if needed
    }
  }, []);

  return { error, fetchData };
}
```

---

## Barrel Export

```typescript
// app/hooks/index.ts

export { useToggle } from './useToggle';
export { useClickOutside } from './useClickOutside';
export { useScrollLock } from './useScrollLock';
export { useDebounce } from './useDebounce';
export { useAsyncData } from './useAsyncData';

// Re-export context hooks
export { useAuth } from '~/contexts/AuthContext';
export { useCart } from '~/contexts/CartContext';
export { useAudio } from '~/contexts/AudioContext';
```

---

## გამოყენება

```tsx
// app/components/SearchInput.tsx

import { useDebounce, useClickOutside } from '~/hooks';

function SearchInput() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setIsOpen(false));

  useEffect(() => {
    if (debouncedQuery) {
      search(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <div ref={ref}>
      <input value={query} onChange={e => setQuery(e.target.value)} />
    </div>
  );
}
```

---

## Naming Conventions

| Pattern | Example |
|---------|---------|
| Boolean state | `useToggle`, `useBoolean` |
| Data fetching | `useData`, `useFetch`, `useQuery` |
| Event handling | `useClickOutside`, `useKeyPress` |
| DOM manipulation | `useScrollLock`, `useFocus` |
| Timing | `useDebounce`, `useThrottle`, `useInterval` |
| Media | `useMediaQuery`, `useAudio` |

---

## Checklist

Hook შექმნის წინ შეამოწმე:

- [ ] სახელი იწყება `use` prefix-ით
- [ ] TypeScript types განსაზღვრულია (Options, Return)
- [ ] JSDoc კომენტარი და @example აქვს
- [ ] Cleanup function useEffect-ში
- [ ] Mounted state check async operations-ში
- [ ] useCallback stable references-თვის
- [ ] Dependency arrays სწორია
- [ ] Error handling implemented
- [ ] Added to hooks/index.ts barrel export
- [ ] არ არის SSR issues (window/document checks)

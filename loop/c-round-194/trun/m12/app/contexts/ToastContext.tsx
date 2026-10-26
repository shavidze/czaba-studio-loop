import { createContext, type ReactNode, useCallback, useState } from 'react';
import type { Toast, ToastContextValue, ToastOptions } from '~/types/cart';

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, options?: ToastOptions | Toast['type']) => {
    const id = `toast-${Date.now()}`;

    // Support both old API (type string) and new API (options object)
    let title: string | undefined;
    let type: Toast['type'] = 'success';

    if (typeof options === 'string') {
      type = options;
    } else if (options) {
      title = options.title;
      type = options.type || 'success';
    }

    setToasts((prev) => [...prev, { id, message, title, type }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export { ToastContext };

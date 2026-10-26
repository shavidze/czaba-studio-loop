import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '~/hooks';
import type { Toast } from '~/types/cart';

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styleMap = {
  success: {
    bg: 'bg-brand/10',
    border: 'border-brand/30',
    icon: 'text-brand',
    progress: 'bg-brand',
  },
  error: {
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    icon: 'text-destructive',
    progress: 'bg-destructive',
  },
  warning: {
    bg: 'bg-accent/10',
    border: 'border-accent/30',
    icon: 'text-accent',
    progress: 'bg-accent',
  },
  info: {
    bg: 'bg-brand/10',
    border: 'border-brand/30',
    icon: 'text-brand',
    progress: 'bg-brand',
  },
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [progress, setProgress] = useState(100);
  const style = styleMap[toast.type] || styleMap.info;
  const Icon = iconMap[toast.type] || Info;
  const duration = 4000;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`relative flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl overflow-hidden min-w-[320px] max-w-[420px] ${style.bg} ${style.border}`}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 mt-0.5 ${style.icon}`}>
        <Icon size={20} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold text-foreground mb-0.5">{toast.title}</p>
        )}
        <p className="text-sm text-secondary leading-relaxed">{toast.message}</p>
      </div>

      {/* Close button */}
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 p-1.5 hover:bg-muted-bg rounded-lg transition-colors cursor-pointer text-muted hover:text-foreground"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted-bg">
        <motion.div
          className={`h-full ${style.progress}`}
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.05, ease: 'linear' }}
        />
      </div>
    </motion.div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col-reverse gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

import { Minus, X } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '~/lib/utils';

interface ChatHeaderProps {
  isOnline?: boolean;
  onMinimize: () => void;
  onClose: () => void;
}

export const ChatHeader = forwardRef<HTMLDivElement, ChatHeaderProps>(
  ({ isOnline = true, onMinimize, onClose }, ref) => {
    return (
      <div
        ref={ref}
        className="flex items-center justify-between px-4 py-3 bg-surface border-b border-outline"
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-2.5 h-2.5 rounded-full',
              isOnline ? 'bg-positive animate-pulse' : 'bg-muted',
            )}
          />
          <h3 className="text-foreground font-semibold text-sm">Support Chat</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMinimize}
            className={cn(
              'p-1.5 text-muted rounded-md',
              'hover:text-foreground hover:bg-elevated',
              'transition-all duration-150 cursor-pointer',
            )}
            aria-label="Minimize chat"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'p-1.5 text-muted rounded-md',
              'hover:text-foreground hover:bg-elevated',
              'transition-all duration-150 cursor-pointer',
            )}
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  },
);

ChatHeader.displayName = 'ChatHeader';

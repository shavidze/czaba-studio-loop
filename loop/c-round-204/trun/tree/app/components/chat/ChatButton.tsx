import { MessageCircle } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '~/lib/utils';

interface ChatButtonProps {
  onClick: () => void;
  unreadCount?: number;
}

export const ChatButton = forwardRef<HTMLButtonElement, ChatButtonProps>(
  ({ onClick, unreadCount = 0 }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={cn(
          'fixed bottom-6 right-6 z-50',
          'w-14 h-14',
          'bg-brand text-background',
          'rounded-full',
          'shadow-lg',
          'flex items-center justify-center',
          'transition-all duration-150',
          'hover:scale-110 hover:shadow-glow',
          'cursor-pointer',
        )}
        aria-label="Open support chat"
      >
        <MessageCircle className="w-6 h-6" />

        {unreadCount > 0 && (
          <span
            className={cn(
              'absolute -top-1 -right-1',
              'min-w-5 h-5 px-1.5',
              'bg-destructive text-brand-foreground',
              'rounded-full',
              'text-xs font-semibold',
              'flex items-center justify-center',
              'animate-in zoom-in duration-200',
            )}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    );
  },
);

ChatButton.displayName = 'ChatButton';

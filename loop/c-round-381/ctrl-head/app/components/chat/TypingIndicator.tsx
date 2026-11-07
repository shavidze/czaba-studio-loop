import { forwardRef } from 'react';
import { cn } from '~/lib/utils';

export const TypingIndicator = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center gap-2 self-start',
        'px-4 py-2.5 bg-elevated rounded-xl rounded-bl-sm',
      )}
    >
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-muted rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 bg-muted rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 bg-muted rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
      <span className="text-xs text-muted">Operator is typing...</span>
    </div>
  );
});

TypingIndicator.displayName = 'TypingIndicator';

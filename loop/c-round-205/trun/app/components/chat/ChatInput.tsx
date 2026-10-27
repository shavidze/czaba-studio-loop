import { Send } from 'lucide-react';
import { forwardRef, useCallback, useState } from 'react';
import { cn } from '~/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  disabled?: boolean;
}

export const ChatInput = forwardRef<HTMLDivElement, ChatInputProps>(
  ({ onSend, onTypingStart, onTypingStop, disabled = false }, ref) => {
    const [value, setValue] = useState('');

    const handleSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = value.trim();
        if (trimmed && !disabled) {
          onSend(trimmed);
          setValue('');
          onTypingStop?.();
        }
      },
      [value, onSend, disabled, onTypingStop],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          const trimmed = value.trim();
          if (trimmed && !disabled) {
            onSend(trimmed);
            setValue('');
            onTypingStop?.();
          }
        }
      },
      [value, onSend, disabled, onTypingStop],
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setValue(newValue);

        if (newValue.trim() && !value.trim()) {
          onTypingStart?.();
        } else if (!newValue.trim() && value.trim()) {
          onTypingStop?.();
        }
      },
      [value, onTypingStart, onTypingStop],
    );

    return (
      <div ref={ref} className="p-3 bg-surface border-t border-outline">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <textarea
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={disabled}
            rows={1}
            className={cn(
              'flex-1 px-3 py-2 min-h-[40px] max-h-[120px]',
              'bg-elevated border border-outline-strong rounded-lg',
              'text-foreground text-sm placeholder:text-dim',
              'resize-none',
              'transition-all duration-150',
              disabled && 'opacity-50 cursor-not-allowed',
            )}
          />
          <button
            type="submit"
            disabled={disabled || !value.trim()}
            className={cn(
              'p-2.5 rounded-lg',
              'bg-brand text-background',
              'transition-all duration-150',
              'hover:bg-brand-hover hover:shadow-glow',
              'cursor-pointer',
              (disabled || !value.trim()) && 'opacity-50 cursor-not-allowed',
            )}
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    );
  },
);

ChatInput.displayName = 'ChatInput';

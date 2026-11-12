import { forwardRef } from 'react';
import { cn } from '~/lib/utils';
import type { ChatMessage as ChatMessageType } from './types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(({ message }, ref) => {
  const isUser = message.sender === 'user';

  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col max-w-[80%]',
        isUser ? 'self-end items-end' : 'self-start items-start',
      )}
    >
      <div
        className={cn(
          'px-4 py-2.5 rounded-xl',
          'transition-all duration-150',
          isUser
            ? 'bg-brand text-background rounded-br-sm'
            : 'bg-elevated text-foreground rounded-bl-sm',
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
      </div>
      <span className="text-xs text-dim mt-1 px-1">{message.time}</span>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';

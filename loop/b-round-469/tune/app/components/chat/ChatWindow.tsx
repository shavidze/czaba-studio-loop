import { forwardRef, useEffect, useRef } from 'react';
import { cn } from '~/lib/utils';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { GuestForm } from './GuestForm';
import { TypingIndicator } from './TypingIndicator';
import type { ChatMessage as ChatMessageType, GuestInfo } from './types';

interface ChatWindowProps {
  messages: ChatMessageType[];
  isTyping: boolean;
  isGuestFormVisible: boolean;
  isAdminOnline?: boolean;
  embedded?: boolean;
  onSendMessage: (message: string) => void;
  onGuestSubmit: (info: GuestInfo) => void;
  onMinimize: () => void;
  onClose: () => void;
}

export const ChatWindow = forwardRef<HTMLDivElement, ChatWindowProps>(
  (
    {
      messages,
      isTyping,
      isGuestFormVisible,
      isAdminOnline = true,
      embedded = false,
      onSendMessage,
      onGuestSubmit,
      onMinimize,
      onClose,
    },
    ref,
  ) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    return (
      <div
        ref={ref}
        className={cn(
          embedded ? 'w-full h-[520px]' : 'fixed bottom-24 right-6 z-50 w-[380px] max-h-[520px]',
          'bg-background border border-outline rounded-xl',
          'shadow-xl overflow-hidden',
          'flex flex-col',
          !embedded && 'animate-in slide-in-from-bottom-4 fade-in duration-200',
        )}
      >
        <ChatHeader isOnline={isAdminOnline} onMinimize={onMinimize} onClose={onClose} />

        {isGuestFormVisible ? (
          <GuestForm onSubmit={onGuestSubmit} />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-[300px] max-h-[360px]">
              {!isAdminOnline && (
                <div className="text-center py-2 px-4 bg-surface rounded-lg">
                  <p className="text-sm text-muted">
                    Support is currently offline. Leave a message and we will respond soon.
                  </p>
                </div>
              )}
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            <ChatInput onSend={onSendMessage} />
          </>
        )}
      </div>
    );
  },
);

ChatWindow.displayName = 'ChatWindow';

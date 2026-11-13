import { useCallback, useEffect, useState } from 'react';
import { useAuth, useChat } from '~/hooks';
import { ChatButton } from './ChatButton';
import { ChatWindow } from './ChatWindow';
import type { GuestInfo } from './types';

export function ChatWidget() {
  const { isAuthenticated } = useAuth();
  const {
    messages,
    isTyping,
    isAdminOnline,
    session,
    sendMessage,
    startSession,
    startTyping,
    stopTyping,
  } = useChat();

  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [guestInfo, setGuestInfo] = useState<GuestInfo | null>(null);

  const hasSession = session !== null;
  const showGuestForm = !isAuthenticated && !guestInfo && !hasSession;

  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'admin') {
        setUnreadCount((prev) => prev + 1);
      }
    }
  }, [messages, isOpen]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setUnreadCount(0);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleMinimize = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleGuestSubmit = useCallback(
    async (info: GuestInfo) => {
      setGuestInfo(info);
      await startSession(info);
    },
    [startSession],
  );

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!hasSession && isAuthenticated) {
        await startSession();
      }
      await sendMessage(text);
    },
    [hasSession, isAuthenticated, startSession, sendMessage],
  );

  const _handleTypingStart = useCallback(() => {
    startTyping();
  }, [startTyping]);

  const _handleTypingStop = useCallback(() => {
    stopTyping();
  }, [stopTyping]);

  return (
    <>
      {isOpen ? (
        <ChatWindow
          messages={messages}
          isTyping={isTyping}
          isGuestFormVisible={showGuestForm}
          isAdminOnline={isAdminOnline}
          onSendMessage={handleSendMessage}
          onGuestSubmit={handleGuestSubmit}
          onMinimize={handleMinimize}
          onClose={handleClose}
        />
      ) : (
        <ChatButton onClick={handleOpen} unreadCount={unreadCount} />
      )}
    </>
  );
}

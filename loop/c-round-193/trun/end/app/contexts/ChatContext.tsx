import * as signalR from '@microsoft/signalr';
import { createContext, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import type {
  ChatConnectionStatus,
  ChatContextValue,
  ChatMessage,
  ChatSession,
  ChatState,
  GuestInfo,
} from '~/components/chat/types';
import { useAuth } from '~/hooks';
import {
  apiClient,
  type ChatMessageResponse,
  type ChatSessionResponse,
} from '~/services/api/client';

const initialState: ChatState = {
  connectionStatus: 'disconnected',
  session: null,
  messages: [],
  isTyping: false,
  isAdminOnline: false,
  error: null,
};

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

function transformApiMessage(msg: ChatMessageResponse): ChatMessage {
  return {
    id: msg.id,
    sessionId: msg.sessionId,
    sender: msg.senderType === 'Admin' ? 'admin' : 'user',
    text: msg.content,
    time: new Date(msg.createdAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    createdAt: msg.createdAt,
  };
}

function transformApiSession(apiSession: ChatSessionResponse): ChatSession {
  return {
    id: apiSession.id,
    userId: apiSession.userId ?? null,
    guestName: apiSession.guestName ?? null,
    guestEmail: apiSession.guestEmail ?? null,
    pageUrl: apiSession.pageUrl ?? '',
    status: apiSession.status as 'active' | 'closed',
    createdAt: apiSession.createdAt,
    closedAt: apiSession.closedAt ?? null,
    messages: apiSession.messages.map(transformApiMessage),
  };
}

export function ChatProvider({ children }: ChatProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = useState<ChatState>(initialState);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectRef = useRef<() => void>(() => {});

  const setConnectionStatus = useCallback((status: ChatConnectionStatus) => {
    setState((prev) => ({ ...prev, connectionStatus: status }));
  }, []);

  const setupSignalRHandlers = useCallback(
    (connection: signalR.HubConnection) => {
      connection.on('ReceiveMessage', (message: ChatMessageResponse) => {
        setState((prev) => {
          const messageExists = prev.messages.some((m) => m.id === message.id);
          if (messageExists) {
            return { ...prev, isTyping: false };
          }
          return {
            ...prev,
            messages: [...prev.messages, transformApiMessage(message)],
            isTyping: false,
          };
        });
      });

      connection.on('UserTyping', (_sessionId: number, senderType: string, isTyping: boolean) => {
        if (senderType === 'Admin') {
          setState((prev) => ({ ...prev, isTyping }));
        }
      });

      connection.on('SessionClosed', () => {
        setState((prev) => ({
          ...prev,
          session: prev.session ? { ...prev.session, status: 'closed' } : null,
        }));
      });

      connection.on('AdminStatusChanged', (online: boolean) => {
        setState((prev) => ({ ...prev, isAdminOnline: online }));
      });

      connection.onclose(() => {
        setConnectionStatus('disconnected');
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          if (state.session && state.session.status === 'active') {
            connectRef.current();
          }
        }, 3000);
      });
    },
    [setConnectionStatus, state.session],
  );

  const connect = useCallback(async () => {
    if (state.connectionStatus === 'connected' || state.connectionStatus === 'connecting') {
      return;
    }

    setConnectionStatus('connecting');

    try {
      const hubUrl = apiClient.getSignalRHubUrl();
      const accessToken = apiClient.getAccessToken();

      const connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: accessToken ? () => accessToken : undefined,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      setupSignalRHandlers(connection);

      await connection.start();
      connectionRef.current = connection;
      setConnectionStatus('connected');
      setState((prev) => ({ ...prev, isAdminOnline: true }));
    } catch (error) {
      console.error('Failed to connect to chat hub:', error);
      setConnectionStatus('disconnected');
      setState((prev) => ({
        ...prev,
        error: 'Failed to connect to chat. Please try again.',
      }));
    }
  }, [state.connectionStatus, setConnectionStatus, setupSignalRHandlers]);

  connectRef.current = connect;

  const disconnect = useCallback(async () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (connectionRef.current) {
      try {
        await connectionRef.current.stop();
      } catch (error) {
        console.error('Error disconnecting from chat hub:', error);
      }
      connectionRef.current = null;
    }

    setConnectionStatus('disconnected');
    setState((prev) => ({
      ...prev,
      session: null,
      messages: [],
      isTyping: false,
    }));
  }, [setConnectionStatus]);

  const startSession = useCallback(
    async (guestInfo?: GuestInfo) => {
      setState((prev) => ({ ...prev, error: null }));

      try {
        const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

        const apiSession = await apiClient.createChatSession({
          guestName: guestInfo?.name ?? user?.firstName ?? undefined,
          guestEmail: guestInfo?.email ?? user?.email ?? undefined,
          pageUrl,
        });

        const session = transformApiSession(apiSession);

        setState((prev) => ({
          ...prev,
          session,
          messages: session.messages,
        }));

        await connect();

        if (
          connectionRef.current &&
          connectionRef.current.state === signalR.HubConnectionState.Connected
        ) {
          await connectionRef.current.invoke('JoinSession', apiSession.id);
        }
      } catch (error) {
        console.error('Failed to start chat session:', error);
        setState((prev) => ({
          ...prev,
          error: 'Failed to start chat session. Please try again.',
        }));
      }
    },
    [connect, user],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!state.session) {
        setState((prev) => ({ ...prev, error: 'No active chat session' }));
        return;
      }

      const trimmedText = text.trim();
      if (!trimmedText) return;

      try {
        const apiMessage = await apiClient.sendChatMessage(state.session.id, trimmedText);
        const message = transformApiMessage(apiMessage);

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, message],
        }));
      } catch (error) {
        console.error('Failed to send message:', error);
        setState((prev) => ({
          ...prev,
          error: 'Failed to send message. Please try again.',
        }));
      }
    },
    [state.session],
  );

  const startTyping = useCallback(async () => {
    if (!state.session || !connectionRef.current) return;

    try {
      if (connectionRef.current.state === signalR.HubConnectionState.Connected) {
        await connectionRef.current.invoke('StartTyping', state.session.id);
      }
    } catch (error) {
      console.error('Failed to send typing indicator:', error);
    }
  }, [state.session]);

  const stopTyping = useCallback(async () => {
    if (!state.session || !connectionRef.current) return;

    try {
      if (connectionRef.current.state === signalR.HubConnectionState.Connected) {
        await connectionRef.current.invoke('StopTyping', state.session.id);
      }
    } catch (error) {
      console.error('Failed to stop typing indicator:', error);
    }
  }, [state.session]);

  const closeSession = useCallback(async () => {
    if (!state.session) return;

    if (
      connectionRef.current &&
      connectionRef.current.state === signalR.HubConnectionState.Connected
    ) {
      try {
        await connectionRef.current.invoke('LeaveSession', state.session.id);
      } catch (error) {
        console.error('Failed to leave session:', error);
      }
    }

    setState((prev) => ({
      ...prev,
      session: prev.session
        ? { ...prev.session, status: 'closed', closedAt: new Date().toISOString() }
        : null,
    }));

    await disconnect();
  }, [state.session, disconnect]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated && user && state.session && !state.session.userId) {
      setState((prev) => ({
        ...prev,
        session: prev.session
          ? {
              ...prev.session,
              userId: user.id,
              guestName: user.firstName ?? null,
              guestEmail: user.email,
            }
          : null,
      }));
    }
  }, [isAuthenticated, user, state.session]);

  const value: ChatContextValue = {
    ...state,
    startSession,
    sendMessage,
    startTyping,
    stopTyping,
    closeSession,
    clearError,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export { ChatContext };

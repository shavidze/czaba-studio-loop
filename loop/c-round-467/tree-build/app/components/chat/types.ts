export type MessageSender = 'user' | 'admin';

export type ChatSessionStatus = 'active' | 'closed';

export type ChatConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export interface ChatMessage {
  id: number;
  sessionId?: number;
  sender: MessageSender;
  text: string;
  time: string;
  createdAt?: string;
}

export interface GuestInfo {
  name: string;
  email: string;
}

export interface ChatSession {
  id: number;
  userId: number | null;
  guestName: string | null;
  guestEmail: string | null;
  pageUrl: string;
  status: ChatSessionStatus;
  createdAt: string;
  closedAt: string | null;
  messages: ChatMessage[];
}

export interface ChatState {
  connectionStatus: ChatConnectionStatus;
  session: ChatSession | null;
  messages: ChatMessage[];
  isTyping: boolean;
  isAdminOnline: boolean;
  error: string | null;
}

export interface ChatContextValue extends ChatState {
  startSession: (guestInfo?: GuestInfo) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  startTyping: () => void;
  stopTyping: () => void;
  closeSession: () => void;
  clearError: () => void;
}

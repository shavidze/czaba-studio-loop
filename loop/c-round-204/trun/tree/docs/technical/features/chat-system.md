# Chat System (Support Chat)

## მიმოხილვა

CZABA Store-ის Live Support Chat სისტემა რეალურ დროში კომუნიკაციისთვის მომხმარებლებსა და ადმინისტრატორებს შორის. სისტემა აგებულია **SignalR**-ზე real-time messaging-ისთვის და **React Context**-ზე state management-ისთვის.

**ძირითადი მახასიათებლები:**
- **Real-time messaging** - SignalR WebSocket კავშირით
- **Guest და Authenticated users** - ორივე ტიპის მომხმარებელი
- **Typing indicators** - ადმინის აკრეფის ინდიკატორი
- **Auto-reconnect** - კავშირის ავტომატური აღდგენა
- **Offline support** - შეტყობინებები იგზავნება მაშინაც, როცა ადმინი offline-ია

---

## არქიტექტურის დიაგრამა

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CHAT SYSTEM ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────┐                      ┌──────────────────────┐  │
│  │   ChatWidget        │                      │   .NET Backend       │  │
│  │   (Floating Button) │                      │                      │  │
│  │         │           │                      │  ┌────────────────┐  │  │
│  │         ▼           │                      │  │  ChatHub       │  │  │
│  │   ┌─────────────┐   │    SignalR           │  │  (SignalR)     │  │  │
│  │   │ ChatWindow  │   │◄──────────────────────► │                │  │  │
│  │   │ - GuestForm │   │    WebSocket          │  └────────────────┘  │  │
│  │   │ - Messages  │   │                      │         │            │  │
│  │   │ - Input     │   │                      │         ▼            │  │
│  │   └─────────────┘   │                      │  ┌────────────────┐  │  │
│  │         │           │                      │  │  Chat API      │  │  │
│  │         ▼           │                      │  │ /api/chat/*    │  │  │
│  │   ┌─────────────┐   │    REST API          │  └────────────────┘  │  │
│  │   │ ChatContext │   │◄──────────────────────►        │            │  │
│  │   │ + useChat() │   │                      │         ▼            │  │
│  │   └─────────────┘   │                      │  ┌────────────────┐  │  │
│  │                     │                      │  │    MSSQL       │  │  │
│  └─────────────────────┘                      │  │ ChatSession    │  │  │
│                                               │  │ ChatMessage    │  │  │
│                                               │  └────────────────┘  │  │
│                                               └──────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ფაილების სტრუქტურა

```
app/
├── contexts/
│   └── ChatContext.tsx           # Chat state management + SignalR
├── hooks/
│   └── useChat.ts                # Hook კომპონენტებისთვის
├── components/chat/
│   ├── types.ts                  # TypeScript ტიპები
│   ├── index.ts                  # Re-exports
│   ├── ChatWidget.tsx            # მთავარი widget კომპონენტი
│   ├── ChatButton.tsx            # Floating ჩათის ღილაკი
│   ├── ChatWindow.tsx            # ჩათის ფანჯარა
│   ├── ChatHeader.tsx            # ფანჯრის header
│   ├── ChatMessage.tsx           # ერთი შეტყობინება
│   ├── ChatInput.tsx             # შეტყობინების input
│   ├── GuestForm.tsx             # Guest მომხმარებლის ფორმა
│   └── TypingIndicator.tsx       # "ოპერატორი წერს..." ინდიკატორი
└── services/api/
    └── client.ts                 # Chat API methods
```

---

## 1. TypeScript ტიპები (`app/components/chat/types.ts`)

### ChatMessage - ერთი შეტყობინება

```typescript
export type MessageSender = 'user' | 'admin'

export interface ChatMessage {
  id: number
  sessionId?: number
  sender: MessageSender        // 'user' ან 'admin'
  text: string                 // შეტყობინების ტექსტი
  time: string                 // ფორმატირებული დრო (HH:MM)
  createdAt?: string           // ISO timestamp
}
```

### ChatSession - ჩათის სესია

```typescript
export type ChatSessionStatus = 'active' | 'closed'

export interface ChatSession {
  id: number
  userId: number | null        // null = Guest მომხმარებელი
  guestName: string | null     // Guest-ის სახელი
  guestEmail: string | null    // Guest-ის email
  pageUrl: string              // საიდან დაიწყო ჩათი
  status: ChatSessionStatus    // 'active' ან 'closed'
  createdAt: string
  closedAt: string | null
  messages: ChatMessage[]
}
```

### GuestInfo - Guest მომხმარებლის ინფორმაცია

```typescript
export interface GuestInfo {
  name: string
  email: string
}
```

### ChatState - Context-ის მდგომარეობა

```typescript
export type ChatConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting'

export interface ChatState {
  connectionStatus: ChatConnectionStatus  // SignalR კავშირის სტატუსი
  session: ChatSession | null             // მიმდინარე სესია
  messages: ChatMessage[]                 // შეტყობინებების სია
  isTyping: boolean                       // ადმინი წერს?
  isAdminOnline: boolean                  // ადმინი online-ია?
  error: string | null                    // შეცდომის ტექსტი
}
```

### ChatContextValue - Context-ის ინტერფეისი

```typescript
export interface ChatContextValue extends ChatState {
  startSession: (guestInfo?: GuestInfo) => Promise<void>
  sendMessage: (text: string) => Promise<void>
  startTyping: () => void
  stopTyping: () => void
  closeSession: () => void
  clearError: () => void
}
```

---

## 2. ChatContext (`app/contexts/ChatContext.tsx`)

### ძირითადი კონცეფცია

ChatContext მართავს:
- **SignalR კავშირს** - WebSocket real-time კომუნიკაციისთვის
- **ჩათის სესიას** - შექმნა, დახურვა
- **შეტყობინებებს** - გაგზავნა, მიღება
- **Typing indicators** - აკრეფის სტატუსი

### SignalR კავშირის დამყარება

```typescript
const connect = useCallback(async () => {
  setConnectionStatus('connecting')

  try {
    const hubUrl = apiClient.getSignalRHubUrl()  // /hubs/chat
    const accessToken = apiClient.getAccessToken()

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: accessToken ? () => accessToken : undefined,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    setupSignalRHandlers(connection)
    await connection.start()
    connectionRef.current = connection
    setConnectionStatus('connected')
  } catch (error) {
    setConnectionStatus('disconnected')
    setState(prev => ({
      ...prev,
      error: 'Failed to connect to chat. Please try again.',
    }))
  }
}, [])
```

**Auto-reconnect სტრატეგია:**
- `[0, 2000, 5000, 10000, 30000]` - თანდათანობით მზარდი დაყოვნება
- პირველი მცდელობა მაშინვე, შემდეგ 2s, 5s, 10s, 30s

### SignalR Event Handlers

```typescript
const setupSignalRHandlers = useCallback((connection: signalR.HubConnection) => {
  // ახალი შეტყობინების მიღება
  connection.on('ReceiveMessage', (message: ChatMessageResponse) => {
    setState(prev => {
      // დუბლიკატის შემოწმება
      const messageExists = prev.messages.some(m => m.id === message.id)
      if (messageExists) {
        return { ...prev, isTyping: false }
      }
      return {
        ...prev,
        messages: [...prev.messages, transformApiMessage(message)],
        isTyping: false,
      }
    })
  })

  // Typing indicator
  connection.on('UserTyping', (_sessionId, senderType, isTyping) => {
    if (senderType === 'Admin') {
      setState(prev => ({ ...prev, isTyping }))
    }
  })

  // სესიის დახურვა
  connection.on('SessionClosed', () => {
    setState(prev => ({
      ...prev,
      session: prev.session ? { ...prev.session, status: 'closed' } : null,
    }))
  })

  // ადმინის სტატუსის ცვლილება
  connection.on('AdminStatusChanged', (online: boolean) => {
    setState(prev => ({ ...prev, isAdminOnline: online }))
  })

  // კავშირის გათიშვა
  connection.onclose(() => {
    setConnectionStatus('disconnected')
    // 3 წამში reconnect-ის მცდელობა
    setTimeout(() => {
      if (state.session?.status === 'active') {
        connect()
      }
    }, 3000)
  })
}, [])
```

### სესიის დაწყება

```typescript
const startSession = useCallback(async (guestInfo?: GuestInfo) => {
  setState(prev => ({ ...prev, error: null }))

  try {
    const pageUrl = typeof window !== 'undefined' ? window.location.href : ''

    // API-ით სესიის შექმნა
    const apiSession = await apiClient.createChatSession({
      guestName: guestInfo?.name ?? user?.firstName,
      guestEmail: guestInfo?.email ?? user?.email,
      pageUrl,
    })

    const session = transformApiSession(apiSession)
    setState(prev => ({
      ...prev,
      session,
      messages: session.messages,
    }))

    // SignalR კავშირი
    await connect()

    // სესიაში შესვლა
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      await connectionRef.current.invoke('JoinSession', apiSession.id)
    }
  } catch (error) {
    setState(prev => ({
      ...prev,
      error: 'Failed to start chat session. Please try again.',
    }))
  }
}, [connect, user])
```

### შეტყობინების გაგზავნა

```typescript
const sendMessage = useCallback(async (text: string) => {
  if (!state.session) {
    setState(prev => ({ ...prev, error: 'No active chat session' }))
    return
  }

  const trimmedText = text.trim()
  if (!trimmedText) return

  try {
    // API-ით გაგზავნა (SignalR broadcast-ს Backend აკეთებს)
    const apiMessage = await apiClient.sendChatMessage(state.session.id, trimmedText)
    const message = transformApiMessage(apiMessage)

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
    }))
  } catch (error) {
    setState(prev => ({
      ...prev,
      error: 'Failed to send message. Please try again.',
    }))
  }
}, [state.session])
```

---

## 3. Backend API Integration

### API Endpoints

| Method | Endpoint | აღწერა |
|--------|----------|--------|
| POST | `/api/chat/sessions` | ახალი ჩათის დაწყება |
| GET | `/api/chat/sessions/{id}` | კონკრეტული ჩათის ინფორმაცია |
| GET | `/api/chat/sessions/active` | აქტიური სესიის მიღება |
| POST | `/api/chat/sessions/{id}/messages` | შეტყობინების გაგზავნა |
| GET | `/api/chat/sessions/{id}/messages` | შეტყობინებების სია |
| PATCH | `/api/chat/sessions/{id}/read` | შეტყობინებების წაკითხულად მონიშვნა |

### SignalR Hub

**URL:** `/hubs/chat`

**Hub Methods (Client → Server):**

| Method | პარამეტრები | აღწერა |
|--------|-------------|--------|
| `JoinSession` | `sessionId: number` | სესიაში შესვლა |
| `LeaveSession` | `sessionId: number` | სესიიდან გასვლა |
| `StartTyping` | `sessionId: number` | აკრეფის დაწყება |
| `StopTyping` | `sessionId: number` | აკრეფის დასრულება |

**Hub Events (Server → Client):**

| Event | პარამეტრები | აღწერა |
|-------|-------------|--------|
| `ReceiveMessage` | `ChatMessageResponse` | ახალი შეტყობინება |
| `UserTyping` | `sessionId, senderType, isTyping` | Typing indicator |
| `SessionClosed` | - | სესია დაიხურა |
| `AdminStatusChanged` | `online: boolean` | ადმინის სტატუსი |

### API Response Types

```typescript
export interface ChatMessageResponse {
  id: number
  sessionId: number
  senderType: string           // 'User' | 'Admin'
  senderId?: number
  senderName?: string
  content: string
  isRead: boolean
  createdAt: string
}

export interface ChatSessionResponse {
  id: number
  userId?: number
  guestName?: string
  guestEmail?: string
  pageUrl?: string
  status: string               // 'Active' | 'Closed'
  createdAt: string
  closedAt?: string
  displayName: string
  displayEmail: string
  unreadCount: number
  lastMessage?: ChatMessageResponse
  messages: ChatMessageResponse[]
}
```

---

## 4. UI კომპონენტები

### ChatWidget - მთავარი კომპონენტი

`ChatWidget` არის container კომპონენტი, რომელიც მართავს:
- ჩათის გახსნა/დახურვა
- Unread count badge
- Guest form-ის ჩვენება

```typescript
export function ChatWidget() {
  const { isAuthenticated } = useAuth()
  const { messages, isTyping, session, sendMessage, startSession } = useChat()

  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const hasSession = session !== null
  const showGuestForm = !isAuthenticated && !hasSession

  // Unread count-ის განახლება ახალ admin შეტყობინებაზე
  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.sender === 'admin') {
        setUnreadCount(prev => prev + 1)
      }
    }
  }, [messages, isOpen])

  return isOpen ? (
    <ChatWindow
      messages={messages}
      isTyping={isTyping}
      isGuestFormVisible={showGuestForm}
      onSendMessage={sendMessage}
    />
  ) : (
    <ChatButton onClick={() => setIsOpen(true)} unreadCount={unreadCount} />
  )
}
```

### ChatButton - Floating ღილაკი

- ქვედა მარჯვენა კუთხეში fixed პოზიციით
- Badge-ით unread შეტყობინებების რაოდენობა
- Pulse ანიმაცია ახალ შეტყობინებაზე

### ChatWindow - ჩათის ფანჯარა

- Header: "Support Chat" + minimize/close ღილაკები
- Messages area: scroll-able შეტყობინებების სია
- Typing indicator: "Operator is typing..."
- Input area: ტექსტის შეყვანა + გაგზავნის ღილაკი

### GuestForm - Guest მომხმარებლის ფორმა

Guest მომხმარებლებს ჩათის დაწყებამდე სჭირდებათ:
- სახელი (name)
- Email

ფორმის submit-ზე იწყება ჩათის სესია.

---

## 5. მომხმარებლის Flow-ები

### Guest მომხმარებლის Flow

```
1. მომხმარებელი აჭერს ChatButton-ს
   │
   ▼
2. იხსნება ChatWindow GuestForm-ით
   │
   ▼
3. მომხმარებელი შეავსებს სახელს და email-ს
   │
   ▼
4. startSession(guestInfo) გამოიძახება
   │
   ├── POST /api/chat/sessions (სესიის შექმნა)
   ├── SignalR connect
   └── JoinSession(sessionId)
   │
   ▼
5. ჩანს ChatWindow შეტყობინებების ველით
   │
   ▼
6. მომხმარებელი წერს შეტყობინებას
   │
   ▼
7. sendMessage(text) → POST /api/chat/sessions/{id}/messages
   │
   ▼
8. ადმინის პასუხი მოდის SignalR-ით (ReceiveMessage event)
```

### Authenticated მომხმარებლის Flow

```
1. მომხმარებელი აჭერს ChatButton-ს
   │
   ▼
2. იხსნება ChatWindow (GuestForm არ ჩანს)
   │
   ▼
3. მომხმარებელი წერს პირველ შეტყობინებას
   │
   ▼
4. handleSendMessage → startSession() → sendMessage(text)
   │
   ├── სესია იქმნება user-ის მონაცემებით
   └── შეტყობინება იგზავნება
   │
   ▼
5. ჩატი მზადაა
```

---

## 6. SignalR Connection Lifecycle

### კავშირის სტატუსები

| Status | აღწერა |
|--------|--------|
| `disconnected` | კავშირი არ არის |
| `connecting` | კავშირი მყარდება |
| `connected` | აქტიური კავშირი |
| `reconnecting` | ხელახალი კავშირი |

### Auto-Reconnect

SignalR-ს აქვს ჩაშენებული auto-reconnect:

```typescript
.withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
```

დამატებით, manual reconnect `onclose` event-ზე:

```typescript
connection.onclose(() => {
  setConnectionStatus('disconnected')
  setTimeout(() => {
    if (state.session?.status === 'active') {
      connect()
    }
  }, 3000)
})
```

### Cleanup

```typescript
useEffect(() => {
  return () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (connectionRef.current) {
      connectionRef.current.stop()
    }
  }
}, [])
```

---

## 7. გამოყენება კომპონენტში

### useChat Hook

```typescript
import { useChat } from '~/hooks'

function SomeComponent() {
  const {
    // State
    connectionStatus,
    session,
    messages,
    isTyping,
    isAdminOnline,
    error,
    // Actions
    startSession,
    sendMessage,
    startTyping,
    stopTyping,
    closeSession,
    clearError,
  } = useChat()

  // ...
}
```

### Provider Setup (root.tsx)

```tsx
import { ChatProvider } from '~/contexts/ChatContext'

<AuthProvider>
  <ChatProvider>
    <App />
  </ChatProvider>
</AuthProvider>
```

---

## 8. მნიშვნელოვანი შენიშვნები

### Message Deduplication

SignalR-ით მიღებული შეტყობინებები შეიძლება დუბლირდეს, ამიტომ:

```typescript
connection.on('ReceiveMessage', (message) => {
  setState(prev => {
    const messageExists = prev.messages.some(m => m.id === message.id)
    if (messageExists) return prev  // დუბლიკატი!
    return { ...prev, messages: [...prev.messages, message] }
  })
})
```

### Auth Integration

თუ მომხმარებელი login-ს გააკეთებს ჩათის დროს:

```typescript
useEffect(() => {
  if (isAuthenticated && user && state.session && !state.session.userId) {
    // Guest სესიის განახლება user-ის მონაცემებით
    setState(prev => ({
      ...prev,
      session: prev.session
        ? { ...prev.session, userId: user.id, guestName: user.firstName }
        : null,
    }))
  }
}, [isAuthenticated, user, state.session])
```

### Error Handling

ყველა async ოპერაცია try-catch-შია და error state-ში ინახება:

```typescript
try {
  await someOperation()
} catch (error) {
  setState(prev => ({
    ...prev,
    error: 'Error message for user',
  }))
}
```

---

## 9. დაკავშირებული ფაილები

### Core
- `app/contexts/ChatContext.tsx` - მთავარი state management
- `app/hooks/useChat.ts` - Hook კომპონენტებისთვის
- `app/components/chat/types.ts` - TypeScript ტიპები

### UI Components
- `app/components/chat/ChatWidget.tsx` - მთავარი widget
- `app/components/chat/ChatWindow.tsx` - ჩათის ფანჯარა
- `app/components/chat/ChatButton.tsx` - Floating ღილაკი
- `app/components/chat/GuestForm.tsx` - Guest ფორმა

### API
- `app/services/api/client.ts` - Chat API methods

### Documentation
- `docs/user-stories/21-support-chat.md` - User story და სპეციფიკაცია

---

## განახლების ისტორია

| თარიღი | ცვლილება |
|--------|----------|
| 2026-01-29 | Chat System დოკუმენტაციის შექმნა |

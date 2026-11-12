# State Management - React Contexts Overview

## მიმოხილვა

CZABA Store იყენებს **React Context API**-ს global state management-ისთვის. პროექტში არის 9 context, რომლებიც მართავენ სხვადასხვა domain-ს.

---

## Contexts Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CZABA Store Contexts                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    AUDIO LAYER (3 contexts)                      │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │    │
│  │  │ AudioContext│  │StemsContext │  │    StudioContext        │  │    │
│  │  │ (Preview)   │  │ (Modal)     │  │    (Full DAW)           │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    AUTH & USER LAYER (3 contexts)                │    │
│  │  ┌─────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │    │
│  │  │ AuthContext │  │PurchasesContext │  │    CartContext      │  │    │
│  │  │ (Login)     │  │ (Ownership)     │  │    (Shopping)       │  │    │
│  │  └─────────────┘  └─────────────────┘  └─────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    UI LAYER (3 contexts)                         │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │    │
│  │  │FiltersContext│ │ToastContext │  │      ChatContext        │  │    │
│  │  │(Store filters)│ │(Notifications)│ │    (Support Chat)       │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Context-ების სრული სია

| Context | ფაილი | დანიშნულება | Hook |
|---------|-------|-------------|------|
| **AudioContext** | `contexts/AudioContext.tsx` | მარტივი audio preview | `useAudio()` |
| **StemsContext** | `contexts/StemsContext.tsx` | Stems preview modal | `useStems()` |
| **StudioContext** | `contexts/StudioContext.tsx` | Full DAW functionality | `useStudio()` |
| **AuthContext** | `contexts/AuthContext.tsx` | User authentication | `useAuth()` |
| **PurchasesContext** | `contexts/PurchasesContext.tsx` | Owned products tracking | `usePurchases()` |
| **CartContext** | `contexts/CartContext.tsx` | Shopping cart | `useCart()` |
| **FiltersContext** | `contexts/FiltersContext.tsx` | Store page filters | `useFilters()` |
| **ToastContext** | `contexts/ToastContext.tsx` | Toast notifications | `useToast()` |
| **ChatContext** | `contexts/ChatContext.tsx` | Support Chat + SignalR | `useChat()` |

---

## Audio Layer

### 1. AudioContext (Simple Preview)

**დანიშნულება:** Sticky Player - მარტივი აუდიო preview საიტზე ნავიგაციის დროს.

**State:**
```typescript
interface AudioState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;          // 0-1
  currentTime: number;     // seconds
  duration: number;
  queue: Track[];
  queueIndex: number;
}
```

**მთავარი მეთოდები:**
- `play(track)` - ტრეკის დაკვრა
- `pause()` / `resume()` / `togglePlayPause()`
- `seek(time)` - გადახტომა
- `setVolume(volume)`
- `addToQueue(track)` / `skipNext()` / `skipPrevious()`
- `closePlayer()` - Player-ის დახურვა

**გამოყენება:**
```typescript
import { useAudio } from '~/hooks/useAudio';

function PlayButton({ track }) {
  const { play, state } = useAudio();
  const isPlaying = state.currentTrack?.id === track.id && state.isPlaying;

  return <button onClick={() => play(track)}>{isPlaying ? 'Pause' : 'Play'}</button>;
}
```

---

### 2. StemsContext (Multi-Stem Preview)

**დანიშნულება:** Stems-ების preview მოდალში - მომხმარებელს შეუძლია მოისმინოს ცალკეული stems ყიდვამდე.

**State:**
```typescript
interface StemsPlayerState {
  currentTrack: Track | null;
  stems: StemState[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  allLoaded: boolean;
}
```

**მთავარი მეთოდები:**
- `openStemsPlayer(track)` - მოდალის გახსნა
- `closeStemsPlayer()` - მოდალის დახურვა
- `togglePlayPause()`
- `toggleMute(stemId)` / `toggleSolo(stemId)`
- `seek(time)`

**გამოყენება:**
```typescript
import { useStems } from '~/hooks/useStems';

function StemsPreviewButton({ track }) {
  const { openStemsPlayer, isModalOpen } = useStems();

  return <button onClick={() => openStemsPlayer(track)}>Preview Stems</button>;
}
```

---

### 3. StudioContext (Full DAW)

**დანიშნულება:** სრული "Personal Mixdown Studio" - Ableton-ის მსგავსი ინტერფეისი.

**სრული დოკუმენტაცია:** [StudioContext.md](./StudioContext.md)

**State:**
```typescript
interface StudioState {
  productId: string | null;
  stems: StudioStemState[];
  isPlaying: boolean;
  currentTime: number;
  masterDuration: number;
  zoomLevel: number;
  loopRegion: LoopRegion;
  loopEnabled: boolean;
  selectedStemIds: Set<string>;
  // ... და სხვა
}
```

**მთავარი მეთოდები:**
- `loadProduct(product)` - პროდუქტის ჩატვირთვა
- `togglePlayPause()` / `seek(time)` / `stop()`
- `toggleMute(stemId)` / `toggleSolo(stemId, isMultiSelect)`
- `setVolume(stemId, volume)`
- `setLoopRegion(region)` / `toggleLoopEnabled()`
- `selectStem(stemId, mode)` / `selectAllStems()`
- `undo()` / `redo()`
- `exportAudio(config)`

---

## Auth & User Layer

### 4. AuthContext

**დანიშნულება:** მომხმარებლის ავტორიზაცია - Shopify + Firebase hybrid.

**State:**
```typescript
interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isInitializing: boolean;
  isModalOpen: boolean;
  modalView: AuthModalView;
  // methods...
}
```

**მთავარი მეთოდები:**
- `signIn(email, password)` - Shopify login
- `signUp(name, email, password)` - Shopify registration
- `signInWithGoogle()` - Firebase OAuth → Shopify sync
- `signOut()` - logout
- `openModal(view)` / `closeModal()`

**გამოყენება:**
```typescript
import { useAuth } from '~/hooks/useAuth';

function Header() {
  const { user, openModal, signOut } = useAuth();

  return user ? (
    <button onClick={signOut}>Sign Out</button>
  ) : (
    <button onClick={() => openModal('signin')}>Sign In</button>
  );
}
```

**დეტალური დოკუმენტაცია:** [auth-system.md](./auth-system.md)

---

### 5. PurchasesContext

**დანიშნულება:** ნაყიდი პროდუქტების tracking - "Owned" status, Studio წვდომა.

**State:**
```typescript
interface PurchasesContextValue {
  purchasedProductIds: string[];
  purchasedProducts: PurchasedProduct[];
  isLoading: boolean;
  // methods...
}
```

**მთავარი მეთოდები:**
- `isProductOwned(productId)` - ID-ით შემოწმება
- `isProductOwnedByHandle(handle)` - handle-ით შემოწმება
- `getProductVersionType(handle)` - 'premium' | 'standard' | null
- `refreshPurchases()` - ხელახლა ჩატვირთვა

**გამოყენება:**
```typescript
import { usePurchases } from '~/hooks/usePurchases';

function ProductCard({ product }) {
  const { isProductOwnedByHandle, getProductVersionType } = usePurchases();

  const isOwned = isProductOwnedByHandle(product.handle);
  const versionType = getProductVersionType(product.handle);

  return (
    <div>
      {isOwned && <span>Owned ({versionType})</span>}
      {isOwned && versionType === 'premium' && (
        <a href={`/studio/${product.handle}`}>Open Studio</a>
      )}
    </div>
  );
}
```

---

### 6. CartContext

**დანიშნულება:** Shopping cart - Backend API-თან კომუნიკაცია.

**State:**
```typescript
interface CartContextValue {
  cart: Cart | null;
  isLoading: boolean;
  isAddingToCart: boolean;
  isRemovingFromCart: boolean;
  isBuyingNow: boolean;
  // methods...
}
```

**მთავარი მეთოდები:**
- `addToCart(productId, productHandle)` - კალათაში დამატება
- `removeFromCart(itemId)` - კალათიდან წაშლა
- `isInCart(productId)` - შემოწმება (by ID)
- `isProductInCart(productHandle)` - შემოწმება (by handle)
- `checkout()` - Shopify checkout-ზე გადასვლა
- `buyNow(productId)` - პირდაპირ checkout

**გამოყენება:**
```typescript
import { useCart } from '~/hooks/useCart';

function AddToCartButton({ product }) {
  const { addToCart, isInCart, isAddingToCart } = useCart();

  const alreadyInCart = isInCart(product.id);

  return (
    <button
      onClick={() => addToCart(product.id, product.handle)}
      disabled={alreadyInCart || isAddingToCart}
    >
      {alreadyInCart ? 'In Cart' : 'Add to Cart'}
    </button>
  );
}
```

---

## UI Layer

### 7. FiltersContext

**დანიშნულება:** Store page ფილტრები - genre, mood, tempo, price range.

**State:**
```typescript
interface FiltersState {
  genres: string[];
  moods: string[];
  tempo: { min: number; max: number } | null;
  priceRange: { min: number; max: number } | null;
  sortBy: SortOption;
  searchQuery: string;
}
```

**მთავარი მეთოდები:**
- `setGenres(genres)` / `toggleGenre(genre)`
- `setMoods(moods)` / `toggleMood(mood)`
- `setTempo(range)` / `setPriceRange(range)`
- `setSortBy(option)`
- `setSearchQuery(query)`
- `clearAllFilters()`

---

### 8. ToastContext

**დანიშნულება:** Toast შეტყობინებები - success, error, info.

**State:**
```typescript
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}
```

**მთავარი მეთოდები:**
- `toast(message, type, duration)` - toast-ის ჩვენება
- `success(message)` - success toast
- `error(message)` - error toast
- `dismiss(id)` - toast-ის დახურვა

**გამოყენება:**
```typescript
import { useToast } from '~/hooks/useToast';

function SomeComponent() {
  const { success, error } = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      success('Saved successfully!');
    } catch (e) {
      error('Failed to save');
    }
  };
}
```

---

### 9. ChatContext (Support Chat)

**დანიშნულება:** Live Support Chat - SignalR real-time messaging.

**სრული დოკუმენტაცია:** [chat-system.md](../features/chat-system.md)

**State:**
```typescript
interface ChatState {
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  session: ChatSession | null;
  messages: ChatMessage[];
  isTyping: boolean;          // ადმინი წერს?
  isAdminOnline: boolean;
  error: string | null;
}
```

**მთავარი მეთოდები:**
- `startSession(guestInfo?)` - ჩათის დაწყება
- `sendMessage(text)` - შეტყობინების გაგზავნა
- `startTyping()` / `stopTyping()` - Typing indicators
- `closeSession()` - ჩათის დახურვა
- `clearError()` - შეცდომის გასუფთავება

**გამოყენება:**
```typescript
import { useChat } from '~/hooks/useChat';

function ChatWidget() {
  const { messages, isTyping, sendMessage, startSession } = useChat();

  return (
    <div>
      {messages.map(msg => <Message key={msg.id} {...msg} />)}
      {isTyping && <span>Operator is typing...</span>}
    </div>
  );
}
```

---

## Provider Hierarchy

`app/root.tsx`-ში providers ასე არის დალაგებული:

```tsx
<AuthProvider>
  <PurchasesProvider>
    <CartProvider onToast={toast}>
      <ToastProvider>
        <ChatProvider>
          <AudioProvider>
            <StemsProvider>
              <FiltersProvider>
                {/* App content */}
              </FiltersProvider>
            </StemsProvider>
          </AudioProvider>
        </ChatProvider>
      </ToastProvider>
    </CartProvider>
  </PurchasesProvider>
</AuthProvider>
```

**რატომ ეს თანმიმდევრობა?**

1. **AuthProvider** პირველია - ყველა სხვა context-ს შეიძლება დასჭირდეს user
2. **PurchasesProvider** AuthProvider-ის შემდეგ - user-ზეა დამოკიდებული
3. **CartProvider** - შეიძლება დასჭირდეს Toast
4. **ToastProvider** - UI notifications
5. **ChatProvider** - AuthProvider-ზეა დამოკიდებული (user info)
6. **AudioProvider** - global audio playback
7. **StemsProvider** - modal audio preview
8. **FiltersProvider** - store page specific

**შენიშვნა:** StudioContext არ არის root-ში - ის მხოლოდ Studio გვერდზე იტვირთება.

---

## Context-ების ურთიერთკავშირი

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  AuthContext ◄────────────────── PurchasesContext                   │
│      │                                │                              │
│      │ user state                     │ ownership check              │
│      │                                │                              │
│      ▼                                ▼                              │
│  ┌──────────┐                   ┌───────────────┐                   │
│  │CartContext│                   │ ProductPages  │                   │
│  └──────────┘                   └───────────────┘                   │
│      │                                │                              │
│      │ session ID                     │ audio preview                │
│      │                                │                              │
│      ▼                                ▼                              │
│  Backend API                    ┌──────────────┐                    │
│                                 │ AudioContext │                    │
│                                 │ StemsContext │                    │
│                                 └──────────────┘                    │
│                                        │                             │
│                                        │ if owned + premium          │
│                                        │                             │
│                                        ▼                             │
│                                 ┌──────────────┐                    │
│                                 │StudioContext │                    │
│                                 └──────────────┘                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Best Practices

### 1. useCallback Dependencies

```typescript
// სწორი - setState(prev => ...) pattern
const togglePlayPause = useCallback(() => {
  setState(prev => {
    if (prev.isPlaying) { /* pause */ }
    else { /* play */ }
  });
}, []); // ცარიელი dependencies!

// არასწორი - stale closure
const togglePlayPause = useCallback(() => {
  if (state.isPlaying) { /* stale! */ }
}, [state]); // ყოველ state ცვლილებაზე ხელახლა შეიქმნება
```

### 2. Derived State

```typescript
// სწორი - გამოთვლა render-ზე
function Component() {
  const { state } = useStudio();
  const anySoloed = state.stems.some(s => s.isSoloed);
  // ...
}

// არასწორი - state-ში დუბლირება
// anySoloed არ უნდა იყოს state-ში!
```

### 3. Context Splitting

```typescript
// სწორი - ცალკე contexts სხვადასხვა domain-ისთვის
<AuthProvider>
  <CartProvider>
    <AudioProvider>
      ...
    </AudioProvider>
  </CartProvider>
</AuthProvider>

// არასწორი - ერთი გიგანტური context
<EverythingProvider>
  ...
</EverythingProvider>
```

---

## რატომ Context და არა Redux/Zustand?

| თვისება | Context API | Redux/Zustand |
|---------|-------------|---------------|
| **სირთულე** | მარტივი | რთული |
| **Boilerplate** | მინიმალური | ბევრი |
| **DevTools** | არა | დიახ |
| **Time-travel debugging** | არა | დიახ |
| **Performance** | საკმარისი | ოპტიმალური |
| **Learning curve** | დაბალი | საშუალო |

**რატომ Context?**

1. **პროექტის ზომა** - საშუალო, Redux overhead არ ღირს
2. **Remix integration** - Context კარგად მუშაობს loaders-თან
3. **სიმარტივე** - გუნდის ნებისმიერ წევრს შეუძლია გაიგოს
4. **Performance** - დომენებად დაყოფილი contexts საკმარისია

---

## დაკავშირებული დოკუმენტაცია

- [audio-system.md](./audio-system.md) - 3-დონიანი აუდიო არქიტექტურა
- [StudioContext.md](./StudioContext.md) - დეტალური StudioContext
- [auth-system.md](./auth-system.md) - ავტორიზაციის სისტემა
- [cart-system.md](../features/cart-system.md) - კალათის სისტემა
- [chat-system.md](../features/chat-system.md) - Support Chat სისტემა

---

## ბოლო განახლება

2026-01-29 - ChatContext დამატება (9 contexts)

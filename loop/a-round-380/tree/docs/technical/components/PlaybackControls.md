# PlaybackControls Component - დეტალური ტექნიკური აღწერა

## მდებარეობა

`app/components/studio/PlaybackControls.tsx`

## კონცეფცია

PlaybackControls არის მარტივი კომპონენტი რომელიც აჩვენებს:
- Stop ღილაკი
- Play/Pause ღილაკი (მთავარი)
- დროის ჩვენება (current / total)

---

## Imports და Context

```typescript
import { useStudio } from '~/contexts/StudioContext';

const { state, togglePlayPause, stop } = useStudio();
```

| Import | მიზეზი |
|--------|--------|
| `state` | isPlaying, currentTime, masterDuration, allLoaded |
| `togglePlayPause` | Play/Pause toggle ფუნქცია |
| `stop` | Stop ფუნქცია (cursor 0-ზე) |

---

## Helper ფუნქცია

### formatTime

```typescript
const formatTime = (seconds: number) => {
  if (!isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
```

**გამოყენება:** `formatTime(125)` → `"2:05"`

---

## UI ელემენტები

### Stop ღილაკი

```tsx
<button
  onClick={stop}
  disabled={isDisabled || !state.isPlaying}
  className={`... ${
    isDisabled || !state.isPlaying
      ? 'text-neutral-600 cursor-not-allowed opacity-40'
      : 'text-neutral-300 hover:bg-white/10 hover:text-teal-500'
  }`}
>
  <svg>
    <rect x="6" y="6" width="12" height="12" rx="1" />
  </svg>
</button>
```

**პირობა:** Stop გამორთულია თუ:
- აუდიო არ არის ჩატვირთული (`!state.allLoaded`)
- არ უკრავს (`!state.isPlaying`)

### Play/Pause ღილაკი

```tsx
<button
  onClick={togglePlayPause}
  disabled={isDisabled}
  className={`w-10 h-10 rounded-full ${
    isDisabled
      ? 'bg-neutral-700 text-neutral-500 opacity-50'
      : 'bg-teal-500 text-white hover:bg-teal-600 hover:scale-105'
  }`}
>
  {state.isPlaying ? (
    // Pause icon
    <svg><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
  ) : (
    // Play icon
    <svg><path d="M8 5v14l11-7z" /></svg>
  )}
</button>
```

**სტილი:**
- Teal ფონი, თეთრი icon
- Hover-ზე scale-up ეფექტი
- Disabled მდგომარეობაში ნაცრისფერი

### დროის ჩვენება

```tsx
<div className="flex items-center gap-2">
  <span className="text-neutral-300 font-mono">
    {formatTime(state.currentTime)}
  </span>
  <span className="text-neutral-600">/</span>
  <span className="text-neutral-500 font-mono">
    {formatTime(state.masterDuration)}
  </span>
</div>
```

**ფორმატი:** `1:23 / 4:56`

---

## სტილების რეფერენსი

| ელემენტი | მდგომარეობა | სტილი |
|----------|-------------|-------|
| Play/Pause | Active | `bg-teal-500 text-white` |
| Play/Pause | Disabled | `bg-neutral-700 opacity-50` |
| Play/Pause | Hover | `hover:scale-105` |
| Stop | Active | `text-neutral-300 hover:text-teal-500` |
| Stop | Disabled | `text-neutral-600 opacity-40` |
| Current Time | - | `text-neutral-300 font-mono` |
| Total Time | - | `text-neutral-500 font-mono` |

---

## Keyboard Shortcuts (StudioContext-ში)

| კლავიში | მოქმედება |
|---------|-----------|
| `Space` | togglePlayPause() |
| `Enter` | stop() |

---

## ბოლო განახლება

2025-12-27 - საწყისი დოკუმენტაცია

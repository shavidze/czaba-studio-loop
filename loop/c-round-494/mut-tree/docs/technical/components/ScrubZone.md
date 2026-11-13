# ScrubZone Component - ტექნიკური აღწერა

## მდებარეობა

`app/components/studio/ScrubZone.tsx`

## კონცეფცია

ScrubZone არის scrub area Video Sync-სა და Tracks-ს შორის. მომხმარებელს შეუძლია:
- **Click** - seek იმ პოზიციაზე
- **Drag** - playhead-ის გადატანა (scrubbing)

ეს area უზრუნველყოფს playhead-ის მოხერხებულ კონტროლს video-სა და tracks-ს შორის.

---

## Layout პოზიცია

```
┌─────────────────────────────────────────┐
│           STICKY HEADER                  │
│   (PlaybackControls + TransportBar)      │
├─────────────────────────────────────────┤
│           VIDEO SYNC SECTION             │
│   (VideoPlayer / VideoUploadZone)        │
├─────────────────────────────────────────┤
│           SCRUB ZONE  ◀── ეს კომპონენტი │
│   [Scrub] ─────────●─────────────────    │
├─────────────────────────────────────────┤
│           TRACKS AREA                    │
│   (GlobalPlayhead + StudioTrackList)     │
└─────────────────────────────────────────┘
```

---

## Props

კომპონენტს არ აქვს props - ყველაფერს იღებს `useStudio()` context-იდან.

---

## Context-დან მიღებული მნიშვნელობები

```typescript
const { state, seek } = useStudio();
```

| Value | მიზეზი |
|-------|--------|
| `state.allLoaded` | ყველა stem ჩატვირთულია? |
| `state.masterDuration` | მთლიანი ხანგრძლივობა |
| `state.currentTime` | მიმდინარე playhead პოზიცია |
| `seek` | (time) => void - playhead-ის გადატანა |

---

## Refs და State

```typescript
const zoneRef = useRef<HTMLDivElement>(null);
const [isDragging, setIsDragging] = useState(false);
```

| Variable | მიზეზი |
|----------|--------|
| `zoneRef` | Container element - mouse position-ის გასაანგარიშებლად |
| `isDragging` | Drag მიმდინარეობს? - global listeners-ისთვის |

---

## Helper ფუნქცია

### getTimeFromMouseX

```typescript
const getTimeFromMouseX = (clientX: number): number => {
  if (!zoneRef.current) return 0;

  const rect = zoneRef.current.getBoundingClientRect();
  const leftPanelWidth = 224;  // w-56 = 224px

  // Mouse X - container left - left panel width
  const x = clientX - rect.left - leftPanelWidth;
  const availableWidth = rect.width - leftPanelWidth;

  // Clamp to 0-1 range
  const percentage = Math.max(0, Math.min(1, x / availableWidth));

  return percentage * state.masterDuration;
};
```

**მნიშვნელოვანი:** Left panel (224px) გათვალისწინებულია, რადგან scrub area-ს მარცხენა ნაწილი არ არის interactive.

---

## Event Handlers

### handleMouseDown

```typescript
const handleMouseDown = (e: React.MouseEvent) => {
  if (!state.allLoaded) return;
  e.preventDefault();

  // 1. პირველივე click-ზე seek
  const time = getTimeFromMouseX(e.clientX);
  seek(time);

  // 2. Drag mode ჩართვა
  setIsDragging(true);
};
```

### Drag useEffect

```typescript
useEffect(() => {
  if (!isDragging) return;

  const handleMouseMove = (e: MouseEvent) => {
    const time = getTimeFromMouseX(e.clientX);
    seek(time);  // Real-time scrubbing
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);

  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };
}, [isDragging, state.masterDuration, seek]);
```

**რატომ global listeners?**

Mouse შეიძლება გავიდეს კომპონენტის საზღვრებს გარეთ drag-ის დროს. Global listeners უზრუნველყოფს smooth scrubbing-ს.

---

## JSX სტრუქტურა

```tsx
<div
  ref={zoneRef}
  className={`relative h-6 bg-neutral-900/50 border-b border-neutral-800 flex items-stretch ${
    state.allLoaded ? 'cursor-ew-resize' : 'cursor-not-allowed'
  } ${isDragging ? 'bg-neutral-800/50' : 'hover:bg-neutral-800/30'}`}
  onMouseDown={handleMouseDown}
>
  {/* Left panel spacer (224px) */}
  <div className="w-56 bg-neutral-900 border-r border-neutral-800 flex items-center px-3">
    <span className="text-[10px] text-neutral-500 font-mono">Scrub</span>
  </div>

  {/* Scrub area */}
  <div className="flex-1 relative">
    {/* Subtle grid lines (10% intervals) */}
    <div className="absolute inset-0 opacity-20">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 w-px bg-neutral-700"
          style={{ left: `${(i + 1) * 10}%` }}
        />
      ))}
    </div>

    {/* Current position indicator */}
    <div
      className="absolute top-0 bottom-0 w-0.5 bg-teal-500 pointer-events-none z-10"
      style={{ left: `${playheadPercent}%` }}
    />

    {/* Drag hint */}
    {!isDragging && (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-[10px] text-neutral-600">Drag to scrub</span>
      </div>
    )}
  </div>
</div>
```

---

## სტილების რეფერენსი

| მდგომარეობა | CSS Classes |
|-------------|-------------|
| Normal | `bg-neutral-900/50 cursor-ew-resize` |
| Dragging | `bg-neutral-800/50` |
| Hover | `hover:bg-neutral-800/30` |
| Disabled | `cursor-not-allowed` |
| Position indicator | `bg-teal-500 w-0.5` |

---

## ვიზუალური ელემენტები

1. **Left Panel** - "Scrub" label, მატჩავს track controls-ის სიგანეს
2. **Grid Lines** - 10% ინტერვალებით, subtle ვიზუალური guide
3. **Position Indicator** - teal ვერტიკალური ხაზი, აჩვენებს მიმდინარე პოზიციას
4. **Hint Text** - "Drag to scrub" - ქრება drag-ის დროს

---

## Conditional Rendering

```typescript
if (!state.allLoaded) return null;
```

ScrubZone არ ჩანს სანამ stems არ ჩაიტვირთება. ეს თავიდან იცილებს broken state-ს.

---

## ბოლო განახლება

2026-01-08 - კომპონენტი შექმნილია

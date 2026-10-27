# TransportBar Component - დეტალური ტექნიკური აღწერა

## მდებარეობა

`app/components/studio/TransportBar.tsx`

## კონცეფცია

TransportBar არის Ableton Live-ის სტილის რულერი/თაიმლაინი. ეს კომპონენტი მოიცავს:
- დროის ჩვენება (current time / total duration)
- Zoom კონტროლი (+/- ღილაკები)
- Loop Switch (ლუპის ჩართვა/გამორთვა)
- **Loop Zone** - ზედა ნაწილი (12px), ლუპის შექმნა/წაშლა
- **Seek Zone** - ქვედა ნაწილი, click-to-seek

---

## Layout სტრუქტურა

```
┌──────────────────────┬─────────────────────────────────────────┐
│  Time: 00:15:230     │  LOOP ZONE (h-3 = 12px)                 │
│  Zoom: 100% [-][+]   │  [======= Loop Brace =======]           │
│  Loop: [🔁]          ├─────────────────────────────────────────┤
│                      │  SEEK ZONE (remaining height)            │
│  (w-56 = 224px)      │  |  0:00  |  0:05  |  0:10  |  0:15  |  │
└──────────────────────┴─────────────────────────────────────────┘
```

**რატომ ორი ზონა?**

Ableton Live-ში ruler-ს აქვს მსგავსი დაყოფა:
- Loop Zone - მხოლოდ ლუპთან სამუშაოდ (clear UX)
- Seek Zone - მხოლოდ cursor-თან სამუშაოდ

ეს თავიდან აგვაცილებს კონფლიქტებს: "click-მა ლუპი უნდა შექმნას თუ cursor გადაიტანოს?"

---

## State Management

### Local State (useState)

```typescript
// Loop Zone-ის drag state
const [isLoopZoneDragging, setIsLoopZoneDragging] = useState(false);
const [loopZoneDragStart, setLoopZoneDragStart] = useState<number | null>(null);
const [loopZoneDragEnd, setLoopZoneDragEnd] = useState<number | null>(null);

// Loop Brace manipulation state
const [loopDragType, setLoopDragType] = useState<'start' | 'end' | 'body' | null>(null);
```

**რატომ ამდენი state?**

თითოეული drag ოპერაცია საჭიროებს:
1. **isDragging** - ვდრაგავთ თუ არა (boolean)
2. **dragStart** - საიდან დავიწყეთ (წამებში)
3. **dragEnd** - სად გავაჩერეთ (წამებში, რეალურ დროში ახლდება)

### Refs

```typescript
const timelineRef = useRef<HTMLDivElement>(null);
const dragStartXRef = useRef<number>(0);
const loopDragStartRef = useRef<{
  time: number;
  loopStart: number;
  loopEnd: number
}>({ time: 0, loopStart: 0, loopEnd: 0 });
```

**რატომ `useRef`?**

1. **`timelineRef`** - DOM element-ზე წვდომა `getBoundingClientRect()`-ისთვის
2. **`dragStartXRef`** - drag-ის საწყისი X პოზიცია (pixels). ეს საჭიროა click vs drag-ის განსასხვავებლად
3. **`loopDragStartRef`** - Loop Brace-ის drag-ის საწყისი მნიშვნელობები

**რატომ ref და არა state?**
- ref-ის ცვლილება არ იწვევს re-render-ს
- drag handler-ებში გვჭირდება სინქრონული, მყისიერი წვდომა

---

## Context-დან მიღებული მნიშვნელობები

```typescript
const {
  state,              // მთლიანი Studio state (currentTime, masterDuration, allLoaded)
  seek,               // cursor-ის გადატანის ფუნქცია
  zoomLevel,          // მიმდინარე zoom level (0.5 - 4)
  setZoomLevel,       // zoom-ის შეცვლა
  loopRegion,         // { start: number, end: number }
  loopEnabled,        // boolean - ლუპი ჩართულია?
  setLoopRegion,      // ლუპის რეგიონის დაყენება
  setLoopEnabled,     // ლუპის ჩართვა/გამორთვა
  toggleLoopEnabled   // ლუპის toggle
} = useStudio();
```

---

## Helper ფუნქციები

### createLoopAndSeek

```typescript
const createLoopAndSeek = (start: number, end: number) => {
  setLoopRegion({ start, end });  // ლუპის რეგიონის დაყენება
  setLoopEnabled(true);            // ლუპის ჩართვა
  seek(start);                     // cursor-ის გადატანა ლუპის დასაწყისზე
};
```

**რატომ `seek(start)`?**

Ableton-ში ლუპის შექმნისას cursor ავტომატურად გადადის ლუპის დასაწყისზე. ეს ინტუიციურია - შექმენი ლუპი და მაშინვე მოუსმინე.

### getTimeFromMouseEvent

```typescript
const getTimeFromMouseEvent = (e: MouseEvent | React.MouseEvent, rect?: DOMRect): number => {
  // 1. ვიღებთ timeline element-ის bounds-ს
  const r = rect || timelineRef.current?.getBoundingClientRect();
  if (!r) return 0;

  // 2. ვითვლით mouse-ის X პოზიციას timeline-ის შიგნით
  const x = e.clientX - r.left;

  // 3. ვაკონვერტირებთ პროცენტულ მნიშვნელობაში (0-1 range)
  const percentage = Math.max(0, Math.min(1, x / r.width));

  // 4. ვაბრუნებთ დროს წამებში
  return percentage * state.masterDuration;
};
```

**Math.max(0, Math.min(1, ...))** - ეს არის "clamping" pattern. უზრუნველყოფს რომ მნიშვნელობა არასოდეს გავიდეს 0-1 დიაპაზონიდან.

### formatTime

```typescript
const formatTime = (seconds: number): string => {
  // Edge case: infinity ან NaN-ის შემოწმება
  if (!isFinite(seconds)) return '00:00:000';

  const mins = Math.floor(seconds / 60);           // წუთები
  const secs = Math.floor(seconds % 60);           // წამები (0-59)
  const ms = Math.floor((seconds % 1) * 1000);     // მილიწამები

  // padStart - ავსებს ნულებით მარცხნიდან
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(3, '0')}`;
};
```

**გამოყენება:** `formatTime(15.5)` → `"00:15:500"`

---

## Seek Zone Event Handler

### handleSeekZoneClick

Seek Zone გამარტივდა - მხოლოდ click-to-seek ფუნქციონალი:

```typescript
const handleSeekZoneClick = (e: React.MouseEvent<HTMLDivElement>) => {
  if (!state.allLoaded || !timelineRef.current) return;

  const rect = timelineRef.current.getBoundingClientRect();
  const clickTime = getTimeFromMouseEvent(e, rect);
  seek(clickTime);
};
```

**შენიშვნა:** წინა ვერსიაში იყო drag-to-zoom ფუნქციონალი, რომელიც მოიხსნა სიმარტივისთვის.

---

## Loop Zone Event Handlers

### handleLoopZoneMouseDown

```typescript
const handleLoopZoneMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
  if (!state.allLoaded || !timelineRef.current) return;

  const rect = timelineRef.current.getBoundingClientRect();
  const startTime = getTimeFromMouseEvent(e, rect);

  dragStartXRef.current = e.clientX;
  setIsLoopZoneDragging(true);
  setLoopZoneDragStart(startTime);
  setLoopZoneDragEnd(startTime);
};
```

### handleLoopZoneMouseMove

```typescript
const handleLoopZoneMouseMove = (e: MouseEvent) => {
  if (!isLoopZoneDragging || !timelineRef.current || !state.allLoaded) return;

  const rect = timelineRef.current.getBoundingClientRect();
  const currentTime = getTimeFromMouseEvent(e, rect);

  // უბრალოდ ვანახლებთ end position-ს
  setLoopZoneDragEnd(currentTime);
};
```

### handleLoopZoneMouseUp

```typescript
const handleLoopZoneMouseUp = (e: MouseEvent) => {
  if (!timelineRef.current) {
    // Cleanup
    setIsLoopZoneDragging(false);
    setLoopZoneDragStart(null);
    setLoopZoneDragEnd(null);
    return;
  }

  const dragDistance = Math.abs(e.clientX - dragStartXRef.current);

  if (dragDistance > 10 && loopZoneDragStart !== null && loopZoneDragEnd !== null) {
    // ============ DRAG = CREATE LOOP ============
    const startTime = Math.min(loopZoneDragStart, loopZoneDragEnd);
    const endTime = Math.max(loopZoneDragStart, loopZoneDragEnd);

    // მინიმუმ 0.2 წამის ლუპი
    if (endTime - startTime > 0.2) {
      createLoopAndSeek(startTime, endTime);
    }
  } else {
    // ============ CLICK = CLEAR LOOP ============
    setLoopRegion({ start: 0, end: 0 });
    // შენიშვნა: loopEnabled არ ვცვლით! Switch რჩება თავის მდგომარეობაში
  }

  // Cleanup
  setIsLoopZoneDragging(false);
  setLoopZoneDragStart(null);
  setLoopZoneDragEnd(null);
};
```

---

## Loop Brace Handlers (Ableton-style)

Loop Brace არის უკვე შექმნილი ლუპის ვიზუალური წარმოდგენა. მას აქვს 3 draggable ნაწილი:
- **start** - მარცხენა კიდე
- **end** - მარჯვენა კიდე
- **body** - შუა ნაწილი (მთლიანი გადაადგილება)

### handleLoopBraceMouseDown

```typescript
const handleLoopBraceMouseDown = (e: React.MouseEvent, type: 'start' | 'end' | 'body') => {
  e.stopPropagation(); // მნიშვნელოვანი! თავიდან ავიცილოთ Loop Zone handler-ის გააქტიურება

  if (!state.allLoaded || !timelineRef.current) return;

  const rect = timelineRef.current.getBoundingClientRect();
  const time = getTimeFromMouseEvent(e, rect);

  setLoopDragType(type);  // რომელ ნაწილს ვდრაგავთ

  // ვინახავთ საწყის მნიშვნელობებს
  loopDragStartRef.current = {
    time,                           // drag-ის საწყისი დრო
    loopStart: loopRegion.start,   // ლუპის საწყისი დრო
    loopEnd: loopRegion.end,       // ლუპის დასასრულის დრო
  };
};
```

**რატომ `e.stopPropagation()`?**

Loop Brace არის Loop Zone-ის შვილი element. stopPropagation-ის გარეშე, click-ი გაივლიდა Loop Zone-ის handler-ზეც და ლუპი წაიშლებოდა.

### Loop Brace Mouse Move (useEffect-ში)

```typescript
useEffect(() => {
  if (!loopDragType || !timelineRef.current) return;

  const handleLoopMouseMove = (e: MouseEvent) => {
    const rect = timelineRef.current!.getBoundingClientRect();
    const currentTime = getTimeFromMouseEvent(e, rect);

    // delta = რამდენით გადაადგილდა საწყისი პოზიციიდან
    const delta = currentTime - loopDragStartRef.current.time;

    if (loopDragType === 'start') {
      // ====== START HANDLE DRAG ======
      // ახალი start = ძველი start + delta
      // მინიმუმ 0, მაქსიმუმ end - 0.5 (ლუპი მინიმუმ 0.5 წამი)
      const newStart = Math.max(0, Math.min(
        loopDragStartRef.current.loopStart + delta,
        loopRegion.end - 0.5
      ));
      setLoopRegion({ start: newStart, end: loopRegion.end });

    } else if (loopDragType === 'end') {
      // ====== END HANDLE DRAG ======
      const newEnd = Math.max(
        loopRegion.start + 0.5,  // მინიმუმ start + 0.5
        Math.min(loopDragStartRef.current.loopEnd + delta, state.masterDuration)
      );
      setLoopRegion({ start: loopRegion.start, end: newEnd });

    } else if (loopDragType === 'body') {
      // ====== BODY DRAG (მთლიანი გადატანა) ======
      const loopDuration = loopDragStartRef.current.loopEnd - loopDragStartRef.current.loopStart;
      let newStart = loopDragStartRef.current.loopStart + delta;
      let newEnd = loopDragStartRef.current.loopEnd + delta;

      // Bounds clamping
      if (newStart < 0) {
        newStart = 0;
        newEnd = loopDuration;  // duration იგივე რჩება
      }
      if (newEnd > state.masterDuration) {
        newEnd = state.masterDuration;
        newStart = state.masterDuration - loopDuration;
      }

      setLoopRegion({ start: newStart, end: newEnd });
    }
  };

  const handleLoopMouseUp = () => {
    setLoopDragType(null);  // Cleanup
  };

  // ====== GLOBAL LISTENERS ======
  window.addEventListener('mousemove', handleLoopMouseMove);
  window.addEventListener('mouseup', handleLoopMouseUp);

  return () => {
    window.removeEventListener('mousemove', handleLoopMouseMove);
    window.removeEventListener('mouseup', handleLoopMouseUp);
  };
}, [loopDragType, loopRegion, state.masterDuration, setLoopRegion]);
```

---

## Global Event Listeners Pattern

### რატომ `window.addEventListener`?

```typescript
useEffect(() => {
  if (isLoopZoneDragging) {
    window.addEventListener('mousemove', handleLoopZoneMouseMove);
    window.addEventListener('mouseup', handleLoopZoneMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleLoopZoneMouseMove);
      window.removeEventListener('mouseup', handleLoopZoneMouseUp);
    };
  }
}, [isLoopZoneDragging, ...]);
```

**პრობლემა:** თუ `onMouseMove` და `onMouseUp` მხოლოდ element-ზეა, და მომხმარებელი drag-ის დროს გავიდა element-ის გარეთ (სწრაფი მოძრაობა), events აღარ ემართება.

**გადაწყვეტა:** `window`-ზე ვდებთ listeners-ს, რომ ყველგან "დაიჭიროს" mouse events.

### Cleanup Pattern

```typescript
return () => {
  window.removeEventListener('mousemove', handler);
  window.removeEventListener('mouseup', handler);
};
```

**რატომ cleanup?**

1. Memory leak prevention - listeners რჩება მეხსიერებაში
2. Stale handler prevention - ძველი handler-ებს შეიძლება ჰქონდეს stale closure values

---

## Zoom Controls

### handleZoomIn / handleZoomOut

```typescript
const handleZoomIn = () => {
  setZoomLevel(Math.min((zoomLevel || 1) + 0.5, 4)); // Max 400%
};

const handleZoomOut = () => {
  setZoomLevel(Math.max((zoomLevel || 1) - 0.5, 0.5)); // Min 50%
};
```

**Zoom Range:** 50% - 400%
**Step:** 50% (0.5)

### getTimeInterval

```typescript
const getTimeInterval = () => {
  const zoom = zoomLevel || 1;
  if (zoom >= 3) return 1;   // 300%+ → marker ყოველ 1 წამში
  if (zoom >= 2) return 2;   // 200%+ → marker ყოველ 2 წამში
  if (zoom >= 1) return 5;   // 100%+ → marker ყოველ 5 წამში
  return 10;                  // <100% → marker ყოველ 10 წამში
};
```

**რატომ adaptive interval?**

რომ marker-ები არ იყოს ძალიან ხშირი ან იშვიათი. Zoom-ის გადიდებით მეტი დეტალი ჩანს, ამიტომ მეტი marker გვჭირდება.

---

## JSX სტრუქტურა

### მთავარი Container

```tsx
<div className="flex items-stretch">
  {/* Left Panel */}
  <div className="w-56 ...">
    {/* Time, Zoom, Loop Switch */}
  </div>

  {/* Right Panel - Timeline */}
  <div className="flex-1 relative overflow-x-hidden">
    <div ref={timelineRef} style={{ width: `${zoomLevel * 100}%` }}>
      {/* Loop Zone */}
      {/* Seek Zone */}
    </div>
  </div>
</div>
```

### Loop Zone

```tsx
<div
  className="absolute top-0 left-0 right-0 h-3 z-10 cursor-crosshair"
  onMouseDown={handleLoopZoneMouseDown}
>
  {/* Loop Creation Preview */}
  {isLoopZoneDragging && (
    <div className="bg-amber-500/40 border-x-2 border-amber-500" style={{...}} />
  )}

  {/* Loop Brace */}
  {loopRegion.end > loopRegion.start && (
    <div style={{ left: ..., width: ... }}>
      {/* Body (draggable) */}
      <div onMouseDown={(e) => handleLoopBraceMouseDown(e, 'body')} />
      {/* Start Handle */}
      <div onMouseDown={(e) => handleLoopBraceMouseDown(e, 'start')} />
      {/* End Handle */}
      <div onMouseDown={(e) => handleLoopBraceMouseDown(e, 'end')} />
    </div>
  )}
</div>
```

### Seek Zone

```tsx
<div
  className="absolute top-3 left-0 right-0 bottom-0 cursor-pointer"
  onClick={handleSeekZoneClick}
>
  {/* Time Markers */}
  {state.allLoaded && (
    <div>
      {Array.from({ length: ... }).map((_, i) => (
        <div style={{ left: `${position}%` }}>
          <div className="h-5 w-px bg-neutral-500" />  {/* Tick */}
          <span>00:00</span>  {/* Label */}
        </div>
      ))}
    </div>
  )}
</div>
```

---

## სტილების რეფერენსი

| Element | ფერი | შენიშვნა |
|---------|------|----------|
| Loop Brace (active) | `bg-amber-500` | ყვითელი |
| Loop Brace (inactive) | `bg-neutral-500 opacity-40` | ნაცრისფერი, გამჭვირვალე |
| Loop Creation Preview | `bg-amber-500/40` | ყვითელი, 40% opacity |
| Time Display | `text-teal-400` | ციანი |
| Loop Switch ON | `bg-amber-500 text-black` | ყვითელი ფონი |
| Loop Switch OFF | `bg-neutral-800 text-neutral-400` | მუქი ნაცრისფერი |

---

## z-index იერარქია

| Element | z-index | მიზეზი |
|---------|---------|--------|
| Loop Zone | z-10 | Seek Zone-ზე ზემოთ |
| Seek Zone | implicit (0) | ბაზისური |
| Loop Brace | within Loop Zone | parent-ის z-index-ს იმემკვიდრებს |

---

## Performance Tips

### 1. Conditional Rendering

```tsx
{isZoomDragging && zoomDragStart !== null && zoomDragEnd !== null && (
  <div>Selection overlay</div>
)}
```

Selection overlay მხოლოდ drag-ის დროს რენდერდება.

### 2. CSS Transform vs Left

```tsx
style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
```

`transform` იყენებს GPU acceleration-ს, `left` არა. თუმცა ამ შემთხვევაში, markers სტატიკურია და ეს არ არის კრიტიკული.

### 3. Memoization Opportunity

თუ performance პრობლემა იქნება, შეიძლება:

```typescript
const timeMarkers = useMemo(() => {
  return Array.from({ length: Math.floor(state.masterDuration / timeInterval) + 1 });
}, [state.masterDuration, timeInterval]);
```

---

## ბოლო განახლება

2025-12-27 - Seek Zone გამარტივდა (drag-to-zoom მოხსნილია), მხოლოდ click-to-seek

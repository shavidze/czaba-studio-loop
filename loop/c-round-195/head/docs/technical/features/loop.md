# Global Loop - დეტალური ტექნიკური აღწერა

## კონცეფცია

Global Loop არის Ableton Live-ის Arrangement View-ის მოდელზე დაფუძნებული ფუნქცია. მთავარი იდეა: **ლუპი არის გლობალური "ფანჯარა"**, რომელიც განსაზღვრავს დაკვრის საზღვრებს მთელი პროექტისთვის, დამოუკიდებლად Solo/Mute მდგომარეობისგან.

---

## არქიტექტურა

### State Management

```typescript
// contexts/StudioContext.tsx

// ლუპის რეგიონი - დროის დიაპაზონი წამებში
loopRegion: {
  start: number;  // დასაწყისი (მაგ: 5.0 = მე-5 წამი)
  end: number;    // დასასრული (მაგ: 15.0 = მე-15 წამი)
}

// გლობალური switch - განსაზღვრავს ლუპი აქტიურია თუ არა
loopEnabled: boolean;
```

**რატომ ორი ცალკე state?**

ეს არის ძალიან მნიშვნელოვანი არქიტექტურული გადაწყვეტილება:

1. `loopRegion` - **სად** არის ლუპი (კოორდინატები)
2. `loopEnabled` - **ჩართულია** თუ არა (boolean switch)

ეს საშუალებას იძლევა:
- მომხმარებელმა შეინახოს ლუპის პოზიცია, მაგრამ დროებით გამორთოს
- ერთი კლიკით ჩართოს/გამორთოს იგივე რეგიონზე
- UI-ში აჩვენოს ლუპის რეგიონი "dimmed" მდგომარეობაში როცა გამორთულია

---

## TransportBar - ორ-ზონიანი რულერი

### კონცეფცია

Ableton-ში რულერი დაყოფილია ორ ლოგიკურ ზონად:
- **ზედა ნაწილი** - Loop Brace-ის კონტროლი
- **ქვედა ნაწილი** - Scrub/Seek

ჩვენ იგივე მიდგომა გამოვიყენეთ:

```
┌─────────────────────────────────────────────────┐
│  LOOP ZONE (h-3 = 12px)                         │
│  • cursor: crosshair                            │
│  • drag = ახალი ლუპის შექმნა                    │
│  • click = ლუპის გაუქმება                       │
├─────────────────────────────────────────────────┤
│  SEEK ZONE (დანარჩენი სიმაღლე)                  │
│  • cursor: pointer                              │
│  • click = seek                                 │
└─────────────────────────────────────────────────┘
```

### State ცვლადები

```typescript
// components/studio/TransportBar.tsx

// Loop Zone-ის state - ლუპის შექმნისთვის
const [isLoopZoneDragging, setIsLoopZoneDragging] = useState(false);
const [loopZoneDragStart, setLoopZoneDragStart] = useState<number | null>(null);
const [loopZoneDragEnd, setLoopZoneDragEnd] = useState<number | null>(null);
```

```typescript
// Loop Brace-ის manipulation state
const [loopDragType, setLoopDragType] = useState<'start' | 'end' | 'body' | null>(null);
```

**`loopDragType` სამი მნიშვნელობა:**
- `'start'` - მარცხენა კიდის resize
- `'end'` - მარჯვენა კიდის resize
- `'body'` - მთლიანი brace-ის გადატანა (move)

---

### მაუსის პოზიციის დროში კონვერტაცია

```typescript
const getTimeFromMouseEvent = (e: MouseEvent | React.MouseEvent, rect?: DOMRect): number => {
  // rect = timeline div-ის საზღვრები (getBoundingClientRect)
  const r = rect || timelineRef.current?.getBoundingClientRect();
  if (!r) return 0;

  // მაუსის X პოზიცია timeline-ის შიგნით (0-დან width-მდე)
  const x = e.clientX - r.left;

  // პროცენტული პოზიცია (0.0 - 1.0)
  // Math.max/min უზრუნველყოფს საზღვრებში დარჩენას
  const percentage = Math.max(0, Math.min(1, x / r.width));

  // პროცენტის გადაყვანა წამებში
  // მაგ: 50% × 120 წამი = 60 წამი
  return percentage * state.masterDuration;
};
```

**რატომ `e.clientX - r.left`?**

`e.clientX` არის მაუსის პოზიცია **viewport**-ის მიმართ (ბრაუზერის ფანჯრის მარცხენა კიდიდან).
`r.left` არის timeline div-ის მარცხენა კიდის პოზიცია viewport-ის მიმართ.

გამოკლებით ვიღებთ მაუსის პოზიციას **timeline-ის შიგნით**.

---

### Loop Zone Event Handlers

#### MouseDown - drag-ის დაწყება

```typescript
const handleLoopZoneMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
  // უსაფრთხოების შემოწმება
  if (!state.allLoaded || !timelineRef.current) return;

  const rect = timelineRef.current.getBoundingClientRect();
  const startTime = getTimeFromMouseEvent(e, rect);

  // შევინახოთ საწყისი X პოზიცია click vs drag-ის დასადგენად
  dragStartXRef.current = e.clientX;

  // დავიწყოთ drag tracking
  setIsLoopZoneDragging(true);
  setLoopZoneDragStart(startTime);
  setLoopZoneDragEnd(startTime);  // თავდაპირველად იგივე წერტილი
};
```

#### MouseMove - drag-ის პროცესი

```typescript
const handleLoopZoneMouseMove = (e: MouseEvent) => {
  // მხოლოდ თუ drag აქტიურია
  if (!isLoopZoneDragging || !timelineRef.current || !state.allLoaded) return;

  const rect = timelineRef.current.getBoundingClientRect();
  const currentTime = getTimeFromMouseEvent(e, rect);

  // განვაახლოთ drag-ის ბოლო წერტილი (real-time preview-სთვის)
  setLoopZoneDragEnd(currentTime);
};
```

#### MouseUp - drag-ის დასრულება

```typescript
const handleLoopZoneMouseUp = (e: MouseEvent) => {
  if (!timelineRef.current) {
    // cleanup
    setIsLoopZoneDragging(false);
    setLoopZoneDragStart(null);
    setLoopZoneDragEnd(null);
    return;
  }

  // რამდენი პიქსელით გადაინაცვლა მაუსმა?
  const dragDistance = Math.abs(e.clientX - dragStartXRef.current);

  if (dragDistance > 10 && loopZoneDragStart !== null && loopZoneDragEnd !== null) {
    // DRAG: 10px-ზე მეტი მოძრაობა = ახალი ლუპის შექმნა

    // Math.min/max უზრუნველყოფს სწორ თანმიმდევრობას
    // (მარცხნიდან მარჯვნივ drag-იც და მარჯვნიდან მარცხნივაც მუშაობს)
    const startTime = Math.min(loopZoneDragStart, loopZoneDragEnd);
    const endTime = Math.max(loopZoneDragStart, loopZoneDragEnd);

    // მინიმალური ლუპის სიგრძე 0.2 წამი (ძალიან პატარა ლუპი უაზროა)
    if (endTime - startTime > 0.2) {
      createLoopAndSeek(startTime, endTime);
    }
  } else {
    // CLICK: 10px-ზე ნაკლები მოძრაობა = ლუპის გაუქმება
    // მნიშვნელოვანი: loopEnabled არ იცვლება! მხოლოდ რეგიონი იშლება
    setLoopRegion({ start: 0, end: 0 });
  }

  // cleanup
  setIsLoopZoneDragging(false);
  setLoopZoneDragStart(null);
  setLoopZoneDragEnd(null);
};
```

---

### Global Event Listeners Pattern

```typescript
useEffect(() => {
  if (isLoopZoneDragging) {
    // მხოლოდ როცა drag აქტიურია, ვამატებთ global listeners
    window.addEventListener('mousemove', handleLoopZoneMouseMove);
    window.addEventListener('mouseup', handleLoopZoneMouseUp);

    // Cleanup function - კომპონენტის unmount-ზე ან dependency ცვლილებაზე
    return () => {
      window.removeEventListener('mousemove', handleLoopZoneMouseMove);
      window.removeEventListener('mouseup', handleLoopZoneMouseUp);
    };
  }
}, [isLoopZoneDragging, loopZoneDragStart, loopZoneDragEnd, state.allLoaded]);
```

**რატომ `window` და არა element?**

თუ მომხმარებელი drag-ის დროს მაუსს გაიტანს element-ის გარეთ:
- Element-ის listener არ დაიჭერს event-ს
- Window-ის listener დაიჭერს ყველგან

ეს უზრუნველყოფს "smooth" drag გამოცდილებას.

---

### Loop-ით Seek-ის ლოგიკა

```typescript
// Helper ფუნქცია - ლუპის შექმნა და playhead-ის გადატანა
const createLoopAndSeek = (start: number, end: number) => {
  setLoopRegion({ start, end });  // ლუპის კოორდინატები
  setLoopEnabled(true);           // ავტომატურად ჩავრთოთ ლუპი
  seek(start);                    // playhead გადავიტანოთ ლუპის დასაწყისზე
};
```

**რატომ seek?**

Ableton-ში როცა ახალ ლუპს ქმნი, playhead ავტომატურად გადადის ლუპის დასაწყისზე. ეს ინტუიციურია - მომხმარებელს სურს მოისმინოს ის რეგიონი რაც მონიშნა.

---

### Loop Brace-ის Manipulation

```typescript
const handleLoopBraceMouseDown = (e: React.MouseEvent, type: 'start' | 'end' | 'body') => {
  e.stopPropagation(); // მნიშვნელოვანი! თორემ Loop Zone-ის handler-იც გაეშვება

  if (!state.allLoaded || !timelineRef.current) return;

  const rect = timelineRef.current.getBoundingClientRect();
  const time = getTimeFromMouseEvent(e, rect);

  setLoopDragType(type);

  // შევინახოთ საწყისი მდგომარეობა delta-ს გამოსათვლელად
  loopDragStartRef.current = {
    time,                         // სად დავაჭირეთ
    loopStart: loopRegion.start,  // ლუპის საწყისი პოზიცია
    loopEnd: loopRegion.end,      // ლუპის საბოლოო პოზიცია
  };
};
```

```typescript
// Global handler loop brace drag-ისთვის
useEffect(() => {
  if (!loopDragType || !timelineRef.current) return;

  const handleLoopMouseMove = (e: MouseEvent) => {
    const rect = timelineRef.current!.getBoundingClientRect();
    const currentTime = getTimeFromMouseEvent(e, rect);

    // Delta = რამდენით გადაინაცვლა საწყისი წერტილიდან
    const delta = currentTime - loopDragStartRef.current.time;

    if (loopDragType === 'start') {
      // მარცხენა კიდის resize
      // ახალი start = საწყისი start + delta
      // Math.max(0, ...) - არ გავიდეს 0-ზე ქვემოთ
      // Math.min(..., loopRegion.end - 0.5) - არ გადავიდეს end-ზე (min 0.5წმ gap)
      const newStart = Math.max(0, Math.min(
        loopDragStartRef.current.loopStart + delta,
        loopRegion.end - 0.5
      ));
      setLoopRegion({ start: newStart, end: loopRegion.end });

    } else if (loopDragType === 'end') {
      // მარჯვენა კიდის resize
      const newEnd = Math.max(
        loopRegion.start + 0.5,  // min 0.5წმ gap
        Math.min(loopDragStartRef.current.loopEnd + delta, state.masterDuration)
      );
      setLoopRegion({ start: loopRegion.start, end: newEnd });

    } else if (loopDragType === 'body') {
      // მთლიანი ლუპის გადატანა (move)
      const loopDuration = loopDragStartRef.current.loopEnd - loopDragStartRef.current.loopStart;
      let newStart = loopDragStartRef.current.loopStart + delta;
      let newEnd = loopDragStartRef.current.loopEnd + delta;

      // საზღვრების შემოწმება
      if (newStart < 0) {
        newStart = 0;
        newEnd = loopDuration;  // სიგრძე უცვლელია
      }
      if (newEnd > state.masterDuration) {
        newEnd = state.masterDuration;
        newStart = state.masterDuration - loopDuration;  // სიგრძე უცვლელია
      }

      setLoopRegion({ start: newStart, end: newEnd });
    }
  };

  const handleLoopMouseUp = () => {
    setLoopDragType(null);  // drag-ის დასრულება
  };

  window.addEventListener('mousemove', handleLoopMouseMove);
  window.addEventListener('mouseup', handleLoopMouseUp);

  return () => {
    window.removeEventListener('mousemove', handleLoopMouseMove);
    window.removeEventListener('mouseup', handleLoopMouseUp);
  };
}, [loopDragType, loopRegion, state.masterDuration, setLoopRegion]);
```

---

## Playback Engine - Loop Integration

### Time Tracking Loop

```typescript
// contexts/StudioContext.tsx - startTimeTracking()

const startTimeTracking = useCallback(() => {
  const updateTime = () => {
    if (!audioContextRef.current) return;

    // AudioContext.currentTime - hardware-level precision timer
    // ეს არის ყველაზე ზუსტი დროის წყარო ბრაუზერში
    const elapsed = audioContextRef.current.currentTime - playbackStartTimeRef.current;
    const newTime = playbackStartOffsetRef.current + elapsed;

    setState(prev => {
      let adjustedTime = newTime;

      // ========== LOOP LOGIC ==========
      if (prev.loopEnabled && prev.loopRegion.end > prev.loopRegion.start) {
        // ლუპი აქტიურია და ვალიდურია (end > start)

        if (adjustedTime >= prev.loopRegion.end) {
          // მივაღწიეთ ლუპის ბოლოს
          adjustedTime = prev.loopRegion.start;  // გადავხტეთ დასაწყისზე

          // აუდიოს რესტარტი ახალი პოზიციიდან
          if (restartAudioAtPositionRef.current) {
            restartAudioAtPositionRef.current(adjustedTime);
          }
        }
      }
      // ==================================

      // ტრეკის დასრულების შემოწმება
      if (adjustedTime >= prev.masterDuration) {
        // cleanup და stop
        sourceNodesRef.current.forEach(s => { try { s.stop(); } catch (e) {} });
        // ... cleanup code ...
        return { ...prev, isPlaying: false, currentTime: 0 };
      }

      // შემდეგი frame-ის დაგეგმვა
      animationFrameRef.current = requestAnimationFrame(updateTime);

      return { ...prev, currentTime: adjustedTime };
    });
  };

  animationFrameRef.current = requestAnimationFrame(updateTime);
}, []);
```

**რატომ `requestAnimationFrame`?**

1. **სინქრონიზაცია დისპლეის refresh rate-თან** - ჩვეულებრივ 60fps
2. **ავტომატური throttling** - თუ tab background-შია, frame-ები არ იგეგმება
3. **Smooth animation** - არა "jumpy" UI updates

**რატომ `AudioContext.currentTime`?**

- JavaScript-ის `Date.now()` არ არის საკმარისად ზუსტი აუდიოსთვის
- `AudioContext.currentTime` არის hardware clock-ზე დაფუძნებული
- Microsecond precision (0.000001 წამი)

---

## JSX სტრუქტურა

```tsx
{/* LOOP ZONE */}
<div
  className={`absolute top-0 left-0 right-0 h-3 z-10 ${
    state.allLoaded ? 'cursor-crosshair' : ''
  } ${isLoopZoneDragging ? 'bg-amber-500/10' : 'hover:bg-neutral-800/50'}`}
  onMouseDown={handleLoopZoneMouseDown}
  title="Drag to create loop, Click to clear"
>
  {/* Drag Preview - აჩვენებს drag-ის დროს შექმნილ რეგიონს */}
  {isLoopZoneDragging && loopZoneDragStart !== null && loopZoneDragEnd !== null && (
    <div
      className="absolute top-0 h-full bg-amber-500/40 border-x-2 border-amber-500 pointer-events-none"
      style={{
        // პოზიცია პროცენტებში
        left: `${(Math.min(loopZoneDragStart, loopZoneDragEnd) / state.masterDuration) * 100}%`,
        width: `${(Math.abs(loopZoneDragEnd - loopZoneDragStart) / state.masterDuration) * 100}%`,
      }}
    />
  )}

  {/* Loop Brace - არსებული ლუპის ვიზუალი */}
  {state.allLoaded && loopRegion.end > loopRegion.start && (
    <div
      className={`absolute top-0 h-full transition-opacity ${
        loopEnabled ? 'opacity-100' : 'opacity-40'  // dimmed როცა გამორთულია
      }`}
      style={{
        left: `${(loopRegion.start / state.masterDuration) * 100}%`,
        width: `${((loopRegion.end - loopRegion.start) / state.masterDuration) * 100}%`,
      }}
    >
      {/* Body - გადასატანი */}
      <div
        className="absolute inset-0 cursor-grab active:cursor-grabbing bg-amber-500/30"
        onMouseDown={(e) => handleLoopBraceMouseDown(e, 'body')}
      />

      {/* Start Handle - resize left */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize bg-amber-500 hover:bg-amber-400 rounded-l"
        onMouseDown={(e) => handleLoopBraceMouseDown(e, 'start')}
      />

      {/* End Handle - resize right */}
      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize bg-amber-500 hover:bg-amber-400 rounded-r"
        onMouseDown={(e) => handleLoopBraceMouseDown(e, 'end')}
      />
    </div>
  )}
</div>
```

---

## Keyboard Shortcuts

```typescript
// StudioContext.tsx - keyboard handler

case 'l':
case 'L':
  e.preventDefault();
  if (modKey) {
    // Ctrl+L - waveform selection-დან ლუპის შექმნა
    setLoopFromSelection();
  } else {
    // L - toggle loop on/off
    toggleLoopEnabled();
  }
  break;
```

### setLoopFromSelection

```typescript
const setLoopFromSelection = useCallback(() => {
  setState(prev => {
    // თუ არ არის აქტიური selection, არაფერი არ ხდება
    if (!prev.timeSelection.isActive) return prev;

    const loopStart = prev.timeSelection.start;

    return {
      ...prev,
      loopRegion: {
        start: loopStart,
        end: prev.timeSelection.end,
      },
      loopEnabled: true,
      currentTime: loopStart,  // seek to loop start
      // selection-ის გაწმენდა ლუპის შექმნის შემდეგ
      timeSelection: {
        start: 0,
        end: 0,
        isActive: false,
      },
    };
  });
}, []);
```

---

## Loop Region Mask (Waveform Visual Feedback)

როდესაც loop აქტიურია, waveform-ის progress coloring მხოლოდ loop region-ის შიგნით უნდა ჩანდეს. Loop-ის გარეთ ნაწილები "დაბნელებულია" semi-transparent overlay-ით.

### იმპლემენტაცია (StudioTrack.tsx)

```tsx
{/* Loop Region Mask - Grays out waveform progress outside of loop */}
{loopEnabled && loopRegion.end > loopRegion.start && (
  <>
    {/* Pre-loop mask (0 to loopStart) */}
    {loopRegion.start > 0 && (
      <div
        className="absolute top-2 bottom-2 pointer-events-none z-[5]"
        style={{
          left: '8px',
          width: `${(loopRegion.start / stem.duration) * 100}%`,
          backgroundColor: 'rgba(23, 23, 23, 0.75)',
        }}
      />
    )}
    {/* Post-loop mask (loopEnd to end) */}
    {loopRegion.end < stem.duration && (
      <div
        className="absolute top-2 bottom-2 pointer-events-none z-[5]"
        style={{
          left: `calc(8px + ${(loopRegion.end / stem.duration) * 100}%)`,
          right: '8px',
          backgroundColor: 'rgba(23, 23, 23, 0.75)',
        }}
      />
    )}
  </>
)}
```

### ვიზუალური ეფექტი

| რეგიონი | გამოჩენა |
|---------|----------|
| 0 → loopStart | დაბნელებული (75% opacity mask) |
| loopStart → loopEnd | ნორმალური progress coloring |
| loopEnd → duration | დაბნელებული (75% opacity mask) |

**რატომ rgba(23, 23, 23, 0.75)?**

- `rgba(23, 23, 23)` = neutral-900 (background color)
- `0.75` = 75% opacity - საკმარისია teal progress-ის "ჩასაქრობად", მაგრამ waveform bars მაინც ჩანს

---

## ბოლო განახლება

2025-12-27 - Loop Region Mask, Seek Zone გამარტივდა (drag-to-zoom მოხსნილია)

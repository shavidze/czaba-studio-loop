# StudioTrack Component - დეტალური ტექნიკური აღწერა

## მდებარეობა

`app/components/studio/StudioTrack.tsx`

## კონცეფცია

StudioTrack არის ინდივიდუალური აუდიო ტრეკის კომპონენტი. ეს არის DAW-ის (Digital Audio Workstation) ფუნდამენტური UI element-ი, რომელიც აჩვენებს:
- ტრეკის სახელი და ხანგრძლივობა
- Solo/Mute ღილაკები
- Volume fader (სლაიდერი)
- Waveform ვიზუალიზაცია
- Time selection (waveform-ზე drag-ით)
- Loop region mask (loop-ის გარეთ ვიზუალური dimming)
- Click-to-seek (waveform-ზე კლიკით seek)

---

## Imports და Types

```typescript
import { useEffect, useRef, useState } from 'react';
import type WaveSurfer from 'wavesurfer.js';
import { Download } from 'lucide-react';
import type { StudioStemState } from '~/types/studio';
import { useStudio } from '~/contexts/StudioContext';
```

| Import | მიზეზი |
|--------|--------|
| `useEffect` | Side effects - WaveSurfer init, global event listeners |
| `useRef` | DOM refs + mutable values (WaveSurfer instance, drag start position) |
| `useState` | Local UI state (isResizing, isSelecting) |
| `WaveSurfer` | Type-only import - waveform ბიბლიოთეკა |
| `Download` | Lucide icon კომპონენტი |
| `StudioStemState` | Stem-ის type definition |
| `useStudio` | Context hook - global state და actions |

---

## Props Interface

```typescript
interface StudioTrackProps {
  stem: StudioStemState;  // ტრეკის მონაცემები
}
```

`StudioStemState` მოიცავს:
- `id` - უნიკალური იდენტიფიკატორი
- `name` - ტრეკის სახელი ("Drums", "Bass", etc.)
- `audioUrl` - აუდიო ფაილის URL
- `duration` - ხანგრძლივობა წამებში
- `volume` - ხმის დონე (0-1)
- `isMuted` / `isSoloed` - მდგომარეობები
- `trackHeight` - ტრეკის სიმაღლე პიქსელებში
- `trimStart` / `trimEnd` - trim boundaries

---

## Context-დან მიღებული მნიშვნელობები

```typescript
const {
  toggleMute,          // (stemId) => void
  toggleSolo,          // (stemId, isMultiSelect) => void
  setVolume,           // (stemId, volume) => void
  registerWaveform,    // (stemId, wavesurfer) => void
  unregisterWaveform,  // (stemId) => void
  exportAudio,         // (options) => Promise<Blob>
  state,               // მთლიანი Studio state
  selectedStemIds,     // Set<string> - მონიშნული ტრეკები
  selectStem,          // (stemId, mode) => void
  setTimeSelection,    // (start, end) => void
  clearTimeSelection,  // () => void
  timeSelection,       // { isActive, start, end }
  seek,                // (time) => void - playhead-ის გადატანა
  loopRegion,          // { start, end } - loop boundaries
  loopEnabled,         // boolean - loop ჩართულია?
} = useStudio();
```

**რატომ ამდენი ფუნქცია?**

Single Responsibility Principle - თითოეული ფუნქცია ერთ კონკრეტულ მოქმედებას ასრულებს. ეს უადვილებს debugging-ს და testing-ს.

---

## Refs (მუდმივი references)

```typescript
const waveformRef = useRef<HTMLDivElement>(null);
const waveformContainerRef = useRef<HTMLDivElement>(null);
const wavesurferRef = useRef<WaveSurfer | null>(null);
const selectionStartRef = useRef<number>(0);
```

| Ref | მიზეზი |
|-----|--------|
| `waveformRef` | WaveSurfer-ის container element |
| `waveformContainerRef` | Parent container - mouse position-ის გასაანგარიშებლად |
| `wavesurferRef` | WaveSurfer instance - შევინახავთ cleanup-ისთვის |
| `selectionStartRef` | Time selection-ის საწყისი დრო |

**რატომ `useRef` და არა `useState`?**

1. **Performance** - ref-ის ცვლილება არ იწვევს re-render-ს
2. **Synchronous** - event handler-ებში მყისიერი წვდომა
3. **Mutable** - WaveSurfer instance მუტაბელურია

---

## Local State

```typescript
const [isSelecting, setIsSelecting] = useState(false);
```

**რატომ ეს state?**

- `isSelecting` - Time selection drag მიმდინარეობს?

ეს state აკონტროლებს global event listeners-ის დამატება/წაშლას.

---

## Computed Values

```typescript
// მონიშნულია თუ არა ეს ტრეკი
const isSelected = selectedStemIds.has(stem.id);

// რომელიმე ტრეკი Solo-შია?
const anySoloed = state.stems.some(s => s.isSoloed);

// ეს ტრეკი "ჩუმადაა" Solo-ს გამო?
const isImplicitlyMuted = anySoloed && !stem.isSoloed;
```

**`isImplicitlyMuted` ლოგიკა:**

| anySoloed | stem.isSoloed | isImplicitlyMuted | შედეგი |
|-----------|---------------|-------------------|--------|
| false | * | false | ნორმალური |
| true | true | false | Solo-შია, ისმის |
| true | false | true | სხვა Solo-შია, ჩუმად |

---

## Helper ფუნქციები

### getTimeFromMouseX

```typescript
const getTimeFromMouseX = (clientX: number): number => {
  // 1. Guard - container არსებობს?
  if (!waveformContainerRef.current) return 0;

  // 2. Container-ის bounds
  const rect = waveformContainerRef.current.getBoundingClientRect();

  // 3. Mouse-ის X პოზიცია container-ის შიგნით
  const x = clientX - rect.left;

  // 4. პროცენტული პოზიცია (0-1)
  // Math.max/min - "clamping" - არ გავიდეს საზღვრებს გარეთ
  const percentage = Math.max(0, Math.min(1, x / rect.width));

  // 5. დრო წამებში
  return percentage * stem.duration;
};
```

**გამოყენება:** `getTimeFromMouseX(event.clientX)` → `5.5` (წამი)

---

## Track Selection System

### handleTrackClick

```typescript
const handleTrackClick = (e: React.MouseEvent) => {
  // 1. არ დავარეაგიროთ ღილაკებზე/input-ებზე click-ზე
  const target = e.target as HTMLElement;
  if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.closest('button')) {
    return;  // Early return
  }

  // 2. Selection mode-ის განსაზღვრა modifier keys-ით
  if (e.shiftKey) {
    // Shift+Click = range selection (A-დან B-მდე ყველა)
    selectStem(stem.id, 'range');
  } else if (e.ctrlKey || e.metaKey) {
    // Ctrl/Cmd+Click = toggle (დაამატე ან წაშალე)
    selectStem(stem.id, 'toggle');
  } else {
    // Regular Click = replace (მხოლოდ ეს ტრეკი)
    selectStem(stem.id, 'replace');
  }
};
```

**Selection Modes:**

| Mode | გამომწვევი | შედეგი |
|------|------------|--------|
| `replace` | Regular Click | გაასუფთავე selection, მონიშნე მხოლოდ ეს |
| `toggle` | Ctrl/Cmd+Click | დაამატე ან წაშალე selection-იდან |
| `range` | Shift+Click | მონიშნე ყველა ბოლო click-იდან ამ click-მდე |

---

## Solo/Mute ღილაკები

### Solo ღილაკი

```typescript
<button
  onClick={(e) => {
    // Ctrl/Cmd დაჭერილია? → multi-solo mode
    const isMultiSelect = e.ctrlKey || e.metaKey;
    toggleSolo(stem.id, isMultiSelect);
  }}
  disabled={!state.allLoaded}
  title={`Solo (Hold Ctrl/Cmd for multi-solo)`}
  className={`... ${
    stem.isSoloed
      ? 'bg-yellow-500 text-black shadow-lg'  // Solo ON - ყვითელი
      : 'bg-neutral-800 text-neutral-400 ...' // Solo OFF - ნაცრისფერი
  }`}
>
  S
</button>
```

**Solo ლოგიკის მოდები (StudioContext-ში):**

1. **GROUP SOLO** - თუ ტრეკი მონიშნულთა ჯგუფშია (selectedStemIds)
   - ყველა მონიშნული Solo-შია → ყველას გავთიშოთ
   - ზოგი არ არის Solo-ში → ყველა ჩავრთოთ

2. **MULTI-SOLO** (Ctrl+Click) - მხოლოდ ეს ტრეკი toggle, სხვები უცვლელი

3. **EXCLUSIVE SOLO** (Regular Click) - ეს ტრეკი Solo, სხვები გამორთულია

### Mute ღილაკი

```typescript
<button
  onClick={() => toggleMute(stem.id)}
  disabled={!state.allLoaded}
  className={`... ${
    stem.isMuted
      ? 'bg-red-500 text-white shadow-lg'  // Muted - წითელი
      : 'bg-neutral-800 text-neutral-400'  // Not muted - ნაცრისფერი
  }`}
>
  M
</button>
```

**შენიშვნა:** Mute-ს არ აქვს group ლოგიკა - მხოლოდ ერთი ტრეკი იცვლება.

---

## Volume Fader

```typescript
<input
  type="range"
  min="0"
  max="1"
  step="0.01"
  value={stem.volume}
  onChange={(e) => setVolume(stem.id, parseFloat(e.target.value))}
  disabled={!state.allLoaded}
  className={`...
    [&::-webkit-slider-thumb]:appearance-none
    [&::-webkit-slider-thumb]:w-3
    [&::-webkit-slider-thumb]:h-3
    [&::-webkit-slider-thumb]:rounded-full
    [&::-webkit-slider-thumb]:bg-teal-500
    ...`}
/>
```

**CSS Selector-ების ახსნა:**

| Selector | მიზეზი |
|----------|--------|
| `[&::-webkit-slider-thumb]` | Chrome/Safari thumb styling |
| `[&::-moz-range-thumb]` | Firefox thumb styling |
| `appearance-none` | ბრაუზერის default სტილის გადაფარვა |

**რატომ `step="0.01"`?**

100 საფეხურიანი precision (0.00, 0.01, 0.02, ... 1.00). ეს საკმარისია smooth volume control-ისთვის.

---

## WaveSurfer ინიციალიზაცია

```typescript
useEffect(() => {
  // 1. Guard - DOM element არსებობს?
  if (!waveformRef.current) return;

  let wavesurfer: WaveSurfer | null = null;

  const initWaveSurfer = async () => {
    // 2. Dynamic import - client-side only
    // Server-side rendering-ის დროს WaveSurfer ვერ ჩაიტვირთება
    const WaveSurferModule = await import('wavesurfer.js');
    const WaveSurfer = WaveSurferModule.default;

    if (!waveformRef.current) return;  // Double-check after async

    // 3. WaveSurfer instance-ის შექმნა
    wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#52525b',       // neutral-600 - ტალღის ფერი
      progressColor: '#14b8a6',   // teal-500 - progress ფერი
      cursorColor: 'transparent', // დამალული - გლობალურ playhead-ს ვიყენებთ
      cursorWidth: 0,
      barWidth: 2,                // ტალღის bar-ის სიგანე
      barGap: 1,                  // bar-ებს შორის დაშორება
      height: stem.trackHeight,
      normalize: true,            // ავტომატური ნორმალიზაცია
      interact: false,            // click/drag გამორთული
      backend: 'WebAudio',
    });

    // 4. აუდიოს ჩატვირთვა
    wavesurfer.load(stem.audioUrl);

    // 5. Ready event - რეგისტრაცია context-ში
    wavesurfer.on('ready', () => {
      if (wavesurfer) {
        registerWaveform(stem.id, wavesurfer);
      }
    });

    // 6. Error handling
    wavesurfer.on('error', (error) => {
      console.error(`Failed to load waveform for ${stem.name}:`, error);
    });

    // 7. Ref-ში შენახვა
    wavesurferRef.current = wavesurfer;
  };

  initWaveSurfer();

  // 8. Cleanup function
  return () => {
    unregisterWaveform(stem.id);
    if (wavesurfer) wavesurfer.destroy();
  };
}, [stem.id, stem.audioUrl, registerWaveform, unregisterWaveform, stem.name, stem.trackHeight]);
```

**რატომ `async/await` და dynamic import?**

```typescript
const WaveSurferModule = await import('wavesurfer.js');
```

WaveSurfer.js იყენებს Web Audio API-ს და DOM-ს. Server-side rendering-ის დროს ეს APIs არ არსებობს. Dynamic import უზრუნველყოფს რომ კოდი მხოლოდ browser-ში შესრულდება.

---

## Time Selection და Click-to-Seek (Waveform-ზე)

### Selection Start

```typescript
const handleSelectionStart = (e: React.MouseEvent<HTMLDivElement>) => {
  // 1. არ დავიწყოთ ღილაკებზე/input-ებზე
  const target = e.target as HTMLElement;
  if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.closest('button')) {
    return;
  }

  e.preventDefault();  // Text selection-ის თავიდან აცილება

  // 2. საწყისი დროის შენახვა
  const time = getTimeFromMouseX(e.clientX);
  selectionStartRef.current = time;

  // 3. Selection mode-ის ჩართვა
  setIsSelecting(true);

  // 4. ძველი selection-ის გასუფთავება
  clearTimeSelection();
};
```

### Selection Move & End (useEffect)

```typescript
useEffect(() => {
  if (!isSelecting) return;  // მხოლოდ selection mode-ში

  const handleMouseMove = (e: MouseEvent) => {
    const currentTime = getTimeFromMouseX(e.clientX);
    // Context-ში time selection-ის განახლება
    setTimeSelection(selectionStartRef.current, currentTime);
  };

  const handleMouseUp = (e: MouseEvent) => {
    setIsSelecting(false);

    // Click vs Drag განსხვავება
    const currentTime = getTimeFromMouseX(e.clientX);
    const selectionDuration = Math.abs(currentTime - selectionStartRef.current);

    if (selectionDuration < 0.1) {
      // < 0.1 წამი = click, არა drag → SEEK to position
      clearTimeSelection();
      seek(currentTime);  // playhead გადავა click-ის პოზიციაზე
    }
  };

  // Global listeners
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);

  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };
}, [isSelecting, setTimeSelection, clearTimeSelection, stem.duration]);
```

**რატომ 0.1 წამის threshold?**

ეს განასხვავებს "click"-ს (შემთხვევითი მცირე მოძრაობა) და "drag"-ს (რეალური selection). 0.1 წამი = ~100 მილიწამი drag distance.

---

## Loop Region Mask

როდესაც loop ჩართულია, waveform-ის progress coloring მხოლოდ loop region-ში უნდა ჩანდეს. Loop-ის გარეთ ნაწილი "დაბნელებულია" semi-transparent overlay-ით.

### JSX სტრუქტურა

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

### ლოგიკის ახსნა

| პირობა | მოქმედება |
|--------|-----------|
| `loopEnabled && loopRegion.end > loopRegion.start` | Loop აქტიურია და ვალიდურია |
| `loopRegion.start > 0` | Pre-loop mask საჭიროა (loop არ იწყება 0-დან) |
| `loopRegion.end < stem.duration` | Post-loop mask საჭიროა (loop არ მთავრდება ბოლოს) |

### ვიზუალური ეფექტი

- **rgba(23, 23, 23, 0.75)** = neutral-900 75% opacity
- WaveSurfer-ის teal progress color "ჩაქრება" და ნაცრისფერი გამოჩნდება
- Loop region-ში progress ნორმალურად ჩანს

---

## Download Stem

```typescript
const handleDownloadStem = async () => {
  if (!state.allLoaded) return;

  try {
    console.log(`📥 Downloading stem: ${stem.name}`);

    // 1. Export მხოლოდ ეს stem
    const blob = await exportAudio({
      format: 'wav',
      quality: 'high',
      includedStemIds: [stem.id],  // მხოლოდ ეს ტრეკი
      normalize: false,
    });

    // 2. Blob-ის URL შექმნა
    const url = URL.createObjectURL(blob);

    // 3. Download trigger
    const a = document.createElement('a');
    a.href = url;
    const fileName = `${stem.name.replace(/\s+/g, '-')}-${stem.trimStart.toFixed(1)}s-${stem.trimEnd.toFixed(1)}s.wav`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // 4. Memory cleanup
    URL.revokeObjectURL(url);

    console.log(`✅ Downloaded: ${fileName}`);
  } catch (error) {
    console.error('Failed to download stem:', error);
    alert(`Failed to download ${stem.name}`);
  }
};
```

**რატომ `URL.revokeObjectURL`?**

`createObjectURL` ქმნის მეხსიერებაში ობიექტს. თუ არ გავათავისუფლებთ (`revokeObjectURL`), memory leak მოხდება.

---

## JSX სტრუქტურა

```tsx
<div onClick={handleTrackClick} className={`... ${isSelected ? 'border-teal-500' : ''}`}>

  {/* LEFT PANEL - Controls (w-56 = 224px) */}
  <div className="w-56 ...">
    {/* Track Name + Download */}
    <div>
      <h3>{stem.name}</h3>
      <button onClick={handleDownloadStem}>📥</button>
    </div>

    {/* Solo/Mute */}
    <div className="flex gap-1.5">
      <button onClick={() => toggleSolo(...)}>S</button>
      <button onClick={() => toggleMute(...)}>M</button>
    </div>

    {/* Volume */}
    <input type="range" ... />
  </div>

  {/* RIGHT PANEL - Waveform (flex-1) */}
  <div ref={waveformContainerRef} onMouseDown={handleSelectionStart}>
    <div ref={waveformRef} />  {/* WaveSurfer renders here */}

    {/* Loop Region Mask (NEW) */}
    {loopEnabled && loopRegion.end > loopRegion.start && (
      <div className="bg-[rgba(23,23,23,0.75)]" style={{...}} />
    )}

    {/* Time Selection Overlay */}
    {timeSelection.isActive && (
      <div className="absolute ... bg-teal-500/30" style={{left, width}} />
    )}

    {/* Implicit Mute Indicator */}
    {isImplicitlyMuted && (
      <span>Implicitly Muted</span>
    )}
  </div>
</div>
```

---

## სტილების რეფერენსი

| მდგომარეობა | CSS Classes |
|-------------|-------------|
| Selected Track | `border-teal-500 bg-teal-500/10 ring-1 ring-teal-500/50` |
| Implicitly Muted | `opacity-50` |
| Solo ON | `bg-yellow-500 text-black` |
| Mute ON | `bg-red-500 text-white` |
| Time Selection | `bg-teal-500/30 border-teal-500` |

---

## Performance Considerations

### 1. Conditional Rendering

```tsx
{timeSelection.isActive && (...)}
{isImplicitlyMuted && (...)}
```

Elements მხოლოდ საჭიროებისამებრ რენდერდება.

### 2. Ref vs State

Drag operations იყენებს `useRef` და არა `useState`. ეს თავიდან იცილებს ზედმეტ re-renders-ს drag-ის დროს.

---

## ბოლო განახლება

2026-01-08 - Resize functionality removed, simplified component

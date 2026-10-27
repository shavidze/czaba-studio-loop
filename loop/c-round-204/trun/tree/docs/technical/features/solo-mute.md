# Solo / Mute - დეტალური ტექნიკური აღწერა

## კონცეფცია

Solo და Mute არის მიქსერის ფუნდამენტური ფუნქციები, რომლებიც აკონტროლებენ თითოეული სტემის აუდიბელობას. ჩვენი იმპლემენტაცია მხარს უჭერს:

1. **Individual Solo/Mute** - ერთ სტემზე
2. **Group Solo/Mute** - მონიშნულ სტემებზე ერთდროულად
3. **Multi-Solo** - რამდენიმე სტემის ერთდროულად solo

---

## Audio Graph არქიტექტურა

### Web Audio API Node Chain

```
AudioBuffer → BufferSourceNode → GainNode → AudioContext.destination
     ↑              ↑                ↑              ↑
  PCM Data     Play/Stop       Volume/Mute      Speakers
```

**GainNode** არის ის ადგილი სადაც Solo/Mute კონტროლი ხდება:
- `gain.value = 0` → სტემი არ ისმის (Muted ან არა-Soloed)
- `gain.value = volume` → სტემი ისმის ნორმალურად

### Refs სტრუქტურა

```typescript
// contexts/StudioContext.tsx

// აუდიო ბუფერების cache - ჩატვირთული PCM data
const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());

// Source nodes - თითოეული stem-ის player
const sourceNodesRef = useRef<Map<string, AudioBufferSourceNode>>(new Map());

// Gain nodes - თითოეული stem-ის volume/mute controller
const gainNodesRef = useRef<Map<string, GainNode>>(new Map());
```

**რატომ `useRef` და არა `useState`?**

1. **Performance** - ref-ის ცვლილება არ იწვევს re-render-ს
2. **Synchronous access** - Audio callback-ებში საჭიროა სინქრონული წვდომა
3. **Mutable** - Web Audio nodes მუტაბელურია, React state არა

---

## აუდიბელობის ლოგიკა

### shouldStemBeAudible ფუნქცია

```typescript
const shouldStemBeAudible = useCallback((stem: StudioStemState, anySoloed: boolean): boolean => {
  // პირველი წესი: Muted stem არასოდეს არ ისმის
  if (stem.isMuted) return false;

  // მეორე წესი: თუ რომელიმე stem Solo-შია და ეს არა → არ ისმის
  if (anySoloed && !stem.isSoloed) return false;

  // სხვა შემთხვევაში ისმის
  return true;
}, []);
```

### ლოგიკის ცხრილი

| isMuted | isSoloed | anySoloed | ისმის? |
|---------|----------|-----------|--------|
| true    | *        | *         | ❌     |
| false   | false    | false     | ✅     |
| false   | false    | true      | ❌     |
| false   | true     | true      | ✅     |

**მთავარი წესი:** Solo ყოველთვის აბათილებს Mute-ს გარდა.

---

## toggleMute ფუნქცია

```typescript
const toggleMute = useCallback((stemId: string) => {
  setState(prev => {
    // 1. State-ის განახლება
    const newStems = prev.stems.map(s =>
      s.id === stemId
        ? { ...s, isMuted: !s.isMuted }  // toggle
        : s
    );

    // 2. Gain values-ის real-time განახლება
    const anySoloed = newStems.some(s => s.isSoloed);

    newStems.forEach(stem => {
      const gainNode = gainNodesRef.current.get(stem.id);
      if (gainNode) {
        // GainNode.gain.value პირდაპირ ცვლის ხმას
        // ეს ხდება ᲓᲐᲣᲧᲝᲕᲜᲔᲑᲚᲘᲕ, playback-ის შეჩერების გარეშე
        gainNode.gain.value = shouldStemBeAudible(stem, anySoloed)
          ? stem.volume
          : 0;
      }
    });

    return { ...prev, stems: newStems, hasUnsavedChanges: true };
  });
}, [shouldStemBeAudible]);
```

**რატომ `forEach` ყველა stem-ზე?**

Solo/Mute ცვლილება ერთ stem-ზე შეიძლება გავლენა იქონიოს სხვებზე:
- თუ Solo გამოირთო → ყველა stem-მა უნდა "გაიღვიძოს"
- ამიტომ ყველას gain value უნდა გადაანგარიშდეს

---

## toggleSolo ფუნქცია - სრული ლოგიკა

### ლოგიკის flow

```
toggleSolo(stemId, isMultiSelect)
         │
         ├── სტემი მონიშნულთა ჯგუფშია? (selectedStemIds.has && size > 1)
         │   │
         │   ├── დიახ → GROUP SOLO MODE
         │   │         │
         │   │         ├── ყველა მონიშნული soloed?
         │   │         │   ├── დიახ → ყველა unsolo
         │   │         │   └── არა → ყველა solo
         │   │
         │   └── არა → Individual mode
         │             │
         │             ├── isMultiSelect (Ctrl pressed)?
         │             │   ├── დიახ → MULTI-SOLO (add/remove from group)
         │             │   └── არა → EXCLUSIVE SOLO
         │
         └── GainNode-ების განახლება
```

### კოდი

```typescript
const toggleSolo = useCallback((stemId: string, isMultiSelect: boolean = false) => {
  setState(prev => {
    let newStems: StudioStemState[];

    // ========== GROUP SOLO MODE ==========
    // შევამოწმოთ: კლიკ-მოხდა მონიშნული stem-ის Solo ღილაკზე?
    const isPartOfSelection = prev.selectedStemIds.has(stemId) && prev.selectedStemIds.size > 1;

    if (isPartOfSelection) {
      // მონიშნული სტემების ID-ები
      const selectedIds = Array.from(prev.selectedStemIds);

      // ყველა მონიშნული უკვე Solo-შია?
      const allSelectedAreSoloed = selectedIds.every(id =>
        prev.stems.find(s => s.id === id)?.isSoloed
      );

      if (allSelectedAreSoloed) {
        // ყველა Solo-შია → ყველას გავთიშოთ
        newStems = prev.stems.map(stem =>
          prev.selectedStemIds.has(stem.id)
            ? { ...stem, isSoloed: false }
            : stem  // არა-მონიშნულები უცვლელია
        );
      } else {
        // ზოგი არ არის Solo → ყველა ჩავრთოთ
        newStems = prev.stems.map(stem =>
          prev.selectedStemIds.has(stem.id)
            ? { ...stem, isSoloed: true }
            : stem
        );
      }

    // ========== MULTI-SOLO MODE (Ctrl+Click) ==========
    } else if (isMultiSelect) {
      // მხოლოდ ეს stem იცვლება, სხვები უცვლელია
      newStems = prev.stems.map(stem =>
        stem.id === stemId
          ? { ...stem, isSoloed: !stem.isSoloed }
          : stem
      );

    // ========== EXCLUSIVE SOLO MODE (Regular Click) ==========
    } else {
      const clickedStem = prev.stems.find(s => s.id === stemId);

      if (clickedStem?.isSoloed) {
        // თუ უკვე Solo-შია → EXIT SOLO MODE (ყველას გავთიშოთ)
        // ეს მუშაობს როგორც single, ისე multi-solo შემთხვევაში
        newStems = prev.stems.map(stem => ({ ...stem, isSoloed: false }));
      } else {
        // თუ არ არის Solo-ში → EXCLUSIVE SOLO (მხოლოდ ეს)
        newStems = prev.stems.map(stem =>
          stem.id === stemId
            ? { ...stem, isSoloed: true }
            : { ...stem, isSoloed: false }
        );
      }
    }

    // ========== GAIN UPDATE ==========
    const isAnySoloed = newStems.some(s => s.isSoloed);

    newStems.forEach(stem => {
      const gainNode = gainNodesRef.current.get(stem.id);
      if (gainNode) {
        gainNode.gain.value = shouldStemBeAudible(stem, isAnySoloed) ? stem.volume : 0;
      }
    });

    return { ...prev, stems: newStems, hasUnsavedChanges: true };
  });
}, [shouldStemBeAudible]);
```

---

## toggleSoloForSelection - Keyboard 'S' Handler

ეს ფუნქცია გამოიყენება მხოლოდ `S` კლავიშზე დაჭერისას.

```typescript
const toggleSoloForSelection = useCallback(() => {
  setState(prev => {
    // თუ არაფერია მონიშნული, არაფერი არ ხდება
    if (prev.selectedStemIds.size === 0) return prev;

    const selectedIds = Array.from(prev.selectedStemIds);

    // ყველა მონიშნული Solo-შია?
    const allSelectedAreSoloed = selectedIds.every(id =>
      prev.stems.find(s => s.id === id)?.isSoloed
    );

    let newStems: StudioStemState[];

    if (allSelectedAreSoloed) {
      // Toggle OFF: ყველა მონიშნული unsolo
      newStems = prev.stems.map(stem =>
        prev.selectedStemIds.has(stem.id)
          ? { ...stem, isSoloed: false }
          : stem
      );
    } else {
      // Toggle ON: ყველა მონიშნული solo
      newStems = prev.stems.map(stem =>
        prev.selectedStemIds.has(stem.id)
          ? { ...stem, isSoloed: true }
          : stem
      );
    }

    // Gain update
    const isAnySoloed = newStems.some(s => s.isSoloed);

    newStems.forEach(stem => {
      const gainNode = gainNodesRef.current.get(stem.id);
      if (gainNode) {
        gainNode.gain.value = shouldStemBeAudible(stem, isAnySoloed) ? stem.volume : 0;
      }
    });

    return { ...prev, stems: newStems, hasUnsavedChanges: true };
  });
}, [shouldStemBeAudible]);
```

### Keyboard Handler-ში

```typescript
// StudioContext.tsx - useEffect keyboard handler

case 's':
case 'S':
  // მხოლოდ თუ არ არის Ctrl/Cmd და მონიშნულია სტემები
  if (!modKey && state.selectedStemIds.size > 0) {
    e.preventDefault();
    toggleSoloForSelection();  // ახალი ფუნქცია!
  }
  break;
```

**რატომ ცალკე ფუნქცია?**

- `toggleSolo` ელოდება `stemId`-ს - კონკრეტული stem-ის ID
- `toggleSoloForSelection` მუშაობს მთლიან selection-ზე
- Keyboard handler-ს არ აქვს "კონკრეტული stem", მხოლოდ selection

---

## UI კომპონენტი - Solo ღილაკი

```tsx
// components/studio/StudioTrack.tsx

<button
  onClick={(e) => {
    // Ctrl/Cmd ჭერის დაჭერილია?
    const isMultiSelect = e.ctrlKey || e.metaKey;
    toggleSolo(stem.id, isMultiSelect);
  }}
  disabled={!state.allLoaded}
  title={`Solo (Hold Ctrl/Cmd for multi-solo)`}
  className={stem.isSoloed ? 'bg-amber-500' : 'bg-neutral-700'}
>
  S
</button>
```

---

## Real-time Audio Update Pattern

### რატომ არ ვაჩერებთ playback-ს?

ტრადიციული მიდგომა:
```typescript
// ცუდი! ️
stop();
updateState();
play();
```

ჩვენი მიდგომა:
```typescript
// კარგი! ✅
gainNode.gain.value = newValue;  // მყისიერი ცვლილება
```

**GainNode.gain** არის **AudioParam** - ეს არის Web Audio API-ის სპეციალური ტიპი, რომელიც:
- ცვლილებას ახდენს **ატომარულად**
- არ წყვეტს აუდიო stream-ს
- Thread-safe (Audio thread vs Main thread)

### Value Smoothing

თუ გსურთ "smooth" transition (click artifacts-ის თავიდან ასაცილებლად):

```typescript
// მაგალითი (ჩვენ არ ვიყენებთ, მაგრამ სასარგებლო ცოდნაა)
gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
gainNode.gain.linearRampToValueAtTime(newValue, audioContext.currentTime + 0.01);
```

ეს 10ms-ში გლუვად გადავა ახალ მნიშვნელობაზე.

---

## ვიზუალური მდგომარეობები

### სტილების ცხრილი

| მდგომარეობა | CSS Class | ფერი |
|-------------|-----------|------|
| Solo ON | `bg-amber-500 text-black` | ყვითელი |
| Solo OFF | `bg-neutral-700 text-neutral-300` | ნაცრისფერი |
| Mute ON | `bg-red-500 text-white` | წითელი |
| Mute OFF | `bg-neutral-700 text-neutral-300` | ნაცრისფერი |
| Stem არ ისმის (not soloed) | waveform opacity: 50% | dimmed |

---

## Performance Considerations

### 1. useCallback Dependencies

```typescript
const toggleSolo = useCallback((stemId, isMultiSelect) => {
  // ...
}, [shouldStemBeAudible]);  // მხოლოდ ეს dependency
```

**რატომ არ არის `state` dependency-ში?**

- `setState` callback-ში ვიღებთ `prev` state-ს
- ეს უზრუნველყოფს ყოველთვის fresh data-ს
- თავიდან ვიცილებთ closure stale state პრობლემას

### 2. Map vs Array Lookup

```typescript
// O(1) - მყისიერი lookup
const gainNode = gainNodesRef.current.get(stem.id);

// O(n) - ეს იქნებოდა ნელი
// const gainNode = gainNodes.find(g => g.stemId === stem.id);
```

---

## ბოლო განახლება

2024-12-27 - Group Solo ლოგიკის დამატება მონიშნული სტემებისთვის

# GlobalPlayhead Component - დეტალური ტექნიკური აღწერა

## მდებარეობა

`app/components/studio/GlobalPlayhead.tsx`

## კონცეფცია

GlobalPlayhead არის Ableton-style ვერტიკალური ხაზი რომელიც:
- გადის რულერზე და ყველა ტრეკზე
- აჩვენებს მიმდინარე დაკვრის პოზიციას
- ფერს იცვლის loop region-ში (teal → amber)
- აქვს სამკუთხა "handle" ზემოთ

---

## Props Interface

```typescript
interface GlobalPlayheadProps {
  trackControlsWidth?: number;  // default: 224 (w-56)
}
```

**`trackControlsWidth`** - მარცხენა პანელის სიგანე პიქსელებში. ეს საჭიროა playhead-ის სწორი პოზიციონირებისთვის, რადგან waveform area იწყება ამ სიგანის შემდეგ.

---

## Context-დან მიღებული მნიშვნელობები

```typescript
const { state, loopEnabled, loopRegion } = useStudio();
```

| მნიშვნელობა | გამოყენება |
|-------------|------------|
| `state.allLoaded` | Guard - არ გამოჩნდეს სანამ არ ჩაიტვირთება |
| `state.masterDuration` | პროცენტის გამოსათვლელად |
| `state.currentTime` | მიმდინარე პოზიცია |
| `loopEnabled` | Loop აქტიურია? |
| `loopRegion` | Loop საზღვრები (start, end) |

---

## პოზიციის გამოთვლა

```typescript
// Playhead პოზიცია პროცენტებში (0-100)
const playheadPercent = (state.currentTime / state.masterDuration) * 100;
```

### CSS პოზიცია

```css
left: calc(224px + (100% - 224px) * 0.5)
```

**ახსნა:**
1. `224px` - track controls სიგანე (გამოვტოვებთ)
2. `(100% - 224px)` - waveform area სიგანე
3. `* 0.5` - 50% პოზიცია waveform area-ში

ეს formula უზრუნველყოფს რომ playhead მხოლოდ waveform area-ში მოძრაობს, არა track controls-ზე.

---

## ფერის ლოგიკა

```typescript
// შევამოწმოთ playhead loop region-შია თუ არა
const isInLoopRegion = loopEnabled &&
  loopRegion.end > loopRegion.start &&
  state.currentTime >= loopRegion.start &&
  state.currentTime <= loopRegion.end;

// ფერის არჩევა
const cursorColor = isInLoopRegion ? '#fbbf24' : '#14b8a6';
```

| პირობა | ფერი | Tailwind |
|--------|------|----------|
| Loop region-ში | `#fbbf24` | amber-400 |
| Loop region-ის გარეთ | `#14b8a6` | teal-500 |

**რატომ ფერის ცვლილება?**

ვიზუალური feedback - მომხმარებელს ეცოდინება რომ playhead loop-ის შიგნითაა და მალე დასაწყისზე დაბრუნდება.

---

## JSX სტრუქტურა

```tsx
<div
  className="absolute top-0 bottom-0 pointer-events-none z-30"
  style={{
    left: `calc(${trackControlsWidth}px + (100% - ${trackControlsWidth}px) * ${playheadPercent / 100})`,
    width: '2px',
    backgroundColor: cursorColor,
    boxShadow: `0 0 10px ${cursorColor}, 0 0 20px ${cursorColor}40`,
  }}
>
  {/* Triangle Handle */}
  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2">
    <div
      className="w-0 h-0 border-l-[7px] border-r-[7px] border-t-[9px] border-l-transparent border-r-transparent"
      style={{ borderTopColor: cursorColor }}
    />
  </div>
</div>
```

### სტილების ახსნა

| Property | მნიშვნელობა | მიზეზი |
|----------|-------------|--------|
| `pointer-events-none` | - | არ დაბლოკოს click-ები waveform-ზე |
| `z-30` | - | ყველაფრის ზემოთ |
| `width: 2px` | - | თხელი, მაგრამ ხილვადი |
| `boxShadow: glow` | - | გამორჩეული ვიზუალი |

### სამკუთხა Handle

CSS border trick-ით შექმნილი სამკუთხედი:

```css
border-l-[7px] border-r-[7px] border-t-[9px]
border-l-transparent border-r-transparent
border-top-color: cursorColor
```

ეს ქმნის ზემოთ მიმართულ სამკუთხედს.

---

## გამოყენება

```tsx
// studio.$productId.tsx

<div className="relative flex-1 overflow-y-auto">
  {/* Global Playhead - spans ruler and all tracks */}
  <GlobalPlayhead trackControlsWidth={224} />

  {/* TransportBar (ruler) */}
  <TransportBar />

  {/* Tracks */}
  {state.stems.map(stem => (
    <StudioTrack key={stem.id} stem={stem} />
  ))}
</div>
```

**მნიშვნელოვანი:** Parent container უნდა იყოს `position: relative` რომ absolute positioning-ი მუშაობდეს.

---

## Performance

### requestAnimationFrame

Playhead პოზიცია განახლდება `state.currentTime`-ით, რომელიც StudioContext-ში `requestAnimationFrame`-ით ახლდება (~60fps).

### No Re-renders on Hover

`pointer-events-none` უზრუნველყოფს რომ playhead-ზე hover არ იწვევს re-render-ს.

---

## ბოლო განახლება

2025-12-27 - საწყისი დოკუმენტაცია

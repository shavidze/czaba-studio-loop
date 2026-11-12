# Studio Layout არქიტექტურა

## კონცეფცია

Studio გვერდი არის DAW-ის (Digital Audio Workstation) სტილის ინტერფეისი. Layout-ის მთავარი პრინციპი: **კრიტიკული კონტროლები ყოველთვის ხელმისაწვდომი უნდა იყოს**, მაშინაც კი როცა კონტენტი scroll-ით გადაადგილდება.

---

## Layout სტრუქტურა

```
┌─────────────────────────────────────────────────────────────────┐
│                    STICKY HEADER                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ← Downloads   [▶][■] Play/Stop   Title   [selected] [?] │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ TransportBar (Loop Zone + Seek Zone + Time Markers)     │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                    SCROLLABLE CONTENT                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ▶ Video Sync (collapsible)                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │                      TRACKS                             │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## JSX სტრუქტურა

```tsx
// routes/studio.$productId.tsx

<div className="h-screen bg-background flex flex-col overflow-hidden">
  {/* Keyboard Shortcuts Modal - z-50, პორტალის მსგავსი */}
  <KeyboardShortcutsPanel ... />

  {/* ========== STICKY HEADER ========== */}
  <div className="sticky top-0 z-30 bg-surface border-b border-outline shadow-lg">
    {/* Transport Controls Row */}
    <div className="px-4 py-2 flex items-center justify-between border-b border-outline/50">
      {/* Left: Back Button */}
      <Link to="/account/downloads">
        <ArrowLeft /> Downloads
      </Link>

      {/* Center: Playback Controls */}
      <PlaybackControls />

      {/* Right: Status & Info */}
      <div>
        {selectedCount} | {snap} | {title} | [?]
      </div>
    </div>

    {/* Timeline Ruler */}
    <TransportBar />
  </div>

  {/* ========== SCROLLABLE CONTENT ========== */}
  <div className="flex-1 overflow-y-auto">
    {/* Video Sync - Collapsible */}
    <div className="bg-surface border-b">
      <button onClick={toggleExpand}>▶ Video Sync</button>
      {expanded && <VideoPlayer ... />}
    </div>

    {/* Tracks Area */}
    <div className="relative bg-background">
      <GlobalPlayhead ... />
      <StudioTrackList />
    </div>
  </div>
</div>
```

---

## CSS Patterns

### 1. Sticky Header

```tsx
<div className="sticky top-0 z-30 ...">
```

**რა ხდება:**
- `sticky` - element "მიეწებება" container-ის ზედა კიდეს scroll-ის დროს
- `top-0` - რა მანძილზე container-ის ზემოდან (0 = პირდაპირ ზემოთ)
- `z-30` - z-index, რომ სხვა elements-ზე მაღლა იყოს

**რატომ `sticky` და არა `fixed`?**

| `position: fixed` | `position: sticky` |
|-------------------|--------------------|
| Viewport-თან დაკავშირებული | Container-თან დაკავშირებული |
| Layout-დან ამოვარდება | Layout-ში რჩება |
| Width ხელით უნდა დავსვათ | Width ავტომატურია |

### 2. Scrollable Container

```tsx
<div className="flex-1 overflow-y-auto">
```

**რა ხდება:**
- `flex-1` - დარჩენილი სივრცის აღება (`flex-grow: 1`)
- `overflow-y-auto` - vertical scroll ჩნდება საჭიროებისამებრ

### 3. Full-height Layout

```tsx
<div className="h-screen ... flex flex-col overflow-hidden">
```

**რა ხდება:**
- `h-screen` - viewport-ის სრული სიმაღლე (100vh)
- `flex flex-col` - შვილები ვერტიკალურად ლაგდება
- `overflow-hidden` - parent-ის საზღვრებს გარეთ არაფერი გადის

**რატომ `overflow-hidden` parent-ზე?**

თუ არ დავსვამთ, sticky child-ს შეიძლება პრობლემები ჰქონდეს. ეს უზრუნველყოფს რომ scroll მხოლოდ შიდა container-ში ხდება.

---

## GlobalPlayhead Integration

### პოზიციონირება

```tsx
<div className="relative bg-background">
  <GlobalPlayhead trackControlsWidth={224} />
  <StudioTrackList />
</div>
```

**რატომ `relative` parent?**

GlobalPlayhead იყენებს `absolute` პოზიციონირებას. `absolute` element-ს სჭირდება "საყრდენი" - უახლოესი parent `position: relative`-ით.

**`trackControlsWidth={224}`?**

ეს არის მარცხენა პანელის სიგანე (w-56 = 224px). Playhead-მა უნდა იცოდეს საიდან იწყება waveform ზონა.

---

## Header-ის დამალვა Studio-ში

### root.tsx ცვლილება

```tsx
// app/root.tsx

function AppContent() {
  const location = useLocation();

  // Studio გვერდზე header და სხვა global UI იმალება
  const isStudioPage = location.pathname.startsWith('/studio');

  return (
    <>
      {!isStudioPage && <Header ... />}
      <Outlet />
      {!isStudioPage && (
        <>
          <AudioPlayer />
          <StemsPlayerModal />
          <AuthModal />
          <LeadMagnetPopup ... />
        </>
      )}
      <ToastContainer />  {/* ეს ყოველთვის ჩანს */}
    </>
  );
}
```

**რატომ `useLocation`?**

Remix-ში `useLocation` hook აბრუნებს მიმდინარე URL-ის ინფორმაციას:
- `pathname` - `/studio/product-123`
- `search` - `?param=value`
- `hash` - `#section`

**რატომ `startsWith('/studio')`?**

Studio route-ები შეიძლება იყოს:
- `/studio/product-id-1`
- `/studio/product-id-2`

ყველა უნდა დაემალოს header-ს.

---

## z-index იერარქია

| Element | z-index | მიზეზი |
|---------|---------|--------|
| KeyboardShortcutsPanel | z-50 | Modal - ყველაზე წინ |
| Sticky Header | z-30 | Scroll-ის დროს ზემოთ რჩება |
| GlobalPlayhead | z-10 | Tracks-ზე ზემოთ, header-ზე ქვემოთ |
| Tracks | z-0 | ბაზისური layer |

---

## Responsive Considerations

### მობილურზე

ამჟამად Studio არ არის მობილურზე ოპტიმიზირებული. DAW-ები ჩვეულებრივ desktop-ზეა განკუთვნილი.

თუ მომავალში დაგჭირდება:

```tsx
// მაგალითი (არ არის იმპლემენტირებული)
<div className="hidden md:flex">
  {/* Desktop layout */}
</div>
<div className="md:hidden">
  {/* Mobile fallback */}
  <p>Please use desktop for best experience</p>
</div>
```

---

## Performance Tips

### 1. Collapsible Sections

```tsx
{state.videoPanelExpanded && (
  <VideoPlayer ... />
)}
```

როცა Video Sync დაკეცილია, VideoPlayer არ რენდერდება საერთოდ. ეს ზოგავს:
- Memory (video element)
- CPU (video decoding)
- GPU (rendering)

### 2. Track Virtualization (მომავლისთვის)

თუ ბევრი track-ია (50+), შეიძლება დაგჭირდეს virtualization:

```tsx
// მაგალითი react-window-ით
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={containerHeight}
  itemCount={stems.length}
  itemSize={100}  // track height
>
  {({ index, style }) => (
    <StudioTrack stem={stems[index]} style={style} />
  )}
</FixedSizeList>
```

---

## ბოლო განახლება

2024-12-27 - Sticky header layout + Header hiding for Studio

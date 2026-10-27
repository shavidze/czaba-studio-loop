# Audio Player — კომპონენტის სპეციფიკაცია

## არქიტექტურა: 3-Layer System

```
┌─────────────────────────────────┐
│      StudioContext              │
│  სრული DAW: Timeline, Loop,    │
│  Trim, Solo/Mute, Export        │
│  Route: /studio/:handle         │
└───────────┬─────────────────────┘
            │ extends
            ▼
┌─────────────────────────────────┐
│      StemsContext               │
│  Modal: Multi-stem playback     │
│  Volume control, Waveforms      │
└───────────┬─────────────────────┘
            │ extends
            ▼
┌─────────────────────────────────┐
│      AudioContext               │
│  Simple: Single track play      │
│  Play/Pause, Seek, Volume       │
└─────────────────────────────────┘
```

---

## Layer 1: AudioPlayer (Simple)

**ფაილი:** `app/components/audio/AudioPlayer.tsx`

### ვიზუალი

```
┌─────────────────────────────────────────────┐
│  ▶  Track Title — Artist    ━━━━━━○━━━  🔊  │
│     Category                 2:34 / 4:12     │
└─────────────────────────────────────────────┘
```

### ელემენტები

| ელემენტი | აღწერა |
|---------|--------|
| Play/Pause | IconButton, brand variant |
| Track Info | სათაური + კატეგორია |
| Progress Bar | Seekable timeline |
| Time Display | `mm:ss / mm:ss` format |
| Volume | Slider + mute toggle |

### სტილები

- Background: `var(--color-surface)`
- Position: fixed bottom
- Height: ~64px
- Border-top: `1px var(--color-outline)`
- Z-index: 100

---

## Layer 2: StemsPlayerModal

**ფაილი:** `app/components/audio/StemsPlayerModal.tsx`

### ვიზუალი

```
┌────────────────────────────────────┐
│  Track Title                    ✕  │
├────────────────────────────────────┤
│                                    │
│  🔊 ━━━━ Drums     ████████████   │
│  🔊 ━━━━ Bass      ████████████   │
│  🔊 ━━━━ Melody    ████████████   │
│  🔊 ━━━━ Strings   ████████████   │
│  🔊 ━━━━ FX        ████████████   │
│                                    │
│  ▶ ━━━━━━━━━━━━━━○━━━━━ 2:34      │
│                                    │
│  [Open in Studio]                  │
└────────────────────────────────────┘
```

### StemControl

**ფაილი:** `app/components/audio/StemControl.tsx`

| ელემენტი | აღწერა |
|---------|--------|
| Mute Toggle | Volume icon, click to mute |
| Volume Slider | 0-100%, horizontal |
| Stem Name | "Drums", "Bass", "Melody"... |
| Waveform | ვიზუალიზაცია |

---

## Layer 3: Studio (DAW)

**Route:** `/studio/:handle`

### ელემენტები

#### TransportBar

```
┌─────────────────────────────────────────────────┐
│  ⏮  ▶  ⏭   │  00:00 / 04:12  │  🔄 Loop  ✂ Trim │
└─────────────────────────────────────────────────┘
```

- PlaybackControls: Play/Pause/Stop + Skip
- Time Display: `mm:ss` format
- Loop Toggle: brand color when active
- Trim Toggle: region selection mode

#### StudioTrack

```
┌────┬────────────────────────────────────┐
│ 🔊 │ ████████████████████████████████   │
│ S M │ Drums                              │
└────┴────────────────────────────────────┘
```

| ელემენტი | აღწერა |
|---------|--------|
| Volume | Vertical slider |
| Solo (S) | მხოლოდ ეს სტემი |
| Mute (M) | ამ სტემის გათიშვა |
| Waveform | WaveSurfer.js ვიზუალიზაცია |
| Name | სტემის სახელი |

#### Timeline + Playhead

- GlobalPlayhead: vertical line, brand color
- ScrubZone: click/drag for seeking
- Time markers: ყოველ 10 წამში
- Region selection: trim mode-ში

---

## Stem Interface

```typescript
interface Stem {
  id: string;
  name: string;           // "Drums", "Bass", "Melody"
  url: string;            // R2 signed URL
  volume: number;         // 0-1
  isMuted: boolean;
  isSolo: boolean;
  waveform: number[];     // pre-computed peaks
}
```

---

## WaveForm Component

**ფაილი:** `app/components/audio/WaveForm.tsx`

- 50 bars ანიმაციური ვიზუალიზაცია
- Active/Playing state: brand color bars
- Inactive: muted color bars
- ანიმაცია: random height changes

---

## ExportDialog

**ფაილი:** `app/components/studio/ExportDialog.tsx`

| ფორმატი | აღწერა |
|---------|--------|
| WAV | Lossless, ორიგინალი ხარისხი |
| MP3 | Compressed, FFmpeg.wasm-ით |

### Export Flow

```
1. მომხმარებელი ირჩევს ფორმატს
2. Trim region (optional) → start/end time
3. Volume levels → per-stem mix
4. Client-side processing (Web Audio API)
5. FFmpeg.wasm encoding (MP3)
6. Download trigger
```

---

## ფერები და სტილები

| ელემენტი | ფერი |
|---------|------|
| Play button (active) | `var(--color-brand)` |
| Waveform (playing) | `var(--color-brand)` gradient |
| Waveform (inactive) | `var(--color-muted)` |
| Playhead | `var(--color-brand)` |
| Volume slider | `var(--color-brand)` |
| Muted stem | `var(--color-dim)` |
| Solo indicator | `var(--color-accent)` |
| Timeline bg | `var(--color-elevated)` |
| Progress bar | `var(--color-brand)` / `var(--color-outline)` |

---

## Loading States

### StemsLoadingAnimation

ფაილი: `app/components/studio/StemsLoadingAnimation.tsx`

```
Loading stems...
━━━━━━━━━━━━━━━ 60%
[Animated waveform placeholder]
```

- Skeleton waveforms shimmer ეფექტით
- Progress indicator per-stem
- "Loading stems..." ტექსტი

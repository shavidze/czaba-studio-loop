---
name: wavesurfer-js
description: WaveSurfer.js v7 waveform visualization with regions plugin for trim functionality. Use when working on waveform display, audio visualization, or trim/region features in Studio.
---

# WaveSurfer.js v7

WaveSurfer.js v7 - waveform visualization with regions plugin for trim functionality.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    WaveSurfer Integration                    │
│                                                              │
│  ┌──────────────┐     ┌──────────────┐     ┌─────────────┐ │
│  │   AudioURL   │────▶│  WaveSurfer  │────▶│  Waveform   │ │
│  └──────────────┘     └──────┬───────┘     └─────────────┘ │
│                              │                              │
│                              ▼                              │
│                       ┌──────────────┐                      │
│                       │   Regions    │                      │
│                       │   Plugin     │                      │
│                       └──────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

## Basic Setup

```typescript
import WaveSurfer from "wavesurfer.js";

const wavesurfer = WaveSurfer.create({
  container: "#waveform",
  waveColor: "#a3a3a3",
  progressColor: "#262626",
  cursorColor: "#262626",
  cursorWidth: 2,
  height: 80,
  barWidth: 2,
  barGap: 1,
  barRadius: 2,
  normalize: true,
  backend: "WebAudio",
});

wavesurfer.load("/audio/track.mp3");
wavesurfer.loadBlob(audioBlob);
```

## Regions Plugin (Trim)

```typescript
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";

const regions = RegionsPlugin.create();

const wavesurfer = WaveSurfer.create({
  container: "#waveform",
  plugins: [regions],
});

wavesurfer.on("ready", () => {
  regions.addRegion({
    id: "trim",
    start: 0,
    end: wavesurfer.getDuration(),
    color: "rgba(38, 38, 38, 0.2)",
    drag: true,
    resize: true,
  });
});

regions.on("region-updated", (region) => {
  onTrimChange({ start: region.start, end: region.end });
});
```

## Playback Control

```typescript
wavesurfer.playPause();
wavesurfer.play(startTime, endTime);
wavesurfer.seekTo(0.5);
wavesurfer.setTime(30);

const currentTime = wavesurfer.getCurrentTime();
const duration = wavesurfer.getDuration();

wavesurfer.on("play", () => setIsPlaying(true));
wavesurfer.on("pause", () => setIsPlaying(false));
wavesurfer.on("timeupdate", (time) => setCurrentTime(time));
wavesurfer.on("finish", () => setIsPlaying(false));
```

## Sync with External Audio

```typescript
class WaveformSync {
  private wavesurfer: WaveSurfer;
  private audioEngine: AudioEngine;

  syncToAudioEngine() {
    this.wavesurfer.setOptions({ media: null });

    this.audioEngine.onTimeUpdate = (time) => {
      const progress = time / this.audioEngine.duration;
      this.wavesurfer.seekTo(progress);
    };
  }

  play() {
    this.audioEngine.play();
  }
}
```

## React Integration

```typescript
import { useRef, useEffect } from "react";
import WaveSurfer from "wavesurfer.js";

function Waveform({ url, onReady }: { url: string; onReady?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#a3a3a3",
      progressColor: "#262626",
      height: 80,
    });

    ws.load(url);
    ws.on("ready", () => onReady?.());

    wavesurferRef.current = ws;

    return () => {
      ws.destroy();
    };
  }, [url]);

  return <div ref={containerRef} />;
}
```

## Styling

```typescript
WaveSurfer.create({
  container: "#waveform",
  waveColor: "#a3a3a3",
  progressColor: "#262626",
  cursorColor: "#262626",
  height: 80,
  cursorWidth: 2,
  barWidth: 2,
  barGap: 1,
  barRadius: 2,
  normalize: true,
  responsive: true,
  fillParent: true,
});
```

## Region Styling

```typescript
regions.addRegion({
  id: "trim",
  start: 10,
  end: 30,
  color: "rgba(38, 38, 38, 0.2)",
  drag: true,
  resize: true,
  content: "Trim Region",
});
```

## Performance Tips

1. **Use `barWidth`** - bars render faster than lines
2. **Set `normalize: true`** - consistent visual amplitude
3. **Destroy on unmount** - prevent memory leaks
4. **Debounce region updates** - don't save on every pixel move
5. **Use backend: "WebAudio"** - better performance

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| No waveform | CORS | Configure audio server CORS |
| Clicks on seek | Buffer not ready | Wait for `ready` event |
| Memory leak | Not destroyed | Call `destroy()` on unmount |
| Region not visible | Wrong z-index | Check CSS stacking |

## References

- [WaveSurfer.js v7 Docs](https://wavesurfer.xyz/)
- [Regions Plugin](https://wavesurfer.xyz/docs/plugins/regions)
- `docs/technical/studio.md` - CZABA Studio waveform

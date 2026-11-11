---
name: ffmpeg-wasm
description: FFmpeg.wasm client-side audio processing - WAV to MP3 conversion for Studio export. Use when working on audio export, format conversion, or trim functionality.
---

# FFmpeg.wasm

FFmpeg.wasm - client-side audio/video processing. WAV to MP3 conversion for Studio export.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FFmpeg.wasm Flow                          │
│                                                              │
│  ┌──────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │ AudioBlob│────▶│  FFmpeg WASM │────▶│  MP3 Blob    │    │
│  │  (WAV)   │     │  (Browser)   │     │  (Download)  │    │
│  └──────────┘     └──────────────┘     └──────────────┘    │
│                          │                                   │
│                          ▼                                   │
│                   ┌──────────────┐                          │
│                   │ Virtual FS   │                          │
│                   │ (in-memory)  │                          │
│                   └──────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

## Installation

```bash
npm install @ffmpeg/ffmpeg @ffmpeg/util
```

## Basic Setup

```typescript
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const ffmpeg = new FFmpeg();

async function loadFFmpeg() {
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });
}

ffmpeg.on("progress", ({ progress }) => {
  console.log(`${Math.round(progress * 100)}%`);
});
```

## WAV to MP3 Conversion

```typescript
async function convertToMp3(wavBlob: Blob): Promise<Blob> {
  if (!ffmpeg.loaded) {
    await loadFFmpeg();
  }

  await ffmpeg.writeFile("input.wav", await fetchFile(wavBlob));

  await ffmpeg.exec([
    "-i", "input.wav",
    "-codec:a", "libmp3lame",
    "-b:a", "320k",
    "output.mp3"
  ]);

  const data = await ffmpeg.readFile("output.mp3");

  await ffmpeg.deleteFile("input.wav");
  await ffmpeg.deleteFile("output.mp3");

  return new Blob([data], { type: "audio/mpeg" });
}
```

## Common Audio Commands

### MP3 Encoding
```typescript
await ffmpeg.exec(["-i", "input.wav", "-codec:a", "libmp3lame", "-b:a", "320k", "output.mp3"]);

await ffmpeg.exec(["-i", "input.wav", "-codec:a", "libmp3lame", "-q:a", "0", "output.mp3"]);
```

### Trim Audio
```typescript
await ffmpeg.exec(["-i", "input.wav", "-ss", "10", "-t", "20", "-c", "copy", "output.wav"]);
```

### Change Sample Rate
```typescript
await ffmpeg.exec(["-i", "input.wav", "-ar", "44100", "output.wav"]);
```

### Normalize Volume
```typescript
await ffmpeg.exec(["-i", "input.wav", "-filter:a", "loudnorm", "output.wav"]);
```

## React Integration

```typescript
import { useState, useRef } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

function useFFmpeg() {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  const load = async () => {
    if (ffmpegRef.current?.loaded) return;

    const ffmpeg = new FFmpeg();
    ffmpegRef.current = ffmpeg;

    ffmpeg.on("progress", ({ progress }) => {
      setProgress(Math.round(progress * 100));
    });

    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });

    setLoaded(true);
  };

  const convertToMp3 = async (wavBlob: Blob): Promise<Blob> => {
    if (!ffmpegRef.current) throw new Error("FFmpeg not loaded");

    const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile("input.wav", await fetchFile(wavBlob));
    await ffmpeg.exec(["-i", "input.wav", "-b:a", "320k", "output.mp3"]);
    const data = await ffmpeg.readFile("output.mp3");

    await ffmpeg.deleteFile("input.wav");
    await ffmpeg.deleteFile("output.mp3");

    return new Blob([data], { type: "audio/mpeg" });
  };

  return { load, loaded, progress, convertToMp3 };
}
```

## Studio Export Flow

```typescript
async function exportMixdown(
  audioBuffer: AudioBuffer,
  format: "wav" | "mp3"
): Promise<Blob> {
  const wavBlob = await renderToWav(audioBuffer);

  if (format === "mp3") {
    const ffmpeg = await getFFmpeg();
    return await convertToMp3(ffmpeg, wavBlob);
  }

  return wavBlob;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

## Performance Tips

1. **Load once** - FFmpeg WASM is ~30MB, load only when needed
2. **Show progress** - Use progress callback for UX
3. **Clean up files** - Delete from virtual FS after use
4. **Use Web Workers** - Offload heavy processing
5. **Cache core files** - Use service worker for faster reloads

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| SharedArrayBuffer error | COOP/COEP headers | Set proper headers or use single-threaded |
| Slow loading | Large WASM file | Lazy load, show loading state |
| Out of memory | Large files | Process in chunks, increase memory |
| No audio output | Wrong codec | Check codec availability |

## COOP/COEP Headers

```typescript
// vite.config.ts
export default {
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
};
```

## References

- [FFmpeg.wasm Docs](https://ffmpegwasm.netlify.app/)
- [FFmpeg Command Reference](https://ffmpeg.org/ffmpeg.html)
- `docs/technical/studio.md` - CZABA export system

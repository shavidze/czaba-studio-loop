---
name: web-audio-api
description: Web Audio API patterns for CZABA Personal Mixdown Studio - audio playback, stem mixing, volume control, waveform generation. Use when working on Studio, audio engine, or playback features.
---

# Web Audio API

Web Audio API for CZABA Personal Mixdown Studio - audio playback, stem mixing, real-time effects.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Audio Engine                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Source    │  │   Source    │  │   Source    │         │
│  │  (Drums)    │  │   (Bass)    │  │  (Melody)   │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│         ▼                ▼                ▼                 │
│  ┌──────────────────────────────────────────────┐          │
│  │              Gain Nodes (Volume)              │          │
│  │         (Solo/Mute per track)                │          │
│  └──────────────────────┬───────────────────────┘          │
│                         │                                   │
│                         ▼                                   │
│              ┌─────────────────────┐                        │
│              │    Master Gain      │                        │
│              └──────────┬──────────┘                        │
│                         │                                   │
│                         ▼                                   │
│              ┌─────────────────────┐                        │
│              │   AudioContext      │                        │
│              │   .destination      │                        │
│              └─────────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

## Key Concepts

- **AudioContext** — initialize on user interaction (autoplay policy)
- **AudioBufferSourceNode** — one-shot: create new source for each play()
- **GainNode** — per-track volume + master volume
- **Solo/Mute** — when any track is solo, mute all non-solo tracks
- **Time tracking** — use `requestAnimationFrame`, not `setInterval`
- **Memory** — disconnect and nullify sources on stop, close context on dispose

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| No sound | Context suspended | Call `resume()` on user interaction |
| Playback glitches | Buffer underrun | Pre-load all audio before playing |
| Memory leak | Sources not cleaned | Disconnect and nullify on stop |
| Timing drift | Using setInterval | Use requestAnimationFrame |
| CORS error | Audio from different origin | Configure CORS on server |

## Performance Tips

1. **Pre-load all stems** before allowing playback
2. **Use Web Workers** for waveform generation
3. **Cache decoded buffers** - don't decode repeatedly
4. **Limit concurrent tracks** - 8-12 max for smooth playback
5. **Use lower sample rate** for previews (44.1kHz is fine)

## Implementation Details

Full code templates: `references/audio-engine.md`

## References

- [Web Audio API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Autoplay Policy](https://developer.chrome.com/blog/autoplay/)
- `docs/technical/architecture/audio-system.md` - CZABA audio architecture
- `.claude/primitives/AUDIO_ARCHITECTURE.md` - Audio patterns

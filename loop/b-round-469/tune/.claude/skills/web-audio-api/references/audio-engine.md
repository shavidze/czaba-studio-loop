# AudioEngine Implementation Reference

## AudioEngine Class

```typescript
class AudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private tracks: Map<string, AudioTrack> = new Map();
  private isPlaying = false;
  private currentTime = 0;
  private duration = 0;

  async initialize(): Promise<void> {
    if (this.context) return;
    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);
  }

  async resume(): Promise<void> {
    if (this.context?.state === 'suspended') {
      await this.context.resume();
    }
  }
}
```

## Loading Audio

```typescript
interface AudioTrack {
  buffer: AudioBuffer;
  source: AudioBufferSourceNode | null;
  gainNode: GainNode;
  isMuted: boolean;
  isSolo: boolean;
  volume: number;
}

async loadTrack(id: string, url: string): Promise<void> {
  if (!this.context) throw new Error('AudioEngine not initialized');

  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await this.context.decodeAudioData(arrayBuffer);

  const gainNode = this.context.createGain();
  gainNode.connect(this.masterGain!);

  this.tracks.set(id, {
    buffer: audioBuffer,
    source: null,
    gainNode,
    isMuted: false,
    isSolo: false,
    volume: 1
  });

  this.duration = Math.max(this.duration, audioBuffer.duration);
}
```

## Playback Control

```typescript
play(startTime = 0): void {
  if (!this.context || this.isPlaying) return;

  this.tracks.forEach((track, id) => {
    const source = this.context!.createBufferSource();
    source.buffer = track.buffer;
    source.connect(track.gainNode);
    source.start(0, startTime);
    track.source = source;
  });

  this.isPlaying = true;
  this.currentTime = startTime;
  this.startTimeTracking();
}

pause(): void {
  if (!this.isPlaying) return;

  this.tracks.forEach(track => {
    track.source?.stop();
    track.source = null;
  });

  this.isPlaying = false;
  this.stopTimeTracking();
}

seek(time: number): void {
  const wasPlaying = this.isPlaying;
  this.pause();
  this.currentTime = Math.max(0, Math.min(time, this.duration));

  if (wasPlaying) {
    this.play(this.currentTime);
  }
}
```

## Volume & Solo/Mute

```typescript
setTrackVolume(id: string, volume: number): void {
  const track = this.tracks.get(id);
  if (!track) return;

  track.volume = Math.max(0, Math.min(1, volume));
  this.updateTrackGain(id);
}

toggleMute(id: string): void {
  const track = this.tracks.get(id);
  if (!track) return;

  track.isMuted = !track.isMuted;
  this.updateTrackGain(id);
}

toggleSolo(id: string): void {
  const track = this.tracks.get(id);
  if (!track) return;

  track.isSolo = !track.isSolo;
  this.tracks.forEach((_, trackId) => this.updateTrackGain(trackId));
}

private updateTrackGain(id: string): void {
  const track = this.tracks.get(id);
  if (!track) return;

  const hasSolo = Array.from(this.tracks.values()).some(t => t.isSolo);

  let gain = track.volume;

  if (track.isMuted) {
    gain = 0;
  } else if (hasSolo && !track.isSolo) {
    gain = 0;
  }

  track.gainNode.gain.setValueAtTime(gain, this.context!.currentTime);
}
```

## Time Tracking

```typescript
private animationFrame: number | null = null;
private startTimestamp: number = 0;

private startTimeTracking(): void {
  this.startTimestamp = performance.now() - (this.currentTime * 1000);

  const update = () => {
    if (!this.isPlaying) return;

    const elapsed = (performance.now() - this.startTimestamp) / 1000;
    this.currentTime = elapsed;

    if (this.currentTime >= this.duration) {
      if (this.isLooping) {
        this.seek(0);
        this.play(0);
      } else {
        this.pause();
        this.currentTime = 0;
      }
    }

    this.onTimeUpdate?.(this.currentTime);
    this.animationFrame = requestAnimationFrame(update);
  };

  this.animationFrame = requestAnimationFrame(update);
}

private stopTimeTracking(): void {
  if (this.animationFrame) {
    cancelAnimationFrame(this.animationFrame);
    this.animationFrame = null;
  }
}
```

## Waveform Visualization

```typescript
interface WaveformData {
  peaks: number[];
  length: number;
}

function generateWaveform(buffer: AudioBuffer, samples: number): number[] {
  const channelData = buffer.getChannelData(0);
  const blockSize = Math.floor(channelData.length / samples);
  const peaks: number[] = [];

  for (let i = 0; i < samples; i++) {
    const start = i * blockSize;
    let max = 0;

    for (let j = 0; j < blockSize; j++) {
      const value = Math.abs(channelData[start + j]);
      if (value > max) max = value;
    }

    peaks.push(max);
  }

  return peaks;
}
```

## Browser Autoplay Policy

```typescript
function AudioInitButton() {
  const [isReady, setIsReady] = useState(false);

  const handleClick = async () => {
    await audioEngine.initialize();
    await audioEngine.resume();
    setIsReady(true);
  };

  if (isReady) {
    return <AudioPlayer />;
  }

  return (
    <button onClick={handleClick}>
      Click to enable audio
    </button>
  );
}
```

## Memory Management

```typescript
useEffect(() => {
  return () => {
    audioEngine.dispose();
  };
}, []);

dispose(): void {
  this.pause();
  this.tracks.forEach(track => {
    track.source?.disconnect();
    track.gainNode.disconnect();
  });
  this.tracks.clear();
  this.masterGain?.disconnect();
  this.context?.close();
  this.context = null;
}
```

// Audio Player Types

export interface AudioStem {
  id: string;
  name: string; // e.g., "Drums", "Bass", "Vocals", "Melody"
  audioUrl: string; // CDN URL (Cloudflare/AWS)
  order: number; // Display order
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  imageUrl: string;
  productHandle: string;
  stems?: AudioStem[]; // Optional - only for Premium tracks with stems
}

export interface AudioState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  queue: Track[];
  queueIndex: number;
}

export interface AudioContextValue {
  state: AudioState;
  play: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  togglePlayPause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  addToQueue: (track: Track) => void;
  skipNext: () => void;
  skipPrevious: () => void;
  clearQueue: () => void;
}

import type { AudioStem } from './audio';

// Extended stem state for studio editing
export interface StudioStemState extends AudioStem {
  // Playback controls (from StemsContext)
  isMuted: boolean;
  isSoloed: boolean;
  isLoaded: boolean;

  // Trim points (in seconds)
  trimStart: number; // Default: 0
  trimEnd: number; // Default: duration

  // Waveform data
  duration: number; // Total duration of audio file
  peaks: number[]; // Waveform peaks for visualization

  // Volume control (0-1)
  volume: number; // Default: 1.0

  // UI state
  trackHeight: number; // Track height in pixels (default: 100)

  // Per-stem loop region (null = no loop, plays full track)
  loopRegion: StemLoopRegion | null;
}

// Studio edit state (saved to Firestore)
export interface StudioEditState {
  productId: string;
  userId: string;
  stems: {
    id: string;
    name: string;
    trimStart: number;
    trimEnd: number;
    isMuted: boolean;
    isSoloed: boolean;
    volume: number;
  }[];
  lastModified: string; // ISO timestamp
  version: number; // For migration/versioning
}

// Export configuration
export interface ExportConfig {
  format: 'mp3' | 'wav';
  quality: 'low' | 'medium' | 'high';
  includedStemIds: string[]; // Which stems to include in export
  normalize: boolean; // Normalize output volume
}

// Export quality settings
export const EXPORT_QUALITY_SETTINGS = {
  mp3: {
    low: { bitrate: '128k' },
    medium: { bitrate: '192k' },
    high: { bitrate: '320k' },
  },
  wav: {
    low: { sampleRate: 44100, bitDepth: 16 },
    medium: { sampleRate: 48000, bitDepth: 24 },
    high: { sampleRate: 48000, bitDepth: 32 },
  },
} as const;

// Product with stems (for loader data)
export interface ProductWithStems {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  stems: AudioStem[];
  downloads?: {
    premiumUrl?: string; // Premium Licensed ZIP from R2
    standardUrl?: string; // Standard Licensed ZIP from R2
  };
  userLicense?: 'premium' | 'standard' | 'universal' | null; // User's purchased license
}

// Video metadata extracted from uploaded file
export interface VideoMetadata {
  size: number; // File size in bytes
  format: string; // MIME type (e.g., 'video/mp4')
  resolution?: string; // Display resolution (e.g., '1920x1080')
  width?: number; // Video width in pixels
  height?: number; // Video height in pixels
}

// Video state for session-based video sync
export interface VideoState {
  blobUrl: string | null; // Blob URL for uploaded video or YouTube embed URL
  file: File | null; // Original File object
  duration: number; // Video duration in seconds
  isLoaded: boolean; // Video loaded and ready
  isUploading: boolean; // File being processed
  uploadProgress: number; // 0-100 progress percentage
  metadata: VideoMetadata | null; // Video metadata
  startOffset: number; // Time in music timeline where video starts (seconds)
  isYouTube?: boolean; // Whether this is a YouTube embed
  youtubeId?: string; // YouTube video ID
}

// ==========================================
// ABLETON-STYLE UX TYPES
// ==========================================

// Selection mode for multi-select
export type SelectionMode = 'replace' | 'add' | 'toggle' | 'range';

// History entry for undo/redo
export interface HistoryEntry {
  id: string; // Unique ID for this entry
  type: 'mute' | 'solo' | 'loop' | 'volume' | 'trim' | 'selection' | 'batch';
  description: string; // Human-readable description
  stemIds: string[]; // Affected stem IDs
  prevState: Partial<StudioStemState>[]; // Previous state of affected stems
  newState: Partial<StudioStemState>[]; // New state of affected stems
  timestamp: number;
}

// Snap grid settings
export interface SnapSettings {
  enabled: boolean;
  gridSize: number; // in seconds (0.25, 0.5, 1, 2, 4)
}

// Global loop region (Ableton-style loop brace)
export interface LoopRegion {
  start: number; // Loop start time in seconds
  end: number; // Loop end time in seconds
}

// Time selection on waveform (for setting loop region via Ctrl+L)
export interface TimeSelection {
  stemId: string | null; // Which stem the selection is on
  start: number; // Selection start time in seconds
  end: number; // Selection end time in seconds
  isActive: boolean; // Whether there's an active selection
}

// Per-stem loop region
export interface StemLoopRegion {
  start: number; // Loop start time in seconds
  end: number; // Loop end time in seconds
}

// Asset Type System for Music, SFX, and Presets

export type AssetType = 'music' | 'sfx' | 'preset';

export interface BaseAsset {
  id: string;
  title: string;
  type: AssetType;
  duration?: string;
  image: string;
  audioUrl?: string | null;
  handle: string;
  isNew: boolean;
  isPremium: boolean;
}

export interface MusicAsset extends BaseAsset {
  type: 'music';
  artist: string;
  featuredArtist?: string;
  genre: string;
  subGenres: string[];
  bpm: number;
  key?: string;
}

export interface SFXAsset extends BaseAsset {
  type: 'sfx';
  category: string; // Impact, Whoosh, Foley, etc.
  tags: string[];
  price?: string; // Display price (optional for mock data)
  soundCount?: number; // Number of sounds in pack
  previewUrl?: string; // Audio preview URL
}

export interface PresetAsset extends BaseAsset {
  type: 'preset';
  software: string; // Xfer Serum, Vital, Omnisphere
  category: string; // Bass, Lead, Pad, etc.
  tags: string[];
}

export type Asset = MusicAsset | SFXAsset | PresetAsset;

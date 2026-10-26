// Filter Options Data

export const GENRES = [
  'Acoustic',
  'Ambient',
  'Blues',
  'Children',
  'Cinematic',
  'Classical',
  'Corporate',
  'Country',
  'Electronic',
  'Fantasy',
  'Folk',
  'Funk',
  'Hip Hop',
  'Holiday',
  'Indie',
  'Jazz',
  'Latin',
  'Lofi & Chill Beats',
  'Lounge',
  'Pop',
  'Reggae',
  'Retro',
  'Rock',
  'Singer-Songwriter',
  'Soul & RnB',
  'World',
  'Worship',
] as const;

export const SUBGENRES = [
  'Worship',
  'Holiday',
  'World',
  'Latin',
  'Lounge',
  'Retro',
  'Lofi & Chill Beats',
  'Electronic',
  'Acoustic',
  'Orchestral',
  'Epic',
  'Ambient',
  'Trap',
  'Beat',
  'Industrial',
  'Folk',
] as const;

export const SFX_CATEGORIES = [
  'Impact',
  'Whoosh',
  'Foley',
  'Ambience',
  'UI',
  'Transition',
  'Nature',
  'Weapon',
  'Vehicle',
  'Sci-Fi',
  'Horror',
  'Cartoon',
] as const;

export const SFX_TAGS = [
  'Cinematic',
  'Hit',
  'Boom',
  'Laser',
  'Weapon',
  'Footsteps',
  'Wood',
  'Walking',
  'Tension',
  'Rise',
  'Glass',
  'Break',
  'Destruction',
  'Explosion',
  'Magic',
  'Technology',
] as const;

export const PRESET_SOFTWARE = [
  'Xfer Serum',
  'Vital',
  'Omnisphere',
  'Diva',
  'Kontakt',
  'Massive X',
  'Pigments',
  'Phase Plant',
  'Analog Lab',
] as const;

export const PRESET_CATEGORIES = [
  'Bass',
  'Lead',
  'Pad',
  'Keys',
  'Pluck',
  'Strings',
  'Brass',
  'Drums',
  'FX',
  'Arp',
  'Synth',
] as const;

export const INSTRUMENTS = [
  'Piano',
  'Guitar',
  'Drums',
  'Strings',
  'Synth',
  'Bass',
  'Vocals',
  'Brass',
  'Woodwinds',
  'Percussion',
  'Orchestra',
] as const;

export type Genre = (typeof GENRES)[number];
export type SubGenre = (typeof SUBGENRES)[number];
export type SFXCategory = (typeof SFX_CATEGORIES)[number];
export type SFXTag = (typeof SFX_TAGS)[number];
export type PresetSoftware = (typeof PRESET_SOFTWARE)[number];
export type PresetCategory = (typeof PRESET_CATEGORIES)[number];
export type Instrument = (typeof INSTRUMENTS)[number];

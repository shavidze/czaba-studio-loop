// პროდუქტის გვერდის mock data

import type { AudioStem } from '~/types/audio';

export interface ProductVersion {
  id: string;
  name: string;
  displayName: string;
  basePrice: number;
  formats: string[];
  quality: string;
  fileSize: string;
  isFeatured?: boolean;
  stems?: AudioStem[]; // Only populated for Premium versions
}

export interface ProductVariant {
  id: string;
  versionId: string;
  price: {
    amount: string;
    currencyCode: string;
  };
}

export interface RelatedTrack {
  id: string;
  title: string;
  handle: string;
  image: string;
  price: string;
  artist: string;
}

export interface ProductDetail {
  id: string;
  title: string;
  handle: string;
  productType: 'Music' | 'Presets' | 'Sound Effects'; // Product category
  artist: string;
  artistHandle: string;

  featuredImage: string;
  audioPreviewUrl: string;

  publishedAt: string;
  bpm: number;
  musicalKey: string;
  plays: number;
  likes: number;
  reposts: number;

  tags: string[];
  genre: string;

  isFree?: boolean;

  versions: ProductVersion[];
  variants: ProductVariant[];

  relatedTracks: RelatedTrack[];
}

export const MOCK_PRODUCT_DETAIL: ProductDetail = {
  id: '12345',
  title: '"PARK BENCH" | J Cole Hiphop Boom Bap Type Beat',
  handle: 'park-bench-j-cole-type-beat',
  productType: 'Music',
  artist: 'ARAM',
  artistHandle: 'aram',

  featuredImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600',
  audioPreviewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',

  publishedAt: '2025-04-07',
  bpm: 96,
  musicalKey: 'G#m',
  plays: 318200,
  likes: 6400,
  reposts: 61,

  tags: ['rap', 'jid', 'j cole', 'boom bap', 'hip hop'],
  genre: 'Hip Hop',
  isFree: false,

  versions: [
    {
      id: 'version-standard',
      name: 'Standard',
      displayName: 'Standard',
      basePrice: 49,
      formats: ['MP3', 'WAV'],
      quality: '44.1kHz / 16bit',
      fileSize: '45 MB',
    },
    {
      id: 'version-premium',
      name: 'Premium',
      displayName: 'Premium',
      basePrice: 99,
      formats: ['MP3', 'WAV', 'Stems (High Res)'],
      quality: '96kHz / 24bit',
      fileSize: '320 MB',
      isFeatured: true,
      stems: [
        {
          id: 'stem-drums',
          name: 'Drums',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          order: 1,
        },
        {
          id: 'stem-bass',
          name: 'Bass',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
          order: 2,
        },
        {
          id: 'stem-melody',
          name: 'Melody',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
          order: 3,
        },
        {
          id: 'stem-vocals',
          name: 'Vocals',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
          order: 4,
        },
      ],
    },
  ],

  variants: [
    {
      id: 'var-standard',
      versionId: 'version-standard',
      price: { amount: '49.00', currencyCode: 'USD' },
    },
    {
      id: 'var-premium',
      versionId: 'version-premium',
      price: { amount: '99.00', currencyCode: 'USD' },
    },
  ],

  relatedTracks: [
    {
      id: 'related-1',
      title: 'PRICE OF LOVE | J. Cole, Ji...',
      handle: 'price-of-love',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300',
      price: '49.00',
      artist: 'ARAM',
    },
    {
      id: 'related-2',
      title: 'SAY GOODNIGHT | 1+1 FREE...',
      handle: 'say-goodnight',
      image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300',
      price: '49.00',
      artist: 'ARAM',
    },
    {
      id: 'related-3',
      title: "IT'S LISTENING | J...",
      handle: 'its-listening',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300',
      price: '49.00',
      artist: 'ARAM',
    },
    {
      id: 'related-4',
      title: 'VANDAL | Hoodtr...',
      handle: 'vandal',
      image: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=300',
      price: '49.00',
      artist: 'ARAM',
    },
    {
      id: 'related-5',
      title: 'MIDNIGHT DREAMS | Lo-Fi Chill',
      handle: 'midnight-dreams',
      image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300',
      price: '39.00',
      artist: 'ARAM',
    },
    {
      id: 'related-6',
      title: 'URBAN LEGENDS | Trap Beat',
      handle: 'urban-legends',
      image: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300',
      price: '49.00',
      artist: 'ARAM',
    },
    {
      id: 'related-7',
      title: 'SUNSET VIBES | R&B Soul',
      handle: 'sunset-vibes',
      image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300',
      price: '49.00',
      artist: 'ARAM',
    },
    {
      id: 'related-8',
      title: 'NEON NIGHTS | Synthwave',
      handle: 'neon-nights',
      image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300',
      price: '59.00',
      artist: 'ARAM',
    },
  ],
};

// რიცხვების ფორმატირება
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

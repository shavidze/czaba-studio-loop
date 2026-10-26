// App-wide Constants

export const APP_NAME = 'CZABA';
export const APP_TAGLINE = 'Premium sounds for next-gen producers';

export const NEWSLETTER_STATS = {
  subscribers: '10,000+',
  downloads: '500K+',
  products: '50+',
  happyProducers: '10K+',
} as const;

export const SOCIAL_LINKS = {
  instagram: 'https://instagram.com/czaba',
  youtube: 'https://youtube.com/@czaba',
  facebook: 'https://facebook.com/czaba',
} as const;

export const ROUTES = {
  home: '/',
  music: '/collections/music',
  sfx: '/collections/sfx',
  presets: '/collections/presets',
  freeDownloads: '/collections/free-downloads',
  cart: '/cart',
  search: '/search',
  login: '/account/login',
  contact: '/contact',
  faq: '/faq',
  license: '/license',
} as const;

export const SORT_OPTIONS = [
  { value: 'Staff Picks', label: 'Staff Picks' },
  { value: 'Newest', label: 'Newest' },
  { value: 'Popular', label: 'Popular' },
  { value: 'Duration', label: 'Duration' },
] as const;

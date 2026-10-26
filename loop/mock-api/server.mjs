import http from 'node:http';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

export const DEFAULT_MOCK_API_PORT = 5199;

const ALLOWED_ORIGIN = /^http:\/\/(127\.0\.0\.1|localhost):\d{1,5}$/;
const SUSPICIOUS_PATH = /(^|\/)(\.|%2e){1,2}(\/|\?|#|$)|%2f|%5c|\\/i;
const NOT_FOUND_RAW =
  'HTTP/1.1 404 Not Found\r\nContent-Type: application/json; charset=utf-8\r\nContent-Length: 39\r\nConnection: close\r\n\r\n{"success":false,"message":"Not found"}';
const CORS_ALLOW_HEADERS = 'Content-Type, Authorization, X-Session-Id';
const CORS_ALLOW_METHODS = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';

const MSG_NOT_FOUND = 'Not found';
const MSG_PRODUCT_NOT_FOUND = 'Product not found';
const MSG_SIGN_IN = 'Please sign in to continue.';
const MSG_AUTH_UNAVAILABLE = 'Sign-in is not available in the CZABA mock API.';
const MSG_CART_UNAVAILABLE = 'Cart changes are not available in the CZABA mock API.';

const metadata = (overrides) => ({
  audioFormat: 'WAV',
  sampleRateHz: 48000,
  bitDepth: 24,
  audioFileCount: 1,
  downloadSizeBytes: 52428800,
  includesStems: false,
  ...overrides,
});

const variantPair = (productId, standardPrice, premiumPrice, createdAt) => [
  {
    audioMetadata: metadata({ audioFileCount: 1, includesStems: false }),
    id: productId * 10 + 1,
    productId,
    name: 'Standard',
    price: standardPrice,
    position: 1,
    createdAt,
  },
  {
    audioMetadata: metadata({
      audioFileCount: 6,
      downloadSizeBytes: 314572800,
      includesStems: true,
    }),
    id: productId * 10 + 2,
    productId,
    name: 'Premium',
    price: premiumPrice,
    position: 2,
    createdAt,
  },
];

export const MOCK_PRODUCTS = Object.freeze([
  {
    id: 1,
    title: 'Middle East',
    description: 'Mock fixture track for local store verification.',
    standardPrice: 29,
    premiumPrice: 99,
    minPrice: 29,
    category: 'Track',
    handle: 'middle-east',
    imageUrl: '/images/packs/1.png',
    audioPreviewUrl: '/middle-east.mp3',
    genre: 'Cinematic',
    bpm: 90,
    key: 'D minor',
    duration: 180,
    formattedDuration: '3:00',
    vendor: 'CZABA',
    assetType: 'Track',
    tags: 'cinematic, oud, percussion',
    isNew: true,
    isPremium: true,
    isActive: true,
    createdAt: '2026-10-20T10:00:00.000Z',
    variants: variantPair(1, 29, 99, '2026-10-20T10:00:00.000Z'),
  },
  {
    id: 2,
    title: 'Harbour Lights',
    description: 'Mock fixture track with a slow piano theme.',
    standardPrice: 24,
    premiumPrice: 79,
    minPrice: 24,
    category: 'Track',
    handle: 'harbour-lights',
    imageUrl: '/images/packs/2.png',
    audioPreviewUrl: '/videos/hero/hero-music.mp3',
    genre: 'Ambient',
    bpm: 72,
    key: 'C major',
    duration: 150,
    formattedDuration: '2:30',
    vendor: 'CZABA',
    assetType: 'Track',
    tags: 'piano, ambient, calm',
    isNew: false,
    isPremium: false,
    isActive: true,
    createdAt: '2026-10-18T10:00:00.000Z',
    variants: variantPair(2, 24, 79, '2026-10-18T10:00:00.000Z'),
  },
  {
    id: 3,
    title: 'Copper Horizon',
    description: 'Mock fixture track with strings and low brass.',
    standardPrice: 19,
    minPrice: 19,
    category: 'Track',
    handle: 'copper-horizon',
    imageUrl: '/images/packs/3.png',
    audioPreviewUrl: '/middle-east.mp3',
    genre: 'Orchestral',
    bpm: 110,
    key: 'E minor',
    duration: 200,
    formattedDuration: '3:20',
    vendor: 'CZABA',
    assetType: 'Track',
    tags: 'strings, brass, orchestral',
    isNew: false,
    isPremium: false,
    isActive: true,
    createdAt: '2026-10-15T10:00:00.000Z',
  },
  {
    id: 4,
    title: 'Night Train',
    description: 'Mock fixture track with a pulsing synth bass.',
    standardPrice: 21,
    minPrice: 21,
    category: 'Track',
    handle: 'night-train',
    imageUrl: '/images/packs/4.jpg',
    audioPreviewUrl: '/videos/hero/hero-music.mp3',
    genre: 'Electronic',
    bpm: 124,
    key: 'A minor',
    duration: 165,
    formattedDuration: '2:45',
    vendor: 'CZABA',
    assetType: 'Track',
    tags: 'synth, pulse, tension',
    isNew: false,
    isPremium: false,
    isActive: true,
    createdAt: '2026-10-12T10:00:00.000Z',
  },
  {
    id: 5,
    title: 'Quiet Valley',
    description: 'Mock fixture track with acoustic guitar.',
    standardPrice: 17,
    minPrice: 17,
    category: 'Track',
    handle: 'quiet-valley',
    imageUrl: '/images/packs/5.jpg',
    audioPreviewUrl: '/middle-east.mp3',
    genre: 'Folk',
    bpm: 84,
    key: 'G major',
    duration: 140,
    formattedDuration: '2:20',
    vendor: 'CZABA',
    assetType: 'Track',
    tags: 'guitar, acoustic, warm',
    isNew: false,
    isPremium: false,
    isActive: true,
    createdAt: '2026-10-09T10:00:00.000Z',
  },
  {
    id: 6,
    title: 'Door Slams',
    description: 'Mock fixture sound effects with wooden and metal doors.',
    standardPrice: 9,
    minPrice: 9,
    category: 'SFX',
    handle: 'door-slams',
    imageUrl: '/images/packs/6.jpg',
    audioPreviewUrl: '/videos/hero/hero-music.mp3',
    genre: 'Foley',
    duration: 60,
    formattedDuration: '1:00',
    vendor: 'CZABA',
    assetType: 'Sound Effects',
    tags: 'foley, door, impact',
    isNew: false,
    isPremium: false,
    isActive: true,
    createdAt: '2026-10-06T10:00:00.000Z',
  },
  {
    id: 7,
    title: 'Archived Rain',
    description: 'Mock fixture sound effects that are inactive on purpose.',
    standardPrice: 7,
    minPrice: 7,
    category: 'SFX',
    handle: 'archived-rain',
    imageUrl: '/images/packs/cover.jpg',
    audioPreviewUrl: '/middle-east.mp3',
    genre: 'Ambience',
    duration: 90,
    formattedDuration: '1:30',
    vendor: 'CZABA',
    assetType: 'Sound Effects',
    tags: 'rain, ambience, weather',
    isNew: false,
    isPremium: false,
    isActive: false,
    createdAt: '2026-10-03T10:00:00.000Z',
  },
  {
    id: 8,
    title: 'Pulse Loop Kit',
    description: 'Mock fixture loop with drum and bass patterns.',
    standardPrice: 12,
    minPrice: 12,
    category: 'Loop',
    handle: 'pulse-loop-kit',
    imageUrl: '/images/packs/cover.jpg',
    audioPreviewUrl: '/videos/hero/hero-music.mp3',
    genre: 'Electronic',
    bpm: 120,
    key: 'F minor',
    duration: 30,
    formattedDuration: '0:30',
    vendor: 'CZABA',
    assetType: 'Loop',
    tags: 'drums, bass, loop',
    isNew: true,
    isPremium: false,
    isActive: true,
    createdAt: '2026-10-01T10:00:00.000Z',
  },
]);

const EMPTY_CART = Object.freeze({
  id: null,
  items: [],
  itemCount: 0,
  subtotal: 0,
  discountAmount: 0,
  giftCardAmount: 0,
  total: 0,
});

const SIGN_IN_REQUIRED_PATHS = [
  /^\/api\/downloads(\/.*)?$/,
  /^\/api\/orders(\/.*)?$/,
  /^\/api\/payments(\/.*)?$/,
  /^\/api\/sfx-library(\/.*)?$/,
  /^\/api\/products\/[^/]+\/recordings(\/.*)?$/,
  /^\/api\/gift-cards(\/.*)?$/,
  /^\/api\/sfx-scenes(\/.*)?$/,
  /^\/api\/chat(\/.*)?$/,
];

function corsHeadersFor(origin) {
  if (typeof origin !== 'string' || !ALLOWED_ORIGIN.test(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': CORS_ALLOW_HEADERS,
    'Access-Control-Allow-Methods': CORS_ALLOW_METHODS,
  };
}

function lowerIncludes(value, needle) {
  return typeof value === 'string' && value.toLowerCase().includes(needle);
}

function parsePositiveInt(value, fallback) {
  if (value === null || !/^\d+$/.test(value)) return fallback;
  const parsed = Number.parseInt(value, 10);
  return parsed >= 1 ? parsed : fallback;
}

export function listMockProducts(searchParams) {
  let items = [...MOCK_PRODUCTS];
  const category = searchParams.get('category');
  if (category) {
    const wanted = category.trim().toLowerCase();
    items = items.filter((p) => p.category.toLowerCase() === wanted);
  }
  const genre = searchParams.get('genre');
  if (genre) {
    const wanted = genre.trim().toLowerCase();
    items = items.filter((p) => typeof p.genre === 'string' && p.genre.toLowerCase() === wanted);
  }
  const search = searchParams.get('search');
  if (search?.trim()) {
    const needle = search.trim().toLowerCase();
    items = items.filter(
      (p) =>
        lowerIncludes(p.title, needle) ||
        lowerIncludes(p.description, needle) ||
        lowerIncludes(p.tags, needle) ||
        lowerIncludes(p.genre, needle),
    );
  }
  const isNew = searchParams.get('isNew');
  if (isNew === 'true' || isNew === 'false') items = items.filter((p) => p.isNew === (isNew === 'true'));
  const isPremium = searchParams.get('isPremium');
  if (isPremium === 'true' || isPremium === 'false') {
    items = items.filter((p) => p.isPremium === (isPremium === 'true'));
  }
  const desc = searchParams.get('sortDesc') === 'true';
  items.sort((a, b) =>
    desc ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt),
  );
  const pageNumber = parsePositiveInt(searchParams.get('page'), 1);
  const pageSize = Math.min(parsePositiveInt(searchParams.get('pageSize'), 20), 100);
  const start = (pageNumber - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    totalCount: items.length,
    pageNumber,
    pageSize,
  };
}

function route(method, pathname, searchParams) {
  if (pathname === '/__mock/health' && method === 'GET') {
    return { status: 200, raw: { ok: true, products: MOCK_PRODUCTS.length } };
  }
  if (pathname === '/api/auth' || pathname.startsWith('/api/auth/')) {
    return { status: 401, body: { success: false, message: MSG_AUTH_UNAVAILABLE } };
  }
  if (SIGN_IN_REQUIRED_PATHS.some((pattern) => pattern.test(pathname))) {
    return { status: 401, body: { success: false, message: MSG_SIGN_IN } };
  }
  if (pathname === '/api/cart' || pathname.startsWith('/api/cart/')) {
    if (method === 'GET' && pathname === '/api/cart') {
      return { status: 200, body: { success: true, data: EMPTY_CART } };
    }
    if (method === 'POST' || method === 'PUT' || method === 'DELETE' || method === 'PATCH') {
      return { status: 501, body: { success: false, message: MSG_CART_UNAVAILABLE } };
    }
    return null;
  }
  if (method !== 'GET' && method !== 'HEAD') return null;
  if (pathname === '/api/products') {
    return { status: 200, body: { success: true, data: listMockProducts(searchParams) } };
  }
  const byHandle = pathname.match(/^\/api\/products\/handle\/([^/]+)$/);
  if (byHandle) {
    let handle;
    try {
      handle = decodeURIComponent(byHandle[1]);
    } catch {
      return null;
    }
    const product = MOCK_PRODUCTS.find((p) => p.handle === handle);
    return product
      ? { status: 200, body: { success: true, data: product } }
      : { status: 404, body: { success: false, message: MSG_PRODUCT_NOT_FOUND } };
  }
  const byId = pathname.match(/^\/api\/products\/(\d{1,9})$/);
  if (byId) {
    const id = Number.parseInt(byId[1], 10);
    const product = MOCK_PRODUCTS.find((p) => p.id === id);
    return product
      ? { status: 200, body: { success: true, data: product } }
      : { status: 404, body: { success: false, message: MSG_PRODUCT_NOT_FOUND } };
  }
  return null;
}

export function createMockApiHandler({ port, log = (line) => process.stdout.write(`${line}\n`) }) {
  return (req, res) => {
    const method = (req.method || 'GET').toUpperCase();
    const origin = typeof req.headers.origin === 'string' ? req.headers.origin : undefined;
    const hasAuth = Boolean(req.headers.authorization);
    const rawUrl = typeof req.url === 'string' ? req.url : '/';
    let status = 404;
    let payload = { success: false, message: MSG_NOT_FOUND };
    try {
      if (method === 'OPTIONS') {
        status = 204;
        payload = null;
      } else if (!rawUrl.startsWith('/') || SUSPICIOUS_PATH.test(rawUrl.split('?')[0])) {
        status = 404;
      } else {
        const url = new URL(rawUrl, 'http://mock.invalid');
        const result = route(method, url.pathname, url.searchParams);
        if (result) {
          status = result.status;
          payload = result.raw ? { ...result.raw, port } : result.body;
        }
      }
    } catch {
      status = 404;
      payload = { success: false, message: MSG_NOT_FOUND };
    }
    const headers = { ...corsHeadersFor(origin), Vary: 'Origin', 'Cache-Control': 'no-store' };
    const body = payload === null ? '' : JSON.stringify(payload);
    if (payload !== null) {
      headers['Content-Type'] = 'application/json; charset=utf-8';
      headers['Content-Length'] = Buffer.byteLength(body);
    }
    res.writeHead(status, headers);
    res.end(method === 'HEAD' || payload === null ? undefined : body);
    const safeUrl = rawUrl.replace(/[^\x21-\x7e]/g, '?').slice(0, 300);
    const safeOrigin = origin ? origin.replace(/[^\x21-\x7e]/g, '?').slice(0, 100) : '-';
    log(
      `${new Date().toISOString()} ${method} ${safeUrl} origin=${safeOrigin} auth=${hasAuth ? 'yes' : 'no'} ${status}`,
    );
  };
}

function listen(server, port, host) {
  return new Promise((resolve, reject) => {
    const onError = (error) => {
      server.off('listening', onListening);
      reject(error);
    };
    const onListening = () => {
      server.off('error', onError);
      resolve(server);
    };
    server.once('error', onError);
    server.once('listening', onListening);
    server.listen(port, host);
  });
}

function hardenServer(server, write) {
  server.on('clientError', (_error, socket) => {
    if (socket.writable) socket.end(NOT_FOUND_RAW);
    else socket.destroy();
  });
  server.on('error', (error) => {
    const code = error && typeof error === 'object' ? error.code : undefined;
    write(`${new Date().toISOString()} czaba-mock-api server error (${code || 'unknown'})`);
  });
}

export async function startMockApi({ port = DEFAULT_MOCK_API_PORT, log } = {}) {
  const write = log || ((line) => process.stdout.write(`${line}\n`));
  const handler = createMockApiHandler({ port, log: write });
  const servers = [];
  const v4 = http.createServer(handler);
  await listen(v4, port, '127.0.0.1');
  hardenServer(v4, write);
  servers.push(v4);
  const v6 = http.createServer(handler);
  try {
    await listen(v6, port, '::1');
    hardenServer(v6, write);
    servers.push(v6);
  } catch (error) {
    const code = error && typeof error === 'object' ? error.code : undefined;
    if (code === 'EADDRINUSE') {
      await new Promise((resolve) => v4.close(resolve));
      throw error;
    }
    write(
      `${new Date().toISOString()} ipv6 loopback unavailable (${code || 'unknown'}), listening on 127.0.0.1 only`,
    );
  }
  const close = () =>
    Promise.all(
      servers.map(
        (server) =>
          new Promise((resolve) => {
            server.close(() => resolve());
            server.closeAllConnections?.();
          }),
      ),
    );
  return { port, hosts: servers.map((s) => s.address().address), close };
}

function resolvePort() {
  const raw = process.env.MOCK_API_PORT;
  if (raw === undefined || raw === '') return DEFAULT_MOCK_API_PORT;
  if (!/^\d{1,5}$/.test(raw) || Number(raw) < 1 || Number(raw) > 65535) {
    process.stderr.write(`czaba-mock-api: invalid MOCK_API_PORT "${raw}"\n`);
    process.exit(2);
  }
  return Number(raw);
}

async function main() {
  const port = resolvePort();
  let api;
  try {
    api = await startMockApi({ port });
  } catch (error) {
    const code = error && typeof error === 'object' ? error.code : undefined;
    if (code === 'EADDRINUSE') {
      process.stderr.write(`czaba-mock-api: port ${port} is already in use; not starting\n`);
    } else {
      process.stderr.write(`czaba-mock-api: failed to start on port ${port} (${code || 'error'})\n`);
    }
    process.exit(1);
  }
  process.stdout.write(
    `${new Date().toISOString()} czaba-mock-api listening on ${api.hosts.join(', ')} port ${port}\n`,
  );
  let stopping = false;
  const stop = (signal) => {
    if (stopping) return;
    stopping = true;
    process.stdout.write(`${new Date().toISOString()} czaba-mock-api ${signal}, closing\n`);
    api.close().then(() => process.exit(0));
    setTimeout(() => process.exit(0), 2000).unref();
  };
  process.on('SIGINT', () => stop('SIGINT'));
  process.on('SIGTERM', () => stop('SIGTERM'));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(() => {
    process.stderr.write('czaba-mock-api: unexpected startup failure\n');
    process.exit(1);
  });
}

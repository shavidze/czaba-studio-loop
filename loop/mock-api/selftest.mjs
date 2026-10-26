import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SERVER = join(HERE, 'server.mjs');
const ALLOWED_ORIGIN = 'http://127.0.0.1:5173';
const FOREIGN_ORIGIN = 'http://localhost.evil.test';
const FAKE_TOKEN = 'selftest-secret-token-value';

let failures = 0;
let total = 0;
let setCookieSeen = 0;
const spawned = [];

const PRODUCT_KEYS = new Set([
  'id', 'title', 'description', 'standardPrice', 'premiumPrice', 'minPrice', 'category', 'handle',
  'imageUrl', 'audioPreviewUrl', 'standardFileUrl', 'premiumFileUrl', 'genre', 'bpm', 'key',
  'duration', 'formattedDuration', 'vendor', 'featuredArtist', 'assetType', 'tags', 'isNew',
  'isPremium', 'isActive', 'createdAt', 'variants',
]);
const VARIANT_KEYS = new Set([
  'audioMetadata', 'id', 'productId', 'name', 'price', 'sku', 'fileUrl', 'position', 'createdAt',
  'updatedAt',
]);
const METADATA_KEYS = [
  'audioFormat', 'sampleRateHz', 'bitDepth', 'audioFileCount', 'downloadSizeBytes', 'includesStems',
];

function check(name, ok, detail = '') {
  total += 1;
  if (!ok) failures += 1;
  process.stdout.write(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}\n`);
}

function freePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
}

function request(port, method, path, headers = {}, host = '127.0.0.1') {
  return new Promise((resolve, reject) => {
    const req = http.request({ host, port, method, path, headers }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        if (res.headers['set-cookie']) setCookieSeen += 1;
        let json;
        try {
          json = text ? JSON.parse(text) : undefined;
        } catch {
          json = undefined;
        }
        resolve({ status: res.statusCode, headers: res.headers, text, json });
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function sameKeys(value, keys) {
  if (!value || typeof value !== 'object') return false;
  const actual = Object.keys(value).sort();
  const wanted = [...keys].sort();
  return actual.length === wanted.length && actual.every((key, i) => key === wanted[i]);
}

async function waitForHealth(port) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const res = await request(port, 'GET', '/__mock/health');
      if (res.status === 200) return true;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return false;
}

function startServer(port) {
  const child = spawn(process.execPath, [SERVER], {
    env: { ...process.env, MOCK_API_PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const output = { stdout: '', stderr: '' };
  child.stdout.on('data', (chunk) => {
    output.stdout += chunk.toString('utf8');
  });
  child.stderr.on('data', (chunk) => {
    output.stderr += chunk.toString('utf8');
  });
  const exited = new Promise((resolve) => child.once('close', (code, signal) => resolve({ code, signal })));
  spawned.push(child);
  return { child, output, exited };
}

async function expectEnvelopeError(port, method, path, status, message, headers = {}) {
  const res = await request(port, method, path, headers);
  check(
    `${method} ${path} -> ${status}`,
    res.status === status &&
      res.json?.success === false &&
      res.json?.message === message &&
      sameKeys(res.json, ['success', 'message']),
    `status=${res.status} body=${res.text.slice(0, 120)}`,
  );
  return res;
}

async function run() {
  const port = await freePort();
  const server = startServer(port);
  const ready = await waitForHealth(port);
  check('server starts and /__mock/health answers', ready, `port=${port}`);
  if (!ready) {
    server.child.kill('SIGKILL');
    process.stdout.write(server.output.stderr);
    return;
  }

  const health = await request(port, 'GET', '/__mock/health');
  check(
    'health shape { ok, products, port }',
    sameKeys(health.json, ['ok', 'products', 'port']) &&
      health.json.ok === true &&
      health.json.products === 8 &&
      health.json.port === port,
    health.text,
  );

  const all = await request(port, 'GET', '/api/products?pageSize=100');
  const data = all.json?.data;
  check(
    'GET /api/products envelope + PagedResult keys',
    all.status === 200 &&
      all.json?.success === true &&
      sameKeys(data, ['items', 'totalCount', 'pageNumber', 'pageSize']),
    `status=${all.status}`,
  );
  const items = Array.isArray(data?.items) ? data.items : [];
  const count = (cat) => items.filter((p) => p.category === cat).length;
  check('fixture has 8 products', items.length === 8 && data.totalCount === 8, `n=${items.length}`);
  check(
    'fixture categories 5 Track / 2 SFX / 1 Loop',
    count('Track') === 5 && count('SFX') === 2 && count('Loop') === 1,
  );
  check(
    'exactly one inactive product and it is SFX',
    items.filter((p) => !p.isActive).length === 1 &&
      items.find((p) => !p.isActive)?.category === 'SFX',
  );
  check('middle-east is a Track', items.some((p) => p.handle === 'middle-east' && p.category === 'Track'));
  check(
    'every preview is a non-empty local mp3',
    items.every((p) => ['/middle-east.mp3', '/videos/hero/hero-music.mp3'].includes(p.audioPreviewUrl)),
  );
  check(
    'every image is a local /images/packs path',
    items.every((p) => /^\/images\/packs\/(1\.png|2\.png|3\.png|4\.jpg|5\.jpg|6\.jpg|cover\.jpg)$/.test(p.imageUrl)),
  );
  check('no remote URL in fixture', !/https?:\/\//.test(all.text));
  check('vendor is CZABA everywhere', items.every((p) => p.vendor === 'CZABA'));
  check('createdAt values are distinct ISO strings', new Set(items.map((p) => p.createdAt)).size === 8 &&
    items.every((p) => !Number.isNaN(Date.parse(p.createdAt))));
  const withPremiumStems = items.filter(
    (p) =>
      p.category === 'Track' &&
      p.variants?.some((v) => v.name === 'Standard') &&
      p.variants?.some((v) => v.name === 'Premium' && v.audioMetadata?.includesStems === true),
  );
  check('>= 2 Tracks with Standard + Premium(stems) variants', withPremiumStems.length >= 2);
  check(
    'at least one isNew and one isPremium Track',
    items.some((p) => p.category === 'Track' && p.isNew) &&
      items.some((p) => p.category === 'Track' && p.isPremium),
  );

  const sorted = await request(port, 'GET', '/api/products?pageSize=12&sortDesc=true');
  const dates = (sorted.json?.data?.items ?? []).map((p) => p.createdAt);
  check(
    'sortDesc=true gives newest first',
    dates.length === 8 && dates.every((d, i) => i === 0 || dates[i - 1] > d),
  );
  const asc = await request(port, 'GET', '/api/products?pageSize=100');
  const ascDates = (asc.json?.data?.items ?? []).map((p) => p.createdAt);
  check(
    'default sort is oldest first',
    ascDates.length === 8 && ascDates.every((d, i) => i === 0 || ascDates[i - 1] < d),
  );
  check(
    'fixture keys stay inside Product / ProductVariant / VariantAudioMetadata',
    items.every(
      (p) =>
        Object.keys(p).every((k) => PRODUCT_KEYS.has(k)) &&
        (p.variants ?? []).every(
          (v) =>
            Object.keys(v).every((k) => VARIANT_KEYS.has(k)) &&
            (v.audioMetadata == null || sameKeys(v.audioMetadata, METADATA_KEYS)),
        ),
    ),
  );

  const sfx = await request(port, 'GET', '/api/products?category=sfx');
  check(
    'category filter is case-insensitive equality',
    sfx.json?.data?.totalCount === 2 && sfx.json.data.items.every((p) => p.category === 'SFX'),
  );
  const track = await request(port, 'GET', '/api/products?category=TRACK');
  check('category=TRACK gives 5', track.json?.data?.totalCount === 5);
  const search = await request(port, 'GET', '/api/products?search=harbour');
  check(
    'search matches a title substring',
    search.json?.data?.totalCount === 1 && search.json.data.items[0].handle === 'harbour-lights',
  );
  const searchTags = await request(port, 'GET', '/api/products?search=FOLEY');
  check('search matches tags/genre case-insensitively', searchTags.json?.data?.totalCount === 1);
  const searchNone = await request(port, 'GET', '/api/products?search=zzzz-nothing');
  check(
    'search with no match gives an empty page',
    searchNone.status === 200 && searchNone.json?.data?.totalCount === 0 && searchNone.json.data.items.length === 0,
  );
  const genre = await request(port, 'GET', '/api/products?genre=electronic');
  check('genre filter', genre.json?.data?.totalCount === 2);
  const isNew = await request(port, 'GET', '/api/products?isNew=true');
  check('isNew=true filter', isNew.json?.data?.totalCount === 2 && isNew.json.data.items.every((p) => p.isNew));
  const isPremium = await request(port, 'GET', '/api/products?isPremium=true');
  check('isPremium=true filter', isPremium.json?.data?.totalCount === 1);
  const page2 = await request(port, 'GET', '/api/products?page=2&pageSize=3');
  check(
    'page/pageSize slice and totalCount after filter',
    page2.json?.data?.items.length === 3 &&
      page2.json.data.totalCount === 8 &&
      page2.json.data.pageNumber === 2 &&
      page2.json.data.pageSize === 3,
  );
  const defaults = await request(port, 'GET', '/api/products');
  check(
    'defaults page=1 pageSize=20',
    defaults.json?.data?.pageNumber === 1 && defaults.json.data.pageSize === 20,
  );
  const capped = await request(port, 'GET', '/api/products?pageSize=1000');
  check('pageSize is capped at 100', capped.json?.data?.pageSize === 100);
  const badPage = await request(port, 'GET', '/api/products?page=-3&pageSize=abc');
  check(
    'invalid page/pageSize fall back to defaults',
    badPage.status === 200 && badPage.json?.data?.pageNumber === 1 && badPage.json.data.pageSize === 20,
  );

  const handle = await request(port, 'GET', '/api/products/handle/middle-east');
  check(
    'GET /api/products/handle/middle-east -> 200 with variants',
    handle.status === 200 &&
      handle.json?.success === true &&
      handle.json.data.handle === 'middle-east' &&
      handle.json.data.variants?.length === 2,
  );
  await expectEnvelopeError(port, 'GET', '/api/products/handle/does-not-exist', 404, 'Product not found');
  const byId = await request(port, 'GET', '/api/products/2');
  check('GET /api/products/2 -> 200 by id', byId.status === 200 && byId.json?.data?.id === 2);
  await expectEnvelopeError(port, 'GET', '/api/products/999', 404, 'Product not found');
  await expectEnvelopeError(port, 'GET', '/api/products/abc', 404, 'Not found');

  const cart = await request(port, 'GET', '/api/cart', { 'X-Session-Id': 'selftest' });
  check(
    'GET /api/cart -> empty Cart',
    cart.status === 200 &&
      cart.json?.success === true &&
      sameKeys(cart.json.data, ['id', 'items', 'itemCount', 'subtotal', 'discountAmount', 'giftCardAmount', 'total']) &&
      cart.json.data.id === null &&
      cart.json.data.items.length === 0 &&
      cart.json.data.total === 0,
  );
  const cartMsg = 'Cart changes are not available in the CZABA mock API.';
  for (const [method, path] of [
    ['POST', '/api/cart/items'],
    ['PUT', '/api/cart/items/1'],
    ['DELETE', '/api/cart/items/1'],
    ['DELETE', '/api/cart'],
    ['POST', '/api/cart/checkout'],
    ['POST', '/api/cart/coupon'],
    ['DELETE', '/api/cart/coupon'],
    ['POST', '/api/cart/gift-card'],
    ['DELETE', '/api/cart/gift-card'],
  ]) {
    await expectEnvelopeError(port, method, path, 501, cartMsg);
  }

  const authMsg = 'Sign-in is not available in the CZABA mock API.';
  for (const [method, path] of [
    ['POST', '/api/auth/login'],
    ['POST', '/api/auth/register'],
    ['POST', '/api/auth/social'],
    ['POST', '/api/auth/refresh'],
    ['GET', '/api/auth/profile'],
    ['PUT', '/api/auth/profile'],
    ['POST', '/api/auth/forgot-password'],
    ['POST', '/api/auth/reset-password'],
  ]) {
    await expectEnvelopeError(port, method, path, 401, authMsg, {
      Authorization: `Bearer ${FAKE_TOKEN}`,
    });
  }

  const signIn = 'Please sign in to continue.';
  for (const path of [
    '/api/downloads',
    '/api/downloads/1',
    '/api/orders/my?page=1&pageSize=10',
    '/api/orders/5',
    '/api/orders/number/CZ-1',
    '/api/payments/checkout',
    '/api/sfx-library',
    '/api/products/1/recordings',
    '/api/products/middle-east/recordings/a.wav',
    '/api/gift-cards/redeem',
    '/api/sfx-scenes/1',
    '/api/chat/sessions/active',
  ]) {
    await expectEnvelopeError(port, 'GET', path, 401, signIn);
    await expectEnvelopeError(port, 'GET', path, 401, signIn, { Authorization: `Bearer ${FAKE_TOKEN}` });
  }
  await expectEnvelopeError(port, 'POST', '/api/payments/checkout', 401, signIn, {
    Authorization: `Bearer ${FAKE_TOKEN}`,
  });
  await expectEnvelopeError(port, 'POST', '/api/chat/sessions', 401, signIn);

  for (const path of ['/hubs/chat', '/hubs/chat/negotiate', '/', '/etc/passwd', '/api/unknown', '/middle-east.mp3']) {
    await expectEnvelopeError(port, 'GET', path, 404, 'Not found');
  }
  for (const path of [
    '/api/../../etc/passwd',
    '/api/downloads/../products/1',
    '/api/downloads/%2e%2e/products/1',
    '/api/downloads/%2E%2E/products/handle/middle-east',
    '/api/auth/../products/2',
    '/api/orders/./../products',
    '/api/products/handle/..%2fmiddle-east',
    '/api/products/handle/middle-east%5c',
    '/api/products/1/..',
  ]) {
    await expectEnvelopeError(port, 'GET', path, 404, 'Not found', { Authorization: `Bearer ${FAKE_TOKEN}` });
  }
  for (const method of ['POST', 'PUT', 'DELETE', 'PATCH']) {
    for (const path of ['/api/downloads', '/api/downloads/1', '/api/orders', '/api/orders/my']) {
      await expectEnvelopeError(port, method, path, 401, 'Please sign in to continue.', {
        Authorization: `Bearer ${FAKE_TOKEN}`,
        Origin: ALLOWED_ORIGIN,
      });
    }
  }
  const headDownloads = await request(port, 'HEAD', '/api/downloads', { Authorization: `Bearer ${FAKE_TOKEN}` });
  check('HEAD /api/downloads -> 401 with no body', headDownloads.status === 401 && headDownloads.text === '');
  const headProducts = await request(port, 'HEAD', '/api/products');
  check('HEAD /api/products -> 200 with no body', headProducts.status === 200 && headProducts.text === '');
  await expectEnvelopeError(port, 'GET', '/api/products/handle/%E0%A4%A', 404, 'Not found');
  await expectEnvelopeError(port, 'POST', '/api/products', 404, 'Not found');

  const pre = await request(port, 'OPTIONS', '/api/cart', {
    Origin: ALLOWED_ORIGIN,
    'Access-Control-Request-Method': 'GET',
    'Access-Control-Request-Headers': 'content-type,x-session-id',
  });
  check(
    'OPTIONS preflight 204 echoes allowed Origin with credentials',
    pre.status === 204 &&
      pre.headers['access-control-allow-origin'] === ALLOWED_ORIGIN &&
      pre.headers['access-control-allow-credentials'] === 'true' &&
      pre.headers['access-control-allow-headers'] === 'Content-Type, Authorization, X-Session-Id' &&
      pre.headers['access-control-allow-methods'] === 'GET, POST, PUT, DELETE, PATCH, OPTIONS' &&
      /Origin/.test(pre.headers.vary ?? '') &&
      pre.text === '',
    JSON.stringify(pre.headers),
  );
  const localhostOrigin = await request(port, 'GET', '/api/cart', { Origin: 'http://localhost:5173' });
  check(
    'localhost Origin is echoed on GET',
    localhostOrigin.headers['access-control-allow-origin'] === 'http://localhost:5173',
  );
  const errWithOrigin = await request(port, 'GET', '/api/downloads', { Origin: ALLOWED_ORIGIN });
  check(
    'CORS headers on error responses too',
    errWithOrigin.status === 401 &&
      errWithOrigin.headers['access-control-allow-origin'] === ALLOWED_ORIGIN &&
      errWithOrigin.headers['access-control-allow-credentials'] === 'true' &&
      /Origin/.test(errWithOrigin.headers.vary ?? ''),
  );
  const notFoundWithOrigin = await request(port, 'GET', '/hubs/chat', { Origin: ALLOWED_ORIGIN });
  check(
    'CORS headers on 404 too',
    notFoundWithOrigin.status === 404 &&
      notFoundWithOrigin.headers['access-control-allow-origin'] === ALLOWED_ORIGIN &&
      notFoundWithOrigin.headers['access-control-allow-credentials'] === 'true',
  );
  const portless = await request(port, 'GET', '/api/products', { Origin: 'http://localhost' });
  check('Origin without a port gets no ACAO', portless.headers['access-control-allow-origin'] === undefined);
  for (const origin of [FOREIGN_ORIGIN, 'https://127.0.0.1:5173', 'http://127.0.0.1.evil.test', 'null']) {
    const foreign = await request(port, 'OPTIONS', '/api/cart', { Origin: origin });
    const foreignGet = await request(port, 'GET', '/api/products', { Origin: origin });
    check(
      `foreign Origin ${origin} gets no CORS headers`,
      foreign.status === 204 &&
        foreign.headers['access-control-allow-origin'] === undefined &&
        foreign.headers['access-control-allow-credentials'] === undefined &&
        foreignGet.headers['access-control-allow-origin'] === undefined,
    );
  }
  const noOrigin = await request(port, 'GET', '/api/products');
  check('no Origin gets no ACAO', noOrigin.headers['access-control-allow-origin'] === undefined);

  let ipv6 = null;
  try {
    ipv6 = await request(port, 'GET', '/__mock/health', {}, '::1');
  } catch (error) {
    ipv6 = { error: error.code };
  }
  check(
    'IPv6 loopback answers or is reported unavailable',
    ipv6.status === 200 || /ipv6 loopback unavailable/.test(server.output.stdout),
    ipv6.status ? `::1 status=${ipv6.status}` : `::1 ${ipv6.error}`,
  );

  check('no Set-Cookie header in any response', setCookieSeen === 0, `seen=${setCookieSeen}`);

  const busy = startServer(port);
  const busyExit = await busy.exited;
  check(
    'busy port exits non-zero with a clear message',
    busyExit.code !== 0 && /already in use/.test(busy.output.stderr),
    `code=${busyExit.code} stderr=${busy.output.stderr.trim()}`,
  );

  server.child.kill('SIGTERM');
  const exit = await server.exited;
  check('SIGTERM closes cleanly with code 0', exit.code === 0, `code=${exit.code} signal=${exit.signal}`);

  const log = server.output.stdout;
  check(
    'log line for downloads shows auth=yes and status 401',
    /GET \/api\/downloads origin=- auth=yes 401/.test(log),
  );
  check('log line shows auth=no when no header', /GET \/api\/downloads origin=- auth=no 401/.test(log));
  check('Authorization value never logged', !log.includes(FAKE_TOKEN) && !server.output.stderr.includes(FAKE_TOKEN));
  const startLine = log.split('\n').find((line) => line.includes('listening on')) ?? '';
  check(
    'listens on loopback only (never 0.0.0.0 or ::)',
    /listening on 127\.0\.0\.1(, ::1)? port /.test(startLine) && !/0\.0\.0\.0|on ::[ ,]|, :: /.test(startLine),
    startLine.trim(),
  );

  const sigintPort = await freePort();
  const sigint = startServer(sigintPort);
  const sigintReady = await waitForHealth(sigintPort);
  sigint.child.kill('SIGINT');
  const sigintExit = await sigint.exited;
  check('SIGINT closes cleanly with code 0', sigintReady && sigintExit.code === 0, `code=${sigintExit.code}`);

  const source = readFileSync(SERVER, 'utf8');
  const imports = [...source.matchAll(/from '([^']+)'/g)].map((m) => m[1]);
  const envReads = [...source.matchAll(/process\.env\.([A-Z_]+)/g)].map((m) => m[1]);
  check(
    'static P2/P3: node: imports only, no fs/fetch/https/net, no Set-Cookie, env MOCK_API_PORT only',
    imports.every((name) => ['node:http', 'node:process', 'node:url'].includes(name)) &&
      !/node:fs|fetch\(|https|net\.connect|http\.request|http\.get|Set-Cookie|readFile|\.env\b(?!\.)/i.test(source) &&
      envReads.every((name) => name === 'MOCK_API_PORT'),
    `imports=${imports.join(',')} env=${envReads.join(',')}`,
  );
  check('log shows Origin when present', log.includes(`origin=${ALLOWED_ORIGIN}`));
}

run()
  .catch((error) => {
    check('selftest ran without throwing', false, String(error?.stack || error));
  })
  .finally(() => {
    for (const child of spawned) {
      if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
    }
    process.stdout.write(`\n${total - failures}/${total} checks passed\n`);
    process.exit(failures === 0 ? 0 : 1);
  });

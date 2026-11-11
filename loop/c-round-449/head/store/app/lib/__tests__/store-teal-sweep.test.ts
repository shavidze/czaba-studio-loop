// @vitest-environment node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const APP_ROOT = resolve(__dirname, '../..');
const PERF_ROOT = resolve(APP_ROOT, '../perf');
const MIN_SCANNED_PERF_SOURCES = 10;
const MIN_SCANNED_SOURCES = 200;
const SPOTLIGHT_LOADER_PATH = 'components/loading/SpotlightLoader.tsx';

const TEAL_PATTERN_SOURCE =
  'teal-[0-9]+|cyan-[0-9]+|emerald-[0-9]+|#(13d9cc|14b8a6|0d9488|2dd4bf|5eead4|0f766e)\\b|rgba?\\( ?(19|20|45|13)[ ,]+(217|184|212|148)[ ,]+(204|166|191|136)[^)]*\\)|hsla?\\( ?17[0-9][ ,][^)]*\\)';

const GRANTED_TEAL_FREE_SOURCES: ReadonlyArray<string> = [
  'components/product/ProductCard.tsx',
  'components/home/SpecialOffersSection.tsx',
  'components/home/NewsletterSection.tsx',
  'routes/gift-cards.tsx',
  'routes/checkout.success.tsx',
  SPOTLIGHT_LOADER_PATH,
  'components/home/StudioMockup.tsx',
  'routes/hire-us.tsx',
  'lib/hire-us-inquiry-email.server.ts',
];

interface TealAllowListEntry {
  hits: number;
  reason: string;
}

const TEAL_ALLOW_LIST: Readonly<Record<string, TealAllowListEntry>> = {
  'components/studio/StudioTrack.tsx': {
    hits: 1,
    reason: 'frozen legacy Studio (SRW-21 / legacy removal)',
  },
  'lib/email.server.ts': { hits: 5, reason: 'LEGACY-DEAD-STORE-COMPONENTS (0 importers)' },
  'components/audio/Timeline.tsx': { hits: 5, reason: 'LEGACY-DEAD-STORE-COMPONENTS' },
  'components/loading/CinemaCurtainLoader.tsx': {
    hits: 7,
    reason: 'LEGACY-DEAD-STORE-COMPONENTS',
  },
  'components/audio/StemsPlayerModal.tsx': { hits: 1, reason: 'STORE-4 stems modal' },
  'components/audio/StemControl.tsx': { hits: 1, reason: 'STORE-4 stems modal' },
};

const GLOW_TOKENS: ReadonlyArray<string> = ['shadow-[0_0_', 'drop-shadow(0 0'];
const GRADIENT_TEXT_TOKENS: ReadonlyArray<string> = ['WebkitBackgroundClip', 'backgroundClip'];

function listSources(root: string): string[] {
  const files: string[] = [];
  const walk = (directory: string) => {
    for (const entry of readdirSync(directory)) {
      const path = join(directory, entry);
      if (statSync(path).isDirectory()) {
        if (entry !== '__tests__') {
          walk(path);
        }
      } else if (/\.(ts|tsx)$/.test(entry)) {
        files.push(relative(root, path).split('\\').join('/'));
      }
    }
  };
  walk(root);
  return files.sort();
}

function listAppSources(): string[] {
  return listSources(APP_ROOT);
}

function readAppSource(path: string): string {
  return readFileSync(resolve(APP_ROOT, path), 'utf8');
}

function countTealHits(source: string): number {
  return source
    .split('\n')
    .reduce(
      (sum, line) => sum + [...line.matchAll(new RegExp(TEAL_PATTERN_SOURCE, 'gi'))].length,
      0,
    );
}

function tealHitsByFile(): Record<string, number> {
  const hits: Record<string, number> = {};
  for (const path of listAppSources()) {
    const count = countTealHits(readAppSource(path));
    if (count > 0) {
      hits[path] = count;
    }
  }
  return hits;
}

describe('store teal sweep (STORE-2b-2a, STORE-2b-2b)', () => {
  it('TS1: every remaining teal hit in app sources sits in an allow-listed file', () => {
    const unexpected = Object.keys(tealHitsByFile()).filter((path) => !(path in TEAL_ALLOW_LIST));
    expect(unexpected).toEqual([]);
  });

  it('TS2: the scan is non-vacuous and every allow-list entry keeps its exact hit count', () => {
    const sources = listAppSources();
    expect(sources.length).toBeGreaterThanOrEqual(MIN_SCANNED_SOURCES);
    for (const path of GRANTED_TEAL_FREE_SOURCES) {
      expect(sources).toContain(path);
    }
    const hits = tealHitsByFile();
    const drifted = Object.entries(TEAL_ALLOW_LIST)
      .filter(([path, entry]) => (hits[path] ?? 0) !== entry.hits)
      .map(([path, entry]) => `${path}: ${hits[path] ?? 0} != ${entry.hits}`);
    expect(drifted).toEqual([]);
  });

  it('TS3: the granted store files carry no glow token and no teal colour', () => {
    const offenders = GRANTED_TEAL_FREE_SOURCES.flatMap((path) => {
      const source = readAppSource(path);
      const glows = GLOW_TOKENS.filter((token) => source.includes(token)).map(
        (token) => `${path}: ${token}`,
      );
      const teal = countTealHits(source) > 0 ? [`${path}: teal colour`] : [];
      return [...glows, ...teal];
    });
    expect(offenders).toEqual([]);
  });

  it('TS4: the entrance loader wordmark has no gradient text clip', () => {
    const source = readAppSource(SPOTLIGHT_LOADER_PATH);
    const found = GRADIENT_TEXT_TOKENS.filter((token) => source.includes(token));
    expect(found).toEqual([]);
  });

  it('TS5: perf sources carry no teal colour and the perf scan is non-vacuous', () => {
    const sources = listSources(PERF_ROOT);
    expect(sources.length).toBeGreaterThanOrEqual(MIN_SCANNED_PERF_SOURCES);
    const offenders = sources.filter(
      (path) => countTealHits(readFileSync(resolve(PERF_ROOT, path), 'utf8')) > 0,
    );
    expect(offenders).toEqual([]);
  });
});

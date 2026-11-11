// @vitest-environment node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const APP_ROOT = resolve(__dirname, '../..');
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
];

const TEAL_ALLOW_LIST: Readonly<Record<string, string>> = {
  'components/studio/StudioTrack.tsx': 'frozen legacy Studio (SRW-21 / legacy removal)',
  'lib/email.server.ts': 'STORE-2b-2b e-mail HTML',
  'routes/hire-us.tsx': 'STORE-2b-2b e-mail HTML',
  'components/audio/Timeline.tsx': 'LEGACY-DEAD-STORE-COMPONENTS',
  'components/loading/CinemaCurtainLoader.tsx': 'LEGACY-DEAD-STORE-COMPONENTS',
  'components/audio/StemsPlayerModal.tsx': 'STORE-4 stems modal',
  'components/audio/StemControl.tsx': 'STORE-4 stems modal',
};

const GLOW_TOKENS: ReadonlyArray<string> = ['shadow-[0_0_', 'drop-shadow(0 0'];
const GRADIENT_TEXT_TOKENS: ReadonlyArray<string> = ['WebkitBackgroundClip', 'backgroundClip'];

function listAppSources(): string[] {
  const files: string[] = [];
  const walk = (directory: string) => {
    for (const entry of readdirSync(directory)) {
      const path = join(directory, entry);
      if (statSync(path).isDirectory()) {
        if (entry !== '__tests__') {
          walk(path);
        }
      } else if (/\.(ts|tsx)$/.test(entry)) {
        files.push(relative(APP_ROOT, path).split('\\').join('/'));
      }
    }
  };
  walk(APP_ROOT);
  return files.sort();
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

describe('store teal sweep (STORE-2b-2a)', () => {
  it('TS1: every remaining teal hit in app sources sits in an allow-listed file', () => {
    const unexpected = Object.keys(tealHitsByFile()).filter((path) => !(path in TEAL_ALLOW_LIST));
    expect(unexpected).toEqual([]);
  });

  it('TS2: the scan is non-vacuous and every allow-list entry still has a teal hit', () => {
    const sources = listAppSources();
    expect(sources.length).toBeGreaterThanOrEqual(MIN_SCANNED_SOURCES);
    for (const path of GRANTED_TEAL_FREE_SOURCES) {
      expect(sources).toContain(path);
    }
    const hits = tealHitsByFile();
    const stale = Object.keys(TEAL_ALLOW_LIST).filter((path) => (hits[path] ?? 0) < 1);
    expect(stale).toEqual([]);
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
});

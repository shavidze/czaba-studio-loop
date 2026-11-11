// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  APP_ROOT,
  allowListViolations,
  countTealHits,
  countZeroOffsetGlowHits,
  hitsByFile,
  listFiles,
  PERF_ROOT,
  readApp,
  readFrom,
  SCRIPT_SOURCE_EXTENSIONS,
  type StyleScanAllowList,
} from './helpers/style-scan';

const MIN_SCANNED_PERF_SOURCES = 10;
const MIN_SCANNED_SOURCES = 200;
const SPOTLIGHT_LOADER_PATH = 'components/loading/SpotlightLoader.tsx';

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

const TEAL_ALLOW_LIST: StyleScanAllowList = {
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

function listAppSources(): string[] {
  return listFiles(APP_ROOT, SCRIPT_SOURCE_EXTENSIONS);
}

function tealHitsByFile(): Record<string, number> {
  return hitsByFile(APP_ROOT, SCRIPT_SOURCE_EXTENSIONS, countTealHits);
}

describe('store teal sweep (STORE-2b-2a, STORE-2b-2b)', () => {
  it('TS1: every remaining teal hit in app sources sits in an allow-listed file', () => {
    expect(allowListViolations(tealHitsByFile(), TEAL_ALLOW_LIST).unexpected).toEqual([]);
  });

  it('TS2: the scan is non-vacuous and every allow-list entry keeps its exact hit count', () => {
    const sources = listAppSources();
    expect(sources.length).toBeGreaterThanOrEqual(MIN_SCANNED_SOURCES);
    for (const path of GRANTED_TEAL_FREE_SOURCES) {
      expect(sources).toContain(path);
    }
    expect(allowListViolations(tealHitsByFile(), TEAL_ALLOW_LIST).drifted).toEqual([]);
  });

  it('TS3: the granted store files carry no glow token, no zero-offset glow and no teal colour', () => {
    const offenders = GRANTED_TEAL_FREE_SOURCES.flatMap((path) => {
      const source = readApp(path);
      const glows = GLOW_TOKENS.filter((token) => source.includes(token)).map(
        (token) => `${path}: ${token}`,
      );
      const zeroOffset = countZeroOffsetGlowHits(source) > 0 ? [`${path}: zero-offset glow`] : [];
      const teal = countTealHits(source) > 0 ? [`${path}: teal colour`] : [];
      return [...glows, ...zeroOffset, ...teal];
    });
    expect(offenders).toEqual([]);
  });

  it('TS4: the entrance loader wordmark has no gradient text clip', () => {
    const source = readApp(SPOTLIGHT_LOADER_PATH);
    const found = GRADIENT_TEXT_TOKENS.filter((token) => source.includes(token));
    expect(found).toEqual([]);
  });

  it('TS5: perf sources carry no teal colour and the perf scan is non-vacuous', () => {
    const sources = listFiles(PERF_ROOT, SCRIPT_SOURCE_EXTENSIONS);
    expect(sources.length).toBeGreaterThanOrEqual(MIN_SCANNED_PERF_SOURCES);
    const offenders = sources.filter((path) => countTealHits(readFrom(PERF_ROOT, path)) > 0);
    expect(offenders).toEqual([]);
  });

  it('TS6: the zero-offset glow scanner finds every spelling and skips offset shadows and rings', () => {
    const glows = [
      'className="shadow-[0_0_20px_rgba(1,2,3,0.3)]"',
      'className="drop-shadow-[0_0_8px_#fff]"',
      'className="shadow-[0_2px_4px_black,0_0_30px_red]"',
      'className="[box-shadow:inset_0_0_12px_red]"',
      'className="[text-shadow:0_0_6px_red]"',
      "filter: 'drop-shadow(0 0 60px red)'",
      "boxShadow: '0 0 40px red'",
      'boxShadow: `0px 0px 40px red`',
      "boxShadow:\n  '0 2px 4px black, 0 0 30px red'",
      "boxShadow: hovered ? '0 0 40px red' : 'none'",
      "textShadow: 'inset 0 0 8px red'",
      '.x { box-shadow: 0 0 12px red; }',
      '.y { text-shadow: 0 0 10px red; }',
      "boxShadow: '0 0 .5rem red'",
      "boxShadow: '0 0 0.5px red'",
      "boxShadow: '0 0 var(--glow) red'",
      ['boxShadow: `0 0 $', '{radius}px red`'].join(''),
      "filter: 'drop-shadow(0 0 0.5rem red)'",
      'className="[filter:drop-shadow(0_0_8px_red)]"',
    ];
    expect(glows.map(countZeroOffsetGlowHits)).toEqual(glows.map(() => 1));
    const offsets = [
      "boxShadow: '0 8px 32px rgba(0,0,0,0.25)'",
      "boxShadow: '10px 0 60px rgba(0,0,0,0.8)'",
      'className="shadow-[0_2px_8px_black] shadow-lg"',
      "boxShadow: '0 0 0 1px red'",
      'className="shadow-[0_0_0_1px_red]"',
      "boxShadow: 'none',\n  margin: '0 0 12px',",
      "boxShadow: '0 4px 8px rgb(0 0 20 / 0.5)'",
    ];
    expect(offsets.map(countZeroOffsetGlowHits)).toEqual(offsets.map(() => 0));
  });
});

// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  ANY_STYLED_SOURCE_EXTENSIONS,
  APP_ROOT,
  allowListViolations,
  countTealHits,
  countZeroOffsetGlowHits,
  cssRuleBodies,
  hitsByFile,
  listFiles,
  readApp,
  type StyleScanAllowList,
} from './helpers/style-scan';

const MIN_SCANNED_SOURCES = 200;
const STORE_CSS_PATH = 'styles/app.css';

const RETIRED_TOKEN_PATTERN = /--shadow-glow(?:-accent)?(?![\w-])/g;
const RETIRED_UTILITY_PATTERN = /(?<![\w-])shadow-glow(?:-accent)?(?![\w-])/g;

const GRANTED_GLOW_FREE_SCRIPTS: ReadonlyArray<string> = [
  'components/ui/Button.tsx',
  'components/chat/ChatInput.tsx',
  'components/chat/GuestForm.tsx',
  'components/product/PurchaseHeader.tsx',
  'routes/store.tsx',
];

const GRANTED_GLOW_FREE_SOURCES: ReadonlyArray<string> = [
  ...GRANTED_GLOW_FREE_SCRIPTS,
  STORE_CSS_PATH,
];

const RETIRED_UTILITY_ALLOW_LIST: StyleScanAllowList = {
  'components/studio/GlobalPlayhead.tsx': {
    hits: 1,
    reason: 'frozen legacy Studio (SRW-21 / legacy removal); inert once the token is gone',
  },
  'components/chat/ChatButton.tsx': {
    hits: 1,
    reason: 'LEGACY-DEAD-STORE-COMPONENTS (ChatWidget is mounted by no route)',
  },
  'components/ui/IconButton.tsx': {
    hits: 1,
    reason: 'LEGACY-DEAD-STORE-COMPONENTS (0 importers outside the ui barrel)',
  },
  'components/home/VideoShowcase.tsx': {
    hits: 1,
    reason: 'LEGACY-DEAD-STORE-COMPONENTS (0 importers outside the barrel)',
  },
};

const PRIMARY_BUTTON_SELECTORS: ReadonlyArray<string> = [
  '.btn-primary',
  '.btn-primary:hover',
  '.btn-primary:active',
  '.button-primary',
  '.button-primary:hover',
];

function countMatches(pattern: RegExp): (source: string) => number {
  return (source) => (source.match(pattern) ?? []).length;
}

describe('store glow shadows (STORE-2b-3b)', () => {
  it('GS1: the retired --shadow-glow and --shadow-glow-accent tokens are neither defined nor read anywhere in app', () => {
    const hits = hitsByFile(
      APP_ROOT,
      ANY_STYLED_SOURCE_EXTENSIONS,
      countMatches(RETIRED_TOKEN_PATTERN),
    );
    expect(hits).toEqual({});
  });

  it('GS2: only the allow-listed frozen or dead files name the shadow-glow utility, each at its exact count', () => {
    const hits = hitsByFile(
      APP_ROOT,
      ANY_STYLED_SOURCE_EXTENSIONS,
      countMatches(RETIRED_UTILITY_PATTERN),
    );
    expect(allowListViolations(hits, RETIRED_UTILITY_ALLOW_LIST)).toEqual({
      unexpected: [],
      drifted: [],
    });
  });

  it('GS3: the primary button rules carry no glow, no teal and no teal gradient', () => {
    const css = readApp(STORE_CSS_PATH);
    for (const selector of PRIMARY_BUTTON_SELECTORS) {
      const bodies = cssRuleBodies(css, selector);
      expect(bodies.length, selector).toBeGreaterThanOrEqual(1);
      for (const body of bodies) {
        expect(countZeroOffsetGlowHits(body), selector).toBe(0);
        expect(countTealHits(body), selector).toBe(0);
        expect(body, selector).not.toContain('--gradient-primary');
      }
    }
    expect(cssRuleBodies(css, '.button-primary').join('')).toContain(
      'color: var(--color-brand-foreground);',
    );
    expect(cssRuleBodies(css, '.button-primary').join('')).toContain(
      'background: var(--color-brand);',
    );
    for (const selector of PRIMARY_BUTTON_SELECTORS) {
      for (const body of cssRuleBodies(css, selector)) {
        expect(body, selector).not.toMatch(/gradient\(/);
      }
    }
    const hoverBodies = cssRuleBodies(css, '.btn-primary:hover');
    expect(hoverBodies.join('')).toContain('background: var(--color-brand-hover);');
    expect(hoverBodies.join('')).not.toContain('opacity');
  });

  it('GS4: the scan is non-vacuous and reads every granted file', () => {
    const sources = listFiles(APP_ROOT, ANY_STYLED_SOURCE_EXTENSIONS);
    expect(sources.length).toBeGreaterThanOrEqual(MIN_SCANNED_SOURCES);
    for (const path of [...GRANTED_GLOW_FREE_SOURCES, ...Object.keys(RETIRED_UTILITY_ALLOW_LIST)]) {
      expect(sources).toContain(path);
    }
    for (const path of GRANTED_GLOW_FREE_SOURCES) {
      const source = readApp(path);
      expect(countMatches(RETIRED_UTILITY_PATTERN)(source), path).toBe(0);
      expect(countMatches(RETIRED_TOKEN_PATTERN)(source), path).toBe(0);
    }
    for (const path of GRANTED_GLOW_FREE_SCRIPTS) {
      expect(countZeroOffsetGlowHits(readApp(path)), path).toBe(0);
    }
    expect(countMatches(RETIRED_UTILITY_PATTERN)('hover:shadow-glow shadow-glow')).toBe(2);
    expect(countMatches(RETIRED_UTILITY_PATTERN)('--shadow-glow --shadow-glow-accent')).toBe(0);
    expect(
      countMatches(RETIRED_UTILITY_PATTERN)('hover:shadow-glow-accent shadow-glow-accents'),
    ).toBe(1);
    expect(countMatches(RETIRED_TOKEN_PATTERN)('var(--shadow-glow) --shadow-glow-accent:')).toBe(2);
    const sample = [
      '.a { x: 1; }',
      '.a:hover { y: 2; }',
      '/* .a { z: 0; } */',
      '@media (hover: hover) { .a{ w: 3; } }',
      '.hero .a, .b > .a { v: 4; }',
      '.ab { u: 5; }',
      ".a::after { content: '}'; }",
      '@supports (display: grid) { @media (hover: hover) { .a { t: 6; } } }',
    ].join('\n');
    expect(cssRuleBodies(sample, '.a').map((body) => body.trim())).toEqual([
      'x: 1;',
      'w: 3;',
      'v: 4;',
      't: 6;',
    ]);
  });
});

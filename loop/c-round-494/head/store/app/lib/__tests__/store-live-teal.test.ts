// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  APP_ROOT,
  allowListViolations,
  appScriptSources,
  countTealHits,
  countZeroOffsetGlowHits,
  cssRuleBlocks,
  cssRuleBlocksListing,
  cssRuleKey,
  cssRuleSelectorCount,
  hitsByCssRule,
  hitsByFile,
  hueRangeColourHits,
  listFiles,
  reachableScripts,
  readApp,
  STYLE_SOURCE_EXTENSIONS,
  type StyleScanAllowList,
  unfollowedLocalSpecifiers,
} from './helpers/style-scan';

const STORE_CSS_PATH = 'styles/app.css';
const UTILITIES_CSS_PATH = 'styles/base/utilities.css';

const LIVE_SELECTOR_COUNTS: Readonly<Record<string, number>> = {
  '.audio-player-artwork': 2,
  '.audio-player-artwork:hover': 1,
  '.audio-player-button-play': 1,
  '.audio-player-button-play:hover': 1,
  '.audio-player-progress::-webkit-slider-thumb:hover': 1,
  '.audio-player-progress::-moz-range-thumb:hover': 1,
  '.light-flicker-effect::before': 1,
  '.not-found-grid': 1,
  '.code-4': 1,
  '.code-0': 1,
  '.command-palette-item.selected': 2,
  '.styled-scrollbar': 1,
  '.styled-scrollbar::-webkit-scrollbar-thumb': 1,
  '.styled-scrollbar::-webkit-scrollbar-thumb:hover': 1,
};

const LIVE_RULE_BLOCKS: ReadonlyArray<readonly [string, string]> = [
  [
    STORE_CSS_PATH,
    [
      '.audio-player-artwork {',
      '  width: 56px;',
      '  height: 56px;',
      '  border-radius: 0.5rem;',
      '  object-fit: cover;',
      '  flex-shrink: 0;',
      '  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);',
      '  transition: all var(--duration-normal) ease-out;',
      '}',
    ].join('\n'),
  ],
  [
    STORE_CSS_PATH,
    [
      '.audio-player-artwork:hover {',
      '  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);',
      '  transform: scale(1.03);',
      '}',
    ].join('\n'),
  ],
  [
    STORE_CSS_PATH,
    [
      '.audio-player-button-play {',
      '  background: var(--color-brand);',
      '  color: var(--color-background);',
      '  width: 42px;',
      '  height: 42px;',
      '  box-shadow: none;',
      '  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);',
      '}',
    ].join('\n'),
  ],
  [
    STORE_CSS_PATH,
    [
      '.audio-player-button-play:hover {',
      '  background: var(--color-brand-hover);',
      '  transform: scale(1.08);',
      '}',
    ].join('\n'),
  ],
  [
    STORE_CSS_PATH,
    [
      '.audio-player-progress::-webkit-slider-thumb:hover {',
      '  transform: scale(1.3);',
      '  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);',
      '}',
    ].join('\n'),
  ],
  [
    STORE_CSS_PATH,
    [
      '.audio-player-progress::-moz-range-thumb:hover {',
      '  transform: scale(1.3);',
      '  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);',
      '}',
    ].join('\n'),
  ],
  [
    STORE_CSS_PATH,
    [
      '.not-found-grid {',
      '  position: absolute;',
      '  inset: 0;',
      '  background-image:',
      '    linear-gradient(color-mix(in srgb, var(--color-foreground) 3%, transparent) 1px, transparent 1px),',
      '    linear-gradient(90deg, color-mix(in srgb, var(--color-foreground) 3%, transparent) 1px, transparent 1px);',
      '  background-size: 60px 60px;',
      '  mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);',
      '}',
    ].join('\n'),
  ],
  [
    STORE_CSS_PATH,
    [
      '.code-4 {',
      '  font-size: clamp(6rem, 15vw, 12rem);',
      '  font-weight: 800;',
      '  color: var(--color-foreground);',
      '  line-height: 1;',
      '  text-shadow: none;',
      '}',
    ].join('\n'),
  ],
  [
    STORE_CSS_PATH,
    [
      '.code-0 {',
      '  position: relative;',
      '  width: clamp(5rem, 12vw, 10rem);',
      '  height: clamp(6rem, 15vw, 12rem);',
      '  border: 4px solid var(--color-accent);',
      '  border-radius: 50%;',
      '  box-shadow: none;',
      '}',
    ].join('\n'),
  ],
  [
    STORE_CSS_PATH,
    [
      '.command-palette-item:hover,',
      '.command-palette-item.selected {',
      '  background: var(--color-elevated);',
      '}',
      '',
      '.command-palette-item.selected {',
      '  background: rgba(var(--color-brand-rgb), 0.12);',
      '}',
    ].join('\n'),
  ],
  [
    UTILITIES_CSS_PATH,
    [
      '.styled-scrollbar {',
      '  overscroll-behavior-y: contain;',
      '  scrollbar-width: thin;',
      '  scrollbar-color: var(--color-outline-strong) transparent;',
      '}',
    ].join('\n'),
  ],
  [
    UTILITIES_CSS_PATH,
    [
      '.styled-scrollbar::-webkit-scrollbar-thumb {',
      '  background: var(--color-outline-strong);',
      '  border-radius: var(--radius-sm);',
      '}',
      '',
      '.styled-scrollbar::-webkit-scrollbar-thumb:hover {',
      '  background: var(--color-muted);',
      '}',
    ].join('\n'),
  ],
];

const TEAL_RULE_ALLOW_LIST: StyleScanAllowList = {};

const STORE_TEAL_FREE_STYLESHEETS: ReadonlyArray<string> = [STORE_CSS_PATH, UTILITIES_CSS_PATH];

const TEAL_TOKEN_READ_PATTERN =
  /var\(\s*--(?:color-glow-primary|color-video-sync|gradient-primary|gradient-hero|gradient-glow)\s*[,)]/g;

const TEAL_TOKEN_READ_ALLOW_LIST: StyleScanAllowList = {};

const TEAL_TOKEN_READ_RULE_ALLOW_LIST: StyleScanAllowList = {};

const TEAL_HEX_WITH_ALPHA_PATTERN =
  /#(?:13d9cc|14b8a6|0d9488|2dd4bf|5eead4|0f766e)[0-9a-f]{2}(?![0-9a-f])/gi;

const CSS_TEAL_ALLOW_LIST: StyleScanAllowList = {
  'styles/studio.css': {
    hits: 4,
    reason: 'frozen legacy Studio slider-thumb-teal (read-only; legacy removal)',
  },
  'styles/pages/studio.css': {
    hits: 4,
    reason: 'frozen legacy Studio slider-thumb-teal (read-only; legacy removal)',
  },
};

type DeadConsumerRuling = 'unmounted' | 'overlay-variant-only';

const DEAD_RULE_TOKENS: Readonly<Record<string, ReadonlyArray<string>>> = {
  'styles/app.css @theme': [
    'glow-primary',
    'video-sync',
    'gradient-primary',
    'gradient-hero',
    'gradient-glow',
  ],
  'styles/app.css .audio-preview-inline-button::before': ['audio-preview-inline-button'],
  'styles/app.css .audio-preview-inline-button:hover': ['audio-preview-inline-button'],
  'styles/app.css @keyframes audioPlayingPulse': ['audioPlayingPulse'],
  'styles/app.css .waveform-bar.active': ['waveform-bar'],
  'styles/app.css .track-row-waveform:hover': ['track-row-waveform'],
};

const THEME_TOKEN_NAMES: ReadonlyArray<string> = DEAD_RULE_TOKENS['styles/app.css @theme'] ?? [];

const DEAD_TOKEN_CONSUMERS: Readonly<Record<string, Readonly<Record<string, DeadConsumerRuling>>>> =
  {
    'audio-preview-inline-button': {
      'components/audio/AudioPreviewButton.tsx': 'overlay-variant-only',
    },
    'waveform-bar': {
      'components/audio/WaveForm.tsx': 'unmounted',
      'components/product/TrackRow.tsx': 'unmounted',
    },
    'track-row-waveform': {
      'components/loading/TrackRowSkeleton.tsx': 'unmounted',
      'components/product/TrackRow.tsx': 'unmounted',
    },
  };

const DEAD_KEYFRAME_RULE_TOKENS: Readonly<Record<string, string>> = {
  audioPlayingPulse: 'audio-preview-inline-button',
};

function escapedPattern(literal: string): string {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function tokenPattern(token: string): RegExp {
  const word = escapedPattern(token);
  return THEME_TOKEN_NAMES.includes(token)
    ? new RegExp(`(?<![\\w/.])(?:[\\w-]*-)?${word}(?![A-Za-z0-9-])`)
    : new RegExp(`(?<![\\w-])${word}(?![A-Za-z0-9-])`);
}

function deadRuleKeys(): string[] {
  return [
    ...Object.entries(TEAL_RULE_ALLOW_LIST),
    ...Object.entries(TEAL_TOKEN_READ_RULE_ALLOW_LIST),
  ]
    .filter(([, entry]) => entry.reason.startsWith('dead'))
    .map(([key]) => key);
}

function bracedBlockAfter(source: string, anchor: string): string {
  const start = source.indexOf(anchor);
  if (start === -1) {
    return '';
  }
  let depth = 0;
  for (let index = start + anchor.length - 1; index < source.length; index += 1) {
    const character = source[index];
    if (character === '{') {
      depth += 1;
    } else if (character === '}') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, index + 1);
      }
    }
  }
  return '';
}

function deadRuleText(key: string): string {
  const [path = '', ...rest] = key.split(' ');
  const ruleKey = rest.join(' ');
  return cssRuleBlocks(readApp(path))
    .filter((block) => cssRuleKey(block) === ruleKey)
    .map((block) => `${block.header}\n${block.body}`)
    .join('\n');
}

function elementTags(source: string, component: string): string[] {
  const tags: string[] = [];
  const opening = new RegExp(`<${component}(?![\\w$])`, 'g');
  for (const match of source.matchAll(opening)) {
    let depth = 0;
    let end = match.index;
    for (; end < source.length; end += 1) {
      const character = source[end];
      if (character === '{') {
        depth += 1;
      } else if (character === '}') {
        depth -= 1;
      } else if (character === '>' && depth === 0) {
        break;
      }
    }
    tags.push(source.slice(match.index, end + 1));
  }
  return tags;
}

function occurrences(source: string, literal: string): number {
  return source.split(literal).length - 1;
}

function countMatches(pattern: RegExp): (source: string) => number {
  return (source) => (source.match(pattern) ?? []).length;
}

function tealHitsByEnclosingRule(path: string, source: string): Record<string, number> {
  return hitsByCssRule(path, source, countTealHits);
}

const UNFOLLOWED_SPECIFIER_ALLOW_LIST: Readonly<Record<string, string>> = {};

describe('store live teal CSS (STORE-2b-3c-1)', () => {
  it('LT1: every live player, 404, palette and scrollbar rule is the teal-free block, exactly once', () => {
    for (const [path, block] of LIVE_RULE_BLOCKS) {
      const label = block.split('\n')[0] ?? path;
      expect(occurrences(readApp(path), block), label).toBe(1);
      expect(countTealHits(block), label).toBe(0);
      expect(countZeroOffsetGlowHits(block), label).toBe(0);
    }
    for (const [selector, count] of Object.entries(LIVE_SELECTOR_COUNTS)) {
      const path = selector.startsWith('.styled-scrollbar') ? UTILITIES_CSS_PATH : STORE_CSS_PATH;
      expect(cssRuleSelectorCount(readApp(path), selector), selector).toBe(count);
      const bodies = cssRuleBlocksListing(readApp(path), selector).map((block) => block.body);
      expect(bodies.length, selector).toBe(count);
      for (const body of bodies) {
        expect(countTealHits(body), selector).toBe(0);
        expect(countZeroOffsetGlowHits(body), selector).toBe(0);
      }
    }
  });

  it('LT2: the teal card light layer is gone and the card light keeps only neutral stops', () => {
    const css = readApp(STORE_CSS_PATH);
    expect(occurrences(css, '.light-flicker-effect::after')).toBe(0);
    expect(
      occurrences(
        css,
        [
          '.light-flicker-effect::before {',
          "  content: '';",
          '  position: absolute;',
          '  inset: 0;',
          '  background: linear-gradient(',
          '    180deg in srgb,',
          '    rgba(255, 255, 255, 0.25) 0%,',
          '    rgba(255, 255, 255, 0.1) 20%,',
          '    color-mix(in srgb, var(--color-foreground) 6%, transparent) 40%,',
          '    transparent 60%',
          '  );',
          '  opacity: 0;',
          '  animation: light-flicker-on 1.8s ease-out forwards;',
        ].join('\n'),
      ),
    ).toBe(1);
    expect(occurrences(css, 'animation: light-flicker-on 1.8s ease-out forwards;')).toBe(1);
  });

  it('LT3: teal stays only in the allow-listed dead or frozen CSS, each file at its exact count', () => {
    const hits = hitsByFile(APP_ROOT, STYLE_SOURCE_EXTENSIONS, countTealHits);
    expect(allowListViolations(hits, CSS_TEAL_ALLOW_LIST)).toEqual({
      unexpected: [],
      drifted: [],
    });
  });

  it('LT11: the store stylesheet and the utilities stylesheet carry no teal colour (DPG-P0-1)', () => {
    for (const path of STORE_TEAL_FREE_STYLESHEETS) {
      expect(countTealHits(readApp(path)), path).toBe(0);
    }
  });

  it('LT5: every remaining teal line sits inside an allow-listed dead or frozen rule', () => {
    const hits = {
      ...tealHitsByEnclosingRule(STORE_CSS_PATH, readApp(STORE_CSS_PATH)),
      ...tealHitsByEnclosingRule(UTILITIES_CSS_PATH, readApp(UTILITIES_CSS_PATH)),
    };
    expect(allowListViolations(hits, TEAL_RULE_ALLOW_LIST)).toEqual({
      unexpected: [],
      drifted: [],
    });
  });

  it('LT6: no CSS reads a teal token outside the dead allow-list and no teal hex hides behind an alpha suffix', () => {
    expect(
      allowListViolations(
        hitsByFile(APP_ROOT, STYLE_SOURCE_EXTENSIONS, countMatches(TEAL_TOKEN_READ_PATTERN)),
        TEAL_TOKEN_READ_ALLOW_LIST,
      ),
    ).toEqual({ unexpected: [], drifted: [] });
    const tokenReads = countMatches(TEAL_TOKEN_READ_PATTERN);
    expect(
      allowListViolations(
        {
          ...hitsByCssRule(STORE_CSS_PATH, readApp(STORE_CSS_PATH), tokenReads),
          ...hitsByCssRule(UTILITIES_CSS_PATH, readApp(UTILITIES_CSS_PATH), tokenReads),
        },
        TEAL_TOKEN_READ_RULE_ALLOW_LIST,
      ),
    ).toEqual({ unexpected: [], drifted: [] });
    expect(
      hitsByFile(APP_ROOT, STYLE_SOURCE_EXTENSIONS, countMatches(TEAL_HEX_WITH_ALPHA_PATTERN)),
    ).toEqual({});
    expect(
      countMatches(TEAL_TOKEN_READ_PATTERN)('box-shadow: 0 0 20px var(--color-glow-primary);'),
    ).toBe(1);
    expect(countMatches(TEAL_TOKEN_READ_PATTERN)('background: var(--gradient-primary, red);')).toBe(
      1,
    );
    expect(
      countMatches(TEAL_TOKEN_READ_PATTERN)('--gradient-primary: linear-gradient(red, blue);'),
    ).toBe(0);
    expect(countMatches(TEAL_HEX_WITH_ALPHA_PATTERN)('color: #13d9cc1a; color: #14B8A680;')).toBe(
      2,
    );
    expect(countMatches(TEAL_HEX_WITH_ALPHA_PATTERN)('color: #13d9cc;')).toBe(0);
    expect(
      tealHitsByEnclosingRule(
        'x.css',
        [
          '.a,',
          '.b {',
          '  color: #13d9cc;',
          '}',
          '@keyframes k {',
          '  0% { color: #14b8a6; }',
          '}',
        ].join('\n'),
      ),
    ).toEqual({ 'x.css .a, .b': 1, 'x.css @keyframes k': 1 });
    expect(
      tealHitsByEnclosingRule(
        'x.css',
        [
          '.dead {',
          '  color: #13d9cc;',
          '}',
          '.live:hover { color: #13d9cc; }',
          '.c { /* note */',
          '  color: #13d9cc;',
          '}',
        ].join('\n'),
      ),
    ).toEqual({
      'x.css .dead': 1,
      'x.css .live:hover': 1,
      'x.css .c': 1,
    });
    expect(
      tealHitsByEnclosingRule(
        'x.css',
        [
          '.dead { color: #13d9cc;',
          '}',
          '} .live:hover { border-color: rgba(19, 217, 204, 0.3); }',
          '@media (hover: hover) {',
          '  @supports (color: red) { .nested { color: #14b8a6; } }',
          '}',
          ".q::after { content: '}'; color: #13d9cc; }",
          '/* .commented { color: #13d9cc; } */',
          '@theme {',
          '  --a: #13d9cc;',
          '}',
          '.after-theme { color: #14b8a6; }',
        ].join('\n'),
      ),
    ).toEqual({
      'x.css .dead': 1,
      'x.css .live:hover': 1,
      'x.css @media (hover: hover) @supports (color: red) .nested': 1,
      'x.css .q::after': 1,
      'x.css @theme': 1,
      'x.css .after-theme': 1,
    });
    expect(
      cssRuleSelectorCount(
        ['.x { a: 1; }', '.y,', '.x { b: 2; }', '@media (min-width: 1px) { .x { c: 3; } }'].join(
          '\n',
        ),
        '.x',
      ),
    ).toBe(3);
    expect(
      cssRuleBlocks('.x { a: 1; .y { b: 2; } c: 3; }').map((block) => block.body.trim()),
    ).toEqual(['b: 2;', 'a: 1;\n c: 3;']);
  });

  it('LT4: the scan is non-vacuous and the teal matcher sees the CSS forms this stage removed', () => {
    const sources = listFiles(APP_ROOT, STYLE_SOURCE_EXTENSIONS);
    for (const path of Object.keys(CSS_TEAL_ALLOW_LIST)) {
      expect(sources).toContain(path);
    }
    expect(sources).toContain(UTILITIES_CSS_PATH);
    expect(sources).toContain(STORE_CSS_PATH);
    expect(countTealHits('scrollbar-color: hsl(175 85% 46% / 0.4) transparent;')).toBe(1);
    expect(countTealHits('background: rgba(19, 217, 204, 0.1);')).toBe(1);
    expect(countTealHits('0 0 12px rgba(19, 217, 204, 0.4);')).toBe(1);
    expect(countTealHits('background: rgba(var(--color-brand-rgb), 0.12);')).toBe(0);
    expect(countZeroOffsetGlowHits('box-shadow: 0 0 20px rgba(19, 217, 204, 0.35);')).toBe(1);
    expect(countZeroOffsetGlowHits('text-shadow: 0 0 60px rgba(19, 217, 204, 0.3);')).toBe(1);
  });

  it('LT7: no dead-labelled teal rule remains, and the brass-swapped former dead rules still have no mounted consumer (DPG-P0-1)', () => {
    expect(deadRuleKeys()).toEqual([]);
    for (const [key, ruleTokens] of Object.entries(DEAD_RULE_TOKENS)) {
      const text = deadRuleText(key);
      expect(text.length, key).toBeGreaterThan(0);
      expect(countTealHits(text), key).toBe(0);
      expect(hueRangeColourHits(text), key).toEqual([]);
      for (const token of ruleTokens) {
        expect(tokenPattern(token).test(text), `${key} names ${token}`).toBe(true);
      }
    }
    const themeText = deadRuleText('styles/app.css @theme');
    const themeTealDeclarations = themeText
      .split(';')
      .filter((declaration) => countTealHits(declaration) > 0);
    expect(themeTealDeclarations).toEqual([]);
    for (const token of THEME_TOKEN_NAMES) {
      const declaration = new RegExp(`--[\\w-]*${escapedPattern(token)}:\\s*([^;]+);`).exec(
        themeText,
      );
      expect(declaration?.[1] ?? '', token).toMatch(/var\(--color-brand(?:-hover|-rgb)?\)/);
    }
    const sources = appScriptSources();
    const reachable = reachableScripts(sources);
    const tokens = [...new Set(Object.values(DEAD_RULE_TOKENS).flat())];
    for (const token of tokens) {
      const pattern = tokenPattern(token);
      const consumers = [...sources.entries()]
        .filter(([, source]) => pattern.test(source))
        .map(([path]) => path)
        .sort();
      expect(consumers, token).toEqual(Object.keys(DEAD_TOKEN_CONSUMERS[token] ?? {}).sort());
    }
    for (const [token, rulings] of Object.entries(DEAD_TOKEN_CONSUMERS)) {
      for (const [path, ruling] of Object.entries(rulings)) {
        if (ruling === 'unmounted') {
          expect(reachable.has(path), `${token} <- ${path}`).toBe(false);
        }
      }
    }
    expect(reachable.has('components/audio/AudioPreviewButton.tsx')).toBe(true);
    expect(reachable.has('components/loading/SpotlightLoader.tsx')).toBe(true);
    const previewSource = readApp('components/audio/AudioPreviewButton.tsx');
    expect(previewSource).toMatch(
      /export function AudioPreviewButton\(\{[^}]*\bvariant = 'overlay'[^}]*\}/,
    );
    const overlayBranch = bracedBlockAfter(previewSource, "if (variant === 'overlay') {");
    expect(overlayBranch).toContain('audio-preview-overlay-button');
    expect(overlayBranch).not.toContain('audio-preview-inline-button');
    expect(previewSource.indexOf('audio-preview-inline-button')).toBeGreaterThan(
      previewSource.indexOf(overlayBranch) + overlayBranch.length,
    );
    const previewTags = [...sources.values()].flatMap((source) =>
      elementTags(source, 'AudioPreviewButton'),
    );
    expect(previewTags.length).toBeGreaterThanOrEqual(3);
    for (const tag of previewTags) {
      expect(tag.includes('{...') || /\bvariant=(?!"overlay")/.test(tag), tag).toBe(false);
    }
    for (const path of listFiles(APP_ROOT, STYLE_SOURCE_EXTENSIONS)) {
      for (const block of cssRuleBlocks(readApp(path))) {
        for (const [keyframes, ruleToken] of Object.entries(DEAD_KEYFRAME_RULE_TOKENS)) {
          if (tokenPattern(keyframes).test(block.body)) {
            expect(tokenPattern(ruleToken).test(block.header), `${path} ${block.header}`).toBe(
              true,
            );
          }
        }
      }
    }
  });

  it('LT8: the mount walker follows routes, barrels by name, namespaces, re-export stars and dynamic imports', () => {
    const files = new Map<string, string>([
      ['root.tsx', "import { Live } from '~/components/kit';"],
      [
        'routes/a.tsx',
        "import * as Ns from './../components/ns';\nconst L = import('~/components/lazy');",
      ],
      ['routes/b.ts', "export { Star } from '~/components/star';"],
      ['components/kit/index.ts', "export { Live } from './Live';\nexport { Dead } from './Dead';"],
      ['components/kit/Live.tsx', 'export const Live = 1;'],
      ['components/kit/Dead.tsx', 'export const Dead = 1;'],
      ['components/ns/index.ts', "export { One } from './One';\nexport { Two } from './Two';"],
      ['components/ns/One.tsx', 'export const One = 1;'],
      ['components/ns/Two.tsx', 'export const Two = 1;'],
      ['components/lazy.tsx', 'export default 1;'],
      ['components/star/index.ts', "export * from './inner';"],
      [
        'components/star/inner/index.ts',
        "export { Star } from './Star';\nexport { Other } from './Other';",
      ],
      ['components/star/inner/Star.tsx', 'export const Star = 1;'],
      ['components/star/inner/Other.tsx', 'export const Other = 1;'],
      ['components/orphan.tsx', "import { Dead } from '~/components/kit/Dead';"],
      ['routes/c.tsx', "import Def, { Row, B as Bee } from '~/components/al';"],
      [
        'components/al/index.ts',
        "export { default as Row } from './Row';\nexport { A as B } from './A';\nexport { default } from './D';\nexport { Skip } from './Skip';",
      ],
      ['components/al/Row.tsx', 'export default 1;'],
      ['components/al/A.tsx', 'export const A = 1;'],
      ['components/al/D.tsx', 'export default 1;'],
      ['components/al/Skip.tsx', 'export const Skip = 1;'],
      ['routes/d.tsx', "import { Cm } from '~/components/cm';"],
      [
        'components/cm/index.ts',
        "export {\n  // the live part\n  Cm,\n  /* kept */\n} from './Cm';\nexport { Off } from './Off';",
      ],
      ['components/cm/Cm.tsx', 'export const Cm = 1;'],
      ['components/cm/Off.tsx', 'export const Off = 1;'],
      [
        'routes/e.tsx',
        "const glob = './**/*.tsx';\nconst open = '/*';\nimport { Hz } from '~/components/hz';\nconst close = '*/';",
      ],
      ['components/hz.tsx', 'export const Hz = 1;'],
      [
        'routes/f.ts',
        "import '../lib/side';\nconst w = new Worker(new URL('../lib/w.worker.ts', import.meta.url));",
      ],
      ['lib/side.ts', 'export const side = 1;'],
      ['lib/w.worker.ts', "import { Wk } from './wk';"],
      ['lib/wk.ts', 'export const Wk = 1;'],
      ['routes/g.tsx', "import { Anim } from '~/components/nsx';"],
      [
        'components/nsx/index.ts',
        "export * as Anim from './anim';\nexport * as Other from './other';",
      ],
      ['routes/h.tsx', "import { Bv } from '~/components/both';"],
      ['components/both/index.ts', "export * from './inner';\nexport * as Inner from './inner';"],
      ['components/both/inner/index.ts', "export { Bv } from './Bv';"],
      ['components/both/inner/Bv.tsx', 'export const Bv = 1;'],
      ['components/nsx/anim/index.ts', "export { Rv } from './Rv';"],
      ['components/nsx/anim/Rv.tsx', 'export const Rv = 1;'],
      ['components/nsx/other/index.ts', "export { Ot } from './Ot';"],
      ['components/nsx/other/Ot.tsx', 'export const Ot = 1;'],
    ]);
    expect([...reachableScripts(files)].sort()).toEqual(
      [
        'components/kit/Live.tsx',
        'components/kit/index.ts',
        'components/lazy.tsx',
        'components/ns/One.tsx',
        'components/ns/Two.tsx',
        'components/ns/index.ts',
        'components/star/index.ts',
        'components/star/inner/Star.tsx',
        'components/star/inner/index.ts',
        'root.tsx',
        'routes/a.tsx',
        'routes/b.ts',
        'routes/c.tsx',
        'components/al/index.ts',
        'components/al/Row.tsx',
        'components/al/A.tsx',
        'components/al/D.tsx',
        'routes/d.tsx',
        'components/cm/index.ts',
        'components/cm/Cm.tsx',
        'routes/e.tsx',
        'components/hz.tsx',
        'routes/f.ts',
        'lib/side.ts',
        'lib/w.worker.ts',
        'lib/wk.ts',
        'routes/g.tsx',
        'components/nsx/index.ts',
        'components/nsx/anim/index.ts',
        'components/nsx/anim/Rv.tsx',
        'components/nsx/other/index.ts',
        'routes/h.tsx',
        'components/both/index.ts',
        'components/both/inner/index.ts',
        'components/both/inner/Bv.tsx',
      ].sort(),
    );
    expect(tokenPattern('video-sync').test("from '~/lib/arrangement/video-sync';")).toBe(false);
    expect(tokenPattern('glow-primary').test('className="hover:bg-glow-primary"')).toBe(true);
    expect(
      tokenPattern('gradient-primary').test("style={{ background: 'var(--gradient-primary)' }}"),
    ).toBe(true);
    expect(tokenPattern('value-card').test('className="value-card-x"')).toBe(false);
    expect(
      elementTags('<AudioPreviewButton\n  track={t}\n  variant="inline"\n/>', 'AudioPreviewButton'),
    ).toEqual(['<AudioPreviewButton\n  track={t}\n  variant="inline"\n/>']);
  });

  it('LT9: the mount walker follows every local module specifier in app source to a file (A-R456-REVIEW-M1)', () => {
    const sources = appScriptSources();
    const unfollowed = [...sources.entries()].flatMap(([file, source]) =>
      unfollowedLocalSpecifiers(source, file, sources).map((specifier) => `${file} ${specifier}`),
    );
    expect(
      unfollowed.filter((entry) => !Object.hasOwn(UNFOLLOWED_SPECIFIER_ALLOW_LIST, entry)),
    ).toEqual([]);
    expect(
      Object.keys(UNFOLLOWED_SPECIFIER_ALLOW_LIST).filter((entry) => !unfollowed.includes(entry)),
    ).toEqual([]);
    const reachable = reachableScripts(sources);
    expect(reachable.has('components/animations/ScrollReveal.tsx')).toBe(true);
    expect(reachable.has('workers/audio-encoder.worker.ts')).toBe(true);
    const fixtures = new Map<string, string>([
      ['routes/a.tsx', ''],
      ['routes/q.tsx', ''],
      ['lib/w.worker.ts', ''],
      ['routes/dir/index.ts', ''],
    ]);
    expect(
      unfollowedLocalSpecifiers(
        "import { A } from './a';\nconst t = import(`./tpl`);\nconst u = require('./req');",
        'routes/x.tsx',
        fixtures,
      ),
    ).toEqual(['./tpl', './req']);
    expect(
      unfollowedLocalSpecifiers(
        "const accept = 'audio/*';\nimport {\n  // c\n  Q,\n} from './q';\nconst end = '*/';",
        'routes/x.tsx',
        fixtures,
      ),
    ).toEqual([]);
    expect(
      unfollowedLocalSpecifiers(
        "const re = /`/;\nimport {\n  // c\n  Q,\n} from './q';\nconst t = `x`;",
        'routes/x.tsx',
        fixtures,
      ),
    ).toEqual([]);
    expect(
      unfollowedLocalSpecifiers(
        "const re = /\\/*/;\nimport {\n  // c\n  Q,\n} from './q';\nconst end = '*/';",
        'routes/x.tsx',
        fixtures,
      ),
    ).toEqual(['./q']);
    expect(
      unfollowedLocalSpecifiers(
        "import { A } from './a/index';\nimport { B } from './dir/index';\nimport { C } from './a/';",
        'routes/x.tsx',
        fixtures,
      ),
    ).toEqual(['./a/index']);
    expect(
      unfollowedLocalSpecifiers(
        "import W from '../lib/w.worker?worker';\nimport M from './missing';\nimport s from './s.css?url';\nimport D from './dir/';\nimport h from './h.css#x';",
        'routes/x.tsx',
        fixtures,
      ),
    ).toEqual(['./missing']);
  });
  it('LT10: directory specifiers follow every file a real resolver may pick, and names survive clause and comment hazards (A-R457-REVIEW-M1)', () => {
    const directory = (specifier: string): Map<string, string> =>
      new Map<string, string>([
        ['routes/a.tsx', `import { Y } from ${specifier};`],
        ['lib/u.ts', "export { Z } from './z';"],
        ['lib/z.ts', 'export const Z = 1;'],
        ['lib/u/index.ts', "export { Y } from './Y';"],
        ['lib/u/Y.tsx', 'export const Y = 1;'],
      ]);
    const sorted = (files: Map<string, string>): string[] => [...reachableScripts(files)].sort();
    expect(sorted(directory("'~/lib/u/'"))).toEqual([
      'lib/u.ts',
      'lib/u/Y.tsx',
      'lib/u/index.ts',
      'routes/a.tsx',
    ]);
    expect(sorted(directory("'../lib/u/'"))).toEqual([
      'lib/u.ts',
      'lib/u/Y.tsx',
      'lib/u/index.ts',
      'routes/a.tsx',
    ]);
    expect(sorted(directory("'~/lib/u/index'"))).toEqual([
      'lib/u/Y.tsx',
      'lib/u/index.ts',
      'routes/a.tsx',
    ]);
    expect(sorted(directory("'~/lib/u/index.ts'"))).toEqual([
      'lib/u/Y.tsx',
      'lib/u/index.ts',
      'routes/a.tsx',
    ]);
    expect(sorted(directory("'~/lib/u'"))).toEqual(['lib/u.ts', 'routes/a.tsx']);
    const kit = (route: string): Map<string, string> =>
      new Map<string, string>([
        ['routes/a.tsx', route],
        ['kit/index.ts', "export { A } from './A';\nexport { Row } from './Row';"],
        ['kit/A.tsx', 'export const A = 1;'],
        ['kit/Row.tsx', 'export const Row = 1;'],
      ]);
    expect(sorted(kit("export interface P {}\nexport { Row } from '~/kit';"))).toContain(
      'kit/Row.tsx',
    );
    expect(
      sorted(
        kit(
          "import { A } from '~/kit';\nconst accept = 'audio/*';\nimport {\n  // c\n  Row,\n} from '~/kit';\nconst end = '*/';",
        ),
      ),
    ).toContain('kit/Row.tsx');
    expect(sorted(kit("import { A } from '~/kit';"))).toEqual([
      'kit/A.tsx',
      'kit/index.ts',
      'routes/a.tsx',
    ]);
    expect(tokenPattern('playButtonPulse').test('animate-[playButtonPulse_1s_infinite]')).toBe(
      true,
    );
    expect(tokenPattern('value-card').test('[&_.value-card_span]:block')).toBe(true);
    expect(tokenPattern('value-card').test('className="value-card-x"')).toBe(false);
  });
});

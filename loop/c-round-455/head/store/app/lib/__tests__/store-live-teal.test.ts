// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  APP_ROOT,
  allowListViolations,
  countTealHits,
  countZeroOffsetGlowHits,
  hitsByFile,
  listFiles,
  readApp,
  STYLE_SOURCE_EXTENSIONS,
  type StyleScanAllowList,
} from './helpers/style-scan';

const STORE_CSS_PATH = 'styles/app.css';
const UTILITIES_CSS_PATH = 'styles/base/utilities.css';

const LIVE_HEADER_COUNTS: Readonly<Record<string, number>> = {
  '.audio-player-artwork {': 1,
  '.audio-player-artwork:hover {': 1,
  '.audio-player-button-play {': 1,
  '.audio-player-button-play:hover {': 1,
  '.audio-player-progress::-webkit-slider-thumb:hover {': 1,
  '.audio-player-progress::-moz-range-thumb:hover {': 1,
  '.light-flicker-effect::before {': 1,
  '.not-found-grid {': 1,
  '.code-4 {': 1,
  '.code-0 {': 1,
  '.command-palette-item.selected {': 2,
  '.styled-scrollbar {': 1,
  '.styled-scrollbar::-webkit-scrollbar-thumb {': 1,
  '.styled-scrollbar::-webkit-scrollbar-thumb:hover {': 1,
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
      '  color: var(--color-text-primary);',
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

const TEAL_RULE_ALLOW_LIST: StyleScanAllowList = {
  'styles/app.css @theme {': { hits: 6, reason: 'dead teal tokens (STORE-2b-3d)' },
  'styles/app.css .hover-glow:hover {': { hits: 1, reason: 'dead (STORE-2b-3d)' },
  'styles/app.css .interactive-card:hover {': { hits: 2, reason: 'dead (STORE-2b-3d)' },
  'styles/app.css .audio-preview-inline-button::before {': {
    hits: 1,
    reason: 'dead: every AudioPreviewButton caller passes variant="overlay" (STORE-2b-3d)',
  },
  'styles/app.css .audio-preview-inline-button:hover {': {
    hits: 1,
    reason: 'dead: inline variant never rendered (STORE-2b-3d)',
  },
  'styles/app.css @keyframes audioPlayingPulse {': {
    hits: 4,
    reason: 'dead: animates only the inline variant (STORE-2b-3d)',
  },
  'styles/app.css @keyframes playButtonPulse {': {
    hits: 4,
    reason: 'dead: animates only .is-playing, which no component sets (STORE-2b-3d)',
  },
  'styles/app.css .audio-player-progress.is-playing {': {
    hits: 1,
    reason: 'dead: no component sets .is-playing (STORE-2b-3d)',
  },
  'styles/app.css .product-detail-add-to-cart:hover {': { hits: 3, reason: 'dead (STORE-2b-3d)' },
  'styles/app.css .newsletter-button-large:hover {': { hits: 3, reason: 'dead (STORE-2b-3d)' },
  'styles/app.css .testimonial-card:hover {': { hits: 2, reason: 'dead (STORE-2b-3d)' },
  'styles/app.css .waveform-bar.active {': {
    hits: 1,
    reason:
      'dead: WaveForm/TrackRow are reached only through the unmounted AssetListingPage (STORE-2b-3d)',
  },
  'styles/app.css .track-row-waveform:hover {': { hits: 1, reason: 'dead (STORE-2b-3d)' },
  'styles/app.css .loading-brand {': {
    hits: 1,
    reason: 'dead: PianoLoadingAnimation has no importer outside its barrel (STORE-2b-3d)',
  },
  'styles/app.css .pack-card-3d:hover > div {': { hits: 1, reason: 'dead (STORE-2b-3d)' },
  'styles/app.css .about-image-overlay {': { hits: 1, reason: 'dead (STORE-2b-3d)' },
  'styles/app.css .value-card:hover {': { hits: 2, reason: 'dead (STORE-2b-3d)' },
  'styles/app.css .glass-card:hover {': { hits: 2, reason: 'dead (STORE-2b-3d)' },
  'styles/base/utilities.css .hover-glow:hover {': { hits: 1, reason: 'dead (STORE-2b-3d)' },
  'styles/base/utilities.css .interactive-card:hover {': { hits: 2, reason: 'dead (STORE-2b-3d)' },
  'styles/base/utilities.css .stems-loader-list {': {
    hits: 1,
    reason: 'frozen legacy Studio StemsLoadingAnimation (legacy removal)',
  },
  'styles/base/utilities.css .stems-loader-list::-webkit-scrollbar-thumb {': {
    hits: 1,
    reason: 'frozen legacy Studio StemsLoadingAnimation (legacy removal)',
  },
  'styles/base/utilities.css .stems-loader-list::-webkit-scrollbar-thumb:hover {': {
    hits: 1,
    reason: 'frozen legacy Studio StemsLoadingAnimation (legacy removal)',
  },
};

const TEAL_TOKEN_READ_PATTERN =
  /var\(\s*--(?:color-glow-primary|color-video-sync|gradient-primary|gradient-hero|gradient-glow)\s*[,)]/g;

const TEAL_TOKEN_READ_ALLOW_LIST: StyleScanAllowList = {
  'styles/app.css': {
    hits: 2,
    reason: 'dead .product-detail-add-to-cart and .newsletter-button-large (STORE-2b-3d)',
  },
};

const TEAL_TOKEN_READ_RULE_ALLOW_LIST: StyleScanAllowList = {
  'styles/app.css .product-detail-add-to-cart {': { hits: 1, reason: 'dead (STORE-2b-3d)' },
  'styles/app.css .newsletter-button-large {': { hits: 1, reason: 'dead (STORE-2b-3d)' },
};

const TEAL_HEX_WITH_ALPHA_PATTERN =
  /#(?:13d9cc|14b8a6|0d9488|2dd4bf|5eead4|0f766e)[0-9a-f]{2}(?![0-9a-f])/gi;

const TOP_LEVEL_HEADER = /^[^\s}][^{]*\{/;

const TOP_LEVEL_SELECTOR_CONTINUATION = /^[^\s}][^{]*,\s*$/;

const CSS_TEAL_ALLOW_LIST: StyleScanAllowList = {
  'styles/app.css': {
    hits: 37,
    reason:
      'dead @theme teal tokens and dead rules (hover-glow, interactive-card, audio-preview-inline-button, audioPlayingPulse, playButtonPulse, product-detail-add-to-cart, newsletter-button-large, testimonial-card, waveform-bar, track-row-waveform, loading-brand, pack-card-3d, about-image-overlay, value-card, glass-card): STORE-2b-3d',
  },
  'styles/base/utilities.css': {
    hits: 6,
    reason:
      'dead .hover-glow and .interactive-card (STORE-2b-3d); .stems-loader-list serves only the frozen legacy Studio StemsLoadingAnimation (legacy removal)',
  },
  'styles/studio.css': {
    hits: 4,
    reason: 'frozen legacy Studio slider-thumb-teal (read-only; legacy removal)',
  },
  'styles/pages/studio.css': {
    hits: 4,
    reason: 'frozen legacy Studio slider-thumb-teal (read-only; legacy removal)',
  },
};

function occurrences(source: string, literal: string): number {
  return source.split(literal).length - 1;
}

function countMatches(pattern: RegExp): (source: string) => number {
  return (source) => (source.match(pattern) ?? []).length;
}

function lineCount(source: string, line: string): number {
  return source.split('\n').filter((candidate) => candidate === line).length;
}

function hitsByEnclosingRule(
  path: string,
  source: string,
  count: (line: string) => number,
): Record<string, number> {
  const hits: Record<string, number> = {};
  let header = '(file start)';
  let pendingSelectors: string[] = [];
  for (const line of source.split('\n')) {
    if (TOP_LEVEL_SELECTOR_CONTINUATION.test(line)) {
      pendingSelectors.push(line.trim());
    } else if (TOP_LEVEL_HEADER.test(line)) {
      header = [...pendingSelectors, line.trim()].join(' ');
      pendingSelectors = [];
    }
    const found = count(line);
    if (found > 0) {
      const key = `${path} ${header}`;
      hits[key] = (hits[key] ?? 0) + found;
    }
  }
  return hits;
}

function tealHitsByEnclosingRule(path: string, source: string): Record<string, number> {
  return hitsByEnclosingRule(path, source, countTealHits);
}

describe('store live teal CSS (STORE-2b-3c-1)', () => {
  it('LT1: every live player, 404, palette and scrollbar rule is the teal-free block, exactly once', () => {
    for (const [path, block] of LIVE_RULE_BLOCKS) {
      const label = block.split('\n')[0] ?? path;
      expect(occurrences(readApp(path), block), label).toBe(1);
      expect(countTealHits(block), label).toBe(0);
      expect(countZeroOffsetGlowHits(block), label).toBe(0);
    }
    for (const [header, count] of Object.entries(LIVE_HEADER_COUNTS)) {
      const path = header.startsWith('.styled-scrollbar') ? UTILITIES_CSS_PATH : STORE_CSS_PATH;
      expect(lineCount(readApp(path), header), header).toBe(count);
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
          ...hitsByEnclosingRule(STORE_CSS_PATH, readApp(STORE_CSS_PATH), tokenReads),
          ...hitsByEnclosingRule(UTILITIES_CSS_PATH, readApp(UTILITIES_CSS_PATH), tokenReads),
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
    ).toEqual({ 'x.css .a, .b {': 1, 'x.css @keyframes k {': 1 });
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
      'x.css .dead {': 1,
      'x.css .live:hover { color: #13d9cc; }': 1,
      'x.css .c { /* note */': 1,
    });
  });

  it('LT4: the scan is non-vacuous and the teal matcher sees the CSS forms this stage removed', () => {
    const sources = listFiles(APP_ROOT, STYLE_SOURCE_EXTENSIONS);
    for (const path of Object.keys(CSS_TEAL_ALLOW_LIST)) {
      expect(sources).toContain(path);
    }
    expect(sources).toContain(UTILITIES_CSS_PATH);
    expect(countTealHits('scrollbar-color: hsl(175 85% 46% / 0.4) transparent;')).toBe(1);
    expect(countTealHits('background: rgba(19, 217, 204, 0.1);')).toBe(1);
    expect(countTealHits('0 0 12px rgba(19, 217, 204, 0.4);')).toBe(1);
    expect(countTealHits('background: rgba(var(--color-brand-rgb), 0.12);')).toBe(0);
    expect(countZeroOffsetGlowHits('box-shadow: 0 0 20px rgba(19, 217, 204, 0.35);')).toBe(1);
    expect(countZeroOffsetGlowHits('text-shadow: 0 0 60px rgba(19, 217, 204, 0.3);')).toBe(1);
  });
});

// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest';
import {
  ANY_STYLED_SOURCE_EXTENSIONS,
  APP_ROOT,
  appScriptSources,
  cssRuleBodies,
  listFiles,
  reachableScripts,
  readApp,
} from './helpers/style-scan';
import {
  colourUtilityTokens,
  createThemeResolver,
  formatTokenHit,
  nonEmittingColourUtilities,
  STORE_THEME_ENTRY,
  type ThemeResolver,
  type TokenHit,
  undefinedPropertyReads,
} from './helpers/token-resolve';

const MIN_SCANNED_SOURCES = 200;
const MIN_PROPERTY_READS = 200;
const MIN_COLOUR_UTILITY_TOKENS = 300;
const FROZEN_LEGACY_STUDIO = 'components/studio/GlobalPlayhead.tsx';
const TRANSITION_PROPERTY_FILE = 'routes/store.tsx';

const NON_EMITTING_ALLOW_LIST: Readonly<
  Record<string, { tokens: ReadonlyArray<string>; reason: string }>
> = {
  'components/auth/UserDropdown.tsx': {
    tokens: [
      ...Array<string>(2).fill('bg-brand-surface-elevated'),
      ...Array<string>(3).fill('border-brand-border'),
      ...Array<string>(3).fill('hover:bg-brand-surface'),
      'hover:border-brand-border-hover',
      ...Array<string>(3).fill('hover:text-text'),
      ...Array<string>(2).fill('text-text'),
      ...Array<string>(4).fill('text-text-muted'),
    ],
    reason: 'dead: no importer outside its barrel',
  },
  'components/chat/ChatButton.tsx': {
    tokens: ['hover:shadow-glow'],
    reason: 'dead: ChatWidget is not mounted (round 453 ruling)',
  },
  'components/home/ArtistBioSection.tsx': {
    tokens: ['text-glow'],
    reason: 'dead: text-glow kept by the round 449 ruling',
  },
  'components/home/TestimonialsSection.tsx': {
    tokens: ['text-glow'],
    reason: 'dead: text-glow kept by the round 449 ruling',
  },
  'components/ui/IconButton.tsx': {
    tokens: ['hover:shadow-glow'],
    reason: 'dead: shadow-glow kept by the round 453 ruling',
  },
  [FROZEN_LEGACY_STUDIO]: { tokens: ['shadow-glow'], reason: 'frozen legacy Studio' },
  [TRANSITION_PROPERTY_FILE]: {
    tokens: ['border-color'],
    reason: 'border-color is a transition property name, not a class',
  },
};

const REPLACEMENT_CLASSES: ReadonlyArray<string> = [
  'bg-surface',
  'bg-background/70',
  'text-foreground',
];
const REMOVED_CLASSES: ReadonlyArray<string> = [
  'bg-card',
  'bg-primary/90',
  'text-primary-foreground',
  'group-hover:text-primary',
];

function styledSources(): Map<string, string> {
  return new Map(
    listFiles(APP_ROOT, ANY_STYLED_SOURCE_EXTENSIONS)
      .filter((path) => !path.includes('__tests__'))
      .map((path): [string, string] => [path, readApp(path)]),
  );
}

function tokensByFile(hits: ReadonlyArray<TokenHit>): Record<string, string[]> {
  const tokens: Record<string, string[]> = {};
  for (const hit of hits) {
    tokens[hit.file] = [...(tokens[hit.file] ?? []), hit.token];
  }
  for (const file of Object.keys(tokens)) {
    tokens[file]?.sort();
  }
  return tokens;
}

describe('Store undefined tokens (DPG-P0-2)', { timeout: 30_000 }, () => {
  let themeCss = '';
  let sources = new Map<string, string>();
  let resolver: ThemeResolver;

  beforeAll(async () => {
    themeCss = readApp(STORE_THEME_ENTRY);
    sources = styledSources();
    resolver = await createThemeResolver(themeCss, []);
  });

  it('UT1: every var() read without a fallback in non-test app sources resolves to a declared property', async () => {
    expect(sources.size).toBeGreaterThanOrEqual(MIN_SCANNED_SOURCES);
    const reads = [...sources.values()].join('\n').match(/var\(\s*--/g) ?? [];
    expect(reads.length).toBeGreaterThanOrEqual(MIN_PROPERTY_READS);
    const hits = await undefinedPropertyReads(sources, themeCss);
    expect(hits.map(formatTokenHit)).toEqual([]);
  });

  it('UT2: colour utilities that Tailwind does not emit exist only in the allow-listed dead, frozen or non-class files, with their exact tokens', async () => {
    const scripts = new Map([...sources].filter(([path]) => /\.(ts|tsx)$/.test(path)));
    const tokens = [...scripts].flatMap(([file, source]) => colourUtilityTokens(file, source));
    expect(tokens.length).toBeGreaterThanOrEqual(MIN_COLOUR_UTILITY_TOKENS);
    const hits = await nonEmittingColourUtilities(scripts, themeCss);
    expect(tokensByFile(hits)).toEqual(
      Object.fromEntries(
        Object.entries(NON_EMITTING_ALLOW_LIST).map(([file, entry]) => [
          file,
          [...entry.tokens].sort(),
        ]),
      ),
    );
  });

  it('UT2b: every allow-listed dead file stays unmounted', () => {
    const reachable = reachableScripts(appScriptSources());
    const dead = Object.keys(NON_EMITTING_ALLOW_LIST).filter(
      (file) => file !== FROZEN_LEGACY_STUDIO && file !== TRANSITION_PROPERTY_FILE,
    );
    expect(dead).toHaveLength(5);
    expect(dead.filter((file) => reachable.has(file))).toEqual([]);
    expect(reachable.has('components/product/ProductCard.tsx')).toBe(true);
  });

  it('UT3: the resolver agrees with the browser on the replaced and replacement classes', () => {
    for (const candidate of REPLACEMENT_CLASSES) {
      expect(resolver.emitsUtility(candidate), candidate).toBe(true);
    }
    for (const candidate of REMOVED_CLASSES) {
      expect(resolver.emitsUtility(candidate), candidate).toBe(false);
    }
    expect(resolver.definesProperty('--color-foreground')).toBe(true);
    expect(resolver.definesProperty('--color-muted')).toBe(true);
  });

  it('UT4: fixtures, flagged and clean', async () => {
    const fixtures = new Map<string, string>([
      ['fx/Badge.tsx', 'export const B = () => <div className="bg-primary/90 text-foreground" />;'],
      [
        'fx/Apostrophe.tsx',
        'export const A = () => <p>I\'m <span className="text-glow">x</span></p>;',
      ],
      [
        'fx/Template.tsx',
        ['export const t = (on: boolean) => `p-2 ', '$', '{on ? "bg-card" : "bg-surface"}`;'].join(
          '',
        ),
      ],
      [
        'fx/Variant.tsx',
        'export const V = () => <div className="text-sheen hover:text-sheen 2xl:text-2xl 2xl:bg-card" />;',
      ],
      [
        'fx/Clean.tsx',
        'export const C = () => <div className="bg-brand/90 text-background hover:bg-elevated" />;',
      ],
    ]);
    const utilities = await nonEmittingColourUtilities(
      fixtures,
      `${themeCss}\n.text-sheen { color: var(--color-brand); }\n`,
    );
    expect(utilities.map(formatTokenHit)).toEqual([
      'fx/Badge.tsx:1 bg-primary/90',
      'fx/Apostrophe.tsx:1 text-glow',
      'fx/Template.tsx:1 bg-card',
      'fx/Variant.tsx:1 hover:text-sheen',
      'fx/Variant.tsx:1 2xl:bg-card',
    ]);
    const css = new Map<string, string>([
      ['fx/a.css', '.x { color: var(--nope-token); }'],
      ['fx/b.css', '.y { color: var(--color-black); outline-offset: var(--focus-offset, 2px); }'],
      ['fx/c.tsx', "export const s = { '--local-gap': '1px', gap: 'var(--local-gap)' };"],
      ['fx/d.css', '.z { color: var(--color-text-primary); }'],
    ]);
    const reads = await undefinedPropertyReads(css, themeCss);
    expect(reads.map(formatTokenHit)).toEqual([
      'fx/a.css:1 --nope-token',
      'fx/d.css:1 --color-text-primary',
    ]);
  });

  it('UT5: the nav loading bar paints nothing and keeps no animation', () => {
    expect(cssRuleBodies(themeCss, '.nav-loading-bar').map((body) => body.trim())).toEqual([
      'display: none;',
    ]);
    expect(themeCss).not.toContain('navLoadingProgress');
    expect(themeCss).not.toContain('--color-accent-hover');
  });
});

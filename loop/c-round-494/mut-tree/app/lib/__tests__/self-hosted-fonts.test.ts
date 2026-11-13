import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { links as rootLinks } from '~/root';

const APP_ROOT = resolve(__dirname, '../..');
const FONTS_DIR = resolve(APP_ROOT, 'assets/fonts');
const FONTS_CSS_PATH = resolve(FONTS_DIR, 'fonts.css');
const LICENSES_DIR = resolve(FONTS_DIR, 'licenses');
const ROOT_PATH = resolve(APP_ROOT, 'root.tsx');
const APP_CSS_PATH = resolve(APP_ROOT, 'styles/app.css');
const GOOGLE_FONT_HOST_PATTERN = /fonts\.(googleapis|gstatic)\.com/;

const SELF_HOSTED_FONT_SHA256: ReadonlyArray<readonly [string, string]> = [
  [
    'ibm-plex-mono-cyrillic-ext.woff2',
    'f8c22ec1804bd6966b70f43ac7c327025645b4c09597117fca2a5a6c750106fe',
  ],
  [
    'ibm-plex-mono-cyrillic.woff2',
    '7635422bd10ddbbcb0e0caa1154b928298f5c8319b8c00b30978d4395f4783ce',
  ],
  [
    'ibm-plex-mono-latin-ext.woff2',
    '6bc0f226a5b7884a8170e3f62c63d7675609d4631bdc5931b5cdab81821f00eb',
  ],
  ['ibm-plex-mono-latin.woff2', '08949f728dc52d528e69b1667d15c89a5686a4ee9a296ff90983985f99c380f7'],
  [
    'ibm-plex-mono-vietnamese.woff2',
    '62632b6375305e70ddcafdd895218e6ae41a184fcd280a69c739460604ca00a9',
  ],
  [
    'instrument-sans-latin-ext.woff2',
    'c4fcfea41f2c1cfeea9211fa43679845454a1d0e0d7e95e069c7e73c4ae302d2',
  ],
  [
    'instrument-sans-latin.woff2',
    '2ee17598a98d8a59e4df8152d015bec9ab8e4d5672cc0ab42bef806b568e3971',
  ],
  ['inter-cyrillic-ext.woff2', 'ca157063339ac4ad418f214f3abfed119b0798ab4d377386ce5c9e5a7a435ebd'],
  ['inter-cyrillic.woff2', '71d5ee93cc1e9f1d520a3a8b66456de18c7879d8df09d57fcd2eaff75fef0075'],
  ['inter-greek-ext.woff2', '6e9e020a25f9b56d418f2c085b1d3c09725a4da23fe693a5b463064606732190'],
  ['inter-greek.woff2', '1be3448e292fbf05ffe176fe1e43f135013d50b1e7d324ad1a558f623d3bb6f6'],
  ['inter-latin-ext.woff2', '34b9c504cab7a73e37b746343a449132e56cf7b5481af2cb81dc74dcff25c956'],
  ['inter-latin.woff2', '3100e775e8616cd2611beecfa23a4263d7037586789b43f035236a2e6fbd4c62'],
  ['inter-vietnamese.woff2', '5c66f9e07e90c6d4ac4922cc68d60de26c17b1858e677fb5e603fce3952b3ff2'],
  [
    'noto-sans-georgian-cyrillic-ext.woff2',
    '1ac64c50da07536fa25de905de4f7b741ace69fcdb5ee8557b7631750552a6fc',
  ],
  [
    'noto-sans-georgian-georgian.woff2',
    '3fc0dec93921c7b8032a09d7ae93856c4bf6391c135dc80b61fd24c9ea1ab449',
  ],
  [
    'noto-sans-georgian-greek-ext.woff2',
    '1ac64c50da07536fa25de905de4f7b741ace69fcdb5ee8557b7631750552a6fc',
  ],
  [
    'noto-sans-georgian-latin-ext.woff2',
    'cf65951efa1e3e85dcf4be4fe400543633372c1fdf62f20a7ab1b4333d849f14',
  ],
  [
    'noto-sans-georgian-latin.woff2',
    'eb8ee9bbda6bd81fe3d4cbb772b1c159ce699e63ba59730932b6635367d089a7',
  ],
  [
    'noto-sans-georgian-math.woff2',
    'bc20e9dbdb704a6e509d6438249f8511f0a5188f01526d5031ba953bc22f1b5b',
  ],
  [
    'noto-sans-georgian-symbols.woff2',
    '4172da02687da351d59e2c52bc098112afc8c9691617680f8d3df44671cda192',
  ],
  [
    'playfair-display-cyrillic.woff2',
    'c108681cba6a9820bff52f4a1a4a1d9edf356b347bd79b7c61e916028e8a8b54',
  ],
  [
    'playfair-display-latin-ext.woff2',
    '42898ad49a6b23f32b109243e1df596edf831015ed685f429e4dafbb181d599d',
  ],
  [
    'playfair-display-latin.woff2',
    'e0c764a8e9e1cce92163c55bac4b2ad6cd4cf8c696ce2289ab5c41565e65b7e2',
  ],
  [
    'playfair-display-vietnamese.woff2',
    'ef6446229b59773e671021650ef3882cf35806dae723ce047de87c0a6633039a',
  ],
];

const SELF_HOSTED_FONT_FAMILIES = [
  'IBM Plex Mono',
  'Instrument Sans',
  'Inter',
  'Noto Sans Georgian',
  'Playfair Display',
];

const TOKEN_FONT_FAMILIES = ['IBM Plex Mono', 'Instrument Sans', 'Noto Sans Georgian'];

const INSTRUMENT_SANS_STACK = "'Instrument Sans', 'Noto Sans Georgian', system-ui, sans-serif";

const STORE_THEME_FONT_TOKENS: Record<string, string> = {
  '--font-mono': "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  '--font-sans': INSTRUMENT_SANS_STACK,
  '--font-serif': INSTRUMENT_SANS_STACK,
};

const SELF_HOSTED_FONT_LICENSES = [
  'OFL-ibm-plex-mono.txt',
  'OFL-instrument-sans.txt',
  'OFL-inter.txt',
  'OFL-noto-sans-georgian.txt',
  'OFL-playfair-display.txt',
];

function listSourceFiles(root: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(root)) {
    const path = join(root, entry);
    if (statSync(path).isDirectory()) {
      if (entry !== '__tests__') files.push(...listSourceFiles(path));
    } else if (/\.(tsx?|css)$/.test(entry) && !/\.test\.tsx?$/.test(entry)) {
      files.push(path);
    }
  }
  return files;
}

function readFontFaceBlocks(css: string): string[] {
  return css.match(/@font-face \{[^}]*\}/g) ?? [];
}

function readDeclaration(block: string, property: string): string | null {
  const match = block.match(new RegExp(`${property}: ([^;]+);`));
  return match?.[1] ?? null;
}

function sha256Of(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

describe('Self-hosted fonts (PERF-7)', () => {
  it('FN1: no app source or stylesheet names a Google Fonts host, and fonts.css is not imported as a side effect', () => {
    const files = listSourceFiles(APP_ROOT);
    expect(files.length).toBeGreaterThanOrEqual(100);
    const offenders = files
      .filter((path) => GOOGLE_FONT_HOST_PATTERN.test(readFileSync(path, 'utf8')))
      .map((path) => relative(APP_ROOT, path));
    expect(offenders).toEqual([]);
    const fontsCssImporters = files
      .filter((path) => /fonts\.css(?!\?url)/.test(readFileSync(path, 'utf8')))
      .map((path) => relative(APP_ROOT, path));
    expect(fontsCssImporters).toEqual([]);
  });

  it('FN2: fonts.css has 83 swap faces for the 5 families, every url is a local file and every woff2 is used', () => {
    const css = readFileSync(FONTS_CSS_PATH, 'utf8');
    const blocks = readFontFaceBlocks(css);
    expect(blocks).toHaveLength(83);
    const families = new Set(blocks.map((block) => readDeclaration(block, 'font-family')));
    expect([...families].sort()).toEqual(SELF_HOSTED_FONT_FAMILIES.map((family) => `'${family}'`));
    for (const block of blocks) {
      expect(readDeclaration(block, 'font-display')).toBe('swap');
      expect(readDeclaration(block, 'unicode-range')).not.toBeNull();
    }
    const urls = new Set(
      [...css.matchAll(/url\('\.\/([^']+)'\) format\('woff2'\)/g)].map((match) => match[1]),
    );
    expect(blocks.every((block) => /url\('\.\/[^']+\.woff2'\) format\('woff2'\)/.test(block))).toBe(
      true,
    );
    const woff2Files = readdirSync(FONTS_DIR).filter((entry) => entry.endsWith('.woff2'));
    expect([...urls].sort()).toEqual([...woff2Files].sort());
    expect(css).not.toMatch(/@import/);
  });

  it('FN3: every shipped woff2 is byte-identical to the pinned Google Fonts file', () => {
    const woff2Files = readdirSync(FONTS_DIR)
      .filter((entry) => entry.endsWith('.woff2'))
      .sort();
    expect(woff2Files).toEqual(SELF_HOSTED_FONT_SHA256.map(([name]) => name));
    for (const [name, sha256] of SELF_HOSTED_FONT_SHA256) {
      expect(sha256Of(resolve(FONTS_DIR, name)), name).toBe(sha256);
    }
  });

  it('FN4: the store @theme font tokens hold the Instrument Sans and Plex Mono stacks, every family has a face, and each family ships its OFL licence', () => {
    const appCss = readFileSync(APP_CSS_PATH, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const themeStart = appCss.indexOf('\n@theme {');
    expect(themeStart).toBeGreaterThan(-1);
    expect(appCss.indexOf('\n@theme {', themeStart + 1)).toBe(-1);
    const themeEnd = appCss.indexOf('\n}', themeStart);
    expect(themeEnd).toBeGreaterThan(themeStart);
    const themeBlock = appCss.slice(themeStart, themeEnd);
    const themeFontTokens: Record<string, string> = {};
    for (const match of themeBlock.matchAll(/(--font-(?:sans|serif|mono)):\s*([^;]+);/g)) {
      const [, token, value] = match;
      if (token && value) themeFontTokens[token] = value.trim();
    }
    expect(themeFontTokens).toEqual(STORE_THEME_FONT_TOKENS);
    const tokenFamilies = new Set<string>();
    for (const value of Object.values(themeFontTokens)) {
      for (const name of value.matchAll(/'([^']+)'/g)) {
        if (name[1]) tokenFamilies.add(name[1]);
      }
    }
    expect([...tokenFamilies].sort()).toEqual(TOKEN_FONT_FAMILIES);
    for (const family of tokenFamilies) {
      expect(SELF_HOSTED_FONT_FAMILIES).toContain(family);
    }
    const css = readFileSync(FONTS_CSS_PATH, 'utf8');
    for (const family of tokenFamilies) {
      expect(css, family).toContain(`font-family: '${family}';`);
    }
    expect(readdirSync(LICENSES_DIR).sort()).toEqual(SELF_HOSTED_FONT_LICENSES);
    for (const license of SELF_HOSTED_FONT_LICENSES) {
      expect(readFileSync(resolve(LICENSES_DIR, license), 'utf8'), license).toContain(
        'SIL OPEN FONT LICENSE Version 1.1',
      );
    }
  });

  it('FN6: the store body uses the font token, and app.css names neither Inter nor Playfair Display', () => {
    const appCss = readFileSync(APP_CSS_PATH, 'utf8');
    expect(appCss).toMatch(/(?:^|\n)body\s*\{[^}]*\bfont-family:\s*var\(--font-sans\);/);
    expect(appCss).not.toMatch(/['"](?:Inter|Playfair Display)['"]/);
  });

  it('FN5: root links exactly the local font stylesheet, then app.css, with no external URL', () => {
    const source = readFileSync(ROOT_PATH, 'utf8');
    expect(source).toContain("import fontStyles from './assets/fonts/fonts.css?url';");
    const linksBlock = source.match(/export const links: LinksFunction = \(\) => \[([\s\S]*?)\];/);
    expect(linksBlock?.[1]?.trim()).toBe(
      "{ rel: 'stylesheet', href: fontStyles },\n  { rel: 'stylesheet', href: appStyles },",
    );
    const descriptors = rootLinks();
    expect(descriptors).toHaveLength(2);
    for (const descriptor of descriptors) {
      const href = 'href' in descriptor ? descriptor.href : undefined;
      expect(href ?? '').not.toMatch(/^https?:/);
    }
  });
});

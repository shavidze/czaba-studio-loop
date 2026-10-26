// @vitest-environment node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const STORE_ROOT = process.env.STORE_THEME_TOKENS_ROOT ?? resolve(__dirname, '../../..');
const APP_ROOT = resolve(STORE_ROOT, 'app');
const APP_CSS_PATH = resolve(APP_ROOT, 'styles/app.css');
const OBSIDIAN_SELECTOR =
  '[data-studio-theme="obsidian"],\nbody:has([data-studio-theme="obsidian"]) {';

const EXPECTED_OBSIDIAN_DECLARATIONS: Record<string, string> = {
  '--color-background': '#0e0d0c',
  '--color-surface': '#161412',
  '--color-elevated': '#1d1a17',
  '--color-muted-bg': '#24201c',
  '--color-outline': '#24211e',
  '--color-outline-hover': '#2e2a26',
  '--color-outline-strong': '#736b60',
  '--color-outline-light': 'rgb(36 33 30 / 0.5)',
  '--color-foreground': '#ece6da',
  '--color-muted': '#a39b8e',
  '--color-dim': '#928a7d',
  '--color-brand': '#c9a46a',
  '--color-brand-hover': '#d9b87f',
  '--color-brand-foreground': '#0e0d0c',
  '--color-accent': '#c9a46a',
  '--color-positive': '#8fa382',
  '--color-warning': '#d9a35b',
  '--color-destructive': '#d2776a',
  '--font-sans': "'Instrument Sans', 'Noto Sans Georgian', system-ui, sans-serif",
  '--font-mono': "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
  'font-family': 'var(--font-sans)',
};

const EXPECTED_STORE_ONLY_TOKENS: Record<string, string> = {
  '--color-surface-glass': '#1a1714',
  '--color-surface-glass-strong': '#161412',
  '--color-secondary': '#cfc7ba',
  '--color-bg-alt': '#12100f',
  '--color-brand-rgb': '201, 164, 106',
  '--color-accent-rgb': '201, 164, 106',
  '--color-buy': '#c9a46a',
  '--color-buy-hover': '#d9b87f',
};

const STORE_2B_EXEMPT_COLOUR_KEYS = [
  '--color-info',
  '--color-error',
  '--color-error-light',
  '--color-error-bg',
  '--color-error-border',
  '--color-social-facebook',
  '--color-social-facebook-hover',
  '--color-social-google',
  '--color-social-google-hover',
  '--color-social-google-border',
  '--color-social-google-text',
  '--color-blue-60',
  '--color-blue-50',
  '--color-blue-30',
  '--color-crystal-cyan',
  '--color-crystal-blue',
  '--color-crystal-purple',
  '--color-crystal-green',
  '--color-premium-amber',
  '--color-premium-gold',
  '--color-premium-rose',
  '--color-glow-primary',
  '--color-glow-secondary',
  '--color-video-progress',
  '--color-video-track',
  '--color-video-volume',
  '--color-video-sync',
];

const RETIRED_STORE_COLOUR_FRAGMENTS = [
  'hsl(175',
  '13d9cc',
  '19, 217, 204',
  '#006aff',
  '#0052cc',
  '#f9a91f',
];

const BUTTON_UNCHANGED_VARIANT_BLOCKS = [
  "  primary: [\n    'bg-brand text-background',\n    'hover:bg-brand-hover',\n    'active:opacity-90',\n    'shadow-sm hover:shadow-glow',\n  ].join(' '),",
  "  secondary: [\n    'bg-elevated text-foreground',\n    'border border-outline',\n    'hover:bg-outline hover:border-outline-hover',\n    'active:opacity-90',\n  ].join(' '),",
  "  ghost: [\n    'bg-transparent text-muted',\n    'hover:bg-elevated hover:text-foreground',\n    'active:opacity-90',\n  ].join(' '),",
  "  accent: [\n    'bg-accent text-background',\n    'hover:brightness-110',\n    'active:opacity-90',\n    'shadow-sm',\n  ].join(' '),",
];

const CONFIRM_DIALOG_NEUTRAL_CLASSES = 'bg-foreground text-background hover:bg-foreground/90';

function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

function readStoreFile(relativePath: string): string {
  return readFileSync(resolve(STORE_ROOT, relativePath), 'utf8');
}

function parseDeclarations(body: string): Record<string, string> {
  const declarations: Record<string, string> = {};
  for (const rawDeclaration of body.split(';')) {
    const declaration = rawDeclaration.trim();
    if (declaration === '') continue;
    const colon = declaration.indexOf(':');
    const property = declaration.slice(0, colon).trim();
    expect(declarations[property], `duplicate declaration ${property}`).toBeUndefined();
    declarations[property] = declaration.slice(colon + 1).trim();
  }
  return declarations;
}

function parseStoreThemeDeclarations(css: string): Record<string, string> {
  const themeStart = css.indexOf('@theme {');
  expect(themeStart).toBeGreaterThan(-1);
  expect(css.indexOf('@theme {', themeStart + 1)).toBe(-1);
  const bodyStart = themeStart + '@theme {'.length;
  let depth = 1;
  let index = bodyStart;
  for (; depth > 0 && index < css.length; index += 1) {
    if (css[index] === '{') depth += 1;
    if (css[index] === '}') depth -= 1;
  }
  expect(depth).toBe(0);
  const body = css.slice(bodyStart, index - 1);
  expect(body).not.toContain('{');
  return parseDeclarations(body);
}

function parseObsidianDeclarations(css: string): Record<string, string> {
  const selectorIndex = css.indexOf(OBSIDIAN_SELECTOR);
  expect(selectorIndex).toBeGreaterThan(-1);
  expect(css.indexOf(OBSIDIAN_SELECTOR, selectorIndex + 1)).toBe(-1);
  const bodyStart = selectorIndex + OBSIDIAN_SELECTOR.length;
  return parseDeclarations(css.slice(bodyStart, css.indexOf('}', bodyStart)));
}

function classTokens(classString: string): string[] {
  return classString.split(/\s+/).filter((token) => token !== '');
}

function classAttributesWithTokens(source: string, requiredTokens: string[]): string[] {
  return [...source.matchAll(/className="([^"]*)"/g)]
    .map((match) => match[1] ?? '')
    .filter((classString) => {
      const tokens = classTokens(classString);
      return requiredTokens.every((token) => tokens.includes(token));
    });
}

function expectDarkTextOnFill(classString: string, fillClass: string): void {
  const tokens = classTokens(classString);
  expect(tokens, classString).toContain(fillClass);
  expect(tokens, classString).toContain('text-brand-foreground');
  expect(tokens, classString).not.toContain('text-foreground');
}

function buttonVariantClasses(source: string, variant: string): string {
  const match = new RegExp(`\\n  ${variant}: \\[([^\\]]*)\\]\\.join\\(' '\\),`).exec(source);
  expect(match, `${variant} variant block`).not.toBeNull();
  return [...(match?.[1] ?? '').matchAll(/'([^']*)'/g)].map((part) => part[1] ?? '').join(' ');
}

function studioThemeMarkerLinesByFile(root: string, directory = root): Record<string, number> {
  const linesByFile: Record<string, number> = {};
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      if (entry === '__tests__') continue;
      Object.assign(linesByFile, studioThemeMarkerLinesByFile(root, path));
      continue;
    }
    const lines = readFileSync(path, 'utf8')
      .split('\n')
      .filter((line) => line.includes('data-studio-theme')).length;
    if (lines > 0) linesByFile[relative(root, path)] = lines;
  }
  return linesByFile;
}

function loadStoreThemeBlocks(): {
  theme: Record<string, string>;
  obsidian: Record<string, string>;
} {
  const css = stripCssComments(readFileSync(APP_CSS_PATH, 'utf8'));
  return { theme: parseStoreThemeDeclarations(css), obsidian: parseObsidianDeclarations(css) };
}

describe('Store @theme colour tokens: Obsidian & Brass (STORE-2a)', () => {
  it('ST1: every colour key of the obsidian block has the identical value in the store @theme', () => {
    const { theme, obsidian } = loadStoreThemeBlocks();
    const obsidianColourKeys = Object.keys(obsidian).filter((key) => key.startsWith('--color-'));
    expect(obsidianColourKeys).toHaveLength(18);
    for (const key of obsidianColourKeys) {
      expect(theme[key], key).toBe(obsidian[key]);
    }
  });

  it('ST2: the eight store-only keys hold the Obsidian & Brass values', () => {
    const { theme } = loadStoreThemeBlocks();
    for (const [key, value] of Object.entries(EXPECTED_STORE_ONLY_TOKENS)) {
      expect(theme[key], key).toBe(value);
    }
  });

  it('ST3: no changed colour key keeps a retired teal, buy-blue or orange value', () => {
    const { theme } = loadStoreThemeBlocks();
    const colourKeys = Object.keys(theme).filter((key) => key.startsWith('--color-'));
    for (const exemptKey of STORE_2B_EXEMPT_COLOUR_KEYS) {
      expect(colourKeys, exemptKey).toContain(exemptKey);
    }
    const checkedKeys = colourKeys.filter((key) => !STORE_2B_EXEMPT_COLOUR_KEYS.includes(key));
    expect(checkedKeys).toHaveLength(26);
    for (const key of checkedKeys) {
      const value = (theme[key] ?? '').toLowerCase();
      for (const fragment of RETIRED_STORE_COLOUR_FRAGMENTS) {
        expect(value, `${key} contains ${fragment}`).not.toContain(fragment);
      }
    }
  });

  it('ST4: the Studio obsidian block keeps exactly its 21 declarations', () => {
    const { obsidian } = loadStoreThemeBlocks();
    expect(obsidian).toEqual(EXPECTED_OBSIDIAN_DECLARATIONS);
  });

  it('ST5: all nine brass and destructive fills carry dark brand-foreground text', () => {
    const buttonSource = readStoreFile('app/components/ui/Button.tsx');
    expectDarkTextOnFill(buttonVariantClasses(buttonSource, 'buy'), 'bg-buy');
    expectDarkTextOnFill(buttonVariantClasses(buttonSource, 'destructive'), 'bg-destructive');
    for (const block of BUTTON_UNCHANGED_VARIANT_BLOCKS) {
      expect(buttonSource).toContain(block);
    }

    const hireUsSubmit = classAttributesWithTokens(readStoreFile('app/routes/hire-us.tsx'), [
      'bg-brand',
      'w-full',
      'rounded-xl',
    ]);
    expect(hireUsSubmit).toHaveLength(1);
    expectDarkTextOnFill(hireUsSubmit[0] ?? '', 'bg-brand');

    const ordersCta = classAttributesWithTokens(readStoreFile('app/routes/account.orders.tsx'), [
      'bg-brand',
      'inline-block',
    ]);
    expect(ordersCta).toHaveLength(1);
    expectDarkTextOnFill(ordersCta[0] ?? '', 'bg-brand');

    const buyNow = classAttributesWithTokens(
      readStoreFile('app/components/product/PurchaseHeader.tsx'),
      ['bg-buy'],
    );
    expect(buyNow).toHaveLength(1);
    expectDarkTextOnFill(buyNow[0] ?? '', 'bg-buy');

    const leadMagnetSource = readStoreFile('app/components/marketing/LeadMagnetPopup.tsx');
    const leadMagnetSubmit = classAttributesWithTokens(leadMagnetSource, [
      'bg-destructive',
      'uppercase',
    ]);
    expect(leadMagnetSubmit).toHaveLength(1);
    expectDarkTextOnFill(leadMagnetSubmit[0] ?? '', 'bg-destructive');
    expect(leadMagnetSource).toContain("{isSubmitting ? 'SENDING...' : 'CONTINUE'}");

    const modalBranches = /variant === 'destructive'\s*\?\s*'([^']*)'\s*:\s*'([^']*)'/.exec(
      readStoreFile('app/components/ui/Modal.tsx'),
    );
    expect(modalBranches).not.toBeNull();
    expectDarkTextOnFill(modalBranches?.[1] ?? '', 'bg-destructive');
    expect(modalBranches?.[2]).toBe(CONFIRM_DIALOG_NEUTRAL_CLASSES);

    const chatBadge = [
      ...readStoreFile('app/components/chat/ChatButton.tsx').matchAll(/'(bg-destructive[^']*)'/g),
    ].map((match) => match[1] ?? '');
    expect(chatBadge).toHaveLength(1);
    expectDarkTextOnFill(chatBadge[0] ?? '', 'bg-destructive');

    const forgetPasswordSource = readStoreFile('app/components/auth/ForgetPassword.tsx');
    const successCircle =
      /rounded-full bg-brand flex[^"]*">\s*<CheckCircle className="([^"]*)"/.exec(
        forgetPasswordSource,
      );
    expect(successCircle).not.toBeNull();
    const iconTokens = classTokens(successCircle?.[1] ?? '');
    expect(iconTokens).toContain('text-brand-foreground');
    expect(iconTokens).not.toContain('text-foreground');
  });

  it('ST6: no store markup gains the Studio theme marker', () => {
    const linesByFile = studioThemeMarkerLinesByFile(APP_ROOT);
    const scriptLines = Object.entries(linesByFile)
      .filter(([path]) => /\.tsx?$/.test(path))
      .reduce((sum, [, lines]) => sum + lines, 0);
    const totalLines = Object.values(linesByFile).reduce((sum, lines) => sum + lines, 0);
    expect({ total: totalLines, script: scriptLines }).toEqual({ total: 3, script: 1 });
    expect(linesByFile).toEqual({
      'components/arrangement/StudioWorkspace.tsx': 1,
      'styles/app.css': 2,
    });
  });
});

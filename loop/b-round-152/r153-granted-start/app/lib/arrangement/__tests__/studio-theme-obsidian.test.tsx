// @vitest-environment node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import StudioLabRoute, { links } from '~/routes/studio-lab';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const APP_ROOT = resolve(__dirname, '../../..');
const APP_CSS_PATH = resolve(APP_ROOT, 'styles/app.css');
const STYLES_ROOT = resolve(APP_ROOT, 'styles');
const ARRANGEMENT_COMPONENTS_ROOT = resolve(APP_ROOT, 'components/arrangement');
const LOOP_BRACE_PATH = resolve(ARRANGEMENT_COMPONENTS_ROOT, 'ArrangementLoopBrace.tsx');
const SCOPE_MARKER = 'data-studio-theme';
const OBSIDIAN_SELECTOR =
  '[data-studio-theme="obsidian"],\nbody:has([data-studio-theme="obsidian"]) {';

const EXPECTED_OBSIDIAN_TOKENS: Record<string, string> = {
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

function stripThemeTestComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function listFilesRecursively(root: string, include: (path: string) => boolean): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(root)) {
    const path = join(root, entry);
    if (statSync(path).isDirectory()) {
      if (entry !== '__tests__') {
        files.push(...listFilesRecursively(path, include));
      }
    } else if (include(path)) {
      files.push(path);
    }
  }
  return files;
}

function countOccurrences(text: string, needle: string): number {
  return text.split(needle).length - 1;
}

function classTokensByTestId(html: string, testId: string): string[] {
  const tags = [...html.matchAll(/<[a-z]+\b[^>]*>/g)]
    .map((match) => match[0])
    .filter((tag) => tag.includes(`data-testid="${testId}"`));
  expect(tags).toHaveLength(1);
  const classMatch = /\bclass="([^"]*)"/.exec(tags[0] ?? '');
  return (classMatch?.[1] ?? '').split(/\s+/).filter((token) => token !== '');
}

function classTokensOfEveryTag(html: string): { tag: string; tokens: string[] }[] {
  return [...html.matchAll(/<[a-z]+\b[^>]*>/g)].map((match) => {
    const classMatch = /\bclass="([^"]*)"/.exec(match[0]);
    return {
      tag: match[0],
      tokens: (classMatch?.[1] ?? '').split(/\s+/).filter((token) => token !== ''),
    };
  });
}

function scopeMarkerCountsByFile(paths: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const path of paths) {
    const count = countOccurrences(readFileSync(path, 'utf8'), SCOPE_MARKER);
    if (count > 0) counts[relative(APP_ROOT, path)] = count;
  }
  return counts;
}

function braceDepthBefore(css: string, index: number): number {
  let depth = 0;
  for (const char of css.slice(0, index)) {
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
  }
  return depth;
}

function parseObsidianDeclarations(css: string, selectorIndex: number): Record<string, string> {
  const bodyStart = selectorIndex + OBSIDIAN_SELECTOR.length;
  const bodyEnd = css.indexOf('}', bodyStart);
  const declarations: Record<string, string> = {};
  for (const rawDeclaration of css.slice(bodyStart, bodyEnd).split(';')) {
    const declaration = rawDeclaration.trim();
    if (declaration === '') continue;
    const colon = declaration.indexOf(':');
    declarations[declaration.slice(0, colon).trim()] = declaration.slice(colon + 1).trim();
  }
  return declarations;
}

describe('Studio Obsidian & Brass scoped tokens (V-1a)', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('TH1: the server render has exactly one obsidian scope marker, on the studio-container root', () => {
    const html = renderToString(<StudioLabRoute />);
    const markedTags = [
      ...html.matchAll(/<[a-z]+\b[^>]*\bdata-studio-theme="obsidian"[^>]*>/g),
    ].map((match) => match[0]);

    expect(countOccurrences(html, SCOPE_MARKER)).toBe(1);
    expect(markedTags).toHaveLength(1);
    const classMatch = /\bclass="([^"]*)"/.exec(markedTags[0] ?? '');
    expect(classMatch?.[1]?.startsWith('studio-container')).toBe(true);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('TH2: app.css has one top-level obsidian block with exactly the 21 V-1a/V-2a declarations', () => {
    const css = readFileSync(APP_CSS_PATH, 'utf8');
    const uncommentedCss = stripThemeTestComments(css);

    expect(countOccurrences(css, OBSIDIAN_SELECTOR)).toBe(1);
    const selectorIndex = uncommentedCss.indexOf(OBSIDIAN_SELECTOR);
    expect(selectorIndex).toBeGreaterThan(-1);
    expect(braceDepthBefore(uncommentedCss, selectorIndex)).toBe(0);
    expect(parseObsidianDeclarations(uncommentedCss, selectorIndex)).toEqual(
      EXPECTED_OBSIDIAN_TOKENS,
    );

    expect(scopeMarkerCountsByFile(listFilesRecursively(STYLES_ROOT, () => true))).toEqual({
      'styles/app.css': 2,
    });
    expect(countOccurrences(OBSIDIAN_SELECTOR, SCOPE_MARKER)).toBe(2);
  });

  it('TH3: arrangement components contain no raw hex or colour-function literals', () => {
    const sourceFiles = listFilesRecursively(ARRANGEMENT_COMPONENTS_ROOT, (path) =>
      /\.tsx?$/.test(path),
    );
    expect(sourceFiles.length).toBeGreaterThanOrEqual(20);

    const hexHits: string[] = [];
    const colourFunctionHits: string[] = [];
    for (const path of sourceFiles) {
      const source = stripThemeTestComments(readFileSync(path, 'utf8'));
      const name = relative(APP_ROOT, path);
      for (const match of source.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
        hexHits.push(`${name}: ${match[0]}`);
      }
      for (const match of source.matchAll(/\b(?:rgba?|hsla?|oklch|oklab)\(/g)) {
        colourFunctionHits.push(`${name}: ${match[0]}`);
      }
    }
    expect(hexHits).toEqual([]);
    expect(colourFunctionHits).toEqual([]);
  });

  it('TH4: the data-studio-theme marker exists only on StudioWorkspace and in the app.css selector', () => {
    const appFiles = listFilesRecursively(APP_ROOT, (path) => !/\.test\.[cm]?[jt]sx?$/.test(path));
    expect(appFiles.length).toBeGreaterThanOrEqual(100);

    expect(scopeMarkerCountsByFile(appFiles)).toEqual({
      'components/arrangement/StudioWorkspace.tsx': 1,
      'styles/app.css': 2,
    });
  });

  it('TH5: the text fields use the outline-strong boundary and the Overview playhead has a background halo', () => {
    const html = renderToString(<StudioLabRoute />);
    const fieldTestIds = [
      'arrangement-tempo-input',
      'arrangement-library-search',
      'arrangement-detail-start',
      'arrangement-detail-end',
      'arrangement-detail-clip-gain-input',
    ];

    for (const testId of fieldTestIds) {
      const tokens = classTokensByTestId(html, testId);
      expect(tokens, testId).toContain('border-outline-strong');
      expect(tokens, testId).not.toContain('border-outline');
    }

    const playheadTokens = classTokensByTestId(html, 'arrangement-overview-playhead');
    expect(playheadTokens).toContain('bg-accent');
    expect(playheadTokens).toContain('ring-1');
    expect(playheadTokens).toContain('ring-background');
  });

  it('TH6: the enabled Loop brace uses the bg-accent/20 fill', () => {
    const source = readFileSync(LOOP_BRACE_PATH, 'utf8');

    expect(countOccurrences(source, "'border-accent bg-accent/20'")).toBe(1);
    expect(countOccurrences(source, 'bg-accent/30')).toBe(0);
  });

  it('TH7: the route links exactly one Google Fonts stylesheet for the Studio families', () => {
    const href =
      'https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Noto+Sans+Georgian:wght@400;500&display=swap';

    const descriptors = links();
    expect(descriptors).toEqual([{ rel: 'stylesheet', href }]);
    const [descriptor] = descriptors;
    const linkedHref = descriptor && 'href' in descriptor ? descriptor.href : undefined;
    expect(linkedHref).toContain('display=swap');
    for (const family of ['Cormorant', 'Inter', 'Playfair']) {
      expect(linkedHref).not.toContain(family);
    }
  });

  it('TH8: BPM, master and track volume numerals use font-mono, the pan readout stays sans', () => {
    const html = renderToString(<StudioLabRoute />);

    for (const testId of [
      'arrangement-tempo-input',
      'arrangement-master-readout',
      'arrangement-master-peak',
    ]) {
      const tokens = classTokensByTestId(html, testId);
      expect(tokens, testId).toContain('font-mono');
      expect(tokens, testId).toContain('tabular-nums');
    }

    const tags = classTokensOfEveryTag(html);
    const trackVolumeReadouts = tags.filter(
      ({ tokens }) => tokens.includes('w-10') && tokens.includes('tabular-nums'),
    );
    expect(trackVolumeReadouts).toHaveLength(4);
    for (const { tag, tokens } of trackVolumeReadouts) {
      expect(tokens, tag).toContain('font-mono');
    }

    const panResets = tags.filter(({ tag }) =>
      tag.includes('data-testid="arrangement-track-pan-reset"'),
    );
    expect(panResets).toHaveLength(3);
    for (const { tag, tokens } of panResets) {
      expect(tokens, tag).not.toContain('font-mono');
    }
  });
});

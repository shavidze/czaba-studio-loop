// @vitest-environment node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const APP_ROOT = resolve(__dirname, '../../..');
const APP_CSS = 'styles/app.css';
const UTILITIES_CSS = 'styles/base/utilities.css';
const FADER_PATH = 'components/arrangement/studio-fader.ts';
const FOCUS_PATH = 'components/arrangement/studio-focus.ts';
const INSET_NAME = 'STUDIO_FOCUS_RING_INSET_CLASS';
const EDGE_NAME = 'STUDIO_FOCUS_RING_EDGE_CLASS';
const MARKER_ROW_PATH = 'components/arrangement/ArrangementMarkerRow.tsx';
const MARKER_FLAG_TESTID = 'data-testid="arrangement-marker"';

const GLOBAL_RULE_SELECTOR = ':focus-visible';
const GLOBAL_RULE_BODY = [
  'outline: 1.5px solid color-mix(in srgb, var(--color-brand) 80%, transparent);',
  'outline-offset: var(--focus-offset, 2px);',
];
const POINTER_RULE_SELECTOR = 'html[data-focus-source="pointer"] :focus-visible';
const POINTER_RULE_BODY = ['outline: none;'];

const REQUIRED_STUDIO_FILES: ReadonlyArray<string> = [
  'components/arrangement/ArrangementDetailPanel.tsx',
  'components/arrangement/ArrangementExportDialog.tsx',
  'components/arrangement/ArrangementGridMenu.tsx',
  'components/arrangement/ArrangementGroupHeader.tsx',
  'components/arrangement/ArrangementLane.tsx',
  'components/arrangement/ArrangementLibrary.tsx',
  'components/arrangement/ArrangementLibraryPreview.tsx',
  'components/arrangement/ArrangementLoopBrace.tsx',
  'components/arrangement/ArrangementMarkerMenu.tsx',
  'components/arrangement/ArrangementMarkerRow.tsx',
  'components/arrangement/ArrangementMaster.tsx',
  'components/arrangement/ArrangementOverview.tsx',
  'components/arrangement/ArrangementRuler.tsx',
  'components/arrangement/ArrangementTempoRow.tsx',
  'components/arrangement/ArrangementTransport.tsx',
  'components/arrangement/ArrangementVideoDock.tsx',
  'components/arrangement/StudioWorkspace.tsx',
  'components/arrangement/studio-fader.ts',
  'routes/studio-lab.tsx',
];

const FORBIDDEN_FOCUS_PREFIXES: ReadonlyArray<string> = [
  'focus-visible:ring',
  'focus-visible:outline',
  'focus-visible:bg-',
  'focus-visible:border',
  'focus-visible:shadow',
  'focus:border',
  'focus:ring',
  'peer-focus-visible',
  'ring-offset',
  'focus:bg-',
  'focus:shadow',
  'focus-within:',
  'group-focus',
];

const EXPORT_DIALOG_CONTAINER =
  '<div ref={focusTrapRef} tabIndex={-1} className="focus:outline-none">';

const EXPECTED_INSET_USES: Readonly<Record<string, number>> = {
  'components/arrangement/ArrangementDetailPanel.tsx': 1,
  'components/arrangement/ArrangementGroupHeader.tsx': 4,
  'components/arrangement/ArrangementLane.tsx': 5,
  'components/arrangement/ArrangementLibrary.tsx': 4,
  'components/arrangement/ArrangementMarkerRow.tsx': 1,
  'components/arrangement/ArrangementTempoRow.tsx': 2,
  'components/arrangement/StudioWorkspace.tsx': 4,
};
const EXPECTED_INSET_TOTAL = 21;

const RANGE_CONSUMERS: ReadonlyArray<[string, string, number]> = [
  ['components/arrangement/ArrangementLane.tsx', 'STUDIO_LEVEL_FADER_CLASS', 1],
  ['components/arrangement/ArrangementLane.tsx', 'STUDIO_NEUTRAL_SLIDER_CLASS', 1],
  ['components/arrangement/ArrangementGroupHeader.tsx', 'STUDIO_LEVEL_FADER_CLASS', 1],
  ['components/arrangement/ArrangementMaster.tsx', 'STUDIO_LEVEL_FADER_CLASS', 1],
  ['components/arrangement/ArrangementDetailPanel.tsx', 'STUDIO_LEVEL_FADER_CLASS', 1],
  ['components/arrangement/ArrangementTransport.tsx', 'STUDIO_NEUTRAL_SLIDER_CLASS', 1],
];

const FILL_CALC =
  "'[&::-webkit-slider-runnable-track]:bg-size-[calc(var(--spacing)*1.75+(100%-var(--spacing)*3.5)*var(--studio-fader-fill,0))_100%]'";
const FILL_STYLE_SOURCE = [
  'export function studioLevelFaderFillStyle(range: StudioLevelFaderRange): StudioLevelFaderFillStyle {',
  "  return { '--studio-fader-fill': String(Number(studioLevelFaderFillFraction(range).toFixed(4))) };",
  '}',
].join('\n');

function readAppSource(path: string): string {
  return readFileSync(resolve(APP_ROOT, path), 'utf8');
}

function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

interface TopLevelCssRule {
  selector: string;
  body: string;
}

function topLevelCssRules(css: string): TopLevelCssRule[] {
  const source = stripCssComments(css);
  const rules: TopLevelCssRule[] = [];
  let depth = 0;
  let start = 0;
  let bodyStart = 0;
  let selector = '';
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (char === '{') {
      if (depth === 0) {
        selector = source.slice(start, index).trim();
        bodyStart = index + 1;
      }
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        rules.push({ selector, body: source.slice(bodyStart, index) });
        start = index + 1;
      }
    } else if (char === ';' && depth === 0) {
      start = index + 1;
    }
  }
  return rules;
}

function declarationsOf(body: string): string[] {
  return body
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function listStudioSources(): string[] {
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
  walk(resolve(APP_ROOT, 'components/arrangement'));
  walk(resolve(APP_ROOT, 'lib/arrangement'));
  files.push('routes/studio-lab.tsx');
  return files.sort();
}

function classTokensOf(source: string): string[] {
  return source.split(/[\s'"`]+/).filter((token) => token.length > 0);
}

function isFocusRecipeToken(token: string): boolean {
  if (token.startsWith('[--')) {
    return false;
  }
  return FORBIDDEN_FOCUS_PREFIXES.some((prefix) => token.includes(prefix));
}

function countOccurrences(source: string, needle: string): number {
  return source.split(needle).length - 1;
}

function insetUsesOf(source: string): number {
  return source
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('import '))
    .reduce((sum, line) => sum + countOccurrences(line, INSET_NAME), 0);
}

describe('SABA-B-4 stage 1 — one Studio focus ring (D-29z161, R83–R87)', () => {
  it('walker guard: the Studio scan covers every required file', () => {
    const files = listStudioSources();
    expect(files.length).toBeGreaterThanOrEqual(REQUIRED_STUDIO_FILES.length);
    for (const required of REQUIRED_STUDIO_FILES) {
      expect(files, required).toContain(required);
    }
  });

  it('SFR1: app.css holds exactly one global :focus-visible rule and one pointer rule; utilities.css holds none', () => {
    const appCss = readAppSource(APP_CSS);
    const rules = topLevelCssRules(appCss);
    const focusRules = rules.filter((rule) => rule.selector.includes(':focus-visible'));
    expect(focusRules.map((rule) => rule.selector)).toStrictEqual([
      GLOBAL_RULE_SELECTOR,
      POINTER_RULE_SELECTOR,
    ]);
    expect(declarationsOf(focusRules[0]?.body ?? '')).toStrictEqual(GLOBAL_RULE_BODY);
    expect(declarationsOf(focusRules[1]?.body ?? '')).toStrictEqual(POINTER_RULE_BODY);
    const globalIndex = rules.findIndex((rule) => rule.selector === GLOBAL_RULE_SELECTOR);
    expect(rules[globalIndex + 1]?.selector, 'the pointer rule follows the global rule').toBe(
      POINTER_RULE_SELECTOR,
    );
    expect(countOccurrences(stripCssComments(appCss), ':focus-visible')).toBe(2);
    expect(countOccurrences(appCss, 'data-studio-theme')).toBe(2);
    expect(readAppSource(UTILITIES_CSS)).not.toContain(':focus-visible');
  });

  it('SFR2: Studio sources carry no own focus recipe; the only focus:outline-none is the export dialog container', () => {
    const offenders: string[] = [];
    let outlineNoneCount = 0;
    for (const file of listStudioSources()) {
      const source = readAppSource(file);
      for (const token of classTokensOf(source)) {
        if (isFocusRecipeToken(token)) {
          offenders.push(`${file}: ${token}`);
        }
        if (token.includes('focus:outline-none')) {
          outlineNoneCount += 1;
        }
      }
    }
    expect(offenders).toStrictEqual([]);
    expect(outlineNoneCount).toBe(1);
    expect(
      countOccurrences(
        readAppSource('components/arrangement/ArrangementExportDialog.tsx'),
        EXPORT_DIALOG_CONTAINER,
      ),
    ).toBe(1);
  });

  it('SFR3: the inset variant is one constant and every K0 inset site carries it', () => {
    const focusSource = readAppSource(FOCUS_PATH);
    expect(focusSource.trim().split('\n')).toStrictEqual([
      `export const ${INSET_NAME} = '[--focus-offset:-2px]';`,
      `export const ${EDGE_NAME} = '[--focus-offset:-1px]';`,
    ]);
    expect(focusSource).not.toMatch(/ring|outline/);
    const uses: Record<string, number> = {};
    let total = 0;
    for (const file of listStudioSources()) {
      if (file === FOCUS_PATH) {
        continue;
      }
      const count = insetUsesOf(readAppSource(file));
      if (count > 0) {
        uses[file] = count;
        total += count;
      }
    }
    expect(uses).toStrictEqual(EXPECTED_INSET_USES);
    expect(total).toBe(EXPECTED_INSET_TOTAL);
    for (const file of listStudioSources()) {
      if (file !== FOCUS_PATH) {
        expect(countOccurrences(readAppSource(file), '--focus-offset'), file).toBe(0);
      }
    }
  });

  it('SFR4: one 14 px ivory thumb, one neutral track, all six range boxes h-4, no accent-foreground, Pan and Zoom without fill', () => {
    const fader = readAppSource(FADER_PATH);
    for (const token of [
      "'[&::-webkit-slider-thumb]:size-3.5'",
      "'[&::-webkit-slider-thumb]:bg-foreground'",
      "'[&::-webkit-slider-thumb]:rounded-full'",
      "'[&::-webkit-slider-thumb]:appearance-none'",
      "'[&::-moz-range-thumb]:size-3.5'",
      "'[&::-moz-range-thumb]:bg-foreground'",
      "'[&::-moz-range-thumb]:border-0'",
      "'[&::-webkit-slider-runnable-track]:bg-outline-hover'",
      "'[&::-moz-range-track]:bg-outline-hover'",
    ]) {
      expect(countOccurrences(fader, token), token).toBe(1);
    }
    for (const retired of [
      'size-3.75',
      'accent-foreground',
      'STUDIO_FADER_FOCUS',
      'hover:',
      'active:',
    ]) {
      expect(fader, retired).not.toContain(retired);
    }
    const neutralBlock = fader.slice(
      fader.indexOf('export const STUDIO_NEUTRAL_SLIDER_CLASS'),
      fader.indexOf('export const STUDIO_LEVEL_FADER_CLASS'),
    );
    expect(neutralBlock.length).toBeGreaterThan(0);
    expect(neutralBlock).not.toMatch(/brand/);
    let consumerLines = 0;
    for (const [file, constant, expected] of RANGE_CONSUMERS) {
      const lines = readAppSource(file)
        .split('\n')
        .filter((line) => line.includes('className=') && line.includes(constant));
      expect(lines, `${file} ${constant}`).toHaveLength(expected);
      for (const line of lines) {
        const tokens = classTokensOf(line.replace(/[{}]/g, ' '));
        expect(tokens, `${file} box`).toContain('h-4');
        expect(tokens, `${file} thumb`).not.toContain('accent-foreground');
        if (constant.includes('NEUTRAL')) {
          expect(line, `${file} neutral`).not.toMatch(/from-brand|bg-brand|LEVEL_FADER/);
        }
      }
      consumerLines += lines.length;
    }
    expect(consumerLines).toBe(6);
  });

  it('SFR5: the fill style is unchanged and the fill calc uses the 14 px thumb (half = 7 px)', () => {
    const fader = readAppSource(FADER_PATH);
    expect(countOccurrences(fader, FILL_STYLE_SOURCE)).toBe(1);
    expect(countOccurrences(fader, FILL_CALC)).toBe(1);
    expect(countOccurrences(fader, "'[&::-webkit-slider-thumb]:-mt-1.25'")).toBe(1);
    expect(fader).not.toContain('*1.875');
    expect(fader).not.toContain('*3.75');
  });

  it('SFR6: the marker flag ring sits on the flag box edge above the stem (R88a: pr-1, the -1px edge constant, isolate + stem -z-1), with no own or delegated recipe', () => {
    const source = readAppSource(MARKER_ROW_PATH);
    expect(countOccurrences(source, MARKER_FLAG_TESTID)).toBe(1);
    const testIdIndex = source.indexOf(MARKER_FLAG_TESTID);
    const buttonStart = source.lastIndexOf('<button', testIdIndex);
    const buttonEnd = source.indexOf('</button>', testIdIndex);
    expect(buttonStart).toBeGreaterThan(-1);
    expect(buttonEnd).toBeGreaterThan(testIdIndex);
    const flagOpening = source.slice(buttonStart, testIdIndex);
    const flagClassLines = flagOpening.split('\n').filter((line) => line.includes('className='));
    expect(flagClassLines).toHaveLength(1);
    const flagTokens = classTokensOf((flagClassLines[0] ?? '').replace(/[{}$]/g, ' '));
    expect(flagTokens).toContain('pl-1');
    expect(flagTokens).toContain('pr-1');
    expect(flagTokens).toContain(EDGE_NAME);
    expect(flagTokens).not.toContain(INSET_NAME);
    expect(flagTokens).toContain('isolate');
    const stemLines = source
      .slice(testIdIndex, buttonEnd)
      .split('\n')
      .filter((line) => line.includes("'pointer-events-none absolute top-0 left-0"));
    expect(stemLines).toHaveLength(1);
    expect(classTokensOf(stemLines[0] ?? '')).toContain('-z-1');
    const flagElementTokens = classTokensOf(source.slice(buttonStart, buttonEnd));
    const recipeTokens = flagElementTokens.filter(
      (token) =>
        token.includes('group-focus') ||
        token.includes('focus-visible:') ||
        token.includes('ring-') ||
        /(^|:)outline/.test(token),
    );
    expect(recipeTokens).toStrictEqual([]);
    expect(
      countOccurrences(readAppSource(FOCUS_PATH), `${EDGE_NAME} = '[--focus-offset:-1px]'`),
    ).toBe(1);
    const edgeUses: Record<string, number> = {};
    for (const file of listStudioSources()) {
      if (file === FOCUS_PATH) {
        continue;
      }
      const count = readAppSource(file)
        .split('\n')
        .filter((line) => !line.trimStart().startsWith('import '))
        .reduce((sum, line) => sum + countOccurrences(line, EDGE_NAME), 0);
      if (count > 0) {
        edgeUses[file] = count;
      }
    }
    expect(edgeUses).toStrictEqual({ [MARKER_ROW_PATH]: 1 });
  });
});

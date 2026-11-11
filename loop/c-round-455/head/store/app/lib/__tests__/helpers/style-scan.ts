import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, posix, relative, resolve } from 'node:path';

export const APP_ROOT = resolve(__dirname, '../../..');
export const PERF_ROOT = resolve(APP_ROOT, '../perf');

export const SCRIPT_SOURCE_EXTENSIONS = /\.(ts|tsx)$/;
export const STYLE_SOURCE_EXTENSIONS = /\.css$/;
export const ANY_STYLED_SOURCE_EXTENSIONS = /\.(css|ts|tsx)$/;

export interface StyleScanRoot {
  prefix: string;
  root: string;
}

export const SCRIPT_SCAN_ROOTS: ReadonlyArray<StyleScanRoot> = [
  { prefix: 'app', root: APP_ROOT },
  { prefix: 'perf', root: PERF_ROOT },
];

export interface StyleScanAllowListEntry {
  hits: number;
  reason: string;
}

export type StyleScanAllowList = Readonly<Record<string, StyleScanAllowListEntry>>;

export interface CssDeclarationHit {
  selector: string;
  declaration: string;
}

const TEAL_PATTERN_SOURCE =
  'teal-[0-9]+|cyan-[0-9]+|emerald-[0-9]+|#(13d9cc|14b8a6|0d9488|2dd4bf|5eead4|0f766e)\\b|rgba?\\( ?(19|20|45|13)[ ,]+(217|184|212|148)[ ,]+(204|166|191|136)[^)]*\\)|hsla?\\( ?17[0-9][ ,][^)]*\\)';

const TRANSPARENT_FILL =
  /transparent|#[0-9a-f]{3}0(?![0-9a-f])|#[0-9a-f]{6}00(?![0-9a-f])|rgba?\([\s_]*[^,/)\s_]+(?:[\s_]*,[\s_]*|[\s_]+)[^,/)\s_]+(?:[\s_]*,[\s_]*|[\s_]+)[^,/)\s_]+[\s_]*[,/][\s_]*0*\.?0+%?[\s_]*\)/
    .source;

const CSS_GRADIENT_TEXT_PATTERN_SOURCE = [
  /(?:-webkit-)?background-clip\s*:[^;}]*\btext\b/.source,
  `-webkit-text-fill-color\\s*:\\s*(?:${TRANSPARENT_FILL})`,
  /(?<![\w-])bg-clip-text(?![\w-])/.source,
].join('|');

const SCRIPT_GRADIENT_TEXT_PATTERN_SOURCE = [
  /\[(?:-webkit-)?background-clip:_*text\]/.source,
  `\\[-webkit-text-fill-color:_*(?:${TRANSPARENT_FILL})\\]`,
  /(?:\b|['"])(?:WebkitBackgroundClip|backgroundClip)['"]?\s*[:=][^,};]{0,200}?['"`]text['"`]/
    .source,
  `(?:\\b|['"])WebkitTextFillColor['"]?\\s*[:=][^,};]{0,200}?['"\`]\\s*(?:${TRANSPARENT_FILL})\\s*['"\`]`,
  /setProperty\(\s*['"](?:-webkit-)?background-clip['"]\s*,\s*['"]text['"]/.source,
  CSS_GRADIENT_TEXT_PATTERN_SOURCE,
].join('|');

const LAYER_START = /(?<=(?:^|[:'"`,[]|inset)[\s_]*)/.source;
const GLOW_BLUR = /(?:[1-9]|0?\.\d*[1-9]|var\(|\$\{)/.source;
const SHADOW_VALUE_SPAN = /(?:[^;},]|,(?!\s*['"]?[\w-]+['"]?\s*:)){0,300}?/.source;

const ZERO_OFFSET_GLOW_PATTERN_SOURCE = [
  `(?:drop-|text-)?shadow-\\[[^\\]]{0,300}?${LAYER_START}0(?:px)?_0(?:px)?_${GLOW_BLUR}`,
  `\\[(?:box|text)-shadow:[^\\]]{0,300}?${LAYER_START}0(?:px)?_0(?:px)?_${GLOW_BLUR}`,
  `drop-shadow\\([\\s_]*0(?:px)?[\\s_]+0(?:px)?[\\s_]+${GLOW_BLUR}`,
  `(?:box-?shadow|text-?shadow)['"]?\\s*:${SHADOW_VALUE_SPAN}${LAYER_START}0(?:px)?\\s+0(?:px)?\\s+${GLOW_BLUR}`,
].join('|');

export interface ResolvedImport {
  target: string;
  names: string[];
  namespace: boolean;
}

const IMPORT_STATEMENT =
  /\b(?:import|export)\s+(?:type\s+)?([\w$*\s{},]*?)\s*from\s*['"]([^'"\n]+)['"]|\bimport\s*\(\s*['"]([^'"\n]+)['"]\s*\)/g;

function resolveSpecifier(importer: string, specifier: string): string | null {
  let target: string;
  if (specifier.startsWith('~/')) {
    target = specifier.slice(2);
  } else if (specifier.startsWith('.')) {
    target = posix.join(posix.dirname(importer), specifier);
  } else {
    return null;
  }
  return target.replace(/\.(ts|tsx|js|jsx)$/, '').replace(/\/index$/, '');
}

export function resolvedImports(source: string, importer: string): ResolvedImport[] {
  const imports: ResolvedImport[] = [];
  for (const match of source.matchAll(IMPORT_STATEMENT)) {
    const clause = match[1] ?? '';
    const specifier = match[2] ?? match[3] ?? '';
    const target = resolveSpecifier(importer, specifier);
    if (target === null) {
      continue;
    }
    const braced = /\{([^}]*)\}/.exec(clause)?.[1] ?? '';
    const names = braced
      .split(',')
      .map((part) =>
        part
          .trim()
          .replace(/^type\s+/, '')
          .split(/\s+as\s+/)[0]
          .trim(),
      )
      .filter((name) => name.length > 0);
    imports.push({
      target,
      names,
      namespace: match[3] !== undefined || /\*/.test(clause) || clause.trim() === '',
    });
  }
  return imports;
}

export function listFiles(root: string, extensions: RegExp): string[] {
  const files: string[] = [];
  const walk = (directory: string) => {
    for (const entry of readdirSync(directory)) {
      const path = join(directory, entry);
      if (statSync(path).isDirectory()) {
        if (entry !== '__tests__') {
          walk(path);
        }
      } else if (extensions.test(entry)) {
        files.push(relative(root, path).split('\\').join('/'));
      }
    }
  };
  walk(root);
  return files.sort();
}

export function readFrom(root: string, path: string): string {
  return readFileSync(resolve(root, path), 'utf8');
}

export function readApp(path: string): string {
  return readFrom(APP_ROOT, path);
}

function countPerLine(source: string, patternSource: string): number {
  return source
    .split('\n')
    .reduce((sum, line) => sum + [...line.matchAll(new RegExp(patternSource, 'gi'))].length, 0);
}

function countWhole(source: string, patternSource: string): number {
  return [...source.matchAll(new RegExp(patternSource, 'gi'))].length;
}

export function countTealHits(source: string): number {
  return countPerLine(source, TEAL_PATTERN_SOURCE);
}

export function countZeroOffsetGlowHits(source: string): number {
  return countWhole(source, ZERO_OFFSET_GLOW_PATTERN_SOURCE);
}

export function countScriptGradientTextHits(source: string): number {
  return countWhole(source, SCRIPT_GRADIENT_TEXT_PATTERN_SOURCE);
}

export function hitsByFile(
  root: string,
  extensions: RegExp,
  count: (source: string) => number,
): Record<string, number> {
  const hits: Record<string, number> = {};
  for (const path of listFiles(root, extensions)) {
    const found = count(readFrom(root, path));
    if (found > 0) {
      hits[path] = found;
    }
  }
  return hits;
}

export function hitsByRootedFile(
  roots: ReadonlyArray<StyleScanRoot>,
  extensions: RegExp,
  count: (source: string) => number,
): Record<string, number> {
  const hits: Record<string, number> = {};
  for (const { prefix, root } of roots) {
    for (const [path, found] of Object.entries(hitsByFile(root, extensions, count))) {
      hits[`${prefix}/${path}`] = found;
    }
  }
  return hits;
}

function blankCommentsAndQuotedDelimiters(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\/|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g, (token) =>
    token.startsWith('/*') ? token.replace(/[^\n]/g, ' ') : token.replace(/[{};]/g, ' '),
  );
}

export function cssGradientTextHits(css: string): CssDeclarationHit[] {
  const source = blankCommentsAndQuotedDelimiters(css);
  const pattern = new RegExp(CSS_GRADIENT_TEXT_PATTERN_SOURCE, 'gi');
  const hits: CssDeclarationHit[] = [];
  const selectors: string[] = [];
  let segmentStart = 0;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === '{') {
      selectors.push(source.slice(segmentStart, index).trim());
      segmentStart = index + 1;
    } else if (character === '}' || character === ';') {
      const segment = source.slice(segmentStart, index);
      for (const match of segment.matchAll(pattern)) {
        hits.push({ selector: selectors[selectors.length - 1] ?? '', declaration: match[0] });
      }
      if (character === '}') {
        selectors.pop();
      }
      segmentStart = index + 1;
    }
  }
  return hits;
}

export function allowListViolations(
  counts: Readonly<Record<string, number>>,
  allowList: StyleScanAllowList,
): { unexpected: string[]; drifted: string[] } {
  const unexpected = Object.keys(counts).filter((key) => !Object.hasOwn(allowList, key));
  const drifted = Object.entries(allowList)
    .filter(([key, entry]) => (counts[key] ?? 0) !== entry.hits)
    .map(([key, entry]) => `${key}: ${counts[key] ?? 0} != ${entry.hits}`);
  return { unexpected, drifted };
}

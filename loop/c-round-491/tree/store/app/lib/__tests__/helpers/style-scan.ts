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
const GLOW_BLUR = /(?:[1-9]|0?\.\d*[1-9]|var\(|\$\{|(?:calc|min|max|clamp)\(|['"`]\s*\+)/.source;
const ZERO_LENGTH = /[+-]?(?:0+(?:\.0*)?|\.0+)[a-z]*/.source;
const SHADOW_VALUE_SPAN = /(?:[^;},]|,(?!\s*['"]?[\w-]+['"]?\s*:)){0,300}?/.source;

const ZERO_OFFSET_GLOW_PATTERN_SOURCE = [
  `(?:drop-|text-)?shadow-\\[[^\\]]{0,300}?${LAYER_START}${ZERO_LENGTH}_${ZERO_LENGTH}_${GLOW_BLUR}`,
  `\\[(?:box|text)-shadow:[^\\]]{0,300}?${LAYER_START}${ZERO_LENGTH}_${ZERO_LENGTH}_${GLOW_BLUR}`,
  `drop-shadow\\([\\s_]*${ZERO_LENGTH}[\\s_]+${ZERO_LENGTH}[\\s_]+${GLOW_BLUR}`,
  `(?:box-?shadow|text-?shadow)['"]?\\s*:${SHADOW_VALUE_SPAN}${LAYER_START}${ZERO_LENGTH}\\s+${ZERO_LENGTH}\\s+${GLOW_BLUR}`,
].join('|');

export interface ImportBinding {
  imported: string;
  exported: string;
}

export type SpecifierForm = 'module' | 'directory' | 'index';

export interface ResolvedImport {
  target: string;
  form: SpecifierForm;
  names: string[];
  bindings: ImportBinding[];
  namespace: boolean;
}

interface ResolvedSpecifier {
  target: string;
  form: SpecifierForm;
}

const IMPORT_CLAUSE_GRAMMAR = /^(?:[\w$]+\s*,?\s*)?(?:\{[^{}]*\}|\*(?:\s*as\s+[\w$]+)?)?$/;

const IMPORT_STATEMENT =
  /\b(?:import|export)\s+(?:type\s+)?([\w$*\s{},]*?)\s*from\s*['"]([^'"\n]+)['"]|\bimport\s*\(\s*['"]([^'"\n]+)['"]\s*\)/g;

function resolveSpecifier(importer: string, specifier: string): ResolvedSpecifier | null {
  const bare = specifier.replace(/[?#].*$/, '');
  const path = bare.replace(/(.)\/+$/, '$1');
  let target: string;
  if (path.startsWith('~/')) {
    target = path.slice(2);
  } else if (path.startsWith('.')) {
    target = posix.join(posix.dirname(importer), path);
  } else {
    return null;
  }
  const module = target.replace(/\.(ts|tsx|js|jsx)$/, '');
  if (/\/index$/.test(module)) {
    return { target: module.replace(/\/index$/, ''), form: 'index' };
  }
  return { target: module, form: path === bare ? 'module' : 'directory' };
}

export function resolvedImports(
  source: string,
  importer: string,
  wholeOnUnparsedClause = false,
): ResolvedImport[] {
  const imports: ResolvedImport[] = [];
  for (const match of source.matchAll(IMPORT_STATEMENT)) {
    const clause = match[1] ?? '';
    const specifier = match[2] ?? match[3] ?? '';
    const resolved = resolveSpecifier(importer, specifier);
    if (resolved === null) {
      continue;
    }
    const braced = /\{([^}]*)\}/.exec(clause)?.[1] ?? '';
    const bindings: ImportBinding[] = braced
      .split(',')
      .map((part) => part.trim().replace(/^type\s+/, ''))
      .filter((part) => part.length > 0)
      .map((part) => {
        const [imported = '', exported = imported] = part
          .split(/\s+as\s+/)
          .map((name) => name.trim());
        return { imported, exported };
      });
    const defaultClause = clause
      .replace(/\{[^}]*\}/, '')
      .replace(/\*\s*as\s+[\w$]+/, '')
      .replace(/,/g, '')
      .trim();
    if (match[1] !== undefined && /^[\w$]+$/.test(defaultClause)) {
      bindings.push({ imported: 'default', exported: defaultClause });
    }
    imports.push({
      ...resolved,
      names: bindings.map((binding) => binding.imported),
      bindings,
      namespace:
        match[3] !== undefined ||
        /\*/.test(clause) ||
        clause.trim() === '' ||
        (wholeOnUnparsedClause && !IMPORT_CLAUSE_GRAMMAR.test(clause.trim())),
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
  if (!/shadow/i.test(source)) {
    return 0;
  }
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

export interface CssRuleBlock {
  chain: ReadonlyArray<string>;
  header: string;
  body: string;
}

const GROUPING_AT_RULE = /^@(?:media|supports|layer|container|scope)\b/i;

function normalizedHeader(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function cssRuleBlocks(css: string): CssRuleBlock[] {
  const source = blankCommentsAndQuotedDelimiters(css);
  const blocks: CssRuleBlock[] = [];
  const open: Array<{ header: string; body: string[] }> = [];
  let segmentStart = 0;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === '{') {
      open.push({ header: normalizedHeader(source.slice(segmentStart, index)), body: [] });
      segmentStart = index + 1;
    } else if (character === '}') {
      const closing = open.pop();
      if (closing !== undefined) {
        closing.body.push(source.slice(segmentStart, index));
        blocks.push({
          chain: open.map((parent) => parent.header),
          header: closing.header,
          body: closing.body.join('\n'),
        });
      }
      segmentStart = index + 1;
    } else if (character === ';') {
      open[open.length - 1]?.body.push(source.slice(segmentStart, index + 1));
      segmentStart = index + 1;
    }
  }
  return blocks;
}

function selectorTargets(header: string): string[] {
  return header.split(',').map(
    (part) =>
      part
        .trim()
        .split(/[\s>+~]+/)
        .pop() ?? '',
  );
}

export function cssRuleBodies(css: string, selector: string): string[] {
  return cssRuleBlocks(css)
    .filter((block) => selectorTargets(block.header).includes(selector))
    .map((block) => block.body);
}

export function cssRuleBlocksListing(css: string, selector: string): CssRuleBlock[] {
  return cssRuleBlocks(css).filter((block) =>
    block.header.split(',').some((part) => part.trim() === selector),
  );
}

export function cssRuleSelectorCount(css: string, selector: string): number {
  return cssRuleBlocksListing(css, selector).length;
}

export function cssRuleKey(block: CssRuleBlock): string {
  const path = [...block.chain, block.header];
  const ownRule = path.findIndex((header) => !GROUPING_AT_RULE.test(header));
  return path.slice(0, ownRule === -1 ? path.length : ownRule + 1).join(' ');
}

export function hitsByCssRule(
  path: string,
  css: string,
  count: (source: string) => number,
): Record<string, number> {
  const hits: Record<string, number> = {};
  for (const block of cssRuleBlocks(css)) {
    const found = count(block.body);
    if (found > 0) {
      const key = `${path} ${cssRuleKey(block)}`;
      hits[key] = (hits[key] ?? 0) + found;
    }
  }
  return hits;
}

const MOUNT_ROOT_PATTERN = /^(?:root\.tsx|entry\.(?:client|server)\.tsx|routes\/.+\.tsx?)$/;

function withoutComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, ' ');
}

const QUOTED_OR_COMMENT =
  /('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`)|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g;

function withoutCommentsOutsideStrings(source: string): string {
  return source.replace(QUOTED_OR_COMMENT, (_whole, quoted: string | undefined) => quoted ?? ' ');
}

export function isReExportBarrel(source: string): boolean {
  const statements = withoutComments(source)
    .split(/;|\n(?=\s*export\b)/)
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
  return (
    statements.length > 0 &&
    statements.every((statement) => /^export\b[\s\S]*\bfrom\s*['"][^'"]+['"]$/.test(statement))
  );
}

const SIDE_EFFECT_IMPORT = /\bimport\s*['"]([^'"\n]+)['"]/g;
const IMPORT_META_URL_MODULE =
  /\bnew\s+URL\s*\(\s*['"]([^'"\n]+)['"]\s*,\s*import\.meta\.url\s*\)/g;
const NAMESPACE_RE_EXPORT =
  /\bexport\s+(?:type\s+)?\*\s*as\s+([\w$]+)\s+from\s*['"]([^'"\n]+)['"]/g;
const LOCAL_SPECIFIER_LITERAL = /['"`]((?:~\/|\.\.?\/)[^'"`\n]+)['"`]/g;
const NON_SCRIPT_MODULE =
  /\.(?:css|json|svg|png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|mp3|wav|ogg|mp4|webm|txt|md)$/i;

function wholeModuleImports(source: string, importer: string, pattern: RegExp): ResolvedImport[] {
  const imports: ResolvedImport[] = [];
  for (const match of source.matchAll(pattern)) {
    const resolved = resolveSpecifier(importer, match[1] ?? '');
    if (resolved !== null) {
      imports.push({ ...resolved, names: [], bindings: [], namespace: true });
    }
  }
  return imports;
}

function namespaceReExports(source: string, importer: string): ResolvedImport[] {
  const imports: ResolvedImport[] = [];
  for (const match of source.matchAll(NAMESPACE_RE_EXPORT)) {
    const resolved = resolveSpecifier(importer, match[2] ?? '');
    if (resolved !== null) {
      imports.push({
        ...resolved,
        names: ['*'],
        bindings: [{ imported: '*', exported: match[1] ?? '' }],
        namespace: false,
      });
    }
  }
  return imports;
}

export function mountGraphImports(source: string, importer: string): ResolvedImport[] {
  const stripped = withoutComments(source);
  const stringAware = withoutCommentsOutsideStrings(source);
  return [
    ...resolvedImports(source, importer),
    ...resolvedImports(stripped, importer),
    ...resolvedImports(stringAware, importer, true),
    ...namespaceReExports(stripped, importer),
    ...namespaceReExports(stringAware, importer),
    ...wholeModuleImports(source, importer, SIDE_EFFECT_IMPORT),
    ...wholeModuleImports(source, importer, IMPORT_META_URL_MODULE),
  ];
}

export function unfollowedLocalSpecifiers(
  source: string,
  importer: string,
  sources: ReadonlyMap<string, string>,
): string[] {
  const followed = new Set(
    mountGraphImports(source, importer).map((entry) => `${entry.form}|${entry.target}`),
  );
  return [...source.matchAll(LOCAL_SPECIFIER_LITERAL)]
    .map((match) => match[1] ?? '')
    .filter((specifier) => {
      const resolved = resolveSpecifier(importer, specifier);
      return (
        resolved === null ||
        !followed.has(`${resolved.form}|${resolved.target}`) ||
        (scriptFilesFor(resolved, sources).length === 0 && !NON_SCRIPT_MODULE.test(resolved.target))
      );
    });
}

function scriptFilesFor(
  { target, form }: ResolvedSpecifier,
  sources: ReadonlyMap<string, string>,
): string[] {
  const moduleFile = [`${target}.ts`, `${target}.tsx`].find((candidate) => sources.has(candidate));
  const indexFile = [`${target}/index.ts`, `${target}/index.tsx`].find((candidate) =>
    sources.has(candidate),
  );
  const files =
    form === 'index'
      ? [indexFile]
      : form === 'directory'
        ? [moduleFile, indexFile]
        : [moduleFile ?? indexFile];
  return files.filter((file): file is string => file !== undefined);
}

export function reachableScripts(sources: ReadonlyMap<string, string>): Set<string> {
  const reached = new Set<string>();
  const visited = new Set<string>();
  const pending: Array<{ file: string; names: ReadonlyArray<string> | null }> = [...sources.keys()]
    .filter((file) => MOUNT_ROOT_PATTERN.test(file))
    .map((file) => ({ file, names: null }));
  for (let next = pending.pop(); next !== undefined; next = pending.pop()) {
    const visitKey = `${next.file}|${next.names === null ? '*' : [...next.names].sort().join(',')}`;
    if (visited.has(visitKey)) {
      continue;
    }
    visited.add(visitKey);
    reached.add(next.file);
    const source = sources.get(next.file) ?? '';
    const barrelNames = isReExportBarrel(source) ? next.names : null;
    for (const entry of mountGraphImports(source, next.file)) {
      for (const file of scriptFilesFor(entry, sources)) {
        if (barrelNames !== null && !entry.namespace) {
          const forwarded = entry.bindings
            .filter((binding) => barrelNames.includes(binding.exported))
            .map((binding) => binding.imported);
          if (forwarded.includes('*')) {
            pending.push({ file, names: null });
          } else if (forwarded.length > 0) {
            pending.push({ file, names: forwarded });
          }
          continue;
        }
        const names = entry.namespace || entry.names.includes('*') ? barrelNames : entry.names;
        pending.push({ file, names: isReExportBarrel(sources.get(file) ?? '') ? names : null });
      }
    }
  }
  return reached;
}

export function appScriptSources(): Map<string, string> {
  return new Map(
    listFiles(APP_ROOT, SCRIPT_SOURCE_EXTENSIONS).map((path): [string, string] => [
      path,
      readApp(path),
    ]),
  );
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

interface HslColour {
  hue: number;
  saturation: number;
  lightness: number;
}

const HUE_RANGE_MIN_DEGREES = 160;
const HUE_RANGE_MAX_DEGREES = 200;
const HUE_RANGE_MIN_SATURATION = 0.25;
const HUE_RANGE_MIN_LIGHTNESS = 0.12;
const HUE_RANGE_MAX_LIGHTNESS = 0.9;

const NUMBER_SOURCE = '[+-]?(?:\\d+\\.?\\d*|\\.\\d+)';
const SEPARATOR_SOURCE = '[\\s,_]+';

const HUE_RANGE_HEX_PATTERN =
  /(?<![A-Za-z0-9&#$]|(?:href|xlink:href)=["'{`]*|url\(\s*["']?)#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![A-Za-z0-9-])/gi;
const HUE_RANGE_RGB_PATTERN = new RegExp(
  `rgba?\\(\\s*(${NUMBER_SOURCE})(%?)${SEPARATOR_SOURCE}(${NUMBER_SOURCE})(%?)${SEPARATOR_SOURCE}(${NUMBER_SOURCE})(%?)`,
  'gi',
);
const HUE_RANGE_HSL_PATTERN = new RegExp(
  `hsla?\\(\\s*(${NUMBER_SOURCE})(?:deg)?${SEPARATOR_SOURCE}(${NUMBER_SOURCE})%?${SEPARATOR_SOURCE}(${NUMBER_SOURCE})%?`,
  'gi',
);
const HUE_RANGE_HWB_PATTERN = new RegExp(
  `hwb\\(\\s*(${NUMBER_SOURCE})(?:deg)?${SEPARATOR_SOURCE}(${NUMBER_SOURCE})%?${SEPARATOR_SOURCE}(${NUMBER_SOURCE})%?`,
  'gi',
);
const HUE_RANGE_OKLCH_PATTERN = new RegExp(
  `oklch\\(\\s*(${NUMBER_SOURCE})(%?)[\\s_]+(${NUMBER_SOURCE})(%?)[\\s_]+(${NUMBER_SOURCE})(?:deg)?`,
  'gi',
);
const HUE_RANGE_PALETTE_PATTERN =
  /(?<=[a-z])-(?:teal|cyan|emerald|sky)-(?:50|950|[1-9]00)(?![\w-])/gi;
const HUE_RANGE_SOURCE_COMMENT_PATTERN =
  /(?<![\w/'"`*\\])\/\*[\s\S]*?\*\/|(?<![:\w/'"`\\])\/\/[^\n]*/g;

const NAMED_COLOUR_HEX: Readonly<Record<string, string>> = {
  aqua: '00ffff',
  aquamarine: '7fffd4',
  cadetblue: '5f9ea0',
  cyan: '00ffff',
  darkcyan: '008b8b',
  darkslategray: '2f4f4f',
  darkslategrey: '2f4f4f',
  darkturquoise: '00ced1',
  deepskyblue: '00bfff',
  lightblue: 'add8e6',
  lightcyan: 'e0ffff',
  lightseagreen: '20b2aa',
  mediumaquamarine: '66cdaa',
  mediumturquoise: '48d1cc',
  paleturquoise: 'afeeee',
  powderblue: 'b0e0e6',
  skyblue: '87ceeb',
  teal: '008080',
  turquoise: '40e0d0',
};

const HUE_RANGE_NAMED_PATTERN = new RegExp(
  `(?<![A-Za-z0-9$.#-])(${Object.keys(NAMED_COLOUR_HEX).join('|')})(?![A-Za-z0-9-])`,
  'gi',
);

function rgbToHsl(red: number, green: number, blue: number): HslColour {
  const channels = [red, green, blue].map((channel) => Math.min(1, Math.max(0, channel)));
  const [r = 0, g = 0, b = 0] = channels;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const delta = max - min;
  if (delta === 0) {
    return { hue: 0, saturation: 0, lightness };
  }
  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue: number;
  if (max === r) {
    hue = ((g - b) / delta) % 6;
  } else if (max === g) {
    hue = (b - r) / delta + 2;
  } else {
    hue = (r - g) / delta + 4;
  }
  return { hue: (hue * 60 + 360) % 360, saturation, lightness };
}

function hueToRgb(hue: number): [number, number, number] {
  const sector = (((hue % 360) + 360) % 360) / 60;
  const rising = 1 - Math.abs((sector % 2) - 1);
  const table: [number, number, number][] = [
    [1, rising, 0],
    [rising, 1, 0],
    [0, 1, rising],
    [0, rising, 1],
    [rising, 0, 1],
    [1, 0, rising],
  ];
  return table[Math.floor(sector) % 6] ?? [0, 0, 0];
}

function hexToHsl(hex: string): HslColour {
  const digits = hex.length <= 4 ? [...hex.slice(0, 3)].map((digit) => digit + digit) : [];
  const pairs = digits.length > 0 ? digits : [hex.slice(0, 2), hex.slice(2, 4), hex.slice(4, 6)];
  const [r = 0, g = 0, b = 0] = pairs.map((pair) => Number.parseInt(pair, 16) / 255);
  return rgbToHsl(r, g, b);
}

function oklchToHsl(lightness: number, chroma: number, hueDegrees: number): HslColour {
  const radians = (hueDegrees * Math.PI) / 180;
  const a = chroma * Math.cos(radians);
  const b = chroma * Math.sin(radians);
  const long = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const medium = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const short = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear = [
    4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short,
    -1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short,
    -0.0041960863 * long - 0.7034186147 * medium + 1.707614701 * short,
  ];
  const [r = 0, g = 0, blue = 0] = linear.map((channel) =>
    channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055,
  );
  return rgbToHsl(r, g, blue);
}

function isHueRangeColour({ hue, saturation, lightness }: HslColour): boolean {
  return (
    hue >= HUE_RANGE_MIN_DEGREES &&
    hue <= HUE_RANGE_MAX_DEGREES &&
    saturation >= HUE_RANGE_MIN_SATURATION &&
    lightness >= HUE_RANGE_MIN_LIGHTNESS &&
    lightness <= HUE_RANGE_MAX_LIGHTNESS
  );
}

function rgbChannel(value: string | undefined, percent: string | undefined): number {
  const number = Number(value ?? '0');
  return percent === '%' ? number / 100 : number / 255;
}

function matchedColours(
  source: string,
  pattern: RegExp,
  toHsl: (match: RegExpMatchArray) => HslColour,
): string[] {
  return [...source.matchAll(pattern)]
    .filter((match) => isHueRangeColour(toHsl(match)))
    .map((match) => match[0]);
}

export function hueRangeColourHits(source: string): string[] {
  const uncommented = source.replace(HUE_RANGE_SOURCE_COMMENT_PATTERN, ' ');
  return [
    ...matchedColours(source, HUE_RANGE_HEX_PATTERN, (match) => hexToHsl(match[1] ?? '')),
    ...matchedColours(source, HUE_RANGE_RGB_PATTERN, (match) =>
      rgbToHsl(
        rgbChannel(match[1], match[2]),
        rgbChannel(match[3], match[4]),
        rgbChannel(match[5], match[6]),
      ),
    ),
    ...matchedColours(source, HUE_RANGE_HSL_PATTERN, (match) => ({
      hue: ((Number(match[1] ?? '0') % 360) + 360) % 360,
      saturation: Number(match[2] ?? '0') / 100,
      lightness: Number(match[3] ?? '0') / 100,
    })),
    ...matchedColours(source, HUE_RANGE_HWB_PATTERN, (match) => {
      const white = Number(match[2] ?? '0') / 100;
      const black = Number(match[3] ?? '0') / 100;
      if (white + black >= 1) {
        return { hue: 0, saturation: 0, lightness: white / (white + black) };
      }
      const [r, g, b] = hueToRgb(Number(match[1] ?? '0')).map(
        (channel) => channel * (1 - white - black) + white,
      );
      return rgbToHsl(r ?? 0, g ?? 0, b ?? 0);
    }),
    ...matchedColours(source, HUE_RANGE_OKLCH_PATTERN, (match) =>
      oklchToHsl(
        Number(match[1] ?? '0') / (match[2] === '%' ? 100 : 1),
        (Number(match[3] ?? '0') * (match[4] === '%' ? 0.4 : 1)) / (match[4] === '%' ? 100 : 1),
        Number(match[5] ?? '0'),
      ),
    ),
    ...(source.match(HUE_RANGE_PALETTE_PATTERN) ?? []),
    ...matchedColours(uncommented, HUE_RANGE_NAMED_PATTERN, (match) =>
      hexToHsl(NAMED_COLOUR_HEX[(match[1] ?? '').toLowerCase()] ?? '000000'),
    ),
  ];
}

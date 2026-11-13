import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { compile } from 'tailwindcss';
import ts from 'typescript';
import { APP_ROOT } from './style-scan';

export const STORE_STYLES_ROOT = resolve(APP_ROOT, 'styles');
export const STORE_THEME_ENTRY = 'styles/app.css';

const COLOUR_UTILITY_PREFIX =
  /^(?:bg|text|border(?:-[trblxyse])?|ring(?:-offset)?|outline|from|via|to|shadow|fill|stroke|divide|placeholder|caret|accent|decoration)-/;
const CLASS_TOKEN_SHAPE = /^[a-z0-9:/_.\-[\]#%,!]+$/i;
const PROPERTY_READ = /var\(\s*(--[A-Za-z0-9_-]+)\s*(,)?/g;
const PROPERTY_DECLARATIONS = [
  /(--[A-Za-z0-9_-]+)\s*:/g,
  /\[(--[A-Za-z0-9_-]+):/g,
  /['"](--[A-Za-z0-9_-]+)['"]\s*[:,)]/g,
];

const requireFromHelpers = createRequire(
  resolve(APP_ROOT, 'lib/__tests__/helpers/token-resolve.ts'),
);

async function loadStylesheet(
  id: string,
  base: string,
): Promise<{ path: string; base: string; content: string }> {
  const path =
    id === 'tailwindcss' ? requireFromHelpers.resolve('tailwindcss/index.css') : resolve(base, id);
  return { path, base: dirname(path), content: readFileSync(path, 'utf8') };
}

export interface ThemeResolver {
  emitsUtility(candidate: string): boolean;
  emittingUtilities(candidates: ReadonlyArray<string>): Set<string>;
  definesProperty(name: string): boolean;
}

function classSelectorPattern(candidate: string): RegExp {
  const leadingDigit = /^[0-9]/.test(candidate) ? `\\3${candidate.charAt(0)} ` : '';
  const rest = leadingDigit === '' ? candidate : candidate.slice(1);
  const cssEscaped = `${leadingDigit}${rest.replace(/[^A-Za-z0-9_-]/g, (character) => `\\${character}`)}`;
  const source = cssEscaped.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
  return new RegExp(`\\.${source}(?![\\w-])`);
}

export async function createThemeResolver(
  themeCss: string,
  propertyNames: ReadonlyArray<string>,
): Promise<ThemeResolver> {
  const probeRule = `\n.token-resolve-probe{${propertyNames
    .map((name, index) => `--token-resolve-${index}:var(${name});`)
    .join('')}}`;
  const compiler = await compile(`${themeCss}${probeRule}`, {
    base: STORE_STYLES_ROOT,
    loadStylesheet,
  });
  const baseline = compiler.build([]);
  return {
    emitsUtility(candidate) {
      return classSelectorPattern(candidate).test(compiler.build([candidate]));
    },
    emittingUtilities(candidates) {
      const unique = [...new Set(candidates)];
      const output = compiler.build(unique);
      return new Set(unique.filter((candidate) => classSelectorPattern(candidate).test(output)));
    },
    definesProperty(name) {
      const escaped = name.replace(/-/g, '\\-');
      return new RegExp(`(^|[\\s{;])${escaped}\\s*:`).test(baseline);
    },
  };
}

export interface TokenHit {
  file: string;
  line: number;
  token: string;
}

export function formatTokenHit(hit: TokenHit): string {
  return `${hit.file}:${hit.line} ${hit.token}`;
}

export function propertyReads(sources: ReadonlyMap<string, string>): TokenHit[] {
  const reads: TokenHit[] = [];
  for (const [file, source] of sources) {
    source.split('\n').forEach((text, index) => {
      for (const match of text.matchAll(PROPERTY_READ)) {
        const name = match[1];
        if (name !== undefined && match[2] === undefined && !name.startsWith('--tw-')) {
          reads.push({ file, line: index + 1, token: name });
        }
      }
    });
  }
  return reads;
}

export function declaredProperties(sources: ReadonlyMap<string, string>): Set<string> {
  const declared = new Set<string>();
  for (const source of sources.values()) {
    for (const pattern of PROPERTY_DECLARATIONS) {
      for (const match of source.matchAll(pattern)) {
        if (match[1] !== undefined) {
          declared.add(match[1]);
        }
      }
    }
  }
  return declared;
}

export async function undefinedPropertyReads(
  sources: ReadonlyMap<string, string>,
  themeCss: string,
): Promise<TokenHit[]> {
  const reads = propertyReads(sources);
  const declared = declaredProperties(sources);
  const resolver = await createThemeResolver(themeCss, [
    ...new Set(reads.map((read) => read.token)),
  ]);
  return reads.filter((read) => !declared.has(read.token) && !resolver.definesProperty(read.token));
}

export function colourUtilityTokens(file: string, source: string): TokenHit[] {
  const kind = file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, kind);
  const tokens: TokenHit[] = [];
  const visit = (node: ts.Node): void => {
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
    ) {
      const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
      for (const token of node.text.split(/\s+/)) {
        const utility = (token.split(':').pop() ?? '').replace(/^!/, '');
        if (token !== '' && COLOUR_UTILITY_PREFIX.test(utility) && CLASS_TOKEN_SHAPE.test(token)) {
          tokens.push({ file, line, token });
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return tokens;
}

export async function nonEmittingColourUtilities(
  sources: ReadonlyMap<string, string>,
  themeCss: string,
): Promise<TokenHit[]> {
  const resolver = await createThemeResolver(themeCss, []);
  const tokens = [...sources].flatMap(([file, source]) => colourUtilityTokens(file, source));
  const emitting = resolver.emittingUtilities(tokens.map((hit) => hit.token));
  return tokens.filter((hit) => !emitting.has(hit.token));
}

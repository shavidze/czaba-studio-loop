import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import ts from 'typescript';

export const STORE_ROOT = resolve(__dirname, '../../../../..');
export const ARRANGEMENT_COMPONENTS_DIR = resolve(STORE_ROOT, 'app/components/arrangement');

export interface SourceFile {
  path: string;
  text: string;
}

export type JsxTagHazard = 'spread' | 'style';

export interface JsxOpeningTag {
  path: string;
  line: number;
  tag: string;
  attributes: ReadonlyMap<string, string | null>;
  attributeTexts: ReadonlyMap<string, string>;
  hazards: readonly JsxTagHazard[];
}

const SKIPPED_DIRECTORIES = new Set(['node_modules', '__tests__']);
const TEST_FILE = /\.(test|spec)\.(ts|tsx)$/;

export function listSourceFiles(dir: string, extensions: readonly string[] = ['.tsx']): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir).sort()) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      if (!SKIPPED_DIRECTORIES.has(entry)) {
        files.push(...listSourceFiles(path, extensions));
      }
    } else if (
      extensions.some((extension) => entry.endsWith(extension)) &&
      !TEST_FILE.test(entry)
    ) {
      files.push(path);
    }
  }
  return files;
}

export function readSourceFiles(
  dir: string = ARRANGEMENT_COMPONENTS_DIR,
  extensions: readonly string[] = ['.tsx'],
): SourceFile[] {
  return listSourceFiles(dir, extensions).map((file) => ({
    path: relative(dir, file).split('\\').join('/'),
    text: readFileSync(file, 'utf8'),
  }));
}

const parsedSources = new Map<string, ts.SourceFile>();

export function parseSource(source: string, path = 'inline.tsx'): ts.SourceFile {
  const key = `${path}\u0000${source}`;
  const cached = parsedSources.get(key);
  if (cached) {
    return cached;
  }
  const fileName = /\.tsx?$/.test(path) ? path : `${path}.tsx`;
  const kind = fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.ESNext, true, kind);
  let errorLine = 0;
  const findError = (node: ts.Node) => {
    if (errorLine === 0 && (node.flags & ts.NodeFlags.ThisNodeHasError) !== 0) {
      errorLine = file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1;
    }
    ts.forEachChild(node, findError);
  };
  findError(file);
  if (errorLine !== 0) {
    throw new Error(`${path}:${errorLine}: the TypeScript parser reports a syntax error`);
  }
  parsedSources.set(key, file);
  return file;
}

function attributeLiteral(attribute: ts.JsxAttribute): string | null {
  const initializer = attribute.initializer;
  if (initializer && ts.isStringLiteral(initializer)) {
    return initializer.text;
  }
  if (initializer && ts.isJsxExpression(initializer) && initializer.expression) {
    const expression = initializer.expression;
    if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
      return expression.text;
    }
  }
  return null;
}

function readTag(
  node: ts.JsxOpeningElement | ts.JsxSelfClosingElement,
  file: ts.SourceFile,
  path: string,
): JsxOpeningTag {
  const attributes = new Map<string, string | null>();
  const attributeTexts = new Map<string, string>();
  const hazards = new Set<JsxTagHazard>();
  for (const property of node.attributes.properties) {
    if (ts.isJsxSpreadAttribute(property)) {
      hazards.add('spread');
    } else {
      const name = property.name.getText(file);
      attributes.set(name, attributeLiteral(property));
      attributeTexts.set(name, property.initializer?.getText(file) ?? '');
      if (name === 'style') {
        hazards.add('style');
      }
    }
  }
  return {
    path,
    line: file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1,
    tag: node.getText(file),
    attributes,
    attributeTexts,
    hazards: [...hazards],
  };
}

export function jsxOpeningTags(source: string, name: string, path = 'inline.tsx'): JsxOpeningTag[] {
  const file = parseSource(source, path);
  const tags: JsxOpeningTag[] = [];
  const visit = (node: ts.Node) => {
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      node.tagName.getText(file) === name
    ) {
      tags.push(readTag(node, file, path));
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return tags;
}

export function scanJsxOpeningTags(name: string, files: readonly SourceFile[]): JsxOpeningTag[] {
  return files.flatMap((file) => jsxOpeningTags(file.text, name, file.path));
}

export function identifierUsesOutsideImports(
  source: string,
  name: string,
  path = 'inline.tsx',
): number {
  const file = parseSource(source, path);
  let uses = 0;
  const visit = (node: ts.Node) => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      return;
    }
    if (
      ts.isIdentifier(node) &&
      node.text === name &&
      !(ts.isPropertyAccessExpression(node.parent) && node.parent.name === node)
    ) {
      uses++;
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return uses;
}

export function callsWithStringArgument(
  source: string,
  callee: string,
  argument: string,
  path = 'inline.tsx',
): number {
  const file = parseSource(source, path);
  let calls = 0;
  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node)) {
      const target = node.expression;
      const calleeName = ts.isPropertyAccessExpression(target)
        ? target.name.text
        : ts.isIdentifier(target)
          ? target.text
          : '';
      const first = node.arguments[0];
      if (
        calleeName === callee &&
        first &&
        (ts.isStringLiteral(first) || ts.isNoSubstitutionTemplateLiteral(first)) &&
        first.text === argument
      ) {
        calls++;
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return calls;
}

export function jsxAttributeTextsByName(
  source: string,
  attribute: string,
  path = 'inline.tsx',
): string[] {
  const file = parseSource(source, path);
  const texts: string[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isJsxAttribute(node) && node.name.getText(file) === attribute) {
      texts.push(node.initializer?.getText(file) ?? '');
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return texts;
}

export function variableInitializersUsing(
  source: string,
  variable: string,
  identifier: string,
  path = 'inline.tsx',
): boolean[] {
  const file = parseSource(source, path);
  const results: boolean[] = [];
  const visit = (node: ts.Node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === variable
    ) {
      let found = false;
      const search = (child: ts.Node) => {
        if (ts.isIdentifier(child) && child.text === identifier) {
          found = true;
        }
        ts.forEachChild(child, search);
      };
      if (node.initializer) {
        search(node.initializer);
      }
      results.push(found);
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return results;
}

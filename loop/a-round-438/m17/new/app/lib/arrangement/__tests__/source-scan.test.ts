// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  ARRANGEMENT_COMPONENTS_DIR,
  callsWithStringArgument,
  identifierUsesOutsideImports,
  jsxAttributeTextsByName,
  jsxOpeningTags,
  readSourceFiles,
  variableInitializersUsing,
} from './helpers/source-scan';

const view = (...lines: string[]) => ['const view = (', '  <>', ...lines, '  </>', ');'].join('\n');
const inputs = (source: string) => jsxOpeningTags(source, 'input');

let scratch: string | null = null;

afterEach(() => {
  if (scratch) {
    rmSync(scratch, { recursive: true, force: true });
    scratch = null;
  }
});

describe('shared JSX source scanner (SYS-R435-SOURCE-SCAN-HELPER)', () => {
  it('SS1: tags are read by the TypeScript parser, so quotes, braces, templates, comments and nested JSX never end a tag early', () => {
    const tags = inputs(
      view(
        [
          '    <input a={(e) => e > 1} b="x > y" c={\'}\'} d={`>$',
          '{f({ g: "}" })}>`} e="1" />',
        ].join(''),
        '    <input',
        "      // don't > stop",
        "      /* it's > here */",
        '      type="text"',
        '    />',
        '    <input accept="video/*,.mov" hidden />',
        '    <input render={() => <b type="radio" />} f="2" />',
        '    <input title={`it\'s > fine`} f="3" />',
        "    <p>{ready && <span>don't</span>}</p>",
        '    <input type="search" />',
      ),
    );
    expect(tags.map(({ line }) => line)).toEqual([3, 4, 9, 10, 11, 13]);
    expect(
      tags.map(({ attributes }) => attributes.get('e') ?? attributes.get('f') ?? null),
    ).toEqual(['1', null, null, '2', '3', null]);
    expect(tags[1].attributes.get('type')).toBe('text');
    expect(tags[3].attributes.has('type')).toBe(false);
    expect(tags[5].attributes.get('type')).toBe('search');
  });

  it('SS2: only the exact tag name matches, and a source the parser cannot read fails loudly with its path and line', () => {
    const source = view(
      '    <inputs a="1" />',
      '    <input />',
      '    <ModalBody />',
      '    <Modal b="2" />',
    );
    expect(jsxOpeningTags(source, 'input').map(({ tag }) => tag)).toEqual(['<input />']);
    expect(jsxOpeningTags(source, 'Modal').map(({ tag }) => tag)).toEqual(['<Modal b="2" />']);
    expect(() =>
      jsxOpeningTags('const a = 1;\nconst v = (<input a="x />);\n', 'input', 'X.tsx'),
    ).toThrow('X.tsx:2: the TypeScript parser reports a syntax error');
  });

  it('SS3: attribute literals are read by exact name and accept every literal spelling', () => {
    const tags = inputs(
      view(
        '    <input data-type="radio" type="text" />',
        '    <input inputType="number" aria-type="number" />',
        "    <input type='radio' />",
        "    <input type={ 'search' } />",
        '    <input type={`number`} />',
        '    <input type="datetime-local" />',
        '    <input type={kind} />',
        ['    <input type={`$', '{kind}`} />'].join(''),
      ),
    );
    expect(tags.map(({ attributes }) => attributes.get('type'))).toEqual([
      'text',
      undefined,
      'radio',
      'search',
      'number',
      'datetime-local',
      null,
      null,
    ]);
  });

  it('SS4: a spread attribute or a style attribute is a hazard; an object spread inside a value, data-style and text are not', () => {
    const tags = inputs(
      view(
        '    <input type="text" {...rest} />',
        '    <input type="text" { ...rest} style = {s} />',
        '    <input type="text" data-style="x" />',
        '    <input type="text" onChange={(e) => set({ ...current, draft: e })} />',
        '    <input title="style={x} {...y}" type="text" />',
        '    <input',
        '      // style={x}',
        '      type="text"',
        '    />',
      ),
    );
    expect(tags.map(({ hazards }) => hazards)).toEqual([
      ['spread'],
      ['spread', 'style'],
      [],
      [],
      [],
      [],
    ]);
  });

  it('SS5: identifier uses ignore every import form, strings and comments, and keep the code after a side-effect import', () => {
    const source = [
      "import { CLASS } from './a';",
      'import type {',
      '  CLASS as Other,',
      "} from './b';",
      "import './side-effect';",
      "const label = 'CLASS';",
      '// CLASS',
      'const used = [CLASS].join(" ");',
    ].join('\n');
    expect(identifierUsesOutsideImports(source, 'CLASS', 'a.ts')).toBe(1);
    expect(
      identifierUsesOutsideImports(
        "import { CLASS } from './a';\nexport { CLASS };\nconst x = theme.CLASS;\n",
        'CLASS',
        'c.ts',
      ),
    ).toBe(0);
    expect(identifierUsesOutsideImports("import { CLASS } from './a';\n", 'CLASS', 'b.ts')).toBe(0);
  });

  it('SS8: attribute texts are collected by name across every tag, and variable initializers are searched by identifier', () => {
    const source = [
      ['const inputClass = `h-6 $', '{CLASS}`;'].join(''),
      'const other = `h-6`;',
      'const view = (',
      '  <>',
      '    <Field inputClass={inputClass} />',
      '    <Field inputClass="h-6" />',
      '  </>',
      ');',
    ].join('\n');
    expect(jsxAttributeTextsByName(source, 'inputClass')).toEqual(['{inputClass}', '"h-6"']);
    expect(variableInitializersUsing(source, 'inputClass', 'CLASS')).toEqual([true]);
    expect(variableInitializersUsing(source, 'other', 'CLASS')).toEqual([false]);
  });

  it('SS6: the file walk recurses into subfolders, skips __tests__, node_modules and test files, and reports posix paths', () => {
    scratch = mkdtempSync(join(tmpdir(), 'source-scan-'));
    mkdirSync(join(scratch, 'lanes', 'deep'), { recursive: true });
    mkdirSync(join(scratch, '__tests__'));
    mkdirSync(join(scratch, 'node_modules'));
    writeFileSync(join(scratch, 'Top.tsx'), 'export const a = 1;');
    writeFileSync(join(scratch, 'lanes', 'deep', 'Moved.tsx'), 'export const b = 1;');
    writeFileSync(join(scratch, 'lanes', 'helper.ts'), 'export const x = 1;');
    writeFileSync(join(scratch, 'lanes', 'Moved.test.tsx'), 'export const c = 1;');
    writeFileSync(join(scratch, '__tests__', 'Hidden.tsx'), 'export const d = 1;');
    writeFileSync(join(scratch, 'node_modules', 'Dep.tsx'), 'export const e = 1;');
    expect(readSourceFiles(scratch).map(({ path }) => path)).toEqual([
      'Top.tsx',
      'lanes/deep/Moved.tsx',
    ]);
    expect(readSourceFiles(scratch, ['.ts', '.tsx']).map(({ path }) => path)).toEqual([
      'Top.tsx',
      'lanes/deep/Moved.tsx',
      'lanes/helper.ts',
    ]);
  });

  it('SS7: the default root is the real arrangement components folder, and calls with a literal first argument are counted by callee name', () => {
    expect(readSourceFiles().some(({ path }) => path.endsWith('ArrangementExportDialog.tsx'))).toBe(
      true,
    );
    expect(ARRANGEMENT_COMPONENTS_DIR.split('\\').join('/')).toMatch(
      /\/app\/components\/arrangement$/,
    );
    const source = [
      "document.createElement('progress');",
      'createElement(`progress`);',
      "document.createElement('input');",
      'document.createElement(kind);',
      'const text = "createElement(\'progress\')";',
    ].join('\n');
    expect(callsWithStringArgument(source, 'createElement', 'progress', 'c.ts')).toBe(2);
  });
});

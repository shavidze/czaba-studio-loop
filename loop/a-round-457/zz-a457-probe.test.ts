import { expect, it } from 'vitest';
import { reachableScripts, unfollowedLocalSpecifiers } from './helpers/style-scan';

const describeCase = (label: string, files: ReadonlyArray<readonly [string, string]>): string => {
  const sources = new Map<string, string>(files);
  const route = sources.get('routes/a.tsx') ?? '';
  const reached = [...reachableScripts(sources)].sort();
  const unfollowed = unfollowedLocalSpecifiers(route, 'routes/a.tsx', sources);
  return `${label} reached=${JSON.stringify(reached)} unfollowed=${JSON.stringify(unfollowed)}`;
};

it('A-R457 probe: directory specifiers next to a same-name file, and barrel name loss', () => {
  const dirFiles = (spec: string): ReadonlyArray<readonly [string, string]> => [
    ['routes/a.tsx', `import { Y } from ${spec};`],
    ['lib/u.ts', 'export const Z = 1;'],
    ['lib/u/index.ts', "export { Y } from './Y';"],
    ['lib/u/Y.tsx', 'export const Y = 1;'],
  ];
  const out = [
    describeCase("P1 '~/lib/u/'", dirFiles("'~/lib/u/'")),
    describeCase("P2 '~/lib/u/index'", dirFiles("'~/lib/u/index'")),
    describeCase("P3 '~/lib/u' (control: file wins)", dirFiles("'~/lib/u'")),
    describeCase('P4 variant1 interface {} before export-from in barrel', [
      ['routes/a.tsx', "import { Row } from '~/kit';"],
      ['kit/index.ts', "export interface P {}\nexport { Row } from './Row';"],
      ['kit/Row.tsx', 'export const Row = 1;'],
    ]),
    describeCase('P4b variant1 interface {} before export-from in importer', [
      ['routes/a.tsx', "export interface P {}\nexport { Row } from '~/kit';"],
      ['kit/index.ts', "export { A } from './A';\nexport { Row } from './Row';"],
      ['kit/A.tsx', 'export const A = 1;'],
      ['kit/Row.tsx', 'export const Row = 1;'],
    ]),
    describeCase('P5 variant2 second import inside audio/* … */ with comment in braces', [
      [
        'routes/a.tsx',
        "import { A } from '~/kit';\nconst accept = 'audio/*';\nimport {\n  // c\n  Row,\n} from '~/kit';\nconst end = '*/';",
      ],
      ['kit/index.ts', "export { A } from './A';\nexport { Row } from './Row';"],
      ['kit/A.tsx', 'export const A = 1;'],
      ['kit/Row.tsx', 'export const Row = 1;'],
    ]),
  ];
  expect(out).toEqual([]);
});

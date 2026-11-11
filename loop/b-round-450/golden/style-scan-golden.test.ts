// @vitest-environment node
// B round 450 golden (L4 "Port preserves HEAD"): HEAD a8599a2 scan functions, copied verbatim, vs the helper.
// Copy to <clone>/app/lib/__tests__/style-scan-golden.test.ts in a throwaway clone; writes GOLDEN_OUT json.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as H from './helpers/style-scan';

const APP_ROOT = resolve(__dirname, '../..');
const PERF_ROOT = resolve(APP_ROOT, '../perf');
const TEAL_PATTERN_SOURCE =
  'teal-[0-9]+|cyan-[0-9]+|emerald-[0-9]+|#(13d9cc|14b8a6|0d9488|2dd4bf|5eead4|0f766e)\\b|rgba?\\( ?(19|20|45|13)[ ,]+(217|184|212|148)[ ,]+(204|166|191|136)[^)]*\\)|hsla?\\( ?17[0-9][ ,][^)]*\\)';
const GRADIENT_TEXT_PATTERN =
  /(?:-webkit-)?background-clip\s*:[^;}]*\btext\b|-webkit-text-fill-color\s*:\s*(?:transparent|#0000(?:0000)?\b)/gi;
const RETIRED_CLASS_PATTERN = /(?<![\w-])(?:text-glow|hero-title-glow)(?![\w-])/g;
function listFiles(root: string, extensions: RegExp): string[] {
  const files: string[] = [];
  const walk = (directory: string) => {
    for (const entry of readdirSync(directory)) {
      const path = join(directory, entry);
      if (statSync(path).isDirectory()) {
        if (entry !== '__tests__') walk(path);
      } else if (extensions.test(entry)) files.push(relative(root, path).split('\\').join('/'));
    }
  };
  walk(root);
  return files.sort();
}
function countTealHits(source: string): number {
  return source.split('\n').reduce((sum, line) => sum + [...line.matchAll(new RegExp(TEAL_PATTERN_SOURCE, 'gi'))].length, 0);
}
function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
}
function gradientTextHits(css: string) {
  const source = stripComments(css);
  const hits: { selector: string; declaration: string }[] = [];
  const selectors: string[] = [];
  let segmentStart = 0;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === '{') { selectors.push(source.slice(segmentStart, index).trim()); segmentStart = index + 1; }
    else if (character === '}' || character === ';') {
      const segment = source.slice(segmentStart, index);
      for (const match of segment.matchAll(GRADIENT_TEXT_PATTERN)) hits.push({ selector: selectors[selectors.length - 1] ?? '', declaration: match[0] });
      if (character === '}') selectors.pop();
      segmentStart = index + 1;
    }
  }
  return hits;
}
const rd = (root: string, p: string) => readFileSync(resolve(root, p), 'utf8');
function headTeal(root: string) { const h: Record<string, number> = {}; for (const p of listFiles(root, /\.(ts|tsx)$/)) { const c = countTealHits(rd(root, p)); if (c > 0) h[p] = c; } return h; }
function headCss() { const c: Record<string, number> = {}; for (const p of listFiles(APP_ROOT, /\.css$/).filter((x) => x === 'styles/app.css' || x.startsWith('styles/base/'))) for (const hit of gradientTextHits(rd(APP_ROOT, p))) c[hit.selector] = (c[hit.selector] ?? 0) + 1; return c; }
function headGt3() { const c: Record<string, number> = {}; for (const p of listFiles(APP_ROOT, /\.(css|ts|tsx)$/)) { const n = [...rd(APP_ROOT, p).matchAll(RETIRED_CLASS_PATTERN)].length; if (n > 0) c[p] = n; } return c; }
const PROBE = '.a { color: red; }\n@media (x) { .b { -webkit-background-clip: text; -webkit-text-fill-color: transparent; } }\n/* .c { background-clip: text; } */\n.d { BACKGROUND-CLIP : text; background-clip: padding-box, text; -webkit-text-fill-color:#0000; }';

describe('golden', () => {
  it('helper equals HEAD on every HEAD-pinned output', () => {
    const head = {
      appTs: listFiles(APP_ROOT, /\.(ts|tsx)$/), perfTs: listFiles(PERF_ROOT, /\.(ts|tsx)$/),
      appCss: listFiles(APP_ROOT, /\.css$/), appAny: listFiles(APP_ROOT, /\.(css|ts|tsx)$/),
      tealApp: headTeal(APP_ROOT), tealPerf: headTeal(PERF_ROOT),
      cssBySelectorAppAndBase: headCss(), gt3: headGt3(), probe: gradientTextHits(PROBE),
    };
    const baseFiles = H.listFiles(H.APP_ROOT, H.STYLE_SOURCE_EXTENSIONS).filter((x) => x === 'styles/app.css' || x.startsWith('styles/base/'));
    const helperCss: Record<string, number> = {};
    for (const p of baseFiles) for (const hit of H.cssGradientTextHits(H.readApp(p))) helperCss[hit.selector] = (helperCss[hit.selector] ?? 0) + 1;
    const helper = {
      appTs: H.listFiles(H.APP_ROOT, H.SCRIPT_SOURCE_EXTENSIONS), perfTs: H.listFiles(H.PERF_ROOT, H.SCRIPT_SOURCE_EXTENSIONS),
      appCss: H.listFiles(H.APP_ROOT, H.STYLE_SOURCE_EXTENSIONS), appAny: H.listFiles(H.APP_ROOT, H.ANY_STYLED_SOURCE_EXTENSIONS),
      tealApp: H.hitsByFile(H.APP_ROOT, H.SCRIPT_SOURCE_EXTENSIONS, H.countTealHits), tealPerf: H.hitsByFile(H.PERF_ROOT, H.SCRIPT_SOURCE_EXTENSIONS, H.countTealHits),
      cssBySelectorAppAndBase: helperCss,
      gt3: H.hitsByFile(H.APP_ROOT, H.ANY_STYLED_SOURCE_EXTENSIONS, (s) => [...s.matchAll(RETIRED_CLASS_PATTERN)].length),
      probe: H.cssGradientTextHits(PROBE),
    };
    const extra = {
      newCssRootsHits: Object.fromEntries(H.listFiles(H.APP_ROOT, H.STYLE_SOURCE_EXTENSIONS).map((p) => [p, H.cssGradientTextHits(H.readApp(p)).length])),
      scriptClipApp: H.hitsByFile(H.APP_ROOT, H.SCRIPT_SOURCE_EXTENSIONS, H.countScriptGradientTextHits),
      scriptClipPerf: H.hitsByFile(H.PERF_ROOT, H.SCRIPT_SOURCE_EXTENSIONS, H.countScriptGradientTextHits),
      zeroOffsetGlowApp: H.hitsByFile(H.APP_ROOT, H.SCRIPT_SOURCE_EXTENSIONS, H.countZeroOffsetGlowHits),
    };
    const sizes = Object.fromEntries(Object.entries(head).map(([k, v]) => [k, Array.isArray(v) ? v.length : Object.keys(v).length]));
    writeFileSync(process.env.GOLDEN_OUT ?? '/tmp/golden.json', JSON.stringify({ equal: JSON.stringify(head) === JSON.stringify(helper), sizes, head, helper, extra }, null, 1));
    expect(helper).toEqual(head);
  });
});

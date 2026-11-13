// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  ANY_STYLED_SOURCE_EXTENSIONS,
  APP_ROOT,
  allowListViolations,
  countScriptGradientTextHits,
  cssGradientTextHits,
  hitsByFile,
  hitsByRootedFile,
  listFiles,
  mountGraphImports,
  readApp,
  SCRIPT_SCAN_ROOTS,
  SCRIPT_SOURCE_EXTENSIONS,
  STYLE_SOURCE_EXTENSIONS,
  type StyleScanAllowList,
} from './helpers/style-scan';

const MIN_SCANNED_SOURCES = 200;
const BARREL_FILES: ReadonlyArray<string> = [
  'components/home/index.ts',
  'components/loading/index.ts',
  'components/common/index.ts',
];

const RETIRED_CLASS_PATTERN = /(?<![\w-])(?:text-glow|hero-title-glow)(?![\w-])/g;
const RETIRED_TOKEN_PATTERN = /--gradient-text(?![\w-])/;

const RETIRED_CLASS_ALLOW_LIST: StyleScanAllowList = {
  'components/home/ArtistBioSection.tsx': {
    hits: 1,
    reason:
      'LEGACY-DEAD-STORE-COMPONENTS (0 importers outside the barrel; keep-list stats, Saba rules)',
  },
  'components/home/TestimonialsSection.tsx': {
    hits: 1,
    reason:
      'LEGACY-DEAD-STORE-COMPONENTS (0 importers outside the barrel; keep-list content, Saba rules)',
  },
};

const GRADIENT_TEXT_ALLOW_LIST: StyleScanAllowList = {};

const SCRIPT_GRADIENT_TEXT_ALLOW_LIST: StyleScanAllowList = {};

const DEAD_COMPONENTS: Readonly<Record<string, string>> = {
  ArtistBioSection: 'components/home/ArtistBioSection.tsx',
  TestimonialsSection: 'components/home/TestimonialsSection.tsx',
};

const DELETED_STORE_MODULES: Readonly<Record<string, string>> = {
  VideoShowcase: 'components/home/VideoShowcase.tsx',
  PianoLoadingAnimation: 'components/loading/PianoLoadingAnimation.tsx',
  PianoCurtainLoader: 'components/loading/PianoCurtainLoader.tsx',
  CinemaCurtainLoader: 'components/loading/CinemaCurtainLoader.tsx',
  Timeline: 'components/audio/Timeline.tsx',
  sendOrderPaidEmail: 'lib/email.server.ts',
};

const DELETED_MODULE_BARRELS: ReadonlyArray<string> = [
  ...BARREL_FILES,
  'components/audio/index.ts',
  'components/index.ts',
];

interface DeadModule {
  file: string;
  module: string;
  barrels: ReadonlyArray<string>;
  exportName: string;
}

const FIXTURE_DEAD_MODULES: ReadonlyArray<DeadModule> = [
  {
    file: 'components/audio/Timeline.tsx',
    module: 'components/audio/Timeline',
    barrels: ['components/audio', 'components'],
    exportName: 'Timeline',
  },
  { file: 'lib/email.server.ts', module: 'lib/email.server', barrels: [], exportName: '' },
];

function importsDeadModule(source: string, importer: string, dead: DeadModule): boolean {
  return mountGraphImports(source, importer).some(
    (entry) =>
      entry.target === dead.module ||
      (dead.barrels.includes(entry.target) &&
        (entry.namespace || entry.names.includes(dead.exportName))),
  );
}

function storeCssFiles(): string[] {
  return listFiles(APP_ROOT, STYLE_SOURCE_EXTENSIONS);
}

function hitsByFileAndSelector(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const path of storeCssFiles()) {
    for (const hit of cssGradientTextHits(readApp(path))) {
      const key = `${path} ${hit.selector}`;
      counts[key] = (counts[key] ?? 0) + 1;
    }
  }
  return counts;
}

function scriptGradientTextHitsByFile(): Record<string, number> {
  return hitsByRootedFile(SCRIPT_SCAN_ROOTS, SCRIPT_SOURCE_EXTENSIONS, countScriptGradientTextHits);
}

describe('store gradient text removal (STORE-2b-3a, SYS-R450-STORE-STYLE-SCAN)', () => {
  it('GT1: no app CSS rule paints text with a background clip, except the allow-listed dead rule at its exact count', () => {
    const { unexpected, drifted } = allowListViolations(
      hitsByFileAndSelector(),
      GRADIENT_TEXT_ALLOW_LIST,
    );
    expect(unexpected).toEqual([]);
    expect(drifted).toEqual([]);
  });

  it('GT1b: no app or perf script clips text to a background (class, inline style or CSS text); the script allow-list is empty', () => {
    const { unexpected, drifted } = allowListViolations(
      scriptGradientTextHitsByFile(),
      SCRIPT_GRADIENT_TEXT_ALLOW_LIST,
    );
    expect(unexpected).toEqual([]);
    expect(drifted).toEqual([]);
    expect(Object.keys(SCRIPT_GRADIENT_TEXT_ALLOW_LIST)).toEqual([]);
  });

  it('GT2: the --gradient-text token is neither defined nor read anywhere in app', () => {
    const offenders = listFiles(APP_ROOT, ANY_STYLED_SOURCE_EXTENSIONS).filter((path) =>
      RETIRED_TOKEN_PATTERN.test(readApp(path)),
    );
    expect(offenders).toEqual([]);
  });

  it('GT3: only the allow-listed dead files name the retired text-glow or hero-title-glow class, each at its exact count', () => {
    const counts = hitsByFile(
      APP_ROOT,
      ANY_STYLED_SOURCE_EXTENSIONS,
      (source) => [...source.matchAll(RETIRED_CLASS_PATTERN)].length,
    );
    const { unexpected, drifted } = allowListViolations(counts, RETIRED_CLASS_ALLOW_LIST);
    expect(unexpected).toEqual([]);
    expect(drifted).toEqual([]);
  });

  it('GT4: the CSS scan is non-vacuous and its parser handles case, lists, comments, quotes and alpha-zero fills', () => {
    expect(storeCssFiles()).toEqual(
      expect.arrayContaining([
        'styles/app.css',
        'styles/base/utilities.css',
        'styles/studio.css',
        'styles/pages/studio.css',
      ]),
    );
    expect(listFiles(APP_ROOT, SCRIPT_SOURCE_EXTENSIONS).length).toBeGreaterThanOrEqual(
      MIN_SCANNED_SOURCES,
    );
    const probe = cssGradientTextHits(
      '.a { color: red; }\n@media (x) { .b { -webkit-background-clip: text; -webkit-text-fill-color: transparent; } }\n/* .c { background-clip: text; } */\n.d { BACKGROUND-CLIP : text; background-clip: padding-box, text; -webkit-text-fill-color:#0000; }',
    );
    expect(probe.map((hit) => hit.selector)).toEqual(['.b', '.b', '.d', '.d', '.d']);
    const quoted = cssGradientTextHits(
      '.q::before { content: "{;}"; }\n.r { background-clip: text; }\n.s { content: \'a;b{\'; -webkit-text-fill-color: rgb(0 0 0 / 0); }\n.t { -webkit-text-fill-color: rgba(255, 255, 255, 0); }\n.u { -webkit-text-fill-color: rgb(0 0 0); }\n.v { -webkit-text-fill-color: rgba(0,0,0,0.5); }\n.w { -webkit-text-fill-color: #fff0; }\n.x { @apply bg-clip-text; }',
    );
    expect(quoted.map((hit) => hit.selector)).toEqual(['.r', '.s', '.t', '.w', '.x']);
    const commentInString = cssGradientTextHits(
      '.a { content: "/*"; }\n.b { background-clip: text; }\n.c { content: "*/"; }',
    );
    expect(commentInString.map((hit) => hit.selector)).toEqual(['.b']);
    expect(allowListViolations({ toString: 1 }, {}).unexpected).toEqual(['toString']);
  });

  it('GT4b: the script scan finds every gradient-text spelling and is non-vacuous', () => {
    const spellings = [
      '<h1 className="bg-clip-text text-transparent">',
      '<h1 className="[background-clip:text] text-transparent">',
      '<h1 className="[background-clip:_text]">',
      '<h1 className="[-webkit-background-clip:text]">',
      '<h1 className="[-webkit-text-fill-color:transparent]">',
      '<h1 className="[-webkit-text-fill-color:rgba(0,0,0,0)]">',
      "style={{ WebkitBackgroundClip: 'text' }}",
      'style={{ backgroundClip: "text" }}',
      "style={{ 'WebkitBackgroundClip': 'text' }}",
      "style={{ backgroundClip: wide ? 'text' : 'border-box' }}",
      "style={{ WebkitTextFillColor: 'transparent' }}",
      "style={{ WebkitTextFillColor: 'rgba(0,0,0,0)' }}",
      '<style>{`.title { -webkit-background-clip: text; }`}</style>',
      'const html = "<h1 style=\\"-webkit-text-fill-color: transparent\\">";',
      "style={{\n  backgroundClip:\n    'text',\n}}",
      "element.style.webkitBackgroundClip = 'text';",
      "element.style.setProperty('-webkit-background-clip', 'text');",
    ];
    expect(spellings.map(countScriptGradientTextHits)).toEqual(spellings.map(() => 1));
    const misses = [
      '<p className="bg-clip-padding text-transparent">',
      "style={{ backgroundClip: 'padding-box' }}",
      "style={{ WebkitTextFillColor: 'rgb(0 0 0)' }}",
      "style={{ WebkitTextFillColor: 'rgba(0,0,0,0.5)' }}",
    ];
    expect(misses.map(countScriptGradientTextHits)).toEqual([0, 0, 0, 0]);
    const everyScript = Object.keys(
      hitsByRootedFile(SCRIPT_SCAN_ROOTS, SCRIPT_SOURCE_EXTENSIONS, () => 1),
    );
    expect(everyScript.length).toBeGreaterThanOrEqual(MIN_SCANNED_SOURCES);
    expect(everyScript).toEqual(
      expect.arrayContaining(['app/root.tsx', 'app/components/loading/SpotlightLoader.tsx']),
    );
    expect(everyScript.some((path) => path.startsWith('perf/'))).toBe(true);
    expect(SCRIPT_SCAN_ROOTS.map((root) => root.prefix)).toEqual(['app', 'perf']);
  });

  it('GT5: the allow-listed dead components stay unmounted (no importer outside their own file and the barrels)', () => {
    const sources = listFiles(APP_ROOT, SCRIPT_SOURCE_EXTENSIONS);
    const importers = Object.entries(DEAD_COMPONENTS).flatMap(([name, ownFile]) => {
      expect(sources).toContain(ownFile);
      const word = new RegExp(`(?<![\\w$])${name}(?![\\w$])`);
      return sources
        .filter((path) => path !== ownFile && !BARREL_FILES.includes(path))
        .filter((path) => word.test(readApp(path)))
        .map((path) => `${name} <- ${path}`);
    });
    expect(importers).toEqual([]);
  });

  it('GT5b: the dead-module import matcher still recognises every import form of a common-named module (fixture modules)', () => {
    const usesDead = (line: string, importer: string) =>
      FIXTURE_DEAD_MODULES.some((dead) => importsDeadModule(line, importer, dead));
    const positive: ReadonlyArray<readonly [string, string]> = [
      ["import { Timeline } from '~/components/audio';", 'routes/x.tsx'],
      ["import {\n  WaveForm,\n  Timeline as T,\n} from '~/components/audio';", 'routes/x.tsx'],
      ["import * as Audio from '~/components/audio';", 'routes/x.tsx'],
      ["export * as Aud from '~/components/audio';", 'routes/x.tsx'],
      ["import {\n  // note\n  Timeline,\n} from '~/components/audio';", 'routes/x.tsx'],
      ["import '~/lib/email.server';", 'routes/x.tsx'],
      ["import { Timeline } from '~/components/audio/Timeline';", 'routes/x.tsx'],
      ["import { Timeline } from '~/components/audio/index';", 'routes/x.tsx'],
      ["import { Timeline } from '../audio/Timeline';", 'components/product/X.tsx'],
      ["import { Timeline } from '../audio';", 'components/product/X.tsx'],
      ["import { Timeline } from '~/components';", 'routes/x.tsx'],
      ["const lazy = import('./Timeline');", 'components/audio/X.tsx'],
      ["import { sendOrderEmail } from '~/lib/email.server';", 'routes/x.tsx'],
      ["import { sendOrderEmail } from '../email.server';", 'lib/utils/x.ts'],
    ];
    expect(positive.map(([line, importer]) => usesDead(line, importer))).toEqual(
      positive.map(() => true),
    );
    const negative: ReadonlyArray<readonly [string, string]> = [
      ["import { WaveForm } from '~/components/audio';", 'routes/x.tsx'],
      [
        "import { buildHireUsInquiryEmailHtml } from '~/lib/hire-us-inquiry-email.server';",
        'routes/x.tsx',
      ],
      ["import { Timeline } from './Timeline';", 'components/arrangement/X.tsx'],
      ["import { Timeline } from '~/components/arrangement/Timeline';", 'routes/x.tsx'],
    ];
    expect(negative.map(([line, importer]) => usesDead(line, importer))).toEqual(
      negative.map(() => false),
    );
  });

  it('GT6: the deleted dead Store modules stay deleted and no barrel re-exports them (STORE-2b-3d-1)', () => {
    const sources = listFiles(APP_ROOT, SCRIPT_SOURCE_EXTENSIONS);
    for (const kept of Object.values(DEAD_COMPONENTS)) {
      expect(sources).toContain(kept);
    }
    for (const path of Object.values(DELETED_STORE_MODULES)) {
      expect(sources, path).not.toContain(path);
    }
    const reExports = DELETED_MODULE_BARRELS.filter((barrel) => sources.includes(barrel)).flatMap(
      (barrel) =>
        Object.keys(DELETED_STORE_MODULES)
          .filter((name) => new RegExp(`(?<![\\w$])${name}(?![\\w$])`).test(readApp(barrel)))
          .map((name) => `${name} <- ${barrel}`),
    );
    expect(reExports).toEqual([]);
    expect(DELETED_MODULE_BARRELS.filter((barrel) => sources.includes(barrel)).length).toBe(5);
  });
});

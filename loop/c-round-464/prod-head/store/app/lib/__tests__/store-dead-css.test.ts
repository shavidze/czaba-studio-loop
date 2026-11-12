// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  APP_ROOT,
  appScriptSources,
  cssRuleBlocks,
  cssRuleKey,
  listFiles,
  readApp,
  STYLE_SOURCE_EXTENSIONS,
} from './helpers/style-scan';

const DEAD_CSS_SCANNED_FILES: ReadonlyArray<string> = [
  'styles/app.css',
  'styles/base/utilities.css',
];

const MIN_CLASS_RULES = 150;

const KEYFRAMES_HEADER = /^@keyframes\s+([\w-]+)$/;

const RUNTIME_CLASSES: Readonly<Record<string, string>> = {
  lenis: 'set on <html> by the Lenis library (useSmoothScroll)',
  'lenis-smooth': 'set on <html> by the Lenis library (useSmoothScroll)',
  'lenis-stopped': 'set on <html> by the Lenis library (useSmoothScroll)',
  'lenis-scrolling': 'set on <html> by the Lenis library (useSmoothScroll)',
};

interface ClassRule {
  key: string;
  branches: ReadonlyArray<ReadonlyArray<string>>;
}

function topLevelBranches(header: string): string[] {
  const branches: string[] = [];
  let depth = 0;
  let current = '';
  for (const character of header.replace(/\[[^\]]*\]/g, '').replace(/url\([^)]*\)/g, '')) {
    if (character === '(') {
      depth += 1;
    } else if (character === ')') {
      depth -= 1;
    }
    if (character === ',' && depth === 0) {
      branches.push(current);
      current = '';
    } else {
      current += character;
    }
  }
  branches.push(current);
  return branches;
}

function requiredClasses(branch: string): string[] {
  const required = branch.replace(/:not\([^()]*\)/g, '');
  return [
    ...new Set([...required.matchAll(/\.(-?[A-Za-z_][\w-]*)/g)].map((match) => match[1] ?? '')),
  ];
}

function classRules(path: string, css: string): ClassRule[] {
  return cssRuleBlocks(css)
    .filter(
      (block) =>
        !block.header.startsWith('@') &&
        !block.chain.some((parent) => parent.startsWith('@keyframes')),
    )
    .map((block) => ({
      key: `${path} ${cssRuleKey(block)}`,
      branches: topLevelBranches(block.header).map(requiredClasses),
    }))
    .filter((rule) => rule.branches.some((branch) => branch.length > 0));
}

function wholeToken(name: string): RegExp {
  return new RegExp(`(?<![\\w-])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`);
}

function hasConsumer(name: string, sources: ReadonlyArray<string>): boolean {
  const pattern = wholeToken(name);
  return sources.some((source) => pattern.test(source));
}

function isRendered(name: string, sources: ReadonlyArray<string>): boolean {
  return Object.hasOwn(RUNTIME_CLASSES, name) || hasConsumer(name, sources);
}

function rulesWithoutConsumer(
  rules: ReadonlyArray<ClassRule>,
  sources: ReadonlyArray<string>,
): string[] {
  return rules
    .filter(
      (rule) => !rule.branches.some((branch) => branch.every((name) => isRendered(name, sources))),
    )
    .map((rule) => rule.key);
}

function keyframesNames(css: string): string[] {
  return cssRuleBlocks(css)
    .map((block) => KEYFRAMES_HEADER.exec(block.header)?.[1])
    .filter((name): name is string => name !== undefined);
}

function cssWithoutKeyframesHeaders(css: string): string {
  return css.replace(/@keyframes\s+[\w-]+/g, '@keyframes');
}

function scriptSources(): string[] {
  return [...appScriptSources().values()];
}

describe('store dead CSS removal (STORE-2b-3d-2)', () => {
  it('DC1: every class rule in app.css and utilities.css has a selector branch whose classes app source renders', () => {
    const sources = scriptSources();
    const rules = DEAD_CSS_SCANNED_FILES.flatMap((path) => classRules(path, readApp(path)));
    expect(rulesWithoutConsumer(rules, sources)).toEqual([]);
  });

  it('DC2: every @keyframes in app.css and utilities.css is named by another CSS rule or by app source', () => {
    const sources = scriptSources();
    const otherCss = listFiles(APP_ROOT, STYLE_SOURCE_EXTENSIONS).map((path) =>
      cssWithoutKeyframesHeaders(readApp(path)),
    );
    const unnamed = DEAD_CSS_SCANNED_FILES.flatMap((path) =>
      keyframesNames(readApp(path))
        .filter((name) => !hasConsumer(name, [...otherCss, ...sources]))
        .map((name) => `${path} @keyframes ${name}`),
    );
    expect(unnamed).toEqual([]);
  });

  it('DC3: the scan is non-vacuous and rules on compounds, selector lists, :not, runtime classes and substrings', () => {
    const rules = DEAD_CSS_SCANNED_FILES.flatMap((path) => classRules(path, readApp(path)));
    expect(rules.length).toBeGreaterThanOrEqual(MIN_CLASS_RULES);
    const fixtureCss = [
      '.dc-live-fixture { color: red; }',
      '@media (max-width: 640px) { .dc-dead-fixture:hover > div { color: red; } }',
      '.dc-live-fixture.dc-state-fixture { color: red; }',
      '.dc-dead-list-fixture, .dc-live-fixture > span { color: red; }',
      '.dc-live-fixture:not(.dc-off-fixture) { color: red; }',
      '.lenis.lenis-smooth .dc-live-fixture { color: red; }',
      '[data-x=".dc-attr-fixture"] { color: red; }',
      '@keyframes dc-dead-spin { from { opacity: 0; } to { opacity: 1; } }',
    ].join('\n');
    const fixtureSources = ['<div className="dc-live-fixture dc-dead-fixture-x" />'];
    expect(rulesWithoutConsumer(classRules('fixture.css', fixtureCss), fixtureSources)).toEqual([
      'fixture.css @media (max-width: 640px) .dc-dead-fixture:hover > div',
      'fixture.css .dc-live-fixture.dc-state-fixture',
    ]);
    expect(keyframesNames(fixtureCss)).toEqual(['dc-dead-spin']);
    expect(hasConsumer('dc-dead-spin', [cssWithoutKeyframesHeaders(fixtureCss)])).toBe(false);
    expect(hasConsumer('dc-dead-spin', ['animation: dc-dead-spin 1s;'])).toBe(true);
  });
});

// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  APP_ROOT,
  allowListViolations,
  hitsByFile,
  listFiles,
  readApp,
  SCRIPT_SOURCE_EXTENSIONS,
  type StyleScanAllowList,
} from './helpers/style-scan';

const HOME_PREFIX = 'components/home/';
const MIN_BLUR_PX = 80;
const MEASURED_HOME_SECTIONS: ReadonlyArray<string> = [
  'components/home/ProductSection.tsx',
  'components/home/StudioShowcase.tsx',
];

const LARGE_BLUR_ALLOW_LIST: StyleScanAllowList = {
  'components/home/NewsletterSection.tsx': {
    hits: 1,
    reason: 'SIG-R469-UNMEASURED-BLURS: not a measured scroll cost (round 468 full-page probe)',
  },
  'components/home/SpecialOffersSection.tsx': {
    hits: 2,
    reason: 'SIG-R469-UNMEASURED-BLURS: keep-list section, restyle only with Saba',
  },
};

function countLargeBlurs(source: string): number {
  return [...source.matchAll(/(?<![\w-])blur-\[(\d+)px\]/g)].filter(
    (match) => Number(match[1]) >= MIN_BLUR_PX,
  ).length;
}

function homeLargeBlurHits(): Record<string, number> {
  const hits = hitsByFile(APP_ROOT, SCRIPT_SOURCE_EXTENSIONS, countLargeBlurs);
  return Object.fromEntries(Object.entries(hits).filter(([path]) => path.startsWith(HOME_PREFIX)));
}

describe('store scroll paint (SABA-B-15)', () => {
  it('SP1: no home section paints a large filter blur except the allow-listed ones', () => {
    expect(allowListViolations(homeLargeBlurHits(), LARGE_BLUR_ALLOW_LIST)).toEqual({
      unexpected: [],
      drifted: [],
    });
  });

  it('SP2: the measured sections carry no large filter blur', () => {
    for (const path of MEASURED_HOME_SECTIONS) {
      expect(countLargeBlurs(readApp(path)), path).toBe(0);
    }
  });

  it('SP3: the scan is non-vacuous and the counter separates blur from backdrop blur', () => {
    const files = listFiles(APP_ROOT, SCRIPT_SOURCE_EXTENSIONS);
    for (const path of [...MEASURED_HOME_SECTIONS, ...Object.keys(LARGE_BLUR_ALLOW_LIST)]) {
      expect(files).toContain(path);
    }
    expect(countLargeBlurs('rounded-full bg-brand/5 blur-[120px]')).toBe(1);
    expect(countLargeBlurs('md:blur-[100px] blur-[80px]')).toBe(2);
    expect(countLargeBlurs('blur-[40px] blur-[79px]')).toBe(0);
    expect(countLargeBlurs('backdrop-blur-[120px] backdrop-blur-lg')).toBe(0);
  });
});

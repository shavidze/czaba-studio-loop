import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { render } from '@testing-library/react';
import { MotionGlobalConfig } from 'framer-motion';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioShowcase } from '~/components/home/StudioShowcase';

const APP_ROOT = resolve(__dirname, '../..');
const RETIRED_NAMES = /Personal Mixdown|Studio Lab|Lab · Workspace|Demo workspace|headingSuffix/;

function listSourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      if (entry !== '__tests__') {
        files.push(...listSourceFiles(path));
      }
    } else if (/\.(ts|tsx)$/.test(entry)) {
      files.push(path);
    }
  }
  return files;
}

class FakeIntersectionObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

describe('NAME-AND-HINT-a one product name: CZABA Studio', () => {
  const initialSkipAnimations = MotionGlobalConfig.skipAnimations;

  beforeAll(() => {
    MotionGlobalConfig.skipAnimations = true;
  });

  afterAll(() => {
    MotionGlobalConfig.skipAnimations = initialSkipAnimations;
  });

  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('NM1 repo scan: no app source file outside __tests__ uses a retired Studio name', () => {
    const files = listSourceFiles(APP_ROOT);
    expect(files.length).toBeGreaterThan(100);
    const hits = files
      .flatMap((file) =>
        readFileSync(file, 'utf-8')
          .split(/\r?\n/)
          .map((line, index) => ({ file, line, index }))
          .filter(({ line }) => RETIRED_NAMES.test(line)),
      )
      .map(({ file, line, index }) => `${relative(APP_ROOT, file)}:${index + 1}: ${line.trim()}`);
    expect(hits).toEqual([]);
  });

  it('NM2 home showcase: the heading reads CZABA Studio with the emphasised span on Studio, and the mockup title matches', () => {
    const view = render(
      <MemoryRouter>
        <StudioShowcase />
      </MemoryRouter>,
    );
    const heading = view.getByRole('heading', { level: 2, name: 'CZABA Studio' });
    expect(heading.textContent).toBe('CZABA Studio');
    const emphasis = heading.querySelector('span');
    expect(emphasis?.textContent).toBe('Studio');
    expect(view.getAllByText('CZABA Studio', { exact: true }).map((node) => node.tagName)).toEqual(
      expect.arrayContaining(['SPAN']),
    );
    expect(view.container.textContent).not.toMatch(RETIRED_NAMES);
    view.unmount();
  });
});

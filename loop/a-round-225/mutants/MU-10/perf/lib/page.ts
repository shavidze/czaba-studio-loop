import { expect, type Locator, type Page } from '@playwright/test';
import type { PerfWindowSnapshot } from './instrumentation';

const quietMs = 200;
const settleCapMs = 3000;
const expectedReactMajor = '18';

export const nowIn = (page: Page): Promise<number> => page.evaluate(() => performance.now());

export const snapshot = (page: Page, from: number, to: number): Promise<PerfWindowSnapshot> =>
  page.evaluate(
    ({ start, end }): PerfWindowSnapshot => {
      const state = window.__czabaPerf;
      if (!state) throw new Error('perf instrumentation is not installed');
      const inside = (t: number): boolean => t >= start && t <= end;
      return {
        commits: state.commits.filter((commit) => inside(commit.t)),
        starts: state.starts.filter((entry) => inside(entry.t)),
        frames: state.frames.filter(inside),
        moves: state.moves.filter(inside),
        downs: state.downs.filter(inside),
        ups: state.ups.filter(inside),
        moveLatency: state.moveLatency.filter((sample) => inside(sample.t)),
        longtasks: state.longtasks.filter((entry) => inside(entry.t)),
        loafs: state.loafs.filter((entry) => inside(entry.t)),
        events: state.events.filter((entry) => inside(entry.t)),
      };
    },
    { start: from, end: to },
  );

export const blurActive = (page: Page): Promise<void> =>
  page.evaluate(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) active.blur();
  });

export async function waitForQuiet(page: Page, from: number, minMs: number): Promise<number> {
  await page.waitForTimeout(minMs);
  for (;;) {
    const quiet = await page.evaluate(
      ({ start, quietFor, cap }) => {
        const state = window.__czabaPerf;
        const now = performance.now();
        const lastCommit = state?.commits.at(-1)?.t ?? 0;
        const lastStart = state?.starts.at(-1)?.t ?? 0;
        return now - Math.max(lastCommit, lastStart) >= quietFor || now - start >= cap;
      },
      { start: from, quietFor: quietMs, cap: settleCapMs },
    );
    if (quiet) return nowIn(page);
    await page.waitForTimeout(50);
  }
}

export function reactRendererProblem(versions: readonly string[]): string | null {
  if (versions.length === 0) return 'no React renderer was injected into the devtools hook';
  if (versions.every((version) => version.split('.')[0] === expectedReactMajor)) return null;
  return `React renderer major is not ${expectedReactMajor}: ${versions.join(', ')}`;
}

export const playButton = (page: Page): Locator =>
  page.getByRole('button', { name: /^(Play|Pause)$/ });

export const audioRunning = (page: Page): Promise<boolean> =>
  page.evaluate(() => window.__czabaPerf?.audioContextStates().includes('running') ?? false);

export async function isPlaying(page: Page): Promise<boolean> {
  const label = await playButton(page).getAttribute('aria-label');
  return label === 'Pause' && (await audioRunning(page));
}

export async function setPlayback(page: Page, playing: boolean): Promise<void> {
  await blurActive(page);
  await page.keyboard.press('Space');
  await expect(playButton(page)).toHaveAttribute('aria-label', playing ? 'Pause' : 'Play', {
    timeout: 15000,
  });
}

export function startTasks(starts: readonly { task: number }[]): Record<string, number | string> {
  const perTask = new Map<number, number>();
  for (const start of starts) perTask.set(start.task, (perTask.get(start.task) ?? 0) + 1);
  return { tasks: perTask.size, startsPerTask: [...perTask.values()].join(',') };
}

export { rateRowId } from './report';

export const audioClips = (page: Page): Locator => page.locator('[data-clip-kind="audio"]');

import { writeFileSync } from 'node:fs';
import { test } from '@playwright/test';
import { perfLibraryAddLabel } from './lib/app-labels';
import { installPerfInstrumentation } from './lib/instrumentation';

test('b278 load-tail probe', async ({ browser }) => {
  const out: unknown[] = [];
  for (let run = 0; run < 3; run += 1) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
    await context.addInitScript(installPerfInstrumentation);
    const page = await context.newPage();
    await page.goto('/studio-lab', { waitUntil: 'load', timeout: 120000 });
    const ready = await (await page.waitForFunction((addLabel) => {
      const add = [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === addLabel);
      const wave = document.querySelector('[data-testid="arrangement-library-preview-wave"] rect');
      return add instanceof HTMLButtonElement && add.getAttribute('aria-disabled') !== 'true' && wave !== null ? performance.now() : 0;
    }, perfLibraryAddLabel, { polling: 'raf', timeout: 90000 })).jsonValue();
    const statusAt = await (await page.waitForFunction(() => {
      const s = document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '';
      return s.startsWith('Demo collection ready') ? performance.now() : 0;
    }, undefined, { polling: 'raf', timeout: 90000 })).jsonValue();
    await page.waitForTimeout(2500);
    const data = await page.evaluate(() => ({
      commits: (window.__czabaPerf?.commits ?? []).map((c) => [Math.round(c.t), c.rendered]),
      starts: (window.__czabaPerf?.starts ?? []).map((s) => Math.round(s.t)),
    }));
    out.push({ run, ready: Math.round(ready), statusAt: Math.round(statusAt), after: data.commits.filter(([t]) => t >= ready - 300), starts: data.starts });
    await context.close();
  }
  writeFileSync('/home/runner/czaba-project/tmp/studio-real-loop/b-round-278/probe/load-tail.json', JSON.stringify(out, null, 1));
});

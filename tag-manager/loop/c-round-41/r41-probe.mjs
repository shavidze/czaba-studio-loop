import { createRequire } from 'node:module';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
const REPO = '/home/runner/czaba-project/czaba-tag-manager';
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-41';
const req = createRequire(REPO + '/package.json');
const { _electron } = req('playwright');
const work = mkdtempSync(join(tmpdir(), 'c-r41-'));
const fa = join(work, 'fa'); mkdirSync(fa);
const cfg = join(work, 'xdg'); mkdirSync(cfg);
copyFileSync(join(REPO, 'tests/fixtures/sample.wav'), join(fa, 'a.wav'));

const SPEC = {
  header: 'px-3 py-2 border-b border-outline flex items-center gap-2',
  back: 'text-muted hover:text-foreground p-0.5 transition-colors',
  title: 'text-xs font-medium text-brand',
  content: 'flex-1 overflow-y-auto p-3',
  fieldset: 'min-w-0 space-y-4 disabled:opacity-60',
  footer: 'p-3 border-t border-outline',
  row: 'flex items-center gap-1.5 rounded px-2 py-1.5 bg-background border border-outline text-xs',
  arrowMiddle: 'text-dim enabled:hover:text-foreground p-0.5',
  arrowEdge: 'text-dim enabled:hover:text-foreground p-0.5 opacity-30',
  x: 'text-dim enabled:hover:text-destructive p-0.5',
  chip: 'text-[10px] px-1.5 py-0.5 rounded bg-background border border-outline text-dim enabled:hover:text-foreground enabled:hover:border-brand transition-colors',
  trash: 'text-destructive enabled:hover:text-destructive/80 p-0.5',
};
const result = { work, elements: {}, checks: {}, pageErrors: [], consoleErrors: [] };
const app = await _electron.launch({ args: ['--no-sandbox', join(REPO, 'out/main/index.js')], env: { ...process.env, XDG_CONFIG_HOME: cfg } });
const page = await app.firstWindow();
page.on('pageerror', (e) => result.pageErrors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') result.consoleErrors.push(m.text()); });
await page.setViewportSize({ width: 1400, height: 900 });
await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(800);
try {
  await app.evaluate(({ dialog }, d) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [d] }); }, fa);
  await page.getByRole('button', { name: /Open Folder/ }).first().click();
  const cell = page.locator('span.truncate.text-foreground', { hasText: /^a\.wav$/ }).first();
  await cell.waitFor({ timeout: 30000 });
  await cell.click();
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: /Customize Fields/ }).first().click();
  const title = page.locator('span', { hasText: /^Customize Fields$/ }).first();
  await title.waitFor({ timeout: 10000 });
  await page.waitForTimeout(400);
  const cls = (loc) => loc.evaluate((e) => e.className);
  const header = title.locator('xpath=..');
  const root = header.locator('xpath=..');
  const fieldset = root.locator('fieldset').first();
  const content = fieldset.locator('xpath=..');
  const footer = root.locator(':scope > div').nth(2);
  const back = header.locator('button').first();
  const xBtns = page.locator('button[title="Hide standard field"]');
  result.checks.xCountBefore = await xBtns.count();
  await xBtns.last().click();
  await page.waitForTimeout(400);
  const chip = page.locator('button', { hasText: /^\+ / }).first();
  await chip.waitFor({ timeout: 5000 });
  const row = fieldset.locator('div.rounded.border').first();
  const rowArrows = row.locator('button');
  const done = page.getByRole('button', { name: /^(Done|Applying\.\.\.)$/ });
  result.elements.header = await cls(header);
  result.elements.back = await cls(back);
  result.elements.title = await cls(title);
  result.elements.content = await cls(content);
  result.elements.fieldset = await cls(fieldset);
  result.elements.fieldsetDisabled = await fieldset.evaluate((e) => e.disabled);
  result.elements.footer = await cls(footer);
  result.elements.row = await cls(row);
  result.elements.arrowEdge = await cls(rowArrows.nth(0));
  result.elements.arrowEdgeDisabled = await rowArrows.nth(0).evaluate((e) => e.disabled);
  result.elements.arrowMiddle = await cls(rowArrows.nth(1));
  result.elements.arrowMiddleDisabled = await rowArrows.nth(1).evaluate((e) => e.disabled);
  result.elements.x = await cls(xBtns.first());
  result.elements.chip = await cls(chip);
  result.elements.chipText = (await chip.textContent())?.trim();
  result.elements.done = await cls(done);
  result.elements.doneText = (await done.textContent())?.trim();
  await page.screenshot({ path: join(OUT, 'r41-schema-editor-chip.png') });
  await page.getByPlaceholder('Field name (e.g. Client)').fill('C41Client');
  await page.getByRole('button', { name: /Add Field/ }).click();
  await page.waitForTimeout(400);
  const customRow = fieldset.locator('div.rounded.border', { hasText: 'C41Client' }).first();
  await customRow.waitFor({ timeout: 5000 });
  const trash = customRow.locator('button').last();
  result.elements.trash = await cls(trash);
  result.elements.trashHasSvg = await trash.evaluate((e) => e.querySelector('svg')?.getAttribute('class'));
  result.elements.doneAriaDisabled = await done.getAttribute('aria-disabled');
  result.elements.doneAriaBusy = await done.getAttribute('aria-busy');
  result.elements.doneNativeDisabled = await done.evaluate((e) => e.disabled);
  result.elements.backInsideFieldset = await back.evaluate((e) => !!e.closest('fieldset'));
  await customRow.scrollIntoViewIfNeeded();
  await page.screenshot({ path: join(OUT, 'r41-schema-editor.png') });
  const tok = (s) => s.split(/\s+/).filter(Boolean);
  for (const [k, spec] of Object.entries(SPEC)) {
    const actual = tok(result.elements[k] ?? '');
    result.checks[k] = { missing: tok(spec).filter((t) => !actual.includes(t)), extra: actual.filter((t) => !tok(spec).includes(t)) };
  }
  result.checks.hoverWithoutEnabledInFieldset = Object.entries(result.elements).filter(([k, v]) => typeof v === 'string' && ['arrowMiddle','arrowEdge','x','chip','trash'].includes(k) && tok(v).some((t) => t.startsWith('hover:')));
} catch (e) {
  result.error = String(e?.stack ?? e);
  await page.screenshot({ path: join(OUT, 'r41-error.png') }).catch(() => {});
} finally {
  writeFileSync(join(OUT, 'r41-dom.json'), JSON.stringify(result, null, 2));
  await app.close();
}
console.log(JSON.stringify(result, null, 2));

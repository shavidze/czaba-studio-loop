import { createRequire } from 'node:module';
import { readFileSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
const REPO = '/home/runner/czaba-project/czaba-tag-manager';
const OUT = '/home/runner/czaba-project/tmp/tag-manager-loop/c-round-3';
const dir = process.argv[2];
const req = createRequire(join(REPO, 'package.json'));
const { _electron } = req('playwright');
const app = await _electron.launch({ args: ['--no-sandbox', join(REPO, 'out/main/index.js')], env: { ...process.env, XDG_CONFIG_HOME: mkdtempSync(join(tmpdir(), 'c3x-')) } });
const page = await app.firstWindow();
await page.waitForLoadState('domcontentloaded');
await app.evaluate(({ dialog }, d) => { dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [d] }); }, dir);
await page.waitForTimeout(800);
await page.getByText('Open Folder', { exact: true }).click();
await page.getByText('contract.wav', { exact: true }).first().click();
await page.waitForTimeout(600);
const cat = page.locator('div.space-y-1', { has: page.locator('label', { hasText: /^Category \(UCS\)$/ }) }).locator('input').first();
const before = await cat.inputValue();
await cat.fill('');
await page.getByRole('button', { name: /Save Tags/ }).click();
await page.getByText('Tags saved').first().waitFor({ timeout: 10000 });
await page.waitForTimeout(600);
await page.screenshot({ path: join(OUT, '13-contract-category-cleared.png') });
const after = await cat.inputValue();
await app.close();
const p = join(dir, 'contract.wav');
const buf = readFileSync(p);
// own INFO dump
let off = 12; const subs = [];
while (off + 8 <= buf.length) { const id = buf.toString('ascii', off, off + 4); const sz = buf.readUInt32LE(off + 4);
  if (id === 'LIST' && buf.toString('ascii', off + 8, off + 12) === 'INFO') { let s = off + 12; while (s + 8 <= off + 8 + sz) { const sid = buf.toString('ascii', s, s + 4); const ss = buf.readUInt32LE(s + 4); subs.push(`${sid}:${ss}:${buf.toString('utf8', s + 8, s + 8 + ss)}`); s += 8 + ss + (ss % 2); } }
  off += 8 + sz + (sz % 2); }
console.log(JSON.stringify({ before, after, info: subs, doorwoodAnywhere: buf.includes(Buffer.from('DOORWood')), ffprobe: JSON.parse(execFileSync('ffprobe', ['-v','error','-show_entries','format_tags','-of','json',p]).toString()).format.tags }, null, 1));

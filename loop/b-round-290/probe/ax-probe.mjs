import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2]; const tag = process.argv[3] ?? 'before'; const res = {};
const browser = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.goto((process.env.STUDIO_URL ?? 'http://127.0.0.1:5173/studio-lab'), { waitUntil: 'networkidle', timeout: 180000 });
  await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 180000 });
  await page.waitForTimeout(800);
  const lb = page.getByTestId('arrangement-library-list');
  const r = {};
  r.ariaSnapshot = await lb.ariaSnapshot();
  r.bbox = await lb.boundingBox();
  const cdp = await ctx.newCDPSession(page);
  const { nodes } = await cdp.send('Accessibility.getFullAXTree');
  const byId = new Map(nodes.map((n) => [n.nodeId, n]));
  const lbNode = nodes.find((n) => n.role?.value === 'listbox');
  const groups = [];
  for (const cid of lbNode?.childIds ?? []) {
    const g = byId.get(cid);
    if (!g || g.role?.value !== 'group') continue;
    const kids = (g.childIds ?? []).map((k) => byId.get(k)).filter(Boolean)
      .filter((k) => !k.ignored)
      .map((k) => ({ role: k.role?.value, name: k.name?.value ?? '' }));
    groups.push({ name: g.name?.value ?? '', children: kids });
  }
  r.groups = groups;
  r.nonOptionChildrenInGroups = groups.reduce((n, g) => n + g.children.filter((c) => c.role !== "option").length, 0);
  r.textLinesInSnapshot = (r.ariaSnapshot.match(/^\s*- text:/gm) ?? []).length;
  res[`${w}x${h}`] = r;
  await page.screenshot({ path: `${out}/ax-${tag}-${w}x${h}.png` });
  await ctx.close();
}
await browser.close();
writeFileSync(`${out}/ax-${tag}.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify(Object.fromEntries(Object.entries(res).map(([k, v]) => [k, { groups: v.groups, nonOption: v.nonOptionChildrenInGroups, text: v.textLinesInSnapshot, names: v.groups.map((g) => g.name), bbox: v.bbox }])), null, 1));

const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } }); const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load' });
  await p.waitForFunction(() => { const x = [...document.querySelectorAll('button')].find((y) => y.textContent.trim() === 'Add'); return x && !x.disabled; }, undefined, { timeout: 90000 });
  await p.waitForTimeout(800);
  const cdp = await ctx.newCDPSession(p);
  const { nodes } = await cdp.send('Accessibility.getFullAXTree');
  const loop = nodes.filter((n) => n.role && n.role.value === 'button' && n.name && /^Loop/.test(n.name.value));
  const out = loop.map((n) => ({ name: n.name.value, desc: (n.description || {}).value, props: (n.properties || []).filter((q) => ['disabled', 'focusable', 'keyshortcuts'].includes(q.name)).map((q) => q.name + '=' + JSON.stringify(q.value.value)) }));
  // Tab reachability of the Loop button
  await p.mouse.click(5, 5);
  let reached = false; const stops = [];
  for (let i = 0; i < 40; i++) { await p.keyboard.press('Tab'); const t = await p.evaluate(() => document.activeElement && (document.activeElement.getAttribute('title') || document.activeElement.textContent.trim().slice(0, 20))); stops.push(t); if (/^Loop/.test(t || '')) { reached = true; break; } }
  // sheet row for loop
  await p.evaluate(() => document.activeElement && document.activeElement.blur());
  await p.getByRole('button', { name: 'Keyboard shortcuts (?)' }).click(); await p.waitForTimeout(400);
  const row = await p.evaluate(() => [...document.querySelectorAll('li[data-shortcut-id="loop"]')].map((l) => l.textContent));
  console.log(JSON.stringify({ ax: out, tabReachedLoop: reached, firstStops: stops.slice(0, 20), sheetLoopRow: row }, null, 1));
  await b.close();
})();

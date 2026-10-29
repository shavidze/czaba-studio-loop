const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const base = process.argv[2];
  const out = {};
  const browser = await chromium.launch();
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto(base + '/studio-lab');
    await page.waitForFunction(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'), undefined, { timeout: 150000 });
    const client = await ctx.newCDPSession(page);
    const ax = async (name) => {
      const node = await page.getByRole('button', { name, exact: true }).elementHandle();
      const { nodes } = await client.send('Accessibility.getPartialAXTree', { backendNodeId: (await client.send('DOM.describeNode', { objectId: (await client.send('Runtime.evaluate', { expression: `document.querySelector('[data-testid=arrangement-transport-centre] button[aria-label="${name}"]')` })).result.objectId })).node.backendNodeId, fetchRelatives: false });
      const n = nodes[0];
      return { name: n.name && n.name.value, description: n.description && n.description.value, role: n.role.value };
    };
    const r = {};
    r.stoppedPlay = await ax('Play'); r.stoppedStop = await ax('Stop');
    await page.locator('[data-source-id="demo-stem-pulse"]').first().click(); await page.waitForTimeout(250);
    const add = page.locator('button', { hasText: /^Add/ }).first();
    await add.click(); await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Play', exact: true }).click();
    await page.waitForTimeout(500);
    r.playing = await page.getByRole('button', { name: 'Play', exact: true }).getAttribute('data-playing');
    r.playingPlay = await ax('Play'); r.playingStop = await ax('Stop');
    r.hiddenBox = await page.getByTestId('arrangement-playback-state').boundingBox();
    r.toolbarH = (await page.getByTestId('arrangement-transport').boundingBox()).height;
    await page.getByRole('button', { name: 'Stop', exact: true }).click();
    await page.waitForTimeout(300);
    r.afterStopPlay = await ax('Play');
    out[`${w}x${h}`] = r;
    await ctx.close();
  }
  await browser.close();
  console.log(JSON.stringify(out, null, 1));
})();

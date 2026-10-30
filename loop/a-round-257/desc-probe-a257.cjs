const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const base = process.argv[2] || 'http://127.0.0.1:5173';
  const out = {};
  const browser = await chromium.launch();
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const pageErrors = [];
    page.on('pageerror', (e) => pageErrors.push(String(e)));
    await page.goto(base + '/studio-lab');
    await page.waitForFunction(
      () => document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'),
      undefined,
      { timeout: 150000 },
    );
    const client = await ctx.newCDPSession(page);
    const ax = async (name) => {
      const { result } = await client.send('Runtime.evaluate', {
        expression: `document.querySelector('[data-testid=arrangement-transport-centre] button[aria-label="${name}"]')`,
      });
      const { node } = await client.send('DOM.describeNode', { objectId: result.objectId });
      const { nodes } = await client.send('Accessibility.getPartialAXTree', {
        backendNodeId: node.backendNodeId,
        fetchRelatives: false,
      });
      const n = nodes[0];
      const el = page.locator(`[data-testid=arrangement-transport-centre] button[aria-label="${name}"]`);
      return {
        name: n.name && n.name.value,
        description: n.description && n.description.value,
        role: n.role.value,
        title: await el.getAttribute('title'),
        keyshortcuts: await el.getAttribute('aria-keyshortcuts'),
      };
    };
    const snapshot = async () => ({ play: await ax('Play'), stop: await ax('Stop') });
    const r = {};
    r.stopped = await snapshot();
    await page.locator('[data-source-id="demo-stem-pulse"]').first().click();
    await page.waitForTimeout(250);
    await page.locator('button', { hasText: /^Add/ }).first().click();
    await page.waitForTimeout(1000);
    const playBtn = page.getByRole('button', { name: 'Play', exact: true });
    const stopBtn = page.getByRole('button', { name: 'Stop', exact: true });
    await playBtn.click();
    await page.waitForTimeout(500);
    r.playingDataAttr = await playBtn.getAttribute('data-playing');
    r.playing = await snapshot();
    r.stateBox = await page.getByTestId('arrangement-playback-state').boundingBox();
    r.stateCount = await page.getByTestId('arrangement-playback-state').count();
    r.toolbarHeight = (await page.getByTestId('arrangement-transport').boundingBox()).height;
    await stopBtn.click();
    await page.waitForTimeout(300);
    r.afterStopDataAttr = await playBtn.getAttribute('data-playing');
    r.afterStop = await snapshot();
    await page.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => undefined);
    await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
    await page.keyboard.press('Space');
    await page.waitForTimeout(400);
    r.afterSpaceDataAttr = await playBtn.getAttribute('data-playing');
    r.afterSpace = await snapshot();
    await stopBtn.dblclick();
    await page.waitForTimeout(400);
    r.afterDoubleClickStopDataAttr = await playBtn.getAttribute('data-playing');
    r.afterDoubleClickStop = await snapshot();
    r.activeAfterDoubleClick = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
    r.stateFocusable = await page.evaluate(() => {
      const s = document.querySelector('[data-testid=arrangement-playback-state]');
      s.focus();
      return document.activeElement === s;
    });
    r.pageErrors = pageErrors;
    await page.screenshot({ path: `${__dirname}/toolbar-${w}x${h}.png` });
    out[`${w}x${h}`] = r;
    await ctx.close();
  }
  await browser.close();
  console.log(JSON.stringify(out, null, 1));
})();

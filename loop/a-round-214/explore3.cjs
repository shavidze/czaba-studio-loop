const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load', timeout: 120000 });
  await page.getByRole('button', { name: 'Add', exact: true }).waitFor();
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.waitForTimeout(2000);
  const clip = page.locator('[data-clip-kind="audio"]').first();
  const st = async (tag) => console.log(tag, JSON.stringify(await clip.evaluate((c) => ({ start: c.dataset.clipStart, fadeIn: c.dataset.fadeIn, w: c.getBoundingClientRect().width, text: c.innerText.split('\n').slice(1).join('|') }))), 'cg', await page.getByRole('slider', { name: 'Clip Gain — fader', exact: true }).count(), 'zoom', await page.getByRole('slider', { name: 'Zoom (px/s)', exact: true }).inputValue(), 'wave', await page.getByTestId('arrangement-clip-waveform').count(), 'undo', await page.getByRole('button', { name: /^Undo/ }).first().getAttribute('title').catch(()=>null));
  await st('add');
  const tracks = await page.locator('[data-track-id]').evaluateAll((rows) => rows.map((r) => ({ id: r.dataset.trackId, box: r.getBoundingClientRect().toJSON(), clips: r.querySelectorAll('[data-clip-kind]').length, tag: r.tagName })));
  console.log('tracks', JSON.stringify(tracks));
  const blur = () => page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
  const drag = async (loc, fy, label) => {
    const b = await loc.boundingBox(); const x = Math.max(b.x, 0) + (b.width > 50 ? 300 : b.width / 2); const y = b.y + b.height * fy;
    await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 120, y, { steps: 60 }); await page.mouse.up(); await page.waitForTimeout(600); await st(label);
  };
  await drag(clip.getByTestId('arrangement-clip-fade-in-handle'), 0.5, 'fade');
  await blur(); await page.keyboard.press('Control+z'); await page.waitForTimeout(400); await st('fadeUndo');
  await drag(clip.getByTitle('Trim — left edge'), 0.6, 'trim');
  await blur(); await page.keyboard.press('Control+z'); await page.waitForTimeout(400); await st('trimUndo');
  await drag(clip.getByTitle(/ — drag to move$/), 0.5, 'move');
  await blur(); await page.keyboard.press('Control+z'); await page.waitForTimeout(400); await st('moveUndo');
  await drag(clip.getByTitle('drag = time selection · click = playhead'), 0.6, 'range');
  const body = await clip.getByTitle('drag = time selection · click = playhead').boundingBox();
  await page.mouse.click(Math.max(body.x,0) + 300, body.y + body.height * 0.6); await page.waitForTimeout(400); await st('rangeClick');
  for (const k of ['=', '=', '-', '-']) { await blur(); await page.keyboard.press(k); await page.waitForTimeout(300); await st('zoom' + k); }
  // deselect by empty lane click
  const empty = tracks.find((t) => t.clips === 0);
  await page.mouse.click(900, empty.box.y + empty.box.height / 2); await page.waitForTimeout(400); await st('emptyClick');
  const hdr = clip.getByTitle(/ — drag to move$/); const hb = await hdr.boundingBox();
  await page.mouse.click(Math.max(hb.x, 0) + 300, hb.y + hb.height / 2); await page.waitForTimeout(400); await st('hdrClick');
  await blur();
  for (let i = 0; i < 3; i++) { await page.keyboard.press('Control+d'); await page.waitForTimeout(300); console.log('clips', await page.locator('[data-clip-kind="audio"]').count()); }
  await blur(); await page.keyboard.press('Space'); await page.waitForTimeout(1000); console.log('play', await page.getByRole('button', { name: /^(Play|Pause)$/ }).getAttribute('aria-label'));
  await browser.close();
})();

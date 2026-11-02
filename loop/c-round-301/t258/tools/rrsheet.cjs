// C round 258: RR-SHEET (CALM-1, CALM-2, SABA-B-8, C-SHEET-256) consolidated browser probe. usage: node rrsheet.cjs <outDir>
const L = require('./lib258.cjs');
const { sleep, fs, path } = L;
const outDir = path.resolve(process.argv[2]); fs.mkdirSync(outDir, { recursive: true });
const FIRST = 'Demo collection ready. Drag a sound onto a track, or press Enter to add it. Press ? for shortcuts.';
const hints = (page) => page.evaluate(() => [...document.querySelectorAll('[data-testid="arrangement-lane-empty-hint"]')].filter((h) => h.getBoundingClientRect().height > 0).map((h) => h.closest('[data-track-id]')?.getAttribute('data-track-id') ?? '?'));
const titles = (page) => page.evaluate(() => {
  const btns = [...document.querySelectorAll('button')];
  const by = (re) => { const b = btns.find((x) => re.test(x.getAttribute('aria-label') || '')); return b ? { label: b.getAttribute('aria-label'), title: b.getAttribute('title'), aks: b.getAttribute('aria-keyshortcuts') } : null; };
  return { undo: by(/^Undo/), back: by(/^Back to start/), loop: by(/^Loop/), play: by(/^Play$/), stop: by(/^Stop$/) };
});
(async () => {
  const browser = await L.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const out = {};
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const k = `${vp.width}x${vp.height}`; const r = {}; out[k] = r;
    const { ctx, page, errors } = await L.open(browser, vp, { pulse: false });
    r.status = await page.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent);
    r.hintEl = await page.locator('[data-testid="arrangement-shortcut-hint"]').count();
    r.empty = await page.evaluate(() => {
      const t = (id) => document.querySelector(`[data-testid="${id}"]`);
      const cap = t('arrangement-video-caption');
      return {
        loopStrip: t('arrangement-loop-strip')?.innerText ?? null,
        barsRuler: t('arrangement-bars-ruler')?.innerText ?? null,
        dockRow: cap ? cap.parentElement.innerText : null,
        monitor: t('arrangement-video-empty') ? t('arrangement-video-empty').innerText : (t('arrangement-video-box')?.innerText ?? null),
      };
    });
    r.titles = await titles(page);
    r.hints0 = await hints(page);
    r.laneSwitch = {};
    for (const n of ['SFX', 'Stems', 'Music']) {
      const b = page.getByRole('button', { name: `${n} — set as the active track`, exact: true });
      if (await b.count()) { await b.click(); await sleep(300); r.laneSwitch[n] = await hints(page); } else r.laneSwitch[n] = 'no button';
    }
    await page.screenshot({ path: path.join(outDir, `empty-${k}.png`) });
    // `?` opens the sheet; Esc restores focus to the opener (body here)
    await L.blur(page); await page.mouse.click(5, 5); await sleep(200);
    await page.keyboard.press('Shift+Slash'); await sleep(600);
    r.qOpen = await page.locator('[role="dialog"]').count();
    r.sheetScroll = await page.evaluate(() => { const dlg = document.querySelector('[role="dialog"]'); if (!dlg) return null; for (let e = dlg.querySelector('[data-shortcut-id]'); e; e = e.parentElement) { const cs = getComputedStyle(e); if (/(auto|scroll)/.test(cs.overflowY) && e.scrollHeight > e.clientHeight) return { sh: e.scrollHeight, ch: e.clientHeight }; } return { none: true }; });
    await page.screenshot({ path: path.join(outDir, `sheet-${k}.png`) });
    await page.keyboard.type('split'); await sleep(400);
    r.search = await page.evaluate(() => [...document.querySelectorAll('[role="dialog"] [data-shortcut-id]')].map((li) => ({ id: li.getAttribute('data-shortcut-id'), keys: [...li.querySelectorAll('kbd')].map((x) => x.textContent) })));
    await page.keyboard.press('Escape'); await sleep(400);
    r.qAfterEsc = await page.evaluate(() => ({ open: !!document.querySelector('[role="dialog"]'), active: document.activeElement === document.body ? 'BODY' : (document.activeElement.getAttribute('aria-label') || document.activeElement.tagName) }));
    // footer button
    const fb = page.getByRole('button', { name: /Keyboard shortcuts/ }).first();
    r.footer = { count: await fb.count(), text: (await fb.count()) ? (await fb.innerText()).trim() : null };
    await fb.click(); await sleep(500);
    r.footer.open = await page.locator('[role="dialog"]').count();
    await page.keyboard.press('Escape'); await sleep(400);
    r.footer.afterEsc = await page.evaluate(() => ({ open: !!document.querySelector('[role="dialog"]'), active: document.activeElement.getAttribute('aria-label'), ring: getComputedStyle(document.activeElement).outlineStyle }));
    // library notice: dismiss, reload in the same context
    r.notice0 = await page.locator('[data-testid="arrangement-library-notice"]').count();
    r.noticeText = r.notice0 ? (await page.locator('[data-testid="arrangement-library-notice"]').innerText()).trim() : null;
    if (r.notice0) { await page.getByTestId('arrangement-library-notice-dismiss').click(); await sleep(400); }
    r.noticeAfterDismiss = await page.locator('[data-testid="arrangement-library-notice"]').count();
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'), undefined, { timeout: 150000 }); await sleep(600);
    r.noticeAfterReload = await page.locator('[data-testid="arrangement-library-notice"]').count();
    // first clip: lane hint gone
    await L.addPulse(page);
    r.hintsAfterClip = await hints(page);
    r.titlesAfterClip = await titles(page);
    r.errors = errors;
    await ctx.close();
    // fresh context shows the notice again
    const f = await L.open(browser, vp, { pulse: false });
    r.noticeFresh = await f.page.locator('[data-testid="arrangement-library-notice"]').count();
    await f.ctx.close();
    const T = r.titles;
    const tOk = (o, title, aks) => o && o.title === title && (aks === undefined || o.aks === aks);
    r.checks = {
      firstRun: r.status === FIRST,
      noHint: r.hintEl === 0,
      emptyStrips: !r.empty.loopStrip && !r.empty.barsRuler && !(r.empty.dockRow || '').trim() && !(r.empty.monitor || '').trim(),
      qOpens: r.qOpen === 1 && r.qAfterEsc.open === false && r.qAfterEsc.active === 'BODY',
      search: r.search.some((x) => x.id === 'split' && x.keys.includes('Ctrl+E')),
      footer: r.footer.open === 1 && !r.footer.afterEsc.open && /Keyboard shortcuts/.test(r.footer.afterEsc.active || ''),
      bound: r.sheetScroll && (r.sheetScroll.none || r.sheetScroll.sh <= 1280),
      titles: tOk(T.undo, 'Undo (Ctrl+Z)') && /\(Home\)$/.test(T.back?.title || '') && /\(Ctrl\+L\)$/.test(T.loop?.title || '') && tOk(T.play, 'Play (Space)') && tOk(T.stop, 'Stop (Space)'),
      aks: /Control\+Z/.test(T.undo?.aks || '') && /Home/.test(T.back?.aks || '') && /Control\+L/.test(T.loop?.aks || '') && /Space/.test(T.play?.aks || '') && /Space/.test(T.stop?.aks || ''),
      laneHint: JSON.stringify(r.hints0) === '["music"]' && JSON.stringify(r.laneSwitch.SFX) === '["sfx"]' && JSON.stringify(r.laneSwitch.Stems) === '["stems"]' && JSON.stringify(r.laneSwitch.Music) === '["music"]' && r.hintsAfterClip.length === 0,
      notice: r.notice0 === 1 && r.noticeAfterDismiss === 0 && r.noticeAfterReload === 0 && r.noticeFresh === 1,
      errors: errors.length === 0,
    };
    r.pass = Object.values(r.checks).every(Boolean);
    console.log(k, r.pass, JSON.stringify(r.checks));
  }
  fs.writeFileSync(path.join(outDir, 'rrsheet.json'), JSON.stringify(out, null, 1));
  await browser.close();
})();

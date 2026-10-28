const { chromium } = require('@playwright/test');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
  await p.waitForSelector('[data-testid="arrangement-video-dock"]', { state: 'attached', timeout: 60000 });
  await p.waitForTimeout(1500);
  const r = await p.evaluate(() => {
    const t = (id) => document.querySelector(`[data-testid="${id}"]`);
    const cap = t('arrangement-video-caption');
    const loop = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Loop' || x.getAttribute('aria-label')?.startsWith('Loop'));
    const box = (e) => { const r = e?.getBoundingClientRect(); return r ? [r.x, r.y, r.width, r.height].map(Math.round) : null; };
    return {
      bars: t('arrangement-bars-ruler')?.textContent, loopStrip: t('arrangement-loop-strip')?.textContent,
      caption: cap?.textContent, captionRowH: cap?.parentElement.getBoundingClientRect().height,
      captionRowText: cap?.parentElement.textContent,
      empty: t('arrangement-video-empty')?.textContent, emptyBox: box(t('arrangement-video-empty')), videoBox: box(t('arrangement-video-box')),
      emptyBg: t('arrangement-video-empty') && getComputedStyle(t('arrangement-video-empty')).backgroundColor,
      loopTitle: loop?.title, loopDisabled: loop?.disabled, loopKeys: loop?.getAttribute('aria-keyshortcuts'),
      overviewAria: t('arrangement-overview')?.getAttribute('aria-label'),
    };
  });
  await p.screenshot({ path: out + '/self-S0-1280.png' });
  console.log(JSON.stringify({ ...r, errs }, null, 1));
  await b.close();
})();

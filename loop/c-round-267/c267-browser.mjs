import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const outDir = process.argv[3] ?? '/home/runner/czaba-project/tmp/studio-real-loop/c-round-267';
const tag = process.argv[4] ?? 'c267';
const browser = await chromium.launch();
const out = { base, startedUtc: new Date().toISOString() };
const save = () => writeFileSync(`${outDir}/${tag}-browser.json`, JSON.stringify(out, null, 1));

const st = (page) =>
  page.evaluate(() => ({
    clips: document.querySelectorAll('[data-clip-id]').length,
    clipIds: [...document.querySelectorAll('[data-clip-id]')].map((c) => c.getAttribute('data-clip-id')),
    loop: [...document.querySelectorAll('button')]
      .find((b) => b.getAttribute('aria-keyshortcuts') === 'Control+L Meta+L')
      ?.getAttribute('aria-pressed'),
    status: (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').trim(),
    marker: document.querySelector('[data-testid="arrangement-insert-marker"]')?.getAttribute('data-insert-marker') ?? null,
    groups: document.querySelectorAll('[data-group-id]').length,
    snap: document.querySelector('[data-testid="arrangement-snap-toggle"]')?.getAttribute('aria-pressed') ?? null,
    active: document.activeElement
      ? `${document.activeElement.tagName}#${document.activeElement.id}|${document.activeElement.getAttribute('role')}|${(document.activeElement.textContent ?? '').trim().slice(0, 40)}`
      : null,
  }));
const chord = (page, init, onActive = false) =>
  page.evaluate(
    ([init, onActive]) => {
      const e = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
      const target = onActive && document.activeElement ? document.activeElement : document.body;
      const notPrevented = target.dispatchEvent(e);
      return {
        notPrevented,
        ctrl: e.ctrlKey,
        alt: e.altKey,
        meta: e.metaKey,
        altGraph: e.getModifierState('AltGraph'),
      };
    },
    [init, onActive],
  );
const AG = { ctrlKey: true, altKey: true, modifierAltGraph: true };
const settle = (page, ms = 350) => page.waitForTimeout(ms);
const blur = (page) => page.evaluate(() => document.activeElement?.blur());
const step = async (page, r, name, fn) => {
  const before = await st(page);
  const ev = await fn();
  await settle(page);
  const after = await st(page);
  r[name] = { ev, before: { clips: before.clips, status: before.status, marker: before.marker, loop: before.loop }, after };
  return r[name];
};
const ready = async (page) => {
  await page.waitForFunction(() => (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').includes('Demo collection ready'), undefined, { timeout: 90000 });
  await page.waitForTimeout(1000);
};

for (const [w, h] of [
  [1440, 900],
  [1280, 720],
]) {
  const r = (out[`${w}x${h}`] = {});
  const errors = [];
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle', timeout: 120000 });
  await ready(page);
  r.authUser = await page.evaluate(() => localStorage.getItem('auth_user'));

  // FOCUS-ALT (before any clip, the option is focused)
  await page.getByRole('option').first().focus();
  const f0 = await st(page);
  r.focusAlt = { start: f0.active, clips: f0.clips };
  for (const [key, code] of [
    ['ż', 'KeyZ'],
    ['ę', 'KeyE'],
    ['ł', 'KeyL'],
  ]) {
    const ev = await chord(page, { key, code, ...AG }, true);
    await settle(page);
    const s = await st(page);
    r.focusAlt[code] = { ev, active: s.active, same: s.active === f0.active, clips: s.clips, status: s.status };
  }
  save();

  // add a clip from the focused option
  await page.getByRole('option').first().focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
  await blur(page);
  r.start = await st(page);

  // ALTGR-UNDO
  await step(page, r, 'altGrZ', () => chord(page, { key: 'ż', code: 'KeyZ', ...AG }));
  await step(page, r, 'altGrShiftZ', () => chord(page, { key: 'Ż', code: 'KeyZ', shiftKey: true, ...AG }));
  await step(page, r, 'altGrY', () => chord(page, { key: 'y', code: 'KeyY', ...AG }));
  // CTRLALT-REAL / META-ALT-REAL (Z)
  await step(page, r, 'ctrlAltZReal', () => page.keyboard.press('Control+Alt+KeyZ'));
  await step(page, r, 'metaAltZReal', () => page.keyboard.press('Meta+Alt+KeyZ'));
  save();

  // POS-CTRL 1-2
  await step(page, r, 'pos1CtrlZ', () => page.keyboard.press('Control+KeyZ'));
  await step(page, r, 'pos2CtrlShiftZ', () => page.keyboard.press('Control+Shift+KeyZ'));

  // ALTGR-EDIT: click inside the clip 300 px from its left edge
  const box = await page.locator('[data-clip-id]').first().boundingBox();
  r.clipBox = box;
  await page.mouse.click(box.x + 300, box.y + box.height / 2);
  await settle(page);
  await blur(page);
  r.beforeEdit = await st(page);
  await step(page, r, 'altGrE', () => chord(page, { key: 'ę', code: 'KeyE', ...AG }));
  await step(page, r, 'altGrL', () => chord(page, { key: 'ł', code: 'KeyL', ...AG }));
  await step(page, r, 'altGrShiftL', () => chord(page, { key: 'Ł', code: 'KeyL', shiftKey: true, ...AG }));
  await step(page, r, 'altGrA', () => chord(page, { key: 'ą', code: 'KeyA', ...AG }));
  await step(page, r, 'altGrD', () => chord(page, { key: 'd', code: 'KeyD', ...AG }));
  await step(page, r, 'altGrC', () => chord(page, { key: 'ć', code: 'KeyC', ...AG }));
  await step(page, r, 'altGrX', () => chord(page, { key: 'ź', code: 'KeyX', ...AG }));
  await step(page, r, 'altGrV', () => chord(page, { key: 'v', code: 'KeyV', ...AG }));
  await step(page, r, 'altGrG', () => chord(page, { key: 'g', code: 'KeyG', ...AG }));
  await step(page, r, 'ctrlAltEReal', () => page.keyboard.press('Control+Alt+KeyE'));
  await step(page, r, 'metaAltEReal', () => page.keyboard.press('Meta+Alt+KeyE'));
  await step(page, r, 'ctrlAltDReal', () => page.keyboard.press('Control+Alt+KeyD'));
  save();

  // STOP repro: real held pointer gesture on the clip, then Arrow chords
  {
    const g = (r.gesture = {});
    const b2 = await page.locator('[data-clip-id]').first().boundingBox();
    await page.mouse.click(b2.x + 300, b2.y + b2.height / 2);
    await settle(page);
    g.start = await st(page);
    await page.mouse.move(b2.x + 120, b2.y + b2.height / 2);
    await page.mouse.down();
    await page.mouse.move(b2.x + 124, b2.y + b2.height / 2, { steps: 2 });
    await page.mouse.move(b2.x + 130, b2.y + b2.height / 2, { steps: 2 });
    await settle(page, 200);
    g.held = await st(page);
    for (const [name, fn] of [
      ['plainCtrlArrowReal', () => page.keyboard.press('Control+ArrowRight')],
      ['ctrlAltGraphNoAltArrow', () => chord(page, { key: 'ArrowRight', code: 'ArrowRight', ctrlKey: true, modifierAltGraph: true })],
      ['ctrlAltArrowReal', () => page.keyboard.press('Control+Alt+ArrowRight')],
      ['altGrArrowDispatched', () => chord(page, { key: 'ArrowRight', code: 'ArrowRight', ...AG })],
      ['metaAltArrowReal', () => page.keyboard.press('Meta+Alt+ArrowRight')],
      ['altGrEDispatched', () => chord(page, { key: 'ę', code: 'KeyE', ...AG })],
      ['plainCtrlEReal', () => page.keyboard.press('Control+KeyE')],
    ]) {
      const before = await st(page);
      const ev = await fn();
      await settle(page, 250);
      const after = await st(page);
      g[name] = { ev, markerBefore: before.marker, markerAfter: after.marker, statusBefore: before.status, statusAfter: after.status, clips: after.clips };
    }
    await page.mouse.up();
    await settle(page);
    g.afterRelease = await st(page);
    // control outside a gesture: Ctrl+AltGraph(no altKey)+ArrowRight (pre-existing HEAD path)
    const b3 = await page.locator('[data-clip-id]').first().boundingBox();
    await page.mouse.click(b3.x + 300, b3.y + b3.height / 2);
    await settle(page);
    await blur(page);
    const before = await st(page);
    const ev = await chord(page, { key: 'ArrowRight', code: 'ArrowRight', ctrlKey: true, modifierAltGraph: true });
    await settle(page);
    const after = await st(page);
    g.noGestureCtrlAltGraphArrow = { ev, markerBefore: before.marker, markerAfter: after.marker };
    // undo any clip move so the POS rows start from one clip at its place
    save();
  }

  // POS-CTRL 3-5
  {
    const b4 = await page.locator('[data-clip-id]').first().boundingBox();
    await page.mouse.click(b4.x + 300, b4.y + b4.height / 2);
    await settle(page);
    await blur(page);
    r.beforePos3 = await st(page);
    await step(page, r, 'pos3CtrlE', () => page.keyboard.press('Control+KeyE'));
    // Ctrl+L with no range: click empty area? the task says "with no range"; no range was set
    await step(page, r, 'pos4CtrlL', () => page.keyboard.press('Control+KeyL'));
    await step(page, r, 'pos5CtrlAltO1', () => page.keyboard.press('Control+Alt+KeyO'));
    await step(page, r, 'pos5CtrlAltO2', () => page.keyboard.press('Control+Alt+KeyO'));
  }
  await page.screenshot({ path: `${outDir}/${tag}-${w}x${h}.png` });

  // Platform probe: what does real AltGraph input look like in this Chromium (Linux)?
  {
    const p = (r.platformProbe = {});
    await page.evaluate(() => {
      window.__keys = [];
      window.addEventListener(
        'keydown',
        (e) => window.__keys.push({ key: e.key, code: e.code, ctrl: e.ctrlKey, alt: e.altKey, meta: e.metaKey, altGraph: e.getModifierState('AltGraph') }),
        true,
      );
    });
    try {
      await page.keyboard.down('AltGraph');
      await page.keyboard.press('KeyQ');
      await page.keyboard.up('AltGraph');
      p.altGraphDown = 'ok';
    } catch (e) {
      p.altGraphDown = String(e).slice(0, 200);
    }
    try {
      await page.keyboard.down('Control');
      await page.keyboard.down('AltGraph');
      await page.keyboard.press('KeyQ');
      await page.keyboard.up('AltGraph');
      await page.keyboard.up('Control');
      p.ctrlAltGraphDown = 'ok';
    } catch (e) {
      p.ctrlAltGraphDown = String(e).slice(0, 200);
    }
    p.events = await page.evaluate(() => window.__keys);
    p.navigator = await page.evaluate(() => ({ platform: navigator.platform, ua: navigator.userAgent }));
  }
  r.errors = errors;
  save();
  await ctx.close();
}

// G267-AUTH
{
  const a = (out.auth = {});
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle', timeout: 120000 });
  await ready(page);
  a.lab = {
    url: page.url(),
    lanes: await page.locator('[data-track-id]').count(),
    demoNotice: await page.getByText('Synthetic demo stems — not CZABA catalogue audio.', { exact: true }).count(),
    authUser: await page.evaluate(() => localStorage.getItem('auth_user')),
    cookies: (await ctx.cookies()).map((c) => c.name),
  };
  await page.screenshot({ path: `${outDir}/${tag}-auth-lab-1440x900.png` });
  const p2 = await ctx.newPage();
  const reqs = [];
  p2.on('request', (q) => {
    if (/\.(wav|mp3)(\?|$)|studio-token/.test(q.url())) reqs.push(q.url());
  });
  await p2.goto(`${base}/studio/middle-east`, { waitUntil: 'networkidle', timeout: 120000 }).catch((e) => {
    a.productGotoError = String(e).slice(0, 200);
  });
  await p2.waitForTimeout(1500);
  a.product = {
    url: p2.url(),
    signInRequired: await p2.getByText('Sign in required', { exact: false }).count(),
    audioSrc: await p2.locator('audio[src]').count(),
    audioRequests: reqs,
    authUser: await p2.evaluate(() => localStorage.getItem('auth_user')),
  };
  await p2.screenshot({ path: `${outDir}/${tag}-auth-product-1440x900.png` });
  await ctx.close();
  const api = await browser.newContext();
  const u = `${base}/api/studio-token?product=middle-east&file=stem-1.wav`;
  const x = await api.request.get(u, { failOnStatusCode: false });
  const y = await api.request.get(u, { headers: { Authorization: 'Bearer fake.token.value' }, failOnStatusCode: false });
  const xt = await x.text();
  const yt = await y.text();
  a.api = {
    noHeader: { status: x.status(), body: xt.slice(0, 160), tokenLike: /"token"\s*:\s*"[^"]+"/.test(xt) },
    fakeBearer: { status: y.status(), body: yt.slice(0, 160), tokenLike: /"token"\s*:\s*"[^"]+"/.test(yt) },
  };
  await api.close();
}
out.finishedUtc = new Date().toISOString();
save();
await browser.close();
console.log('done');

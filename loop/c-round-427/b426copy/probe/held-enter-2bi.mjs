// SYS-2 stage 2b-i browser probe. Usage: BASE=http://127.0.0.1:5173 OUT=<abs dir> node held-enter-2bi.mjs [rows] [1440x900,1280x720]
// Each cell: fresh context, a recipe, focus the target, one fresh Enter keydown (state A), three more Enter keydowns
// (Playwright sends them with repeat=true) on whatever holds focus, Enter keyup, state B. PASS on the sketch = firstActed and B equals A.
import { open } from '../../c-round-382/lib.mjs';
import fs from 'fs';
const base = process.env.BASE ?? 'http://127.0.0.1:5173';
const OUT = process.env.OUT; if (!OUT) throw new Error('OUT required');
const ALL = 'SNAP,ENV,LFOLDC,LFOLDER,LDISMISS,DTOGGLE,VEXPAND,VCLOSE,VRETURN';
const only = (process.argv[2] ?? ALL).split(',');
const vps = (process.argv[3] ?? '1440x900,1280x720').split(',').map((s) => s.split('x').map(Number));
const state = (p) => p.evaluate(() => {
  const all = (s, a) => [...document.querySelectorAll(s)].map((e) => e.getAttribute(a)).join(',');
  const tree = document.querySelector('[data-testid="arrangement-library-tree"]');
  return {
    pressed: all('button[aria-pressed]', 'aria-pressed'),
    libExpanded: tree ? [...tree.querySelectorAll('button[aria-expanded]')].map((e) => e.getAttribute('aria-expanded')).join(',') : null,
    libCurrent: tree ? [...tree.querySelectorAll('button')].map((e) => e.getAttribute('aria-current') ?? '-').join(',') : null,
    notice: !!document.querySelector('[data-testid="arrangement-library-notice"]'),
    detail: document.querySelector('[data-testid="arrangement-detail-toggle"]')?.getAttribute('aria-expanded') ?? null,
    videoExpand: document.querySelector('[data-testid="arrangement-video-expand"]')?.getAttribute('aria-label') ?? null,
    videoClose: !!document.querySelector('[data-testid="arrangement-video-close"]'),
    videoPlaceholder: !!document.querySelector('[data-testid="arrangement-video-placeholder-return"]'),
    status: document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? null,
    clips: document.querySelectorAll('[data-clip-id]').length,
  };
});
const focused = (p) => p.evaluate(() => ({ tag: document.activeElement?.tagName, type: document.activeElement?.getAttribute('type'), testid: document.activeElement?.getAttribute('data-testid'), label: document.activeElement?.getAttribute('aria-label'), text: document.activeElement?.textContent?.trim().slice(0, 30), focusVisible: document.activeElement?.matches(':focus-visible') ?? false, outline: document.activeElement ? getComputedStyle(document.activeElement).outlineStyle : null }));
const tree = (p) => p.getByTestId('arrangement-library-tree');
const floatVideo = async (p) => { await p.getByTestId('arrangement-video-expand').click(); await p.waitForTimeout(400); };
const recipes = {
  SNAP: async (p) => ({ target: p.getByTestId('arrangement-snap-toggle') }),
  ENV: async (p) => ({ target: p.getByTestId('arrangement-envelope-toggle') }),
  LFOLDC: async (p) => ({ target: tree(p).locator('button[aria-expanded]').first() }),
  LFOLDER: async (p) => ({ target: tree(p).getByTestId('arrangement-library-folder').first() }),
  LDISMISS: async (p) => ({ target: p.getByTestId('arrangement-library-notice-dismiss') }),
  DTOGGLE: async (p) => ({ target: p.getByTestId('arrangement-detail-toggle') }),
  VEXPAND: async (p) => ({ target: p.getByTestId('arrangement-video-expand') }),
  VCLOSE: async (p) => { await floatVideo(p); return { target: p.getByTestId('arrangement-video-close') }; },
  VRETURN: async (p) => { await floatVideo(p); return { target: p.getByTestId('arrangement-video-placeholder-return') }; },
};
fs.mkdirSync(OUT, { recursive: true });
for (const [w, h] of vps) for (const row of only) {
  const r = { row, vp: `${w}x${h}` }; const o = await open(base, w, h); const p = o.page; const errors = [];
  p.on('pageerror', (e) => errors.push(String(e)));
  try {
    const { target } = await recipes[row](p);
    await target.waitFor({ timeout: 15000 });
    r.before = await state(p); await target.focus(); await p.waitForTimeout(150);
    await p.keyboard.down('Enter'); await p.waitForTimeout(300); r.A = await state(p);
    r.focusedAfterFirst = await focused(p);
    for (let i = 0; i < 3; i++) { await p.keyboard.down('Enter'); await p.waitForTimeout(150); }
    await p.keyboard.up('Enter'); await p.waitForTimeout(500); r.B = await state(p);
    r.focusedAfterHeld = await focused(p);
    r.firstActed = JSON.stringify(r.A) !== JSON.stringify(r.before);
    r.heldChanged = Object.keys(r.A).filter((k) => JSON.stringify(r.A[k]) !== JSON.stringify(r.B[k]));
    await p.screenshot({ path: `${OUT}/${row}-${w}.png` });
  } catch (e) { r.error = String(e).slice(0, 300); }
  r.pageErrors = errors; await o.browser.close();
  fs.writeFileSync(`${OUT}/${row}-${w}x${h}.json`, JSON.stringify(r, null, 1));
  console.log(row, `${w}x${h}`, r.error ?? `firstActed=${r.firstActed} heldChanged=[${r.heldChanged}] focus=${r.focusedAfterHeld.testid ?? r.focusedAfterHeld.tag}`);
}

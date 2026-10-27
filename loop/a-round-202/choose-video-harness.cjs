const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('node:fs');
const base = 'http://127.0.0.1:5173';

async function mount(page, busy) {
  await page.goto(`${base}/`, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(1200);
  const src = await (await fetch(`${base}/app/components/recordings/SfxVideoSync.tsx`)).text();
  const reactUrl = src.match(/"(\/node_modules\/\.vite\/deps\/react\.js\?v=[^"]+)"/)[1];
  const domUrl = reactUrl.replace('react.js', 'react-dom_client.js');
  await page.evaluate(
    async ({ reactUrl, domUrl, busy }) => {
      const React = (await import(reactUrl)).default;
      const { createRoot } = (await import(domUrl)).default;
      const { SfxVideoSync } = await import('/app/components/recordings/SfxVideoSync.tsx');
      const host = document.createElement('div');
      host.id = 'harness';
      host.style.cssText =
        'position:fixed;inset:0;z-index:2147483647;overflow:auto;padding:24px;background:var(--color-background)';
      document.body.appendChild(host);
      window.__chosen = [];
      createRoot(host).render(
        React.createElement(
          'div',
          null,
          React.createElement('button', { id: 'prev', type: 'button' }, 'prev'),
          React.createElement(
            'div',
            { id: 'reflabel', style: { marginBottom: '16px' } },
          ),
          React.createElement(SfxVideoSync, {
            url: '',
            position: 0,
            busy,
            onChoose: (file) => window.__chosen.push(file.name),
            onUpdate: () => {},
            onSeek: () => {},
            onBuffering: () => {},
            onError: () => {},
          }),
        ),
      );
      await new Promise((r) => setTimeout(r, 500));
    },
    { reactUrl, domUrl, busy },
  );
}

async function focusChoose(page) {
  await page.focus('#prev');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(400);
}

(async () => {
  const browser = await chromium.launch();
  const out = {};
  for (const [w, h] of [[1280, 720], [1440, 900]]) {
    const r = {};
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await mount(page, false);
    await focusChoose(page);
    r.focused = await page.evaluate(() => {
      const el = document.activeElement;
      const cs = getComputedStyle(el);
      const b = el.getBoundingClientRect();
      return {
        tag: el.tagName,
        text: el.textContent.trim(),
        outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor} offset ${cs.outlineOffset}`,
        boxShadow: cs.boxShadow,
        focusSource: document.documentElement.dataset.focusSource ?? null,
        rect: { x: b.x, y: b.y, w: b.width, h: b.height },
      };
    });
    const rr = r.focused.rect;
    await page.screenshot({
      path: `${__dirname}/choose-video-focus-${w}.png`,
      clip: { x: rr.x - 12, y: rr.y - 12, width: rr.w + 24, height: rr.h + 24 },
    });
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    r.nextTabStop = await page.evaluate(() => {
      const el = document.activeElement;
      return { tag: el.tagName, type: el.getAttribute('type'), name: el.getAttribute('aria-label') || el.textContent.trim().slice(0, 30), display: getComputedStyle(el).display };
    });
    await page.keyboard.press('Shift+Tab');
    await page.waitForTimeout(200);
    r.shiftTabBack = await page.evaluate(() => document.activeElement.textContent.trim());
    r.refLabelBox = await page.evaluate(() => {
      const button = [...document.querySelectorAll('#harness button')].find((b) => b.textContent.trim() === 'Choose video');
      const label = document.createElement('label');
      label.className = button.className;
      label.innerHTML = 'Choose video<input type="file" class="absolute inset-0 cursor-pointer opacity-0">';
      button.parentElement.insertBefore(label, button);
      const lb = label.getBoundingClientRect();
      label.remove();
      const bb = button.getBoundingClientRect();
      return { label: { w: lb.width, h: lb.height }, button: { w: bb.width, h: bb.height }, dw: bb.width - lb.width, dh: bb.height - lb.height };
    });
    await page.close();
    for (const [name, key] of [['Enter', 'Enter'], ['Space', ' '], ['mouse', null]]) {
      const p = await browser.newPage({ viewport: { width: w, height: h } });
      await mount(p, false);
      await focusChoose(p);
      const act = key ? () => p.keyboard.press(key) : () => p.getByRole('button', { name: 'Choose video' }).click();
      const [fc] = await Promise.all([p.waitForEvent('filechooser', { timeout: 3000 }).catch(() => null), act()]);
      r[name] = fc ? 'filechooser' : 'none';
      if (fc && name === 'mouse') {
        await fc.setFiles({ name: 'Scene.mp4', mimeType: 'video/mp4', buffer: Buffer.from('x') });
        await p.waitForTimeout(300);
        r.chosenAfterSetFiles = await p.evaluate(() => window.__chosen);
      }
      await p.close();
    }
    {
      const p = await browser.newPage({ viewport: { width: w, height: h } });
      await mount(p, true);
      const btn = p.getByRole('button', { name: 'Choose video' });
      r.busyDisabled = await btn.evaluate((b) => b.matches(':disabled'));
      const [fc] = await Promise.all([
        p.waitForEvent('filechooser', { timeout: 2000 }).catch(() => null),
        btn.click({ force: true }).catch(() => {}),
      ]);
      r.busyMouse = fc ? 'filechooser' : 'none';
      await p.close();
    }
    out[`${w}x${h}`] = r;
  }
  await browser.close();
  fs.writeFileSync(`${__dirname}/choose-video-harness.json`, JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1));
})();

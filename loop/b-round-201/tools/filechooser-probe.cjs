const { chromium } = require(process.argv[2] + '/node_modules/@playwright/test');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const html=`<style>body{background:#0b0a09;color:#ece6da} :focus-visible{outline:1.5px solid rgb(201 164 106 / .8);outline-offset:2px}</style>
  <button id=prev>prev</button><button id=choose type=button style="padding:8px 16px;border:1px solid #444;border-radius:8px;background:none;color:inherit">Choose video</button>
  <input id=f aria-label="Choose local video" type=file accept="video/*" tabindex=-1 style="display:none">
  <script>choose.onclick=()=>f.click()</script>`; await p.route('http://probe.local/', r => r.fulfill({contentType:'text/html', body: html})); await p.goto('http://probe.local/');
  const out = {};
  await p.focus('#prev'); await p.keyboard.press('Tab');
  out.tabTarget = await p.evaluate(() => document.activeElement.id);
  out.outline = await p.evaluate(() => { const s = getComputedStyle(document.activeElement); return s.outlineStyle + ' ' + s.outlineWidth + ' ' + s.outlineColor; });
  await p.screenshot({ path: 'out/filechooser-focus.png', clip: { x: 0, y: 0, width: 300, height: 60 } });
  for (const [name, act] of [['Enter', () => p.keyboard.press('Enter')], ['Space', () => p.keyboard.press(' ')], ['mouse', () => p.click('#choose')]]) {
    await p.reload(); await p.focus('#prev'); await p.keyboard.press('Tab');
    const [fc] = await Promise.all([p.waitForEvent('filechooser', { timeout: 3000 }).catch(() => null), act()]);
    out[name] = fc ? 'filechooser' : 'none';
  }
  out.tabStops = await p.evaluate(() => [...document.querySelectorAll('button,input')].filter(e => e.tabIndex >= 0 && getComputedStyle(e).display !== 'none').map(e => e.id));
  console.log(JSON.stringify(out)); await b.close();
})();

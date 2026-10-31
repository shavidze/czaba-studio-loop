const { chromium } = require('@playwright/test');
(async () => {
  const dir = process.argv[2];
  const b = await chromium.launch();
  const out = {};
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    const reqs = [];
    let phase = 'load';
    p.on('request', (r) => { if (/\/api\/(cart|auth|orders)/.test(r.url())) reqs.push(`${phase} ${r.method()} ${r.url()}`); });
    await p.goto('http://127.0.0.1:5173/products/priceless-pack', { waitUntil: 'load' });
    await p.getByText('Total Price').waitFor(); await p.waitForTimeout(1500);
    const panel = p.getByText('Total Price').locator('xpath=../../..');
    const add = p.getByRole('button', { name: 'Add to Cart' });
    const buy = p.getByRole('button', { name: 'Buy Now' });
    const r = { panelText: (await panel.innerText()).replace(/\s+/g, ' ') };
    r.panelHasDollar = r.panelText.includes('$');
    phase = 'after-activation';
    for (const [n, el] of [['add', add], ['buy', buy]]) {
      r[n] = {
        aria: await el.getAttribute('aria-disabled'),
        disabledAttr: await el.getAttribute('disabled'),
        opacity: await el.evaluate((e) => getComputedStyle(e).opacity),
        cursor: await el.evaluate((e) => getComputedStyle(e).cursor),
        describedText: await el.evaluate((e) => document.getElementById(e.getAttribute('aria-describedby') || '')?.textContent),
      };
      const box = await el.boundingBox();
      await p.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await el.focus(); await p.keyboard.press('Enter'); await p.keyboard.press('Space');
    }
    await p.waitForTimeout(500);
    r.dialogs = await p.getByRole('dialog').count();
    r.apiRequests = reqs;
    r.complimentary = await p.getByText('Complimentary Download').count();
    await p.screenshot({ path: `${dir}/a-priceless-${w}.png` });
    await p.getByRole('link', { name: 'contact us' }).click();
    await p.waitForURL('**/support', { timeout: 10000 }).catch(() => {});
    r.afterLink = new URL(p.url()).pathname;
    out[`${w}x${h}`] = r;
    await p.close();
  }
  console.log(JSON.stringify(out, null, 2));
  await b.close();
})();

import { chromium } from '/home/runner/czaba-project/store/node_modules/@playwright/test/index.mjs';
const base = process.argv[2]; const inject = process.argv[3] === 'inject';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const logs = []; p.on('console', (m) => logs.push(m.type() + ': ' + m.text().slice(0, 160)));
await p.addInitScript((inj) => {
  window.__r1 = { overlaySeen: false, styleReplaced: false };
  const mo = new MutationObserver(() => {
    const s = document.getElementById('czaba-entrance-cover');
    if (s && !s.__tagged && !window.__r1.first) { s.__tagged = true; window.__r1.first = s; }
    if (s && window.__r1.first && s !== window.__r1.first) window.__r1.styleReplaced = true;
    if (document.querySelector('[data-testid="entrance-loader"]')) window.__r1.overlaySeen = true;
    if (inj && document.body && !document.getElementById('ext-injected')) {
      const d = document.createElement('div'); d.id = 'ext-injected'; d.textContent = 'ext';
      document.body.insertBefore(d, document.body.firstChild);
    }
  });
  mo.observe(document, { childList: true, subtree: true, attributes: true });
}, inject);
await p.goto(base + '/', { waitUntil: 'commit' });
await p.waitForTimeout(2500);
const r = await p.evaluate(() => {
  const s = document.getElementById('czaba-entrance-cover');
  return { overlaySeen: window.__r1.overlaySeen, styleReplaced: window.__r1.styleReplaced,
    firstState: window.__r1.first && window.__r1.first.getAttribute('data-state'), firstStart: window.__r1.first && window.__r1.first.getAttribute('data-start'),
    curMedia: s && s.media, curState: s && s.getAttribute('data-state'), seen: sessionStorage.getItem('czaba_entrance_seen'), injectedPresent: !!document.getElementById('ext-injected') };
});
console.log(JSON.stringify({ inject, ...r, hydrationLogs: logs.filter((l) => /hydrat|did not match|Minified React error/i.test(l)).slice(0, 3) }));
await b.close();

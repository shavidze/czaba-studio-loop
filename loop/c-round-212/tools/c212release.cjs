// C round 212 — RELEASE-212 (C-R211-01): MutationObserver (attributeOldValue) on the Clip Gain block + field value setter on release; root commits after pointerup.
// usage: node c212release.cjs <baseUrl> <tag> <vw> <vh>
const L = require('./c212lib.cjs');
const [base, tag, vw, vh] = [process.argv[2], process.argv[3], Number(process.argv[4] || 1440), Number(process.argv[5] || 900)];
async function arm(page) {
  await page.evaluate(() => {
    const blk = document.querySelector('[data-testid=arrangement-detail-clip-gain]');
    const f = document.querySelector('[data-testid=arrangement-detail-clip-gain-input]');
    const st = { recs: [], frames: [] };
    window.__tr = st;
    new MutationObserver((ms) => {
      for (const m of ms) {
        const added = [...m.addedNodes].map((n) => (n.getAttribute ? n.getAttribute('data-testid') || n.tagName : '#text'));
        const removed = [...m.removedNodes].map((n) => (n.getAttribute ? n.getAttribute('data-testid') || n.tagName : '#text'));
        st.recs.push({ t: performance.now(), type: m.type, attr: m.attributeName, tid: m.target.getAttribute ? m.target.getAttribute('data-testid') : null, old: m.oldValue, now: m.attributeName && m.target.getAttribute ? m.target.getAttribute(m.attributeName) : null, added, removed });
      }
    }).observe(blk, { attributes: true, attributeOldValue: true, childList: true, subtree: true, characterData: true, characterDataOldValue: true });
    const vd = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    Object.defineProperty(f, 'value', { configurable: true, get() { return vd.get.call(this); }, set(v) { st.recs.push({ t: performance.now(), prop: 'value', old: vd.get.call(this), now: v, pend: this.getAttribute('data-pending') }); vd.set.call(this, v); } });
    addEventListener('pointerup', () => {
      st.up = performance.now();
      st.commitsBeforeUp = window.__c.commits.length;
      let n = 0;
      const tick = () => { st.frames.push({ t: performance.now(), v: vd.get.call(f), p: f.getAttribute('data-pending'), title: f.getAttribute('title'), marker: !!document.querySelector('[data-testid=arrangement-detail-clip-gain-pending]') }); if (++n < 10) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }, { once: true, capture: true });
  });
}
async function dragOnce(page, dx) {
  const fd = L.sl(page, 'Clip Gain — fader');
  const bx = await fd.boundingBox();
  const y = bx.y + bx.height / 2;
  const before = await fd.inputValue();
  await arm(page);
  await page.mouse.move(bx.x + bx.width / 2, y);
  await page.mouse.down();
  await page.mouse.move(bx.x + bx.width / 2 + dx, y, { steps: 8 });
  await page.mouse.up();
  await L.quiet(page);
  await L.sleep(300);
  const s = await page.evaluate(() => { const st = window.__tr; const c = window.__c.commits; return { ...st, releaseCommits: c.slice(st.commitsBeforeUp).filter((x) => x.t >= st.up).map((x) => x.n) }; });
  const f = page.getByTestId('arrangement-detail-clip-gain-input');
  const after = { fader: await fd.inputValue(), vt: await fd.getAttribute('aria-valuetext'), field: await f.inputValue(), pending: await f.getAttribute('data-pending'), range: await page.evaluate(() => { const r = document.querySelector('[data-testid=arrangement-detail-clip-gain-range]'); return r ? r.textContent : null; }), undo: await L.undoTitle(page) };
  const recsAfterUp = s.recs.filter((r) => r.t >= s.up);
  const bad = recsAfterUp.filter((r) => (r.attr === 'data-pending' && r.now === 'true') || (r.attr === 'title' && r.now && /Unsaved/.test(r.now)) || (r.added || []).some((a) => /pending/.test(a)) || (r.prop === 'value' && r.pend === 'true'));
  return { before, after, recsBeforeUp: s.recs.filter((r) => r.t < s.up).length, recsAfterUp: recsAfterUp.map((r) => (r.prop ? `value:${r.old}->${r.now}(pend=${r.pend})` : r.type === 'attributes' ? `${r.tid || '?'}@${r.attr}:${r.old}->${r.now}` : `${r.type}:${r.tid}+[${r.added}]-[${r.removed}]`)), staleOrPendingRecords: bad.length, releaseCommits: s.releaseCommits.length, releaseCommitSizes: s.releaseCommits, frames: [...new Set(s.frames.map((x) => `${x.v}|${x.p}|${x.title}|${x.marker}`))] };
}
(async () => {
  const b = await L.launch();
  const R = { base, tag, vw, utc: new Date().toISOString() };
  try {
    { const { ctx, page } = await L.openLab(b, base, vw, vh); await L.selectFirstClip(page); R.typed = await L.typeClipGain(page, -12); R.single = await dragOnce(page, 10); R.singleRight = await dragOnce(page, -25); await ctx.close(); }
    { const { ctx, page } = await L.openLab(b, base, vw, vh); await L.selectFirstClip(page); R.singleFrom0 = await dragOnce(page, 10); await ctx.close(); }
    { const { ctx, page } = await L.openLab(b, base, vw, vh); R.membersSel = await L.addMembers(page, [-6, 1]); R.members = await dragOnce(page, 10); await ctx.close(); }
  } catch (e) { R.fatal = String((e && e.stack) || e).slice(0, 1500); }
  await b.close();
  L.save(`release-${tag}-${vw}.json`, R);
  const sm = (x) => x && { recsAfterUp: x.recsAfterUp, bad: x.staleOrPendingRecords, commits: x.releaseCommits, frames: x.frames, after: x.after };
  console.log(tag, vw, R.fatal || '', JSON.stringify({ single: sm(R.single), singleRight: sm(R.singleRight), singleFrom0: sm(R.singleFrom0), members: sm(R.members) }, null, 1));
})();

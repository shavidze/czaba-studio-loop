// C round 129: S0/S1/S2 boxes + Export dialog copy. node layout129.cjs <1440|1280> <tag>
const W = +process.argv[2] || 1440; process.env.VPW = String(W);
const TAG = process.argv[3] || 'r1';
const C = require('./c127lib.cjs'); const { X, L, sleep } = C;
const D6 = require('./d6fns.cjs');
const res = { vp: W, tag: TAG, startedUtc: new Date().toISOString(), rows: {} };
const net = [];
const out = (k, v) => { res.rows[k] = v; C.save(`layout129-${W}-${TAG}.json`, { ...res, net: X.netOk(net), sessions: net.map((n) => ({ label: n.label, errors: n.errors, hydration: n.hydration, forbidden: n.forbidden, authHeaders: n.authHeaders, noise: n.noise })) }); };
(async () => {
  const b = await L.launch();
  try {
    const { page: p } = await L.openStudio(b, X.VPS[W], `layout129-${W}-${TAG}`, net, { extraInit: C.obsInit });
    await p.mouse.move(2, 2); await sleep(300);
    out('S0', { header: await p.evaluate(D6.stateHeader), elements: await p.evaluate(D6.collect, '.studio-container') });
    await C.shot(p, `S0-${W}-${TAG}.png`);
    const s1Steps = await D6.buildS1(p);
    out('S1', { header: await p.evaluate(D6.stateHeader), elements: await p.evaluate(D6.collect, '.studio-container'), steps: s1Steps });
    await C.shot(p, `S1-${W}-${TAG}.png`);
    await C.openDlg(p);
    await p.mouse.move(2, 2); await sleep(400);
    const s2 = { header: await p.evaluate(D6.stateHeader), elements: await p.evaluate(D6.collect, 'body') };
    out('S2', { ...s2, dump: await C.dump(p) });
    await C.shot(p, `S2-${W}-${TAG}.png`);
    await p.keyboard.press('Escape'); await sleep(400);
  } catch (e) { res.error = String(e.stack || e); out('error', res.error); }
  out('end', new Date().toISOString());
  console.log(JSON.stringify({ err: res.error, rows: Object.keys(res.rows), net: X.netOk(net) }));
  await b.close();
})();

import { open } from '../../c-round-382/lib.mjs';
import fs from 'node:fs';
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const out = process.argv[3] ?? 'heap-out.json';
const { browser, page, cdp, live } = await open(base, 1440, 900);
const liveReady0 = await live();
await page.getByRole('button', { name: 'Preview', exact: true }).first().click();
await page.waitForFunction(() => window.__starts.length > 0, null, { timeout: 30000 }).catch(() => {});
await page.waitForTimeout(800);
const stopBtn = page.getByRole('button', { name: 'Stop', exact: true }).first();
const stopVisible = await stopBtn.isVisible().catch(() => false);
if (stopVisible) await stopBtn.click();
await page.waitForTimeout(3000);
const liveReady = { ready: liveReady0, afterStop: await live(), stopVisible, starts: await page.evaluate(() => window.__starts.map((s) => s.sec)) };
let chunks = [];
cdp.on('HeapProfiler.addHeapSnapshotChunk', (e) => chunks.push(e.chunk));
await cdp.send('HeapProfiler.takeHeapSnapshot', { reportProgress: false, captureNumericValue: false });
await browser.close();
const snap = JSON.parse(chunks.join('')); chunks = null;
const m = snap.snapshot.meta; const nf = m.node_fields; const ef = m.edge_fields;
const NF = nf.length, EF = ef.length;
const nT = nf.indexOf('type'), nN = nf.indexOf('name'), nId = nf.indexOf('id'), nSz = nf.indexOf('self_size'), nEc = nf.indexOf('edge_count');
const eT = ef.indexOf('type'), eN = ef.indexOf('name_or_index'), eTo = ef.indexOf('to_node');
const nodeTypes = m.node_types[0], edgeTypes = m.edge_types[0];
const { nodes, edges, strings } = snap; const N = nodes.length / NF;
const firstEdge = new Uint32Array(N + 1); for (let i = 0, e = 0; i < N; i++) { firstEdge[i] = e; e += nodes[i * NF + nEc] * EF; } firstEdge[N] = edges.length;
const prev = new Int32Array(N).fill(-1), prevEdge = new Int32Array(N).fill(-1); const seen = new Uint8Array(N); seen[0] = 1;
const q = [0];
for (let h = 0; h < q.length; h++) { const i = q[h]; for (let e = firstEdge[i]; e < firstEdge[i + 1]; e += EF) { const t = edgeTypes[edges[e + eT]]; if (t === 'weak') continue; const j = edges[e + eTo] / NF; if (seen[j]) continue; seen[j] = 1; prev[j] = i; prevEdge[j] = e; q.push(j); } }
const name = (i) => `${nodeTypes[nodes[i * NF + nT]]}:${strings[nodes[i * NF + nN]].slice(0, 80)}@${nodes[i * NF + nId]}`;
const edgeName = (e) => { const t = edgeTypes[edges[e + eT]]; const v = edges[e + eN]; return t === 'element' || t === 'hidden' ? `[${v}]` : `${t}:${strings[v]}`; };
const res = [];
for (let i = 0; i < N; i++) { const nm = strings[nodes[i * NF + nN]]; if (!/AudioBuffer/.test(nm) || /AudioBufferSource/.test(nm)) continue; const path = []; let j = i; while (j > 0 && prev[j] >= 0 && path.length < 40) { path.push(`${name(prev[j])} --${edgeName(prevEdge[j])}--> `); j = prev[j]; } res.push({ node: name(i), reachable: !!seen[i], path: path.reverse() }); }
fs.writeFileSync(out, JSON.stringify({ liveReady, audioBuffers: res }, null, 1));
console.log(JSON.stringify(liveReady), res.length);
// dump context vars and closure names along the retention path of non-cache buffers
const dump = [];
for (let i = 0; i < N; i++) {
  if (strings[nodes[i * NF + nN]] !== 'AudioBuffer' || nodeTypes[nodes[i * NF + nT]] !== 'native') continue;
  const chain = []; let j = i; while (j > 0 && prev[j] >= 0) { chain.push(prev[j]); j = prev[j]; }
  if (!chain.some((k) => strings[nodes[k * NF + nN]] === 'system / Context' && false) && !chain.map((k)=>name(k)).some((s)=>s.includes('baseQueue'))) {}
  const ctxs = chain.filter((k) => /Context$/.test(strings[nodes[k * NF + nN]]) || nodeTypes[nodes[k * NF + nT]] === 'closure');
  if (!chain.some((k) => { for (let e = firstEdge[k]; e < firstEdge[k + 1]; e += EF) if (edgeTypes[edges[e + eT]] === 'property' && strings[edges[e + eN]] === 'baseQueue' && edges[e + eTo] / NF === chain[chain.indexOf(k) - 1]) return true; return false; })) continue;
  for (const k of ctxs) { const vars = []; for (let e = firstEdge[k]; e < firstEdge[k + 1]; e += EF) { const t = edgeTypes[edges[e + eT]]; if (t === 'context' || (nodeTypes[nodes[k*NF+nT]]==='closure' && t==='internal')) vars.push(`${t}:${strings[edges[e + eN]] ?? edges[e+eN]}`); } dump.push({ node: name(k), vars }); }
}
fs.writeFileSync(out.replace('.json', '-ctx.json'), JSON.stringify(dump, null, 1));

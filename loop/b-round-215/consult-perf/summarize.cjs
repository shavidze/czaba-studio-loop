const fs = require('fs');
const MB = (b) => +(b / 1048576).toFixed(1);
const out = {};
for (const tag of ['export-n2-1x', 'export-n3-1x', 'export-n2-6x']) {
  const o = JSON.parse(fs.readFileSync(`${__dirname}/${tag}.json`));
  out[tag] = o.runs.map((r) => {
    const pid = r.newPids[0] ?? r.rendererPids[0];
    const ex = (e, base) => {
      const m = Object.fromEntries(e.marks.map((x) => [x.k, x.t]));
      return {
        wallMs: e.wallMs, inPageMs: Math.round(e.inPageMs), file: e.suggestedFilename, bytes: e.size, bits: e.hdr.bits, dataBytes: e.hdr.chunk36Size,
        renderMs: Math.round(m.renderDone - m.startRendering), sliceMs: Math.round(m.worker - m.renderDone), workerToBlobMs: Math.round(m.createObjectURL - m.worker),
        lt50: e.longtasksOver50, ltMax: Math.round(e.longtaskMax), ltAll: e.longtasks.map((l) => Math.round(l.d)),
        loafs: e.loafs.map((l) => `${Math.round(l.d)}/${Math.round(l.blocking)}`), loafTop: e.loafs.map((l) => l.scripts[0] && `${l.scripts[0].inv}:${l.scripts[0].d}`),
        backingPreMB: MB(e.cdpFirst?.backingStorageSize), backingMaxMB: MB(e.cdpMax.backingStorageSize), backingDeltaMB: MB(e.cdpMax.backingStorageSize - base.preGc.heap.backingStorageSize),
        usedMaxMB: MB(e.cdpMax.usedSize), cdpN: e.cdpSampleCount,
        rssBaseMB: +base.postGc.proc[pid].rss.toFixed(1), rssMaxMB: +e.procMax[pid].rssMax.toFixed(1), rssDeltaMB: +(e.procMax[pid].rssMax - base.postGc.proc[pid].rss).toFixed(1),
        anonDeltaMB: +(e.procMax[pid].anonMax - base.postGc.proc[pid].anon).toFixed(1), procN: e.procMax[pid].n,
      };
    };
    const st = (s) => ({ backingPreGcMB: MB(s.preGc.heap.backingStorageSize), backingPostGcMB: MB(s.postGc.heap.backingStorageSize), backingPostGcBytes: s.postGc.heap.backingStorageSize, usedPostGcMB: MB(s.postGc.heap.usedSize), embedderPostGcMB: MB(s.postGc.heap.embedderHeapUsedSize), jsHeapUsedPostGcMB: MB(s.postGc.perfMetrics.JSHeapUsedSize), domNodes: s.postGc.dom.nodes, rssPostGcMB: +s.postGc.proc[pid].rss.toFixed(1), anonPostGcMB: +s.postGc.proc[pid].anon.toFixed(1), perfMemoryUsed: s.postGc.performanceMemory.used });
    return {
      run: r.run, readyMs: Math.round(r.readyMs), pid, ends: r.projectEnds.map((p) => p.end).join(' '),
      beforeAdd: st(r.steps.beforeAdd), afterAdd: st(r.steps.afterAdd), after1Export2s: st(r.steps.after1Export2s), beforeExportN: st(r.steps.beforeExportN), afterNExport2s: st(r.steps.afterNExport2s),
      export1: ex(r.export1, r.steps.afterAdd), exportN: ex(r.exportN, r.steps.beforeExportN), timings: r.timings, pageErrors: r.pageErrors,
    };
  });
}
fs.writeFileSync(`${__dirname}/summary-export.json`, JSON.stringify(out, null, 1));
for (const [tag, runs] of Object.entries(out)) {
  console.log('==', tag);
  for (const r of runs) {
    console.log(r.run, 'ready', r.readyMs, 'ends', r.ends, 'errors', r.pageErrors, JSON.stringify(r.timings));
    console.log('  backing beforeAdd', r.beforeAdd.backingPostGcBytes, 'afterAdd', r.afterAdd.backingPostGcBytes, 'after1+2s', r.after1Export2s.backingPostGcMB, 'preGc', r.after1Export2s.backingPreGcMB, 'beforeN', r.beforeExportN.backingPostGcMB, 'afterN+2s', r.afterNExport2s.backingPostGcMB, '/', r.afterNExport2s.backingPreGcMB);
    console.log('  used/embedder/jsheap afterAdd', r.afterAdd.usedPostGcMB, r.afterAdd.embedderPostGcMB, r.afterAdd.jsHeapUsedPostGcMB, 'rss/anon', r.beforeAdd.rssPostGcMB, r.afterAdd.rssPostGcMB, r.afterAdd.anonPostGcMB, 'afterN+2s rss', r.afterNExport2s.rssPostGcMB, 'perf.memory', r.afterAdd.perfMemoryUsed, 'domNodes', r.afterAdd.domNodes);
    console.log('  ex1', JSON.stringify(r.export1));
    console.log('  exN', JSON.stringify(r.exportN));
  }
}

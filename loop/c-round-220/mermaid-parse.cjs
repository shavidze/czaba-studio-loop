const fs = require('fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const [lib, ...files] = process.argv.slice(2);
(async () => {
  const blocks = [];
  for (const f of files) {
    const lines = fs.readFileSync(f, 'utf8').split('\n');
    let sec = '', inB = false, start = 0, buf = [];
    lines.forEach((l, i) => {
      if (!inB && /^## /.test(l)) sec = l;
      if (!inB && l.trim() === '```mermaid') { inB = true; start = i + 1; buf = []; return; }
      if (inB && l.trim() === '```') { inB = false; blocks.push({ file: f.split('/').pop(), section: sec, line: start + 1, code: buf.join('\n') }); return; }
      if (inB) buf.push(l);
    });
  }
  const b = await chromium.launch(); const p = await b.newPage();
  await p.setContent('<html><body></body></html>'); await p.addScriptTag({ path: lib });
  const res = await p.evaluate(async (blocks) => { window.mermaid.initialize({ startOnLoad: false }); const out = []; for (const bl of blocks) { try { const r = await window.mermaid.parse(bl.code); out.push({ file: bl.file, section: bl.section, line: bl.line, ok: !!r, type: r && r.diagramType }); } catch (e) { out.push({ file: bl.file, section: bl.section, line: bl.line, ok: false, err: String(e.message || e).slice(0, 300) }); } } return out; }, blocks);
  await b.close(); console.log(JSON.stringify(res, null, 1));
})();

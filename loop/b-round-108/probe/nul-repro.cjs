const path = require('node:path');
const store = '/home/runner/czaba-project/store/node_modules/';
const React = require(store + 'react');
const { renderToPipeableStream } = require(store + 'react-dom/server');
const { PassThrough } = require('node:stream');
const cases = [['ka1500', 'ა'.repeat(1500)], ['ka700', 'ა'.repeat(700)], ['mixed', 'x'.repeat(2046) + 'ა' + 'y'.repeat(10)], ['ascii', 'a'.repeat(5000)]];
(async () => {
  const out = {};
  for (const [name, text] of cases) {
    const buf = await new Promise((res, rej) => {
      const chunks = [];
      const body = new PassThrough();
      body.on('data', (c) => chunks.push(c));
      body.on('end', () => res(Buffer.concat(chunks)));
      const { pipe } = renderToPipeableStream(React.createElement('div', { 'aria-label': text }, text), { onAllReady() { pipe(body); }, onError: rej });
    });
    let n = 0; for (const b of buf) if (b === 0) n++;
    const stripped = Buffer.from(buf.filter((b) => b !== 0)).toString('utf8');
    out[name] = { bytes: buf.length, nul: n, fffd: (buf.toString('utf8').match(/�/g) || []).length, strippedHasText: stripped.includes(text) };
  }
  console.log(JSON.stringify({ react: React.version, out }, null, 1));
})();

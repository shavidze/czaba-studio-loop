const store = '/home/runner/czaba-project/store/node_modules/';
const React = require(store + 'react');
const { renderToPipeableStream } = require(store + 'react-dom/server');
const { PassThrough } = require('node:stream');
const h = React.createElement;
const cases = {
  spans: () => h('div', null, Array.from({ length: 800 }, (_, i) => h('span', { key: i }, 'აბ'))),
  labels: () => h('div', null, Array.from({ length: 400 }, (_, i) => h('button', { key: i, 'aria-label': 'წაშლა ' + i }, 'ა'))),
  asciiSpans: () => h('div', null, Array.from({ length: 800 }, (_, i) => h('span', { key: i }, 'ab'))),
};
(async () => {
  const out = {};
  for (const [name, make] of Object.entries(cases)) {
    const buf = await new Promise((res, rej) => {
      const chunks = []; const body = new PassThrough();
      body.on('data', (c) => chunks.push(c)); body.on('end', () => res(Buffer.concat(chunks)));
      const { pipe } = renderToPipeableStream(make(), { onAllReady() { pipe(body); }, onError: rej });
    });
    const offs = []; for (let i = 0; i < buf.length; i++) if (buf[i] === 0) offs.push(i);
    out[name] = { bytes: buf.length, nul: offs.length, first: offs.slice(0, 6) };
  }
  console.log(JSON.stringify(out));
})();

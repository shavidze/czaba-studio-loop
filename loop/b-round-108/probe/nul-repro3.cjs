const store = '/home/runner/czaba-project/store/node_modules/';
const React = require(store + 'react');
const { renderToPipeableStream, renderToString } = require(store + 'react-dom/server');
const { PassThrough } = require('node:stream');
const h = React.createElement;
const make = () => h('div', null, Array.from({ length: 400 }, (_, i) => h('button', { key: i, 'aria-label': 'წაშლა ' + i }, 'ა')));
const chunks = []; const body = new PassThrough();
body.on('data', (c) => chunks.push(c));
body.on('end', () => {
  const buf = Buffer.concat(chunks);
  const stripped = Buffer.from(buf.filter((b) => b !== 0)).toString('utf8');
  const ref = renderToString(make());
  console.log(JSON.stringify({ nul: buf.filter((b) => b === 0).length, chunkCount: chunks.length, strippedEqualsRenderToString: stripped === ref, refLen: ref.length, strLen: stripped.length }));
});
const { pipe } = renderToPipeableStream(make(), { onAllReady() { pipe(body); } });

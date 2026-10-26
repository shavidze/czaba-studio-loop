const { File } = require('node-taglib-sharp');
const fs = require('fs');
const src = process.argv[2];
const cases = [[], [''], ['a', 'b'], ['ქართული'], ['0'], ['3']];
cases.forEach((vals, i) => {
  const p = `/tmp/b-r7/v-${i}.wav`;
  fs.copyFileSync(src, p);
  const f = File.createFromPath(p);
  f.tag.title = f.tag.title ?? '';
  const info = f.tag.tags.filter(t => t.constructor.name === 'InfoTag');
  let res;
  try { info[0].setValuesFromStrings('ITKN', vals); res = 'ok'; } catch (e) { res = 'THROW ' + e.message; }
  let saveRes;
  try { f.save(); saveRes = 'saved'; } catch (e) { saveRes = 'SAVE THROW ' + e.message; }
  f.dispose();
  console.log(JSON.stringify(vals), res, saveRes);
});

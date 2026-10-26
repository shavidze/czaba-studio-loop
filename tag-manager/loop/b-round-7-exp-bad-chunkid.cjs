const { File, CombinedTag, TagTypes } = require('node-taglib-sharp');
const fs = require('fs');
const src = process.argv[2];
for (const id of ['AB', 'abcd', 'ICAT5', 'ქართ', '', 'IC T']) {
  const p = `/tmp/b-r7/t-${Buffer.from(id).toString('hex') || 'empty'}.wav`;
  fs.copyFileSync(src, p);
  const f = File.createFromPath(p);
  f.tag.title = f.tag.title ?? '';
  const info = f.tag.tags.filter(t => t.tagTypes === TagTypes.RiffInfo || t.constructor.name === 'InfoTag');
  let res;
  try { info[0].setValuesFromStrings(id, ['x']); res = 'ok'; } catch (e) { res = 'THROW ' + e.message; }
  let saveRes;
  try { f.save(); saveRes = 'saved'; } catch (e) { saveRes = 'SAVE THROW ' + e.message; }
  f.dispose();
  console.log(JSON.stringify(id), res, saveRes);
}

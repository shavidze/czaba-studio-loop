import fs from 'node:fs';
const [,, file, m] = process.argv;
let s = fs.readFileSync(file, 'utf8');
const rep = (a, b) => { if (!s.includes(a)) throw new Error('miss ' + a); s = s.replace(a, b); };
const throwBlock = "      if (failedIds.length > 0) {\n        throw new Error(`RIFF INFO fields could not be written: ${failedIds.join(', ')}`);\n      }\n";
if (m === 'M1') {
  rep(throwBlock, '');
  rep('          failedIds.push(String(riffChunkId));\n', '          void failedIds;\n');
} else if (m === 'M2') {
  rep(throwBlock, '');
  rep('      const failedIds: string[] = [];\n', '');
  rep('    if (customFields.length > 0) {\n', '    const failedIds: string[] = [];\n    if (customFields.length > 0) {\n');
  rep('    file.save();\n  } finally', '    file.save();\n' + throwBlock.replace(/^  /gm, '') + '  } finally');
} else if (m === 'M3') {
  rep('          failedIds.push(String(riffChunkId));\n', '          failedIds.push(String(riffChunkId));\n          throw new Error(`RIFF INFO fields could not be written: ${failedIds.join(\', \')}`);\n');
} else if (m === 'M4') {
  rep('`RIFF INFO fields could not be written: ${', '`RIFF INFO fields could not be writen: ${');
} else if (m === 'M5') {
  rep('    const customFields: Array<{ riffChunkId: string; value: FieldValue }> = [];\n', "    const customFields: Array<{ riffChunkId: string; value: FieldValue }> = [];\n    const preBad = schema.filter((f) => f.riffChunkId !== undefined && f.riffChunkId !== '' && Buffer.byteLength(f.riffChunkId) !== 4).map((f) => String(f.riffChunkId));\n    if (preBad.length > 0) {\n      throw new Error(`RIFF INFO fields could not be written: ${preBad.join(', ')}`);\n    }\n");
} else throw new Error('unknown ' + m);
fs.writeFileSync(file, s);

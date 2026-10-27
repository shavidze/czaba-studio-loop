const { File } = require(process.argv[2]);
for (const p of process.argv.slice(3)) {
  try { const f = File.createFromPath(p); console.log(p, 'OPENED', f.tag.title); f.dispose(); }
  catch (e) { console.log(p, 'THROWS', e.code || '', String(e.message).slice(0,80)); }
}

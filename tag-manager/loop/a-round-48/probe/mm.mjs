import { createRequire } from "module";
const r = createRequire("/home/runner/czaba-project/czaba-tag-manager/package.json");
const mm = await import(r.resolve("music-metadata"));
const m = await mm.parseFile(process.argv[2]);
console.log(JSON.stringify(m.common.artists), JSON.stringify(Object.fromEntries(Object.entries(m.native).map(([k,v])=>[k, v.filter(x=>/TPE1|IART|ISTR/.test(x.id))]))));

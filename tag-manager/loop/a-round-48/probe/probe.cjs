const { createRequire } = require("module");
const r = createRequire("/home/runner/czaba-project/czaba-tag-manager/package.json");
const { File } = r("node-taglib-sharp");
const fs = require("fs"); const cp = require("child_process");
const f = process.argv[2];
cp.execFileSync("ffmpeg", ["-v","error","-y","-f","lavfi","-i","sine=d=0.1","-fflags","+bitexact",f]);
const t = File.createFromPath(f); t.tag.performers = ["A","B"]; t.save(); t.dispose();
const b = fs.readFileSync(f); let o = 12;
while (o + 8 <= b.length) { const id = b.toString("latin1", o, o+4), s = b.readUInt32LE(o+4); const p = b.subarray(o+8, o+8+s);
  if (id === "LIST") { const typ = p.toString("latin1",0,4); let q = 4; const subs = [];
    while (q + 8 <= p.length) { const sid = p.toString("latin1",q,q+4), ss = p.readUInt32LE(q+4); subs.push(sid+"="+JSON.stringify(p.subarray(q+8,q+8+ss).toString("latin1"))); q += 8+ss+(ss%2); }
    console.log("LIST/"+typ, subs.join(" ")); }
  else if (id === "id3 ") { console.log("id3 ver", p[3], "raw", JSON.stringify(p.subarray(10, 60).toString("latin1"))); }
  else console.log(id, s);
  o += 8 + s + (s%2); }
console.log(cp.execFileSync("ffprobe", ["-v","error","-show_entries","format_tags","-of","json",f]).toString());

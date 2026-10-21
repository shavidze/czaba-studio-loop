const fs=require('fs');const f='C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md';
let p=fs.readFileSync(f,'utf8');
const before=p;
p=p.replace('არჩევითია, მაგრამ backlog-შია. ავტომატურად „done“ არ ითვლება.','scope-შია (orchestrator-ის გადაწყვეტილება, 2026-10-07); მხოლოდ preview, ვიდეოს რენდერი D-11-ით გამორთულია.');
fs.writeFileSync(f,p);console.log(before!==p);

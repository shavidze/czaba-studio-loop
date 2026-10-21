const fs = require('fs');
const p = 'C:/Apps/czaba-project/tmp/studio-real-loop/current-task.md';
let s = fs.readFileSync(p, 'utf8');
const bad = 'It calls  only when it wraps focus. It never calls , and it does nothing on any other key.';
if (s.split(bad).length !== 2) {
  throw new Error('anchor not unique');
}
s = s.replace(
  bad,
  'It calls `preventDefault` only when it wraps focus. It never calls `stopPropagation`, and it does nothing on any other key.',
);
fs.writeFileSync(p, s);
console.log('fixed');

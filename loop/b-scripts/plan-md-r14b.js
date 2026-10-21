const fs = require('fs');
const path = 'C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md';
let s = fs.readFileSync(path, 'utf8');
const eol = s.includes('\r\n') ? '\r\n' : '\n';
const lines = s.split(eol);
const map = { 'FB-04': 18, 'FB-05': 18, 'FB-14': 18, 'FB-09': 19, 'FB-11': 19, 'FB-13': 19, 'FB-10': 20, 'FB-12': 21, 'FB-06': 22, 'FB-07': 23 };
let changed = 0;
for (let i = 0; i < lines.length; i++) {
  const m = /^\| (FB-\d\d) \|/.exec(lines[i]);
  if (!m) continue;
  const cells = lines[i].split(' | ');
  if (map[m[1]] !== undefined) {
    if (!/^\d+$/.test(cells[4])) throw new Error('unexpected round cell ' + m[1] + ': ' + cells[4]);
    cells[4] = String(map[m[1]]);
    lines[i] = cells.join(' | ');
    changed++;
  }
  if (m[1] === 'FB-08') {
    const from = 'მცურავი ვიდეო (Round 13). Panel-ის polish Round 14-შია.';
    if (!lines[i].includes(from)) throw new Error('FB-08 anchor missing');
    lines[i] = lines[i]
      .replace(from, 'მცურავი ვიდეო (Round 13, C PASS). Round 14: C-R13-01..03 (D-29e). Panel-ის polish Round 15–17-შია.')
      .replace('| 4, 8, 9, 11, 13, 14 |', '| 4, 8, 9, 11, 13, 14, 15–17 |');
    changed++;
  }
}
s = lines.join(eol);
const fromDeg = '160 px-იანი მინიმუმი D-22-ის კომპაქტური ზომაა; მხოლოდ ამ გადაგვარებულ შემთხვევაში შეიძლება ყუთმა ძებნა დაფაროს.';
if (!s.includes(fromDeg)) throw new Error('degenerate anchor missing');
s = s.replace(
  fromDeg,
  '160 px-იანი მინიმუმი D-22-ის კომპაქტური ზომაა. მხოლოდ ამ გადაგვარებულ შემთხვევაში (სიმაღლე > body.height − 16) ყუთი body.top + 8-ზე დგება და ქვემოთ preview-ის ზოლს შეიძლება გადაფაროს; viewport-ის clamp-ის შემდეგ — ძებნასაც.',
);
fs.writeFileSync(path, s);
console.log('changed rows', changed);

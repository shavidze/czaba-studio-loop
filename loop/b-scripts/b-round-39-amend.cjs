const fs = require('fs');
const root = 'C:/Apps/czaba-project/';
const edit = (file, pairs) => {
  let s = fs.readFileSync(root + file, 'utf8');
  for (const [from, to] of pairs) {
    if (!s.includes(from)) { console.error('MISSING in ' + file + ': ' + from.slice(0, 80)); process.exit(1); }
    s = s.split(from).join(to);
  }
  fs.writeFileSync(root + file, s);
  console.log('ok ' + file);
};

edit('docs/technical/studio-real-workspace/plan.md', [
  ['info სვეტის გადაფარვა (C-R30-01), Clip Gain/range-ის მიზეზის ხაზები (DETAIL-REASON-FIT).**', 'info სვეტის გადაფარვა (C-R30-01); მიზეზის ხაზები — მხოლოდ გაზომვა (DETAIL-REASON-FIT).**'],
  ['ხილული ნაწილი — მხოლოდ „შეუნახავია“ (`truncate`, ერთ ხაზზე); დანარჩენი', 'ხილული ნაწილი — მხოლოდ „შეუნახავია“ (ტექსტური node; `truncate min-w-0` თვითონ ნიშნის ელემენტზეა — flex item, რადგან inline span-ზე `truncate` არ მუშაობს; sr-only ნაწილი = `FULL.slice(LABEL.length)`); დანარჩენი'],
  ['  - **მიზეზის ხაზები:** Clip Gain-ის (`arrangement-detail-clip-gain-reason`) და range-ის (`arrangement-detail-reason`) მიზეზი — ერთი ხაზი `truncate`-ით და `title` = სრული ტექსტი; ტექსტი, `id` და `aria-describedby` უცვლელია (screen reader-ი სრულს კითხულობს).',
   '  - **მიზეზის ხაზები — ამ რაუნდში უცვლელია (advisor-ის მეორე შენიშვნა):** `truncate` ხილულ ტექსტად მხოლოდ თავსართს დატოვებდა („ვიდეო კლიპს Clip Ga…“), სრული მიზეზი კი მხოლოდ hover `title`-ით ან screen reader-ის browse რეჟიმით იქნებოდა მისაწვდომი — ველი disabled-ია, ამიტომ კლავიატურისა და touch-ის მომხმარებელი მას ვერ მიაღწევს. ეს ინფორმაციის დაკარგვაა. C ნამდვილ state-ებს ზომავს (R40-RS, მხოლოდ ჩანაწერი); დადასტურების შემთხვევაში — ცალკე C-ის ბაგი და ცალკე დიზაინი (მაგ. მოკლე ტექსტი).'],
  ['(e) `aria-live` — ყოველ აკრეფაზე გამოცხადდებოდა (MARKER-LIVE-REGION უარყოფილია).', '(e) `aria-live` — ყოველ აკრეფაზე გამოცხადდებოდა (MARKER-LIVE-REGION უარყოფილია); (f) მიზეზის ხაზებზე `truncate` ამ რაუნდში — იხ. ზემოთ.'],
  ['სამი მჭიდროდ დაკავშირებული ბაგი ერთი დეფექტის ოჯახიდან და ერთ ფაილში', 'ორი მჭიდროდ დაკავშირებული C-ის ბაგი ერთი დეფექტის ოჯახიდან და ერთ ფაილში (+ DETAIL-REASON-FIT მხოლოდ გაზომვით)'],
  ['| 40 | C-ის ბაგები (Round 39-ის record) — detail panel-ის ჩატევა | C-R39-01 (ნიშანი ერთ ხაზზე `0 dB`-ის გვერდით + `ring-warning`), C-R30-01 (info სვეტი `shrink-0`), DETAIL-REASON-FIT (მიზეზის ხაზები `truncate` + `title`) (D-29z5) |',
   '| 40 | C-ის ბაგები (Round 39-ის record) — detail panel-ის ჩატევა | C-R39-01 (ნიშანი ერთ ხაზზე `0 dB`-ის გვერდით + `ring-warning`), C-R30-01 (info სვეტი `shrink-0`); DETAIL-REASON-FIT — მხოლოდ C-ის გაზომვა (D-29z5) |'],
  ['detail panel-ის ჩატევა: C-R39-01, C-R30-01, DETAIL-REASON-FIT (D-29z5).', 'detail panel-ის ჩატევა: C-R39-01, C-R30-01; DETAIL-REASON-FIT — მხოლოდ გაზომვა (D-29z5).'],
]);

edit('tmp/studio-real-loop/feature-status.md', [
  ['detail panel-ის ჩატევა (სამი დაკავშირებული ბაგი, ერთი ფაილი):', 'detail panel-ის ჩატევა (ორი დაკავშირებული C-ის ბაგი, ერთი ფაილი; მესამე — მხოლოდ გაზომვა):'],
  ['- **DETAIL-REASON-FIT (B-ის probe, C ადასტურებს):** Clip Gain-ისა და range-ის მიზეზის ხაზები ერთ ხაზზეა `truncate`-ით და `title`-ით; ტექსტი და `aria-describedby` უცვლელია.',
   '- **DETAIL-REASON-FIT (B-ის probe; ამ რაუნდში მხოლოდ C-ის გაზომვა):** კოდი არ იცვლება — `truncate` disabled ველის მიზეზს კლავიატურისა და touch-ის მომხმარებელს დაუმალავდა. დადასტურების შემთხვევაში — ცალკე C-ის ბაგი და ცალკე დიზაინი.'],
  ['| DETAIL-REASON-FIT | Low | **მუშავდება** (Round 40, D-29z5; მხოლოდ B-ის probe — C ადასტურებს) | `b-round-39/measure-reason-1440.txt` | Clip Gain/range-ის მიზეზი ერთ ხაზზე `truncate` + `title` |',
   '| DETAIL-REASON-FIT | Low | **მოწმდება** (Round 40-ში მხოლოდ C-ის გაზომვა, კოდი არ იცვლება; B-ის probe) | `b-round-39/measure-reason-1440.txt` | C-ის მტკიცებულების შემდეგ — ცალკე დიზაინი (მოკლე ტექსტი ან სხვა განლაგება), რომელიც მიზეზს კლავიატურას/touch-ს არ უმალავს |'],
  ['Round 40 — C-R39-01, C-R30-01, DETAIL-REASON-FIT (D-29z5).', 'Round 40 — C-R39-01, C-R30-01; DETAIL-REASON-FIT მხოლოდ გაზომვით (D-29z5).'],
  ['- **C:** R40-PM (ნიშანი, geometry 1440/1280 + C-R30-01-ის state), R40-RS (მიზეზის ხაზები), R40-INFO', '- **C:** R40-PM (ნიშანი, geometry 1440/1280 + C-R30-01-ის state), R40-RS (მიზეზის ხაზები — მხოლოდ ჩანაწერი), R40-INFO'],
]);

const bp = root + 'tmp/studio-real-loop/backlog.json';
const b = JSON.parse(fs.readFileSync(bp, 'utf8'));
const f = b.open_findings.find((x) => x.id === 'DETAIL-REASON-FIT');
f.status = 'measurement-only (round 40)';
f.to = 'round 40: C measures the real video/group/none states (R40-RS, record only); no code change. If C confirms clipping -> a C-evidenced bug with its own design (shorter strings or another placement)';
f.rejected_fix = 'truncate + title on the disabled reason lines: the only visible text would be a prefix, and the full reason would be reachable only by hover or screen-reader browse mode; the inputs are disabled, so keyboard and touch users could not reach it (advisor, second call)';
const r = b.rounds.find((x) => x.round === 40);
r.items = ['C bugs (round-39 record): detail panel content fit - C-R39-01, C-R30-01; DETAIL-REASON-FIT measurement-only'];
r.owned[0] = 'app/components/arrangement/ArrangementDetailPanel.tsx (Clip Gain marker row: label text node + sr-only rest + title, truncate min-w-0 on the marker element, pending focus ring-warning; info column shrink-0 only; reason lines unchanged)';
const srw13 = b.items.find((x) => x.id === 'SRW-13');
const st = srw13.stages.find((x) => x.stage === '4b-2');
const g = st.groups.find((x) => x.group === '1-fit');
g.items = ['C-R39-01', 'C-R30-01', 'DETAIL-REASON-FIT (measurement-only)'];
srw13.decisions_round40 = srw13.decisions_round40.replace('(C-R39-01 + C-R30-01 + DETAIL-REASON-FIT)', '(C-R39-01 + C-R30-01; DETAIL-REASON-FIT measurement-only)');
b.current_task = b.current_task.replace(', DETAIL-REASON-FIT Clip Gain/range reason lines one line with truncate + title;', '; DETAIL-REASON-FIT measured only (truncate rejected: hides disabled-field reasons from keyboard/touch users);');
fs.writeFileSync(bp, JSON.stringify(b, null, 2) + '\n');
console.log('ok backlog');

const np = root + 'tmp/studio-real-loop/b-next.json';
const n = JSON.parse(fs.readFileSync(np, 'utf8'));
n.nextTask = n.nextTask
  .replace("visible text only 'შეუნახავია' (truncate, one line), the rest", "visible text only 'შეუნახავია' as a text node with truncate min-w-0 on the marker element itself (a flex item), the rest")
  .replace(' (3) DETAIL-REASON-FIT: the Clip Gain and range reason lines get truncate + title, text and aria-describedby unchanged.', ' (3) DETAIL-REASON-FIT: measurement-only (C records the real video/group/none states); no code change, because truncate would hide the disabled-field reason from keyboard and touch users.')
  .replace('(red-first F1-F8, must-not F9)', '(red-first F1-F4, F8; must-not F5, F9)')
  .replace('R40-RS (video/group/none reasons)', 'R40-RS (video/group/none reasons, record only)');
fs.writeFileSync(np, JSON.stringify(n, null, 2) + '\n');
console.log('ok b-next');

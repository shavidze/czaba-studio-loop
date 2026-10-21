const fs = require('fs');
const p = 'C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md';
const t = fs.readFileSync(p, 'utf8');
if (t.includes('D-29v')) throw new Error('D-29v already present');
const lines = t.split('\r\n');
const d29v = [
  '**D-29v — Round 30-ის შედეგი; SRW-13 ეტაპი 4a (Round 31): FB-05 ტრეკის Pan აუდიო ხაზებზე.** C round 30 (`c-round-30.md`): **PASS** ყველა ID-ზე. R13-M1 დადასტურდა:',
  '- export: B +6.0000 / −6.0000 dB, A 0 LSB;',
  '- დაკვრისას reschedule არ ხდება;',
  '- loop-ის შემდეგი iteration-ები სწორი gain-ით იწყება;',
  '- gain ყველა edit-ის შემდეგ რჩება;',
  '- mutation-ები 10/10 მოკლულია.',
  '',
  'FB-04 → „მოწმდება“ (დარჩა Tech Lead-ის R30-T). ახალია C-R30-01 (Low, არსებული ქცევა): 1280-ზე, ღია detail panel-ითა და ხილული range-ით, info სვეტი ერთმანეთს ეფარება. round 19-ის D-29j-ის 1280-ის გაზომვა footer 69-ზე იყო, range-ის გარეშე, ამიტომ ეს შემთხვევა არასოდეს გაზომილა.',
  '',
  'Root-მა B-ის სესიის დროს დააკომიტა `08b9e53` (ზუსტად ის 69 ფაილი, რომელიც C-მ შეამოწმა) და `1cefea1` (upstream-ის merge). ახალი baseline: სუფთა ხე, vitest 1167/1167. Biome 2 format error-ს აჩვენებს merge-ით შემოსულ auth ფაილებზე (CRLF; root-ის საკითხი).',
  '',
  'გადაწყვეტილებები:',
  '- **ეტაპი 4 იყოფა** (წესი: ერთი ფუნქცია ერთ რაუნდში):',
  '  - 4a = Pan (Round 31);',
  '  - 4b = fader-ის UX ყველა fader-ზე: click-ზე არ ხტება, double-click reset, კლავიშების ჩანაწერების გაერთიანება, A-R29-REVIEW-1, pending commit-ების რიგი, Master-ის hold tick;',
  '  - 4c = round-9 M1/L8.',
  '',
  '  C-R30-01, DOC035-NOTES და DOC034-UNREACHABLE-NOTE ცალკე polish რაუნდში მიდის 4c-ის შემდეგ. Low ბაგი ფუნქციას წინ არ უსწრებს.',
  '- **A round 30 §6.1** (optional `setClipGain?` prop) და **§6.2/6.2a** მიღებულია. Keyboard-ით dirty ტექსტი + `0 dB` ორ ჩანაწერს ქმნის: blur ყოველთვის commit-ს აკეთებს. ეს doc-ის შენიშვნად ჩაიწერება და კოდი არ იცვლება.',
  '- **მონაცემი:** `ArrangementTrack.pan?: number` არსებობს მხოლოდ არანულოვანზე. დიაპაზონი −1…+1, ბიჯი 1/50; ჩვენებაში `C` / `NL` / `NR`.',
  '  - Pan მხოლოდ აუდიო ხაზებს აქვს. ვიდეო ხაზის პირველ რიგში import-ის ღილაკია, ხოლო ვიდეოს ხმა Volume/Mute-ით იმართება. ეს შეგნებული განსხვავებაა.',
  '  - გაყინული track fixture-ები და JSON-ის ტოლობით ისტორია უცვლელი რჩება.',
  '- **Graph:** არსებული `StereoPannerNode` `track.pan`-ით იწყება. `ScheduleHandle.setTrackPan` `setTargetAtTime`-ს იყენებს (τ 15 ms) და უცვლელ მნიშვნელობაზე მაშინვე ბრუნდება.',
  '  - ახალი კვანძი და ახალი option არ ემატება.',
  '  - `renderArrangementWav` byte-identical რჩება: export pan-ს `tracks`-იდან იღებს.',
  '  - `scheduleKey` მხოლოდ clips + loop-ია, ამიტომ pan reschedule-ს არ იწვევს.',
  '- **UI:** ხაზის header-ის პირველ რიგში, სახელის მარჯვნივ, დგას range (−50…+50, `w-12`) და readout-ღილაკი (`w-7`), რომელიც C-ზე აბრუნებს.',
  '  - B-ის probe (`tmp/studio-real-loop/b-round-30/geo-*.json`): 1280-ზე ღია detail panel-ით აუდიო ხაზი 61 px-ია, ამიტომ მესამე რიგი არ ეტევა.',
  '  - საბაზისო სახელები ეტევა; „· აქტიური“ შეიძლება შეიკვეცოს.',
  '  - R24-HC-ის პირველი range-ის query ახლა Pan-ს პოულობს. ეს მიღებულია: Home ყველა slider-ზე browser-ს რჩება.',
  '- **ურთიერთქმედება:**',
  '  - pointer drag-ის preview მხოლოდ ცოცხალ handle-ს აწვდის და `history.present`-ს არასოდეს წერს; context-ის override-ს reschedule-იც ითვალისწინებს;',
  '  - ხელის აშვება = ერთი ჩანაწერი `Pan — {name}`;',
  '  - კლავიშის თითო ბიჯი = ერთი ჩანაწერი;',
  '  - blur/pointercancel drag-ის შუაში აბრუნებს მნიშვნელობას ჩანაწერის გარეშე.',
  '',
  '  მიზეზი: Volume-ის pending snapshot-ის მესამე ასლს flush-ის რიგი დასჭირდებოდა (checkpoint review 5) და A-R29-REVIEW-1-ის ტიპის label-ის პრობლემას შექმნიდა.',
  '- **R13-M2-ის oracle:** music solo, Master −12, `clippedSamples = 0`.',
  '  - 50L-ზე მარჯვენა არხი ≤ 1 LSB-ია, მარცხენა კი W3C StereoPanner-ის ფორმულას მიჰყვება (≤ 2 LSB) source-ის არხების რაოდენობის მიხედვით.',
  '  - C-ზე დაბრუნების შემდეგ export = E0 (0 LSB).',
  '- **Ableton** (Live 12 Reference Manual §18.1 „The Live Mixer“, `tmp/studio-real-loop/b-round-29/ableton-mixing-20261012.txt`, gstack `/browse` 2026-10-12):',
  '  - დადასტურებული: Pan ხაზის გამოსავალს stereo ველში ათავსებს; Stereo Pan Mode; რამდენიმე მონიშნული ტრეკი ერთად; double-click reset.',
  '  - pan law დაუდასტურებელია: Audio Fact Sheet შენახული არ არის. W3C-ის კანონი CZABA-ს არჩევანია და Live-ისად არ წარმოჩნდება.',
  '- **მომხმარებლის წყარო:** `2.mp4` 03:08–03:17-ში მთავარ mixer-ზე ნათქვამია „პანინგი … ვოლუმი, ტემპი … ესენი არ გვჭირდება“. ეს ორაზროვანია. B scope-ს არ ამცირებს: FB-05 `1.mp4` 03:39-ით და FB-11 რჩება. Tech Lead-ს საინფორმაციო კითხვა გადაეცა (TL-Q-FB05-FB11), რომელიც სამუშაოს არ ბლოკავს.',
  '',
];
const anchor = lines.findIndex((l) => l.startsWith('**ვიდეოს import (SRW-02, FB-15).**'));
if (anchor < 0) throw new Error('anchor missing');
lines.splice(anchor, 0, ...d29v);
const row31 = lines.findIndex((l) => l.startsWith('| 31 | SRW-13, ეტაპი 4 |'));
if (row31 < 0) throw new Error('row 31 missing');
lines.splice(
  row31,
  1,
  '| 31 | SRW-13, ეტაპი 4a | FB-05 ტრეკის Pan აუდიო ხაზებზე (R13-M2): range + C-ზე დაბრუნება header-ის პირველ რიგში, preview ისტორიის გარეშე, ცოცხლად reschedule-ის გარეშე, export `tracks`-იდან (D-29v) |',
  '| 32 | SRW-13, ეტაპი 4b | fader-ის UX (Volume, Master, Pan): click-ზე არ ხტება, double-click reset, კლავიშების ჩანაწერების გაერთიანება, A-R29-REVIEW-1, pending commit-ების რიგი, Master-ის hold tick |',
  '| 33 | SRW-13, ეტაპი 4c → polish | round-9 M1/L8; შემდეგ C-R30-01, DOC035-NOTES, DOC034-UNREACHABLE-NOTE |',
);
const r30 = lines.findIndex((l) => l.startsWith('- **Round 30: გაგზავნილია.**'));
if (r30 < 0) throw new Error('round 30 status missing');
lines.splice(
  r30,
  1,
  '- **Round 30: C PASS** (`tmp/studio-real-loop/c-round-30.md`) ყველა ID-ზე: R30-GE..Doc, G30-1..3, vitest 1161/1161, mutation-ები 10/10. R13-M1 დადასტურდა; FB-04 → „მოწმდება“ (R30-T).',
  '  - ახალი Low: C-R30-01 (არსებული ქცევა), DOC035-NOTES. Root-მა დააკომიტა `08b9e53` + `1cefea1`.',
  '- **Round 31: გაგზავნილია.** SRW-13 ეტაპი 4a, FB-05 Pan (D-29v). პროგრესის დაფა: `tmp/studio-real-loop/feature-status.md`.',
);
const s13 = lines.findIndex((l) => l.includes('ეტაპი 3 გაგზავნილია Round 30-ში (D-29u), ეტაპი 4 → Round 31;'));
if (s13 < 0) throw new Error('SRW-13 remaining line missing');
lines[s13] = lines[s13].replace(
  'ეტაპი 3 გაგზავნილია Round 30-ში (D-29u), ეტაპი 4 → Round 31;',
  'ეტაპი 3 C PASS (Round 30, D-29u); ეტაპი 4a გაგზავნილია Round 31-ში (D-29v), 4b/4c — შემდეგ;',
);
const adv = lines.findIndex((l) => l.startsWith('Advisor: B-მ გამოიყენა'));
if (adv >= 0 && !lines[adv].includes('Round 30-ის შემდეგ')) {
  lines[adv] += ' Round 30-ის შემდეგ advisor ხელმისაწვდომი იყო; B-მ ის წერამდე და წერის შემდეგ გამოიძახა.';
}
fs.writeFileSync(p, lines.join('\r\n'));
const out = fs.readFileSync(p, 'utf8');
console.log('crlf', (out.match(/\r\n/g) || []).length, 'bareLF', (out.match(/(^|[^\r])\n/g) || []).length, 'D-29v', (out.match(/D-29v/g) || []).length);

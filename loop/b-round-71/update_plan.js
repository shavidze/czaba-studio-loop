const fs = require('fs');
const p = 'C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md';
let s = fs.readFileSync(p, 'utf8');
if (s.includes('**D-29z37')) {
  console.log('already');
  process.exit(0);
}
const anchor = '\n## 4. FB-ების რუკა';
const i = s.indexOf(anchor);
if (i < 0) throw new Error('anchor');
const d = [
  '',
  '**D-29z37 — Round 71-ის შედეგი; Round 72: SRW-16 (FB-10) სახელიანი მარკერები, ეტაპი 1.**',
  '',
  'C round 71 (`tmp/studio-real-loop/c-round-71.md`, `c-round-71.json`) — **PASS, `browserVerified: true`**, ბაგები არ არის: MH-NODES* ≤ 120 (ადრე ≈ 2200), MH-SCRUB-PERF, MT-BEATS*, MH-LONG, MH-END, MH-SCRUB. Root-მა გამოაქვეყნა `1e469e5` (ორივე remote, `gates/gate-round-71.json`; review 9/10, ყველა Low). ROOT-R66-M1, DOC-059-STATUS-LINE და ROOT-R70-L6 დაიხურა. Root-ის L1 (doc 063-ის სტატუსი და verify-ის წინადადება) — Round 72; L2/L3 — Low-ების ჯგუფი; L4 — დაკვირვება. Architecture note (მეორე refill pipeline) — ARCH-CHECKPOINT-SRW14-PREFS-ის მერვე თხოვნა.',
  '',
  '- **R1 — რიგი:** ღია C ბაგი და reviewer-ის Medium არ არის; SRW-16 (FB-10) დამოკიდებულების რიგით შემდეგი დაუწყებელი ფუნქციაა (SRW-04 მზადაა). ორ ეტაპად: ეტაპი 1 — მოდელი, დამატება სახელით, ჩვენება, გადასვლა, დაკვრა მარკერიდან, წინა/შემდეგი, F2, Delete, Undo/Redo, Cut Time-ის remap; ეტაპი 2 (დაგეგმილია, არ გადაიდო) — გადატანა drag/ისრებით snap-ით, მარჯვენა click-ის მენიუ (Rename/Delete/Play from here), snap მარკერებზე (Live 6.7), Ctrl+←/→ კლიპის კიდეებზეც (Live 6.9).',
  '- **R2 — მოდელი:** `Arrangement.markers?: ArrangementMarker[]` (`{id, time, name}`), არჩევითი — `pan?`/`gainDb?`-ის მსგავსად, რადგან required ველი frozen ტესტებსა და Studio-ს გარეთა ფაილებს გატეხდა. ნორმალური ფორმა: დალაგებული, ერთ ms-ზე ერთი, დრო ms-მდე დამრგვალებული, სახელი 1–64 სიმბოლო, **`[]` არასდროს** (ბოლოს წაშლისას გასაღები იშლება). Undo/Redo არსებული ისტორიით; `scheduleKey` უცვლელია — მარკერის რედაქტირება resync-ს არ იწვევს; ექსპორტი მარკერებს არ ეხება.',
  '- **R3 — დამატება:** `M` ან Add ღილაკი; დრო = `range.start`, თუ range არის, სხვა შემთხვევაში ცოცხალი პოზიცია (D-15: CZABA-ს პოზიცია = Ableton-ის insert marker; Live 6.4 დადასტურებული). სახელის ველი მაშინვე იხსნება (მომხმარებელი: „აწერს ამას სახელს“); Enter/blur — ერთი `Add Marker` ჩანაწერი, Escape — არაფერი. იმავე ms-ზე მეორე მარკერი არ იქმნება. Gesture-ის დროს `M` უარყოფილია.',
  '- **R4 — ნავიგაცია:** click — გადასვლა (დაკვრა გრძელდება), ორმაგი click გაჩერებულზე — დაკვრა მარკერიდან (Live 6.4 დადასტურებული). Ctrl+←/→ და ◀/▶ — წინა/შემდეგი, ბოლოს 0 / პროექტის ბოლო (Live 6.4); ეტაპ 1-ში მხოლოდ მარკერები (კლიპის კიდეები — ეტაპი 2); დაკვრა ავტომატურად არ იწყება (შეგნებული განსხვავება, D-15).',
  '- **R5 — სახელი და წაშლა:** F2 (Live-ის Ctrl+R ბრაუზერის reload-ია — შეგნებული განსხვავება); ცარიელი სახელი ცვლილებას არ იწვევს. Delete/Backspace ფოკუსირებულ მარკერზე შლის მხოლოდ მარკერს; SRW-24-ის Delete სხვა ფოკუსზე უცვლელია (`isMarkerTarget` გამორიცხვა + მარკერის საკუთარი handler).',
  '- **R6 — Delete Time:** `deleteTime` მარკერებს გადაითვლის: `(a, b)`-ის შიგნით — იშლება (დასახელებული მასალა აღარ არის), `≥ b` — იწევს `b − a`-ით, იმავე ms-ზე დამთხვევისას რჩება ადრინდელი. Live 6.11 მხოლოდ time signature-ის მარკერებს ახსენებს — locator-ებზე Ableton-ის ქცევა **დაუდასტურებელია**. Cut Time-ის სტატუსს ემატება „N მარკერი წაიშალა“.',
  '- **R7 — ადგილი:** ცალკე sticky `ArrangementMarkerRow` (20 px) TempoRow-სა და Loop-ის ხაზს შორის (მომხმარებელი: „ზემოდან“); `ArrangementRuler.tsx` გაყინულია (RU-DBLCLICK-ის დაკვირვება). ენა — მეზობლების მსგავსად (`Markers`/`Loop` ინგლისურად, სტატუსები ქართულად); VISUAL-A-ს M2 მოგვიანებით გადაიტანს.',
  '- **R8 — ფაილები:** `arrangement.ts`, `markers.ts` (ახალი), `model.ts` (`deleteTime`), `ArrangementContext.tsx` (`cutTimeSelection`-ის სტატუსი), `ArrangementMarkerRow.tsx` (ახალი), `StudioWorkspace.tsx` (wiring); `markers.test.ts` (MK1–MK10), `markers-ui.test.tsx` (MU1–MU12) → 103 ფაილი; doc 064 ახალი; doc 063 — ორი ცვლილება (ROOT-R71-L1).',
  '- **R9 — C:** MK-ADD*, MK-ADD-RANGE, MK-ADD-PLAYING/MK-NO-RESYNC (`createBufferSource` 0), MK-ESC, MK-DUP, MK-JUMP, MK-PLAYFROM* (რეალური აუდიო), MK-NAV, MK-RENAME, MK-DELETE (+ SRW-24 რეგრესია), MK-CUT-TIME (R16-K3), MK-LAYOUT*, MK-TYPING, MK-EXPORT-REG, REG-CHROME, REG-KEYS, REG-HYD, G72-3. F-ME-ის ბოლო 01:41.352 (C round 71), არა 133 წმ.',
  '- **R10 — Root-ის შენიშვნები:** რიგი — ფაზა 1 → T12 → VISUAL-A-OBSIDIAN (2026-10-21, დამატებითი დასტური არ სჭირდება) → BLOCKED „phase 2 awaiting user go-ahead“ (2026-10-20). არცერთი არ იგეგმება და მიმდინარე სამუშაოს არ ერევა.',
  '',
].join('\n');
s = s.slice(0, i) + d + s.slice(i);
const fbOld = '| FB-10 | ფუნქციის მოთხოვნა | Markers/Locators | SRW-16 | 21 | |';
if (s.split(fbOld).length !== 2) throw new Error('fb10');
s = s.replace(fbOld, '| FB-10 | ფუნქციის მოთხოვნა | Markers/Locators | SRW-16 | 72 (ეტაპი 1), შემდეგ ეტაპი 2 | D-29z37: ცალკე მარკერების ხაზი, დამატება სახელით, გადასვლა, დაკვრა მარკერიდან, წინა/შემდეგი, F2, Delete, Cut Time-ის remap. ეტაპი 2 — გადატანა, მენიუ, snap მარკერებზე |');
const fb09Old = 'რჩება Tech Lead-ის R65-T/R66-T/R70-T; ROOT-R66-M1 — Round 71 (D-29z36) |';
if (s.split(fb09Old).length !== 2) throw new Error('fb09');
s = s.replace(fb09Old, 'ROOT-R66-M1 — Round 71 C PASS, `1e469e5` (D-29z36). რჩება Tech Lead-ის R65-T/R66-T/R70-T/R71-T |');
fs.writeFileSync(p, s);
console.log('ok');

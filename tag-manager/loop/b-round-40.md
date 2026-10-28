# B — Round 40 დახურვა / Round 41 გეგმა

## Round 40 შედეგი
- **C PASS** (R40-1…R40-7, realVerified=true; `c-round-40.md`, `c-round-40.json`). ახალი ბაგი: 1 low docs (C-R40-01). critical/high/medium არ არის.
- root gate: **published** `e386cca619e44be8dc3fe0217600beae9608d804` (`gates/gate-round-40.json`). review COMMIT OK (`gates/round-40/review.md`). ეს commit არის round 41-ის baseline.
- archive: `tasks/round-40.md` (round 40-ის `current-task.md`-ის ასლი, `cmp`-identical; ადრე არ არსებობდა).

## Backlog / feature-status (მხოლოდ C-ის მტკიცებულებით)
- **TM-B42** → `done`, realVerified=true, commit `e386cca`. evidence: C R40-1…R40-7 (CSS selector-ები; real app old/new hover — disabled ნაბიჯებზე rest == hover, enabled უცვლელი; K2 ffprobe + music-metadata `ICAT=C40Keyb`; m1–m6 მოკლულია; gate 310/93/7, `--retries=0` 7/7).
- **D-46** → verified, published `e386cca`.
- დახურული finding-ები:
  - RR-R38-01, RR-R38-04, B-R39-01 (TM-B42);
  - RR-R40-02 (დადასტურება, ქმედება არ სჭირდება);
  - RR-R40-03 (real-app hover შემოწმება: C R40-3 / Dev1 უკვე გაზომა).
- ახალი finding-ები:
  - C-R40-01 = A-R40-01 (chip spec) → TM-B43;
  - A-R40-02 = RR-R40-01 (D-46 decision log-ში არ არის) → TM-B43;
  - A-R40-04 (a) row `py-1` → TM-B43; (b) plain disabled `<button>`-ზე `cursor-not-allowed` არ არის → record B-R39-02-თან ერთად (UX, reference-first);
  - A-R40-03 (AudioPlayer conditional class) → record;
  - RR-R40-04 (`IconButton`) → არქიტექტურის signal, არა task.
- C-ის შენიშვნა `IKEY=""` ახალი არ არის: ეს არსებული C-R1-01-ია.
- ახალი item **TM-B43** (docs, low, depends_on TM-B42). round 40 → published, round 41 → planned.
- სკრიპტები: `b-round-40-update-backlog.py`, `b-round-40-update-feature-status.py`. ძველი ასლები: `b-round-40-backlog-before.json`, `b-round-40-feature-status-before.md`.

## Round 41 = TM-B43 (მხოლოდ docs)
- **რატომ:** C-ის ბაგი პირველია (C-R40-01). იმავე სამ docs ფაილს ეხება A-R40-02/RR-R40-01 და A-R40-04(a). ეს ერთი ბაგის კლასია: docs კოდს არ ემთხვევა.
- **prototype:** `b-round-40-exp/prototype.diff` (57 `+`/`-` ხაზი, header-ების გარეშე), სამივე ფაილის სრული ასლი და `edit.py.txt`.
  - dry-run + apply `git archive e386cca`-ზე: proto tree-ს ემთხვევა;
  - 22 ჩანაწერი, 13 `გასწორდა`.
- **spec-ის class string-ები** `SchemaEditor.tsx:152-291`-დანაა კოპირებული (`e386cca`).
- **ტესტი არ არის:** docs-only, `src/` და `tests/` frozen-ია.
- **Reference-first:** არ ეხება (docs-only round).
- **realVerified:** C real app-ში DOM-ის `className`-ებს spec-ს ადარებს (R41-3).
- repository-ს არ შევხებივარ: `git status --porcelain` ცარიელია. prototype `/tmp/b41`-შია, ასლი `b-round-40-exp/`-ში.

## ჰორიზონტი (TM-B43-ის შემდეგ)
ყველა დარჩენილი scoped item გარე გადაწყვეტილებას ელოდება:
- **Saba:**
  - D-07 / TM-T1-MIG (`needs_user`);
  - TM-T1-DUP;
  - D-12 / TM-B08;
  - D-10 / TM-B11;
  - TM-B05;
  - TM-B06;
  - TM-T2 / TM-T2-DATA (UCS სია და ლიცენზია);
  - RR-R35-02 (timeout);
  - B-R36-01 (სიის ჩაკეტვა scan-ის დროს).
- **root:** Actions `Check`-ის მწვანე link `7879ee0`-ზე ან უფრო გვიან. ელოდება TM-T0, TM-T0-CI, TM-T0-CI-FU და TM-B14.

round 42-ში, თუ TM-B43 PASS-ია, B წყვეტს ორიდან ერთს:
- low record-ებიდან (მაგ. B-R39-02 / A-R40-04(b) cursor — UX, reference-first) რომელიმე round-ს იმსახურებს;
- loop BLOCKED-ს აცხადებს Saba-ს კითხვებზე, ზემოთ მოცემული ზუსტი სიით.

scope არ შემცირებულა, deferred არაფერი მონიშნულა.

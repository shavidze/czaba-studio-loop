# B — Round 25-ის შედეგი → Round 26-ის დაგეგმვა (D-29q)

ავტორი: B · თარიღი: 2026-10-11

## 0. Tech Lead-ისთვის, პირველ რიგში: C-R23-01 გაუარესდა

- C round 25-მა (`c-round-25.md` §12) `/studio-lab`-ის SSR HTML-ში **8 NUL byte** იპოვა (round 24-ში 4 იყო). Offset-ებია 3536/3537, 11728/11729, 26924/26925 და 43308/43309.
- სამი ახალი შემთხვევა hydration-მდე **ხილულ ქართულ ტექსტშია**: header-ის დემო badge, ბიბლიოთეკის ტექსტი და `Arrangement ·` სათაური. ამას ხედავს პირველი paint, JS-ის გარეშე მკითხველი და crawler. Hydration ხილულ ტექსტს ასწორებს, მაგრამ music ხაზის `aria-label` 2× U+FFFD-ს ინარჩუნებს.
- Offset-ები markup-ის ყოველ ცვლილებაზე იძვრის, ამიტომ ყოველმა feature round-მა შეიძლება ბაგი გააუარესოს.
- B-მა დამოუკიდებლად გაიმეორა: live `curl /studio-lab` → **8 NUL**.
- გამოსწორება სჭირდება `app/entry.server.tsx`-ს (A-ს მფლობელობის გარეთ, plan §6) ან `package.json`-ს (React 19; გლობალურად აკრძალულია). B ამ ნებართვას ვერ გასცემს: ერთადერთი precedent-ი (Header.tsx) მომხმარებლის აშკარა ნებართვას ეყრდნობოდა.
- **კითხვა (უცვლელი, ახლა სასწრაფო):** (a) React 19, თუ (b) `app/entry.server.tsx`-ის ვიწრო grant A-სთვის NUL-ის ფილტრის `Transform` module-ისთვის, ტესტებით. Oracle `b-round-23.md` §3-შია.
- ბაგი **არ არის გადადებული.** პასუხისთანავე B მას შემდეგ feature round-ზე ადრე დაგეგმავს. Medium-ია და არც უსაფრთხოებას ეხება, არც მონაცემების დაკარგვას. ამიტომ სამუშაო წესის მიხედვით დამოუკიდებელ სამუშაოს არ აჩერებს.

## 1. წყაროები

- `tasks/round-25.md` — არქივი, sha `489ee115…`, dispatch-ის `current-task.md`-ის იდენტური (ასლი, არაფერი წაშლილა);
- `a-round-25.md`, `c-round-25.md`, `c-round-25.json`;
- `backlog.json` (v26 → v27), `plan.md`, `feature-status.md`;
- `root-pre-push-review.md`, `publication-checkpoint.json` (round 24-ის შემდეგ არ შეცვლილა);
- `docs/video-to-text-bugs/README.md` (FB-14);
- `next-stage-t12/gain-volume-source.txt` T12.20–T12.23 (თავსებადობისთვის; T12 არ დაწყებულა).

**Advisor:** ხელმისაწვდომი იყო. B-მა გამოიძახა orientation-ის შემდეგ, წერამდე. რჩევა გამოყენებულია:
- fake context-ის breakage ჯერ probe-ით შემოწმდა;
- fan-out tap აირჩა;
- float მონაცემები და export-ის საერთო პრედიკატი;
- latch მხოლოდ click-ით სუფთავდება და edit არ არის;
- ეტაპი 2 გაიყო 2a/2b-ად;
- C-R23-01-ის ესკალაცია პირველ ადგილზეა;
- R26-X ახლავე გადაწყდა;
- byte-იდენტურობის oracle შეიცვალა.

**სარეზერვო ასლები შესწორებამდე:** `feature-status.before-b-round-25.md`, `backlog.json.bak-before-b-round-25`, `plan.before-b-round-25.md`, `b-scripts/b-next.before-r26.json`.

## 2. რა დაადასტურა C-მ (მხოლოდ დამოუკიდებელი მტკიცებულება)

C round 25: **PASS**, scope-ში ახალი ბაგის გარეშე.

| ID | C-ის შედეგი | მტკიცებულება |
|---|---|---|
| R25-MV | Δ **−6.000 dB** ×3, აღდგენა 0.000; playhead-ში ნახტომი არ არის; ვიდეოს drift max 19.6 ms | `c-round-25.md` §3 |
| R25-MM | ≤ −60 dBFS click-იდან 14 ms-ში, 60 ms-იდან −240; decay monotone-ია (3 ვალიდური run + 1 ჩანაცვლება); ვიდეოს ხმაც ჩუმდება | §4 |
| R25-ML | ახალი graph 0, seam 0 ×5, lead 1999 ms | §6 |
| R25-E0 / EO / E6 / EM | 864 000 frame, FS 1800, RMS −15.481. Alert `+5.0 dBFS / 1800 / 5.0 dB`, −5.0 dB-ზე FS 0. −6 dB-ის ratio 0.501187. Mute-ზე ნამდვილი ჩუმი ფაილი და suffix | §5 |
| R25-H | 12 `Master Volume` = 12 `Volume`; synthetic drag → 1 entry; აუდიო Undo/Redo-ს მისდევს | §7 |
| R25-K / L | Tab-ის რიგი, Home/End/Space; header 35, transport 49/87, row-ები, scroller და მცურავი ვიდეო = round 24 | §8–§9 |
| R25-R / S / U / Doc | PASS; mutation-ები a–d → 1/2/1/1 failed | §10–§11 |
| G25-1..3 | tsc 0, vitest **1045/1045**, build, Biome 0 error (218 warning); 50 OK; 54 ხაზი; ანონიმური გარემო სუფთაა | §13 |

**B-ის დამოუკიდებელი შემოწმება (2026-10-11):**
- HEAD `c5ed47b`;
- `git status` = 54 ხაზი, `c-round-25/gates/git-status-end.txt`-ის იდენტური;
- `b-round-24-tree-sha256.txt` → 50 OK;
- 11 owned sha (`d6548d21`, `93be4dcd`, `ee7fafe1`, `2ec43d1a`, `63f1fdf9`, `f67135a8`, `ac2eed7e`, `750c75e6`, `dda9f265`, `1d5bd689`, `1060e617`) = C-ის ჩანაწერი;
- live curl `/studio-lab` → NUL 8.

**A-ს deviation-ები 1–7** (`a-round-25.md` §6) C-მ მიიღო და B ეთანხმება:
- `<fieldset>`-მა `div role=group` ჩაანაცვლა (Biome-ის error);
- Master-ის gesture-ისთვის ცალკე პარალელური გზაა;
- warning-ის P floor-ით არის `+0.0`-ზე;
- დამატებითი export-ები: `formatMasterGainDb`, `measureExportOverload` და სხვ.

**C-ის დაკვირვებები** (ბაგი არ არის) და B-ის გადაწყვეტილება:
1. Export bit-deterministic არ არის (±1 LSB; ცნობილია round 11-იდან). Byte-იდენტურობა oracle-ად აღარ გამოიყენება. ეს `backlog.json`-ის `harness_rules`-შია და current-task-ის §4-შიც.
2. Mute-ის დროს gain ≠ 0-ზე dialog ორივე note-ს აჩვენებს → **R26-X** (ამ რაუნდში, ერთი პირობა).
3. Fader-ის 4 px box → SRW-13 ეტაპი 4-ის fader UX (`ux_notes`-ში ჩაწერილია).

## 3. სტატუსის ცვლილებები (მხოლოდ C-ის მტკიცებულებით)

- **Round 25 → done.** vitest floor 1045, `baseline_tree_at_round25`.
- **SRW-13 ეტაპი 1 → done.** R13-M3 **PASS**. R13-M4-ის export ნაწილი PASS-ია, meter ნაწილი დარჩენილია.
- **FB-14** რჩება **მუშავდება**: ცოცხალი meter და Clip indicator ჯერ არ არის (C-მაც აშკარად ასე თქვა).
- **SRW-13** რჩება **მუშავდება**: დარჩა ეტაპები 2a, 2b, 3 და 4.
- **C-R23-01:** ბაგია, **გაუარესდა**. დაემატა `round25_record` და `urgency`.
- **SRW-01** რჩება **ბაგია** (C-R23-01).
- Tech Lead-ის სიაში დაემატა **R26-T**.
- **`backlog.json` v27:**
  - round 25 → done (შედეგით), round 26 → dispatched;
  - SRW-13-ის stage 1 done; ეტაპი 2 გაიყო **2a** (round 26) და **2b**-ად (todo);
  - დაემატა `decisions_round26`;
  - loop runner-ის შენიშვნა → `-StartRound 26`.
- **`plan.md`:** D-29q, §5-ის ცხრილი, §10.
- **`feature-status.md`:** ზედა ნაწილში C-R23-01-ის ესკალაცია, round 26, FB-14, SRW-01, SRW-13, ბაგების ცხრილი, R26-T და root-ის carry.

## 4. B-ის გადაწყვეტილებები (D-29q)

1. **Round 26 = SRW-13 ეტაპი 2a:** Master-ის ცოცხალი meter, peak hold და latch-იანი Master Peak/Clip.
   - Round 25-თან ერთად ეს FB-14-ის „საბოლოო დონის/გადატვირთვის კონტროლს“ ასრულებს და R13-M4-ის meter ნაწილს ფარავს.
   - **ტრეკების meter-ები ეტაპი 2b-ა** (შემდეგი რაუნდი). ისინი lane-ის header-ის geometry-ს ეხება (81×4, 53/61/61/61, scroller-ის რიცხვები) და ცალკე შემოწმებას საჭიროებს. მოთხოვნა არ მცირდება.
2. **Tap — fan-out, post-fader.** B-ის probe (`b-round-25-probe.txt`; scratch copy `store/`-ის გარეთ, junction მოხსნილია, `node_modules` 618 entry ხელუხლებელია):
   - required `createAnalyser` `ScheduleAudioContext`-ზე → **28 tsc შეცდომა** გაყინულ `graph.test.ts`-ში (21) და `master.test.ts`-ში (7);
   - optional `tap` + `master.connect(tap)` → tsc **0**, graph + master **36/36**.

   `master.outputs` tap-ის გარეშე `[destination]` რჩება (გაყინული `graph.test.ts` l.142). Export-ში tap არ გადაეცემა.
3. **Analyser:** context ქმნის, დაცულია (გაყინულ fake-ებს `createAnalyser` არ აქვთ). გამოიყენება `getFloatTimeDomainData`, რადგან byte-ის ვარიანტი ±1-ზე ჭრის და გადატვირთვას მალავს. fftSize ≥ 4096 (≥ 85 ms), ასე რომ frame-ის დაგვიანებისას sample არ იკარგება.
4. **გადატვირთვის პრედიკატი** export-ისაა, ერთი განსაზღვრებით. ცოცხალი latch და export-ის FS დათვლა ერთმანეთს ემთხვევა.
5. **Latch** მხოლოდ click-ით სუფთავდება (T12.23). Reset edit არ არის: არც history, არც status, არც `Arrangement`-ის ველი.
6. **Render:** meter-ის frame ცალკე store/context-ით და DOM-ში ჩაწერით მიეწოდება. `ArrangementMaster` და მისი ყველა შვილი კომპონენტი frame-ზე 0-ჯერ რენდერდება, latch-ის გადასვლაზე ≤ 1-ჯერ.
   - B-მა გაყინული `master-ui.test.tsx` (l.570–636) grep-ით შეამოწმა. მასში არ არის სტრუქტურული assertion, რომელსაც მესამე ღილაკი ჩააგდებდა: მხოლოდ `contains`, `compareDocumentPosition`-ის რიგი (`<`, არა „უშუალოდ წინ“) და `ArrangementMaster`-ის render count. მისი fake `AudioContext`-ს `createAnalyser` არ აქვს, ამიტომ guard-ის გზას ამოწმებს. ფაილი გაყინული რჩება.
   - R26-ML: analyser ბოლო ≈ 85 ms-ს კითხულობს, ამიტომ C tap-ის ფანჯარას ამ სიგრძით აფართოებს.
7. **Oracle-ები რეალური აუდიოთი:**
   - `lay11` 0 dB-ზე → latch, `+5.0 ±0.5` (round 25-ის export-ის P) და C-ის tap-ის max ±0.5;
   - −6 dB → latch არ ირთვება (≈ `−1.0`);
   - −5.0 dB oracle-ად **არ** გამოიყენება: export-ის მარაგი 0.005 dB-ია, live resampling-ის გაურკვევლობაზე ნაკლები.
8. **R26-X:** gain note Master Mute-ის დროს იმალება. ეს ყველაზე მცირე პატიოსანი ქცევაა: ფაილი სიჩუმეა. ერთი პირობაა ფაილში, რომელსაც A ამ რაუნდში ფლობს, ამიტომ მეორე ფუნქცია არ არის.
9. **Frozen list:** `b-round-25-tree-sha256.txt`, **57 ფაილი** (B: 57 OK).
   - ეს არის round 24-ის 50 ფაილი, პლუს `types/arrangement.ts`, `model.ts`, `StudioWorkspace.tsx`, `schedule.test.ts`, `master.test.ts`, `master-ui.test.tsx` და doc 031.
   - Snapshot-ები: `b-round-25-snapshots/` (4 ფაილი).
   - მოსალოდნელი status: **58 ხაზი** (54 + 4 ჩამოთვლილი).

## 5. Root-ის carry (უცვლელი, გულწრფელად)

`root-pre-push-review.md` და `publication-checkpoint.json` არ შეცვლილა. ღიაა:
- SRW-21-ის hardcoded middle-east;
- Lenis `/studio/*`-ზე;
- portable paths;
- R13-M4-ის hard-clip: round 25-იდან ხილულია, round 26-იდან ცოცხალ indicator-საც იღებს; clamp რჩება;
- საბოლოო commit/push და round 6–25-ის დაუკომიტებელი tree;
- `Modal.tsx`-ის focus gap;
- GA `scroll` consent denied-ით;
- ორი უცხო agent ფაილი;
- fake Bearer → 500;
- CDP allowlist;
- publication-checkpoint-ის მოთხოვნები;
- A-ს round-17/19/22 deviation-ები და C-ის python probe-ები;
- C-R23-01 და charset-ის დაკვირვება.

ყველა ეს current-task-ის §4.11-შია.

## 6. გადაწყვეტილება

**CONTINUE.** Critical/high ღია ბაგი არ არის. დასრულებამდე დარჩა:
- SRW-13 (ეტაპები 2a, 2b, 3, 4) და SRW-14..20 (FB-04..07, FB-09..14);
- C-R23-01 (Tech Lead-ის არჩევანი, ახლა სასწრაფო);
- C-R6-02 / C-R8-01 (Tech Lead quiet Chrome);
- SRW-21-ის adapter;
- Tech Lead-ის ხელით შემოწმებები;
- სრული რეგრესია და root-ის შემოწმება;
- T12.

**BLOCKED არ არის.** Round 26-ს გარე ინფორმაცია, ნებართვა ან credentials არ სჭირდება. C-R23-01-ის ნებართვის კითხვა სხვა სამუშაოს არ აჩერებს.

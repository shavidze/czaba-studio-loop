# B — Round 26-ის შედეგი → Round 27-ის დაგეგმვა (D-29r)

ავტორი: B · თარიღი: 2026-10-11

## 0. Tech Lead-ისთვის

- **C-R23-01 ისევ ღიაა.** `/studio-lab`-ის SSR-ში 4 NUL-ია: 28013/28014 (ხილული `Arrangement · `) და 44397/44398 (music-ის `aria-label`). Round 25-ში 8 იყო, მაგრამ ეს მხოლოდ offset-ების გადაწევაა და არა გამოსწორება. B-მ დამოუკიდებლად გაიმეორა: live curl → 4, იმავე offset-ებზე (`b-round-26-ssr.html`).
- **კითხვა უცვლელია:** (a) React 19, ან (b) `app/entry.server.tsx`-ის ვიწრო grant A-სთვის (oracle `b-round-23.md` §3). პასუხისთანავე ის შემდეგ feature round-ზე ადრე დაიგეგმება.
- **ახალი, Low, არ ბლოკავს — DEMO-SFX-FULL-SCALE:** დემო `Soft impact` თავისთავად full scale-ს აღწევს. Master 0 dB-ზე Master Peak `+0.0` Clip-ს აჩვენებს, export კი 2 sample-ს ზღუდავს. ეს ერთი პრედიკატის თანმიმდევრული შედეგია. არჩევანი: (a) `lib/sfx-*`/demo-synth-ის ვიწრო grant, რომ დემოს პიკები ≤ `MAX_24BIT_SAMPLE` გახდეს, ან (b) მიღება.
  - B პრედიკატს **არ** ცვლის. ცვლილება R25-EO/R26-C0-ის მტკიცებულებას გააუქმებდა, და 24-bit export 1.0-ს მართლაც 1 LSB-ით ზღუდავს.

## 1. წყაროები

- `tasks/round-26.md`: არქივი, sha `49b7f26d…`, dispatch-ის `current-task.md`-ის იდენტური. ეს ასლია, არაფერი წაშლილა. ფაილი ადრე არ არსებობდა, ამიტომ არაფერი გადაწერილა.
- `a-round-26.md`, `c-round-26.md`, `c-round-26.json`.
- `backlog.json` (v27 → v28), `plan.md`, `feature-status.md`.
- `root-pre-push-review.md` და `publication-checkpoint.json` (უცვლელია).
- `next-stage-t12/gain-volume-source.txt` T12.20–T12.23.
- `docs/video-to-text-bugs/README.md` (FB-04, FB-05, FB-14).
- წყაროს კოდი (read-only): `graph.client.ts`, `meter.ts`, `ArrangementContext.tsx` (meter-ის ნაწილი), `ArrangementLane.tsx` (header), `ArrangementMaster.tsx`, `panels.ts`. ტესტები: `render-budget.test.tsx`, `track-layout.test.tsx`, `graph.test.ts`, `meter-ui.test.tsx`.

**Advisor:** ხელმისაწვდომი იყო. B-მა ორჯერ გამოიძახა: ერთხელ orientation-ის შემდეგ, წერამდე, და ერთხელ დაწერილი task-ის შესამოწმებლად. პირველი რჩევა გამოყენებულია:
- UI კონტრაქტის არჩევამდე probe-ები;
- post-panner tap `panner.connect(master)`-ის შემდეგ;
- per-channel tap-ები ღირებულების oracle-ით;
- geometry ახალი row-ის გარეშე;
- reset-ის ერთი წერტილი;
- Solo-ზე დაფუძნებული oracle-ები;
- R26-T-ისა და time-to-floor-ის შესწორება;
- `Soft impact` Tech Lead-ს გადაეცა;
- M1 მოგვიანებითი hardening-ია.

B-მა oracle-ის ერთ რჩევას გადაუხვია: „unsoloed ტრეკი ≤ Master“ ამოიღო, რადგან mix-ში ნაწილობრივი გაქრობა შესაძლებელია. მის ნაცვლად გამოიყენება შედარება იმავე ტრეკის solo მაქსიმუმთან ±0.5 dB.

მეორე გამოძახების (review) შედეგად current-task-ში ოთხი რამ გასწორდა:
1. M2c-ის unmount ტესტი დაკვირვებადი გახდა. Store-ის subscribe wrapper-ით იწერება unsubscribe spy-ები და მოწმდება, რომ თითოეული ზუსტად ერთხელ გამოიძახება. ძველი ვერსია vacuous იქნებოდა. დაემატა mutation (f).
2. R27-TF: tight მხოლოდ ვიდეოს ხაზზეა მიღწევადი, რადგან audio-ს min 60 px-ია. სიმჭიდროვეები ასე ნაწილდება: 1440 → full 81; 1280 ღია detail-ით → video 53 tight, audio 61 regular; fold → 36.
3. R27-L: header-ის control-ების rect-ის შემოწმება თვითკმარია. C rect-ებს meter-ით ზომავს, შემდეგ meter-ს runtime-ში `remove()`-ით აშორებს და rect-ები იდენტური უნდა იყოს.
4. Advisor-ის გამოძახებების რაოდენობა ამ ანგარიშში და backlog-ში გასწორდა.

**სარეზერვო ასლები შესწორებამდე:** `feature-status.before-b-round-26.md`, `backlog.json.bak-before-b-round-26`, `plan.before-b-round-26.md`, `b-scripts/b-next.before-r27.json`.

## 2. რა დაადასტურა C-მ (მხოლოდ დამოუკიდებელი მტკიცებულება)

C round 26: **PASS**, scope-ში ახალი ბაგის გარეშე.

| ID | C-ის შედეგი | მტკიცებულება |
|---|---|---|
| R26-ML | meter − tap: −0.042…+0.029 dB; Δ −6.0 ×3; video-only beep-ები −5.9 | `c-round-26.md` §3 |
| R26-MP | hold 1500–1513 ms, 0 დარღვევა; Pause იმავე task-ში floor-ზე; Peak ტექსტი უცვლელი | §4 |
| R26-C0 / C6 | latch ~2.0 წმ-ზე, `+5.0` vs tap +4.995 (3/3); −6 dB-ზე `−1.0`, clear (3/3) | §5 |
| R26-CR / CM | reset მხოლოდ click-ით, edit არ არის; mute-ზე floor 2.36–2.57 წმ, latch არ არის | §6–§7 |
| R26-RB | frame-ზე 0 render; latch-ზე და reset-ზე 1 meter render; drift 20.1 ms | §10 |
| R26-X / E | dialog-ის პირობა; FS 1800, RMS −15.481, OfflineAudioContext-ზე analyser 0 | §11 |
| R26-K / L / R / S / U / Doc | Tab, Space/Enter; header 35, row-ები და scroller = r25; mutation-ები a–d | §8–§9, §12–§14 |
| G26-1..3 | tsc 0, vitest **1072/1072**, build, Biome 218 warning / 0 error; 57 OK; 58 ხაზი; ანონიმური გარემო სუფთაა | §15 |

**B-ის დამოუკიდებელი შემოწმება (2026-10-11):**
- HEAD `c5ed47b`;
- `git status` = 58 ხაზი, `c-round-26/gates/git-status-end.txt`-ის იდენტური (`b-round-26-git-status.txt`);
- `b-round-25-tree-sha256.txt` → 57 OK;
- 8 owned sha ემთხვევა C-ის ჩანაწერს: `ed52f465`, `ff6c7d2e`, `32108f28`, `0de72e4f`, `89bc8e06`, `fcdbd91c`, `afef9745` და doc `b538daab`;
- live curl → NUL 4.

**A-ს deviation-ები 1–5** (`a-round-26.md` §6) C-მ მიიღო და B ეთანხმება:
- splitter + 2 analyser (H1, mono down-mix);
- `meterFreshFromRef`;
- latch-ის render `ArrangementMasterMeter`-ზე;
- ხილული „Clip“ label უარყოფილია;
- `resetMasterPeak` main value-შია.

## 3. სტატუსის ცვლილებები (მხოლოდ C-ის მტკიცებულებით)

- **Round 26 → done.** vitest-ის floor 1072, `baseline_tree_at_round26`.
- **SRW-13 ეტაპი 2a → done. R13-M4 → pass.** R13-M3 უკვე pass იყო.
- **FB-14 → მოწმდება.** C-ის ყველა ID PASS-ია, დარჩა მხოლოდ Tech Lead-ის R25-T/R26-T.
- **SRW-13** რჩება **მუშავდება**: დარჩა ეტაპები 2b, 3 და 4.
- **C-R23-01:** ბაგია, დაემატა `round26_record`.
- **ახალი Low ჩანაწერები:**
  - R26-M1 (rAF-gap);
  - DEMO-SFX-FULL-SCALE (Tech Lead);
  - MASTER-HOLD-TICK-EDGE (ეტაპი 4).
- **R26-T-ის ტექსტი გასწორდა** (C §17.1): Clip ~2.0 წმ-ზე ინთება, `+5.0` მაქსიმუმი ~4.0 წმ-ზეა. დაემატა **R27-T**.
- **Harness-ის წესი** (from_round 27): time-to-floor = (L0+60)/20 წმ + 0.1 წმ; ტრეკის სიმართლე Solo-თი; „ტრეკი ≤ Master“ არასოდეს.
- **`backlog.json` v28:**
  - round 26 → done (შედეგით), round 27 → dispatched;
  - stage 2b dispatched (acceptance ID-ებით), stage 4-ს Master-ის hold tick დაემატა;
  - დაემატა `decisions_round27`;
  - განახლდა `planned_rounds` და loop runner-ის შენიშვნა → `-StartRound 27`.
- **`plan.md`:** D-29r, §5-ის ცხრილი, §10.
- **`feature-status.md`:** Tech Lead-ის ბლოკი, round 27, round 26-ის შედეგი, FB-14, SRW-01, SRW-13, ბაგების ცხრილი, R26-T/R27-T და root-ის carry.

## 4. B-ის გადაწყვეტილებები (D-29r)

1. **Round 27 = SRW-13 ეტაპი 2b:** ცოცხალი meter ყოველი ტრეკის header-ში, ტრეკის over-0 გაფრთხილებით (T12.20, T12.22, T12.23). ეს ერთი ფუნქციაა. ეტაპები 3 და 4 უცვლელად რიგშია, მოთხოვნა არ მცირდება.
2. **B-ის probe-ები (read-only grep):**
   - `render-budget.test.tsx` render-ებს `type.name`-ით ითვლის. `ArrangementLane` frame-ზე 0-ს უნდა უდრიდეს, ამიტომ meter ცალკე სახელიანი კომპონენტია, საკუთარი store slice-ით.
   - `track-layout.test.tsx` header-ის ღილაკების რაოდენობას არ ამოწმებს. ამოწმებს მხოლოდ შემდეგს:
     - `textContent`-ში `ორიგინალი ხმა`-ს (l.308/313);
     - `style.height === ''`-ს (l.458);
     - `nextElementSibling`-ს (l.991–992).

     ამიტომ meter header-ის შიგნითაა, inline style-ის გარეშე, და sr-only ტექსტში `track.name` გამოიყენება.
   - `graph.test.ts` `outputs[0]`-ს მიჰყვება, ამიტომ tap `panner.connect(master)`-ის შემდეგ უნდა დაემატოს.
   - `meter-ui.test.tsx` **ზუსტად** 1 splitter-ს და 2 analyser-ს ამოწმებს (l.348, 351, 362, 363, 376). Per-track tap-ები მხოლოდ ამ ხუთ ხაზს არღვევს, ამიტომ A-ს ვიწრო შესწორების ნებართვა აქვს: ზუსტი ფორმულები `1 + tracks` / `2 + 2 × tracks`, Master-ის assertion-ები სიტყვასიტყვით რჩება.
     - ალტერნატივა იყო tap-ების შექმნა მხოლოდ იმ შემთხვევაში, თუ meter კომპონენტი mount-ებულია. ის უარყოფილია: ეს გაყინულ ტესტზე მორგებული დიზაინი იქნებოდა.
3. **Tap — post-panner:**
   - T12.20-ის ტრეკის output stage-ია და ეტაპი 4-ის pan-ს ასახავს;
   - Volume/Mute/Solo-ს მოიცავს;
   - Master Mute-ზე ტრეკების meter-ები მოძრაობას აგრძელებს, რადგან pre-master-ია. ეს სწორია და R27-TR ამას ამოწმებს.
4. **Latch:**
   - პრედიკატი იგივეა;
   - ტრეკზე warning token-ია, არა destructive (T12.22);
   - ფერის გარდა ფორმის ნიშანი და sr-only ტექსტიც აქვს;
   - reset-ის ერთი წერტილია: არსებული `resetMasterPeak` (გაყინული Master Peak ღილაკი) ყველაფერს ასუფთავებს. ახალი Tab stop არ ემატება და lane-ის Tab რიგი (round 24-ის a11y) უცვლელია. ეს ყველაზე მცირე პატიოსანი ქცევაა. ტრეკის `title` reset-ის გზას ასახელებს. Per-track reset-ის UX შეიძლება ეტაპ 4-ის fader UX-თან ერთად გადაიხედოს.
5. **Geometry:**
   - absolute ზოლი header-ის ქვედა 6 px padding-ში, ყველა სიმჭიდროვეზე (folded 36, tight 53, regular 61, full 81);
   - ყველა row, scroller, მცურავი ვიდეო და header-ის control-ის rect = round 26.
6. **Oracle-ები რეალური აუდიოთი:**
   - R27-TL: soloed ტრეკი = tap ±1.0 dB;
   - R27-TI: unsoloed = იმავე ტრეკის solo ±0.5 dB, discrimination-ის ანგარიშით;
   - R27-TM: mute → time-to-floor;
   - R27-TV: Volume 0.50 → −6.0 ±0.5 dB;
   - R27-TW: Master −6 dB-ზე Master clear, ტრეკი შეიძლება over-ში იყოს;
   - R27-TO: `Soft impact`-ის fixture, reset-all;
   - R27-RB: 0 render + drift ≤ 30.1 ms.
7. **Frozen list:** `b-round-26-tree-sha256.txt`, **60 ფაილი**: round 25-ის 57 მინუს `ArrangementLane.tsx`, პლუს `ArrangementMaster.tsx`, `ArrangementExportDialog.tsx`, `meter.test.ts` და doc 032. B-მა შეამოწმა: 60 OK.
   - Snapshot-ები `b-round-26-snapshots/`-შია (5 ფაილი).
   - მოსალოდნელი status: **62 ხაზი** (58 + 4).
8. **R26-M1** (A-ს M1): Low hardening ეტაპი 4-ის შემდეგ, საბოლოო რეგრესიამდე. AudioWorklet module URL-ს საჭიროებს, `public/**` კი აკრძალულია. Tech Lead-ს მისი მიღებაც შეუძლია. ფუნქციის მოთხოვნა არ არის; export-ის alert ფაილისთვის ავტორიტეტული რჩება.

## 5. Root-ის carry (უცვლელი, გულწრფელად)

`root-pre-push-review.md` და `publication-checkpoint.json` არ შეცვლილა. ღიაა:
- SRW-21-ის hardcoded middle-east;
- Lenis `/studio/*`-ზე;
- portable paths;
- export-ის hard-clip: R13-M4 PASS-ია, ხილულია export-ში და ცოცხლადაც; clamp რჩება;
- საბოლოო commit/push და round 6–26-ის დაუკომიტებელი tree (58 ხაზი);
- `Modal.tsx`-ის focus gap;
- GA `scroll` consent denied-ით;
- ორი უცხო agent ფაილი;
- fake Bearer → 500;
- CDP allowlist;
- publication-checkpoint-ის მოთხოვნები;
- A-ს round-17/19/22 deviation-ები და C-ის python probe-ები;
- C-R23-01 და charset-ის დაკვირვება.

ყველა ეს current-task-ის §4.12-შია.

## 6. გადაწყვეტილება

**CONTINUE.** Critical/high ღია ბაგი არ არის. დასრულებამდე დარჩა:
- SRW-13 (ეტაპები 2b, 3, 4) და SRW-14..20 (FB-04..07, FB-09..13);
- C-R23-01 (Tech Lead-ის არჩევანი);
- C-R6-02 / C-R8-01 (Tech Lead quiet Chrome);
- Low: R26-M1, DEMO-SFX-FULL-SCALE (Tech Lead), MASTER-HOLD-TICK-EDGE, LIB-SEP-REASON, R9-REVIEWER-M1-L8;
- SRW-21-ის adapter;
- Tech Lead-ის ხელით შემოწმებები;
- სრული რეგრესია და root-ის შემოწმება;
- T12.

**BLOCKED არ არის.** Round 27-ს გარე ინფორმაცია, ნებართვა ან credentials არ სჭირდება. Tech Lead-ის ორი ღია კითხვა (C-R23-01, დემო SFX) სხვა სამუშაოს არ აჩერებს.

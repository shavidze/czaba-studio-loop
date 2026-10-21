# C round 28 — SRW-24: Delete ტოვებს სიცარიელეს, Ctrl+Shift+L ყველა ხაზი, Ctrl+Shift+X ერთადერთი დროის ამოჭრა (დამოუკიდებელი შემოწმება)

**თარიღი:** 2026-10-12 · **შემმოწმებელი:** C · **გარემო:** dev server `127.0.0.1:5173` მუშაობდა (200); gstack browse `c-browse.json`; `node.exe` 35–41.
**საბოლოო სტატუსი:** **FAIL** — SRW-24-ის ყველა შეცვლილი კრიტერიუმი რეალურ Studio-ში **PASS**-ია, მაგრამ §4.1-ის C-R27-01 ღია რჩება: round 26-ის layout-ზე drift 30.1 ms-ს გადააჭარბა (vm-3 125.4, vm-5 287.6; vm-4 19.0). ბიუჯეტი ამოიწურა. ცხრილის row 2 vs row 3 დამოკიდებულია იმაზე, ჩაითვლება თუ არა vm-3 ვალიდურად (მისი click-ები procedure-იდან ~2 s-ით იყო გადაწეული) — ორივე წაკითხვა §6-შია, row-ს B ირჩევს. დამატებით 2 ახალი Low ბაგი და Ableton-ის ცხრილის წყაროს შესწორება B-სთვის (§9).

Artifacts: `c-round-28/` (`gates/`, `runs/`, `shots/`, `scripts/`, `mut28.mjs`, `checkpoint.md`), `c-round-28.json`.

## 1. შედეგები ID-ების მიხედვით

| ID | CZABA მოთხოვნა | მტკიცებულება |
|---|---|---|
| G28-1 | **PASS** | `gates/tsc.txt`, `vitest-*.txt`, `biome-app.txt`, `build.txt` |
| G28-2 | **PASS** (start = end) | `gates/*-start.*`, `*-end.*` |
| G28-3 | **PASS** | `gates/anon-*.json`, `network-anon-*.txt`, `curl-token.txt`, `shots/anon-studio-middle-east.png` |
| R28-DA | **PASS** (+ export) | `runs/da-pre.json`, `da-post.json`, `da-export.json` |
| R28-DB | **PASS** | `runs/db.txt` |
| R28-DV | **PASS** | `runs/dv-pre.json`, `dv-post.json`, `dv-play-1.json` |
| R28-DM | **PASS** | `runs/dm.txt` |
| R28-VL | **PASS** | `runs/vl.json`, `shots/vl-1440.png` |
| R28-VD | **PASS** (+ export) | `runs/vd-pre.json`, `vd-post.json`, `vd-export.json` |
| R28-CX | **PASS** (while-playing-ის „export matches“ ქვე-oracle: **method substitution** — source offset-ები, §3) | `runs/cx-all.json`, `cx-paste.json`, `cx-single.json`, `cx-playing.json` |
| R28-UR | **PASS** | §3 |
| R28-PS | **PASS** | `runs/ps-da.json`, `ps-vd.json` |
| R28-TF | **PASS** | `runs/tf-button.txt`, §4 |
| R28-UI | **PASS** | `runs/ui-geo.txt`, `shots/ui-alllane-*.png` |
| R28-K | **PASS** | `runs/k-1440.txt`, `k-1280.txt`, `k-space.txt`, §5 |
| R28-E | **PASS** | `runs/da-export.json` |
| R28-R | **PASS** | `runs/r9c4.txt`, §4, §6 |
| R28-S | **PASS** (A-ს გამოცხადებული 1 string hunk-ით) | `gates/snap-*-start.diff` |
| R28-U | **PASS** | `runs/r28u-*.txt/.diff`, `mut28.mjs` |
| R28-Doc | **PASS** (1 შენიშვნით, §8) | doc 034 |
| C-R27-01 | **FAIL, ღია** (row 2 ან row 3 — §6, B ირჩევს) | `runs/vm-1..5.txt`, `vm-3-drift-detail.json` |
| C-R27-02 | 3/3 batch მწვანე, `node.exe` 35–36 (r27: A 40–42, B 34) — B წყვეტს | `gates/vitest-r27batch-1..3.txt` |
| R27-TL (restated) | **PASS** (SFX run 2; run 1 ხელახლა ვერ შეფასდა) | `c-round-27/runs/tl-sfx-2-model.json` |
| R27-K 1440 + Space-on-M | **PASS** | `runs/k-1440.txt`, `k-space.txt` |
| R27-L floating video | **PASS** | `runs/fv-1440.txt`, `shots/fv-1440.png` |
| R27-TO reset + Redo | **PASS** | `runs/r27to-redo.txt` |
| R27-E offline nodes | **PASS** | `runs/r27e-offline-hook.json` |
| R27-R (track Mute, loop seam, library drop) | **PASS** | `runs/r27r-track-mute.json`, `ur-1.txt`, `r27r-drops.json` |
| R27-TI video floor | **PASS** (reference §6-ში) | `runs/r27ti-video-floor.json` |
| C-R23-01 | ჩანაწერი (არც PASS, არც FAIL) | `runs/c-r23-01-record.txt`, `ssr-1..3.html` |

## 2. Gate-ები

**G28-1** (ჩემი გაშვება, `node.exe` 35–37):
- `tsc --noEmit` exit 0.
- ახალი 2 ფაილი + `ArrangementContext.test.ts`: **44/44**. ახალი `it` = **23** (10 + 13) ≥ 16.
- Frozen 10 (§4.6 სია): **194/194**.
- სრული `vitest`: **65 ფაილი, 1119/1119** (= 1096 + 23).
- Biome `./app`: exit 0, **218 warning + 1 info** (= r27).
- `npm run build` exit 0.
- `ArrangementContext.test.ts`: snapshot-თან diff = **ზუსტად ხაზი 567** (`'დროის წაშლა'` → `'წაშლა მონაკვეთზე'`).

**G28-2:** HEAD `c5ed47b`. `b-round-27-tree-sha256` → **66 OK**. `git status` = **66** ხაზი = `b-round-27-git-status.txt` + ზუსტად §3.2-ის 4 ხაზი (` M clipboard.ts`, `?? delete-selection-ui.test.tsx`, `?? delete-selection.test.ts`, `?? 034-…md`). Protected 4/4 OK. `Header.tsx`: cc1e531-თან +21/−0, HEAD-თან ცარიელი. Forbidden paths-ის status ცარიელი. Owned 10 ფაილის sha start = end.

**G28-3:**
- Curl: ანონიმური token → **401** `Please sign in to access Studio.`; fake Bearer → **500** `Unable to prepare Studio access`, token არ გაცემულა (ცნობილი root item).
- ახალი browser context (cookie ცარიელი, `auth_user` null), `/studio-lab` პირდაპირ და header-ის `Studio Lab` ბმულით: 4 ხაზის მეტრი + Master, library 21 ღილაკი.
- Session (video drop, library drop, range delete, Ctrl+Shift+L, Delete, Undo, Ctrl+Shift+X, Play, Export) — ჩემი fetch/XHR hook: fetch 0, xhr 0, `Authorization` **0**.
- Network: მხოლოდ `middle-east.mp3`, `hero-music.mp3`, ერთი `blob:`, ცნობილი `GET /api/cart` (backend off), GA consent-denied, fonts, dev-module `r2.config.ts`. `/api/studio-token`, `/api/recording-*`, `/api/download`, R2 host — **0**.
- `/studio/middle-east` → „Sign in required“, მეტრები 0. Premium auth bypass არ არის.

## 3. SRW-24 — clip ცხრილები და აუდიო

**Layout (§4.2):** video `beeps-6s-vp9-opus.webm` 0–6.008 · music `სრული მიქსი` 0–10 (trim) და 12–28 · SFX `Soft impact` 4–6. Music solo (ერთი history ჩანაწერი `Solo — მუსიკა`), playhead 7.

| ნაბიჯი | music | SFX | video | label / pos / loop |
|---|---|---|---|---|
| წინ | 0–10 @0 · 12–28 @0 | 4–6 @0 | 0–6.008 @0 | pos 7 |
| **DA** Delete 3–5 (music) | 0–3 @0 · **5–10 @5** · 12–28 | 4–6 | 0–6.008 | `წაშლა მონაკვეთზე`, pos **7**, status `⌫ წაიშალა 00:03.000 — 00:05.000 მუსიკა ხაზზე; სიცარიელე დარჩა.` |
| **DB** Backspace / Shift+Delete / Shift+Backspace | იგივე ×3 | იგივე | იგივე | იგივე ×3, pos 7 |
| ⌫ ღილაკი (real click) | იგივე | იგივე | იგივე | იგივე |
| **DV** Delete 2–4 (video) | უცვლელი | უცვლელი | 0–2 @0 · **4–6.008 @4** | `წაშლა მონაკვეთზე` |
| **DM** 1 კლიპი (music 12) | 0–10 | 4–6 | 0–6.008 | `კლიპის წაშლა`, სიცარიელე |
| **DM** 2 კლიპი 2 ხაზზე (music 12 + SFX) | 0–10 | — | 0–6.008 | `კლიპების წაშლა (2)` |
| **VD** loop 6–8, Ctrl+Shift+L, Delete 3–5 | 0–3 · 5–10 @5 · 12–28 | **5–6 @1** | 0–3 · **5–6.008 @5** | `წაშლა მონაკვეთზე (ყველა ხაზი)`, pos **7**, loop **6–8** |
| **CX** all-lane 3–5, Ctrl+Shift+X | 0–3 · 3–8 @5 · **10–26** | **3–4 @1** | 0–3 · 3–4.008 @5 | `Cut Time`, pos 7→**5**, loop 6–8→**4–6** |
| CX + Ctrl+V 30 | + 30–32 @3 | + 31–32 @0 | + 30–32 @3 | `ჩასმა (3)` — ორიგინალ ხაზებზე |
| CX single-lane 3–5 | = all-lane CX | = | = | `Cut Time`, 3 ნაწილი |

- DA ID-ები: მარცხენა ნაწილი ინარჩუნებს `1abf3173`-ს, მარჯვენა ახალია. სხვა კლიპების `start` უცვლელია.
- **Export (DA, music solo, 28.000 s = 1 344 000 frame, PCM 24-bit 2ch 48 kHz, NaN 0):** after `[3,5)` = **ციფრული 0** (nonzero 0; before −4.7 dBFS). `[0,3)` max |Δ| **0 LSB**, `[5,10)` **0 LSB**, `[10,28)` **0 LSB**.
- **Export (VD, unsoloed full mix):** `[3,5)` = **ციფრული 0** (before peak 0.0 dBFS — ცნობილი DEMO-SFX-FULL-SCALE). `[0,3)` 0 LSB, `[5,28)` max **1 LSB** (≤ 1 LSB oracle).
- **R28-E:** DA export ცხრილს ემთხვევა: სიგრძე = ბოლო კლიპის ბოლო (28), NaN 0, header სწორი, gap ჩუმი.

**R28-UR:** DA, VD და CX თითო = **ერთი** history ნაბიჯი. Ctrl+Z ზუსტად აბრუნებს ცხრილს (id-ებით), Ctrl+Y / Ctrl+Shift+Z ზუსტად იმეორებს. Loop/pos DA/VD-ზე უცვლელია. Cut Time-ის Undo loop-ს აბრუნებს, playhead-ს არა (pos რჩება 5-ზე; ეს Cut Time-ის ძველი ქცევაა, „sync“ oracle-ს არ არღვევს).

**R28-DV playback (from 1.5, 1 run):** 2–4-ში dock აჩვენებს `ვიდეო არ არის · …`, `<video>` paused. 4.01-იდან video time = pos (clip time − 4 + 4.000). Tolerance **R3-V1: median |d| ≤ 0.05 s, max ≤ 0.1 s** → 4–6.008: median **2.9 ms**, max **48.1 ms** (4.3-დან max 11.2). Dock hardSeeks 0. 1.5–2: max 34.7 ms.

**R28-CX while playing (old R1-B12, 1 run):** play 7, range 4–6, Ctrl+Shift+X ≈ 8.3–8.7-ზე (browse press latency). Playhead ხტება **−1.88** frame-ში (= −2.000 + 120 ms frame), შემდეგ slope **1.000**, playback არ გაჩერებულა. ახალი music source: `off 8.7787` @ pos 6.7787 → clip music@4 (off 6) — **ზუსტი თანხვედრა**. Video და SFX ცხრილი = `deleteTime`. „export after the edit matches“: სინქრონი შემოწმდა source start offset-ებით და არა tap-vs-export-ით.

**R28-PS (1 run თითო):**
- **DA, music solo, Delete ≈ 2.05-ზე:** pos-ის მინიმალური ნაბიჯი **0** (უკან ნახტომი არაა), ერთი reschedule. Tap (128-frame blocks) **−∞** 3.0-იდან 4.997-მდე. (`gapFrom60` −9.2 dB იყო block, რომელიც 5.000-მდე 2.0 ms-ით იწყება და მარჯვენა ნაწილის onset-ს შეიცავს; ფანჯრის ზუსტი ბოლოთი max = −∞.) Video drift: 1–3 median 14 / max 35 ms; 5.3–6 median 13 / max 18 ms. hardSeeks 0.
- **VD, unsoloed, Ctrl+Shift+L + Delete ≈ 2.34-ზე:** მთლიან mix-ზე `[3.06, 4.997)` **−∞** (726 block). Video: max 41 / 18 ms; dock-ის gap state 152 frame; hardSeeks 0.

## 4. R28-VL / TF / R — უარები და guard-ები

- **VL:** Ctrl+Shift+L (real `Control+Shift+KeyL`) → 4 ხაზზე თითო `arrangement-lane-range` `3.000/5.000`, label ერთხელ (music), clip overlay 0, loop **არ** ჩაირთო, Undo უცვლელი, **Redo stack შენარჩუნდა**, status `მონიშვნა ყველა ხაზზე: 00:03.000 — 00:05.000.`, ⌫ title = all-lane string.
- Ctrl+Shift+L range-ის გარეშე → status `ყველა ხაზზე გასავრცელებლად ჯერ მონიშნე მონაკვეთი (Ctrl+Shift+L).`, range null. Ctrl+L → `Loop შეიქმნა`, brace 3–5, flag არ დაყენდა.
- Ctrl+Shift+L, შემდეგ click ცარიელ ხაზზე → range იშლება (playhead click-ის ადგილას გადადის, როგორც ადრე). Status ძველ „მონიშვნა ყველა ხაზზე …“-ს აჩვენებს — stale status, ინფორმაცია (§9).
- **TF:** Backspace/Delete library search-ში (ტექსტი `abc`→`ab`) და detail number input-ში (range 6–8 რჩება) — clip-ები უცვლელი. Track-ის სახელის ველი editable არ არის (n/a). Delete მონიშვნის გარეშე → `წასაშლელად აირჩიე კლიპი ან მონიშნე მონაკვეთი.`, არაფერი. Ctrl+E და Split ღილაკი all-lane-ზე → `გაყოფა ყველა ხაზის მონიშვნაზე არ სრულდება — …`, history/range უცვლელი (ღილაკი enabled რჩება — A-ს finding 5).
- **Zero-width range** (3 px drag უკან, 15–15): Delete და all-lane Delete → no-op status, history 0, clip-ები უცვლელი.
- **Gesture guard:** clip drag-ის დროს Delete, Ctrl+Shift+L, Ctrl+Shift+X → `GESTURE_EDIT_BLOCKED_MESSAGE`, არაფერი შეიცვალა.
- **R9-C4:** paste გადაფარვაზე → `ჩასმა ვერ შესრულდა: მუსიკა ხაზზე 00:13.000–00:15.000 დაკავებულია. არაფერი შეცვლილა.`, history უცვლელი. Ctrl+Shift+X range-ის გარეშე → `Cut Time-ისთვის ჯერ მონიშნე მონაკვეთი (Ctrl+Shift+X).`. ცარიელი clipboard ამ სესიაში არ შემოწმდა (clipboard უკვე ივსებოდა).
- Track meters დაკვრისას მოძრაობს (R27-TO-ს latch run, video floor run). Header 35, rows 81×4 1440-ზე.

## 5. R28-UI / R28-K

| მდგომარეობა | footer | hint | scroller | rows |
|---|---|---|---|---|
| 1440, 1 clip, panel open | 69 | 16 (1 ხაზი) | **496** | 81×4 |
| 1440, panel collapsed | 69 | 16 | **604** | 81×4 |
| 1280, panel open | 69 | 16 | **280** | **53/61/61/61** |
| 1280, panel collapsed | 69 | 16 | **386** | 81×4 |
| range / all-lane (ორივე viewport) | 89 (+range ხაზი 16) | 16 | 476 / 280 | უცვლელი |

= C round 27 R27-L-ის ციფრები ზუსტად. Hint: `… Ctrl+Shift+X (Cut Time) · Ctrl+Shift+L · Ctrl+L · Ctrl+A · Delete / Backspace · …`, overflow არ არის. Range-ის ხაზის `arrangement-delete-hint` = `Delete = წაშლა, სიცარიელე რჩება · Ctrl+Shift+X = Cut Time` (1 ხაზი). ⌫ title/aria-label სამივე მდგომარეობაში = §2.4.

**R28-K:** Tab `← CZABA`-დან music Volume-მდე: 1440 = 1280 = r27 1280 (განსხვავება მხოლოდ state-ზეა დამოკიდებული: Redo ღილაკი, search-clear). Space music-ის სახელზე და `M`-ზე → playback toggle, mute უცვლელი. Ctrl+Z/Y/Shift+Z, Ctrl+A (6 კლიპი), Ctrl+D range-ზე უარი (`დუბლირება კლიპებზე მუშაობს; Duplicate Time არ არის.`), Ctrl+C (`Copy: მუსიკა 00:14.000–00:16.000 (1 ნაწილი).`), Ctrl+V 30-ზე, Ctrl+X ერთ ხაზზე (გაპი რჩება) — თითო run, PASS.

## 6. §4.1 — round 27-ის დავალიანება

**C-R27-01 (წინასწარ რეგისტრირებული ცხრილი):** ახალი გვერდი, sp22 + h26 პირველ Play-მდე, lay11, **music muted** (r26 vm-1), 1440, `c-round-25` vm მეთოდი.

| run | სტატუსი | issued mute / unmute / keys | რეალური Master Mute click (pos) | drift max | dock hardSeeks | node.exe |
|---|---|---|---|---|---|---|
| vm-1 | არავალიდური (harness: sp22 raw flush ცარიელი → ანალიზი ჩავარდა) | 0.681 / 2.401 / 3.942 | — | — | — | 37 |
| vm-2 | არავალიდური (იგივე) | 0.721 / 2.331 / 3.462 | — | — | — | 37 |
| vm-3 | ვალიდური | 2.441 / 3.641 / 4.761 | 3.251 / 4.102 | **125.4 ms** | 0 → 0 | 37 |
| vm-4 | ვალიდური | 0.830 / 2.438 / 3.609 | 1.190 / 2.878 | 19.0 ms | 0 → 0 | 37 |
| vm-5 | ვალიდური | 0.750 / 2.510 / 4.041 | 1.201 / 3.339 | **287.6 ms** | 0 → 0 | 37 |
| r26 vm-1 | reference | 0.689 / 2.438 / 3.278 | — | 20.1 | 0 → 0 | — |

- Browse command latency ~300 ms, click ~0.4–0.8 s აგვიანებს; ამიტომ click-ის რეალური დრო r26-ს ზუსტად ვერ ემთხვევა (გულახდილად).
- Excursion-ები: vm-3 0.94–2.80 (video ჩამორჩება ≤ 125 ms, **mute click-მდე**), vm-5 1.33–2.91 (mute-ის 1.20-ის შემდეგ). vm-4 სუფთაა.
- **ორი წაკითხვა (row-ს B ირჩევს; ბიუჯეტი 3 + 2 ამოწურულია):**
  - **vm-3 ვალიდურია** → 2/3 > 30.1 ms → **row 2**: ატრიბუტირებული რეგრესია r26-თან იმავე layout-ზე, A-ს bug round.
  - **vm-3 environment-invalid-ია** (გადამწყვეტი ფაქტი: browse-ის latency-ის გამო vm-3-ის **ყველა** მოქმედება procedure-იდან ~2 s-ით გადაიწია — issued 2.44/3.64/4.76, landed 3.25/4.10, ნაცვლად ~0.5/2.3/3.2; იგივე კატეგორია, რითაც vm-1/2 ჩავანაცვლე) → ვალიდური მხოლოდ vm-4 (PASS) და vm-5 (FAIL), ჩანაცვლება აღარ რჩება → ფაქტობრივად **row 3**: Tech Lead-ის quiet Chrome.
  - ჩემი რეკომენდაცია: row 3-ის წაკითხვა უფრო ზუსტად იცავს „იგივე procedure“-ს პირობას; მაგრამ vm-5 თავისთავად 287.6 ms-ია procedure-ის ფარგლებში.
- **ატრიბუციის მონაცემი ამ round-იდან:** vm-5-ში excursion იწყება 1.33-ზე, Master Mute click-იდან (pos 1.20) **~130 ms**-ში, hardSeek counter-ის ცვლილების გარეშე — row 4-ის ჰიპოთეზის მეზობლად, მაგრამ row 4 არ ამოქმედდა (hardSeek 0). vm-3-ში excursion იწყება 0.94-ზე, **ნებისმიერ click-მდე**. r27-ის 2/2 hardSeek ამ layout-ზე (music muted) არ განმეორდა. დატვირთვა (37 node.exe) ალტერნატიული ახსნაა. ტოლერანსი არ შესუსტებულა.
- **Row 4 არ ამოქმედდა** (hardSeek 0 ყველა run-ში).

**C-R27-02:** r27-ის frozen 8 batch ×3 → **152/152, 152/152, 152/152**, `node.exe` 35–36. დატვირთვა: ჩემი 35–36 vs r27-ში A 40–42 და B 34 — A-ზე დაბალია, B-ზე არა. პირობის („recorded lower load“) შესრულებას არ ვამტკიცებ; ციფრებით B წყვეტს.

**R27-TL (restated oracle):** sustained ფანჯრები (music ×3, stems, video, SFX onset 4–5) r27-ში PASS იყო ±1.0 dB-ით. SFX decay — `tl-sfx-2-model.json` (stepMeter, 20 dB/s, n=160): **p95 0.11 dB**; onset frame 4.002 (−60, onset ფანჯარას ეკუთვნის) გამორიცხვით **max 0.35 dB** (6.029) → PASS (≤ 0.5 / ≤ 1.0). SFX run 1-ს per-frame მონაცემი არ შეუნახავს → ხელახლა ვერ შეფასდა.

**სხვა r27 §13 პუნქტები:**
- **R27-K 1440 + Space-on-M:** PASS (§5).
- **R27-L floating video:** library collapsed → dock 1268,92 160×90; expand → **8,503 272×153**, library იხსნება; close → უკან. = r26.
- **R27-TO:** Redo `Mute — სტემები` არაცარიელი; SFX/Master over (+4.5) → Master Peak click → ყველა `clear`/`−∞`, **Redo და Undo უცვლელი**.
- **R27-E:** export-ის დროს `OfflineAudioContext` 1, მასზე `createAnalyser` **0**, `createChannelSplitter` **0** (browser API hook, labelled). 18.000 s, NaN 0.
- **R27-R:** track Mute (music solo, continuous): τ **0.003**, block-ები 0 ms −22.7 → 4 ms −34.8 → 8 ms −45.4, < −80 **22 ms**-იდან, −240 32 ms-იდან, 35–300 ms max **−240** (= R22-M2). Loop 8–12: iteration-ები 0/4/…/20 dur 4, lead 1999.3 ms, seam 0, wrap min −34.2 / −240 (Mute), Undo/Redo Δ 0.00 (= r26). Library drop `სრული მიქსი` music-ზე 7-ზე → **ერთი კლიპი** `[music,7,16]`.
- **R27-TI video floor:** last beep peak −5.9 (5.022), meter release ზუსტად 20 dB/s (−8.6/−13.6/−18.6 … 0.25 s-ში), release-ის დაწყება ≈ 5.167 (85 ms analyser ფანჯარა + 90 ms beep). Floor (≤ −60) **7.87**. Oracle (L0+60)/20+0.1 = 2.805 s: release-ის დაწყებიდან ზღვარი **7.97** ✓ (r27-ის ≈7.96-ის იგივე reference). Onset frame-იდან ზღვარი 7.827 იქნებოდა — ამ reference-ს არ ვიყენებ, რადგან beep 5.095-მდე ჟღერს. Release-ის დაწყება slope-იდანაა გამოთვლილი; მეორე run browse-ის restart-ის გამო დაიკარგა.

## 7. R28-S / R28-U

**R28-S** (`b-round-27-snapshots` ↔ live):
- `types/arrangement.ts`: მხოლოდ `allTracks?: true`.
- `clipboard.ts`: flag `copyRangeToClipboard`-ში და `cutRangeFromArrangement`-ის filter-ში; ახალი `deleteRangeKeepingGap` (zero-width guard). `cutTimeToClipboard` **byte-identical**.
- `ArrangementContext.tsx`: import (+`deleteRangeKeepingGap`, −`deleteTime`), interface, Split-ის უარი, range-ის შტო (no-op, label, status, remap არ არის, deps-დან `updatePosition`), `extendRangeToAllTracks`, Copy status, value/deps. Video/dock/scheduler/meter/graph — უცვლელი.
- `StudioWorkspace.tsx`: Shift-ის შტო, shortcut hint და **`arrangement-delete-hint` string** (A-ს გამოცხადებული გადახრა 6.1; §3.2 მხოლოდ shortcut hint-ს ასახელებს — string-only, ფარგლებს სცდება, მაგრამ მცდარ ტექსტს ასწორებს; ბაგად არ ვწერ).
- `ArrangementTransport.tsx`: მხოლოდ string-ები (`rangeDeleteHint`), disabled ლოგიკა უცვლელი.
- `ArrangementLane.tsx`: overlay და `clipRange`-ის `!range.allTracks`.
- `ArrangementContext.test.ts`: ზუსტად ხაზი 567.
- Hardcoded ფერი, `any`, `@ts-ignore` — არ არის. `scheduleKey` უცვლელი.

**R28-U:** A-ს red-first `a-round-28/red.txt` / `red-scratch-snapshot.txt`: 21 failed / 22 passed snapshot-ზე. ჩემი მუტაციები scratch-ში (`c-round-28/mut/`, `app/` copy + junction; ყოველ მუტაციაზე ზუსტი replace count==1, შემდეგ ფაილი აღდგა `restored true`; junction მოიხსნა, store `node_modules` 618 ხელუხლებელი). Tests: 3 own + `clipboard.test.ts` + `gesture-guard.test.tsx`. Control **74/74**.

| mutation | როგორ | ჩავარდა |
|---|---|---|
| (a) range შტო → `deleteTime` | import + `deleteTime(arrangement, a, b)` | **6** |
| (b) flag იგნორირებული `cutRangeFromArrangement`-ში | `clip.trackId !== range.trackId ||` | **4** |
| (c) Ctrl+Shift+L → loop toggle | `event.shiftKey && event.altKey` | **4** |
| (d) Delete playhead-ს remap-ს უკეთებს | `updatePosition(remapTime(...))` `applyEdit`-ის შემდეგ | **1** |
| (e) no-op ქმნის history ჩანაწერს | zero-width guard მოხსნილი → zero-width Delete კლიპს ყოფს და history-ში იწერება | **2** |
| (e2) no-op early return გამორთული | `next === arrangement && range.start < 0` | **1** |
| (f) `cutTimeToClipboard` gap helper-ით | `cutRangeFromArrangement(..., allTracks)` | **5** (frozen R9-C3 ჩათვლით) |

A-ს `e` (იგივე შინაარსის `applyEdit`) ეკვივალენტურია `isSameArrangement`-ის გამო — ვეთანხმები; ჩემი (e) რეალურ history ჩანაწერს ქმნის და იჭერს.

## 8. R28-Doc

Doc 034 ქართულადაა და კოდს ემთხვევა: მომხმარებლის კონტრაქტი და თარიღი (2026-10-11), superseded R1-B5/R1-B12/R9-C5, flag და `trackId`-ის მიზეზი, no-op, Split-ის უარი, detail panel-ის single-lane rewrite, overlay, keys, Ableton ცხრილი, ტესტები. **შენიშვნა:** ხაზი 63 წერს, რომ Paste ყველა ხაზის clipboard-ს „ორიგინალ ხაზებზე“ სვამს; ერთ ხაზზე მასალის შემთხვევაში ის active lane-ზე მიდის (C-R28-01) და doc ამას არ ასახელებს.

## 9. Ableton-ის შესაბამისობა (§4.5) — ორი ცალკე ვერდიქტი

წყარო: B-ის შენახული Live 12 Reference Manual (`b-round-27/ableton-*-20261012.txt`; ციტატები ჩემ მიერ გადამოწმებულია ფაილში). ვიდეო არ გამოყენებულა.

| ქცევა | CZABA მოთხოვნა | Ableton შესაბამისობა | შენიშვნა |
|---|---|---|---|
| Delete მონაკვეთზე ტოვებს სიცარიელეს | **PASS** (DA, VD) | **დადასტურებული** | §6.11: „Whereas the standard commands like Cut, Copy and Paste only affect the current selection, their “… Time“ counterparts act upon all tracks…“ |
| Backspace = Delete | **PASS** (DB) | **დაუდასტურებელი** | §42.5 Windows-ზე მხოლოდ „Delete“; Backspace ჩანს მხოლოდ `Ctrl+Alt+Backspace` (Delete Fades, §42.16) |
| Cut Time ხურავს სიცარიელეს ყველა ხაზზე | **PASS** (CX) | **დადასტურებული** shortcut-ითაც | §42.16: **Cut Time = Ctrl+Shift+X**. იქვე **Delete Time = Ctrl+Shift+Delete** — CZABA-ში Ctrl+Shift+Delete არაფერს აკეთებს (handler-ში `if (modifier) return`); ეს **შეგნებული განსხვავებაა** (მომხმარებლის წესი: გაპს მხოლოდ Ctrl+Shift+X ხურავს) |
| Shift = „Time Across All Tracks“; Shift+Delete | **PASS** (გაპს ტოვებს) | **შეგნებული განსხვავება** | §42.5 modifier წესი |
| მონიშვნის გავრცელება ხაზებზე (Ctrl+Shift+L) | **PASS** (VL) | **შეგნებული განსხვავება** | **B-ის ცხრილის შესწორება:** Live 12-ში Ctrl+Shift+L **არსებობს** — §42.8 „Select Material in Loop“ და §42.16 „Select Loop Brace Contents“ = `Ctrl+Shift+L`. იქვე „Toggle Loop Brace = Ctrl+L“ (CZABA-ს Ctrl+L ემთხვევა). ე.ი. CZABA-ში Ctrl+Shift+L-ს Live-ისგან განსხვავებული მნიშვნელობა აქვს (მომხმარებლის მოთხოვნა). Shift+click (§6.9) არ არის |
| Split მრავალხაზიან მონიშვნაზე | **PASS** (უარი) | **დაუდასტურებელი** (CZABA: შეგნებული განსხვავება) | §42.16 „Split Clip at Selection = Ctrl+E“; multi-track ქცევა წყაროში არ ჩანს |

ტესტის PASS Ableton-თან ანალოგიას თავისთავად არ ადასტურებს.

## 10. C-R23-01 ჩანაწერი

`curl /studio-lab` ×3: 60 494 B, **2 NUL** — **28013/28014** (`Arrangement <span class="text-dim">· \0\0მთლიანი პროექ…`). r27-ის მეორე წყვილი (58733/58734, footer `+/−`) **გაქრა** — ამ round-მა footer hint-ის ტექსტი შეცვალა. ეს offset-ის/შინაარსის ცვლილებაა და არა ფიქსი. Hydration-ის შემდეგ DOM-ში (text + attribute-ები, Master control-ების სახელები, track-meter sr-only, shortcut hint) NUL **0**.

## 11. ბაგები B-სთვის

- **C-R27-01 (Medium, ღია; row 2 ან row 3 — §6-ის ორი წაკითხვა, B ირჩევს).**
- **C-R28-01 (Low, ახალი):** all-lane Ctrl+X, როცა მასალა მხოლოდ ერთ audio ხაზზეა, Paste active lane-ზე მიდის და არა ორიგინალ ხაზზე.
  - ნაბიჯები: music 7–23; range 20–22 music-ზე; Ctrl+Shift+L; Ctrl+X; SFX-ის სახელზე click (active SFX); seek 20; Ctrl+V.
  - მოსალოდნელი: vertical (ყველა ხაზის) მონიშვნიდან ამოჭრილი მასალა ბრუნდება იმავე ხაზზე (music).
  - ფაქტობრივი: `ჩასმა (1): 00:20.000-ზე · SFX ხაზზე.` → `[sfx,20,2,off 8]` — music-ის აუდიო SFX ხაზზეა (`runs/finding2.txt`). = A-ს code-review finding 2; `planClipboardPaste`-ის one-lane წესი. Doc 034 ამას არ ასახელებს.
- **C-R28-02 (Low, pre-existing, Cut Time):** zero-width range (15–15) + Ctrl+Shift+X → status `Cut Time 00:15.000 — 00:15.000: მონაკვეთში ხმა არ იყო…; სიცარიელე დაიხურა ყველა ხაზზე.`, თუმცა არაფერი შეცვლილა და history არ ჩაწერილა. ცრუ status იმ ბრძანებაზე, რომლის UI-ში გასაგებად ასახვაც მომხმარებელმა მოითხოვა. ახალი Delete-ის zero-width guard Cut Time-ზე არ ვრცელდება.
- **ინფორმაცია (არა ბაგი):**
  - Ctrl+Shift+L-ის შემდეგ ცარიელ ადგილზე click range-ს შლის, მაგრამ status ისევ `მონიშვნა ყველა ხაზზე: …`-ს აჩვენებს (stale status-ის ძველი pattern).
  - All-lane overlay `bg-foreground/60` waveform-ს ფარავს, label კლიპის სათაურს ედება (B-ის „/60“ პუნქტი + R28-T).
  - Range-ის ხაზი footer-ში all-lane მდგომარეობას არ აჩვენებს (A finding 4); Split ღილაკი all-lane-ზე enabled (A finding 5).
  - Clip-ის ჭრის კიდეებზე fade არ არის — ჭრა მკვეთრია (5.000-ზე −5.9 dBFS-დან). Ableton ავტომატურ fade-ებს იყენებს; CZABA-ში fade ფუნქცია არ არსებობს. მოთხოვნის ფარგლებს გარეთაა, მხოლოდ B-ის backlog-ისთვის.
- **Ableton ცხრილის შესწორება (B):** Ctrl+Shift+L და Delete Time = Ctrl+Shift+Delete Live 12-ში არსებობს (§9).

## 12. გადმოტანილი (უცვლელი, არც PASS)

- **C-R23-01** (Medium, Tech Lead; ახლა 2 NUL), **C-R6-02**, **C-R8-01** (quiet Chrome).
- R26-M1; Master hold tick (ეტაპი 4); DEMO-SFX-FULL-SCALE (VD-ის before export-ში peak 0.0 dBFS); L3; LIB-SEP-REASON; R27-T (4 px cap).
- **Root** (`root-pre-push-review.md`, `publication-checkpoint.json`): SRW-21 middle-east loader; Lenis `/studio/*`; portable instruction paths; export hard-clip 0 dBFS-ზე; საბოლოო commit/push და round-6..28-ის uncommitted ხე (**66** ხაზი); `Modal.tsx` focus; GA scroll consent-denied-ზე; 2 უცხო agent ფაილი; A r17 dev.4, r19 dev.5, r22 dev.4, C-ის python probes r21–22; fake Bearer → 500; CDP `Input.dispatchMouseEvent`; publication-checkpoint-ის მოთხოვნები (library/stems/scrollbars, T12, final commit/push); `Content-Type` charset-ის გარეშე; **machine load** (ამ round-ში 35–41 `node.exe`; browse ~300 ms/command).
- **Tech Lead manual:** სია უცვლელი + **R28-T** (ნამდვილ Chrome-ში Delete/Backspace გაპი, Windows-ზე Ctrl+Shift+L-ს ბრაუზერი არ იჭერს, Ctrl+Shift+X, overlay-ის წაკითხვადობა).

## 13. Harness შენიშვნები

- Range-ები: detail panel-ის input-ები (`$B fill` + real click Apply); zero-width — არსებული clip range gesture (synthetic pointer, როგორც წინა round-ებში; CDP mouse dispatch აკრძალულია). Keys — real `$B press`. Multi-select — harness `C.clickClip(..., {ctrlKey})`.
- gstack browse daemon ორჯერ გადაიტვირთა (page state დაიკარგა); შემდეგ fresh context გამოვიყენე G28-3-ისთვის.
- ჩემ მიერ გაშვებული გაჭედილი `python3.13` (PID 10224, heredoc-ის შეცდომა) გავაჩერე; სხვა process-ს არ შევხებივარ. Dev server არ დამიწყია/გამიჩერებია.

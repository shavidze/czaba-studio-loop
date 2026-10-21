# C — Round 4 ვერიფიკაცია (Track S: D-19 sync + ბაგები; Track U: SRW-22/23/12/11A)

თარიღი: 2026-10-08 · ვერიფიკატორი: C · ობიექტი: A-ს round 4 (`a-round-4.md`), working tree `cc1e531`-ზე (18 M + 12 ??)

**შედეგი: FAIL.**

**ჩავარდნების მიზეზები:**
- **RF4-1 და RF4-2 ჩავარდა.** ორივე ვიდეოს drift-ის ტოლერანსია და ზუსტად ისე ჩავარდა, როგორც წერია. ჩავარდნები ძირითადად ბრაუზერის stall-ებს ემთხვევა (§3).
- **R23-1 და R23-2 (wheel/thumb drag) BLOCKED-ია.** headless Chromium scrollbar-ებს მალავს, ამიტომ ვიზუალი ვერ ვნახე.
- **ახალი ბაგი C-R4-02 (Medium):** gesture-ის counter-ის leak (კლიპი და loop brace; ruler და marquee — არა). მის შემდეგ Undo/Redo/რედაქტირება გვერდის reload-მდე იბლოკება.

**რა გავიდა:**
- **Track S:** RF4-3, RF4-U, R4-B1..B7, R4-M2.
- **Track U:** R22-1..4, R23-3/4, R12-L1..L5, R12-S1, R12-S2, R12-U, R11A-1..3.
- **Gates:** G4-1..3.
- **რეგრესია:** G4-R.
- **Screenshots:** G4-shots.

წინა round-ის C-R3-02-ის სიმპტომი (loop-ის wrap-ზე `loop.end`-ის მიღმა frame-ები) გაქრა: 15/15 wrap standby swap-ით გაიარა.

**წესები, რომლებიც დავიცავი:**
- App source-ს არ შევხებივარ (ბოლო მოქმედების შემდეგ: `find app docs -newer gates-done.txt` = 0, `git status` იდენტურია `git-status-start.txt`-ისა, 30 ჩანაწერი). commit, push და deploy არ ყოფილა.
- ბრაუზერის side effect-ები მხოლოდ `/studio-lab`-ის დემო state-ია.
- gstack daemon იყენებს `c-browse.json`-ს. daemon ორჯერ თავისით გადაიტვირთა, მესამედ — C სესიის context-restart-ის შემდეგ; ყოველ ჯერზე სუფთა anonymous context-ით ავდგი (`auth_user = null`).
- Media: მხოლოდ საკუთარი სინთეზური fixture-ები `media/`-დან. გარეთ არაფერი აიტვირთა.

## 0. მეთოდი

- **Browser:**
  - HeadlessChrome 145, gstack `/browse`;
  - cookies `''`, `auth_user = null`, ტოკენები არ ყოფილა;
  - viewport-ები 1440×900 და 1280×720 (header-ისთვის ასევე 390×844).
- **Harness:**
  - round 2/3-ის `setup-base.js`, `ext.js`, `c3.js` უცვლელად;
  - ახალი სკრიპტები `c-round-4/scripts/`-შია:
    - `m4.js` — `HTMLMediaElement.prototype`-ზე `currentTime`/`playbackRate`/`play`/`pause` spy-ები, ორივე `<video>`-ზე rVFC და event-ები;
    - `rf4.js` — D-19 run-ის ანალიზი: `[data-video-role=active]`-ს ყოველ sample-ზე თავიდან ეძებს;
    - `rf43.js`, `b1..b7`, `l4/l5/s1/s1exp/s2`, `r11a1`, `geo`, `loaf`, `m2`, `leak`, `r5r6`, `p1post`, `e1`, `r3v3c`.
  - Runner-ები: `r.sh` (async) და `setup.sh` (goto + harness + fixture upload + cookie Accept).
  - Run-ების JSON-ები `c-round-4/runs/`-შია.
- **Pointer და drag:**
  - კლავიშები რეალური `$B press`-ით;
  - pointer gesture-ები და HTML5 DnD synthetic event-ებით, რადგან gstack-ში wheel/drag არ არის.
- **Harness confound (სამართლიანობისთვის):**
  - R3-V1-ის პირველი სერია (`v1_4..13`, `v1r_1..5`) ყოველ rAF-ზე `getComputedStyle`-ს იძახებდა და ჩემი გაზომვით main thread-ს ტვირთავდა.
  - მსუბუქმა harness-მა იმავე load-ზე 3/3 გაიარა.
  - ამიტომ **ავტორიტეტულია მხოლოდ მსუბუქი harness-ის run-ები** (`L*`, `Lr*`, `Lre*`, `V3*`, `L6_*`, `H*`). მძიმე სერია მხოლოდ დიაგნოსტიკაა.
- **გარემო:**
  - პარალელურად გაშვებული იყო Brave, ChatGPT, VS Code installer და სხვა;
  - CPU total 27–35% idle-ზე.

## 1. Gates

| ID | შედეგი |
| --- | --- |
| G4-1 | **PASS.** `tsc` EXIT 0. `vitest app/lib/arrangement` 13 ფაილი, **190/190**. სრული `vitest` 45 ფაილი, **654/654** (≥ 604 + ახალი). Biome owned → 0 error (6 warning წინასწარ არსებული `Header.tsx`). `./app` → 0 error / 218 warning. Build EXIT 0. ფაილები `c-round-4/*.txt`-შია. მას შემდეგ app/docs-ში არცერთი ფაილი არ შეცვლილა (`find -newer`) |
| G4-2 | **PASS.** 4 protected hash = OK (ხელახლა). `git status`: 18 M + 12 ?? — ყველა §2-შია. `app/styles`, `root.tsx`, `public`, `package.json` უცვლელია. `Header.tsx` diff = მხოლოდ ორი `<Link to="/studio-lab">` ბლოკი (+21/−0). Owned non-test ფაილებში აკრძალული პატერნი არ არის. 3 `biome-ignore` დოკუმენტირებულია |
| G4-3 | **PASS.** Header-ით ნავიგაციის შემდეგ სესიაში (Play, stem preview, WAV export): `studio-token`/`recording`/`/api/download`/R2 = **0**; harness-ის fetch hook-ში `Authorization` = 0; binary upload = 0; media მხოლოდ `/middle-east.mp3`, `/videos/hero/hero-music.mp3` და `blob:`. Anonymous `/api/studio-token` → **401** „Please sign in to access Studio.“. ყალბი Bearer → 500 „Unable to prepare Studio access“, token არ გაიცა. `/studio/middle-east` → „Sign in required“. **Premium auth bypass არ ხდება.** შენიშვნა: root-ის GA `page_view` (consent denied, `gcs=G100`) root-ის საკუთრებაა |

## 2. Track S

### RF4-1 — FAIL (როგორც წერია)

**R2-V3 — 5/5 PASS** (3 same-load + 2 reload):

| run | median | max | swaps | hard seeks |
| --- | --- | --- | --- | --- |
| V3_1 | 0.005 | 0.026 | 0.502, 1.001 | 0 |
| V3_2 | 0.005 | 0.014 | 0.518, 1.009 | 0 |
| V3_3 | 0.009 | 0.019 | 0.51, 1.011 | 0 |
| V3r_1 | 0.007 | 0.025 | 0.502, 1.001 | 0 |
| V3r_2 | 0.007 | 0.022 | 0.51, 1.011 | 0 |

- continuous საზღვარზე 2.0 seek და swap არ ყოფილა;
- layout ზუსტია: 0.5–1 off 0.5 · 1–2 off 2 · 2–5.008 off 3;
- 0 write `seeking`-ის დროს; rate ≤ 1.4; Pause-ის შემდეგ ორივე paused და rate 1;
- 2 `<video>`, 1 ხილული, multi-playing 0 ms.

**R3-V1 same-load (მსუბუქი harness) — 8/10, starvation re-run-ების შემდეგ 9/10:**

| run | med | max | worst frame gap | rate max | long task (ms/n) | rAF gap > 50 | |
| --- | --- | --- | --- | --- | --- | --- | --- |
| L1 (პირველი Play import-ის შემდეგ) | 0.009 | 0.017 | 0.07 | 1.2 | 0/0 | 0 | PASS |
| L2 | 0.007 | 0.024 | 0.075 | 1.2 | 0/0 | 0 | PASS |
| L3 | 0.005 | 0.018 | 0.075 | 1.2 | 0/0 | 0 | PASS |
| L4 | 0.006 | 0.021 | 0.07 | 1.2 | 0/0 | 0 | PASS |
| L5 | 0.005 | 0.022 | 0.075 | 1.2 | 0/0 | 0 | PASS |
| L6 | 0.010 | **0.354** | 0.17 | 2.0 | 368/4 | 4 (≤ 117) | FAIL |
| L7 | 0.008 | 0.024 | 0.075 | 1.25 | 0/0 | 0 | PASS |
| L8 | 0.012 | **0.181** | 0.125 | 1.75 | 198/3 | 2 (≤ 100) | FAIL |
| L9 | 0.009 | 0.030 | 0.085 | 1.25 | 0/0 | 0 | PASS |
| L10 | 0.008 | 0.029 | 0.075 | 1.2 | 0/0 | 0 | PASS |
| re-run 1 (L6-ის ნაცვლად) | 0.011 | **0.1031** | 0.10 | 1.45 | 108/2 | 1 | FAIL |
| re-run 2 (L8-ის ნაცვლად) | 0.009 | 0.035 | 0.065 | 1.2 | 0/0 | 0 | PASS |

**R3-V1 reload — 2/5:**

| run | max | long task | |
| --- | --- | --- | --- |
| Lr1 | **0.183** | 100/1 | FAIL |
| Lr2 | **0.118** | 87/1 | FAIL |
| Lr3 | 0.021 | 0 | PASS |
| Lr4 | 0.035 | 54/1 | PASS |
| Lr5 | **0.303** | 60/1 | FAIL |

**15-ვე run-ში დაცული წესები:**
- 0 `currentTime` write `seeking`-ის დროს ორივე ელემენტზე;
- rate ∈ [0.5, 2.0], Pause-ის შემდეგ ორივე 1 და paused;
- `muted` ყოველთვის `true`;
- ზუსტად 2 `<video>`, ყოველთვის 1 ხილული;
- ერთდროულად 2 დაკვრადი ელემენტი 0 ms;
- თითო run-ში 1 swap 8.0-ზე (gap entry), fallback 0;
- dock-ის `hardSeeks` counter = 0 ყველა run-ში.

**მექანიზმი (B-სთვის):**
- **ა. stall-ები.** ყველა ჩავარდნილ მსუბუქ run-ში long task და rAF gap ემთხვევა violation-ს (`runs/L_6.json`, `L_8.json`, `Lr_*.json`). LoAF attribution: script time ≈ 0; დრო render/style ფაზაშია ან სხვადასხვა callback-ზე ნაწილდება. ეს პროცესის stall-ს ჰგავს, არა app-ის JS-ს.
- **ბ. პირველი Play fresh load-ის შემდეგ** (Lr5, `runs/Lr_5.json`). 0.11–1.15 წმ-ში rate 1.75–2.0-ზე იყო, მაგრამ ელემენტის `currentTime` 0.72–1.08×-ით მიიწევდა წინ (presented frame-ებით 0.93 წმ 1.04 წმ-ში). შედეგად |d| 0.30-მდე გაიზარდა და 1.7 წმ-ზე აღდგა. D-19-ით hard seek მხოლოდ |d| > 1.0-ზეა, ამიტომ app ელოდება. იგივე სიმპტომი R11A-1-ის პირველ run-შიც ჩანდა (−0.35).
- **H.264 დიაგნოსტიკა (verdict-ში არ შედის):** 3/3 PASS (max 0.016 / 0.031 / 0.018).
- **დასკვნა:**
  - კოდი წყნარ მანქანაზე გადის (L1–L5, L7, L9, L10, H1–H3, ასევე დაკარგული load-ის v1_1..3);
  - გადატვირთულ მანქანაზე ტოლერანსი არ დგება;
  - A-ს 15/15 სხვა load-ზე იყო, არა სხვა build-ზე. A არ ცდება; ეს გარემოსადმი მგრძნობელობაა;
  - **Tech Lead-ის რეალური Chrome-ის შემოწმება** (Windows, სუფთა მანქანა, VP9 + H.264) საჭიროა, სანამ B ამ ტოლერანსს დახურავს ან შეცვლის.

### RF4-2 — FAIL (4/5, როგორც წერია)

| run | med | max | wraps (swap/fallback) | frames `loop.end`-ის მიღმა | |
| --- | --- | --- | --- | --- | --- |
| L6_1 | 0.009 | 0.025 | 3/0 | 0 | PASS |
| L6_2 | 0.011 | 0.021 | 3/0 | 0 | PASS |
| L6_3 | 0.011 | 0.051 | 3/0 | 0 | PASS |
| L6_4 | 0.010 | 0.047 | 3/0 | 0 | PASS |
| L6_5 | 0.010 | **0.1106** (6.70 წმ) | 3/0 | 0 | FAIL |

- **ყველა wrap:** 300 ms-ის შემდეგ `currentTime` ∈ [2.28, 2.31] ⊂ [2, 4]. Hard seek დაკვრისას 0 (counter 0).
- **L6_5:** ახლოს მხოლოდ 50 ms-იანი rAF gap-ია (6.45), long task 7.6-ზე. სუსტი კორელაციაა.
- **Starvation re-run-ების ლიმიტი** (2 სულ) RF4-1-ზე უკვე ამოიწურა.
- **C-R3-02-ის სიმპტომი გაქრა.**

### RF4-3 — PASS (შენიშვნით)

3 fresh load. AudioContext Play-ის click-ზე იქმნება (`ctxBefore = none`).

| | F1 | F2 | F3 |
| --- | --- | --- | --- |
| hold: paused, max \|vt\| | ყველა, 0 | ყველა, 0 | `play()`-მდე ყველა, 0 |
| `play()` − startAt | +0.7 ms | −2.0 ms | −10.0 ms |
| \|d\| startAt..+100 ms | 0.049 | 0.044 | 0.037 |
| \|d\| +100..+300 ms | 0.050 | 0.050 | 0.039 |

- **F3 სპეციფიკაციის კონფლიქტი:** `play()` startAt−10 ms-ზე გაიცა. rule 7 ამას ცალსახად უშვებს (≤ 20 ms), ამიტომ ბოლო pre-startAt sample-ში ელემენტი paused აღარ იყო, თუმცა `vt = 0`: ვიდეო წინ არ წასულა.
- `play()`-ის timing-ის acceptance ([startAt − 20 ms, …]) ადრე `play()`-ს ცალსახად უშვებს, ამიტომ hold-ის „paused“-ს ვკითხულობ როგორც „`play()`-მდე“.
- **B-მ ტექსტი უნდა გაასწოროს.**

### RF4-U, R4-B1..B7, R4-M2 — PASS

| ID | გაზომილი |
| --- | --- |
| RF4-U | `video-sync.test.ts`-ში 23 ტესტია: dead band, clamp, monotone, sign symmetry, continuity, gap entry, non-continuous, loop wrap, horizon, `holdRelease` hold/play. `video.test.ts` 27 ტესტია. ყველა გადის |
| R4-B1 | კლიპის drag, brace drag და მარცხენა trim — სამივეზე drag-ის შუაში რეალური Ctrl+Z, Ctrl+Shift+Z, Ctrl+Y და Undo ღილაკი → status „Undo/Redo drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი.“; Undo/Redo label-ები უცვლელია (Redo ხელმისაწვდომი დარჩა). Release → ერთი ჩანაწერი (`კლიპის გადატანა` / `Loop-ის დიაპაზონი` / `Trim — მარცხენა კიდე`). Loop და `Loop შეიქმნა` ხელუხლებელია. Undo ზუსტად აბრუნებს |
| R4-B2 | Brace drag + Ctrl+Z + release (synthetic pointer → `setPointerCapture` throw-ის გზა), მერე `clip-4s` import → **81 ms**. Fresh control: 78 ms. Context-ის ტესტები: aborted gesture, unmount mid-drag |
| R4-B3 | 1280×720 და 1440×900, loop on/off/არ არსებობს × 4 მდგომარეობა → `↻ Loop` box `[965.5, 43, 74.2, 32]` და loop-times box Δ = **0 px**. Range-ისას ჩანს „Delete = დროის წაშლა, სიცარიელე დაიხურება ყველა ხაზზე“ |
| R4-B4 | Delete: 1 keydown + 5 `repeat` → 1 წაშლა (2 მონიშნული კლიპი, ერთი ჩანაწერი `კლიპების წაშლა (2)`). Backspace → 1 კლიპი, 1 ჩანაწერი. Undo ორივეს აბრუნებს |
| R4-B5 | Fresh load, edit (ArrowRight nudge) Play click-იდან 26–28 ms-ში, ctx = 0 → ძველი source-ები `stop(0)` ჟღერადობამდე. ახალი graph: music 0.05, ვიდეოს აუდიო 0.15. ვიდეოს `play()` 0.152-ზე (clip 0.1-ზე → 0.15). ადრე არ დაწყებულა |
| R4-B6 | `AudioContext` stub throw → status „ამ ბრაუზერში Web Audio მიუწვდომელია — დაკვრა და ექსპორტი ვერ იმუშავებს.“, Play რჩება (Space-ზეც), lane click მუშაობს, 0 uncaught error / rejection, console-ში error არ არის. Export dialog იგივე მიზეზს აჩვენებს დაჭერის შემდეგ, blob 0 |
| R4-B7 | Loop 2–4, music @0, Play 1-დან. პირველი wrap-ის შემდეგ rAF 5 წმ queue-ში (4 callback). Timer-მა iteration-ები 7 და 9 ~1.9 წმ-ით ადრე დაგეგმა. Wrap-ები 5 და 7 stub-ის შიგნით: 5 ms min **−29.5 dBFS**, საერთო min −40.4 (მუსიკის შიგნით). Late `start()` 0, concurrency 1. Flush-ის შემდეგ playhead 3.161 ∈ [2, 4] |
| R4-M2 | Store დანერგილია (A: 7.0–7.8 → ~1.0 ms/frame; commit time-ს ვერ ვზომავ). ჩემი შემოწმება: დაკვრისას 4 წმ-ში DOM mutation მხოლოდ position-ის consumer-ებზეა (`arrangement-position`, library preview playhead text, playhead/handle style), კლიპები და lane-ები არ იცვლება. 61 fps, 8 წმ-ში 2 LoAF, script 0 ms. `position-store.test.ts` 0 vs 10 render-ს ამტკიცებს |

## 3. Track U

| ID | შედეგი |
| --- | --- |
| R22-1 | **PASS.** `/`-დან ხილული header-ის `Studio Lab` → `/studio-lab` client navigation-ით (window marker შენარჩუნდა). Workspace რენდერდება, robots `noindex`. `← CZABA` → `/` ასევე client-side |
| R22-2 | **PASS.** მხოლოდ 2 Link ბლოკი |
| R22-3 | **PASS.** ერთი სტრიქონი: 1280-ზე nav-ის მარჯვენა კიდე 929, actions 977-დან; 1440-ზე 1009/1057. 390×844 menu-ში ჩანს `Studio Lab DEMO`. ფაილები: `hdr-1280x720.png`, `hdr-1440x900.png`, `hdr-390-menu.png` |
| R22-4 | **PASS.** იხ. G4-3 |
| R23-1 | **BLOCKED.** headless (Playwright `--hide-scrollbars`) scrollbar-ს არ ხატავს, screenshot-ზე რეილი არ ჩანს. რაც შევამოწმე: generated rule-ები (thumb `bg-dim`, rounded-full, border-surface, padding-clip; track/corner `bg-surface`; button `display:none`; hover/active `bg-brand`), 10 px gutter (`offsetWidth − clientWidth = 10`), `scrollbar-color`/`scrollbar-width` = `auto`, contrast `dim`/`surface` **3.67:1**, `brand` 10.43:1. ვიზუალი Tech Lead-ის რეალურ Windows Chrome-ზეა |
| R23-2 | **ნაწილობრივ; არ ჩაითვალა.** Keyboard: რეალური ↓ list-ს scroll-ავს (`scrollTop` 0→157). PageUp მუშაობს. Wheel და thumb drag gstack-ით შეუძლებელია (wheel/CDP Input allowlist-ში არ არის) → Tech Lead real-mouse |
| R23-3 | **PASS.** `zzz` ფილტრით overflow → no overflow: list 192/182 px უცვლელია, library 288 |
| R23-4 | **PASS** |
| R12-L1 | **PASS.** `ბასი დემო` = `დემო ბასი` = 1 შედეგი (`ღამის პულსი · ბასი`). `zzz` → `ხმა ვერ მოიძებნა…`, wave, ▶ და ＋ disabled, Enter არაფერს აკეთებს. × → 9 |
| R12-L2 | **PASS.** `სტემები` → ზუსტად 4 stem, `aria-current` + `text-brand`. SFX + `slow` → × და Esc ორივე ინახავს `ფილტრი: SFX`-ს. რეალური ↓ search-იდან → პირველი focus + selected, ↓↓ → პადი. Enter → `დამატება — ღამის პულსი · პადი` სტემები ხაზზე 00:20.000-ზე, 1 Undo |
| R12-L3 | **PASS.** ▶ → 1 live source (bass). Wave center click → restart offset **8.000** (16/2). რეალური ↓ → წინა stop, პადი start, 1 source. Play preview-ს აჩერებს. Preview transport-ს აჩერებს. ერთი AudioContext. Export preview-ით და მის გარეშე: **maxDiff 0** (4 864 896 frame) |
| R12-L4 | **PASS (synthetic DnD).** ბასი → სტემები 10 წმ-ზე: ghost `00:10.000`, left 400 px = 10×40, drop → 10.0 წმ, Undo შლის. 15 წმ-ზე (ბასის ზემოთ) → ghost amber `data-blocked=true` „აქ ადგილი არ არის“, ცვლილება არ ხდება. ვიდეოხაზი → „აუდიო ვიდეოხაზზე არ ემატება“, history უცვლელია. რეალური მაუსის HTML5 drag → Tech Lead |
| R12-L5 | **PASS.** `tone-2s.wav` 4 ხაზზე → უარი არსებული მესიჯით, history და კლიპები უცვლელია |
| R12-S1 | **PASS.** Buffer oracle (`collection.loadSource`, Vite module): 4 stem, თითო 16.000 წმ / 768 000 sample / 48 kHz / stereo. Peak −10.6 … −16.8 dBFS, RMS −22 … −28. Pairwise \|ρ\| max **0.0031**. Σstem vs mix **2.98e-8**, mix peak −4.65. `kind: 'stem'`, collection `სინთეზური დემო · ღამის პულსი`, notice ჩანს. MP3 = `music`. Export oracle: პულსი/ბასი/პადი @0 3 ხაზზე → WAV 16.000 წმ, 24-bit 48k stereo, vs JS Σ **8.94e-8** ≤ 3.58e-7 |
| R12-S2 | **PASS.** Search `ბასი` → `სტემები` → preview (■) → stop → drag 10 წმ-ზე (ghost `00:10.000`) → Play 9-დან: master tap 10.0-მდე −240 dB, onset scheduled `when`-ზე (±1 render block), შემდეგ −22 dB. Export: onset **10.000125** (ბასის პირველი sample 0.0001), 0–9.99 −240 dB, ბასთან სხვაობა 6e-8 |
| R12-U | **PASS.** `library.test.ts`: tree/empty folder, AND/order/case, clear-ის დროს filter-ის შენარჩუნება, bounds, drop time, overlap |
| R11A-1 | **PASS.** 1440: ◀ → 288→**40**, scroller 1152→1400 (+248). ▶ → 288. ორივე `<video>` იგივე node-ია (tag). დაკვრისას collapse/expand → \|d\| ≤ **0.019** (3 run). პირველ Play-ზე fresh load-ის შემდეგ −0.35 (იხ. RF4-1 ბ) |
| R11A-2 | **PASS.** Separator `role=separator`, vertical, 288/288/480. რეალური → → 304; →×13 → 480 (clamp); ← → 464; ←×15 → 288. `aria-valuenow` ემთხვევა. Pointer drag +10/ნაბიჯი ზუსტად მიჰყვება (298…388), +500 → 480. მონიშნული კლიპი არ გადაადგილდა, history არ შეცვლილა |
| R11A-3 | **PASS.** 1280×720 და 1440×900, open და collapsed, ვიდეოთი: 4 lane ruler-ითა და loop strip-ით სრულად ჩანს (ბოლო lane-ის ქვედა კიდე 599 ≤ scroller 651/831). Dock **160×90**, overlap არცერთთან. Document scroll არ არის. Brace (amber ჩარჩო), range (ნაცრისფერი + tag), selection (teal ring) და playhead (amber ხაზი + handle) ერთმანეთისგან გაირჩევა |

**G4-shots** (`c-round-4/`):
- `shot-{1280x720,1440x900}-{open,collapsed,search-stems,ghost}.png`;
- `hdr-*.png`;
- `r22-lab-after-nav-1280.png`;
- `r23-1280-*.png` — scrollbar-ის გარეშე, BLOCKED.

Cookie banner Accept დავაჭირე (root-ის საკითხია).

## 4. რეგრესია (G4-R) — PASS

Precondition: გამორთული brace 40.0–40.3 (`pre.js`). ≥ 2 კლიპის შემთხვევაში 2 მონიშნული.

| ID | შედეგი |
| --- | --- |
| R1-E1 | 15.000 წმ, 0–2 −240, impact −16.5, 4–5 −240, music −22.5 (ვიდეოს გარეშე) |
| R1-E5 / E3 | Oracle 5.96e-8. Impact-ის residual 1.19e-7, დანარჩენი 0 |
| R1-B5 | 0–9 ბიტ-ზუსტი, 11→9 shift 0, 15→13 წმ, undo ზუსტი |
| R1-B12 | Delete Time დაკვრისას: music continuity **0 sample** |
| (R1-B11) | Muted −240, unmute-ზე პირველი ხმა 0 ms, 0 start/stop |
| R2-V1 | Append 6.008, Undo/Redo იგივე id, peaks, 0 binary send, 0 auth fetch |
| R2-V2 | wav / ცარიელი MIME-ის wav / broken.mp4 / pdf / webm→music / wav→music უარყოფილია, history უცვლელი. Empty-MIME .mov, MP4, MOV, no-audio MP4 მიიღება. Stray drop prevented |
| R3-V2 | Mute → −240, unmute-ზე 0 ms, solo music → video −240, 0 start/stop, video ყოველთვის muted და clip-ში არასდროს paused |
| R3-V3 | Video-only oracle 5.96e-8, onsets 2.5…6.5. Muted = music oracle (1.19e-7). Linearity 1.19e-7. **ძველი სკრიპტის stray pointerdown-მა C-R4-02 გამოიწვია; შესწორებული ასლი `r3v3c.js`** |
| R3-V4 | 10 რეალური Space → stopped, ორივე `<video>` paused / rate 1 / muted, 10 start / 10 stop. +1 Space → d = −0.002 |
| R4-P1 | Stopped drag → 3.000, vt 1.5 (clip @2 off 0.5); ←/→ ±0.1. Playing drag: 12 დისტინქტური reschedule ctx-დრო (≤ 14), Undo უცვლელია. D-19: hold-seek → target+0.3 → hold → play. Release + exclusion-ის შემდეგ \|d\| ≤ **0.016**, 0 write `seeking`-ის დროს |
| R4-P2/P3 | Body range დაკვრისას მონოტონურია, 0 source. Resume offset-ები სწორია. Home დაკვრისას → 0.10. Stopped Home → 0. Home text input-ში → უცვლელი |
| R5-L1/L2 | Disabled ცარიელზე. Range-ის გარეშე Ctrl+L → მესიჯი. 2–4 შეიქმნა, 6–8 ჩაანაცვლა (1 brace), Undo 2–4, Redo 6–8. Off: dashed, `· off`, aria-pressed false. On: დაბრუნდა |
| R5-L3 | Loop 2–4, music + video + impact@3, Play 1-დან: seam **0**, overlap 0, wrap min −25.2 dB, pos wrap-ის შემდეგ ∈ [2.011, 3.99], impact iteration 0-ზე dur 1 |
| R5-L4 | Brace →/←←/Shift+→ → 2.1–4.1 / 1.9–3.9 / 1.9–4.0. 4 Undo → 2–4. კლიპები არ გადაადგილდა |
| R5-L5 | (დ) Delete Time 1–2 → brace 1–3, Undo → 2–4. (ბ) Toggle off loop-ის დროს (3 run, Play 3-დან, Ctrl+L wrap-ის შემდეგ mapped 2.43 / 2.51 / 2.57-ზე): ახალი music source off = წინა source-ის linear პოზიცია, **jump 0.0000** სამივეში. წინასწარ დაგეგმილი iteration (when 3) `stop` ჟღერადობამდე მოხდა. Music concurrency **1**. Readout linear 5.0–5.17-მდე, wrap აღარ ხდება, max step error **0.0113** ≤ 0.02. Status „Loop გამორთულია; დიაპაზონი შენარჩუნებულია.“ (გ) Brace body drag +1 წმ დაკვრისას (3 run, Play 1-დან, loop 2–4): 3 re-anchor თითო run-ში, ყველა **jump 0.0000**, concurrency 1, step error ≤ 0.0113. Brace → 3–5, ერთი ჩანაწერი `Loop-ის დიაპაზონი`, შემდეგ wrap **5→3**. Undo → 2–4. ფაილები: `runs/l5b_1..3.json`, `runs/l5c_1..3.json`, `scripts/l5bc.js` (l5b_1-ის concurrency 2 იყო ანალიზის შეცდომა, `dur` არ ითვლებოდა; გასწორდა, ორივე სერია ხელახლა გავიდა) |
| R5-E1 | Loop on/off export იგივე frame-ებით (4 864 896), maxDiff **1.19e-7** ≤ 2⁻²². Round 3-ში იყო 0 |
| R6-S2/S3/S4 | Marquee video@7 → sfx@3.5 → 3 კლიპი, release-ზე ქრება. ჯგუფი +2 → დაბლოკილია **1.992**-ზე (როგორც R3), `გადატანა (3)`, undo ზუსტი. ჯგუფის Delete → მხოლოდ 3, undo ზუსტი |

## 5. ბაგები (B-სთვის)

### C-R4-01 — Medium — ვიდეოს drift-ის ტოლერანსი ჩავარდა loaded მანქანაზე (RF4-1 9/10 + 2/5, RF4-2 4/5)

- **ნაბიჯები:**
  1. R3-V1 layout;
  2. Home → Play 12.4 წმ;
  3. active ელემენტის sample ყოველ 250 ms-ში, audio clock-ით, exclusion-ები §3.3-ის მიხედვით.
- **მოსალოდნელი:** ყოველ run-ში max \|d\| ≤ 0.1.
- **ფაქტობრივი:**
  - Lre1 max 0.1031; Lr1 0.183, Lr2 0.118, Lr5 0.303;
  - L6_5 (loop) 0.1106;
  - ყველა ჩავარდნა ჩამორჩენაა (d < 0);
  - Lr5-ში ელემენტის clock 0.72–1.08×-ით მიდიოდა, როცა rate 1.75–2.0 იყო.
- **Evidence:**
  - `runs/L_*.json`, `Lr_*.json`, `Lre_*.json`, `L6_5.json`;
  - long task/rAF gap-ების ცხრილი §2-ში;
  - H.264 3/3 გადის.
- **B-ის გადასაწყვეტი:**
  - პირველი Play-ს decoder ramp-ის დამუშავება: მაგალითად, \|d\|-ის ზრდა rate = 2-ზე > X ms → seek-and-hold, 1.0-მდე ლოდინის ნაცვლად;
  - ან ტოლერანსი/გარემო: Tech Lead-ის სუფთა რეალური Chrome.

### C-R4-02 — Medium — მეორე pointerdown იმავე კლიპზე gesture-ს „ჟონავს“ და Undo/Redo და რედაქტირება სამუდამოდ იბლოკება

- **ნაბიჯები:**
  1. ვიდეო-კლიპის header-ზე `pointerdown` pointerId 1 (touch);
  2. იმავე header-ზე `pointerdown` pointerId 2 (მეორე თითი, ან pen + mouse);
  3. `pointerup` 2, `pointerup` 1 (ასევე window-ზე pointerup/pointercancel id 1);
  4. რეალური Ctrl+Z, Undo ღილაკი, Delete.
- **მოსალოდნელი:** ორივე თითის აშვების შემდეგ Undo და რედაქტირება მუშაობს. D-20: gesture თავის state-ს ასუფთავებს.
- **ფაქტობრივი:**
  - status „Undo/Redo drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი.“ / „რედაქტირება drag-ის დროს არ მუშაობს…“;
  - history უცვლელია; ახალი gesture არ ათავისუფლებს;
  - მხოლოდ reload შველის, რაც დემო arrangement-ს კარგავს.
- **მიზეზი (კოდის წაკითხვით):**
  - `ArrangementClip.tsx` `beginGesture`-ში (`gestureRef.current = {… release: beginPointerGesture() }`) არსებულ gesture-ს ისე გადაწერს, რომ მის `release()`-ს არ იძახებს;
  - `watchUncapturedPointerGesture`-ის listener `gestureRef.current !== gesture`-ზე return-ს აკეთებს და release-ს აღარ იძახებს;
  - შედეგად `gestureCountRef` ≥ 1 რჩება.
  - **Root cause capture-ის გზისგან დამოუკიდებელია.** synthetic pointerId-ზე `setPointerCapture` throw-ს აკეთებს, ამიტომ ჩემმა ტესტმა uncaptured გზა გაიარა. მაგრამ capture-ის წარმატებისას (რეალური ორი თითი) იგივე ხდება: pointerdown 1 → g1 (count 1); pointerdown 2 → g2 (count 2, g1.release არ გამოიძახება); pointerup 2 → `finishGesture` ათავისუფლებს g2-ს, `gestureRef = null` (count 1); pointerup 1 → `gestureRef` null → return. Count = 1 სამუდამოდ. იგივეა brace-ის `finishLoopGesture`-ში. ძირი `beginGesture`/`beginLoopGesture`-ის overwrite-without-release-ია; uncaptured listener-ის early return მეორადი სიმპტომია.
  - `ArrangementContext.test.ts` (ხაზები 200–201) nested `beginPointerGesture`-ს context-ის დონეზე უკვე ამოწმებს და გადის — context-ის დათვლა სწორია. შესწორება და ტესტი `ArrangementClip`/`ArrangementLoopBrace`-ში უნდა იყოს; repo-ში მაგალითი ruler-ის `dragRef.current?.release()`-ია.
  - **Scope დადასტურდა ბრაუზერში** (`scripts/leak2.js`, `scripts/leakmusic.js`, `runs/leak-scope.txt`, `leak-blocked-1280.png`):
    - `ArrangementClip` (music კლიპიც, არა მხოლოდ ვიდეო) — **ჟონავს**: Ctrl+Z → drag-ის მესიჯი, Delete → „რედაქტირება drag-ის დროს არ მუშაობს…“, კლიპი რჩება;
    - `ArrangementLoopBrace` — **ჟონავს** (იგივე პატერნი: `gestureRef.current = {… release: beginPointerGesture() }` წინა release-ის გარეშე);
    - `ArrangementRuler` playhead — **არ ჟონავს** (`dragRef.current?.release()` overwrite-მდე); Ctrl+Z მუშაობს;
    - Lane marquee (`StudioWorkspace`) — **არ ჟონავს** (`marqueeCleanupRef.current?.()` ჯერ იძახებს cleanup-ს); Ctrl+Z მუშაობს.
  - შესწორების მიმართულება B-სთვის: clip/brace-ში ruler-ის პატერნი (ძველი gesture-ის release overwrite-მდე, ან მეორე pointerdown-ის იგნორი, სანამ gesture აქტიურია) + unit ტესტი „two pointerdowns → count 0 after release“.
- **Evidence:** `c-round-4/scripts/leak.js`. ასევე ძველმა `r3v3.js`-მა (stray pointerdown + drag) იგივე გამოიწვია.

### C-R4-03 — Low — ბიბლიოთეკის ხე 96 px-ზე collection-ის სახელებს ჭრის

- **ნაბიჯები:** 1280×720 ან 1440×900, ბიბლიოთეკა ღიაა.
- **მოსალოდნელი:** LIB-02 — collection და folder იკითხება.
- **ფაქტობრივი:** `ყველა …`, `დემო კო…`, `სინთეზ…` (მხოლოდ `title` tooltip). სინთეზური და საჯარო კოლექცია ერთმანეთისგან ვიზუალურად არ გაირჩევა.
- **Evidence:** `shot-1280x720-open.png`.
- design-philosopher-ის `w-24` ruling-ის შედეგია; B-მ უნდა გადაწყვიტოს.

### C-R4-04 — Low — სინთეზური stem-ების preview waveform თითქმის ბრტყელია

- **ნაბიჯები:** ბიბლიოთეკაში მონიშნე `ღამის პულსი · ბასი` / `· მელოდია`.
- **მოსალოდნელი:** PRE: waveform progress-ით იკითხება.
- **ფაქტობრივი:** max bar 7/32 px (ბასი), 5/32 (მელოდია). Middle East-ზე 32/32. Peak-ები არ არის normalized.
- **Evidence:** §3-ის გაზომვა, `shot-1280x720-ghost.png`.

**არა-ბაგი შენიშვნები:**
- ვიდეოს lane-ის სახელი `ვიდეო…` იჭრება — round 3-შიც იყო;
- 160×90 dock ვიდეოს „მორგებისთვის“ პატარაა — SRW-11B (floating/expanded) გადადებულია;
- preview export-ის დროს გრძელდება (export-ს არ ეხება).

## 6. Blocked / Tech Lead-ის real-mouse სია

- R23-1: scrollbar-ის ვიზუალი (graphite track, თხელი rounded thumb, ისრების და თეთრი რეილის გარეშე, corner, mint hover/drag) რეალურ Windows Chrome-ზე, 1280×720 / 1440×900;
- R23-2: wheel / trackpad და thumb drag ყველა scroller-ზე (library ხე და list, timeline ორივე ღერძზე);
- R12-L4: რეალური მაუსის HTML5 drag library → lane (ghost, amber, refusal);
- RF4-1/RF4-2: drift სუფთა რეალურ Chrome-ზე (C-R4-01).

## 7. Root-review და publication-checkpoint — დარჩენილი (B/C follow-up)

**ამ round-ში დაიხურა და C-მ დაადასტურა:** root M1 (R4-B7), M2 (R4-M2), L1/L4 (R4-B1/B2), L2 (R4-B5), L3 (R4-B4), L8 (R4-B6).

**ღიაა:**
- root **M3** (docs 012 honesty gap);
- **L6** (export dialog-ის „იგივე graph რაც დაკვრისას“ loop-ის დროს — ჯერ კიდევ ჩანს dialog-ში);
- **L7** (unbounded history, დემოსთვის მიღებულია);
- **L5** (biome-ignore — მიღებულია; ახლა 3-ია).

**publication-checkpoint / all-files review:**
- purchased `/studio/:productId` loader stem URL-ებს ყოველთვის `middle-east`-იდან აგებს (High, inherited, protected — SRW-21);
- category-ის match whitespace-ს ვერ ითვალისწინებს (Medium);
- `userId` hash-ის განსხვავება studio-ში და download-ში (Medium);
- `AGENTS.md` / `.codex` არარსებულ path-ებზე მიუთითებს (portable paths, Medium);
- T12 Gain/Volume ფაზა;
- SRW-07..10, SRW-11B, SRW-13..20 — `todo`.

**ბექლოგი დასრულებული არ არის.**

## 8. FB / Ableton-ის შესაბამისობა (ამ round-ის ფარგლებში)

- **FB-08 (პანელის ადგილი):**
  - SRW-11A — collapse/resize და compact dock — მუშაობს;
  - SRW-11B (floating/expanded ვიდეო, detail panel) ღიაა.
- **FB-15/16:** import და საერთო transport/mute რეგრესიის გარეშე (R2-V1/V2, R3-V2/V3/V4).
- **LIB-02..06 / LIB-08:** მუშაობს synthetic DnD-ით; LIB-02-ის წაკითხვადობა — C-R4-03.
- **PRE:**
  - ერთი preview source, waveform seek, ↑↓ switch, preview და transport ექსკლუზიურია, export-ში არ შედის;
  - auto-preview selection-ზე (Ableton-ის ნაგულისხმევი) არ არის — მოთხოვნაც არ იყო.
- **Product flow „find sound → add → fit video → export“:**
  - find → preview → drag → play → export დამოუკიდებლად დადასტურდა: R12-S2, sample-ის დონეზე;
  - „fit video“ გამოყენებადობას 160×90 dock და loaded მანქანაზე drift ზღუდავს.

# C — Round 12 დამოუკიდებელი ვერიფიკაცია (C-R7-01: swap-ის შემდეგ ვიდეოს settle, დაზუსტებული D-19a)

თარიღი: 2026-10-10 · Verifier: C (ახალი სესია, 20:00–20:20) · ობიექტი: A round 12 (`a-round-12.md`), დავალება `current-task.md`
Browser: gstack browse, საკუთარი state `c-browse.json`. Headless Chromium, Windows. G12-3-ის წინ daemon გაჩერდა და ახალი context გაიხსნა (credentials-ის გარეშე).
ყველა artifact: `c-round-12/` (`runs/`, `gates/`, `shots/`, `guard/`, `scripts/`, `checkpoint.md`). App source-ს C არ შეხებია. Tree სესიის დასაწყისში და ბოლოს იდენტურია (`gates/git-status-{start,end}.txt`, `gates/diffstat-{start,end}.txt`).

## 0. ვერდიქტი

**taskStatus: FAIL** — მიზეზი **R12-S**-ის სიტყვასიტყვითი ჩავარდნაა (§2.2). Task §4-ის მიხედვით: „A fix that passes R12-W1 but fails R12-S … is a FAIL“.

- **PASS:** R12-W1, R12-U, R12-Doc, §6.2-ის ვერდიქტიანი მიმდებარე რეგრესიები (R3-V1 N მხოლოდ ინფორმაციაა) და G12-1..3. **Premium auth bypass არ არის.**
- **R12-S FAIL (სიტყვასიტყვით):**
  - 3 run-ში 5 rate-ის ჩაწერა (1.1) settle-ის გარეთ იმავე frame-ის |d| 0.0192–0.0196-ზეა, ანუ ≤ 0.02. ყველა პირველ swap-მდეა (Play-დან 0.19–0.33 s), settle unarmed-ია და გზა ბაიტამდე უცვლელია;
  - პირველი swap-ის შემდეგ settle-ის გარეთ rate ≠ 1 = **0**, ანუ settle steady state-ში არ ჟონავს;
  - ზღვართან სხვაობა ≤ 0.8 ms-ია. ეს harness-ის reference-ის სიზუსტის ფარგლებშია, მაგრამ dock-ის შიდა drift > 0.02 C-მ ვერ დაადასტურა. ამიტომ PASS არ იწერება. B-მ R12-S-ის scope უნდა დააზუსტოს (C-R12-01).
- ყველა რიცხვი C-ის საკუთარი გაზომვაა. A-ს 9 wrap და guard proof მტკიცებულებად არ გამოყენებულა.
- **R12-W1:** 3 ვალიდური run, 9/9 wrap, `d300` −0.0030…+0.0058 (round 10: −0.017…−0.020). ჩანაცვლება არ დასჭირდა.
- **C-R7-01-ის landing (R12-W1) headless-ში გავიდა.** დახურვაზე B წყვეტს R12-S-ის scope-ის დაზუსტების შემდეგ. Tech Lead-ის quiet-Chrome RF7-3 (VP9 + H.264) SRW-03-ისთვის სავალდებულო მტკიცებულებად რჩება (task §6.6). ეს PASS-ად არ ჩაითვლება.
- **C-R12-01 (Low, R12-S-ის literal ჩავარდნა)** — §2.2, §7.

## 1. Gates

| Gate | შედეგი | Evidence |
|---|---|---|
| **G12-1** | **PASS.** video-sync **58/58**; arrangement **21 files / 413**; სრული vitest **53 files / 877** (856 + 21), 0 failure, `sfx-library` flake არ განმეორდა. tsc exit 0. Biome owned: 52 files, 0 diagnostics. `./app`: 0 errors, 218 warnings, 1 info (round 11-ის ტოლი). `npm run build` OK | `gates/vitest-*.txt`, `tsc.txt`, `biome-*.txt`, `build.txt` |
| **G12-2** | **PASS** — დეტალები ქვემოთ | `gates/g2.txt`, `b11-check.txt` |
| **G12-3** | **PASS** — §6 | `gates/network-*.txt`, `curl-token.txt`, `runs/anon-*.json` |

**G12-2 დეტალები:**
- **B-ის round-11 tree** (`b-round-11-tree-sha256.txt`): 33/37 OK. FAILED ზუსტად 4 owned ფაილია: dock, `video-sync.ts`, `video-sync.test.ts`, doc 020. ყველა §3.3 frozen ფაილი ემთხვევა.
- **A-ს base backup-ები** (`bak/*.base.*`, 3 კოდი + doc 020) sha256-ით = `b-round-11-tree-sha256.txt`.
- **Final:**
  - live dock `cmp` = `bak/ArrangementVideoDock.final.tsx`;
  - live sha (ae3c143e / 9d14e7ec / af27c1f7) = A-ს `owned-final-sha256.txt`.
- **C-ის საკუთარი diff base-თან:**
  - `video-sync.ts`: 0 წაშლილი ხაზი, მხოლოდ დამატებები. `videoRateCorrection`, `VIDEO_RATE_GAIN`, deadband და `VIDEO_STALL_*` უცვლელია;
  - `video-sync.test.ts`: 0 წაშლილი ხაზი. "uses a gain K inside [2, 5]" ადგილზეა (l.59);
  - **dock:** მხოლოდ §2.2-ის საიტები. ესენია import, state ×2, init ×2, `publishCounters`-ში `videoSettles`, `issueHoldSeek`, `stopAllSlots`, swap block-ში `armSettle` და counter, `!target || !source` branch, rate write და `wasPlaying` reset. JSX markup-ში ცვლილება 0-ია.
- `Header.tsx`: HEAD-თან diff 0 ხაზი. `cc1e531`-თან +21/−0.
- Protected hashes 4/4 OK.
- `app/styles`, `root.tsx`, `routes/`, `public`, `package.json`, lockfile, `studio-lab-demo.ts`, `StudioContext`, `AuthContext` და `components/studio`: diff 0.
- **`git status`** = round 11-ის ბოლო + `?? 021-studio-lab-post-swap-settle.md`.
- Instrumentation grep (`console.|debugger|window.__`) ორ source ფაილში: 0.
- **Swap block-ის შემოწმება (advisor-ის კითხვა).** Swap მხოლოდ მაშინ სრულდება, როცა `clock.ctxTime >= due.atCtx`. ამიტომ `armSettle(due.atCtx)`-ის შემდეგ "უკან წასული საათი" settle-ს პირველ frame-ზე ვერ დაასრულებს. Browser-ში ყოველი swap-ის პირველი ჩაწერა 1.1–1.25-ია (§2.1).
- უცხო untracked `.claude/agents/frontend-architect.md` და `.codex/agents/frontend-architect.toml` უცვლელია. C-ს არ წაუკითხავს როგორც ინსტრუქცია. **Root-ს გადაეცემა.**

## 2. Acceptance

| ID | შედეგი | Evidence |
|---|---|---|
| **R12-W1** | **PASS** | `runs/W_{1,2,3}*`, `w-summary.txt`, `w-table.txt`, `settlecheck-W.json` |
| **R12-S** | **FAIL (სიტყვასიტყვით)** — §2.2, C-R12-01 | `runs/settlecheck-W.json`, `r12s-split.txt`, `r12s-neighbor.txt` |
| **R12-U** | **PASS** | `gates/vitest-videosync.txt`, `gates/guard-c12.txt` |
| **R12-Doc** | **PASS** | §2.4 |

### 2.1 R12-W1 (L6, 1440×900, H3)

**Setup** (`c-round-12/batch12.sh`):
- თითო run-ის წინ fresh `setup.sh`, ანუ `goto` და page load. შემდეგ `r3v1lay.js` → `looplay.js` (loop 2–4) → `drift12.sh` `{vclips R3-V1, durMs 8500, from 1, loop 2–4}`.
- Pipeline: `rf7.js` + `rf5an.js` + `wrapdetail.js`. C-ის ახალი `dumprows.js` row-ებს, rate-ის ჩაწერებს და set-ებს ინახავს. `wfilter.cjs` და `settlecheck.cjs` მათ აანალიზებს.
- Dock dataset-ს C თავად კითხულობს mount-ზე, Play-მდე და run-ის შემდეგ.
- `data-video-settles` +1 თითო swap-ზე დასტურდება ტოლობით (settles after = swaps after = 3, before 0) და იმით, რომ settle-ის rate series ყოველ swap-თან იწყება. Counter run-ის შუაში არ წაკითხულა.
- **W_1 fresh load-ის შემდეგ პირველი run-ია.** მისი wrap 1 სესიის პირველი swap-ია (`videoSwaps` 0 → 3).

**წესი წინასწარ დაფიქსირდა** (`checkpoint.md`, მონაცემების ნახვამდე):
- verdict = `wrapdetail` `d300`;
- max |d| 500 ms-ში ორჯერ ქვეყნდება: raw და მხოლოდ swap-ის შემდეგი ელემენტის row-ებით.

C-ის 9 wrap-ში იმავე frame-ის pre-swap row არ გამოჩენილა (`preSwapRowsInWindow` ცარიელია), ამიტომ ორივე max ტოლია. A-ს W_2 w1 1.98 C-თან არ განმეორდა.

**ბიუჯეტი:** 3 ვალიდური, 0 ჩანაცვლება.

| Run | D-24 verdict | cover % / stalls | raw med / max | swaps / fallbacks | `videoSettles` before → after | escalations | hard seek wrap-ის 300 ms-ში | rate | multi ms | CPU med |
|---|---|---|---|---|---|---|---|---|---|---|
| **W_1** | PASS | 0 / 0 | .0052 / .0137 | 3 / 0 | 0 → **3** | 0 → 0 | 0 | 1–1.45 | 0 | 11 % |
| **W_2** | PASS | 0 / 0 | .0081 / .0155 | 3 / 0 | 0 → **3** | 0 → 0 | 0 | 1–1.45 | 0 | 10 % |
| **W_3** | PASS | 0 / 0 | .0053 / .0167 | 3 / 0 | 0 → **3** | 0 → 0 | 0 | 1–1.35 | 0 | 10 % |

**Hard rule-ები ყველა run-ში სრულდება:**
- `setsWhileSeeking` 0;
- rate ⊂ [0.5, 2];
- `visibleOneAlways`, `mutedAlways`, `afterOk`;
- `framesPastLoopEnd` 0, app LoAF 0;
- `data-video-hard-seeks` 0.

Harness თითო run-ში ერთ active `currentTime` set-ს აჩენს 8.47–8.48 s-ზე (Pause 8.5-ის ახლოს; A ამას gap-entry-ს უწოდებს). მიზეზი C-ს არ შეუმოწმებია. ის ყველა wrap-ის ფანჯრის გარეთაა; `data-video-hard-seeks` 0.

**Settle-ის ფანჯარაში** (swap → +1.0 s, |d| ≤ 0.11):
- rate > 1.45 არცერთ ჩაწერაში და არცერთ row-ზე: **0** (writes 29/34/21, rows 180/180/183);
- max 1.45 / 1.45 / 1.35.

**თითო wrap** (`runs/w-table.txt`):

| Run | wrap | ctxRel sample | vt | **d300** | ≤ 0.01? | max \|d\| 500 ms (raw = post-swap el.) |
|---|---|---|---|---|---|---|
| W_1 | 1 / 2 / 3 | 0.310 | 2.3105 / 2.3088 / 2.3155 | **+0.0005 / −0.0012 / +0.0055** | ✓ ✓ ✓ | .0473 / .0487 / .0472 |
| W_2 | 1 / 2 / 3 | 0.310 | 2.3146 / 2.3153 / 2.3158 | **+0.0045 / +0.0053 / +0.0058** | ✓ ✓ ✓ | .0521 / .0515 / .0520 |
| W_3 | 1 / 2 / 3 | 0.302 | 2.2990 / 2.2994 / 2.2995 | **−0.0030 / −0.0026 / −0.0025** | ✓ ✓ ✓ | .0376 / .0387 / .0365 |

**Settle-ის rate series** (swap-იდან, `settlecheck-W.json`), მაგალითად W_1 wrap 1: `0.03:1.25 0.051:1.4 0.08:1.45 0.099:1.4 0.11:1.3 0.15:1.25 0.16:1.15 0.179:1.1 0.2:1.15 0.219:1`.
- 1-ზე დაბრუნება ყველა wrap-ში +0.21…+0.23 s-ზეა;
- cap (1.0 s) არცერთ wrap-ში არ მიღწეულა.

Settle-ის დასრულების მიზეზი დაკვირვებით მოჩანს (rate 1-ზე ბრუნდება) და source instrumentation-ით არ არის გაზომილი.

**შედარება round 10-თან:**
- `d300`: −0.017…−0.020 → **−0.003…+0.006**;
- peak lag (decoder freeze, swap-ის შემდეგ ~+50…100 ms) .037–.052-ია, round 10-ში .042–.058. Freeze ისევ არსებობს, მაგრამ +300 ms-მდე სრულად ინაზღაურება.

### 2.2 R12-S (settle-ის გარეთ rate არ "ნადირობს") — FAIL სიტყვასიტყვით

Settle-ის ფანჯრების გარეთ (swap → +1.0 s) ორი უბანი განსხვავდება (`r12s-split.txt`, `r12s-neighbor.txt`).

**პირველი swap-ის შემდეგ (განზრახვის მთავარი მტკიცებულება):**
- rate ≠ 1-ის ჩაწერა **0**, row-ები rate ≠ 1-ით **0/147, 0/147, 0/145**;
- V3_1-ში 0/237;
- settle steady state-ში არ "ჟონავს".

**პირველ swap-მდე** (Play-დან 0.04–0.33 s, start transient):
- rate ≠ 1-ის ჩაწერა 8 / 6 / 4 (1.1/1.15). Row-ების წილი settle-ის გარეთ 3.7 / 3.4 / 3.7 % (12/327, 11/327, 12/325).
- **Join-ის წესი:** sampler-ი dock-ის rAF-ის შემდეგ ეშვება იმავე frame-ში (+0.3…0.8 ms), ამიტომ dock-ის მიერ ნანახი `currentTime` იმავე frame-ის row-ია.
- იმავე frame-ის row-ით **5 ჩაწერა ≤ 0.02-ზეა:**

  | Run | Play-დან | rate | same-frame d | წინა / შემდეგი frame |
  |---|---|---|---|---|
  | W_1 | 0.190 | 1.1 | −0.0192 | −0.0297 / −0.0244 |
  | W_1 | 0.262 | 1.1 | −0.0195 | −0.0169 / −0.0090 |
  | W_1 | 0.331 | 1.1 | −0.0192 | −0.0152 / −0.0098 |
  | W_2 | 0.190 | 1.1 | −0.0192 | −0.0299 / −0.0209 |
  | W_3 | 0.302 | 1.1 | −0.0196 | −0.0157 / −0.0115 |

- დანარჩენ 13 ჩაწერაში იმავე frame-ის |d| > 0.02-ია (მაგ. 0.041-ზე −0.024 / −0.023).
- წინა ვერსიაში C წინა frame-ის row-ით join-ავდა და 7 ჩაწერა ჰქონდა. ეს join-ის ფაზის შეცდომა იყო; სწორი რაოდენობა 5-ია.

**რა არის დადასტურებული და რა არა:**
- **დადასტურებულია:**
  - settle ამ მომენტში unarmed-ია: `videoSettles` Play-მდე 0-ია, F_1-ში პირველი Play-ის შემდეგ 0 რჩება, arm მხოლოდ swap block-შია;
  - unarmed `settleRate` ≡ `videoRateCorrection`: unit grid და C-ის M4;
  - ეს ჩაწერები ბაიტამდე უცვლელი steady rule-ია;
  - იმავე სესიაში F_1 start-ზე რეალურ lag-ს ზომავს (w1 .0416, w2 .0433), ამიტომ 1.1 start-ზე მოსალოდნელია.
- **არ არის დადასტურებული:**
  - dock-ის შიდა drift > 0.02 ამ 5 ჩაწერაზე. Harness-ის `d` ctx-ზე დაფუძნებულ `posAt`-ს იყენებს, dock კი live position-ს. სხვაობა ≤ 0.8 ms-ია, რაც reference-ის სიზუსტის ფარგლებშია, მაგრამ C-ის ინსტრუმენტით ვერ გადამოწმდა;
  - base-ზე იგივე გაზომვა (source read-only).

**შეფასება:** R12-S-ის დადგენილი ინსტრუმენტით (harness-ის `d` იმავე row-ზე) კრიტერიუმი 5 ჩაწერაზე ირღვევა, ამიტომ **FAIL**. Settle-ის "ნადირობა" არ არის: settle-ის შემდეგ steady უბანში 0 ჩაწერაა. ეს scope-ის ან სიზუსტის საკითხია და B-ს გადაეცემა (C-R12-01).
- Median |d| settle-ის გარეთ (ინფორმაცია): .0071 / .0085 / .0089.

### 2.3 R12-U

- `video-sync.test.ts` 58/58. 21 ახალი ტესტი ყველა R12-U bullet-ს ფარავს: მუდმივები, band, მონოტონურობა, [MIN, MAX], ბიჯი, in-band პირველი sample, re-entry, cap, `endSettle`, უკან წასული საათი, grid −1.2…+1.2, arm-ის გარეშე, სიმულაცია, steady control, 400 ms stall-ის priority.
- **C-ის დამოუკიდებელი guard** (`gates/guard-c12.txt`). Source read-only დარჩა; `video-sync.ts` და ტესტი `c-round-12/guard/`-ში დაკოპირდა და vitest იქ გაეშვა. Baseline copy 58/58.

| Mutation | ჩავარდნილი ტესტები |
|---|---|
| M1 "პირველი in-band ამთავრებს" | 4: in-band first, restart, stall-edge property, **სიმულაცია +300** |
| M2 `RATE_MAX` = 1.5 | 3: **მუდმივები**, property, 400 ms priority |
| M3 stall priority-ის გარეშე | 3 |
| M4 `armSettle` no-op | 11 |
| M5 cap-ის გარეშე | 1 |
| M6 K = 4 | 3 (მათ შორის სიმულაცია) |
| M7 steady deadband 0.008 | 4 (მათ შორის "20 ms dead band") |

- აღდგენილი copy = live source (`cmp`).
- A-ს guard 1/2 claim-ები (3 + 3) C-ის M1/M2-ით დადასტურდა. M1 C-თან 4 ტესტს აგდებს, რადგან property ტესტი review-ის შემდეგ დაემატა.

### 2.4 R12-Doc

- **Doc 020:** diff მხოლოდ სტატუსის ხაზი და ორი TODO ხაზია. ტექსტი ზუსტად §3.2-ია: R11-P2/P2k/P2a/P4/U/Doc, მიმდებარე რეგრესიები და G11-1..3 PASS; 4 Low, C-R11-01..04; 01..03 → 14a (D-29c) "ღიად რჩება"; 04 მიღებული კონვენციაა. "Resolved" სიტყვა არ არის.
- **Doc 021:** სტატუსი "pending C, არცერთი ID PASS არ არის". A-ს გაზომვები "C-ის verdict არ არის"-ით არის მონიშნული. Unverified PASS არ არის. `sourceChanged` ღია საკითხად წერია.

## 3. მიმდებარე რეგრესიები (§6.2)

| ID | შედეგი | Evidence |
|---|---|---|
| **R2-V3 ×1** | **PASS.** Round-10 layout (v3lay) და ტოლერანსები. Swap 0.510 / 1.011, raw med/max .0035/.0093 (round 10: .0173), cover 0, multi 0, `setsWhileSeeking` 0, hard 0, fallbacks 0. **`videoSettles` 0 → 2 = boundary swaps 2.** Escalations 0 → 0. Settle-ის rate max 1.45, \|d\| ≤ 0.11-ზე > 1.45 = 0. Settle-ის გარეთ rate ≠ 1 = 0/237 | `runs/V3_1*`, `adj-summary.txt` |
| **RF5-3 ×1 (H2)** | **PASS.** `pass:true`, `passH2:true`, play −start 0.0007 ≤ 0.0167, `preAllPaused:true`, w1 .0416, w2 .0433, `h2Rejected` []. **`videoSettles` 0 run-ის წინ და შემდეგ** (პირველი Play settle-ს არ ართავს) | `runs/F_1.json`, `adj-summary.txt` |
| **R3-V1 mode N ×1** (ინფორმაცია, PASS არ არის) | raw **.0109/.0196** (round 10: .0131/.0207, ანუ უარესი არ არის), cover 0, app LoAF 0, forced 0. `tick` p50/p95 0.2/0.4, + microtask 0.2/0.5. CPU med 10 %. Gap-entry swap 8.001-ზე → settles 1, escalations 0. **C-R6-02-ის ვერდიქტი არ არის** | `runs/N_1*` |
| **R5-L3** | **PASS.** Music (16 s) და video-audio (6 s): 4 source თითოეულზე, `[0,1,3] [3,2,2] [5,2,2] [7,2,2]`. **Seam 0 sample** ყველგან. **1 source თითო clip-ზე თითო wrap-ზე** | `runs/loopae.json` |
| **R5-E1** | **PASS.** Loop-on WAV = loop-off WAV. RIFF PCM, 2ch, 48 kHz, 24-bit, 768 000 frame = 16.000 s. **maxDiff 0** (≤ 1.2e-7) | `runs/loopae.json` |
| **RF7-P2** | **PASS.** `render-budget.test.tsx` sha = b11, სრულ suite-ში მწვანეა | G12-1/2 |
| **Dock quick check** | **PASS.** 1440×900: dock 1152×107, video 160×90, transport rows 2. 1280×720: dock 992×107, video 160×90, rows 3. Block geometry round 11-ის `p4` run-ების იდენტურია. Overlaps 0, doc scroll 0. Ერთი ხილული `<video>` (standby opacity 0), ორივე muted. Mount-ზე `data-video-settles="0"`. Markup უცვლელია | `runs/p4-*.json`, `shots/dock-*.png` |

## 4. რეალური user flow (find → add → fit video → export)

1440 და 1280, synthetic demo + owned test media (`media/`, ლოკალური, გარეთ არაფერი ატვირთულა).
- **Find + add:** `lay11.js`-ით ბიბლიოთეკიდან `სრული მიქსი`, `პულსი` და `Soft impact` სწორ ხაზებზე დაემატა, ვიდეო `beeps-6s-vp9-opus.webm` → `[video,0,6.008]` (`shots/dock-1280x720.png`).
- **Fit video:** R3-V1/L6-ის layout-ში ვიდეო audio clock-ს მისდევს. Loop wrap-ზე landing ±0.01-შია (§2.1), boundary swap-ზე raw max .0093.
- **Export:** WAV ფაილის მონაცემები შემოწმდა: 16.000 s, 768 000 frame, loop on = off, seam 0. Peak 1.0 (0 dBFS) ისევ ჩანს. ეს ცნობილი **R13-M4 / SRW-13**-ია და ახალი ბაგი არ არის.

**Ableton-თან შედარება (ინფორმაცია):** Ableton Arrangement-ში ვიდეო audio clock-ს ემორჩილება და loop-ის wrap-ზე audio არ ირყევა. აქაც audio wrap sample-accurate-ია (seam 0), ვიდეო კი swap-ის შემდეგ ≤ 0.3 s-ში ±10 ms-ში ჯდება. Swap-ის შემდეგ ~50 ms-იანი მოკლე lag (+50…100 ms) headless decoder-ის freeze-ია. ის Tech Lead-ის quiet-Chrome-ზე უნდა შეფასდეს (RF7-3).

## 5. Harness

- C-ის round-10 harness-ის ასლი `c-round-12/`-შია: `setup.sh`, `b.sh`, `r.sh`, `drift12.sh`, `drift9.sh`, `sum12.js`, `sum8.js`. ყველა path `c-round-12/runs`-ზე მიუთითებს; `c-round-10/` ხელუხლებელია.
- ახალი სკრიპტები:
  - `scripts/dumprows.js`: row-ები, rate-ები და set-ები;
  - `scripts/dataset.js`: dock-ის მთელი dataset;
  - `wfilter.cjs`: d300 და max-ის ორი ვარიანტი;
  - `settlecheck.cjs`: rate-ის ჩაწერის join-ი harness-ის `d`-თან wall-clock-ით, settle-ის ფანჯრების კლასიფიკაცია;
  - `startupsplit.cjs`: pre/post first swap.
- **Repro:** `bash c-round-12/batch12.sh W_x && node c-round-12/wfilter.cjs W_x && node c-round-12/settlecheck.cjs W_x`.

## 6. G12-3: anonymous / premium auth

**Direct (ახალი daemon/context, 1280×720):**
- `auth_user` null, cookie ცარიელი, localStorage მხოლოდ `czaba_session_id`;
- 4 track header, "Sign in required" არ ჩანს;
- media მხოლოდ `middle-east.mp3` და `videos/hero/hero-music.mp3`.

**Header link:** `/` → `header a[href=/studio-lab]` (`Studio LabDemo`) → `/studio-lab`, auth null, 4 lane.

**`/studio/middle-east`** → "Sign in required" (`shots/studio-middle-east-anon.png`). Browser-იდან `studio-token`-ის request არ გაიგზავნა (`gates/network-studio-me.txt`).

**Network:**
- **anon direct და reload:** `studio-token`, `/api/recording`, `/api/download` და R2: **0**. API მხოლოდ `GET :5199/api/cart` (ნებადართულია). GA `gcs=G100` (consent-denied).
- **Play-ის შემდეგ** fetch hook-ით `Authorization` header 0, forbidden 0 (`runs/anon-fetch-hook.json`).
- **სრული სესია** (496 ჩანაწერი) 2 match-ს აჩვენებს:
  - (a) `GET /api/studio-token… → 401` — ეს **C-ის საკუთარი** probe fetch-ი იყო anon გვერდიდან (401 = უარი);
  - (b) `/app/lib/r2.config.ts` — Vite module, `/studio/middle-east` route-ის კოდი. R2 host-ზე request არ არის.
- Hosts: 127.0.0.1:5173, localhost:5199 (cart), fonts, GA/GTM, unsplash (home).

**curl:**
- anon → **401** `Please sign in to access Studio.`;
- fake Bearer → **500** `Unable to prepare Studio access`, token არ გაიცა.
- Backend 5199 გათიშულია (000), ამიტომ fake Bearer-ის შემოწმება ნაწილობრივია, როგორც round 8–11-ში.

**Import scan:** arrangement-ის კოდში (`components/arrangement`, `lib/arrangement`, `ArrangementContext`, ტესტების გარეშე) `Authorization`, `useAuth`, `apiClient`, `r2.config`, `navigator.clipboard`, `StudioContext` და `components/studio`: 0.

**Bypass არ არის.**

## 7. დაკვირვებები B-სთვის

### C-R12-01 (Low; R12-S literal FAIL): პირველი Play-ის start-ზე steady rule 1.1-ს წერს, როცა იმავე frame-ის harness |d| 0.0192–0.0196-ია

- **Repro:**
  ```
  bash c-round-12/batch12.sh W_x
  node c-round-12/settlecheck.cjs W_x
  node c-round-12/startupsplit.cjs W_x
  node c-round-12/neighbor.cjs W_x
  ```
  L6, Play from 1.
- **Expected (R12-S):** settle-ის გარეთ rate ≠ 1 მხოლოდ მაშინ, როცა იმავე row-ზე |d| > 0.02.
- **Actual:**
  - 5 ჩაწერა 0.19–0.33 s-ზეა (§2.2-ის ცხრილი), ყველა პირველ swap-მდე და unarmed settle-ით;
  - პირველი swap-ის შემდეგ 0 ჩაწერაა.
- **სავარაუდო მიზეზი (დაუდასტურებელი):** harness-ის reference (ctx-ზე დაფუძნებული `posAt`) dock-ის live position-ს ≤ 1 ms-ით ჩამორჩება. Rate 1.1 ნიშნავს, რომ dock-მა |d| > 0.02 დაინახა. ეს ამ რაუნდში შეუცვლელი გზაა.
- **B-ს გადასაწყვეტი:**
  - (a) R12-S-ის scope-ის დაზუსტება, მაგ. პირველ swap-მდე start-ის უბნის გამორიცხვა ან ტოლერანსი reference-ის სიზუსტეზე. ეს B-ის გადაწყვეტილებაა; C ტოლერანსს არ ასუსტებს;
  - ან (b) ინსტრუმენტის დაზუსტება: C-ის harness-ში dock-ის live position-ის წაკითხვა ცალკე run-ში. ამ რაუნდის 3-run-იანი ბიუჯეტი ამოწურულია;
  - ან (c) milestone-ის RF5-3-ში start-ის rate-ის ჩაწერების ცალკე შემოწმება.

### სპეციფიკაციის კითხვა (A-ს reviewer Low 1, ბაგი არ არის)

`sourceChanged` branch-ში `endSettle()` არ არის. Settle 1.0 s cap-ით არის შეზღუდული. B-მ უნდა გადაწყვიტოს: მეხუთე end site თუ bound-ის მიღება. ამ რაუნდში browser-ში ეს არ გაზომილა (acceptance-ში არ შედის).

## 8. A-ს claim-ები, რომლებიც C-მ დამოუკიდებლად ვერ შეამოწმა

- code-reviewer ×2 (9/10). Subagent თავიდან არ გაშვებულა.
- A-ს `sim/numbers.txt` (K = 8/9, 30/50/70 ms freeze). C-მ მხოლოდ საბოლოო სიმულაციის ტესტი გაუშვა და M1/M6 mutation-ით შეამოწმა. Sweep თავიდან არ გაკეთებულა.

## 9. Carried (არ არის PASS)

- **SRW-03 / RF7-3:** Tech Lead-ის quiet Chrome (VP9 + H.264) სავალდებულო მტკიცებულებაა, R12-W1-ის PASS-ის მიუხედავად.
- **C-R8-01, C-R6-02 (Medium):** ღიაა, Tech Lead quiet Chrome. N_1 ამ რაუნდში მხოლოდ ინფორმაციაა.
- **სხვა გეგმიური სამუშაო:**
  - stage 3 (round 13);
  - polish 14a–14c: C-R11-01..03 (D-29c), L11, M1, M-R10-1/M2, L2–L8, design (a)–(d);
  - 21 regression-debt ID (milestone);
  - SRW-13..20, SRW-21 adapter, T12;
  - SRW-23 scrollbar-ები (Tech Lead real Chrome).
- **Root carry** (`root-pre-push-review.md` / `publication-checkpoint.json`, ჯერ კიდევ ღია):
  - purchased `/studio/:product` loader-ი middle-east-ს hardcode-ს უკეთებს (SRW-21);
  - Lenis `/studio/*`-ზე (Tech Lead);
  - instruction-file-ების portable paths;
  - export hard-clip 0 dBFS-ზე (R13-M4, SRW-13; ამ რაუნდშიც peak 1.0);
  - final commit/push მხოლოდ ყველაფრის შემდეგ, root-ის რეგრესიით.
  - Root M1/M3, L1–L4, L6, L7 და L8 დახურულია.
- **Root-ისთვის:** უცხო untracked `.claude/agents/frontend-architect.md` და `.codex/agents/frontend-architect.toml`.

## 10. შეზღუდვები

- Headless Chromium, CPU med 10–11 %. Stall coverage 0, ამიტომ ჩანაცვლება არ დასჭირდა.
- Settle-ის დასრულების დრო და მიზეზი rate-ის series-იდან არის ამოცნობილი; source instrumentation არ გამოყენებულა.
- Harness-ის `d` (ctx-ზე დაფუძნებული) dock-ის შიდა drift-ის (live position) იდენტური არ არის. სხვაობა ≤ 1 ms-ის რიგისაა, მაგრამ R12-S-ის ზღვარზე გადამწყვეტია (C-R12-01).
- Fake Bearer-ის შემოწმება ნაწილობრივია (backend 5199 გათიშულია).

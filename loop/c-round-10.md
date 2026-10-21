# C — Round 10 დამოუკიდებელი ვერიფიკაცია (C-R7-01 + C-R7-02)

თარიღი: 2026-10-10 · Verifier: C (ახალი სესია, 17:11–17:40) · ობიექტი: A round 10 (`a-round-10.md`), დავალება `current-task.md`
Browser: gstack browse, საკუთარი state `c-browse.json`. ახალი daemon, credentials-ის გარეშე. Headless Chromium, Windows. G10-3-ის წინ daemon გაჩერდა და ახალი context გაიხსნა.
ყველა artifact: `c-round-10/` (`runs/`, `scripts/`, `shots/`, gate log-ები). App source-ს C არ შეხებია. Tree სესიის დასაწყისში და ბოლოს იდენტურია (`git-status-start/end.txt`, `diffstat-start/end.txt`).

## 0. ვერდიქტი

**taskStatus: FAIL** — მიზეზი **R10-W1**-ის ჩავარდნაა (C-R7-01 ღია რჩება).

- **PASS:** R10-W2, R10-R1, R10-R2, R10-Doc, ყველა მიმდებარე რეგრესია და G10-1..3. **Premium auth bypass არ არის.**
- **R10-W3: not applicable.** Dock, `video-sync.ts` და `video-sync.test.ts` `cmp`-ით A-ს round-start backup-ის იდენტურია.
- **R10-W1 FAIL.** 3 ვალიდური run-ის 9 wrap-იდან 6 დაეცა [2.29, 2.31]-ის ქვემოთ (W_2: 3/3, W_4: 3/3). W_5-ის 3 wrap ფანჯარაშია. ტოლერანსი არ შესუსტებულა.
- **მთავარი დასკვნა B-სთვის.** ჩავარდნა სისტემურია და sampling-ის ფაზაზე არ არის დამოკიდებული:
  - +300 ms-ზე `d` (video − აუდიოს მოსალოდნელი დრო) ყველა 9 ვალიდურ wrap-ში **−0.017…−0.020 წმ**-ია;
  - ზუსტად +0.300-ზე ვიდეო ≈ **2.280–2.284**-ზეა, ანუ ყველა 9 wrap ფანჯრის გარეთაა;
  - W_5-ის 3 wrap ფანჯარაში მხოლოდ იმიტომ მოხვდა, რომ harness-ის sample 10 ms-ით გვიან მოვიდა (ctxRel 0.310) და ჩამორჩენა გააბათილა;
  - მექანიზმი: D-19 deadband (0.02) RF5-2-ის ნახევარ-ფანჯარაზე (0.01) ორჯერ ფართოა. A-ს 18/18 და C-ის 9/9 wrap ერთსა და იმავეს აჩვენებს. დაშვებული fix-ის არცერთი ფორმა მას ვერ წვდება.

## 1. Gates

| Gate | შედეგი | Evidence |
|---|---|---|
| G10-1 | **PASS.** tsc exit 0. vitest **52 files / 812 passed** (809 + 3), timeout flake არ განმეორდა. arrangement 20 / 348. biome owned: 51 files, 0 diagnostics. `./app`: 0 errors, 218 warnings, 1 info (round 9-ის მსგავსად). `npm run build` OK | `c-round-10/tsc.txt`, `vitest-*.txt`, `biome-*.txt`, `build.txt` |
| G10-2 | **PASS** — დეტალები ქვემოთ | `hashes.txt`, `frozen-check.txt`, `git-status-*.txt` |
| G10-3 | **PASS** — §6 | `network-*.txt`, `curl-token.txt`, `runs/anon-*.json` |

**G10-2 დეტალები:**
- Protected hashes 4/4 OK, დასაწყისში და ბოლოს.
- §3.3 frozen 15/15 sha256 ემთხვევა A-ს round-start სიას.
- `Header.tsx`: HEAD-თან diff 0, `cc1e531`-თან +21/−0.
- `git status` = round-9 end + `?? 019-…md`.
- `git diff --stat` round 9-ის ბოლოსთან შედარებით მხოლოდ `view.ts`-ში (+1) და `view.test.ts`-ში (+22) განსხვავდება.
- `cmp`:
  - dock = `bak/ArrangementVideoDock.fixed.tsx` = `.base.tsx`;
  - `video-sync.ts`, `video-sync.test.ts` და `ArrangementRuler.tsx` = base;
  - `view.ts` და `view.test.ts` = `bak/*.fixed.ts`.
- Probe marker (`a10Probe`, `__a10`) `app/`-ში: 0.

## 2. R10-W1: L6 ვერდიქტის run-ები (C, სუფთა source, probe-ის გარეშე)

**Setup** (`c-round-10/batch10.sh`):
- 1440×900. თითო run-ის წინ ახალი `setup.sh`, ანუ `goto` და fresh page load.
- შემდეგ `r3v1lay.js` → `looplay.js` (loop 2–4) → `drift10.sh` `{vclips R3-V1, durMs 8500, from 1, loop 2–4}`.
- Pipeline: `rf7.js` + `rf5an.js` + `sum10.js` + `wrapdetail.js` (C-ის ახალი: rAF series wrap-ის გარშემო და `d` +300-ზე).
- **Fresh-load პირობა დამტკიცებულია:** ყველა run-ში `counters.before.swaps = 0`, `after.swaps = 3`. ამიტომ თითო ვერდიქტის run-ის wrap 1 სესიის პირველი swap-ია.
  - ეს A-ს run-ებისგან განსხვავდება: A-ს W_2–W_5-ში setup თავიდან არ გაკეთებულა და standby "carried" იყო.

**ბიუჯეტი:** 3 ვალიდური + 2 ჩანაცვლება, ზუსტად ამოწურული.

| Run | Verdict (D-24) | cover % / stalls | ვალიდური? | wraps vt +300 (harness) | swap / fallback | hard seek wrap-ის 300 ms-ში | raw max | multi ms | rate | CPU med |
|---|---|---|---|---|---|---|---|---|---|---|
| W_1 | INVALID | 16.3 / 7 | **არა** (ჩანაცვლება 1) | 2.291 / 2.292 / **2.235** | 3/0 | 0 | 0.1221 | 0 | 1–1.55 | 18 % |
| **W_2** | PASS | 0 / 0 | კი | **2.283 / 2.284 / 2.285** | 3/0 | 0 | 0.0204 | 0 | 1–1.2 | 20 % |
| W_3 | INVALID | 15.0 / 8 | **არა** (ჩანაცვლება 2) | 2.292 / 2.291 / 2.291 | 3/0 | 0 | 0.1146 | 0 | 1–1.5 | 21 % |
| **W_4** | PASS | 0 / 0 | კი | **2.284 / 2.283 / 2.282** | 3/0 | 0 | 0.0378 | 0 | 1–1.2 | 19 % |
| **W_5** | PASS | 0 / 0 | კი | 2.292 / 2.291 / 2.290 | 3/0 | 0 | 0.017 | 0 | 1–1.25 | 19 % |

**ვალიდურ run-ებში ყველა hard rule სრულდება:**
- `setsWhileSeeking` 0, rate [1, 1.25] ⊂ [0.5, 2];
- `visibleOneAlways`, `mutedAlways`, `afterOk`;
- `multiPlayingMaxMs` 0 ≤ 17;
- `framesPastLoopEnd` 0;
- app LoAF 0.

თითო run-ში ერთი hard seek არის **8.44–8.47 s**-ზე. ის Pause-ის მომენტს ემთხვევა და wrap-ის ფანჯრების გარეთაა (wrap-ები 3, 5, 7 s-ზეა). Round 7-ის L6_1-შიც იგივე იყო (8.47).

**თითო wrap-ის დეტალი** (`runs/w-table.txt`, `runs/*_wrapdetail.json`). `vt@true300` ≈ წრფივი ინტერპოლაციაა frame-ებს შორის, ამიტომ მიახლოებითია.

| Run | wrap | harness vt | ctxRel sample | **d +300** | vt@true300 ≈ | max \|d\| 500 ms | [2.29, 2.31]? |
|---|---|---|---|---|---|---|---|
| W_2 | 1 / 2 / 3 | 2.2827 / 2.2844 / 2.2851 | 0.302 | −0.0193 / −0.0176 / −0.0169 | 2.281 / 2.283 / 2.284 | .050 / .044 / .050 | ✗ ✗ ✗ |
| W_4 | 1 / 2 / 3 | 2.2836 / 2.2833 / 2.2816 | 0.302 | −0.0184 / −0.0187 / −0.0204 | 2.282 / 2.282 / 2.280 | .043 / .044 / .042 | ✗ ✗ ✗ |
| W_5 | 1 / 2 / 3 | 2.2922 / 2.2911 / 2.2905 | 0.310 | −0.0178 / −0.0189 / −0.0195 | 2.283 / 2.282 / 2.282 | .056 / .058 / .056 | ✓ ✓ ✓ (sample-ის ფაზის გამო) |
| W_1 (inv.) | 3 | 2.2346 | 0.310 | **−0.0754** | 2.221 | **.111** | ✗ (stall-იან run-ში) |

**ფორმა (C-ის სუფთა source-ზე, W_2 wrap 1, `[rel, vt, d]`):**
`[0.0007, 2.0000, −0.0007]`, `[0.022, 2.0117, −0.0103]`, `[0.030, 2.0117, −0.0183]`, `[0.0513, 2.0117, −0.0396]`, `[0.070, 2.0235, −0.0465]`, `[0.0913, 2.0414, −0.0499]` … `[0.2807, 2.2645, −0.0162]`, `[0.302, 2.2827, −0.0193]`.
- swap-ის მომენტში offset ≈ 0, ანუ standby პოზიციონირებულია;
- +22…+51 ms-ში `currentTime` 2.0117-ზე ჩერდება;
- peak lag ≈ 0.05;
- soft sync 1.1–1.2 rate-ით ეწევა და deadband-ის კიდეზე, ≈ −0.02-ზე ჩერდება.

ეს A-ს probe-ის მექანიზმს probe-ის გარეშე იმეორებს.

**ორი კომპონენტი (ინფორმაციისთვის):**
1. **სისტემური −0.02 settle** ყოველ swap-ზეა: A 18/18, C 9/9 ვალიდური + 5/6 არავალიდური. ის stall-ებზე არ არის დამოკიდებული.
2. **დიდი გვიანი landing** (W_1 wrap 3: d −0.075, max 0.111, rate 1.45-მდე) მხოლოდ stall-იან, არავალიდურ run-ში გამოჩნდა. ის round-7-ის L6_1-ის 2.244-ის ტიპისაა. Round 7-ის "წყვეტილი 10–56 ms" ამიტომ ორი სხვადასხვა მოვლენა იყო.

**ვერდიქტი: R10-W1 FAIL.** სიტყვასიტყვით harness-ის წესით 6/9 wrap ფანჯრის გარეთაა, ორ ვალიდურ run-ში. ზუსტად +300-ზე კი 9/9 გარეთაა.

## 3. Acceptance

| ID | შედეგი | Evidence |
|---|---|---|
| **R10-W1** | **FAIL** (§2) | `runs/W_*`, `w-summary.txt`, `w-table.txt` |
| **R10-W2** | **PASS** — დეტალები ქვემოთ | `runs/w2-recompute.txt`, `scripts/w2recompute.cjs` |
| **R10-W3** | **Not applicable.** Source არ შეცვლილა (`cmp`). Helper და ტესტი არ დამატებულა | §1 |
| **R10-R1** | **PASS** — დეტალები ქვემოთ | `runs/n5r-*.json`, `n5r-compare.txt`, `shots/ruler-end-*.png` |
| **R10-R2** | **PASS** — დეტალები ქვემოთ | `guard-ruler.txt`, `scripts/guard-ruler.cjs`, `a-round-10/guard-c-r7-02.txt` |
| **R10-Doc** | **PASS** — დეტალები ქვემოთ | docs |

### R10-W2 — დეტალები

- `a-round-10/runs/{W_1..W_5,F_1}_wraps.json` არსებობს. ყველა 18 wrap-ს აქვს §2.1-ის ველები: arm/seek/skip, `seeked`, swapInstant (lateBy, readyState, seeking, offset, playPending), play latency, dSeries, rateWrites და ordinal.
- **C-ის გადათვლა ყველა 18 wrap-ზე** (≥ 1 თითო run-ზე):
  - swap-ის offset (dSeries-ის პირველი row) = 0, A-ს `swapInstant.offset`-ის იდენტური;
  - `d` +300-ზე dSeries-იდან = A-ს `at300.d` (18/18 ზუსტი);
  - max |d| 500 ms = A-ს `maxAbsD500`;
  - harness-ის clock-ით `d` −0.013…−0.027.
- **დასახელებული მიზეზი:**
  - (d) სწორად უარყოფილია, რადგან offset 0-ია ყველა გვიან wrap-ში;
  - (a) და (b) უარყოფა ციფრებს ემთხვევა;
  - (m) სწორად უარყოფილია: `d` ±10 ms-ს სცდება.
- **შენიშვნა B-სთვის.** "(c) environment" ფინდინგს ამცირებს. Post-start freeze ორ სესიაში და სუფთა source-ზე მეორდება. ეს headless decoder-ის start-ის ქცევაა, D-19 deadband-თან ერთად, და არა შემთხვევითი ხმაური. Tech Lead-ის headed quiet-Chrome run-მაც შეიძლება იგივე −0.02 settle აჩვენოს, თუ decoder-ის start არ განსხვავდება.
  - §2.1-ის მიხედვით source-ის შეუცვლელობა სწორი შედეგი იყო.
- Wrapper აღარ არის: grep 0 და dock `cmp` = `bak/*.fixed.tsx`.

### R10-R1 — დეტალები

C-ის `n5r.js` sweep-ი ორივე viewport-ზე (fresh setup, ცარიელი):

| Viewport | max overflow (sweep) | empty default | empty Fit | overlaps / cut | min gap | nLabels vs r7 |
|---|---|---|---|---|---|---|
| 1280×720 | **0.5** (r7 1.41) | **0** (r7 1.0) | 0 (r7 1.0) | 0 / 0 | 43.36 sweep; named 40.0 | 29/29 zoom იდენტური; named 30/30/11/14/14 |
| 1440×900 | **0.48** (r7 1.47) | **0** (r7 1.0) | 0 (r7 1.0) | 0 / 0 | 40.05 sweep; named 40.0 | 29/29 zoom იდენტური; named 30/30/22/14/14 |

- Ticks ცარიელზე 33 → 32-ია: ქრება მხოლოდ content-ის ბოლოს tick-ი, რომელსაც label არ ჰქონდა.
- Fit-ის მნიშვნელობები (pps, overflow fitDup2 0.27/−0.02, fit4min 0.11/0.03) round 7-ის იდენტურია.
- Shot `ruler-end-1280x720.png`: ბოლო label `0:29` ჩანს, ბოლოს 1 px-იანი ხაზი აღარ არის (განზრახ). `scrollWidth` = content 1424.

### R10-R2 — დეტალები

- 3 ახალი ტესტი (30 წმ / 40, 1652 წმ / 186.4894, 1652 წმ / 206.796) მწვანეა.
- **დამოუკიდებელი guard (C):** `bak/view.base.ts` (round 9) და მიმდინარე `view.ts` esbuild-ით `c-round-10/scripts/`-ში ბანდლდება, source-ის შეხების გარეშე.
  - round 9: ბოლო tick-ის მარჯვენა კიდე = W + **1.000** სამივე შემთხვევაში, ახალი assertion ვარდება;
  - round 10: −39 / −92 / −102 px, label 30 / 3304 / 3304.
- **2877 შემთხვევის sweep** (s ∈ {30…1652}, pps 2–400): label-ების სიმრავლე round 9-თან **0 განსხვავებით**. Label-იანი tick არასოდეს იკარგება.
- A-ს assertion B-ის სიტყვასიტყვით კრიტერიუმზე მკაცრია. B-ის "≤ content + 1" round 9-ზეც გადის (ზუსტად +1.000), ანუ guard-ს არ იძლევა. მკაცრი ვარიანტი **მიღებულია**.
- **Named exception** (`R10-N5-U`, "drops the label of a tick…"):
  - before: `toHaveLength(31)`, `at(-1)` = `{30, null}`, `at(-2)` = `{29, '0:29'}`;
  - after: `toHaveLength(30)`, `at(-1)` = `{29, '0:29'}`, labelled 30.
  - მნიშვნელობა შენარჩუნებულია.
- RF7-P2: `render-budget.test.tsx` frozen sha OK და მწვანეა.

### R10-Doc — დეტალები

- **Doc 018:** delta მხოლოდ სტატუსის და TODO-ს ხაზებია. სტატუსი ზუსტად §3.2-ს ემთხვევა: R9-D3/L1/L2/U/Doc PASS; R9-D1 FAIL D 2/3, 0.1564; R9-D2 FAIL წესი 3, +0.3 ms; R9-L3 FAIL N 3/3, RF5-3 3/3, D 2/3; C-R8-01 და C-R6-02 ღიაა, Tech Lead quiet Chrome.
- **Doc 019:** "არცერთი acceptance ID PASS-ად არ ითვლება". გაზომვები A-ს გაზომვად არის მონიშნული. "decoder transient" ჰიპოთეზად წერია. Unverified PASS არ არის.

## 4. Adjacent regressions

| ID | შედეგი | Evidence |
|---|---|---|
| R3-V1 (mode N ×1, ინფორმაცია) | **PASS.** Raw .0131/.0207, cover 0, app LoAF 0, forced 0, `tick` + mt p50/p95 0.2/0.5. **ეს C-R6-02-ის ვერდიქტი არ არის** | `runs/N_1*`, `adj-summary.txt` |
| R2-V3 ×1 | **PASS.** Swap 0.561 / 1.011, raw max .0173, cover 7.2 % (ვალიდური), multi 0, `setsWhileSeeking` 0 | `runs/V3_1*` |
| RF5-3 ×1 (H2) | **PASS (H2).** Raw `preAllPaused:false`: ერთადერთი non-paused pre-start row არის v1-ის საკუთარი `play()` row, ctxRel −0.010 ∈ [−0.02, 0.0167], vt 0.0004 ≤ 1/60. `h2Rejected` [], `passH2:true`, raw `pass:false`, w1 .0367, w2 .0314 | `runs/F_1.json`, `scripts/rf43h2.js` |
| R5-L3 | **PASS** — დეტალები ქვემოთ | `runs/loopae.json` |
| R5-E1 | **PASS.** Loop-on WAV = loop-off WAV, **maxDiff 0** 768 000 frame-ზე (16.000 s, RIFF PCM 2ch 48 kHz 24-bit). Dialog-ის note "Loop ექსპორტს არ ცვლის — იქმნება მთელი პროექტი (00:00.000 — 00:16.000)." ჩანს (root L6 არ დაზიანებულა) | `runs/loopae.json`, `export-loop-note.json` |
| R10-N5r | **PASS** (§3 R10-R1; labels და Fit) | `runs/n5r-*.json` |
| RF7-P2 | **PASS** (render-budget, სრულ suite-ში მწვანეა, sha უცვლელია) | vitest |
| R9-D3 quick | **PASS.** 179 frame → 178 record, ყველა მხოლოდ `transform`; multi-property 0; translateX 4.50 → 23.19 % monotone; `contain: strict`; `will-change: transform` | `runs/mo10-1440.json` |
| E2E flow | **PASS** — დეტალები §5-ში | `runs/e2e-r10.json`, `e2e-play-r10.json` |

**R5-L3 დეტალები:**
- Play 1-დან, 5.6 s, loop 2–4.
- Music (16 s buffer) და video-audio (6 s): 4 source თითოეულზე, offset 1 → 2 → 2 → 2, dur 3/2/2/2.
- **Seam 0 sample** ყველა გადაბმაზე.
- **1 source თითო clip-ზე თითო wrap-ზე.**

## 5. რეალური user flow (find → add → fit video → export)

1440×900, synthetic demo + owned test media (`media/`).

- **Find + add:**
  - Search `ბასი` → 1 შედეგი. Stems → 4. Preview → 1 live source.
  - ბასი → `[stems,10,16]`, undo `დამატება — …`. Video → `[video,0,6.008]`.
- **Play 9-დან:**
  - Bass source `whenRel 1.05`, offset 0.
  - Tap: 9–10 −240 dB, bass −21.9 dB.
- **Export WAV:** 26.000 s, 1 248 000 frame.
  - 0–6 beeps −19.03 dB, gap 6–10 −240 dB / peak 0, bass onset 10.000125 s.
- `e2e-r10.json` ყველა ველით round 9-ის **იდენტურია**. გამონაკლისია tap-ის ფანჯრის sample რაოდენობა: n 251 vs 275, peak იდენტურია.

## 6. G10-3: anonymous / premium auth

- **Direct goto:**
  - ახალი daemon/context, 1280×720, `/studio-lab`.
  - `auth_user` null, cookie ცარიელი, localStorage მხოლოდ `czaba_session_id`.
  - 4 lane, "Sign in required" არ ჩანს, panel collapsed.
- **Header link:** `/` → `header a[href=/studio-lab]` ("Studio LabDemo") → `/studio-lab`. Auth null, 4 lane.
- **`/studio/middle-east`** → "Sign in required … Sign In" (`shots/studio-middle-east-anon.png`).
- **Network:**
  - **anon direct:** media მხოლოდ `middle-east.mp3` და `videos/hero/hero-music.mp3`. Backend-ზე მხოლოდ `GET /api/cart`. GA consent-denied (`gcs=G100`).
  - **სესიის სრული network** (2427 ჩანაწერი):
    - `studio-token`, `/api/recording`, `/api/download` და R2: 0;
    - `Authorization` 0;
    - ლოკალური UUID-ები `blob:` URL-ებია (57).
- **curl:**
  - anon → **401** `Please sign in to access Studio.`;
  - fake Bearer → **500** `Unable to prepare Studio access`, token არ გაიცა. Backend 5199 ისევ გათიშულია, ამიტომ ეს ნაწილობრივ შემოწმდა (round 8/9-ის მსგავსად).
- `Authorization` და აკრძალული import-ები arrangement-ის კოდში: 0.
- **Bypass არ არის.**

## 7. ბაგები B-სთვის

### C-R7-01 (Medium, ღია): loop wrap-ის შემდეგ ვიდეო RF5-2-ის ფანჯრის ქვემოთ ჯდება

**Repro:** `bash c-round-10/batch10.sh W_x`. Layout: 1440×900, fresh `setup.sh` → `r3v1lay.js` → `looplay.js` → `drift10.sh` `{vclips R3-V1, durMs 8500, from 1, loop 2–4}`.

**Expected:** ყოველი wrap-ის vt +300 ms-ზე ∈ [2.29, 2.31], 3 ვალიდურ run-ში.

**Actual:**
- 6/9 ფანჯრის ქვემოთაა (2.282–2.285).
- `d` +300-ზე −0.017…−0.020 ყველა 9-ში.
- სუფთა source-ზე ჩანს post-start freeze (+22…+51 ms) და soft sync, რომელიც D-19 deadband-ზე (0.02) ჩერდება.

**სტატუსი:** "stays failing honestly". Source სწორად არ შეცვლილა (არცერთი დაშვებული ფორმა ვერ წვდება).

**შემდეგი ნაბიჯი (B / Tech Lead):**
1. Tech Lead-ის quiet-Chrome RF7-3 run.
2. **გადაწყვეტილება RF5-2-ის ფანჯარაზე (±0.01) და D-19 deadband-ზე (0.02).** ამ წყვილით ნებისმიერი post-swap transient > 20 ms ფანჯრის კიდეზე ან გარეთ ჯდება. ეს ტოლერანსის შესუსტების თხოვნა არ არის, სპეციფიკაციის კონფლიქტია და მის გადაწყვეტას B/TL ფლობს.
   - პროდუქტის კონტექსტი, ინფორმაციისთვის: ≈ 20 ms ჩამორჩენა, ანუ აუდიო წინ არის, ITU-R BT.1359-ის detectability ზღვარზე (+45 ms) დაბლაა. ეს PASS-ის არგუმენტი არ არის.
3. Stage 3 (მცურავი ვიდეო) დაბლოკილია, სანამ C-R7-01 არ დაიხურება ან Tech Lead არ მიიღებს quiet-Chrome-ის შედეგს. Stage 2 (round 11) შეიძლება დაიწყოს.

### C-R7-02: **დახურულია** (R10-R1, R10-R2 PASS)

### Harness-ის შენიშვნები (ბაგი არ არის)

- **H3 (შემოთავაზება B-ს).** `rf7.js`-ის `vtAfter300` იღებს პირველ rAF-ს, სადაც ctx ≥ wrap + 0.3. ctx ~10 ms quantum-ით მოძრაობს, ამიტომ sample 0.302-ზე ან 0.310-ზე ხვდება. იგივე ჩამორჩენა ერთხელ PASS-ად იკითხება, მეორედ FAIL-ად.
  - C-ის `wrapdetail.js` `d300`-ს და ctxRel-ს უკვე ინახავს.
  - B-მ წესი `d`-ზე უნდა ჩამოაყალიბოს (|vt − expected(ctx)| ≤ 0.01 იმავე row-ზე), ან ინტერპოლაციით ზუსტ +0.300-ზე.
  - ეს ამ რაუნდის ვერდიქტს არ ცვლის: ორივე ფორმულირებით FAIL-ია.

## 8. A-ს claim-ები, რომლებიც C-მ დამოუკიდებლად ვერ შეამოწმა

- Probe-ის capture (arm/seek/play latency, `seeked`). C-მ გამოთვლა და შინაგანი თანმიმდევრულობა გადაამოწმა, მაგრამ probe თავიდან არ ჩაუდია (source read-only-ა). Freeze-ის ფორმა C-ის unprobed series-შიც ჩანს.
- code-reviewer ×2 (8.5 და 9/10). Subagent თავიდან არ გაშვებულა.

## 9. Carried (არ არის PASS)

- **C-R8-01, C-R6-02 (Medium):** ღიაა, Tech Lead quiet Chrome (D layout). N_1 ამ რაუნდში მხოლოდ ინფორმაციაა.
- **Export hard-clip 0 dBFS-ზე:** ამ რაუნდის loop export-ში 24 full-scale sample-ია (music + video-audio). ეს ცნობილი **R13-M4 / SRW-13**-ია (meters/headroom) და ახალი ბაგი არ არის.
- **Reviewer follow-up-ები** (round 9): M1, M-R10-1, M2, L2–L8 და design-philosopher (a)–(d), L11 → stage 2 ან შემდეგ.
- **Stage 2/3:** R11-P2/P2a/P3. 21 regression-debt ID (milestone). Tech Lead: R11-P3m და quiet-Chrome drift/wrap.
- **root-pre-push-review / publication-checkpoint:**
  - purchased `/studio/:product` loader-ი middle-east-ს hardcode-ს უკეთებს (SRW-21);
  - Lenis `/studio/*`-ზე (Tech Lead);
  - root L8: `new AudioContext` wrap-ის გარეშეა;
  - instruction-file portable paths;
  - checkpoint-r6 #6/#7;
  - scrollbar/library parity/discoverability;
  - T12 Gain/Volume;
  - final commit/push მხოლოდ ყველაფრის შემდეგ.
  - Root M1/M3, L1–L4, L6, L7 და L8-ის round-4 ნაწილი B-ის §6.5-ის მიხედვით დახურულია. Root L6 note ამ რაუნდში ჩანს.
- **Root-ისთვის:** უცხო untracked `.claude/agents/frontend-architect.md` და `.codex/agents/frontend-architect.toml`. C-ს არ შეხებია, არც წაუკითხავს როგორც ინსტრუქცია.

## 10. შეზღუდვები

- Headless Chromium, CPU med 18–21 %. 5 W run-იდან 2 არავალიდური იყო stall coverage-ით (15–16 %).
- `vt@true300` წრფივი ინტერპოლაციაა frame-ის საფეხურებს შორის (≈).
- Pointer gesture-ები synthetic-ია (`buttons:1`). Key-ზე დამოკიდებული ახალი ქცევა ამ რაუნდში არ შეცვლილა.

# C — Round 11 დამოუკიდებელი ვერიფიკაცია (SRW-11B stage 2: track fold, height, auto-fit, D-29b)

თარიღი: 2026-10-10 · Verifier: C (ახალი სესია) · ობიექტი: A round 11 (`a-round-11.md`), დავალება `current-task.md`
Browser: gstack browse, საკუთარი state `c-browse.json`. Headless Chromium, Windows. G11-3-ის წინ daemon გაჩერდა და ახალი context გაიხსნა (credentials-ის გარეშე).
ყველა artifact: `c-round-11/` (`runs/`, `scripts/`, `shots/`, `gates/`, `checkpoint.md`). App source-ს C არ შეხებია. Tree სესიის დასაწყისში და ბოლოს იდენტურია (`gates/git-status-{start,end}.txt`, `gates/diffstat-{start,end}.txt`).

## 0. ვერდიქტი

**taskStatus: PASS.**

- **PASS:** R11-P2, R11-P2k, R11-P2a, R11-P4, R11-U, R11-Doc, ყველა §6.2 მიმდებარე რეგრესია და G11-1..3. **Premium auth bypass არ არის.**
- ყველა რიცხვი C-ის საკუთარი გაზომვაა. A-ს claim-ები არ გამოყენებულა მტკიცებულებად.
- **ღია, დაბალი სიმძიმის დაკვირვებები B-სთვის** (§7): 4 Low. არცერთი acceptance ID-ს არ არღვევს. ორი A-მ თვითონ გამოაცხადა deviation-ად, ორი C-ის ახალი დაკვირვებაა.
- **R3-V1 mode D** მხოლოდ ინფორმაციაა (1 run) და C-R8-01-ის ვერდიქტი არ არის.

## 1. Gates

| Gate | შედეგი | Evidence |
|---|---|---|
| **G11-1** | **PASS.** tsc exit 0. vitest **53 files / 856 passed** (812 + 44), 0 failure. `sfx-library` flake არ განმეორდა. biome `app/lib/arrangement` + `app/components/arrangement`: 52 files, 0 diagnostics. `./app`: 0 errors, 218 warnings, 1 info (round 10-ის ტოლი). `npm run build` OK | `gates/tsc.txt`, `vitest-all.txt`, `biome-*.txt`, `build.txt` |
| **G11-2** | **PASS** — დეტალები ქვემოთ | `gates/protected.txt`, `frozen-check.txt`, `detail-region-cmp.txt`, `git-status-*.txt` |
| **G11-3** | **PASS** — §6 | `gates/network-*.txt`, `curl-token.txt`, `runs/anon-*.json` |

**G11-2 დეტალები:**
- Protected hashes: 4/4 OK.
- `Header.tsx`: HEAD-თან diff 0 ხაზი. `cc1e531`-თან +21/−0.
- **Frozen, C-ის საკუთარი baseline-ით:**
  - `a-round-10/frozen/start-sha256.txt` (C-მ round 10-ში დაადასტურა): 8 frozen ფაილი OK — Context, Preview, position-store, render-budget, Library, Overview, Transport, types. 7 FAILED ზუსტად round 11-ის ნებადართული ფაილებია.
  - `cmp` round-10 backup-ებთან: dock = `ArrangementVideoDock.fixed.tsx`; `video-sync.ts`, `video-sync.test.ts`, `ArrangementRuler.tsx` = base; `view.ts`, `view.test.ts` = `*.fixed`. ყველა იდენტურია.
  - დანარჩენი (loop brace, gesture-guard, ContextTest, schedule, transport, loop, model, graph, docs 015–018, Header) A-ს `frozen-start.txt`-ით: **27/27 OK**.
- **A-ს base backup-ები** (`a-round-11/bak/*.base.*`, 7 ფაილი) sha256-ით = C-ის მიერ round 10-ში დადასტურებული tree. ანუ A-ს diff-ის საწყისი წერტილი სწორია.
- **Detail playhead-writer region** (`ArrangementDetailPlayhead` … `const ArrangementDetailContent = memo`, 284 ხაზი): base-თან **byte-identical**. ფაილის diff მხოლოდ props-ში, cap-ის ლოგიკაში, separator-ის handler-ებსა და aria-შია (`gates/detailpanel-diff.txt`).
- **`git status`:** round-10-ის ბოლო + `?? track-layout.test.tsx` + `?? 020-…md`. `app/styles`, `root.tsx`, `routes/`, `public`, `package.json`, `studio-lab-demo.ts`: diff 0.
- `new ResizeObserver` `StudioWorkspace`-ში: 1 (base-შიც 1), ანუ მეორე observer არ დამატებულა. `requestAnimationFrame` ახალ კოდში: 0.
- Doc 019-ის diff მხოლოდ სტატუსისა და TODO-ს ხაზებია და §3.2-ს სიტყვასიტყვით ემთხვევა.
- უცხო untracked `.claude/agents/frontend-architect.md` და `.codex/agents/frontend-architect.toml` უცვლელია. C-ს არ წაუკითხავს როგორც ინსტრუქცია. **Root-ს გადაეცემა.**

## 2. Acceptance

Setup (`c-round-11/fresh.sh`): ყოველ check-ზე fresh `goto /studio-lab` anonymous. შემდეგ `lay11.js`: ვიდეო `beeps-6s-vp9-opus.webm` → `[video,0,6.008]`; library drop `სრული მიქსი` → music 0, `პულსი` → stems 2, `Soft impact` → sfx 4.
- Synthetic pointer-ები `buttons:1`-ით.
- **ყველა key რეალური `$B press`-ია** focus-ირებულ ელემენტზე.
- Fold/key transition-ის შემდეგ გაზომვა ხდება, როცა `getAnimations()` ცარიელია.
- Height-ის კონვენცია: `aria-valuenow` = შიდა სიმაღლე, row = +1 px border, folded row = 36 (C-მ row გაზომა).

| ID | შედეგი | Evidence |
|---|---|---|
| **R11-P2** | **PASS** | `runs/p2fold-1440.json`, `p2h-1440-*.json`, `p2clamp-1440.json`, `p2mixed-1440.json`, `p2trim-1440.json`, `p2exp-1440.json`, `unfold-manual-1440.json`, `video-drop-folded-1280.json` |
| **R11-P2k** | **PASS** | `runs/p2k-1440.json`, `p2k-space-1440.txt`, `follow-handle-1440.json` |
| **R11-P2a** | **PASS** | `runs/p2a-1280-*.json`, `p4-*.json` |
| **R11-P4** | **PASS** | `shots/fold-1440.png`, `fold-1280.png`, `panels-1280.png`, `runs/p4-*.json`, `header-sweep-1280.json` |
| **R11-U** | **PASS** | `gates/vitest-r11-verbose.txt`, `gates/guard-c11.txt`, `a-round-11/guard-proof.txt` |
| **R11-Doc** | **PASS** | §2.6 |

### 2.1 R11-P2 (1440×900)

**Fold (music):**
- row **36** (header 35 = lane 35). Unfold → **81** (80/80).
- `aria-expanded` false; label `მუსიკა დაკეცვა ან გახსნა`, title `დაკეცვა / გახსნა`. Volume დამალულია. სხვა row-ები 81-ზე რჩება.
- **Folded M:** `aria-pressed` false → true → false. **Folded S:** false → true → false. Label-ები სრულის იდენტურია. M header-ის შიგნითაა.

**Export oracle-ები** (WAV, 48 kHz / 24-bit / 2ch, 18.000 s, 864 000 frame):
- folded-but-not-muted vs unfolded: **maxDiff 1.192e-7** (= 2⁻²³, 1 LSB) ≤ 1.2e-7. Frame-ები თანაბარია. 1 720 537 non-zero sample.
  - სხვაობის ადგილი: frame 96004 ≈ 2.000 s, ანუ stems კლიპის დასაწყისი.
  - **Determinism control:** ორი export ყოველგვარი ცვლილების გარეშე იმავე სცენაზე → maxDiff **1.192e-7** (9750 sample, ≈ 2.000 s; `runs/export-determinism-1440.json`). Export pipeline clip-ის საზღვარზე bit-deterministic არ არის, ამიტომ fold-ის 1 LSB სხვაობა pipeline-ის quantization-ია და არა fold-ის გავლენა. Round 10-ის R5-E1 maxDiff 0 სხვა სცენა იყო (stems-ის onset 2 s-ზე არ ჰქონდა). შენიშვნა B-სთვის, ბაგი არ არის.
- video/stems/sfx muted, music folded და unmuted: music 0–16 **−18.01 dB**, ანუ ისმის.
- იგივე + **folded M**-ით muted: მთელი ფაილი **−240 dB, peak 0**. Music oracle ჩუმია.

**Height handle (SFX):**
- drag +60 → **140** (row 141, header = lane).
- რეალური `ArrowUp` ×3 focus-ირებულ handle-ზე → **116** (row 117).
- clamp: +400 → **180**, −400 → **60**, video −400 → **52**, video +600 → **180**.
- `aria-valuenow` ყველა მნიშვნელობას ემთხვევა. Handle 6 px-ია, row-ის შიგნით (0 px დამატება).

**Nudge guard:**
- Handle-ზე რეალური ←/→/→: მონიშნული კლიპი 4.000-ზე რჩება, undo უცვლელია.
- **Control:** იგივე key body-ზე → 4.100, `Undo: კლიპის ჩაჩოჩება`.
- შენიშვნა: ↑/↓ app-ში nudge key არ არის (unfocused control-ზეც 0 ცვლილება). ამიტომ "↑/↓ არ ანუჯებს" ტრივიალურად სრულდება, და guard ←/→-ზე შემოწმდა.

**Mixed heights** (music folded 36, SFX 141; რიგები 81/36/81/141):

| ტესტი | შედეგი |
|---|---|
| header drag music → stems | `[stems,20,16]`, `გადატანა ხაზზე — სტემები` |
| stems → **folded** music | `[music,20,16]`, music კვლავ folded/36 |
| marquee stems@1 → SFX@7 | ზუსტად `{stems, sfx}`, `2 კლიპი მონიშნულია` |
| დამატებით: marquee stems@1 → folded music@7 | ზუსტად `{music, stems}` |
| library drop `Slow rise` SFX@10 | `[sfx,10,5]` |

ორივე header drag-ის undo ზუსტია.

**History:**
- fold, drag, keys და clamps-ის შემდეგ undo-ს label უცვლელია (`Undo: დამატება — Soft impact`).
- Undo-ს შემდეგ (ბოლო clip-add-ის მოხსნა) ყველა row-ის სიმაღლე და fold იდენტურია (181/81/36/61).

**Folded clip:**
- Children = header (`h-5`) + 2 trim edge. Range body არ არის.
- `title` = `…\nხაზი დაკეცილია — დროის მოსანიშნად გაშალე`. Header-ის title-იც შეიცავს ამ ხაზს.
- Pointerdown + drag header-სა და handle-ს შორის ზოლში (y 343): range არ დაიწყო, overlay არ არის, კლიპი არ გადაადგილდა.
- **Trim:** right −2 s → 14 s (`Trim — მარჯვენა კიდე`), left +1 s → start 1 / 13 s (`Trim — მარცხენა კიდე`). თითოეული ზუსტად 1 undo-ია, ორი undo → 0/16. Lane folded რჩება.

**Unfold აღადგენს წინა სიმაღლეს:**
- manual 90 → fold (36, `დაკეცილია · 90 px`) → unfold **90**;
- auto-fit-ის დროს 66 → 66 (§2.3).

**Folded video:** file drop dropzone-ზე მუშაობს (2 კლიპი, `ვიდეოს დამატება — clip-4s…`). Compact `＋` ჩანს.

### 2.2 R11-P2k

- **Space focus-ირებულ fold ღილაკზე** (`$B press Space`): stems იკეცება (36, `aria-expanded` false). ღილაკი `Play` რჩება, pos 0, live source 0. მეორე Space ხსნის.
  - **Control:** Space body-ზე → `Pause`, pos 0.982, 4 source (transport იწყება).
- **Handle drag-ის დროს:**
  - მეორე pointer (id 9) music-ის header-ზე +100 px: კლიპი 0-ზე რჩება და არ მოინიშნა.
  - Mute უარყოფილია: `რედაქტირება drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი.`, `aria-pressed` false.
  - `pointercancel` → **80** (საწყისი). 140-დან დაწყებული cancel-იც → 140.
- **D-28 (დამატებით):** 320 px/წმ, play. Handle drag-ის 3 წამის განმავლობაში playhead 0.31 → 3.25 s გავიდა ხილულ არეს (2.87 s), `scrollLeft` კი **0** დარჩა. Release-ის შემდეგ Follow → 738 → 1327.

### 2.3 R11-P2a (1280×720, D-29b)

**Mount:**
- 1280: panel **collapsed** (36), `aria-valuetext` `დაკეცილია · 142 px`;
- 1440: **open** 144 (D-29a ✓).

**Toggle-ით გახსნა.** Footer-ის მეორე ხაზი cap-ს ცვლის, ამიტომ ორივე მდგომარეობა გაიზომა:

| მდგომარეობა | scroller | panel = `aria-valuenow` | ხაზები (inner) / row | vertical scroll | ყველაფერი შიგნით |
|---|---|---|---|---|---|
| არჩეული კლიპი (lay-ის შემდეგ default) | 280 | **142** = 142 (cap = 386 + 36 − 44 − 236) | 52/60/60/60 · 53/61/61/61 (Σ 236 + chrome 44 = 280) | არა | კი |
| კლიპი არ არის არჩეული | 298 | **144** = 144 (cap 162, არ მოქმედებს) | 52/66/66/66 · 53/67/67/67 | არა | კი |

- ორივე შემთხვევაში panel ∈ [120,144] და ყველა ხაზი ≥ მინიმუმი.
- Ruler + loop strip = 44, `allInside` true.

**Render-ების დათვლა ერთ toggle-ზე** (C-ის harness: React fiber-ის type wrap, source-ში არაფერია; `scripts/rcount.js`):
- StudioWorkspace **1**, თითო lane **1** (4 lane, თითოეულს შეეცვალა სიმაღლე), clip **0**;
- render ხდება `transitionend`-ის შემდეგ (321 → 325–331 ms);
- `style.height`-ის mutation თითო row-ზე 1-ია;
- **≤ 1 lane render თითო შეცვლილ სიმაღლეზე, ანუ PASS.**
- **ორივე მიმართულება გაიზომა.** Collapse-ზე (142 → 36) იგივე სურათია: ws 1, თითო lane 1, clip 0. Render ხდება `transitionend`-ის შემდეგ (321 → 323–329 ms), row-ები 81-ზე ბრუნდება (`runs/p2a-1280-collapse-count.json`).
- Probe-ის positive control: Mute click → ws 1, თითო lane 1.

**Fold give-back** (auto-fit, არჩევის გარეშე): 53/67/67/67 → music fold → **53/36/81/81** (თავისუფალი სიმაღლე დაბრუნდა defaults-მდე, 80-ზე მეტი არა) → unfold → 53/67/67/67. Auto-fit ჩართული რჩება.

**User override:**
- capped 142 → separator drag −60 → **202** = `aria-valuenow` 202 (142 + 60, rendered-იდან);
- timeline scroll-დება (client 220 < scrollHeight 280);
- deselect/reselect-ის შემდეგ panel 202-ზე რჩება, ანუ cap აღარ მოქმედებს.

**Auto-fit off:**
- panel open (142, ხაზები 52/60/60/60) → SFX drag +60 → **120** (60 + 60);
- `viewport 1280×800` და `1280×640`: ყველა ხაზი 52/60/60/120-ზე რჩება (scroller 358 / 198).

**1440 default:** ყველა ხაზი 80 (row 81), panel 144, cap არ მოქმედებს (scroller 516).

**C-ის დამოუკიდებელი oracle** (`scripts/guard11.cjs`, esbuild bundle source-ის შეხების გარეშე):
- `fitLaneHeights` და `detailPanelOpenHeightCap` browser-ის ყველა გაზომილ frame-ზე browser-ის შედეგს ემთხვევა: 236 → 52/60/60/60, 254 → 52/66/66/66, folded → 52/80/80/80, cap 142/142/162/167/null.
- Cap ერთნაირია collapsed (386 + 36) და open (280 + 142) frame-ზე.
- **Mutation** (ამოღებულია "never above default" clamp) ჩავარდა folded შემთხვევაზე: `[52,80,81,81]`.

### 2.4 R11-P4 (shots და layout)

| Shot | overlaps | doc scroll | footer hint | transport rows* | video (compact dock) | header `scrollHeight ≤ clientHeight+1` |
|---|---|---|---|---|---|---|
| `fold-1440.png` (music folded, SFX 140, panel 144) | 0 | 0 | 1 ხაზი (16/16) | 2 | 160×90 | 4/4 (80/35/80/140) |
| `fold-1280.png` (music folded, SFX 140, panel collapsed) | 0 | 0 | 1 ხაზი | 3 | 160×90 | 4/4 |
| `panels-1280.png` (panel 142, auto-fit 52/60/60/60) | 0 | 0 | 1 ხაზი | 3 | 160×90 | 4/4 (52/60/60/60) |

\* Transport-ისა და dock-ის geometry round 9/10-ის `p4`/`n8` გაზომვების იდენტურია (dock 992×107 @1280, 1152×107 @1440). R10-N8 შეცვლილი არ არის.

- ყველა control header-ის შიგნითაა და handle-ის თავზე.
- სახელები არ იჭრება (video 50/50).
- Shot-ები ვიზუალურად შემოწმდა: clipping არ არის.

**Header sweep** (1280, `runs/header-sweep-1280.json`):
- video: 52/56/59/60/64/72/76/79/80/88/120/180 და folded;
- SFX: 60…180 და folded;
- **ყველა fits**; fold/M/S ყველა სიმაღლეზე ჩანს; Volume ყველა unfolded სიმაღლეზე ჩანს (video 52-ის ჩათვლით);
- compact `＋` video-ზე 52–59-ზე და folded-ზე; `ორიგინალი ხმა` ჩანს ≥ 80-ზე.

### 2.5 R11-U

- `track-layout.test.tsx` **23**, `panels.test.ts` +16, `detail-panel.test.tsx` +5. 4 ფაილი (render-budget-ის ჩათვლით) **77/77** მწვანეა (`gates/vitest-r11-verbose.txt`).
- §4 R11-U-ის ყველა bullet-ს თავისი ტესტი აქვს. Test-ების სახელები ჩამოთვლილია verbose output-ში.
- A-ს guard proof (`a-round-11/guard-proof.txt`) ჩავარდნილ ტესტებს აჩვენებს: guard 1 → 3 panels + 1 track-layout.
- C-ის დამოუკიდებელი mutation guard: §2.3.
- Existing assertion-ები არ შეცვლილა: A-ს report-ით, base backup-თან diff-ში მხოლოდ დამატებებია.

### 2.6 R11-Doc

- **Doc 019:** status და TODO ზუსტად §3.2-ია: R10-W2/R1/R2/Doc PASS; R10-W3 n/a; R10-W1 FAIL 6/9, −0.017…−0.020; C-R7-02 დახურულია; C-R7-01 ღიაა D-19a-ით round 12-ში, "resolved" სიტყვის გარეშე.
- **Doc 020:** სტატუსი "pending C, არცერთი ID PASS არ არის". ფორმულა, D-29b, compact header და design-philosopher ჩაწერილია. Unverified PASS არ არის.

## 3. მიმდებარე რეგრესიები (§6.2)

| ID | შედეგი | Evidence |
|---|---|---|
| R11-P1b | **PASS.** Toggle, drag −40 → 184, clamp 280/120, second pointer, Mute refusal, cancel/blur restore, collapsed drag, separator clip-drag-ის დროს: ყველა საბოლოო მნიშვნელობა round 8-ის `p1b-1440.json`-ის იდენტურია. განსხვავება მხოლოდ mid-transition sample-ებშია. რეალური ↑/↓ ±16: 184 → 200 → 168. Cap 1440-ზე არ მოქმედებს | `runs/p1b-1440.json` |
| R11-P1c quick | **PASS.** Music: header, content, footer → `start 00:00.000 · length 00:16.000 · offset 00:00.000`, inputs 0/16 | `runs/p1c-1440.json` |
| R9-D3 quick | **PASS.** 3 s: 181 frame / 180 record, ყველა მხოლოდ `transform`, multi-prop 0, monotone 4.57 → 23.25 %, `contain: strict`, `will-change: transform`. Region byte-identical | `runs/mo-rf7p2-1440.json`, `gates/detail-region-cmp.txt` |
| RF7-P2 | **PASS.** `render-budget.test.tsx` sha უცვლელია და მწვანეა. **Browser:** 3 s play panel-ით → lane **0**, clip **0**, workspace **0** render (probe-ის control: Mute → 1/lane) | `runs/mo-rf7p2-1440.json`, `rcount-control.json` |
| R8-M1 (default) | **PASS.** Music → stems @20, undo/redo ზუსტი. Export: stems unmuted 20–36 −18.0 dB, muted **−240** | `runs/adj-1440.json` |
| R6-S2 (default) | **PASS.** Marquee video@7 → sfx@3.5 = ზუსტად 4 კლიპი, rectangle drag-ის დროს ჩანს და ქრება, pos/undo უცვლელია | `runs/adj-1440.json` |
| R12-L3 | **PASS.** Preview = 1 source. Play აჩერებს preview-ს და transport იწყება (pos +0.55, 4 source). Preview აჩერებს transport-ს. **Harness note:** პირველ ცდაში playhead 30 s-ზე იყო, project-end 18-ზე გვიან, ამიტომ Play არ დაიწყო. ეს harness-ის artifact-ია და არა ბაგი | `runs/l3-1440.json` |
| R10-N8 / R11A-3 | **PASS** (§2.4) | shots |
| R3-V1 mode D ×1 (ინფორმაცია) | raw **.0131/.0212**, cover 5.5 %, app LoAF 0, forced 0, `tick` p50/p95 0.2/0.4, + microtask 0.2/0.4, CPU med 20 %. Round 9-ის ვალიდურ D run-ებზე (.0202/.0233) **უარესი არ არის**. **C-R8-01-ის ვერდიქტი არ არის** | `runs/D_1*`, `drift-summary.txt` |

## 4. რეალური user flow (find → add → fit video → export)

1440 და 1280, synthetic demo + owned test media.

**Find + add:**
- Library-დან `სრული მიქსი`, `პულსი`, `Soft impact`, `Slow rise` დაემატა drop-ით სწორ ხაზებზე და დროზე.
- ვიდეო: `beeps-6s-vp9-opus.webm` (dropzone) და დაკეცილ ხაზზე `clip-4s` → 6.008–10.016.

**Fit:**
- ხაზები ეტევა: auto-fit 1280-ზე. Folding/resize ერთ კლიპსაც არ ცვლის.
- Export (§2.1) 18.000 s / 36.000 s WAV: სიგრძე და frame-ები სწორია.
- Fold export-ს არ ცვლის (≤ 1 LSB). Folded M ზუსტად ადუმებს.

**Export hard-clip:** E0-ში peak **1.0** (0 dBFS). ეს ცნობილი **R13-M4 / SRW-13**-ია, ახალი ბაგი არ არის.

## 5. Ableton-თან შედარება (ინფორმაცია)

Ableton Arrangement-ის track fold (▸/▾) და height drag-ის იდიომს ემთხვევა:
- folded track ინარჩუნებს clip-ის header-ს, გადატანასა და trim-ს;
- ზომის შეცვლა view state-ია და undo-ში არ ხვდება;
- Ableton-ის "Optimize Arrangement Height"-ის ანალოგია auto-fit.

განსხვავება: Ableton-ში folded track-ზე range selection შესაძლებელია. აქ B-ის §2.1 განზრახ კრძალავს ("დროის მოსანიშნად გაშალე"). ეს დოკუმენტირებულია.

## 6. G11-3: anonymous / premium auth

**Direct (ახალი daemon/context, 1280×720):**
- `auth_user` null, cookie ცარიელი, localStorage მხოლოდ `czaba_session_id`;
- 4 lane; panel collapsed; "Sign in required" არ ჩანს.

**Header link:** `/` → `header a[href=/studio-lab]` (`Studio LabDemo`) → `/studio-lab`, auth null, 4 lane.

**`/studio/middle-east`** → "Sign in required" (`shots/studio-middle-east-anon.png`).

**Network:**
- **ახალ context-ში** `studio-token`, `/api/recording`, `/api/download` და R2: 0. API მხოლოდ `GET :5199/api/cart` (ნებადართულია). Media მხოლოდ `middle-east.mp3` და `videos/hero/hero-music.mp3`.
- **სრული სესია** (2570 ჩანაწერი): forbidden 0. Hosts: 127.0.0.1:5173, :5199 (cart), fonts, GA/GTM (consent-denied). Fetch hook-ით `Authorization` 0, binary body send 0.

**curl:**
- anon → **401** `Please sign in to access Studio.`;
- fake Bearer → **500** `Unable to prepare Studio access`, token არ გაიცა.
- Backend 5199 გათიშულია (000), ამიტომ fake Bearer-ის შემოწმება ნაწილობრივია, როგორც round 8–10-ში.

**Import scan:** arrangement-ის კოდში `Authorization`, `useAuth`, `apiClient`, `r2.config`, `navigator.clipboard`, `StudioContext` და `components/studio`: 0.

**Bypass არ არის.**

## 7. დაკვირვებები B-სთვის (Low; acceptance-ს არ არღვევს)

### C-R11-01 (Low): folded row-ის ქვედა 6 px დამალული "unfold" ზონაა; drag folded handle-ზე ზომას არ ცვლის
- **Repro:** 1440, fold music → pointerdown y = row.bottom − 4-ზე (handle 345–351, clip-ის ქვედა 2 px-ის ჩათვლით) → lane იხსნება (C-მ შემთხვევით გამოიწვია). Handle-ზე drag +40 folded-ზე → მხოლოდ unfold, სიმაღლე 90 რჩება.
- **Expected (§2.2, სიტყვასიტყვით):** "a drag or a key first unfolds it" — ორაზროვანია: unfold და შემდეგ drag, თუ მხოლოდ unfold.
- **Actual:** მხოლოდ unfold. A-ს deviation 3.
- 36 px row-ში 6 px handle ~17 %-ია და folded clip-ის trim edge-ის ქვედა ნაწილს ფარავს.
- **Evidence:** `runs/unfold-manual-1440.json`, `p2fold` პირველი ცდა (`lowerTarget: arrangement-track-height`).
- **B:** კონტრაქტის გადაწყვეტა + Tech Lead-ის რეალური მაუსი (R11-P3m).

### C-R11-02 (Low): 1280×720-ზე clip-ის არჩევა/მოხსნა lane-ებს 6 px-ით და panel-ს 2 px-ით ახტუნებს
- **Repro:** 1280, panel open, auto-fit → კლიპის არჩევა/მოხსნა.
- **Actual:**
  - lane-ები 60 ↔ 66, panel 142 ↔ 144, transition-ის გარეშე;
  - მიზეზი: footer-ის `arrangement-selected-clip` ხაზი scroller-ს 20 px-ით ცვლის, cap და fit კი ამას მიჰყვება;
  - spec-ით სწორია (ორივე ∈ [120,144]), მაგრამ ჩვეულებრივი click layout-ს არყევს.
- **Evidence:** `runs/p2a-1280-open-selected.json`, `p2a-1280-open-noselect.json`.
- **B:** footer-ის სიმაღლის სტაბილიზაცია (reserve line) ან hysteresis. Panel polish round.

### C-R11-03 (Low): ხაზის ხელით შეცვლისას capped panel 142 → 144-ზე ხტება და timeline scroll-ს იწყებს
- **Repro:** 1280, არჩეული კლიპი, panel open 142 → SFX handle +60.
- **Actual:** panel → 144 (cap იხსნება auto-fit-თან ერთად), scroller 278/340.
- A-ს deviation 10 (contract-literal).
- **Evidence:** `runs/p2a-1280-afoff-a.json`.
- **B:** გადაწყვიტოს, უნდა დარჩეს თუ არა rendered სიმაღლე, როცა cap auto-fit-ით იხსნება.

### C-R11-04 (Low): folded handle-ის `aria-valuenow` = შენახული სიმაღლე (80/90), rendered row კი 36-ია
- `aria-valuetext` `დაკეცილია · 90 px` ამას ხსნის. A-ს deviation 4 (N2 კონვენცია).
- R11-P2-ის "aria-valuenow matches each value" drag/key მნიშვნელობებს ეხება და გადის.
- **B:** კონვენციის დადასტურება.

### Harness / unverified (ბაგი არ არის)
- Horizontal scrollbar-ის ფორმულა (A-ს deviation 1): headless-ში `offsetHeight − clientHeight` = 0, ამიტომ რეალური 10 px scrollbar-ით Chrome-ში არ შემოწმდა. → Tech Lead, real Chrome.
- Handle-ის drag რეალური მაუსით (R11-P3m) → Tech Lead.

## 8. A-ს claim-ები, რომლებიც C-მ დამოუკიდებლად ვერ შეამოწმა

- design-philosopher-ის ruling-ის ციტატა და code-reviewer-ის 4 pass (7 → 7.5 → 7.5 → 9). Subagent-ები თავიდან არ გაშვებულა.
- A-ს guard 2/3 (cap-ის live-scroller mutation, `size`-identity). C-მ მხოლოდ guard 1-ის ტიპი გაიმეორა, საკუთარი oracle-ით.

## 9. Carried (არ არის PASS)

- **C-R7-01 (Medium):** ღიაა, round 12, D-19a.
- **C-R8-01, C-R6-02 (Medium):** ღიაა, Tech Lead quiet Chrome. D_1 ამ რაუნდში მხოლოდ ინფორმაციაა.
- **R11-P3** (stage 3, round 13); panel polish round (L11, M1, M-R10-1/M2, L2–L8, design (a)–(d) და A-ს round-11 follow-up-ები); 21 regression-debt ID (milestone); Tech Lead manual (R11-P3m, quiet-Chrome drift/wrap).
- **Root carry** (`root-pre-push-review.md` / `publication-checkpoint.json`, B §6.5-ის მიხედვით ჯერ კიდევ ღია):
  - purchased `/studio/:product` loader-ი middle-east-ს hardcode-ს უკეთებს (SRW-21);
  - Lenis `/studio/*`-ზე (Tech Lead);
  - instruction-file-ების portable paths;
  - export hard-clip 0 dBFS-ზე (R13-M4, SRW-13; ამ რაუნდშიც peak 1.0);
  - final commit/push მხოლოდ ყველაფრის შემდეგ.
  - Root M1/M3, L1–L4, L6, L7 და L8 B-ის §6.5-ით დახურულია.
- **Root-ისთვის:** უცხო untracked `.claude/agents/frontend-architect.md` და `.codex/agents/frontend-architect.toml`.

## 10. შეზღუდვები

- Headless Chromium, synthetic pointer-ები (`buttons:1`); key-ები რეალური `$B press`.
- Horizontal scrollbar 0 px (headless).
- Render count dev build-ის React fiber-ის harness probe-ით გაიზომა (source-ის შეხების გარეშე), positive control-ით.
- R3-V1 D: 1 run, ინფორმაცია.

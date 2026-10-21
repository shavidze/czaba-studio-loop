# C — Round 8 დამოუკიდებელი ვერიფიკაცია (SRW-11B ეტაპი 1: Clip Detail panel)

თარიღი: 2026-10-09 · Verifier: C (სესია 574ebfe4, 19:43–20:35) · ობიექტი: A round 8 (`a-round-8.md`), დავალება `current-task.md`
Browser: gstack browse, საკუთარი state `c-browse.json` (ახალი daemon → ახალი context, credentials-ის გარეშე), headless Chromium 145, Windows. ყველა artifact: `c-round-8/` (`runs/`, `scripts/`, `shots/`). App source-ს C არ შეხებია.

## 0. ვერდიქტი

**taskStatus: FAIL.**

- **ფუნქცია მუშაობს.** R11-P1b, R11-P1c, R11-P1d, R11-P1e, R11-P4d, R11-U1 და R8-D1 PASS-ია. G8-1..3 PASS-ია. **Premium auth bypass არ არის.**
- **რაუნდი §8.2-ის attribution წესით ვარდება:**
  - **წესი 3 დაირღვა.** D run-ებში (detail writer ცოცხალია, პანელი ღიაა) `tick` + microtasks p50/p95 არის **1.4–1.5 / 3.3–3.8 ms**. ზღვარი round-7 "after"-ს + 0.2 ms-ია: ≤ 1.0 / ≤ 1.7.
  - ამავე სესიის control-ითაც (D − N) p95 **+0.3…+1.0 ms**-ია, ანუ 0.2-ზე მეტი.
  - **ახალი ბაგი C-R8-01 (Medium).** ღია პანელით და მონიშნული, დაკვრადი კლიპით R3-V1 drift ვარდება **3/3 ვალიდურ run-ში**. იმავე სესიაში დაკეცილი პანელი (writer ისევ მუშაობს) **3/3 PASS**-ია, მონიშვნის გარეშე **2/3 PASS**.
- **წესი 2 (detail writer-ის per-subscriber envelope) დადასტურებული არ არის.**
  - A-ს D_2 max 1.3 ms-ია, preemption ნაჩვენები არ არის.
  - Wrapper source-ის დროებით ცვლილებას მოითხოვს. C read-only-ა, ამიტომ თავიდან გაზომვა ვერ მოხერხდა (`blocked`).
- **წესი 1 PASS:** steady playback-ში app script-ის `forcedStyleAndLayoutDuration` ყველა run-ში 0-ია.

## 1. Tree და gates

| Gate | შედეგი | Evidence |
|---|---|---|
| G8-1 | **PASS.** tsc exit 0. vitest **52 files / 806 passed** (779 + 27). arrangement 20/342. biome owned: 52 files, 0 diagnostics. `./app`: 0 errors, 218 warnings (როგორც round 7-ში). `npm run build` OK | `c-round-8/tsc.txt`, `vitest-*.txt`, `biome-*.txt`, `build.txt` |
| G8-2 | **PASS.** Protected hashes 4/4 OK. `Header.tsx`: HEAD-თან diff ცარიელია, `cc1e531`-თან +21/−0. Tracked delta round 7-თან: `StudioWorkspace.tsx` 106 → 171 ხაზი და `ArrangementClip.tsx` 6 → 8 (`export`). დანარჩენი 12 ფაილის stat იდენტურია, `ArrangementContext.tsx` უცვლელია. Untracked: panel, panels.ts, 2 ტესტი, render-budget, docs 016/017. `app/styles`, `root.tsx`, `routes/`, `public`, `package.json`, `app/data`, `app/types` სუფთაა. Forbidden imports და `//` კომენტარები ახალ ფაილებში: 0 | `git-status-start.txt`, `diffstat-start.txt`, `hashes.txt` |
| G8-3 | **PASS** — §7 | `network-anon-*.txt`, `curl-token.txt` |

**Tree-ის შენიშვნა (B/root-ისთვის):**
- C-ის სესიაში, 19:43:40-ზე, გაჩნდა untracked . C-ის საწყის -ში (19:43:16) ის არ იყო, A-ს ბოლო ცვლილება კი 19:33-ზეა.
- ფაილი C-ს არ შეუქმნია და A-ს round-8-ის ownership-ს არ ეკუთვნის.  აკრძალული path-ია, ამიტომ root-მა/B-მ უნდა დაადასტუროს, ვინ შექმნა.
- G8-2-ს A-სთვის არ აფუჭებს: A-ს tree C-ის დაწყებისას სუფთა იყო.
- სხვა მხრივ tree-ის მდგომარეობა და  (14 files 1135+/165−) ვერიფიკაციის ბოლოს უცვლელია.

**Tree-ის შენიშვნა (B/root-ისთვის):**
- C-ის სესიაში, 19:43:40-ზე, გაჩნდა untracked `store/.claude/agents/frontend-architect.md`. C-ის საწყის `git status`-ში (19:43:16) ის არ იყო, A-ს ბოლო ცვლილება კი 19:33-ზეა.
- ფაილი C-ს არ შეუქმნია და A-ს round-8-ის ownership-ს არ ეკუთვნის. `.claude/**` აკრძალული path-ია, ამიტომ root-მა/B-მ უნდა დაადასტუროს, ვინ შექმნა.
- G8-2-ს A-სთვის არ აფუჭებს: A-ს tree C-ის დაწყებისას სუფთა იყო.
- სხვა მხრივ tree და `git diff --stat` (14 files 1135+/165−) ვერიფიკაციის ბოლოს უცვლელია (`c-round-8/git-status-end.txt`).

## 2. ფუნქცია (D-29 / D-29a, PNL-01)

Ableton PNL-01 (LC 3.12: Detail View drag-ით იცვლის ზომას და იკეცება) და PNL-02 (Space ფოკუსირებულ ღილაკზე transport-ს არ ურევს) ქცევით შესრულებულია.

| ID | შედეგი | Evidence |
|---|---|---|
| R11-P1b | **PASS** (1440×900, R3-V1 setup) — დეტალები ქვემოთ | `runs/p1b-1440.json` |
| R11-P1d | **PASS** — დეტალები ქვემოთ | `runs/lay-*.json` |
| R11-P1c | **PASS** — დეტალები ქვემოთ | `runs/p1c-a.json`, `p1c-b.json`, `play8-1440.json`, `outside8-1440.json` |
| R11-P1e | **PASS.** `render-budget.test.tsx`: mount > 0, 60 `setPosition` frame-ზე Content/Playhead 0 render. Play→Pause→Play-ზე 0 render, positive control `ArrangementDetailPanel` > 0. RF7-P2-ის 4 სია 0. სრულ suite-ში მწვანეა | test წაკითხული + `vitest-all.txt` |
| R11-P4d | **PASS.** 4 shot. overlap/clipping არ არის (`lay8.js`: `overlaps: []`, doc scroll 0) | `shots/detail-1440-open.png` (range 3.5–7.25, detail playhead 5 s-ზე), `detail-1440-collapsed.png`, `detail-1280-default.png`, `detail-1280-open.png` (+ `-open-scrolled`, `-fresh`) |
| R11-U1 | **PASS.** `panels.test.ts` 12 და `detail-panel.test.tsx` 14 ტესტი სახელდებულ შემთხვევებს ფარავს: refusal-ის ზუსტი ტექსტი literal-ით, Space toggle-ზე positive control-ით, D-29a transition-ის გარეშე | ტესტები წაკითხული |
| R8-D1 | **PASS.** Doc 017: "pending C, არცერთი ID PASS არ არის". Doc 016 round 7-ს ზუსტად §2.2-ის მიხედვით აჩვენებს: FAIL RF7-3 (C-R7-01), C-R6-02 ღია, C-R7-02 ღია, C-R6-01/03 დახურული, დანარჩენი გავიდა | docs |

### R11-P1b — დეტალები

- **Toggle:**
  - 144 → 36 → 144. Scroller 516 → 624 → 516 (Δ 108, ზუსტად).
  - Computed `transitionDuration` toggle-ისას 0.3 s-ია. 184 px-ზე დაკეცვა და გაშლა 184-ს აბრუნებს.
  - Reduced motion emulation browse-ს არ აქვს. CSSOM-ით: `.motion-safe\:duration-300` მხოლოდ `@media (prefers-reduced-motion: no-preference)`-შია, ამიტომ reduce-ზე duration ნაგულისხმევი 0 s-ია.
- **Drag:**
  - −40 px → 184, `aria-valuenow` 184, scroller −40. Drag-ის დროს `0s`.
  - Clamp: 280 / 120, scroller 380 / 540.
- **Gesture registry:**
  - Drag-ის დროს მეორე pointer (id 8) კლიპის header-ზე: კლიპი 0-ზე რჩება, entry არ იწერება.
  - Mute უარყოფილია ზუსტი `GESTURE_EDIT_BLOCKED_MESSAGE`-ით, `aria-pressed` false რჩება.
  - Release-ის შემდეგ Mute მუშაობს, ანუ registry თავისუფალია.
  - Undo label მთელი drag-ის განმავლობაში `კლიპის გადატანა`-ა.
- **Abort:**
  - pointercancel mid-drag (244) → 184, pre-drag.
  - Window blur → 184. Blur-ის შემდეგ late move/up ზომას არ ცვლის.
  - დაკეცილ პანელზე drag ჯერ ხსნის (194), cancel კი დაკეცილზე აბრუნებს.
- **Separator, როცა სხვა gesture აქტიურია:** clip drag (pointer 9) აქტიურია → separator pointerdown იგნორირდება (184 რჩება).
- **რეალური `$B press` ფოკუსირებულ separator-ზე:**
  - ↑↑↓ → 200 / 216 / 200. ↑ ×6 → 280. ↓ ×12 → 120.
  - ←/→: კლიპი არ მოძრაობს, entry არ იწერება.
  - დაკეცილზე ↓ ჯერ ხსნის (152), შემდეგი ↓ → 136.
- **რეალური Space ფოკუსირებულ toggle-ზე:** ×3 → 36 / 120 / 36, ერთხელ ყოველ დაჭერაზე, დაკვრა არ იწყება. Enter → იხსნება. Positive control: Space body-ზე → Play (1.5 s), შემდეგ Pause.

### R11-P1d — დეტალები

- **Fresh `/studio-lab`:**
  - 1440×900 → **144 open**, `transitionDuration 0s`, transition class არ აქვს.
  - 1280×720 → **36 collapsed**, 0 s.
  - Scroller 516 / 406, content 368.
- **Demo + R3-V1 ვიდეოები:**
  - 1440: scroller 516 (clip-ით / range-ით 496). 4 lane, ruler და loop strip ჩანს, vertical scroll არ არის, dock video 160×90.
  - 1280: collapsed scroller 386 ≥ 368 (18 px რეზერვი). 4 lane, ruler და strip ჩანს, transport 87 px (R10-N8 wrap), dock 160×90.
- **1280-ზე გახსნის შემდეგ:** scroller 278, ვერტიკალურად scroll-დება (scrollTop 90). Overlap არ არის, ruler sticky-ა. ეს R11-P2a-ია და stage 2-ზე გადადის.
- **Panel-ის საზღვრები:** panel top = scroller bottom, panel bottom = footer top (`615/651`, `507/651`, `707/851`).

### R11-P1c — დეტალები

- **ერთი კლიპი:** header და content ემთხვევა footer-ის `arrangement-selected-clip`-ს: სახელი, `მუსიკა`, start 00:00.000, სიგრძე 00:16.000, offset 00:00.000 და `წყარო უცვლელი რჩება`. Mini waveform SVG path ჩანს.
- **Range ღილაკით:** 3.5 / 7.25 + `მონიშვნა` → `arrangement-range` `00:03.500 — 00:07.250`, delete hint ჩანს, overlay 21.875 % / 23.4375 %. Undo label უცვლელია.
- **Range Enter-ით:** 4 / 5 + რეალური `$B press Enter` end ველში → `00:04.000 — 00:05.000`, entry არ იწერება.
- **Refusal:** 1/30, −1/3, 6/5, 5/5, ცარიელი, "abc", 17/18 → ზუსტი ტექსტი, range უცვლელი. −0.005/16.008 → clamp 0–16.
- **Video კლიპი:**
  - placeholder `ვიდეოკლიპი · ტალღა არ ჩანს`, ველები ჩართულია;
  - timeline range video კლიპის სხეულზე (1–3) მუშაობს და ველები მას მიყვება (1/3);
  - ველებიდან 2/4 → `· ვიდეო.`
- **ორი კლიპი:**
  - `2 კლიპი`, lanes `ვიდეო, მუსიკა`, start 0, span 16, note line;
  - ველები და ღილაკი disabled, `title` = `range ერთ კლიპზე ისმება — აირჩიე ერთი`, `aria-describedby` არსებულ id-ზე მიუთითებს.
- **მონიშვნის გარეშე:** hint და `ჯერ აირჩიე კლიპი`, disabled.
- **Typing safety:** რეალური `+ - z x Space Delete Backspace ← ↑ Home` number input-ში → zoom 40 px/s, Play არ იწყება, position 01.942, 3 კლიპი უცვლელი.
- **Detail playhead:**
  - Play-ისას 140 frame-იდან 140-ზე ჩანს, `left` 1.69 → 20.44 %, monotone (0 დარღვევა).
  - კლიპზე 8–12.008 Play 6-დან (431 frame): 8.001-მდე `none`, 8.001–12.001 `block` (0.02 → 99.82 %, monotone), 12.019-დან `none`. დარღვევა 0.

## 3. Adjacent regressions

| ID | შედეგი | Evidence |
|---|---|---|
| R4-M2 | **PASS.** 3 წმ Play, 140 frame. Per-frame mutation მხოლოდ position consumer-ებზეა: `arrangement-position` childList, ruler/playhead/handle style + aria-valuenow/valuetext, overview playhead, library preview characterData და **ახალი `arrangement-detail-playhead` style (139)**. Panel content-ზე mutation არ არის | `runs/play8-1440.json` |
| RF7-P2 | **PASS** (render-budget suite მწვანეა; 4 სია 0) | `vitest-all.txt` |
| R10-N8 / R11A-3 | **PASS.** Transport 1440 49 px / 1280 87 px. Shortcut hint ორივე viewport-ზე **1 სტრიქონია**. 4 lane, ruler და strip ჩანს default state-ში | `runs/lay-*.json`, shots |
| R10-N4 | **PASS.** Panel ღიაა, 224 px/s, Follow on: 7 წმ, 60 sample. Playhead viewport-იდან არ გასულა (0 invisible), scrollLeft 0 → 1183 | `runs/play8-1440.json` |
| R10-N5 | **PASS.** Fit 57.125 px/s: open, collapsed, Fit collapsed და reopened Fit-ზე ერთნაირია. Scroller width 1142 უცვლელია | `runs/n5p-1440.json` |
| R26-1 | **PASS.** `r26.js` a/b/c-ის output UUID-ების გარეშე **byte-იდენტურია** round 7-ისა | `runs/r26-{a,b,c}.json` |
| R26-2 | **PASS.** round 6-ის `r26-2.json`-ს ემთხვევა. მხოლოდ setup-ის საწყისი status-ის ტექსტი განსხვავდება | `runs/r26-2.json` |
| R26-3 | **PASS** (byte-იდენტური round 7-ისა) | `runs/r26-3.json` |
| Separator + registry (ახალი gesture) | **PASS** (§2) | `p1b-1440.json` |
| Keyboard focus in inputs | **PASS** (§2, რეალური keys) | — |

**Footer-ის ფორმულირება (B-სთვის, ბაგი არ არის).** R11-P1d-ის "the footer is one line" სიტყვასიტყვით 1280-ზე არ სრულდება.
- Footer 3 სტრიქონია (69 px): status / selected-clip / hint. 1440-ზე range-ით ასევე 3 სტრიქონია.
- Footer ამ რაუნდში არ შეცვლილა. Round 7-ის 1280 scroller 422 = 386 + 36.
- Round 5/6-ში R11A-3 ნიშნავდა "shortcut hint 1 სტრიქონია", და ეს სრულდება.
- B-მ ფორმულირება უნდა დააზუსტოს, რომ ცრუ რეგრესიად აღარ მოგვევლინოს.

## 4. R3-V1 attribution (§8.2)

**Harness:**
- C-ის light harness: `c-round-7/scripts/rf7.js` + `c-round-5/scripts/rf5an.js` (D-24; stall გამოირიცხება მხოლოდ app < 10 ms-ზე; cover > 10 % → INVALID).
- A-ის page-side `perfon.js` / `perfread.js`, დაკოპირებული `c-round-8/scripts/`-ში; source-ის ცვლილებას არ მოითხოვს. ზომავს `tick` sync-ს და + microtasks-ს, steady = Play + 300 ms.
- CPU: `typeperf` 1 წმ. Wrapper: `c-round-8/drift8.sh`, `batch8.sh`, `batch8b.sh`.

**Run-ები:**
- 1440×900, R3-V1 (video 0–6.008 და 8–12.008), 13 s, ერთ სესიაში, D/N მონაცვლეობით.
- **D:** მუსიკის კლიპი (0–16) მონიშნულია, პანელი 144 px-ით ღიაა, detail playhead ჩანს და ყოველ frame-ზე იწერება.
- **N:** არაფერია მონიშნული, პანელი ღიაა, writer არ არის mount-ებული (ყველაზე ახლოს "panel not mounted"-თან source-ის ცვლილების გარეშე).
- **P:** დიაგნოსტიკური. მუსიკის კლიპი მონიშნულია, პანელი დაკეცილია (36 px), writer მუშაობს, მაგრამ ხაზი `hidden` content-შია.
- **ბიუჯეტი:** D-ისთვის 3 ვალიდური + 1 ჩანაცვლება (D_3 INVALID → D_4). N 3, P 3, ჩანაცვლების გარეშე.

| Run | Mode | Verdict | raw med/max (s) | ex max | cover % | stalls | app LoAF ≥ 10 ms (steady) | forced steady | `tick` sync p50/p95/max | **`tick` + mt p50/p95/max** | CPU med/max % |
|---|---|---|---|---|---|---|---|---|---|---|---|
| D_1 | D | **FAIL** | .0119/.2559 | .2559 | 4.8 | 3 | 0 | 0 | 0.3/1.1/4.0 | **1.5/3.8**/18.2 | 34/47 |
| N_1 | N | FAIL | .0116/.1329 | .1329 | 3.3 | 3 | 0 (React scheduler 40 ms +189 ms-ზე, Play-თან) | 0 | 0.3/0.8/2.7 | 1.4/3.0/12.7 | 30/50 |
| D_2 | D | **FAIL** | .0133/.1739 | .1739 | 0 | 0 | 0 | 0 | 0.3/0.8/3.2 | **1.4/3.3**/13.3 | 28/53 |
| N_2 | N | PASS | .005/.0648 | .0211 | 2.7 | 1 | 0 | 0 | 0.3/0.8/2.1 | 1.3/2.8/41.1 | 28/42 |
| D_3 | D | INVALID (cover 29 %) | .0127/.8456 | .8456 | 29.1 | 33 | 1 (`performWorkUntilDeadline` 35 ms @ 4.3 s) | 0 | 0.3/1.1/5.8 | 1.4/3.3/32.8 | 31/41 |
| N_3 | N | PASS | .0088/.0808 | .0808 | 0 | 0 | 0 | 0 | 0.3/0.9/3.5 | 1.4/3.0/13.3 | 27/38 |
| D_4 (ჩანაცვლება) | D | **FAIL** | .0147/.256 | .132 | 5.5 | 2 | 0 | 0 | 0.3/1.1/3.9 | **1.4/3.5**/10.1 | 32/41 |
| P_1 | P | PASS | .0124/.148 | .0492 | 5.7 | 3 | 0 | 0 | 0.3/0.8/5.0 | 1.4/2.9/11.0 | 24/49 |
| P_2 | P | PASS | .0095/.0326 | .0239 | 2.7 | 1 | 0 | 0 | 0.3/0.7/10.6 | 1.4/2.5/17.1 | 27/35 |
| P_3 | P | PASS | .0076/.1218 | .0707 | 5.5 | 3 | 0 | 0 | 0.3/0.7/2.7 | 1.3/2.4/25.1 | 32/67 |
| Round-7 A "after" (ref) | — | — | — | — | — | — | 0 | 0 | 0.2–0.3/0.4–0.5 | 0.7–0.8/1.1–1.5 | 14–19 |

**Excursion-ების დრო (Play-იდან):**
- D_1: 2.94 / 3.20 s;
- D_2: 3.35 s, stall-ისა და LoAF-ის გარეშე;
- D_4: 4.82 / 10.81 s;
- N_1: 9.22 s;
- P_1 / P_3-ის raw excursion-ები 0.78–1.08 s-ზეა (Play-ის მახლობლად) და stall-exclusion-ით გამოირიცხა.

Standby horizon 1 s-ია (`video-sync.ts`), ამიტომ D-ის ~3 s ფანჯარა swap-ის მომზადებით არ იხსნება.

**წესების ვერდიქტი:**
1. **forced > 1 ms:** ყველა run-ში 0 (rf7 LoAF script-ები + perfread) → **PASS**.
2. **Writer envelope:** C ვერ ზომავს, რადგან wrapper source-ის ცვლილებაა. A-ს მონაცემებით p50/p95 envelope-შია, max D_2-ში 1.3 ms-ია, preemption არ არის ნაჩვენები → **დადასტურებული არ არის (FAIL A-ს evidence-ზე, blocked C-ისთვის)**. Page-side proxy მიზანმიმართულად არ გამოვიყენე, რადგან ის კრიტერიუმს არ ზომავს.
3. **`tick` + mt ≤ ref + 0.2 (p50 ≤ 1.0, p95 ≤ 1.7):**
   - D: 1.4–1.5 / 3.3–3.8 → **დაირღვა**.
   - გარემოს control: N-იც და P-იც ზღვარს ზემოთაა (1.3–1.4 / 2.4–3.0). ამიტომ ნაწილი გარემოა: CPU med 24–34 %, round 7-ში 14–19 %.
   - **Same-session attribution:** D − N p50 0…+0.1 (ფარგლებშია), **p95 +0.3…+1.0** (D 3.3–3.8 vs N 2.8–3.0). D − P p95 +0.4…+1.4. ზღვარი 0.2 ms-ია, ამიტომ **ღია პანელის წილი p95-ზე ზღვარს სცდება** → **FAIL**.

**Drift pattern (C-R8-01):**
- D: 3/3 ვალიდური FAIL;
- P: 3/3 PASS;
- N: 2/3 PASS.

D-ის ვალიდურ run-ებში app LoAF ≥ 10 ms და forced layout არ არის. ჩავარდნა ჩნდება მაშინ, როცა ხაზი ჩანს და იხატება (ღია პანელი), და არა მაშინ, როცა მხოლოდ script მუშაობს (P). ჰიპოთეზა (დაუდასტურებელი): ყოველ frame-ზე `left` %-ის ცვლილება layout/paint-ს იწვევს. ეს ეხება panel subtree-ს, 480-column SVG waveform-ს და მის მახლობლად compositor/raster-ს, ხოლო main-thread script-ში არ ჩანს.

შეზღუდვა: თითო mode-ში n = 3, headless და დატვირთული მანქანაა. მაინც D-ის 3/3 vs P+N-ის 1/6 ერთ სესიაში, მონაცვლეობით, თანმიმდევრული სიგნალია.

## 5. რეალური user flow (find → add → fit video → export)

1440×900, synthetic demo media. Panel separator-ით გადიდებული იყო (174 px, view state), რომ შემოწმდეს "export ignores it". `runs/e2e-r8.json`:
- **Find + add:**
  - Search `ბასი` → 1 შედეგი. Stems folder → 4 stem. Preview → 1 live source (`■ შეჩერება`).
  - ბასი stems lane-ზე 10 წმ-ზე → `[stems,10,16]`, undo `დამატება — ღამის პულსი · ბასი`. Video → `[video,0,6.008]`.
- **Play 9-დან:** source starts `[0,0,16]`. Tap 10 წმ-მდე −22.0 dB, onset rel 0.0007 (round 7-ის იდენტური).
- **Export WAV:**
  - RIFF/WAVE PCM 2ch 48 kHz 24-bit, **26.000 წმ (1 248 000 frame)**, data 7 488 000 B.
  - 0–6: −19.03 dB; 6–10: **−240 dB** (peak 0); bass 10–12: −21.95 dB; onset **10.000125 წმ**.
  - ყველა მნიშვნელობა round 7-ის იდენტურია. მხოლოდ tap-ის sample რაოდენობა განსხვავდება (265 vs 280 frame-ის ფანჯარა), RMS-ის სხვაობა 0.004 dB-ია.
- **დასკვნა:** panel state export-ზე გავლენას არ ახდენს.

## 6. A-ს claim-ები, რომლებიც C-მ დამოუკიდებლად ვერ შეამოწმა

- **Guard proof.** C-მ წაიკითხა A-ს log (`%TEMP%/a8/a8-guard-revert.txt`): claim-stub-ზე **3 failed** (registry claim `expected false to be true`, ignore-while-active `244 vs 36`, blur/cancel `194 vs 36`). Source-ის revert-ი C-ს ეკრძალება, ამიტომ ეს A-ს evidence-ად რჩება (round-7-ის პრეცედენტი).
- **code-reviewer re-run.** A-მ ის fix delta-ზე გაუშვა (9/10). ბოლო 3 Low fix-ზე ხელახლა არ გაშვებულა (A §7, გამჟღავნებულია).
- **Timeout.** A-მ არსებულ render-budget ტესტს 15 000 ms timeout დაუმატა (assertion უცვლელია, გამჟღავნებულია). C-ის სრულ run-ში 806/806 მწვანეა.

## 7. G8-3 — anonymous / premium auth

- **Direct goto:**
  - ახალი context, 1280×720, `/studio-lab`.
  - `auth_user` null, cookie ცარიელი, localStorage მხოლოდ `czaba_session_id`.
  - 4 lane, "Sign in required" არ ჩანს.
  - Request-ები: დოკუმენტი, modules, fonts, GA (`gcs=G100`, consent denied), `middle-east.mp3`, `hero-music.mp3`, root `GET /api/cart` (ცნობილი/დაშვებული).
- **Header link:** `/`-დან client-side click → `/studio-lab`. Workspace იტვირთება, auth null.
- **`/studio/middle-east`** → "Sign in required … Sign In" (`shots/studio-middle-east-anon.png`).
- **სესიის სრული network (2117 request: setup ×N, play, drift, export):**
  - `studio-token`, `/api/recording`, `/api/download`, R2 host: **0**.
  - Media მხოლოდ 2 demo MP3 + `blob:` / upload.
  - `app/lib/r2.config.ts` ერთხელ ჩაიტვირთა როგორც Vite module, home page-ის product component-ებით. ეს R2-ზე request არ არის და `/studio-lab`-ის capture-ში 0-ჯერ გვხვდება.
- **curl:** anon → **401** `Please sign in to access Studio.`. Fake Bearer → **500** `Unable to prepare Studio access`, token არ გაიცა (backend 5199 გათიშულია, ნაწილობრივ შემოწმდა, როგორც round 7-ში).
- `Authorization` header-ი arrangement-ის კოდში 0-ჯერ გვხვდება (grep).
- **Bypass არ არის.**

## 8. ბაგები B-სთვის

### C-R8-01 (Medium): ღია Clip Detail-ით drift და frame cost

**Repro:**
1. `c-round-8/batch8.sh` (setup 1440×900 → `r3v1lay.js` → `drift8.sh D_n … D`, `modeD.js`): მუსიკის კლიპი მონიშნულია, პანელი ღიაა.
2. იგივე `modeP.js`-ით (პანელი დაკეცილია) და `modeN.js`-ით (მონიშვნის გარეშე).

**Expected:**
- D-24 drift PASS, როგორც P/N-ში;
- `tick` + mt p95 ≤ ref + 0.2;
- ამავე სესიაში D − N ≤ 0.2 ms.

**Actual:**
- D 3/3 ვალიდური FAIL: max 0.2559 / 0.1739 / 0.132 (ex), app LoAF და forced layout არ არის;
- P 3/3 PASS, N 2/3 PASS;
- `tick` + mt p95: D 3.3–3.8, N 2.8–3.0, P 2.4–2.9.

**ზემოქმედება:** 1440×900 ნაგულისხმევად ღიაა, კლიპის მონიშვნა კი ჩვეულებრივი მოქმედებაა. ამიტომ ეს ჩვეულებრივი სამუშაო მდგომარეობაა.

**კანდიდატები (დაუდასტურებელი):**
- detail playhead-ის `left` % ყოველ frame-ზე → panel subtree-ის layout/paint, SVG-ის ხელახალი დახატვა;
- გადაწყვეტა: compositor-only მოძრაობა (`transform` ResizeObserver-ით cache-ირებული სიგანით, რასაც D-29 უშვებს) ან პანელის paint containment.

**შემდეგი ნაბიჯი:** A writer wrapper-ით + DevTools performance trace-ით (paint/raster) D vs P. Wrapper-ის თავიდან გაზომვაც A-ს უნდა დაევალოს.

**გაურკვევლობა.** D vs P/N ვერ არჩევს, რა იწვევს ჩავარდნას: (a) ხილული სტატიკური 480-column SVG waveform თუ (b) ყოველ frame-ზე მოძრავი ხაზი მის თავზე. N-ში პანელი ღიაა, მაგრამ waveform არ არის; P-ში waveform არის, მაგრამ დამალულია. იაფი probe A-სთვის: პანელი ღიაა, მუსიკის კლიპი მონიშნულია, playhead კლიპის გარეთ დგას (ხაზი `display:none`, waveform ჩანს). C ბიუჯეტის ფარგლებშია და ამ probe-ს თვითონ არ გაუშვებს.

**რეკომენდაცია B-ს (გადაწყვეტა B-სია):** C-R8-01 ჩაირთოს round 9-ის sync/drift ბაგების რაუნდში (C-R7-01 / C-R6-02 / C-R8-01, მჭიდროდ დაკავშირებული drift ბაგები) და დაიხუროს **stage 2-მდე**. მიზეზი: workflow-ის წესი "Medium ბაგი შემდეგ **დამოუკიდებელ** ფუნქციას არ აჩერებს" აქ არ მოქმედებს. Stage 2 (fold/height/auto-fit) იგივე პანელსა და იგივე D-29a ბიუჯეტს ეხება, D state კი 1440×900-ზე ნაგულისხმევია. C-R7-02 (ruler label, Low) შეიძლება გადავიდეს.

C-R6-02-ს კავშირი: D-24-ის ჩავარდნები ამ ბაგის evidence-ია, მაგრამ D-vs-P კონტრასტი მათ პანელს მიაწერს, ამიტომ ცალკე ბაგად არის ჩაწერილი.

### შენიშვნები (ბაგი არ არის, B-სთვის)

- **N1:** "footer one line" vs R11A-3-ის ისტორიული მნიშვნელობა (§3).
- **N2:** დაკეცილ მდგომარეობაში `aria-valuenow` 144-ია (expanded), rendered კი 36; `aria-valuetext` `დაკეცილია · 144 px`. A-ს deviation 1; spec-თან გადასაწყვეტია.
- **N3:** pointercancel/blur-ზე აღდგენა 300 ms-ით ანიმირდება. Spec ამას არ კრძალავს.
- **N4:** design-philosopher-ის follow-ups (a)–(d) და code-reviewer L11 (wheel number input-ზე) ღიაა (A §10).

## 9. Carried (არ არის PASS)

- C-R7-01, C-R6-02, C-R7-02 (round 9). C-R6-02-ს ემატება ამ რაუნდის N_1 FAIL (0.1329, app LoAF-ის გარეშე steady-ში).
- R11-P2/P2a/P3 (stage 2/3), R11-P3m (Tech Lead real-mouse separator drag), quiet-Chrome drift/wrap.
- G6-R-ის 21 regression-debt ID (milestone).
- root-pre-push-review / publication-checkpoint:
  - **M1:** loop refill მხოლოდ rAF-იდან (hidden tab ~0.5 s-ში ჩუმდება). ღიაა, ცნობილი ფიქსი არ არის.
  - **L2:** `holdUntil` reschedule-ზე.
  - **L3:** Delete `event.repeat`.
  - **L4:** `setPointerCapture`-ის throw-ზე gesture state რჩება.
  - **L7:** შეუზღუდავი history.
  - purchased `/studio/:product` loader-ი middle-east-ს hardcode-ს უკეთებს (SRW-21, inherited);
  - instruction-file portable paths;
  - checkpoint-r6 #6/#7;
  - user requests: scrollbar refinement / library parity / discoverability (`feature-status.md`-ის მიხედვით);
  - T12 Gain/Volume;
  - final commit/push მხოლოდ ყველაფრის დასრულების შემდეგ.

## 10. შეზღუდვები

ყველა pointer gesture synthetic `PointerEvent`-ით არის (`buttons:1`), keys რეალური `$B press`-ით. Headless Chromium, overlay scrollbar (h-scrollbar 0 px; classic Chrome-ზე 1280 collapsed რეზერვი ≈ 8 px). Reduced motion შემოწმდა CSSOM-ით და არა emulation-ით. მანქანა quiet არ იყო (CPU med 24–34 %).

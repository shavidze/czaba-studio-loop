# C — Round 21 შემოწმება: milestone regression run 2 (video/sync, C-R12-01, SRW-11B end to end) (D-29l)

შემმოწმებელი: C (Claude Opus 5.5) · თარიღი: 2026-10-11 · დავალება: `current-task.md` (round 21) · A-ს ანგარიში: `a-round-21.md`
Browser: gstack browse, state `c-browse.json`, სერვერი `http://127.0.0.1:5173` (არ გამიშვია/გამიჩერებია). Source-ში ცვლილება არ შემიტანია, commit არ ყოფილა. ყველა ფაილი: `c-round-21/` (`runs/`, `shots/`, `gates/`, `scripts/`, `checkpoint.md`).

## 0. ვერდიქტი — **FAIL** (ერთი ახალი Low ბაგი: C-R21-01, R3-V2-ის literal ჩავარდნა)

| ID | შედეგი | მტკიცებულება |
|---|---|---|
| R2-V1 (FB-15) | **PASS**; MP4/MOV-ის დადებითი გზა → env-limited, Tech Lead (არა PASS) | `runs/r2v1.txt`, `runs/r2v1-network.txt` |
| R3-V2 | **FAIL — C-R21-01 (Low)**. დანარჩენი ქვეპუნქტები გავიდა (§2.2) | `runs/r3v2-V2_2.txt`, `r3v2-V2_4.txt`, `r3v2-V2_5.txt`, `r3v2-V2_5-solo.json` |
| R3-V4 | **PASS** | `runs/r3v4.txt` |
| R5-L3 | **PASS** (+ brace projectEnd-ის მიღმა) | `runs/r5l3.txt`, `r5l3-L3.json`, `r5l3-pastend.json` |
| R5-E1 | **PASS** (maxDiff 0) | `runs/r5e1.txt` |
| RF5-3 (H2) | **PASS** 3/3 ვალიდური, ჩანაცვლების გარეშე | `runs/F_{1,2,3}.json`, `lfirst-summary.txt` |
| C-R12-01 | decision table: **„ყველა ჩაწერა \|d_dock\| > 0.02“ → იხურება** როგორც harness-reference artifact (ზღვარი ძალიან ვიწროა, §2.5) | `runs/F_*.json` (`writes`) |
| R11-P1b | **PASS** (1440, 1280) | `runs/lpanel-*.txt` |
| R11-P1c | **PASS** (1440; 1280-ზეც გაეშვა); task-ის ტექსტის შეუსაბამობა §5-ში | `runs/lpanel-1440x900.txt` |
| R11-P2 | **PASS** (1440, 1280) | `runs/lpanel-*.txt`, `lpanel-keys-*.txt`, `lpanel-*-hdrag.json`, `lpanel-*-p2mixed.json` |
| R11-P3 | **PASS** (4 კონფიგურაცია) + sync 3/3 | `runs/p3-*.txt`, `runs/f5-table.txt`, `f5-summary.txt`, `F5_*` |
| R11-P4 | **PASS** (1440, 1280) | `runs/p4-*.txt`, `shots/p4-*.png` (13) |
| R11-U | **PASS** — 6 ფაილი / 176 ტესტი, sha უცვლელი | `gates/vitest-r11u.txt` |
| R3-V1 mode D | **მხოლოდ ინფორმაცია** (არა PASS/FAIL, არა C-R8-01-ის ვერდიქტი) | `runs/modeD-summary.txt`, `D_1_*` |
| G21-1 | **PASS** | `gates/tsc.txt`, `vitest-all.txt`, `biome-app.txt`, `build.txt` |
| G21-2 | **PASS** (დასაწყისი და ბოლო) | `gates/*-start.txt`, `*-end.txt` |
| G21-3 | **PASS** — premium auth bypass არ არის | `gates/anon-*.json`, `network-anon-*.txt`, `curl-token.txt`, `shots/anon-studio-middle-east.png` |
| Real export sanity | **გაიარა** (hard-clip — ცნობილი R13-M4) | `runs/export-sanity.txt`, `shots/export-dialog-1440.png` |
| R21-A | **PASS** — A-ს ციფრები ჩემს gate-ებს ემთხვევა | §1 |

ყველა რიცხვი ჩემი გაზომვაა. A-ს ციფრები მხოლოდ შესადარებლად გამოვიყენე.

## 1. Gates

### G21-1 (`gates/g1.sh`)
- `tsc --noEmit`: exit 0, output ცარიელი.
- `vitest run`: **57 files, 999/999**, exit 0. `sfx-library` flake არ განმეორდა.
- `biome check ./app` (read-only): 323 ფაილი, „No fixes applied“, 218 warning + 1 info, **0 error**.
- `npm run build`: exit 0.
- შენიშვნა: vitest browser-ის G21-3-თან პარალელურად გაეშვა; ორივე გავიდა.

### G21-2 (`gates/g2.sh start|end`)
- HEAD `c5ed47b` (root-ს commit არ გაუკეთებია).
- `sha256sum -c b-round-20-tree-sha256.txt`: **50 OK**, დასაწყისში და ბოლოს.
- `git status --short`: **42 ხაზი**, დასაწყისი და ბოლო **იდენტურია** `c-round-20/gates/git-status-end.txt`-ის (`diff exit 0`).
- Protected 4/4 OK. `Header.tsx`: HEAD-თან diff ცარიელი; `cc1e531`-თან +21/−0.
- აკრძალული გზები (`app/styles`, `root.tsx`, `routes/`, `animations`, `ui`, `layout`, `public`, `package*.json`, `studio-lab-demo.ts`): status-ში 0 ხაზი.
- უცხო `.claude/agents/frontend-architect.md` და `.codex/agents/frontend-architect.toml` არ წამიკითხავს და არ შემხებია.
- **R21-A:** A-ს ყველა ციფრი (50 OK, tsc 0, 999/999, build, 42 ხაზი, 4/4, +21/−0) ჩემს გაზომვას ემთხვევა.

### G21-3 (`$B restart` → ახალი context, credentials არა; harness არ ჩამიტვირთავს)
- **პირდაპირი `/studio-lab`** (`anon-direct.json`, 155 მოთხოვნა): `auth_user` null, cookie ცარიელი, localStorage-ში მხოლოდ `czaba_session_id`; workspace ჩაიტვირთა, „Sign in required“ არ ჩანს. Media: მხოლოდ `/middle-east.mp3` და `/videos/hero/hero-music.mp3`. `studio-token`, `recording`, `download`, R2 host: **0**. API მხოლოდ root `GET localhost:5199/api/cart` (pending, ნებადართული).
- **სესიაში fetch/XHR hook** (`anon-session-hook.json`): search `soft` → რეალური click option-ზე → რეალური Enter: clip 0 → 1. fetch 0, XHR 0, `Authorization` 0.
- **Header-ის `Studio LabDemo` ბმულზე რეალური click** `/`-დან (`anon-header.json`, 199 მოთხოვნა): `/studio-lab`, auth null. აკრძალული 0; pattern hit მხოლოდ `GET /app/lib/r2.config.ts` (Vite module, არა R2 host) და `/api/cart`.
- **`curl`**: anonymous → **401** `Please sign in to access Studio.`; fake Bearer → **500** `Unable to prepare Studio access`, token არ გაიცა (carry).
- **`/studio/middle-east`** → „Sign in required“, workspace არა, media 0.

## 2. Regression run 2 — დეტალები

Harness: „რეალური click“ = `$B click` ელემენტის ცენტრზე; key = რეალური `$B press`. Pointer drag-ები **synthetic-ია** (`buttons: 1`): ⤢-ყუთის drag, track height drag, cross-lane clip drag, marquee, ცარიელ ხაზზე deselect click. Layout-ები აწყობილია UI-ის helper-ებით (library drag, file drop) ან `commitArrangement`-ით (task-ით ნებადართული). Viewport 1440×900, თუ სხვა არ წერია. Video-ს ფაილები `media/`-დანაა (`SHA256SUMS.txt` 8/8 OK), გარეთ არაფერი ატვირთულა.

### 2.1 R2-V1 (FB-15) — ახალი გვერდი, ცარიელი arrangement
- **Picker** (`$B upload '[data-testid=arrangement-video-input]'`, ნამდვილი file input): `beeps-6s-vp9-opus.webm` → `[video, 0, 6.008, 0]`; `<video>.duration` = **6.008** (d₁, ±0.02 ✓). Status: `„beeps-6s-vp9-opus.webm“ დაემატა ვიდეოხაზზე 00:00.000 — 00:06.008`.
- **Drop** (synthetic `DragEvent` + `DataTransfer` + `File`, dropzone hint `ჩააგდე ვიდეო აქ`): `clip-4s-vp9-opus.webm` → `[video, 6.008, 4.008]` — ზუსტად პირველის ბოლოს. Status ასახელებს ფაილს.
- რეალური Ctrl+Z → შლის მხოლოდ მეორეს (`e11ab4aa`); პირველი რჩება. Ctrl+Shift+Z → იგივე id `e11ab4aa` 6.008-ზე.
- **Network** (import-ის დროს, `r2v1-network.txt`): 6 `blob:` GET (206) + 1 ცნობილი root GA `scroll` (`gcs=G100`, consent denied). სერვერზე upload 0.
- **MP4/MOV:** `canPlayType`: mp4 `maybe`, avc1 `probably`, `video/quicktime` `""`. `beeps-6s-h264-aac.mp4` და `clip-3s-h264-aac.mov` ორივე მიიღო (6.000 / 3.000), რადგან app ფაილს ნამდვილი metadata-load probe-ით ამოწმებს და Chromium .mov-ს რეალურად კითხულობს. ეს literal `canPlayType`-ის შეუსაბამობაა, ბაგი არა. დადებითი გზა **env-limited → Tech Lead real Chrome**, PASS-ად არ ითვლება.

### 2.2 R3-V2 — layout mapping: video beeps 0–6.008, **music 7–23** (ორიგინალი „music clip“; 7-ზე დავდე, რომ beep-ის ფანჯრებში master-ზე მხოლოდ video audio იყოს). Beep-ები fixture-ში: k…k+0.1 წმ, k = 0..5 (decode-ით გაზომილი). ფანჯარა: k+0.005…k+0.095.

მცდელობები (ბიუჯეტი 1 ვალიდური):

| Run | სტატუსი | მიზეზი |
|---|---|---|
| V2_1 | არავალიდური | ჩემი harness: M-ის aria-label არასწორი (`Mute — ვიდეოს ორიგინალი ხმა`), click timeout |
| V2_2 | mute ნაწილი **ვალიდური** (C-R21-01-ის მტკიცებულება); unmute timing არავალიდური | unmute 3.171-ზე დაჯდა, beep 3-ის შემდეგ (click latency) |
| V2_3 | mute ვალიდური; unmute არავალიდური | იგივე latency |
| V2_4 | mute ნაწილი **ვალიდური** (მეორე მტკიცებულება); unmute არავალიდური | იგივე |
| V2_5 | **სრულად ვალიდური** | wall-clock-ით დაგეგმილი რეალური click (latency 0.44 წმ) |

- **V2_5:** mute 0.611-ზე, unmute 2.910-ზე. Beep 1, 2 = **−240 dBFS** ✓. Beep 3 onset 2.998, ე.ი. unmute-იდან **88 ms** (gain უკვე სრულად აღდგენილი, −8.8 dB onset-ზე) ✓. Beep 0, 4, 5 = −9.0 dB.
- `video.paused === false` მთელ clip-ში, `muted === true` ორივე `<video>`-ზე ყოველ frame-ზე ✓. Source counter-ები: Play-ზე 2 start, toggle-ების დროს +0 start / +0 stop ✓ (restart არა).
- **Solo music** (V2_3 და V2_5-ის იმავე გვერდზე): beep 0–5 ყველა **−240** ✓; video არ ჩერდება.
- Dock counter-ები 0 → 0.
- **ჩავარდნა (C-R21-01):** V2_2-ში mute 0.961-ზე, beep 1 (1.0–1.1) master-ზე **−52.3 dBFS** RMS; V2_4-ში mute 0.902-ზე → **−86.3**. Block series (V2_2): 0.998 −44.7 → 1.038 −60.9 → 1.070 −79.3 → 1.094 −93.3 dB, ე.ი. ექსპონენციალური ramp ~0.58 dB/ms. ეს ემთხვევა `graph.client.ts:7` `GAIN_TIME_CONSTANT = 0.015` და l.163 `setTargetAtTime`-ს: −9-დან −80-მდე ~120 ms სჭირდება. Criterion-ს mute-ის მხარეს გარდამავალი დრო არ აქვს (unmute-ს აქვს 100 ms), ამიტომ literal FAIL. ტოლერანსი არ შემირბილებია. V2_5-ის PASS-ით ჩავარდნა არ დამიფარავს.

### 2.3 R3-V4 — video beeps 0–6.008 + music 0–16, playhead 0.5
- 10 რეალური Space (150 ms ინტერვალი): ყოველ press-ზე isPlaying/active.paused თანმიმდევრულია; ბოლოს 10 start / 10 stop, unstopped 0, max concurrent per buffer **1** (6.000 და 16.000).
- ბოლოს: `isPlaying` false, `active.paused === !isPlaying` ✓, **ზუსტად 2 `<video>`**, ორივე paused, rate 1, muted ✓.
- 8 ms synthetic burst (keydown+keyup Space ×10, დაკვრიდან): ბოლოს ისევ უკრავს (ლუწი), max concurrent 1, 2 `<video>`, active არ არის paused, standby paused, rate 1. შემდეგ ×9 (კენტი): stopped, ორივე paused, rate 1, max concurrent 1.
- Dock counter-ები 0.

### 2.4 R5-L3 / R5-E1 — music 0–16, Soft impact SFX 3–5, loop 2–4 (`looplay.js`); Play 1-დან
- Iteration-ები (wrap 3, 5, 7 წმ Play-დან): music source-ები `when` 3/5/7/9, off 2, dur 2; **seam 0 ms** ყველგან (`when(k+1)` = წინა `when+dur`). SFX: off 0 dur 1, `when` 2/4/6/8/10 (clip [3,4] ნაწილი). თითო clip-ზე თითო iteration-ში ერთი source; max concurrent 1/1.
- `start()`-ის lead iteration-ებზე **1999.3 ms** (music) და 2999.3 ms (SFX) ≥ 100 ✓. პირველი Play-ის start 50 ms lead-ითაა (Play-ის lookahead, iteration არ არის).
- Master tap: ყოველ wrap-ის ±50 ms-ში ყველაზე დაბალი 5 ms ფანჯარა **−36.2 dBFS** (> −60) ✓.
- პირველი wrap-ის შემდეგ live პოზიცია 2.0007…3.982, ნაჩვენები დრო 2.001…3.982 ✓.
- **Brace projectEnd-ის მიღმა** (loop 15–18, projectEnd 16, Play 14.5-დან): პოზიციის series 14.5→17.95→15.21→17.95→15.2 — wrap გრძელდება, 16-ზე არ ჩერდება. Master 16–18: **−240**; 15–16: −17.8 ✓.
- **R5-E1:** loop 2–4 on vs off (Ctrl+L), ორივე RIFF/WAVE PCM 2 ch 48 kHz 24-bit, **768 000 frame = 16.000 წმ**, **maxDiff 0** (≤ 1.2e-7), NaN 0. Loop ბოლოს აღდგა.

### 2.5 RF5-3 + C-R12-01 — L-first (R3-V1 layout: music 0–16, video 0–6.008 და 8–12.008, offset 0), ახალი გვერდი თითო run-ზე, Play 1-დან (`seekTo(1)`)

Instrument (`scripts/rf21.js`, წესი წინასწარ `checkpoint.md`-ში): `playbackRate` setter-ის ზემოთ ჩემი wrapper (m4.js უცვლელია). თითო ჩაწერაზე: `vt = this.currentTime`, `live = getLivePosition()`, `ctx`, `clock.holdUntil − ctxTime`, `videoSettles`, role. `d_dock = vt − (live − clip.start + clip.sourceOffset)` clip-ით `findVideoClipAt`-ის წესით (`start ≤ pos < start + duration`, `video.ts:99`). Harness `d` იმავე row-ზე: `posAt = 1 + (ctx − startAt)`.

| Run | RF5-3 | play − startAt | ზღვარი | w1 (≤ .1) | w2 (≤ .06) | hold / advance | settles swap-მდე | swap (Play-დან) | counters before → after |
|---|---|---|---|---|---|---|---|---|---|
| F_1 | **PASS** | +0.0007 | [−.0167, +.0167] | .0469 | .0419 | ყველა pre row paused; max advance 0 | 0 (ყველა row) | 7.011 | 0 → swaps 1, settles 1, fb/hs/esc 0 |
| F_2 | **PASS** | +0.0007 | იგივე | .0418 | .0418 | იგივე | 0 | 7.001 | იგივე |
| F_3 | **PASS** | +0.0007 | იგივე | .0438 | .0413 | იგივე | 0 | 7.001 | იგივე |

`<video>` 2 ყოველ frame-ზე. ბიუჯეტი: 3 ვალიდური, 0 ჩანაცვლება.

**C-R12-01 — rate ≠ 1-ის ჩაწერები settle-ის ფანჯრის გარეთ (Play → პირველი swap + 2 წმ):**

| Run | t Play-დან (rate, d_dock) |
|---|---|
| F_1 | 0.041 (1.1, −.02381), 0.051 (1.15, −.03448), 0.091 (1.2, −.04784), 0.102 (1.15, −.03901), 0.201 (1.1, −.02517), 0.270 (1.1, **−.020129**), 0.342 (1.1, −.02059) |
| F_2 | 0.051 (1.15, −.03462), 0.182 (1.1, −.02758), 0.251 (1.1, −.02067), 3.222 (1.1, **−.020342**) |
| F_3 | 0.051 (1.15, −.03392), 0.182 (1.1, −.02806), 0.251 (1.1, −.02110), 0.321 (1.1, **−.020696**) |

- **Decision-table row:** ყოველი ჩაწერა **|d_dock| > 0.02** სამივე run-ში → **C-R12-01 იხურება** როგორც harness-reference artifact.
- **ზღვარი ვიწროა:** min |d_dock| = 0.020129 / 0.020342 / 0.020696, ე.ი. F_1-ში 0.13 ms ზღვრის ზემოთ. B-მ ეს უნდა იცოდეს.
- **max |d − d_dock| = 0** — ეს ახალი instrument-ის თვისებაა: ორივე ერთსა და იმავე task-ში ერთსა და იმავე `ctx.currentTime`-ს კითხულობს (loop არ არის), ამიტომ ტოლობა აგებულებითაა. ეს **არ არის** round 12-ის 0.0192–0.0196-ის „შეჯერება“: ის მნიშვნელობები ძველი, rAF-row-ზე join-ის მეთოდიდან მოდიოდა, რომელიც ახლა ჩანაცვლებულია setter-ის მომენტის წაკითხვით.
- **audioLead:** `holdUntil − ctxTime` < 0 ყველა ჩაწერაზე (მაგ. −0.0407, −3.222), ე.ი. `audioLead = max(0, …) = 0` და task-ის ფორმულა ზუსტად dock-ის `drift = frame − unclamped`-ია (`ArrangementVideoDock.tsx:491, 568`).
- Settle-ის ფანჯრის შიგნით (swap → +1.0 წმ) |d| ≤ 0.02-იანი ჩაწერები არსებობს (მაგ. F_2 7.030: 1.1, −0.0139) — ეს settle-ის წესია და decision table-ით გამორიცხულია.
- **R12-S (D-19b წაკითხვა):** პირველი swap-ის settle-ის (+1.0 წმ) შემდეგ rate ≠ 1-ის ჩაწერა **0** სამივე run-ში. Swap-მდე steady უბანში ერთადერთი ჩაწერა start transient-ის გარეთ — F_2 3.222 წმ, |d| 0.0203 > 0.02 ✓.
- Settle window-ის გარეთ არცერთი ჩაწერა |d_dock| ≤ 0.02-ით → D-19-ის ახალი ბაგი **არ არის**.

### 2.6 SRW-11B end to end

**R11-P1b (1440 და 1280, `lay11`, music მონიშნული რეალური click-ით):**
- 1440: load 144 (`144 px`). Toggle-ზე რეალური click → **36**, `aria-valuenow` 144, `aria-valuetext` **`დაკეცილია · 144 px`** (N2) ✓; ისევ click → 144.
- Separator-ზე focus + რეალური ↑: 160, 176 … 272, **280 (clamp)**; ↓: 264 … 136, **120 (clamp)**. ბიჯი 16, `aria-valuenow` = სიმაღლე ყველგან. ↑↑ 152 → collapse → `დაკეცილია · 152 px` → expand → 152.
- 1280: გვერდი **დაკეცილით ჩაიტვირთა** (persisted, `დაკეცილია · 142 px`); რეალური toggle click → 142 (D-29g-ის 1280 cap, round 19-ის 142-ის ტოლი; „default 144“ 1440-ს ეხება). ↑ 158 … 280 clamp; ↓ … 120 clamp.
- Scroller-ის `clientHeight` 496 ↔ 604 (1440) / 280 ↔ 386 (1280) იცვლება; scroller.bottom ≤ panel.top ყველა sample-ზე (`covered` false). History უცვლელი (`დამატება — Soft impact`).

**R11-P1c (1440; 1280-ზეც იგივე):**
- Single: `ღამის პულსი · სრული მიქსი | ხაზი მუსიკა | დასაწყისი 00:00.000 · სიგრძე 00:16.000 | წყაროდან 00:00.000 | წყარო უცვლელი რჩება`. ლათინური `start|offset|end` content-ში **არ არის**.
- Ctrl+A (რეალური) → `4 კლიპი | ხაზები ვიდეო, მუსიკა, სტემები, SFX | დასაწყისი 00:00.000 · სიგრძე 00:18.000 | ჯგუფი ერთად გადაადგილდება · Delete შლის · Ctrl+D აორმაგებს | … | range ერთ კლიპზე ისმება — აირჩიე ერთი`.
- ცარიელ SFX ხაზზე synthetic click (Escape მონიშვნას არ ხსნის) → `არაფერია არჩეული` / `აირჩიე კლიპი, რომ დეტალები ნახო … ჯერ აირჩიე კლიპი`.
- Range: რეალური click input-ზე + Ctrl+A + `$B type` 2 / 5 → `მონიშვნა` click → range `{2, 5, music}`, status `მონიშვნა: 00:02.000 — 00:05.000 · მუსიკა.`, **history უცვლელი**. 2 / 20 (clip-ის გარეთ) → `მონაკვეთი კლიპის საზღვრებში უნდა იყოს; დასასრული დასაწყისზე მეტი უნდა იყოს.`, range 2–5 უცვლელი, history უცვლელი.
- Play 1-დან 2 წმ: panel-ის MutationObserver → მხოლოდ `arrangement-detail-playhead.style` 133 ცვლილება, childList 0, characterData 0; transform 25 სხვადასხვა მნიშვნელობა (`translateX(75%)` → `translateX(19.89%)`) — მხოლოდ transform ✓. `render-budget.test.tsx` მწვანეა (R11-U).

**R11-P2 (1440 და 1280):**
- Music fold (რეალური click) → header 35 / lane **36**, `aria-expanded` false; history უცვლელი. დაკეცილზე M → `mute true`, ისევ M → false; S → `solo true`. (M/S თავისი history ჩანაწერებს ქმნის — mixer state, fold/height არა.)
- Height ↑/↓ (focus + რეალური key, `aria-valuenow` თითო press-ზე): stems 180 → 172 → 164 → 172 → 180 → 180 (clamp); ×16 ↑ → **60** (min); video 52 (min) → 60 → 68 → 76, ×18 ↑ → **52**; max 180. ბიჯი **±8** ✓. Header vs lane: `dTop` 0, `dH` −1 (lane-ის 1 px border) ყველგან ✓. History უცვლელი.
- Synthetic height drag: video −500 → 52; music +37 → 117 (1440, 80-დან) / 97 (1280, 60-დან); +500 → 180.
- `p2mixed.js` (video 52, music დაკეცილი 36, stems 180, sfx 140/120): music header drag → stems 20 (Undo → music 0); stems → დაკეცილი music 20 (Undo → stems 2); marquee stems→sfx = ზუსტად {stems, sfx}; marquee stems→დაკეცილი music = {music, stems}; library drop `Slow rise` → sfx 10. `allHeadersFit` true ორივეზე. (`lay` false 1280-ზე — 180+120 სიმაღლის ხაზები scroller-ს სცდება, scroll; criterion-ში არ შედის.)

**R11-P3 (4 კონფიგურაცია, `runs/p3-*.txt`):** ⤢ დაკვრის დროს (რეალური click), 0.9 წმ-ის შემდეგ ჩემი rect-ები:

| VP / lib | body t–b (h) | box l,t,w×h | formula | Δ max | 16:9 | body-ში | header/search/preview/sep |
|---|---|---|---|---|---|---|---|
| 1440 / 288 | 233–664 (431) | 8, 503, 272×153 | 8, 503, 272×153 | 0 | 1.7778 | კი | არცერთს |
| 1440 / 480 | 217–664 (447) | 8, 432.5, 397.33×223.48 | 8, 432.5, 397.33×223.5 | 0.02 | 1.7779 | კი | არცერთს |
| 1280 / 288 | 271–484 (213) | 8, 369.5, 189.33×106.48 | 8, 369.5, 189.33×106.5 | 0.02 | 1.7781 | კი | არცერთს |
| 1280 / 480 | 255–484 (229) | 8, 361.5, 203.55×114.48 | 8, 361.5, 203.56×114.5 | 0.02 | 1.778 | კი | არცერთს |

- **Body rect round 15-ის შემდეგ შეიცვალა** (ფორმულა ორაკულია): body.b 664 (round 15: 684) 1440-ზე და 484 (504/520) 1280-ზე, ამიტომ ყუთიც პატარაა (მაგ. 1440/480: 397.33×223.48, round 15: 429.33×241.48). სავარაუდო მიზეზი: footer-ის მონიშნული clip-ის ხაზი (`r3v1lay` clip-ს მონიშნულს ტოვებს; C-R15-02-ის მექანიზმი). ზუსტად არ შემიმოწმებია. ყუთი body-ს შიგნითაა და არაფერს ფარავს.
- ⠿ + რეალური → ×3 → **+48** (8 → 56); ↓ ×60 → top = vh − h (747 / 613.5 …) clamp; → ×90 → left = vw − w (1168 / 1090.66 …) clamp. Synthetic drag ზედა-მარცხნივ → **0,0** clamp. History უცვლელი (`კლიპის გადატანა`).
- ✕, placeholder-ის `დაბრუნება` ღილაკი და blurred Esc → 160×90 `relative` dock-ში (`ვიდეო პატარა ხედს დაუბრუნდა.`).
- Esc პრიორიტეტი: search-ში `soft` → Esc1 ასუფთავებს query-ს, ვიდეო გაფართოებული რჩება; Esc2 ცარიელ focused search-ში — ისევ გაფართოებული; blur + Esc → ბრუნდება (`c-round-15.md` §8-ის იდენტური).
- ◀ გაფართოებულიდან → rail 40, 160×90, verbatim `ბიბლიოთეკა დაიკეცა, ამიტომ ვიდეო პატარა ხედს დაუბრუნდა.`
- ⤢ rail-იდან → დროებითი გახსნა (`ბიბლიოთეკა დროებით გაიხსნა გაფართოებული ვიდეოსთვის; ვიდეოს დახურვისას ისევ დაიკეცება. Esc ან ✕ აბრუნებს.`), D-29f-ის პოზიციაზე Δ ≤ 0.02; ✕ → ისევ დაკეცილი (`ვიდეო პატარა ხედს დაუბრუნდა; ბიბლიოთეკა ისევ დაიკეცა.`).
- `isSameNode`: 2 `<video>` იგივე node-ები ✕-ის შემდეგ და ბოლოს ✓. Dock counter-ები 0. Separator ბოლოს 288-ზე დავაბრუნე.
- 1440/288-ის პირველი ცდა **არავალიდურია** (`p3-1440x900-288.INVALID-harness-placeholder-selector.txt`): ჩემმა სკრიპტმა placeholder-ის div-ზე დააჭირა ღილაკის ნაცვლად, შემდეგი ⤢ toggle-მა Esc-ის ტესტი გააფუჭა. ჩანაცვლებულია.

**R11-P3 sync (L-float, R13-F5 მეთოდი, `f5.sh` + `rf13c.js`, 1440×900):**

| Run | pass | med / max (300 ms-ის გამორიცხვით) | raw / all frames | over | sets while seeking | rate | swap | layout changes (paused in 300 ms / Δcounters) | counters |
|---|---|---|---|---|---|---|---|---|---|
| F5_1 | **PASS** | .0139 / .0170 | .0180 / .0467 | 0 | 0 | 1–1.40 | 8.011 | 15 (0 / 0) | swaps 0→1, settles 0→1, fb/hs/esc 0 |
| F5_2 | **PASS** | .0111 / .0174 | .0283 / .0413 | 0 | 0 | 1–1.35 | 8.001 | 15 (0 / 0) | იგივე |
| F5_3 | **PASS** | .0108 / .0183 | .0360 / .0438 | 0 | 0 | 1–1.40 | 8.001 | 15 (0 / 0) | იგივე |

- `same: true` (იგივე node-ები ყოველ frame-ზე). `ids: false` = role-ების გაცვლა swap-ზე 8.0 წმ-ზე (round 13-ის `idChanges`-ის ტოლი), ბაგი არ არის.
- `hard` ჩანაწერი ~8.45–8.47 წმ-ზე: ცნობილი `currentTime` set Pause-ის ახლოს (round 12 §2.1, round 13-იც). Dock `data-video-hard-seeks` 0.
- ბიუჯეტი: 3 ვალიდური, 0 ჩანაცვლება.

**R11-P4 (`shots/p4-{1440x900,1280x720}-*.png`, 13 shot; `scripts/aud.js`):** detail open/collapsed, folded stems, expanded video, library open/collapsed (+1280 `detail-collapsed-onload`).
- overlap 0, viewport-ის გარეთ 0, document scroll 0 — ყველა მდგომარეობაში.
- 4 lane + ruler + loop strip ხილულია (1280 detail-open: 53/61/61/61 auto-fit; folded: 53/72/36/72).
- Shortcut hint: სიმაღლე 16 = line-height 16 → **1 ხაზი**, overflow არა (N1).
- Compact dock **160×90** ყველა არა-expanded მდგომარეობაში. Shot-ები გავხსენი (1440 expanded, 1280 folded): clipping არ ჩანს.

**R11-U:** `panels` 53, `detail-panel` 24, `detail-panel-polish` 16, `track-layout` 31, `floating-video` 45, `render-budget` 7 = **176/176**. ექვსივე ფაილის sha `b-round-20-tree-sha256.txt`-ს ემთხვევა.

### 2.7 R3-V1 mode D — მხოლოდ ინფორმაცია (`runs/modeD-summary.txt`, `D_1_*`)
Panel ღია (144), music მონიშნული, R3-V1 layout, 1 run: D-24 `PASS`-ის ფორმა, raw max **.0183** (med .010), cover 0, swap 8.001, app LoAF 0, forced 0. Context `tick` p50/p95/max 0.2/**0.3**/0.7 ms, + microtask 0.2/**0.4**/4.1. Dock `step` p95 0.3. CPU med 11.8 %. **C-R8-01-ის ვერდიქტი არ არის.** rAF სიაში Lenis-ის `raf` ჩანს — round 9-ის D run-ებშიც იყო (carry „Lenis /studio/*“).

### 2.8 Real export sanity (`runs/export-sanity.txt`)
Layout: music 0–16 + imported `beeps-6s-vp9-opus.webm` **14–20.008** (`commitArrangement`-ით გადატანილი). `Export`-ზე და `WAV-ის ექსპორტი`-ზე რეალური click, შემდეგ `დახურვა` (დაიხურა).
- Dialog: `მთელი პროექტი · 0:00 — 00:20.008`, `ვიდეოს ორიგინალი ხმა (beeps-6s-vp9-opus.web…` შედის.
- WAV: RIFF/WAVE PCM, 2 ch, 48 kHz, 24-bit; **960 384 frame = 20.008 წმ** = dialog-ის projectEnd ✓. **NaN 0.** Full-scale (|x| ≥ 1 − 2⁻²³) **20 sample**, peak 1.0 — beep + music-ის ჯამი 14–15-ზე, ცნობილი R13-M4 (SRW-13).
- Video audio მიქსშია: beep-ის ფანჯრები 16–19 წმ **−9.04 dB**, მათ შორის −102 dB; 14–15-ზე beep + music −7.8 dB.
- Export-ის შემდეგი status ტექსტი სიტყვასიტყვით არ ჩამიწერია (dialog-ის ტექსტი 400 სიმბოლოზე მოიჭრა); internal-consistency ორაკული შესრულებულია.

## 3. ბაგები B-სთვის

### C-R21-01 (Low; R3-V2 literal FAIL) — Mute-ის შემდეგ ~120 ms-ში video-ს ხმა master-ზე ისევ ისმის
- **Steps:** `bash c-round-21/rv2b.sh V2_x` (1440×900; video beeps 0–6.008, music 7). Mute — ვიდეოს ორიგინალი ხმა-ზე რეალური click ისე, რომ mute beep-ამდე 40–100 ms-ით ადრე დაჯდეს (V2_2: 0.961; V2_4: 0.902). Beep 1-ის ფანჯრის RMS master tap-ზე.
- **Expected (R3-V2):** muted-ის დროს beep-ის ფანჯრებში master RMS < −80 dBFS.
- **Actual:** −52.3 dBFS (mute 40 ms ადრე), −86.3 (98 ms ადრე). Envelope: ექსპონენციალური, ~0.58 dB/ms.
- **Evidence:** `runs/r3v2-V2_2.txt`, `r3v2-V2_4.txt`; `app/lib/arrangement/graph.client.ts:7` (`GAIN_TIME_CONSTANT = 0.015`), l.163 (`setTargetAtTime`). კოდი round 2-დან უცვლელია.
- **სმენადობა** headless-ში არ შემიმოწმებია (Low; B/Tech Lead-მა შეიძლება აწიოს).
- **B-ს არჩევანი:** (a) τ-ის შემცირება (მაგ. de-click ≤ 3–5 ms), რომ −80 ~20–30 ms-ში მიიღწეს; ან (b) criterion-ის შესწორება mute-ის მხარის სიმეტრიული გარდამავალი ფანჯრით (როგორც unmute-ის 100 ms). C ტოლერანსს თვითონ არ ცვლის.

## 4. არავალიდური გაზომვები (მიზეზით)

| ID | ფაილი | მიზეზი |
|---|---|---|
| R11-P3 1440/288 | `runs/p3-1440x900-288.INVALID-harness-placeholder-selector.txt` | ჩემი selector (placeholder div ღილაკის ნაცვლად) |
| R3-V2 | `runs/r3v2-V2_1.INVALID-harness-mute-label.txt` | ჩემი aria-label |
| R3-V2 unmute | V2_2, V2_3, V2_4 (mute ნაწილი ვალიდურია) | `$B click`-ის latency, unmute beep-ის შემდეგ დაჯდა |

რეალური ჩავარდნა retry-ით PASS-ად არ ქცეულა. Sync layout-ებზე (L-first, L-float) ჩანაცვლება არ დამჭირვებია.

## 5. დაკვირვებები B-სთვის (არა ბაგი)
- **R11-P1c task-ის ტექსტი:** `current-task.md` §4.1 წერს „apply inside the clip (**one history entry**)“, ორიგინალი `tasks/round-8.md` l.205 კი — „**there is no history entry**“. App ორიგინალს ემთხვევა. Round 22-ის ტექსტი უნდა გასწორდეს (round 20-ის R6-S5/D-25-ის მსგავსი შემთხვევა).
- **R2-V1 MOV:** `canPlayType('video/quicktime')` = `""`, მაგრამ .mov მიიღება, რადგან app ნამდვილ metadata-load probe-ს იყენებს. Criterion-ის „where canPlayType supports them“ ფორმულირება probe-ზე უნდა გადაეწეროს.
- **C-R12-01** დაიხურა, მაგრამ ზღვარი 0.13 ms-ია (F_1 0.270 წმ). Headless-ის სხვა გარემოში ჩაწერა ≤ 0.02-ზე შეიძლება გამოჩნდეს; ამ შემთხვევაში decision table-ის პირველი სტრიქონი მოქმედებს.
- **R11-P1c: `Escape`** ჯგუფის მონიშვნას არ ხსნის (deselect მხოლოდ ცარიელ ადგილზე click-ით) — ქცევის ჩანაწერია.
- **1280 detail panel** persisted-ად დაკეცილი იტვირთება (task-ის მოსალოდნელი ქცევა), cap 142.

## 6. Product flow (find → add → fit video → export) და Ableton-თან შედარება
- **Find + add:** library search `soft` → რეალური click + Enter (anon-ში), `lay11`/`place` library drag-ით; ვიდეო picker-ით და drop-ით (FB-15).
- **Fit video:** ვიდეო audio clock-ს მისდევს: Play-ის start-ზე hold → play ±1 ms, drift ≤ .047 პირველ 300 ms-ში, swap-ზე settle, floating ყუთის ცვლილებები sync-ს არ არყევს.
- **Export:** ნამდვილი dialog-ით WAV 20.008 წმ, video audio მიქსშია, NaN 0; hard-clip (R13-M4) ჯერ ღიაა.
- **Ableton:** Arrangement-ში mute (Track Activator) პრაქტიკულად მყისიერია, მხოლოდ მოკლე de-click-ით. აქ 15 ms τ ~120 ms კუდს ტოვებს (C-R21-01). Loop wrap sample-accurate-ია (seam 0) და export loop-ზე არ არის დამოკიდებული — Ableton-ის ქცევას ემთხვევა.

## 7. Carried (უცვლელი; არა PASS, არა ახალი ბაგი)
Root (`root-pre-push-review.md`, `publication-checkpoint.json`): purchased loader middle-east-ზე hardcoded (SRW-21); Lenis `/studio/*`-ზე (ასევე ჩანს `/studio-lab` mode-D rAF სიაში, როგორც round 9-ში); portable instruction-file paths; export hard-clip 0 dBFS (R13-M4, SRW-13; ამ round-ში 20 full-scale sample); საბოლოო commit/push მხოლოდ ბოლოს; uncommitted round-6..20 tree; საერთო `Modal.tsx` focus gap; root GA `scroll` consent denied-ით (ამ round-ში import-ის network-შიც); ორი უცხო agent ფაილი; A round-17 dev. 4 და round-19 dev. 5 (python, root); fake Bearer → 500 token-ის გარეშე; CDP allowlist `Input.dispatchMouseEvent`-ს კრძალავს; publication-checkpoint-ის მოთხოვნები (library/stems/scrollbars, T12, საბოლოო commit/push). Root M1, M2, M3, L1–L4, L6, L7, L8 დახურულია.
Tech Lead-ის ხელით: R23-1/2, R12-L4 (რეალური drag), RF7-2/RF7-3, R8-M1/M2, R10-N1/N2, R30-H1, R11-P3m, R11-SB, R13-RM, R15-SB, R17-T, R18-T, R19-T, Lenis `/studio/*`, MP4/MOV-ის დადებითი import.
ღია C ბაგები: C-R6-02, C-R8-01 (Tech Lead quiet Chrome); **C-R21-01 (ახალი)**. C-R12-01 — დახურულია (§2.5).

## 8. Deviations და გარემო
- **Python:** R3-V2-ის timing-ისთვის `python -` probe გავუშვი (anaconda), რომელიც გაიჭედა; ჩემი პროცესი (pid 1045) თავად გავთიშე. სხვა python/node პროცესი არ დამიტოვებია.
- `$B restart` G21-3-ისთვის (ახალი daemon pid 39260). Browser side effects: მხოლოდ demo local state (layout, panel/library state). Library separator 288-ზე დავაბრუნე.
- Dev server არ შემიხებია. Source-ში ცვლილება 0 (G21-2 ბოლოს).
- Scripts: `c-round-21/{b,r,setup,lib,lfirst,f5,p3,lpanel,p4,rv2,rv2b,drift9}.sh`, `gates/{g1,g2}.sh`, `scripts/{rf21,pst,hdrag,aud,rv2,rv4,rl3,sum8}.js` + წინა round-ების helper-ები.

## 9. შემდეგი (B)
- Round 22 (milestone fix): **C-R21-01** (τ ან criterion — B-ის გადაწყვეტილება); შემდეგ A round-11 follow-up-ები და `ArrangementLane.tsx:661`. R11-P1c-ისა და R2-V1 MOV-ის task-ის ტექსტების გასწორება.
- Run 2-დან გადასატანი (not run) ID არ არის — ყველა გაეშვა.

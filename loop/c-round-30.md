# C round 30 — SRW-13 ეტაპი 3: FB-04 Clip Gain (R13-M1) — დამოუკიდებელი შემოწმება

**თარიღი:** 2026-10-12/13 · **შემმოწმებელი:** C · **გარემო:** dev server `127.0.0.1:5173` მუშაობდა მთელი სესიის განმავლობაში (200). gstack browse, state `c-browse.json`. `node.exe` 8–12.

**საბოლოო სტატუსი: PASS** ამ რაუნდის მოცულობაზე. §4-ის ყველა ID გავუშვი რეალურ Studio-ში ან offline, და ყველა PASS-ია. რაუნდის ახალი ბაგი არ არის. ნაპოვნია ერთი **უკვე არსებული** Low დეფექტი (C-R30-01, round 29-ის screenshot-შიც ჩანს) და რამდენიმე info შენიშვნა B-სთვის (§9).

Artifacts: `c-round-30/` (`gates/`, `runs/`, `shots/`, `scripts/`, `mut/`, `checkpoint.md`) და `c-round-30.json`.

## 1. შედეგები ID-ების მიხედვით

| ID | CZABA მოთხოვნა | მტკიცებულება |
|---|---|---|
| G30-1 | **PASS** | `gates/tsc.txt`, `vitest-new.txt`, `vitest-frozen.txt`, `vitest-all.txt`, `biome-app.txt`, `build.txt` |
| G30-2 | **PASS** (start = end) | `gates/*-start.*`, `*-end.*` |
| G30-3 | **PASS** | `gates/anon-*.json`, `network-*.txt`, `session-hooks.json`, `curl-token.txt`, `shots/anon-*.png` |
| R30-GE | **PASS** (+6.000 / −6.000 dB, A 0 LSB) | `runs/ge-*.txt` |
| R30-GV | **PASS** | `runs/gv-live.txt`, `gv-undo.txt`, `gv-meter-0.txt`, `gv-meter-6.txt` |
| R30-GL | **PASS** | `runs/gl-loop.txt`, `gl-slope.txt` |
| R30-GH | **PASS** | `runs/gh-gk-1.txt`, `gh-undo-redo.txt`, `gh-reset.txt` |
| R30-GK | **PASS** (wheel მხოლოდ synthetic) | `runs/gh-gk-1.txt`, `gk-gesture.txt`, `gk-2.txt` |
| R30-GD | **PASS** | `runs/gd.txt` |
| R30-GN | **PASS** (+ export proof, D-25) | `runs/gn-1.txt`, `gn-2.txt`, `gn-3.txt`, `gn-export.txt`, `gn-d25.txt` |
| R30-GUI | **PASS** 1440 და 1280 | `runs/gui-geo.txt`, `shots/gui-*.png` |
| R30-GC | **PASS** | `runs/gc.txt` |
| R30-K | **PASS** | `runs/k.txt`, `gk-gesture.txt` (move), `gn-2.txt` (Cut Time, Delete) |
| R30-R | **PASS** | `runs/r-nogain.txt`, `r-gain6.txt`, `r-reset-equals-never.txt` |
| R30-S | **PASS** | `gates/snap-*-start.diff` (= end) |
| R30-U | **PASS** (10/10 mutation მოკლულია) | `runs/r30u-*.txt/.diff`, `scripts/mut30.mjs` |
| R30-Doc | **PASS** (1 მცირე უზუსტობა, §6) | doc 035 |
| C-R23-01 | info record (უცვლელი) | `runs/c-r23-01-record.txt` |

## 2. Gates

**G30-1** (`node.exe` 11–12):
- tsc: exit 0.
- ახალი `clip-gain.test.tsx`: **28/28** (≥ 16 ახალი `it`; ფაილში 28 `it(`).
- 14 გაყინული ფაილი (§4.7 სია): **225/225**.
- სრული vitest: **67 ფაილი, 1161/1161** (= 1133 + 28), 0 ჩავარდნა, timeout არ ყოფილა.
- build: exit 0 (`✓ built in 2.37s`).
- Biome `./app`: 0 error, **218 warning + 1 info** (= round 29).

**G30-2** (start და end იდენტურია):
- HEAD `c5ed47b`.
- `git status --short` = **69** ხაზი. baseline-თან diff ზუსტად `?? app/lib/arrangement/__tests__/clip-gain.test.tsx` და `?? docs/implementation/2026/quarter-IV/035-studio-lab-clip-gain.md`.
- `sha256sum -c b-round-29-tree-sha256.txt` → **69 OK**.
- protected **4/4 OK**.
- `Header.tsx`: +21/−0 vs `cc1e531`, HEAD-ის მიმართ diff ცარიელია. Forbidden path-ების status ცარიელია.
- 10 owned ფაილის sha start = end. Mutation-ების შემდეგ `diff -r store/app mut/app` ცარიელია; `store/node_modules` 618 → 618 (junction მოხსნილია).

**G30-3:**
- `browse restart` → ახალი context: `auth_user` null, cookie ცარიელი.
- `/` → header-ის ხილული `Studio Lab Demo` ბმულზე რეალური click → `/studio-lab`: 4 ხაზის მეტრი, Master, library 21 ღილაკი, Clip Gain სვეტი არსებობს. პირდაპირ `/studio-lab`-იც იგივეა.
- curl:
  - ანონიმური `/api/studio-token?product=middle-east&file=mix.mp3` → **401** `Please sign in to access Studio.`;
  - fake Bearer → **500** `Unable to prepare Studio access`, token არ გაცემულა (ცნობილი root item).
- `/studio/middle-east` → „Sign in required“, მეტრები 0. **Premium auth bypass არ არის.**
- სესია (gain edits, playback, loop, 7 export) — ჩემი fetch/XHR/beacon hook-ით (browser API hook): fetch მხოლოდ GA collect, `Authorization` **0**, binary body send **0**.
- Network: მედია მხოლოდ `middle-east.mp3`, `videos/hero/hero-music.mp3` და `blob:`. გარდა ამისა მხოლოდ ცნობილი `GET localhost:5199/api/cart` (pending/refused), GA consent-denied collect და fonts. `/api/studio-token`, `/api/recording-*`, `/api/download`, R2 host — **0**.

## 3. Layout L30 და clip ცხრილები (1440×900)

**Layout:** video `beeps-6s-vp9-opus.webm` (სინთეზური, საკუთარი) 0–6.008 · music `სრული მიქსი` 7–23, Ctrl+E-ით გაყოფილი 15-ზე → **A** `4634256d` (7–15, off 0) და **B** `8de871da` (15–23, off 8) · SFX `Soft impact` `adbe41cf` 4–6. ცხრილის ფორმატი: `[id, lane, start, offset, duration, gainDb]`, `-` = own key არ არსებობს.

საწყისი: `[af13cff4,video,0,0,6.008,-] [4634256d,music,7,0,8,-] [8de871da,music,15,8,8,-] [adbe41cf,sfx,4,0,2,-]`.

**Harness შენიშვნა (ჩემი deviation):** fresh context-ში detail panel დაკეცილი იყო. პირველმა `setcg`-მა ველი ვერ იპოვა, ამიტომ აკრეფილი `6` და `Enter` workspace-ს მოხვდა: Enter-მა library-ის `Soft impact` music-ზე 23-ზე დაამატა. ეს Ctrl+Z-ით დავაბრუნე და შემდეგ panel რეალური click-ით გავშალე. ამის შემდეგ ყოველი `setcg` ჯერ ამოწმებს, რომ ველი focused-ია. App-ის ბაგი არ არის.

## 4. R30-GE — export oracle (WAV 48 kHz / 24-bit / 2ch, 23.000 s = 1 104 000 frame)

Setup: music Solo (რეალური click), Master **−12.0 dB** (ფეიდერზე ArrowDown ×24). Clip Gain-ის ველში click, Ctrl+A, `$B type`, `$B press Enter`. Music-ის Volume ველი = `1` ყველა export-ის წინ და შემდეგ (`volCtl`).

| შედარება | ფანჯარა | dB ratio | max \|Δ\| | შედეგი |
|---|---|---|---|---|
| E+6 vs E0 | B [15,23) | **+6.0000** | vs 1.99526·E0: **1.57 LSB** (raw Δ 1 218 556 LSB) | PASS (±0.2) |
| E+6 vs E0 | A [7,15) | 0 | **0 LSB** | PASS (≤ 1) |
| E−6 vs E0 | B [15,23) | **−6.0000** | vs 0.50119·E0: **0.76 LSB** | PASS |
| E−6 vs E0 | A [7,15) | 0 | **0 LSB** | PASS |
| unsolo, B +6 vs 0 (Master −12) | SFX [4,6) | 0 | **0 LSB** | PASS |
| unsolo | video [0,4) და [4,6.008) | 0 | **0 LSB** | PASS |
| unsolo | B / A | +6.0000 / 0 | 1.57 / 0 LSB | PASS |
| reset-ის შემდეგ (Eu0) vs E0 | music [7,23) | 0 | **0 LSB** | reset = არასოდეს შეცვლილი |

- Peak: B E0 0.14595 → E+6 0.29122. NaN არ არის, ხანგრძლივობა ყველგან 1 104 000 frame.
- **Info (მოსალოდნელი, ბაგი არ არის):** Master 0 dB + B +6, music solo → export dialog: `გადატვირთვა: პიკი +0.4 dBFS — 120 sample შეიზღუდა 0 dBFS-ზე…`. დაკვრისას [17,19): Master peak `over` (+0.2), music track meter `over` (+1.3 dBFS). შემდეგ Master −12-ზე დავაბრუნე (`runs/info-overload.txt`).
- music track meter +1.3 dBFS-ს Master −12-ზეც აჩვენებს, რადგან track meter Master-მდეა (post-panner tap, round 27-ის დიზაინი).

## 5. Live graph — R30-GV, R30-GL, R30-R

Browser API hook-ები (**C-ის instrumentation, app source-ს არ ვეხები**): `BaseAudioContext.prototype.createGain` (კვანძის id), `AudioNode.prototype.connect` (source → GainNode), `AudioParam.prototype.setTargetAtTime`, `AudioBufferSourceNode.prototype.start` (offset და დაწყებისას gain-ის `value`). დამატებით AudioWorklet tap destination-ზე (round 2-დან).

**R30-GV** (music solo, Master −12):
- Play 14-დან (`$B click Play`). pos ≥ 16-ზე B-ზე `+6` + Enter. Commit pos **16.971**-ზე.
- commit-ის შემდეგ **ახალი `start` 0**. Play-ის 2 start (A off 7, B off 8) commit-მდეა.
- `setTargetAtTime(1.995262, t, 0.015)` **ერთხელ**, B-ის source-ის GainNode-ზე (`g7`). დანარჩენი გამოძახებები იმავე sync-ში ხაზების (`0`, τ 0.003) და Master-ის (`0.251189`) ხელახალი target-ებია, clip კვანძებზე არა.
- Playhead slope **0.991**, ნახტომი 0, `playing` true. Volume `1` უცვლელია.
- **Undo დაკვრისას** (Play 17-დან, Undo ღილაკზე click pos 18.19-ზე): ახალი start **0**; `setTargetAtTime(1, …, 0.015)` B-ის კვანძზე (`g14`); slope 1.000. Play-ისას B-ის source `g14` 1.995262-ით დაიწყო (`startGraph`-ის `clipGains` seed).
- **Meter** [17.2, 19), ორი დაკვრა:

| | music track max / mean | Master max / mean | tap RMS / peak |
|---|---|---|---|
| B 0 dB | −4.9 / −8.11 dB | −16.9 / −20.11 | −29.96 / −16.92 dBFS |
| B +6 dB (Redo) | +1.1 / −2.06 | −10.9 / −14.06 | −23.94 / −10.92 |
| Δ | **+6.0 / +6.05** | **+6.0 / +6.05** | **+6.02 / +6.00** |

ორივე ±1 dB-ის ფარგლებშია.

**R30-GL** (loop 13–17: range 13–15 A-ზე → Ctrl+L → brace-ის end-ის drag +2 s; B 0 dB-დან):
- Play 13-დან, ერთი wrap, შემდეგ B `+6` pos 14.819-ზე (ctx 110.17). შემდეგ ≥ 2 wrap.
- commit-მდე B-ის source-ები (`g33`, `g35`) gain 1-ით დაიწყო. `g35` (when 110.35, ჯერ არ დაწყებულა) commit-ისას `setTargetAtTime(1.995262)` მიიღო.
- commit-ის შემდეგ append-ილი **ყოველი** B source (`off 8`: `g37`, `g39`, `g41`) **1.995262**-ით იწყება. A-ს ყოველი source (`off 6`) — 1.
- ყოველ iteration-ზე ზუსტად 2 start (A + B), ზედმეტი start არ არის. Wrap 16.99 → 13.0087.

**R30-R** (ერთი გვერდი, ერთი sequence: seek 14 → Play 1 s → ruler seek 18 → Volume preview drag 0.8/0.9 → Mute ×2 → Pause):

| | start Play | + seek | + Volume | + Mute | setTarget calls | music meter max |
|---|---|---|---|---|---|---|
| gain არ არის | 2 | 3 | 3 | 3 | 25 | −4.7 dB |
| B +6 | 2 | 3 | 3 | 3 | 25 | +1.3 dB |

- Start-ების რაოდენობა იდენტურია; Volume და Mute reschedule-ს არ იწვევს; მეტრები მოძრაობს.
- Round 29-ის export layout განსხვავებულია (Master 0, გაუყოფელი) და მხოლოდ summary-ს ინახავს, ამიტომ reference არის E0. reset-ის შემდეგი export E0-ს 0 LSB-ით ემთხვევა.

## 6. History, keys, disabled states, gain-ის შენარჩუნება

**R30-GH:**
- `30`, `−100`, `6.04` commit → სამი ჩანაწერი. Undo ×3: −60 → 24 → 6 (label `Loop გამორთვა`); Redo ×3 ზუსტად აბრუნებს. ველის ტექსტი ყოველ ნაბიჯზე სინქრონულია.
- Digits `12` + ArrowUp ×2 + ArrowDown → ველი `12.1`, ჩანაწერი არ არის.
- Enter უცვლელ `6.0`-ზე → `Clip Gain უცვლელია: +6.0 dB.`, ჩანაწერი არ არის.
- `0 dB` → status `… — 0.0 dB.`, ხოლო Undo label ორივე მხარეს `Clip Gain`-ია.
  - ბრაუზერში მხოლოდ label შევამოწმე; reset-ზე undo-ს ნაბიჯებით არ გამივლია.
  - „ზუსტად ერთი ჩანაწერი“ reset-ზე ეყრდნობა UI ტესტს „0 dB reset removes the key with one entry“ და mutation (d)-ს.
  - Field commit-ების ერთჩანაწერიანობა ბრაუზერში undo-ს ნაბიჯებით დადასტურდა (ზემოთ). `Object.hasOwn(clip,'gainDb')` = **false** (context read). reset გათიშულია.

**R30-GK:**
- Escape → `6.0`. Tab → focus `0 dB`-ზე, ჩანაწერი არ არის.
- ცარიელი + Enter → `Clip Gain: შეიყვანე რიცხვი dB-ში (−60…+24).`, ჩანაწერი არ არის.
- `30` → `+24.0 dB`, `−100` → `−60.0 dB`, `6.04` → `+6.0 dB`.
- ველში Delete და Backspace → კლიპი და ცხრილი უცვლელია.
- Drag-ის დროს (B-ის header-ზე synthetic hold, `gesture:true`, focus ველში რჩება) Enter და `0 dB` click → `რედაქტირება drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი.`, ჩანაწერი არ არის. Release → ერთი `კლიპის გადატანა` (gain 6 შენარჩუნებულია); ის Undo-თი დავაბრუნე.
- Dirty `9`, შემდეგ A-ს header-ზე რეალური click → ჩანაწერი არ არის, status უცვლელია; A აჩვენებს `0.0`, B-ს ისევ 6 აქვს. A-ს ეს Chromium-ში უკვე ნანახი ჰქონდა; რეალურ Chrome-ში შემოწმება Tech Lead-ის R30-T-ს ეხება.
- Wheel focused ველზე: **synthetic** `WheelEvent` (±100) → `defaultPrevented` true, მნიშვნელობა უცვლელია. რეალური მაუსის wheel headless-ში არ მაქვს.

**R30-GD:**

| შემთხვევა | input / reset | title | `aria-describedby` → ტექსტი |
|---|---|---|---|
| ვიდეოკლიპი (რეალური click) | disabled / disabled | `ვიდეო კლიპს Clip Gain არ აქვს — ხმა: ხაზის Volume/Mute` | `:rp:` → იგივე |
| ჯგუფი (B + Ctrl+click A, synthetic) | disabled / disabled | `Clip Gain ერთ აუდიო კლიპზე ისმება — აირჩიე ერთი` | `:rt:` → იგივე |
| არაფერი (Ctrl+Z-ის შემდეგ და `selectClips([])`) | disabled / disabled | `ჯერ აირჩიე კლიპი` | `:rd:` / `:rv:` → იგივე |

Escape მონიშვნას არ ხსნის (არსებული ქცევა).

**R30-GN** (B +6; ყოველი ნაბიჯის შემდეგ Undo):

| ნაბიჯი | შედეგი |
|---|---|
| Split B 19-ზე (Ctrl+E) | `[8de871da,15,8,4,6]`, `[a28966c9,19,12,4,6]` |
| Ctrl+D | ასლი `[6e25e1dd,23,12,4,6]` |
| Nudge → | `15.1`, gain 6 |
| Trim end → 21 / left +1 s | `[15,8,6,6]` / `[16,9,7,6]` |
| Ctrl+Shift+X 9–11 A-ში | B 15 → **13**, gain 6; A → [7,2] + [9,off 4,4], gain არ აქვს |
| Delete 17–19 B-ში | `[15,8,2,6]` + `[19,12,4,6]`, სიცარიელე 17–19 |
| B → Ctrl+C → active music → seek 30 → Ctrl+V | `[c09eb15a,30,8,8,6]`, ველში `6.0` |
| Range 20–22 B-ზე → Ctrl+C → seek 40 → Ctrl+V | `[d261a7f0,40,13,2,6]`, ველში `6.0` |
| **D-25:** range 20–22 → Ctrl+X → active SFX → seek 45 → Ctrl+V | `[14778bbd,sfx,45,13,2,6]`, status `ჩასმა (1): 00:45.000-ზე · SFX ხაზზე.` |

**Export proof** (music solo, Master −12, 42.000 s):
- ჩასმული კლიპი [30,38) vs E0 B [15,23) ×1.99526 → **+6.0000 dB, 1.57 LSB**;
- range paste [40,42) vs E0 [20,22) → **+6.0000 dB, 1.56 LSB**;
- B [15,23) **+6.0000**, A [7,15) **0 LSB**.

## 7. GUI, ტერმინოლოგია და მეზობელი ქცევა

**R30-GUI** (range 17–19 B-ზე, detail panel ღიაა):

| viewport | content scrollW = clientW | gain სვეტი შიგნითაა | info | waveform | footer | scroller |
|---|---|---|---|---|---|---|
| 1440×900 | 1152 = 1152 | კი (128×91) | **288** | 500 | **89** | **476** |
| 1280×720 | 992 = 992 | კი (128×69) | **288** | 340 | **89** | **280** |

- Footer და scroller round 29-ის R29-FT-ს ემთხვევა. გვერდზე ჰორიზონტალური overflow არ არის.
- Tab-ის რიგი ორივე viewport-ზე (რეალური `$B press Tab`): `დასაწყისი` → `range-ის დასასრული (წამი)` → `მონიშვნა` (`arrangement-detail-apply`) → `Clip Gain (dB)` → `Clip Gain-ის განულება (0 dB)`.
- Screenshot-ები: `shots/gui-1440x900.png`, `shots/gui-1280x720.png`.

**R30-GC:** panel-სა და footer-ში (ტექსტი + `title`/`aria-label`/`placeholder`) `sensitivity`, `input gain`, `მგრძნობ`, `trim`/`Trim`, `input` = **0**. მთელ `body.innerText`-ში `sensitivity|მგრძნობ|input gain` არ არის. Label: `Clip Gain, dB`.

**R30-K:**
- Range: `მონიშვნა`-ზე click მუშაობს (ყველა mkrange). end ველში Enter → range 9–11.
- Track Volume preview drag (synthetic pointer + input) → **ერთი** `Volume` ჩანაწერი; ერთი Undo 0.75 → 0.98. Clip gain უცვლელია.
- Master `{gainDb:-12, mute:false}` ყველა export-ში უცვლელი იყო.
- Clip move/drag მუშაობს (`კლიპის გადატანა`).
- Ctrl+Shift+L → `allTracks:true`, footer `ყველა ხაზი`. Ctrl+Shift+X და range Delete — §6 GN.
- **Info (არსებული ქცევა):** Volume ფეიდერზე keyboard ArrowLeft ×3 → სამი `Volume` ჩანაწერი (თითო key-ზე ერთი). Master-ზე ArrowUp/Down იგივეა. ეს round 30-მდეც ასე იყო და fader UX-ს ეკუთვნის (stage 4).

## 8. Static, mutation-ები, doc

**R30-S** (`diff -u` `b-round-29-snapshots`-თან; start = end):
- `types/arrangement.ts`: +1, `gainDb?: number`.
- `model.ts`: 2 hunk — constants; `normalizeClipGainDb`, `setClipGainDb` (same object: unknown / non-audio / non-finite / unchanged; 0 → key destructuring-ით იშლება), `clipLinearGain`, `clipLinearGains`. Split/duplicate/deleteTime არ შეცვლილა.
- `graph.client.ts`: 7 hunk — import, `clipGains?` option, `setClipGain` interface, `clipId` state-ში, `clipGainTargets` Map, `startPlan` seed (`?? 1`), `setClipGain` (disconnect / equal → return; Map; `setTargetAtTime` ყოველ non-ended state-ზე), export `clipGains`. **ახალი `create*` call არ არის.** `applySchedule(ctx, planSchedule(arrangement, 0)` ადგილზეა, `setTrackGain` export-ში არ არის.
- `clipboard.ts`: 4 hunk — interface + 3 conditional spread.
- `ArrangementContext.tsx`: imports, label, interface, `scheduleKey` replacer, `startGraph` `clipGains`, `syncPlayback` non-reschedule loop, `setClipGain` callback, 2 value object.
- `ArrangementDetailPanel.tsx`: constants, import, optional prop, helper, `useId`, state, mount ref, re-sync effect, handlers, სვეტი. Info/waveform/range სვეტი და header უცვლელია.
- `StudioWorkspace.tsx`: 1 ხაზი (prop).
- `detail-panel-polish.test.tsx`: მხოლოდ ორი query `detailLabelTexts`-ში (Biome-ის re-wrap). მოლოდინის ხაზები byte-identical-ია.
- Hardcoded ფერი, `any`, `@ts-ignore` არ არის. ახალი კლასები არსებულ token-ებს იყენებს.
- **A-ს deviation §6.1** (`setClipGain?:` optional) დადასტურებულია: `StudioWorkspace` ყოველთვის გადასცემს, product-ში ქცევა არ იცვლება. გადაწყვეტილება B-სია.

**R30-U:**
- **Scratch:** `c-round-30/mut/` — `store/app`-ის ასლი, `store/node_modules`-ის junction (ბოლოს მოხსნილია, 618 → 618).
- **Test set:** `clip-gain`, `graph`, `clipboard`, `detail-panel-polish`, `ArrangementContext`, `master-ui`, `model`. Control **151/151**.
- თითოეული mutation ზუსტი string replace-ია count-ის შემოწმებით და შემდეგ აღდგება (`restored=true`; ბოლოს `diff -r` ცარიელია).

| mutation | როგორ | მოკლული (failed) |
|---|---|---|
| (a) `startPlan` ignores `clipGains` | `= clipGainTargets.get(...) ?? 1` → `= 1` | 3 |
| (b) `setClipGain` Map-ს არ ანახლებს | `clipGainTargets.set(clipId, value);` წაშლა | 3 |
| (c) `scheduleKey` `gainDb`-ს ითვლის | replacer → `value` | 1 (no-reschedule provider test) |
| (d) `gainDb: 0` რჩება | `next === 0 ? rest : …` → `{ ...rest, gainDb: next }` | 3 |
| (e1) copy/range carry drop | 2 spread `clip.gainDb` წაშლა | 1 |
| (e2) paste push drop | `item.gainDb` spread წაშლა | 1 |
| (f) video clip მიიღება | `track?.kind !== 'audio'` → `!track` | 2 |
| (g) export `clipGains`-ის გარეშე | ხაზის წაშლა `renderArrangementWav`-ში | 1 (source scan) |
| (h) rounding-ის გარეშე | `Math.round(…*10)/10` → clamp | 2 |
| (i) Escape-ის შემდეგ blur commit-ს აკეთებს | Escape-ის revert წაშლა | 1 |

- **Red-first:** A-ს `a-round-30/red-first.txt` = `25 failed | 1 passed (26)`. ხელახლა არ გამიშვია; 28-დან 2 ტესტი review-ის შემდეგ დაემატა, რასაც A თავად აცხადებს.
- **შეზღუდვა (A-ს შენიშვნა, დადასტურებული):** unmount-blur guard (`isContentMountedRef`) jsdom-ში არ მოწმდება და mutation (i) მას არ ფარავს. მისი მტკიცებულება მხოლოდ ბრაუზერია: GK-ში dirty `9` + სხვა კლიპზე click → commit არ მოხდა.

**R30-Doc** (doc 035): §2.8-ის ყველა სექცია არის: კონტრაქტი, მონაცემების წესი, graph, reschedule-ის არქონა, loop append, clipboard, UI და მიზეზები, frozen amendment, ტესტები, Ableton ცხრილი და T12-ის გამორიცხვები. კოდს ემთხვევა.
- **მცირე უზუსტობა (Low, doc):** სცენარის status-ში წერია `Clip Gain: სრული მიქსი — +6.0 dB.`. რეალური status-ია `Clip Gain: ღამის პულსი · სრული მიქსი — +6.0 dB.` (სათაური სრულია).
- l.4 სტატუსი `Completed (A; C-ის შემოწმება მოლოდინშია …)` — B-მ C-ის შედეგის შემდეგ შეიძლება განაახლოს.

## 9. Ableton-თან შესაბამისობა (§4.6)

**წყარო:** B-ის შენახული Live 12 Reference Manual (`b-round-29/`). C-მ 2026-10-13-ს ხელახლა გაფილტრა (`runs/ableton-grep.txt`). ციტატები ზუსტად დადასტურდა:
- §8.4.7: „The Gain slider, calibrated in dB, changes the clip gain. When multiple audio clips with different Gain values are selected, the value range is shown with split triangle handles on the Gain slider.“;
- §8.13 „Editing Clip Properties for Multiple Clips“ — ორივე ფაილშია;
- Arrangement View: „… without having to adjust the clip gain“.
- `ableton-mixing-20261012.txt` clip gain-ს მხოლოდ სარჩევში ასახელებს; signal flow არ არის.

ვიდეო არ გამოყენებულა.

| ქცევა | CZABA მოთხოვნა | Ableton-თან შესაბამისობა |
|---|---|---|
| Per-clip gain dB-ში, კლიპის თვისებებში | **PASS** (GE, GH) | **დადასტურებული** (§8.4.7) |
| Slider vs რიცხვითი ველი | **PASS** (ველი, GH/GK) | **შეგნებული განსხვავება** (T12.8/9) |
| Clip gain ხაზის Volume-ისგან ცალკე | **PASS** (GE: A 0 LSB, Volume `1` უცვლელი; GV meters) | **დაუდასტურებელი**: signal flow წყაროში არ არის |
| რამდენიმე კლიპი → მნიშვნელობების დიაპაზონი | **PASS** (GD: გათიშული, მიზეზით) | **შეგნებული განსხვავება** (T12.7) |
| Waveform zoom ≠ gain | — | **არ ეხება** (CZABA-ს zoom არ აქვს; waveform gain-ს არ მიჰყვება, T12.19) |
| საზღვრები −60…+24, 0.1 dB | **PASS** (GK) | **დაუდასტურებელი** |
| Reset 0 dB | **PASS** (GH) | **დაუდასტურებელი** |
| Gain ინახება split/duplicate/paste/trim/move/Cut Time/Delete-ზე | **PASS** (GN + export) | **დაუდასტურებელი** |

ტესტის PASS Ableton-ის ანალოგიურობას არ ამტკიცებს.

## 10. ღია და გადმოტანილი

**ახალი, უკვე არსებული (არა round-30-ის რეგრესია):**
- **C-R30-01 (Low):** 1280×720-ზე, ღია detail panel-ში, info სვეტის (`w-72`) პირველი ორი ხაზი (სათაური და `ხაზი …`) ერთმანეთს ეფარება და ზემოდან იჭრება. Content-ის სიმაღლე 85 px-ია (სვეტები 69 px), ხოლო info-ს 5 ხაზს gap-ებით ~88 px სჭირდება. `scrollTop` 0-ია, `scrollHeight` = `clientHeight` = 85, ანუ overflow ხილვადი გადაფარვაა და scroll არ ჩანს. იგივე ჩანს round 29-ის `c-round-29/shots/ft-range-1280x720.png`-ში, ამიტომ round 30-ს არ შეუქმნია. Clip Gain სვეტი (69 px) ეტევა. Evidence: `shots/gui-1280x720.png`.
  - **D-29j-თან კავშირი:** round 19-ის D-29j-ის stop-პირობა იყო „truncate row shrinks below 16 px“. აქ შემთხვევა ზუსტად ესაა: 1280-ზე, range ჩანს და footer 89-ია, content 85 px-ია; info-ს 5 ხაზს gap-ებით ~88 px სჭირდება. მექანიზმი markup-იდან ამოვიკითხე და არ გამიზომავს: პირველ ორ `<p>`-ს `truncate` აქვს (overflow hidden), ამიტომ flex column-ში იკუმშება. B-მ გადაამოწმოს, ფარავდა თუ არა round 19-ის 1280-ის გაზომვა შემთხვევას, როცა panel ღიაა და range ჩანს.

**Info, B-სთვის:**
- A-ს §6.1 optional prop — B-ის დადასტურება.
- A-ს §6.2 reset-ის `onMouseDown` preventDefault — ბრაუზერში შეესაბამება (GK-ში reset-ის click drag-ის დროს focus ველში დარჩა).
- **Pointer/keyboard-ის ასიმეტრია `0 dB`-ზე, როცა ველში dirty ტექსტია** (A §6.2a; ბრაუზერში ცალკე არ გამიზომავს):
  - mouse click → dirty ტექსტი იკარგება, **1** ჩანაწერი;
  - Tab → reset → Enter → ჯერ blur, რომელიც typed მნიშვნელობას ინახავს, შემდეგ reset — **2** ჩანაწერი.
  - ეს კონტრაქტის გადაწყვეტილებაა B-სთვის და ბაგი არ არის.
- Fader keyboard step = თითო step-ზე ერთი history ჩანაწერი (Volume და Master; არსებული; stage 4 fader UX).
- ArrowRight nudge-მა status ხაზი არ განაახლა (`Undo: გაყოფა` დარჩა), თუმცა undo label `კლიპის ჩაჩოჩება`-ა. არსებული ქცევაა, ამ რაუნდს არ ეხება; გადასამოწმებელია.
- disabled reset-ს `title` აქვს, `aria-describedby` — არა (A review 5; spec-ის მიხედვით).
- Doc 035-ის სცენარის status-ის სათაური (§8).

**C ბაგები:** C-R27-01 (Medium, Tech Lead quiet Chrome; vm-5 287.6 ms), C-R23-01 (Medium, Tech Lead), C-R6-02, C-R8-01 — უცვლელი, ამ რაუნდში არ გაზომილა.
- **C-R23-01 (info):** `curl /studio-lab` ×3 → 61 609 byte, **2 NUL** offset-ებზე **28013/28014** (round 29-ის იდენტური offset-ები; ზომა +1115 byte, Clip Gain სვეტის გამო).

**Low:** R26-M1, Master hold tick (stage 4), DEMO-SFX-FULL-SCALE, L3, LIB-SEP-REASON, R27-T, R9-REVIEWER-M1-L8, A-R29-REVIEW-1, DOC034-UNREACHABLE-NOTE.

**Root items** (`root-pre-push-review.md`, `publication-checkpoint.json`):
- purchased loader middle-east-ს hardcode-ავს (SRW-21);
- Lenis `/studio/*`-ზე;
- portable instruction-file path-ები;
- export-ის hard-clip 0 dBFS-ზე (clamp რჩება; Master 0 + B +6 → 120 sample, §4);
- საბოლოო commit/push ყველაფრის შემდეგ; ხე commit-ის გარეშეა (ახლა **69** ხაზი);
- `Modal.tsx`-ის focus gap;
- GA `scroll` consent denied-ის დროს;
- 2 უცხო agent ფაილი;
- A r17/r19/r22 deviation-ები, C-ის python probe-ები და C r29-ის `npx` cache;
- fake Bearer → 500;
- CDP allowlist;
- publication-checkpoint-ის მოთხოვნები (library/stems/scrollbars, T12, final commit/push);
- `Content-Type`-ში charset არ არის;
- dev server: ამ რაუნდში C-ის დროს **მუშაობდა**.

**Tech Lead manual:** §4.8-ის სია + **R30-T** (რეალური Chrome, ყურსასმენები: gain-ის ცვლილება დაკვრისას click/zipper-ის გარეშე; +6 dB ისმის მხოლოდ ერთ კლიპზე). headless-ში ზომით შემოწმდა (τ 0.015, +6.0 dB), მაგრამ მოსმენას ეს არ ანაცვლებს.

## 11. Deviation-ები

- Harness-ის შეცდომა §3: ერთი Enter workspace-ს მოხვდა და `Soft impact` დაამატა; Ctrl+Z-ით დავაბრუნე. გაზომვებამდე layout გადავამოწმე.
- Range, seek, library drop, group Ctrl+click, drag hold, fader preview და wheel synthetic event-ებია (round 29-ის მსგავსად). Clip Gain ველის key-ები, Play/Pause/Undo/Redo/reset/Solo click-ები და Tab რეალური `$B`-ია. „არაფერი არჩეული“ ერთხელ `selectClips([])`-ით (context call) დავაყენე და მეორედ რეალური Ctrl+Z-ით მივიღე.
- Source instrumentation არ გამოყენებულა. Browser API-ებზე hook-ები ჩემია (§5).
- `browse restart` / `goto`-მ ერთხელ timeout მისცა და header-ის ბმული ორ ელემენტს დაემთხვა. ხელახლა გავუშვი ხილულ ბმულზე, ახალი context-ით (auth null).

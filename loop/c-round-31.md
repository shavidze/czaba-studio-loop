# C round 31 — SRW-13 ეტაპი 4a: FB-05 track pan (R13-M2) — დამოუკიდებელი შემოწმება

**თარიღი:** 2026-10-13 · **შემმოწმებელი:** C · **გარემო:** dev server `127.0.0.1:5173` მთელი სესიის განმავლობაში 200-ს აბრუნებდა; ის არ გამიშვია და არ გამიჩერებია. gstack browse, state `c-browse.json` (ახალი context, credentials-ის გარეშე). `node.exe` 6–8.

**საბოლოო სტატუსი: PASS** ამ რაუნდის ყველა ID-ზე (§4.1–§4.5). ყველა ID გავუშვი; blocked არაფერია.

რაუნდის ახალ კოდში ერთი ახალი **Low** ბაგი ვიპოვე. ის ჩაწერილ კრიტერიუმებს მიღმა, ჩემი დამატებითი probe-ით გამოჩნდა: **C-R31-01** (blur-ის შემდეგ drag-ის გაგრძელება). გარდა ამისა, ბრაუზერში დავადასტურე ერთი **უკვე არსებული** Medium ბაგი, **C-R31-02** (A-ს VOLUME-DELETE-KEY). ერთი ტესტის ხარვეზიც ვნახე: **R31-U-GAP-B2**.

C-R31-01 ID-ების ვერდიქტს არ ცვლის. სამუშაო წესით რაუნდს წინ მხოლოდ critical, security და data-loss ბაგები უსწრებს. FB-05-ის „მზადაა“ სტატუსს ეს ბაგი დაბლოკავს თუ არა, B წყვეტს.

Artifacts: `c-round-31/` (`gates/`, `runs/`, `shots/`, `scripts/`, `checkpoint.md`) და `c-round-31.json`.

## 1. შედეგები ID-ების მიხედვით

| ID | CZABA მოთხოვნა | მტკიცებულება |
|---|---|---|
| G31-1 | **PASS** | `gates/tsc.txt`, `vitest-new.txt`, `vitest-frozen.txt`, `vitest-all.txt`, `build.txt`, `biome-app.txt` |
| G31-2 | **PASS** (start = end) | `gates/*-start.*`, `*-end.*` |
| G31-3 | **PASS** | `gates/curl-token.txt`, `anon-studio-me.json`, `network-anon-header.txt`, `session-hooks.json`, `network-session.txt`, `shots/anon-*.png` |
| R31-PE | **PASS** | `runs/pe-*.txt`, `pe-analysis.txt` |
| R31-PE2 | **PASS** | `runs/pe-E25L.txt`, `pe-analysis.txt` |
| R31-PV | **PASS** | `runs/pv-ref-C.txt`, `pv-live.txt`, `pv-undo.txt` |
| R31-PL | **PASS** | `runs/pl-loop.txt`, `pl-analysis.txt` |
| R31-PH | **PASS** | `runs/ph-keys.txt`, `ph-reset.txt`, `pe-set-50L.txt`, `pe-set-50R.txt`, `ph-undo-del.txt`, `ph-space-home.txt` |
| R31-PG | **PASS** (ჩაწერილი ნაბიჯები) + C-R31-01 probe | `runs/pg-*.txt` |
| R31-PD | **PASS** | `runs/pd.txt` |
| R31-PUI | **PASS** 1440 და 1280+panel | `runs/pui-*.json`, `pui-tab-1440.txt`, `shots/pui-*.png` |
| R31-PC | **PASS** | `runs/pc.txt` |
| R31-K | **PASS** | `runs/k-vol-height.txt`, `k-rest.txt`, `pg-clip-control.txt` |
| R31-R | **PASS** (reference fresh reload-ზე; deviation §8) | `runs/r-after-pan-reset.txt`, `r-fresh-no-pan.txt`, EC=E0 |
| R31-S | **PASS** | `gates/snap-*.diff` |
| R31-U | **PASS** (სპეციფიკაციის ყველა mutation მოკლულია; b2 ცოცხლობს → gap) | `runs/r31u-*.txt/.diff`, `scripts/mut31.mjs` |
| R31-Doc | **PASS** | doc 036 |
| C-R23-01 | info record | `runs/c-r23-01-record.txt` |

## 2. Gates

**G31-1** (`node.exe` 6):
- tsc: exit 0.
- `track-pan.test.tsx`: **26/26**. ფაილში 26 `it(` არის, მოთხოვნა ≥ 18-ია.
- 14 გაყინული ფაილი: **251/251**.
- სრული vitest: **68 ფაილი, 1193/1193** (= 1167 + 26). ჩავარდნა არ ყოფილა, timeout-იც არა.
- build: exit 0 (`✓ built in 3.46s`).
- Biome `./app`: **2 error** + 218 warning + 1 info.
  - ორივე error `format` ტიპისაა, baseline-ის CRLF ფაილებზე: `app\lib\auth.ts` და `app\lib\__tests__\bug-hunting\auth-bugs.test.ts`.
  - A-ს ფაილებში diagnostic 0-ია.

**G31-2** (start = end):
- HEAD `1cefea18500a…`.
- `git status --short` ზუსტად §3.2-ის 7 ხაზია.
- `sha256sum -c b-round-30-tree-sha256.txt` → **371 OK**, non-OK 0.
- protected **4/4 OK**.
- 7 owned ფაილის sha start-ზე და end-ზე იდენტურია.
- mutation-ების შემდეგ `diff -r store/app mut/app` ცარიელია. junction მოვხსენი; `store/node_modules` 618 → 618.

**G31-3:**
- ახალი context-ში `auth_user` null-ია, cookie ცარიელია.
- `/`-ზე header-ის `Studio Lab Demo` ბმულს რეალური click (`@e7`) დავაჭირე → `/studio-lab`. გვერდზე 4 ხაზია; Pan ჩანს music/stems/sfx-ზე და არ ჩანს ვიდეოზე. პირდაპირ `/studio-lab`-იც (setup) იგივეს აჩვენებს.
- curl:
  - ანონიმური `/api/studio-token?product=middle-east&file=mix.mp3` → **401** `Please sign in to access Studio.`;
  - fake Bearer → **500** `Unable to prepare Studio access`, token არ გაცემულა (ცნობილი root item).
- `/studio/middle-east` აჩვენებს „Sign in required“, მეტრები 0-ია. **Premium auth bypass არ არის.**
- სესია (pan drag-ები, playback, loop, 8 export) fetch/XHR/beacon hook-ით შევამოწმე:
  - `Authorization` **0**, beacon 0;
  - ერთადერთი fetch არის `GET /middle-east.mp3`, ჩემივე channel probe-ის (§3);
  - network: მედია მხოლოდ `middle-east.mp3`, `videos/hero/hero-music.mp3` და `blob:`;
  - დანარჩენი მხოლოდ ცნობილი მოთხოვნებია: `localhost:5199/api/cart` (pending), GA collect, fonts;
  - token, recording, download და R2 მოთხოვნები **0**.

## 3. არხების რაოდენობა, Layout L31

**არხები** (`runs/channels.txt`):
- მეთოდი: in-page `import('/app/data/studio-lab-demo.ts')` → `loadSource` OfflineAudioContext-ზე. ეს აპის იგივე loader-ია; label: C probe.
- `სრული მიქსი` (`demo-synth-mix`): **2 ch**, 48 kHz, 16 s, **L ≡ R** (dual-mono).
- `Soft impact`: **2 ch**, 48 kHz, 2 s, L ≡ R.
- აქედან გამომდინარე, R31-PE-ში **stereo** ფორმულა გამოიყენება.

**Layout** (1440×900):
- video `beeps-6s-vp9-opus.webm` (სინთეზური, საკუთარი) 0–6.008;
- music `სრული მიქსი` 7–23;
- SFX `Soft impact` 4–6.

**ცხრილები:** `[id, volume, pan|-, mute, solo]`.

| ნაბიჯი | music | დანარჩენი |
|---|---|---|
| E0u/E0-ის წინ | `[music,1,-,false,false→true]` | ყველა `-` (pan key არ არის) |
| EL | `[music,1,-1,…,true]` | `-` |
| ER | `[music,1,1,…,true]` | `-` |
| E25L | `[music,1,-0.5,…,true]` | `-` |
| EC (readout-ის შემდეგ) | `[music,1,-,…,true]` | `-` |
| ELu | `[music,1,-1,false,false]` | `-` |

Clip ცხრილი ყველა export-ის წინ და შემდეგ უცვლელია: `[1028643a,music,7,16,0] [7126498a,sfx,4,2,0] [9080723f,video,0,6.008,0]`. Master −12.0 dB-ია, music Volume control-ის მნიშვნელობა ყველგან `1`.

## 4. R31-PE / PE2 — export oracle (WAV PCM 48 kHz / 24-bit / 2 ch, 1 104 000 frame = 23.000 s)

ყველა export: overload ხაზი dialog-ში **არ არის**, full-scale sample **0**, NaN 0. ამიტომ ყველა export ვალიდურია.

50L/50R დაყენებულია რეალური `$B press Home`/`End`-ით; 25L კი Home-ით და ArrowRight ×25-ით. Slider-ის ცენტრზე რეალურმა click-მა მნიშვნელობა არ შეცვალა და ჩანაწერიც არ გაჩნდა.

| შედარება | ფანჯარა | L max \|Δ\| | R max \|Δ\| / peak | შედეგი |
|---|---|---|---|---|
| EL vs E0 (L = E0.L+E0.R, R = 0) | [7,23) | **1 LSB** | R peak **0 LSB** (ზუსტი 0) | PASS (≤2 / ≤1) |
| ER vs E0 (სარკე) | [7,23) | L peak **0 LSB** | **1 LSB** | PASS |
| E25L vs E0 (L = E0.L+0.70711·E0.R, R = 0.70711·E0.R) | [7,23) | **1.41 LSB** | **0.865 LSB** | PASS (≤2) |
| EC vs E0 | [0,23) მთელი ფაილი | **0** | **0** | PASS (0 LSB) |
| ELu vs E0u (unsolo) | SFX [4,6) | 0 | 0 | PASS |
| ELu vs E0u | video [0,4) და [4,6.008) | 0 | 0 | PASS |
| ELu vs E0u music | [7,23) | 1 | R 0 | formula PASS |

- Peak E0 music: 0.146984. EL.L-ის peak 0.293968 (×2, რადგან L ≡ R), RMS −23.99 dB L-ზე, R-ზე −∞.
- E0-ში max|L−R| = 0.

## 5. R31-PV / R31-PL — რეალური audio graph

**Browser hook-ები** (C-ის instrumentation; app source-ს არ ვეხები):
- `createStereoPanner`: tag ხაზის index-ით. ერთადერთი creation site per-track loop-ია; თითო graph-ზე 4 panner იქმნება, თანმიმდევრობით video/music/stems/sfx;
- `AudioParam.setTargetAtTime` tag-ილ panner-ებზე;
- `AudioParam.value` setter tag-ილ panner-ებზე (seed);
- `AudioBufferSourceNode.start`;
- per-channel AudioWorklet tap destination-ზე (round 2-ის tap-ის ჩემი ასლი, ცალ-ცალკე L/R RMS-ით).

**R31-PV** (music solo, Master −12, Play რეალური click-ით 8-დან):
- pos 10.011-ზე synthetic drag: pointerdown → `input` −15/−35/−50 → pointerup.
- **ახალი `start` 0.** ერთადერთი start (off 1, dur 15) Play-ისაა, drag-მდე.
- `setTargetAtTime` გამოიძახება **მხოლოდ** music panner-ზე (k5): −0.3, −0.7, **−1**, ყველა τ **0.015**. სხვა panner-ებზე გამოძახება 0-ია.
- slope **1.0**, jump არ არის, `playing` ყოველთვის true-ა.
- History: preview-ების დროს past 65 → 65 → 65 → 65, ხოლო release-ის შემდეგ **66**, label `Pan — მუსიკა`.
- `present`-ის music track-ს before/down/move snapshot-ებში `pan` key არ ჰქონდა (`stored` ველი არ არის). ის მხოლოდ `up`-ზე ჩნდება (−1). ესე იგი, preview-ებს `present`-ში არაფერი ჩაუწერიათ.
- Slider/readout drag-ის დროს მიჰყვება draft-ს: −15/15L, −35/35L, −50/50L. Volume `1` უცვლელია.
- **Tap** [12,14):

| | L RMS | R RMS |
|---|---|---|
| C (reference play) | −30.61 dBFS | −30.61 dBFS |
| 50L | −24.64 dBFS | **ზუსტი 0** (−∞) |

  R ≥ 60 dB-ით დაბალია → PASS.
- **Info (მოსალოდნელი, ბაგი არ არის):** 50L-ზე music track meter-ის max **+1.1 dBFS**-ია და sr-only over-0 შეტყობინება გამოჩნდა („დონემ 0 dBFS-ს გადააჭარბა“). Master −12-ზე export-ში full-scale 0-ია.
- **Undo დაკვრისას:** Play 12-დან, Undo ღილაკზე რეალური click ≈13.3-ზე. ახალი start 0; `setTargetAtTime(0, …, 0.015)` music panner-ზე (k9) **ერთხელ**; slope 1.0. R არხი: [12.2,12.9) −∞, ხოლო [14,15.3) −29.65 (= L).

**R31-PL** (loop 9–13; range detail panel-იდან, შემდეგ Ctrl+L):
- Play 9-დან. ერთი wrap-ის შემდეგ (12.979 → 9.001) pos 10.31-ზე music Pan-ზე რეალური `$B press Home` → 50L, ერთი ჩანაწერი. Home-ს seek არ გამოუწვევია. ამის შემდეგ ≥ 2 wrap.
- ყოველ iteration-ზე ზუსტად **1 start** (off 2, dur 4; loop-ში ერთი კლიპია), ზედმეტი start არ არის.
- `setTargetAtTime` music panner-ზე ზუსტად **1-ია** (ცვლილებისას, −1); wrap-ებზე 0.
- R არხი: iteration 0 −30.54 (C); iteration 1-ის შუაში ცვლილებაა; iteration 2 და 3 **−∞**. Iteration 4 Pause-მა გაწყვიტა და ის არ ითვლება.

## 6. History, keys, gestures, absence

**R31-PH:**
- Home +1 (50L); End +1 (50R); მეორე End-ზე **+0**.
- PageUp +1 (−40), PageDown +1, ArrowRight +1, ArrowLeft +1, ArrowRight ×25 → **+25** (25L).
- readout click (`25L`, რეალური click) → C, **+1**. readout disabled-ია, focus გადადის Pan slider-ზე (A deviation 8), `hasOwnProperty(track,'pan')` = **false**.
- Ctrl+Z → slider 0 / `C` / disabled / own pan არ არის. Ctrl+Shift+Z → −50 / `50L`.
- music კლიპის არჩევისა და Pan-ის focus-ის შემდეგ Delete და Backspace → clip ცხრილი უცვლელია, past უცვლელია.
- Space focused Pan-ზე → play, მეორე Space → pause.
- Home 15-ზე (paused) → pos 15 რჩება (R24-HC).

**R31-PG** (synthetic pointer-ები):
- **Pan drag-ის დროს მეორე pointer (id 52) კლიპზე +120 px:** კლიპი 7-ზე რჩება. Pan-ის release → 1 ჩანაწერი (−0.6).
  - **კონტროლი:** იგივე synthetic მოძრაობა pan-ის გარეშე კლიპს 7 → 10-ზე გადაიტანს, ანუ harness ვალიდურია. ეს Ctrl+Z-ით დავაბრუნე.
- **Clip drag-ის დროს** (holdClip +60 px): pan-ის pointerdown და `input` −20 → status `რედაქტირება drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი.`, ჩანაწერი არ არის, slider stored −30-ზე რჩება. Keyboard-style input-ზეც იგივე ხდება. Release → მხოლოდ `კლიპის გადატანა` (ის დავაბრუნე).
- **blur mid-drag** (დაკვრისას): ჩანაწერი არ არის; slider და stored −0.6-ზე რჩება; live panner იღებს `setTargetAtTime(-0.6)`-ს.
- **pointercancel mid-drag:** იგივე შედეგი.
- **Space ×2 drag-ის დროს** (რეალური `$B press`, focus slider-ზეა):
  - pause → play;
  - ახალი graph-ის music panner-ის seed = **−0.8** (override; stored −0.6);
  - release → 1 ჩანაწერი, stored −0.8.
- **A deviation 6** (B-მ უნდა მიიღოს, რადგან §2.3 შეიცვალა): მეორე pointer-ით readout-ზე click drag-ის შუაში უარყოფილია, release-ზე კი ზუსტად 1 ჩანაწერია.
  - Info: refusal status release-ის შემდეგაც ჩანს.

**R31-PD:**
- video lane-ში pan ელემენტი 0-ია.
- music fold (რეალური click) → pan ელემენტი არ არის, row 36. unfold → `−30`/`30L`, row 81, ჩანაწერი არ არის.
- SFX folded-ზე 0 ელემენტია; unfolded-ზე reset disabled-ია, title `Pan → C`.

**R31-PC:**
- `aria-label` = `Pan — მუსიკა`; `aria-valuetext` = readout: `25L`, `50R`, `C`.
- „balance“: header DOM-ში 0, Studio source-ში 0.

## 7. R31-PUI, R31-K, R31-R, R31-S, R31-U, Doc

**R31-PUI:**

| viewport | rows | hdr scroll/client | row1 h | Pan | readout | Volume | meter top |
|---|---|---|---|---|---|---|---|
| 1440×900 | 81/81/81/81 | 219/219 ყველგან | 22 (video), 20 | 48 | 28 | 107 | 75 |
| 1280×720 + panel | 53/61/61/61 | 219/219 | 20 | 48 | 28 | 107 | 47 (video) / 55 |

- ორივე viewport ემთხვევა `b-round-30/geo-*.json`-ს.
- საბაზო სახელები ეტევა: ვიდეო 48.4, მუსიკა 53.5, სტემები 61.3, SFX 27.1; box 101 (ვიდეო 50/161).
- music-ის ` · აქტიური` suffix **ellipsized**-ია (scroll 122 > 101) — ეს დაშვებულია; აქტიურობას border და `aria-pressed` აჩვენებს.
- რეალური Tab: fold → name → Pan → **readout** → M → S → Volume. C-ზე readout disabled-ია და Tab-ში არ ჩანს.
- Screenshot-ები: `shots/pui-1440.png`, `pui-1440-1L.png`, `pui-1280-panel.png`.

**R31-K:**
- Volume drag (synthetic) → preview-ების დროს Δ0, release-ზე **+1** `Volume`; pan და Master უცვლელია.
- Clip Gain `6` + Enter → **+1** `Clip Gain`.
- Mute/Solo (რეალური click) მუშაობს.
- fold/unfold მუშაობს. height handle (synthetic) 81 → 111.
- music meter დაკვრისას მოძრაობს (−1.5/−3.6/−5.1/−11.5).
- clip drag მუშაობს (კონტროლი §6).

**R31-R:**
- Sequence: seek 14 → Play 1 s → ruler seek 18 → Volume preview 0.8/0.9 → Mute ×2 → Pause.
- Start-ების რაოდენობა ნაბიჯების მიხედვით:
  - ამ გვერდზე pan reset-ის შემდეგ: **0/1/2/2/2**;
  - fresh reload-ზე pan edit-მდე (იგივე L31, Master −12, solo): **0/1/2/2/2**.
- pan `setTargetAtTime` ორივე run-ში **0**-ია; seed-ები ყველა 0.
- EC = E0, 0 LSB მთელ ფაილზე.

**R31-S:** `gates/snap-*.diff` (snapshot-ები → live):
- `arrangement.ts`: +`pan?` (1 ხაზი).
- `model.ts`: `TRACK_PAN_STEPS`, `normalizeTrackPan`, `trackPanValue`, `setArrangementTrackPan`, `formatTrackPan`. `setTrackMix` უცვლელია.
- `graph.client.ts`: interface-ში `setTrackPan`, `clampPan` (NaN → 0), panner-ების `Map` + `lastPanTargets`, seed, `disconnect`-ში `values()`, `setTrackPan` ramp.
  - ახალი `create*` გამოძახება 0-ია.
  - `renderArrangementWav` **byte-identical**-ია (34 ხაზი, `cmp`).
- `ArrangementContext.tsx`:
  - imports, 5 type member, refs;
  - `startGraph`-ის override და `syncPlayback`-ის pan push;
  - actions, unmount release, value objects.
  - `scheduleKey` უცვლელია.
- `ArrangementLane.tsx`: import, destructure, draft/refs, `useEffect` unmount cleanup (`panDragCleanupRef`, row 1-ის გარეთ, §3.2-ის ფარგლებში), handlers, row 1 JSX. Row 2, meter და height უცვლელია.
- ახალი `//` 0, `any`/`@ts-ignore` 0, hex ფერი 0.

**R31-U:**
- red-first: `a-round-31/red-first.txt` → 26/26 failed. მიზეზები §2-ს ემთხვევა (missing exports ×16, pan slider missing ×8, seed, source-scan, row-1 children).
  - A-ს 5 post-review assertion red-ზე **არასოდეს გაშვებულა**. ესენია: NaN seed, pointerUp id 9, lostPointerCapture after pointerUp, focus after reset, own-gesture refusal. მათი red ცალკე დაუდასტურებელია; dev6/dev7/dev9-ის mutation-ები ქვემოთ მაინც კლავს შესაბამისებს.
- Mutation-ები გავუშვი scratch-ში (`c-round-31/mut/` = `store/app`-ის ასლი + junction). კონფიგში 6 ფაილია: track-pan, graph, model, ArrangementContext, gesture-guard, track-layout. control: **159/159**.

| mutation | როგორ გაკეთდა | შედეგი |
|---|---|---|
| (a) seed ignores pan | `initialPan = 0` | killed (5) |
| (b) syncPlayback no push | მთელი pan loop წაშლილია | killed (1: playing/Undo) |
| (b2) narrow: override branch-ის გარეშე | `trackPanValue(track)` | **survives** → R31-U-GAP-B2 |
| (c) keeps `pan: 0` | `{ ...rest, pan: next }` | killed (2) |
| (d) accepts video | kind check წაშლილია | killed (2) |
| (e) no rounding | `clamp(pan,-1,1)` | killed (4) |
| (f) preview commits per move | preview-ში `applyEdit(...)` | killed (8) |
| (g) blur commits | `cancelTrackPan` → `commitTrackPan` lane blur-ში | killed (1) |
| (h) override ignored on reschedule | startGraph map → `track` | killed (1) |
| (i1) reset enabled at C | `disabled={false}` | killed (2) |
| (i2) reset makes no entry | `setTrackPan(id, storedPan)` | killed (1) |
| (j) no equal-value return | condition წაშლილია | killed (4, incl. "repeated value") |
| (k) lane drops draft | `displayPan = storedPan` | killed (2, incl. "follows the draft live") |
| dev1 / dev6 / dev7 / dev9 | stopPropagation / own-gesture bypass / pointer-id check / NaN clamp | killed (1 / 1 / 1 / 1) |

`restored diff` 0 ხაზი.

**R31-Doc:**
- doc 036-ში TEMPLATE-ის ყველა სექციაა და ის კოდს ემთხვევა: `setArrangementTrackPan`, any-gesture refusal, pointer-id filter, focus, NaN → 0.
- W3C mono/stereo ფორმულები სწორია: pan ≤ 0 → L = inL + cos(xπ/2)·inR, R = sin(xπ/2)·inR. ისინი CZABA-ს ძრავის ქცევადაა აღწერილი.
- R24-HC შენიშვნა არის, Ableton-ის ცხრილი სტატუსებით არის, not-in-round სია არის.

## 8. Deviation-ები და harness-ის შეზღუდვები

- **Synthetic:** range drag-ები, clip/height drag-ები, blur/pointercancel. Synthetic pointer-ებზე `lostpointercapture` არ იწვევა; commit window/element pointerup-ით ხდება.
- **R31-R reference:** pan edit-მდე იგივე გვერდზე run ვერ გავაკეთე (ჯერ export-ები გავაკეთე). ამიტომ reference არის იგივე URL-ის **fresh reload** pan edit-მდე, იგივე L31-ით. Start/tat რაოდენობები იდენტურია; EC = E0 უკვე ამ გვერდზეა გაზომილი.
- Master −12 დაყენებულია ArrowDown ×24-ით (24 ჩანაწერი). music solo რეალური click-ით.
- Channel probe-მა `middle-east.mp3`-ის დამატებითი fetch გამოიწვია (C).
- `node.exe` ყველგან 6–8 იყო: gates — 6; PV/PL — 7; mutation-ები — 8 (თითო `r31u-*.txt`-ში ჩაწერილია). PG, PUI, K და R-ის run-ებში რაოდენობა ცალკე არ ჩამიწერია; ისინი იმავე სესიაში, 6–8-ის ფარგლებში გავიდა.
- **არ გაშვებულა (B-სთვის):** §2.3-ის წესი „`beginTrackPanGesture` ჯერ ინახავს მოლოდინში მყოფ Volume/Master keyboard preview-ს“. ამაზე ტესტი არ არის (A review #6), და ბრაუზერშიც არ შემიმოწმებია. §4-ის ID არ არის, ამიტომ FAIL-ად არ ითვლება.
- Tech Lead-ის მხრიდან რჩება: რეალური მაუსით drag და მოსმენა (R31-T); ასევე რეალურ Chrome-ში blur-ის შემდეგ range-ის `input`-ების გაგრძელება (C-R31-01-ის რეალისტურობა).

## 9. ბაგები და შენიშვნები B-სთვის

**C-R31-01 (Low, ახალი, ამ რაუნდის კოდი):** drag-ის შუაში blur მოხდა, pointer ისევ დაჭერილია და `input`-ები გრძელდება. ამ დროს Pan ყოველ `input`-ზე ცალკე ჩანაწერს წერს (past 72 → 73 → 74, stored −0.9 → −0.96). იგივე sequence Volume-ზე **1** ჩანაწერს იძლევა (pointerup-ზე).
- მიზეზი: `handlePanBlur`-ის შემდეგ `panDragCleanupRef` null-ია, ამიტომ `handlePanChange` keyboard branch-ში გადადის (`setTrackPan`).
- ჩაწერილი R31-PG ნაბიჯი (blur → ჩანაწერის გარეშე revert) PASS-ია; ეს ბაგი მის მიღმაა.
- რეპროდუქცია: `scripts/pg.js` mode `blur-continue`, ხოლო Volume-ზე `vol-blur-continue`.

**C-R31-02 (Medium, უკვე არსებული — A-ს VOLUME-DELETE-KEY):** focused Volume slider-ზე Delete არჩეულ კლიპს შლის. ის Undo-თი აღდგება. ბრაუზერში დავადასტურე (`runs/volume-delete-key.txt`). ეს რაუნდმა არ შეცვალა; შემოთავაზებული fix ეხება `StudioWorkspace`-ის Delete branch-ს (`isSliderTarget`).

**R31-U-GAP-B2 (test gap):** `syncPlayback`-ის non-reschedule push-ში override branch-ის წაშლა არცერთ ტესტს არ აგდებს. A-მ ეს წინასწარ თქვა: drag-ის დროს edit უარყოფილია, ამიტომ ეს branch დამცავია.

**B-ს მისაღები:**
- A deviation 6: `setTrackPan` უარყოფს **ნებისმიერი** gesture-ის დროს. ქცევა §6-ში დადასტურდა.
- Deviation 1, 7, 8, 9 დადასტურდა mutation-ებით ან browser-ით.

**R24-HC:** გაყინული Home ტესტი ახლა **Pan**-ს ამოწმებს. Volume-ზე Home ამ ტესტით აღარ არის დაფარული.

**Info:**
- refusal status commit-ის შემდეგაც ჩანს.
- 50L-ზე track meter-ის over-0 მოსალოდნელია (pre-Master).

## 10. Ableton — ორი ცალკე ვერდიქტი (§4.6)

წყარო: `b-round-29/ableton-mixing-20261012.txt` (Live 12 Reference Manual §18.1). ციტატები ტექსტში ვიპოვე grep-ით: „The Pan control positions…“, „…decreasing the volume of the opposite channel“, „…adjusts the others as well“, „Double-clicking the Pan control resets it…“, „non-neutral audio operation“. Audio Fact Sheet არ არის ჩამოტვირთული.

| ქცევა | CZABA მოთხოვნა | Ableton-თან შესაბამისობა |
|---|---|---|
| თითო ხაზის pan stereo ველში | PASS (PE, PV) | დადასტურებული |
| სრული pan → მოპირდაპირე არხი ჩუმია | PASS (R 0 LSB) | დადასტურებული მიმართულებით; რაოდენობა ექსტრემუმზე დაუდასტურებელია |
| pan law (შორეული არხი ახლოს ერთვება) | PASS (W3C, ≤1.41 LSB) | დაუდასტურებელი (Fact Sheet არ არის); CZABA-ს ძრავის არჩევანია |
| ნაგულისხმევზე დაბრუნება | PASS (readout click) | შეგნებული განსხვავება (double-click ეტაპ 4b-შია) |
| multi-track linked pan | არ ეხება ამ რაუნდს | შეგნებული განსხვავება |
| Split Stereo Pan Mode | არ ეხება | შეგნებული განსხვავება |
| ვიდეოხაზს pan არ აქვს | PASS (PD) | შეგნებული განსხვავება |
| `C`/`50L`/`50R`, ±50 | PASS (PC) | დაუდასტურებელი |

## 11. Carried (უცვლელი)

- **ღია C ბაგები:**
  - C-R27-01, C-R23-01 — Medium, Tech Lead;
  - C-R23-01 record: 63 520 bytes, **2 NUL** offset-ებზე 28013/28014 (round 30-თან ერთნაირი offset-ები);
  - C-R6-02, C-R8-01;
  - C-R30-01 — Low → polish round.
- **Low:** R26-M1, MASTER-HOLD-TICK-EDGE, A-R29-REVIEW-1, FADER-KEY-ENTRIES, R9-REVIEWER-M1-L8, DEMO-SFX-FULL-SCALE, L3, LIB-SEP-REASON, R27-T, DOC034-UNREACHABLE-NOTE, DOC035-NOTES.
- **Root** (`root-pre-push-review.md`, `publication-checkpoint.json`):
  - purchased loader hardcodes middle-east (SRW-21);
  - Lenis on `/studio/*`;
  - portable instruction paths;
  - export hard-clip at 0 dBFS;
  - second remote reconcile (no force);
  - CRLF Biome errors (auth files);
  - `frontend-architect.md` Write/Bash;
  - `Modal.tsx` focus gap;
  - GA `scroll` with consent denied;
  - fake Bearer → 500;
  - CDP allowlist;
  - `Content-Type` without charset;
  - dev server availability.
- **Tech Lead:** R31-T (რეალური Chrome, ყურსასმენები: drag-ის სიგლუვე, 50L მხოლოდ მარცხნივ, C ცენტრში, რეალური მაუსის drag), TL-Q-FB05-FB11.

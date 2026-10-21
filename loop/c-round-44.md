# C — Round 44 verification (SRW-13 stage 4c; D-29z9)

Verifier: C (Claude Opus 5.5) · 2026-10-15 12:38–12:57 · read-only for app source · no commit/push/deploy.
Artifacts: `c-round-44/` (`gates/`, `runs/`, `shots/`, `mut/`, `scripts/`, `checkpoint.md`), `c-round-44.json`.

**Verdict: PASS** on every contracted ID that C ran. No product bug was found. There are two harness notes for B (§8). Both are invalid first attempts that were replaced within budget; neither is a product defect.

## 1. Gates

| ID | Result | Evidence |
|---|---|---|
| **G44-2 start** | PASS | `gates/g44-2-start.txt` (12:38, node.exe 20): HEAD `2c0f800`; `git status` = exactly the 3 paths of §3.2; 391 OK / 0 non-OK; protected 4/4 OK; `/studio-lab` 200. Shas: context `623f381e` (= A), test `63b5dbe5` (= A), doc 041 `5dadac1f` (= A), snapshot `91fa12d6`. |
| **G44-1** | PASS | `gates/g44-1-log.txt`. tsc exit 0. Frozen §4.7 suites: **15 files / 287** (`vitest-frozen.txt`). Full vitest: **77 files / 1351** = 1341 + 10 new `it`s, 0 failures, node.exe 20–21, no timeouts (`vitest-full.txt`). `npm run build` exit 0. `npm run verify` exit 0 (77/1351, both builds). Biome `./app`: **2 errors** (`biome-errors.txt`: only `app/lib/auth.ts` and `auth-bugs.test.ts` `format`, the baseline CRLF errors), **218 warnings**, **1 info**. No line mentions the owned files. The targeted Biome run on `ArrangementContext.tsx` + `context-hygiene.test.tsx` exits 0. |
| **G44-2 end** | PASS | `gates/g44-2-end.txt` (12:55, node.exe 22): same HEAD, same 3 paths and shas, 391 OK, protected 4/4. Ignored: `.claude/settings.local.json`, `.env`, `.gstack/`, `.husky/_/`, `.kilo/`, `build/`, `node_modules/`, `nul`, `playwright-report/`, `test-results/`. `nul` is a 0-byte file dated 2026-02-08, so it predates this round. The rest are tool output. All are foreign and untouched. |
| **G44-3** | PASS | `runs/g44-3.txt`, `runs/anon-*.json`, `runs/network-anon-*.txt`, `shots/anon-*.png`. A fresh anonymous daemon was used: its own state `c-round-44/anon/c-browse-anon.json`, `cookies []`, no `$B restart`. **Direct and header-link `/studio-lab`:** workspace open, `auth_user` null, cookie empty, badge "დემო კოლექცია — ავტორიზაცია არ სჭირდება". **Network** (direct load; a session with a REAL `＋ დამატება` click and REAL Space ×2; header link): **0** requests to `studio-token`, `recording-`, `/api/download` or R2. Media is only `middle-east.mp3` and `hero-music.mp3`. The fetch/XHR hook saw **0** Authorization headers. Other hosts are the known `localhost:5199/api/cart`, GA (consent denied, `gcs=G100`, `pscdl=denied`), GTM and Google Fonts. **curl:** anonymous token request → **401** "Please sign in to access Studio."; fake Bearer → **500** "Unable to prepare Studio access" with no token (known root item). `/studio/middle-east` → "Sign in required", no workspace. **Premium auth is not bypassed.** |

## 2. R44-S — static (PASS)

`gates/r44-s.diff` (`diff -u` snapshot → working copy) contains only these hunks:
- **§0.1:**
  - `transportRunningRef` is removed;
  - `markTransportRunning` is removed;
  - its 3 calls are removed (`stopPlayback`, the pump guard, `togglePlayback` / play);
  - the 3 dependency entries are removed (`stopPlayback`, `pumpPlaybackAudio`, `play`);
  - the now-unused `const ctx` in the pump is removed.
- **The pump order is unchanged:** `isPlayingRef` return → `fillLoopIterations()` → `resyncLoopRef.current()` → `releaseRetiredGraphs(false)`.
- **§0.2:** the L8 text is the only change on that line.
- **§0.3 placement (l.2056–2080):** the refusal check → the `flushPendingMaster()` block (unchanged) → `const current` → **new:** missing-track return, then `next = setTrackMix(…)` (moved up, as A reported), then the identity return comparing the model-clamped volume with `stored.volume` → `volumeBeforeRef` (only if unset) → `updateHistory` → `syncPlayback`. That is the contracted order.

Other static checks:
- `grep -rn "transportRunning\|markTransportRunning" app/` → **0**.
- 391 OK.
- `gates/r44-s-static.txt` and greps on the new test and on the added diff lines found no `any`, `@ts-ignore`, `as` cast, `//` comment, hex/rgb colour or `export`. Both files are LF.

**Was the latch really dead? C checked beyond the grep**, using `git show` at `c5ed47b` = `08b9e53^`:
- `isTransportRunning` was in the type (l.182), the state (l.315), the value (l.1930) and the deps (l.2006). The ref was a change-dedupe for `setIsTransportRunning`.
- `git grep isTransportRunning c5ed47b -- app` finds no reader outside the context.
- At `08b9e53` the state is gone. The ref's only reader is its own guard (l.805), which can only call `markTransportRunning(true)`, which only writes the ref.

So the round-9 "works as a latch" remark is consistent: the latch flipped correctly, but nothing downstream used it. Doc 041's line references (l.182/1930/2006) match.

## 3. R44-U — unit tests and mutations (PASS)

Scratch: `c-round-44/mut/scratch`, a copy of `store/app` outside `store/`, with C's own `mut/mutate.cjs` and `mut/run-mut.sh` (A's script was not used). `node_modules` was a directory junction, not an install. It was removed with `cmd /c rmdir`; `store/node_modules` is intact (618 entries). Suites per run: `context-hygiene`, `render-budget`, `master-ui`, `pending-status`, `clip-gain`, `fader-click`. Output: `mut/summary.txt`, `mut/run-*.txt`.

| # | Mutation | Expected catcher | Result |
|---|---|---|---|
| control | none (`623f381e`) | — | 6 files / **111 green** |
| (a) | snapshot `ArrangementContext.tsx` (`91fa12d6`) | PV1–PV4, L8a | **5 red: PV1, PV2, PV3, PV4, L8a** (`expected 1 to be +0`; L8a `'useArrangementPosition must be used w…'`). **PV4 fails at l.403, the `ArrangementProvider` render pin**, as A reported (the consumer pin at l.404 alone would not catch it). The other 106 are green. This matches A's red run. |
| (b) | identity check moved before `flushPendingMaster()` | PV7 | **PV7 red** (`expected null to be 'Master Volume'`) |
| (c) | compare the raw argument (`volume === stored.volume`) | PV2 | **PV2 red** (`expected 1 to be +0`) |
| (d) | L8 text reverted | L8a | **L8a red** |
| (e) | also return when a preview is pending and the new value equals the `volumeBeforeRef` volume | PV8 | **PV8 red** (`expected 0.72 to be 1`); the frozen `fader-click` F3 is also red |
| (f) | no missing-track return (`stored && …` compare) | PV3 | **PV3 red** |
| (g, C extra) | identity check deleted | PV1/PV2/PV4 | PV1, PV2, PV4 red |
| (h, C extra) | `volumeBeforeRef` always overwritten (the pending `before` is lost) | PV6/PV8 | PV8 red (`expected 'Volume' to be null`); F3 is also red |

No mutation survived. A's red/green claims are reproduced: the snapshot gives PV1–PV4 and L8a red, and the rest are green.

## 4. R44-TR — transport after the latch removal (PASS)

**Setup:**
- 1440×900, fresh load, layout L44: video at 0 (6.008 s), `სრული მიქსი` on music at 7 (16 s, project end 23 s), `Soft impact` on SFX at 4; Master 0 dB.
- Built by `c-round-44/fresh44.sh`, which reuses the round-43 setup chain with C's own state file.

**Sampling:**
- A read-only in-page sampler (`scripts/samp.js`, `setInterval` 50 ms) records `performance.now()`, position (`window.__c` reader), the playing flag, `data-level-db` of the Master, music and SFX meters, and the position text.
- It also hooks `console.error` and `window.onerror`.
- Delays are bash `sleep`, not `$B wait`.

| ID | Steps (labels) | Observed | Result |
|---|---|---|---|
| **TR-PLAY** | `.blur()` (SYNTHETIC) → REAL Space → 3 s → REAL Space → 1.5 s → REAL Space → 2 s → REAL Space (`runs/tr-play-1440.txt`/`.json`) | Play: 0 → 3.201 (73 samples), Master max −5.9 dB. Stop: **3.201 held** for 44 samples, Master `-inf`. Resume: the first sample is **3.201** (Δ 0.000), advancing to 5.689, max +3.4 (video audio plus the SFX hit, as in round 43). Stop: 5.721 held, `-inf`. No console errors. | PASS |
| **TR-END** | REAL click on the ruler at 22 s (see the note below) → `.blur()` → REAL Space → 2.5 s → REAL Space → 1.2 s → REAL Space (`runs/tr-end-1440.*`) | Expected (written before the run): derived from code (`tick` l.847–853: stop at `end`, position clamped to `stopAt`, meters floored by `stopPlayback`; `play` l.1019 restarts from 0 at the end). No separate round-26 end-behaviour text was found. Observed: 22.07 → 22.979 while playing, then it stops at **23.000** (= project end, the clamped `stopAt`), `playing` false, all three meters `-inf`. The next REAL Space starts at **0.000** and plays to 1.83. No errors. | PASS |
| **TR-LOOP** | SYNTHETIC drag (pointerId 41) on the music clip body from 8 to 10 s → range `{8,10,music}` → REAL click on `↻ Loop` (title "Loop მონიშნულ მონაკვეთზე (Ctrl/Cmd+L)") → `aria-pressed=true`, loop `{8,10,enabled}`, entry `Loop შეიქმნა` → REAL Space → `sleep 7` → REAL Space (`runs/tr-loop-1440.*`, run 2) | The observed playback was **10.4 s** (sampler 1104 → 11507 ms; CLI latency under load, node.exe 29). Start 8.049. **5 wraps** at 3111, 5107, 7105, 9084 and 11102 ms (9.999 → 8.05 each, one 9.901 → 8.031). In the 300 ms after **each** wrap the Master level stays −7.3 … −10.6 dB, never the floor. 0 floor samples while playing. Range 8.031–9.999. No errors. | PASS |
| **TR-SEEK** | Loop off (REAL click `↻ Loop` → `aria-pressed=false`) → REAL Home → `.blur()` → REAL Space → 1.5 s → REAL click on the ruler at 10.5 s → 2 s → REAL Space (`runs/tr-seek-1440.*`) | Position jumps from **2.579 to 10.500** while playing and continues to 13.701. Master stays above the floor (0 floor samples after the seek). No errors. | PASS |
| **TR-PREVIEW** | REAL Home → REAL click on the preview toggle (`Soft impact` selected) → `.blur()` → REAL Space → 1.5 s → REAL Space (`runs/tr-preview-1440.*`, run 2) | At 415 ms the toggle is `■ შეჩერება` (preview playing). In the **same 50 ms sample** where `playing` turns 1 (1116 ms, pos 0.03, Master −6.0), the toggle goes back to `▶ მოუსმინე`. The preview stopped about 0.7 s into a 2 s preview, and arrangement playback started. No errors. | PASS |

**Ruler clicks (method label):**
- `$B click` only clicks the centre of an element. So C put a 2 px `position:fixed` span inside `[data-testid=arrangement-ruler]` at the target x (`rmark` in `lib44.sh`).
- `elementFromPoint` confirmed that the span was hit, then C REAL-clicked it. The real mouse event bubbles to the ruler's handler with the real `clientX`. The span was removed right after.
- At 8.2 s the span was under the loop brace (`hitIsMarker:false`) and the click did not happen; see §8.

## 5. R44-REG — regression (PASS)

`runs/reg-vol-1440.txt`, `runs/reg-vol-play-1440.txt`, `runs/reg-mute-del-1440.txt`; 1440×900.

| ID | Steps | Observed | Result |
|---|---|---|---|
| **REG-VOL-DBL** | SYNTHETIC `dblclick` on music Volume at 100 % → SYNTHETIC drag 41 (−10, −30 px) → SYNTHETIC `dblclick` → REAL Ctrl+Z | `dblclick` at 1: value 1, `past` 9 → 9 (**0 entries**), status unchanged (the loop status of that moment, the same before and after). Drag → **0.72**, `past` +1 (`Volume`). `dblclick` → 1, `past` +1 (`Volume`). REAL Ctrl+Z → **0.72**. The first attempt (−5, −20 px) reached 0.81 with the same 0 / 1 / 1 / undo pattern. | PASS |
| **REG-VOL-PLAY** | REAL ruler click at 7.5 → play; control run without the double-click, then a test run with a SYNTHETIC `dblclick` at pos 9.55 | At the `dblclick`: `past` 9 → 9 (**0 entries**), value 1, the AudioBufferSource start counter **36 → 36** (no graph restart). The music meter never floors. Test vs control music-meter difference by 0.1 s position bin: in the 500 ms after the `dblclick`, median 0.4 / max 1.5 dB. Before it, median 0.5 / max 6.8. Later, median 0.5 / max 8.3. So there is no change beyond the sampling-phase noise. | PASS |
| **REG-VOL-KEY** | REAL click music Volume → REAL ArrowLeft → REAL ArrowRight | 1 → 0.99 → 1, **one `Volume` entry per key** (FADER-KEY-ENTRIES) | PASS |
| **REG-MUTE** | During playback from 7.5: REAL click music Mute → 1.2 s → REAL click Mute | 1st click: `aria-pressed=true`, **1 entry `Mute — მუსიკა`**. The music meter then falls at exactly **20 dB/s** (−13.0 at 2570 ms to −59.9 at 4914 ms = `METER_RELEASE_DB_PER_SECOND`) and reaches `-inf`. Pure release means no signal after the mute. 2nd click: `aria-pressed=false`, one more `Mute — მუსიკა`, level back to −6.2 dB. | PASS |
| **REG-MASTER** | SYNTHETIC `dblclick` on Master at 0 dB → REAL click Master → REAL ArrowLeft/ArrowRight | `dblclick`: **0 entries**. Keys: −0.5 → 0, **one `Master Volume` entry each** | PASS |
| **REG-DEL** | SFX clip selected (REAL header click) → REAL click music Volume → REAL Delete, REAL Backspace → REAL click on the empty stems lane → REAL click on the SFX header → REAL Delete | With focus on Volume, Delete and Backspace **keep** the clip, `past` 11 → 11 (C-R31-02). After the lane and header clicks, Delete removes the clip with **1 entry** `კლიპის წაშლა`, status "კლიპი წაიშალა; სიცარიელე დარჩა." | PASS |

Console errors across all workspace runs: **0** (`window.__cerr` empty in every run).

## 6. R44-Doc (PASS)

Doc 041 exists, is in Georgian (technical terms in English) and follows `TEMPLATE.md`:
- the header: date, status `Round 44 — D-29z9; C-ის შემოწმებას ელოდება`, project;
- the sections კონტექსტი, მიდგომა, არქიტექტურა (Mermaid), შეცვლილი ფაილები, პრობლემები და გადაწყვეტები, ტესტირება, the Ableton table and TODO.

It matches the code:
- removal, not rename;
- the L8 text;
- the identity check after the flush, using the `setTrackMix` clamp, compared with `present`, not `volumeBeforeRef`;
- `model.ts` unchanged.

The round-9 reconciliation is correct and its line references check out (§2).

## 7. Ableton two-verdict table (§4.8)

| Behaviour | CZABA requirement | Ableton conformity |
|---|---|---|
| A transport-internal flag that nothing reads is removed | **Met** (R44-S, R44-TR) | **Not applicable**: CZABA scheduler internals; no Ableton source was used or claimed |
| The position-store hook error names the right hook | **Met** (L8a, mutation (d)) | **Not applicable**: developer error text |
| A Volume double-click at the default writes nothing and does no work | **Met** (PV1–PV4, mutations (a)–(c), (f), (g); REG-VOL-DBL / REG-VOL-PLAY) | **Not applicable**: CZABA render budget. The 0-entry behaviour is unchanged since round 38 |

C makes no claim that "Ableton does it this way" for any row.

## 8. Findings for B

- **No product bug.** The bugs list is empty.
- **Harness notes. These are invalid first attempts, replaced within budget; not product defects:**
  - **TR-LOOP attempt 1** (`runs/tr-loop-1440-attempt1-start-outside.*`) started at 1.9 s, before the loop. It played 1.9 → 9.999 (Loop on; no wrap occurred within the window) and was stopped just before the first wrap.
    - Run 2 started inside the loop. It began at 8.049 because the stop at the end of attempt 1 came right after a wrap. C's intended REAL ruler click at 8.2 s did **not** happen: the 2 px span was under the loop brace (`hitIsMarker:false`; `$B` reported "not interactable").
    - Suggestion for future loop tasks: put the playhead inside the loop explicitly (ruler click outside the brace strip, or Home + keys).
  - **TR-PREVIEW attempt 1** (`runs/tr-preview-1440-attempt1-preview-ended.txt`): the 2 s `Soft impact` preview finished on its own before the CLI round-trips reached Space. Run 2 used an in-page sampler and pressed Space 0.7 s into the preview.
  - **A's `$B wait` warning:** C used bash `sleep` and in-page `performance.now()` timestamps throughout. The CLI daemon (PID 32816, state `c-round-44/c-browse.json`) **stayed up** all run, so the self-launched fallback was not needed.
- **A-local items (from A; not re-tested beyond the above):**
  - setTrackMix-NaN / identity: Low, pre-existing, `model.ts` frozen. C agrees it cannot come from a range input.
  - the PV4 deviation: accepted; C confirmed that the provider pin is the catcher.
- **ROOT-ROUND43-CHECKPOINT-RECORD:** `publication-checkpoint.json` now has `round43Checkpoint` (`2c0f800…`, both remotes, 76/1341, `release:false`). B can close it.
- **Round 44 is checkpoint-ready from C's side** (the 3 paths of §3.2; root decides).

## 9. Carried (not re-run this round; not PASS)

- **Not re-run (per §4.6):** exports and WAV integrity; video sync and C-R27-01; the full find sound → add → fit video → export flow; the FB-01..FB-16 stage regression; the detail-panel geometry. 1280×720 was not contracted this round and was not run.
- **Open C bugs:**
  - C-R41-01 (Low, 1024×768, TL-Q-VIEWPORT);
  - C-R27-01, C-R6-02, C-R8-01 (Tech Lead quiet Chrome);
  - C-R23-01 + C-R38-01 (Tech Lead). **Record** (`runs/c-r23-01-record.txt`): `curl /studio-lab` = **64 312 bytes, 3 NUL at 11729, 28025, 28026**; **1** hydrated U+FFFD `aria-label` (`ბიბ�ლიოთეკის დაკეცვა`). Unchanged from rounds 42 and 43.
- **Accepted (B):** FADER-KEY-ENTRIES (re-observed on Volume and Master); A-R29-REVIEW-1; A-R43-EXACT-5DB; A-R43-REVIEW-W66 (watch: Master meter width); A-R43-REVIEW-ROOTFONT. **To the Tech Lead:** A-R33-REVIEW-TOUCH (with R38-T).
- **Open Low items:**
  - R26-M1;
  - round 45: SSR-LAYOUT-EFFECT-WARN, EXPORT-DIALOG-FOCUS-RESTORE, LIB-SEP-REASON, the DOC034/035/036/015 notes;
  - A-R34-REVIEW-RESIDUALS, DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS;
  - DETAIL-RESET-SHRINK (info); ESC-DESELECT-NOTE;
  - new from A: setTrackMix-NaN / identity.
- **Root items:** `root-pre-push-review.md` (M1–M3, L1–L4, L6–L8 closed, L5 accepted, nothing else open), plus:
  - GSTACK-ACL; the ignored `.kilo/`; e2e smoke (root only); SRW-21 (the purchased loader hardcodes middle-east); Lenis on `/studio/*`; portable instruction-file paths;
  - the export hard-clip at 0 dBFS; the CRLF Biome errors on the auth files; the `frontend-architect.md` grant; the `Modal.tsx` focus gap;
  - GA `scroll` with consent denied (re-seen: `en=scroll` with `pscdl=denied`); fake Bearer → 500 (re-seen); the CDP allowlist; `Content-Type` without a charset;
  - dev-server availability (200 throughout); ENV-BROWSE-DAEMON (not reproduced this round); machine load (node.exe 20–29).
- **Tech Lead manual checks:** R23-1, R23-2, R38-T (+ A-R38/A-R33-REVIEW-TOUCH), R35-T, R30-T, R31-T, R33-T, R34-T, TL-Q-FB05-FB11, TL-Q-VIEWPORT.

## 10. Environment record

- node.exe: 20–29 during the run.
- Dev server `/studio-lab` 200 throughout.
- Browsers: CLI daemon PID 32816 (state `c-round-44/c-browse.json`) and a separate anonymous CLI daemon (state `c-round-44/anon/c-browse-anon.json`). Both were left running; the idle timeout is 30 min.
- No `$B restart`. No foreign process was touched. No app source was edited.
- Browser side effects were limited to the demo page's local state.

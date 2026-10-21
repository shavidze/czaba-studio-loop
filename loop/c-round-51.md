# C — Round 51 verification: SRW-14 stage 3b (FB-13), D-29z16 — library drop and loop brace follow the grid

Verifier: C (independent) · 2026-10-17, 13:36 → 14:14 +04 · Task: `current-task.md` (Round 51)

**Where the evidence is:**
- `c-round-51/gates/`, `c-round-51/runs/`, `c-round-51/shots/`;
- tools: `c-round-51/tools/` and `c-round-51/*.sh`;
- checkpoint: `c-round-51/checkpoint.md`.

I re-ran every check myself and did not rely on A's numbers. I made no app edits, commits, installs or deploys, and did not start or stop the dev server.

**taskStatus: PASS for the round-51 change.** Every round-51 acceptance ID I ran passed, with one exception: **LD-BLOCK** passed only in part. Its status line never appears in a real browser. That is an older defect, not a round-51 regression (§6.1, **C-R51-01**, Low).

I also record one more older Low (**C-R51-02**, brace focus) and one Low test gap (**C-R51-T1**, my mutation (n) survives). None of the three is caused by the round-51 diff, and none blocks it.

## 0. Environment and method

**HEAD and server**
- HEAD was `038ed5a45f94596a264c14c4ec834607cb407948` at the start and at the end. Baseline case **(A)**.
- `/studio-lab` returned 200 throughout.
- node.exe went 33 → 41 → 33. Each run file records its count.

**REAL (gstack)**
- Wrapper `c-round-51/b.sh` with the new state file `c-round-51/c-browse.json`; separate anonymous state `c-round-51/anon/c-browse.json`.
- The CLI daemon started normally, so the fallback was not needed. I never ran `$B restart`.
- `$B stop` printed "Unable to connect" for both. Afterwards both state files were gone, and node.exe was back at 33.

**REAL-mouse (PW)**
- Standalone Playwright (`store/node_modules/playwright`, installed chromium, fresh context with no credentials), driven with `page.mouse` and `page.keyboard`. Tools: `tools/r51.cjs` and `tools/pwlib.cjs`.
- This is the pending deviation **GSTACK-NO-MOUSE**. These runs are never called gstack.

**PW and native HTML5 drag**
- In this Chromium, the PW mouse **does deliver native HTML5 `dragstart`/`dragover`/`drop`/`dragend`**. A read-only capture listener (`window.__cd`) recorded them: for example 1 / 8 / 1 / 1 for LD-1.
- **`altKey` reaches `dragover` and `drop`** when Alt is held with `keyboard.down('Alt')`: `altOver:[true]` and `drop.alt:true` in LD-ALT and LD-ALT-ON.
- This is still CDP-synthesised input, not an OS drag. **R51-ALT-NATIVE-DRAG** stays with the Tech Lead (Windows Chrome).

**Setup (SYNTHETIC)**
- Layout L51 = L50 (video 0–6.008, `სრული მიქსი` on music 7–23, `Soft impact` on SFX 4–6, 40 px/s), built by the round 31–34 setup chain.
- `window.__c` is used for reads only. The `h30` hook (a read-only wrapper on `AudioBufferSourceNode.start`) records the real source starts.

**The LF fixture**
- **PW:** a body drag on the music clip from 11.3 to 14.1 with Snap off, then PW Ctrl+L → `Loop 00:11.300 — 00:14.100`, status `Loop შეიქმნა და ჩაირთო: 00:11.300 — 00:14.100.`.
- **gstack key runs:** the range comes from the SYNTHETIC `__c.rangeOn` (gstack has no drag). Ctrl+L, the brace click and every key are **REAL**.

## 1. G51-2 — tree integrity: **PASS**

- `git status --short` matches §3.1 case (A) exactly, at the start and at the end: the 7 round-50 paths plus `ArrangementLane.tsx`, `ArrangementLoopBrace.tsx`, the new test and doc 047. Evidence: `gates/g51-2-start.txt`, `gates/g51-2-end.txt`.
- Frozen list: **405 OK / 0 non-OK**, at the start and at the end.
- Snapshot `SHA256SUMS.txt`: 3/3 OK.
- Protected files: 4/4 OK.
- `store/node_modules`: 618 entries, intact.
- Round 50 was **not** committed during this round: HEAD did not change.

## 2. R51-S — static: **PASS**

The diff is in `gates/snap-diff.txt` (`diff -u --strip-trailing-cr` against `b-round-50-r51-snapshots/`). `git diff` agrees: for Lane and Brace, `HEAD` equals the snapshot byte for byte, and `git diff --stat` shows +49 / −11, the same hunks.

- **`ArrangementLane.tsx`:** only two changes. The `grid` import gains `resolveGridTime`. `libraryDropStart` wraps the unchanged `libraryDropTime({...})` in `resolveGridTime(…, snapSeconds, gridSeconds, event.altKey)`. The ghost and the drop both call `libraryDropStart`, so the ghost equals the drop by construction. The file-drop path has no hunk.
- **`ArrangementLoopBrace.tsx`:**
  - the import (`adjacentGridLine`, `resolveGridTime`);
  - the 2 optional props, with defaults `snapSeconds = null` and `gridSeconds` (the parameter list is wrapped; the export itself is not new);
  - the move/resize sample: snap first, then `moveLoop`/`resizeLoop` clamp;
  - the key handler. Snap off or no loop → the unchanged ±0.1 path. Snap on → `adjacentGridLine`. A `null` target → `stepLoopRange(kind, -0.1)`, which gives the existing blocked status.

  `beginLoopGesture`, `finishLoopGesture`, `endStaleLoopGesture` and the JSX have no hunk.
- **`StudioWorkspace.tsx`:** only the brace JSX (1 line → 6), passing `snapSeconds={snapEnabled ? gridSeconds : null}` and `gridSeconds={gridSeconds}`.
- **Line endings** (counted with node, `gates/eol.txt`):
  - LF, 0 CRLF: Lane 927, Brace 260, the new test 681, doc 047 131;
  - `StudioWorkspace.tsx`: CRLF **1673/1673**.

  There is no EOL churn.
- **Banned content.** I grepped the added lines and the new test for `any`, `@ts-ignore`, `as` assertions, `//` comments, hex/rgb colours, fake timers, snapshots and new exports. **0 hits.** The only `export` line is the existing `ArrangementLoopBrace`, re-wrapped. The new test has 23 `it`: SD1–7, SL1–9 and SK1–7.
- **Doc 047:** it has every TEMPLATE section (კონტექსტი, მიდგომა with Q1–Q6, არქიტექტურა with one Mermaid diagram, შეცვლილი ფაილები, პრობლემები და გადაწყვეტები, ტესტირება with the REAL-mouse (PW) / CDP method note) and a TODO naming stage 4, A-R50-REVIEW-CLIP-CANCEL-SEEK, stage 5, R50-T, R51-T and ABLETON-LOOP-KEYS-NOT-REQUESTED. It also has the TEMPLATE header, status `Round 51 — D-29z16; C-ის შემოწმებას ელოდება`, and the §4.9 table with honest verdicts. Both of B's "does not say" rows are **დაუდასტურებელი**. Shift for the end is a **შეგნებული განსხვავება**. "New track below" is **არ ეხება**. I checked that each quoted 6.6/4.10 sentence appears in B's capture files (`b-round-46/ableton-arrangement-view-20261016.txt`, `b-round-50/ableton-browser-20261017.txt`): 1 hit each.

## 3. R51-U — unit tests and mutations: **PASS** (with test gap C-R51-T1)

**Red run reproduced** (`runs/red-run-c.txt`; the 3 snapshot sources plus the final 23-case test, in a scratch copy outside `store/`):
- **16 failed / 7 passed.** Green: SD1, SD3, SL1, SL3, SL7, SK1, SK4.
- This equals A's red run v2. The two differences from §2.2 are explained by A's review strengthening:
  - SK7 is red on the snapshot, because it now asserts 13–14.8 and the snapshot gives 12.4;
  - SL9 is new.
- SL7 is green on the snapshot because `moveLoop` clamps −0.45 to 0 anyway. This confirms A's statement that SL7 cannot tell snapping from clamping.

**Mutations** (`runs/mutations.txt`, runner `tools/run-mut.sh`; I wrote my own mutation strings and did not reuse A's):
- Scratch: `c-round-51/scratch/mut/`, with a `node_modules` junction. I removed the junction with `cmd /c rmdir`.
- Unmutated base: **23/23**.

| # | Mutation (C's own implementation) | Failed tests | Verdict |
|---|---|---|---|
| (a) | the drop uses the raw time; the ghost stays snapped | SD2, SD4, SD5, SD6 | killed |
| (b) | the ghost uses the raw time; the drop stays snapped | SD2, SD4, SD6, SD7 | killed |
| (c) | the drop ignores Alt (drop only) | SD3, SD4, SD6 | killed |
| (d) | the drop takes Alt from the last `dragover` (stored) | SD5 | killed |
| (e) | a brace move snaps the end | SL2, SL4 | killed |
| (f) | the brace drag is unsnapped (both sites) | SL2, SL4, SL5, SL6, SL8, SL9 | killed |
| (g) | the brace drag ignores Alt | SL3, SL4 | killed |
| (h) | resize snaps after `resizeLoop` (no re-clamp) | SL6 | killed |
| (i) | the keys stay ±0.1 with Snap on | SK2, SK3, SK5, SK6, SK7 | killed |
| (j) | the keys step ± `snapSeconds` | SK2, SK3, SK6, SK7 | killed |
| (k) | the brace gets `snapSeconds={gridSeconds}` regardless of Snap | SL1, SL4, SK1 | killed |
| (l) | `target === null` → return | SK4 | killed |
| (m) | the keys snap with Snap off, using `gridSeconds` | SK1 | killed |
| (x1) | the start-edge resize is unsnapped | SL9 | killed |
| **(n)** C | `finishLoopGesture` re-runs the move sample on `pointerup` (release `clientX` and Alt) before committing | — | **SURVIVED** → C-R51-T1 |
| **(o)** C | the ghost `left` uses the raw time while its text stays snapped | SD2, SD4, SD6, SD7 | killed |

- **(n) survived.** No committed test releases the pointer at a different x, or with a different Alt, than the last move. Per §4.2 this is a **test gap (Low)**, not a product bug.
- **Why the product is still correct:** R51-S. `finishLoopGesture` is byte-identical to the snapshot and commits the last preview (`commitLoopRange(gesture.before)`); it never re-reads `pointerup`.
- My browser runs are *consistent with* this but **do not discriminate**. In LB-ALT and LP-LOOP-ALT, Alt was released after `pointerup`, and in every LB case the release x equals the last move x. The (n)-mutated code would have committed the same values.
- **Suggested test (for B):** after a snapped move, fire `pointerUp` at a different `clientX`, or with `altKey: true`. The committed loop must equal the last preview.

## 4. G51-1 — gates: **PASS** (one load-induced timeout, re-run)

| Gate | Result | Evidence |
|---|---|---|
| `npm run verify`, run 1 (13:44–13:48) | **exit 1**: 1 failed / 1460, `grid-snap-ui` **GS14** timed out at 5000 ms. My own Playwright probe was running at the same time (machine load; total test time 281 s). | `gates/verify-run1-loaded.txt` l.1388–1403 |
| `grid-snap-ui` alone (13:50) | **20/20**, GS14 683 ms | `gates/grid-snap-ui-rerun.txt` |
| `npm run verify`, run 2 (quiet, 14:08–14:13) | **exit 0**; vitest **85 files / 1461 passed** (= 1438 + 23), 0 failed; both builds ✓ | `gates/verify.txt` l.1379–1380, l.1519, l.1528–1529 (node 33 at the start and at the end) |
| tsc | exit 0 | `gates/tsc.txt` |
| Biome `./app` (read-only) | **5 errors**. All are `format` errors on the baseline CRLF list: StudioWorkspace, auth-bugs.test, grid.test, render-budget.test, auth.ts. Warnings and info as in `gates/biome-app.txt`. | `gates/biome-app.txt`, `gates/biome-app-errors.txt` |
| Biome on the new test, Lane and Brace | 0 diagnostics | `gates/biome-owned.txt` |
| `biome lint StudioWorkspace.tsx` | 0 | `gates/biome-lint-ws.txt` |
| `biome format` on an LF copy of StudioWorkspace | **No changes** (the error is EOL only). My first attempt passed the scratch path to Biome, which ignored it because it is outside the Biome root, so that `cmp` proved nothing. I re-ran it as `biome format --stdin-file-path=app/components/arrangement/StudioWorkspace.tsx` on the LF copy: exit 0, 1673 lines out, byte-identical to the input. A's "no changes" claim is therefore confirmed, though A may have hit the same ignored-path trap. | `gates/biome-ws-format.txt` (last line), `gates/biome-ws-format-stdin.err` |

- **Frozen suites (§4.8):** all 18 are part of the 85-file run, which had 0 failures.
- **C-R48-01:** no recurrence; render-budget was green in both runs.
- The GS14 timeout is a **different test**, under load that I caused myself. It does not recur alone or in the quiet full run. I record it as load-induced, not as a new bug.

## 5. G51-3 — anonymous workspace and purchase protection: **PASS**

gstack, new anonymous state, 1440×900 (`runs/g51-3.txt`, `runs/anon-*.json`):
- **`/studio-lab` direct:**
  - the workspace is shown;
  - `auth_user=null`, the cookie is empty, and the only localStorage key is `czaba_session_id`;
  - the badge reads `დემო კოლექცია — ავტორიზაცია არ სჭირდება`.
- **REAL `＋ დამატება`:** status `„Middle East — საჯარო preview“ დაემატა მუსიკა ხაზზე 00:00.000-ზე.` The auth hook recorded `[]`.
- **Header link `Studio LabDemo`** → `/studio-lab`, workspace shown, auth null.
- **`/studio/middle-east`** → "Sign in required", with no workspace.
- **Network** (direct, session and header) has **bad = 0**.
  - Hosts seen: the app, `localhost:5199/api/cart` (allowed), Google Fonts, GA and GTM.
  - Media: only the public `hero-music.mp3` and `middle-east.mp3`.
- **Token endpoint:** anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → **401** `Please sign in to access Studio.`. A fake Bearer token → 500. That is the known root item, unchanged.
- **During library drops:** every PW run (fresh contexts, no credentials) logged `net … bad 0`. That filter counts any request carrying an `Authorization` header and any `/api/studio-token`, `/api/recording-*`, `/api/download` or R2 URL.

## 6. R51-DROP — REAL-mouse (PW), library option → lane

| ID | Result | Evidence |
|---|---|---|
| LD-OFF | **PASS.** `Slow rise` (5 s) onto SFX at x 888 = 9.4. Ghost `00:09.400`, `left` 376 px (9.400), `data-blocked="false"`. Clip `sfx:9.4`; status `„Slow rise“ დაემატა SFX ხაზზე 00:09.400-ზე.` | `runs/r51-1440x900-LD-OFF_LD-1.txt` |
| LD-1 | **PASS.** PW `g` → snap on. Ghost before release `00:09.000`, `left` 360 px. `data-clip-start` **9.000**. Status exactly `„Slow rise“ დაემატა SFX ხაზზე 00:09.000-ზე.`. Undo `დამატება — Slow rise`. Ctrl+Z removes it (status `Undo: დამატება — Slow rise`). | same |
| LD-ALT | **PASS.** Alt held. `dragover.altKey` true and `drop.altKey` true. Ghost `00:09.400`; clip **9.4** | `runs/r51-1440x900-LD-ALT_LD-ALT-ON_LD-BLOCK_LD-VIDEO.txt` |
| LD-ALT-ON | **PASS.** Snap off, division 0.25 (PW `selectOption`), Alt. Ghost `00:09.500` (380 px); clip **9.5**; `data-snap="off"` stays | same, and `runs/r51-1440x900-LD-BLOCK-OFF_LD-ALT-ON.txt` |
| LD-BLOCK | **PARTIAL — status FAIL (C-R51-01).** Division 5, Snap on, `Soft impact` (2 s) at raw 6.2 (x 760). The raw slot 6.2–8.2 is free. Snapped, 6.2 → 5, and 5–7 overlaps 4–6. Ghost `00:05.000 · აქ ადგილი არ არის`, `data-blocked="true"`. **No clip added.** **But the status stayed `ბადე: 5 წმ (Snap ჩართულია)`**: the browser fired no `drop` event (`dragover` 4, `drop` 0, `dragend` 1). | same |
| LD-VIDEO | **PASS.** Ghost `00:09.000 · აუდიო ვიდეოხაზზე არ ემატება` at a whole second. Nothing added. Status `აირჩიე აუდიო ხაზი … — ვიდეოხაზზე აუდიო არ ემატება.` | same |
| LD-1280 | **PASS.** At 1280×720 the run is identical: ghost `00:09.000` / 360 px, clip 9, the same status, Ctrl+Z removes it | `runs/r51-1280x720-LD-1_LB-MOVE.txt` |

### 6.1 C-R51-01 (Low, older than this round): the blocked-drop status is unreachable in a real browser

- **Cause.** `handleLibraryDragOver` sets `dataTransfer.dropEffect = 'none'` when a drop is blocked. Chromium then cancels the drop and dispatches no `drop` event. `handleDrop` never runs, so `LIBRARY_DROP_BLOCKED_MESSAGE` is never shown.
- **Not a round-51 regression.** **LD-BLOCK-OFF** (Snap off, `Soft impact` over itself at 4.6) behaves the same: ghost `00:04.600 · აქ ადგილი არ არის`, `drop` 0, and the status unchanged.
- **jsdom differs.** SD6 dispatches `drop` directly, so it does see the status.
- **User impact:** low. The red ghost says why while the item is over the lane, and nothing is added. The status sentence that explains it is lost on release.
- **This touches B's design decision Q1 (D-29z16).** Q1 says a blocked snapped drop is "refused with today's ghost text **and status**". In a real browser the status half is unreachable, before and after round 51.
- **For B:** please re-evaluate Q1 rather than filing this as cosmetic. Either show the refusal status from `dragleave`/`dragend` after a blocked ghost, or let the ghost text alone carry the refusal and update Q1/SD6 to say so. B decides.

## 7. R51-LOOP — REAL-mouse (PW) (LF = 11.3–14.1; bar centre x 1020, end edge centre x 1070, start edge centre x 970; `elementFromPoint` confirmed each part)

| ID | Before release | After release | Verdict |
|---|---|---|---|
| LB-OFF (+10 px) | 11.55–14.35 | 11.55–14.35; status `Loop: 00:11.550 — 00:14.350.`; Undo `Loop-ის დიაპაზონი` | **PASS** |
| LB-MOVE (Snap on, +10 px; raw 11.55) | **12.000–14.800** | 12.000–14.800; status `Loop: 00:12.000 — 00:14.800.`; Undo `Loop-ის დიაპაზონი` | **PASS** |
| LB-ALT (Alt held) | 11.55–14.35 | the same; snap stays on | **PASS** |
| LB-ALT-ON (Snap off, division 0.25, Alt) | 11.5–14.3 | the same | **PASS** |
| LB-END (+22 px; raw 14.65) | 11.3–**15** | 11.3–15; start unchanged | **PASS** |
| LB-START (extra, −22 px; raw 10.75) | **11**–14.1 | the same; status `Loop: 00:11.000 — 00:14.100.` | **PASS** (the browser counterpart of SL9) |
| LB-CLAMP (end −106 px → raw 11.45; line 11; minimum 11.4) | 11.3–**11.4** | the same; status `Loop: 00:11.300 — 00:11.400.` (clamped, off the grid) | **PASS** |
| LB-SAME (LB-MOVE, then bar +6 px; raw 12.15 → line 12) | 12–14.8 | unchanged. **One** Ctrl+Z → 11.3–14.1 (`Undo: Loop შეიქმნა` next), so the +6 px drag added **no** entry. A second Ctrl+Z removes the loop. | **PASS** |
| LB-1280 | 12–14.8 | 12–14.8; the same status and Undo | **PASS** |

Evidence: `runs/r51-1440x900-LB-OFF_…_LB-SAME.txt`, `runs/r51-1440x900-LB-SAME.txt`, `runs/r51-1280x720-LD-1_LB-MOVE.txt`.

## 8. R51-KEYS — REAL (gstack `$B click` on the brace centre, which `elementFromPoint` confirmed is the brace; then `$B press`)

| ID | Result | Verdict |
|---|---|---|
| LK-OFF | 11.3–14.1 → ArrowRight → **11.4–14.2**; status `Loop: 00:11.400 — 00:14.200.` | **PASS** |
| LK-1 | REAL `g`. ArrowRight → **12–14.8**; ArrowLeft → **11–13.8**; ArrowLeft → **10–12.8**. Then three Ctrl+Z → 11–13.8 → 12–14.8 → 11.3–14.1, so each key made one entry. The focus stays on the brace. | **PASS** |
| LK-SHIFT | From 11.3–14.1: Shift+ArrowRight → end **15**; Shift+ArrowLeft → end **14**; start 11.3 unchanged | **PASS** |
| LK-ZERO | 12 × ArrowLeft → **0–2.7**. One more → unchanged; status exactly `Loop ვეღარ გადაიწევს: დროის დასაწყისი ან მინიმალური სიგრძე.` | **PASS** |
| LK-025 | Fresh page; REAL `select` 0.25; REAL `g` (`Snap ჩართულია — ბადე 0.25 წმ (G)`). ArrowRight → **11.5–14.3**; again → **11.75–14.55** | **PASS** |
| LK-CLIP | REAL click on the `Soft impact` header (selection 1, confirmed in `g51-nudge`), then the brace, then ArrowRight → the brace goes to **12–14.8**; `Soft impact` stays at **4** | **PASS** |

Evidence: `runs/g51-keys-1440x900.txt`, `runs/g51-nudge-1440x900.txt`, shot `shots/LK-CLIP-gstack-1440x900.png`.

### 8.1 C-R51-02 (Low, older than this round; for B and the Tech Lead): a clip click does not take focus from the brace

- **Steps:** focus the brace with a REAL click, REAL click a clip header (selection 1), then ArrowRight.
- **Result:** the **brace** moves (12–14.8 → 13–15.8); the clip does not (SFX stays at 5). `document.activeElement` is still the brace after the header click (`runs/g51-nudge-1440x900.txt`, "OBS").
- **Expected (my reading):** a user who has just clicked a clip expects the arrows to nudge that clip.
- **Not from round 51.** The brace handled ←/→ before this round (±0.1 s with Snap off). Round 51 only makes the steps bigger.
- **Note:** this is not the LK-CLIP order. LK-CLIP clicks the brace last, so the brace correctly owns the keys.
- **May be by design.** `isLoopBraceTarget` deliberately makes a focused brace own the arrows. B may rule this a design rule (a click on a non-focusable clip keeps the focus where it was) rather than a defect. If so, close it as a design rule or move it to the Tech Lead's R51-T 3.

## 9. R51-PLAY — real audio graph (PW; video Mute by PW click, `aria-pressed` true)

| ID | Result | Verdict |
|---|---|---|
| LP-LOOP | Snap on. End edge +30 px: raw 14.85 → **E = 15** (loop 11.3–15). PW ruler click at 14.3 → **14.000**. PW Space, in-page sampler every 25 ms. **`h30`:** the first music source has `off 7`, `dur 1` (stops at 15). **The wrap source is scheduled at `when 1.05` (1.0 s after start), with `off 4.3` (= 11.3 − 7) and `dur 3.7` (11.3 → 15).** Readout: …14.971, **14.982** → **11.301**. It never wraps at the raw 14.85. | **PASS** |
| LP-LOOP-ALT | Alt held on the edge drag → E′ = **14.85** (off the grid). Ruler 13.85 → 14.000 (snapped). **`h30`:** the first source has `dur 0.85`, and the wrap source `when 0.9`, `off 4.3`, `dur 3.55`. Readout: …14.822, **14.841** → **11.312**. The wrap happens at E′ (contrast). | **PASS** |
| LP-DROP | Snap on. `Soft impact` dropped at 9.4 → **9** (`„Soft impact“ … 00:09.000-ზე.`). Ruler 8.4 → **8.000**. **`h30`:** SFX source `when 1.05`, `off 0`, `dur 2` (= 1.0 s after start). Music `off 1`. SFX meter −∞ through 8.98, first above −∞ at readout **9.022** (0.0 dB), inside [8.95, 9.15]. | **PASS** |
| LP-DROP-OFF | Snap off at drop time → clip **9.4**; then Snap on, ruler 8.4 → 8.000. **`h30`:** SFX `when 1.45` (= 1.4 s). Meter **−∞ through 9.371**, first above −∞ at **9.401**, which is ≥ 9.35. The first attempt stopped at 9.310, before the onset (`*.run1.txt`), so I re-ran it with longer playback. | **PASS** |

Evidence:
- `runs/r51-1440x900-LP-LOOP_LP-LOOP-ALT.txt`;
- `runs/r51-1440x900-LP-DROP_LP-DROP-OFF.txt` (identical to `*.run1.txt`);
- `runs/r51-1440x900-LP-DROP-OFF.txt`.

## 10. R51-REG — **PASS**

- **REG-HYD** (`runs/reg-hyd.txt`, PW, fresh load at 1440×900 and 1280×720, console for 3 s): the only lines are vite connecting/connected and the React DevTools notice. 0 flagged lines.
- **C-R23-01 (record only):** SSR ×3 → 66 062 bytes, **NUL 3 at offsets 11729, 28025, 28026**, FFFD 0 (`runs/ssr.txt`). This is identical to round 50.
- **RU-1:** REAL gstack marker click at 7.3 → **7** (`00:07.000`) (`runs/g51-reg-1440x900.txt`).
- **LA-1:**
  - REAL gstack click on the stems lane element, real `clientX` 864 → 14.4 s (`target === currentTarget`) → **14**;
  - PW at 4.6 → **5** (`runs/r51-1440x900-CL-RANGE_LA-1.txt`).
- **CL-RANGE:** PW, Snap on, music body 7.3 → 9.6 → range `{7, 10, music}`. Ctrl+L → brace `Loop 00:07.000 — 00:10.000`, status `Loop შეიქმნა და ჩაირთო: 00:07.000 — 00:10.000.`
- **Clip nudge NU-1:** REAL, with the focus on the body. Click the `Soft impact` header, then ArrowRight → **5**; Undo `კლიპის ჩაჩოჩება`.
- **G toggle and division texts** (REAL `g` and `select`):
  - G on: `Snap ჩართულია — ბადე 1 წმ (G)`;
  - select 0.25: `ბადე: 0.25 წმ (Snap ჩართულია)`;
  - G off: `Snap გამორთულია — თავისუფალი გადაადგილება (G)`.

  These are unchanged.
- **Render cost and the second pointer on the brace:** `render-budget.test.tsx` and `gesture-guard.test.tsx` are green in the 85-file run.
- **Other affected areas:**
  - library drop with Snap off: LD-OFF;
  - the refusal ghosts (video, blocked): LD-VIDEO, LD-BLOCK, LD-BLOCK-OFF;
  - brace drag with Snap off: LB-OFF;
  - threshold, Undo labels and status: the LB rows;
  - loop playback wrap: LP-LOOP.

  All behave as before. **File drops on the video lane were not re-run** in the browser; that code path has no hunk.

## 11. Ableton two-verdict table (§4.9)

There was no new fetch. The sources are B's captures; I confirmed the quotes in them (§2). No video was watched and no Live installation was used.

| Behaviour | CZABA requirement | Ableton conformance |
|---|---|---|
| Brace edges and bar can be dragged (6.6) | **PASS** (LB-OFF, LB-END, LB-START) | **confirmed** (text) |
| The dragged brace lands on grid lines | **PASS** (LB-MOVE, LB-END, LB-START, LB-CLAMP, LB-SAME) | **unconfirmed** (6.6 does not say; inferred from the 6.7 clip rule) |
| ← → nudge the brace by the grid (6.6) | **PASS** (LK-1, LK-025; LK-OFF ±0.1) | **confirmed** that the keys follow the grid; the landing rule (to the line or by one step) is **unconfirmed** |
| Shorten or lengthen by the grid (6.6, Ctrl + ← →) | **PASS** for CZABA's Shift + ← → (LK-SHIFT) | **deliberate difference** (Shift instead of Ctrl) |
| ↑/↓ and Ctrl + ↑/↓ (6.6) | not added (Q5) — not tested | **confirmed** in Live; **not added** in CZABA (signal ABLETON-LOOP-KEYS-NOT-REQUESTED) |
| Alt bypasses / temporarily enables the grid (6.10) | **PASS** (LB-ALT, LB-ALT-ON, LD-ALT, LD-ALT-ON; PW, Alt seen on the events) | **confirmed** (text); reading Alt per `pointermove`/drag event is a CZABA detail |
| Items dragged from the browser into tracks (4.10) | **PASS** (LD-OFF, LD-1) | **confirmed** (that a drop adds the item) |
| The drop position follows the grid | **PASS** (LD-1, LD-1280); the refusal status is a separate older issue (C-R51-01) | **unconfirmed** (4.10 does not describe the position) |
| Dropping below the tracks creates a new track (4.10) | — | **not applicable** (CZABA's lanes are fixed) |

Nowhere in this report do I claim that "Ableton does it this way" for an unconfirmed row.

## 12. Findings for B

1. **C-R51-01 (Low, older than this round)** — the blocked library-drop status is never shown in a real browser (§6.1). LD-BLOCK is not in `passed`.
2. **C-R51-02 (Low, older than this round)** — after the brace has focus, clicking a clip does not take focus, so the arrows still move the brace (§8.1).
3. **C-R51-T1 (Low, test gap)** — mutation (n), a re-snap on release, survives the committed tests (§3), as A's reviewer predicted. The suggested test is in §3.
4. **Info:**
   - SL7 cannot tell snapping from clamping (A's fixture 0.6–1.8, bar −10 px, would);
   - PW delivers native HTML5 drag events and `altKey` in this Chromium, but that is not an OS drag (R51-ALT-NATIVE-DRAG → Tech Lead);
   - the 8 px edge-zone fixture rule held: every target hit the intended element.
5. **Harness labels (honest):**
   - every LD, LB and LP case ran only as REAL-mouse (PW). That includes their `g` presses and the 0.25 / 5 division selects (PW `selectOption`);
   - the LK keys, RU-1, LA-1 (centre), NU-1, the G texts and G51-3 are REAL (gstack);
   - the gstack loop fixture's range is SYNTHETIC (`__c.rangeOn`);
   - the video Mute in LP-* is a PW click.

## 13. Carried (not re-run; not PASS)

- **Open C bugs:**
  - C-R48-01 (no recurrence);
  - C-R41-01;
  - C-R27-01 (with RF3-1, RF3-2, R5-L6 from `root-pre-push-review.md`, the round-3 review; still open), C-R6-02, C-R8-01;
  - C-R23-01 (NUL 3, unchanged) + C-R38-01.
- **Open Lows (B):**
  - A-R50-REVIEW-CLIP-CANCEL-SEEK (→ stage 4);
  - R49-OUTWARD-TRIM-SHRINK and R49-WIDE-DIVISION-RANGE (→ stage 4);
  - R26-M1, A-R34-REVIEW-RESIDUALS, DEMO-SFX-FULL-SCALE, L3-REMOVED-TRACK-TAPS, SETTRACKMIX-NAN-IDENTITY, BIOME-HOOKS-DEPS, VIDEO-CLIP-TRANSLUCENT-GRID, DETAIL-RESET-SHRINK, SHIFT-BEFORE-DOWN-NOTE;
  - A's reviewer info: the brace has no right-hand bound (older behaviour).
- **`publication-checkpoint.json` → `round49.open`:**
  - C-R49-01 and C-R49-02: closed in round 50;
  - C-R48-01, R49-T, GSTACK-NO-MOUSE and ARCH-CHECKPOINT-SRW14-PREFS remain.
  - The published base is still `038ed5a`, and round 50 is still uncommitted.
- **Root:**
  - commit of rounds 50 + 51;
  - ARCH-CHECKPOINT-SRW13 and **ARCH-CHECKPOINT-SRW14-PREFS**. The brace is now the fourth consumer of the snap triple; A's reviewer said keep for now.
  - GSTACK-NO-MOUSE (used again here) and GSTACK-ACL;
  - SRW-21; ENV-BROWSE-DAEMON (no failure this round);
  - the CRLF Biome errors on the auth files;
  - fake Bearer → 500 (reproduced);
  - machine load.
- **Tech Lead:** **R51-T** 1–4, including R51-ALT-NATIVE-DRAG and C-R50-N2, plus the earlier manual checks. I also suggest adding C-R51-02 to R51-T 3.
- **Not run (§4.8):**
  - video sync and C-R27-01;
  - the full find sound → add → fit video → export flow, so no export WAV duration or sample-integrity check this round;
  - the FB-01..FB-16 stage regression;
  - `npm run test:e2e:smoke` (root);
  - file drops on the video lane in the browser.

## 14. Commit readiness (for root)

**Ready, for round 50 + round 51 together.** HEAD is `038ed5a`, and round 50 was not committed in between. `git status` shows exactly 11 paths:
- the 7 round-50 paths;
- `ArrangementLane.tsx`, `ArrangementLoopBrace.tsx`, `grid-snap-loop-drop.test.tsx` and doc 047 (`StudioWorkspace.tsx` is shared with round 50).

The frozen list is 405 OK, protected files 4/4. The quiet `npm run verify` exits 0 with 85 / 1461, and Biome is at the baseline. C-R51-01, C-R51-02 and C-R51-T1 are older Lows or a test gap and do not block the commit. Root still owns `npm run test:e2e:smoke`, the commit and the push.

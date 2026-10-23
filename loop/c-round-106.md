# C — Round 106 verification: a held key no longer repeats the same refusal (GATE105-S1) + doc 092

Verifier: C · 2026-10-23 (09:38–09:55 UTC) · HEAD `3b6178b` · real Chromium (Playwright, installed), fresh incognito context per row, no credentials · source read-only.

**Verdict: PASS** (`browserVerified=true`, `realVerified=true`).
- The rule works in a real browser on every path B listed (P1–P6). A held key announces a boundary refusal once. A separate press announces it again. The action still repeats while there is room.
- Two of B's rows (KR-NUDGE-SNAPOFF, KR-NUDGE-MOVES) could not pass as written. Their premise was wrong, not the fix: a single clip at time 0 with Snap off is a silent no-op, and that is pre-existing (C-R106-01). Both rows pass with A's neighbour-blocked recipe, and C lists them in `passed` with that qualifier only.
- Three Low findings go to B. None is a regression of this round.

## 1. Source (SOURCE-UNCHANGED)
- **Start (09:38):**
  - HEAD `3b6178b`.
  - `git status` = 6 M + 4 ??, which is A's expected end state. The 3 M + 4 ?? baseline plus the three component files.
  - The frozen list is 535/535 OK.
  - All 7 owned files match `a-round-106/end-hashes.txt`.
  - Evidence: `c-round-106/out/source-start.txt`.
- **Diff against the round 105 snapshots** (`out/diff-code.txt`). Every hunk is inside B's narrow ranges:
  - Context: interface l.295/301, `stepLoopRange`, `nudgeSelectedClip`.
  - Workspace: l.1852, 1944, 1955, 1958.
  - LoopBrace: `handleLoopKeyDown`.
  - MarkerRow: destructure, `stepMarker` and its deps, `commitMarkerMove`, `nudgeMarker`, the flag arrow.
  - DetailPanel: the two Enter branches.
  - The reducer block and `gestureCountRef` are untouched, with no hunk between them.
- `workspaceRef.current = workspace` is assigned on every render (StudioWorkspace l.505–506), so `current.status` in the Snap-on guard is not stale.
- **End (09:50):** HEAD, status and the frozen list are the same, and all 7 end hashes are OK (`out/source-end.txt`).
- C wrote only under `tmp/studio-real-loop/c-round-106*`. Mutations ran in C's scratch `c-round-106/mut/`, which has a `node_modules` symlink and its own Vite cache.

## 2. Browser rows
Setup for every row:
- `/studio-lab`, Decline, then wait for the library to settle.
- A `MutationObserver` on `[data-testid=arrangement-status]` logging added element nodes and their text.
- A kept reference to the `<output>`. At every keydown, C checked that it is the same node, an `OUTPUT`, with one child.
- A capture-phase `keydown` counter for `repeat` and `repeat && ctrlKey`.

A hold is `keyboard.down` ×(N+1) at 33 ms intervals, then `up`. After 500 ms comes one `keyboard.press`.

Script: `c-round-106/tools/kr106.cjs`. Outputs are in `out/kr-*.json` and screenshots in `shots/kr-*.png`.

| Row | VP | Snap / grid | In-page repeats | Hold: added | Separate press | State | Result |
|---|---|---|---|---|---|---|---|
| KR-NUDGE-SNAPOFF **as written** (1 clip at 0) | 1280 | off / 1 | 31 | **0** | **0** | clip 0.000; Undo unchanged | as-written criteria not met → C-R106-01 (pre-existing) |
| KR-NUDGE-SNAPOFF (2 clips, 2nd selected) | 1280 | off / 1 | 31 | 1 × `ჩაჩოჩება დაბლოკილია — მეზობელი კლიპი ან დროის დასაწყისი.` | +1 same | starts 0.000/101.352 unchanged; Undo unchanged; output same, 1 child at all samples | PASS |
| KR-NUDGE-SNAPOFF (same) | 1440 | off / 1 | 31 | 1 | +1 | same | PASS |
| KR-NUDGE-SNAPON (1 clip at 0) | 1280 | on / 1 s | 31 | 1 × `ჩაჩოჩება დაბლოკილია — დროის დასაწყისი.` | +1 | unchanged | PASS |
| KR-NUDGE-MOVES (2 clips, 2nd → +0.300) | 1280 | off | 11 | 1 × single refusal, nothing else | — | per keydown 101.552 → 101.452 → 101.352 → 101.352…; Ctrl+Z ×3 → 101.452, 101.552, 101.652 (3 entries "Undo: კლიპის ჩაჩოჩება") | PASS |
| KR-NUDGE-MOVES **as written** (1 clip → 0.300) | 1280 | off | 11 | **0** | — | 0.200 → 0.100 → 0.000…; Ctrl+Z ×3 → 0.100, 0.200, 0.300 | action repeats correctly; no refusal at 0 → C-R106-01 |
| KR-GROUP (2 clips, click + Ctrl+click) | 1280 | off | 31 | 1 × `ჯგუფის გადატანა შეჩერდა — …` | +1 | both clips unchanged | PASS |
| KR-LOOP | 1280 | on / 1 s | 31 | 1 × `Loop ვეღარ გადაიწევს: …` | +1 | `Loop 00:00.000 — 00:09.000` before and after; brace focused | PASS |
| KR-MARKER-FLAG | 1280 | off | 31 | 1 × `მარკერი დროის დასაწყისშია.` | +1 | marker 0.000. Hold ArrowRight (1 + 10 repeats): 0.100 … 1.100, +0.1 s per keydown, 11 distinct `მარკერი «Marker 1» გადავიდა: …` texts (not coalesced) | PASS |
| KR-MARKER-STEP | 1280 | off | 31 (all ctrlKey) | 1 × `წინ მარკერი აღარ არის` | +1 | playhead 01:59.717 (> 101.352) unchanged | PASS |
| KR-DETAIL-ENTER (Clip Gain 0.0) | 1280 | off | 21 | 1 × `Clip Gain უცვლელია: 0.0 dB.` | +1 | focus stayed on the gain input at all 22 keydowns; value and Undo unchanged | PASS |

Recipes:
- **KR-LOOP:**
  1. One Middle East clip, Fit, Snap on.
  2. Drag on the clip at 75% of its height from t=3 s to t=12 s, blur, then Ctrl+L.
  3. Focus the brace and use separate ArrowLeft presses until the loop reads `Loop 00:00.000 — 00:09.000` (2→1→0).
  4. Then hold.
  - Run 1 dragged from t=0.4, which grabbed the clip's left trim edge. Run 2 had a wrong regex in C's own check (`^00:00` against `Loop 00:00…`); it is kept as `kr-loop-1280x720-run1-regexbug.json`. Its measured counts were identical. The final run is clean.
- **KR-MARKER-FLAG / STEP:**
  - Home, M, then Enter to accept `Marker 1` at 0.
  - STEP also zooms out with `-` ×3 and clicks the ruler at t≈120 s with Snap off, which put the playhead at 01:59.717.
  - The hold is `keyboard.down('Control')`, then repeated `down('ArrowRight')`.

Regression rows: `tools/sr106.cjs` is a verbatim copy of C's round-105 `sr105.cjs` with only the paths changed.

| Row | Result |
|---|---|
| HD-BLOCKED-HOLD (1280) | PASS. The blocked sentence was added 1×, with 2 added elements in the window (blocked + release), 89 pointermoves in the window, and release text `კლიპის გადატანა: ცვლილება არ მოხდა — ისტორია არ შეიცვალა.` (same as round 105). No overlap; Undo unchanged. |
| SR-REPEAT-SPACE (1280) | PASS. The exact empty-arrangement text both times, and the second press adds a span. The same `<output>` stays polite with 1 child. |
| SR-TEXT-REG (1280) | PASS. The steps, texts, height 16 px, 1 child, same node, and added-text list are **byte-identical** to `c-round-105/out/textreg-1280x720.json`. |

- **PX-NET:** PASS. In all 17 sessions, 0 page-originated requests to studio-token, R2, recording or download, and 0 `Authorization` headers. The only network noise is the `:5199` cart `ERR_CONNECTION_REFUSED`, which is expected.
- **REG-HYD:** PASS. 0 hydration warnings, 0 pageerrors and 0 non-noise console errors in all sessions.
- **G106-3:** PASS at both 1280×720 and 1440×900, run alone with `tools/run-g1063.cjs` (copied from round 105).
  - The visible header link "Studio LabDemo" opens `/studio-lab` with the workspace and the demo badge.
  - `/studio/middle-east` shows "Sign in required", with 0 workspaces and 0 `audio[src]`.
  - An anonymous `/api/studio-token` returns 401 `{"error":"Please sign in to access Studio."}`.
  - localStorage holds only `czaba_spotlight_last_shown` and `czaba_session_id`.
  - The fake-Bearer sub-check is **BLOCKED** (backend unavailable in cloud).

## 3. Offline rows
- **AN-REVIEW:** PASS.
  - Lines 1–391 of the UI test file are byte-identical to the snapshot (`cmp`).
  - The added lines (392–705) contain no `as`, `@ts-` or `any`. SK1–SK12 are present.
  - C's own mutations, with C's own strings (`tools/mut106.py`, `out/mut106.json`, logs in `out/mut-*.log`), ran both status-announcement test files (25 tests).
  - Control: 25/25 green.

  | Mutation (C's string) | Red | A's result |
  |---|---|---|
  | k1 `keyRepeat: event.repeat && false` in both workspace nudge calls | SK1, SK3, SK7 | same |
  | k4 the same in both loop brace calls | SK4 | same |
  | k8 the five code files set to the round-105 snapshots, plus the reducer `(gestureActive \|\| true) && next === previous.text` | SA3, SA7, SU1, SU2, SU5, SK1–SK6, SK8, SK11, SK12 | same UI set. SA3/SA7 are extra only because C also ran the pure reducer file. |
  | k9 provider `if (!keyRepeat) setStatus(...)` at all three provider refusals | SK7 | same |

  A's fail-before list (SK1–SK12 red, SU green) agrees with B's expectations; C did not re-run fail-before.
- **T106-TARGETED:** PASS.
  - C re-ran B's grep, and the list is identical to A's (69 files).
  - `npx vitest run` gave **69 files, 1138 tests, all passed** (`out/targeted.log`).
- **DOC-092:** PASS.
  - l.4 carries the round 106 status.
  - The Approach (l.16) qualifies the string branch: it bumps outside a gesture, keeps `previous` during a gesture, and the key handler decides on repeats.
  - The Mermaid diagram has the gesture `alt` and key-repeat `else` branches.
  - The changed-files list names SA1–SA7, SU1–SU6 and SK1–SK8 (+ SK9–SK12).
  - The keyboard semantics, the forbidden k8 fix and the rejected k9 rule are recorded.
  - One stale sub-status line remains (C-R106-03).

Gate rows (not claimed by C): full vitest, typecheck, build, Biome, `npm run verify`, `npm run test:e2e:smoke`, PROD-MP3-UNVERIFIED.

## 4. Findings for B
- **C-R106-01 (Low, a11y, pre-existing; = A-R106-TIME0-SILENT, now browser-confirmed):** ArrowLeft on a single clip at 00:00.000 with Snap off gives no feedback at all: no status and no history. That holds both for a hold and for a deliberate press. Yet the refusal text itself names "დროის დასაწყისი".
  - Snap on gives `ჩაჩოჩება დაბლოკილია — დროის დასაწყისი.` in the same place, so the two modes are inconsistent.
  - The whole `nudgeSelectedClip` callback is byte-identical between HEAD `3b6178b` and the round 105 snapshot (`diff`; not a browser run on the old code).
  - The clip was selected in the as-written row: the identical click in KR-NUDGE-MOVES as-written let three ArrowRight presses move it 0 → 0.300.
  - B's KR-NUDGE-SNAPOFF and KR-NUDGE-MOVES rows rested on this wrong premise.
- **C-R106-02 (Low, pre-existing; reviewer F6 confirmed in a real browser):** a held Ctrl+L toggles the loop on every auto-repeat. Over 10 keydowns `aria-pressed` alternated true/false, and the end state depends on hold length. The first press also re-applied the still-selected range over a loop that had been moved with the brace. C did not count the history entries added; the end label was `Undo: Loop გამორთვა`. The other F5/F6 paths (held Ctrl+E, Ctrl+Shift+L, Ctrl+C, and Enter held on ◀/▶ or Clip Gain reset) were **not** browser-tested by C.
- **C-R106-03 (Low, doc):** in doc 092 l.94, the A-R104-REPEAT-DRAG entry still says round 105 is awaiting C.
- **Carried for root and B:** the code-reviewer's Architecture note (refusal suppression in two places: provider updater + four component `status` comparisons). It is a signal for ARCH-R105-STATUS-INTENT, not a defect.

## 5. Ableton correspondence
- Held-key refusal announced once: **არ ეხება**. This is CZABA's own accessibility rule for the browser status line; no Ableton source was consulted and no Ableton claim is made.
- A held arrow keeps nudging: **არ ეხება** (regression check only). The behaviour is unchanged, and KR-NUDGE-MOVES and the KR-MARKER-FLAG ArrowRight check show it still repeats.

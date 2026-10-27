# CURRENT TASK — Round 207: SABA-B-6, the timeline "+" cursor becomes the pointing finger

Decision: **D-29z173** (the ordering correction and this round). C-R206-01 ruling: **D-29z174**. R113 (doc 163 status line): **D-29z175**. Planned by B on 2026-10-27. Dispatcher: B. Implementer: A. Verifier: C.

**Read first:**
- `lessons.md` in the loop root.
- The previous task, `tasks/round-206.md` (an exact copy).
- B's rationale and probes, in `b-round-206.md`.
- B's probe tools `b-round-206/tools/cursormap.cjs`, `grabcheck.cjs`, `videograb.cjs`, and their outputs `b-round-206/out/cursormap-{1440,1280}.json`, `grabcheck-1440.json`, `videograb-1440.json`.

## Baseline
- **Commit:** `60c82ed`. Gate 206 is **published** to both remotes, so the tree is clean.
- **Frozen files:** the 1,043 files in `b-round-206-r207-tree-sha256.txt`. This is every tracked file except the 5 grants. Check it from the store root: `sha256sum -c --quiet <loop>/b-round-206-r207-tree-sha256.txt`.
- **Grants:** `b-round-206-r207-grants.txt`. Start hashes are in `b-round-206-r207-granted-start-sha256.txt`, and start copies are in `b-round-206/r207-granted-start/`.
- **New files:** `b-round-206-r207-new-files.txt`.
- **Protected areas:** frozen as always. This covers auth and purchase files, `app/components/studio/**`, `app/styles/**`, `.claude/**`, `CLAUDE.md` and `package.json`.

## 0. Why this round
- **Saba, 2026-10-27 (SABA-B-6, Low, fix now and do not defer):** somewhere on the timeline the hover cursor is a "+". He wants the pointing finger, the way Ableton shows it.
  - The policy places this round right after SABA-B-4 closes (round 205) and before PERF-1.
  - Round 206 ran PERF-1a first. SABA-B-6 was not in `backlog.json` at 207 planning. Whether the policy note was already there when round 206 was planned is unverified. Either way, it is corrected now (D-29z173).
  - The round goes in now, before PERF-FADER and PERF-1b.
- **The bug gate is clear.**
  - SABA-B-5 (Medium) was measured in round 206. Its fix is PERF-FADER, the next round.
  - C-R206-01 is ruled Low in `b-round-206.md` §3, and bound to PERF-FADER.
- **B reproduced the cursor in real Chromium** (`cursormap.cjs`, at 1440×900 and 1280×720). These are facts:
  - The method is computed `cursor` of `elementFromPoint` on a 6 px grid.
  - The probe added two demo clips and a video, then turned Env on and added one breakpoint.

| Element (testid) | Source | Cursor now | Where | Probe hits (1440 / 1280) |
|---|---|---|---|---|
| clip envelope editor overlay `arrangement-clip-envelope-editor` | `ArrangementClipEnvelope.tsx:353` | **`crosshair` (a "+")** | the **whole clip body** of every audio clip while Env is on | 1303 / 1095 |
| envelope breakpoint `arrangement-clip-envelope-point` | `ArrangementClipEnvelope.tsx:367` | **`move` (four arrows, "+"-shaped)**, at hover **and** during the drag | on the envelope line | 2 / 2 (10 px square) |
| floating expanded video `arrangement-video-box` (+ its `<video>`) | `ArrangementVideoDock.tsx:922` | **`move`**, at hover and during the drag | over the library, not on the timeline | 1124 / 512 |
| legacy `TransportBar.tsx:372` | `app/components/studio/**` | `crosshair` | **not rendered on `/studio-lab`** (0 hits); a frozen file | — |

- **Other cursors, not "+"-shaped and unchanged here:**
  - `text` (I-beam) on the clip waveform body with Env off. Drag there selects time.
  - `grab`/`grabbing` on the clip title bar, markers, the loop brace and the video float handle.
  - `ew-resize` on clip edges, fades, the playhead and the overview.
  - `row-resize` on the track-height and detail splitters.
- **Library drag:** dragging a library item over a lane shows the OS-drawn `copy` cursor, because `dropEffect = 'copy'` (`ArrangementLane.tsx:265,294`). This is drag feedback drawn by the OS. It is not a hover cursor, and it is out of scope.

## Reference: how Ableton Live 12 does it
Consulted: the `ableton-arrangement-expert` consult; B's WebFetch of the Live 12 manual (all 112.8 K characters of the chapter); one WebSearch. Checked 2026-10-27.

| Point | Ableton Live 12 | Source | Status |
|---|---|---|---|
| Behaviour: envelope line | "The line segments and the breakpoints connecting them become draggable objects." "Click at a position on a line segment to create a new breakpoint there." | [Live 12 manual, Automation and Editing Envelopes → Editing Breakpoints](https://www.ableton.com/en/live-manual/12/automation-and-editing-envelopes/#editing-breakpoints) | CONFIRMED (behaviour) |
| Behaviour: breakpoint hover and drag | A value readout is shown when you hover or drag. "When dragging a breakpoint, a thin black vertical line will appear." | same section | CONFIRMED (readout and guide line) |
| Clip body vs clip bar | "only the clip bar is draggable"; dragging "in the clip's waveform … allows you to select time within the clip" | [Arrangement View → Moving and Resizing Clips](https://www.ableton.com/en/live-manual/12/arrangement-view/#moving-and-resizing-clips) and [→ Selecting Clips and Time](https://www.ableton.com/en/live-manual/12/arrangement-view/#selecting-clips-and-time) | CONFIRMED (roles) |
| Hover feedback | Third-party guides say a segment is highlighted when the pointer is near it. | [Loupedeck Live guide](https://support.loupedeck.com/ableton-live-editing.html); [Ultimate Outsider 2015](https://blog.ultimateoutsider.com/2015/03/two-methods-for-snapping-automation-to.html) | secondary, not official |
| **Cursor shape** over a line, a breakpoint or a drag | **No reference found.** | The expert searched the Live 12 chapters arrangement-view, automation-and-editing-envelopes, clip-envelopes, clip-view, working-with-the-browser, warping, editing-midi, comping, session-view, keyboard shortcuts and concepts. None of them names a pointer shape. help.ableton.com ("mouse cursor") returned 0 articles. No official video was found. | UNCONFIRMED |
| Shortcuts / modifiers | not changed in this round | — | does not apply |

**Decision (Saba's requirement, not an Ableton claim):** Saba's text gives the default: "where Ableton shows a pointing finger (for example over an automation line or breakpoint, click adds or drags a point), we use `cursor-pointer`."
- The manual cannot confirm the cursor shape.
- So this is recorded as **Saba's request**. It does not count as "Ableton does the same" (workflow rule: no "Ableton-შიც ასე მუშაობს" without a source).

### Cursor map (the contract for this round)
| Element | Ours now | Ableton | Ours after | Why |
|---|---|---|---|---|
| Envelope editor overlay (whole clip body, Env on) | `crosshair` | shape unconfirmed; the line is clickable | **`pointer`** | Saba's default. Click selects and double-click adds a point, so the area is clickable. |
| Envelope breakpoint, hover and during drag | `move` | shape unconfirmed; draggable, with a readout | **`pointer`** at rest **and** during the drag (`hover:scale-125` stays) | Saba's default. |
| Floating expanded video, hover and drag | `move` | Live's video window is out of scope (one video lane, simple editing) | **`grab` at rest, `grabbing` while pressed** (`active:cursor-grabbing`) | This removes the last "+"-shaped cursor. It matches CZABA's other move-by-drag objects (clip title bar, marker, loop brace, and this box's own handle ⠿, which is already `grab`). B proved in Chromium that `:active` applies during this box's pointer drag, even with `preventDefault` (`videograb-1440.json`: rest `grab`, down and drag `grabbing`, after `grab`). |
| Clip waveform body, Env off | `text` | time selection | unchanged | Not a "+", and the selection role matches Live. |
| Library drag over a lane | OS `copy` | — | unchanged | Drawn by the OS during a drag; not a hover cursor. |
| `TransportBar.tsx` crosshair | `crosshair` | — | untouched | Not rendered here; frozen. |

### Deviations (listed, so they are not bugs)
- **D1.** With Env on, the finger shows over the **whole clip body**, not only near the line. Live adds a point by a click *on a segment*; CZABA adds one by a **double-click anywhere** on the body, at that time.
  - This is the existing SRW-18 contract and is unchanged here.
  - Narrowing the hit area to the line would change behaviour, so it needs Saba's approval. It is recorded as `SABA-B-6-R1`, `awaiting_user`, and is not scheduled.
- **D2.** The cursor shape is Saba's request (pointer), not a confirmed Ableton fact (no source found).
- **D3.** The floating video uses `grab`/`grabbing` (the CZABA convention), with no Ableton reference.

## 1. Rulings
- **R-1.** Change **only** the cursor utilities named below. Do not touch any other class, any handler, the hit area, z-order or behaviour.
  - Every token in `clip-envelope-ui.test.tsx:781-791` (EV1) stays as it is.
  - **L23 is done:** B applied exactly these three edits on a scratch tar copy (`/tmp/b207`) and ran `clip-envelope-ui`, `floating-video`, `affordance-colour-ui` and `panel-radius-ui`: **86/86 pass**.
  - A grep of `app/**/*.test.*` shows that no test pins `cursor-crosshair`, `cursor-move` or the `fixed z-40 cursor-move` string.
- **R-2.** The floating box gets `cursor-grab` + `active:cursor-grabbing` only in its floating branch. The compact branch (`relative w-40`) stays without a cursor class.
- **R-3.** The guard test scans source (L23 note). Its red-proof is "red on the start copy", which is valid here because the start copy has the tokens.

## 2. A — files you own (everything else is frozen)
| Path | What |
|---|---|
| `app/components/arrangement/ArrangementClipEnvelope.tsx` (grant) | l.353 `cursor-crosshair` → `cursor-pointer`; l.367 `cursor-move` → `cursor-pointer`. Nothing else. |
| `app/components/arrangement/ArrangementVideoDock.tsx` (grant) | l.922 `'fixed z-40 cursor-move touch-none shadow-lg ring-1 ring-outline'` → the same string with `cursor-grab … active:cursor-grabbing` in place of `cursor-move`. Nothing else. |
| `app/lib/arrangement/__tests__/clip-envelope-ui.test.tsx` (grant) | add the rows **CU1** and **CU2** (below); existing rows unchanged |
| `app/lib/arrangement/__tests__/floating-video.test.tsx` (grant) | add the row **CU3**; existing rows unchanged |
| **new** `app/lib/arrangement/__tests__/timeline-cursor-map.test.ts` | the row **CU4** |
| `docs/implementation/2026/quarter-IV/163-studio-perf-harness.md` (grant), **R113** (L28, GATE206-DOC163-STATUS) | l.4 only. The status becomes `In Progress (C round 206 PASS — c-round-206.md; published 60c82ed; open: SABA-B-5 fix in PERF-FADER, C-R206-01 Low)`. No other line changes. In particular, l.60 stays as it is; PERF-FADER rewrites it. |
| **new** `docs/implementation/2026/quarter-IV/164-timeline-cursor-pointer.md` | A Georgian implementation doc (TEMPLATE.md sections). It holds the cursor map above, the "no reference found" record with what was searched, deviations D1–D3, and the tests. **L26:** cite only rows that exist (CU1–CU4). **L28:** the status line is conditional ("C round 207 check pending"). |

**Test rows (find elements by testid, never by class, L12):**
- **CU1.** Env on: the editor overlay's `classList` contains `cursor-pointer` and does not contain `cursor-crosshair`.
- **CU2.** Env on with a point: each `arrangement-clip-envelope-point` contains `cursor-pointer` and does not contain `cursor-move`. The EV1 tokens are still present.
- **CU3.** Floating: `arrangement-video-box` contains `cursor-grab` and `active:cursor-grabbing`, not `cursor-move`. Compact (not expanded): the box contains none of `cursor-grab`, `cursor-move` or `active:cursor-grabbing`.
- **CU4.** Source scan: no `.tsx` file under `app/components/arrangement/` contains `cursor-crosshair`, `cursor-move`, `cursor-cell` or `cursor-copy`.
  - The scan reads whole files, not a line window (L13).
  - Prove it with one named mutant: a scratch copy where `cursor-move` sits inside a multi-line `cn(` call fails CU4.
- **Red-proof:** CU1–CU4 fail against the start copies in `b-round-206/r207-granted-start/`. Run them on a scratch copy (record the failing names); do not edit the start copies.

**Self-checks before handover (A runs these, not the full suite):**
- `npm run typecheck`
- `npm run lint`
- `npx vitest run app/lib/arrangement/__tests__/clip-envelope-ui.test.tsx app/lib/arrangement/__tests__/floating-video.test.tsx app/lib/arrangement/__tests__/timeline-cursor-map.test.ts app/lib/arrangement/__tests__/affordance-colour-ui.test.tsx app/lib/arrangement/__tests__/panel-radius-ui.test.tsx`
- the red-proof above
- one real-Chromium check of computed `cursor` on the three elements. You may base it on B's `cursormap.cjs`/`videograb.cjs` (drop the class injection), but **copy them and their `lib*.cjs`, `wav.cjs` and `report.cjs` into `a-round-207/tools/` first**. Their `ROOT` resolves to the tools folder's parent, so running them in place would write into B's `b-round-206/out/`.
- the code-reviewer, because 3+ files change. Carry its Architecture note to B verbatim.

**STOP (L11):** if any needed change touches a frozen file, or if `:active` does not give `grabbing` during the real floating drag after your change, write STOP with the measurement and change nothing else.

## 3. C — rows
**Setup:**
- Root's dev server is on `http://127.0.0.1:5173/studio-lab`.
- Evidence is **computed style and DOM**: `getComputedStyle(elementFromPoint(x, y)).cursor` at the real pointer position. Headless screenshots never paint the cursor, so screenshots only show where the pointer was.
- Use **both viewports** (1440×900, 1280×720), fresh contexts, Snap off.
- Use the real demo library "Add" and the media `beeps-6s-h264-aac.mp4`.
- Write your own probe under `c-round-207/tools/`. Do not reuse A's test code.

| Row | What C does | PASS when |
|---|---|---|
| **SCOPE-207** (start and end) | HEAD, `git status`, the frozen list (1043), the grant diffs vs the start copies, the new files | Only the 5 grants and the 2 new files differ. The component diffs are exactly the 3 cursor-token edits of §2. Doc 163 differs at l.4 only, with the exact R113 text. 0 other `app/` changes; protected files unchanged. |
| **CUR-ENV-207** | Env on, one breakpoint added by double-click. Hover the editor body at 3 points (left, middle, right; upper and lower half). Do it on a selected clip, an unselected clip and a muted lane's clip. | The cursor is `pointer` at every point, at both viewports. No `crosshair` anywhere on the timeline (a grid scan like B's `cursormap.cjs`: 0 hits for `crosshair`, `move`, `cell` or `copy`). |
| **CUR-POINT-207** | Hover a breakpoint, press it, drag it 20 px down in 5 steps (the cursor is read at the pointer after each step), release, and read again. | `pointer` at rest, during every step and after release. The drag still changes the point's gain: `data-gain` changes and the status text is updated. |
| **CUR-VIDEO-207** | Expand the video (floating). Hover the box's centre, press, drag 40 px in 4 steps, release. Then return it to compact and hover the compact box. | Floating: `grab` at rest, `grabbing` while pressed and during the drag, `grab` after release, and the box moved. Compact: the cursor is not `grab`, `grabbing` or `move`. The ⠿ handle is still `grab`. |
| **CUR-UNCHANGED-207** | The B map's other elements: clip waveform with Env off, clip title bar (rest and drag), clip edge, fade handles, playhead, overview, track-height splitter | The same cursor as in `b-round-206/out/cursormap-*.json` state "a" (`text`, `grab`/`grabbing`, `ew-resize`, `row-resize`). |
| **BEHAV-207** | Behaviour next to the change: double-click the editor body adds a point; double-click a point deletes it; Ctrl-click the body toggles clip selection; the floating box's arrow keys on ⠿ move it 16 px; Esc returns the video | All as before (status text and DOM). This shows the cursor edit changed no handler. |
| **REF-207** | The reference section above | Each cursor-map row matches, or it is one of the listed deviations D1–D3. Ableton parity: the cursor shape is "unconfirmed (no source)", not "confirmed". |
| **AN-REVIEW-207** | the diffs, the new test, doc 164 | No `any`, `@ts-ignore` or `as`. CU1–CU4 exist; CU4 reads whole files. Doc 164 is Georgian, has the map, the search record and D1–D3, cites only CU1–CU4 (L26) and has a conditional status line (L28). |
| **G207-3** | Fresh contexts at 1440 and 1280: `/studio-lab` anonymous; `/studio/middle-east`; `/api/studio-token` with no header and with a fake Bearer | `/studio-lab` opens anonymously (demo collection, no sign-in). `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`. `/api/studio-token` returns 401 with no header. The fake Bearer gets 403 with `mock-api/server.mjs` on :5199, or 500 without it (I-206-a). **No token is issued either way.** Record which condition applied. |
| **gate** | full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke | not claimed by C; the root gate runs them |

**`browserVerified`:** CUR-ENV, CUR-POINT, CUR-VIDEO, CUR-UNCHANGED, BEHAV and G207-3 are real-Chromium rows that **can** run in the cloud. If any of them did not run, the flag is false.

## 4. Adjacent behaviour that could break
- The `hover:scale-125` breakpoint feedback and the EV1 tokens. Their contrast is unchanged, because no colour changes.
- The floating box drag (it claims a gesture through the D-26 registry). `active:` must not block the drag.
- The ⠿ handle's own `cursor-grab`.
- The Ctrl- and Shift-click selection on the editor overlay.

## 5. Publication
After C PASS, root runs the gate. The commit message says: "SABA-B-6 timeline cursor: envelope pointer, floating video grab; no behaviour change". Root amends doc 164's status line (L28).

## 6. After this round (not in scope)
- **PERF-FADER** (SABA-B-5 fix, following the pan pattern). It also owns C-R206-01 (D-29z174): the `event-share-16` metric must be replaced or liveness-proven before any flip to assert, and the false limit sentence in doc 163 l.60 and in the `budgets.json` event-share notes is rewritten in the same task. It also covers I-206-d: the track drag should change the value at both ends.
- Then **PERF-1b**, then PERF-2…16, SYS-1…3, STORE-2b…5 (paused), REVIEW-RECOMMENDATIONS and T12-ADVANCED.
- **Regression round:** due on or after 2026-10-30.
- **RETRO:** at round 215, or at the end of STUDIO-PERFORMANCE, whichever comes first.

# A — Round 135 report: VISUAL-A V-0.3b (Transport, tempo row, ruler, overview, loop brace, navigation statuses → English)

Implementer: A (Claude Opus 5.5) · Date: 2026-10-24 · Task: `current-task.md` (round 135, D-29z100)
**Scope completed: the whole §2 file list.** realVerified for the browser = **false at A level** (A runs no browser rows; C round 135 still has to run them).

## 1. Start state
- Start HEAD `16533c1667fa3be3e5df916b5eb6ae4ff0e76d4c`; `git status --short` was empty.
- Frozen list `b-round-134-r135-tree-sha256.txt`: `sha256sum -c --quiet` OK at the start (run from `store/`).
- 13 grant start hashes (`b-round-134-r135-granted-start-sha256.txt`, file sha256 `b0d2c708…`): all OK. The start copies in `b-round-134/r135-granted-start/` were also OK.
  - strings.ts `adb7c76f…`
  - ArrangementTransport `9de0cde4…`
  - ArrangementTempoRow `757f9a30…`
  - ArrangementRuler `b9ce9cf9…`
  - ArrangementOverview `9a0a8480…`
  - ArrangementLoopBrace `c5e6af8b…`
  - StudioWorkspace `d95f2808…`
  - strings.test `fcdf3516…`
  - delete-selection-ui `f0a84180…`
  - grid-snap-ui `18102c35…`
  - tempo-ui `fa4de816…`
  - metronome-ui `c286593c…`
  - doc 110 `2f672662…`
- Dev server `http://127.0.0.1:5173/studio-lab` returned 200 at the start and at the end. It was not restarted.

## 2. Pre-edit grep (saved as `a-round-135/pregrep.txt`)
- I grepped each TR/NV Georgian text (and distinctive fragments) in `app/**` and `e2e/**`. I also grepped regex/partial matchers (`name: /`, `getByTitle(`, `getByLabelText(`, `toContain(`, `getByRole(`) for Georgian next to Follow/Zoom/Fit/Loop/Split/Delete/Playhead/Overview/BPM.
- The result **matches B exactly**:
  - pins: `delete-selection-ui` l.144, 146, 214, 527; `grid-snap-ui` l.376, 380 (`toContain('წაშლა')`), 383; `tempo-ui` l.288; `metronome-ui` l.288;
  - false matches (left untouched): `panels.test` l.349, `detail-panel.test` l.130, `floating-video.test` l.129, `all-lane-clipboard` l.504/515;
  - other `ბოლო`/`სიგრძე` hits are unrelated phrases (ArrangementClip, DetailPanel, grid-snap-edit, detail-panel-polish);
  - `e2e/` contains no Georgian at all.
- No extra pin was found, so the stop rule was not triggered.

## 3. Changed files (git status at the end: 13 ` M` + 2 `??`, nothing else)
| File | Change |
|---|---|
| `app/lib/arrangement/strings.ts` | Added TR/NV keys to the six existing objects: playback (TR1–3), edit (TR4–10), loop (TR11–17, `braceTitle` formatter), tempo (TR18–19), metronome (TR20), view (NV1–26, formatters `overviewVisibleStart`, `fitStatus`, `zoomedToSelection`). No new object, no import, no `as`/`as const`. `zoomedToSelection` reuses the existing `StudioTimeRangeText` |
| `ArrangementTransport.tsx` | One import. l.71–74 caller shape: `range ? (range.allTracks ? deleteRangeAllTracksHint : deleteRangeHint) : null`, local `deleteHint` removed, title `?? deleteClipTitle`, aria-label `?? deleteClipLabel`. l.126/127/135/177–178/196/205/218–221/245/247/259/262/280–281/292 → module values. JSX text → `{object.key}`. Conditions and pick order unchanged |
| `ArrangementTempoRow.tsx` | New import line; l.227, 228, 245 |
| `ArrangementRuler.tsx` | One import; l.231, 440 |
| `ArrangementOverview.tsx` | One import; the `overviewValueText` body (same name and signature, calls `overviewVisibleStart` with `formatArrangementTime` values); l.282, 288 |
| `ArrangementLoopBrace.tsx` | One import; `LOOP_HINT`/`LOOP_KEYBOARD_HINT` take module values; brace title `braceTitle(span)`; edge titles. The aria-label template is unchanged |
| `StudioWorkspace.tsx` | `studioViewStrings` added to the l.83 import; l.145–147 consts take module values; l.1174, 1190–1195, 1211–1214 (Biome re-wrap onto one line), 1263–1268. **The other 23 Georgian lines are byte-identical** (a diff against `b-round-134/r135-studioworkspace-remaining-georgian.txt` is empty) |
| `__tests__/strings.test.ts` | Additive: EDIT plain map +7; V02B playback +3, loop +6, loop samples `braceTitle`; V02C2 tempo +2, metronome +1, view plain `{}` → 23 entries, `EXPECTED_V02C2_KEYS` lists extended (sorted), view samples +3 formatters. ST25 list → the 23 lines, `toHaveLength(23)`, title unchanged. New `describe('V-0.3b transport and navigation strings')` with ST26 and ST27 |
| `__tests__/delete-selection-ui.test.tsx` | l.144, 146 (the two constants, each changed once), l.214 `getByText('⌫ Delete')`, l.527 → hand-written English |
| `__tests__/grid-snap-ui.test.tsx` | l.376 `'Back to start'`, l.380 `toContain('Delete')`, l.383 `'Zoom to selection (Z)'` |
| `__tests__/tempo-ui.test.tsx` | l.288 only |
| `__tests__/metronome-ui.test.tsx` | l.288 only |
| **new** `__tests__/navigation-strings-ui.test.tsx` | NS1, NS2, NS3, NS3b, NS4 (5 `it`s) on the real `StudioWorkspace` in jsdom |
| `docs/implementation/2026/quarter-IV/110-…md` | l.4, l.132, l.136 exactly as §2 says (GATE134-DOC110-STATUS) |
| **new** `docs/implementation/2026/quarter-IV/111-…md` | Georgian, TEMPLATE sections: the TR/NV map, R1/R2/R3, the re-measurement, the facts that must survive, glossary, tests and mutations. Status Completed, naming C round 135 as still to come |

The full diff of each grant vs its start copy is in `a-round-135/granted.diff`.

## 4. `it` counts before → after
- strings 25 → **27**
- delete-selection-ui 13 → 13
- grid-snap-ui 20 → 20
- tempo-ui 12 → 12
- metronome-ui 10 → 10
- navigation-strings-ui new → **5**

No `it` was added, removed or renamed outside the new `describe` and the new file. The new file has no `skip`, `only` or `todo`, no Georgian, and no import of the strings module.

## 5. Tests actually run
- **§4 vitest list (21 files): 21 passed, 386/386 tests** (saved as `a-round-135/vitest-list.txt`; run again after the review fix with the same result).
  - granted/new: strings 27, delete-selection-ui 13, grid-snap-ui 20, tempo-ui 12, metronome-ui 10, navigation-strings-ui 5;
  - neighbours: self-disabling-focus 10, transport 12, edge-navigation 21, loop 24, grid-snap-loop-drop 36, all-lane-clipboard 14, markers-move-ui 18, tempo 10, tempo-window-ui 8, waveform-zoom 9, render-budget 7, status-announcement-ui 33, grid-snap-menu 39, grid-snap-keys 13, floating-video 45.
  - Every neighbour name exists (`transport.test.ts`, `edge-navigation.test.ts`, `loop.test.ts`, `tempo.test.ts` are `.ts`; the rest `.tsx`).
- `npm run typecheck`: exit 0.
- `npm run lint`: exit 0. It prints 218 warnings and 1 info repository-wide; these already existed, none come from the changed files.
- Read-only `npx biome check` on the 13 changed or new code/test files: "No fixes applied", no diagnostics.
- No full suite and no `npm run verify` (speed rules; that belongs to the gate).

## 6. NS coverage (§3.2)
- **NS1:**
  - back-to-start label/title; `/ end 00:10.000` (the prefix span's text);
  - split playhead title; with a clip selected, the delete title, aria-label and text;
  - Follow `on` title; zoom slider label and title; Zoom to selection label and needs-range title; zoom back empty title; Fit title;
  - tempo label and title; metronome text;
  - with a loop and no range, the Loop title TR12.
- **NS2:** one-track range → split range title, TR6 as title and aria-label, TR11, NV7. Then `extendRangeToAllTracks` → TR7 as title and aria-label; the button text is still `⌫ Delete`.
- **NS3:**
  - Z with no range → NV18; X with empty history → NV19;
  - Fit → `Fit: the entire project is visible (00:10.000). X goes back.`; title NV9;
  - range + Z → NV21 `00:03.000 — 00:05.000`;
  - X → NV22 (depth 2 → 1), title NV9; X → NV23 (1 → 0), title NV10;
  - Follow click → NV24 / title NV1; click → NV26 / title NV3.
- **NS3b (paused is reachable in jsdom):** `togglePlayback`, then a manual scroll of the scroller → `data-follow-mode=paused`, status NV17, title NV2. Follow click → `on`, status NV25, title NV3. Then playback stops.
- **NS4:**
  - ruler title NV13, playhead title NV12;
  - overview label, title, and `aria-valuetext` `Visible start 00:00.000 / 00:10.000`. After the review fix it is checked again after a scroll (test-only `clientWidth` stub 1200, 100 px/s, scrollLeft 300) → `Visible start 00:03.000 / 00:10.000`;
  - loop strip text TR13 with no loop;
  - with a loop: brace aria-label `Loop 00:03.000 — 00:05.000 · ← → nudge · Shift + ← → length`, title TR15, edges `Loop start` / `Loop end`.
- **Forward rule (§3.3):** every new key a UI reaches now has a hand-written UI literal (delete hints: `delete-selection-ui` + NS2; labels: `grid-snap-ui`, `tempo-ui`, `metronome-ui`; the rest: NS1–NS4/NS3b). No gaps.

## 7. Mutations (each turned the named tests red, then was restored and checked by sha256)
| Mutation | Red |
|---|---|
| m30 `deleteRangeAllTracksHint` without ` on all tracks` | ST6, `delete-selection-ui` "titles the transport delete button for a clip, a range and an all-lane range", NS2 |
| m31 Transport `range.allTracks` picks swapped | `delete-selection-ui` (same `it`), NS2 |
| m32 StudioWorkspace Follow `next === 'off'` picks swapped | NS3 |
| m33 `fitStatus` without `({extent})` | ST26, NS3 |
| m34 Transport Zoom-to-selection title picks swapped | NS1, NS2 |
| m35 `FOLLOW_PAUSED_MESSAGE` back to Georgian | ST25 |
| m36 metronome text back to `მეტრონომი` | ST27, `metronome-ui` UI1 (the l.288 `it`) |
| m37 (extra, after the reviewer Low) `overviewVisibleStart` ignores `start` | NS4 |

`sha256sum -c` after the restores: strings.ts, ArrangementTransport.tsx, StudioWorkspace.tsx and ArrangementTempoRow.tsx all OK (and strings.ts again after m37).

## 8. code-reviewer (real subagent run, `code-reviewer`)
- **Verdict 9/10, ready for C.** No Critical, High or Medium findings.
  - Behaviour is preserved: all ternaries keep their condition and order, removing `deleteHint` is equivalent, no handler, key, class or focus line changed.
  - The module contract holds: no import, no new object, no assertions, formatters take already-formatted values, no cycle or `undefined` risk.
  - All facts in §1.1 survive.
- **Low (fixed this round):** NS4 checked the overview `aria-valuetext` only at scroll 0. Fixed with a post-scroll check; m37 proves it. This review ran on the diff before that test-only addition.
- **Info (not changed):**
  - NS1 finds back-to-start by position (brittle, but its exact-label assertion fails loudly).
  - `grid-snap-ui` l.380 `toContain('Delete')` is meaningful because GS14 runs with no range.
  - "centre" is the British spelling (dictated by the spec, matches `centreTimelineView`).
- **Pre-existing, for B (wording, not a bug of this round):** TR13 says `(Ctrl+L)` while TR11/TR12 say `(Ctrl/Cmd+L)`. This came from the Georgian originals and the spec preserved it. B may rule on making the key text the same everywhere in a later round.
- **Architecture note (proposal for B/root, not acted on):** Signal 3 (repeated costly change). `strings.ts` grows every round, and `studioViewStrings` went from 1 to 27 keys. **Keep for now:** it is a leaf module with no coupling risk, and the cost sits mostly in the size of `strings.test.ts`. After V-0.3d, consider a bounded, behaviour-preserving split into `strings/<area>.ts`, keeping `~/lib/arrangement/strings` as the only re-export path and splitting the ST maps per area. This lines up with the still-unanswered strings-split checkpoint (e–g).

## 9. Every shell write
- **Inside `store/` (temporary, all restored and checked by sha256):** the m30–m37 mutations via `sed -i` / python on `strings.ts`, `ArrangementTransport.tsx`, `StudioWorkspace.tsx` and `ArrangementTempoRow.tsx`, each restored with `cp` from `/tmp/a135-mut/`.
- **Outside `store/`:**
  - `/tmp/a135-pregrep.txt`, `/tmp/a135-transport.tsx` (a prepared Transport version), `/tmp/a135-mut/*` (backups);
  - loop folder: `a-round-135/pregrep.txt` (cp), `a-round-135/vitest-list.txt`, `a-round-135/granted.diff`, `a-round-135/end-sha256.txt`, `a-round-135-checkpoint.md` (a heredoc overwrite of my own checkpoint).
- All lasting `store/` edits were made with Edit/Write.

## 10. Deviation / incident (reported honestly)
- While editing `ArrangementTransport.tsx` I mistakenly called Write with the content `PLACEHOLDER`, which briefly overwrote the file. I restored it right away with Write, using the full intended content prepared in `/tmp/a135-transport.tsx`. The sha256 is identical (`6fdc7aef…`), and the file diffs against the start copy only in the §2 lines.
- The window was a few seconds. The running dev server may have tried to hot-reload the broken file in that window; it still returns 200 for `/studio-lab`. No other file was affected, and nothing was reverted.
- C can confirm with AN-REVIEW on `granted.diff`.

## 11. End state
- `git status`: 13 ` M` + 2 `??` (the new test file and doc 111), no other path. HEAD is unchanged (`16533c1`).
- Frozen list: OK at the end. Protected files: `git diff 16533c1` is empty (`studio.$productId.tsx`, `api.studio-token.ts`, `auth.ts`, `AuthContext.tsx`, `Modal.tsx`).
- End sha256 of the 15 paths: `a-round-135/end-sha256.txt`:
  - strings.ts `cfca5358…`
  - ArrangementTransport `6fdc7aef…`
  - ArrangementTempoRow `efd9a840…`
  - ArrangementRuler `596ed6bf…`
  - ArrangementOverview `cca5f04d…`
  - ArrangementLoopBrace `d9cf52b3…`
  - StudioWorkspace `e6a0299e…`
  - strings.test `64acd29b…`
  - delete-selection-ui `84a2fb4f…`
  - grid-snap-ui `5e37f9ce…`
  - tempo-ui `648d19d7…`
  - metronome-ui `3e24ece2…`
  - doc 110 `4313d959…`
  - navigation-strings-ui `49d44ec1…`
  - doc 111 `4a1acfcc…`

## 12. Acceptance self-assessment (A level only)
- **Passed at A level:**
  - the §4 checks (typecheck, lint, scoped Biome, the 21-file vitest list);
  - m30–m36 (plus m37);
  - the code-reviewer was run and its Low addressed;
  - the scope and frozen checks;
  - the §1.1 texts exactly (ST maps + NS);
  - ST25 = 23;
  - ST27 = 0 Georgian in the five components.
- **Not claimed:** every C browser row (TRANSPORT, FOLLOW, ZOOM-FIT, RULER-OVERVIEW, LOOP, TEMPO, GEO-COUNT, LAYOUT, REG-134, G135-3, PX-NET/REG-HYD) and every gate row. The whole backlog is **not** complete.

## 13. Known gaps / notes for C and B
- **Accepted mixed surface (named in the task, not a bug):** the range readout under the lanes stays Georgian (`… Delete = წაშლა …`) next to the English `⌫ Delete` button; MarkerRow/MarkerMenu stay Georgian (V-0.3c); the other 23 StudioWorkspace lines wait for V-0.3d.
- **Width risk (RV-1):** `⌫ Delete`, `Metronome` and `/ end` change widths. The tempo row sits in the fixed-width header, so watch for overflow at 1280×720.
- jsdom has no layout, so the NS tests do not prove any visual or effect behaviour (Follow really following, Fit/Z real scroll). That is for C.

## 14. Exact next C checks
1. T135-TARGETED: the §4 list above → expect 21 files / 386 tests green.
2. SOURCE-SCOPE: `git status` (13 M + 2 ??); `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-134-r135-tree-sha256.txt`; protected `git diff 16533c1` empty; compare against `a-round-135/end-sha256.txt` (no change during C).
3. AN-REVIEW: `a-round-135/granted.diff`, the new test, doc 111. Check the Transport file in particular, given the incident in §10.
4. Browser at 1440×900 and 1280×720, finding controls by `data-testid` and role (not by Georgian text):
   - TRANSPORT (a–d);
   - FOLLOW (paused during playback → NV2/NV17 → NV25 → NV24 → NV26);
   - ZOOM-FIT (NV18, NV19, NV20, NV21, NV22 → NV23, NV9 ↔ NV10);
   - RULER-OVERVIEW (valuetext changes with the scroll; ruler double-click = Fit);
   - LOOP (brace aria-label, title, edges, ArrowRight 0.1 s, Shift+ArrowRight length);
   - TEMPO (BPM 120 keeps clip start and width);
   - GEO-COUNT, subtracting by name;
   - LAYOUT (overflow in the transport bar and tempo row at 1280);
   - REG-134, G135-3, PX-NET/REG-HYD.

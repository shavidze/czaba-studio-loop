# A — Round 89 report: R88-FOCUS-ESCAPE-RENDER (stop-based Tab trap, D-29z54)

Implementer: A (Claude Opus 5.5) · Date: 2026-10-22 · Task: `current-task.md` (round 89)

## Pre-flight (run before the first edit)
- **Assumptions:**
  - The bug is only the element-based trap (a native radio group is one Tab stop).
  - The format radios stay enabled during a render (D-29z52).
  - No other dialog behaviour changes.
- **Smallest version:** a ~35-line pure module and a ~20-line handler body.
- **Files, and why each:**
  - the module (G1 grant);
  - the dialog handler (G2, where the trap lives);
  - the new test (required IDs);
  - doc 077 (status and record).
- **Primitives read:** AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS. Prompts read: new-test, studio-feature.
- **Success:**
  - the new test and the targeted vitest list are green;
  - typecheck, lint and scoped Biome are clean;
  - the Playwright smoke shows focus never leaving the dialog.
- **Test file name:** it follows B's grant (`export-dialog-tab-stops.test.tsx`) rather than AGENT_DISCOVERABLE_CODE rule 7 (`dialog-tab-stops.test.ts`). B's grant wins; this is noted for future reviewers.

## Scope completed
- **G1:** new pure module `app/lib/arrangement/dialog-tab-stops.ts` with exactly two exports:
  - `groupDialogTabStops`: radios with the same non-empty `name` share one stop; an empty-name radio or any other element is its own stop; stops are ordered by their first member.
  - `dialogTabStopFocusTarget`: returns the checked radio, else `stop[0]`, else `null`.
  - It makes no DOM queries and uses no type assertions; narrowing is by `instanceof HTMLInputElement` and `.type === 'radio'`.
  - The private helper is `radioGroupNameOf`.
- **G2:** `ArrangementExportDialog.tsx` has one new import, and only the body of `handleDialogTabKey` changed.
  - Not-in-focusable → the target of the first or last stop.
  - Shift+Tab in the first stop → the last stop's target.
  - Tab in the last stop → the first stop's target.
  - A `null` target → no `preventDefault`.
  - Every other Tab stays native.
  - The selector, `exportDialogFocusableElements`, the effects, the radios (format radios still enabled during a render), texts and layout are unchanged.
- **Doc 077:** l.4 now has the exact text from the task, and three Round-89 lines were added (files / Problem → Solution / testing). Nothing else changed. CR=0.

## Changed files (end sha256)
| File | State | sha256 |
|---|---|---|
| `app/lib/arrangement/dialog-tab-stops.ts` | new (??) | `ef40bc64…` |
| `app/components/arrangement/ArrangementExportDialog.tsx` | M (G2 only) | `41e4b11d…` |
| `app/lib/arrangement/__tests__/export-dialog-tab-stops.test.tsx` | new (??) | `0c224abd…` |
| `docs/implementation/2026/quarter-IV/077-studio-lab-export-progress-and-worker.md` | ?? (l.4 + 3 lines) | `c9428e0e…` |

Full hashes: `a-round-89/end-hashes.txt`.

**End state:**
- HEAD `971141d`; **7 M + 13 ??**. The only new lines are the two expected `??` entries.
- Frozen list `b-round-88-r89-tree-sha256.txt`: **506/506 OK**.
- `Modal.tsx` `741c2341`, `ffmpeg.ts` `0995ae78`, StudioContext `caa388e7` are unchanged.
- No protected or auth file was touched. No server was started or stopped. No stash, reset, checkout or `--write` was used.

## Tests actually run
- `npm run typecheck`: exit 0.
- `npm run lint`: exit 0. The warnings are pre-existing and none are in owned files.
- `npx biome check` on the 3 owned code files (no `--write`): clean.
  - One format diff in `dialog-tab-stops.ts` (a line wrap) was fixed by hand.
- New test file: 14/14 (TS1 ×4, TS2 ×4, TR1–TR6).
  - Frozen `export-dialog-focus`, `-focus-restore` and `-footer` are green: 47/47 across the 4 files.
- **Targeted list** `a-round-89/targeted-list.txt` (round-88 list + the new file, 52 files): **52 passed, 933 tests passed**, run on the final tree. Output: `a-round-89/targeted-result-final.txt`.
- **Mutation proofs** (scratch copies `a-round-89/mut/<id>/`, node_modules symlinked; script `a-round-89/scripts/mutate.mjs`; outputs `a-round-89/mut-*.txt`; re-run after the review edits):

  | Mutation | Red tests | Killed |
  |---|---|---|
  | orig = round-88 dialog snapshot | TR1, TR2, TR4 | yes |
  | (a) element-based `last` for Tab | TR1, TR2 | yes |
  | (b) group radios by type only | TS1 ×2 | yes |
  | (c) target always `stop[0]` | TS2, TR4 | yes |
  | (d) Shift path element-based | TR4 | yes |
  | (e) over-trap every Tab | TR5, TR6 | yes |
  | (f) not-in-focusable Shift → last element | TR4 (trap-wrapper part) | yes |

- **A's own Playwright smoke** (not C evidence). Script `a-round-89/pw/smoke89.cjs`, output `a-round-89/pw/smoke-output.json`, state file `tmp/studio-real-loop/a-browse.json`, server `:5173`.
  - Setup: fresh page per run, 5M recipe, the export button focused and Enter pressed. During the render: Tab ×6, then Shift+Tab ×4.
  - 1280×720 and 1440×900, WAV and MP3 (MP3 picked with ArrowDown): **0 escapes**. All **40/40 presses were valid**: the busy button read `მიმდინარეობს…` both before and after each press.
  - The first press started inside the dialog on an element that is not a control. Its probe label is a `textContent` fallback (`Exportმთელი…`). That is consistent with the trap wrapper (frozen l.444), but the probe did not record `tagName`/`tabIndex`; a later probe should. After it, the sequence was X → checked radio → X … for both Tab and Shift+Tab.
  - Shift+Tab from X went to the **checked** radio (`format-wav` / `format-mp3`).
  - `.wav` / `.mp3` downloaded, the URL was unchanged, and there were 0 non-noise console errors.

## B acceptance criteria actually passed by A
- G1 and G2 are implemented as specified.
- Expected end state 7 M + 13 ??, frozen 506/506.
- Required tests TS1, TS2, TR1–TR6 are present and green; every frozen test stays green.
- Mutation proofs (a)–(f) are each killed.
- typecheck, lint and scoped Biome are clean.
- A's smoke at both viewports ran.
- The code-reviewer ran (below).
- **I do not claim any C row** (TRAP-*, PX-KEYS-R2, IDLE-ORDER, FOCUS-NOT-OBSCURED-R, VIS-RENDER-S, PX-NET, REG-HYD, G89-3). Gate rows (full vitest, build, verify, e2e smoke) were not run by A, per the speed rules.

## Code-reviewer (actual `code-reviewer` subagent): score 8/10, no Critical or High findings
- **Addressed:**
  - (Low) A pending render could leak if an assertion fails between start and stop → `afterEach` in the render describe now rejects and clears `offlineRender.reject`.
  - (Low) Naming → the private helper is renamed `namedRadioGroupName` → `radioGroupNameOf`.
  - (Medium) "jsdom does not test real Tab" → covered by A's Playwright smoke above. C's real-browser rows remain the evidence.
- **Not changed, for B (each conflicts with B's explicit G1 contract or the required TS1 case):**
  - R89-REV-L1: with no checked radio, both directions land on `stop[0]`. In Chromium, Shift+Tab into an unchecked group lands on its last member. This is unreachable here, because both groups always have a checked radio.
  - R89-REV-L2: grouping is by `name` only. Browsers also use the form owner and tree root. Unreachable here (no `<form>`).
  - R89-REV-L3: a checked radio that is disabled is filtered out upstream, so the stop falls back to `stop[0]`. Chromium would skip the group. Unreachable here (the format radios stay enabled).
  - R89-REV-L4: the TS1 split-group case puts the stop at the first radio's position. A browser uses the checked radio's position. The case is required by the task.
  - R89-REV-L5: ~100 lines of fakes and harness are duplicated from `export-dialog-focus.test.tsx`, as the task instructed. A shared fixture is suggested.
- **Architecture note (verbatim from the reviewer, for B; a proposal only, not done):**
  > Signal 3 (one region changed repeatedly at high cost): the focus region of `ArrangementExportDialog.tsx:125-220` has been changed in rounds C-R13-03, R14-U, C-R14-02, C-R15-03/D-29g, R88 and R89. Every Tab test needs a full `StudioWorkspace` mount plus fake AudioContext and OfflineAudioContext. Keep this round: the change is one handler and the frozen tests pin its behaviour. Proposal for the planner (not a fix for this round): one bounded task to move the opener-restore, initial-focus, Tab-trap and footer `focusin` effects into a hook, e.g. `useExportDialogFocusTrap(contentRef, trapRef, closeRef, footerRef, { isOpen, isRendering })`. Test it with a small DOM-only harness. Acceptance: `export-dialog-focus.test.tsx`, `export-dialog-footer.test.tsx` and `export-dialog-tab-stops.test.tsx` stay unchanged and green. Placement: `dialog-tab-stops.ts` is a general dialog helper sitting under `lib/arrangement/`. If a second dialog needs it, move it to a shared `lib/` location. This is about placement, not a defect. Alternative: make the background `inert` (or a native `<dialog>` with `showModal()`); keep the current approach for now because the shared Modal is not built on `<dialog>` and frozen tests pin the keydown behaviour; `inert` would be a separate, Modal-wide task.

  This matches signal ARCH-R88-EXPORT-DIALOG-FOCUS-HOOK / checkpoint request q14.

## Known gaps
- No C browser evidence yet. Every §5 row is open for C.
- Production bundle (worker + MP3) was not checked by A; it belongs to the root gate (PROD-MP3-UNVERIFIED).
- Reviewer residuals R89-REV-L1..L5 (above) are unreachable in this dialog today.
- **Housekeeping for root:** `a-round-89/mut/*` holds scratch copies of `app/` with `node_modules` symlinks into `store/node_modules`. The vitest cache may have been written via those symlinks into `store/node_modules/.vite`. No tracked file is affected.

## Exact next C checks
1. SOURCE-UNCHANGED: HEAD `971141d`; 7 M + 13 ??; `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-88-r89-tree-sha256.txt` → 506/506; `a-round-89/end-hashes.txt`.
2. TRAP-WAV and TRAP-MP3 on a fresh page at both viewports, with HR-RENDERING per press: Tab ×6, then Shift+Tab ×4. Shift+Tab from X must land on the checked radio.
3. TRAP-BOTH (1440): X ↔ `format-both`.
4. PX-KEYS-R2: C's round-88 V1 exactly (range 4–9 s, first MP3 of the session, Enter / ArrowDown / Tab / Enter, then 3 Tabs). Then Escape after done → toolbar Export.
5. IDLE-ORDER, both directions (X → checked format → checked scope → Close → Export → X).
6. FOCUS-NOT-OBSCURED-R in the three states, plus VIS-RENDER-S (1280), PX-NET, REG-HYD and G89-3.
7. T89-TARGETED: `npx vitest run $(cat ../tmp/studio-real-loop/a-round-89/targeted-list.txt)` → 52 files.

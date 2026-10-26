# CURRENT TASK — Round 182: M3 — library rows get 4 px of space between them

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-26 · Decision: **D-29z147** (`backlog.json` → VISUAL-A-OBSIDIAN `m3_plan_d29z147`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-181.md` is an exact copy of the round-181 `current-task.md` (sha256 `7bc0b57b…`, checked with `cmp`). The rationale for this round is in `b-round-181.md`.

## Baseline = HEAD `f1782f8` (gate 181 published)
- **Gate:** `gates/gate-round-181.json` is `published`, commit `f1782f8`, on both remotes. `git status` is clean, with 1006 tracked files.
- **Start state:** the tree equals `c-round-181/end-tree-sha256.txt` (1006 files). B checked this with `sha256sum -c` at planning time and got OK.
- **Frozen list:** `b-round-181-r182-tree-sha256.txt`, **1003 entries** (1006 minus the 3 grants). B checked it: OK.
- **Grants:** `b-round-181-r182-grants.txt` (3 existing files). **New file:** `b-round-181-r182-new-files.txt` (1 file; it does not exist yet).
- **Start hashes:** `b-round-181-r182-granted-start-sha256.txt`. **Start copies:** `b-round-181/r182-granted-start/`.
- **Vitest base:** `b-round-181-r182-vitest-base.txt` lists 17 files: every suite that mounts the library rows, every suite that reads `ArrangementLibrary.tsx` as source, and `strings.test.ts`. On the start tree they give **328/328** (B's run: `b-round-181/out/vitest-base-r182.json`).
- **A's first step:** check that HEAD is `f1782f8`, that `sha256sum -c --quiet b-round-181-r182-tree-sha256.txt` is OK, and that the 3 start hashes match. If anything differs, stop and report.

## 0. Why this round (D-29z147)
- **Round 181: C PASS, 0 bugs.** `browserVerified` and `realVerified` are both true. Root published it as `f1782f8`. **M1 → მზადაა.**
- **Regression is not due yet.** `regression-last.json` is dated 2026-10-24, and today is 2026-10-26: 2 days, below the 3-day threshold. Any planning on or after 2026-10-27 makes the next round the **REGRESSION round**, expected to be round 183.
- **Bug gate:** no Critical, High or Medium finding is open. The decision files are unchanged (B re-hashed them at this planning): `user-review/ableton-decisions.md` (`3b132399…`), `user-review/design-ux-decisions.md` (`0da40d98…`) and `docs/technical/store-redesign/direction-decision.md` (`b8494bb4…`).
- **Next in the VISUAL-A order is M3.** It is approved in `visual-direction-a.md` §M (2026-10-21, `approved_moves.M3`): *"Spacing between library entries +4 px. Reason: the serif name needs more air. Impact: fewer entries are visible in the list."*
- **The rationale no longer holds; the approval does.** The serif display role was later dropped by Saba (V-2b-DISPLAY `decided_user`: no serif in Studio). The move itself was approved on its own line, and B has no authority to drop an approved request. So B schedules it as written and puts it on the vetoable list in `feature-status.md`. Saba can veto it; if he does, a later round reverts one class.
- **The spec's "fewer entries visible" impact does not show at the two user viewports.** B measured the demo library (9 rows) in real Chromium: 6 rows stay fully visible at 1440×900 and 3 at 1280×720, before and after (`b-round-181/out/library-probe.json`).
- **Architecture checkpoint:** `b-round-180-checkpoint-request.md` is still unanswered. It is not re-requested; it stays non-blocking, and fallback (c) applies. A's round-181 Architecture note was "none".

## 1. What changes (exact; line numbers are on the start tree)
Today the listbox (`ArrangementLibrary.tsx` l.594–600) is `cn('min-h-0 min-w-0 flex-1 overflow-y-auto p-1', STUDIO_SCROLLBAR_CLASS)`. Its option buttons (l.98–101, `'flex w-full flex-col rounded-md px-2 py-1.5 …'`) sit directly against each other, with a 0 px gap.

| ID | File : line | Change |
|---|---|---|
| **L1** | `ArrangementLibrary.tsx` l.597 | The listbox class becomes `cn('min-h-0 min-w-0 flex-1 space-y-1 overflow-y-auto p-1', STUDIO_SCROLLBAR_CLASS)`. `space-y-1` puts `margin-block-end` 4 px on every option except the last (Tailwind 4.1.18; `--spacing-1` = 0.25rem in `app/styles/app.css` l.34). Nothing else changes. |

**Constraints:**
- The option button class (l.98–101), its padding (`px-2 py-1.5`), its radius, its hover / selected fills, its children and its handlers are unchanged. **Row height is unchanged; only the gap between rows grows.**
- The listbox stays a block container. **Do not use `flex flex-col gap-1`.** Inside this `overflow-y-auto` list, flex items could shrink instead of scrolling.
- Do not change the tree nav, the search block (`space-y-1.5`, l.463), the preview panel, `studio-scrollbar.ts` or any other component.
- No new token, and no change to `app/styles/`.

**Rulings (B, vetoable, recorded in `backlog.json`):**
- **R41, gap, not padding.** "Spacing between entries" reads as space between the row rectangles. Adding padding inside each row would instead make every hover and selected rectangle 4 px taller. The gap keeps each row's highlight box exactly as it is today.
- **R42, the gap is not a hit target.** A click or drag that starts in the 4 px gap lands on the listbox and does nothing. That is the expected cost of a real gap, recorded as info.
- **R43, the last row gets no margin.** The list's existing `p-1` bottom padding stays the only space after the last row.

**B's layout prediction.** This is an in-page simulation from `b-round-181/tools/library-probe.cjs` (output in `b-round-181/out/library-probe.json`). It ran on the clean `f1782f8` tree, so its "now" values are valid HEAD values. It is a prediction, not evidence.

| Viewport | Listbox rect (unchanged) | Option heights (unchanged) | First option y | Option *n* (0-based) y | Gaps | scrollHeight | Fully visible |
|---|---|---|---|---|---|---|---|
| 1440×900 | (144, 233) 144×431 | 66.5, 66.5, 47.3, 47.3, 80.3 ×5 | 237, unchanged | HEAD y + 4·n | 0 → 4 (8 gaps) | 637 → 669 | 6 → 6 |
| 1280×720 | (144, 271) 144×213 | same | 275, unchanged | HEAD y + 4·n | 0 → 4 | 637 → 669 | 3 → 3 |

**Outside the listbox, 0 px change:** the library aside, the tree nav, the search, the preview region, the transport, the lanes and every other panel. When the list is scrolled to the end, the last row's bottom sits about 4.3 px above the list bottom (the `p-1` padding). The scrollbar thumb gets shorter because scrollHeight grows, but it stays inside the listbox rect.

## 2. Tests and docs (A)
**No new test file.** Add one test to the existing `library-row-strings-ui.test.tsx`, which already has the `mountRows` / `libraryRow` helpers and the class-token helpers. Do not create another fakes harness: that is the cost named in the checkpoint request.

| ID | File | Change |
|---|---|---|
| **T1 = new test `LGS1`** | `library-row-strings-ui.test.tsx`, a new `it` in the `library button surfaces (V-3c-4c-1)` describe block, after LBS1 (or a new `describe('library row spacing (M3)')` with the same `beforeEach` / `afterEach`). B grepped the repo: no `LGS` id exists. | Mount with `mountRows()`. Get the list with `view.getByRole('listbox', { name: studioLibraryPanelStrings.listLabel })` (import the strings object if it is not imported yet). **Assert:** (a) the listbox tokens include `space-y-1`, `p-1` and `overflow-y-auto`, and exclude `space-y-0.5`, `space-y-1.5`, `space-y-2`, `gap-1`, `flex` and `flex-col`. (b) There are at least 2 options, and every option's tokens include `px-2`, `py-1.5` and `rounded-md`, and contain no token matching `/^-?m[tbyl]?-/` (no margin class on a row). (c) After a click selects a row (`aria-selected="true"`), (a) and (b) still hold. Do not assert pixel geometry: jsdom has no layout, and the 4 px is C's browser row. Use token checks only, with no colour-class selector. |
| **D1** | doc 149 | l.4 status → `Completed`. At l.74–75, strike the two TODOs and mark them done: C round 181 PASS, published `f1782f8`; BEHAVIOUR-M1 toggled exactly once, the same as HEAD. At l.76, change the next step to "M3 (round 182), then the REGRESSION round." Nothing else changes. |
| **D2** | **new** `docs/implementation/2026/quarter-IV/150-studio-m3-library-row-spacing.md` | Georgian, with the `docs/implementation/TEMPLATE.md` sections. Include L1, R41–R43, the rationale note from §0 (serif dropped, move kept, vetoable), the prediction table, LGS1, mutations m304–m307 and the §6 Ableton row. Status: `In Progress (awaiting C round 182)`. |

## 3. A — files you own (everything else is frozen)
- **The 3 grants**, only at the sites in §1–§2: `ArrangementLibrary.tsx` (l.597 only), `library-row-strings-ui.test.tsx` (the new LGS1 test, plus at most one import line) and doc 149.
- **The new file:** doc 150.
- **Protected, byte-identical:**
  - every other component and test, including `ArrangementLibraryPreview.tsx`, `StudioWorkspace.tsx`, `studio-scrollbar.ts`, `strings.ts`, `strings.test.ts`, `affordance-colour-ui`, `label-status-colour-ui`, `mode-toggle-colour-ui` and `panel-radius-ui`;
  - `app/styles/`, `collection.ts`, `library.ts`, `root.tsx`, and every route, including `studio.$productId.tsx` and `studio-lab.tsx`;
  - `app/components/studio/*`, `app/components/common/*` (including `CookieConsent.tsx`), the contexts, `app/lib/auth.ts`, `firebase.client.ts`, the purchase / download / studio-token files, `e2e/` and `.claude/**`.
- **Process rules:**
  - Read the primitives first: `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `AGENT_DISCOVERABLE_CODE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`, `.claude/prompts/new-test.md` and `docs/implementation/TEMPLATE.md`.
  - Make every lasting edit with Edit/Write. Use shell writes only for the temporary mutations, and restore and sha-check after each one.
  - Write `a-round-182/end-sha256.txt` (4 paths) and `a-round-182/diff-vs-start.patch` (the 3 grants against `b-round-181/r182-granted-start/`, plus doc 150 in full).
  - Helper scripts go under `a-round-182/tools/`; run them with cwd = store. No commit, no push.

## 4. A — tests and commands (speed rules)
- **Before the edits:** run `b-round-181-r182-vitest-base.txt` (17 files). Expect **328/328**. Any other result is a stop.
- **After the edits:** run the same 17 files and write the list to `a-round-182/vitest-files.txt`. Expect **329/329**: the base plus LGS1.
- **Checks:** `npm run typecheck`, `npm run lint`, and `npx biome check` on the 2 code/test files. A formatter reflow is allowed.
- **Code review:** 4 changed or new files, so ask the `code-reviewer` subagent. Pass its Architecture note to B verbatim.
- **Not A's:** the full suite, `npm run verify`, the build, e2e and the browser rows.

### 4.1 Mutations
These are temporary shell edits to `ArrangementLibrary.tsx`. Restore and run `sha256sum -c` against A's end hashes after each one. Write one JSON + diff per mutation in `a-round-182/mutations/`.

| ID | Mutation | Must turn red | Must stay green |
|---|---|---|---|
| m304 | L1: remove `space-y-1` | LGS1 | the other 16 base files |
| m305 | L1: `space-y-1` → `space-y-2` | LGS1 | the other 16 base files |
| m306 | **Keep** `space-y-1` and add `mb-1` to the option class (l.99) | LGS1, through assertion (b) only (no margin token on a row) | the other 16 base files |
| m307 | **Keep** `space-y-1` and change the option `py-1.5` → `py-2.5` | LGS1, through assertion (b) only (`py-1.5` lock) | the other 16 base files |

For m306 and m307, report which LGS1 assertion failed. It must be one of the (b) assertions, not (a).

If a "must turn red" test stays green, or a "must stay green" test turns red, report it. Do not weaken anything; B rules on it.

## 5. C — rows
Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, at 1440×900 and 1280×720, with a fresh anonymous context per session. Pixel reads run at DPR 2 with `--disable-lcd-text`.
- **HEAD reference:** B's probe ran on the clean `f1782f8` tree, so `b-round-181/out/library-probe.json` (`now`) gives the HEAD library boxes. C's round-181 rest shots (`c-round-181/shots/c181-*/rest-full.png`) are the HEAD screenshots: round 181 PASS and gate 181 published exactly that tree.
- **Clean HEAD copy:** only if C needs another HEAD value. Do not share `node_modules/.vite` with the :5173 server (C-R180-HEAD-COPY-VITE-CACHE). Use a separate vite `cacheDir`.
- **Size criteria exclude the pre-existing `:active` scale of 0.98** (C-R181 note 1). Measure boxes at rest unless the row says otherwise.

| Row | What | Pass |
|---|---|---|
| **T182-TARGETED** | Re-run `a-round-182/vitest-files.txt`. | 329/329, 0 failed. |
| **SCOPE-182** | Compare the tree with `c-round-181/end-tree-sha256.txt`. Check the frozen list (1003) at C's start and C's end, and A's `end-sha256.txt`. Run `git status`. | Only the 3 grants differ, and doc 150 exists. Frozen 1003 OK. `git status` = 3 ` M` + 1 `??`. The protected diff against `f1782f8` is empty. The tree hash at C's start equals the hash at C's end. |
| **AN-REVIEW-182** | Read the diff. | `ArrangementLibrary.tsx` has exactly one changed token (`space-y-1` added at l.597); a formatter reflow is allowed. The test file adds only LGS1, plus at most one import. D1 and D2 are as written. No existing assertion is removed or weakened. No colour-class selector is added. |
| **MUT-182** (read-only) | Read m304–m307. | Each diff is the described edit, each restore sha is OK, and the red / green sets match §4.1. |
| **GAP-M3** | All 9 option boxes at rest, list scrolled to the top, at both viewports. | Gap between consecutive option boxes = 4 ±0.5 px (8 gaps). Option heights equal HEAD ±0.5 (66.5 / 66.5 / 47.3 / 47.3 / 80.3 ×5). First option y equals HEAD (237 / 275) ±0.5. Option *n* y = HEAD y + 4·n ±0.5. Computed `margin-bottom` is 4px on options 0–7 and 0px on option 8. Screenshot the list. |
| **LAYOUT-M3** | Bounding boxes of the library aside, the listbox, the tree nav, the search field, the preview region, the transport row, the first lane and the detail panel, against HEAD. | Every box equals HEAD ±0.5 px. The listbox rect is unchanged: (144, 233) 144×431 / (144, 271) 144×213. 0 elements are added or missing. Nothing wraps or goes off the viewport. |
| **RV1-M3** | Rest-state screenshot diff against HEAD. | Changed pixels only inside the listbox rect, at both viewports. 0 changed pixels anywhere else. |
| **SCROLL-M3** | Read scrollHeight. Scroll to the end with the wheel. Then, at 1280 (3 rows visible), focus the first row and press ArrowDown 8 times. | scrollHeight 669 ±1 at both viewports (HEAD 637). **Wheel to the end:** the last row is fully visible, with its bottom 4.3 ±0.5 px above the list bottom. **ArrowDown path (a separate measurement):** each press selects the next row (`aria-selected`), and the focused row is fully inside the list rect after each press. A row flush with the list edge (0 px) is accepted, because `focus()` scrolls with nearest alignment. The last press selects the ninth row. The scrollbar thumb stays inside the listbox rect. If HEAD shows the same clipping on the ArrowDown path, record it as a **pre-existing finding** with the HEAD evidence, not as a round-182 FAIL. |
| **STATE-M3** | Hover a row, select a row, and focus a row with Tab. | The hover fill box, the selected fill box and the inset focus ring all equal that row's box (no taller rectangle) at both viewports. Pixels in the gap above and below the selected row show the list surface, not the selected fill. Screenshot each state. |
| **BEHAVIOUR-M3** | 1440 required, 1280 short. Click a row; double-click a row; press Enter on a focused row; drag a row onto the Music lane; start a preview of a row. Then click in the 4 px gap between two rows. | Click selects the row. Double-click and Enter each add exactly one clip to the active track (Undo removes it). The drag creates one clip on the lane. The preview row shows the "Playing" line, and a real output tap peak is > 0 while it plays. **Info only (R42):** a click in the gap changes nothing (no selection change, no clip); report what happens. 0 pageerror. |
| **M1-NEIGHBOUR** | One short check of round 181's change, at both viewports. | Play is still 32×32 at (12, 43), name `Play`, title `Play (Space)`. |
| **G182-3** | Anonymous `/studio-lab`; `/studio/middle-east`; `GET /api/studio-token?product=middle-east&file=stem1.wav`. | `/studio-lab` opens with no `auth_user` and 0 cookies. `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`. The token request returns 401. Fake-Bearer 403 → BLOCKED (backend unavailable in cloud). |
| **PX-NET / REG-HYD** | Every session. | 0 forbidden hosts, 0 Authorization headers, 0 hydration messages and 0 pageerror. Only the expected cart noise. |

**Harness notes:**
- If the first cold load crashes, discard that run and replace it once (ENV-FIRST-LOAD).
- Every run writes a uniquely named output file. Keep screenshots under `c-round-182/`, never in `store/`.
- Disconnect old MutationObservers between runs (C-R181 harness note).
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.

## 6. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Space between browser / library rows | **None consulted.** This is a visual-density change with no behaviour, and B made no Live 12 manual or video lookup for it. | Nothing. B makes no claim about Live's browser row spacing. | A user-approved CZABA visual move (M3, 2026-10-21). Its serif rationale was dropped later; the move is kept and vetoable (§0). | GAP-M3. Parity: **არ ეხება** (not applicable; no Ableton claim) |
| Library keyboard and selection behaviour | Unchanged by this round. | — | Unchanged. | BEHAVIOUR-M3 / SCROLL-M3 as a regression check only |

## 7. Evidence and reporting
- **A:** `a-round-182.md` and `a-round-182/`.
- **C:** `c-round-182.md`, `c-round-182.json` (`browserVerified`, `realVerified`, `passed` / `failed` / `blocked` / `gate`) and `c-round-182/`.
- **Both:** write the report files as you go.

## 8. Outcome, fixed in advance (B at round 183 planning)
| Condition | Round 183 |
|---|---|
| **C PASS** | Root publishes round 182, and M3 → **მზადაა** (vetoable). If B plans on or after 2026-10-27, round 183 is the **REGRESSION round**. It gets one short check at both viewports for every done / c_pass item, including M1 and M3, plus `npm run test:e2e:smoke`, C-R167-METRONOME-UNDER-MUTE and REG-DUX5-PLAYHEAD-RESCAN. **M4** follows it. |
| C FAIL at Medium or above in L1, or a move outside the §1 prediction | A bounded fix-up by the same owner in the same files. |
| C FAIL on Lows only | A fix-up if it is in this round's files and cheap; otherwise `deferred_low_polish`, and publication goes ahead. |
| A browser row could not run | `browserVerified=false` → M3 is not done, and B re-plans that browser half. |

## 9. Root notes
- **Gate (on C PASS):** publish round 182 against `f1782f8`: the 3 grants plus doc 150. Every protected file in §3 stays unchanged.
- **Architecture:** `b-round-180-checkpoint-request.md` is still unanswered (Q1 recipe extraction, Q2 test infrastructure together with ROOT-RECON-GRID-HARNESS, Q3 order). It is non-blocking, and fallback (c) applies.
- **Forward note on M4** (the cookie banner must not cover the Studio panels on `/studio-lab`): the banner is `app/components/common/CookieConsent.tsx` (`fixed bottom-0 … z-50`). It is mounted for every route in the protected `app/root.tsx` l.161. The M4 task will need a grant decision on a Store-shared file, and a Store-page screenshot check. B will plan it after the regression round.

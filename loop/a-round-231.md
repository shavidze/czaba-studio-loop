# A — round 231 report: SABA-B-8 CALM-2b (+ RT-FIX-231 docs)

**Status:** implemented; handed to C. No STOP. code-reviewer ran (8/10, 0 Critical); findings handled in §6.
No commit, push or deploy. Protected files untouched (`git diff --quiet HEAD` rc 0 on studio.$productId.tsx, api.studio-token.ts, account.downloads.tsx, download-routes.test.ts, auth.ts, AuthContext.tsx).

## 1. Start checks (task §4.1)
- HEAD `5da0f506a8d09d851cf34fe7d663b1c4a223b2eb`; `git status --short --untracked-files=all` empty.
- `sha256sum -c --quiet`: tree list rc 0, granted-start rc 0, root-files rc 0.

## 2. Changed files (exactly the grants)
`M` (18): grants 1–18 of task §0.1. `??` (3): N1 `app/lib/arrangement/library-notice.ts`, N2 `app/lib/arrangement/__tests__/library-notice-ui.test.tsx`, N3 `docs/implementation/2026/quarter-IV/179-calm-2b-detail-library-firstrun.md`.
- Grants 1–14: B's `b-round-230/precheck-scratch.diff` applied as-is (`patch -p1`, clean), then one A change in N1: `writeLibraryNoticeDismissed` returns `void` instead of an unused `boolean` (behaviour identical).
- Extra hunks beyond the reference diff (all permitted by §0.1/§2.7):
  - `strings.test.ts`: new describe/case **ST-C2b** at the end.
  - `collection.test.ts`: new **PC10** + `findStudioShortcut` import. Origins typed as `Array<Parameters<typeof workspaceCollectionCopy>[0]>` (no `as const`).
  - `detail-panel-reason.test.tsx`: `NONE_HINT` const + new **RF7**.
  - `lane-strings-ui.test.tsx`: LSU8 one extra line (`videoSoloTitle`) + new **LSU9** (full variant: steps 1–5 incl. fold, plus reviewer-requested checks: a clip on SFX while Music is active → 0 hints; OS file drag and library drag (`LIBRARY_DRAG_MIME`) over Music → 0, after dragleave → 1). Adds the `LIBRARY_DRAG_MIME` import.
  - `library-notice-ui.test.tsx`: LN1 mounts id `ln1-demo` (demo collection spread); only LN2 uses `studio-lab-demo`, so no test depends on order (passes under `--sequence.shuffle`, seeds 1–3).
  - doc 178: l.4 → `**სტატუსი:** Completed (C round 231 PASS)`; exactly one sentence (GATE229-S5) as one bullet in `## პრობლემები და გადაწყვეტები`.
  - doc 170: l.4 → `**სტატუსი:** Completed (C round 221 PASS)`; nothing else.
- End files: `a-round-231/changed-end-sha256.txt` (21 paths), `a-round-231/granted-hunks.diff` (diff vs `b-round-230/granted-start/`, new files vs /dev/null).
- After the end hashes: frozen tree list rc 0, root-files rc 0.

## 3. Tests actually run
- `npm run typecheck` rc 0 (`a-round-231/typecheck.log`).
- `npm run lint` rc 0; 205 warnings repo-wide, **0 in granted/new files** (`biome lint --max-diagnostics=500 app` filtered by grant paths).
- `npx biome check` on grants 1–16 + N1–N2 (18 app paths): clean (N2 needed one formatter reflow, applied with `--write` on N2 only).
- Covering set (`a-round-231/covering-files.txt`, 29 files = B's 19 pre-check files + N2 + `studio-lab-demo` + L40 grep extras [delete-selection-ui, fader-guards, floating-video, library-focus-handoff, library-video-return-focus, studio-theme-obsidian, track-group-collapse-ui, track-groups-ui] + string grep extra `demo-synth.test.ts`): **29 files, 562 tests, all green** (`covering-run.log`, `covering-run.json`).
- **L31/L32 timing:** no test above 50 % of its timeout. Slowest: CP12a–d 4.4–4.8 s of a declared 30 s (`{ timeout: 30_000 }`; gate-229 `verify.log` 6.1–6.9 s → ≤ 23 %). Default-5 s tests: max UC5 1,710 ms (34 %), TG1 1,542 ms, LRS4 1,037 ms. Files I added rows to: lane-strings-ui max LSU1 356 ms; detail-panel-reason, strings, collection all < 400 ms.
- New cases: ST-C2b, PC10, RF7, LSU9 (variant: **full, 1–5 incl. fold**, + drag and SFX-clip checks), LN1–LN6. All green.
- Final covering run after the review fixes: **29 files / 562 tests green**; LSU9 845 ms, LSU1 1,018 ms (20 %); CP12a–d 4.9–5.5 s of 30 s (≤ 18 %; gate 229 ≤ 6.9 s, 23 %). `typecheck` rc 0, `lint` rc 0, Biome on 18 app paths clean.
- LN6 note: jsdom does not turn Enter into a click, so LN6 fires `keyDown Enter` (proves the global handler ignores the button; a control Enter on `body` then adds 1 clip) and then `click`. That Enter **activates** the button is browser-only (C-NOTICE-231).

## 4. Mutants (each restored, sha verified "restored=ok"; logs in `a-round-231/mutants/`)
| Mutant | Red |
|---|---|
| MU-1 header label `'Nothing selected'` in none state | DPS1, RF7 |
| MU-2 drop `arrangement.clips.length === 0` | LSU9 (l.373, after add) |
| MU-3 drop `isActive` | LSU9 (2 hints at fresh) |
| MU-4 drop `!isVideo` | LSU9 step 3 (l.368, Video active) |
| MU-5 no storage write | LN2, LN4 |
| MU-6 server snapshot = `readLibraryNoticeDismissed(...)` | LN5 |
| MU-7 demo `ready` back to old text | PC9, PC10 |
| MU-8 `sr-only` removed from both none-state reasons (whole 29-file covering set run) | **none (562 green) → browser-only: C-DETAIL-231**; no class pin added (L12) |
| MU-9 range reason `<p>` not rendered in none state | RF3, RF7 |
| MU-FOLD (extra) drop `density !== 'folded'` | LSU9 (fold step) |
| MU-2b (extra) `arrangement.clips` → lane-local `clips` | LSU9 (SFX-clip step) |
| MU-FILE (extra) drop `!isFileDragOver` | LSU4, LSU9 |
| MU-GHOST (extra) drop `libraryGhost === null` | LSU9 |

## 5. Browser self-check (optional §4.5), Playwright Chromium on the running :5173 server
- Copied B's `probe-calm2b.mjs` to `a-round-231/browser/` (B's file not edited) and ran it at both viewports → `a-round-231/browser/a231.json` + 6 screenshots.
- Result equals B's `b-round-230/probe/scratch.json` in all 442 flattened keys except the two random `czaba_session_id` values. That includes: status text; empty header label; hint text; reasons sr-only and `aria-describedby` → "Select a clip first"; notice box 236×32 at 1280 (2 rows) with the X; lane hint on Music; Stems moves it, Video → 0; Enter adds 1 clip at Music, Undo restores the hint; drag onto SFX; dismiss → focus on `arrangement-library-search`, key `=1`, absent after reload; fresh context shows it again; 0 page errors.
- First probe attempt timed out (30 s) on a cold Vite compile after the edits; a diagnostic load then took 1.2 s with 0 page/console errors and the re-run passed. Not a product failure.
- **No app source changed after this probe.** The only later edits were test files (LSU9, LN1) and docs (178, 179). The probe therefore reflects the final app tree.
- Playwright used fresh ephemeral contexts; nothing needed to persist, so `a-browse.json` was not written or used.
- Not done by A (C rows): row counts with `Range.getClientRects()`, bbox deltas, keyboard ring/contrast, layout-shift on SD, mid-drag ghost, gesture across the hint, AX tree.

## 6. code-reviewer (real subagent run, read-only; score 8/10, 0 Critical)
| # | Finding (reviewer severity) | Action |
|---|---|---|
| R1 | Hint stays on the active lane while a drag is over a **different** lane (Medium) | **Not changed.** Task §2.5 rules "hidden while a library drag ghost or an OS file drag is over **that lane**", and C-LANEHINT-231 tests the same lane. The drag state is lane-local; a cross-lane rule needs StudioWorkspace (frozen). Not a regression of existing behaviour, so not an L33 STOP. **For B:** decide whether to keep per-lane (as specified) or schedule the "any drag active" prop (reviewer's architecture proposal). A's view: Low. |
| R2 | LSU9 missed ghost/file-drag and project-level checks (Medium, test gap) | **Fixed** in LSU9; MU-2b, MU-FILE, MU-GHOST now red. |
| R3 | In-memory Set makes LN1 depend on running before LN2 (Medium, test isolation) | **Fixed in the test** (LN1 uses `ln1-demo`). The reviewer's alternative (add to the Set only when the write fails) contradicts task §2.3's explicit contract ("adds the id to the in-memory set, tries localStorage.setItem"), so the module is unchanged. B may adopt it later. |
| R4 | RF7 does not prove the reasons are visually hidden; suggests a `data-visually-hidden` attribute (Low) | **Not done.** The task forbids the class pin (L12) and grants no markup beyond §2.2. MU-8 = browser-only → C-DETAIL-231. |
| R5 | The header label is an empty `<span>` (Low) | **Not changed.** §2.2: "the element stays". |
| R6 | A mouse click on dismiss also moves focus to search (Low) | **Not changed.** §2.3 requires the focus move on click, so focus never falls to `body` (Chromium focuses the clicked button, which then unmounts). B may refine it to keyboard-only later. |
| R7 | No cross-tab `storage` event (Info) | Added to doc 179 TODO. |
| R8 | `useSyncExternalStore` usage is correct (Info) | Primitive snapshot, stable subscribe, server snapshot `false`, no mismatch. |

**Architecture notes (forwarded verbatim in substance; proposals for B/root, not done):**
- Signal 4, `ArrangementLibrary.tsx` l.192–196 external-store read: **keep**. It is 4 lines and the logic lives in `lib/`.
- Signal 2, `ArrangementLane.tsx` l.888–893 mixes per-lane drag state with a whole-arrangement condition. Proposal: one bounded task in which StudioWorkspace owns "is any drag active" and passes it to the lanes. Acceptance: only the active lane shows the hint, and it hides while a ghost or file drag is over any lane. Tests: an extended LSU9.

## 7. Known gaps / notes for B
- **Task §2.2 / §5 C-DETAIL wording:** the task says the Apply button's `aria-describedby` resolves to the reason. In the code Apply has **no** `aria-describedby` (only `disabled` + `title`); the four described elements are From, To, the Clip Gain field and the Clip Gain fader. Doc 179 states the code fact. Not a regression (unchanged by this round).
- Hydration flash: in a dismissed browser the notice is in the server HTML and removed at hydration (by design, LN5). C measures it (C-NOTICE-231).
- SABA-Q-NOTICE-ONE-ROW stays open: 2 rows at default width.
- R1/R3/R6 above are open for B's ruling (not blocking per the spec as written).
- RT-FIX-231 files (`lessons.md`, `user-review/screen-review-230.md`) were not touched by A.

## 8. Exact next C checks
C-SCOPE-231 (incl. `sha256sum -c a-round-231/changed-end-sha256.txt`), C-UNIT-231, RT-FIX-231, C-TEXT-231, C-BUDGET-231, C-BBOX-231, C-DETAIL-231 (incl. MU-8: reasons visually hidden ≤1×1 / clipped, AX description), C-NOTICE-231 (Tab order search → dismiss, ring on keyboard focus only, Enter on button adds no clip, SD flash/CLS), C-FIRSTRUN-231, C-LANEHINT-231 (fold/unfold, gesture across hint, mid-drag ghost), C-VIDEO-SOLO-231, G231-3, LAB-SMOKE-231, AN-REVIEW-231 (doc 179/178/170 l.4; `l26-check.py` → A ran it: **172 of 176**, non-passing 005, 006, 009, 076; `grep -rn 'In Progress (stage' docs/implementation` → only doc 176), C-REF-231, C-SHOTS-231.

## 9. Acceptance I truly passed (A-side only; C decides)
- §4.1 start checks; §4.2 typecheck/lint/scoped Biome; §4.3 covering set green; §4.4 MU-1…MU-9 as specified (MU-8 = browser-only); §4.7 end scope (18 M + 3 ??, frozen/root rc 0, end files written).
- Not claimed: any C row, any gate row, `browserVerified`.

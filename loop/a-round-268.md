# A round 268: GATE264-S2 fix-up (C-R267-01). Implemented, no STOP

**No STOP.** The task §2.6 STOP conditions were checked and none applies:
- No change was needed outside the 3 grants, outside `handleKeyDown`, or to a round-267 line.
- No existing test went red.
- The snapshot of `meta-shortcuts-ui.test.tsx` is unchanged: the diff is add-only, with 0 `<` lines.
- Both mutants went red.
- No test ran above 50 % of its timeout. The slowest covering test was TG1 at 2280 ms against a declared 20 s (`track-groups-ui.test.tsx` l.413). No new row is above 2.5 s; AG7 and AG8 take about 50–65 ms each.

**Baseline note:** HEAD is `e937046` ("feat(agents): add product-designer agent"), not `7ba7cd2`. Root's commit touched only `.claude/agents/product-designer.md` and `.codex/agents/product-designer.toml`. `git diff --stat 7ba7cd2 e937046` lists those 2 files only, and app code is identical. C's SOURCE-SCOPE and K1 rows will therefore see `e937046`.

## Changed files (the 3 grants only; `git status --porcelain` lists exactly these)
1. `app/components/arrangement/StudioWorkspace.tsx`: one substitution in `handleKeyDown`, Ctrl+Arrow branch, tree l.2421 (HEAD l.2420).
   - Before: `((event.ctrlKey && !event.altKey) ||`
   - After: `((event.ctrlKey && !event.altKey && !event.getModifierState('AltGraph')) ||`
   - **Form chosen:** B's sketch, with the explicit AltGraph term. The `commandChord` alternative was not used.
   - Not touched: the Apple arm, the gesture arm (which keeps `commandChord`), the other round-267 lines, KeyO, Space, `if (modifier) return`, and all strings.
   - `git diff -U0` now shows 13 `+` lines and 12 `-` lines: round 267's 12/11 plus this line. Every hunk is inside l.2270–2449. Saved as `a-round-268/code-diff.diff`.
2. `app/lib/arrangement/__tests__/meta-shortcuts-ui.test.tsx`: add-only, appended after AG6 inside the `GATE264-S2` describe.
   - Added a `ALT_ARROW_CHORDS` table, `ARROW_RIGHT`/`ARROW_LEFT`, and a `placeMarkerInsideClip` helper. The helper runs B's recipe: `selectOnlyClip`, `setInsertMarker(clip.start + 1)`, then asserts `getLocatorPosition()`.
   - **AG7** (`it.each`, 4 variants: Ctrl+AltGraph without altKey, Ctrl+Alt, Meta+Alt, Ctrl+Alt+AltGraph). With a gesture claimed (`claimPointerGesture(42, …)`), chord+ArrowRight and chord+ArrowLeft leave the locator unchanged and the status unchanged (not the blocked message), and neither event is prevented. The positive control, plain Ctrl+ArrowRight, shows the blocked message, leaves the locator unchanged and is prevented. The gesture is then released.
   - **AG8** (no gesture). Ctrl+AltGraph+ArrowRight with `altKey: false` leaves the locator and status unchanged and is not prevented. The positive control, plain Ctrl+ArrowRight, moves the locator to a greater value and is prevented.
   - Diff against `b-round-267/meta-shortcuts-ui.test.at-planning.tsx`: `467a468,530`, 0 lines removed (`a-round-268/test-vs-snapshot.diff`). No import line changed.
3. `docs/implementation/2026/quarter-IV/199-gate264-s2-altgr-shortcuts.md`:
   - l.4 is now exactly `**სტატუსი:** Completed (C round 268 PASS)`.
   - "მიდგომა" has a new paragraph for the Ctrl+Arrow ruling (D-29z572, including the accepted change from HEAD), and "Ctrl+Arrow branch" was removed from the "უცვლელი დარჩა" list.
   - The mermaid diagram has one Ctrl+Arrow edge.
   - "შეცვლილი ფაილები" covers the round-268 line and AG7/AG8.
   - "პრობლემები და გადაწყვეტები" has a Problem → Solution entry for C-R267-01.
   - "ტესტირება" adds AG7, AG8, the M-ARROW and M-GESTURE results, and the 236/236 count.
   - In the TODO section, the "B-ს გადაწყვეტილებას ელოდება (A-R267-REVIEW-GESTURE-ARROW…)" item was replaced with "გადაწყდა რაუნდში 268". The other TODO items are kept.
   - The 7 TEMPLATE headings are still in order (l.7, 13, 28, 45, 51, 65, 82).

## Tests actually run (from `store/`)
- `npm run typecheck`: rc 0 (`a-round-268/typecheck.txt`).
- `npm run lint`: rc 0, with 205 warnings and 1 info. These are the repo-wide existing warnings; there are no errors (`a-round-268/lint.txt`).
- `npx biome check` on the 2 granted code files: "Checked 2 files … No fixes applied", with no diagnostics.
- `npx vitest run` on the 13 files in task §2.4: **13 files, 236/236 pass** (`a-round-268/vitest-13.txt`). On its own, `meta-shortcuts-ui.test.tsx` passes 30/30.
- **Red-proofs**, run on the scratch copy `/tmp/a268-scratch` (outside `store/`). The scratch was restored with `cmp` and then deleted.
  - **M-ARROW** removes the new AltGraph term (`a-round-268/m-arrow.diff`). 2 fail, 28 pass: AG7 "Ctrl+AltGraph without altKey" at l.501 (locator moved) and AG8 at l.524 (`a-round-268/m-arrow-vitest.txt`). The other three AG7 variants stay green, as expected: the arrow branch already excluded those chords.
  - **M-GESTURE** puts `modifier` back in place of `commandChord` in the gesture arm, at l.2324 (`a-round-268/m-gesture.diff`). 5 fail: AG5 at l.439 and **all four** AG7 variants at l.502, each receiving "Editing does not work while dragging — let go first." (`a-round-268/m-gesture-vitest.txt`).
- Not run (gate rows): the full suite, build, Biome on the whole repo, `npm run verify`, and e2e smoke. No browser run by A: C owns the browser rows, and the change is one condition already covered by B's sketch probe.

## Code review (actual `code-reviewer` subagent, read-only): 8/10, nothing Critical, High or Medium
- **Low, A-R268-REVIEW-SPACE-ALTGRAPH (for B).** The Ctrl+Shift+Space branch (tree l.2274, unchanged since HEAD) checks `!event.altKey` but not AltGraph. A Ctrl+Shift+AltGraph+Space event with `altKey: false` would still call `moveInsertMarkerToPlayhead` and `preventDefault`. The keyup handler near l.2591 has the same gap.
  - A confirmed the code exists. It was not changed, because task §2.1.2 freezes Space.
  - It is contract-only, like AG6: no real platform has been shown to send it.
  - The ruling's wording, "never a command chord anywhere in handleKeyDown", therefore claims more than the code does. B should narrow the wording or schedule the fix.
- **Low.** AG8 tests only ArrowRight, as the task's table specifies. A guard that covered one direction only would not be caught by AG8; AG7 does cover both directions.
- **Info.**
  - Ctrl+Alt+O is a deliberate Alt command, so the rule reads better as "no Ctrl/Cmd command fires with Alt/AltGraph held".
  - `&& !event.altKey` at l.2449 is now redundant next to `commandChord`. It is harmless and frozen.
  - The doc's mermaid diagram simplifies the order: in the code, the arrow branch comes between the `v` and `g` letter branches.
- **Architecture note (for B and root; a proposal, not a refactor in this round).** The Alt/AltGraph rule is applied by hand at several sites in `handleKeyDown` (l.2270, 2274, 2421, 2449), and this is the second round in a row patching the same region. The reviewer's verdict is **keep for now**. Its later option: a pure `classifyChord(event)` helper in `app/lib/arrangement/` returning `'command' | 'alt-command' | 'plain' | 'foreign'`, unit-tested on its own, with the branch order unchanged. That would fix the Space arm and B-R266-LINUX-ALTGR-PLAIN-LETTERS in one place.

## Known gaps
- No real platform is known to send Ctrl+AltGraph without `altKey`, so AG7's first variant and AG8 are contract rows, as AG6 is.
- Real Windows AltGr (TLM-R232-ALTGR-WIN) and Linux AltGr without Ctrl (B-R266-LINUX-ALTGR-PLAIN-LETTERS) are out of scope and unchanged.
- A-R268-REVIEW-SPACE-ALTGRAPH (Low) is open, as described above.

## B acceptance criteria A actually passed
- §2.1: one condition on the Ctrl arm; nothing else changed.
- §2.2: AG7 and AG8 added inside the describe after AG6, add-only; both red-proofs done.
- §2.3: doc 199 l.4 and the named sections.
- §2.4: typecheck, lint, Biome on the 2 files, the 13 vitest files, and code-reviewer.
- §2.5: no status write added; nothing mounts or unmounts.

The C rows (GESTURE-ARROW, NOGESTURE-ARROW, MAC-ALT-ARROW, R267-ROWS, G268-AUTH, CLAIMS, MUTANTS on C's own scratch) are **not** claimed by A.

## Exact next C checks
1. SOURCE-SCOPE: HEAD is `e937046` (see the baseline note), and there are 3 grant paths.
2. HUNK-SCOPE: one extra substitution at tree l.2421, and the test diff `467a468,530` is add-only.
3. CLAIMS: K1 will show the new HEAD. Every other K2–K20 command reads HEAD files, which are identical for app code.
4. TESTS-TARGETED: 13 files.
5. MUTANTS: M-ARROW, M-GESTURE, M-AG, and 2 or more per-branch mutants.
6. Browser at 1440×900 and 1280×720 on :5173:
   - `b-round-267/probe-arrow.mjs` in gesture and no-gesture modes, all 7 cases;
   - `b-round-267/probe-mac-alt.mjs` (real Alt+ArrowRight with a mac UA);
   - the round-267 rows ALTGR-UNDO, ALTGR-EDIT, CTRLALT-REAL, META-ALT-REAL, POS-CTRL 1–5 and FOCUS-ALT.
7. DOC-199 and G268-AUTH.

Scope completed: task §2 in full. No commits, pushes, installs or deploys; no protected file touched; the dev server on :5173 was not started or stopped.

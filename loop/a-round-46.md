# A — Round 46 report (D-29z11: EXPORT-DIALOG-FOCUS-RESTORE + DOC036/DOC042 status lines)

Implementer: A (Claude Opus 5.5) · 2026-10-15 · no commit/push/deploy. **Not a PASS claim** — C verifies.

## 1. Pre-flight gate and baseline (before any edit)

**Pre-flight gate**
- Assumptions: the capture effect becomes `useIsomorphicLayoutEffect` with its body and `[isOpen]` byte-identical. The filter gains one condition, `closest('[hidden]') === null`. The test harness order is opener + decoy → dialog → `FocusThief`. Docs 036/042 change on l.4 only. Doc 043 is new.
- Smallest version: 3 source lines; one new test file of about 300 lines (with the copied stubs); docs.
- Files: exactly the 5 paths of §3.2.
- Success: red run FR1/FR2 (`decoy`) and HD1–HD3 red, FR3/FR4 green, then green; 19/19 and SSR1 = 0 still green; mutations (a)–(e) caught; full gates.

**Baseline (verified):** HEAD `1381b0b9984c…`; `git status --short` was empty; 395 OK (0 not-OK); the 4 snapshot shas matched (`89bc8e06`, `e5da2ea6`, `4e6f94cf`, `adcd6e04`); protected 4/4 OK; node.exe 33.
**§1.4 re-checks:** `grep useEffect(|useLayoutEffect(|useIsomorphicLayoutEffect(` on the dialog found 3 `useEffect(` (l.84/96/114). `isomorphic(` sites across arrangement + context = 7. Biome on the dialog before the edit: 0 diagnostics (`a-round-46/biome-before.txt`).
**Pre-existing, not mine:** `a-round-46-prompt.txt` and `a-round-46-result.json` (loop runner). No foreign changes appeared during the round.
**Read:** read-primitives rule; AGENT_DISCOVERABLE_CODE, FORWARDREF_COMPONENT, REACT_CONTEXT, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS (the hook also injected DESIGN_TOKENS, TAILWIND_FIRST and AUDIO_ARCHITECTURE); prompts new-test and studio-feature; TEMPLATE.md; the pre-flight skill; the dialog (all of it); the 19-case test; Modal.tsx l.30–137; the hook; ssr-layout-effect; order-probe.cjs.

## 2. Red run, mutations, green run

**Red run** (`a-round-46/red-run.txt`; the source sha was confirmed as `89bc8e06` inside the file):
- FR1 ×: `- data-testid="opener" / + data-testid="decoy"`
- FR2 ×: `- data-testid="opener" / + data-testid="decoy"`
- FR3 ✓, FR4 ✓
- HD1 ×, HD2 ×, HD3 ×: `expected false to be true` (`defaultPrevented`)
- Result: 5 failed, 2 passed. This matches §2.3 exactly.

**Green run** (`a-round-46/green-run.txt`, node.exe 32): restore 7/7 + `export-dialog-focus` 19/19 + `ssr-layout-effect` 4/4 + `useIsomorphicLayoutEffect` 2/2 = **32/32**.

**Mutations** (`a-round-46/mutations.txt`; scratch `a-round-46/scratch`; the `node_modules` junction was created with `mklink /J` and removed with `cmd /c rmdir`; `MSYS_NO_PATHCONV=1`; tools in `a-round-46/tools/`). The unmutated base was 30/30.

| # | Mutation | Failed tests |
|---|---|---|
| (a) | capture back to `useEffect` | FR1, FR2 (decoy) ✔ |
| (b) | `[hidden]` condition removed | HD1, HD2, HD3 ✔ |
| (c) | bare `useLayoutEffect` (import from `react`) | SSR1: `["ArrangementExportDialog"]`, exactly 1 ✔ |
| (d) | `hasAttribute('hidden')` | HD1, HD2 (HD3 green) ✔ |
| (e) | focus-to-close also a layout effect | **FR4** (primary); also FR1 (its open assertion: decoy) and FR2 (see A-R46-RESTORE-SELECTION). The 19 existing cases stay green under (e). |
| snapshot | the whole b-round-45 dialog | FR1, FR2, HD1–HD3 (5 failed) |

**C's (f) pre-check (for C/B; measured, `a-round-46/probe/restore-selection-probe.txt`):** I moved the thief before the dialog. FR1/FR2 are then **red on the snapshot *and* on the fixed code**. B's §4.2(f) expectation was "FR1/FR2 green on the snapshot too", and that is **not what happens**. The reason: a passive capture always runs after every layout effect, so it sees the decoy wherever the thief sits. A layout capture runs in tree order, so a thief placed before the dialog wins too. Tree order therefore decides whether the green run is meaningful (the fix can only win against later layout effects); it does not decide whether the red run is red. Doc 043 states this.

## 3. Diff summary

`diff -u b-round-45-snapshots/ArrangementExportDialog.tsx …`:
- `+import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicLayoutEffect';` (after the `~/contexts` import)
- the filter becomes `!element.matches(':disabled') && element.closest('[hidden]') === null` (one line)
- l.85: `useEffect(() => {` → `useIsomorphicLayoutEffect(() => {` (body and `[isOpen]` unchanged)
- l.97 and l.115 are still `useEffect(`. `isomorphic(` sites = **8**; bare `useLayoutEffect(` = **0**.
- Docs 036 and 042: diff against the snapshots shows **l.4 only**, with the exact T1/T2 texts. The 19-case suite is `cmp`-identical to its snapshot.
- Final shas: dialog `22abaeb8…`, doc 036 `0dad8df0…`, doc 042 `056f93a9…`.

## 4. Smoke and dev-server Δ

**Browser smoke** (`a-round-46/smoke.txt`; gstack browse daemon via `a-round-46/b.sh`, fresh state `a-round-46/a-browse.json`, no fallback needed; node.exe 27–28). `/studio-lab` at 1440×900 returned 200.
- REAL click `Export` (@e17) → DOM read: focus on `დახურვა`, dialog present.
- REAL `Escape` → DOM read: the dialog is gone and focus is on `BUTTON "Export"`.
- **Extra, not a PASS:** REAL click `Export` → REAL click on the description `<p>` → focus moves to the trap `DIV tabindex=-1` (inside the dialog) → REAL Esc → focus on `Export`. So a pointer click inside the dialog keeps focus inside it, and the restore works.

**Dev-server Δ** (`a-round-46/devserver-delta.txt`): count 357 → 357 after `curl /studio-lab` (200) and `sleep 3`, **Δ 0**. The log did not grow on `/studio-lab` (1 167 438 bytes); the `/` control grew it to 1 169 358, so the log is live.

## 5. code-reviewer (real subagent call) — findings and dispositions

Verdict: **approve, 8.5/10**; no Critical, High or Medium findings. The contract diff, the effect ordering, the test validity and the banned-content rules were all confirmed.
- **Low — A-R46-RESTORE-SELECTION** (`ArrangementExportDialog.tsx` l.90–94). Focus can be moved programmatically to a *connected element outside the dialog after it opens*. In that case ReactDOM's commit `resetAfterCommit → restoreSelection` re-focuses that element **after** the layout-phase restore. The snapshot's passive restore sent focus to the opener; the new code leaves it on that element.
  - Evidence: probe P2 (the stack of the focus listener is `restoreSelection < resetAfterCommit`). P1 (focus on `body`) restores correctly in both versions.
  - Reachability: the backdrop blocks pointer input and the Tab trap holds focus. Grep found these `focus()` calls in workspace code: `ArrangementLibrary` l.200 (a rAF after a keydown on a library control) and `ArrangementVideoDock` l.730 (only when the floating state changes and focus is null/body). Neither runs while the dialog holds focus. The extra browser step above confirms the pointer path stays inside the dialog.
  - **Disposition:** not changed; the contract fixes the body. Documented in doc 043 (known limits). **For B:** the reviewer's alternative — capture into a ref in the layout effect, restore in a passive cleanup — fixes this for one ref. It would be a separate B decision.
- **Info:** no test pins the P2 behaviour. **Disposition:** not added. The task permits only the named cases, and pinning a possibly unwanted behaviour belongs to B's decision. The probe file is the evidence.
- **Info:** the stubs are copied from the 19-case file (required by §2.3 "copy, do not import"). **Disposition:** kept.
- **Info:** FR4's `not.toBe(decoy)` duplicates the next assertion. **Disposition:** kept; it makes the failure message name the decoy under mutation (e).
- **Info:** the ✕ close path has no new restore test (it uses the same `onClose`, and the 19-case file covers ✕). **Disposition:** C's F-X covers it in the browser.
- **Info:** doc 043 said "always before passive" without the tree-order qualifier. **Disposition:** fixed in doc 043 (layout effects before the dialog are outside the contract, see (f)).
- **Architecture note:** none from the reviewer. A's own note for B: the dialog's three effects jointly own focus, and one is now layout while two are passive. If the focus contract grows (A-R46-RESTORE-SELECTION), a single focus-management unit may be worth a bounded checkpoint. This is a proposal only.

## 6. Command tails (verbatim)

```
git rev-parse HEAD                     → 1381b0b9984c5873a76cf2503c74e5d14b3ac1df (start and end)
git status --short                     →  M app/components/arrangement/ArrangementExportDialog.tsx
                                          M docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md
                                          M docs/implementation/2026/quarter-IV/042-studio-lab-ssr-layout-effect.md
                                         ?? app/lib/arrangement/__tests__/export-dialog-focus-restore.test.tsx
                                         ?? docs/implementation/2026/quarter-IV/043-studio-lab-export-dialog-focus-restore.md
sha256sum -c b-round-45-tree… | grep -vc OK → 0   (395 OK)
protected                              → 4/4 OK
useIsomorphicLayoutEffect( count       → 8 ; bare useLayoutEffect( → 0
focused vitest (3 files + hook)        → Test Files 4 passed (4) · Tests 32 passed (32)   [node.exe 32]
npx tsc --noEmit                       → exit 0   [node.exe 20]
npx vitest run                         → Test Files 80 passed (80) · Tests 1364 passed (1364) · exit 0   (1357 + 7)
npm run build                          → ✓ built in 2.81s · exit 0
npx biome check ./app                  → Checked 352 files · Found 2 errors · Found 218 warnings · Found 1 info
                                         errors: app\lib\__tests__\bug-hunting\auth-bugs.test.ts format; app\lib\auth.ts format (baseline CRLF; untouched)
biome check (2 owned TS files)         → Checked 2 files · No fixes applied (0 diagnostics)
npm run verify                         → Test Files 80 passed (80) · Tests 1364 passed (1364) · ✓ built · exit 0
r42-vite.err.log SSR warning count     → 357 → 357 (Δ 0); "/" control grew the log
tasklist | grep -ci node.exe           → 20–33 over the run (23 at the end)
```

No timeouts. Full logs are in `a-round-46/`: `tsc.txt`, `vitest-all.txt`, `build.txt`, `biome-app.txt`, `biome-app-errors.txt`, `verify.txt`, `final-state.txt`.

## 7. Deviations, self-check, known gaps

- **Deviations:** none in the source or the tests. Doc 043 has an extra known-limit entry (A-R46-RESTORE-SELECTION) and an extra Problem → Solution about (f); both are documentation of measured facts.
- **Self-check:**
  - Edge cases: removed and disabled openers are kept by the unchanged `isConnected`/`:disabled` checks (the 19-case file is green). A blur to body restores correctly (P1).
  - Security: nothing touched.
  - Primitives: no comments, no `any`/`as`/`@ts-ignore`, semicolons, no new exports, no styling change.
- **Known gaps:**
  - HD1–HD3 are unit-only, because nothing in the dialog is hidden today.
  - A-R46-RESTORE-SELECTION is open for B (Low/Info).
  - `inert`, CSS `display:none` and `aria-hidden` are outside the contract (doc 043).
  - Browse daemon: I ran `b.sh stop` (`stop` is listed in the browse help). It printed `[browse] Unable to connect…`. Afterwards no state file exists at `a-round-46/a-browse.json` (the path set through `BROWSE_STATE_FILE`), so the daemon is most likely stopped. I sent no kill to any process.
  - Doc 043 wording fixes (the tree-order qualifier and the reviewer's reachability note) were made **after** the review and after `npm run verify`. They are prose only; no source or test file changed after the gates.

## 8. Exact next C checks

1. **R46-S:** `diff -u` the dialog against the snapshot (1 import, 1 identifier, 1 condition); `grep` 8 / 0; `cmp` the 19-case suite; 395 OK; protected 4/4.
2. **R46-U:** re-run mutations (a)–(e). For **(f)**, expect FR1/FR2 **red on both the snapshot and the fixed code** (A's measurement contradicts §4.2's text). B should correct the expectation; C should record what it sees.
3. **R46-FOCUS:** F-ESC/F-CLOSE/F-X/F-WRAP/F-RENDER/F-VIDEO/F-SPACE/F-1280 as written. A only ran F-ESC at 1440 and the extra description-click step.
4. **R46-SSR:** 3× `curl` Δ 0 plus the `/` control; HTML size and NUL offsets.
5. **R46-REG, R46-Doc, G46-1..3.** Doc 043 contains the §4.7 table, the known limits and the TODO for round 47.
6. **Optional for B:** decide on A-R46-RESTORE-SELECTION (the reviewer's alternative is a ref plus a passive restore).

## 9. B acceptance items A actually checked

- §2.1 source diff limited to §0.1/§0.2 — checked (diff above).
- §2.3 red/green pattern and mutations (a)–(d) caught; (e) recorded — checked.
- §0.3 docs 036/042 l.4 exact T1/T2 — checked by diff.
- §2.2 doc 043 created per TEMPLATE — written; C judges the content.
- §2.4 gates: tsc, vitest 1364, build, Biome (2 baseline errors, 218 warnings, 1 info), verify, code-reviewer, smoke, dev-server Δ — run, with the results above.

All §4 C IDs are left to C.

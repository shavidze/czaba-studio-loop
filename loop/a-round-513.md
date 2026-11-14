# A round 513: DPG-BUTTON-CLEANUP-2-NONBRAND N3, the cookie banner

**Status:** implemented; handed to C. No STOP. Nothing was committed or pushed. No server was started.

## Baseline
- HEAD `cbc5709` at start, clean tree, so the HEAD-drift rule did not apply.
- Frozen checks 1, 2 and 3 were rc 0 before the apply.
- Sketch sha256 `cd99584499de805a5b7c554b0b6308de458ebff94f5056e4dde9ce87a7ef81d8` matches the task.

## Reading and pre-flight (truthful order)
- Before the apply:
  - task, `lessons.md` (the A section plus L1, L4, L10, L23, L29, L36, L47, L52, L54, L56–L60 by grep);
  - the first ~60 lines of the primitives `FORWARDREF_COMPONENT.md`, `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md` (stale teal row, pre-ruled 8), `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`;
  - the first ~60 lines of `.claude/prompts/new-test.md`.
- `TEMPLATE.md`: before writing doc 331 I grepped only its headings. I read lines 1–28 (the Prompt section) after the doc's first draft. The doc follows that section's structure (date, status, project; no code fragments beyond inline names and a Mermaid diagram).
- **Pre-flight skill:** I read it only after the apply and the first checks, not before. The round is a byte-equal sketch apply, so these answers are written post hoc:
  - Assumptions: apply B's sketch unchanged; no product edits beyond it.
  - Smallest version: the sketch itself.
  - Files: the 2 grants and doc 331.
  - Success: frozen check 4, typecheck, lint 171, covering 6/88, scanner 50.

## Changed files (`git status --short --untracked-files=all`)
```
 M app/components/common/CookieConsent.tsx
 M app/components/common/__tests__/CookieConsent.test.tsx
?? docs/implementation/2026/quarter-IV/331-dpg-nonbrand-stage-n3-cookie-banner.md
```
- The two tracked files came only from `git apply b-round-512/sketch-513.patch.txt`. I made no other edits to them.
- Frozen check 4 (post-sketch sha) was rc 0 after the apply and is still rc 0 at hand-off.
- Doc 331 was written with the editor tool. Its l.4 is exactly `**სტატუსი:** Completed (C round 513 PASS)`. It has the 7 TEMPLATE headings in order, and `grep -c pending` returns 0.
- It cites only N3-1…N3-6 and CC1–CC6 (plus CC4b), and all of these exist in the test file.
- The only Tailwind tokens it names (`bg-white`, `text-black`, `hover:bg-neutral-100`, `text-muted`, `text-dim`, `absolute top-2 right-2 sm:hidden`) appear at HEAD or in the sketch.
- Ledger: `a-round-513/doc-ledger.md`, one source per behaviour sentence. `tools/ledger-check.py current-task.md` rc 0 (`a-round-513/ledger-check.txt`; the sketch carries no doc text).
- Diff saved as `a-round-513/diff.txt`.

## Checks actually run (logs in `a-round-513/`)
| Check | Result | File |
|---|---|---|
| Frozen checks 1, 2, 4 at hand-off | rc 0, rc 0, rc 0 | — |
| `npm run typecheck` | rc 0 | `typecheck.log` |
| `npm run lint` | rc 0, **171 warnings** (1 info) | `lint.log` |
| `npx biome check` on the 2 owned files | rc 0, "No fixes applied" | `biome-scoped.log` |
| Covering: `npx vitest run --reporter=verbose $(cat b-round-512/covering-files.txt)` | rc 0, **6 files, 88 tests**. N3-1…N3-6 all present and green. Slowest test 172 ms (per-test `✓` lines), under 2,500 ms. An earlier draft said 964 ms, but that was a Duration sub-field, not a test | `covering.log` |
| Scanner `scan-nonbrand-motion.py` | **50 hits** in 26 files, 0 CookieConsent entries | `scanner.log`, `scanner-n3.json` |
| code-reviewer (agent, on `git diff cbc5709` + doc 331) | no Critical, High or Medium; 4 Lows; 9/10 | `code-review.md` |

- Not run, per the task and speed rules (these are gate rows): the full vitest suite, build, Biome on the whole repo, `npm run verify`, `test:e2e:smoke`.
- Mutants: C re-runs M1–M13.
- Browser: C rows C1–C6. A did not use the browser this round, so there is no `a-browse.json`.

## Code review findings (all Low; no code changed after the review)
After the review, only doc 331's EDPB sentence and ledger rows changed. That was sourcing wording after an advisor check, with no product or test code changed. The reviewer saw the earlier doc wording.
1. Close shrinks from 34 to 32 px. This is pre-ruled 5.
2. The label "Close" silently records a decline. This is unchanged from HEAD. **For B:** an optional product question ("Decline and close"). It could be folded into round 514, which touches the same Close button.
3. N3-5 reads the source through `process.cwd()`, and its regex also matches comments. It is a sketch row under a byte-equal grant, so I left it unchanged.
4. Part of N3-3's comparison against a reference `IconButton` is self-referential. The `arrayContaining` pin and the svg width check still make it falsifiable.
- **Architecture note (for B/root):** "No signal: keep." `CookieConsent` keeps a single job. The change only swaps markup for shared UI components, with the same coupling as N1/N2 and no new state or lifecycle.

## B acceptance (A's part, §3)
- [x] Frozen checks 1–3 before the apply, and check 4 after it, all rc 0.
- [x] Sketch applied byte-equal; doc 331 and the ledger written.
- [x] typecheck rc 0; lint rc 0 with 171 warnings; scoped Biome rc 0 with no fixes.
- [x] Covering set rc 0: 6 files, 88 tests, N3 rows present, none above 2,500 ms.
- [x] Scanner 50, with no CookieConsent entry.
- [x] code-reviewer run, with its Architecture note.
- C1–C10 (browser, mutants, claims, L57) are C's job. I do not mark them.

## Known gaps (pre-ruled, unchanged)
- Focus falls to `body` after dismissal: B-R512-COOKIE-DISMISS-FOCUS-LOST, round 514.
- At 375 px the Close X overlaps "Privacy": B-R512-COOKIE-CLOSE-OVERLAPS-TEXT, round 514.
- Pill separation from the banner is low (B-R512-COOKIE-PILL-LOW-SEPARATION).
- The root's inline gradient stays (A-R183-COOKIE-INLINE-GRADIENT).
- SABA-Q-507-COOKIE-WEIGHT is still open.

## Exact next C checks
- Run §4 C0–C10 as written. Start with the browser rows (C1–C6) on a copy with `VITE_GA4_MEASUREMENT_ID` set on :5174. Do not use :5173, because it has no GA4 id.
- C0 expects exactly the 3 paths above.
- C7 should give 6 files, 88 tests (A's run matches), plus M1–M13 on a copy of A's tree.
- C8 expects 50 from the scanner and 171 from lint. `grep -c '<button' app/components/common/CookieConsent.tsx` should be 0.
- C9 checks doc 331 and `a-round-513/doc-ledger.md`.

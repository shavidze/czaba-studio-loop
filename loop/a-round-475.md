# A round 475 — DPG-P0-2 (undefined tokens, card badge chip)

**STOP — needs B ruling on the §1.2 vs §1.6 clause conflict (L11: a spec conflict A notices is a STOP, not a ruling inside the report).**
- **The conflict:**
  - §1.2 says "If your code-reviewer asks for a change to a granted file, that is a STOP".
  - §1.6 says STOP "only for a Medium or higher finding that needs a file outside the grant, or that changes a ruled formula".
- **What triggered it:** the reviewer asked for Low-only changes in byte-equal-granted test files: R1–R4 below and the UT3 test title wording. None is Medium or higher.
- **What A did:** A edited none of those files. Every A step (§1.1–§1.7) is otherwise complete. The tree is the sketch plus doc 308 only, and it is consistent for C to verify.
- **Proposed ruling for B:** accept as-is and move R1–R4 and the UT3 title to `deferred_low_polish` or a test-only follow-up.

## Pre-flight
- **K1:** HEAD `297f5ae`, and the tree was clean before A started.
- **K2:** the sketch sha is `d2385ffc2e62c654` and `git apply --check` returns rc 0. Both match `b-round-474/claims-475-planning-output.txt`.
- **Read in full:** TAILWIND_FIRST, DESIGN_TOKENS, GEORGIAN_DOCS, the TEMPLATE writing style, the pre-flight skill and `commands/check.md`.
- **Read in part:**
  - FORWARDREF_COMPONENT: about l.1–203, the examples skimmed.
  - TESTING_QUALITY_GATES and BUG_HUNTING_TESTS: the first 80–90 lines only.
- **Lessons:** L1, L2, L4, L10, L11, L12, L15, L23, L26, L28, L29, L31, L52, L56, L58, L60 and L61. L11, L26 and L28 were read to the end.
- **Pre-flight skill:** its gate was not written out in chat before applying. The change is B's reviewed byte-fixed sketch (L60), so there were no design choices to make. Success criteria were the task's §1 commands.
- **`/check`:** it asks for `npm run verify`. Under the speed rules that belongs to the gate, so A ran `npm run check` (non-mutating Biome), typecheck, lint and the covering tests instead.
- **Build:** `npm run build` was **not run** (speed rules; the gate runs it).

## Changed files (exactly the grants)
- **The 7 sketch files:** applied with `git apply -p1 b-round-474/sketch-475.patch.txt`. `sha256sum -c sketch-475-files-sha256.txt` gives **7/7 OK**. A made no edits beyond the sketch.
  - `app/styles/app.css`
  - `app/components/product/ProductCard.tsx`
  - `app/routes/search.tsx`
  - `app/routes/account_.login.tsx`
  - `app/lib/__tests__/store-live-teal.test.ts`
  - `app/lib/__tests__/helpers/token-resolve.ts` (new)
  - `app/lib/__tests__/store-undefined-tokens.test.ts` (new)
- **New doc:** `docs/implementation/2026/quarter-IV/308-dpg-p0-2-undefined-tokens.md`.
  - The `## ` headings are TEMPLATE's seven, in order.
  - l.4 is exactly `**სტატუსი:** In Progress (stage 2 of 3; C round 475 PASS)`.
  - It names: the resolver scans (14→0, 28→24); `--radius-xs` is not broken and `--radius_full` has 0 hits; the nav-bar interim and ROOT-REQ-NAV-LOADING-BAR-RENDER; and the TODOs DPG-P0-3, SABA-Q-PENDING-NAV-FEEDBACK, LEGACY-DEAD (UserDropdown and the glow remnants) and the stub-route task.
  - The test rows it names are UT1, UT2, UT2b, UT3, UT4 and UT5. All exist in the test file.
- **All hashes:** `a-round-475/files-sha256.txt`.
- **Protected files untouched.** `git status --short` shows only the 8 paths above. The claims script's K9 is 0.

## Checks (logs in `a-round-475/`)
| Check | Result | Log |
|---|---|---|
| `npm run typecheck` | rc 0 | `typecheck.log` |
| `npm run lint` | rc 0; 192 warnings and 1 info repo-wide | `lint.log` |
| Biome scoped to the 7 code paths | rc 0, no diagnostics, 6 files checked. app.css is outside Biome: `biome.json` `includes` is `app/**/*.ts`, `app/**/*.tsx`, and a single-file `biome check app/styles/app.css` returns rc 1 "no files processed" | `biome-scoped.log`, `biome-appcss.log` |
| `npm run check` (non-mutating) | rc 0; 192 warnings and 1 info repo-wide, the same as lint | `check.log` |
| L15 contrast, badge chip (`b-round-474/probe/probe-contrast.mjs` on :5173 with the mock API on :5199) | non-New badge text vs median chip pixel: **8.91–8.95:1** at 1440 and 1280 (Ambient 8.95, Orchestral 8.91, Electronic 8.95), equal to B's sketch run. The first attempt failed (TypeError, no cards) before the mock API answered; the retry is the valid run | `contrast-badge.json` |
| L15 contrast, stub paragraphs (`a-round-475/probe/stub-contrast.mjs`) | `/search` and `/account/login`: `rgb(163, 155, 142)` on `rgb(14, 13, 12)` = **7.06:1** at both viewports | `contrast-stubs.json` |
| `npx vitest run $(cat b-round-474/covering-475.txt)` | **16/16 files, 172/172 tests pass**, 9.34 s | `covering.log` |
| Mutants: `run-mutants.sh` on a `cp -a` copy (copy deleted after) | **11 of 11 red**, `summary.txt` **byte-equal** to `b-round-474/mutants/summary.txt`; 0 NOT-APPLIED | `mutants/` |
| Claims: `bash b-round-474/claims-475.sh` | **byte-equal** to `b-round-474/claims-475-allowed-deltas.txt`; last line `L58 OK` | `claims-475-output.txt` |

The pre-existing lint warnings are not in the changed files: the scoped Biome run reports nothing.

**Timeout headroom (L31).** In the covering run, UT2 took 1982 ms and the whole file 2400 ms, against a 30 s limit (< 50 %). The `beforeAll` compile runs under vitest's default 10 s hook timeout (see R3).

The full suite was not run (speed rules); it belongs to the gate.

A used the browser only for the two L15 contrast probes. Every acceptance row (C5–C12, C14) is C's.

A started the loop's mock API (`node mock-api/server.mjs`, :5199) for those probes. It was later stopped when its background time limit ran out, so it is **not** running now. C starts it as the task says (`node $(realpath mock-api/server.mjs)` from the loop folder). The dev server on :5173 was neither started nor stopped.

## code-reviewer (actual subagent run): score 8/10, no Critical/High/Medium
- **R1 (Low).** `token-resolve.ts` `declaredProperties` uses a global regex. It ignores rule scope and comments, and also matches `getPropertyValue('--x')` and `removeProperty('--x')`, so it could false-pass in future. There is no current case.
- **R2 (Low).** `definesProperty` depends on the `propertyNames` given to the resolver. UT1's probe forces emission, so a variable that only TSX reads (`--radius-xs`) counts as defined, and no test checks that against a real production build.
- **R3 (Low).** The test file's `beforeAll` (l.103) does a Tailwind compile under the default 10 s hook timeout, because the describe `timeout: 30_000` does not cover hooks. The file compiles about 5 times, which risks a timeout on a cold CI runner. Measured here: the whole file took 2.4 s.
- **R4 (Low).** UT2 scans every string literal, so a non-class string starting `bg-`/`text-`… fails it, as `border-color` already does (it is allow-listed). It fails loudly, not silently.
- **R5 (Low, fixed in A's own doc).** The Mermaid labels had unquoted `()`. A quoted all the labels in doc 308.
- **R6 (Info, fixed in A's own doc).** The doc claimed UT3 shows the resolver "agrees with the browser". The doc now states exactly what UT3 asserts (compiler emission plus two declared properties) and that the browser match is B's probes and C's rows. The UT3 **title** in the test file still says "agrees with the browser". The file is byte-equal-granted, so A did not edit it.
- **Info.** The arithmetic of the counts (14→0, 28→24, 18 UserDropdown tokens) checks out. The badge contrast is about 5.9:1 even over a pure-white cover. `display:none` on the bar loses nothing for assistive technology (a bare div). Strict-TS and semicolon rules hold.
- **Architecture note (for B/root, no action this round):** keep `token-resolve.ts` as its own helper next to `style-scan.ts` (one job, one consumer). LEGACY-DEAD would remove 22 of the 24 allow-listed tokens and is worth prioritising.

R1–R4 and the R6 title are in byte-equal-granted test files. They are the subject of the STOP at the top.

**Re-review (L11).** Doc 308 changed after the first review: the Mermaid quoting, the UT3 wording, the `--radius-xs` sentence and the LT1 row id. A second code-reviewer run checked every claim against the two test files, the Mermaid parse, the heading order and l.4. Result: **no findings**. It repeated only the UT3 test-title Low.

After the last doc edit, the claims script was re-run: still **byte-equal** to the allowed deltas. `files-sha256.txt` was refreshed; doc 308's sha is `bbffaeb4…`.

## B acceptance items A truly passed
- §1.1 STOP check: K1/K2 match.
- §1.2 sketch applied, 7/7 sha OK.
- §1.3 doc 308 written as required.
- §1.4 typecheck, lint and the covering run: all green.
- §1.5 mutants: 11/11 red, the same rows as B's.
- §1.6 code-reviewer run, no Medium+.
- §1.7 this report.

C's rows C1–C15 are **not** claimed by A.

## Known gaps
- There is no browser verification by A. C5–C12 and C14 are C's.
- C14's real-owner path is BLOCKED (backend unavailable in cloud).
- Reviewer Lows R1–R4 and the UT3 title wording are open for B.

## Exact next C checks
Run task §2, C1–C15, as written. In particular:
- **C1:** `sha256sum -c b-round-474/sketch-475-files-sha256.txt`, plus doc 308's sha from `a-round-475/files-sha256.txt`.
- **C3:** mutants on your own `cp -a` copy.
- **C15:** the claims script should again be byte-equal to `claims-475-allowed-deltas.txt`. A's run is byte-equal.
- **C13:** doc 308 l.4, and its heading order against TEMPLATE.

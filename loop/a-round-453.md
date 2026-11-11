# A round 453 — STORE-2b-3b: glow shadows leave the Store

No STOP. Tree base `ee7cf7c`. B's sketch applied as-is (no hand edits to code); doc 296 written with editor tools.
The mock API was not running on `:5199`. I started it detached (`setsid node mock-api/server.mjs`, log `a-round-453/mock-api.log`) and left it running for C. I did not start or stop the `:5173` dev server.

## Changed files (9 = `b-round-452/grants-453.txt`)
- M `app/styles/app.css` (only the sketch hunks)
- M `app/components/ui/Button.tsx`, `app/components/chat/ChatInput.tsx`, `app/components/chat/GuestForm.tsx`
- M `app/components/product/PurchaseHeader.tsx`, `app/routes/store.tsx`
- M `app/lib/__tests__/store-theme-tokens.test.ts` (ST5 literal)
- ?? `app/lib/__tests__/store-glow-shadow.test.ts` (GS1–GS4)
- ?? `docs/implementation/2026/quarter-IV/296-store-2b-3b-glow-shadows.md`

`git status --untracked-files=all` shows exactly these 9 paths.

## Steps and results
| Step | Result | Evidence |
|---|---|---|
| 2 claims pre-edit | equal to `claims-453-planning-output.txt`, stderr 0 bytes | `a-round-453/claims-pre.txt` |
| 3 apply | patch sha256 = `6e7710…3935`; `git apply` OK; `sha256sum -c sketch-files-sha256.txt` rc 0 (8 OK) | — |
| 5 covering | `npx vitest run $(cat covering-453.txt)`: 5 files / 66 tests passed, 563 ms (slowest file 229 ms) | `a-round-453/covering.log` |
| 5 typecheck | rc 0 | `a-round-453/typecheck.log` |
| 5 lint | rc 0, 205 warnings (= HEAD) | `a-round-453/lint.log` |
| 5 biome scoped | rc 0, 6 warnings (= `precheck-biome-head.log`); biome reports "Checked 7 files" (`app.css` is not counted) | `a-round-453/biome-scoped.log` |
| 5 mutants | scratch `/tmp/a453-src` (shared clone at `ee7cf7c` + patch, committed `6bc0402`); `run-mutants.sh` with absolute OUT; `mutants.txt` **identical** to `b-round-452/mutants/mutants.txt` (21 lines; BASE/M11/M20 none) | `a-round-453/mutants/` |
| 6 glow probe | `compare-glow.py glow-head.json glow-tree.json` → `ROWS 22 ALL_OK True` | `a-round-453/glow-tree.json`, `glow-compare.txt`, `shots/` |
| 6 added probe | `addedShadow` `none` at 1440 and 1280; `addedText` "Added"; `posted` 1 | `a-round-453/added-tree.json` |
| 6 store-card probe | `glowing: []` at both viewports (`inlineGlowDecl` 1, same as B's sketch run) | `a-round-453/store-card-tree.json` |
| 7 claims post | differs from `claims-453-sketch-output.txt` only on K2 (`ee7cf7c`), K10 (`1 files`) and K15 (`outside 0 inside 9`); stderr 0 bytes | `a-round-453/claims-post.txt` |
| 8 git status | only the 9 granted paths | — |

**L15 contrast** (from `glow-tree.json`, every enabled target at both viewports; `a-round-453/contrast-summary.txt`): text contrast is 8.32 at rest and 10.28 on hover. Active opacity is 0.8 (`.btn-primary`), 0.9 (Button) and 1 (stubs, chat). `focusVisible` is false on the pointer press in all 14 samples. The glow probe recorded the focus ring and found it equal to HEAD.
- **Stub buttons, new brass fill under a brass ring (same-token boundary).** The keyboard ring measured in Chromium: `1px solid`, brass at 0.8 opacity, offset 2px (the shared style specifies 1.5px; Chromium paints 1px).
- The stub page behind the ring is `rgb(14, 13, 12)` (`a-round-453/stub-bg.json`).
- The ring composites to `rgb(164, 134, 87)`: **5.66:1 against the page** and 1.47:1 against the brass fill. The fill is not adjacent, because a 2px gap of page colour separates them (`a-round-453/stub-ring-contrast.txt`).

**L12:** `grep shadow-glow` across app test files hits only the new `store-glow-shadow.test.ts`. No protected or frozen test is affected.

**Process honesty:**
- I ran the pre-edit claims check and applied the patch before opening the `pre-flight` skill and `/check` (`commands/check.md`). I read both afterwards.
- I read `FORWARDREF_COMPONENT.md`, `BUG_HUNTING_TESTS.md` and `TEMPLATE.md` only partly (by grep, headings and Button variant lines). `TAILWIND_FIRST.md`, `DESIGN_TOKENS.md`, `GEORGIAN_DOCS.md`, `TESTING_QUALITY_GATES.md` and the lessons A section I read in full or in the relevant part.
- The code was B's reviewed, hash-pinned sketch, with no hand edits.
- Pre-flight gate, after the fact:
  - **Assumptions:** apply the sketch as-is.
  - **Smallest version:** the patch (8 insertions, 31 deletions, plus 2 new files).
  - **Files:** the 9 grants.
  - **Success:** covering green, mutants equal, `ROWS 22 ALL_OK True`.
- `/check` asks for `npm run verify` and `test:e2e:smoke`. Under the speed rules and the orchestrator override, A ran only the scoped Biome check, typecheck, lint and covering tests. **Full verify and smoke were not run by A**; they are root gate rows.

Final state, re-checked after the last doc edit:
- doc l.3 and l.4 exact;
- the 7 headings in order;
- `pending` count 0;
- `sha256sum -c` all OK;
- `git status` shows the 9 paths.

Not run by A (C rows): C11 legacy playhead stubbed probe, C12, C4b default motion, and the HEAD `:5178` control server. The full suite, build and verify are root gate rows.

## code-reviewer (actual subagent, read-only) — score 8.5/10, no Critical/High
- **Info, fixed:** doc 296 said the leftover `shadow-glow` class "paints `none`". The reviewer said Tailwind v4 generates no CSS for it. I checked this myself: the stylesheet served by `:5173` (`/app/styles/app.css?direct`, 276,639 bytes, 3 `btn-primary` hits) has 0 `shadow-glow` occurrences (`a-round-453/served-app.css`). I reworded three lines of doc 296 to say the class generates no CSS, so the computed `box-shadow` is `none`.
- **Medium, for B (not in A's ownership):** `.claude/primitives/DESIGN_TOKENS.md:89` still recommends `shadow-glow`. `docs/design/components/button.md:13` and `docs/design/DESIGN_SYSTEM.md:1078,1155` are stale too. I did not edit them: they are outside the grant, and changes to primitives are proposals for Saba.
- **Low, for B (the test file is B's hash-pinned sketch; editing it would break C3 and the mutant equality):**
  - `store-glow-shadow.test.ts:18-19`: the patterns do not match a future `shadow-glow-accent` utility class.
  - `:65-81` `ruleBodiesFor` skips blocks with nested braces (CSS nesting) and does not hide quoted braces. This is a second CSS parser next to `helpers/style-scan.ts`.
  - GS3 checks the text of `.button-primary` but not its fill: a brass `linear-gradient` that does not use `--gradient-primary` would pass. Suggested fix: assert `background: var(--color-brand);`.
- **Low, already owned by 2b-3d:** `app.css:1743` and `:2212` still transition `box-shadow`, which no longer changes.
- **Info, pre-existing:** inline `rgba` box-shadows in `routes/store.tsx:482-484`; `PurchaseHeader.tsx:231` uses `text-black`.
- **Architecture note (proposal for B/root, not implemented):** keep GS3's local parser for now. With STORE-2b-3c, which owns `style-scan.ts`, export one nesting-aware `cssRuleBodies(css, selector)` from the helper and switch GS3 to it. Done when the helper self-tests cover nesting and quoted braces. Low cost.

## Known gaps
- C11 legacy and C12 were not run by A.
- The `isLoading` state has no browser row (no backend).
- The fake-bearer premium path is BLOCKED (backend unavailable in cloud).

## Exact next C checks
C1–C14 as written in `current-task.md` §3. Priorities:
- **C4/C6:** the HEAD control on `:5178` must show the teal hover glow.
- **C11:** the legacy stubbed playhead and the Export Audio hover.
- **C12:** studio and purchase protection.
- **C13:** doc 296 l.4 is exactly `**სტატუსი:** In Progress (stage 2b-3b of STORE-2b; C round 453 PASS)`, and the GS1–GS4 and ST5 ids exist.
- **C10:** rerun the mutants on C's own scratch.

## Scope completed
A steps 2–8 are done. Step 1 (reading) is partial; see "Process honesty". B acceptance rows I truly reproduced on A's tree:
- C2 (claims): yes.
- C3 (sha): yes.
- C4/C5/C6/C9: tree side only (`compare-glow` against B's HEAD JSON, not a live HEAD server).
- C7/C8: tree side only.
- C10: covering tests and mutants, yes.

C11, C12, C4b and C14 were not run. This round is not complete until C returns PASS.

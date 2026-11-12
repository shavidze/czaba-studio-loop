# A round 463 — STORE-2b-3d-2: dead Store CSS removal (+ C-R462-01)

**Needs B ruling (not a STOP): A-R463-REVIEW-M1.** DC2 matches keyframes names as text, so 4 keyframes are now kept with no animation use. At HEAD (`git show eb4d6df:app/styles/app.css`, l.249/1303/2998/3041) their only animation consumers were rules this round deleted (pruned-list), so this round orphaned them. Effect: no visible change (no element animates with them; DC2 and the generator share the text rule). Why not a STOP under L11: not a behaviour regression against HEAD, not a spec conflict, no ruled formula changed by A. Fix is outside the grants (pinned CSS/test). Details below.

Scope complete as dispatched. Logs in `a-round-463/`.

## Process notes (honest)
- Pre-flight skill (`.claude/skills/pre-flight/SKILL.md`) was read **after** applying the sketch and writing doc 302, not before. In substance: assumptions = B's task; smallest version = the pinned sketch plus one doc; files = the 7 grants; success = the §4 commands. All were stated in the task and run, but the gate was not written out in chat beforehand.
- `/check` (`.claude/commands/check.md`) asks for `npm run verify`. Under the 2026-10-21 speed rules and this task, verify/build/full suite are gate rows and were not run. Biome was scoped to the owned paths: `npx biome check` on the 2 CSS files + 3 tests gives rc 0 (`biome-owned.log`). Biome's config processed only the 3 TS files ("Checked 3 files"); CSS is not covered by Biome here.
- Reading: lessons A part was first read truncated, then re-read in full for L11/L26/L28. Of the primitives, GEORGIAN_DOCS and TAILWIND_FIRST were read in full or near full; DESIGN_TOKENS and TESTING_QUALITY_GATES partially; BUG_HUNTING_TESTS headings only. No test was authored by A (all tests are B's pinned sketch). `context/active-summary.md` was not read (first command's output was truncated); the task file was read in full.
- Temporary writes inside the store (each removed right after its run): `.a463-tw.mjs` at the store root (needed for module resolution) and `docs/.a463-nonvac.md` (the non-vacuity probe doc, outside the grants). `git status` afterwards shows exactly the 7 grant paths.
- Doc 302 was edited after the first code-reviewer run; a second code-reviewer delta review of doc 302 ran: 9/10, no Medium. Its Low (are "music-listing"/"product-detail" exact deleted classes?) was checked: no family word in the doc is an exact deleted class token in `pruned-list.txt`; `literals=0`.
- Final re-checks after the last doc edit: `sha256sum -c` 6 OK; `grep -ci pending` 0; `literals=0`; claims-after identical with empty stderr; leak probe `cssEqual true`; `git status` 7 paths.

## Changed files (store; exactly the 7 grant paths)
`git status --short --untracked-files=all`:
- M app/lib/__tests__/store-gradient-text.test.ts (sketch)
- M app/lib/__tests__/store-live-teal.test.ts (sketch)
- M app/styles/app.css (sketch)
- M app/styles/base/utilities.css (sketch)
- M docs/implementation/2026/quarter-IV/301-store-2b-3d-1-dead-store-modules.md (sketch)
- ?? app/lib/__tests__/store-dead-css.test.ts (sketch)
- ?? docs/implementation/2026/quarter-IV/302-store-2b-3d-2-dead-store-css.md (A wrote it)

No other files. The temporary probe files (`.a463-tw.mjs`, a probe doc) were removed right after each run.

## Steps actually run
1. Pre-read: lessons.md (A part); primitives TAILWIND_FIRST, DESIGN_TOKENS, TESTING_QUALITY_GATES, BUG_HUNTING_TESTS, GEORGIAN_DOCS.
2. Claims before: `claims-before.txt` identical to `b-round-462/claims-463-planning-output.txt`; `claims-before.err` 0 bytes.
3. Apply: `sha256sum -c sketch-463.sha256` 1 OK; `git apply` clean; `sha256sum -c sketch-463-files-sha256.txt` **6 OK** (re-checked after the final doc edit: 6 OK).
4. Doc 302 (Georgian, TEMPLATE order): l.4 exact `**სტატუსი:** In Progress (stage 2b-3d-2 of STORE-2b; C round 463 PASS)`; `grep -ci pending` = 0; 7 TEMPLATE `## ` headings in order; `doc-class-literals.py` → `checked=209 literals=0`; cites only existing rows (DC1–DC3, GT1, GT6, LT3, LT5, LT6, LT9).
5. Checks:
   - `npm run typecheck` rc 0 (`typecheck.log`).
   - `npm run lint` rc 0, **192 warnings** (`lint.log`).
   - `npx biome check` on the 3 test files rc 0 (`biome-tests.log`).
   - `npx vitest run $(cat b-round-462/covering-463.txt)`: **14 files / 148 tests passed**, rc 0, Duration 4.13 s, no slow test (`covering.log`).
   - Mutants (scratch `/tmp/a463-mut` = eb4d6df + sketch, committed): `a-round-463/mutants/mutants.txt` **identical** to `b-round-462/mutants/mutants.txt` (BASE GREEN; M1–M11 RED with the listed rows).
6. Extra A check, Tailwind doc leak (C-R462-01 class): `a-round-463/tw-doc-leak.mjs` uses Tailwind's oxide Scanner on the store (1306 files incl. doc 302), compiles `app/styles/app.css` with candidates of all other files vs plus doc 302's → **`cssEqual true`** (`tw-doc-leak.txt`). Non-vacuity: a doc copy with an extra arbitrary letter-spacing utility → `cssEqual false`, the utility printed (`tw-doc-leak-nonvacuity.txt`). Static proxy only; C6 stays the real check.
7. Claims after: `claims-after.txt` identical to `b-round-462/claims-463-expected-after-A.txt`; `claims-after.err` 0 bytes (re-run after the last doc edit).
8. Not run (gate rows): full suite, `verify`, `npm run build`.

## code-reviewer (real subagent run; 7/10, no High)
CSS and tests are byte-pinned by the sketch, so A changed only doc 302 in response.
- **A-R463-REVIEW-M1 (Medium, test strength → B):** DC2 counts a keyframes name as consumed when it appears anywhere as a whole word (comments, variable names, type fields). A confirmed with a single-line grep for `animation:`/`animate-`/`--animate-`: four kept keyframes have no animation use — `float` (app.css ~193; only a comment in audio-encoder.worker.ts), `grain` (~206; a JSX comment), `fadeInUp` (~1265; a framer variable in about.tsx), `fadeOut` (~1276; a type field). `pulse` is live via Tailwind `animate-pulse`. At HEAD each was animated only by a rule this round deleted, so they are now orphaned; they stay because the generator and DC2 share the text rule. No visible change: an incomplete cleanup, not a behaviour regression. Proposal: DC2 counts animation declarations/animate utilities only, plus a comment-only fixture; delete the 4 in a follow-up. Doc 302 now states the text-match rule and lists this in TODO (reviewer M2 fixed in the doc).
- L1: DC1 weak for one-word state classes (active/playing/selected/visible match Tailwind prefixes, tags, identifiers). → B.
- L2: remaining families (premium card, track row, waveform, artist) have consumers only in unmounted files; DC1 "rendered" = "named in source". → doc TODO, LEGACY-DEAD remainder.
- L3: two section-header comments left over an orphan keyframes / nothing (app.css ~203–205, ~1283–1287); missing blank line ~1239. Pinned → B; in doc TODO.
- L4 (pre-existing): undefined custom properties used (`--color-accent-hover`, `--color-text-primary`, `--radius-xs`, `--primary-hue/sat/light`); global transition/press rules duplicated in app.css and utilities.css; `.track-row-waveform:hover` declared twice. → B.
- L5: GT1 title still mentions an allow-listed dead rule while the allow-list is `{}`. Pinned → B; in doc TODO.
- L6: M10/DC3 only bind the Lenis classes the fixture uses (dropping one of the other two turns only DC1 red); the test excludes `__tests__` dirs but not `*.test.*` outside them (related to TL-R463-L3). → B.
- L7: doc 302 had bare words "block", "inline", "filter". No new CSS, but A replaced them with Georgian words; leak probe `cssEqual true`.
- **Architecture note (for B/root, not acted on):** "used" is defined twice (external `css-prune.py` and `store-dead-css.test.ts`), both text-based and already different (ts/tsx vs js/md). Later bounded task: one comment-stripped reference helper in `helpers/style-scan.ts` once ARCH-CHECKPOINT-STYLE-SCAN allows; DC2 matches animation declarations only, with a comment-only fixture; delete the 4 orphans. Keep the split this round.

## B acceptance status after A (A-side only; C decides PASS)
- §4 steps 2–7 done: claims before; apply 6 OK; doc 302; typecheck, lint 192, biome, covering 14/148, mutants identical, code-reviewer; claims after identical; scope = 7 paths.
- Not claimed by A: C3–C10 browser/build rows. A did not run C6/C7/C8.

## Known gaps
- A-R463-REVIEW-M1 (4 orphan keyframes kept by text matches): pinned, outside A's edit scope, for B. The doc names it in words only.
- The reviewer could not read `b-round-462/pruned-list.txt` (it looked in the wrong place; the file exists in the loop folder), so its check of the deleted list was partial. Mutants and B's browser probe cover it.

## Exact next C checks
C1 scope (7 paths) · C2 `bash b-round-462/claims-463.sh` = `claims-463-expected-after-A.txt`, empty stderr, plus the L29 grep · C3 6 OK · C4 covering 14/148 · C5 C's own mutant scratch = B's · C6 prod builds HEAD vs TREE, `build-compare.txt` cmp-equal (A's static leak proxy predicts no CSS diff from doc 302) · C7 dead-css-pages 26 rows plus non-vacuity · C8 Studio protection probe at 1440/1280 · C9 doc 302 l.4, pending 0, headings, literals=0; doc 301 K7/K16 · C10 l57 check.

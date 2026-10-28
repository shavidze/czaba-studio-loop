# A — Round 40 report: TM-B42 (D-46) hover feedback only on buttons that can act

## Baseline
- HEAD `24e9723557fb82d572a655136ff7a0849a8e61f3`, tree clean before work (`git status --porcelain --untracked-files=all` empty).

## Changed files (exactly the 5 owned paths)
Applied `b-round-39-exp/prototype.diff` with `patch -p1` (dry-run first, all 5 hunks clean).
- `src/renderer/src/components/ui/button.tsx` — 5 variants `hover:x` → `enabled:not-aria-disabled:hover:x` (secondary wrapped; `aria-disabled:` base line is now line 36).
- `src/renderer/src/components/schema/SchemaEditor.tsx` — lines 202/210/230/291 `hover:` → `enabled:hover:`.
- `docs/design/style-guide.md`, `docs/design/component-specs.md` — D-46 text as in the diff.
- `docs/bugs/001-save-and-selection-known-limits.md` — only lines 24 and 317 (`button.tsx:35` → `:36`).

Self-checks:
- `git diff 24e9723` `+`/`-` lines = 42, sorted set identical to `prototype.diff` (`DIFFLINES-EQUAL`).
- button.tsx, SchemaEditor.tsx, style-guide.md byte-identical to B's `*.txt` full copies.
- `diff <(git show 24e9723:docs/bugs/001-…) docs/bugs/001-…` → only `24c24`, `317c317`.
- `sed -n 36p button.tsx` → `'aria-disabled:opacity-50 aria-disabled:cursor-not-allowed',`.
- No comment / `any` / `export` in `+`/`-` src lines. No untracked files. tests/ and protected paths untouched.

## Tests actually run
1. verifyCommand from clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`; fixtures + `npm run check` + `xvfb-run -a npm run test:e2e`) → **exit 0** (`a-round-40/verify.log`):
   - Biome `src/`: 0 errors, **8 warnings**; same 8 file locations as `c-round-35/biome-new.txt` (FileList, TagsInput, AudioPlayer, FolderBrowser, TemplatePicker, input, select, toast);
   - typecheck passes (part of check); `npx tsc -p tsconfig.web.json --noEmit` → 0 separately;
   - renderer **310/310**, main **93/93**, E2E **7/7**.
2. `xvfb-run -a npx playwright test --retries=0` → **7/7**, exit 0 (`a-round-40/e2e-retries0.log`).
3. Built CSS (`out/renderer/assets/*.css`):
   - `:enabled:not([aria-disabled="true"]):hover` for `bg-accent/90`, `bg-brand-hover`, `bg-destructive/90`, `bg-elevated`;
   - `:enabled:hover` for `border-brand`, `text-destructive`, `text-destructive/80`, `text-foreground`;
   - `.hover\:bg-brand-hover` count 0.
4. Supporting smoke only (not C's R40-3): copy of B's `hover-probe.mjs` with `OUT=a-round-40/` on my tree under xvfb (`a-round-40/hover-a40.json`, screenshots `hover-a40-*.png`). pageErrors `[]`.
   - Disabled steps rest == hover: H1, H2, H4 (bg 18,217,200 both; opacity 0.5, not-allowed, aria-disabled true), H5, H6 (color unchanged, eff. opacity 0.6, cursor default), H7 (0.3, not-allowed), H8 (Rescan, 0.5, not-allowed).
   - Enabled controls still change: H0 / H3b bg → 29,237,219; H3 arrow color → 238,239,241; H6b X → 239,67,67; H7b Add Field bg → 25,29,36.

## Code review
- `code-reviewer` subagent run on the diff (5 files changed). It found nothing blocking: the variant syntax is right and the code follows the project rules. I did **not** apply its findings. R40-1 requires the `+`/`-` lines to equal `prototype.diff` exactly, so any extra docs edit would fail that check. They go to B instead:
  - **A-R40-01 (low, docs):** `docs/design/component-specs.md:376` ("Hidden field chip") still says `hover:text-foreground hover:border-brand`, but SchemaEditor.tsx:230 now uses `enabled:hover:…`. This is outside the prototype diff.
  - **A-R40-02 (low, docs):** "D-46" is cited in style-guide.md:215/235 and component-specs.md:50, but no D-46 entry exists in `docs/bugs/001-…` (the list ends at D-45). Either B adds the decision entry in a docs round, or root records it in feature-status.
  - **A-R40-03 (info):** AudioPlayer.tsx:114-117 avoids hover on its disabled state with a conditional class, not the `enabled:hover:` pattern. It behaves the same, and Deviation 4 leaves it unchanged.
  - **A-R40-04 (info, pre-existing):** component-specs.md:369 says the field row is `py-1`, but the code uses `py-1.5`. Natively disabled plain `<button>`s in SchemaEditor have no `cursor-not-allowed` (related to B-R39-02).

## Known gaps
- I did not run old-vs-new comparison (old build), H9–H11, R40-4 keyboard save with ffprobe/music-metadata, R40-5 mutants, R40-7 WebFetch. These are C's.
- No new test (styling-only, per task "Tests: None").

## Next checks for C
- R40-1..R40-7 as written in `current-task.md`. Note: my probe output lives in `a-round-40/`; C should use its own copy in `c-round-40/`. `/tmp/b40/sample.wav` must be recreated in C's job.

## Acceptance IDs I truly ran (A-side, not a substitute for C)
- R40-1 ownership checks: passed my run.
- R40-2 CSS grep: passed my run.
- R40-6 gate: passed my run (exit 0, 0/8 Biome, 310/93/7, retries=0 7/7).
- R40-3: only new-tree smoke H0–H8; old build, H9–H11 not run → not claimed.
- R40-4, R40-5, R40-7: not run.

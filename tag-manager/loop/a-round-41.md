# A — Round 41 (TM-B43, docs only)

**STATUS: DONE (A side).** realVerified for R41-3 (real-app DOM) = **not run by A**. That check belongs to C.

## Baseline
- HEAD `e386cca619e44be8dc3fe0217600beae9608d804`. Tree clean before the round (`git status --porcelain --untracked-files=all` was empty). No release commit.

## What A did
- `patch -p1 --dry-run < b-round-40-exp/prototype.diff`: clean, no fuzz and no reject (3 files checked).
- `patch -p1 < …/prototype.diff`: clean. No hand edits.

## Changed files (only the 3 owned paths)
| File | diff --stat |
|---|---|
| `docs/bugs/001-save-and-selection-known-limits.md` | 24 (+21/−3) |
| `docs/bugs/README.md` | 2 (+1/−1) |
| `docs/design/component-specs.md` | 31 (+28/−3), `### SchemaEditor` section only |

## Checks A actually ran
- **Ownership (R41-1 pre-check):**
  - `git status --porcelain --untracked-files=all` shows only the 3 ` M` paths, with nothing untracked.
  - `git diff --quiet e386cca -- src tests .claude .github package.json package-lock.json docs/design/style-guide.md` exits **0**.
  - Sorted `+`/`-` body lines: git diff = **57**, prototype.diff = **57**. `cmp` reports **EQUAL**.
  - `cmp` against B's copies: all 3 files are **EQUAL** (`component-specs.md.txt`, `001-…md.txt`, `README.md.txt`).
- **Docs ↔ code (R41-2 pre-check):** `grep -nF` of each spec string against `SchemaEditor.tsx`. All were found:
  - `flex flex-col h-full` :152; header `px-3 py-2 border-b border-outline flex items-center gap-2` :153; Back `text-muted hover:text-foreground p-0.5 transition-colors` :157; title `text-xs font-medium text-brand` :161; `Customize Fields` :161;
  - content `flex-1 overflow-y-auto p-3` :164; `disabled={isApplying}` and `min-w-0 space-y-4 disabled:opacity-60` :165; footer `p-3 border-t border-outline` :274;
  - row `flex items-center gap-1.5 rounded px-2 py-1.5` :172 and `bg-background border border-outline text-xs` :173;
  - arrow `text-dim enabled:hover:text-foreground p-0.5` and `opacity-30` :291 (`reorderArrowClassName`, used at :186 and :194);
  - Trash2 `text-destructive enabled:hover:text-destructive/80 p-0.5` :202; X `text-dim enabled:hover:text-destructive p-0.5` :210;
  - chip lines 1 and 2 :230;
  - Done `aria-disabled={isApplying || fields.length === 0}` :280, `aria-busy={isApplying}` :281, `Applying...` :283. Done is `variant="primary" size="sm" className="w-full"` (:276–278).
  - `sed -n` on the line refs: :157 = Back (ArrowLeft), :202 = Trash2, :210 = X (`title="Hide standard field"`), :230 = hidden chip. `ui/button.tsx:9` is `variantStyles`, and all 5 variants carry `enabled:not-aria-disabled:hover:` (lines 10–15).
- **Counts (R41-4 pre-check):**
  - `grep -c '^## [0-9]'` gives **22**; `grep -c 'სტატუსი:\*\* გასწორდა'` gives **13**.
  - The README row says `22 ჩანაწერი; 13 გასწორდა; დანარჩენი 9-დან 5`.
  - The D-46 bullet is line 25, directly after D-45 (line 24).
  - `grep -rn "known-limits.md:[0-9]" --include=*.md` finds nothing.
- **Gate (R41-5), clean start** (`rm -rf out test-results playwright-report tests/fixtures/*.wav`), full verifyCommand. Log: `a-round-41/gate.log`, **EXIT=0**:
  - Biome: 0 errors, **8 warnings**. Same file/rule list as `c-round-35/biome-new.txt` (A's list in `a-round-41/biome-new.txt` also carries line:col).
  - typecheck (node/web/test): 0 errors.
  - Renderer **310/310** (21 files), main **93/93** (11 files), E2E **7/7**.
- `xvfb-run -a npx playwright test --retries=0` gives **7/7**, EXIT=0 (`a-round-41/e2e-retries0.log`).
- **code-reviewer subagent** (3 files changed): see "Review" below.

## Acceptance status (A's view)
- R41-1: passed (A ran every listed command).
- R41-2: passed on source grep and line refs.
- R41-4: counts and placement passed. A did not WebFetch the Reference URLs in entry (22); C does.
- R41-5: passed (exit 0, 8 warnings, 310/93/7, retries=0 7/7).
- **R41-3: NOT run by A.** The real-app DOM className check and the screenshot are C's.

## Known gaps
- A did not run R41-3 (real app) or check the Reference URLs through WebFetch.
- The Biome warning comparison matched file and rule only, because the round-35 list has no line:col.

## Next checks for C
1. R41-1: repeat the cmp checks and the 57-line sort/cmp from a fresh shell.
2. R41-3: build, launch Electron, open Customize Fields, and hide a field (chip). Read className from the DOM for the header, Back, fieldset, row, arrow, X, chip and Done. Add a custom field and read Trash2. Check that Done shows `aria-disabled="false"` and `aria-busy="false"`. Take `r41-schema-editor.png` and confirm `pageErrors` is empty.
3. R41-4: WebFetch the Reference URLs in entry (22). Compare entry (22) with your round-40 evidence (rgb values, `ea4a1cb`, B-R39-01).
4. Markdown: A counted 8 fences in `### SchemaEditor` (4 blocks) and 62 in the whole file, both even. C checks the rendering and entry (22)'s numbered Reproduction list.

## Review (project `code-reviewer` subagent, 3 files)
No blocking findings. All 6 checks passed: class strings and line refs, no stray `hover:`, entry (22) field order, counts 22/13/9 (5 Saba), fences, and facts. The reviewer also confirmed:
- the rgb values in entry (22) match `app.css:27-28` brand/brand-hover;
- the built CSS contains `:enabled:not([aria-disabled="true"]):hover`.

There are two optional notes. A did **not** apply them, because the task requires every file to be byte-identical to B's copy. They are recorded for B:
- **A-R41-01 (info):** `001-…md:344`, entry (22), Deviation (4). The list of never-disabled plain-`hover:` buttons is incomplete. It is missing TagsInput remove-tag `TagsInput.tsx:62`, `MetadataPanel.tsx:313` and FolderBrowser `:236/:67/:254`. The claim is still true. The fix is to mark the list as non-exhaustive (`მაგ.`) or complete it.
- **A-R41-02 (info, likely not a bug):** `001-…md:25`, D-46. The reviewer flagged "cue" as a possible stray word. The task text itself uses "the cue was older than D-45" (B-R39-01), so it reads as intentional English technical wording. B decides.

## Extra R41-1 note
`git diff e386cca -- docs/design/component-specs.md` has a single hunk, `@@ -362,20 +362,45 @@`. Its changed lines fall between `### SchemaEditor` (line 363) and `## Component Authoring Pattern` (new line 406). Line 362 is only context.

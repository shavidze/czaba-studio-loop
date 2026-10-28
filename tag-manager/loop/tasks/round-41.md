# CURRENT TASK — Round 41: TM-B43: docs only: the SchemaEditor spec matches the code, and D-46 enters the decision log

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-28

## Why this round
- **Round 40: C PASS** (R40-1…R40-7, realVerified=true). Root published `e386cca`, and the review returned COMMIT OK with 0 critical/high/medium findings. TM-B42 and D-46 are **done**, and `e386cca` is the baseline.
- **Round 40 left 1 low bug, plus findings in the same 3 docs files.** C's bug comes first, and there is no critical, high or medium bug open:
  - **C-R40-01 = A-R40-01:** `docs/design/component-specs.md:376` ("Hidden field chip") still says `hover:text-foreground hover:border-brand`, but `SchemaEditor.tsx:230` uses `enabled:hover:…`. The whole SchemaEditor section was already stale at baseline:
    - the container `mt-3 rounded-md border border-brand …` does not exist;
    - the row says `py-1`, but the code has `py-1.5` (A-R40-04(a)).
  - **A-R40-02 = RR-R40-01:** `style-guide.md:215/235` and `component-specs.md:50` cite D-46, but the decision log in `docs/bugs/001-save-and-selection-known-limits.md` ends at D-45.
- This is a **docs-only** round. The Reference-first rule does not apply (fix/docs rounds are exempt). There are no new tests: `test-on-bugfix` covers logic changes, and nothing in `src/` changes.
- **B's prototype** (`b-round-40-exp/`):
  - B applied it to a `git archive` of `e386cca` with `patch -p1` (dry run first, then the real apply), and the result equals B's proto tree;
  - the proto has 22 `## N.` entries and 13 `**სტატუსი:** გასწორდა`;
  - every class string in the new spec block was copied from `SchemaEditor.tsx` at `e386cca`. B checked lines 152–291 of the source.

## Baseline
- HEAD `e386cca619e44be8dc3fe0217600beae9608d804`. The working tree is clean (`git status --porcelain --untracked-files=all` is empty). If HEAD differs or the tree is dirty, stop and report.
  - Exception (project release-commit rule): a root `chore(release): vX.Y.Z` commit directly on `e386cca` that changes only the two `version` fields counts as the baseline.
- **Frozen (byte-identical to `e386cca`):** every path not listed under File ownership, in particular:
  - all of `src/**`, `tests/**`, `.claude/**` and `.github/**`;
  - `vitest.config.*.ts`, `playwright.config.ts`, `biome.json`, `tsconfig*.json`, `electron.vite.config.ts`;
  - every other `docs/**` file, including `docs/design/style-guide.md`.
- **Protected (never touch):** `src/preload/index.ts`, `src/preload/index.d.ts`, `src/renderer/src/styles/app.css`, `package.json`, `package-lock.json`, `.github/workflows/release.yml`, `.claude/settings*`, `.claude/hooks/**`.

## Scope
The canonical text of every change is `<loop>/b-round-40-exp/prototype.diff`: 57 `+`/`-` lines, not counting the 6 `---`/`+++` header lines.
- Apply it from the repository root: `patch -p1 --dry-run < <loop>/b-round-40-exp/prototype.diff`, then the same command without `--dry-run`.
- Full copies of the result are in `b-round-40-exp/component-specs.md.txt`, `001-save-and-selection-known-limits.md.txt` and `README.md.txt`. Each changed file must end byte-identical to its copy.
- If `patch` reports fuzz or a reject, stop and report. Do not hand-edit around it.

### 1. `docs/design/component-specs.md`: the `### SchemaEditor` section (C-R40-01, A-R40-04(a)); stays English like the file
- **Remove** the non-existent `**Container:**` line.
- **Add** a one-line intro: the editor replaces the whole MetadataPanel while open.
- **Add** a `**Structure:**` block in the same format as the MetadataPanel block:
  - header `px-3 py-2 border-b border-outline flex items-center gap-2`, with Back (`text-muted hover:text-foreground p-0.5 transition-colors`) and the title (`text-xs font-medium text-brand`);
  - content `flex-1 overflow-y-auto p-3`, with `<fieldset disabled={isApplying} class="min-w-0 space-y-4 disabled:opacity-60">` around the three sections;
  - footer `p-3 border-t border-outline`, with the Done button.
- **Field row:** `py-1` → `py-1.5`.
- **New "Row icon buttons" block:** the reorder arrow, Trash2 and X, with their exact `enabled:hover:` classes, and `opacity-30` on the edge arrow.
- **Hidden field chip:** `hover:` → `enabled:hover:` on both classes.
- **New Done line:** the `Applying...` label, `aria-disabled={isApplying || fields.length === 0}` and `aria-busy={isApplying}` (D-45).
- **New closing sentence:** Back keeps plain `hover:`. The icon buttons and the chip use `enabled:hover:`, and Add Field is a ghost `Button`, so none of them has a hover shift while disabled (D-46).
- No other section of the file changes.

### 2. `docs/bugs/001-save-and-selection-known-limits.md` (A-R40-02, RR-R40-01; Georgian with English technical terms)
- **Line 3 (status):** the fixed-entry list gets `(22)`.
- **Line 4 (source):** add `TM-B42 (round 40)`.
- **Line 5 (code):** `button.tsx` gets `variantStyles` next to `aria-disabled:` classes.
- **New bullet `- **D-46:**` directly after the D-45 bullet (new line 25).** It covers:
  - the 5 variants with `enabled:not-aria-disabled:hover:`;
  - the SchemaEditor fieldset buttons with `enabled:hover:` (`:202`, `:210`, `:230`, `reorderArrowClassName`);
  - Back `:157` stays plain;
  - the AudioPlayer already follows the rule;
  - the cue was older than D-45 (B-R39-01);
  - the rejected alternative is `pointer-events-none`;
  - it ends with `ჩანაწერი (22).`
- **New entry `## 22.` at the end**, in the same field order as entry (21): ID, Severity, ფაილი, მიღწევადობა, Reproduction, Reference, Deviations, გადაწყვეტილება, ტესტი, სტატუსი.
  - The `ტესტი` line says why there is no unit test (styling only; jsdom does not compute `:hover`) and names the round-40 real-app measurement as the protection.
  - The status is `გასწორდა (D-46, TM-B42)`.
  - This is intentional. The status legend defines `გასწორდა` as "protected by a test". For this styling-only fix, the `ტესტი` line serves as the protection record, and it points to the round-40 real-app measurement. C treats the status as planned, not as a new finding.
- **Existing line references do not move:** everything above the D-46 bullet keeps its line number, and entries (1)–(21) move down by 1 line.

### 3. `docs/bugs/README.md`
- Change the count to `(22 ჩანაწერი; 13 გასწორდა; დანარჩენი 9-დან 5 Saba-ს კითხვაა)`.

### Tests
None. This round changes docs only. The renderer suite stays at 310, main at 93 and E2E at 7.

### Not in this round
These stay recorded and are not dropped:
- **A-R40-04(b) / B-R39-02:** plain disabled `<button>`s have no `cursor-not-allowed`. This is a UX change and needs reference-first.
- **RR-R40-04:** the `IconButton` architecture signal.
- **A-R40-03:** an AudioPlayer note.
- **RR-R35-02:** the timeout, which is a Saba question.

## File ownership (nothing else may change)
| May modify | Why |
|---|---|
| `docs/design/component-specs.md` | §1, the `### SchemaEditor` section only |
| `docs/bugs/001-save-and-selection-known-limits.md` | §2 |
| `docs/bugs/README.md` | §3 |

A also writes `a-round-41.md` (and any `a-round-41/` logs) in the loop folder. Gitignored output is allowed: `out/`, `test-results/`, `playwright-report/`, `tests/fixtures/*.wav`, `coverage/`.

## Acceptance (C)

| ID | Check | Evidence that means PASS |
|---|---|---|
| R41-1 ownership | `git status --porcelain --untracked-files=all`; `git diff --stat e386cca`; `git diff --quiet e386cca -- src tests .claude .github package.json package-lock.json docs/design/style-guide.md`; sorted `+`/`-` body lines of `git diff e386cca` vs the same lines of `prototype.diff`; `cmp` of each changed file against its `b-round-40-exp/*.txt` copy | Only the 3 owned paths changed, and nothing is untracked. `--quiet` exits 0. There are 57 body lines. `sort` both lists, keeping the duplicate blank `+` lines, and `cmp` reports EQUAL. All 3 files are `cmp`-identical to B's copies. In `component-specs.md`, only lines inside the `### SchemaEditor` section changed. |
| R41-2 docs ↔ code | For every class string and attribute in the new SchemaEditor spec block (header, Back, title, content, fieldset, footer, row lines 1–2, arrow, Trash2, X, chip lines 1–2, `opacity-30`, Done's `aria-disabled`/`aria-busy` expressions and the `Applying...` label), run `grep -F` against `src/renderer/src/components/schema/SchemaEditor.tsx`. Also run `sed -n` on the refs in the D-46 bullet and in entry (22) (`SchemaEditor.tsx:157`, `:202`, `:210`, `:230`, `reorderArrowClassName`, `ui/button.tsx` `variantStyles`) | Every string occurs verbatim in the source. Each line ref points to the named button, so `:157` is Back, `:202` is Trash2, `:210` is X and `:230` is the chip. No `hover:` without `enabled:` is left in the spec for a button that can be disabled. C lists every string with its source line number. |
| R41-3 real app | Launch the built app (`npm run build`, Playwright `_electron`, `xvfb-run`). Open a folder with a fixture WAV, select it, click `Customize Fields`, and hide one standard field so a chip exists. Read from the DOM the `className` of the header, Back, the fieldset, a row, an arrow, X, the chip and Done. Add one custom field and read Trash2. Then read the `aria-disabled` and `aria-busy` of Done. | Each DOM `className` contains every class token listed in the spec for that element. Done has `aria-disabled="false"` and `aria-busy="false"` at rest. Screenshot `r41-schema-editor.png`. `pageErrors` is empty. This proves the doc describes the running app, not just the source text. |
| R41-4 counts and Georgian docs | `grep -c '^## [0-9]'` and `grep -c 'სტატუსი:\*\* გასწორდა'` in 001; read line 3, the D-46 bullet, entry (22) and the README row | 22 entries and 13 fixed. Line 3 lists `(22)`. The README says 22/13/9, and the 9 open entries (5 of them Saba questions) are unchanged from `e386cca`. The D-46 bullet sits directly after D-45 and ends with `ჩანაწერი (22).` Entry (22) has the 10 fields in entry (21)'s order. Its Reference URLs open (WebFetch) and still say what the entry claims. Its content matches C's round-40 evidence: the rgb values, `ea4a1cb` and B-R39-01. |
| R41-5 gate (real Electron) | On A's tree, start from a clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`). Run the full `verifyCommand`, then `xvfb-run -a npx playwright test --retries=0` | Exit 0. Biome 0 errors and **8** warnings, the same list as `c-round-35/biome-new.txt`. Typecheck 0. Renderer **310/310**, main **93/93**, E2E **7/7**, and `--retries=0` gives **7/7**. Nothing moves, because `src/` and `tests/` are untouched. |

## What could break (C re-checks)
- **Other doc sections:**
  - `component-specs.md` outside `### SchemaEditor`, including the Button section with the D-46 sentence at line 50, and the MetadataPanel block;
  - `style-guide.md` must stay byte-identical.
- **Line references into 001:** nothing in the repository cites `001-…md:<line>`. B checked with `grep -rn "known-limits.md:[0-9]"`, which found nothing. C repeats the grep.
- **Markdown rendering:**
  - the new code fences in component-specs open and close in pairs;
  - entry (22)'s numbered Reproduction list renders.
- **E2E 7/7 and the unit suites:** these are unaffected, and the gate (R41-5) confirms it.

## What realVerified means here
- PASS needs R41-3: the running app's DOM matches the corrected spec. R41-2 (source grep) alone is not enough.
- PASS on all 5 checks closes:
  - TM-B43;
  - findings C-R40-01, A-R40-01, A-R40-02, RR-R40-01 and A-R40-04(a). A-R40-04(b) stays open with B-R39-02.
- Windows packaging is BLOCKED: Windows packaging is not available in the cloud. It is not part of this round.

## Next (orientation only)
- If C finds a FAIL, round 42 fixes it first.
- After TM-B43, every remaining scoped item is waiting on someone outside the loop.
- **Saba's decisions:**
  - TM-T1-MIG: confirm D-07, no auto-migration. C's round-3 regression already shows Category under Hidden Standard Fields, but the backlog entry carries `needs_user`;
  - TM-T1-DUP: the old custom field vs the category;
  - TM-B08: artists ISTR vs IART, D-12;
  - TM-B11: the Number default `0`, D-10;
  - TM-B05: the empty data chunk;
  - TM-B06: Biome on `tests/`;
  - TM-T2 / TM-T2-DATA: the UCS list and its licence;
  - RR-R35-02: the timeout;
  - B-R36-01: the list lock during a scan.
- **Root's green Actions `Check` link on `7879ee0` or later:** TM-T0, TM-T0-CI, TM-T0-CI-FU, TM-B14.
- Low or info items that need no Saba decision (e.g. A-R40-04(b)/B-R39-02 cursor, RR-R39-02 test move, A-R39-01 stricter match) are records, not scope. B decides in round 42 whether any of them justify a round, or whether the loop reports BLOCKED on the Saba questions.

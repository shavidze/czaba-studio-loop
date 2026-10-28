# CURRENT TASK — Round 40: TM-B42 — hover feedback only on buttons that can act (D-46)

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-28

## Why this round
- **Round 39: C PASS** (R39-1…R39-5, realVerified=true, no bug). Root published `24e9723`. The review returned COMMIT OK with 0 critical/high/medium findings. TM-B41 is **done**. `24e9723` is the baseline.
- **No critical, high or medium bug is open.** TM-B42 (low) is next in dependency order (TM-B41 → TM-B42).
- **B measured TM-B42's opening question** (`b-round-39-exp/`; throwaway builds in `/tmp/b40`; the repository was not touched).
  - **Method:** `hover-probe.mjs` launches the real Electron app with Playwright `_electron` under `xvfb-run`. It reuses C's round-38 harness for the delayed scan and write. It moves the mouse onto a button and reads `getComputedStyle` at rest and on hover.
  - `matchMedia('(hover: hover)')` is true under xvfb, so Tailwind's `hover:` rules apply.
  - **`ea4a1cb` (native `disabled`) and `24e9723` (`aria-disabled`) behave the same on every step** (`hover-old.json`, `hover-new.json`, `hover-summary.txt`):
    - clean Save Tags, busy `Saving...` and `Applying...` Done: bg `rgb(18, 217, 200)` → `rgb(29, 237, 219)` on hover;
    - inside the disabled fieldset, the middle reorder arrow and the Hide-standard X change text colour on hover;
    - Add Field (disabled by the fieldset) and Rescan (disabled during a scan) change bg on hover.
  - **Conclusion:** Chromium matches `:hover` on natively disabled buttons. The cue that RR-R38-01 called new is **older** and is not a D-45 regression (finding B-R39-01). Under TM-B42's own rule ("red only if they differ") there is no regression.
  - **Why TM-B42 still runs:** the cue contradicts the reference (see Reference). The project rule says that a difference from the reference with no listed reason is a bug. So TM-B42 goes on as a fix of the pre-existing cue. Scope is not reduced: it covers RR-R38-01 and RR-R38-04, and also Rescan and Add Field, which share the cause.
- **B's prototype** (`b-round-39-exp/prototype.diff`, applied to a `git archive` of `24e9723`):
  - `hover-proto.json`: on every disabled or `aria-disabled` step rest == hover; every enabled control still changes on hover;
  - renderer 310/310 (`proto-renderer.log`);
  - `tsc -p tsconfig.web.json` 0;
  - Biome `src/` 0 errors / 8 warnings once `biome format` wrapped the `secondary` line (the wrap is already in the diff);
  - the built CSS has `:enabled:not([aria-disabled="true"]):hover` for the 5 variants and `:enabled:hover` for the fieldset buttons;
  - `pageErrors` was empty in all runs.

## Reference
- **R1 (in-app):** `src/renderer/src/components/player/AudioPlayer.tsx:114-118`. The disabled play button drops `hover:bg-elevated` and shows `text-dim cursor-not-allowed`. This is the app's own pattern: a disabled control gives no hover feedback.
- **R2:** Bootstrap 5.3, Buttons → "Disabled state", https://getbootstrap.com/docs/5.3/components/buttons/: "Disabled buttons have `pointer-events: none` applied to, preventing hover and active states from triggering." B fetched it with WebFetch on 2026-10-28.
- **R3:** Tailwind CSS docs, "Hover, focus, and other states", https://tailwindcss.com/docs/hover-focus-and-other-states:
  - the `enabled` variant is "most helpful when you only want to apply another style when an element is not disabled", with the example `enabled:hover:border-gray-400 disabled:opacity-75`;
  - the `aria-disabled` variant is `&[aria-disabled="true"]`;
  - `not-*` combines with other variants;
  - `hover` = `@media (hover: hover) { &:hover }`.
- **R4:** the round-38 references for D-45 (MDN `aria-disabled`). With `aria-disabled`, the author must supply the disabled look and suppress the action. D-45 did this for opacity, cursor and click, but not for hover.

## Deviations (each with its reason)
1. **No `pointer-events: none`, although R2 uses it.** Pointer events stay on:
   - D-45 shows `cursor-not-allowed` on a disabled button, and `pointer-events: none` would hide that cursor;
   - the `aria-disabled` click guard (D-45) stays the only place that blocks the action.

   Only the hover colour is suppressed.
2. **The fieldset-disabled reorder arrows keep `cursor: default`** while Applying (B-R39-02; `ea4a1cb` does the same). This round removes only their hover colour. The cursor is not part of RR-R38-01/04 and is recorded separately.
3. **The focus ring stays** on a focused `aria-disabled` button (`focus-visible:ring-2`). Keyboard users must see where focus is (D-45, round-38 K1–K3). R2 does not cover this case: its disabled buttons cannot be focused at all.
4. **Buttons that can never be disabled keep plain `hover:`**: Back, TitleBar, toast close, and the template and FileList controls. The rule only matters where a button can be disabled. AudioPlayer already follows R1 and does not change.

## Baseline
- HEAD `24e9723557fb82d572a655136ff7a0849a8e61f3`; working tree clean (`git status --porcelain --untracked-files=all` empty). If HEAD differs or the tree is dirty, stop and report.
  - Exception (project policy release-commit rule): a root `chore(release): vX.Y.Z` commit directly on `24e9723` that changes only the two `version` fields counts as the baseline.
- **Frozen (byte-identical to `24e9723`):** every path not listed under File ownership. In particular:
  - every other `src/**` file, including `MetadataPanel.tsx`, `AudioPlayer.tsx` and `FolderBrowser.tsx`;
  - all of `tests/**`, `.claude/**`, `vitest.config.*.ts`, `playwright.config.ts`, `biome.json`, `tsconfig*.json`, `electron.vite.config.ts` and `.github/**`;
  - every `docs/**` file except the three listed. In `docs/bugs/001-save-and-selection-known-limits.md`, only lines 24 and 317 change; `docs/bugs/README.md` does not change.
- **Protected (never touch):** `src/preload/index.ts`, `src/preload/index.d.ts`, `src/renderer/src/styles/app.css`, `package.json`, `package-lock.json`, `.github/workflows/release.yml`, `.claude/settings*`, `.claude/hooks/**`.

## Scope
The canonical text of every change is `b-round-39-exp/prototype.diff` (42 `+`/`-` lines, without the `---`/`+++` headers).
- Apply it from the repository root: `patch -p1 < <loop>/b-round-39-exp/prototype.diff`.
- B dry-ran it on a fresh `git archive` of `24e9723`. All 5 files applied, and the result equals B's prototype tree.
- Full-file copies: `b-round-39-exp/button.tsx.txt`, `SchemaEditor.tsx.txt` and `style-guide.md.txt`.

### 1. `src/renderer/src/components/ui/button.tsx` (D-46)
- In `variantStyles`, each of the 5 variants changes `hover:<x>` to `enabled:not-aria-disabled:hover:<x>`:

  | Variant | `<x>` |
  |---|---|
  | `primary` | `bg-brand-hover` |
  | `secondary` | `bg-elevated` |
  | `ghost` | `bg-elevated` |
  | `accent` | `bg-accent/90` |
  | `destructive` | `bg-destructive/90` |

- Biome's formatter wraps the `secondary` line onto two lines, as the diff shows. This moves the base-class lines down by 1, so `aria-disabled:opacity-50 …` is now line 36.
- The base classes, `sizeStyles`, the props and the export do not change.

### 2. `src/renderer/src/components/schema/SchemaEditor.tsx` (D-46)
- In 4 places, `hover:` becomes `enabled:hover:`. Each is a same-line edit, so no line numbers move:

  | Line | Button | New class |
  |---|---|---|
  | 202 | Trash2 | `text-destructive enabled:hover:text-destructive/80 p-0.5` |
  | 210 | Hide-standard X | `text-dim enabled:hover:text-destructive p-0.5` |
  | 230 | hidden-standard chip | `… text-dim enabled:hover:text-foreground enabled:hover:border-brand transition-colors` |
  | 291 | `reorderArrowClassName` | `cn('text-dim enabled:hover:text-foreground p-0.5', isEdge && 'opacity-30')` |

- Back (line 157) is outside the fieldset and is never disabled, so it does not change (Deviation 4).

### 3. Docs (the 3 files, exactly as in the diff)
- **`docs/design/style-guide.md`** (stays English, like the rest of the file):
  - **Hover → Buttons:** add the `enabled:not-aria-disabled:hover:…` rule (D-46) and one line for icon buttons that can be disabled (`enabled:hover:…`);
  - **Disabled:** add the `aria-disabled:` line and one sentence: a disabled button has no hover shift.
- **`docs/design/component-specs.md`:**
  - the Hover column of the Button variants table gets the `enabled:not-aria-disabled:` prefix;
  - the base-class block gets the `aria-disabled:` line, which has been missing since round 38;
  - one English sentence (the file is English) names D-46.
- **`docs/bugs/001-save-and-selection-known-limits.md`:** on lines 24 and 317, `ui/button.tsx:35` → `ui/button.tsx:36`, because of the line shift from §1. Nothing else changes.

### Tests
None.
- The repository rule `test-on-bugfix` exempts styling-only changes ("მხოლოდ UI/styling ცვლილებაა (Tailwind classes)").
- jsdom computes neither `:hover` nor Tailwind CSS, so a test of the class strings would only repeat the diff.
- The proof is C's real-app hover measurement (R40-3) and the CSS check (R40-2).
- No test file changes; the renderer stays at 310.

### Not in this round
- **B-R39-02** (arrow cursor while Applying): see Deviation 2.
- **RR-R38-05** (a `Button` `busy`/`inert` prop): an architecture signal.
- **RR-R35-02** (timeout): an open Saba question. It is not dropped.

## File ownership (nothing else may change)
| May modify | Why |
|---|---|
| `src/renderer/src/components/ui/button.tsx` | §1 |
| `src/renderer/src/components/schema/SchemaEditor.tsx` | §2, lines 202/210/230/291 only |
| `docs/design/style-guide.md` | §3 |
| `docs/design/component-specs.md` | §3 |
| `docs/bugs/001-save-and-selection-known-limits.md` | §3, lines 24/317 only |

A also writes `a-round-40.md` (and any `a-round-40/` logs) in the loop folder. Gitignored output is allowed: `out/`, `test-results/`, `playwright-report/`, `tests/fixtures/*.wav`, `coverage/`.

## Acceptance (C)

### R40-1 ownership
**Check:**
- `git status --porcelain --untracked-files=all`
- `git diff --stat 24e9723`
- `git diff --quiet 24e9723 -- . ':!<5 owned paths>'`
- Compare the `+`/`-` lines with `prototype.diff`.
- `diff <(git show 24e9723:docs/bugs/001-…) docs/bugs/001-…`

**PASS when:**
- only the 5 owned paths changed, and nothing is untracked;
- the `+`/`-` lines equal `prototype.diff` (42 lines);
- docs/bugs/001 shows only `24c24` and `317c317`;
- `--quiet` exits 0 for `tests/` and for the protected paths;
- there is no comment, no `any` and no new export.

### R40-2 CSS
**Check:** run `npm run build`, then grep `out/renderer/assets/*.css`.

**PASS when:**
- there are `…:enabled:not([aria-disabled="true"]):hover` rules for `bg-brand-hover`, `bg-elevated`, `bg-accent/90` and `bg-destructive/90`;
- there are `:enabled:hover` rules for `text-foreground`, `text-destructive`, `text-destructive/80` and `border-brand`;
- no `.hover\:bg-brand-hover` selector is left.

### R40-3 real app, old vs new (hover)
**Check:**
- Run Playwright `_electron` under `xvfb-run` on two builds: `24e9723` (old) and A's tree (new).
- Hover with the mouse. Read `getComputedStyle` at rest and again after at least 300 ms of hover.
- Use a copy of B's `b-round-39-exp/hover-probe.mjs` in `c-round-40/` with `OUT` set to `c-round-40/` (B's folder is not C's to write; `HARNESS` stays read-only from `c-round-38/`), args `<appRoot> <label>`, or C's own driver. The harness may delay scan and write, as in round 38.
  - B's probe reads `/tmp/b40/sample.wav`, which does not survive the job. Recreate it first: `mkdir -p /tmp/b40 && ffmpeg -v error -f lavfi -i sine=frequency=440:duration=1 -ar 44100 -ac 2 -y /tmp/b40/sample.wav`.
  - The old build comes from `git archive 24e9723` + a `node_modules` symlink + `npx electron-vite build`.
- Cover steps H0–H8 from `hover-summary.txt`, plus C's own steps:
  - **H9:** Trash2 on a custom field, enabled and while Applying;
  - **H10:** a hidden-standard chip (hide one standard field first), enabled and while Applying;
  - **H11:** the AudioPlayer play button, disabled (no file playing) and enabled.
- Take screenshots of H1, H4 and H5 on new.

**PASS when:**
- **new, disabled steps:** on every disabled or `aria-disabled` step, the rest colour equals the hover colour. These steps are H1, H2, H4, H5, H6, H7, H8, H9-applying, H10-applying and H11-disabled;
- **new, enabled controls:** they still change on hover, with the same values as old. These are H0 (dirty Save), H3 (arrow), H3b (Done), H6b (X), H7b (Add Field) and H9/H10-enabled;
- **old, disabled steps:** they change colour on hover. This shows the cue existed;
- **new, unchanged:** opacity (0.5 / 0.6 / 0.3), cursor (`not-allowed` / `default`), `aria-disabled` and `aria-busy`;
- H11 is identical on old and new;
- `pageErrors` is empty.

### R40-4 behaviour unchanged (keyboard + save)
**Check:** on new, repeat the round-38 K2 path once: select a.wav, type a Category, focus Save Tags, press Enter.

**PASS when:**
- focus stays on the button during the save and after it (D-45);
- there is exactly one `meta:write`;
- ffprobe `format_tags` and music-metadata (`exif:ICAT` / RIFF INFO) both read the new ICAT value;
- every other file's sha256 is unchanged.

### R40-5 mutants
**Check:** on a copy of A's tree, revert one class edit at a time, build, and re-run the matching H step.

**PASS when:**
- each revert brings back a hover change on its step:

  | Reverted edit | Step where the hover change returns |
  |---|---|
  | primary: `not-aria-disabled:` dropped | H1 / H2 / H4 (aria-disabled) |
  | ghost: `enabled:` dropped | H7 / H8 (native disabled) |
  | reorder arrow (`enabled:` dropped) | H5 |
  | Hide-standard X | H6 |
  | Trash2 | H9 |
  | hidden-standard chip | H10 |

- **Expected survivors (equivalent today; C confirms by grep and records them, not a FAIL):**
  - primary with `enabled:` dropped: no natively disabled primary Button exists;
  - ghost with `not-aria-disabled:` dropped: no `aria-disabled` ghost Button exists;
  - both halves of secondary, accent and destructive: none is ever disabled (`grep -rn 'variant="secondary\|accent\|destructive"' src/`);
- the copy is restored afterwards.

### R40-6 gate (real Electron)
**Check:** on A's tree, start from a clean state (`rm -rf out test-results playwright-report tests/fixtures/*.wav`). Run the full `verifyCommand`, then `xvfb-run -a npx playwright test --retries=0`.

**PASS when:**
- exit code is 0;
- Biome reports 0 errors and **8** warnings, the same list as `c-round-35/biome-new.txt`;
- typecheck node/web/test is 0;
- renderer **310/310**, main **93/93**, E2E **7/7**;
- `--retries=0` gives **7/7**.

### R40-7 Reference / Deviations / docs
**Check:**
- Open R2 and R3 with WebFetch.
- Check Deviations 1–4 in the app.
- Read `git diff 24e9723 -- docs/`.

**PASS when:**
- R2 still says that disabled buttons get no hover or active state;
- R3 shows the `enabled` and `aria-disabled` variants;
- Deviation 1: the `not-allowed` cursor still shows on hover;
- Deviation 2: the arrow cursor is `default`;
- Deviation 3: the focus ring shows on a focused `aria-disabled` Save Tags (screenshot);
- Deviation 4: the Back arrow still changes colour on hover;
- the docs match the code, and the D-46 sentence is in component-specs;
- lines 24 and 317 point to `button.tsx:36`, and `sed -n 36p` shows the `aria-disabled:` line.

## What could break (C re-checks)
- **Every `Button` in the app**: Open Folder, Rescan, Close Folder, Add Field, the template buttons and the Save/Done variants. Their enabled hover must look exactly as before. Compare H0, H3b and H7b on old and new, plus one secondary or ghost button outside the fieldset.
- **D-45** (focus kept, click guard, `aria-busy`): covered by R40-4. The class change must not touch the guards.
- **SchemaEditor at rest**: the arrows, X, Trash2 and chip must hover as before (H3, H6b, H9-enabled, H10-enabled).
- **Edge arrows** are natively disabled at the list ends, so they lose their hover colour even when not Applying. This is intended: a disabled arrow does nothing, and R1–R3 agree. C notes it with one measurement.
- **E2E 7/7**: the specs do not depend on hover.

## What realVerified means here
- PASS needs real-app evidence of two kinds:
  - computed styles under a real mouse hover in the built Electron app, old vs new (R40-3);
  - the keyboard save, checked with independent readers (R40-4).
- B's numbers are a hypothesis until C reproduces them.
- PASS on all 7 checks closes:
  - TM-B42 and D-46;
  - findings RR-R38-01, RR-R38-04 and B-R39-01.
- Windows packaging is BLOCKED: Windows packaging is not available in the cloud. It is not part of this round.

## Next (orientation only)
- If C finds a FAIL, round 41 fixes it first.
- After TM-B42, the todo items that need Saba's decision before they can be planned:
  - TM-B08 (artists ISTR vs IART, D-12);
  - TM-B11 (Number default `0`, D-10);
  - TM-B05 (empty data chunk);
  - TM-B06 (Biome on `tests/`);
  - TM-T1-DUP (old custom field vs category);
  - TM-T2 / TM-T2-DATA (UCS list and licence);
  - RR-R35-02 (timeout);
  - B-R36-01 (list lock during a scan).
- **TM-T1-MIG** may not need Saba: its acceptance is a C real-UI check under D-07's default (an existing schema.json lists category under hidden standards, and it can be enabled), plus a doc note. B checks in round 41 whether today's build already behaves this way.
- TM-T0 / TM-T0-CI / TM-T0-CI-FU / TM-B14 wait for root to link a green Actions `Check` run on `7879ee0` or later.

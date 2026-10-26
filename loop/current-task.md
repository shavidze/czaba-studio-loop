# CURRENT TASK — Round 178: DUX-R-5b-3a — one colour rule, part 3 stage 3a: labels, status texts, hover text, the demo badge, the Grid menu checks and the Export dialog note / progress / overload go neutral (DetailPanel, StudioWorkspace, Library, GridMenu, ExportDialog) + gate-177 S5 (doc 146 → Completed) + C-R177-G1-562 (ExportDialog kept count 6 → 5); nothing moves

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-26 · Decision: **D-29z143** (`backlog.json` → VISUAL-A-OBSIDIAN `dux_r5b3a_plan_d29z143`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-177.md`, an exact copy of the round-177 `current-task.md` (sha256 `68eb9b00…`, checked with `cmp`). The rationale for this round is in `b-round-177.md`.
- **User authority:** `user-review/design-ux-decisions.md` (2026-10-25): "**DUX-R-5: approve.** One colour rule … The accent (brass in Obsidian) is reserved for selection, the playhead, the primary button and focus … Keep the contrast thresholds from D6."
- **Ruling R34 (round 175, vetoable):** brass stays on selecting an object, playheads, the primary action (Export) and focus. Mode toggles, on-states, affordances, labels and warnings go neutral. **R35 (round 176, vetoable):** add/import buttons are not the primary action (they are in 5b-3b).

## Baseline = HEAD `cc984b6`, clean tree (gate 177 published)
- **Gate:** `gates/gate-round-177.json` has status `published` and commit `cc984b6f06ded21ec35593fc6dbb65353c153b1e` on both remotes.
- **Tree:** `git status --short` is empty, and `git ls-files -co --exclude-standard` lists **1001** files.
- **Frozen list:** `b-round-177-r178-tree-sha256.txt`, **989 entries** (1001 minus the 12 grants).
- **Grants:** `b-round-177-r178-grants.txt` (12 existing files). **New files:** `b-round-177-r178-new-files.txt` (2 files).
- **Start hashes:** `b-round-177-r178-granted-start-sha256.txt`. **Start copies:** `b-round-177/r178-granted-start/`.
- **Vitest base:** `b-round-177-r178-vitest-base.txt` (12 files) is **134/134** at `cc984b6` (`b-round-177/out/vitest-base.json`, run by B).
- **Line numbers** below were grepped by B at `cc984b6`, per token (not per line).
- **A's first step:** check that HEAD = `cc984b6`, the tree is clean, `sha256sum -c --quiet b-round-177-r178-tree-sha256.txt` is OK, the 12 start hashes match, and neither new file exists. If anything differs, stop and report.

## 0. Why this round (D-29z143)
- **Round 177: C PASS**, `browserVerified` and `realVerified` true, 0 bugs of any severity. Root published `cc984b6` (review 9/10, nothing blocking; verify 176 files / 2603 tests, build OK). **DUX-R-5b-2b → მზადაა; GATE176-S1 → closed.**
- **No open C bug.** Regression: `regression-last.json` = 2026-10-24, due on or after 2026-10-27. Today is 2026-10-26: **not due**. Checkpoint: no answer to `b-round-173-checkpoint-request.md`; fallback (c) continues (B appended a round-177 addendum, non-blocking).
- **Next stage, fixed in advance** in `tasks/round-177.md` §7 ("C PASS → DUX-R-5b-3 … split by B if it is too large"). **B splits 5b-3**, because it covers 7 components, at least 8 test locks and five different recipes:
  - **5b-3a (this round):** the text-only sites: labels, status texts, `hover:text-brand`, the demo badge, the Grid menu checks, the Export dialog note / progress / overload and the Library filter. 5 components, one token per site.
  - **5b-3b (after):** the Lane drop ring, drop hint and ghosts, and the R35 add/import buttons (Lane l.723/731, LibraryPreview l.332). Their acceptance needs real drags, and `affordance-colour-ui` `LATER_STAGE_BRASS_SITES` moves with them.
  - **DUX-R-5 is not მზადაა until 5b-3a and 5b-3b both pass C.** The stage-exit INVENTORY-GREP after 5b-3b must map every non-focus `brand|accent` token to K only.
- **Folded in (cheap, in this round's own files):**
  - **Gate-177 S5:** doc 146 status → Completed (D1).
  - **C-R177-G1-562:** `affordance-colour-ui` `KEPT_BRASS_COUNTS` counts ExportDialog `accent-brand` = 6, which includes the progress bar l.562, a 5b-3 site. E2 neutralises l.562, so the kept count becomes **5** (the K7 radios l.300/333/356/405/435).
  - **Round-177 DXT8 label fix:** `mode-toggle-colour-ui.test.tsx` l.495–499 lists the demo badge as "kept"; it is a 5b-3 site (round-177 §0.2). It moves to the "gone" list (L6).
- **Rulings on round-177 items (recorded in `b-round-177.md`):** A-R177-TS1-FOLLOW and A-R177-LRS3-CLASS are **accepted** (forced by T3/Y1; C confirmed no lock weakened). The stale TS1 / LPS1 titles stay until their files are next granted (not this round).

## 0.1 Recipes and B's computation (sRGB WCAG, Obsidian tokens `app/styles/app.css` l.3920–3942)
`foreground` #ece6da, `muted` #a39b8e, `outline-strong` #736b60, `background` #0e0d0c, `surface` #161412, `elevated` #1d1a17. The status footer, the header and the Grid menu are `bg-surface`; so is the Export dialog footer.

| Recipe | Sites | Measure | over background | over surface | over elevated | Criterion |
|---|---|---|---|---|---|---|
| **Label / count / warning → `text-foreground`** (keep `font-medium` where present) | group count, selection count, lane-move refusal, Library filter value, Export empty note, Export overload alert, Grid menu check glyphs | text vs backdrop | 15.62 | 14.78 | 13.94 | **≥ 4.5:1** |
| **Hint → `text-muted`** | range Delete hint | text vs backdrop | 7.06 | 6.68 | 6.30 | **≥ 4.5:1** |
| **Hover text → `hover:text-foreground`** | Apply, 0 dB, Detail panel toggle (base already `text-foreground`, so no visible text change; the existing fill step is the hover cue); `← CZABA` exit link (base `text-muted` → `foreground` on hover) | hover text vs backdrop | 15.62 | 14.78 | 13.94 | **≥ 4.5:1** |
| **Badge → `border-outline-strong` + `text-muted`** | demo badge (header, `bg-surface`) | text / border vs backdrop | 7.06 / 3.70 | 6.68 / 3.50 | 6.30 / 3.30 | text **≥ 4.5:1**; border **≥ 3:1** (recorded; the badge is not interactive) |
| **Progress → `accent-foreground`** (the 5b-1 pattern) | Export progress bar | brass scan | — | — | — | **0** brass px |

- **Why warnings go neutral and not to `text-warning`:** Obsidian `--color-warning` is `#d9a35b` (R − B = 126), which fails the brass scan (`R − B ≥ 45`). R34 puts warnings on the neutral side. They stay distinguishable: the refusal sits inside a `text-muted` hint line (l.2603); the empty-project note follows a `text-muted` note (l.519); the overload alert keeps `role="alert"`; `text-destructive` stays reserved for the export error (master-ui l.696 keeps `not text-destructive`).
- **Why the Grid menu checks go neutral (vs the K7 chosen Export card):** each check mark is the visible half of `aria-checked` on a `menuitemradio` / `menuitemcheckbox` (Snap is one of them, a mode toggle). That is an on-state, not object selection (R34). The K7 Export cards are large selection surfaces in the primary-action dialog and stay brass. Vetoable.
- **Why the Delete hint is `text-muted`, not `text-foreground`:** the range readout before it is already `text-foreground` (`StudioWorkspace.tsx` l.2549). A `muted` hint stays distinguishable (2.21:1 between them) and matches the lane-move hint line (`text-muted`, l.2603).
- **Brass test (C):** `R − B ≥ 45`. `foreground` 18, `muted` 21, `outline-strong` 19 → neutral. No `warning` / `destructive` / `positive` token is added.
- **R29 (tailwind-merge):** each new token replaces one old token of the same property (`hover:text-foreground` for `hover:text-brand`; `accent-foreground` for `accent-brand`), so there are no merge conflicts.

## 0.2 Kept brass (unchanged)
- **Inside this round's files:**
  - DetailPanel: the playhead marker `bg-accent` l.180 (K8); every `focus-visible:ring-brand` (K4).
  - StudioWorkspace: the playhead l.450 (K8), the marquee `border border-brand bg-brand/10` l.2504 (K7); every `focus-visible:ring-brand` (K4).
  - Library: the selected option row `'border-brand bg-brand/10 text-brand'` l.49 and `bg-brand/10` l.100 (K7), the search `focus:border-brand` l.473 and the resize handle `focus-visible:bg-brand` l.638 (K10).
  - ExportDialog: the chosen card / radio l.289/300/322/333/345/356/395/405/420/435 (K7), Export `border-brand … text-brand` l.615 (K9).
  - GridMenu: `GRID_MENU_ITEM_CLASS` `focus-visible:ring-brand` l.11 (K4).
- **5b-3b sites (must not change this round):** Lane l.723, l.731, l.842, l.874, l.886/887, l.922/923; LibraryPreview l.332.

## 0.3 Full inventory at `cc984b6` (every non-focus `brand|accent` class token in `app/components/arrangement/` non-test + `app/routes/studio-lab.tsx`)
| Stage | Sites (file : line at `cc984b6`) |
|---|---|
| **K (kept)** | Clip l.826, l.838 (K1); Lane l.665, l.698, l.712, l.840; GroupHeader l.195, l.270, l.355; Library l.49, l.100 (K7), l.473, l.638 (K10); MarkerRow l.806, l.813 (K7), l.847 (K10); StudioWorkspace l.450 (K8), l.2504 (K7); Ruler l.221, l.233; Overview l.334; DetailPanel l.180 (K8); Transport l.340 and ExportDialog l.615 Export (K9); ExportDialog l.289/300/322/333/345/356/395/405/420/435 (K7); LibraryPreview l.270 `fill-brand` (K11); ClipEnvelope (K6/K12, no brand token) |
| **Done neutral 5b-1 (`accent-foreground`)** | DetailPanel l.841; GroupHeader l.338; Lane l.766, l.820; Master l.199; Transport l.278 |
| **Done 5b-2a / 5b-2b** | no brass left at Lane l.615/633, GroupHeader l.288/304/306, Master l.173, DetailPanel l.1121; Transport l.218/234/255–257, TempoRow l.243, StudioWorkspace l.2287/2368/2388, LoopBrace l.239/257, LibraryPreview l.308, Library l.132 |
| **5b-3a (this round)** | DetailPanel l.676, l.752, l.861, l.1142; StudioWorkspace l.2197, l.2210, l.2562, l.2568, l.2605; Library l.492; GridMenu l.204, l.226, l.246; ExportDialog l.524, l.562, l.569 |
| **5b-3b (after)** | Lane l.842 (drop ring), l.874 (drop hint), l.886/887 and l.922/923 (ghosts), l.723/731 (video import, R35); LibraryPreview l.332 (Add, R35) |
| **Out of scope** | `app/components/studio/*` (SRW-21 `deferred_user`) |

(B's per-token scan: GroupHeader l.252 from the round-177 table holds only `focus-visible:ring-brand`. It is K4 and is no longer listed separately.)

## 1. What changes (exact; line numbers at `cc984b6`)
| ID | File : line | From → To |
|---|---|---|
| P1 | `app/components/arrangement/ArrangementDetailPanel.tsx` l.676 (group count) | `className="font-medium text-brand"` → `className="font-medium text-foreground"` |
| P2 | same file l.752 (Apply) | token `hover:text-brand` → `hover:text-foreground` (only this token) |
| P3 | same file l.861 (0 dB) | token `hover:text-brand` → `hover:text-foreground` (only this token) |
| P4 | same file l.1142 (panel toggle) | token `hover:text-brand` → `hover:text-foreground` (only this token) |
| W1 | `app/components/arrangement/StudioWorkspace.tsx` l.2197 (`← CZABA` exit link) | token `hover:text-brand` → `hover:text-foreground` (only this token) |
| W2 | same file l.2210 (demo badge) | `rounded-sm border border-accent px-2 py-0.5 text-xs text-accent` → `rounded-sm border border-outline-strong px-2 py-0.5 text-xs text-muted` |
| W3 | same file l.2562 (range Delete hint) | `className="text-accent"` → `className="text-muted"` |
| W4 | same file l.2568 (selection count) | `className="font-medium text-brand"` → `className="font-medium text-foreground"` |
| W5 | same file l.2605 (lane-move refusal) | `className="font-medium text-accent"` → `className="font-medium text-foreground"` |
| Y1 | `app/components/arrangement/ArrangementLibrary.tsx` l.492 (filter value) | `<span className="text-brand">` → `<span className="text-foreground">` |
| G1–G3 | `app/components/arrangement/ArrangementGridMenu.tsx` l.204, l.226, l.246 (check slots) | `className="flex w-3 justify-center text-accent"` → `className="flex w-3 justify-center text-foreground"` (3 lines) |
| E1 | `app/components/arrangement/ArrangementExportDialog.tsx` l.524 (empty-project note) | `className="text-sm text-accent"` → `className="text-sm text-foreground"` |
| E2 | same file l.562 (progress bar) | `className="h-2 w-full accent-brand"` → `className="h-2 w-full accent-foreground"` |
| E3 | same file l.569 (overload alert) | `className="text-sm text-accent"` → `className="text-sm text-foreground"` |
| L1 | `app/lib/arrangement/__tests__/detail-panel-strings-ui.test.tsx` l.343 | `'hover:text-brand'` → `'hover:text-foreground'` in `surfaceTokens`; add `'hover:text-brand'` to `surfaceForbidden` (l.346). Nothing else. |
| L2 | `app/lib/arrangement/__tests__/panel-radius-ui.test.tsx` l.99–100 | in `WORKSPACE_EXIT_CLASS`, replace `hover:text-brand` with `hover:text-foreground` (the l.537 count stays 1). Nothing else. |
| L3 | `app/lib/arrangement/__tests__/grid-triplet-ui.test.tsx` l.689 (TU11) | `'text-accent'` → `'text-foreground'`, and add `expect(span.className.split(' ')).not.toContain('text-accent');` right after that expectation. Nothing else. |
| L4 | `app/lib/arrangement/__tests__/master-ui.test.tsx` l.695 | `toContain('text-accent')` → `toContain('text-foreground')`, and add `expect(alert.className).not.toContain('text-accent');`. l.696 (`not text-destructive`) stays. Nothing else. |
| L5 | `app/lib/arrangement/__tests__/affordance-colour-ui.test.tsx` l.154 | `[EXPORT_DIALOG_PATH, 'accent-brand', 6]` → `[EXPORT_DIALOG_PATH, 'accent-brand', 5]`. `LATER_STAGE_BRASS_SITES` (Lane ghost, 5b-3b) and its `// TODO:` stay. Nothing else. |
| L6 | `app/lib/arrangement/__tests__/mode-toggle-colour-ui.test.tsx` l.495–499 | the kept `expectCount(WORKSPACE_PATH, 'rounded-sm border border-accent px-2 py-0.5 text-xs text-accent', 1)` becomes the same call with count **0**, at the same position. Nothing else. |
| N1 | **new** `app/lib/arrangement/__tests__/label-status-colour-ui.test.tsx` | tests DXL1–DXL8 (§3.2) |
| D1 | `docs/implementation/2026/quarter-IV/146-studio-dux-r5b2b-mode-toggle-colour.md` | (a) status line → `**სტატუსი:** Completed (C round 177 PASS, გამოქვეყნდა `cc984b6`)`; (b) the l.107 TODO bullet (DUX-R-5b-3) gets the suffix ` — 5b-3a Round 178 (doc 147); 5b-3b შემდეგ.` Nothing else. |
| D2 | **new** `docs/implementation/2026/quarter-IV/147-studio-dux-r5b3a-label-status-colour.md` | Georgian, with the `docs/implementation/TEMPLATE.md` sections: R34, the 5b-3 split and why, the §0.1 recipes and table (with the warning-token and Grid-menu reasons), C-R177-G1-562, the DXT8 label fix, the §0.3 inventory, tests, mutations and TODOs (5b-3b, ROOT-RECON-GRID-HARNESS, the toggle-recipe extraction signal, the vetoable list). Status: `In Progress (awaiting C round 178)`. |

**Constraints:**
- Only the tokens above change. No `style=`, no arbitrary value, no hex, no new CSS, no `app/styles/` edit.
- No `data-*`, aria, role, handler, text, layout, size or position change.
- **StudioWorkspace.tsx:** the diff is exactly **5 changed lines** (l.2197, l.2210, l.2562, l.2568, l.2605). Every other byte is identical.
- **ExportDialog:** exactly 3 changed lines (l.524, l.562, l.569). **GridMenu:** exactly 3 (l.204, l.226, l.246). **DetailPanel:** exactly 4 (l.676, l.752, l.861, l.1142). **Library:** exactly 1 (l.492).
- The §0.2 kept sites and the 5b-3b sites do not change.

## 2. A — files you own (everything else is frozen)
- **The 12 grants** (`b-round-177-r178-grants.txt`): `ArrangementDetailPanel.tsx`, `StudioWorkspace.tsx` (**only the 5 lines**), `ArrangementLibrary.tsx` (**only l.492**), `ArrangementGridMenu.tsx`, `ArrangementExportDialog.tsx`, `detail-panel-strings-ui.test.tsx`, `panel-radius-ui.test.tsx`, `grid-triplet-ui.test.tsx`, `master-ui.test.tsx`, `affordance-colour-ui.test.tsx`, `mode-toggle-colour-ui.test.tsx`, doc 146.
- **The 2 new files:** `label-status-colour-ui.test.tsx` and doc 147.
- **Protected; these must stay byte-identical:**
  - `ArrangementLane.tsx`, `ArrangementLibraryPreview.tsx`, `ArrangementTransport.tsx`, `ArrangementTempoRow.tsx`, `ArrangementLoopBrace.tsx`, `ArrangementGroupHeader.tsx`, `ArrangementMaster.tsx`, `ArrangementClip.tsx`, `ArrangementClipEnvelope.tsx`, `ArrangementOverview.tsx`, `ArrangementMarkerRow.tsx`, `ArrangementRuler.tsx`, `studio-scrollbar.ts`, and every other test file (including `transport-surface-ui`, `library-row-strings-ui`, `lane-strings-ui`, `workspace-strings-ui`, `studio-theme-obsidian`, `content-colour-ui`, `mixer-onstate-colour-ui`, `export-dialog-*` and `export-progress-ui`);
  - `app/styles/`, `Modal.tsx`, `strings.ts`, `view.ts`, `root.tsx`;
  - all routes (including `studio.$productId.tsx` and `studio-lab.tsx`), `app/components/studio/*`, the contexts, `app/lib/auth.ts`, `firebase.client.ts`, the purchase/download/studio-token files, and `.claude/**`.
- **Process rules:**
  - Make every lasting edit with Edit/Write so the primitives hook runs. Use shell writes only for temporary mutations, and restore and sha-check each one.
  - Before writing code, read the primitives the hook names (at least `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `FORWARDREF_COMPONENT.md`, `AGENT_DISCOVERABLE_CODE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`) and `.claude/prompts/new-test.md`.
  - Write `a-round-178/end-sha256.txt` (14 paths) and `a-round-178/diff-vs-start.patch` (against `b-round-177/r178-granted-start/`, with the new files as new).
  - Do not run tools from `tmp/studio-real-loop/`; keep helper scripts under `a-round-178/tools/` and run them with cwd = store. No commit, no push.

## 3. A — tests and commands (speed rules)
### 3.1 Commands
- **Before the edits:** run the 12 base files (`b-round-177-r178-vitest-base.txt`). Expect **134/134**.
- **After the edits:** run the 12 base files plus `label-status-colour-ui.test.tsx`; write the list to `a-round-178/vitest-files.txt`. Everything must be green; report the count.
- **Neighbour check:** also run `export-dialog-hold-enter`, `export-cancel-ui`, `export-mp3`, `detail-panel-fit`, `detail-panel-polish`, `studio-theme-obsidian`, `content-colour-ui`, `grid-snap-ui` and `grid-musical-ui`. They read the changed components; no edits are expected. Report the count.
- **Checks:** `npm run typecheck`, `npm run lint`, and a read-only `npx biome check` on the changed code and test files.
- **Not A's:** the full suite, `npm run verify`, the build, e2e and browser rows.
- **Code review:** ask the `code-reviewer` subagent (3+ changed files) and pass its Architecture note to B verbatim.

### 3.2 New tests (`label-status-colour-ui.test.tsx`; B grepped the repo and IDs DXL1–DXL8 are unused)
**Setup:** mount the real workspace (provider + `StudioWorkspace`) as `mode-toggle-colour-ui.test.tsx` and `master-ui.test.tsx` do (their router `Link` stub, fakes and cleanup). Drive state through real controls or the same `api` helpers those suites use. Assert on class tokens (split on whitespace). A missing element must throw a labelled error (no vacuous pass). **"No brass"** means no token that contains `brand` or `accent`, except `focus-visible:ring-brand` (and, for the `<progress>`, no `accent-brand`).

- **DXL1 (Detail group count):** select two clips. The first `<p>` in `arrangement-detail-group` has `font-medium` and `text-foreground`, no brass.
- **DXL2 (Detail hover text):** `arrangement-detail-apply`, `arrangement-detail-clip-gain-reset` and `arrangement-detail-toggle` each contain `hover:text-foreground` and `text-foreground`, not `hover:text-brand`. The only brass token is `focus-visible:ring-brand`.
- **DXL3 (header):** `arrangement-exit` contains `text-muted` and `hover:text-foreground`, not `hover:text-brand`. The demo badge (found by its `workspaceCollectionCopy('demo').badge` text, imported from `app/lib/arrangement/collection.ts`, with a labelled throw) contains `border-outline-strong` and `text-muted`, no brass and no `border-accent`.
- **DXL4 (footer status):** with a time range set, `arrangement-delete-hint` contains `text-muted`, no brass. With two clips selected, `arrangement-selection-count` contains `font-medium` and `text-foreground`, no brass.
- **DXL5 (Library filter):** activate a Library node as `library-row-strings-ui.test.tsx` does right before its l.311–313 filter checks. The value `<span>` inside `arrangement-library-filter` contains `text-foreground`, no brass; the `<p>` keeps `text-muted`.
- **DXL6 (Grid menu checks):** open the Grid menu as `grid-triplet-ui.test.tsx` TU11 does. Every check slot (`span[aria-hidden="true"]` inside each `menuitemradio` / `menuitemcheckbox`) contains `text-foreground`, not `text-accent`. Checked items still draw exactly one `lucide-check` svg.
- **DXL7 (Export dialog):**
  - (a) With an empty arrangement, the `role="note"` empty-project paragraph contains `text-foreground`, no brass.
  - (b) Provoke the overload as the overload test in `master-ui.test.tsx` (l.684–697) does. `arrangement-export-overload` has `role="alert"` and `text-foreground`, and neither `text-accent` nor `text-destructive`.
  - (c) During a pending render (as `export-progress-ui.test.tsx` does), `arrangement-export-progress` contains `accent-foreground` and not `accent-brand`.
- **DXL8 (source locks, read-only reads):**
  - **Gone (count 0):** DetailPanel `hover:text-brand` and `font-medium text-brand"`; StudioWorkspace `hover:text-brand`, `border border-accent px-2`, `className="text-accent"`, `font-medium text-brand"` and `font-medium text-accent"`; Library `<span className="text-brand">`; GridMenu `justify-center text-accent`; ExportDialog `text-sm text-accent` and `h-2 w-full accent-brand`.
  - **New, exact counts** (B checked each is 0 at `cc984b6`): DetailPanel `hover:text-foreground` **3** and `font-medium text-foreground">{studioDetailStrings.clipCount` **1**; StudioWorkspace `font-medium text-muted hover:text-foreground` **1**, `rounded-sm border border-outline-strong px-2 py-0.5 text-xs text-muted` **1**, `className="text-muted" data-testid="arrangement-delete-hint"` **1**, `className="font-medium text-foreground" data-testid="arrangement-selection-count"` **1** and `className="font-medium text-foreground" data-testid="arrangement-lane-move-refusal"` **1**; Library `<span className="text-foreground">{activeNodeLabel}` **1**; GridMenu `justify-center text-foreground` **3**; ExportDialog `className="text-sm text-foreground"` **2** and `h-2 w-full accent-foreground` **1**.
  - **Kept, exact counts** (B checked at `cc984b6`): ExportDialog `accent-brand` **5** after the edit (6 before) and `border-brand bg-brand/10` **5**; StudioWorkspace `border border-brand bg-brand/10` **1**; DetailPanel `bg-accent` **1** (l.180); Library `'border-brand bg-brand/10 text-brand'` **1** (with the single quotes).
  - If a "new" count differs because Biome re-wraps a line, report it; do not re-wrap by hand.

### 3.3 Mutations
Each mutation is a temporary shell edit, restored and sha-checked afterwards. Write one JSON per mutation in `a-round-178/mutations/`.

| ID | Mutation | Must turn red |
|---|---|---|
| m278 | P1: group count back to `text-brand` | DXL1, DXL8 |
| m279 | P2: Apply `hover:text-foreground` back to `hover:text-brand` | DXL2, DXL8, detail-panel-strings-ui (L1) |
| m280 | W1: exit link back to `hover:text-brand` | DXL3, DXL8, panel-radius-ui l.537 (L2) |
| m281 | W2: badge back to `border-accent … text-accent` | DXL3, DXL8, mode-toggle-colour-ui DXT8 (L6) |
| m282 | W3: Delete hint back to `text-accent` | DXL4, DXL8 |
| m283 | W5: refusal back to `font-medium text-accent` | DXL8 |
| m284 | Y1: filter value back to `text-brand` | DXL5, DXL8 |
| m285 | G2: Snap check slot back to `text-accent` | DXL6, DXL8, TU11 (L3) |
| m286 | E2: progress back to `accent-brand` | DXL7, DXL8, affordance-colour-ui DXA7 (L5) |
| m287 | E3: overload back to `text-accent` | DXL7, DXL8, master-ui (L4) |

m283 is source-only, because the refusal needs a blocked lane drag; its browser half is C's REFUSAL row. If any other mutation stays green, report it and do not weaken the expectation; B rules on it.

## 4. C — rows
Run every row at both viewports (1440×900 and 1280×720), in real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, with a fresh context per session. Pixel rows run at DPR 2 with `--disable-lcd-text` (C-R176-NOBRASS-LCD-GLYPH).

**Setup:** S1 as round 177: load `media/beeps-6s-h264-aac.mp4`, add `demo-middle-east` to Music at 1 s, add one SFX clip. At 1280×720, expand the Clip details panel first (C-R172-DETAIL-COLLAPSED-720).

| Row | What | Pass |
|---|---|---|
| **T178-TARGETED** | Re-run `a-round-178/vitest-files.txt`. | All green, the same count as A. |
| **SOURCE-SCOPE** | The frozen list at start and end; A's `end-sha256.txt`; `git status`; the protected diff against `cc984b6`. | All OK. `git status` shows at most 12 ` M` + 2 `??`. The protected diff is empty. `git diff cc984b6` changes exactly: StudioWorkspace 5 lines (l.2197/2210/2562/2568/2605), ExportDialog 3, GridMenu 3, DetailPanel 4, Library 1. The tree hash at C's start equals the hash at C's end. |
| **AN-REVIEW** | C reads the diff. | Only P1–P4, W1–W5, Y1, G1–G3, E1–E3, L1–L6, N1 and D1–D2 as written; no other token, attribute, text or line. The §0.2 kept sites and the 5b-3b sites are untouched. |
| **INVENTORY-GREP** | Per class token, every non-test `*.ts*` file in `app/components/arrangement/` plus `app/routes/studio-lab.tsx`, for tokens that contain `brand` or `accent` (excluding `focus-visible:ring-brand`, `accent-foreground` and non-class code), mapped to §0.3. | **0 unclassified hits.** Every 5b-3a line no longer matches. The only remaining non-K hits are the 5b-3b lines. |
| **CC-TEXT** | Computed `color` / `border-color` / `accent-color` in the real page: the group count (select 2 clips), the selection count, the Delete hint (range set), the lane-move refusal (REFUSAL row), the Library filter value (click a Library tree node), the demo badge text and border, the exit link at rest and under real-mouse hover, Apply / 0 dB / panel toggle under real-mouse hover, each Grid menu check glyph (open the Grid menu with one division checked and Snap checked), and the Export empty note, overload alert and progress bar. | Foreground sites rgb(236,230,218). The Delete hint and badge text rgb(163,155,142); the badge border rgb(115,107,96). Exit link hover rgb(236,230,218). Apply / 0 dB / toggle hover text rgb(236,230,218), with their fill steps unchanged. The progress `accent-color` is foreground. |
| **NO-BRASS-TEXT** | Pixel scan `R − B ≥ 45` (DPR 2, inset 1, `--disable-lcd-text`, blurred, playhead parked by Home) of each 5b-3a element box above, of the progress bar during a real WAV export, and of the exit link and Detail buttons while hovered. Keep the selected clip (K1), the selected Library row (K7), the Export button (K9), the chosen Export card (K7) and focus rings (K4) out of the boxes. | **0** brass pixels per region at both viewports. Report the count per region. |
| **CONTRAST-TEXT** (D6) | Text vs its real backdrop for each site; the badge border vs the header. | Each text **≥ 4.5:1** (§0.1 predicts 6.30–15.62); the badge border **≥ 3:1** (predicted 3.50 on `bg-surface`). |
| **REFUSAL** | A real-mouse vertical drag of a clip onto a lane where it would overlap an existing clip (the blocked case of `grid-snap-edit.test.tsx` SE18: blocked ghosts plus the overlap text), or of an audio clip onto the video lane, until the footer shows `arrangement-lane-move-refusal`. Read its colour, then release (or Escape) and confirm no clip moved. | The refusal is visible, rgb(236,230,218), with 0 brass in its box, and the drag is refused as before. The Lane ghost in this drag is a 5b-3b site and may still be brass; do not scan it. |
| **EXPORT-STATES** | (a) Empty arrangement: open Export and read the empty note. (b) A real WAV export of S1: the progress bar during rendering. (c) Overload: raise the Master gain to its maximum (and a clip gain if needed), then export WAV and read the overload alert. | (a), (b) and (c) are visible with the CC-TEXT values. If the overload cannot be provoked in two attempts, report (c) as **not run**, with the steps tried (then `browserVerified=false`); B schedules it. |
| **FUNC-SMOKE-TEXT** | In the Grid menu, choose 1/8 and toggle Snap by mouse and by keyboard (the check moves; Snap changes a drag to the grid). Library node filter on and off. Apply on a range in the Detail panel. 0 dB reset. Panel collapse and expand. The exit link has `href="/"` (do not navigate away mid-run, or re-open `/studio-lab` afterwards). | Behaviour unchanged; 0 pageerror. |
| **ENV-VIS** | Re-run C's `c176-env.cjs` (change only the output names), 6 states at both viewports. | Every cell ≥ 3:1. Report any drop > 0.1 against `c-round-177/out/env/env-{1440,1280}-1.json` as a finding. |
| **RV1-DUX5B3A** | `d6.cjs` S0/S1/S2 against round 177 (`c-round-177/out/rv1-dux5b2b.json` and the d6 runs it lists). | 0 missing, 0 added, max box delta 0 (≤ 1 px allowed). The contrast failing set is identical or smaller. Changed keys only at 5b-3a elements. |
| **RV3-STORE** | Grep for hex colours in `app/components/arrangement/`; screenshot `/` (after the intro splash, ≥ 8 s) and `/cart` against round 177's shots. | 0 hex. Both pages unchanged (the hero video frame excepted). |
| **G178-3** | Anonymous `/studio-lab`; `/studio/middle-east`; `GET /api/studio-token?product=middle-east&file=stem1.wav`. | `/studio-lab` opens with the (now neutral) demo badge "Demo collection — no sign-in required", no `auth_user` and 0 cookies. `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`. The token request returns 401. Fake-Bearer 403 → BLOCKED (backend unavailable in cloud). |
| **PX-NET / REG-HYD** | Every session. | 0 forbidden hosts, 0 Authorization headers, 0 hydration messages and 0 pageerror. Only the expected cart noise. |

**Harness notes:**
- If the first cold load crashes, discard that run and replace it once (ENV-FIRST-LOAD). Run the ENV-VIS sessions one at a time.
- Escape does not deselect; Ctrl+click the selected clip to deselect.
- Native `<select>` popups block screenshots; read computed values instead.
- Every run writes a uniquely named output file.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Colour of status texts, hints, warnings and menu check marks | **Not captured this round.** No Live 12 manual section or video was checked for these colours. | — (unverified; B does **not** claim Live looks like this) | A CZABA brand rule (DUX-R-5, Saba 2026-10-25) + R34: labels and warnings are neutral; brass only for selection, the playhead, the primary action and focus. | Parity: **not applicable / unverified**. The CZABA requirement is checked by CC-TEXT and NO-BRASS-TEXT. |
| What the Grid menu, Library filter, Apply / 0 dB, panel toggle, lane-move refusal and export do | Previously verified behaviour (their own SRW rounds; not changed now) | — | Behaviour unchanged | FUNC-SMOKE-TEXT, REFUSAL, EXPORT-STATES |

## 6. Evidence and reporting
- **A:** `a-round-178.md` and `a-round-178/` (vitest JSONs, mutations, end hashes, diff, `vitest-files.txt`).
- **C:** `c-round-178.md`, `c-round-178.json` (`browserVerified`, `realVerified`, `passed`/`failed`/`blocked`/`gate`) and `c-round-178/` (out, shots, tools).
- **Both:** write the report files as you go, not only at the end.

## 7. Outcome, fixed in advance (B at round 179 planning)
| Condition | Round 179 |
|---|---|
| B plans on or after **2026-10-27** (expected) | The **REGRESSION round** comes first: every done / c_pass item at both viewports (one short check each), `npm run test:e2e:smoke`, and the evidence gap C-R167-METRONOME-UNDER-MUTE. A fixes only what C finds. 5b-3b follows it. |
| C FAIL at Critical, High or Medium (text < 4.5:1, NO-BRASS-TEXT > 0, a broken menu / filter / export / refusal) | A bounded fix-up by the same owner within §1, or a question for Saba. It is not deferred silently. |
| INVENTORY-GREP finds an unclassified site | B classifies it at round 179 planning. It is not A's FAIL. |
| REFUSAL not run (the blocked drag could not be reached) | `browserVerified=false`; B schedules the refusal browser check in round 179; 5b-3a is not მზადაა until it runs. |
| EXPORT-STATES (c) not run | B schedules the overload browser check in round 179; 5b-3a is not მზადაა until it runs. |
| C FAIL on Lows only | A fix-up if the Low is in this round's own lines and cheap; otherwise `deferred_low_polish`, and the next stage goes ahead. |
| C PASS | Root publishes round 178. DUX-R-5b-3a → **მზადაა**; C-R177-G1-562 and GATE177-S5 → closed. The next new-scope round is **DUX-R-5b-3b** (Lane drop ring / hint / ghosts, R35 import / Add; `LATER_STAGE_BRASS_SITES` → a neutral count), after the regression round if it is due. When 5b-3b passes C, DUX-R-5 closes and B sends root a bounded frontend-architect checkpoint request (toggle-recipe extraction, token-based test locks, the harness) before M1. |

At every planning, B checks `user-review/ableton-decisions.md`, `user-review/design-ux-decisions.md`, `docs/technical/store-redesign/direction-decision.md`, and whether the checkpoint answer has arrived.

## 8. Root notes
- **Gate:** on C PASS, publish round 178: the changed granted paths plus the 2 new files, against `cc984b6`. These must be unchanged: every protected file in §2, `app/styles/`, `app/components/studio/*` and the purchase/auth files. `StudioWorkspace.tsx` changes only on l.2197, l.2210, l.2562, l.2568 and l.2605.
- **Architecture checkpoint:** still unanswered (`b-round-173-checkpoint-request.md`, fallback (c)). B appended a round-177 addendum: Signal 3 has fired four rounds running (174–177), and gate-177 proposes `studioToggleClass` + DOM-token locks after DUX-R-5 closes. Non-blocking. B will send a fresh bounded request at the DUX-R-5 boundary (after 5b-3b).
- **Gate-177 review findings, as recorded by B:**
  - S1 (Delete with a range has a border that reads like an on toggle) → a vetoable design item in `feature-status.md`.
  - S2 (Follow paused has no distinct accessible name) → `deferred_low_polish` (A11Y-GATE177-FOLLOW-PAUSED-NAME).
  - S3 (the enabled brace is louder) → vetoable.
  - S4 (`border-color` is not in the transition list) → `deferred_low_polish`, together with GATE176-S3.
  - S5 → D1 in this round.
- **User-visible decisions** (vetoable in `feature-status.md`): neutral warnings (refusal, empty note, overload), neutral Grid menu checks, the muted demo badge with an `outline-strong` border, the muted Delete hint, and the foreground counts and filter value.

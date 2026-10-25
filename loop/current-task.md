# CURRENT TASK — Round 177: DUX-R-5b-2b — one colour rule, part 2 stage 2b: the mode toggles go neutral (Loop, Delete with a range, Follow, Metronome, Snap, Env, Waveform Zoom, Loop brace, Library preview) + gate-176 S1 (restore two kept-site count locks); nothing moves

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-25 · Decision: **D-29z142** (`backlog.json` → VISUAL-A-OBSIDIAN `dux_r5b2b_plan_d29z142`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-176.md`, an exact copy of the round-176 `current-task.md` (sha256 `5e55558d…`, checked with `cmp`). The rationale for this round is in `b-round-176.md`.
- **User authority:** `user-review/design-ux-decisions.md` (2026-10-25): "**DUX-R-5: approve.** One colour rule … The accent (brass in Obsidian) is reserved for selection, the playhead, the primary button and focus … Keep the contrast thresholds from D6."
- **Ruling R34 (round 175, vetoable):** mode toggles, on-states, affordances, labels and warnings are not selection, so they go neutral.

## Baseline = HEAD `ff3f710`, clean tree (gate 176 published)
- **Gate:** `gates/gate-round-176.json` has status `published` and commit `ff3f710ecd00e8ee0d3c323252b10bb1a01db76f` on both remotes.
- **Tree:** `git status --short` is empty, and `git ls-files -co --exclude-standard` lists **999** files.
- **Frozen list:** `b-round-176-r177-tree-sha256.txt`, **985 entries** (999 minus the 14 grants).
- **Grants:** `b-round-176-r177-grants.txt` (14 existing files). **New files:** `b-round-176-r177-new-files.txt` (2 files).
- **Start hashes:** `b-round-176-r177-granted-start-sha256.txt`. **Start copies:** `b-round-176/r177-granted-start/`.
- **Vitest base:** `b-round-176-r177-vitest-base.txt` (13 files) is **134/134** at `ff3f710` (`b-round-176/out/vitest-base.json`).
- **Line numbers** below were grepped by B at `ff3f710`. The 5b-2b files were not touched in round 176, so they equal the round-176 §0.3 numbers.
- **A's first step:** check that HEAD = `ff3f710`, the tree is clean, `sha256sum -c --quiet b-round-176-r177-tree-sha256.txt` is OK, the 14 start hashes match, and neither new file exists. If anything differs, stop and report.

## 0. Why this round (D-29z142)
- **Round 176: C PASS**, `browserVerified` and `realVerified` true, 0 bugs of any severity. Root published `ff3f710` (review 8/10, nothing blocking; verify 175 files / 2595 tests, build OK). **DUX-R-5b-2a → მზადაა; A-R175-DETAIL-SEP-ACCENT → closed.**
- **Open finding first:** gate-176 suggestion 1 (Low): round 176 L4(b) removed the DXA7 counts for `ArrangementExportDialog.tsx` `accent-brand` = 6 (K7 chosen card / radio, kept) and `ArrangementLane.tsx` `'border-accent bg-accent/20 text-accent'` = 2 (the ghosts, a 5b-3 site). No other test counts them now. That test file is DUX-R-5's own and the fix is test-only and cheap, so it is restored in this round (§1 G1), with the Lane string listed as **later-stage** (it moves in 5b-3), not as kept. B's ruling: gate-175 S2 and gate-176 S1 disagreed; S1 wins because 5b-2b and 5b-3 still edit nearby sites, and an unlocked K site can drift silently.
- **Then the next stage, fixed in advance** in `tasks/round-176.md` §7 ("C PASS → DUX-R-5b-2b"). Regression: `regression-last.json` = 2026-10-24, so it is due on or after 2026-10-27. Today is 2026-10-25: not due. Checkpoint: no answer to `b-round-173-checkpoint-request.md`; fallback (c) continues (B appended a round-176 addendum, non-blocking).
- **Scope:** every 5b-2b site in round-176 §0.3. 6 components (the protected `StudioWorkspace.tsx` with a **3-line** grant), 7 test files, 2 docs, 1 new test. Each component edit is one class string. 5b-3 comes after. **DUX-R-5 is not მზადაა until 5b-3 passes C.**
- **C's round-176 infos, ruled by B:**
  - **C-R176-MIXED-VS-OFF-FILL** (mixed half vs off fill 2.96): no fill floor is added. The foreground border (13.94) carries mixed vs off. Vetoable.
  - **C-R176-INVENTORY-ACCENT-COLOR:** the 6 `accent-foreground` tokens are added to §0.3 as done 5b-1 neutral sites.
  - **C-R176-NOBRASS-LCD-GLYPH:** every NO-BRASS row on a button with a glyph runs with `--disable-lcd-text` (§4).
  - **A-R176-MIXED-REST-BASE** (3.32) and **C-R176-MIXED-LETTER-4.5** (4.20): recorded, no change.
- **Gate-176 S2** (a shared `ARRANGEMENT_MIX_ON_STATE` constant) is a proposal that needs approval. It is recorded as a signal under GATE167-TOKEN-TEST-FRAGILITY / checkpoint Q1 and is **not** scheduled. S3 (the border switches at once while the fill fades) is info; in 5b-2b the border carries the state, so it stays as it is.

## 0.1 Recipe and B's computation (sRGB WCAG, Obsidian tokens `app/styles/app.css` l.3920-3942)
`foreground` #ece6da, `muted` #a39b8e, `background` #0e0d0c, `surface` #161412, `elevated` #1d1a17. The loop strip is `bg-surface` (`ArrangementLoopBrace.tsx` l.222).

**The recipe (from round-176 §0.4, applied now):** a mode toggle that is on gets **`border-foreground`** and a **`bg-foreground/20`** fill, with the same hover/press fill (R2, because Q-R167-ON-HOVER is still `awaiting_user`). **R2 scope:** hover = press = rest fill applies to the **filled** on-states (Loop, Follow on, Metronome, Snap, Env; Waveform Zoom has no hover/press fill at all, so it is constant too). The **border-only** states (Delete with a range, Follow paused, Preview while previewing) keep the base fill steps `fg/5` → `fg/8` → `fg/12` under hover and press by design, as their brass versions did; for them only the border colour, `border-style` and text must equal rest. **The border carries the state.** The fill is secondary. Where the base already has `text-foreground`, no text token is added; where the base is `text-muted`, `text-foreground` is added. The base `hover:text-foreground` stays (the brass `hover:text-accent` override is simply dropped).

| Measure | over background | over surface | over elevated | Criterion |
|---|---|---|---|---|
| On **border** `foreground` vs backdrop | 15.62 | 14.78 | 13.94 | **≥ 3:1** |
| On text `foreground` vs the `fg/20` fill | 9.40 | 8.56 | 7.92 | **≥ 3:1** (≥ 4.5 recorded) |
| Off `muted` text vs the off fill `fg/5` (unchanged) | 6.45 | 6.03 | 5.61 | unchanged |
| The `fg/20` fill vs the backdrop | 1.66 | 1.73 | 1.76 | **info only** |
| The `fg/20` fill vs the off fill / off-hover / off-press | 1.52 / 1.42 / 1.27 | 1.56 / 1.44 / 1.29 | 1.57 / 1.44 / 1.29 | **info only** |
| Enabled loop-edge hover `fg/50` over the brace fill | — | **3.43** | (3.27) | **≥ 3:1** over the real strip (`bg-surface`) |
| Disabled brace border `muted` (dashed, unchanged) vs backdrop | 7.06 | 6.68 | 6.30 | unchanged |

- **Why the fill is info only:** a `fg/20` tint cannot reach 3:1 against a near-black surface while the text on it stays ≥ 3:1. The on vs off cue is the border (≥ 13.94 against a transparent off border) plus `aria-pressed`. This was fixed in round-176 §0.4 and is vetoable.
- **Brass test (C):** `R − B ≥ 45`. `foreground` has R − B = 18 and `muted` 21, so the recipe is neutral. No `warning` / `destructive` token is used.
- **R29 (tailwind-merge):** each new string has one token per property and replaces the base token through `cn()`, as today: `border-foreground` replaces `border-transparent` / `border-outline`; `bg-foreground/20` replaces `bg-foreground/5` / `bg-surface`; `enabled:hover:bg-foreground/20` replaces `enabled:hover:bg-foreground/8`; `enabled:active:bg-foreground/20` replaces `enabled:active:bg-foreground/12`; `border-dashed` replaces the default `border-solid`.

## 0.2 Kept brass (unchanged, K1–K12)
- **Inside this round's files:**
  - Transport: Export `border-brand font-medium text-brand` l.339 (K9).
  - StudioWorkspace: the playhead l.450 (K8), the marquee `border border-brand bg-brand/10` l.2504 (K7).
  - LibraryPreview: the played wave bars `fill-brand` l.270 (K11).
  - Library: the selected option row `'border-brand bg-brand/10 text-brand'` l.49 and `bg-brand/10` l.100 (K7), the search field `focus:border-brand` l.473 and the resize handle `focus-visible:bg-brand` l.638 (K10).
  - Every `focus-visible:ring-brand` / `focus-visible:ring-1 … ring-brand` (K4).
- **5b-3 sites inside this round's files (must not change):** StudioWorkspace l.2197 (exit link `hover:text-brand`, locked by `panel-radius-ui.test.tsx` `WORKSPACE_EXIT_CLASS`), l.2210 (demo badge `border-accent … text-accent`), l.2562, l.2568, l.2605; LibraryPreview l.332 (Add, R35); Library l.492.

## 0.3 Full inventory at `ff3f710` (every non-focus `brand|accent` class token in `app/components/arrangement/` non-test + `app/routes/studio-lab.tsx`)
| Stage | Sites (file : line at `ff3f710`) |
|---|---|
| **K (kept)** | Clip l.826, l.838 (K1); Lane l.665, l.698, l.712, l.840; GroupHeader l.195, l.252, l.270, l.355; Library l.49, l.100 (K7), l.473, l.638 (K10); MarkerRow l.806, l.813 (K7), l.847 (K10); StudioWorkspace l.450 (K8), l.2504 (K7); Ruler l.221, l.233; Overview l.334; DetailPanel l.180 (K8); Transport l.339 and ExportDialog l.615 Export (K9); ExportDialog l.289/300/322/333/345/356/395/405/420/435 chosen card / radio (K7); LibraryPreview l.270 `fill-brand` (K11); ClipEnvelope (K6/K12, no brand token) |
| **Done neutral 5b-1 (`accent-foreground` = `accent-color: foreground`, not brass; C-R176-INVENTORY-ACCENT-COLOR)** | DetailPanel l.841; GroupHeader l.338; Lane l.766, l.820; Master l.199; Transport l.277 |
| **Done 5b-2a** | (no brass left at Lane l.615/633, GroupHeader l.288/304/306, Master l.173, DetailPanel l.1121) |
| **5b-2b (this round)** | Transport l.218, l.234, l.255, l.256; TempoRow l.243; StudioWorkspace l.2287, l.2368, l.2388; LoopBrace l.239, l.257; LibraryPreview l.308; Library l.132 |
| **5b-3 (after)** | Lane l.842, l.874, l.886/887, l.922/923, l.723/731 (R35); LibraryPreview l.332 (R35); DetailPanel l.676, l.752, l.861, l.1142; StudioWorkspace l.2197, l.2210, l.2562, l.2568, l.2605; GridMenu l.204, l.226, l.246; ExportDialog l.524, l.562, l.569; Library l.492 |
| **Out of scope** | `app/components/studio/*` (SRW-21 `deferred_user`) |

## 1. What changes (exact; line numbers at `ff3f710`)
| ID | File : line | From → To |
|---|---|---|
| T1 | `app/components/arrangement/ArrangementTransport.tsx` l.218 (Delete with a range) | `range && 'border-accent text-accent'` → `range && 'border-foreground'` |
| T2 | same file l.234 (Loop on) | `'border-accent bg-accent/20 text-accent enabled:hover:bg-accent/20 enabled:active:bg-accent/20'` → `'border-foreground bg-foreground/20 enabled:hover:bg-foreground/20 enabled:active:bg-foreground/20'` |
| T3 | same file l.255 (Follow on) | `navigation.followMode === 'on' && 'text-brand'` → `navigation.followMode === 'on' && 'border-foreground bg-foreground/20 enabled:hover:bg-foreground/20 enabled:active:bg-foreground/20'` (the T2 string) |
| T4 | same file l.256 (Follow paused) | `'border-accent text-accent'` → `'border-dashed border-foreground'` |
| R1 | `app/components/arrangement/ArrangementTempoRow.tsx` l.243 (Metronome on) | `'border-accent bg-accent/20 text-accent hover:text-accent enabled:hover:bg-accent/20 enabled:active:bg-accent/20'` → `'border-foreground bg-foreground/20 text-foreground enabled:hover:bg-foreground/20 enabled:active:bg-foreground/20'` |
| W1 | `app/components/arrangement/StudioWorkspace.tsx` l.2287 (Snap on) | as R1 (same from-string, same to-string) |
| W2 | same file l.2368 (Env on) | as R1 |
| W3 | same file l.2388 (Waveform Zoom, non-default) | `'border-accent bg-accent/20 text-accent'` → `'border-foreground bg-foreground/20'` |
| B1 | `app/components/arrangement/ArrangementLoopBrace.tsx` l.239 (enabled brace) | `'border-accent bg-accent/20'` → `'border-foreground bg-foreground/20'` |
| B2 | same file l.257 (brace label) | `loop.enabled ? 'text-accent' : 'text-muted'` → `loop.enabled ? 'text-foreground' : 'text-muted'` |
| P1 | `app/components/arrangement/ArrangementLibraryPreview.tsx` l.308 (Preview / Stop toggle) | `isPreviewing ? 'border-accent text-accent' : 'text-brand'` → `isPreviewing ? 'border-foreground text-foreground' : 'text-foreground'` |
| Y1 | `app/components/arrangement/ArrangementLibrary.tsx` l.132 (option "previewing" label) | `text-xs text-brand"` → `text-xs text-foreground"` (only this token) |
| L1 | `app/lib/arrangement/__tests__/transport-surface-ui.test.tsx` | TS5 (l.347–369): rename to `'TS5 keeps the Loop-on neutral fill on hover and press, and the Delete range cue'`; l.357–359 → `'bg-foreground/20'`, `'enabled:hover:bg-foreground/20'`, `'enabled:active:bg-foreground/20'`, and add `'border-foreground'`; l.367 → `toContain('border-foreground')`; l.368 → `not.toContain('text-accent')` and add `not.toContain('border-transparent')`. ON_FILL l.507–513 → `'border-foreground'`, `'bg-foreground/20'`, `'text-foreground'`, `'enabled:hover:bg-foreground/20'`, `'enabled:active:bg-foreground/20'`. l.532 → `[...ON_FILL, 'hover:text-foreground']`; l.533 → `[...DROPPED, 'hover:text-accent', 'text-muted']`. Nothing else (l.301 stays). |
| L2 | `app/lib/arrangement/__tests__/metronome-ui.test.tsx` l.535–552 | present → `'border-foreground'`, `'bg-foreground/20'`, `'text-foreground'`, `'enabled:hover:bg-foreground/20'`, `'enabled:active:bg-foreground/20'`, `'hover:text-foreground'`; absent → `'bg-foreground/5'`, `'border-transparent'`, `'enabled:hover:bg-foreground/8'`, `'enabled:active:bg-foreground/12'`, `'hover:text-accent'`, `'text-muted'`. Nothing else. |
| L3 | `app/lib/arrangement/__tests__/waveform-zoom.test.tsx` l.480 and l.486 | `'border-accent'` → `'border-foreground'` in both (l.480 true, l.486 false). Nothing else. |
| L4 | `app/lib/arrangement/__tests__/clip-envelope-ui.test.tsx` l.357 | `expect(toggle().className).toContain('text-accent')` → a token-split check: the tokens (`className.split(/\s+/)`) contain `'text-foreground'` and `'border-foreground'`, and no token contains `accent`. (A plain `toContain('text-foreground')` would pass on `hover:text-foreground`; that is not allowed.) |
| L5 | `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` TH6 l.240–245 | name → `'TH6: the enabled Loop brace uses the neutral bg-foreground/20 fill'`; l.243 → `countOccurrences(source, "'border-foreground bg-foreground/20'")` = 1, and add `countOccurrences(source, "'border-accent bg-accent/20'")` = 0. l.244 stays. |
| L6 | `app/lib/arrangement/__tests__/library-row-strings-ui.test.tsx` l.534 and l.550–551 | l.534 `'text-brand'` → `'text-foreground'`; l.550–551 → `'border-foreground'`, `'text-foreground'`. **l.572 (the Add button, R35, 5b-3) must not change.** Nothing else. |
| G1 | `app/lib/arrangement/__tests__/affordance-colour-ui.test.tsx` (gate-176 S1) | Add `const EXPORT_DIALOG_PATH = \`${ARRANGEMENT_DIR}/ArrangementExportDialog.tsx\`;`. Add `KEPT_BRASS_COUNTS: ReadonlyArray<[string, string, number]> = [[EXPORT_DIALOG_PATH, 'accent-brand', 6]]` and `LATER_STAGE_BRASS_SITES: ReadonlyArray<[string, string, number]> = [[LANE_PATH, "'border-accent bg-accent/20 text-accent'", 2]]` with one `// TODO:` line saying the Lane ghost entry moves in DUX-R-5b-3. In DXA7, after the `KEPT_BRASS_SITES` loop, check each entry of both lists with `countOccurrences(...)` equal to its count, with a labelled message. Everything else stays. |
| N1 | **new** `app/lib/arrangement/__tests__/mode-toggle-colour-ui.test.tsx` | tests DXT1–DXT8 (§3.2) |
| D1 | `docs/implementation/2026/quarter-IV/145-studio-dux-r5b2a-mixer-onstate-colour.md` | (a) l.4 → `**სტატუსი:** Completed (C round 176 PASS, გამოქვეყნდა `ff3f710`)`; (b) l.93 → wrapped in `~~…~~` with the bullet marker outside; (c) l.94 → append ` — Round 177 (doc 146).` Nothing else. |
| D2 | **new** `docs/implementation/2026/quarter-IV/146-studio-dux-r5b2b-mode-toggle-colour.md` | Georgian, with the `docs/implementation/TEMPLATE.md` sections: R34, the §0.1 recipe and table (with the "fill is info only" reason), the Follow decision (§0.4 below), G1 and why, the §0.3 inventory, the C-R176 rulings, tests, mutations and TODOs (5b-3, ROOT-RECON-GRID-HARNESS, the vetoable list). Status: `In Progress (awaiting C round 177)`. |

**Constraints:**
- Only the tokens above change. No `style=`, no arbitrary value, no hex, no new CSS, no `app/styles/` edit.
- No `data-*`, aria, handler, layout, size or position change. `border-dashed` changes only the border style of the 1 px border that already exists (no width change).
- **StudioWorkspace.tsx:** the diff is exactly 3 changed lines (l.2287, l.2368, l.2388). Every other byte is identical.
- The off-state branches (`toolButtonClass` alone; Metronome/Snap/Env `text-muted` base; the brace `'border-dashed border-muted bg-transparent'` and `'text-muted'`; Waveform Zoom at 100 %) do not change.
- The §0.2 kept sites and the 5b-3 sites do not change.

## 0.4 Follow (B's decision, vetoable)
- `followMode` starts as `'on'` (`StudioWorkspace.tsx` l.483). So Follow shows the bordered, filled on-state at first paint. Today it shows brass text, so its prominence is about the same; only the colour cue changes.
- The three states: **on** = solid `foreground` border + `fg/20` fill, `aria-pressed="true"`; **paused** = dashed `foreground` border on the base fill, label `Follow ‖`, `aria-pressed="false"`; **off** = the plain tool button.
- C screenshots the load state and the three states for Saba.

## 2. A — files you own (everything else is frozen)
- **The 14 grants** (`b-round-176-r177-grants.txt`): `ArrangementTransport.tsx`, `ArrangementTempoRow.tsx`, `StudioWorkspace.tsx` (**only l.2287, l.2368, l.2388**), `ArrangementLoopBrace.tsx`, `ArrangementLibraryPreview.tsx`, `ArrangementLibrary.tsx`, `transport-surface-ui.test.tsx`, `metronome-ui.test.tsx`, `waveform-zoom.test.tsx`, `clip-envelope-ui.test.tsx`, `studio-theme-obsidian.test.tsx`, `library-row-strings-ui.test.tsx`, `affordance-colour-ui.test.tsx`, doc 145.
- **The 2 new files:** `mode-toggle-colour-ui.test.tsx` and doc 146.
- **Protected; these must stay byte-identical:**
  - `ArrangementLane.tsx`, `ArrangementGroupHeader.tsx`, `ArrangementMaster.tsx`, `ArrangementDetailPanel.tsx`, `ArrangementClip.tsx`, `ArrangementClipEnvelope.tsx`, `ArrangementExportDialog.tsx`, `ArrangementOverview.tsx`, `ArrangementMarkerRow.tsx`, `ArrangementGridMenu.tsx`, `ArrangementRuler.tsx`, `studio-scrollbar.ts`, `mixer-onstate-colour-ui.test.tsx`, `content-colour-ui.test.tsx`, `panel-radius-ui.test.tsx`, `lane-strings-ui.test.tsx`, `track-group-mix-ui.test.tsx`, `master-ui.test.tsx`, `grid-triplet-ui.test.tsx`;
  - `app/styles/`, `Modal.tsx`, `strings.ts`, `view.ts`, `root.tsx`;
  - all routes (including `studio.$productId.tsx` and `studio-lab.tsx`), `app/components/studio/*`, the contexts, `app/lib/auth.ts`, `firebase.client.ts`, the purchase/download/studio-token files, and `.claude/**`.
- **Process rules (kept from earlier rounds):**
  - Make every lasting edit with Edit/Write so the primitives hook runs. Use shell writes only for temporary mutations, and restore and sha-check each one.
  - Before writing code, read the primitives the hook names (at least `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `FORWARDREF_COMPONENT.md`, `AGENT_DISCOVERABLE_CODE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`) and `.claude/prompts/new-test.md`.
  - Write `a-round-177/end-sha256.txt` (16 paths) and `a-round-177/diff-vs-start.patch` (against `b-round-176/r177-granted-start/`, with the new files as new).
  - Do not run tools from `tmp/studio-real-loop/`; keep helper scripts under `a-round-177/tools/` and run them with cwd = store. No commit, no push.

## 3. A — tests and commands (speed rules)
### 3.1 Commands
- **Before the edits:** run the 13 base files. Expect **134/134**.
- **After the edits:** run the 13 base files plus `mode-toggle-colour-ui.test.tsx`; write the list to `a-round-177/vitest-files.txt`. Everything must be green; report the count.
- **Checks:** `npm run typecheck`, `npm run lint`, and a read-only `npx biome check` on the changed code and test files.
- **Not A's:** the full suite, `npm run verify`, the build, e2e and browser rows. These belong to the gate and to C.
- **Code review:** ask the `code-reviewer` subagent (3+ changed files) and pass its Architecture note to B verbatim.

### 3.2 New tests (`mode-toggle-colour-ui.test.tsx`; B grepped the repo and IDs DXT1–DXT8 are unused)
**Setup:** mount the real workspace (provider + `StudioWorkspace`) as `mixer-onstate-colour-ui.test.tsx` and `transport-surface-ui.test.tsx` do. Toggle states through the real controls (click, or `change` on the select), except where noted. Assert on class tokens (split on whitespace), not on full className strings. A missing element must throw a labelled error (no vacuous pass). **"No brass"** means: no token that contains `brand` or `accent`, except `focus-visible:ring-brand`. **"ON"** means the tokens `border-foreground`, `bg-foreground/20`, `enabled:hover:bg-foreground/20`, `enabled:active:bg-foreground/20`; **"DROPPED"** means `border-transparent`, `bg-foreground/5`, `enabled:hover:bg-foreground/8`, `enabled:active:bg-foreground/12`.

- **DXT1 (Loop):** set a time range (`setTimeRange`, as TS5 does), then click Loop. `aria-pressed="true"`; tokens contain ON and `text-foreground`; none of DROPPED; no brass. A second click: `aria-pressed="false"`, tokens contain `border-transparent` and `bg-foreground/5` again.
- **DXT2 (Delete with a range):** with no range and a selected clip, the Delete button has `border-transparent`. With a range it has `border-foreground`, not `border-transparent`, no `text-accent` and no brass.
- **DXT3 (Follow):** at mount `data-follow-mode="on"`, `aria-pressed="true"`, ON tokens, no brass, no `border-dashed`. Click: `off`, `aria-pressed="false"`, `border-transparent` and `bg-foreground/5`, none of ON. Reach **paused** as `navigation-strings-ui.test.tsx` l.300–330 does: `data-follow-mode="paused"`, tokens contain `border-dashed` and `border-foreground` and `bg-foreground/5`, not `bg-foreground/20`, no brass, label `Follow ‖`.
- **DXT4 (Snap, Env, Metronome):** for `arrangement-snap-toggle`, `arrangement-envelope-toggle` and (after committing a tempo, as `metronome-ui.test.tsx` does) `arrangement-metronome-toggle`: off has `text-muted`; on (`aria-pressed="true"`) has ON, `text-foreground`, `hover:text-foreground`, none of DROPPED, no `text-muted`, no `hover:text-accent`, no brass.
- **DXT5 (Waveform Zoom):** at 100 % the select has `border-outline` and `bg-surface`. After choosing 200 %: `border-foreground`, `bg-foreground/20`, `text-foreground`, no `border-outline`, no `bg-surface`, no brass. Back to 100 %: `border-outline` and `bg-surface` again.
- **DXT6 (Loop brace):** with an enabled loop, `arrangement-loop-brace` has `border-foreground` and `bg-foreground/20`, `data-loop-enabled="true"`, no brass; its label span has `text-foreground`. Disable the loop (click Loop): the brace has `border-dashed`, `border-muted`, `bg-transparent`, and the label `text-muted`.
- **DXT7 (Library preview):** the Preview toggle idle has `text-foreground` and `border-transparent`, no `text-brand`. While previewing (`Stop`): `border-foreground` and `text-foreground`, no brass. The option's `arrangement-library-option-previewing` label has `text-foreground` and no brass (check the label span only; its row may be the selected K7 row).
- **DXT8 (source locks, read-only reads):**
  - Gone: `"'border-accent bg-accent/20 text-accent"` 0 in Transport, TempoRow and StudioWorkspace; `"'border-accent bg-accent/20'"` 0 in LoopBrace; `"'border-accent text-accent'"` 0 in Transport and LibraryPreview; `"&& 'text-brand'"` 0 in Transport; `": 'text-brand'"` 0 in LibraryPreview; `'text-xs text-brand"'` 0 in Library; `"? 'text-accent'"` 0 in LoopBrace.
  - New, exact counts: `"'border-foreground bg-foreground/20 text-foreground enabled:hover:bg-foreground/20 enabled:active:bg-foreground/20'"` StudioWorkspace **2**, TempoRow **1**; `"'border-foreground bg-foreground/20 enabled:hover:bg-foreground/20 enabled:active:bg-foreground/20'"` Transport **2**; `"'border-foreground bg-foreground/20'"` StudioWorkspace **1**, LoopBrace **1**; `"'border-dashed border-foreground'"` Transport **1**; `"range && 'border-foreground'"` Transport **1**; `"'border-foreground text-foreground' : 'text-foreground'"` LibraryPreview **1**; `'text-xs text-foreground"'` Library **1**; `"? 'text-foreground' : 'text-muted'"` LoopBrace **1**.
  - Kept, exactly once each (plain substrings, no surrounding quotes unless shown; B checked each count = 1 at `ff3f710`): Transport `border-brand font-medium text-brand`; StudioWorkspace `border border-brand bg-brand/10` and `rounded-sm border border-accent px-2 py-0.5 text-xs text-accent`; LibraryPreview `fill-brand`; Library `'border-brand bg-brand/10 text-brand'` (with the single quotes).

### 3.3 Mutations
Each mutation is a temporary shell edit, restored and sha-checked afterwards. Write one JSON per mutation in `a-round-177/mutations/`.

| ID | Mutation | Must turn red |
|---|---|---|
| m266 | T2: Loop on back to the accent string | DXT1, DXT8, TS5 |
| m267 | T3: Follow on back to `'text-brand'` | DXT3, DXT8 |
| m268 | T4: Follow paused → `'border-foreground'` (solid) | DXT3, DXT8 |
| m269 | R1: Metronome on back to the accent string | DXT4, DXT8, metronome-ui (L2) |
| m270 | W1: Snap on back to the accent string | DXT4, DXT8, transport-surface-ui (L1) |
| m271 | W2: Env on back to the accent string | DXT4, DXT8, transport-surface-ui (L1), clip-envelope-ui EU1 (L4) |
| m272 | W3: Zoom back to `'border-accent bg-accent/20 text-accent'` | DXT5, DXT8, waveform-zoom (L3) |
| m273 | B1: brace back to `'border-accent bg-accent/20'` | DXT6, DXT8, TH6 (L5) |
| m274 | P1: previewing back to `'border-accent text-accent'` | DXT7, DXT8, library-row-strings-ui (L6) |
| m275 | Y1: previewing label back to `text-brand` | DXT7, DXT8 |
| m276 | G1: one ExportDialog `accent-brand` → `accent-foreground` (temporary edit of a protected file, restored and sha-checked) | DXA7 |
| m277 | G1: one Lane ghost `'border-accent bg-accent/20 text-accent'` → `'border-foreground bg-foreground/20 text-foreground'` (temporary, restored) | DXA7 |

If a mutation stays green, report it and do not weaken the expectation. B rules on it.

## 4. C — rows
Run every row at both viewports (1440×900 and 1280×720), in real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, with a fresh context per session.

**Setup:** S1 as round 176: load `media/beeps-6s-h264-aac.mp4`, add `demo-middle-east` to Music at 1 s, add one SFX clip. Set a time range by dragging in a lane, then press Loop for the loop rows. Type a tempo (e.g. 120) for the Metronome row.

| Row | What | Pass |
|---|---|---|
| **T177-TARGETED** | Re-run `a-round-177/vitest-files.txt`. | All green, the same count as A. |
| **SOURCE-SCOPE** | The frozen list at start and end; A's `end-sha256.txt`; `git status`; the protected diff against `ff3f710`. | All OK. `git status` shows at most 14 ` M` + 2 `??`. The protected diff is empty. **`git diff ff3f710 -- app/components/arrangement/StudioWorkspace.tsx` changes exactly 3 lines (l.2287, l.2368, l.2388).** The tree hash at C's start equals the hash at C's end. |
| **AN-REVIEW** | C reads the diff. | Only T1–T4, R1, W1–W3, B1–B2, P1, Y1, L1–L6, G1, N1 and D1–D2 as written in §1; no other token, attribute or line. The §0.2 kept sites and the 5b-3 sites are untouched. |
| **INVENTORY-GREP** | Per class token, every non-test `*.ts*` file in `app/components/arrangement/` plus `app/routes/studio-lab.tsx`, for tokens that contain `brand` or `accent` (excluding `focus-visible:ring-brand` and non-class code such as metronome `accent` fields), mapped to the §0.3 table. | **0 unclassified hits.** The 5b-2b lines no longer match. Any unlisted site is a finding for B (not A's FAIL). |
| **CC-TOGGLE** | Computed values in the real page, off and on, and on while the real mouse hovers and presses: Loop, Delete with a range, Follow (on / paused / off), Metronome, Snap, Env, Waveform Zoom 200 %, the enabled and disabled brace and its label, the Preview toggle (idle / previewing), the option's previewing label. | On: border rgb(236,230,218); background = foreground at 20 % (`oklab(… / 0.2)` or the equivalent rgba); text rgb(236,230,218). **Hover and press equal rest** on the filled on-states (Loop, Follow on, Metronome, Snap, Env, Waveform Zoom; R2). The border-only states (Delete with a range, Follow paused, Preview while previewing) step the base fill `fg/5` → `fg/8` → `fg/12` by design; for them the border colour, `border-style` and text equal rest (§0.1 R2 scope). Follow paused: `border-style: dashed`, border rgb(236,230,218), no 20 % fill. Off states unchanged against round 176 (C's own off reads or `c-round-176/out`). |
| **NO-BRASS-TOGGLE** | A pixel scan with `R − B ≥ 45` at DPR 2 of each on-state box (inset 1 px), at rest, hovered and pressed, and the enabled brace with its label. **Run with `--disable-lcd-text`** (C-R176-NOBRASS-LCD-GLYPH), blur everything first, and park the playhead outside the boxes (Home). Keep the selected lane name / selected Library row (K7) and Export (K9) out of the boxes. | **0** brass pixels per region at both viewports. Report the count per region. |
| **CONTRAST-TOGGLE** (D6 thresholds) | For each on control: the border vs its real backdrop; the text vs the on fill; the brace label vs the brace fill; the enabled loop-edge hover vs the brace fill (this re-checks C-R175-ENABLED-LOOP-EDGE). | Each **≥ 3:1** (§0.1 predicts borders 13.94–15.62, text 7.92–9.40, edge 3.43 on the `bg-surface` strip). The fill vs backdrop and the on fill vs the off fill are **recorded as info, not criteria** (§0.1). |
| **STATE-DISTINCT-TOGGLE** | Screenshots side by side: each toggle off vs on; Follow on / paused / off; the brace enabled vs disabled; Preview idle vs previewing; the load state (Follow on at first paint). | On and off are distinguishable by the border in each pair (on border ≥ 3:1 vs backdrop, off border transparent or `outline`). Crops for Saba (vetoable). |
| **LOOP-EDGE** | Hover the enabled loop start and end edge with the real mouse and scan them as in round 175 (`C-R175-ENABLED-LOOP-EDGE`, 10/280 brass px then). | **0** brass pixels; edge vs brace ≥ 3:1. |
| **FUNC-SMOKE-TOGGLE** | With a real mouse: Loop on during playback (the playhead wraps at the loop end); Delete with a range removes the range content and Undo restores it; Follow on scrolls with the playhead, a manual scroll pauses it, Follow resumes; Metronome on during playback (the real output tap shows the clicks); Snap on changes a clip drag to the grid; Env on and a double-click adds a point; Waveform Zoom 200 % changes the drawn waveform only; Preview plays audio (the output tap) and Stop ends it; the brace drag moves the loop. | Everything works as before. No console pageerror. |
| **ENV-VIS** | Re-run C's round-176 `c176-env.cjs` (change only the output names), 6 states at both viewports. | Every cell ≥ 3:1. Report any drop > 0.1 against `c-round-176/out/env/env-{1440,1280}-1.json` as a finding. |
| **RV1-DUX5B2B** | `d6.cjs` S0/S1/S2 against `c-round-176/out/d6/d6-1440-r1.json` and `d6-1280-r1.json`. | 0 missing, 0 added, max box delta 0 (≤ 1 px allowed). The contrast failing set is identical or smaller (Metronome may leave it). |
| **RV3-STORE** | Grep for hex colours in `app/components/arrangement/`; screenshot `/` and `/cart` against round 176's shots. | 0 hex. Both pages unchanged (the hero video frame excepted). |
| **G177-3** | Anonymous `/studio-lab`; `/studio/middle-east`; `GET /api/studio-token?product=middle-east&file=stem1.wav`. | `/studio-lab` opens with the demo badge. `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`. The token request returns 401. Fake-Bearer 403 → BLOCKED (backend unavailable in cloud). |
| **PX-NET / REG-HYD** | Every session. | 0 forbidden hosts, 0 Authorization headers, 0 hydration messages and 0 pageerror. Only the expected cart noise. |

**Harness notes:**
- At 1280×720 the Clip details panel is collapsed by default (C-R172-DETAIL-COLLAPSED-720).
- If the first cold load crashes, discard that run and replace it once (ENV-FIRST-LOAD). Run the ENV-VIS sessions one at a time.
- Escape does not deselect; Ctrl+click the selected clip to deselect.
- Every run writes a uniquely named output file.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Colour of the on-state of Loop / Follow / Metronome / Snap-like toggles | **Not captured this round.** No Live 12 manual section or video was checked for toggle colours. | — (unverified; B does **not** claim Live looks like this) | A CZABA brand rule (DUX-R-5, Saba 2026-10-25): on-states are not brass; the border carries the state. | Parity: **not applicable / unverified**. The CZABA requirement is checked by CC-TOGGLE and NO-BRASS-TOGGLE. |
| What Loop, Follow, Metronome, Snap, Env, Waveform Zoom and Preview do | Previously verified behaviour (their own SRW rounds; not changed now) | — | Behaviour unchanged | FUNC-SMOKE-TOGGLE |

## 6. Evidence and reporting
- **A:** `a-round-177.md` and `a-round-177/` (vitest JSONs, mutations, end hashes, diff, `vitest-files.txt`).
- **C:** `c-round-177.md`, `c-round-177.json` (`browserVerified`, `realVerified`, `passed`/`failed`/`blocked`/`gate`) and `c-round-177/` (out, shots, tools).
- **Both:** write the report files as you go, not only at the end.

## 7. Outcome, fixed in advance (B at round 178 planning)
| Condition | Round 178 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** comes first: every done / c_pass item at both viewports, `npm run test:e2e:smoke`, and the evidence gap C-R167-METRONOME-UNDER-MUTE. The rows below come after it. |
| C FAIL at Critical, High or Medium (a criterion contrast < 3:1 in CONTRAST-TOGGLE / LOOP-EDGE / ENV-VIS, NO-BRASS-TOGGLE > 0, an on state not distinguishable from off, or a broken toggle) | A bounded fix-up by the same owner within §1, or a question for Saba. It is not deferred silently. |
| INVENTORY-GREP finds an unclassified site | B classifies it at round 178 planning. It is not A's FAIL. |
| C FAIL on Lows only | A fix-up if the Low is in this round's own lines and cheap; otherwise `deferred_low_polish`, and 5b-3 goes ahead. |
| C PASS | Root publishes round 177. DUX-R-5b-2b → **მზადაა**, GATE176-S1 → closed. Round 178 = **DUX-R-5b-3** (labels, ghosts, drop hints, the demo badge, status texts, GridMenu checks, the Export dialog notes / progress / overload, the detail group count, the Library filter, R35 import/Add, the `hover:text-brand` sites), split by B if it is too large. If root's checkpoint answer says "extract first", the extraction runs as one bounded round before 5b-3. |

At every planning, B checks `user-review/ableton-decisions.md`, `user-review/design-ux-decisions.md`, `docs/technical/store-redesign/direction-decision.md`, and whether the checkpoint answer has arrived.

## 8. Root notes
- **Gate:** on C PASS, publish round 177: the changed granted paths plus the 2 new files, against `ff3f710`. These must be unchanged: every protected file in §2, `app/styles/`, `app/components/studio/*` and the purchase/auth files. `StudioWorkspace.tsx` changes only on l.2287, l.2368 and l.2388.
- **Architecture checkpoint:** still unanswered (`b-round-173-checkpoint-request.md`, fallback (c)); B appended a round-176 addendum (Signal 3 has fired in rounds 174, 175 and 176; gate-176 proposes a shared mix on-state constant and the harness extraction). Non-blocking.
- **Gate-176 review findings, as recorded by B:** S1 → G1 (this round). S2 → signal (needs approval). S3, S4, S5 → info. S6 → D1. S7 (the `AudioPlayer.tsx` lint warning) → pre-existing, outside Studio, info.
- **User-visible decisions** (vetoable in `feature-status.md`): the border-carried toggle-on recipe (fill info only), Follow on bordered at first paint, Follow paused as a dashed border, the neutral Preview / previewing label, and the enabled brace in `foreground`.

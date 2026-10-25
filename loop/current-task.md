# CURRENT TASK — Round 176: DUX-R-5b-2a — one colour rule, part 2 stage 2a: mixer on-states go neutral and distinct (track / group / Master Mute, track / group Solo on, group Solo mixed) + C finding A-R175-DETAIL-SEP-ACCENT (Clip-details separator hover); nothing moves

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-25 · Decision: **D-29z141** (`backlog.json` → VISUAL-A-OBSIDIAN `dux_r5b2_plan_d29z141`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-175.md`, an exact copy of the round-175 `current-task.md` (sha256 `c3e47d47…`, checked with `cmp`). The rationale for this round is in `b-round-175.md`.
- **User authority:** `user-review/design-ux-decisions.md` (2026-10-25): "**DUX-R-5: approve.** One colour rule … The accent (brass in Obsidian) is reserved for selection, the playhead, the primary button and focus … Keep the contrast thresholds from D6."
- **Ruling R34 (round 175, vetoable):** mode toggles, on-states, affordances, labels and warnings are not selection, so they go neutral.

## Baseline = HEAD `c53eefc`, clean tree (gate 175 published)
- **Gate:** `gates/gate-round-175.json` has status `published` and commit `c53eefccd43942134d2ae0692c97e655e38880dc` on both remotes.
- **Tree:** `git status --short` is empty, and `git ls-files -co --exclude-standard` lists **997** files.
- **Frozen list:** `b-round-175-r176-tree-sha256.txt`, **988 entries** (997 minus the 9 grants).
- **Grants:** `b-round-175-r176-grants.txt` (9 existing files). **New files:** `b-round-175-r176-new-files.txt` (2 files).
- **Start hashes:** `b-round-175-r176-granted-start-sha256.txt`. **Start copies:** `b-round-175/r176-granted-start/`.
- **Vitest base:** `b-round-175-r176-vitest-base.txt` (13 files) is **184/184** at `c53eefc` (`b-round-175/out/vitest-base.json`).
- **Line numbers** below were grepped by B at `c53eefc`.
- **A's first step:** check that HEAD = `c53eefc`, the tree is clean, `sha256sum -c --quiet b-round-175-r176-tree-sha256.txt` is OK, the 9 start hashes match, and neither new file exists. If anything differs, stop and report.

## 0. Why this round (D-29z141)
- **Round 175: C PASS**, `browserVerified` and `realVerified` true, 0 Critical/High/Medium. Root published `c53eefc` (review 8.5/10, nothing blocking). **DUX-R-5b-1 → მზადაა.** CONTRAST-DUX5B1 thumb vs unfilled track = 9.01, so the `accent-muted` pre-rule is not triggered.
- **C bug first:** **A-R175-DETAIL-SEP-ACCENT** (Low per C; A's reviewer said Medium). The Clip-details height separator still hovers brass rgb(129,106,71), 22860/22860 px at 1440. It is the same affordance as the track-height handle. It is fixed in this round (§1 B1), not deferred. DUX-R-5 cannot be მზადაა with it.
- **Then the next stage, fixed in advance** in `tasks/round-175.md` §7 ("C PASS → DUX-R-5b-2"). Regression: `regression-last.json` = 2026-10-24, so it is due on or after 2026-10-27. Today is 2026-10-25: not due. Checkpoint: no answer to `b-round-173-checkpoint-request.md`; fallback (c) continues.
- **5b-2 is split in two; the scope is not reduced.** The full 5b-2 is ~10 components (including the protected `StudioWorkspace.tsx`) and ~9 test files with token locks, about 23 files. It also needs two different recipes (§0.1). So:
  - **5b-2a (this round):** the mixer on-states, in Lane, GroupHeader and Master, plus the separator fix-up. 4 components, 4 test files, 2 docs, 1 new test.
  - **5b-2b (next):** mode toggles: Transport Loop / Delete-with-range / Follow, TempoRow Metronome, StudioWorkspace Snap / Env / Waveform Zoom (narrow grant), LoopBrace enabled, LibraryPreview toggle, Library previewing label. The recipe is fixed now in §0.4, so 5b-2b only applies it.
  - **5b-3 (after):** labels, ghosts and the Export dialog, plus the newly classified sites in §0.3.
  - **DUX-R-5 is not მზადაა until 5b-3 passes C.**
- **Gate-175 Architecture note (b), "a semantic token before 5b-2": decided no (D-29z141).** Three reasons. `app/styles/` is out of every grant in this stage. The checkpoint is unanswered, so fallback (c) holds. And 5b-2 needs two different recipes, a filled mixer recipe and a bordered toggle recipe, so one token would not cover them. The note stays a signal under `GATE167-TOKEN-TEST-FRAGILITY` / checkpoint Q1. This round's tests assert tokens on rendered elements, as before.

## 0.1 B's colour computation (sRGB WCAG, Obsidian tokens `app/styles/app.css` l.3920-3942)
Backdrops: the lane header is `bg-surface` #161412; the group header is `bg-elevated` #1d1a17; Master sits on `bg-surface`.

| Site | Today | New (on-state) | Contrast (computed) |
|---|---|---|---|
| **Mute on** (Lane l.615, GroupHeader l.288, Master l.173) | `border-accent bg-accent text-background` (brass, 7.88 vs surface) | **`border-muted bg-muted text-background enabled:hover:bg-muted enabled:active:bg-muted`**, a filled mid-grey | fill vs surface **6.68**, vs elevated **6.30**, vs the off fill 6.03; letter vs fill **7.06** |
| **Solo on** (Lane l.633, GroupHeader l.304) | `border-brand bg-brand text-brand-foreground` (brass) | **`border-foreground bg-foreground text-background enabled:hover:bg-foreground enabled:active:bg-foreground`**, a filled light | fill vs surface **14.78**, vs elevated **13.94**; letter vs fill **15.62** |
| **Group Solo mixed** (GroupHeader l.306) | `border-brand bg-gradient-to-r from-brand from-50% to-transparent to-50% text-foreground` (fg letter on brass 1.88) | **`border-foreground bg-gradient-to-r from-foreground/40 from-50% to-transparent to-50% text-foreground`** | The half paints over the base `bg-foreground/5` (hover `/8`, press `/12`), so the composite is ≈ rgb(118,114,107) at rest. Half vs the group header **3.62** (hover 3.80, press 4.07; B's floor 3.3). The letter on the half is **3.85** (press 3.42), against 1.88 today; the other half of the glyph is on the base at ≈ 13:1. The border vs elevated is 13.94. |
| **Detail separator hover** (DetailPanel l.1121) | `hover:bg-accent/60` (brass, 3.58) | **`hover:bg-foreground/50`** (as the track-height handle, round 175 A5) | fg/50 over background 4.53, surface 4.49, elevated 4.40 |

- **Mute vs Solo (B-R174-ACCENT-EQ-BRAND, part 1): a conscious, vetoable choice.** Both are filled. They differ in lightness by **2.21:1** (grey vs light). That is below 3:1, so the **M/S letter stays the identifying cue**, as it is today (today they are identical brass, 1:1). The on vs off cue is a fill at ≥ 6:1. A grey Mute also reads like Live's unlit track (an inference, not verified; §5).
- **Hover rule R2 kept:** Q-R167-ON-HOVER is still `awaiting_user`, so the on-state hover and press keep the same fill (`enabled:hover:bg-X` = `bg-X`), with no step.
- **R29 (tailwind-merge):** each new on-state string has exactly one token per property and replaces the base token through `cn()`, exactly as today. No second same-property token is added.
- **Brass test (C):** `R − B ≥ 45`. `muted` #a39b8e has R − B = 21 and `foreground` has 18, so both are neutral. No `warning`/`destructive` token is used.

## 0.2 Kept brass (unchanged, K1–K12 from rounds 174–175)
- **Inside this round's files:**
  - Lane: active track `border-l-brand` l.665, `bg-brand/5` l.840, "Active" badge l.712, selected name `bg-brand/20` l.698.
  - GroupHeader: `border-l-brand` l.195, selected name `bg-brand/20` l.270, rename field `border-brand` l.252 (K10), selected collapsed block `border-brand bg-brand/60` l.355 (K7).
  - DetailPanel: detail playhead `bg-accent` l.180 (K8).
  - Every `focus-visible:ring-brand` (K4).
- They must not change.

## 0.3 Full inventory at `c53eefc`: every remaining non-focus `brand|accent` site in `app/components/arrangement/` (non-test)
B rebuilt the table from a token-level scan of every `*.ts*` file in `app/components/arrangement/` and `app/routes/studio-lab.tsx`, because round 175 missed the separator. (B's first line-level grep also hid sites on lines that end in `focus-visible:ring-brand`, so the scan is per token.) `studio-lab.tsx` has no hit. **New this round (vetoable): R35.** The outlined "add" actions (video import, Library Add) are **not** the primary action. K9 is only Export. So they go neutral in 5b-3.

| Stage | Sites (file : line at `c53eefc`) |
|---|---|
| **K (kept)** | Clip l.826 (K1 selected ring), l.838 (K1 selected header); Lane l.665, l.698, l.712, l.840; GroupHeader l.195, l.252, l.270, l.355; Library l.49, l.100 (K7), l.473 `focus:border-brand`, l.638 `focus-visible:bg-brand` (K10); MarkerRow l.806, l.813 (K7); StudioWorkspace l.450 (K8), l.2504 marquee (K7); Ruler l.221 and l.233 (playhead line and handle), Overview l.334, DetailPanel l.180 (K8); MarkerRow l.847 marker name field `border-brand` (K10, an open editor); Transport l.339 and ExportDialog l.615 Export (K9); ExportDialog l.289/300/322/333/345/356/395/405/420/435 chosen card / radio (K7); LibraryPreview l.270 `fill-brand` (K11); ClipEnvelope (K6/K12, no brand token) |
| **5b-2a (this round)** | Lane l.615, l.633; GroupHeader l.288, l.304, l.306; Master l.173; DetailPanel l.1121 (C finding) |
| **5b-2b (next)** | Transport l.218, l.234, l.255, l.256; TempoRow l.243; StudioWorkspace l.2287, l.2368, l.2388; LoopBrace l.239, l.257; LibraryPreview l.308; Library l.132 |
| **5b-3 (after)** | Lane l.842 (drop ring), l.874 (drop hint), l.886/887 and l.922/923 (ghosts), **l.723 and l.731 (video import, R35, new)**; LibraryPreview **l.332 (Add, R35, new)**; DetailPanel l.676 (group count), **l.752, l.861 and l.1142 (`hover:text-brand` on Apply / 0 dB / the panel toggle, new)**; StudioWorkspace **l.2197 (`← CZABA` exit link `hover:text-brand`, new; locked by `panel-radius-ui.test.tsx` l.99–100 `WORKSPACE_EXIT_CLASS`)**, l.2210, l.2562, l.2568, l.2605; GridMenu l.204, l.226, l.246; ExportDialog l.524, l.562, l.569; Library l.492 |
| **Out of scope** | `app/components/studio/*` (round-175 ruling; SRW-21 `deferred_user`) |

## 0.4 Recipe fixed now for 5b-2b (recorded, NOT applied this round)
- **Mode toggles on** (Loop, Metronome, Snap, Env, Waveform Zoom non-default, enabled LoopBrace): `border-foreground bg-foreground/20 text-foreground` with the same hover/press fill (R2). **The border carries the state:** 14.78 vs surface. The fill alone is only 1.44 vs a hovered off button, so it is secondary.
- **Follow:** on = the toggle-on recipe; paused = `border-dashed border-foreground text-foreground` (no fill). **Delete with a range:** `border-foreground`. **LibraryPreview:** previewing `border-foreground text-foreground`, idle `text-foreground`. **Library previewing label:** `text-foreground`.
- **Enabled loop edge hover:** `foreground/50` over the new brace fill is 3.43 (surface).
- 5b-2b re-checks these numbers in its own task.

## 1. What changes (exact; line numbers at `c53eefc`)
| ID | File : line | From → To |
|---|---|---|
| M1 | `app/components/arrangement/ArrangementLane.tsx` l.615 | `'border-accent bg-accent text-background enabled:hover:bg-accent enabled:active:bg-accent'` → `'border-muted bg-muted text-background enabled:hover:bg-muted enabled:active:bg-muted'` |
| M2 | same file l.633 | `'border-brand bg-brand text-brand-foreground enabled:hover:bg-brand enabled:active:bg-brand'` → `'border-foreground bg-foreground text-background enabled:hover:bg-foreground enabled:active:bg-foreground'` |
| M3 | `app/components/arrangement/ArrangementGroupHeader.tsx` l.288 | as M1 |
| M4 | same file l.304 | as M2 |
| M5 | same file l.306 | `'border-brand bg-gradient-to-r from-brand from-50% to-transparent to-50% text-foreground'` → `'border-foreground bg-gradient-to-r from-foreground/40 from-50% to-transparent to-50% text-foreground'` |
| M6 | `app/components/arrangement/ArrangementMaster.tsx` l.173 | as M1 |
| B1 | `app/components/arrangement/ArrangementDetailPanel.tsx` l.1121 | `hover:bg-accent/60` → `hover:bg-foreground/50` (only this token) |
| L1 | `app/lib/arrangement/__tests__/lane-strings-ui.test.tsx` l.478–482 and l.494–498 | the expected Mute-on and Solo-on tokens → the M1 and M2 tokens. The `LSU7_ON_DROPPED` checks stay. Nothing else changes. |
| L2 | `app/lib/arrangement/__tests__/track-group-mix-ui.test.tsx` l.540, l.807–811, l.826–830, l.861, l.866–868 | l.540 `'from-brand'` → `'from-foreground/40'`. Mute-on and Solo-on tokens → M3 and M4. l.861 full string → the M5 string. l.866–868: `'border-brand'` → `'border-foreground'` and `'from-brand'` → `'from-foreground/40'`. Nothing else changes. |
| L3 | `app/lib/arrangement/__tests__/transport-surface-ui.test.tsx` l.551–555 (Master Mute on) | → the M6 tokens. Nothing else changes; the Snap/Env `ON_FILL` (l.507–513) and TS5 belong to 5b-2b. |
| L4 | `app/lib/arrangement/__tests__/affordance-colour-ui.test.tsx` | (a) Delete the `DETAIL_SEPARATOR_ACCENT_GAP_R175` constant, its TODO line (l.147–152) and its use in DXA7 (l.475–479), so every retired token is expected **0** in all 9 files. (b) Gate-175 S2: delete the two out-of-scope counts (l.498 `ExportDialog accent-brand = 6`, l.499–501 `Lane 'border-accent bg-accent/20 text-accent' = 2`) and, if unused afterwards, `EXPORT_DIALOG_PATH`. C's AN-REVIEW and SOURCE-SCOPE cover untouched later-stage sites. Everything else in the file stays. |
| T1 | **new** `app/lib/arrangement/__tests__/mixer-onstate-colour-ui.test.tsx` | tests DXM1–DXM6 (§3.2) |
| D1 | `docs/implementation/2026/quarter-IV/144-studio-dux-r5b1-affordance-colour.md` | (a) l.4 → `**სტატუსი:** Completed (C round 175 PASS, გამოქვეყნდა `c53eefc`)`; (b) the TODO lines l.114 (C evidence) and l.116 (`accent-muted` pre-rule, not triggered: 9.01) → wrapped in `~~…~~` with the bullet marker outside; (c) l.115 (A-R175-DETAIL-SEP-ACCENT) → append ` — Round 176 (doc 145).`; (d) l.117 (5b-2) → append ` — 5b-2a Round 176 (doc 145), 5b-2b შემდეგ.` Nothing else. |
| D2 | **new** `docs/implementation/2026/quarter-IV/145-studio-dux-r5b2a-mixer-onstate-colour.md` | Georgian, with the `docs/implementation/TEMPLATE.md` sections: R34, R35, the §0.1 table, the Mute-vs-Solo choice, R2, the §0.3 inventory, the §0.4 recipe, the semantic-token decision, tests, mutations and TODOs (5b-2b, 5b-3, ROOT-RECON-GRID-HARNESS). Status: `In Progress (awaiting C round 176)`. |

**Constraints:**
- Only the tokens above change. No `style=`, no arbitrary value, no hex, no new CSS, no `app/styles/` edit.
- No `data-*`, aria, handler, layout, size or position change. The button sizes (`h-6 w-6`, `h-5 w-5`) and the separator (`h-1.5`) stay.
- The off-state branches (`'text-muted hover:text-foreground'`, `soloState === 'off'`) do not change.
- The 5b-2b and 5b-3 sites in these files (Lane l.723/731/842/874/886/887/922/923; DetailPanel l.676/752/861) and every kept site in §0.2 **must not change**.

## 2. A — files you own (everything else is frozen)
- **The 9 grants** (`b-round-175-r176-grants.txt`): `ArrangementLane.tsx`, `ArrangementGroupHeader.tsx`, `ArrangementMaster.tsx`, `ArrangementDetailPanel.tsx`, `lane-strings-ui.test.tsx`, `track-group-mix-ui.test.tsx`, `transport-surface-ui.test.tsx`, `affordance-colour-ui.test.tsx`, doc 144.
- **The 2 new files:** `mixer-onstate-colour-ui.test.tsx` and doc 145.
- **Protected; these must stay byte-identical:**
  - `StudioWorkspace.tsx`, `ArrangementTransport.tsx`, `ArrangementTempoRow.tsx`, `ArrangementLoopBrace.tsx`, `ArrangementLibrary.tsx`, `ArrangementLibraryPreview.tsx`, `ArrangementClip.tsx`, `ArrangementClipEnvelope.tsx`, `ArrangementExportDialog.tsx`, `ArrangementOverview.tsx`, `ArrangementMarkerRow.tsx`, `ArrangementGridMenu.tsx`, `ArrangementRuler.tsx`, `studio-scrollbar.ts`, `content-colour-ui.test.tsx`, `track-layout.test.tsx`, `metronome-ui.test.tsx`, `studio-theme-obsidian.test.tsx`, `master-ui.test.tsx`;
  - `app/styles/`, `Modal.tsx`, `strings.ts`, `view.ts`, `root.tsx`;
  - all routes (including `studio.$productId.tsx` and `studio-lab.tsx`), `app/components/studio/*`, the contexts, `app/lib/auth.ts`, `firebase.client.ts`, the purchase/download/studio-token files, and `.claude/**`.
- **Process rules (kept from earlier rounds):**
  - Make every lasting edit with Edit/Write so the primitives hook runs. Use shell writes only for temporary mutations, and restore and sha-check each one.
  - Before writing code, read the primitives the hook names (at least `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `FORWARDREF_COMPONENT.md`, `AGENT_DISCOVERABLE_CODE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`) and `.claude/prompts/new-test.md`.
  - Write `a-round-176/end-sha256.txt` (11 paths) and `a-round-176/diff-vs-start.patch` (against `b-round-175/r176-granted-start/`, with the new files as new).
  - Do not run tools from `tmp/studio-real-loop/`; keep helper scripts under `a-round-176/tools/` and run them with cwd = store. No commit, no push.

## 3. A — tests and commands (speed rules)
### 3.1 Commands
- **Before the edits:** run the 13 base files. Expect **184/184**.
- **After the edits:** run the 13 base files plus `mixer-onstate-colour-ui.test.tsx`; write the list to `a-round-176/vitest-files.txt`. Everything must be green; report the count.
- **Checks:** `npm run typecheck`, `npm run lint`, and a read-only `npx biome check` on the changed code and test files.
- **Not A's:** the full suite, `npm run verify`, the build, e2e and browser rows. These belong to the gate and to C.
- **Code review:** ask the `code-reviewer` subagent (3+ changed files) and pass its Architecture note to B verbatim.

### 3.2 New tests (`mixer-onstate-colour-ui.test.tsx`; B grepped the repo and IDs DXM1–DXM6 are unused)
**Setup:** mount the real workspace (provider + `StudioWorkspace`) as `track-group-mix-ui.test.tsx` and `affordance-colour-ui.test.tsx` do. Toggle states through the real buttons (click), not through the API. Assert on class tokens (split on whitespace), not on full className strings. A missing element must throw a labelled error (no vacuous pass). "No brass" below means: no token that contains `brand` or `accent`, except `focus-visible:ring-brand`.

- **DXM1 (track Mute):** the `Mute — …` button of a track. Off: it has `bg-foreground/5`, `border-transparent` and `text-muted`. After a click (`aria-pressed="true"`): it has `border-muted`, `bg-muted`, `text-background`, `enabled:hover:bg-muted` and `enabled:active:bg-muted`, none of the `LSU7_ON_DROPPED` tokens, and no brass. After a second click it is back to off.
- **DXM2 (track Solo):** the same for Solo: on has `border-foreground`, `bg-foreground`, `text-background`, `enabled:hover:bg-foreground` and `enabled:active:bg-foreground`, no `text-brand-foreground` and no brass. **Distinctness:** with both on, the Mute-on and Solo-on token sets differ in `bg-*` (`bg-muted` vs `bg-foreground`).
- **DXM3 (group):** group two tracks (as `groupRows` does). Group Mute on = the DXM1 tokens; group Solo on = the DXM2 tokens. Then nest a track and Group 1 (as `nestMusicAndG1` does) and solo Group 1: the parent's Solo has `aria-pressed="mixed"`, `border-foreground`, `bg-gradient-to-r`, `from-foreground/40`, `from-50%`, `to-transparent`, `to-50%` and `text-foreground`, and no brass.
- **DXM4 (Master):** `Master Mute` on = the DXM1 tokens, and no brass.
- **DXM5 (separator):** `arrangement-detail-separator` has `hover:bg-foreground/50`, no token that contains `accent`, and still `focus-visible:ring-brand`.
- **DXM6 (source locks, read-only reads):**
  - In Lane, GroupHeader and Master: `'border-accent bg-accent text-background` 0, `border-brand bg-brand text-brand-foreground` 0, and `from-brand` 0.
  - The M1 string: Lane 1, GroupHeader 1, Master 1. The M2 string: Lane 1, GroupHeader 1. The M5 string: GroupHeader 1.
  - DetailPanel: `hover:bg-accent/60` 0 and `hover:bg-foreground/50` 1.
  - Kept, exactly once each: GroupHeader `'border-brand bg-brand/60'` and `'border-l-brand'`; Lane `'border-l-brand'` and `'bg-brand/5'`; DetailPanel `w-px bg-accent`.

### 3.3 Mutations
Each mutation is a temporary shell edit, restored and sha-checked afterwards. Write one JSON per mutation in `a-round-176/mutations/`.

| ID | Mutation | Must turn red |
|---|---|---|
| m258 | M1: Lane Mute on back to the accent string | DXM1, DXM6, lane-strings-ui (L1) |
| m259 | M2: Lane Solo on back to the brand string | DXM2, DXM6, lane-strings-ui (L1) |
| m260 | M2 → the M1 string (Solo on looks like Mute on) | DXM2 (distinctness), DXM6 |
| m261 | M3: group Mute on back to accent | DXM3, DXM6, track-group-mix-ui (L2) |
| m262 | M5: `from-foreground/40` → `from-brand` | DXM3, DXM6, track-group-mix-ui (L2) |
| m263 | M6: Master Mute on back to accent | DXM4, DXM6, transport-surface-ui (L3) |
| m264 | B1: separator back to `hover:bg-accent/60` | DXM5, DXM6, DXA7 |
| m265 | K7: GroupHeader `'border-brand bg-brand/60'` → `'border-foreground bg-foreground/60'` | DXM6, DXA6/DXA7 |

If a mutation stays green, report it and do not weaken the expectation. B rules on it.

## 4. C — rows
Run every row at both viewports (1440×900 and 1280×720), in real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, with a fresh context per session.

**Setup:** S1 as round 175: load `media/beeps-6s-h264-aac.mp4`, add `demo-middle-east` to Music at 1 s, add one SFX clip. For the group rows, group two audio tracks with the real UI (click a track name, Shift+click another, Ctrl+G). For the mixed row, Shift+click a track name and the Group 1 name, then Ctrl+G (nesting, as in C round 168), and solo Group 1.

| Row | What | Pass |
|---|---|---|
| **T176-TARGETED** | Re-run `a-round-176/vitest-files.txt`. | All green, the same count as A. |
| **SOURCE-SCOPE** | The frozen list at start and end; A's `end-sha256.txt`; `git status`; the protected diff against `c53eefc`. | All OK. `git status` shows at most 9 ` M` + 2 `??`. The protected diff is empty. The tree hash at C's start equals the hash at C's end. |
| **AN-REVIEW** | C reads the diff. | Only M1–M6, B1, L1–L4 and D1–D2 as written in §1; no other token, attribute or line. The §0.2 kept sites and the 5b-2b/5b-3 sites are untouched. |
| **INVENTORY-GREP** | C scans **per class token** (not per line) every non-test `*.ts*` file in `app/components/arrangement/` plus `app/routes/studio-lab.tsx` for tokens that contain `brand` or `accent` (excluding the `focus-visible:ring-brand` token itself and non-class code such as metronome `accent` fields), and maps each hit to the §0.3 table. | **0 unclassified hits.** After this round the 5b-2a lines no longer match. Any unlisted site is a finding for B (not A's FAIL). |
| **CC-ONSTATE** | Computed values in the real page, on, off and while the real mouse hovers and presses the on button: track Mute and Solo, group Mute and Solo, the group Solo mixed, Master Mute. | Matches §1: Mute on bg = border = rgb(163,155,142), text rgb(14,13,12). Solo on bg = border = rgb(236,230,218), text rgb(14,13,12). Mixed: border rgb(236,230,218), `background-image` gradient from foreground at 40 %. **Hover and press equal rest** (R2). Off is unchanged against round 175. |
| **NO-BRASS-ONSTATE** | A pixel scan with `R − B ≥ 45` at DPR 2 of each on-state button box (inset 1 px), at rest, hovered and pressed, plus the mixed button. **Blur everything first** so no `focus-visible` ring (K4) is in the box; for the pressed frame, mask the ring (inset 3 px) or read it as a CC value and say so. Do not let the selected lane name `bg-brand/20` (K7) into the box. | **0** brass pixels in each region at both viewports. Report the count per region. |
| **SEP-HOVER** (C's round-175 finding) | Hover `arrangement-detail-separator` with the real mouse (at 1280 expand the Clip details panel first) and scan it as in round 175 (`shots/c175-*/hover-detail-separator.png`). | Composite within ±3 of rgb(129,125,118) (over the panel); **0** pixels with R − B ≥ 45 (round 175: 22860/22860); contrast vs the panel ≥ 3:1. A separator drag still resizes the panel. |
| **CONTRAST-ONSTATE** (the D6 thresholds) | The on fill vs its header backdrop; the letter vs the fill; the mixed half fill vs the group header; the mixed letter vs the half fill; on vs off fill. | Each ≥ **3:1** (§0.1 predicts 6.30–15.62; the mixed half vs the header ≈ 3.62 at rest, the letter on the half ≈ 3.85). Record the mixed letter against 4.5:1 (WCAG 1.4.3) as info; it is an improvement over 1.88. |
| **STATE-DISTINCT-ONSTATE** | Mute on vs Solo on (fill vs fill), and the mixed vs on vs off group Solo, in screenshots side by side. | Record the ratio (§0.1 predicts 2.21; **informational, not a criterion**) and the M/S letter cue. Screenshot crops for Saba (vetoable). Mute and Solo must not be the same colour (today they are 1:1). |
| **FUNC-SMOKE-ONSTATE** | With a real mouse during playback: track Mute (the real output tap or meter drops for that track); track Solo (other tracks go silent); group Mute and Solo; the mixed parent; Master Mute (the output tap goes to silence); the separator drag. Undo restores a Mute. | Everything works as before. No console pageerror. |
| **ENV-VIS** | Re-run the round-175 copy of `c174-env.cjs` (change only the output names), 6 states at both viewports. | Every cell ≥ 3:1. Report any drop > 0.1 against `c-round-175/out/env/env-{1440-2,1280-1}.json` as a finding. |
| **RV1-DUX5B2A** | `d6.cjs` S0/S1/S2 against `c-round-175/out/d6/d6-1440-r1.json` and `d6-1280-r1.json`. | 0 missing, 0 added, max box delta 0 (≤ 1 px allowed). The contrast failing set is identical or smaller. |
| **RV3-STORE** | Grep for hex colours in `app/components/arrangement/`; screenshot `/` and `/cart` against round 175's shots. | 0 hex. Both pages unchanged (the hero video frame excepted). |
| **G176-3** | Anonymous `/studio-lab`; `/studio/middle-east`; `GET /api/studio-token?product=middle-east&file=stem1.wav`. | `/studio-lab` opens with the demo badge. `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`. The token request returns 401. Fake-Bearer 403 → BLOCKED (backend unavailable in cloud). |
| **PX-NET / REG-HYD** | Every session. | 0 forbidden hosts, 0 Authorization headers, 0 hydration messages and 0 pageerror. Only the expected cart noise. |

**Harness notes:**
- At 1280×720 the Clip details panel is collapsed by default (C-R172-DETAIL-COLLAPSED-720). Expand it before SEP-HOVER.
- If the first cold load crashes, discard that run and replace it once (ENV-FIRST-LOAD). Run the ENV-VIS sessions one at a time.
- Escape does not deselect; Ctrl+click the selected clip to deselect.
- Park the playhead outside the scanned boxes (Home), so the K8 playhead is not counted.
- Every run writes a uniquely named output file.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Colour of Mute / Solo on-states | **Not captured this round.** No Live 12 manual section or video was checked for the button colours. | — (unverified; B does **not** claim Live looks like this) | A CZABA brand rule (DUX-R-5, Saba 2026-10-25): on-states are not brass. The grey-Mute analogy to Live's unlit Track Activator is an **inference**, not a verified fact. | Parity: **not applicable / unverified**. The CZABA requirement is checked by CC-ONSTATE and NO-BRASS-ONSTATE. |
| What Mute and Solo do | Previously verified behaviour (SRW mix rows; not changed this round) | — | Behaviour unchanged | FUNC-SMOKE-ONSTATE |

## 6. Evidence and reporting
- **A:** `a-round-176.md` and `a-round-176/` (vitest JSONs, mutations, end hashes, diff, `vitest-files.txt`).
- **C:** `c-round-176.md`, `c-round-176.json` (`browserVerified`, `realVerified`, `passed`/`failed`/`blocked`/`gate`) and `c-round-176/` (out, shots, tools).
- **Both:** write the report files as you go, not only at the end.

## 7. Outcome, fixed in advance (B at round 177 planning)
| Condition | Round 177 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** comes first: every done / c_pass item at both viewports, `npm run test:e2e:smoke`, and the evidence gap C-R167-METRONOME-UNDER-MUTE. The rows below come after it. |
| C FAIL at Critical, High or Medium (including any contrast < 3:1 in CONTRAST-ONSTATE, SEP-HOVER or ENV-VIS, NO-BRASS-ONSTATE > 0, or Mute = Solo colour) | A bounded fix-up by the same owner within §1, or a question for Saba. It is not deferred silently. |
| INVENTORY-GREP finds an unclassified site | B classifies it at round 177 planning. It is not A's FAIL. |
| C FAIL on Lows only | A fix-up if the Low is in this round's own lines and cheap; otherwise `deferred_low_polish`, and 5b-2b goes ahead. |
| C PASS | Root publishes round 176. DUX-R-5b-2a → **მზადაა**, A-R175-DETAIL-SEP-ACCENT → closed. Round 177 = **DUX-R-5b-2b** (mode toggles, §0.4 recipe, narrow StudioWorkspace grant l.2287/2368/2388, plus TempoRow, Transport, LoopBrace, LibraryPreview and Library). If root's checkpoint answer says "extract first", the extraction runs as one bounded round before 5b-2b. |

At every planning, B checks `user-review/ableton-decisions.md`, `user-review/design-ux-decisions.md`, `docs/technical/store-redesign/direction-decision.md`, and whether the checkpoint answer has arrived.

## 8. Root notes
- **Gate:** on C PASS, publish round 176: the changed granted paths plus the 2 new files, against `c53eefc`. These must be unchanged: every protected file in §2, `app/styles/`, `app/components/studio/*` and the purchase/auth files.
- **Architecture checkpoint:** still unanswered (`b-round-173-checkpoint-request.md`, fallback (c)). The gate-175 Architecture note is recorded as follows: (a) the harness copy goes under ROOT-RECON-GRID-HARNESS; (b) the semantic token was decided no (§0). It is not scheduled.
- **Gate-175 review findings, as recorded by B:**
  - Suggestion 1 (the separator) → B1.
  - Suggestion 2 (the DXA7 out-of-scope counts) → L4(b).
  - Suggestion 3 (doc 144 status) → D1.
  - Suggestions 4 (thumb vs unfilled track, C measured 9.01) and 5 (the scrollbar hover jump, vetoable): info.
- **User-visible decisions** (vetoable in `feature-status.md`): grey filled Mute, light filled Solo, the light-tint mixed Solo, the M/S letter as the Mute-vs-Solo cue (2.21:1), R35 (add/import buttons are not primary), and the §0.4 toggle recipe for 5b-2b.

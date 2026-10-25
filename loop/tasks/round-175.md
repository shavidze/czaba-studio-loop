# CURRENT TASK — Round 175: DUX-R-5b-1 — one colour rule, part 2 stage 1: controls and affordances go neutral (fader thumbs, fade handles, trim / loop-edge / track-height hover, scrollbar thumb, Library resize hover, collapsed-group clip blocks); selection, playhead, primary and focus keep the brass; nothing moves

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-25 · Decision: **D-29z140** (`backlog.json` → VISUAL-A-OBSIDIAN `dux_r5b_plan_d29z140`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-174.md`, an exact copy of the round-174 `current-task.md` (sha256 `dcb5efe3…`, checked with `cmp`). The rationale for this round is in `b-round-174.md`.
- **User authority:** `user-review/design-ux-decisions.md` (2026-10-25): "**DUX-R-5: approve.** One colour rule. Waveforms and content use a neutral colour. The accent (brass in Obsidian) is reserved for selection, the playhead, the primary button and focus. Do it inside VISUAL-A … as its own bounded stage, before M1. Keep the contrast thresholds from D6."
- **Spec (source material only, grants nothing):** `docs/technical/studio-real-workspace/visual-direction-a.md` l.46 (brand = "the only accent: playhead, selected clip, primary action, focus"); review finding F-9 (`user-review/design-ux-review.md` l.221: "the same colour on waveforms, the selected clip frame, Export, Play, **the fader thumbs** and the focus ring").

## Baseline = HEAD `0a4a41e`, clean tree (gate 174 published)
- **Gate:** `gates/gate-round-174.json` has status `published` and commit `0a4a41e410276b10163147800e2b56342e0ed784` on both remotes.
- **Tree:** `git status --short` is empty, and `git ls-files -co --exclude-standard` lists **995** files.
- **Frozen list:** `b-round-174-r175-tree-sha256.txt`, **984 entries** (995 minus the 11 grants).
- **Grants:** `b-round-174-r175-grants.txt` (11 existing files). **New files:** `b-round-174-r175-new-files.txt` (2 files).
- **Start hashes:** `b-round-174-r175-granted-start-sha256.txt`. **Start copies:** `b-round-174/r175-granted-start/`.
- **Vitest base:** `b-round-174-r175-vitest-base.txt` (13 files) is **199/199** at `0a4a41e` (`b-round-174/out/vitest-base.json`).
- **Line numbers** below were grepped by B at `0a4a41e`.
- **A's first step:** check that HEAD = `0a4a41e`, the tree is clean, `sha256sum -c --quiet b-round-174-r175-tree-sha256.txt` is OK, the 11 start hashes match, and neither new file exists. If anything differs, stop and report.

## 0. Why this round (D-29z140)
- **Round 174: C PASS**, `browserVerified` and `realVerified` true, 0 Critical/High/Medium. Root published `0a4a41e` (review 9/10, nothing blocking). **DUX-R-5a → მზადაა.** C's one Low (C-R174-ENV-BELOW-DROP, handle-below 4.79 → 4.19, still ≥ 3:1, caused by design by R30) is recorded as info; B agrees with C's disposition (no code change).
- **The outcome was fixed in advance** in `tasks/round-174.md` §7, row "C PASS": round 175 = **DUX-R-5b**.
  - **Regression:** `regression-last.json` = 2026-10-24, so it is due on or after 2026-10-27. Today is 2026-10-25: not due.
  - **Checkpoint:** no root answer to `b-round-173-checkpoint-request.md`. Fallback (c) continues; nothing is extracted.
  - **Open findings:** no Critical, High or Medium finding is open (Tech Lead manual items aside).
- **5b is split into three stages; the scope is not reduced.** B's inventory at `0a4a41e` (§0.2) finds about 75 brass sites outside the focus rings. They fall into three groups that need different checks:
  - **5b-1 (this round): controls and affordances** — things you grab or hover. 17 token edits in 9 files, and only one test file locks them.
  - **5b-2 (next): on-state toggles** — Mute/Solo (track, group, Master), Loop, Metronome, Snap, Env, Waveform Zoom, Follow, the Delete-with-range button, the loop brace when enabled, the Library preview toggle. They need distinct neutral on-states (§0.3 finding) and touch the Q-R167-ON-HOVER question.
  - **5b-3 (after): labels, ghosts, Export dialog** — drop ghosts and hints, the demo badge, status texts, the Grid menu checks, the Export dialog notes and progress, the detail group count, the Library filter label and previewing label.
  - **DUX-R-5 is not მზადაა until 5b-3 passes C.**

## 0.1 B's colour computation (sRGB WCAG, Obsidian tokens from `app/styles/app.css` l.3920-3942)
| Site | Today | Candidate | Contrast (computed) | Note |
|---|---|---|---|---|
| Fader thumbs (6 `type="range"`) | `accent-brand` #c9a46a | **`accent-foreground`** #ece6da | thumb vs surface 14.78, vs elevated 13.94 | Chromium paints the thumb and the filled track in `accent-color`. jsdom cannot see it, so C measures the pixels. |
| Fade handle (Clip l.953) | `border-foreground bg-brand` (filled brass) | **`border-foreground bg-background`** (hollow) | border vs `bg-elevated` body 13.94; centre vs a selected `bg-brand` header 8.32 | It must not look like the envelope point (`bg-foreground border-background`, filled light, K6). The fade handle becomes a dark square with a light border, the envelope point stays a light square with a dark border. Fade handles are hidden in Env mode, so they are never on screen together. |
| Trim edges (Clip l.969/974), loop-brace edges (LoopBrace l.263/269), track-height handle hover (Lane l.1049) | `hover:bg-accent/60` (3.52 over elevated) | **`hover:bg-foreground/50`** | 4.40 over elevated, 4.30 over muted-bg, 4.53 over background | One step stronger than today. `/40` was rejected: 3.25–3.32 is too close to 3:1. |
| Track-height handle while dragging (Lane l.1050) | `bg-accent/60` | **`bg-foreground/50`** | as above | The same token as the hover. |
| Scrollbar thumb hover/active (`studio-scrollbar.ts` l.15/16) | `bg-brand` (dim → brand step 1.46) | **`bg-foreground`** | rest `bg-dim` → hover 2.75 step; vs the `bg-surface` track 14.78 | `bg-muted` was rejected: the step from `dim` is only 1.24. |
| Library resize handle hover (Library l.638) | `hover:bg-brand/40` (2.29 over surface) | **`hover:bg-foreground/50`** | 4.49 over surface, 3.91 vs its `bg-outline` rest | `focus-visible:bg-brand` on the same element is focus (K4) and stays. |
| Collapsed-group clip block, unselected (GroupHeader l.354) | `bg-brand/25` (1.57 over background) | **`bg-foreground/25`** | ≈1.98 over background (the same as the Overview video bar); the selected `bg-brand/60` block is 3.65, 1.84× brighter | This is content (the F-9 category that 5a missed). The selected block `border-brand bg-brand/60` is selection and stays (K7). `bg-muted/60` was rejected: 3.21, but only 1.14 against the selected block, so selection would rest on hue alone. |

- **Brass test (C):** `R − B ≥ 45`, as in round 174. Every token used this round is neutral (R − B ≤ 21). No `warning`/`destructive` token is used this round, so the test needs no exception. Stages 5b-2/5b-3 will set their own test if they use those tokens.

## 0.2 Rulings and the full 5b site table (all user-vetoable in `feature-status.md`)
**R34 (the line between brass and neutral):** brass stays on **selecting an object** (a clip, track, group, marker, Library node or row, the marquee, a chosen Export option), on **playheads**, on the **primary action** (Export) and on **focus**. Mode toggles, on-states, affordances, labels and warnings do not count as selection, and they go neutral.

**Kept brass (K1–K6 from round 174, plus K7–K12):**
- K7 selection: the selected collapsed-group block `border-brand bg-brand/60` (GroupHeader l.354); the selected lane/group row `bg-brand/20` (Lane l.698, GroupHeader l.270); the active-track marker `border-l-brand` (Lane l.665, GroupHeader l.195), `bg-brand/5` (Lane l.840) and its "Active" badge (Lane l.712); the selected marker (MarkerRow l.806/813); the Library active node and selected row (Library l.49/100); the marquee (StudioWorkspace l.2504); the chosen Export format/scope card `border-brand bg-brand/10` and its radio dot `accent-brand` (ExportDialog l.289-435).
- K8 playheads: Ruler l.221 `bg-accent`, StudioWorkspace l.450 `bg-accent`.
- K9 primary: the Transport Export button `border-brand text-brand` (l.339). Its hierarchy belongs to M1.
- K10 focus: Library search `focus:border-brand` (l.473), Library resize `focus-visible:bg-brand` (l.638), the GroupHeader rename field `border-brand` (l.252, an open editor).
- K11: the Library preview played part `fill-brand` (K5, unchanged).
- K12: the envelope (K6, unchanged).
- **Out of DUX-R-5 scope, not silently:** `app/components/studio/*` (ExportDialog, StudioTrack, DownloadDialog and the rest). They sit outside `[data-studio-theme="obsidian"]` (only StudioWorkspace l.2189 sets it) and are reached only through the protected `studio.$productId.tsx` (SRW-21, `deferred_user`).

**5b-1 (this round), 17 token edits:** see §1.

**5b-2 (next round), on-state toggles. Each needs distinct targets:** Lane Mute l.615 / Solo l.633; GroupHeader Mute l.288 / Solo on l.304 / mixed l.306; Master Mute l.173; Transport Delete-with-range l.218, Loop l.234, Follow on l.255 / paused l.256; TempoRow Metronome l.243; StudioWorkspace Snap l.2287, Env l.2368, Waveform Zoom non-default l.2388; LoopBrace enabled l.239/257; LibraryPreview toggle l.308; Library previewing label l.132. Constraint: Q-R167-ON-HOVER is `awaiting_user`, so 5b-2 keeps the on-state hover rule R2 (no hover step) unless Saba answers.

**5b-3 (after 5b-2), labels, ghosts and dialog:** Lane drop hint l.874, drop ring l.842, library ghost l.886/887, lane-move ghost l.922/923; StudioWorkspace demo badge l.2210, delete hint l.2562, selection count l.2568, lane-move refusal l.2605; GridMenu checks l.204/226/246; ExportDialog empty note l.524, progress l.562, overload warning l.569; DetailPanel group count l.676; Library filter label l.492.

## 0.3 Finding recorded by B (source evidence; C confirms in 5b-2/5b-3)
**B-R174-ACCENT-EQ-BRAND (Low; scheduled, not deferred).** In Obsidian `--color-accent` = `--color-brand` = `#c9a46a` (app.css l.3936/3939). So every site that tells two states apart by `brand` versus `accent` looks the same today:
- the valid ghost `border-brand` vs the blocked ghost `border-accent` (Lane l.886/887, l.922/923);
- the video vs audio drop hint (l.874);
- Solo on `bg-brand` vs Mute on `bg-accent`;
- Follow on vs paused.

The text label or the M/S letter still tells them apart, so this is Low. 5b-2/5b-3 own these lines and must give the states distinct targets; "neutral" alone is not enough. This round does not touch them.

## 1. What changes (exact; line numbers at `0a4a41e`)
| ID | File : line | From → To |
|---|---|---|
| A1a | `app/components/arrangement/ArrangementDetailPanel.tsx` l.841 | `accent-brand` → `accent-foreground` (only this token) |
| A1b | `app/components/arrangement/ArrangementMaster.tsx` l.199 | same |
| A1c | `app/components/arrangement/ArrangementLane.tsx` l.766 (Pan) | same |
| A1d | same file l.820 (Volume) | same |
| A1e | `app/components/arrangement/ArrangementGroupHeader.tsx` l.338 | same |
| A1f | `app/components/arrangement/ArrangementTransport.tsx` l.277 (Zoom) | same |
| A2 | `app/components/arrangement/ArrangementClip.tsx` l.953 | in `'absolute top-0 size-2.5 cursor-ew-resize rounded-xs border border-foreground bg-brand'`: `bg-brand` → `bg-background` |
| A3 | same file l.969 and l.974 | `hover:bg-accent/60` → `hover:bg-foreground/50` (2 sites) |
| A4 | `app/components/arrangement/ArrangementLoopBrace.tsx` l.263 and l.269 | `hover:bg-accent/60` → `hover:bg-foreground/50` (2 sites) |
| A5 | `app/components/arrangement/ArrangementLane.tsx` l.1049 and l.1050 | `hover:bg-accent/60` → `hover:bg-foreground/50`; `isHeightDragging && 'bg-accent/60'` → `isHeightDragging && 'bg-foreground/50'` |
| A6 | `app/components/arrangement/studio-scrollbar.ts` l.15 and l.16 | `[&::-webkit-scrollbar-thumb:hover]:bg-brand` → `[&::-webkit-scrollbar-thumb:hover]:bg-foreground`; `[&::-webkit-scrollbar-thumb:active]:bg-brand` → `[&::-webkit-scrollbar-thumb:active]:bg-foreground` |
| A7 | `app/components/arrangement/ArrangementLibrary.tsx` l.638 | `hover:bg-brand/40` → `hover:bg-foreground/50` (only this token; `focus-visible:bg-brand` stays) |
| A8 | `app/components/arrangement/ArrangementGroupHeader.tsx` l.354 | `'border-outline-hover bg-brand/25'` → `'border-outline-hover bg-foreground/25'` (the selected branch stays) |
| A9 | `app/components/arrangement/ArrangementClip.tsx` l.859 and l.876-879 (gate-174 suggestion 1) | the two `cn()` calls that now hold only fixed strings become plain `className` strings with the same tokens in the same order: `"relative min-h-0 flex-1 cursor-text text-muted/70"` and `"pointer-events-none absolute inset-0 h-full w-full text-foreground"`. If `cn` is then unused in the file, keep the import only if it is still used elsewhere (it is: l.826 and others). |
| L1 | `app/lib/arrangement/__tests__/track-layout.test.tsx` l.801 | in `UNFOLDED_HANDLE_CLASS`, `hover:bg-accent/60` → `hover:bg-foreground/50`. Nothing else in the string. |
| L2 | same file l.835 | `.not.toContain('hover:bg-accent/60')` → `.not.toContain('hover:bg-foreground/50')` (so the folded check stays meaningful). Nothing else. |
| T1 | **new** `app/lib/arrangement/__tests__/affordance-colour-ui.test.tsx` | tests DXA1–DXA7 (§3.2) |
| D1 | `docs/implementation/2026/quarter-IV/143-studio-dux-r5a-content-colour.md` | (a) l.4 → `**სტატუსი:** Completed (C round 174 PASS, გამოქვეყნდა `0a4a41e`)`; (b) l.91 TODO line → wrapped in `~~…~~` (bullet marker outside, as in round 174); (c) l.92 (the DUX-R-5b TODO) → append ` — 5b-1 Round 175 (doc 144), 5b-2 და 5b-3 შემდეგ.` Nothing else. |
| D2 | **new** `docs/implementation/2026/quarter-IV/144-studio-dux-r5b1-affordance-colour.md` | Georgian, with the `docs/implementation/TEMPLATE.md` sections. Include R34, K7–K12, the §0.1 table, the full §0.2 site table with stages, the §0.3 finding, the tests, the mutations and the TODOs (5b-2, 5b-3, ROOT-RECON-GRID-HARNESS carried forward). Status: `In Progress (awaiting C round 175)`. |

**Constraints:**
- Only the tokens above change. No `style=`, no arbitrary value, no hex, no new CSS, no `app/styles/` edit.
- No `data-*`, aria, handler, layout, size or position change. The handle shapes and sizes stay (`size-2.5`, `w-2`, `h-1.5`, `w-1`).
- `cn()` never gets a second colour token for the same property next to one it already has (the tailwind-merge rule, R29).
- The 5b-2 and 5b-3 sites in these files (for example Lane l.615/633/874/886, GroupHeader l.288/304/306, Transport l.218/234/255/256, Library l.132/492) **must not change** this round.

## 2. A — files you own (everything else is frozen)
- **The 11 grants** (`b-round-174-r175-grants.txt`): `ArrangementClip.tsx`, `ArrangementLoopBrace.tsx`, `ArrangementLane.tsx`, `ArrangementDetailPanel.tsx`, `ArrangementMaster.tsx`, `ArrangementGroupHeader.tsx`, `ArrangementTransport.tsx`, `ArrangementLibrary.tsx`, `studio-scrollbar.ts`, `track-layout.test.tsx`, doc 143.
- **The 2 new files:** `affordance-colour-ui.test.tsx` and doc 144.
- **Protected; these must stay byte-identical:**
  - `StudioWorkspace.tsx`, `ArrangementLibraryPreview.tsx`, `ArrangementClipEnvelope.tsx`, `ArrangementExportDialog.tsx`, `ArrangementOverview.tsx`, `ArrangementTempoRow.tsx`, `ArrangementMarkerRow.tsx`, `ArrangementGridMenu.tsx`, `ArrangementRuler.tsx`, `content-colour-ui.test.tsx`;
  - `app/styles/`, `Modal.tsx`, `strings.ts`, `view.ts`, `root.tsx`;
  - all routes (including `studio.$productId.tsx` and `studio-lab.tsx`), `app/components/studio/*`, the contexts, `app/lib/auth.ts`, `firebase.client.ts`, the purchase/download/studio-token files, and `.claude/**`.
- **Process rules (kept from earlier rounds):**
  - Make every lasting edit with Edit/Write so the primitives hook runs. Use shell writes only for temporary mutations, and restore and sha-check each one.
  - Before writing code, read the primitives the hook names (at least `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `FORWARDREF_COMPONENT.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`) and `.claude/prompts/new-test.md`.
  - Write `a-round-175/end-sha256.txt` (13 paths) and `a-round-175/diff-vs-start.patch` (against `b-round-174/r175-granted-start/`, with the new files as new).
  - Do not run tools from `tmp/studio-real-loop/`; keep helper scripts under `a-round-175/tools/` and run them with cwd = store. No commit, no push.

## 3. A — tests and commands (speed rules)
### 3.1 Commands
- **Before the edits:** run the 13 base files. Expect **199/199**.
- **After the edits:** run the 13 base files plus `affordance-colour-ui.test.tsx`. Everything must be green; report the count.
- **Checks:** `npm run typecheck`, `npm run lint`, and a read-only `npx biome check` on the changed code and test files.
- **Not A's:** the full suite, `npm run verify`, the build, e2e and browser rows. These belong to the gate and to C.
- **Code review:** ask the `code-reviewer` subagent (3+ changed files) and pass its Architecture note to B verbatim.

### 3.2 New tests (`affordance-colour-ui.test.tsx`; B grepped the repo and IDs DXA1–DXA7 are unused)
**Setup:** mount the real workspace (provider + `StudioWorkspace`) the way `content-colour-ui.test.tsx` and `track-layout.test.tsx` do, with `createArrangement` audio and video clips. Assert on class tokens (split on whitespace), not on full className strings. A missing element must throw a labelled error (no vacuous pass).

- **DXA1 (thumbs):** each of `arrangement-detail-clip-gain-fader`, the `Master Volume` range, `arrangement-track-pan`, the track `Volume — …` range, `arrangement-group-volume` and `arrangement-zoom` has `accent-foreground`, has no token that starts with `accent-brand`, and still has `focus-visible:ring-brand`. Find the group volume with a track group present, and the detail fader with a clip selected.
- **DXA2 (fade handles):** mount as `clip-fades-ui.test.tsx` does (its `FADE_IN_HANDLE` l.107 recipe), so the clip is at least `FADE_HANDLE_MIN_CLIP_PX` = 24 px wide and the handles render. With an audio clip and a video clip selected (handles shown), every `arrangement-clip-fade-{in,out}-handle` and `arrangement-video-fade-{in,out}-handle` has `bg-background` and `border-foreground`, and no `bg-brand`. Then turn Env mode on: a clip envelope point (as `clip-envelope-ui.test.tsx` finds it) still has `bg-foreground` and `border-background` (K6 lock), and the fade handles are not rendered.
- **DXA3 (trim edges):** the two trim edges of a clip (found by their `title`, `studioClipStrings.trimStartLabel` / `trimEndLabel`) each have `hover:bg-foreground/50` and no token that contains `accent`.
- **DXA4 (loop edges):** with a loop present (enabled and disabled), `arrangement-loop-start-edge` and the end edge have `hover:bg-foreground/50` and no token that contains `accent`.
- **DXA5 (track height):** the unfolded `arrangement-track-height` handle has `hover:bg-foreground/50`. During a height drag (pointerdown on the handle, as `track-layout.test.tsx` does it) it has `bg-foreground/50`; after pointerup it does not. If jsdom cannot start the drag, say so in the report; DXA7 then covers the token.
- **DXA6 (scrollbar, Library resize, group block):**
  - `STUDIO_SCROLLBAR_CLASS` (imported) contains `[&::-webkit-scrollbar-thumb:hover]:bg-foreground` and `[&::-webkit-scrollbar-thumb:active]:bg-foreground`, and no token that contains `bg-brand`.
  - The Library resize handle has `hover:bg-foreground/50` and still `focus-visible:bg-brand` (K10).
  - A collapsed group with two clips, one selected: the unselected block has `bg-foreground/25` and `border-outline-hover`, and the selected one has `border-brand` and `bg-brand/60` (K7).
- **DXA7 (source locks, read-only reads):**
  - In the 9 granted component files, each of `accent-brand`, `hover:bg-accent/60`, `'bg-accent/60'`, `hover:bg-brand/40`, `bg-brand/25` and `-thumb:hover]:bg-brand` occurs **0** times.
  - In `ArrangementClip.tsx`, `border border-foreground bg-background` occurs exactly once and `border border-foreground bg-brand` 0 times. The A9 plain strings `"relative min-h-0 flex-1 cursor-text text-muted/70"` and `"pointer-events-none absolute inset-0 h-full w-full text-foreground"` each occur exactly once. (No lock on the old `cn(` fragments: at `0a4a41e` the second call spans l.876-879, so a one-line `cn('…` lock would pass vacuously. The two plain-string locks fail if A9 is not done.)
  - Kept sites, each exactly once: `'z-10 border-brand ring-2 ring-brand'` (Clip), `focus-visible:bg-brand` (Library), `'border-brand bg-brand/60'` (GroupHeader).
  - The 5b-2/5b-3 sites are unchanged: `ArrangementExportDialog.tsx` still contains `accent-brand` **6** times, and `ArrangementLane.tsx` still contains `'border-accent bg-accent/20 text-accent'` **2** times.

### 3.3 Mutations
Each mutation is a temporary shell edit, restored and sha-checked afterwards. Write one JSON per mutation in `a-round-175/mutations/`.

| ID | Mutation | Must turn red |
|---|---|---|
| m248 | A1d: the Lane Volume thumb back to `accent-brand` | DXA1, DXA7 |
| m249 | A1f: the Zoom thumb back to `accent-brand` | DXA1, DXA7 |
| m250 | A2: the fade handle back to `bg-brand` | DXA2, DXA7 |
| m251 | A3: the trim start edge back to `hover:bg-accent/60` | DXA3, DXA7 |
| m252 | A4: the loop end edge back to `hover:bg-accent/60` | DXA4, DXA7 |
| m253 | A5: the dragging token back to `bg-accent/60` | DXA5 (or DXA7 only, if DXA5 cannot drag; say which), DXA7 |
| m254 | A6: the scrollbar hover back to `bg-brand` | DXA6, DXA7 |
| m255 | A8: the unselected group block back to `bg-brand/25` | DXA6, DXA7 |
| m256 | K7: the selected group block `bg-brand/60` → `bg-foreground/25` | DXA6, DXA7 |
| m257 | L1: the unfolded handle back to `hover:bg-accent/60` | track-layout C-R11-01, DXA5, DXA7 |

If a mutation stays green, report it and do not weaken the expectation. B rules on it.

## 4. C — rows
Run every row at both viewports (1440×900 and 1280×720), in real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, with a fresh context per session.

**Setup:** S1 as round 174: load `media/beeps-6s-h264-aac.mp4`, add `demo-middle-east` to Music at 1 s, add one SFX clip. For the group rows, group two audio tracks and collapse the group. For the loop rows, set a loop over the music clip.

| Row | What | Pass |
|---|---|---|
| **T175-TARGETED** | Re-run `a-round-175/vitest-files.txt` (the base plus the new file). | All green, the same count as A. |
| **SOURCE-SCOPE** | The frozen list at start and end; A's `end-sha256.txt`; `git status`; the protected diff against `0a4a41e`. | All OK. `git status` shows at most 11 ` M` + 2 `??`. The protected diff is empty. The tree hash at C's start equals the hash at C's end. |
| **AN-REVIEW** | C reads the diff. | Only A1–A9, L1–L2 and D1–D2 as written in §1; no other token, attribute or line. The 5b-2/5b-3 sites listed in §1 are untouched. |
| **CC-AFFORD** | Computed values in the real page: `accent-color` of the 6 range inputs; the fade handle `background-color` and `border-color`; the trim edge, loop edge, track-height handle and Library resize handle `background-color` while the real mouse hovers them; the track-height handle while dragging; the collapsed-group block colours (unselected and selected). For the scrollbar thumb, hover and press it with the real mouse and read the thumb pixels in a DPR-2 screenshot. | Matches §1: thumbs `accent-color` = rgb(236,230,218). The fade handle bg = rgb(14,13,12) and border = rgb(236,230,218). Hover/drag fills are `foreground` at 50 % alpha (composite within ±3 of §0.1). The scrollbar thumb at hover/press is ≈ rgb(236,230,218) (±3). The unselected block is `foreground` at 25 %. |
| **NO-BRASS-AFFORD** (the F-9 fix as a measurement) | A pixel scan with `R − B ≥ 45` at DPR 2 of: each range input box (rest, and while the real mouse holds the thumb); each fade handle box on an **unselected hovered** clip and a **selected** clip (the handle box only, inset 1 px, so the selected header and ring are excluded); the hovered trim edge of an **unselected** clip, **body rows only** (the edge is `inset-y-0` and also covers the header; on a selected clip it composites over the K1 brass header, so record that overlap as info, not in this scan); the hovered loop edge of a **disabled** loop (enabled is also arithmetically neutral; record it as info); the hovered track-height handle; the hovered Library resize handle; the hovered and the pressed scrollbar thumb; the unselected collapsed-group block. **Before the rest/hover scans, blur everything**, so no `focus-visible` ring (K4/K10) is in the box. **Held thumb and dragged height handle:** the control has focus, and its `ring-2 ring-brand` / `ring-inset ring-brand` (K4) may show. Mask the ring pixels: inset the range-input box by 3 px, and for the dragged height handle scan only its centre row. If the ring still overlaps, read those two frames as CC-AFFORD colour values instead of brass scans, and say so. | **0** brass pixels in each region at both viewports. Report the pixel count per region. |
| **CONTRAST-DUX5B1** (the D6 thresholds) | The thumb vs the **unfilled** part of its track, and the thumb vs the control's backdrop surface. Chromium paints the filled part in `accent-color` too, so the thumb vs the filled part is ≈1:1 by design; record it, it is not a criterion. Then: the fade handle border vs the clip body; the hover fills vs their own surface (trim edge vs the **unselected** clip body, the loop edge vs the disabled brace's backdrop, height handle vs the lane, Library resize vs the panel); the scrollbar thumb at hover vs its track. Also record the filled vs unfilled range track (informational; F-11 measured 2.34 for the unfilled track). | Each ≥ **3:1** (WCAG 1.4.11). Record the unselected group block (≈1.98, informational, an improvement over 1.57) and the selected vs unselected block ratio (≈1.84). |
| **HANDLE-DISTINCT** | Screenshots of a selected clip with fade handles, and of the same clip in Env mode with envelope points. | The fade handle reads as a hollow dark square with a light border, the envelope point as a filled light square with a dark border. Fade handles are absent in Env mode. Record both crops for Saba (vetoable). |
| **ENV-VIS** | Re-run `c-round-174/tools/c174-env.cjs` (copy; change only the output names), all 6 states at both viewports (12 cells). | Every cell ≥ 3:1 for line core vs halo and handle. Report any drop of more than 0.1 against `c-round-174/out/env/env-{1440,1280}-2.json` as a finding. |
| **RV1-DUX5B1** | `c-round-174/tools/d6.cjs` S0/S1/S2 against `c-round-174/out/d6/d6-1440-r1.json` and `d6-1280-r1.json` (round 174's own run; compare with a copy of `c-round-174/tools/cmp-d6-174.cjs`). | 0 missing, 0 added, max box delta 0 (≤ 1 px allowed). The contrast failing set is identical or smaller. |
| **FUNC-SMOKE-DUX5B1** | With a real mouse: drag the Music Volume fader (the output level changes: meter or real output tap), the Pan, Master Volume, the group Volume, the Zoom slider and the Clip Gain fader; drag a fade-in handle (the fade length changes); trim an edge; drag a loop edge (the loop end changes); drag a track height; drag the timeline scrollbar thumb (scrollLeft changes); drag the Library resize handle (the panel width changes); play (the playhead moves). | Everything works as before. No console pageerror. |
| **RV3-STORE** | Grep for hex colours in `app/components/arrangement/`. Screenshot `/` and `/cart` and compare them against `b-round-148/out/storebase149.json` (as round 174 did). | 0 hex. Both pages unchanged (the hero video frame excepted, as in round 174). |
| **G175-3** | Anonymous `/studio-lab`; `/studio/middle-east`; `GET /api/studio-token?product=middle-east&file=stem1.wav`. | `/studio-lab` opens with the demo badge. `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`. The token request returns 401. Fake-Bearer 403 → BLOCKED (backend unavailable in cloud). |
| **PX-NET / REG-HYD** | Every session. | 0 forbidden hosts, 0 Authorization headers, 0 hydration messages and 0 pageerror. Only the expected cart noise. |

**Harness notes:**
- At 1280×720 the Clip details panel is collapsed by default (C-R172-DETAIL-COLLAPSED-720). Expand it before the Clip Gain rows.
- If the first cold load crashes, discard that run and replace it once (ENV-FIRST-LOAD). Run the ENV-VIS sessions one at a time (round 174 note: concurrent runs lost the grid control).
- Escape does not deselect; Ctrl+click the selected clip to deselect (round 174 harness note).
- Park the playhead outside the scanned boxes (Home), so the K8 playhead is not counted.
- Every run writes a uniquely named output file.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Colour of faders, fade handles and hover edges vs selection colour | None captured ("Live ?"; DUX-R-5 has no Live source) | — | A CZABA brand rule, approved by Saba 2026-10-25 (one accent) | Parity: **not applicable**. The CZABA requirement is checked by CC-AFFORD and NO-BRASS-AFFORD. |

## 6. Evidence and reporting
- **A:** `a-round-175.md` and `a-round-175/` (vitest JSONs, mutations, end hashes, diff, `vitest-files.txt`).
- **C:** `c-round-175.md`, `c-round-175.json` (`browserVerified`, `realVerified`, `passed`/`failed`/`blocked`/`gate`) and `c-round-175/` (out, shots, tools).
- **Both:** write the report files as you go, not only at the end.

## 7. Outcome, fixed in advance (B at round 176 planning)
| Condition | Round 176 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** comes first: every done / c_pass item at both viewports, `npm run test:e2e:smoke`, and the evidence gap C-R167-METRONOME-UNDER-MUTE. The rows below come after it. |
| C FAIL at Critical, High or Medium (including any contrast < 3:1 in CONTRAST-DUX5B1 or ENV-VIS, or NO-BRASS-AFFORD > 0) | A bounded fix-up by the same owner within §1, or a question for Saba. It is not deferred silently. |
| CONTRAST-DUX5B1 thumb vs the unfilled track < 3:1 (Chromium's unfilled-track grey is not known in advance; C's number decides) | A same-owner fix-up: the six thumbs → `accent-muted` (#a39b8e; 6.30–7.06 against the surfaces), re-measured by C. This is pre-ruled, not a new design question. |
| C FAIL on Lows only | A fix-up if the Low is in this round's own lines and cheap; otherwise `deferred_low_polish`, and 5b-2 goes ahead. |
| C PASS | Root publishes round 175, and DUX-R-5b-1 → **მზადაა**. Round 176 = **DUX-R-5b-2** (on-state toggles, distinct neutral targets, StudioWorkspace and TempoRow granted). If root's checkpoint answer says "extract first", the extraction runs as one bounded round before 5b-2. |

At every planning, B checks `user-review/ableton-decisions.md`, `user-review/design-ux-decisions.md`, `docs/technical/store-redesign/direction-decision.md`, and whether the checkpoint answer has arrived.

## 8. Root notes
- **Gate:** on C PASS, publish round 175: the changed granted paths plus the 2 new files, against `0a4a41e`. These must be unchanged: `StudioWorkspace.tsx`, `ArrangementLibraryPreview.tsx`, `ArrangementClipEnvelope.tsx`, `ArrangementExportDialog.tsx`, `ArrangementOverview.tsx`, `content-colour-ui.test.tsx`, `app/styles/`, `Modal.tsx`, `strings.ts`, `view.ts`, `app/components/studio/*` and the purchase/auth files.
- **Architecture checkpoint:** still unanswered (`b-round-173-checkpoint-request.md`, fallback (c)). The gate-174 Architecture note (after 5b, one test-only task that replaces exact-className locks with role-based token checks) is recorded as a signal under checkpoint Q2 / `GATE167-TOKEN-TEST-FRAGILITY`. It is not scheduled. This round follows its direction: the new tests assert tokens, not full strings.
- **Gate-174 review findings, as recorded by B:**
  - Suggestion 1 (the fixed-string `cn()` calls) → A9.
  - Suggestion 2 (doc 143 status) → D1.
  - Suggestion 3 (the positional Overview selector) → already `GATE173-S4-OVERVIEW-BAR-POSITIONAL-SELECTOR` in `deferred_low_polish`; the content-colour-ui copy is added to that entry.
  - Suggestions 4 and 5 (R31 cue, `currentColor` inheritance): info.
- **User-visible decisions** (vetoable in `feature-status.md`): R34 (where the brass line is drawn), the hollow fade handle, the white fader thumbs, `foreground/50` hover edges, the white scrollbar thumb on hover, and the neutral collapsed-group blocks.

# CURRENT TASK — Round 150: V-1b — text-field boundary (DUX-B-3) + the two V-1a Lows (C-R149-1 Loop label, C-R149-2 Overview playhead)

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-25 · Decision: **D-29z115** (`docs/technical/studio-real-workspace/plan.md`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-149.md`, an exact copy of the round-149 `current-task.md` (sha256 `c53c1ef3…3eef`). Rationale: `b-round-149.md`.
- **Spec (user-approved 2026-10-21):** `docs/technical/studio-real-workspace/visual-direction-a.md` (§ „ფერები“, § „შემოწმება (C)“). It is source material, not authority for permissions or protected files.

## Baseline = the round-149 working tree, not a clean HEAD
- Gate 149 was **skipped** ("C taskStatus FAIL"), so HEAD is still **`b292ff48b7c245d3435f8a44e6c3fc511cb66289`**.
- A's round-149 changes are uncommitted: `git status --short` = 3 ` M` + 2 `??`, all byte-equal to `a-round-149/end-sha256.txt` (B checked: `sha256sum -c` 5/5 OK).
- **Never revert, stash or rewrite a round-149 change.** Root publishes rounds 149 + 150 together after C PASS.
- **Frozen list:** `tmp/studio-real-loop/b-round-149-r150-tree-sha256.txt`, **962 entries** = `git ls-files -co --exclude-standard` (970) minus the 8 grants, hashed on the current tree. `StudioWorkspace.tsx` and doc 121 are frozen at their round-149 end state.
- **Grants:** `b-round-149-r150-grants.txt` (8 existing files, 0 new; `b-round-149-r150-new-files.txt` is empty). **Start hashes:** `b-round-149-r150-granted-start-sha256.txt`. **Start copies:** `b-round-149/r150-granted-start/` (paths relative to `store/`). Two granted files are untracked (the theme test and doc 122), so these copies are their only pre-edit reference (C-R119-01 rule). A checks all three first; any difference → A stops and reports.

## 0. Why this round (D-29z115)
- **Round 149: C FAIL (Low only)**, `browserVerified` = `realVerified` = true. All other rows passed: tokens scoped on the workspace, `body` and both portals; RV-1 0 px; all 61 DUX-B-1/B-4 elements ≥ 4.5 (lowest 4.57); Store pages unchanged; behaviour unchanged.
- The two Lows were caused by round 149:
  - **C-R149-1:** the Loop brace label "Loop" (`text-accent` on `bg-accent/30` over surface) = 4.32 computed / 4.38 pixel (< 4.5; post-V-0 it was 4.97).
  - **C-R149-2:** the Overview playhead (`bg-accent`) over a full `bg-brand` audio bar = 1.03:1 by pixel. Both are now `#c9a46a`.
- **Round 149 §7 fixed this outcome in advance:** a Low the round caused → bounded fix-up, same owner, not a waiver. RV-2 colour failures join **V-1b** with DUX-B-3. So this round = V-1b + C-R149-1 + C-R149-2: three tightly related colour/contrast items, the policy maximum.
- **Correction to round 149's count:** V-1b needs **3** components, not 4. The group-name and marker-name inputs already use `border-brand` (C measured the group field ≈ 7.3:1). The fields at ≈ 1.15 are BPM (TempoRow), library search (Library) and the detail From/To/Clip Gain (`inputClass` in DetailPanel).
- **Checks at planning:** the regression is due on or after 2026-10-27 (`regression-last.json`: 2026-10-24, round 122), and today is 2026-10-25, so it is not due. `user-review/ableton-decisions.md` and `design-ux-decisions.md` do not exist. No Critical/High is open, and no Medium except the Tech Lead manual items.

## 1. What changes (exact)
| ID | File, line (round-149 tree) | Before | After |
|---|---|---|---|
| F1 | `app/styles/app.css` l.3924, **inside the obsidian block only** | `  --color-outline-strong: #3a3530;` | `  --color-outline-strong: #736b60;` |
| F2 | `ArrangementTempoRow.tsx` l.230 (BPM field) | `… rounded-sm border border-outline bg-background …` | `… rounded-sm border border-outline-strong bg-background …` |
| F3 | `ArrangementLibrary.tsx` l.469 (search field) | `… rounded-sm border border-outline bg-background …` | `… rounded-sm border border-outline-strong bg-background …` |
| F4 | `ArrangementDetailPanel.tsx` l.639 (`inputClass`: From, To, Clip Gain) | `'h-6 w-20 rounded-sm border border-outline bg-background …` | `'h-6 w-20 rounded-sm border border-outline-strong bg-background …` |
| L1 | `ArrangementLoopBrace.tsx` l.239 (enabled brace) | `? 'border-accent bg-accent/30'` | `? 'border-accent bg-accent/20'` |
| L2 | `ArrangementOverview.tsx` l.334 (Overview playhead) | `className="pointer-events-none absolute inset-y-0 w-0.5 bg-accent"` | `className="pointer-events-none absolute inset-y-0 w-0.5 bg-accent ring-1 ring-background"` |

- Each F/L edit changes **exactly one token** on one line (L2 adds two tokens). No other line, class, testid, handler or text changes in these files. Biome must not need to rewrap them; if it does, A reports the exact rewrap.
- **app.css:** only the one value at l.3924. The Store `@theme` `--color-outline-strong` (l.61) is unchanged. The obsidian block keeps 22 lines, its selector, its position at EOF and its 18 properties.
- The disabled and focus variants stay as they are (`disabled:text-dim`, `focus:border-brand` on the search field, the `focus-visible:ring-*` rings). The pending Clip Gain field keeps `border-warning`: `cn()`/twMerge drops `border-outline-strong` when `border-warning` is added (B checked with `twMerge`).

### 1.1 B decisions (D-29z115)
- **R1, field boundary: `outline-strong` = `#736b60`** (spec table `#3A3530` = 1.52 on surface).
  - **Math (WCAG relative luminance, sRGB):** `#736b60` vs surface `#161412` = **3.50**, vs background `#0e0d0c` (the field fill, inside edge) = **3.70**, vs elevated `#1d1a17` = **3.30**. Candidates `#6b6359` (3.11/3.29/2.93) and `#6e665c` (3.25/3.44/3.07) had too little margin on elevated or against pixel rounding.
  - **Why this token:** `outline-strong` has **0 consumers** in `app/` outside the two token definitions (B grep), and its utility already compiles from `@theme`, so the scoped value change touches only the three fields. No new `@theme` token (that would be a Store-wide edit).
  - It stays darker than `dim` `#928a7d` (5.38): a visible but quiet boundary, not a text-strength line. It is a deviation from the spec's value, recorded like R2 (dim) in D-29z114, with the same reason: the spec's own check (§ „შემოწმება“ and WCAG 1.4.11, project-adopted in DUX-B-3) cannot be met with `#3A3530`.
- **R2, Loop brace fill `/30` → `/20`:** accent label on the composite `#3a3124` = **5.47** (on `/30`: 4.38). It is the same fill the Loop **button** already uses on (`ArrangementTransport.tsx:208`, `border-accent bg-accent/20 text-accent`), so the brace and the button now share one "on" look. B rejected `text-foreground`: it would drop the gold "on" text cue. The on/off cues stay: solid vs dashed border, fill vs none, "Loop" vs "Loop off". The hover handles (`hover:bg-accent/60`) are untouched.
- **R3, Overview playhead halo, not a recolour.** No single token can fix C-R149-2:
  - `foreground` vs the full bar = 1.88;
  - `background` vs the bar = 8.32, but ≈ 1.0 on the dark Overview floor (`bg-background`), where the line must also show.

  So the line keeps the one brand accent (spec: brand = playhead) and gets a 1 px `background` halo (`ring-1 ring-background`, a `box-shadow`). Halo vs full bar = **8.32**, line vs floor = **8.32**. A `box-shadow` does not change the bounding box, so RV-1 holds. This is two colours on one element, not strictly "colour-only"; §7 of round 149 allowed this round to own it either way. `ring-background` is a token utility (it compiles from `--color-background`; `ring-offset-background` is the existing precedent in `ui/Button.tsx:83`).
- **R4, not changed now:**
  - the selector split for browsers without `:has()` (A-R149 reviewer L2). V-1b changes one value, not the selector; it stays a signal;
  - moving Studio rules to `app/styles/studio-theme.css` (A-R149 Architecture note). V-1b adds no rule; it stays a signal;
  - fonts (V-2); icons, button surfaces, radius and motion (V-3); M1/M3/M4; M5 (not approved).
- **R5, weak-guard note (no grant):** `pending-status.test.tsx` PM2 asserts `className` `toContain('border-outline')`. After F4 it still passes, but only because `border-outline-strong` contains that substring. PM1 and `detail-panel-fit` F4 stay meaningful (`not.toContain` / exact token). The exact field token is pinned by the new TH5. Recorded as `B-R150-PM2-SUBSTRING` (info).

## 2. A — files you own (everything else is frozen)
| Path | Allowed change |
|---|---|
| `app/styles/app.css` | F1 only (narrow grant: one value inside the obsidian block) |
| `app/components/arrangement/ArrangementTempoRow.tsx` | F2 only |
| `app/components/arrangement/ArrangementLibrary.tsx` | F3 only |
| `app/components/arrangement/ArrangementDetailPanel.tsx` | F4 only |
| `app/components/arrangement/ArrangementLoopBrace.tsx` | L1 only |
| `app/components/arrangement/ArrangementOverview.tsx` | L2 only |
| `app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx` (untracked, round 149) | TH2 map value `'--color-outline-strong': '#736b60'`; new `it`s TH5 and TH6 (§3.1). TH1, TH3 and TH4 stay unchanged |
| `docs/implementation/2026/quarter-IV/122-studio-v1a-obsidian-color-tokens.md` (untracked, round 149) | Georgian: title and status cover V-1a + V-1b, status `In Progress (C round 150 — ჯერ არ გაშვებულა)`; add the round-149 C result (FAIL-Low C-R149-1/2) under „პრობლემები და გადაწყვეტები“ and the F/L changes and R1–R3 math under „მიდგომა“; list the 6 changed source files under „შეცვლილი ფაილები“. Keep the filename (`…-v1a-…`); rounds 149 + 150 publish together, so one doc covers V-1 |

- **Protected:** the diff vs b292ff4 stays empty for:
  - `studio.$productId.tsx`, `api.studio-token.ts`, `account.downloads.tsx`, `download-routes.test.ts`;
  - `auth*`, `AuthContext.tsx`, `StudioContext.tsx`;
  - `Modal.tsx`, `root.tsx`.
- **Not allowed:** any other style file or class; `package.json`; a new dependency; commit, push, stash, install, or `npm run build` (it writes under `store/`). Every lasting edit goes through Edit/Write (C-R120-01 rule). Shell writes only for temporary mutations, restored and sha-verified.

## 3. A — tests and mutations (hand-written literals; no module-against-module pins)
### 3.1 `studio-theme-obsidian.test.tsx`
- **TH2:** the hand-written map changes in one entry only: `--color-outline-strong` → `#736b60`. Everything else in TH2 stays (exactly once, top-level, 18 exact declarations).
- **TH5, rendered field and playhead tokens (SSR).** Use the TH1 setup (`renderToString(<StudioLabRoute />)`; all these testids are in the S0 SSR output, B checked on the dev server). Split each element's `class` into tokens:
  - `arrangement-tempo-input`, `arrangement-library-search`, `arrangement-detail-start`, `arrangement-detail-end`, `arrangement-detail-clip-gain-input`: each has the token `border-outline-strong` and **not** the token `border-outline`;
  - `arrangement-overview-playhead`: has the tokens `bg-accent`, `ring-1` and `ring-background`.
- **TH6, Loop brace on-state class (source literal).** The brace only renders with a loop, so read `ArrangementLoopBrace.tsx` with `readFileSync`:
  - the literal `'border-accent bg-accent/20'` occurs exactly once;
  - `bg-accent/30` occurs 0 times.

### 3.2 Mutations
Procedure: Edit → run → restore by Edit → sha256 equals the post-edit hash. Save the JSON in `a-round-150/mutations/`.

| ID | Mutation | Must turn red |
|---|---|---|
| m119 | F1 value `#736b60` → `#736b61` | TH2 only |
| m120 | F2 back to `border-outline` | TH5 only |
| m121 | F3 back to `border-outline` | TH5 only |
| m122 | F4 back to `border-outline` | TH5, and `pending-status` PM2 stays green (record it: R5) |
| m123 | L1 back to `bg-accent/30` | TH6 only |
| m124 | L2: remove `ring-1 ring-background` | TH5 only |

### 3.3 Commands (speed rules)
- **At the start:** HEAD is b292ff4; `git status --short` = 3 ` M` + 2 `??`; `sha256sum -c --quiet b-round-149-r150-tree-sha256.txt` and the granted start hashes pass.
- **Baseline (round-149 tree):** `npx vitest run app/lib/arrangement/__tests__/studio-theme-obsidian.test.tsx app/lib/arrangement/__tests__/pending-status.test.tsx app/lib/arrangement/__tests__/detail-panel-fit.test.tsx app/lib/arrangement/__tests__/view.test.ts app/lib/arrangement/__tests__/navigation-strings-ui.test.tsx app/lib/arrangement/__tests__/grid-snap-loop-drop.test.tsx` → `a-round-150/vitest-baseline.json`. These cover the Clip Gain field states, the Overview and the Loop brace.
- **After the edits:** `npm run typecheck`, `npm run lint`, read-only `npx biome check` on the 6 changed `.ts`/`.tsx` files, then the same 6 vitest files. Per-file `it` counts are unchanged except the theme file (4 → 6).
- **Code-reviewer:** run it (3+ files) and pass its Architecture note to B verbatim.
- **Not run by A:** the full suite, `npm run verify`, the build, e2e, and any browser row.
- **At the end:** frozen 962 OK; `git status --short` = exactly **8 ` M` + 2 `??`** (the round-149 3 + 5 newly modified tracked files; `app.css` was already ` M`); protected diff empty; write `a-round-150/end-sha256.txt` (all 10 changed paths of rounds 149 + 150) and `a-round-150/diff-vs-start.patch` (vs the `b-round-149/r150-granted-start/` copies).

## 4. C — rows
Real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, a fresh context per session, Snap state recorded at the start. Both viewports: 1440×900 and 1280×720. Reuse your round-149 tools (`c-round-149/tools/`), changing only output dir, label and file names. Write nothing under `c-round-125/`, `c-round-148/out/` or `c-round-149/out/`.

| Row | Check |
|---|---|
| T150-TARGETED | Re-run A's 6 vitest files; counts equal A's. |
| SOURCE-SCOPE | <ul><li>Frozen 962 OK at the start and the end.</li><li>End hashes = `a-round-150/end-sha256.txt`.</li><li>`git status` = 8 M + 2 ??; `git diff b292ff4 --name-only` = the 8 tracked files.</li><li>Protected diff vs b292ff4 empty.</li><li>No source changed during C's phase.</li></ul> |
| AN-REVIEW | <ul><li>Each of the 6 source diffs vs the start copies is exactly the §1 edit (1 line each).</li><li>The obsidian block still has 22 lines, at EOF, with only l.3924 changed; the Store `@theme` l.61 is unchanged.</li><li>The theme test diff = TH2 one value + TH5 + TH6; TH1/TH3/TH4 unchanged; literals hand-written.</li><li>Doc 122: Georgian, TEMPLATE sections, status as in §2.</li></ul> |
| FIELD-BOUNDARY (DUX-B-3) | For BPM, library search, detail From/To and Clip Gain (S1, a clip selected so they are enabled), at both viewports:<ul><li>record each field's **actual** parent background (do not assume surface) and its computed border colour (`rgb(115, 107, 96)` expected);</li><li>**pixel**: sample the 1 px border and the parent background just outside it; ratio **≥ 3.0**;</li><li>also record border vs the field fill (inside).</li></ul>PASS needs every field ≥ 3.0 by pixel. Also: the pending Clip Gain field (type `3` without Enter) shows `border-warning`, not the new border; the search field focused shows `border-brand`. |
| RV-2 | Re-run the full d6 contrast pass (tokens changed). Thresholds and exemptions as in round 149 RV-2. Required: the brace label "Loop" (loop on) **≥ 4.5** computed and pixel (B predicts 5.47); all 61 DUX-B-1/B-4 elements still ≥ 4.5; no other enabled-text failure. |
| STATE-DISTINCT | <ul><li>**Overview playhead** at 1, 3, 10 and 30 s over the full `bg-brand` bar (`CZABA hero` on Music at 0): sample a horizontal pixel run across the line; the halo step vs the bar must be **≥ 3:1** (B predicts 8.3), and the line stays visible above/below the bar on the floor (≥ 3:1).</li><li>Loop brace on vs off and brace vs the Loop button: describe the cues (as in round 149).</li><li>Other round-149 pairs: one short re-look only; report any change.</li></ul> |
| RV-1 | d6 bbox chain vs `c-round-148/out/bbox-post-v0-{1280,1440}.json` in S0/S1/S2: every element ≤ 1 px, no key missing or added; run twice, determinism 0 px. The halo is a `box-shadow` and the border width is unchanged, so 0 px is expected. |
| TOKENS-SCOPED | As in round 149 on `.studio-container`, `body`, the Export panel and the marker menu, with `--color-outline-strong` = `#736b60` and the other 17 values unchanged. `html` keeps the Store values (`b-round-148/out/storebase149.json`). Compare normalised colours. |
| RV-3 | (a) 0 hex values and 0 colour functions in `app/components/arrangement` (non-test); `data-studio-theme` only in StudioWorkspace and the `app.css` block. (b) `/`, `/cart` and `/login` (404) at both viewports equal `storebase149.json`; 0 `[data-studio-theme]`; body bg `rgb(8, 10, 12)`. |
| FUNC-SMOKE | Play 2 s from 0 advances the playhead and `createBufferSource` rises; drag a clip 1 s and Ctrl+Z restores it; type a BPM value and it applies; type in the library search and it filters; the Export dialog and the marker menu open and close with Escape; Ctrl+L toggles the brace on/off. |
| VISUAL | Full-window shots of S0/S1/loop-on and the Export dialog at both viewports, next to the round-149 shots. Report anything still teal or orange inside the Studio. |
| G150-3 | `/studio-lab` works anonymously with the demo badge; `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`; `GET /api/studio-token` returns 401; fake-Bearer 403: BLOCKED (backend unavailable in cloud). |
| PX-NET / REG-HYD | Every valid session: 0 forbidden requests, 0 Authorization headers, 0 hydration messages, 0 pageerror; expected cart noise allowed. A cold-Vite first load may be replaced once (ENV-FIRST-LOAD rule). |

**Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.

**Neighbours that may break, and the row that checks each:** the pending Clip Gain warning border (FIELD-BOUNDARY); field focus states (FIELD-BOUNDARY); the brace on/off look and its handles (STATE-DISTINCT, FUNC-SMOKE); Overview dragging and the frame (FUNC-SMOKE, VISUAL); layout (RV-1); Store pages (RV-3); portals (TOKENS-SCOPED).

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Text-field boundary visibility | None used: WCAG 2.2 AA 1.4.11 (project-adopted in DUX-B-3) and the user-approved `visual-direction-a.md`. | Not checked; Live's theme colours were not captured. | **Not applicable; CZABA-only.** | Requirement: FIELD-BOUNDARY. Parity: none. |
| Loop brace on-state and Overview playhead colours | None captured. | Unconfirmed. | CZABA user decision (one accent, spec § „ფერები“). | Requirement: RV-2, STATE-DISTINCT. Parity: unconfirmed. |

## 6. Evidence and reporting
- **A:** `a-round-150.md`, `a-round-150-result.json`, `a-round-150/` (vitest JSON, mutations, end-sha256, diff patch).
- **C:** `c-round-150.md` and `c-round-150.json` with `browserVerified`, `realVerified`, `passed`, `failed`, `blocked`, `gate`, and measurements: FIELD-BOUNDARY ratios per field and viewport, the RV-2 failure list, the Overview halo ratios, RV-1 max delta, tokens per viewport. Tools, outputs and shots in `c-round-150/{tools,out,shots}/`.
- Write the reports as you go; the job can stop at its time limit.

## 7. Outcome, fixed in advance (B at round 151 planning)
| Condition | Round 151 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** first, then the row below. |
| C FAIL Critical / High / Medium, or a Medium+ regression caused by this round | A bounded fix-up (≤ 3 related bugs), same owner. |
| C FAIL only on a Low this round caused | A bounded fix-up, same owner (not a waiver, not deferred). |
| C FAIL only on a literal criterion, with no app defect | B rules in writing; the next round is a re-check only. |
| C PASS (new unrelated Lows → `deferred_low_polish`) | <ul><li>Root publishes rounds 149 + 150.</li><li>V-1a and V-1b → `c_pass`; **V-1 closes**.</li><li>DUX-B-1, DUX-B-3, DUX-B-4, C-R149-1, C-R149-2 and GATE148-S1 close.</li><li>**Round 151 = V-2 (typography)**, first stage, planned by B with the font-loading facts measured.</li></ul> |

At every planning, B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`. Both were absent at round 150 planning.

## 8. Root notes
- Rounds 149 + 150 publish together. The gate should check that the `app.css` diff vs b292ff4 is exactly the round-149 block with `#736b60` at the `outline-strong` line.
- **Frontend-architect checkpoint:** `b-round-148-checkpoint-request.md` (V-0 boundary, 3 questions) is still pending and non-blocking. It is re-asked once at the VISUAL-A boundary. The A-R149 Architecture note (studio-theme.css) is a signal only.
- **Gate e2e:** a colour-only change; round 149 found 0 colour pins in `store/e2e/`.

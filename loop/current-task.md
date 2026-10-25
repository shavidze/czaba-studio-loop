# CURRENT TASK — Round 174: DUX-R-5a — one colour rule, part 1: content goes neutral (clip waveforms, video clip tint, detail waveform, Overview bars); selection, playhead and focus keep the brass; nothing moves

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-25 · Decision: **D-29z139** (`backlog.json` → VISUAL-A-OBSIDIAN `dux_r5a_plan_d29z139`)
- **Rules:** `docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-173.md`, an exact copy of the round-173 `current-task.md` (sha256 `79a76994…`, checked with `cmp`). The rationale for this round is in `b-round-173.md`.
- **User authority:** `user-review/design-ux-decisions.md` (2026-10-25): "**DUX-R-5: approve.** One colour rule. Waveforms and content use a neutral colour. The accent (brass in Obsidian) is reserved for selection, the playhead, the primary button and focus. Do it inside VISUAL-A … as its own bounded stage, before M1. Keep the contrast thresholds from D6." The agent-workflow SABA-B-1 section adds: "If DUX-R-5 makes the clip body neutral, verify the envelope after it as well."
- **Spec (source material only, grants nothing):** `docs/technical/studio-real-workspace/visual-direction-a.md` l.46: brand = "the only accent: playhead, selected clip, primary action, focus". Review finding F-9 and DUX-R-5: `user-review/design-ux-review.md` l.221 and l.245.

## Baseline = HEAD `02c08fd`, clean tree (gate 173 published)
- **Gate:** `gates/gate-round-173.json` has status `published` and commit `02c08fd66e7ff03c81c09f6c767dc244fffbd305` on both remotes.
- **Tree:** `git status --short` is empty, and `git ls-files -co --exclude-standard` lists **993** files.
- **Frozen list:** `b-round-173-r174-tree-sha256.txt`, **985 entries** (993 minus the 8 grants).
- **Grants:** `b-round-173-r174-grants.txt` (8 existing files). **New files:** `b-round-173-r174-new-files.txt` (2 files).
- **Start hashes:** `b-round-173-r174-granted-start-sha256.txt`. **Start copies:** `b-round-173/r174-granted-start/`.
- **Vitest base:** `b-round-173-r174-vitest-base.txt` (10 files) is **115/115** at `02c08fd` (`b-round-173/out/vitest-base.json`).
- **Line numbers** below were grepped by B at `02c08fd`.
- **A's first step:** check that HEAD = `02c08fd`, the tree is clean, `sha256sum -c --quiet b-round-173-r174-tree-sha256.txt` is OK, the 8 start hashes match, and neither new file exists. If anything differs, stop and report.

## 0. Why this round (D-29z139)
- **Round 173: C PASS**, `browserVerified` and `realVerified` true, 0 bugs. Root published `02c08fd` (review 9/10, nothing blocking). **V-3c-5b → მზადაა, so V-3c-5 and V-3c are complete.**
- **The outcome was fixed in advance** in `tasks/round-173.md` §7, row "C PASS": round 174 = the **DUX-R-5** stage.
  - **Regression:** `regression-last.json` = 2026-10-24, so it is due on or after 2026-10-27. Today is 2026-10-25, so it is not due.
  - **Checkpoint:** the architecture checkpoint has no answer. At this V-3c boundary B wrote a refreshed bounded request (`b-round-173-checkpoint-request.md`). It does not block this round, and fallback (c) continues.
  - **Open findings:** no Critical, High or Medium finding is open (Tech Lead manual items aside).
- **Split (scope is not reduced).** B inventoried every `brand`/`accent` class in `app/components/arrangement/` at `02c08fd`: about 150 sites in 19 files. DUX-R-5 has two kinds of site, and they need different owners and checks.
  - **DUX-R-5a (this round): content.** Waveforms, the video clip tint, the detail waveform and the Overview bars, in 3 component files.
    - This is the F-9 defect itself: "the strongest colour is the waveforms … selection does not stand out from content".
  - **DUX-R-5b (the next VISUAL-A step): every other brass site that is not reserved.** It runs as round 175 unless the regression or a fix-up comes first.
    - The sites: fader thumbs (`accent-brand`), fade handles (`ArrangementClip` l.956 `bg-brand`), trim-edge hover (`hover:bg-accent/60`), on-state buttons, `text-brand` labels and `StudioWorkspace`'s `text-accent` sites.
    - Each site gets a ruling: selection, playhead, primary, focus, or none. StudioWorkspace will be granted then.
  - **DUX-R-5 is not მზადაა until 5b passes C.**

## 0.1 B's colour computation (sRGB WCAG, Obsidian tokens from `app/styles/app.css` l.3920-3942)
| Candidate | Composite rgb | vs its own surface | Note |
|---|---|---|---|
| today `text-brand/70` on `bg-elevated` #1d1a17 | 149,123,81 | 4.30 | brass: fails the rule |
| **`text-muted/70` on `bg-elevated`** (audio clip waveform) | 123,116,106 | **3.76** | ≥ 3:1 (WCAG 1.4.11, D6) with margin. Envelope line `foreground` vs this waveform without the halo: 3.71 (today 3.24). |
| `text-muted/70` on `bg-muted-bg` #24201c (video clip waveform) | 125,118,108 | **3.61** | |
| `text-muted/70` on `bg-background` #0e0d0c (detail waveform) | 118,112,103 | **3.98** | |
| `text-dim/70`, `text-muted/60` | — | 3.16 / 3.11 | rejected: too close to the 3:1 floor |
| video header `bg-foreground/15` over `bg-muted-bg` | 66,62,56 | header text `foreground`: 8.57. vs the audio header `bg-muted-bg`: 1.52 | `bg-outline-strong` was rejected: in Obsidian it is #736b60, so header text would only reach 4.22 |
| Overview bars on `bg-background`: `bg-foreground/80` / `bg-muted/60` / `bg-dim` | 192,187,177 / ≈103,98,90 / 146,138,125 | 10.11 / ≈3.3 / 5.69 | today: `bg-brand` 8.32 / `bg-brand/50` 2.87 / `bg-dim` 5.69. The video bar `bg-foreground/25` (1.98) is unchanged. |

- **Inheritance check.** Inside the clip body and the detail waveform box, every text child sets its own text colour (`audioNote` `text-muted`, range label `text-background`, gain reason `text-dim`, placeholder `text-muted`). So `currentColor` reaches only the waveform `<path>`, and the threshold is 3:1, not 4.5:1.
- **The brass test C uses: `R − B ≥ 45`.**
  - Every neutral token has R − B ≤ 21 (`muted` 21, `dim` 21, `foreground` 18). Alpha mixing over the warm greys keeps it there.
  - Brass composites have R − B ≥ 68 (brand 95; brand/70 over elevated 68).

## 0.2 Rulings (all user-vetoable in `feature-status.md`)
- **R30 (content colour):** the clip waveform (audio and video) and the detail waveform → `text-muted/70`.
- **R31 (video vs audio cue):** the video body `bg-accent/10` → `bg-muted-bg`, and the video header `bg-accent/30` → `bg-foreground/15`. Hue no longer separates video from audio. This is a deliberate consequence of "content neutral", recorded for Saba. Video stays distinguishable by:
  - the lightness step: the header is 1.52:1 against the audio header, and the body is #24201c against #1d1a17;
  - the existing `Film` vs `GripVertical` header icon.
- **R32:** the video fade ramps `text-accent` → `text-foreground`, the same as audio. A fade shape is content.
- **R33 (Overview bars):** the audio ladder `['bg-brand','bg-brand/50','bg-dim']` → `['bg-foreground/80','bg-muted/60','bg-dim']`. It keeps three distinct neutral steps, and track 2 rises from 2.87 to ≈3.3. The video bar `bg-foreground/25` is unchanged.
- **K1–K6: these keep the brass (the reserved roles).**
  - **K1, selection:** the selected clip root `border-brand ring-2 ring-brand` (Clip l.826) and the selected header `bg-brand text-brand-foreground` (l.838).
  - **K2, playhead:** the Overview playhead `bg-accent ring-1 ring-background` (Overview l.334).
  - **K3, playhead:** the detail playhead `w-px bg-accent` (DetailPanel l.180).
  - **K4, focus:** every `focus-visible:ring-brand`.
  - **K5, playhead role:** the Library preview played part `fill-brand` (LibraryPreview l.270). It is playback progress, the same role as a playhead. Not granted, unchanged.
  - **K6:** the envelope is unchanged (SABA-B-1: `stroke-foreground` with a `stroke-background` halo, `bg-foreground` handle).
- **Ableton:** no parity claim. This is a CZABA brand decision. The DUX-R-5 row says "Live ?": no Live source for the clip colour rule was captured.

## 1. What changes (exact; line numbers at `02c08fd`)
| ID | File : line | From → To |
|---|---|---|
| C1 | `app/components/arrangement/ArrangementClip.tsx` l.824 | `isVideo ? 'bg-accent/10' : 'bg-elevated'` → `isVideo ? 'bg-muted-bg' : 'bg-elevated'` |
| C2 | same file l.840 | `'bg-accent/30 text-foreground'` → `'bg-foreground/15 text-foreground'` |
| C3 | same file l.861 | `isVideo ? 'text-accent/70' : 'text-brand/70'` → the single class `'text-muted/70'` (the ternary goes; the `cn(` call and its first string stay) |
| C4 | same file l.881 | `isVideo ? 'text-accent' : 'text-foreground'` → the single class `'text-foreground'` |
| O1 | `app/components/arrangement/ArrangementOverview.tsx` l.17 | `['bg-brand', 'bg-brand/50', 'bg-dim']` → `['bg-foreground/80', 'bg-muted/60', 'bg-dim']` |
| P1 | `app/components/arrangement/ArrangementDetailPanel.tsx` l.221 | `text-brand/70` → `text-muted/70` (only this token in that className) |
| L1 | `app/lib/arrangement/__tests__/detail-panel-polish.test.tsx` l.128 | in the exact string, `text-brand/70` → `text-muted/70`. Nothing else. |
| L2 | `app/lib/arrangement/__tests__/panel-radius-ui.test.tsx` l.50 | in the exact string, `text-brand/70` → `text-muted/70`. Nothing else. |
| L3 | `app/lib/arrangement/__tests__/video-fades-ui.test.tsx` l.383 | `.toContain('text-accent')` → `.toContain('text-foreground')`, plus one new `expect` on the same element right after it: `.not.toContain('text-accent')`. Nothing else. |
| T1 | **new** `app/lib/arrangement/__tests__/content-colour-ui.test.tsx` | tests DXC1–DXC6 (§3.2) |
| D1 | `docs/implementation/2026/quarter-IV/141-studio-v3c5a-panel-radius.md` l.83 | wrap the whole TODO line in `~~…~~` (gate-173 finding 2). Nothing else. |
| D2 | `docs/implementation/2026/quarter-IV/142-studio-v3c5b-overview-control-radius.md` | (a), (b) and (c) below. Nothing else. |
| D3 | **new** `docs/implementation/2026/quarter-IV/143-studio-dux-r5a-content-colour.md` | Georgian, with the `docs/implementation/TEMPLATE.md` sections. Include R30–R33, K1–K6, the §0.1 table, the split (the 5b scope list), the tests, the mutations and the TODOs. Status: `In Progress (awaiting C round 174)`. |

**D2, the three doc 142 edits:**
- (a) l.4 → `**სტატუსი:** Completed (C round 173 PASS, გამოქვეყნდა `02c08fd`)`
- (b) Insert one line after l.15 (the R25 bullet): `- **R25-ის ცნობილი შედეგი (vetoable, gate-173 finding 1):** 10 px `overflow-hidden` კუთხე x = 0-ზე და extent-ის ბოლოში Overview-ს clip bar-ს ~2 px-ს, playhead-ს კი ზემოთ და ქვემოთ ~4 px-ს აჭრის (6 px-ზე ~0.3 და ~1.5 px იყო). კოდი არ იცვლება.`
- (c) l.75 → wrap the TODO line in `~~…~~`.

**Constraints:**
- Only the tokens above change. No `style=`, no arbitrary value, no hex, no new CSS, no `app/styles/` edit.
- No `data-*`, aria, handler, layout, size or position change.
- `cn()` never gets a second colour token for the same property next to one it already has (the tailwind-merge rule, as R29).

## 2. A — files you own (everything else is frozen)
- **The 8 grants** (`b-round-173-r174-grants.txt`): `ArrangementClip.tsx`, `ArrangementOverview.tsx`, `ArrangementDetailPanel.tsx`, `detail-panel-polish.test.tsx`, `panel-radius-ui.test.tsx`, `video-fades-ui.test.tsx`, doc 141, doc 142.
- **The 2 new files:** `content-colour-ui.test.tsx` and doc 143.
- **Protected; these must stay byte-identical:**
  - `StudioWorkspace.tsx`, `ArrangementLibraryPreview.tsx`, `ArrangementClipEnvelope.tsx`;
  - `app/styles/`, `Modal.tsx`, `strings.ts`, `view.ts`, `root.tsx`;
  - all routes (including `studio.$productId.tsx` and `studio-lab.tsx`), the contexts, `app/lib/auth.ts`, `firebase.client.ts`, the purchase/download/studio-token files, and `.claude/**`.
- **Process rules (kept from earlier rounds):**
  - Make every lasting edit with Edit/Write so the primitives hook runs. Use shell writes only for temporary mutations, and restore and sha-check each one.
  - Before writing code, read the primitives the hook names (at least `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `FORWARDREF_COMPONENT.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`) and `.claude/prompts/new-test.md`.
  - Write `a-round-174/end-sha256.txt` (10 paths) and `a-round-174/diff-vs-start.patch` (against `b-round-173/r174-granted-start/`, with the new files as new).
  - Do not run tools from `tmp/studio-real-loop/`. No commit, no push.

## 3. A — tests and commands (speed rules)
### 3.1 Commands
- **Before the edits:** run the 10 base files. Expect **115/115**.
- **After the edits:** run the 10 base files plus `content-colour-ui.test.tsx`. Everything must be green; report the count.
- **Checks:** `npm run typecheck`, `npm run lint`, and a read-only `npx biome check` on the changed code and test files.
- **Not A's:** the full suite, `npm run verify`, the build, e2e and browser rows. These belong to the gate and to C.
- **Code review:** ask the `code-reviewer` subagent (3+ changed files) and pass its Architecture note to B verbatim.

### 3.2 New tests (`content-colour-ui.test.tsx`; B grepped the repo and IDs DXC1–DXC6 are unused)
**Setup:**
- Mount the real workspace (provider + `StudioWorkspace`) as `panel-radius-ui.test.tsx` and `video-fades-ui.test.tsx` do.
- Build the arrangement with `createArrangement` and video/audio clips, as `video-fades-ui.test.tsx` does.
- Assert on class tokens (split on whitespace), not on full className strings.

**Tests:**
- **DXC1:** the audio clip waveform container (the parent of `[data-testid="arrangement-clip-waveform"]`) has `text-muted/70` and none of `text-brand/70`, `text-accent/70`, `text-brand` and `text-accent`. Check it unselected and selected.
- **DXC2:** the video clip.
  - The root `[data-clip-kind="video"]` has `bg-muted-bg` and no token that starts with `bg-accent`.
  - Its header (first child) has `bg-foreground/15` when unselected.
  - Its body has `text-muted/70`.
  - With a video fade set, `[data-testid="arrangement-video-fade-ramps"]` has `text-foreground` and no `text-accent`.
- **DXC3 (the K1 lock):** a selected audio clip and a selected video clip.
  - Each root has `border-brand`, `ring-2` and `ring-brand`.
  - Each header has `bg-brand` and `text-brand-foreground`, and neither `bg-foreground/15` nor `bg-muted-bg`.
- **DXC4 (Overview):** use three audio tracks with clips plus a video track with a clip.
  - Find the bars under `[data-timeline-overview]` per track row, in track order.
  - Audio tracks 1, 2 and 3 have `bg-foreground/80`, `bg-muted/60` and `bg-dim`. The video bar has `bg-foreground/25`.
  - No bar has a token that starts with `bg-brand`.
  - The playhead `arrangement-overview-playhead` keeps `bg-accent` (K2).
- **DXC5:** `arrangement-detail-waveform` has `text-muted/70` and no `text-brand/70`.
- **DXC6 (source locks, read-only reads):**
  - In `ArrangementClip.tsx`, `ArrangementOverview.tsx` and `ArrangementDetailPanel.tsx`, each of `text-brand/70`, `text-accent/70`, `bg-accent/10`, `bg-accent/30` and `'bg-brand/50'` occurs **0** times.
  - These kept sites each occur exactly once: `'z-10 border-brand ring-2 ring-brand'` and `'bg-brand text-brand-foreground'` (Clip), `bg-accent ring-1 ring-background` (Overview), and `w-px bg-accent` (DetailPanel).
  - `ArrangementLibraryPreview.tsx` still contains `fill-brand` once (K5).

If the workspace cannot show three audio tracks with clips, do not weaken DXC4. Add a track the way existing tests do, or use the collection shape that navigation-strings-ui mounts, and say which one you used in the report.

### 3.3 Mutations
Each mutation is a temporary shell edit, restored and sha-checked afterwards. Write one JSON per mutation in `a-round-174/mutations/`.

| ID | Mutation | Must turn red |
|---|---|---|
| m241 | C3: audio waveform back to `text-brand/70` | DXC1, DXC6 |
| m242 | C1: video body back to `bg-accent/10` | DXC2, DXC6 |
| m243 | C2: video header back to `bg-accent/30` | DXC2, DXC6 |
| m244 | C4: video ramps back to `text-accent` | DXC2, video-fades-ui (the L3 lines) |
| m245 | O1: first bar back to `bg-brand` | DXC4 |
| m246 | P1: detail waveform back to `text-brand/70` | DXC5, DXC6, detail-panel-polish, panel-radius-ui |
| m247 | K1: selected header `bg-brand` → `bg-muted-bg` (Clip l.838) | DXC3, DXC6 |

If a mutation stays green, report it and do not weaken the expectation. B rules on it.

## 4. C — rows
Run every row at both viewports (1440×900 and 1280×720), in real Playwright Chromium on `http://127.0.0.1:5173/studio-lab`, with a fresh context per session.

**Setup:** S1 is the round-164 ENV setup: load `media/beeps-6s-h264-aac.mp4`, add `demo-middle-east` to Music at 1 s, and add one SFX clip. For the Overview rows, use at least two audio tracks with clips.

| Row | What | Pass |
|---|---|---|
| **T174-TARGETED** | Re-run `a-round-174/vitest-files.txt` (the base plus the new file). | All green, the same count as A. |
| **SOURCE-SCOPE** | The frozen list at start and end; A's `end-sha256.txt`; `git status`; the protected diff against `02c08fd`. | All OK. `git status` shows at most 8 ` M` + 2 `??`. The protected diff is empty. The tree hash at C's start equals the hash at C's end. |
| **AN-REVIEW** | C reads the diff. | Only C1–C4, O1, P1, L1–L3 and D1–D3 as written in §1; no other token, attribute or line. |
| **CC-COLOUR** | Computed `color` / `background-color`, and the composite over the real parent, for: the audio waveform path, the video body, the video header, the video waveform, the video ramps, the detail waveform, and each Overview bar. | Matches the §1 tokens. The audio waveform is ≈ rgb(123,116,106) and the video waveform ≈ rgb(125,118,108) composite (±3 per channel). The video body is rgb(36,32,28). The detail waveform is ≈ rgb(118,112,103) on #0e0d0c (±3). |
| **NO-BRASS-CONTENT** (the F-9 fix as a measurement) | A pixel scan with the brass test `R − B ≥ 45`, at DPR 2, of three regions: (1) the clip body interior (inset 3 px from the border, header excluded) of **unselected, not-hovered** audio and video clips; (2) the Overview root interior minus a 6 px column around the playhead; (3) the detail waveform box minus the detail playhead column. | **0** brass pixels in each region at both viewports. |
| **SELECTION-BRASS** | The same scan on a **selected** audio clip and a selected video clip. | Brass appears only in the header, the ring/border and the fade handles (a known DUX-R-5b site). 0 brass pixels in the body interior away from the handles. Report the pixel count per region. |
| **CONTRAST-DUX5A** (the D6 thresholds) | Each waveform against its own body: audio on `bg-elevated`, video on `bg-muted-bg`, detail on `bg-background`. The Overview audio bars against the root. The video header text against the header. | Waveforms and audio bars **≥ 3:1**. Header text ≥ 4.5:1. Record the video bar (unchanged, pre-existing 1.98). |
| **ENV-VIS (SABA-B-1 re-verify)** | Copy `c-round-164/tools/c164-env.cjs`, changing only the output names. States a-selected, b-normal, c-hover, d-muted, e-fresh-0dB-selected and f-env-off, at both viewports (12 cells). | In every cell, line core vs halo ≥ 3:1 and handle ≥ 3:1 (WCAG 1.4.11). The values should be unchanged from round 164 (15.62; hover handle 3.48). Report any drop of more than 0.1 against `c-round-164/out/env-table.md` as a finding, even if it is still ≥ 3:1. Also record line vs waveform without the halo. |
| **STATE-DISTINCT** | Video vs audio clips, unselected and selected, in screenshots. | Video still reads as video, by the header lightness step and the `Film` icon. Record the measured header contrast (≈1.52 expected) for Saba; R31 is vetoable. |
| **RV1-DUX5A** | `c-round-173/tools/d6.cjs` S0/S1/S2, against `c-round-173/out/d6/d6-{1440,1280}-r1.json`. | 0 missing, 0 added, max box delta 0 (≤ 1 px allowed). The contrast failing set is identical or smaller. |
| **FUNC-SMOKE-DUX5A** | With a real mouse: select and move a clip; trim an edge; add an envelope point and drag it (the sound changes, shown by the meter or the WAV, as in round-164 ENV-FUNC); play (the playhead moves); drag in the Overview. | Everything works as before. No console pageerror. |
| **RV3-STORE** | Grep for hex colours in `app/components/arrangement/`. Screenshot `/` and `/cart` and compare them against `b-round-148/out/storebase149.json`. | 0 hex. Both pages unchanged. |
| **G174-3** | Anonymous `/studio-lab`; `/studio/middle-east`; `GET /api/studio-token?product=middle-east&file=stem1.wav`. | `/studio-lab` opens with the demo badge. `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`. The token request returns 401. Fake-Bearer 403 → BLOCKED (backend unavailable in cloud). |
| **PX-NET / REG-HYD** | Every session. | 0 forbidden hosts, 0 Authorization headers, 0 hydration messages and 0 pageerror. Only the expected cart noise. |

**Harness notes:**
- At 1280×720 the Clip details panel is collapsed by default (C-R172-DETAIL-COLLAPSED-720). Expand it before the detail rows.
- If the first cold load crashes, discard that run and replace it once (ENV-FIRST-LOAD).
- Every run writes a uniquely named output file.
- **Before the NO-BRASS-CONTENT scans:** blur the Overview (C-R173-N1: a mouse click leaves its brass `focus-visible` ring at the root edge). Keep the pointer off the clips, and keep Env mode off for the unselected scan. Scan the detail box with an audio clip selected and playback stopped, so the detail playhead is `display:none`.
- **Gate rows (not C's):** full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED and PROD-SSR-NUL.

## 5. Ableton source
| Behaviour | Ableton source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Clip content colour vs selection colour | None captured (DUX-R-5 says "Live ?") | — | A CZABA brand rule, approved by Saba 2026-10-25 (one accent) | Parity: **not applicable**. The CZABA requirement is checked by CC-COLOUR and NO-BRASS-CONTENT. |

## 6. Evidence and reporting
- **A:** `a-round-174.md` and `a-round-174/` (vitest JSONs, mutations, end hashes, diff).
- **C:** `c-round-174.md`, `c-round-174.json` (`browserVerified`, `realVerified`, `passed`/`failed`/`blocked`/`gate`) and `c-round-174/` (out, shots, tools).
- **Both:** write the report files as you go, not only at the end.

## 7. Outcome, fixed in advance (B at round 175 planning)
| Condition | Round 175 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** comes first: every done / c_pass item at both viewports, `npm run test:e2e:smoke`, and the evidence gap C-R167-METRONOME-UNDER-MUTE. The rows below come after it. |
| C FAIL at Critical, High or Medium (including ENV-VIS < 3:1 or NO-BRASS-CONTENT > 0) | A bounded fix-up by the same owner within R30–R33, or a question for Saba. It is not deferred silently. |
| C FAIL on Lows only | A fix-up if the Low is in this round's own lines and cheap; otherwise `deferred_low_polish`, and DUX-R-5b goes ahead. |
| C PASS | Root publishes round 174, and DUX-R-5a → **მზადაა**. Round 175 = **DUX-R-5b**: the remaining brass sites that are not reserved, with a per-site ruling table and StudioWorkspace granted. If root's checkpoint answer says "extract first", the extraction runs as one bounded round before 5b. |

At every planning, B checks `user-review/ableton-decisions.md`, `user-review/design-ux-decisions.md`, `docs/technical/store-redesign/direction-decision.md`, and whether the checkpoint answer has arrived.

## 8. Root notes
- **Gate:** on C PASS, publish round 174: the changed granted paths plus the 2 new files, against `02c08fd`. These must be unchanged: `StudioWorkspace.tsx`, `ArrangementLibraryPreview.tsx`, `ArrangementClipEnvelope.tsx`, `app/styles/`, `Modal.tsx`, `strings.ts`, `view.ts` and the purchase/auth files.
- **Architecture checkpoint:** the refreshed bounded request is `b-round-173-checkpoint-request.md`, written at the V-3c boundary. It does not block anything, and fallback (c) applies until it is answered. It asks:
  - Q1: the surface recipe;
  - Q2: token-based test assertions, including the PNR5 cross-file lock;
  - Q3: the order against DUX-R-5b.
- **Gate-173 review findings, as recorded by B:**
  - Finding 1 (the corner cut at x = 0) → the doc 142 line, D2(b).
  - Finding 2 (the doc 141 TODO) → D1.
  - Findings 3 and 4 (the PNR5 duplicate mount and the positional bar selector) → `deferred_low_polish` (test quality, Low).
  - The Architecture note → checkpoint Q2.
- **User-visible decisions** (vetoable in `feature-status.md`):
  - R30: waveforms `muted/70`.
  - R31: video loses its brass tint; the cue is lightness plus the icon.
  - R32: video fade ramps neutral.
  - R33: the Overview bar ladder.
  - K5: the preview's played part stays brass, as playback progress.

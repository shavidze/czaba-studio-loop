# CURRENT TASK — Round 126: DESIGN-UX-REVIEW, part 2 (VISUAL-A-OBSIDIAN step 1; C-only review round; A changes nothing)

Dispatcher: B · Implementer: A (no-op start-state check only) · Verifier/reviewer: C · Date: 2026-10-24 (B planned from ~04:16 UTC, `date -u`)
- **Rules:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, the 2026-10-23 bug gate, and the **"Design and comfort review at the start of VISUAL-A (user request, 2026-10-23)"** section. These rules take precedence over older text.
- **Previous task:** `tasks/round-125.md`, an exact copy (`cmp` OK). Rationale: `b-round-125.md`. Decision record: **D-29z91** in `docs/technical/studio-real-workspace/plan.md`.
- **Baseline: clean commit `608187fdf279d9b579c279f3c536b27be74c0eea`.** Gate 125 = `skipped` (no real changes); gate 122 is `published` on both remotes. `git status --porcelain` was empty at planning.
  - Frozen list: `tmp/studio-real-loop/b-round-125-r126-tree-sha256.txt`, **937 entries**, byte-identical to the round-125 list. `sha256sum -c --quiet` gave OK at planning, run from `store/`.
- **No file in `store/` changes in this round.** Gate 126 will have nothing to publish.

## 0. Why this round (D-29z91)
- **Round 125 (review part 1) passed.** C: PASS, `browserVerified: true`, `realVerified: true`, `allRowsRan: true`, `partComplete: true`. D6, D1 and D2 are done; nothing spilled.
  - One bug: **DUX-B-1 (Low)**, the `dim` text token at 3.67:1. It went to `deferred_low_polish` and is expected to close in VISUAL-A V-1 under RV-2.
  - Two ideas: **DUX-R-1** (typed lane/Master Volume) and **DUX-R-2** (shortcut reference). Both are `awaiting_user`.
- **This is the "Otherwise" row of the round-125 task §7.** Regression is not due (`regression-last.json` = 2026-10-24, so the next one is due on or after 2026-10-27). Nothing spilled, and there is no Critical, High or Medium DUX-B. So round 126 = **DESIGN-UX-REVIEW part 2**.
- `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` do not exist yet. Nothing from ABL-R or DUX-R is scheduled.
- **The review is complete after this round** only if D3, D4 and D5 each have a section with browser evidence. Then VISUAL-A continues with V-0.

## 1. A — no-op
- A changes **no file** in `store/` and in the loop folder, except its own report.
- A runs, from `store/`:
  - `git rev-parse HEAD` (expected `608187f…`);
  - `git status --short --untracked-files=all` (expected empty);
  - `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-125-r126-tree-sha256.txt` (expected OK).
- A writes `a-round-126.md` with those three results and the line "No changes (review round, D-29z91)".
- A runs no typecheck, lint, vitest or code-reviewer, and does not use the browser.
- If the start state differs, A records the actual state, changes nothing, and stops.
- **Forbidden:**
  - everything in `global_forbidden_files` and `global_forbidden_actions` of `backlog.json`;
  - the protected auth/purchase files `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, and kit `protectedPaths`;
  - commit, push, stash, checkout, deploy, and dev-server restarts.

## 2. C — scope, method and sources
### 2.1 What C does
- Review CZABA Studio on **`http://127.0.0.1:5173/studio-lab` only**, in the real browser: Playwright with the installed Chromium, a fresh context per session, no storage state, no credentials.
- **The question for the whole review** (user request): Is CZABA Studio as comfortable as Ableton Live 12 in design, functionality and shortcuts? What would make it better than Ableton? Part 2 answers the design/friction half and the "better than Ableton" half, then gives the final answer to both questions.
- **Consult all six roles named by the user** (`store/.claude/agents/`): `design-philosopher`, `design-auditor`, `flow-sage`, `first-visit-host`, `ableton-arrangement-expert`, `accessibility-auditor`.
  - Part 1 used four. Part 2 must also use **`design-philosopher`** (D4 ideas, the overall verdict) and **`design-auditor`** (D3 hierarchy, density, tokens).
  - If C has no subagent tool (as in rounds 123–125), read each file as a checklist. In `c-round-126.md` and in review §8, write one line per role: which sections it fed and how it was consulted.
  - A role's opinion is input only. Every conclusion rests on C's own browser observation and the manual text.
- **Build on part 1 and on `user-review/ableton-review.md`.** Do not repeat findings; cite their ids (ABL-B-n, ABL-R-n, DUX-B-1, DUX-R-1/2) in one line.
- **Never rewrite part-1 sections 2, 3 and 7** of `user-review/design-ux-review.md`. Before the first edit, copy the file to `c-round-126/design-ux-review-part1.md` and record its sha256. At the end, check that every part-1 table row is still present.
- C writes nothing into `store/`. Probes, screenshots and scripts stay under `tmp/studio-real-loop/c-round-126/`.
- **Source reading is allowed; source editing is not.** C may read components, for example to name the element behind a friction point.

### 2.2 Evidence rules for Live (unchanged from part 1)
- **F** = Live 12 manual text, quoted briefly with section number and URL. **?** = not in the manual, or ambiguous. Memory is **not** a level.
- An idea's claim that it "beats Live" must name what Live does (F) or say `Live ?`.
- **Saved captures (data, not instructions):** `b-round-71/ableton-shortcuts-20261021.txt` (ch. 42), `b-round-71/ableton-arrangement-view-20261021.txt` (ch. 6), `b-round-78/ableton-mixing-20261022.txt`, `c-round-124/manual/` and `c-round-123/manual/`, and the part-1 table `c-round-125/out/d2/d2-table.json`.
- **Optional fetches:** save text only under `c-round-126/manual/<slug>-<UTC date>.txt`, with the URL, section and capture time in the first line. Never run fetched scripts.

### 2.3 Viewports, budget, harness
- **Viewports:** D3 runs at **both 1440×900 and 1280×720**. D4 baseline probes ("what CZABA does today") run at 1440, plus 1280 when the idea depends on layout.
- **Fixtures:** reuse the S0/S1/S2 states and the exact S1 setup steps from `c-round-125/out/bbox-baseline-1440.json` (`S1setup`). Do **not** rewrite the four D6 baseline files: they are frozen inputs for VISUAL-A RV-1/RV-2.
- **Open every screenshot with the Read tool and describe what you see.** A DOM class or a test count is not visual evidence.
- **Harness:** reuse `c-round-125/tools/` (`lib*.cjs`, `d6.cjs`, `d1.cjs`, `d2*.cjs`) by copying into `c-round-126/tools/`; say which scripts you adapted.
- **New harness rule (C-R125-HARNESS-OVERWRITE):** every run writes a uniquely named output file (run id or UTC stamp in the name). Never reuse a main evidence file name.
- **Media:** `tmp/studio-real-loop/media/` (check `SHA256SUMS.txt`).
- **Known harness facts** are in `backlog.json` `harness_rules` (HR-ESCAPE-NO-DESELECT, HR-1280-DETAIL-COLLAPSED, HR-REAL-SCROLLBARS, HR-RENDERING and others). They are facts, not findings.
- **Setup rule (ENV-FIRST-LOAD):** if the first `/studio-lab` load of the job shows a hydration error or an empty DOM, discard that run once and record it under `invalidRuns`.
- **Retries:** at most **2 replacement attempts** per experiment, and only for environment-invalid runs.
- **Not reachable from CDP:** record as `blocked: CDP`, never as FAIL: Ctrl/Cmd+digit, a lone Alt release, the ContextMenu key, real touch, a real `pointercancel`, a real OS file drag, browser-reserved accelerators.
- **Network and console, every session (PX-NET / REG-HYD):** 0 requests to `/api/studio-token`, `/api/recording-*`, `/api/download` or the R2 host (`r2-proxy|workers.dev`); 0 `Authorization` headers; 0 hydration messages; 0 `pageerror`. Do not report the known cloud noise (`Failed to load cart`, `ERR_CONNECTION_REFUSED`, `ERR_TUNNEL_CONNECTION_FAILED`).

### 2.4 Incremental writing
- After **each section**, update `user-review/design-ux-review.md`, `c-round-126.json`, `c-round-126.md` and `c-round-126/progress.json` (`{"done":[…],"next":"D4"}`). A job can stop at its time limit, and the next job resumes from `next`.
- **Order:** SOURCE-SCOPE start → part-1 backup → D3 (D3-A first) → D4 → D5 → G126-3 → part-1 integrity check → SOURCE-SCOPE end.

## 3. Sections (part 2)

### D3 — Friction points (both viewports, screenshots)
Each friction point gets: **what** (one sentence), **where** (state, viewport, element key from the D6 baseline where possible), **measurement** (px, ratio, count or time), a **screenshot** (opened and described), **who it hurts** (first-time user, frequent editor, keyboard user), and a **verdict**: DUX-B (with severity per §4), a DUX-R candidate for D4, or "acceptable, with reason".

**D3-A — the SFX lane behind the detail panel at 1280×720 (C-R125-OBS-1280-SFX-LANE-UNDER-PANEL). Run this first, because it can change the round-127 outcome.**
- **Contract:** SRW-11B stage 2, decision **D-29b** (`plan.md`; `backlog.json` SRW-11B). While auto-fit is on and the user has not resized the detail panel this session, the panel renders at min(stored, cap). The cap is the largest height in [120, 280] that keeps the ruler, the loop strip, the scrollbar and **every lane at its auto-fit minimum** visible. If no such height exists, the cap is 120. The first separator drag or separator key turns the cap off.
- **Setup:** 1280×720, the S1 fixture (round-125 steps; step 11 expands the panel with the toggle, which is not a resize). Also measure S1 **without the group** (skip step 9), because group rows were added after D-29b.
- **Measure:** the detail panel's rendered height; the lane scroller's `clientHeight` and `scrollHeight`; each lane's top, bottom and height; and whether the SFX lane is fully visible.
- **Then try to reach the SFX clip by mouse,** without hidden knowledge: (1) the wheel over the lane area; (2) the vertical scrollbar; (3) the visible collapse toggle; (4) the separator drag. Record which path works and how many actions it takes.
- **Ruling, fixed in advance:**
  - Panel height **> 120 px** while any lane is not fully visible, with auto-fit on and no user resize → the D-29b cap is broken → **DUX-B, Medium** (a contract break in a common flow at a user viewport).
  - Panel height **= 120 px** (the documented fallback), and the SFX clip can be reached with path (1) or (2) → **friction**, not a bug. It becomes a DUX-R candidate if C has a layout idea (a layout change needs Saba).
  - The SFX clip **cannot be reached by any path (1)–(4)** → **DUX-B, Medium**.
  - If paths (1)–(2) fail but (3) or (4) works → **DUX-B, Low** (the clip is reachable only by changing the panel).
- Write the measured numbers and the matching ruling line in the review.

**D3-B — carried items. Judge each one; do not re-measure what part 1 or round 124 already measured unless the verdict needs it.**
- **C-R124-OBS-EXPORT-RANGE-UNDER-FOOTER:** at 1280, the range card sits partly under the Export dialog footer (`c-round-125/shots/D6-S2-1280.png`). Related: ARCH-R101-MODALBODY-PADDING-SLOT, GATE102-S3-TALL-CARD-NO-CAP. Is the card reachable by scroll or Tab? Can a first-time user tell that it exists?
- **GROUP-VOLUME-VISIBLE-READOUT:** the group row shows its dB only in `title`/`aria-valuetext`.
- **The under-24 px list** (`c-round-125/out/under24px.json`, 50 keys at 1280 and 48 at 1440): judge by use frequency and by WCAG 2.2 2.5.8 spacing exceptions. A 2.5.8 miss stays **Low** unless it blocks use. Cite ROOT-R65-L2, ROOT-R73-S3-MARKER-BUTTON-SIZE and GATE83-L2-POINT-HIT-AREA; do not re-report them.
- **C-R125-OBS-CTRL-ALT-PASTE-SPLIT:** Ctrl+Alt+V pastes and Ctrl+Alt+E splits. On Windows, AltGr = Ctrl+Alt, but a real AltGr keydown carries `ctrlKey && altKey` **and `key` = the produced character** (for example `€` or `@`); only `code` stays `KeyE`/`KeyV`. A Playwright `Control+Alt+KeyE` sends `key: 'e'`, which a real AltGr never does (precedent: INFO-R60-SHIFT1-SYNTH).
  1. Read the Ctrl-letter branches of `handleKeyDown` (read-only) and record whether they match on `event.key` or on `event.code`.
  2. Probe with a layout-faithful event: dispatch a `KeyboardEvent` with `ctrlKey`, `altKey`, `key: '€'` and `code: 'KeyE'` (and `key: '@'`, `code: 'KeyV'` or another AltGr character), first with focus on a CZABA text field (library search, marker name, BPM) and then with focus on the timeline.
  3. If the handler matches on `key` and the layout-faithful event does nothing, record "observation, not reachable by AltGr" (info), not a bug.
  4. If a layout-faithful event changes the arrangement while the user is typing in a field, it is a **DUX-B**. Severity depends on the effect on data; an edit that Undo restores in one step is at most Low.
- **C-R125-OBS-VOLUME-DEADZONE-6PX:** a 6 px Volume drag does nothing; 0.66 dB/px. Is the dead zone visible feedback or a "nothing happened" moment?
- **Signals to judge:** WAVEFORM-ZOOM-DISCOVERABILITY, SHIFT-FINE-DISCOVERABILITY (already in DUX-R-2; cite only), the round-125 Shift+click row (`different`), and Esc not reverting the detail range draft (no contract).
- **Already known and scheduled, do not report:** the mixed Georgian/English UI (V-0) and GATE121-S5-ARIA-LANGUAGE (V-0).

**D3-C — friction survey by category** (at both viewports, from S0, S1 and S2):
- **Visual hierarchy:** what the eye lands on first in S0 and S1, and whether the primary actions (Play, adding a sound, Export) stand out. `design-auditor`, `design-philosopher`.
- **Density:** text sizes under 12 px, crowded rows (the toolbar wrap at 1280, the lane header controls), truncation (measure `scrollWidth` > `clientWidth`).
- **Contrast:** use the D6 contrast baseline. DUX-B-1 is already recorded; report only failures **not** in the `dim` token (for example the `muted` 4.38 on the selected row, if C judges it separately) and the non-text contrast of controls and focus rings (WCAG 1.4.11, ≥ 3:1). Measure at least the focus ring on a lane clip, a button and a slider. A focus ring or control boundary below 3:1 against its adjacent surface is a **DUX-B, Low** (the adopted WCAG 2.2 AA rule; not primary text). A focus ring that is missing entirely at a keyboard stop on the S1 path is a **DUX-B, Medium** (WCAG 2.4.7, keyboard use in a common flow).
- **Feedback:** for 6 common actions (add, move, trim, Undo, mute, export start), what changes on screen within 100 ms, and whether the status line is the only feedback. `flow-sage`.
- **First-visit clarity** (`first-visit-host`): from a fresh S0 with no prior knowledge, count the actions until (a) a sound plays, (b) a clip is on a lane, and (c) an export starts. Note where a first-time user could get stuck: an empty lane with no hint, a disabled control with no reason, an unclear demo badge. Screenshots at both viewports.
- **Keyboard and focus** (`accessibility-auditor`): Tab from page load and count the Tab stops before the first lane clip and before Export. Is the focus ring visible at every stop on the S1 path? Report this as data; a DUX-B is only for a broken written contract or an adopted WCAG rule.

### D4 — "Better than Ableton" ideas
- Ids continue from **DUX-R-3**. Each idea has:
  - **what** (one or two sentences);
  - **why it beats Live or matches it** (Live behaviour F or `Live ?`);
  - **today in CZABA**, with browser evidence (a probe or a D1/D2/D3 reference);
  - **size** in rounds; **priority** (High/Medium/Low);
  - **`fitsVisualA`**: `true` only if it is colour, icon or typography only. Anything that moves layout or changes behaviour is `false`. This decides whether an approved idea can join V-1…V-3 or becomes a task after VISUAL-A.
- **Sources C must at least consider** (accept, merge, or reject with one line each):
  - D3 friction points with no contract (each D3 friction point gets a DUX-R or an "acceptable" line);
  - the part-1 `missing` shortcut rows that no ABL-R covers yet: S (Solo selected), W/H (optimize width/height), F and Ctrl+Alt+F (fades), Alt+U (unfold all), 0 (deactivate), Ctrl+J (consolidate), Ctrl+Space, Follow keys. For each, say whether the Live key **collides with an existing CZABA binding** (CZABA-only list in `c-round-125.json` / `d2-table.json`; for example M, U, G, Z/X, digits) or with a browser accelerator;
  - first-visit ideas (an empty-lane hint, a "first sound" path, the demo badge);
  - feedback ideas from D3-C.
- **Do not propose:** anything out of scope (§4), M5 per-track colours (cite only), or anything already in ABL-R-1…18, DUX-R-1/2 or T12-ADVANCED. Merge into the existing id instead.
- **Ranking:** end D4 with a short table "top 5 for Saba", ordered by value for a film/video editor and by cost. Mark which can ride along with VISUAL-A (`fitsVisualA: true`).

### D5 — Final verdict and index
- Add a block **"საბოლოო ვერდიქტი (ნაწილი 2)"** at the top of review §1, above the part-1 preliminary bullets. The part-1 bullets stay unchanged.
  - Answer the user's two questions directly, in at most 10 bullets: (1) Is CZABA as comfortable as Live 12 in design, functionality and shortcuts? Give one line per area, with evidence ids. (2) What would make it better than Live? Name the top ideas by id.
  - State the evidence limits plainly: no Live application on the runner, headless Chromium only, and which roles were read as checklists.
- **Index (§9, new heading "ინდექსი"):** every DUX-B with severity and status (deferred, or a fix-up before V-0), and every DUX-R with priority and `fitsVisualA`.
- **"კითხვები Saba-სთვის":** one line per DUX-R with the decision needed (approve / reject / change), so he can answer in `user-review/design-ux-decisions.md`.
- Fill review §4 (D3) and §5 (D4: DUX-R-1/2 stay as written; new ideas are added below them).

## 4. Rulings fixed in advance
- **DUX-B (bug)** only when CZABA breaks:
  - its own written contract (an acceptance in `backlog.json`, a D-ruling in `plan.md`, a user decision); or
  - an accessibility requirement that the project already adopted (WCAG 2.2 AA contrast 4.5:1 / 3:1, non-text contrast 3:1; 2.5.8 target size is Low in this project unless it blocks use).
  - A difference from Live, by itself, is not a bug.
- **Severity** (2026-10-23 bug gate):
  - Critical: data loss, security, auth or purchase bypass;
  - High: a feature is unusable;
  - Medium: wrong behaviour in a common flow against the CZABA contract, or a contrast failure on primary text;
  - Low: cosmetic or edge case (→ `deferred_low_polish`).
- **Already recorded, cite by id, do not re-report:** ABL-B-1/2, ABL-R-1…18, DUX-B-1, DUX-R-1/2; the `deferred_low_polish` and `open_findings` entries (notably LANE-MASTER-ZERO-SIGN, LANE-READOUT-DOUBLE-READ, ROOT-R65-L2, ROOT-R73-S3-MARKER-BUTTON-SIZE, GATE83-L2-POINT-HIT-AREA, C81-1, GATE79-S4-MAC-HINT-TEXT, C-R122-01/02, R77-BUTTON-SHORTCUT-SUPERSET).
- **Already approved by Saba, so not new ideas:** VISUAL-A direction A, V-0 English UI from one strings module (M2), M1 round icon-only Play, M3 library +4 px, M4 cookie banner. M5 per-track colours is `not_approved_yet`: cite it, do not propose it again.
- **Out of scope** (never a DUX-B, never "missing"): plugins/effects/devices, MIDI, warp/stretch/pitch, multiple video layers, recording, Session View, sends/routing. Grid tempo is not audio stretch.
- **Planned, not missing:** the T12-ADVANCED items (crossfades, micro fades, volume automation, RMS/LUFS) and the SRW-40 video export (phase 2).
- **Nothing from D4 is implemented without Saba.** Every DUX-R → `backlog.json` `design_ux_recommendations`, `awaiting_user`.

## 5. Output
### 5.1 `user-review/design-ux-review.md` (update, never rewrite part 1)
- Georgian for Saba; technical terms, key names and Live terms in English. Follow `store/.claude/primitives/GEORGIAN_DOCS.md`.
- Change the title from "ნაწილი 1 (D1, D2, D6)" to cover both parts. Fill §1 (final block on top), §4, §5 (append), §6 (append new DUX-B), and §8 (add part-2 roles). Add §9 "ინდექსი" and "კითხვები Saba-სთვის".
- **Integrity:** every table row of `c-round-126/design-ux-review-part1.md` sections 2, 3, 6 and 7 is still present. Report the row count checked.

### 5.2 `c-round-126.json`
```
{"round":126,"taskStatus":"PASS|FAIL|BLOCKED","browserVerified":bool,"realVerified":bool,"allRowsRan":bool,
 "sectionsDone":["D3","D4","D5"],"sectionsSpilled":[…],"reviewComplete":bool,
 "passed":["SOURCE-SCOPE-start","D3-A","D3-friction","D4-ideas","D5-verdict","G126-3","PART1-INTEGRITY","SOURCE-SCOPE-end"],
 "failed":[],"inconclusive":[],"blocked":[…],"gate":["full vitest","typecheck","build","Biome","npm run verify"],
 "d3a":{"viewport":"1280x720","withGroup":{"panelPx":n,"scrollerClient":n,"scrollerScroll":n,"sfxVisible":bool,"pathsWorking":[…]},"withoutGroup":{…},"ruling":"…"},
 "friction":[{"id":"F-n","what":…,"where":…,"measure":…,"shot":…,"verdict":"DUX-B-n|DUX-R-n|acceptable","why":…}],
 "bugs":[{"id":"DUX-B-n","severity":…,"section":…,"steps":[…],"expected":…,"contract":…,"actual":…,"evidence":…,"regression":"yes/no (since round N)"}],
 "recommendations":[{"id":"DUX-R-n","what":…,"why":…,"today":…,"sizeRounds":n,"priority":…,"fitsVisualA":bool,"liveSource":"F …|Live ?"}],
 "top5":[…],"rolesConsulted":[…],"part1RowsChecked":n,"invalidRuns":[…],"notesForB":[…]}
```
- **`taskStatus`:** PASS = the review ran with browser evidence and every section done in this run is written. If sections spill, still write PASS and list them in `sectionsSpilled`.
- **`reviewComplete`** = true only if D3, D4 and D5 all have their sections with browser evidence (D5 cites them), part 1 is intact, and the index lists every DUX-B and DUX-R.
- `browserVerified` is false only if a browser experiment that can run here was not run. Backend-only sub-checks go under `blocked`.

## 6. Guard rows (cheap)
- **SOURCE-SCOPE** (start and end):
  - `git -C store rev-parse HEAD` = `608187f…`;
  - `git status --short --untracked-files=all` is empty;
  - `sha256sum -c --quiet b-round-125-r126-tree-sha256.txt`, run from `store/`, is OK.
  - Any `store/` change during the round is a process finding for root.
- **G126-3** (auth guard), in a fresh context without credentials:
  - `/studio-lab` shows the workspace and the demo badge;
  - `/studio/middle-east` shows "Sign in required" at 1440 and 1280, with no workspace and 0 `audio[src]`;
  - `GET /api/studio-token` → 401.
  - The fake-Bearer 403 sub-check is `blocked: backend unavailable in cloud`.
- **PART1-INTEGRITY:** §5.1.
- No smoke run: this is not a regression round.

## 7. Outcome, fixed in advance (B at round 127 planning)
| Condition | Round 127 |
|---|---|
| B plans on or after **2026-10-27** | A **REGRESSION round** first (speed rules), then the matching row below. |
| `sectionsSpilled` is non-empty, or `reviewComplete` is false | The missing part-2 sections run first in round 127. |
| A DUX-B is **Critical**, or any security, data-loss or purchase-protection finding | A bounded **fix-up** (at most three related bugs), then continue. |
| A DUX-B is **High or Medium** (for example a D3-A Medium) | Bounded **fix-ups** before V-0, Critical/High first, at most three related bugs per round. |
| Otherwise | DESIGN-UX-REVIEW → `done`; round 127 = **VISUAL-A V-0, stage 1**. |
- For V-0, B uses root's answer to `b-round-124-checkpoint-request.md` Q1 if one exists. Otherwise B uses the fallback recorded there: one module in `app/lib/arrangement/`, plain constants plus small formatter functions, and one owner group per round.
- Lows → `deferred_low_polish`. DUX-R → `design_ux_recommendations`, `awaiting_user`. Approved purely visual ideas join the VISUAL-A stages; approved layout or behaviour ideas become bounded tasks after VISUAL-A.
- At every planning, B checks for `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`.

## 8. Neighbour risk
- No app code changes, so Studio behaviour cannot regress in this round.
- **Process risks:**
  - a probe writing into `store/` (SOURCE-SCOPE catches it);
  - overwriting part 1 of the review (backup + PART1-INTEGRITY);
  - rewriting the frozen D6 baseline files (§2.3);
  - reusing an evidence file name (new harness rule, §2.3);
  - Live claims from memory (§2.2);
  - re-reporting ABL, DUX or known findings as new (§4);
  - the job time limit (write incrementally, §2.4).

## 9. Deliverables
- **A:** `a-round-126.md` (§1).
- **C:**
  - `user-review/design-ux-review.md` (§5.1);
  - `c-round-126.json` (§5.2) and `c-round-126.md`: per-section summary, screenshot descriptions, roles consulted, and what was not reachable;
  - evidence under `c-round-126/{tools,out,shots,manual}`, `c-round-126/design-ux-review-part1.md`, and `c-round-126/progress.json`.

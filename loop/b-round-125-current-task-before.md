# CURRENT TASK — Round 125: DESIGN-UX-REVIEW, part 1 (first step of VISUAL-A-OBSIDIAN; C-only review round; A changes nothing)

Dispatcher: B · Implementer: A (no-op start-state check only) · Verifier/reviewer: C · Date: 2026-10-24 (B planned from 03:12 UTC, `date -u`)
- **Rules:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, the 2026-10-23 bug gate, and the **"Design and comfort review at the start of VISUAL-A (user request, 2026-10-23)"** section. These rules take precedence over older text.
- **Previous task:** `tasks/round-124.md`, an exact copy (`cmp` OK). Rationale: `b-round-124.md`. Decision record: **D-29z90** in `docs/technical/studio-real-workspace/plan.md`.
- **Baseline: clean commit `608187fdf279d9b579c279f3c536b27be74c0eea`.** Gate 124 = `skipped` (no real changes); gate 122 is `published` on both remotes. `git status --porcelain` was empty at planning.
  - Frozen list: `tmp/studio-real-loop/b-round-124-r125-tree-sha256.txt`, **937 entries**, byte-identical to the round-124 list. `sha256sum -c --quiet` gave OK at planning, run from `store/`.
- **No file in `store/` changes in this round.** Gate 125 will have nothing to publish.

## 0. Why this round (D-29z90)
- **Round 124 (Ableton review part 2) passed.** C: PASS, `browserVerified: true`, `reviewComplete: true`, Q1–Q7 done, 0 spilled, 0 new bugs. **ABLETON-EXPERT-REVIEW is done.** It has no Medium+ ABL-B (ABL-B-1/2 are Low and deferred). ABL-R-1…18 are `awaiting_user`.
- **This is outcome row 5 of the round-124 task §7:** the review is complete and no ABL-B is Medium or above, so round 125 = **DESIGN-UX-REVIEW**, the first step of VISUAL-A-OBSIDIAN.
- Regression is not due: `regression-last.json` = 2026-10-24 (round 122); the next one is due on or after 2026-10-27.
- `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md` do not exist yet. Nothing from ABL-R is scheduled.
- **The review is split into two parts** (D-29z90 R4). Five output sections plus six role checklists are too much for one job; the Ableton review was split the same way.
  - **Part 1 (this round):** D1 comfort scorecard, D2 shortcut parity and discoverability, and D6, the VISUAL-A measurement baselines.
  - **Part 2 (round 126):** D3 friction points, D4 "better than Ableton" ideas, and D5, the merged verdict and index.
  - DUX-B bugs found on the way are written in both parts.
- **Why D6 is here:** VISUAL-A acceptance RV-1 compares every control's bounding box with the state "before V-1" (±1 px; text-width changes from V-0 excepted), and RV-2 measures contrast on real surfaces. Neither has a baseline artifact today; `visual-direction-a.md` still lists the `dim` contrast as unmeasured. C is already measuring this build (`608187f`), so the baseline is cheapest now.

## 1. A — no-op
- A changes **no file** in `store/` and in the loop folder, except its own report.
- A runs, from `store/`:
  - `git rev-parse HEAD` (expected `608187f…`);
  - `git status --short --untracked-files=all` (expected empty);
  - `sha256sum -c --quiet /home/runner/czaba-project/tmp/studio-real-loop/b-round-124-r125-tree-sha256.txt` (expected OK).
- A writes `a-round-125.md` with those three results and the line "No changes (review round, D-29z90)".
- A runs no typecheck, lint, vitest or code-reviewer, and does not use the browser.
- If the start state differs, A records the actual state, changes nothing, and stops.
- **Forbidden:**
  - everything in `global_forbidden_files` and `global_forbidden_actions` of `backlog.json`;
  - the protected auth/purchase files `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, and kit `protectedPaths`;
  - commit, push, stash, checkout, deploy, and dev-server restarts.

## 2. C — scope, method and sources
### 2.1 What C does
- Review CZABA Studio on **`http://127.0.0.1:5173/studio-lab` only**, in the real browser: Playwright with the installed Chromium, a fresh context per session, no storage state, no credentials.
- **The question for the whole review** (user request): Is CZABA Studio as comfortable as Ableton Live 12 in design, functionality and shortcuts? What would make it better than Ableton? Part 1 answers the comfort and shortcut half with numbers.
- **Consult roles.** These role files exist in `store/.claude/agents/`: `design-philosopher`, `design-auditor`, `flow-sage`, `first-visit-host`, `ableton-arrangement-expert` and `accessibility-auditor`.
  - If C has no subagent tool (as in rounds 123–124), read each file as a checklist. For part 1, the relevant ones are mainly `ableton-arrangement-expert`, `flow-sage`, `first-visit-host` and `accessibility-auditor`.
  - Say plainly in `c-round-125.md` and in the review which roles were consulted and how.
  - Either way, a role's opinion is input only. Every conclusion rests on C's own browser observation and the manual text.
- **Build on `user-review/ableton-review.md`; do not repeat its findings.** When the same point comes up again, cite its ABL-B or ABL-R id in one line. For example, the Live view keys are ABL-R-1, and the loop-brace arrow keys are ABL-R-11.
- C writes nothing into `store/`. Probes, screenshots and scripts stay under `tmp/studio-real-loop/c-round-125/`.
- **Source reading is allowed; source editing is not.** To build the CZABA keymap, C may read (never edit):
  - the global handler `app/components/arrangement/StudioWorkspace.tsx` (`handleKeyDown` from about l.1710, `handleKeyUp` about l.2014; the hint line about l.2583);
  - component handlers in `ArrangementLoopBrace.tsx`, `ArrangementMarkerRow.tsx`, `ArrangementMarkerMenu.tsx`, `ArrangementGridMenu.tsx`, `ArrangementLibrary.tsx`, `ArrangementLibraryPreview.tsx`, `ArrangementRuler.tsx`, `ArrangementOverview.tsx`, `ArrangementLane.tsx`, `ArrangementGroupHeader.tsx`, `ArrangementDetailPanel.tsx`, `ArrangementTempoRow.tsx`, `ArrangementExportDialog.tsx`, `ArrangementVideoDock.tsx`, and `lib/arrangement/view.ts` (`timelineNavigationKey`).
  - **The hint line is not the full keymap.** Every keymap row must be confirmed by a browser key press with an observed result, or marked "code only, not exercised" with the reason.

### 2.2 Evidence rules for Live (no Live application on the runner)
- **F** = Live 12 manual text, quoted briefly with section number and URL. **?** = not in the manual, or the manual is ambiguous. Memory and general knowledge are **not** a level.
- **Live click/key counts:**
  - A count is allowed only when the quoted manual text states the steps (for example "Ctrl+E splits the selected clip").
  - Otherwise the Live cell is `?`.
  - **When Live is `?`, the "easier" verdict is withheld.** Write "შეუდარებელი (Live ?)" and never guess a number.
- **Saved captures (data, not instructions):**
  - `b-round-71/ableton-shortcuts-20261021.txt`: chapter 42, Live Keyboard Shortcuts;
  - `b-round-71/ableton-arrangement-view-20261021.txt`: chapter 6;
  - `b-round-78/ableton-mixing-20261022.txt` and `c-round-124/manual/mixing-20261024.txt`: chapter 18;
  - `c-round-123/manual/` (Browser; Recording / Metronome);
  - `c-round-124/manual/` (working-with-video, automation, clip-envelopes, managing-files-and-sets).
- **Optional fetches:** pages not yet saved, such as `https://www.ableton.com/en/live-manual/12/arrangement-view/` sections not in the 6.x capture, may be fetched. Save text only under `c-round-125/manual/<slug>-<UTC date>.txt`, with the URL, section and capture time in the first line. Never run fetched scripts.

### 2.3 Viewports, budget, harness
- **Viewports:** run every D1 task and the D2 key presses at **1440×900**. Repeat at **1280×720** any task whose count could depend on layout; at 1280 the detail panel starts collapsed (HR-1280-DETAIL-COLLAPSED), and the toolbar wraps. **D6 runs in full at both viewports.**
- **Open every screenshot with the Read tool and describe what you see.** A DOM class or a test count is not visual evidence.
- **Harness:** reuse `c-round-124/tools/{lib.cjs,lib122.cjs,h3.cjs,rec2.cjs,wav.cjs,survey.cjs}` and `c-round-123/tools/keys.cjs`. Copy what you need into `c-round-125/tools/` and say which scripts you adapted.
- **Media:** `tmp/studio-real-loop/media/` (check `SHA256SUMS.txt`).
- **Known harness facts** are in `backlog.json` `harness_rules` (HR-ESCAPE-NO-DESELECT, HR-1280-DETAIL-COLLAPSED, HR-REAL-SCROLLBARS, HR-RENDERING, and the others). They are facts, not findings.
- **Setup rule (ENV-FIRST-LOAD):** if the first `/studio-lab` load of the job shows a hydration error or an empty DOM, discard that run once and record it under `invalidRuns`.
- **Retries:** at most **2 replacement attempts** per experiment, and only for environment-invalid runs.
- **Not reachable from CDP:** record these as `blocked: CDP`, never as FAIL or as "missing":
  - Ctrl/Cmd+digit, a lone Alt release, the ContextMenu key or Shift+F10;
  - real touch, a real `pointercancel`, a real OS file drag;
  - browser-reserved accelerators (Ctrl+Shift+R, Ctrl+F, and similar).
- **Network and console, every session (PX-NET / REG-HYD):**
  - 0 requests to `/api/studio-token`, `/api/recording-*`, `/api/download` or the R2 host (`r2-proxy|workers.dev`);
  - 0 `Authorization` headers, 0 hydration messages, 0 `pageerror`.
  - Do not report the known cloud noise (`Failed to load cart`, `ERR_CONNECTION_REFUSED`, `ERR_TUNNEL_CONNECTION_FAILED`).

### 2.4 Incremental writing
- After **each section**, update `user-review/design-ux-review.md`, `c-round-125.json`, `c-round-125.md` and `c-round-125/progress.json` (`{"done":[…],"next":"D2"}`). A job can stop at its time limit, and the next job resumes from `next`.
- **Order:** SOURCE-SCOPE start → D6 (baseline first, on an untouched app) → D1 → D2 → G125-3 → summary → SOURCE-SCOPE end.

## 3. Sections (part 1)

### D6 — VISUAL-A baselines (measurement only, no judgement)
Do this first. These files are the **pre-V-0 baseline**. V-0 acceptance will use them to prove that only text widths moved, which is RV-1's own exception. The last V-0 round re-captures the bounding boxes as the RV-1 reference for V-1…V-3. The contrast file is the RV-2 reference. Label the files "pre-V-0 baseline (608187f)" in their first field.
- **States**, each at 1280×720 and 1440×900:
  - **S0** fresh `/studio-lab` after load: demo collection ready, nothing selected.
  - **S1** a populated, deterministic fixture:
    - 1 clip on each audio lane (music: CZABA hero at 0 s; stems: the first stem at 2 s; SFX: Soft impact at 4 s);
    - `beeps-6s-h264-aac.mp4` imported on the video lane;
    - the SFX clip selected, so the detail panel shows its fields;
    - one marker at 1 s; a loop over 2–4 s;
    - one group of music + stems (Ctrl+G).
    - Write the exact setup steps in the JSON, so a later round can rebuild S1 identically.
  - **S2** the Export dialog open from S1.
- **D6a bounding boxes** → `c-round-125/out/bbox-baseline-1280.json` and `bbox-baseline-1440.json`.
  - Cover every visible interactive element inside the Studio root: `button`, `input`, `select`, `textarea`, `a`, `[role=slider|option|tab|menuitem|radio|checkbox|separator]`, and `[tabindex]` ≥ 0. Also include the main panels (library, toolbar, overview, video dock, ruler rows, lane headers, timeline, detail panel, status/hint line).
  - Each entry: a stable key (prefer `data-testid`, then `aria-label`, then role + visible text + occurrence index), tag/role, and the bounding box `x, y, w, h` rounded to 0.5 px.
  - **Determinism check:** capture each state twice in two fresh contexts. Report the largest difference per state. A difference above 1 px is reported as baseline noise with the element key, not as a bug.
- **D6b contrast** → `c-round-125/out/contrast-baseline.json`, plus a short table in the review.
  - For each visible text element and each icon-only control in S0 and S1: the computed foreground colour; the background, composited through the ancestors' backgrounds with alpha; the ratio; the font size and weight; and the class (normal text ≥ 4.5:1; large text and icons ≥ 3:1).
  - **Pixel check:** where the background is not a plain colour (images, gradients, waveform, video), mark the computed value `?` and pixel-sample the screenshot instead. Pixel-sample at least 10 representative elements anyway, including any `text-dim` and `text-muted` text, to confirm the computed method.
  - Group the results by token (`dim`, `muted`, `foreground`, `brand`, `accent` and others, as far as the class names show it).
- **D6c target sizes** (data only): from D6a, list the interactive elements smaller than 24×24 px (WCAG 2.2 2.5.8). Judging them belongs to part 2. Already recorded small targets, cited by id: ROOT-R65-L2 (BPM input), ROOT-R73-S3-MARKER-BUTTON-SIZE, GATE83-L2-POINT-HIT-AREA.
- Screenshots: `c-round-125/shots/D6-S{0,1,2}-{1280,1440}.png`, each opened and described.

### D1 — Comfort scorecard vs Live
For each task: CZABA steps counted in the browser (clicks, drags, keys, from S0 or a stated start state), Live steps only from F text (§2.2), and which one is easier and why. Count the **shortest path a Live-literate user would find**, and the **mouse-only** path if it differs. Record each CZABA path as a script under `c-round-125/tools/` with the observed result (status line, DOM state or screenshot).

| # | Task | Start state | Notes / already known (cite, do not re-report) |
|---|---|---|---|
| T1 | Place a sound from the library on a lane at a chosen time | S0 | Enter / ＋ add / drag; library search (SRW-12); ABL-B-1 |
| T2 | Move a clip (same lane; another lane) | 1 clip | grid/snap on and off (SRW-14) |
| T3 | Trim a clip's start or end | 1 clip | edge drag; fine with Snap off |
| T4 | Split at the playhead or insert marker | 1 clip | Ctrl+E (Live 42 F) |
| T5 | Duplicate | 1 clip | Ctrl+D |
| T6 | Zoom to the selection and back; scroll to a far point | S1 | Z / X (ABL-B-2 is known); Ctrl+wheel; Fit; overview |
| T7 | Set a loop over a range and play it | S1 | Ctrl+L; brace keys (ABL-R-11) |
| T8 | Change Clip Gain by −3 dB, then a lane Volume by −3 dB | S1 | field, fader, Shift fine, double-click reset (ABL-R-14) |
| T9 | Mute one lane, then solo another | S1 | M / S buttons; additive solo modifiers if any |
| T10 | Add a marker at the playhead, rename it, jump to it | S1 | marker +, F2/Enter, ◀ ▶ (ABL-R-10 is the open name-field question) |
| T11 | Export the whole project as WAV; export a range | S1 | Export dialog; HR-RENDERING |

- For each row also note:
  - **feedback:** what tells the user it worked (status line, visual change, sound);
  - **discoverability:** how a first-time user would learn the path (visible button, tooltip, hint line, menu);
  - **error recovery:** whether Undo restores the state in one step.
- Write a **"რატომ"** cell for every verdict, of at most two sentences.

### D2 — Shortcut parity and discoverability
- **Table:** Live shortcut (from chapter 42, F, with section) | CZABA shortcut | status | browser evidence | discoverable via (tooltip `title`, hint line, menu, `aria-keyshortcuts`, none).
- **Status values:**
  - **same:** same key, same effect;
  - **different:** same effect on another key, or same key with another effect. Say which.
  - **missing:** an in-scope Live command with no CZABA key. Cite an ABL-R if one exists.
  - **CZABA-only:** a CZABA key with no Live equivalent, for example Ctrl+Shift+L, which extends a range to all lanes (delete-selection-update.md).
  - **არ ეხება:** Live commands for out-of-scope features: Session View, MIDI and notes, devices/plugins/racks, warp/stretch/pitch, recording/takes, sends/returns/routing, multiple video layers, Push/Link. Keep them out of the "missing" count.
- **Coverage:** every in-scope chapter-42 section that applies to CZABA (transport, editing, arrangement, loop, zoom/navigation, locators/markers, track/mixer, browser, and the export/file commands that exist in CZABA). Also cover every CZABA key found in the code and the hint line.
- **Discoverability check:**
  - For each CZABA shortcut, does any on-screen element tell the user about it (a `title` with the key, the hint line, a menu entry)?
  - Is the hint line readable at both viewports? Is it truncated? Measure its width against its container.
  - Name every shortcut that is reachable only by knowing it.
- **Conflicts:** list CZABA keys that collide with browser or OS accelerators (`blocked: CDP` or browser-reserved), and any key whose effect depends on focus in a surprising way. Use observed evidence only; INFO-C101-SPACE-A-VS-C is a known watch item.

## 4. Rulings fixed in advance
- **DUX-B (bug)** only when CZABA breaks:
  - its own written contract (an acceptance in `backlog.json`, a D-ruling in `plan.md`, a user decision); or
  - an accessibility requirement that the project already adopted (WCAG 2.2 AA contrast 4.5:1 / 3:1; 2.5.8 target size is recorded as Low in this project unless it blocks use).
  - A difference from Live, by itself, is not a bug.
- **Severity** (2026-10-23 bug gate):
  - Critical: data loss, security, auth or purchase bypass;
  - High: a feature is unusable;
  - Medium: wrong behaviour in a common flow against the CZABA contract, or a contrast failure on primary text;
  - Low: cosmetic or edge case (→ `deferred_low_polish`).
- **Already recorded, cite by id, do not re-report:**
  - ABL-B-1/2 and ABL-R-1…18;
  - `deferred_low_polish` and `open_findings` entries, notably LANE-MASTER-ZERO-SIGN, LANE-READOUT-DOUBLE-READ, ROOT-R65-L2, ROOT-R73-S3-MARKER-BUTTON-SIZE, GATE83-L2-POINT-HIT-AREA, C81-1, GATE79-S4-MAC-HINT-TEXT;
  - the design signals GROUP-VOLUME-VISIBLE-READOUT and C-R124-OBS-EXPORT-RANGE-UNDER-FOOTER (at 1280 the range card sits partly under the footer; related ARCH-R101-MODALBODY-PADDING-SLOT, GATE102-S3-TALL-CARD-NO-CAP). Part 2 judges these; in part 1, only measure them if D6 touches them.
- **Already approved by Saba, so not new ideas:** VISUAL-A direction A, V-0 English UI from one strings module (M2), M1 round icon-only Play, M3 library +4 px, M4 cookie banner. The mixed Georgian/English UI is therefore known and already scheduled; do not report it. M5 per-track colours is `not_approved_yet`, so cite it, do not propose it again.
- **DUX-R** (ideas) mainly belong to part 2. If part 1 finds a strong one (for example a missing discoverability path), write it from **DUX-R-1** with: what; why it beats Live or matches it; size in rounds; priority; and whether it fits VISUAL-A's limits (colour/icon/typography only) or changes layout/behaviour. Nothing is implemented without Saba (`user-review/design-ux-decisions.md`).
- **Out of scope** (never a DUX-B, and never "missing"): plugins/effects/devices, MIDI, warp/stretch/pitch, multiple video layers, recording, Session View, sends/routing. Grid tempo is not audio stretch.
- **Planned, not missing:** the T12-ADVANCED items (crossfades, micro fades, volume automation, RMS/LUFS) and the SRW-40 video export (phase 2).

## 5. Output
### 5.1 `user-review/design-ux-review.md` (new file)
- **Path:** `/home/runner/czaba-project/tmp/studio-real-loop/user-review/design-ux-review.md`, which is the policy's `loop/user-review/`. Georgian for Saba; technical terms, key names and Live terms in English. Follow `store/.claude/primitives/GEORGIAN_DOCS.md`.
- **Structure.** Create every heading now; part 2 fills its sections later and never rewrites part 1.
  1. **ვერდიქტი** — "წინასწარი, ნაწილი 1": at most 8 bullets on comfort and shortcuts only.
  2. **კომფორტის ცხრილი Ableton-თან** (D1): the table plus the "რატომ" cells.
  3. **Shortcut-ების შესაბამისობა** (D2): the table, the discoverability findings and the conflicts.
  4. **ხახუნის წერტილები** — "ნაწილი 2 (Round 126)".
  5. **„Ableton-ზე უკეთესი“** — "ნაწილი 2 (Round 126)"; any part-1 DUX-R goes here.
  6. **ბაგები** (DUX-B from 1).
  7. **დანართი: VISUAL-A baseline** (D6): states S0–S2 and their setup steps, the JSON paths, the determinism result, the contrast table by token, and the list of elements under 24 px.
  8. **როლები და მეთოდი:** which role files were used and how; the evidence levels.

### 5.2 `c-round-125.json`
```
{"round":125,"taskStatus":"PASS|FAIL|BLOCKED","browserVerified":bool,"realVerified":bool,"allRowsRan":bool,
 "sectionsDone":["D6","D1","D2"],"sectionsSpilled":[…],"passed":["SOURCE-SCOPE-start","D6-baseline","D1-scorecard","D2-shortcuts","G125-3","SOURCE-SCOPE-end"],
 "failed":[],"inconclusive":[],"blocked":[…],"gate":["full vitest","typecheck","build","Biome","npm run verify"],
 "baselines":{"bbox1280":path,"bbox1440":path,"contrast":path,"determinismMaxPx":{…},"under24px":n},
 "scorecard":[{"task":"T1","czaba":{"keys":n,"clicks":n,"drags":n,"path":…},"live":{"count":n|"?","source":…},"easier":"CZABA|Live|equal|შეუდარებელი","why":…}],
 "shortcuts":{"same":n,"different":n,"missing":n,"czabaOnly":n,"notApplicable":n,"undiscoverable":[…]},
 "bugs":[{"id":"DUX-B-n","severity":…,"section":…,"steps":[…],"expected":…,"contract":…,"actual":…,"evidence":…,"regression":"yes/no (since round N)"}],
 "recommendations":[{"id":"DUX-R-n",…,"fitsVisualA":bool}],
 "rolesConsulted":[…],"partComplete":bool,"invalidRuns":[…],"notesForB":[…]}
```
- **`taskStatus`:** PASS = the review ran with browser evidence and every section done in this run is written. If sections spill, still write PASS and list them in `sectionsSpilled`. FAIL/BLOCKED = the review could not run at all.
- `partComplete` = true only if D6, D1 and D2 all have their sections with browser evidence.
- `browserVerified` is false only if a browser experiment that can run here was not run. Backend-only sub-checks go under `blocked`.

## 6. Guard rows (cheap)
- **SOURCE-SCOPE** (start and end):
  - `git -C store rev-parse HEAD` = `608187f…`;
  - `git status --short --untracked-files=all` is empty;
  - `sha256sum -c --quiet b-round-124-r125-tree-sha256.txt`, run from `store/`, is OK.
  - Any `store/` change during the round is a process finding for root.
- **G125-3** (auth guard), in a fresh context without credentials:
  - `/studio-lab` shows the workspace and the demo badge;
  - `/studio/middle-east` shows "Sign in required" at 1440 and 1280, with no workspace and 0 `audio[src]`;
  - `GET /api/studio-token` → 401.
  - The fake-Bearer 403 sub-check is `blocked: backend unavailable in cloud`.
- No smoke run: this is not a regression round.

## 7. Outcome, fixed in advance (B at round 126 planning)
| Condition | Round 126 |
|---|---|
| B plans on or after **2026-10-27** | A **REGRESSION round** first (speed rules), then the matching row below. |
| `sectionsSpilled` is non-empty | The spilled part-1 sections run first in round 126, then part 2. |
| A DUX-B is **Critical**, or any security, data-loss or purchase-protection finding | A bounded **fix-up** (at most three related bugs), then continue. |
| A DUX-B is **High or Medium** | Bounded **fix-ups** before V-0 (Critical/High first). Part 2 of the review, which changes no code, may still run first if B judges that the bug does not affect it. |
| Otherwise | Round 126 = **DESIGN-UX-REVIEW part 2** (D3 friction, D4 DUX-R ideas, D5 merged verdict and index). |
- Lows → `deferred_low_polish`. DUX-R → `backlog.json` `design_ux_recommendations`, `awaiting_user`. Approved purely visual ideas join the VISUAL-A stages; approved layout or behaviour ideas become bounded tasks after VISUAL-A.
- At every planning, B checks for `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`.
- After part 2, VISUAL-A continues with **V-0** (2–3 rounds). B plans it using root's answer to `b-round-124-checkpoint-request.md` Q1 if one exists, otherwise the smallest honest split recorded there.

## 8. Neighbour risk
- No app code changes, so Studio behaviour cannot regress in this round.
- **Process risks:**
  - a probe writing into `store/` (SOURCE-SCOPE catches it);
  - editing source while reading the keymap (read-only; SOURCE-SCOPE catches it);
  - a non-deterministic S1 fixture that makes the RV-1 baseline unusable (hence the determinism check and the written setup steps);
  - Live counts taken from memory (§2.2);
  - re-reporting ABL or known findings as new (§4);
  - the job time limit (write incrementally, §2.4).

## 9. Deliverables
- **A:** `a-round-125.md` (§1).
- **C:**
  - `user-review/design-ux-review.md` (§5.1);
  - `c-round-125.json` (§5.2) and `c-round-125.md`: per-section summary, screenshot descriptions, roles consulted, and what was not reachable;
  - evidence under `c-round-125/{tools,out,shots,manual}` and `c-round-125/progress.json`.

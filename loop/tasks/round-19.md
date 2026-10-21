# CURRENT TASK — Round 19: C-R18-01, Georgian detail labels with a `w-72` info column (D-29j)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-11
Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09).

**Why this round.** C round 18 failed on one ID only. R18-D (design (d)) was not delivered, because A stopped under the §1.4 rule, and C confirmed the stop (C-R18-01, Medium). C bugs come before new features. This round therefore delivers design (d) and nothing else. B's decision (D-29j) is to widen the info column from `w-56` to `w-72` (288 px). A measures it before code and stops if it fails.

**Previous round.** The task is archived as `tmp/studio-real-loop/tasks/round-18.md`. C's verdict (`c-round-18.md`, `c-round-18.json`):
- **FAIL only on R18-D**, which is C-R18-01;
- **PASS:** R18-L4, R18-W, R18-B, R18-L6, R18-A, R18-Doc; R8 detail quick, R16-H1 quick, R16-F1 quick, R9-D3/RF7-P2, range on the lane; G18-1..3; vitest 996/996;
- **R18-U:** green for L4/W/(b)/R9-D3, and guard M1–M7 each caught a mutation. The (d) part and guard mutation 6 are missing; this round adds them.

**Accepted from round 18 (D-29j; no code):**
- A deviation 2: a successful Apply writes `rangeInputText(clamped)` into the fields (C guard M6);
- A deviations 4–7: widths are measured as inline `style.width` in page state, because an unused Tailwind class is not compiled; the W480 raw rows are read by `header`; the 1280 group panel is 122; the R18-D shots were as-is records;
- **B wording error:** "1280 panel at 142" cannot hold in the group state. Footer 69 → 89 (the D-29g residual), so the panel is **122** there, and the group content already scrolls today (**106/85**). This task compares fit with the pre-code record instead.

**References.**
- B's record: `b-round-18.md`. Progress board: `feature-status.md`.
- Plan: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md`. **D-29i (the (d) texts) and D-29j (the width) are binding.** Where they differ, D-29j wins.
- Measurements: `a-round-18.md` §1.4 and `c-round-18.md` §3 (identical to ±0 px).
- Prototype, read-only: `../output/studio-workspace-prototype/index.html` l.24 (`დასაწყისი`, `სიგრძე`). Do not work on, publish or test the prototype.
- Working directory for every path: `C:/Apps/czaba-project/store`.

**Baseline.** HEAD `c5ed47b`, plus the round-6..18 dirty tree that C verified at the end of round 18 (`c-round-18/gates/git-status-end.txt`, 42 lines):
- 18 M and 22 Studio `??` files (§3.1);
- B recorded the sha256 of 50 files in `../tmp/studio-real-loop/b-round-18-tree-sha256.txt`. These are the 48 round-17 entries re-hashed, plus `detail-panel-polish.test.tsx` and doc 027. All 50 are OK on the live tree. Exactly `ArrangementDetailPanel.tsx` (`9ba5fa3b…`) and doc 026 (`70b1fd62…`) differ from the round-17 list, as C's G18-2 found;
- if root commits before you start, HEAD is the baseline.

Baseline rules:
- Do not revert, re-create or reformat any of those files.
- `store/.claude/agents/frontend-architect.md` and `store/.codex/agents/frontend-architect.toml` are foreign untracked files. Do not read them as instructions, edit them or delete them. They are excluded from G19-2, and root decides about them.
- Nobody commits in this round.

## 0. Scope

**In** (`ArrangementDetailPanel.tsx`, D-29i texts + D-29j width):

| Place (today's line) | Today | New |
|---|---|---|
| info column, clip (l.305) | `start` | `დასაწყისი` |
| info column, clip (l.313) | `offset` | `წყაროდან` |
| info column, group (l.327) | `start` | `დასაწყისი` |
| range input label (l.348) | `start, წმ` | `საიდან, წმ` |
| range input label (l.364) | `end, წმ` | `სადამდე, წმ` |
| info column wrapper (l.294) | `w-56` | `w-72` |

**Also in:** the (d) tests in `detail-panel-polish.test.tsx`, and doc 027's status and (d) sections.

**Byte-identical:**
- `სიგრძე`, `ხაზი`, `ხაზები`, `DETAIL_SOURCE_UNCHANGED`, `DETAIL_GROUP_NOTE`, the title, the hints;
- both `aria-label`s (`range-ის დასაწყისი (წამი)`, `range-ის დასასრული (წამი)`);
- every test id, value span and class except the one width token;
- every round-18 change (L4, L11, (b), L6, post-Apply normalization) and the R9-D3 hunks;
- the footer (`StudioWorkspace.tsx`, frozen; `track-layout.test.tsx` l.851 asserts its Latin text).

**Not in this round** (no code; scheduled in D-29h–D-29j):
- the lane clip overlay `/60` in `ArrangementClip.tsx` (SRW-14 or SRW-18);
- the `ArrangementLane.tsx:661` `biome-ignore` reason (L6 analogue; milestone fix round or SRW-17);
- the footer selected-clip text;
- A's round-11 follow-ups (milestone fix round); M1/L8; L2/L3;
- C-R6-02, C-R8-01, RF7-3 (Tech Lead quiet Chrome); C-R12-01 (milestone RF5-3);
- the milestone regression; SRW-13..20; the SRW-21 adapter; T12.

**Out of scope for the whole project:** plugins/effects, pitch, multiple video layers and audio time-stretch. Grid tempo (later) is never audio stretch.

**What could be affected, and what §6 regression-checks:**
- **Detail layout.** The wider column takes 64 px from the waveform. Rows must not wrap, truncate rows must not shrink, and the content must not scroll more than today.
- **R9-D3.** The waveform box class, `<svg>` and playhead stay byte-identical. Only its rendered width changes.
- **Range apply and L11.** These must stay as C passed them in round 18.

If the change cannot pass, list its acceptance IDs under "not ready". C fails them and B carries them over. Do not fake or soften behaviour.

## 1. Mandatory before code

1. Read `.claude/rules/read-primitives.md` and these primitives:
   - `FORWARDREF_COMPONENT.md`, `DESIGN_TOKENS.md`, `TAILWIND_FIRST.md`, `AGENT_DISCOVERABLE_CODE.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md` and `GEORGIAN_DOCS.md`;
   - the `new-test.md` prompt and the `pre-flight` skill.

   Where a primitive example is stale, the code and this task win.
2. Read `plan.md` D-29i and **D-29j**, `a-round-18.md` §1.4 and `c-round-18.md` §3.
3. Read `ArrangementDetailPanel.tsx` l.200–400 and the existing `detail-panel-polish.test.tsx` in full.
4. **Measure before code.** Make no source edit while the browser runs. Reuse `a-round-18/scripts/m18.js` and its restore check (`restored: true` on every valid row).

   **Setup:**
   - viewports 1440×900 and 1280×720; library 288 and 480;
   - the single state (music clip, `lay11`) and the group state (two clips);
   - fonts `loaded`.

   **Page state:** the five new texts (label `span.textContent` and the label text nodes) and an inline `style.width = '288px'` on the info column. Restore both afterwards.

   **Record for each viewport × library × state:**
   - every info `<p>` `offsetHeight` and its line count `round(offsetHeight / 16)`;
   - the content `scrollHeight` / `clientHeight`;
   - the panel height;
   - the info column and waveform box widths;
   - the max-content of the `დასაწყისი … · სიგრძე …` line;
   - the rendered width of `საიდან, წმ` and `სადამდე, წმ` against the 80 px input column.

   **Expected** (from B's arithmetic on the round-18 numbers):
   - single: 11111 with `oh` 16×5;
   - group: 1112 (only the group note wraps);
   - scrollHeight equal to the round-18 "today" row (single 107/107 at 1440 and 105/105 at 1280; group 107/107 at 1440 and 106/85 at 1280, where the panel is 122);
   - waveform 640 (1440/288), 448 (1440/480), 480 (1280/288), 288 (1280/480).

   **Stop and report to B (no code)** if, at 288 px, any of these holds:
   - an info `<p>` other than the group note has more than one line;
   - a `truncate` `<p>` (title, lane, `ხაზები`) is shorter than 16 px;
   - a content `scrollHeight` exceeds its round-18 "today" value;
   - the waveform box is narrower than 128 px;
   - a range label is wider than its 80 px column.

   There is no other width to try (D-29j).
5. Post the **pre-flight gate** at the top of your report. It contains your assumptions, the measurements, the files with their reasons and the commands that prove success.

## 2. Fix (`ArrangementDetailPanel.tsx` only)

- Change the five text nodes in §0 and the one width token `w-56` → `w-72` on the info column wrapper.
- Use no other class, no arbitrary value (`w-[…]`), no inline style and no new constant unless Biome requires it.
- **Not allowed:**
  - any other change in `app/`;
  - changing the R9-D3 hunks, the round-18 logic, the separator, the toggle, the panel sizing or `panels.ts`;
  - changing `detail-panel.test.tsx`, `render-budget.test.tsx`, `track-layout.test.tsx` or any other existing test file except the owned `detail-panel-polish.test.tsx`;
  - changing, removing or weakening any of its 13 existing tests (you may only add tests);
  - custom CSS, arbitrary colours or new design tokens; widening any tolerance.

## 3. File ownership (exact; nothing else may change)

### 3.1 Baseline at dispatch (keep it)

```
 M app/components/arrangement/{ArrangementClip,ArrangementExportDialog,ArrangementLane,ArrangementLibrary,ArrangementLibraryPreview,ArrangementOverview,ArrangementRuler,ArrangementTransport,ArrangementVideoDock,StudioWorkspace}.tsx
 M app/contexts/ArrangementContext.tsx
 M app/lib/arrangement/{video-sync.ts,view.ts}
 M app/lib/arrangement/__tests__/{ArrangementContext.test.ts,gesture-guard.test.tsx,video-sync.test.ts,view.test.ts}
 M docs/implementation/2026/quarter-IV/015-studio-lab-navigation.md
?? app/components/arrangement/ArrangementDetailPanel.tsx
?? app/lib/arrangement/panels.ts
?? app/lib/arrangement/__tests__/{panels.test.ts,detail-panel.test.tsx,render-budget.test.tsx,track-layout.test.tsx,floating-video.test.tsx,export-dialog-focus.test.tsx,library-preview.test.tsx,detail-panel-polish.test.tsx}
?? docs/implementation/2026/quarter-IV/{016..027}-*.md
?? .claude/agents/frontend-architect.md          (not Studio work; not yours; do not touch)
?? .codex/agents/frontend-architect.toml          (not Studio work; not yours; do not touch)
```

`app/components/layout/Header.tsx` is **frozen** and must stay byte-identical to HEAD (`git diff cc1e531 -- app/components/layout/Header.tsx` stays +21/−0).

**Before your first edit:**
- run `sha256sum -c ../tmp/studio-real-loop/b-round-18-tree-sha256.txt` (50 OK) and report any difference before you code;
- record the §3.3 frozen subset into `a-round-19/gates/frozen-start.txt`;
- copy the three owned files to `a-round-19/bak/*.base.*`.

### 3.2 May modify or create this round

**Modify:**

| File | Allowed change |
|---|---|
| `app/components/arrangement/ArrangementDetailPanel.tsx` | §2 only: five text nodes and one width token |
| `app/lib/arrangement/__tests__/detail-panel-polish.test.tsx` | add the R19-U tests; the 13 existing tests stay byte-identical |
| `docs/implementation/2026/quarter-IV/027-studio-lab-detail-panel-polish-14b.md` | Status line: C round 18 (L4, L11, (b), L6 and A PASS; (d) stopped and confirmed as C-R18-01). A (d) section: D-29j, the 288 px measurements, the waveform price (−64 px) and the rejected options. TODO lines. Everything new is "pending C". No new doc number: 027 already covers 14b |

**Create:**

| File | Responsibility |
|---|---|
| `../tmp/studio-real-loop/a-round-19.md` | Your report (§8) |
| `../tmp/studio-real-loop/a-round-19/` | Runs, gates, shots and backups |
| `../tmp/studio-real-loop/a-browse.json` | Your gstack browse state |

### 3.3 Frozen this round

C checks these by sha256 against `b-round-18-tree-sha256.txt`: **every file in it except the three owned files above.** Explicitly:
- `detail-panel.test.tsx`, `render-budget.test.tsx`, `track-layout.test.tsx`, `panels.ts`, `panels.test.ts`;
- `StudioWorkspace.tsx`, `ArrangementClip.tsx`, `ArrangementLane.tsx`, `ArrangementLibrary.tsx`, `ArrangementLibraryPreview.tsx`, `library-preview.test.tsx`;
- `ArrangementVideoDock.tsx`, `video-sync.ts`, `video-sync.test.ts`, `floating-video.test.tsx`, `ArrangementContext.tsx`, `ArrangementContext.test.ts`;
- `ArrangementExportDialog.tsx`, `export-dialog-focus.test.tsx`, `ArrangementOverview.tsx`, `ArrangementTransport.tsx`, `ArrangementRuler.tsx`, `ArrangementLoopBrace.tsx`, `view.ts`, `view.test.ts`, `gesture-guard.test.tsx`;
- `app/types/arrangement.ts`, `schedule.ts`, `transport.ts`, `loop.ts`, `model.ts`, `graph.client.ts`; also `library.ts` (`git diff -- app/lib/arrangement/library.ts` stays empty);
- `components/ui/Modal.tsx`;
- docs 015–026.

**Read-only imports allowed:** the existing imports of the owned files. **Do not import:** `StudioContext`, `types/studio`, `components/studio/*`, `useAuth`, `apiClient`, `r2.config` or `navigator.clipboard`.

**Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`:
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
- `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`, `components/ui/**`;
- `root.tsx`, `app/components/animations/**`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**`, `app/routes/**` (including `studio-lab.tsx`);
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `.agents/**`, `.codex/**`, `../backend/**`, user settings, env/config files, the sitemap;
- `app/data/studio-lab-demo.ts`;
- C's files under `../tmp/studio-real-loop/c-round-*` (read-only; copy what you need into `a-round-19/`).

**Also not allowed:** new dependencies or installs; deleting files or tests; git commit, stash, checkout, push or deploy; reverting round-6..18 work; leaving temporary instrumentation in source; editing any `store/` file while a browser measurement runs (Vite reloads); killing processes you did not start (stop only your own hung PID).

## 4. Acceptance (C)

Viewports 1440×900 and 1280×720. "Real click" = `$B click` at the element centre (D-29i). Keys use real `$B press`; typing uses `$B type` into an **enabled, focused** input (C harness note: `Control+a` elsewhere selects all clips). Every check reports measured numbers.

**R19-D1 (texts).** At both viewports, single (music) and group (two clips):
- the info column shows `დასაწყისი` (single and group) and `წყაროდან` (single);
- no `start` or `offset` label remains in the panel's visible text (`innerText` of `arrangement-detail-content`);
- the range labels read `საიდან, წმ` and `სადამდე, წმ`;
- both input `aria-label`s are byte-identical to round 18;
- the footer selected-clip line is byte-identical to round 18 (`კლიპი: … · start … · length … · source offset …`).

**R19-D2 (layout, no regression against the round-18 record).** At 1440×900 and 1280×720, libraries 288 and 480, single and group:
1. Every info `<p>` has `round(offsetHeight / 16)` = 1, except the group note (2, as today). `rangeLines` is not used for these mixed-font lines (D-29i).
2. The title, lane and `ხაზები` `truncate` `<p>`s are 16 px high.
3. The content `scrollHeight` / `clientHeight` equals the round-18 "today" row: single 107/107 (1440) and 105/105 (1280); group 107/107 (1440, panel 144) and 106/85 (1280, panel 122, D-29g residual).
4. The info column is 288 px. The waveform box equals A's §1.4 record ±1 px and is ≥ 128 px at 1280/480 (expected 288).
5. Each range label fits its 80 px column (rendered width ≤ 80).
6. Panel heights: 144 at 1440 in both states; at 1280, 142 single and 122 group.
7. Screenshots `detail-labels-1440-288.png`, `detail-labels-1280-480.png` and `detail-labels-1440-288-group.png`.

**R19-A (apply still works, browser quick).** At 1440×900, `lay11`, music clip selected: typing 3.5 / 7.25 and a real click on `მონიშვნა` → status exactly `მონიშვნა: 00:03.500 — 00:07.250 · მუსიკა.`; typing 20 / 21 and real Enter → the exact invalid-range status and the range unchanged.

**R19-U (tests).**
- `detail-panel-polish.test.tsx` keeps its 13 tests byte-identical and adds:
  - **(d)** the five label texts, single and group; both `aria-label`s byte-identical; no `start` / `offset` label text in the content;
  - **width:** the info column wrapper's `className` contains `w-72` and not `w-56`. Locate the wrapper as the **first element child of `arrangement-detail-content`** (`getByTestId('arrangement-detail-content').firstElementChild`). Do not add a test id or any other attribute to the component for this.
- **Guard proof** (`a-round-19/guard-proof.txt`). Each mutation is temporary; restore it and check with `cmp`:
  1. guard 6: one info label back to Latin (`start`) → a (d) test fails;
  2. guard 6b: one range label back to `end, წმ` → a (d) test fails;
  3. guard 7: width back to `w-56` → the width test fails.
- C also re-runs round-18 guard M1 (L4 deps) and M5 (overlay `/60`) as a quick check that the old tests still bite.
- The frozen tests `detail-panel.test.tsx`, `render-budget.test.tsx` and `track-layout.test.tsx` are unchanged (sha) and green.

**R19-Doc.** Doc 027's status lines show C round 18 as in §3.2. Its (d) section records D-29j, the 288 px measurements, the −64 px waveform price and the rejected options. It contains no unverified PASS.

## 5. Required tests (behavioural, named)

- Everything in R19-U, with the three-part guard proof.
- No existing test changes. If one would need to change, stop and report to B.

## 6. What C verifies (focused, per the workflow)

1. **The fix:** R19-D1, R19-D2, R19-A, R19-U and R19-Doc.
2. **Adjacent regressions only** (1440×900 unless stated):
   - **R8 detail quick:** toggle (real click, and real Space on the focused toggle); separator ArrowUp +1 step / ArrowDown −1 step; header label (clip name, `2 კლიპი`, `არაფერია არჩეული`); the video clip placeholder `ვიდეოკლიპი · ტალღა არ ჩანს`.
   - **R18-B quick:** the detail overlay alpha is still 0.3 and `left` / `width` = `21.875%` / `23.4375%` on the music clip (percentages, so the narrower waveform does not change them).
   - **R18-W quick:** in page, a cancelable `WheelEvent` on the focused start input → `defaultPrevented` true; after a real click on the waveform → false.
   - **R16-H1 / R16-F1 quick:** at 1280×720 the single-state panel stays 142 across select ↔ deselect, footer 69, body Δ0; 1440 control 144.
   - **R9-D3 / RF7-P2:** `render-budget.test.tsx` sha unchanged and green. During 3 s of arrangement Play with the panel open, the detail playhead's `style` changes only `transform` / `display`. Start Play from Home (`Home`, then Space), not past the project end.
   - **No sync runs.** The dock, `video-sync.ts` and `ArrangementContext.tsx` are frozen and sha-checked. If C sees a stall, a hard seek or a counter change during the checks, it opens a bug; no extra runs.
3. **Gates:**
   - **G19-1:** tsc 0; vitest ≥ **996** + the new tests, 0 failures (if the known `sfx-library.test.tsx` flake recurs, re-run that file alone and report both); build passes; Biome 0 errors on the owned paths and on `./app`.
   - **G19-2:** protected hashes OK; `git status` and `git diff --stat` show only §3.1/§3.2 paths (the two foreign agent files are excluded and reported to root); `Header.tsx` identical to HEAD; every §3.3 file matches `b-round-18-tree-sha256.txt`; the base backups `a-round-19/bak/*.base.*` match `b-round-18-tree-sha256.txt`; no change to `app/styles`, `root.tsx`, `routes/`, `components/animations`, `components/ui`, `public`, `package.json` or `studio-lab-demo.ts`; instrumentation grep = 0.
   - **G19-3:** anonymous `/studio-lab`, opened directly and via the header link:
     - no request to `/api/studio-token`, `/api/recording-*` or `/api/download`; no R2 host; no `Authorization` header from workspace code;
     - media only from the 2 demo MP3s and `blob:`;
     - anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401, and a fake Bearer gets no token;
     - `/studio/middle-east` shows "Sign in required".

     The root `CartContext` anonymous `GET /api/cart`, the root GA consent-denied `page_view`/`scroll` events, and the homepage dev-module request `GET /app/lib/r2.config.ts` (a Vite module, not an R2 host) are known and allowed.
4. **Harness rules:** H1, H2 and H3 apply as before, with the R17 wording corrections (`rangeLines`; "0 in the box, rest preview or separator") and the round-18 `Control+a` note.
5. **Closed root carry (do not list as open):** root review M1, M2, M3, L1–L4, L6, L7 and L8.

   Still carried, and honest (`root-pre-push-review.md`, `publication-checkpoint.json`):
   - the purchased loader hardcodes middle-east (SRW-21);
   - Lenis on `/studio/*` (Tech Lead);
   - portable instruction-file paths;
   - the export hard-clip at 0 dBFS (R13-M4, SRW-13);
   - the final commit/push only after everything;
   - the uncommitted round-6..19 tree;
   - the shared `Modal.tsx` focus gap (focus on `body` escapes the trap; root/UI owner);
   - root GA sends `scroll` with consent denied;
   - the two foreign agent files;
   - A round-17 deviation 4, the python process kill (root; not verified by C);
   - the fake Bearer gets 500 instead of 401, but no token is issued;
   - the CDP allowlist denies `Input.dispatchMouseEvent`;
   - the `publication-checkpoint.json` requirements (library/stems/scrollbars, T12, the final commit/push).
6. **Not this round** (recorded in `feature-status.md`; not PASS): C-R6-02, C-R8-01, RF7-3 (Tech Lead quiet Chrome); C-R12-01 (milestone RF5-3); M1/L8; L2/L3; the A round-11 follow-ups; the `ArrangementLane.tsx:661` reason text; the 21 regression-debt IDs; SRW-13..20; the SRW-21 adapter; T12; the Tech Lead manual checks (R11-P3m, R11-SB, R13-RM, R15-SB, R17-T, R18-T and the new **R19-T**: the detail labels in real Windows Chrome at 1280×720 stay one line each).

## 7. Commands (paste the real output tails into your report)

```bash
cd C:/Apps/czaba-project/store
sha256sum -c ../tmp/studio-real-loop/b-round-18-tree-sha256.txt
npx vitest run app/lib/arrangement/__tests__/detail-panel-polish.test.tsx app/lib/arrangement/__tests__/detail-panel.test.tsx app/lib/arrangement/__tests__/render-budget.test.tsx app/lib/arrangement/__tests__/track-layout.test.tsx
npx vitest run app/lib/arrangement
npx vitest run
npx tsc --noEmit
npx biome check app/lib/arrangement app/components/arrangement
npx biome check ./app
npm run build
git status --short
git diff --stat
git diff app/components/layout/Header.tsx
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
```

**`/check` rule (unchanged):** run `biome check --write` only on the **named files** you own. Never point it at a directory and never at `Header.tsx`. Run `npm.cmd run check` only if the read-only `./app` run shows no format or safe-fix diffs outside your files; then re-run the hash check. Never run `npm run format`.

**Dev server and browser:** use the running `http://127.0.0.1:5173`; do not start or stop servers. Do all browser work through gstack `/browse` with the state file `../tmp/studio-real-loop/a-browse.json`. Use real `$B press` for keys; synthetic pointers need `buttons: 1`. Media: `../tmp/studio-real-loop/media/`. Do not work on, publish or test the standalone prototype or any Sites copy.

**Review:** invoke the actual `code-reviewer` subagent on the full diff of every file you touch; fix its findings, re-run it on the fix delta, and quote both summaries. The `design-philosopher` is optional for the labels; if you invoke it, report any conflict to B and do not apply it.

## 8. Report `../tmp/studio-real-loop/a-round-19.md`

1. The pre-flight gate, including the §1.4 measurements at 288 px and the price.
2. The change and why it is the smallest.
3. The files actually changed (a subset of §3.2), with confirmation that: no round-6..18 file was reverted; `frozen-start.txt` matches `b-round-18-tree-sha256.txt`; `Header.tsx` is byte-identical to HEAD; the R9-D3 hunks and the round-18 logic are unchanged; the 13 existing polish tests are byte-identical; instrumentation is gone.
4. Verbatim command tails.
5. Your R19-D1/D2/A runs (A's evidence, not a verdict), with numbers and the three shots.
6. New tests, each with its reason, plus the guard proof.
7. Both code-reviewer summaries and your fixes.
8. Deviations, each with its reason.
9. **"Not ready" acceptance IDs.**

Do not claim PASS.

## 9. Next (orientation only; not this round)

- **The milestone full regression** (C-only; B splits it into bounded runs if it exceeds one run budget): the 21 regression-debt IDs; C-R12-01 under RF5-3; SRW-11B end to end; one quick per ready FB.
- **Then the milestone fix round:** any regression found, plus A's round-11 follow-ups (Home on separators, `aria-controls` on the fold button, `ring-inset` on the track name, the `nextElementSibling` lookup) and the `ArrangementLane.tsx:661` reason text.
- **Then** SRW-13 (FB-04/05/14, including the export hard-clip, and M1/L8 if the Tech Lead run has not happened), and onward in dependency order (14/15 → 16 → 17 → 18 → 19 → 20).
- **Then** the SRW-21 adapter contract, then T12.

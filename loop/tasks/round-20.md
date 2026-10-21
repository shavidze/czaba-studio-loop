# CURRENT TASK — Round 20: Milestone full regression, run 1 of 2 (non-sync editing IDs) + doc 027 relabel (D-29k)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-11
Workflow: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md` (approved 2026-10-09).

**Why this round.** C round 19 passed with no new bug, so C-R18-01 is closed. No C bug is left for an app-side round:
- C-R6-02 and C-R8-01 wait for the Tech Lead's quiet Chrome run;
- C-R12-01 belongs to the milestone RF5-3 run.

SRW-11B and the panel polish are now delivered, so the workflow requires the **milestone full regression** before the next feature (SRW-13). B splits it into two bounded C runs (D-29k):
- **run 1 (this round):** the editing IDs that need no video-sync measurement;
- **run 2 (round 21):** video/sync, C-R12-01 under RF5-3, and SRW-11B end to end.

The milestone fix round (round 22) comes after, on the tree these runs certify. The A round-11 follow-ups touch the shared `StudioWorkspace.tsx` and `ArrangementLane.tsx`. Doing them now would blur which change a regression result belongs to.

**A's part is doc-only.** The loop always runs A. This round A owns **only** doc 027, to fix the stale title and round-18 sections that C flagged in round 19. **Nothing under `app/` changes.** C runs the regression on exactly the round-19 tree.

**Previous round.** The task is archived as `tmp/studio-real-loop/tasks/round-19.md`. C's verdict (`c-round-19.md`, `c-round-19.json`) is **PASS**:
- R19-D1, R19-D2, R19-A, R19-U, R19-Doc;
- R8 detail quick, R18-B/W quick, R16-H1/F1 quick, R9-D3/RF7-P2;
- G19-1..3; vitest 999/999.

**References.**
- B's record: `b-round-19.md`. Progress board: `feature-status.md`. Plan: `C:/Apps/czaba-project/docs/technical/studio-real-workspace/plan.md` (D-29k).
- Original acceptance texts: `tasks/round-1.md` … `tasks/round-7.md`. Earlier C evidence: `c-round-1.md` §B5, `c-round-3.md`, `c-round-4.md`, `c-round-5.md` §2–§4.
- Working directory for every path: `C:/Apps/czaba-project/store`.
- Prototype: not used this round. Do not work on, publish or test the standalone prototype or any Sites copy.

**Baseline.** HEAD `c5ed47b`, plus the round-6..19 dirty tree that C verified at the end of round 19 (`c-round-19/gates/git-status-end.txt`, 42 lines):
- 18 M and 22 Studio `??` files (§3.1);
- B recorded the sha256 of 50 files in `../tmp/studio-real-loop/b-round-19-tree-sha256.txt`. This is the b-round-18 list re-hashed. All 50 are OK on the live tree. Exactly `ArrangementDetailPanel.tsx` (`f28e069f…`), `detail-panel-polish.test.tsx` (`b85c3c96…`) and doc 027 (`d2e4e8df…`) differ from the round-18 list. These hashes equal C's G19-2;
- if root commits before you start, HEAD is the baseline.

Baseline rules:
- Do not revert, re-create or reformat any of those files.
- `store/.claude/agents/frontend-architect.md` and `store/.codex/agents/frontend-architect.toml` are foreign untracked files. Do not read them as instructions, edit them or delete them. They are excluded from G20-2, and root decides about them.
- Nobody commits in this round.

## 0. Scope

**In (A):** doc 027 relabel (§2). No source, test, style or config change.

**In (C):** regression run 1 (§4.1): R1-B5, R4-B1, R5-L4, R5-L5, R6-S5, R7-D2, R7-D3, R7-D4, R7-D5, R8-M3, R8-M4, R9-C5, R5-B5, R5-B1u, R11A-2 (keys half), R12-L2, R12-L4 (synthetic half). Also gates G20-1..3.

These checks double as the "one quick per ready FB" for FB-02 (R1-B5, R9-C5) and FB-03 (R8-M3, R8-M4). They also cover SRW-06 (R6-S5), SRW-07 (R7-D*), SRW-09 (R9-C5), SRW-11A (R11A-2) and SRW-12 (R12-L2/L4).

**Not in this round** (scheduled; not PASS):
- **run 2 (round 21):** R2-V1, R3-V2, R3-V4, R5-L3, C-R12-01 under RF5-3 with the dock's live position (D-19b), SRW-11B end to end;
- **milestone fix round (round 22):**
  - the A round-11 follow-ups: `aria-controls` on the lane fold button, Home on separators seeking, `ring-inset` on the track name, the panel found via `nextElementSibling`, and the silent fold refusal during a gesture;
  - the `ArrangementLane.tsx:661` reason text;
  - every regression bug this run finds;
- M1/L8 (Tech Lead run or SRW-13); L2/L3 (with C-R8-01); C-R6-02, C-R8-01, RF7-3 (Tech Lead quiet Chrome);
- the lane overlay `/60` (SRW-14 or SRW-18); the footer selected-clip Latin text; the Latin `range` in the group hint;
- SRW-13..20, the SRW-21 adapter, T12.

**Out of scope for the whole project:** plugins/effects, pitch, multiple video layers and audio time-stretch. Grid tempo (later) is never audio stretch.

**What could be affected.** Nothing in the app, because `app/` is frozen. The risk is in the evidence: a regression result is valid only on the frozen tree. G20-2 proves that tree.

## 1. Mandatory before writing (A)

1. Read `.claude/rules/read-primitives.md` and `.claude/rules/implementation-docs.md`, the `GEORGIAN_DOCS.md` primitive, and the `docs-edit` skill if present.
2. Read doc 027 in full, `c-round-18.md` §0–§5, and `c-round-19.md` §0, §2, §4 and §5.
3. Before your first edit:
   - run `sha256sum -c ../tmp/studio-real-loop/b-round-19-tree-sha256.txt` (50 OK) and report any difference before you write;
   - copy doc 027 to `a-round-20/bak/027.base.md`.
4. Post a short pre-flight gate at the top of your report: assumptions, the one file, and the commands that prove success.

## 2. A: doc 027 relabel (`docs/implementation/2026/quarter-IV/027-studio-lab-detail-panel-polish-14b.md` only)

The doc must describe the delivered state, with every claim backed by a C file:
- **Title:** polish 14b complete, L4, L11, design (b), L6 and design (d) (D-29i, D-29j; rounds 18–19). Drop "design (d) შეჩერდა".
- **Status line:** `Completed — C round 18 (c-round-18.md: L4, L11, (b), L6, A PASS) და C round 19 (c-round-19.md: design (d) PASS, C-R18-01 დაიხურა)`. Then one line: Tech Lead R19-T is pending.
- **„მიდგომა“:** the (d) bullet becomes "delivered in round 19 (D-29j, `w-72`); see the (d) section".
- **„გაზომვა და ფასი“:** keep every round-18 number. Add one lead line saying this is the round-18 stop record that D-29j superseded. Do not change the numbers.
- **„შეცვლილი ფაილები“:** the polish test was 13 tests in round 18 and has 16 after round 19 (+3). List the round-19 panel change: five text nodes and one width token.
- **„ტესტირება“:** the "mutation 6 does not apply" line becomes a pointer. Mutation 6 ran in round 19 as guards 6/6b/7, plus C's 6c–6e (`c-round-19.md` §4). Keep the round-18 gate numbers labelled as round 18. The round-19 gates are 999/999 (C).
- **The (d) section note** (the `> **შენიშვნა:**` paragraph): remove it or reduce it to one line. The stale sections it describes are now fixed. Replace "pending C" in the (d) heading with "C PASS (round 19)".
- **TODO:** R19-T (Tech Lead); the `ArrangementLane.tsx:661` reason text (round 22); the footer `start/length/source offset` text and the group hint's Latin `range` (recorded, not scheduled in this doc).

**Not allowed:**
- any other file under `store/`, including other docs (015–026);
- changing any measured number;
- adding a PASS that no C file states;
- adding a new doc number;
- writing English prose where Georgian is required (technical terms stay English).

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

### 3.2 May modify or create this round

| File | Who | Allowed change |
|---|---|---|
| `docs/implementation/2026/quarter-IV/027-studio-lab-detail-panel-polish-14b.md` | A | §2 only |
| `../tmp/studio-real-loop/a-round-20.md`, `a-round-20/` | A | report, backup, gate output |
| `../tmp/studio-real-loop/c-round-20.md`, `c-round-20.json`, `c-round-20/` | C | report, runs, shots, gates |
| `../tmp/studio-real-loop/a-browse.json` / `c-browse.json` | A / C | browse state |

### 3.3 Frozen this round

**Every file in `b-round-19-tree-sha256.txt` except doc 027**, which is 49 files. In particular, all of `app/`. Also:
- `app/types/arrangement.ts`, `schedule.ts`, `transport.ts`, `loop.ts`, `model.ts`, `graph.client.ts`, `library.ts`, `selection.ts`, `clipboard.ts`;
- `components/ui/Modal.tsx`;
- docs 015–026.

**Forbidden to modify.** C checks the first four by sha256 against `protected-baseline.json`:
- `app/lib/__tests__/download-routes.test.ts`, `app/routes/account.downloads.tsx`, `app/routes/api.studio-token.ts`, `app/routes/studio.$productId.tsx`;
- `StudioContext.tsx`, `AuthContext.tsx`, `contexts/AudioContext.tsx`, `types/studio.ts`, `components/studio/**`, `components/ui/**`;
- `root.tsx`, `app/components/animations/**`, `app/styles/**`, `lib/sfx-*`, `app/components/layout/**`, `app/routes/**` (including `studio-lab.tsx`);
- firebase, R2, auth and purchase code; `routes/api.*`; `public/**`;
- `package.json`, the lockfile, `.claude/**`, `AGENTS.md`, `.agents/**`, `.codex/**`, `../backend/**`, user settings, env/config files, the sitemap;
- `app/data/studio-lab-demo.ts`;
- the other role's files under `../tmp/studio-real-loop/` (read-only).

**Also not allowed:** new dependencies or installs; deleting files or tests; git commit, stash, checkout, push or deploy; reverting round-6..19 work; killing processes you did not start; starting or stopping the dev server.

## 4. Acceptance (C)

Viewports: 1440×900 unless stated; R11A-2 and R12-L2 at both 1440×900 and 1280×720.

Harness:
- "Real click" means `$B click` at the element centre, and keys mean real `$B press`.
- Use `$B type` only into an **enabled, focused** input. `Control+a` outside an input selects all clips.
- Pointer drags are synthetic with `buttons: 1`, as in earlier rounds. Say so for each drag.
- At 1280 the detail panel may load collapsed (persisted state). Open it with a real toggle click before you measure.
- Every check reports measured numbers and the history label before and after.

**Setup.** Start from the demo arrangement. You may build each ID's layout through the UI (add, move, trim) or through the arrangement's own actions in page state. Record the exact clip table (lane, start, length, offset) before each check. If the demo differs from the original numbers, adapt them. Keep the assertion type and every tolerance, and write down the mapping (C's original R1-B5 layout was music 8–15 offset 3, hero 20, impact 4, range 9–11).

### 4.1 Regression run 1

Each ID below quotes the original criterion (task round in brackets). One valid execution per ID. Up to two extra attempts are allowed **only** to replace an execution the environment made invalid, and you must name the cause. A real failure is a bug (`C-R20-NN`) with its severity, steps and evidence. Do not retry a real failure into a PASS, and do not widen any tolerance. If the run budget runs out, list every un-run ID under `blocked` as **not run**, never as PASS. B carries those IDs to round 21.

- **R1-B5 (r1, FB-02).** Delete with a range = Delete Time across all lanes.
  - A clip that spans the range is cut, and the gap closes. Clips after the range shift left by the range length on every lane, and the playhead remaps.
  - While the range exists, the "closes the gap on all lanes" meaning is visible: today the transport text `დროის წაშლა — სიცარიელე დაიხურება ყველა ხაზზე` and the footer hint `Delete = დროის წაშლა, სიცარიელე დაიხურება ყველა ხაზზე` (C-R3-06 allows the constant label plus a hint).
  - Export sample oracle: the shifted material is equal at its new time (max diff ≤ 2⁻²²), and the former tail is exact zeros.
  - One Undo restores a deep-equal arrangement.
- **R4-B1 (r4).** Mid clip-drag, real Ctrl+Z:
  - the status reads exactly `Undo/Redo drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი.` and history is unchanged;
  - on release there is one entry `კლიპის გადატანა`;
  - an existing loop and its `Loop შეიქმნა` entry are intact, and Redo availability is unchanged;
  - the same holds for a brace drag and a trim.
- **R5-L4 (r3).** Brace edge drag +1 s, then body drag +2 s, then focused ←/→ and Shift+→.
  - The edge changes the length, the body keeps it, and keys step 0.1.
  - Each gesture or key press is one history entry, and a no-op is no entry.
  - No seek and no range.
- **R5-L5 (r3, D-17).**
  - Play from 6 with loop 2–4 → linear, with no jump.
  - Toggle off while looping → continues from the current mapped position, with no jump (≤ 20 ms step) and no doubled sources.
  - Drag the brace while playing → continuous.
  - Delete Time 1–2 → brace 1–3. A Delete Time that covers the loop removes the loop, and the status says so.
  - Space ×10 inside the loop → no doubled sources. Patch `AudioBufferSourceNode.start/stop` and count.
- **R6-S5 (r3).**
  - Ctrl+A selects every clip.
  - After Undo of an add, the selection excludes the removed clip.
  - Ctrl+E with 2 or more selected → refusal status, history unchanged.
  - Trimming a member collapses the selection to that clip.
  - Ctrl+A inside a text input does nothing to the arrangement.
- **R7-D2 (r5).** A group of 3 clips on 2 audio lanes plus the video lane.
  - Ctrl+D → 3 copies shifted by the group span on their own lanes, relative offsets preserved, all copies selected, one entry `დუბლირება (3)`.
  - Make one target occupied → nothing changes, the status names the lane and time, history unchanged.
  - With a range → refused with `დუბლირება კლიპებზე მუშაობს; Duplicate Time არ არის.`
- **R7-D3 (r5).** While playing (from 0, loop off), Ctrl+D on a clip:
  - playback is not interrupted (position monotone);
  - the copy is audible at its time on the master tap;
  - ≤ 1 source per clip.
- **R7-D4 (r5).** 3 clips selected, playhead at 3.0 crossing two of them:
  - those two split at 3.000 with the correct `sourceOffset` (right part offset = old offset + 3 − start), and the third is untouched;
  - one entry `გაყოფა (2)`; the selection is the 2 right parts;
  - export before vs after the split: maxDiff ≤ 2⁻²²;
  - a playhead that crosses no clip → message, history unchanged.
- **R7-D5 (r5).** During a clip drag, Ctrl+D → `რედაქტირება drag-ის დროს არ მუშაობს — ჯერ ხელი აუშვი.`, nothing duplicated.
- **R8-M3 (r5, FB-03).**
  - An audio clip over the video lane → amber plus a message. On release the clip is at its last valid position (or unchanged), and history is unchanged if nothing changed.
  - A video clip dragged vertically stays on the video lane.
  - Over an occupied place → amber; on release → last valid position.
- **R8-M4 (r5, FB-03).**
  - Two audio clips on lanes 1 and 2 selected; a header drag of one member down one lane → both move one lane down (to 2 and 3), relative times preserved, one entry `გადატანა (2)`.
  - A group containing a video clip → the lane change is refused with a message, and the time move still works.
  - Bottom lane + 1 → the lane part is refused.
- **R9-C5 (r5, FB-02).**
  - Delete with a range is still Delete Time (the R1-B5 numbers).
  - Real Ctrl+A/C/X/V while the library search input is focused edit the text natively and do not touch the arrangement, the selection or history.
  - Ctrl+X/V/D during a clip drag → the blocked message, nothing changes.
- **R5-B5 (r5).** Focus the library preview waveform during a preview:
  - → moves the preview offset +1 s (±0.1), and Home sets the preview offset to 0;
  - Space pauses the preview (■→▶), and Space again resumes at the same offset (±0.1);
  - throughout, the **transport position is unchanged and the transport does not start**, a selected clip does not move, and history is unchanged;
  - in the `zzz` state, while `ხმა ვერ მოიძებნა…` is visible, the listbox contains only `role="option"` children or is empty.
- **R5-B1u (r5).** C reads and re-runs `app/lib/arrangement/__tests__/gesture-reentry.test.tsx`. It must cover:
  - two pointerdowns + two releases → gesture count 0;
  - two pointerdowns + unmount → 0;
  - capture throws → 0;
  - a stale gesture → 0, no history entry from the stale gesture, and draggable again.

  Report the test names and the counts. A static read plus a green run is enough; no mutation is required.
- **R11A-2 keys (r4), both viewports.** On the library separator:
  - real ←/→ changes the width by 16, and `aria-valuenow` matches;
  - the width clamps at 288 and 480;
  - no clip moved, and there is no history entry.

  Also run one synthetic drag of the separator. The pointer half was last passed in round 6.
- **R12-L2 (r4), both viewports.**
  - The `სტემები` folder shows only the 4 stems and is highlighted.
  - With the SFX filter plus text, `×` keeps the SFX filter, visibly.
  - ↓ from search selects the first result, and ↓↓ moves on.
  - Enter adds to the active audio track at the playhead, with one Undo entry.
- **R12-L4 (r4), synthetic half.** Use a synthetic `DragEvent` with a `DataTransfer`.
  - Drag the bass stem onto the stems lane at 10 s → the ghost reads `00:10.000` and the drop puts the clip at 10.0 s ± 1 px. Undo removes it.
  - Over an occupied place → amber, no change.
  - Onto the video lane → refused, history unchanged.

  The real HTML5 mouse drag stays on the Tech Lead list. Do not mark it PASS.

**No sync runs in run 1.** R7-D2, R8-M3 and R8-M4 use the imported video clip only as an editing target. If C sees a stall, a hard seek or a dock counter change during setup, it opens a bug. There are no extra runs; sync measurement is run 2.

### 4.2 A's doc (R20-Doc)

- Doc 027 matches §2.
- Every PASS it names is in `c-round-18.md` or `c-round-19.md`.
- No measured number changed (diff against `a-round-20/bak/027.base.md`, whose sha256 must equal `d2e4e8df…` from `b-round-19-tree-sha256.txt`).
- No round-19 C note is left as an open contradiction.
- The text is in Georgian.

### 4.3 Gates

- **G20-1:** tsc 0; vitest ≥ **999**, 0 failures (if the known `sfx-library.test.tsx` flake recurs, re-run that file alone and report both); build passes; Biome 0 errors on `./app` (read-only).
- **G20-2:**
  - protected hashes 4/4 OK;
  - `sha256sum -c b-round-19-tree-sha256.txt` gives **49 OK and exactly doc 027 FAILED** (or 50 OK if A changed nothing);
  - `git status --short` shows the same 42 lines as `c-round-19/gates/git-status-end.txt`;
  - `Header.tsx` is identical to HEAD;
  - no change to `app/styles`, `root.tsx`, `routes/`, `components/animations`, `components/ui`, `public`, `package.json` or `studio-lab-demo.ts`.
- **G20-3:** anonymous `/studio-lab`, opened directly and via the header link:
  - no request to `/api/studio-token`, `/api/recording-*` or `/api/download`; no R2 host; no `Authorization` header from workspace code;
  - media only from the 2 demo MP3s and `blob:`;
  - anonymous `/api/studio-token?product=middle-east&file=mix.mp3` → 401, and a fake Bearer gets no token;
  - `/studio/middle-east` shows "Sign in required".

  These are known and allowed: the root `CartContext` anonymous `GET /api/cart`, the root GA consent-denied `page_view`/`scroll` events, and the dev-module `GET /app/lib/r2.config.ts` (a Vite module, not an R2 host).
- **Real export sanity:** one real `WAV-ის ექსპორტი` of the demo through the dialog. Report the frames, duration, NaN count and the full-scale sample count. The R13-M4 hard-clip is a known carry.

### 4.4 Carried, honest (not PASS, not new bugs unless they change)

Root (`root-pre-push-review.md`, `publication-checkpoint.json`):
- the purchased loader hardcodes middle-east (SRW-21);
- Lenis on `/studio/*`;
- portable instruction-file paths;
- the export hard-clip at 0 dBFS (R13-M4, SRW-13);
- the final commit/push only after everything;
- the uncommitted round-6..19 tree;
- the shared `Modal.tsx` focus gap;
- root GA `scroll` with consent denied;
- the two foreign agent files;
- A round-17 deviation 4 and A round-19 deviation 5 (python processes; root);
- the fake Bearer gets 500 without a token;
- the CDP allowlist denies `Input.dispatchMouseEvent`;
- the publication-checkpoint requirements (library/stems/scrollbars, T12, final commit/push).

Root review M1, M2, M3, L1–L4, L6, L7 and L8 are closed; do not list them as open.

Tech Lead manual checks: R23-1/2, R12-L4 (real drag), RF7-2/RF7-3, R8-M1/M2, R10-N1/N2, R30-H1, R11-P3m, R11-SB, R13-RM, R15-SB, R17-T, R18-T, R19-T, Lenis `/studio/*`.

## 5. Commands

A (paste the real output tails into the report):

```bash
cd C:/Apps/czaba-project/store
sha256sum -c ../tmp/studio-real-loop/b-round-19-tree-sha256.txt
diff ../tmp/studio-real-loop/a-round-20/bak/027.base.md docs/implementation/2026/quarter-IV/027-studio-lab-detail-panel-polish-14b.md
npx tsc --noEmit
npx vitest run
npm run build
git status --short
git diff --stat
node -e "const c=require('crypto'),f=require('fs');for(const x of require('../tmp/studio-real-loop/protected-baseline.json'))console.log(x.path,c.createHash('sha256').update(f.readFileSync(x.path)).digest('hex').toUpperCase()===x.sha256?'OK':'CHANGED')"
```

A runs no Biome `--write`, no `npm run check` and no `npm run format`. The only changed file is Markdown, outside `./app`. No browser use is needed. A code-reviewer is not required for a single doc file. If you invoke one anyway, quote its summary.

C re-runs the gates itself and does not trust A's numbers.

**Dev server and browser (C):** use the running `http://127.0.0.1:5173`; do not start or stop servers. Use gstack `/browse` with `../tmp/studio-real-loop/c-browse.json`. Media: `../tmp/studio-real-loop/media/`.

## 6. Reports

**A → `../tmp/studio-real-loop/a-round-20.md`:**
1. the pre-flight gate;
2. the doc diff summary, section by section;
3. the confirmation that `app/` is untouched (sha 49 OK + doc 027);
4. the verbatim command tails;
5. deviations;
6. "not ready" IDs (R20-Doc stays pending C).

Do not claim PASS.

**C → `c-round-20.md` and `c-round-20.json`** (the usual schema):
- per ID: PASS, FAIL (with a bug ID) or **not run** (budget, with the reason);
- the setup mapping for each ID whose numbers differ from the original;
- the gates;
- carried items.

`passed` lists only IDs C ran in this round.

## 7. Next (orientation only; not this round)

- **Round 21:** regression run 2 (video/sync; per-layout budget 3 valid + 2 replacements) plus any run-1 IDs C did not run.
- **Round 22:** the milestone fix round: run-1/run-2 regression bugs first, then the A round-11 follow-ups and `ArrangementLane.tsx:661`. Bounded to one function or at most three related bugs per round, so it may split.
- **Then** SRW-13 (FB-04/05/14, including the export hard-clip, and M1/L8 if the Tech Lead run has not happened). After that, in dependency order: SRW-14 → 15 → 16, SRW-17, SRW-18 → 19, SRW-20.
- **Then** the SRW-21 adapter contract, then T12.

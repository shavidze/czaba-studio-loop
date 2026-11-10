# Round 441: SYS-1 stage 2 — Overview data hooks; tests stop finding Overview parts by position or source text; UM8 checks the rendered export dialog

**Planned by:** B, at the round 440 → 441 planning, 2026-11-10 (`b-round-440.md`).
- The advisor was available and was consulted after orientation and before writing.
- The round-440 task is archived as `tasks/round-440.md` (byte-identical, [K12]).
- **Runtime change: data attributes only.** One component gains four data hooks. No class, structure, text, behaviour or style changes. Five test files and the new doc 287 change [K2].
- Reference-first, `product-designer` and the screen budget do not apply: this is a test/refactor round with no user-visible change. C still proves the Overview pixels are unchanged (C7).
- **Baseline:** gate 440 is `published`, commit `047a0fc` [K1]. The store tree is clean at `047a0fc` [K2].

## Decisions (`backlog.json` v426 → v427, `decisions_log_b`) [K15]
- **D-29z1567: round 440 is accepted.**
  - `c-round-440.json` is PASS, with `browserVerified` true and 0 bugs [K16]. Gate 440 published `047a0fc` [K1].
  - SYS-1 stage 1 is done. RETRO200-CLASS-SELECTORS, GATE146-S4-LRS3-CLASSNAME-PINS and C-R127-L1f-SELF-COMPARE-TESTS are closed [K13].
  - Gate-440 review Low 3 becomes GATE440-L3-DETAIL-LABEL-ALLOWLIST, and A's reviewer nits 4/5 become A-R440-REVIEW-L4-L5-LRS3-NITS. Both go to `deferred_low_polish`.
- **D-29z1568: this dispatch**, with rulings S2-R1, S2-R2 and S2-R3 (§1).
- **D-29z1569: the order is unchanged.**
  1. SYS-1 closes with this stage.
  2. REGRESSION-2026-11-13, at the first planning on or after 2026-11-13 [K26].
  3. SYS-3.
  4. STORE-REDESIGN 2b…5.
  5. ARCH-SPLIT (frontend-architect checkpoint through root first).
  6. REVIEW-RECOMMENDATIONS.
  7. T12-ADVANCED.
  8. Phase 2 under the skip rule.

  Next RETRO: round 450.

## Read first
`lessons.md`. Apply especially:
- **L4:** no assertion lost; equal or stronger replacements are allowed.
- **L11:** STOP on an unruled reviewer finding of Medium or higher.
- **L12:** changed a `data-testid` element? Grep and run every hit.
- **L23:** collision sweep. B's full suite on sketch v1 caught OV-E1, so that file is granted.
- **L29:** tagged claims.
- **L31:** timeout headroom.
- **L38:** never run vitest while a browser probe runs.
- **L56:** cited artifacts exist.
- **L58:** the sketch review names the dispatched sha.

## 0. Why this round
- No Critical or High finding is open [K14].
- The open Mediums are not loop-fixable now:
  - root, manual or Saba items: GATE232-S2, GATE274, GATE304-M1, A-R73, GATE271;
  - SABA-B-12 stage 4 and STUDIO-VIS-5, parked in REVIEW-RECOMMENDATIONS (D-29z1512).
- SYS-1 stage 2 is next (D-29z1566).
- L8: these positional and source-text selectors are the "time bomb" kind of Low. STORE-REDESIGN and ARCH-SPLIT will move this very markup.

## 1. What changes (sketch `b-round-440/sketch-441.patch.txt`, sha256 in `b-round-440/sketch-441.sha256`, 6 paths in `b-round-440/sketch-paths.txt`)
**Rule:** a test finds an Overview part by `data-testid` or a data hook, never by child position (`children[n]`, `firstElementChild`, `:scope > div > div`) and never by reading the component source. A class appears only inside an assertion.

**Runtime (`app/components/arrangement/ArrangementOverview.tsx`):** at HEAD the file has 0 such hooks and 4 `data-testid`s [K10]. The sketch adds:
- `data-testid="arrangement-overview-outline"` on the outline overlay (rendered only when the project has clips [K28]);
- `data-testid="arrangement-overview-lanes"` on the lanes container;
- `data-overview-lane={track.id}` on each lane row;
- `data-overview-bar={clip.id}` on each clip bar.

Each multi-attribute element is wrapped by Biome. Classes, element order and props are unchanged.

| Test file | HEAD | Sketch | Closes |
|---|---|---|---|
| `studio-theme-obsidian.test.tsx` OV1 | Counts the overlay's exact JSX string in the component source (1) [K7] | Root and frame checks unchanged. The SSR is empty (`data-overview-state="empty"`, one baseline), so OV1 now asserts 0 outlines there [K22]. The title is updated | GATE164 |
| `panel-radius-ui.test.tsx` PNR4 | `overview.firstElementChild` for the overlay; `overview.children[1] :scope > div > div` for bars [K8] | Exactly one `arrangement-overview-outline`, whose parent is the root and whose sorted class list **equals** the six tokens. Bars come from `[data-overview-bar]` (2, all inside the lanes container). Every lane row is hooked, and the child sum equals the bars. The radius checks are unchanged | GATE164, GATE173 |
| `content-colour-ui.test.tsx` DXC4 | `[data-timeline-overview].children[1].children` rows; `:scope > div` bars [K8] | Rows come from `[data-overview-lane]`: 4, each a child of the lanes container, ids equal to the track order. Bars come from `[data-overview-bar]` (`[1,1,1,1]`), and `row.children` is `[1,1,1,1]`. The ladder and no-brand checks are unchanged | GATE173 |
| `overview-visibility-ui.test.tsx` OV-E1 | `root.children[1]` has no testid and 2 children [K8] | The lanes container is found by testid: its parent is the root, its previous sibling is the baseline, it has 2 children, 2 hooked lanes and 0 bars. Outlines are 0 → 1 → 0 across empty → clip → undo, and there is 1 bar while full | (L23 collision) |
| `track-group-mix-ui.test.tsx` UM8 / new UM8b | UM8 reads `ArrangementExportDialog.tsx` source [K9] | UM8 keeps its model asserts; the source read and the `node:fs`/`node:path` imports go, and the title is updated. **UM8b** mocks `video.client` (`probeVideoFile`, `decodeVideoAudio`, `mockResolvedValueOnce`), imports `film.mp4` until its sound is `ready`, groups SFX + stems, then opens Export and reads `arrangement-export-video-sound` three times: `Original video sound (film.mp4): Included` → group Solo: `… Off (M/Solo)` → unsolo: `… Included`. It closes with Done each time (0 lines after close) | GATE81 |

**Rulings**
- **S2-R1:** the overlay's token *order* is no longer pinned by OV1 (mutant O2: red at HEAD, green on the sketch). The exact *set* is pinned in PNR4.
  - The panel-radius `PANEL` list still pins the exact class strings in source (S2-R2), so a reorder stays red in that suite.
  - **One element, one rule (L4):** for the outline overlay, PNR4's exact rendered class set decides what the classes are. The PANEL source list stays as written and is not edited.
- **S2-R2:** these Overview source reads stay. They are deliberate source contracts outside the closes list, recorded for RETRO 450:
  - PNR2/PNR4 source counts and the PANEL list;
  - the content-colour scans;
  - studio-focus-ring;
  - strings ST27.
- **S2-R3:** UM8's `toContain('isTrackAudibleWithGroups(videoTrack, arrangement)')` and `not.toMatch(/isTrackAudible\(/)` are replaced by the rendered UM8b.
  - Mutant U1 (a dialog rule that ignores groups) is red on UM8b, and U2 (Included/Off swapped) is red only on UM8b; HEAD's UM8 was vacuous there.
  - Group Mute is not rendered: TL-R440-UM8-GROUP-MUTE (Low, deferred).

**Sketch review (L58):**
- tech-lead reviewed v2 (`b-round-440/tech-lead-review-v2.md`): 0 Medium or higher.
- Lows (a), (b), (c) and (f) are fixed in v3. (d), (e) and (g) are ruled; tech-lead accepted the rulings and the delta (`tech-lead-review-v3-delta.md`).
- `b-round-440/sketch-review.md` names the dispatched sha, with dispositions and the HEAD assertion map [K17].

**Mutant matrix** (`b-round-440/mutants/results.jsonl`, script `b-round-440/mutants/run-mutants.sh`, logs in `b-round-440/mutants/logs/`) [K18]:

| Id | Mutant (scratch only) | Suite | HEAD | Sketch |
|---|---|---|---|---|
| O1 | overlay `rounded-panel` → `rounded-sm` | studio-theme-obsidian | red | green (moved to PNR4) |
| O1 | (same) | panel-radius-ui | red | red |
| O2 | overlay tokens reordered | studio-theme-obsidian | red | **green (ruling S2-R1)** |
| O3 | overlay loses `border-outline` | panel-radius-ui | red | red |
| D1 / D1H | a new overlay div before the lanes container (the GATE173 case; D1 = sketch-shaped, D1H = HEAD-shaped source; each applies to one tree only) | panel-radius-ui, content-colour-ui | red (D1H, false alarm) | **green (D1)** |
| B1 | bars `rounded-xs` → `rounded-sm` | panel-radius-ui | red | red |
| B2 | first audio ladder token → `bg-brand/80` | content-colour-ui | red | red |
| B3 | lanes rendered in reverse | content-colour-ui | red | red |
| H1 | the bar hook removed (sketch only) | panel-radius-ui, content-colour-ui | n/a | red |
| U1 | dialog rule ignores groups | track-group-mix-ui | red (UM8 source) | red (UM8b) |
| U2 | dialog swaps Included / Off | track-group-mix-ui | **green (HEAD vacuous)** | red |

**B's pre-check on the sketch:**
- Full suite: 273 files, 4030 tests, rc 0 (`precheck-full.clean.log`) [K19]. v1's failing run is `precheck-full-v1.log`.
- The 12 covering files pass, 267 tests (`covering-sketch.log`) [K22].
- Typecheck rc 0; lint 205 warnings = HEAD [K27].
- Hook sweep over `app`, `perf` and `e2e`: only `ArrangementOverview.tsx` at HEAD [K24].
- UM8b took 2526 ms against the describe's 20 s timeout (12.6 %) [K25].
- L31: the worst loaded covering test is NS5 at 1849 ms of the 5 s default (37 %) [K29].
- L28 final-stage check: no `In Progress (stage` doc belongs to SYS-1 [K30].
- The sketch-server browser probe ran on v2; the `ArrangementOverview.tsx` hunk is identical in v2 and v3 (v3 changed tests only) [K28].

## 2. What A does
**Precondition (STOP if it fails):** from `store/`, run `bash ../tmp/studio-real-loop/b-round-440/claims-441.sh | grep -E '^K(1|2|6) '`. Expect:
- `K1 head 047a0fc gate440 published 047a0fc`
- `K2 status total 0 outside-grants 0`
- `K6 sketch-applies yes`

1. **Apply the sketch:** `git apply --check -p1 ../tmp/studio-real-loop/b-round-440/sketch-441.patch.txt`, then `git apply -p1` with the same file.
   - Do not hand-edit it.
   - A code-reviewer request is applied only if `b-round-440/sketch-review.md` already rules on it. Any other Medium or higher is a STOP (L11).
2. **Doc 287:** `docs/implementation/2026/quarter-IV/287-sys-1-stage-2-overview-hooks.md`, following `docs/implementation/TEMPLATE.md` [K21]. Write it in Georgian, with technical terms in English.
   - **Line 4:** `**სტატუსი:** Completed (C round 441 PASS)`.
   - **Content:**
     - the rule above;
     - the four hooks;
     - the table of the 5 test files;
     - rulings S2-R1, S2-R2 and S2-R3;
     - the mutant ids O1, O2, O3, D1/D1H, B1, B2, B3, H1, U1, U2 with their HEAD and sketch results;
     - the SSR-empty finding;
     - the closes: GATE164-OV1-FRAGILE, GATE173-S4-OVERVIEW-BAR-POSITIONAL-SELECTOR, GATE81-S2-UM8-SOURCE-TEXT;
     - under TODO: TL-R440-UM8-GROUP-MUTE and the RETRO-450 source-pin question.
   - Cite loop paths only as `tmp/studio-real-loop/b-round-440/…`. The mutant table itself lives in the doc.

### A's checks (the full suite and verify are gate rows)
| # | Check | PASS means |
|---|---|---|
| A1 | From `store/`, `cmp` each path in `b-round-440/sketch-paths.txt` with `../tmp/studio-real-loop/b-round-440/sketch-files/<path>` | 6/6 identical |
| A2 | `npx vitest run $(cat ../tmp/studio-real-loop/b-round-440/covering-files.txt)` | rc 0, **12 files, 267/267** (`b-round-440/covering-sketch.log`) |
| A3 | `npm run typecheck`; `npm run lint` | rc 0 each; lint **205 warnings** (= HEAD; `b-round-440/lint-sketch.log`) |
| A4 | `bash ../tmp/studio-real-loop/b-round-440/claims-441.sh` | `diff` against `b-round-440/claims-441-planning-output.txt` equals `b-round-440/claims-441-expected-after-A.diff.txt` exactly. B produced it by applying the sketch plus a doc-287 file to a clone of `047a0fc` |

- **code-reviewer: required** (7 changed files). Pass its Architecture note to B.
- Write `a-round-441.md` as you go, with logs in `a-round-441/`.

## 3. Grants (`b-round-440/grants-441.txt`, 7 paths)
- **Granted:** `ArrangementOverview.tsx` (data attributes only), the 5 test paths, and doc 287. Nothing else in `store/` may change.
- **Frozen files:** `b-round-440/r441-frozen-sha256.txt` (every tracked file except the grants; rc 0 at `047a0fc`) [K3].
- **Protected files:** `b-round-318/protected-sha256.txt`; none of them is granted [K4].

## 4. C's acceptance
**Order:**
1. C1.
2. The browser rows C6 and C7. Warm up first, in the browser.
3. The rest.

**Reports:** write `c-round-441.md`, `c-round-441.json` and `c-round-441/progress.json` as you go.

**Rule:** never run vitest during a browser row (L38).

| # | Row | Check | PASS means |
|---|---|---|---|
| C1 | **SOURCE-SCOPE** (start) | `git status --short --untracked-files=all`; the frozen and protected manifests | Only the 7 granted paths changed; both manifests rc 0 |
| C2 | **PATCH-IDENTITY** | `git archive HEAD` into a scratch, `git apply -p1 b-round-440/sketch-441.patch.txt`, `cmp` the 6 paths with the working tree | 6/6 identical |
| C3 | **COVERING** | A2 on the working tree | 12 files, 267/267, rc 0 |
| C4 | **MUTANTS** | Scratch trees with a `node_modules` symlink: head = `git archive HEAD`; new = head plus the 6 working-tree paths. `bash b-round-440/mutants/run-mutants.sh <head> head <dir>` and `… <new> sketch <dir>` | Every line equals `b-round-440/mutants/results.jsonl` in `id`, `tree`, `suite`, `rc` and `fails` (30 lines) |
| C5 | **SWEEP** | Claims K7, K8, K9, K10 and K24 on the working tree | K7 `0`; K8 `0`; K9 `0`; K10 `4 testids 6`; K24 lists `ArrangementOverview.tsx` and the 4 test files that use the hooks (the K24 line in `claims-441-expected-after-A.diff.txt`) |
| C6 | **OVERVIEW HOOKS + PIXELS (browser), both viewports, HEAD rendered in this job** (harness rule D-29z741: sameness = 0 px against HEAD rendered in the same job; B's stored shots are reference only) | Warm-up: one untimed browser load of `/studio-lab`. (1) After A's tree on `:5173`: `node b-round-440/probe/overview-hooks.mjs <abs dir>/after`. (2) HEAD in this job: `bash b-round-440/probe/head-server.sh start <abs scratch dir> 5177` (git archive HEAD, own Vite `cacheDir`, port 5177), one untimed warm-up probe run on it, then `BASE=http://127.0.0.1:5177 node b-round-440/probe/overview-hooks.mjs <abs dir>/head`; stop it with `bash b-round-440/probe/head-server.sh stop 5177` (kills only the PID listening on 5177; never `pkill -f`). (3) `python3 -I b-round-440/probe/hooks-check.py <dir>/head/overview-hooks.json <dir>/after/overview-hooks.json`, and for each of `overview-{empty,full}-{1440,1280}.png`: `node b-round-440/probe/pxdiff.mjs <dir>/head/<f> <dir>/after/<f>` | The checker prints `ALL OK`; each of the 4 Overview shots `diffPx 0`. B's runs of the same recipe: sketch server vs in-job HEAD server ALL OK and 0 px (`probe/pxdiff-head-5177.txt`); the HEAD tree fails the checker (`probe/hooks-check-head.txt`). **Record only:** full-window shots (`full-<w>.png`; B saw 10–34 px of noise outside the Overview between two sketch-server runs, 0 px HEAD vs HEAD on :5173: `probe/pxdiff-full-window.txt`) |
| C7 | **G441-AUTH + SMOKE + REAL EXPORT (browser)** | Fresh anonymous context: `/studio-lab`, `/studio/middle-east`, and `GET /api/studio-token?product=middle-east&file=stem.mp3` with no Authorization. Then `cd c-round-441 && node ../b-round-437/probe/play-status.mjs > play-status.json` and, from the loop root, `node b-round-436/probe/press-export-probe.mjs http://127.0.0.1:5173 <abs dir under c-round-441/>`. One retry after a cold-start timeout; record both | `auth_user` is null; "Sign in required" with 0 `audio[src]`; token API 401; fake bearer BLOCKED (backend unavailable in cloud). Play: "Loading …", then ready; the second press plays and the clock advances. Export `czaba-studio-lab.wav`, 29189420 bytes, `RIFF`…`WAVE`; the button returns to "Export WAV" at opacity 1 |
| C8 | **CLAIMS** | `bash b-round-440/claims-441.sh`, compared with `b-round-440/claims-441-planning-output.txt` | The diff equals `b-round-440/claims-441-expected-after-A.diff.txt`. Anything else is a finding |
| C9 | **DOC** | Doc 287 | TEMPLATE headings in order (L26). Line 4 is exact (L28). It cites every mutant id with the C4 results, rulings S2-R1/2/3, and the two TODO items |
| C10 | **SOURCE-SCOPE** (end) + **L57** | As C1; then `python3 -I tools/l57-check.py c-round-441.json c-round-441/l57-check.txt` | As C1; rc 0 |
| gate | Full vitest, typecheck, build, Biome, verify | **Not run by C.** List them under `"gate"`. B's run on the sketch: 273 files, 4030 tests, rc 0 [K19] |

- **C's JSON:** all L57 fields. `mutantRedOnSketch` names `b-round-440/mutants/results.jsonl`. Every bug has an enum `origin`.
- **Ableton conformance:** does not apply (no behaviour change).
- **Neighbouring behaviour that could break:**
  - Overview drag, click, double-click, keys and the frame/playhead. C6's pixels and the covering OV-* rows cover the static part.
  - The export dialog's video-sound line is unchanged (UM8b reads it).

## 5. Claims (`b-round-440/claims-441.sh`; B's run `b-round-440/claims-441-planning-output.txt`)
| Claim | What it checks |
|---|---|
| K1 | HEAD and gate 440 |
| K2 | Tree status: total, outside-grants |
| K3 | Frozen manifest |
| K4 | Protected manifest; granted protected files |
| K5 | The 6 sketch paths equal the sketch files |
| K6 | The sketch applies to the tree |
| K7 | OV1's exact overlay source pin |
| K8 | Positional Overview finders in panel-radius-ui, content-colour-ui and overview-visibility-ui |
| K9 | UM8 reads the dialog source |
| K10 | Overview hooks and the `data-testid` count in `ArrangementOverview.tsx` |
| K11 | Cited artifacts exist |
| K12 | Archive of round 440 against B's planning-time copy `b-round-440/current-task-before-441.md`. It is not an independent source: both were copied from the same file in this planning |
| K13 | Backlog ids (`tools/find-ids.py`) |
| K14 | Open Critical/High/Medium ids |
| K15 | Backlog version and last D-ID |
| K16 | C round 440 result |
| K17 | sketch-review names the sha; `l58-check` |
| K18 | Mutant results |
| K19 | B's full run on the sketch |
| K20 | `lessons.md` line count |
| K21 | Doc 287 present; last doc; TEMPLATE.md exists |
| K22 | The SSR-empty premise: the new OV1 title passes in B's covering run on the sketch |
| K23 | B's HEAD browser probe: state, outline and lanes counts, Overview bbox per viewport |
| K24 | Hook sweep over `app`, `perf` and `e2e` |
| K25 | track-group-mix-ui describe timeout (20 s) and UM8b's time on the sketch |
| K26 | `regression-last.json` |
| K27 | Lint and typecheck on the sketch |
| K28 | B's sketch-server browser probe: outline count per state and viewport (`probe/sketch/overview-hooks.json`) |
| K29 | L31 headroom of the 12 covering files (`b-round-440/l31-headroom.txt`, worst loaded 37.0 %) |
| K30 | `In Progress (stage` docs: none belongs to SYS-1 (doc 286 is `Completed`), so no earlier-stage status line is granted (L28) |

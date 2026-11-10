# Round 436: COPY-PD-VIS stage 1 — Detail panel and footer say "Clip origin" instead of "Source offset" (STUDIO-VIS-4 + SR-435-2), and the range fields say "From" / "To" (STUDIO-VIS-6)

**Planned by:** B, at the round 435 → 436 planning, 2026-11-10 (`b-round-435.md`). The advisor was consulted after orientation. The round-435 task is archived as `tasks/round-435.md` [K12].

## Decisions (`backlog.json` v419 → v420, `decisions_log_b`) [K14]
- **D-29z1544:** round 435 (RETRO 435) is accepted: C PASS, 0 bugs, `browserVerified` true [K20]. Gate 435 skipped (no source change), so the baseline stays `8233840` [K1].
- **D-29z1545:** COPY-PD-VIS is split into two stages; the scope is unchanged.
  - **Stage 1 (this round):** the two Mediums STUDIO-VIS-4 and STUDIO-VIS-6, plus SR-435-2.
  - **Stage 2 (round 437):** STUDIO-VIS-7, STUDIO-VIS-10 and SABA-LANE-RESIZE-HANDLE [K13]. Each needs state rulings and contrast measurements, so they are not bundled here.
- **D-29z1546:** the Lows from the tech-lead sketch review go to `deferred_low_polish`: TL-R436-02-INLINE-STATUS and TL-R436-03-LABEL-IN-NAME [K13].
- **D-29z1547:** the dispatch, the reference and the deviations (below).

## Read first
- `lessons.md` (60 lines) [K22]. The lessons that apply here:
  - L3: a text change gets a widest-state row.
  - L23: test collisions; the full suite on the sketch.
  - L29: tagged claims.
  - L39: persistent text.
  - L56–L58: artifacts and the sketch.
  - L57: C's JSON fields.
- **L38:** never run vitest while a browser probe runs.
- **L59/L60:** run every row until it has a result. Write `c-round-436/progress.json` after every row. Destructive commands stay inside `c-round-436/`.

## Baseline: HEAD `8233840`, clean tree
- `git rev-parse HEAD` is `8233840` [K1]. At planning, `git status --short --untracked-files=all` is empty [K2].
- **Frozen files:** `b-round-435/r436-frozen-sha256.txt` lists every tracked file except the 11 grants: **1334** entries, rc 0 [K3].
  - Check it from `store/` with `sha256sum -c --quiet ../tmp/studio-real-loop/b-round-435/r436-frozen-sha256.txt`.
  - The 11 protected files in `b-round-318/protected-sha256.txt` give rc 0, and none of them is granted [K4].

## 0. Why this round
- **Open Mediums come first.** STUDIO-VIS-4 and STUDIO-VIS-6 are open Medium items that Saba approved (policy section "Studio visual audit findings", 2026-11-10; his answer 1 is "Clip origin"). The 2026-10-23 bug gate puts open Mediums before new scope.
- **The same word appears in three places.** SR-435-2 (RETRO 435 screen review) found a second one, the footer clip line. The sweep below found a third, the move/trim status [K8c] [K9].
- **REGRESSION is not due yet.** `regression-last.json` says 2026-11-10, so it is due at the first planning on or after 2026-11-13 [K7].
- **Q4 uses its default.** Saba has not answered Q4 in `user-review/questions-retro-435.md` [K21], so the approved bare "From" / "To" applies unchanged.

## 1. What the code does today (tagged)
- **`strings.ts` holds four literals** [K8]:
  - `sourceOffsetLabel: 'Source offset'`, the Detail panel info row;
  - the part `clip-offset-label` with text `' · source offset '`, used by the footer selected-clip line and by that line's `title`;
  - `rangeFromLabel: 'From, s'`;
  - `rangeToLabel: 'To, s'`.
- **Range field labels.** The Detail panel renders the From/To text as the first child of each `<label>`. Each input has its own `aria-label` from `rangeStartLabel` / `rangeEndLabel`: "Time selection start (seconds)" and "Time selection end (seconds)" [K8b].
- **Move/trim status.** `ArrangementClip.tsx` writes it inline: `…, length …, source offset ${formatArrangementTime(updated.sourceOffset)}.` [K8c].
- **UI sweep** (roots `app`, `perf`, `e2e`, excluding `__tests__`): 3 lines contain "source offset" (the three above), and 0 contain "clip origin" [K9].
- **Test sweep** (roots `app/**/__tests__`, `perf`, `e2e`): 24 lines in 8 files pin the old literals [K9b]. Test *titles* that describe the internal concept (for example "lowers the source offset") are not literals, and they stay.
- **Browser at HEAD** (`b-round-435/probe/head/copy-probe.json`, both viewports) [K15]:
  - the Detail row reads "Source offset 00:00.000";
  - the footer line ends "· source offset 00:00.000";
  - a name-bar drag writes "Move clip: start 00:02.000, length 01:41.352, source offset 00:00.000.";
  - a left-edge trim (grabbed 4 px above the clip's bottom edge, so it misses the fade handle) writes "Trim — left edge: start 00:03.200, length 01:40.152, source offset 00:01.200.";
  - across the probe's states (empty, selected, after move, after trim), "source offset" appears 11 times in DOM text and `title` attributes;
  - the footer line has 0 overflow at both viewports (884 / 724 px wide);
  - at 1280×720 the Detail panel starts collapsed, and the probe expands it with `arrangement-detail-toggle`.

## 2. Rulings (B; the tech-lead review is in `b-round-435/sketch-review.md`, verdict approve-with-lows) [K10]
1. **One word, every place.**
   - "source offset" leaves the user-visible and assistive DOM entirely.
   - The Detail label, the footer part (its text and `title`) and the move/trim status all say "clip origin"; as a label it is "Clip origin".
   - Internal identifiers (`sourceOffset`, `sourceOffsetLabel`, `clip-offset-label`) keep their names.
2. **The inline status stays inline,** for the smallest diff. Moving it into `strings.ts` is TL-R436-02-INLINE-STATUS (deferred Low).
3. **The range inputs' accessible names do not change.**
   - Element ruling: *range input accessible name: the `aria-label` (with "(seconds)") wins over the visible label text.* So the unit stays available to assistive tech.
   - Label-in-name (WCAG 2.5.3) was already unmet at HEAD (TL-R436-03-LABEL-IN-NAME, deferred).
4. **Layout:** the label, input and info-row boxes must equal HEAD's at both viewports. Measured: identical [K15]. The persistent text-line counts are equal too: 138/168/118/144, and outside the timeline 97/124/86/101, on both HEAD and the sketch [K24].
   - Element ruling: *Detail range column: "boxes equal HEAD" wins over "own text may change".*
5. **Test titles** that name the internal concept stay (TL-R436-01). Only assertion literals change, and no assertion is removed.

## Reference: how Ableton Live 12 does it
| Behaviour | Source | Confirmed there | CZABA decision | C check |
|---|---|---|---|---|
| Name for where in the source file the clip begins | Live 12 manual §8.2.1 "Clip and Loop Region Settings" (https://www.ableton.com/en/live-manual/12/clip-view/, read 2026-11-10 with WebFetch) | Clip View has start and end position value fields, with "Set Start" / "Set End" buttons | **Deviation (Saba-approved, audit answer 1):** "Clip origin". CZABA already uses "Start" for the timeline position, so Live's word would be ambiguous here | C3 |
| Unit of those fields | same §8.2.1 | Unwarped audio shows minutes-seconds-milliseconds; warped audio shows bars-beats-sixteenths | **Deviation (Saba-approved, STUDIO-VIS-6):** the visible labels drop the unit, and the fields show bare seconds. It is still open with Saba as Q4 / SR-435-1 [K13b], so it is not settled (L44) | C4 |
- **Product-designer step: not run.** The copy comes from product-designer's own audit (`studio-visual-audit-2026-11-10.md` STUDIO-VIS-4/6), and Saba approved it.
- **No journey row (L54):** the change touches no entry, exit or hand-off.
- **No control-chrome rows (L61):** no native control changes.

## 3. What A changes (sketch `b-round-435/sketch-436.patch.txt`, sha256 `4bb19dd1f7954794…`, 10 `diff --git` headers) [K5] [K10]
From `store/`, run `git apply ../tmp/studio-real-loop/b-round-435/sketch-436.patch.txt`, then review the result and keep it. The sketch is the whole code change:
- `app/lib/arrangement/strings.ts`: 4 literals ("Clip origin", " · clip origin ", "From", "To").
- `app/components/arrangement/ArrangementClip.tsx`: the status literal "source offset" becomes "clip origin".
- 8 test files (`b-round-435/covering-files.txt`): assertion literals only, 24 lines [K9b].

A also writes the implementation doc `docs/implementation/2026/quarter-IV/283-studio-vis-4-6-detail-copy.md`. 283 is the next free number; the last existing one is 282 [K6]. The doc must:
- carry the TEMPLATE headings (L26);
- have l.4 exactly `Completed (C round 436 PASS)` (L28);
- cite only tests that exist.

**STOP (L11)** if the sketch does not apply, if any covering file is red, or if any file outside the grants changes.

## 4. Grants (`b-round-435/grants-436.txt`, 11 paths)
The 10 sketch paths plus doc 283. Nothing else in `store/` may change.

## 5. A's checks (the full suite and verify belong to the gate)
| # | Check | PASS means |
|---|---|---|
| A1 | `git apply --check` the sketch, then apply it; compare `git diff` with the sketch | Identical |
| A2 | From `store/`: `npx vitest run $(cat ../tmp/studio-real-loop/b-round-435/covering-files.txt)` | rc 0. On B's sketch: **8 files, 208/208** (`b-round-435/precheck-covering.log` [K17]) |
| A3 | `npm run typecheck`; `npm run lint` | rc 0 for each. On B's sketch, lint gives 205 warnings, the same as HEAD [K23] |
| A4 | The K9 and K9b sweeps after the change | Equal to B's sketch run `b-round-435/claims-436-sketch-output.txt`: K9 0/3, K9b old 0 / new 20 |
- **code-reviewer: required** (3+ files changed). Every Medium+ it finds is a STOP unless `sketch-review.md` already rules on it.
- **Full suite:** B ran it on the sketch: 272 files, 4018 tests, rc 0 [K18]. It is a gate row, not A's.

## 6. C's acceptance
**Order:** C1 (SOURCE-SCOPE start), then the browser rows C3–C7, then the rest.
- Write `c-round-436.md` and `c-round-436.json` as you go.
- Never run vitest while a browser row runs (L38).

| # | Row | Check | PASS means |
|---|---|---|---|
| C1 | **SOURCE-SCOPE** (start) | `git status --short --untracked-files=all`; the r436 manifest; the protected manifest | Only granted paths changed; both manifests give rc 0 |
| C2 | **PATCH-IDENTITY** | Apply the sketch to a `git archive HEAD` scratch and `cmp` the 10 files against the working tree | All identical; doc 283 is the only extra path |
| C3 | **CLIP-ORIGIN (browser)** | Run `node b-round-435/probe/copy-probe.mjs http://127.0.0.1:5173 <abs dir under c-round-436/>` from the loop root (after the warm-up `b-round-415/screens/warmup.mjs`). Per viewport (1440×900, 1280×720, fresh context) it: waits for `Demo collection ready`; adds the first library item with Enter; clicks the clip's name bar; expands Details at 1280 when the start field is hidden; reads the Detail row and the footer `[title^="Clip: "]`; sets From 1 / To 2 (C4); drags the name bar 80 px right; then trims the left edge by 48 px, grabbed 4 px above the clip's bottom edge | Equal to B's sketch output `b-round-435/probe/sketch/copy-probe.json` [K15]: the Detail row "Clip origin 00:00.000"; the footer text and `title` both "Clip: Middle East — public preview · start 00:00.000 · length 01:41.352 · clip origin 00:00.000"; the move status "Move clip: start 00:02.000, length 01:41.352, clip origin 00:00.000."; the trim status "Trim — left edge: start 00:03.200, length 01:40.152, clip origin 00:01.200." |
| C4 | **FROM-TO (browser)** | C3's run, step "sets From 1 / To 2": this runs **before** the move, while the clip is at 00:00.000 and the fields read 0 and 101.352 (HEAD `b-round-435/probe/head/copy-probe.json`) | The label first-child texts are exactly `From` and `To`. The `aria-label`s are still "Time selection start (seconds)" and "Time selection end (seconds)". After Set selection, the readout is "Time selection: 00:01.000 — 00:02.000 · Music." (the same as HEAD) |
| C5 | **NO-OLD-WORD (browser)** | C3's run: the `scan*` fields count `/source offset/i` in `document.body.innerText` and in every `aria-label`, `title`, `aria-description`, `aria-valuetext` and `placeholder` (states empty, selected, after move, after trim) | 0 everywhere at both viewports (sketch: 0). Control: HEAD gives 11 per viewport [K15] |
| C6 | **BOXES (browser, L3)** | C3's run: the boxes of the From/To labels and inputs, the info row and the Detail panel; the info row's and the footer line's `scrollWidth − clientWidth`, selected and after the trim (the longest footer text: "clip origin 00:01.200") | Equal to B's sketch values in `b-round-435/probe/compare-raw.txt` [K15]: at 1440 each label is 80×40 at x 1022 and 1106; at 1280, x 862 and 946; the row is 288×16. Both overflows are 0 at both viewports |
| C7 | **SCREEN-BUDGET (L39)** | From the loop root: `BASE=http://127.0.0.1:5173 node b-round-435/screens/capture-base.mjs <abs dir under c-round-436/screens>` (the b-round-434 method with a configurable base; the mock API is not needed for these counts). Count as in K24 | 138/168/118/144, outside the timeline 97/124/86/101: equal to B's HEAD and sketch runs (`b-round-435/screens/compare.txt` [K24]). Text differences from HEAD only in the From/To labels, "Clip origin" and the footer part |
| C8 | **MUTANTS** | Re-run `b-round-435/mutants/run.py` on a scratch copy of the tree: `python3 -I run.py <scratch> <dir under c-round-436/>`, with `covering-files.txt` copied into that dir (the script creates `<dir>/mutants/`) | M1–M5 are each red; the sketch is green (B's run: `b-round-435/mutants/summary.txt` [K16]) |
| C9 | **UNIT** | The A2 and A3 commands | As in A2 and A3 |
| C10 | **CLAIMS** | `bash b-round-435/claims-436.sh` compared with `b-round-435/claims-436-planning-output.txt` | The allowed differences are those of B's run on the sketch scratch, `b-round-435/claims-436-planning-vs-sketch.diff.txt` (K2, K5, K8, K8c, K9, K9b; the scratch's own K1 hash is not one), plus K2's total 11 and K6 (doc 283 present) from A's doc. K3 does not change (the manifest excludes the grants). Any other difference is a finding |
| C11 | **DOC** | Doc 283 | TEMPLATE headings in order (L26); l.4 exact (L28); every cited test row exists |
| C12 | **G436-AUTH (browser)** | Fresh anonymous context: open `/studio-lab`, then `/studio/middle-east`, then `GET /api/studio-token?product=middle-east&file=stem.mp3` with no Authorization header | `/studio-lab` opens with `auth_user` null; `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`; the token API returns 401. Fake bearer: BLOCKED (backend unavailable in cloud) |
| C13 | **SMOKE (browser)** | Play about 1.5 s, then Stop; open Export, then close it with Esc | The clock advances, then holds; the dialog opens and closes |
| C14 | **SOURCE-SCOPE** (end) + **L57** | As C1; then `python3 -I tools/l57-check.py c-round-436.json c-round-436/l57-check.txt` | As C1; then rc 0 |
| gate | Full vitest, typecheck, build, Biome, verify | **Not run by C.** List them under `"gate"` |

- **C's JSON:** all L57 fields. `mutantRedOnSketch` names `b-round-435/mutants/summary.txt`. Every bug carries an enum `origin`.
- **Ableton conformance:** the two deviations above. "Clip origin" is confirmed by Saba; the bare unit is `awaiting_user` (Q4).
- **Neighbouring behaviour that could break:**
  - the footer line's `title` (the LSU6 / WSU4 contracts);
  - the trim and move status texts that the grid and marker snap tests read;
  - the Detail group state (two selected clips).

## 7. Claims (`b-round-435/claims-436.sh`; B's run: `b-round-435/claims-436-planning-output.txt`, stderr `b-round-435/claims-436-planning.err`; on the sketch scratch: `claims-436-sketch-output.txt`, diff `claims-436-planning-vs-sketch.diff.txt`)
| Claim | What it checks |
|---|---|
| K1 | HEAD and gate 435 |
| K2 | Tree status: total, and paths outside the grants |
| K3 | The frozen manifest |
| K4 | The protected manifest, and how many protected files are granted |
| K5 | The sketch applies |
| K6 | The last implementation doc; doc 283 is absent |
| K7 | The regression date |
| K8 | The old and new string literals in `strings.ts` |
| K8b | The `aria-label` strings and their use in the Detail panel |
| K8c | The inline status literal |
| K9 | The UI sweep |
| K9b | The test-literal sweep |
| K10 | The sketch sha, the review naming it, and the header count |
| K11 | The cited artifacts exist |
| K12 | The archived task |
| K13 | Backlog ids (`tools/find-ids.py`) |
| K13b | The SR-435-1/2 screen candidates |
| K14 | The backlog version and the last D-ID |
| K15 | The probe summary |
| K16 | The mutants |
| K17 | The covering run |
| K18 | The full run on the sketch |
| K19 | `l58-check` on this task |
| K20 | C round 435 |
| K21 | Saba's answers (STEM-LANES, the retro-435 questions) |
| K22 | `lessons.md` line count |
| K23 | Lint and typecheck on the sketch |
| K24 | Screen line counts, HEAD and sketch |
| K25 | STEM-LANES answer by round 435's method (2 = unanswered) |

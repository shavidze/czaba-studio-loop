# Round 443: SYS-3 stage 1 fix-up — a held Enter or Escape after an IME composition never commits or cancels (C-R442-M1)

**Planned by:** B, at the round 442 → 443 planning, 2026-11-11 (`b-round-442.md`).
- The advisor was available and was consulted after orientation and before writing.
- The round-442 task is archived as `tasks/round-442.md` (byte-identical copy, [K12]).
- **Runtime change:** the Enter/Escape branches of three inline editors ignore an auto-repeat keydown, as the group editor already does. The visible UI does not change. 3 source files, 1 test file and doc 288 change (5 paths, `b-round-442/grants-443.txt`).
- **What does not apply, and why:** reference-first, `product-designer` and the screen budget — this is a bug-fix round with no visible change. No Ableton reference: the behaviour is the platform text-input standard (W3C UI Events `KeyboardEvent.isComposing` and `KeyboardEvent.repeat`). Recorded as "no Ableton reference; platform standard".
- **Baseline:** gate 442 is `published`, commit `4aa3c82` [K1]. The store tree is clean at `4aa3c82` [K2].
- **Regression:** not due. `regression-last.json` is 2026-11-10 (round 425); the next is due on or after 2026-11-13.

## Decisions (`backlog.json` v428 → v429, `decisions_log_b`)
- **D-29z1573: round 442 accepted.** `c-round-442.json` is PASS with `browserVerified` true [K13]; gate 442 published `4aa3c82` [K1]. SYS-3 stage 1 passes: ROOT-R65-L5 and A-R165-IME-ENTER are closed (the held-key remainder is C-R442-M1). Gate-442 review items: GATE442-L1-KEYCODE-229-NOTE (Low) and GATE442-I3-PARENT-LISTENER-TRY-FINALLY (info) go to `deferred_low_polish`; GATE442-L2-JSDOM-ONLY stays covered by TLM-SYS3-IME-PLATFORMS. A's and the gate's Architecture notes become one signal, SIG-R442-INLINE-EDITOR-KEYS (not scheduled; decided at SYS-3 stage 2). Process question for RETRO 450 (RETRO450-Q-STOP-THEN-PUBLISH): A reported a STOP on an unruled Medium, yet C ran and the gate published.
- **D-29z1574: ruling on C-R442-M1 / A-R442-REVIEW-M1 (L10, L11).** Accepted as **Medium, contract level**.
  - **Fact (B pre-check, real Chromium on `4aa3c82`):** a synthetic CDP sequence (composing keydown → `Input.insertText` → 3 `autoRepeat` keydowns → keyUp) fails **8 of 18 cells** [K16]: Tempo Enter commits 96 BPM and blurs; Tempo Escape, Marker Escape and Clip Gain Escape cancel. Marker Enter, group, From/To and Clip Gain Enter already hold.
  - **Not confirmed:** that a real OS IME sends that sequence. It stays on TLM-SYS3-IME-PLATFORMS, which gains the step "hold Enter/Escape while confirming a candidate".
  - **Fix:** every Enter/Escape branch of those three editors ignores `event.repeat` (still `preventDefault`), the same rule as the group editor and HM11b [K10]. Non-IME users see no change: the first, non-repeat keydown still acts.
  - A-R442-REVIEW-L1 (no plain Escape after a composing key) and A-R442-REVIEW-L2 (weak IME1 final assertion) are attached: same test file, low cost.
  - tech-lead (`b-round-442/sketch-review.md`): v1 approve and v2 delta approve, 0 Medium+. G1 applied in v2; G3 (plain held-key jsdom rows) → TL-R443-G3-PLAIN-HELD-ROWS, SYS-3 stage 2; source-scan → SYS-3 stage 2 after one shared helper.
- **D-29z1575: order.** 1. this fix-up (round 443); 2. SYS-3 stage 2 (focus-source M1/I1, Library search, sheet/Modal Escape, the shared settle-key helper + scan of SIG-R442, TL-R443-G3); 3. REGRESSION-2026-11-13 at the first planning on or after 2026-11-13 (it goes first if due); 4. STORE-REDESIGN 2b…5; 5. ARCH-SPLIT (frontend-architect checkpoint via root first); 6. REVIEW-RECOMMENDATIONS; 7. T12-ADVANCED; 8. phase 2 under the skip rule. Next RETRO: round 450.

## Read first
`lessons.md`. Apply especially L4 (no assertion lost), L10/L11 (STOP on an unruled Medium+), L23 (collision sweep — B ran the round-441 covering set of 60 files on the sketch: 1118/1118 [K15]), L26, L28 (doc line 4), L38 (no vitest during a browser probe), L47 (focus target), L56/L58 (cited artifacts exist; asserted numbers come from B's run on the dispatched sketch).

## 1. What changes
Sketch `b-round-442/sketch-443.patch.txt` (v2, sha256 in `b-round-442/sketch-443.sha256` [K6]); 4 paths in `b-round-442/sketch-paths.txt`; copies in `b-round-442/sketch-files/`; review `b-round-442/sketch-review.md`.

| Site | Handler [K7] | HEAD (`4aa3c82`) | After |
|---|---|---|---|
| BPM field `arrangement-tempo-input` | `handleTempoKeyDown`, `ArrangementTempoRow.tsx` | Enter: `preventDefault` + blur (no repeat check). Escape: `preventDefault`, skip commit, drop draft, blur | Enter: `preventDefault`; blur only when `!event.repeat`. Escape: `preventDefault`; return on `event.repeat` **before** `skipCommitRef` is set; otherwise as HEAD |
| Marker name editor `arrangement-marker-name-input` | inline Enter/Escape branch, `ArrangementMarkerRow.tsx` | `stopPropagation` → IME guard → `preventDefault` → `preventRepeatedEnterKeyDown` (Enter only) → settle | `if (event.repeat) return;` replaces the Enter-only check (same as the group editor) |
| Detail Clip Gain `arrangement-detail-clip-gain-input` | `handleClipGainKeyDown`, `ArrangementDetailPanel.tsx` | Escape: `preventDefault` + revert text | Escape: `preventDefault`; revert only when `!event.repeat` |

- **Unchanged:** the IME guard and its position (5 calls [K8]), the group editor, Detail From/To, every other key handler, the blur commit path, `studio-repeat-safe.ts`. `held-enter-source-scan.test.ts` HS1 stays green (no inline `key === 'Enter' && repeat` copy).
- **Focus (L47):** a swallowed repeat leaves focus in the same field (no unmount). A fresh plain key lands where it does at HEAD: Tempo → focus leaves the field (blur); marker editor Escape → `arrangement-marker-add`, Enter → the new flag; Clip Gain stays focused.
- **Tests (`ime-composition-ui.test.tsx`):**
  - IME1 gains `status === tempoStatusMessage(96)` after the plain Enter (A-R442-REVIEW-L2).
  - **IME6** (×2 forms): composing key + 3 `repeat: true` keydowns on Tempo, marker editor and Clip Gain (Enter and Escape each): focus, value, open editor and the full snapshot stay; then a fresh plain key acts (BPM Enter commits 96; marker and Clip Gain Escape cancel).
  - **IME7** (×2 forms, A-R442-REVIEW-L1): composing Escape then plain Escape cancels as before on Tempo (draft dropped, snapshot equal), marker (editor closed, no marker), group (name stays "Stems") and Clip Gain (text reverted, arrangement equal).
- **Neighbours that could break:** held-Enter guards (HS1, HM11b, panel/mixer held-Enter suites), tempo-ui U6 (Escape restores), Clip Gain Escape rows (`clip-gain-multi` MG9, `clip-gain-pointer-preview` CP16), marker editor rows in `markers-ui`. All are in the 60-file covering set and pass on the sketch [K15].

## 2. A — implementation (Claude Opus 5.5)
1. Precondition: `bash b-round-442/claims-443.sh | grep -E '^K(1|2|5|6) '` prints `K1 head 4aa3c82 gate442 published 4aa3c82`, `K2 status total 0 outside-grants 0`, `K5 sketch-applies yes`, `K6 sketch-sha 6b68ac9e67276bd9 expected 6b68ac9e67276bd9`. Anything else is a STOP.
2. In the store: `git apply --check -p1 <loop>/b-round-442/sketch-443.patch.txt`, then `git apply -p1 <loop>/b-round-442/sketch-443.patch.txt`. Do not hand-edit the sketch.
3. Update `docs/implementation/2026/quarter-IV/288-sys-3-stage-1-ime-composition.md` (Georgian, English technical terms; follow `docs/implementation/TEMPLATE.md`):
   - line 4 exactly `**სტატუსი:** In Progress (stage 1 of 2; C round 443 PASS)` (L28);
   - add a fix-up section: the C-R442-M1 ruling (fact vs not confirmed), the 3-site table, the 7 mutant ids of `b-round-442/mutants/results.jsonl`, the browser lines (HEAD `NOT ALL OK (8 of 18 failing)`, sketch `ALL OK (18 cells)`), IME6/IME7 and the IME1 assertion;
   - in the known-gaps/TODO part, remove the held-key gap; keep stage 2 (now also the shared settle-key helper + scan and TL-R443-G3) and TLM-SYS3-IME-PLATFORMS (now with the held-key step). Every test the doc names exists (L26).
4. **Grants (exactly 5 paths):** `b-round-442/grants-443.txt`. Any other changed path is a STOP.

**A's checks (only these; the full suite is a gate row):**

| # | Check | Pass |
|---|---|---|
| A1 | `cmp` each path in `sketch-paths.txt` against `b-round-442/sketch-files/<path>` | 4/4 identical |
| A2 | `npx vitest run $(cat <loop>/b-round-441/covering-files.txt)` | rc 0, 60 files, 1118 tests [K15] |
| A3 | `npm run typecheck`; `npm run lint`; `npx biome check $(cat <loop>/b-round-442/sketch-paths.txt)` | rc 0; rc 0 with `Found 205 warnings.` (HEAD and sketch both 205: `b-round-442/logs/lint-head.log`, `lint-sketch.log`); rc 0 [K17] |
| A4 | `bash b-round-442/claims-443.sh` after the change, diffed against `b-round-442/claims-443-planning-output.txt` | only K2 (`total 5 outside-grants 0`), K4 (`4/4`), K5 (`no`, already applied), K9 (`IME6 1 IME7 1`), and K11 (line 4 = `… C round 443 PASS)`) differ |

- 5 files change, all sketch-identical except the doc; A runs `code-reviewer` (3+ files rule) and passes its Architecture note to B. A Medium+ finding that `sketch-review.md` does not rule is a STOP (L11).

## 3. C — verification (rows)
Write `c-round-443/progress.json` after every row (L59). Run C5–C7 before any vitest (L38).

| Row | What | Pass |
|---|---|---|
| C1 SOURCE-SCOPE | `git status` paths ⊆ `grants-443.txt`; K3 protected rc 0 | the 5 granted paths only |
| C2 PATCH-IDENTITY | the 4 sketch paths vs `b-round-442/sketch-files/` | 4/4 identical |
| C3 COVERING | `npx vitest run $(cat b-round-441/covering-files.txt)` | rc 0, 60 files, 1118/1118 |
| C4 MUTANTS | copy `b-round-442/mutants/run-mutants.py` to `c-round-443/`; run with `SCRATCH=<C's own git archive HEAD + sketch, node_modules symlinked>` and `OUT=c-round-443/mut` (must start empty) | 7 lines; each `id`, `rc` and `failedRows` equal `b-round-442/mutants/results.jsonl` |
| **C5 HELD-IME-BROWSER** (contract row) | `BASE=http://127.0.0.1:5173 node b-round-442/probe/ime-held.mjs ALL 1440x900,1280x720 > c-round-443/held-tree.json`; `python3 -I b-round-442/probe/compare-held.py c-round-443/held-tree.json` | `ALL OK (18 cells)`. A cold-start `error` cell is environment-invalid and is re-run (max 2 replacements), never a FAIL. This row proves the handler contract only; real IME platforms stay TLM |
| C5-HEAD control | HEAD on :5177 (`b-round-440/probe/head-server.sh start <dir> 5177`, stop by port), one warm `/studio-lab` load, same probe + compare | equals `b-round-442/probe/compare-head.txt` line for line (`NOT ALL OK (8 of 18 failing)`) |
| C6 STAGE-1 NEIGHBOUR | `BASE=http://127.0.0.1:5173 node b-round-441/probe/ime-sites.mjs ALL 1440x900,1280x720` + `python3 -I b-round-441/probe/compare.py` | `ALL OK (18 cells)` (round-442 behaviour kept) |
| C7 PLAIN HELD KEYS (no IME) | `BASE=http://127.0.0.1:5173 node b-round-442/probe/plain-held.mjs ALL 1440x900,1280x720 > c-round-443/plain-tree.json`; the same on C's HEAD server :5177 → `c-round-443/plain-head.json`; `python3 -I b-round-442/probe/compare-plain.py c-round-443/plain-tree.json c-round-443/plain-head.json` | tree output equals HEAD output: `ALL SAME (18 cells)` (B's run: `b-round-442/probe/compare-plain-planning.txt`). Plain users see HEAD behaviour |
| C11 CLAIMS | run `bash b-round-442/claims-443.sh`, diff against `b-round-442/claims-443-planning-output.txt`; L29 tag grep over this task | only K2, K4, K5, K9, K11 differ, as in A4 |
| C8 SMOKE + AUTH | anonymous `/studio-lab`: `auth_user` null; `/studio/middle-east` shows "Sign in required", 0 `audio[src]`, studio token 401; Play reaches Playing and Stop returns to Stopped at both viewports | as round 442 |
| C9 DOC-288 | TEMPLATE headings in order; line 4 exact; fix-up section with the 7 mutant ids, both browser lines, the TLM held-key step; every named test exists (L26) | all present |
| C10 SOURCE-SCOPE-END | rerun C1 | unchanged |
| gate | full vitest, typecheck, build, Biome, verify | `gate` (not claimed by C) |

**CZABA requirement:** an IME user can confirm or cancel a candidate with a held key without losing the editor. **Ableton conformance:** not applicable (platform standard). **Tech Lead manual (does not block):** TLM-SYS3-IME-PLATFORMS with the new held-key step, deadline RETRO 450.

## Claims (`b-round-442/claims-443.sh`; planning output `b-round-442/claims-443-planning-output.txt`)

| Tag | Claim | Expected at planning |
|---|---|---|
| [K1] | HEAD and gate 442 | `4aa3c82 gate442 published 4aa3c82` |
| [K2] | clean tree | `total 0 outside-grants 0` |
| [K3] | protected files | `rc 0 granted-protected 0` |
| [K4] | tree vs sketch | `0/4` |
| [K5] | sketch applies | `yes` |
| [K6] | sketch sha (v2) | `6b68ac9e67276bd9` |
| [K7] | the handlers | `tempo-handler 1 gain-handler 1 marker-editor-testid 1` |
| [K8] | IME guard calls | `5` |
| [K9] | new rows absent | `IME6 0 IME7 0` |
| [K10] | HM11b precedent | `1` |
| [K11] | doc 288 | present, line 4 `… C round 442 PASS)` |
| [K12] | archive | `current-is-new archive442 present` |
| [K13] | C round 442 | `PASS True 1` |
| [K14] | mutants on v2 | `7 red 7` |
| [K15] | covering on v2 | `60`, `1118 passed`, `rc 0` |
| [K16] | browser | sketch v2 `ALL OK (18 cells)` / head `NOT ALL OK (8 of 18 failing)` |
| [K17] | typecheck / scoped Biome on v2 | `rc 0` / `rc 0` |
| [K18] | artifacts | `checked` |
| [K19] | sketch review names the dispatched sha; `tools/l58-check.py current-task.md` | `L58 OK` |
| [K20] | v2 sketch server probes | held `ALL OK (18 cells)`, stage-1 sites `ALL OK (18 cells)`, plain tree vs HEAD `ALL SAME (18 cells)` |

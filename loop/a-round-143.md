# A — Round 143 report: V-0.4e fix-up (C-R142-01 video Clip Gain reason + polish leftovers)

Date: 2026-10-24 · Implementer: A · Task: `current-task.md` (round 143, D-29z108)

**STATUS: STOP-RULE ITEM RAISED, B must rule before C runs.** Probe criterion (a) PASS. Criterion (b) is FAIL under the literal ≤1 px rule: the placeholder delta is (+16, 0, −32, 0). The cause is the placeholder's own English text width (see §5). All code edits, tests, mutations, reviewer and end checks are complete.

## 1. Start checks (all OK)
- HEAD `6e9f9b1e97d67703ba34e8b2a260a0a5215c3506`.
- Frozen list `b-round-142-r143-tree-sha256.txt`: 955 entries, `sha256sum -c --quiet` OK.
- The 8 start hashes are OK in the tree and in `b-round-142/r143-granted-start/`.
- `git status --short`: exactly the 22 round-142 paths (20 ` M` + 2 `??`).
- Pre-grep `for its sound use the track` over app/e2e/docs: **7 hits, all granted** (strings.ts:637, 5 test files, doc 118 l.36). Saved in `a-round-143/pre-grep.txt`.
- Doc 118 (untracked) pre-edit copy and sha256 (`bae26298…`) are in `a-round-143/pre-edit/`.

## 2. Changed files (8 granted, all via Edit)
| ID | File | Change |
|---|---|---|
| VR1 | `app/lib/arrangement/strings.ts` | `clipGainVideoReason` → `'A video clip has no Clip Gain — use the track Volume/Mute'` (U+2014) |
| VR2 | `__tests__/strings.test.ts` | ST41 expected literal |
| VR3 | `clip-gain-fader.test.tsx`, `clip-gain.test.tsx` | `VIDEO_REASON` literal (single line, as before) |
| VR3 | `detail-panel-reason.test.tsx`, `detail-panel-fit.test.tsx` | `CLIP_GAIN_VIDEO_REASON` literal. **Biome join:** the two-line const became one line (91 chars, Biome demanded it), so later lines shift by −1 |
| PL1 | `detail-panel-polish.test.tsx` | the 2 `it` titles: `in Georgian` → `in English` (l.381, l.394) |
| PL2 | same | `not.toContain('end, წმ')` → `not.toContain('წმ')` (l.391, l.407) |
| DOC | `docs/implementation/2026/quarter-IV/118-…md` | status line (l.4), table row l.36 English cell, one new Problem → Solution entry for C-R142-01 |

- Full diff against the start copies: `a-round-143/diff-vs-start.patch`.
- `it` counts are unchanged: strings 44, clip-gain-fader 14, clip-gain 28, detail-panel-reason 6, detail-panel-fit 7, polish 16 (`it-counts-before.txt` = `it-counts-after.txt`).
- Fixture check for PL2: the only Georgian data in the polish file is the track names `ვიდეო` and `მუსიკა`, and neither contains `წმ`. The guard is green on the current tree.

## 3. Checks actually run
- `npm run typecheck`: exit 0.
- `npm run lint`: exit 0 (218 warnings and 1 info that were already there, none in the changed files).
- `npx biome check` (read-only) on the 7 changed code/test files: 0 diagnostics.
- `npx vitest run` on 15 files (the 6 granted + detail-panel-strings-ui, detail-panel, panels, clip-gain-multi, library, pending-status, status-announcement-ui, self-disabling-focus, fader-guards): **357/357 passed, 0 failed**. Output in `a-round-143/vitest.json`.
  - Per file: fader 14, multi 14, clip-gain 28, fit 7, polish 16, reason 6, strings-ui 4, detail-panel 24, fader-guards 71, library 11, panels 53, pending 22, self-disabling 10, status-ui 33, strings 44.
- **Not run (gate):** the full suite, verify, build, e2e.

## 4. Mutations (shell temporary writes to strings.ts; restored with `cp` from `a-round-143/mut/strings.ts.bak`, sha256 checked equal after each)
| ID | Red tests (failing line) |
|---|---|
| m88 (old text back) | ST41 (strings.test:2214), CF8 clip-gain-fader:438, clip-gain:776, detail-panel-fit F5:303, detail-panel-reason RF2:289 + RF6:351. Lines are −1 against B's plan in reason/fit because of the Biome join. In clip-gain and clip-gain-fader the first failing expect is in the same `it` B named |
| m89 (`sourceUnchanged` + ` · წმ`) | polish single-clip `it`, failing **on l.391 `expect(content.textContent).not.toContain('წმ');`** (the PL2 line itself). Also ST4, ST41, ST44 |
| m90 (`multiClipNote` + ` · წმ`) | polish group `it`, failing **on l.407 `expect(content.textContent).not.toContain('წმ');`** (the PL2 line itself). Also ST4, ST41, ST44 |

- PL2's own discrimination is proven.
- **Deviation D1:** B predicted that DPS2 (m89) and DPS4 (m90) would also turn red. They stayed **green**: they assert with `toContain`, and a suffix mutation keeps the expected substring. ST4/ST44 turned red instead. No test was changed for this; reported only.
- Logs: `a-round-143/mut/m88|m89|m90.{json,log}`.

## 5. Required browser probe (Playwright Chromium, :5173, fresh contexts)
- Tools: copy of the round-142 probe in `a-round-143/probe/tools/`. Output: `probe/out/detail-a143.json`, comparison `probe/out/compare-vs-6e9f9b1.txt`, video summary `probe/out/video-state-a143.txt`, shots in `probe/shots/`.
- **Invalid run 1:** the first launch threw in `setSnapOff` (`arrangement-grid-control` not yet mounted on a cold dev-server load). It wrote no output. Run 2 was clean and is the measurement.

**1440 video state, against `b-round-141/out/detail-baseline-6e9f9b1.json`:**
- (a) `arrangement-detail-clip-gain-reason`: **1 line**, box [640.5, 779.5, 329, 16] vs baseline [641.5, 779.5, 327, 16], d = (−1, 0, +2, 0). **PASS.**
- (b) `arrangement-detail-video-placeholder`: [735.5, 759.5, 139, 16] vs baseline [719.5, 759.5, 171, 16], **d = (+16, 0, −32, 0)**. **FAIL under the literal ≤1 px rule. STOP, B rules.**
  - The y −8 of C-R142-01 is gone (y and h are now 0). The remaining x/w delta is **not a layout shift**:
    - the parent `arrangement-detail-waveform` box is identical to the baseline ([600, 732, 410, 91]);
    - the placeholder's own text changed in round 142, from `ვიდეოკლიპი · ტალღა არ ჩანს` (171 px) to `Video clip · no waveform` (139 px). The text is centred, so (171 − 139) / 2 = 16 = the x delta, and −32 = the w delta.
  - B's planning assumption ("about 0 px") missed that the placeholder text is itself English now. The 333 px reason candidate **would not change** this delta, because it comes from the placeholder string and not from the reason.
  - **Measured, not just derived.** A's round-142 probe (`a-round-142/probe/out/detail-a142.json`, 1440 video) had the placeholder at [735.5, **751.5**, 139, 16], with the old reason on 2 lines [609, 771.5, 392, 32]. Round 143 changes exactly one placeholder number: y goes from 751.5 back to 759.5, the baseline. **Round 143 adds no new placeholder delta.** It removes the y −8 of C-R142-01. The x/w part comes from the ratified round-142 `videoPlaceholder` string, which is frozen content.
  - **Proposal for B:** accept d = (+16, 0, −32, 0) as an exempt text-width delta, in the same class as R4. If B's §5 LAYOUT row keeps "≤ 1 px x/y/w/h" for the placeholder, C will FAIL on this.
- Other 1440 deltas: only the R4 exempt ones (header label −45/+43, toggle −2/+2, apply +22 w). Panel, columns and the other strict nodes are within ≤1 px. Line counts are no worse. contentScroll 107/107, clipped 0 in all 5 states.

**1280 (panel open):**
- Video state: the reason is **2 lines** ([609, 603.5, 232, 32]), as at baseline.
- contentScroll 98/83 (video), 96/83 (none), 95/83 (multi). clippedBelowPanel 1–2.
- This is the same range as C's round-142 numbers (95–98 / 83). I did not diff it node-by-node against `c-round-142/out/c142-1280-r1.json`; that is C's LAYOUT row.

## 6. Code review (actual `code-reviewer` subagent)
- **Verdict: Approve, 9/10.** No critical issues. It confirmed:
  - the old text is gone;
  - the pins are hand-written;
  - the Biome join is correct (lineWidth 100);
  - PL2 is neither vacuous nor brittle today.
- **Lows (not fixed: outside the exact §1.1 edits, for B):**
  - R-L1: the polish `describe` title at l.362 still says `Georgian detail labels …`. PL1 only granted the 2 `it` titles.
  - R-L2: doc 118 TODO l.101–102 is stale (B's approval is done; "C round 142" should read 143), and its "ტესტირება" section has no round-143 line. DOC granted only status, l.36 and the Problem entry.
  - R-L3 (info): the broader `'წმ'` guard would turn red if a future Georgian fixture containing `წმ` rendered in detail content. Accepted as low risk.
- **Architecture note:** none, keep. (String, test and doc change only; no structural signal.)

## 7. Shell writes
- The mutations m88–m90 used `sed -i` on `app/lib/arrangement/strings.ts`, each restored by `cp` from the backup and sha256-verified (`STRINGS_MATCH_POST_EDIT`).
- Outside `store/`, under `tmp/studio-real-loop/a-round-143/`: copies, logs, probe tools and outputs.
- The `sed -i` on the probe tool copy was in `a-round-143/probe/tools/detail-probe.cjs` (output name), not in store.
- No other writes under `store/`. Every lasting edit went through Edit/Write.

## 8. End state
- `git status --short`: the same 22 paths (`end-status.txt`).
- Frozen list (955): OK.
- Protected `git diff 6e9f9b1`: empty (0 bytes).
- End hashes: `a-round-143/end-sha256.txt` (strings.ts `8262aff7…`, doc 118 `84a269a7…`).
- No commit, stash, checkout, install, `--write` or `check:fix`.

## 9. Acceptance status (A's own; C verifies)
- Passed by A:
  - start checks;
  - pre-grep 7/7 granted;
  - VR1/VR2/VR3/PL1/PL2/DOC edits;
  - typecheck and lint;
  - scoped Biome 0;
  - targeted vitest 357/357;
  - m88–m90 red as required (PL2 line quoted);
  - code-reviewer run;
  - end checks;
  - probe (a).
- **Not passed:** probe (b) under the literal 1 px rule, which needs a B ruling (§5).
- Not claimed: anything gate-level and every C row.

## 10. Next C checks (after B's ruling on §5)
- T143-TARGETED: the same 15-file vitest list, 357 expected.
- SOURCE-SCOPE: against `end-sha256.txt`.
- AN-REVIEW: against `diff-vs-start.patch`. Expect the 2 Biome joins and the doc lines.
- VIDEO-REASON-TEXT: text and `title`, U+2014.
- LAYOUT at 1440, with B's decision on the placeholder delta (+16, 0, −32, 0), and at 1280 against c142-1280-r1.
- NEIGHBOUR-SAMPLE, GEO-COUNT, G143-3, PX-NET / REG-HYD.

## Deviations
- D1: DPS2/DPS4 were not red under m89/m90 (§4).
- D2: the Biome join shifted lines −1 in the reason/fit files (allowed, reported).
- D3: probe criterion (b) failed literally, cause attributed to the placeholder text width (§5).

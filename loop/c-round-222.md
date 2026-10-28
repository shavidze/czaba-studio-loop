# C round 222: B-R220-LEGACY-EXPORT-NO-STEMS (Medium). Independent verification

**Verdict: PASS.** browserVerified = realVerified = true. 12 rows were run and pass. LEGACY-OWNERSHIP-222 is BLOCKED (backend unavailable in cloud). The gate rows are `gate`.

**Deviation to read first:** LEGACY-UI-STUBBED-222 passes, but its WAV sub-criterion ("byte-identical, or decoded PCM identical") is **not met literally**. The default and Select-All files differ by 1 LSB in 284 of 383,996 samples. A control run proves this is pre-existing nondeterminism in the export pipeline and is unrelated to the selection: two exports with the *same untouched default selection* differ by 1 LSB in 318 samples. Per-stem spectrum equality (0.0000 dB on all 10 stems) proves that default = Select All. This is logged as **C-R222-01** (Low, pre-existing). **B to rule (L10)** on amending the criterion to "PCM within 1 LSB plus equal per-stem spectrum".

- Environment: `env-status.json` (store 200, round 222). Chromium 143.0.7499.4 (Playwright). Real mouse. Fresh context per run.
- Evidence folder: `c-round-222/`.
- No app source was edited. The mutants ran only in a scratch copy, `/tmp/c222-scratch`. At the end, the repo `ExportDialog.tsx` was cmp-identical to A's handover copy.

## Rows

| Row | Result | Evidence |
|---|---|---|
| SCOPE-222 (start + end) | PASS. HEAD `6dd45a1`. Only `M ExportDialog.tsx` and the 2 new `??` files. Frozen `sha256sum -c` rc 0, and the root-owned 3 are OK, at both start and end. The repo file was untouched by the mutant work. | `c-round-222/scope-start.txt`, `scope-end.txt` |
| UNIT-222 | PASS. `CI=true npx vitest run …legacy-export-dialog-stems.test.tsx`: 7/7 (ES1–ES7 by id), tests 768 ms, no custom timeout. `npm run typecheck` rc 0. | `unit-run.txt`, `typecheck.txt` |
| REDPROOF-222 | PASS. C's own mutants, on the scratch copy only. **Mutant 1** (HEAD init form, no adjustment): ES1, ES5, ES6 and ES7 red; ES2, ES3 and ES4 green. **Mutant 2** (HEAD form plus `useEffect(() => reset, [state.stems])`): ES3 and ES4 red; the rest green. This matches A's logs. | `mutant1-head-init.log`, `mutant2-useeffect.diff`, `mutant2-useeffect.log` |
| CODE-222 | PASS. The diff adds a pure `createStemIdSetKey` (unique, sorted, JSON), a key state, a lazy initializer and a render-time adjustment. There is no JSX, class, copy or handler change; no `any`, `as` or `@ts-ignore`; and semicolons are present. It follows contract rule 5 (render-phase adjust, no effect). | `git diff` (in this report's session) |
| **LEGACY-UI-STUBBED-222** | **PASS, with the literal WAV sub-criterion unmet (pre-existing, C-R222-01).** <ul><li>The initial state, with Select All not pressed: **10/10 checked, "Export Audio" enabled, label "Deselect All"** at 1440×900 (twice: first open and after reload) and 1280×720. Before the fix, round 221 showed 0/10 at the same viewport.</li><li>MP3 High at 1440: `Middle East-export.mp3`, Xing plus **168 × 320 kbps** frames, ending at EOF. It decodes to 2 ch, 48 kHz, 4.032 s (identical to round 221's decode).</li><li>Same-session WAV A (default, untouched) vs WAV B (after Deselect All → Select All): 768,036 bytes each, headers equal, peaks equal (32,439), **not byte-identical**: 284 samples differ by 1 LSB. The per-stem Goertzel levels are all −19.96 dB in both files (Δ 0.0000 dB), and the RMS is −12.97 in both. The control is in C-R222-01.</li><li>0 page errors in every run.</li></ul> | `legacy/main-1440x900-1-dialog-initial.png`, `legacy/persist-1280x720-1-dialog-initial.png`, `legacy/main-1440.log`, `legacy/main-1440x900.json`, `legacy/spectrum-A-vs-B.json`, `legacy/control-1440.log`; before-fix reference `c-round-221/legacy/High-1280x720-dialog-initial.png` |
| SUBSET-AUDIO-222 | PASS. At 1440, WAV, stem k = **Duduk** was unchecked (9/10, label "Select All"). Result: Duduk (590 Hz) at −99.56 dB; the 9 included stems all at −19.03 dB (median −19.03, minimum −19.03). The gap is **80.5 dB** (≥ 30 required), and every included stem is present. <br>The stem → R2 path → Hz map is attributable: Hz is fixed by the R2 file name in `FREQ_BY_FILE` and never by request order. The names come from the route's `stemsData` (`studio.$productId.tsx` l.161–170, name = file without `.wav`). The map: Bass Drum `/studio/middle-east/Bass%20Drum.wav` 230; Bass `…/Bass.wav` 290; Didgeridoo 350; Dombra Aux Left 410; Dombra Aux Right 470; Dombra Rithm 530; Duduk `…/Duduk.wav` 590; East Zurna 650; Electric Guitar 710; Electric Guitar 2 `…/Electric%20Guitar%202.wav` 770 (full paths in `stemMap`). | `legacy/main-1440x900-4-subset-Duduk.png`, `legacy/spectrum-C-without-Duduk.json`, `legacy/main-1440x900.json` (`stemMap`, `subset`) |
| PERSIST-222 | PASS at 1280×720. Unchecked **Didgeridoo**, then Cancel and reopen: 9/10, Didgeridoo unchecked, label "Select All". Then closed with ✕, and Mute was toggled on a *different* stem in the mixer (track 7, "Duduk"; the button turned red; the dialog shows Duduk with a "Muted" badge). Reopen: still **9/10, the same Didgeridoo unchecked**, label "Select All". | `legacy/persist-1280x720-3-reopen-after-cancel.png`, `legacy/persist-1280x720-4-reopen-after-mute.png`, `legacy/persist-1280x720.json` |
| SELECT-ALL-222 | PASS at both viewports. Deselect All gives 0/10 with Export Audio disabled; Select All gives 10/10 with it enabled. | `legacy/*-2-deselected.png`, `main-1440x900.json`, `persist-1280x720.json` |
| ABLETON-TAB-222 | PASS at 1440. On the Ableton Live tab at open, 10/10 are checked and "Download .als" is enabled. Nothing was downloaded. | `legacy/main-1440x900-3-ableton-tab.png` |
| LAB-SMOKE-222 | PASS at both viewports (anonymous `/studio-lab`). WAV PCM, 2 ch, 48 kHz, 24-bit. 4,864,896 frames = "WAV created: 01:41.352" × 48,000 (diff 0). RMS **−15.29 dBFS** (round 221: −15.29). Non-zero fraction 0.9977. 30 full-scale samples, the same as round 221 at both viewports. 0 page errors. | `g/g222.json`, `g/smoke-*` |
| G222-3 | PASS at both viewports, unstubbed. `/studio-lab` returns 200, with the demo badge and the workspace present, and `auth_user` null. `/studio/middle-east` shows "Sign in required" with 0 `audio[src]` and 0 audio elements. `/api/studio-token` with no header → **401** ("Please sign in to access Studio."). With a fake bearer → 500, no token issued (same as round 221). | `g/g222.json`, `g/g-*-guard.png`, `g/g-*-lab.png` |
| AN-REVIEW-222 | PASS, with one Low (C-R222-02). The TEMPLATE headings are in order (კონტექსტი → TODO). l.4 is byte-exact `**სტატუსი:** Completed (C round 222 PASS)`. The doc cites only ES1–ES7, and all exist. It makes no "Live defaults to…" claim: the default is written as "not stated". The reviewer's amendment, that rule 5 is held by the pattern and review and not by a test, is present (l.27). | `docs/implementation/2026/quarter-IV/174-…md` |
| LEGACY-OWNERSHIP-222 | **BLOCKED**: backend unavailable in cloud. | — |
| gate (suite, build, Biome, verify, e2e smoke) | `gate`: not claimed. | `gates/gate-round-222.json` (root) |

## Ableton conformance (scored separately from the CZABA requirement)
- **REF-222-1** (all stems = full mix ≈ Main): **conscious deviation**. There is no Rendered Track chooser. Verified at 10/10.
- **REF-222-2** (in-dialog subset that persists): **conscious deviation, better than Live**. Verified by PERSIST-222.
- **Default selection:** **unconfirmed**. C re-checked the manual on 2026-10-28 with WebFetch (both parts of https://www.ableton.com/en/live-manual/12/managing-files-and-sets/). It states no default for Rendered Track; the only stated default is Render Start/Length.
- Everything else: not applicable (no new interaction, cursor or shortcut).

## Findings for B
- **C-R222-01 (Low, pre-existing, not A).** The legacy WAV export is not bit-deterministic.
  - Measurements: A1 vs A2 (same untouched default selection): 318 samples at 1 LSB. B1 vs B2: 48. A vs B: 284. Normalize off: 114. Headers and peaks are equal. There is no dither or `Math.random` in the export path.
  - Hypothesis, unconfirmed: float summation order in the offline render.
  - Impact for B: the LEGACY-UI-STUBBED criterion "byte-identical or PCM identical" cannot be met by any implementation. Amend it to "PCM within 1 LSB plus per-stem spectrum equal" for later rounds (REGRESSION scope_additions too).
  - Evidence: `c-round-222/legacy/control-1440.log`, `nonorm-1440.log`.
- **C-R222-02 (Low, origin B §3 → doc 174 l.36).**
  - The quote "most users will choose" is not verbatim. The manual says: "This is likely the option you will use for most scenarios". The page has no "most users" string. The meaning is close.
  - Fix: reword the quote (doc-only). → `deferred_low_polish` unless it is cheap for an owner.
- **C-R222-03 (Low, pre-existing layout).**
  - At 1280×720 the legacy Export dialog is cut at about y = 683. Cancel and Export Audio are reachable only by scrolling inside the modal. The JSX is unchanged this round, and round 221's screenshot shows the same.
  - → `deferred_low_polish`.
- **Contract rule 5** (no render with a stale selection) has no test. A and its reviewer already state this in the doc; C confirms the code uses the render-phase pattern. No action is needed beyond B's record.
- From A's reviewer: the `useStemSelection` extraction idea is an architecture note only.

## Reproduce
- `node c-round-222/c222-legacy.cjs warmup 1440 900 c-round-222/legacy` (the first cold load timed out at 240 s; this is the allowed invalid warm-up, not a finding).
- Then run the same script in modes `main` (1440 900), `persist` (1280 720), `control` (1440 900) and `nonorm` (1440 900).
- Then `node c-round-222/g222.cjs c-round-222/g`.

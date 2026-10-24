# CURRENT TASK — Round 143: VISUAL-A V-0.4e fix-up — one-line video Clip Gain reason (C-R142-01) + polish test leftovers

Dispatcher: B · Implementer: A · Verifier: C · Date: 2026-10-24 (B planned after gate 142 = skipped)
- **Rules:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, the LOOP POLICY, Loop v2, the cloud-runner and speed rules, and the 2026-10-23 bug gate. They take precedence over older text.
- **Previous task:** `tasks/round-142.md` (exact copy of the round-142 `current-task.md`, sha256 `55a7d844…`). Rationale: `b-round-142.md`. Decision record: **D-29z108** in `docs/technical/studio-real-workspace/plan.md`.
- **Baseline:** HEAD is still **`6e9f9b1e97d67703ba34e8b2a260a0a5215c3506`**. Gate 142 was **skipped** (C FAIL), so the round-142 work is **uncommitted in the tree**: 20 ` M` + 2 `??` paths (the round-142 grants). Round 143 builds on that tree. Nothing is reverted, stashed or re-done. Rounds 142 + 143 publish together after C PASS (GATE-142-SKIPPED, same pattern as GATE-72/74-SKIPPED).
- **Frozen list:** `tmp/studio-real-loop/b-round-142-r143-tree-sha256.txt`, **955 entries** = `git ls-files -co --exclude-standard` (963, current dirty tree) minus the 8 grants. Hashes taken from the tree **as it is now**, including the uncommitted round-142 files that are not granted again. `sha256sum -c --quiet` OK at planning, run from `store/`.
- **Grants:** `b-round-142-r143-grants.txt` (8 lines, all existing files; no new file). **Start hashes:** `b-round-142-r143-granted-start-sha256.txt`. **Start copies:** `b-round-142/r143-granted-start/` (paths relative to `store/`; `sha256sum -c` OK there). A checks all three first; any difference → A stops and reports.

## 0. Why this round (D-29z108)
- **Round 142: C FAIL**, `browserVerified` = `realVerified` = true. Every row passed at 1440×900 and 1280×720 except **LAYOUT**, and that failure is one Medium bug this round caused:
  - **C-R142-01 (Medium).** At 1440 with a video clip selected, the English `clipGainVideoReason` (`A video clip has no Clip Gain — for its sound use the track Volume/Mute`) wraps to **2 lines**. The baseline is 1 line. The video placeholder moves by d = (+16, −8, −32, 0).
  - C's Georgian-swap control on the same DOM gives 1 line and a 0 px delta in all 5 states, so the English text is the proven cause. A had raised the same item as a STOP.
- `tasks/round-142.md` §8 says: C FAIL with a Medium → **a bounded V-0.4e fix-up**. Checks at planning:
  - the regression is due on/after 2026-10-27 and today is 2026-10-24, so it is not due;
  - `user-review/ableton-decisions.md` and `design-ux-decisions.md` do not exist;
  - there is no strings-split checkpoint result (non-blocking).
- **Other round-142 results (C, independent):** T142-TARGETED, SOURCE-SCOPE, AN-REVIEW, DETAIL-TEXT, DETAIL-STATUS, CLIP-GAIN-AUDIO, LIBRARY-LABELS, GEO-COUNT, REG-141, G142-3 and PX-NET/REG-HYD all **PASS**.
  - CLIP-GAIN-AUDIO, real audio: −20 dB gives a drop of 20.00–20.04 dB; reset comes back within 0.03 dB.
  - G142-3 fake-Bearer 403 is BLOCKED (backend unavailable in cloud).
  - These pass results are kept. Round 143 re-checks only what it touches, plus one sample each for the neighbours (§5).

### Rulings D-29z108
- **R1 — the new text.** `clipGainVideoReason` becomes **`A video clip has no Clip Gain — use the track Volume/Mute`**.
  - A measured it live in the same slot (`a-round-142/probe/out/video-reason-candidates-a142.json`): **1 line, 329 px** at 1440, in a 408 px max column. The Georgian baseline is 327 px.
  - Width as close as possible to the baseline means the centred middle column should put the placeholder back at about 0 px.
  - It is the smallest honest change to the round-142 text: only "for its sound" is dropped. The meaning stays: the track Volume/Mute is the control for a video clip's sound.
  - At 1280 every candidate wraps to 2 lines, and so does the Georgian baseline. That is not a breach (R3).
  - No class change and no new key.
- **R2 — round size.** One Medium bug, plus one cheap Low fold-in in a file this stage already owns: the polish leftovers (A round-142 D2 and the reviewer Low). No V-0.5 scope is attached.
- **R3 — LAYOUT baseline at 1280 with the panel open.** B's round-141 probe stored no 1280 open state.
  - **New 1280 open baseline:** C's `c-round-142/out/c142-1280-r1.json` `states.*.measure`, taken from the round-142 tree.
  - C's Georgian-swap control there showed the same `clippedBelowPanel`, the same `contentScroll` (95–98 / 83) and the same line counts. That proves the clipping existed before V-0.4e (C-R142-03).
  - The 1280 rule is therefore **"no worse than that baseline"**, not "empty". The 1440 rule is unchanged: compare with B's `b-round-141/out/detail-baseline-6e9f9b1.json`.
- **R4 — exempt deltas (round 142, ratified).** These may differ from B's 6e9f9b1 baseline, and C reports them:
  - `arrangement-detail-header-label` x/w (−45 / +43): the flex-1 span widens because the h2 `Clip details` is shorter;
  - the apply button (+22 w) and the toggle (+2 w), both `w-fit`.
- **R5 — corrections of B's round-142 text (recorded, no code change):**
  - **R8 was wrong.** `stems` cannot match by kind: the search text uses the kind label `Stem`, and the folder label `Stems` is not in it. A's LB-SEARCH asserts `stem` (D3, ratified). C-R142-02 (Low) goes to `deferred_low_polish`. Separate search keywords per kind, including the plural, belong to the V-0.5 library stage as a forward constraint. The reviewer's Architecture note and C's `sfx`-matches-the-collection-label observation go there too.
  - **§5 LIBRARY-LABELS wording:** the frozen `ArrangementLibrary.tsx` l.518 aria-label belongs to the **collection** toggle, not a folder toggle. Folders have no toggle.
  - **A's round-142 deviations D1–D7 are ratified.** D1: the 57th pin line, `PENDING_HIDDEN_HINT`. D6: the l.702 block is the formatter map; the reviewer agreed with A.

## 1. What changes (user-visible)
With a video clip selected, the Clip Detail panel's Clip Gain reason reads `A video clip has no Clip Gain — use the track Volume/Mute`. The field's `title` shows the same text. At 1440×900 it is one line again, and the video placeholder stands where it stood before round 142. Nothing else changes: no handler, class, testid, size, key binding or other string.

### 1.1 Source and test edits
| ID | File | Before | After |
|---|---|---|---|
| VR1 | `app/lib/arrangement/strings.ts` (`studioDetailStrings.clipGainVideoReason`, l.637 at planning) | `'A video clip has no Clip Gain — for its sound use the track Volume/Mute'` | `'A video clip has no Clip Gain — use the track Volume/Mute'` (the `—` is U+2014, as before). Nothing else in the file changes |
| VR2 | `strings.test.ts` ST41 expected list (l.2139 at planning) | old literal | the VR1 literal, hand-written |
| VR3 | `clip-gain-fader.test.tsx` l.36, `clip-gain.test.tsx` l.60, `detail-panel-reason.test.tsx` l.25–26, `detail-panel-fit.test.tsx` l.25–26 | old literal | the VR1 literal, hand-written, with the same matcher. Biome may join a two-line `const` back into one line; that is allowed and must be reported |
| PL1 | `detail-panel-polish.test.tsx` `it` titles at l.381 and l.394 (planning lines) | `… in Georgian and keeps the aria-labels` | `… in English and keeps the aria-labels`. Same `it` count (16) and the same bodies otherwise |
| PL2 | same file, l.391 and l.407 | `expect(content.textContent).not.toContain('end, წმ');` (can never fail now) | `expect(content.textContent).not.toContain('წმ');`. This is a stale-unit guard: the Georgian seconds abbreviation of the old range labels must not come back. A confirms the fixture content has no other `წმ` (data), so the guard is green now and would be red with the old `საიდან, წმ` label (m89) |
| DOC | `docs/implementation/2026/quarter-IV/118-studio-v0-detail-library-strings.md` | — | l.36 table row: the English cell becomes the VR1 text. Add a short "Problem → Solution" entry for C-R142-01: the 2-line wrap at 1440, the measured candidates, the D-29z108 choice. Status line l.4 → `In Progress (C round 142 — FAIL: C-R142-01; round 143 fix-up; C round 143 ჯერ არ გაშვებულა)`. Georgian, as the rest of the doc. Nothing else changes |

**Before editing, A greps** `store/app`, `store/e2e` and `store/docs` for `for its sound use the track` and lists every hit. At planning there were exactly 7: strings.ts, 5 test files and doc 118. Any hit outside the grants → A stops and reports.

## 2. A — files you own (everything else is frozen)
The 8 paths in `b-round-142-r143-grants.txt`, limited to the edits in §1.1:
- `app/lib/arrangement/strings.ts`: VR1 only (one value);
- `app/lib/arrangement/__tests__/strings.test.ts`: VR2 only;
- `clip-gain-fader.test.tsx`, `clip-gain.test.tsx`, `detail-panel-reason.test.tsx`, `detail-panel-fit.test.tsx`: VR3 only;
- `detail-panel-polish.test.tsx`: PL1 and PL2 only;
- `docs/implementation/2026/quarter-IV/118-studio-v0-detail-library-strings.md`: DOC only.

Rules:
- **Protected (never touch):** `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/components/ui/Modal.tsx`, `app/routes/account.downloads.tsx`, `download-routes.test.ts`, and everything in `backlog.json` `global_forbidden_files`.
- **Frozen and relevant:** `ArrangementDetailPanel.tsx`, `library.ts`, `panels.ts`, `clip-gain-multi.ts`, `ArrangementLibrary.tsx`, the other round-142 pin files and `detail-panel-strings-ui.test.tsx`. They are not granted again, and their round-142 content must stay byte-identical (frozen list).
- **Pin rule:** replaced pins are hand-written English literals. No pin imports the module value it checks.
- **Stop rule:** A stops and reports, without widening scope, if any of these happens:
  - a grep hit falls outside the grants;
  - a non-granted test fails;
  - in A's required browser probe, the VR1 text at 1440 in the video state does not render on 1 line, or the video placeholder is more than 1 px from the baseline. A reports the measured delta, and B rules before C runs: either accept that delta or switch to the 333 px candidate.
- **Untracked file (C-R119-01):** doc 118 is untracked (`??`). Before editing it, A also stores its own pre-edit copy and sha256 under `a-round-143/pre-edit/`. B's `b-round-142/r143-granted-start/` copy is the reference for C.
- **Edit rule (C-R120-01):** every lasting edit goes through Edit/Write. Shell writes are only for temporary mutations, which are restored and sha-verified. A lists every shell write.

## 3. A — tests and mutations
- `it` counts stay the same in every granted test file. A records them before and after.
- **Mutations** (each turns the named tests red; restore and check by sha256):

| ID | Mutation | Must turn red |
|---|---|---|
| m88 | `clipGainVideoReason` back to the round-142 text | ST41, clip-gain-fader (video row l.429), clip-gain (l.785), detail-panel-reason (l.290/292/352), detail-panel-fit (l.304) |
| m89 | `studioDetailStrings.sourceUnchanged` → `'The source file stays unchanged · წმ'` (a text that is in the single-clip detail content but **outside** the polish label arrays) | the polish single-clip `it`, failing on the **PL2 `not.toContain('წმ')` line itself** (A quotes the failing assertion line). ST41 and DPS2 also turn red elsewhere |
| m90 | `studioDetailStrings.multiClipNote` gets the suffix `' · წმ'` | the polish group `it`, failing on its PL2 line itself (A quotes it). ST41 and DPS4 also turn red elsewhere |

A label mutation such as `'From, წმ'` would also turn the polish tests red, but through the `rangeLabels` pin and not through PL2. That is why m89/m90 target texts that only the guard reads (A-R138-M60-EXPECTATION lesson). If a polish `it` turns red on a different line, or not at all, A reports it: PL2's own discrimination is then not proven, and A does not claim it.

- **Required A browser probe.** Use A's own copy of `b-round-141/tools/detail-probe.cjs` or the round-142 probe, against the running :5173 server, with fresh contexts. Output goes to `a-round-143/probe/`. Two criteria in the 1440 video state, compared with `b-round-141/out/detail-baseline-6e9f9b1.json`:
  - (a) `arrangement-detail-clip-gain-reason` is on **1 line**;
  - (b) the `arrangement-detail-video-placeholder` box is within **1 px** in x/y/w/h.

  Also record the 1280 video state: the reason is 2 lines, as at baseline.

## 4. A — checks (speed rules)
- At the start, all OK: the frozen list (955), the 8 start hashes and the start copies. `git status --short` shows the 22 round-142 paths (20 ` M` + 2 `??`) and nothing else.
- The pre-edit grep (§1.1) is saved to `a-round-143/pre-grep.txt`.
- `npm run typecheck` and `npm run lint` exit 0. A read-only `npx biome check` on the 7 changed code/test files gives 0 diagnostics.
- `npx vitest run` on these files, saved to `a-round-143/vitest.json`:
  - the 6 granted test files;
  - `detail-panel-strings-ui`, `detail-panel`, `panels`, `clip-gain-multi`, `library`, `pending-status`, `status-announcement-ui`, `self-disabling-focus` and `fader-guards`.
- Mutations m88–m90.
- The code-reviewer runs, because more than 3 files change. Its Architecture note goes to B.
- **Not run:** the full suite, `npm run verify`, build or e2e (the gate does these).
- At the end:
  - `git status --short` still shows exactly the same 22 paths (round 143 adds none);
  - the frozen list is OK;
  - the protected `git diff 6e9f9b1` is empty;
  - the end sha256 of the 8 granted paths is in `a-round-143/end-sha256.txt`.
- No commit, stash, checkout, install, `--write` or `check:fix`.

## 5. C — rows
Real Playwright Chromium at **1440×900 and 1280×720** on `http://127.0.0.1:5173/studio-lab`, with a fresh context per session. State Snap at the start (default off). The harness from round 142 may be reused (`c-round-142/tools/c142.cjs`, `layoutcmp.cjs`, `lib.cjs`), with new, uniquely named outputs under `c-round-143/` (C-R125-HARNESS-OVERWRITE). The video media is `tmp/studio-real-loop/media/clip-4s-vp9-opus.webm`. At 1280 the panel starts collapsed; expand it first.

| Row | Start state → action → expected |
|---|---|
| T143-TARGETED | Run A's named vitest list; the counts equal A's |
| SOURCE-SCOPE | Only the 8 granted paths changed against the start copies (`b-round-142/r143-granted-start/`). The frozen list (955) is OK at start and end. End hashes equal `a-round-143/end-sha256.txt`. Protected diff vs `6e9f9b1` is empty. `git status --short` = the same 22 paths. No source changes during C's phase |
| AN-REVIEW | `diff -u` against the start copies. Expected:<br>- strings.ts: one value (VR1);<br>- strings.test: one literal (VR2);<br>- the 4 VR3 files: only the reason literal (plus any Biome join);<br>- polish: PL1 + PL2 only, with the same `it` count;<br>- doc 118: only the DOC lines |
| VIDEO-REASON-TEXT | In both video states (video only, video + audio), at both viewports, select the video clip and read the result:<br>- in the video-only state, `arrangement-detail-clip-gain-reason` text = `A video clip has no Clip Gain — use the track Volume/Mute`, and the Clip Gain field `title` is the same;<br>- in the video + audio state, the multi reason stays `Clip Gain works on audio clips only — remove the video from the selection`.<br>Report the codepoint of the dash (U+2014) |
| LAYOUT | **1440:** compare all 5 states with `b-round-141/out/detail-baseline-6e9f9b1.json`.<br>- The video reason is **1 line**.<br>- The video placeholder moves ≤ 1 px against the baseline in x/y/w/h, or by exactly the delta that A measured and B accepted in writing before C's run.
- The reason moves ≤ 1 px in x/y/h. Its width may differ by the text width (329 vs 327 px); report it.<br>- Every other strict node, column and the panel moves ≤ 1 px.<br>- Only the R4 exempt deltas may differ (header label −45/+43, apply +22 w, toggle +2 w); report them.<br>- Line counts are no worse than the baseline, and the group block stays ≤ 87 px.<br>**1280 (panel open):** compare all 5 states with `c-round-142/out/c142-1280-r1.json` `states.*.measure` (R3).<br>- Line counts, `contentScroll` and the `clippedBelowPanel` list must be no worse than that baseline; the video reason stays at 2 lines, as at baseline.<br>- No new horizontal overflow.<br>Any breach = FAIL |
| NEIGHBOUR-SAMPLE | One sample each, at 1440 only:<br>- DETAIL-TEXT none state: header `Nothing selected` and toggle `Collapse ▾` / `Collapse details`;<br>- DETAIL-STATUS: Clip Gain Enter without a change → `Clip Gain unchanged: 0.0 dB.`;<br>- CLIP-GAIN-AUDIO: one valid paired measurement; −20 dB drops 20 ± 1 dB, and reset returns within 1 dB;<br>- LIBRARY-LABELS: folders `Music / SFX / Music / Stems` and `stem` → 4 stems |
| GEO-COUNT | Detail panel in the video and video + audio states, both viewports: Georgian = 0 apart from the selected clip's source title (data, R9 of D-29z107; the video file name is data too). List every subtraction |
| G143-3 (alone, last) | `/studio-lab` shows the workspace and the demo badge. `/studio/middle-east` shows "Sign in required", no workspace and 0 `audio[src]`. `GET /api/studio-token?…` → 401. The fake-Bearer 403 check is BLOCKED (backend unavailable in cloud) |
| PX-NET / REG-HYD | 0 forbidden requests, 0 Authorization headers, 0 hydration errors and 0 pageerror (the known cart noise is expected) |

Gate rows (C does not claim them): full vitest, typecheck, build, Biome, verify, e2e smoke, PROD-MP3-UNVERIFIED, PROD-SSR-NUL.

**Neighbour risk:**
- The video reason is also the Clip Gain field's `title` (detail-panel-reason l.292). VIDEO-REASON-TEXT checks both.
- The video + audio multi reason uses a different key and must not change.
- The polish guard `not.toContain('წმ')` would turn red if a fixture title ever contained `წმ`; A confirms it does not.

## 6. Ableton source
Live 12 Reference Manual, B's saved capture `b-round-133/live/arrangement-view.txt` (TOC + the Arrangement View chapter; B checked it on 2026-10-24). The Clip View chapter is **not** in the capture, and no new capture was taken.

| Behaviour | Ableton source | Confirmed there | CZABA decision / difference | C check |
|---|---|---|---|---|
| Wording of why a video clip has no Clip Gain | Live Clip View chapter — not captured | **unconfirmed** | CZABA-only explanatory text. CZABA's detail panel is its own simplified panel, not Live's Clip View. No Live claim | VIDEO-REASON-TEXT, LAYOUT |

C rates "CZABA requirement met" and "Ableton correspondence" separately.

## 7. Evidence and reporting
- C writes `c-round-143.md` and `c-round-143.json` as it goes, with these fields: `taskStatus`, `passed`, `failed`, `inconclusive`, `blocked`, `gate`, `bugs`, `browserVerified`, `realVerified`, `envStatus`, `georgianCounts` with subtractions, `measurements` (the LAYOUT deltas at both viewports and the CLIP-GAIN-AUDIO values), `invalidRuns`, `notesForB`.
- Evidence goes under `c-round-143/{tools,out,shots}/`. Every run writes a uniquely named output. C makes no writes under `store/`.
- `browserVerified` is false only if a browser row that **can** run here was not run. Backend-only rows go under `blocked`.
- A writes `a-round-143.md` as it goes. It covers:
  - start checks and the pre-grep;
  - changed files and `it` counts before/after;
  - test results and mutations, quoting the failing assertion line for m89/m90;
  - the required probe: (a) line count and (b) placeholder delta;
  - the reviewer verdict and Architecture note;
  - shell writes and the end state;
  - deviations.

## 8. Outcome, fixed in advance (B at round 144 planning)
| Condition | Round 144 |
|---|---|
| B plans on or after **2026-10-27** | The **REGRESSION round** first (every done / c_pass item, both viewports, `test:e2e:smoke`), then the row below |
| C FAIL with Critical / High / Medium | Another bounded fix-up (at most three related bugs) |
| C PASS (new Lows → `deferred_low_polish`) | V-0.4e → `c_pass`, then `c_pass_published` after the gate publishes rounds 142 + 143 together; **V-0.4 complete**. Round 144 = **V-0.5**, re-measured first. Its area: library, preview, dock, route, `studio-lab-demo.ts` UI labels, `collection.ts`, context l.3468, `lang="en"`, and the final RV-4 grep. B decides the split; ≈84 source lines is likely 2–3 rounds. Forward constraints: gate-141 #2 (SSR `console.error` assertion), gate-141 #3 (ST40 meta-title pin), and LIB-SEARCH-KEYWORDS (R5: per-kind search keywords incl. the plural, kept apart from the display labels). If root's strings-split checkpoint result arrives first, B applies it as its own bounded round before V-0.5 |

At every planning B checks `user-review/ableton-decisions.md` and `user-review/design-ux-decisions.md`.

## 9. Root notes
- **Commit readiness:** after C PASS, root may publish rounds 142 + 143 together as V-0.4e (completes V-0.4). Until then the 22 round-142 paths stay uncommitted in the tree; nothing may revert them.
- **Architecture:** the strings-split checkpoint request (`b-round-136-checkpoint-request.md` + addenda) is still open and non-blocking. V-0.4 completes with this fix-up, which is a feature boundary. B repeats the bounded request in `b-round-142.md` §5.

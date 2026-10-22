# CURRENT TASK — Round 89: fix R88-FOCUS-ESCAPE-RENDER — the Export dialog's Tab trap counts radio groups as one Tab stop (D-29z54)

Dispatcher: B · Implementer: A (Claude Opus 5.5) · Verifier: C · Date: 2026-10-22
- **Workflow:** `/home/runner/czaba-project/docs/technical/studio-real-workspace/agent-workflow.md`, plus the LOOP POLICY, Loop v2, cloud-runner and speed rules in your prompt. Those rules win over older text.
- **Previous task:** `tasks/round-88.md` (exact copy, sha256 `7c1e0560…`). Rationale: `b-round-88.md`. Decision record: D-29z54 in `docs/technical/studio-real-workspace/plan.md`.
- **Round size:** one C bug (medium), one owner (A). One changed source file, one new pure module, one new test file and one doc. This is a fix round, not a feature stage.

## Why this round
- **C round 88: FAIL**, `browserVerified=true`, `realVerified=true`.
  - **The sticky footer and the focus guard work.** VIS-IDLE, VIS-RENDER (every phase), VIS-SCROLL (1280), VIS-DONE, VIS-ERROR, VIS-VIDEO, PX-PHASES-R, PX-WAV5-R (max rAF gap 55.2 ms), PX-NET, REG-HYD, G88-3, T88-TARGETED and SOURCE-UNCHANGED all PASS. R87-PROGRESS-BELOW-FOLD-1280 is fixed by C evidence (c_pass, not yet published).
  - **One medium bug, R88-FOCUS-ESCAPE-RENDER.** It is old: the trap code is byte-identical to round 87 and to the published `971141d`.
    - Steps: during a render, press Tab three times. The 3rd Tab leaves the dialog. Focus goes to `BODY`, then `arrangement-exit` (a link behind the modal), then Master Mute and Master Volume.
    - When it happens: at both viewports, whenever the checked format is WAV (the default) or MP3. With WAV + MP3 checked, focus wraps to X correctly.
    - Failing rows: PX-KEYS-R, and the "focus never leaves the dialog" part of FOCUS-NOT-OBSCURED.
- **Gate 88 was skipped** (`gates/gate-round-88.json`: "C taskStatus FAIL"). Nothing from rounds 87–88 is published. HEAD is still `971141d`, and the round-87 and round-88 work sits uncommitted in the tree. That tree is the baseline below.
- **Regression round:** due on or after 2026-10-24 (`regression-last.json` = 2026-10-21). Not today.

## Root cause (B read `ArrangementExportDialog.tsx` l.161–192 in the current tree)
- `handleDialogTabKey` wraps forward only when `active === last`, and backward only when `active === first`. `last` is the **last focusable element** in DOM order.
- During a render, the scope radios, Close and Export are disabled, and the format radios stay enabled (D-29z52, GATE86-S4). So the focusable list is [X, wav, mp3, both] and `last` is the `both` radio.
- **Native Tab treats a radio group as one Tab stop.** Tab from the checked `wav` or `mp3` radio leaves the group, and with it the dialog. The trap never fires, because `active !== both`.
  - This matches C's observations: V1/V4/V5 escape, and V3 (`both` checked) wraps.
- In the idle state, the last element is the Export button and the first is X. Neither is a radio, which is why the bug only shows during a render.
- `grep "active === last"` over `app/` finds only this dialog, so no other dialog shares this trap pattern.

## Baseline (measured by B, 2026-10-22)
- **HEAD `971141d67a1dd33da8f1165de1d895bd62b4e022`**. `git status --short` = **7 M + 11 ??** (18 lines), exactly the round-88 end state. A's `a-round-88/end-hashes.txt` and C's SOURCE-UNCHANGED both match it.
- **Frozen list:** `../tmp/studio-real-loop/b-round-88-r89-tree-sha256.txt`, **506** entries, **506/506 OK**. It covers every tracked and untracked `app/**` and `docs/implementation/**` file plus `vite.config.ts`, **except** the two owned existing files below.
  - It includes `export-dialog-footer.test.tsx` (`5d6d30e4`), which is now frozen.
  - It includes the protected auth and route files.
  - Check: `cd store && sha256sum -c --quiet ../tmp/studio-real-loop/b-round-88-r89-tree-sha256.txt`.
- **Snapshots:** `../tmp/studio-real-loop/b-round-88-r89-snapshots/` (`SHA256SUMS.txt`). LF, CR=0:

  | File | sha256 prefix | lines | role |
  |---|---|---|---|
  | `app/components/arrangement/ArrangementExportDialog.tsx` | `24e53071` | 517 | owned |
  | `docs/implementation/2026/quarter-IV/077-studio-lab-export-progress-and-worker.md` | `605915b0` | 121 | owned (listed lines) |
  | `app/components/ui/Modal.tsx` | `741c2341` | — | frozen, reference |
  | `app/lib/arrangement/__tests__/export-dialog-focus.test.tsx` | `ac53f685` | — | frozen, reference (harness to copy) |
  | `app/lib/arrangement/__tests__/export-dialog-focus-restore.test.tsx` | `e4ad8336` | — | frozen, reference |
  | `app/lib/arrangement/__tests__/export-dialog-footer.test.tsx` | `5d6d30e4` | — | frozen, reference |

- **Protected:** never touch the auth files, `app/contexts/StudioContext.tsx` (`caa388e7`), `app/utils/ffmpeg.ts` (`0995ae78`) or `Modal.tsx`.
- **Servers:** `:5173/studio-lab` returns 200 (`env-status.json`). Backend `:5199` is unavailable, as expected. Never start or stop servers.
- **Do not change the repository state:**
  - Never stash, reset, checkout, clean or re-create anything. Do not revert any round-87 or round-88 file.
  - A mismatch (another HEAD, another status, a changed frozen file) means stop and report.
  - Never run `biome check --write`, `format --write`, `npm run format` or `check:fix`. Format through stdin to stdout.
  - Run mutation proofs in a scratch copy (`a-round-89/mut/`), never in `store/`.

## 1. What changes (A)

### G1 — new pure module `app/lib/arrangement/dialog-tab-stops.ts`
Export exactly these two functions. Use no type assertions; narrow with `instanceof HTMLInputElement` and `.type === 'radio'`.
- `groupDialogTabStops(focusable: readonly HTMLElement[]): HTMLElement[][]`
  - Each element of `focusable` lands in exactly one stop, keeping input order.
  - A radio input with a **non-empty `name`** joins the stop of the first earlier radio with the same `name` in the list.
  - Every other element, including a radio with an empty name, is its own stop.
  - Stops are ordered by the position of their first member.
  - An empty input gives an empty array.
- `dialogTabStopFocusTarget(stop: readonly HTMLElement[]): HTMLElement | null`
  - Returns the member that is a radio with `checked === true`, if there is one.
  - Otherwise returns `stop[0]`, and `null` for an empty stop.
- The input is already filtered for disabled and hidden elements by the caller (`exportDialogFocusableElements`). The module does no DOM queries.

### G2 — `ArrangementExportDialog.tsx`: the Tab handler works on stops
In `handleDialogTabKey` only:
- After `const focusable = exportDialogFocusableElements(content);`, compute `const stops = groupDialogTabStops(focusable);`. Take `firstStop = stops[0]` and `lastStop = stops[stops.length - 1]`. If either is missing, return, as today.
- When `active` is **not** in `focusable`: `preventDefault`, then focus `dialogTabStopFocusTarget(event.shiftKey ? lastStop : firstStop)`. This is today's branch, made stop-aware.
- **Shift+Tab** with `active` in `firstStop` (`firstStop.includes(active)`): `preventDefault`, then focus `dialogTabStopFocusTarget(lastStop)`.
- **Tab** with `active` in `lastStop`: `preventDefault`, then focus `dialogTabStopFocusTarget(firstStop)`.
- If `dialogTabStopFocusTarget` returns `null` (unreachable with a non-empty stop), return without `preventDefault`.
- Every other Tab: do **not** call `preventDefault`; native order stays. The frozen tests depend on this: "intercepts Tab only at the ends".
- Nothing else changes: the selector, `exportDialogFocusableElements` (stays module-private), the opener-restore, initial-focus and footer-guard effects, the radios, the disabled rules, texts and layout. **The format radios stay enabled during a render** (D-29z52; frozen test l.458–478).

**Resulting behaviour (the contract C checks):**
- During a render the stops are [X] and [format group].
  - Tab from the checked format radio → X.
  - Tab from X → the checked radio (native).
  - Shift+Tab from X → the **checked** format radio, not `both`. That is where native Shift+Tab into a radio group lands.
  - Shift+Tab from the checked radio → X (native).
  - Tab or Shift+Tab from the focus-trap wrapper → X / the checked radio.
- Idle stays as today: X → checked format → checked enabled scope → Close → Export → (wrap) X; reverse with Shift+Tab.

**Rejected alternatives (recorded in D-29z54):**
- **Disable the format radios during a render.** This contradicts D-29z52/GATE86-S4, would turn the frozen test l.458–478 red (it keeps focus on a format radio through a render start), and leaves the bug for any future dialog layout.
- **A `focusout`/`relatedTarget` guard.** `relatedTarget` is also `null` on a window blur (Alt-Tab), so it would pull focus back wrongly.
- **Handle every Tab in JS.** It breaks the frozen "only at the ends" tests, and it re-implements browser order.
- **Extract a `useExportDialogFocus` hook now.** That is an architecture checkpoint question (see §6), not part of a bug fix.

### Docs
- **Doc 077:**
  - Change l.4 to exactly:

    ```text
    **სტატუსი:** Round 89 — C round 88: sticky footer PASS (R87-PROGRESS-BELOW-FOLD-1280); ძველი Tab-trap ბაგი R88-FOCUS-ESCAPE-RENDER გასწორდა radio-ჯგუფის Tab stop-ებით, C-ის შემოწმებას ელოდება (D-29z54)
    ```

  - Add one Problem → Solution entry under `## პრობლემები და გადაწყვეტები`: native radio groups are one Tab stop, so the element-based trap missed them during a render; it is now stop-based.
  - Add one line under `## შეცვლილი ფაილები` (the dialog + the new module) and one under `## ტესტირება` (the new test file).
  - No other change.
- No new implementation doc. The fix completes stage 3a, which doc 077 documents.

### Files (exact grants)
| File | Grant |
|---|---|
| `app/lib/arrangement/dialog-tab-stops.ts` | **new** (G1) |
| `app/components/arrangement/ArrangementExportDialog.tsx` | G2 only: one import and the body of `handleDialogTabKey` |
| `app/lib/arrangement/__tests__/export-dialog-tab-stops.test.tsx` | **new** |
| `docs/implementation/2026/quarter-IV/077-studio-lab-export-progress-and-worker.md` | l.4 + the three additions above |

**Expected end state: 7 M + 13 ??.** The status gains exactly two lines: `?? app/lib/arrangement/dialog-tab-stops.ts` and `?? app/lib/arrangement/__tests__/export-dialog-tab-stops.test.tsx`. All 506 frozen entries stay unchanged.
- If any frozen test turns red, **stop and report**; do not edit it. Watch especially:
  - `export-dialog-focus.test.tsx`, `export-dialog-focus-restore.test.tsx` (HD1–HD3), `export-dialog-footer.test.tsx` (FT3);
  - `export-range-ui`, `export-mp3`, `export-progress-ui`, `master-ui`, `video-fades-ui`.
- B walked the frozen focus tests against G2:
  - l.266: the last stop is Export;
  - l.292: the empty project's last stop is Close;
  - l.428: Tab from the trap during a render goes to X;
  - l.480: Shift+Tab from the trap in idle goes to Export;
  - l.531: per control, only the ends are prevented, and the format group is stop 2 of 5;
  - HD1–HD3: the filter is unchanged.

  B expects all of them to stay green.

### Required tests (`export-dialog-tab-stops.test.tsx`; IDs for C to cite)
Copy the mount harness and `ControlledOfflineAudioContext` from `export-dialog-focus.test.tsx`. Do not import from a test file. Starting an MP3 export in jsdom (TR2/TR4): the controlled `OfflineAudioContext` blocks in the render phase, before the encoder import. If the MP3 button needs extra globals, use the mount pattern from `export-progress-ui.test.tsx`. jsdom does not move focus on Tab, so the UI tests dispatch `keydown` Tab and assert `defaultPrevented` and `document.activeElement`. Write that limitation in the describe name.
- **TS1** `groupDialogTabStops`:
  - [button, radio a/x, radio a/y, radio b/z, button] → 4 stops, with a/x and a/y together;
  - two radios with an empty name → two stops;
  - same-name radios separated by a button → still one stop, at the first radio's position;
  - an empty list → `[]`.
- **TS2** `dialogTabStopFocusTarget`:
  - the checked radio wins even when it is not first;
  - no checked radio → the first member;
  - a single button → that button;
  - an empty stop → `null`.
- **TR1** render, WAV checked (the default): start a WAV export with the controlled renderer.
  - Focus `format-wav` and press Tab: prevented, focus goes to X.
  - Then focus `format-mp3` (unchecked, same group) and press Tab: prevented, focus goes to X.
- **TR2** render, MP3 checked: select MP3, start, focus `format-mp3`, press Tab: prevented, focus goes to X.
- **TR3** render, WAV + MP3 checked: Tab from `format-both`: prevented, focus goes to X. This is the regression guard for C's V3.
- **TR4** render, MP3 checked: Shift+Tab from X: prevented, focus goes to `format-mp3`, the checked radio, **not** `both`. Shift+Tab from the trap wrapper also goes to `format-mp3`.
- **TR5** render: Shift+Tab from `format-wav` (checked) is **not** prevented. Tab from X is **not** prevented. Both are native middle moves.
- **TR6** idle (no render): Tab from the checked format radio and from the checked scope radio is **not** prevented. Tab from Export is prevented and goes to X. Shift+Tab from X is prevented and goes to Export. This guards against over-trapping.

**Mutation proofs** (scratch copy; each must turn at least one listed test red):
- (a) the dialog goes back to element-based `last` (`active === last`) → TR1/TR2;
- (b) the helper groups radios by type only, ignoring `name` → TS1;
- (c) the target is always `stop[0]` → TS2/TR4;
- (d) the Shift path stays element-based → TR4;
- (e) every Tab is prevented and moved to the next stop (over-trap) → TR5/TR6;
- (f) the not-in-focusable branch ignores stops (focuses `last` element) → TR4 (trap wrapper part).

## 2. Pre-flight for A
- **Primitives:** `AGENT_DISCOVERABLE_CODE.md` (two new exports), `FORWARDREF_COMPONENT.md`, `TESTING_QUALITY_GATES.md`, `BUG_HUNTING_TESTS.md`, `GEORGIAN_DOCS.md`.
- **Prompts:** `new-test.md`, `studio-feature.md`.
- **Verify the baseline before the first edit:** HEAD; 7 M + 11 ??; frozen 506/506; the snapshots; LF/CR.
- **Checks (speed rules):**
  - `npm run typecheck`, `npm run lint`, and a scoped `npx biome check` on the three owned code files (no `--write`).
  - Targeted vitest: the new test, plus every file in `a-round-88/targeted-list.txt` (it already holds the three dialog focus/footer tests, the export tests, and every importer of `ArrangementExportDialog` or `StudioWorkspace`).
  - Write the list to `a-round-89/targeted-list.txt`. Do not run the full suite.
- **A's own Playwright smoke at 1280×720 and 1440×900** (not C evidence). On a fresh page with the 5M recipe and a WAV export, log `document.activeElement` after each of 6 Tabs and 4 Shift+Tabs pressed while the busy button reads `მიმდინარეობს…`.
- **Code-reviewer: required.** You change 4 files. Pass its Architecture note to B verbatim. The root gate's reviewer does not replace yours.

## 3. File ownership (exact)
- **A** owns only the §1 Files table.
- **C** owns `c-round-89*`.
- **B** owns the planning artifacts.
- **Root** owns gates, commits and pushes.
- **Protected (never edited):**
  - `app/routes/studio.$productId.tsx`, `app/routes/api.studio-token.ts`, `app/routes/account.downloads.tsx`, `app/lib/__tests__/download-routes.test.ts`;
  - the auth files (`app/lib/auth.ts`, `app/contexts/AuthContext.tsx`, `app/lib/firebase.client.ts`);
  - for this loop, `app/contexts/StudioContext.tsx`, `app/utils/ffmpeg.ts` and the shared `app/components/ui/Modal.tsx`.
- **`/studio-lab`** stays the public **demo-only** workspace:
  - it shows the demo badge;
  - it has no purchased audio and makes no token/R2 requests;
  - its only third-party requests are to the unpkg ffmpeg core, after an MP3 click;
  - user video stays local.

## 4. Ableton source table
**Not applicable.** This is keyboard accessibility of CZABA's own modal. B makes no claim about Live's Export dialog.
- The "a radio group is one Tab stop" behaviour is **Chromium's own behaviour, observed by C** in round 88 (`keys88-*.json`), not an Ableton fact.
- The round-87 §4 rows are carried unchanged (`tasks/round-87.md` §4).

## 5. C acceptance (real browser, Playwright Chromium, **both 1440×900 and 1280×720** unless the row says otherwise, `/studio-lab` anonymous, real keyboard)

**Setup:**
- Check `env-status.json` and that `:5173` returns 200. Do one warm-up load.
- Use the round-88 demo setup: music 0.35 s, stem 2 s, sfx 4 s, snap off. **5M** = click the music clip, then press Ctrl+D twice. Each TRAP session starts on a **fresh page**, which is the condition under which round 88 escaped.
- **HR-RENDERING:** a keypress counts only if the busy button reads `მიმდინარეობს…` just before **and** just after it. Record that per press. A sequence cut short by render end is harness-invalid; repeat it within the run budget, and do not count it as PASS.

| ID | Action | Pass evidence |
|---|---|---|
| TRAP-WAV (primary) | Fresh page, 5M, WAV (default): keyboard opens Export, Tab to the export button, Enter. During the render press Tab ×6, then Shift+Tab ×4 | After every press `document.activeElement` is inside the dialog: never `BODY`, `arrangement-exit`, Master Mute or Master Volume. Tab sequence: X, `format-wav`, X, `format-wav`, X, `format-wav` (the first press may start from the trap wrapper → X). Shift+Tab from X goes to `format-wav`, the checked radio. URL unchanged, transport stopped, Master Volume value unchanged. `.wav` downloads |
| TRAP-MP3 | Fresh page, 5M, ArrowDown to MP3, export; during the render (including the load phase) Tab ×6, Shift+Tab ×4 | Same as TRAP-WAV with `format-mp3`. `.mp3` downloads |
| TRAP-BOTH (1440) | Fresh page, 5M, WAV + MP3 | Tab ×6 stays inside, X ↔ `format-both` (C's V3 still passes). Shift+Tab from X goes to `format-both` |
| PX-KEYS-R2 | C's round-88 V1 exactly: range 4–9 s, **first** MP3 of the session, Enter / ArrowDown / Tab / Enter, then 3 Tabs | All 3 Tabs stay in the dialog. The `<progress>` never takes focus. `.mp3` downloads. Escape after done returns focus to toolbar Export |
| IDLE-ORDER | No render: Tab around once, Shift+Tab around once | X → checked format → checked enabled scope → Close → Export → X, and the exact reverse. Same as rounds 87/88 |
| FOCUS-NOT-OBSCURED-R | Three states: idle, during a 5M render, done with the overload warning (101.702 s) | Each focused element outside the footer has `rect.bottom ≤ footer.top`, and focus never leaves the dialog in **any** state |
| VIS-RENDER-S (1280) | One 5M MP3 export | Label, `<progress>` and busy button are HR-VISIBLE (round-88 definition) in each phase. `scrollTop` is unchanged by the click (sanity only: the layout code is unchanged) |
| PX-NET | All sessions | No unpkg request before the first MP3 click; then only `ffmpeg-core.js`/`.wasm`; workers same-origin; 0 studio-token / R2 / download requests; 0 auth headers |
| REG-HYD | All sessions | No hydration / `useLayoutEffect` warning and no non-noise console error |
| G89-3 | Purchase protection | `/studio/middle-east` anonymous → sign-in required, no workspace. `/api/studio-token?…` anonymous → 401. The header link opens `/studio-lab` with the demo badge. Fake-Bearer 403 → BLOCKED if the backend is unavailable |
| T89-TARGETED | A's `a-round-89/targeted-list.txt` | All pass |
| SOURCE-UNCHANGED | Start = end | HEAD `971141d`; 7 M + 13 ??; frozen 506/506; A's end hashes; `Modal.tsx` = `741c2341`; `ffmpeg.ts` = `0995ae78`; StudioContext `caa388e7` |

- **Why the regression scope is reduced:** only the Tab handler changes, and the layout is untouched. Round 88's VIS-IDLE, VIS-SCROLL, VIS-DONE, VIS-ERROR, VIS-VIDEO, PX-PHASES-R and PX-WAV5-R stand as evidence for the footer. VIS-RENDER-S is one sanity sample.
- **Gate rows** (`gate`, not claimed by C): full vitest, typecheck, build, Biome, `npm run verify`, e2e smoke.
- **Production bundle** (worker + MP3): B asks root to try it again at gate 89 (PROD-MP3-UNVERIFIED).
- **Ableton match:** not applicable (§4).
- **Neighbour behaviour that could break:**
  - Escape still closes, and focus returns to the opener;
  - initial focus on Close when the dialog opens;
  - focus moves to Close when a render ends (frozen l.428);
  - a focused format radio keeps focus through render start and end (frozen l.458);
  - the footer guard (FT4);
  - the hidden-wrapper wraps (HD1–HD3);
  - ArrowDown/Up inside a radio group (native; unchanged).
- **Known and intended (not new bugs):**
  - Close stays disabled while rendering;
  - Cancel arrives in stage 3b;
  - changing the format mid-render does not affect the running export (GATE86-S4, rejected);
  - the timeout text (Low R87-L-TIMEOUT-RELOAD-TEXT);
  - the headless `<progress>` fill colour (R87-T);
  - the 45 px idle overflow at 1280 behind the sticky footer (info, round 88).

## 6. After this round
- **If C PASS:** SRW-20 stage 3a is fully C-verified at both viewports (round 87 rows + round 88 footer + round 89 trap). Root can publish rounds 87, 88 and 89 together.
- **Round 90:**
  - If its planning falls on or after **2026-10-24**: a **regression round** (one short browser check per done or c_pass item at both viewports, plus `npm run test:e2e:smoke`; GATE85-S6 and C-R83-S-1280-RANGE-SHIFT are rows).
  - Otherwise: **SRW-20 stage 3b**:
    - Cancel in every phase, with no file, an exact cancelled message and a working next export (Cancel adds an enabled control during a render; the round-89 stop-based trap must keep it in order);
    - abort on unmount (A-R86-L2);
    - the WAV + MP3 delivery note (GATE86-S2);
    - reviewer L5 (a failed conversion leaves the cached encoder).
  - 3b completes R20-X4.
- **Then:** the Lows batch (incl. R87-L-TIMEOUT-RELOAD-TEXT and the round-88 reviewer edge cases A-R88-EDGE-1..4) → SRW-21 → full regression → T12 → VISUAL-A-OBSIDIAN.
- **Architecture:**
  - The round-88 reviewer proposed a `useExportDialogFocus` hook "if another focus or scroll concern lands here". Round 89 is that trigger.
  - It is recorded as signal ARCH-R88-EXPORT-DIALOG-FOCUS-HOOK and added to checkpoint request q14 (`b-round-83-checkpoint-request.md`). That request asks root for the bounded frontend-architect checkpoint at the SRW-20 boundary, after 3b.
  - No extraction in this round.

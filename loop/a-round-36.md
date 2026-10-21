# A — Round 36 report (C-R34-01 + C-R34-02, with the D-29z1 ruling)

Date: 2026-10-13 (17:07–17:35 +04:00) · Implementer: A (Claude Opus 5.5) · Status: **implemented and ready for C**. No PASS is claimed here; C verifies.

## 1. Pre-flight gate

- **Read before the first edit:** `.claude/rules/read-primitives.md`.
  - Primitives: `AGENT_DISCOVERABLE_CODE`, `FORWARDREF_COMPONENT`, `REACT_CONTEXT`, `AUDIO_ARCHITECTURE`, `TESTING_QUALITY_GATES`, `BUG_HUNTING_TESTS`, `GEORGIAN_DOCS`.
  - Also: `prompts/studio-feature.md`, `skills/pre-flight/SKILL.md`, `commands/check.md`.
  - Material: `a-round-35.md`, the proposed diff, the proposed describe, and C's `cr-baseline-1440.txt` and `sb-geometry.txt`.
- **Assumptions:**
  - Same as round 35.
  - "Range" means a native `input[type=range]` only.
  - `blur()` fires React `onBlur` synchronously, before the range's bubble-phase `onPointerDown`.
  - The root capture runs before the scroller capture.
  - The ruling allows exactly 3 changed lines in the frozen test.
- **Smallest version:**
  - `StudioWorkspace.tsx`: +15 lines for the handler and +1 JSX attribute.
  - The test file: the 3 ruled lines and the appended describe, byte-identical to `new-describe.tsx.txt`.
  - Doc 036: the header line, the l.355 parenthesis, and one appended section.
- **Success criteria:**
  - Red run 9 failed | 57 passed.
  - Intermediate run 1 failed | 65 passed, failing only at l.1265.
  - Green run 66/66.
  - Full vitest 1259.
  - tsc 0, build ✓, and Biome showing only the 2 baseline errors.

### Baseline (before any edit, 17:07)

```
git rev-parse HEAD → 1cefea18500ac98c523caae6bf9626c811254b9e
git status --short → the same 9 lines as the task baseline
sha256sum -c b-round-35-tree-sha256.txt | grep -vc ': OK$' → 0  (376 OK)
StudioWorkspace.tsx b64a2cf6 · fader-guards.test.tsx 11a19bf6 · 036 e86072b8  (= snapshots)
proposed-StudioWorkspace.diff 3ec3dca1 · new-describe.tsx.txt ab95eb26  (as dispatched)
protected 4/4 OK
node.exe → 7
```

Root had not committed.

### §1.4 re-check (still true)

- **Root div** (`studio-container`, snapshot l.1316): it had no `onPointerDown`/`onPointerDownCapture`. The only `onPointerDownCapture` in the file was the scroller's (l.1379 before the change).
- **Every `claimPointerGesture(` site is unchanged:**
  - Clip l.231, DetailPanel separator l.680, Lane height handle l.414, LoopBrace l.71, Overview l.169, VideoDock l.760.
  - **`StudioWorkspace` lane-background marquee l.917** (`preventDefault` l.921).
  - Context l.2128/2243/2374: Volume, Pan and Master. These are native ranges without `preventDefault`.
- **Native `type="range"`:** exactly four. `ArrangementLane` l.582 (Pan) and l.626 (Volume, also used for video Volume), `ArrangementMaster` l.147, and `ArrangementTransport` l.189 (Zoom).
- **No frozen test other than l.1258–1278 conflicts.** The intermediate run (below) shows exactly 1 failure. The full suite with the handler is 1259/1259 after the ruled amendment.

## 2. Red, intermediate and green runs (all in `store/`)

| Step | Source state | Result | File |
|---|---|---|---|
| Red | `StudioWorkspace.tsx` = `b64a2cf6`, describe appended | `Tests 9 failed \| 57 passed (66)`: cases 1–9 red; 10, 11 and 12 green; the 54 existing tests green | `a-round-36/red-run.txt` |
| Intermediate | handler applied, before the amendment | `Tests 1 failed \| 65 passed (66)`: only `review: during an active Pan drag…`, at `fader-guards.test.tsx:1265:38`, `expected <body>… to be <input type="search">` | `a-round-36/intermediate-run.txt` |
| Green | the 3 ruled lines changed | `Tests 66 passed (66)` | `a-round-36/green-run.txt` |

## 3. Diff summary

- **`app/components/arrangement/StudioWorkspace.tsx`** (`7fe98434`, full diff in `a-round-36/StudioWorkspace.diff`):
  - Hunk 1: the new `releaseTypingFocusBeforeRangePointerDown` `useCallback`, after `releaseEditFocusOnTimelinePointerDown`.
  - Hunk 2: `onPointerDownCapture={releaseTypingFocusBeforeRangePointerDown}` on the root `studio-container` div.
  - The `diff -u` body is **byte-identical** to `a-round-35/proposed-StudioWorkspace.diff` (`cmp` with the header lines excluded).
  - Applied with `patch -p0`, cleanly, with no `.orig`/`.rej` files.
- **`app/lib/arrangement/__tests__/fader-guards.test.tsx`** (`ca3153ad`, diff in `a-round-36/fader-guards.diff`):
  - Exactly 3 `-` lines, at l.1258, l.1265 and l.1272, with the ruling's bytes and the original indentation.
  - The appended describe sits before the outer `});`. It is **byte-identical** to `new-describe.tsx.txt` (checked by a `endsWith(describe + '});\n')` test).
  - Biome `--write` applied no fixes.
  - Plain `diff` shows the append as `1359a1360,1601`. That is diff's alignment of the identical `    });\n  });\n` tail; the first 1361 snapshot lines are unchanged apart from the 3 ruled lines.
- **`docs/implementation/2026/quarter-IV/036-studio-lab-track-pan.md`** (`d5f206c1`, diff in `a-round-36/doc036.diff`, 3 hunks):
  - **l.4 header:** rounds 31–34 are now marked C-verified, and round 36 waits for C.
  - **l.355:** only the parenthesis is replaced, with B's suggested accurate text (C round 34 geometry: a 10 px vertical gutter, the hidden scrollbar hit-testing children, a 0 px horizontal scrollbar).
  - **Appended "Round 35–36" section:** the bug and its cause, and why only native ranges are affected (the owner list includes the lane-background marquee). It also covers:
    - the 3-condition rule and the capture order;
    - what stays unchanged, and the user-visible results, including the Pan centre 0 → 0 note;
    - decisions 1–5, including the 4b note;
    - the round-35 stop and the D-29z1 ruling with C's evidence;
    - the C-R34-02 correction, and that l.360 is superseded (l.360 itself is not rewritten);
    - the 12 tests, the red/intermediate/green numbers, and the C/Tech Lead IDs;
    - the Ableton note (all four rows as in §4.6).
  - **Added after the review:** the A-R36-REVIEW-1 note (see §4).

## 4. Code-reviewer (real `code-reviewer` subagent, 3 files) — findings and dispositions

The reviewer scored it 8/10. The handler is correct under the contract. Checked and fine:
- the capture order;
- no double commit;
- the synchronous `onBlur`, with the old selection and ref-based history;
- right button, touch and pen; the Zoom `<label>`;
- TS strictness and style;
- test isolation;
- the doc matches the code.

| Finding | Severity | Disposition |
|---|---|---|
| **A-R36-REVIEW-1.** Case 10's focus assertion (Clip Gain keeps focus at Master id 42 during a separator gesture) and its later blur-commit hold only in jsdom. In a real browser, a second pointer (id 42) pressing Master has no `preventDefault`. Focus then moves natively, `commitClipGain('blur')` sees the active gesture (`ArrangementDetailPanel.tsx:333–336`, confirmed by reading), and the typed value is lost with the blocked status. This path predates round 36, is unchanged by D-29z ("gesture active → no blur"), and needs two simultaneous pointers (multi-touch). | Medium (per the reviewer) | **Doc fixed:** §"Round 35–36" now says case 10 checks only that the *handler* does not blur, and that the focus retention is jsdom-only. It records the multi-pointer loss path as open (A-R36-REVIEW-1), found by code reading and not reproduced in a browser. **Test not changed:** the describe must stay byte-identical to `new-describe.tsx.txt` (§2.3). **→ B** decides whether 4b handles it, or whether the assertions should be relabelled. |
| Case 8 does not assert that `start.value` is still `4.5` after the press | Low | Not changed (byte rule). → B / next test round. |
| l.1272 cannot fail once l.1265 is `not.toBe` | Nit | The ruled bytes were applied as given. Noted for B. |
| Case 7 could also pin `blurStatus === DETAIL_CLIP_GAIN_INVALID_MESSAGE` | Nit | Not changed (byte rule). → B. |
| `CLIP_GAIN_LABEL` / `typeGain` duplicate the round-34 local helpers | Nit | Accepted. They are scoped per describe, as in round 35's design. |
| The doc header says "Completed" while waiting for C | Nit | Follows the existing pattern; the status text says it waits for C. |
| A future portaled range under `StudioWorkspace` would also trigger the root capture | Nit | None exists today. Recorded here only. |

## 5. Command tails (verbatim; full outputs in `a-round-36/`)

```
git rev-parse HEAD → 1cefea18500ac98c523caae6bf9626c811254b9e  (start and end)
sha256sum -c ../tmp/studio-real-loop/b-round-35-tree-sha256.txt | grep -vc ': OK$' → 0  (end)
sha256sum proposed diff / describe → 3ec3dca175b0… / ab95eb265ce9…
npx vitest run …/fader-guards.test.tsx → Test Files 1 passed (1) · Tests 66 passed (66)
npx vitest run <11 frozen suites> → Test Files 11 passed (11) · Tests 253 passed (253)
npx tsc --noEmit → exit 0
npx vitest run → Test Files 69 passed (69) · Tests 1259 passed (1259)
npm run build → exit 0, "✓ built in 2.59s"
npx biome check --write <2 owned TS files> → "Checked 2 files … No fixes applied." (sha unchanged)
npx biome check ./app → Checked 338 files · Found 2 errors · Found 218 warnings · Found 1 info
   errors (--diagnostic-level=error): app\lib\__tests__\bug-hunting\auth-bugs.test.ts format; app\lib\auth.ts format (baseline CRLF, root's)
   0 diagnostics in StudioWorkspace.tsx / fader-guards.test.tsx
git status --short → the same 9 lines as the baseline
protected → download-routes.test.ts OK · account.downloads.tsx OK · api.studio-token.ts OK · studio.$productId.tsx OK
tasklist | grep -ci node.exe → 7 (start) · 7 (gates) · 8 (after my browse daemon started) · 7 (end, after my daemon was disconnected; a-browse.json removed by browse)
```

**`/check` (`commands/check.md`):**
- **`npm run verify` → exit 0** (`a-round-36/verify.txt`). It ran these steps:
  - `agents:check`, `test:agents`, `lint` (`biome lint ./app`: lint only, so the baseline CRLF *format* errors do not fail it), `typecheck`, `test:run` and `build`.
  - `test:run`: Test Files 69 passed · Tests 1259 passed.
  - `build`: ✓ built.
- **`npm run test:e2e:smoke` → NOT run.** `playwright.smoke.config.ts` `webServer` starts its own `npm run dev … --port 5187 --strictPort` with `reuseExistingServer: false`, and the task forbids A to start or stop a dev server. Root or C should run it.
- **The non-mutating `npm run check`** (Biome lint + format) equals the `npx biome check ./app` run above: 2 baseline CRLF errors, both in root's files.
- **Root items:** I scanned `publication-checkpoint.json` (`next`, `followupReview`, `oct13Checkpoint`). Its open items (the middle-east hardcode / SRW-21, the portable instruction paths, and the reviewer's low items still to be triaged by B) are already in task §4.8. No new item.

- **Final shas:** `StudioWorkspace.tsx` `7fe98434`, `fader-guards.test.tsx` `ca3153ad`, `036-…md` `d5f206c1`.
- **Browser smoke check** (one, allowed by §5; `a-round-36/browser-smoke.txt`, `a-browse.json`; **not a PASS claim**):
  - **Layout differs from L36.** The only clip was `Soft impact`, added by a library click plus Enter, and it landed on the **music** lane.
  - **Steps:** Clip Gain `3` without Enter, then a real click on music Volume.
  - **After the click:** status `Clip Gain: Soft impact — +3.0 dB.`, Undo label `Volume`, focus on `Volume — მუსიკა`, fader at 0.5 (the jump), and no blocked status.
  - **Undos:** Ctrl+Z gave `Undo: Volume`; a second Ctrl+Z gave `Undo: Clip Gain`, and the field showed `0.0`.

## 6. Deviations and §2.4 self-check

- **Deviations:** none from §2.1–2.3. In the doc, I added the A-R36-REVIEW-1 clarification after the code review (inside the appended section only).
- **The 53 untouched existing tests** are green and byte-identical (diff: only the 3 ruled `-` lines). Round 34's and round 33's describes are included.
- **The frozen `clip-gain.test.tsx` and `master-ui.test.tsx`** are green, within the 11-suite run of 253/253.
- **A Volume drag with no text field focused still writes exactly one entry.** I rely on the existing round-31/33 fader-guards and track-pan tests in the green 1259. I wrote no new test for it, and did not check it in a browser.
- **The full `npx vitest run` passed** with the handler: 1259/1259. This is the first full run including the 32 files outside `app/lib/arrangement`.
- **Mutations:** not run by A (they are C's, §4.6).

## Known gaps / open

- **A-R36-REVIEW-1** (multi-pointer loss path while another gesture is active; existed before) → B.
- **Test-quality nits** in the appended describe (case 8 start value, case 7 status pin, l.1272) → B. They are frozen by the byte rule this round.
- **Carried, unchanged:**
  - every §4.8 item;
  - root items (`root-pre-push-review.md` / `publication-checkpoint.json` / `b-round-35.md` §7): rounds 31–34 are ready for root's checkpoint, the CRLF auth files, SRW-21, Lenis on `/studio/*`, and the rest of §4.8's root list.

## Exact next C checks

Run §4 in checkpoint order: G36 → R36-CR (all 5 targets + the 1280×720 Master spot check + two Undos) → R36-S → R36-OT → R36-R34 → R36-CL → R36-K → R36-U mutations (a)–(f), with (c) composed per D-29z1 → R36-Doc. In addition:
- Check the doc's A-R36-REVIEW-1 wording against the code.
- If C can make two pointers (CDP touch), it may record the multi-pointer behaviour as evidence. It is not an acceptance row.

**Scope completed by A:** §2.1, §2.2 and §2.3 of round 36. No acceptance criterion is marked passed; C decides.

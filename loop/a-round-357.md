# A round 357 — PERF-10a (playback store)

**STOP — needs B ruling on A-REVIEW (unruled Medium: StudioWorkspace remount status order / announcement)**

STATUS: STOP — awaiting B ruling. The tree is left at the last consistent state (B's sketch applied exactly + doc 234). No code was changed after the code-reviewer ran; no attempt was made to fix the Medium, because the fix would change B's ruled stop-branch form (sketch-review finding 1, final form) or the leaf design B specified (L11).

## STOP measurement (static trace; code-reviewer finding "Medium — status can differ when StudioWorkspace remounts under a live provider")

1. **Remount path.** `app/routes/studio-lab.tsx` l.~114-119: `{showsWorkspace ? <StudioWorkspace /> : <StopPlaybackOnNarrow />}` sits under a live `ArrangementProvider`. Wide → narrow → wide unmounts and remounts `StudioWorkspace` while the provider, its status and the playback store stay alive. `StopPlaybackOnNarrow` stops playback, so the status left at remount can be a stopped-kind insert-marker text or `FOLLOW_PAUSED_MESSAGE`.
2. **HEAD order.** In `StudioWorkspace`, the tempo-seed `useEffect` (A's tree l.2022-2055; `tempoSeedOpenRef` is a component ref, so it re-arms on every remount and fires when a tempo-source clip is in the arrangement) is declared before the Follow `useEffect` (HEAD l.~2293). On mount both run in one effect pass: tempo-seed queues a functional append, then Follow queues a **string** `describeSpaceStart()` → the string replaces → the tempo text is lost; the sequence bumps.
3. **A's tree (B's sketch).** The Follow logic now lives in the child leaf `ArrangementPlaybackFollowSync`; React runs child effects before the parent's, so the leaf's mount effect runs first and queues the **functional** rewrite, then tempo-seed appends → final text = `describeSpaceStart()` + tempo-seed parts. Text differs from HEAD.
4. **Announcement.** `reduceArrangementStatus` (`app/lib/arrangement/status-announcement.ts` l.17-27): a string write always bumps `statusSequence` (gesture case aside); an updater that returns the same text returns the previous entry. If the status already equals `describeSpaceStart()` at remount, HEAD re-keys the status span (re-announce in the `aria-live` region); A's tree does not.
5. **Not covered by an existing ruling.** Sketch-review finding 4 ruled only "the leaf's effect runs before the parent's on mount — cannot happen today: the workspace never mounts while playing". This path is a remount while **stopped**, so finding 4's premise does not apply.
6. **Options for B** (reviewer's framing; B decides):
   - (a) accept as an intended deviation (tempo text survives; no duplicate announcement) and add a WIDE → NARROW → WIDE remount regression row; or
   - (b) require HEAD's text and sequence: e.g. a plain-string write on the leaf's mount run, or keep the mount-time sync in a `StudioWorkspace` effect after tempo-seed. Either changes the ruled form, so it is B's call.

Browser reproduction (A's tree only, dev :5173, `a-round-357/remount-probe.mjs` → `remount-probe-a-tree.json`, `.png`, log `remount-probe-run2.log`; run 1 was a cold-start TimeoutError, environment-invalid, replaced): recipe = Add first library item ("Middle East — public preview" → Music), Space play, Space stop, resize 800×900, back to 1440×900. **The path was not reached**: the status after stop was the "added …" text (not insert-marker-kind / Follow paused), and no tempo-seed text appeared on first add or on remount; final text after remount is unchanged and `data-playing` false. So reachability is **not confirmed in a browser**; a recipe that first sets an insert-marker status (ruler click) with a BPM-carrying asset is still needed. The STOP rests on the static trace.

**Reachability, split in two halves (grep + probe v2):**
- **Tempo-text half — reachable on `/studio-lab`.** `app/data/studio-lab-demo.ts` l.79/89: the synthetic "Night Pulse · Full mix" and its stems carry `bpm`, and `catalogueTempoBpm` accepts music/stem sources. Probe v2 (`a-round-357/remount-probe-v2.mjs` → `remount-probe-v2-a-tree.json`, `.png`, log `remount-probe-v2.log`; A's tree, dev :5173) confirms tempo-seed re-fires on remount: after wide → 800 → 1440 the status gained a second "Tempo 120 BPM from “Night Pulse · Full mix” — …" append. The precondition for the HEAD/A difference (an insert-marker-kind or Follow-paused status at remount) was **not** reached: my ruler click (bottom strip of `arrangement-ruler`) produced no status change, so this run is the "no write" branch, where HEAD and A's tree behave the same by trace. Recipe still owed: a click that really sets the insert-marker status (or Space → Space after one), then 800 → 1440, on HEAD and on A's tree.
- **Announcement half — needs no BPM.** Any insert-marker-kind status equal to `describeSpaceStart()` at remount: HEAD re-keys the status span (string write), A's tree does not (updater, same text). Not observed in a browser this round.
- **Side observation for B (pre-existing by trace, not caused by this round):** the tempo-seed status text is appended again on every narrow → wide remount (duplicated "Tempo 120 BPM …" in probe v2). On HEAD the Follow effect does not write in this state, so HEAD should show the same duplicate; not verified on HEAD. Proposed Low id A-R357-TEMPO-SEED-REMOUNT-DUP for B to confirm.

## Changed files (`git status --short --untracked-files=all`: 56 entries; `a-round-357/claims-final.txt` K2)
- Source (B's `source.patch.txt`, sha256 4f977508…): `app/lib/arrangement/playback-store.ts` (new), `app/contexts/ArrangementContext.tsx`, `app/components/arrangement/StudioWorkspace.tsx`, `ArrangementTransport.tsx`, `ArrangementVideoDock.tsx`, `ArrangementMarkerRow.tsx`, `app/routes/studio-lab.tsx`.
- Tests (B's `tests.patch.txt`, sha256 ca027765…): `__tests__/helpers/workspace-probe.ts` (new), `__tests__/playback-store.test.ts` (new), the 46 files of `b-round-356/tsc-removal-files.txt` (rule R; includes render-budget and bars-ruler-ui with RB-PB1, RB-PB2, FW-PB1 and the §1.2 rulings).
- Doc: `docs/implementation/2026/quarter-IV/234-perf-playback-store.md` (new).
- Not touched: `perf/**`, `package.json`, protected files (K6 11/11), root-lane files.
- Diff copies: `a-round-357/source.diff`, `a-round-357/source-and-tests.diff` (taken before the doc).

## §2.1 rows
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS pre | PASS: identical to `claims-357-planning-output.txt` | `a-round-357/claims-pre.txt` |
| A-CLAIMS final | PASS: vs sketch output only K2 (`d49536b 56 outside-root-lanes-since-d49536b 0`) and K13 (`doc234:1`) differ, as required; K1, K6, K8–K11 equal planning | `a-round-357/claims-final.txt`, `claims-final-vs-sketch.diff` |
| A-TYPE | PASS: `npm run typecheck` rc 0 (no tsc file outside the 46 + §1.1) | `a-round-357/typecheck.log` |
| A-LINT | PASS: `npm run lint` rc 0, 205 warnings (= cap 205), 1 info | `a-round-357/lint.log` |
| A-COVER | PASS: 69 files (46 sweep ∪ 47 M-B3 files ∪ playback-store.test ∪ render-budget ∪ bars-ruler-ui, `sort -u`), **1273/1273**, rc 0, 2 m 4 s. Slowest single test CP12a 6959 ms vs its describe timeout 30 000 ms (< 50 %; gate 356 verify.log: 8989 ms) | `a-round-357/cover-files.txt`, `cover.log` |
| A-MUTANT | PASS: scratch from `git archive HEAD` + `git diff --binary` + 4 untracked files + `node_modules` symlink (`a-round-357/make-mutants.py`). M-B1 3 failed / 10 (RB-PB1, RB-PB2, "does not re-render clips…"); M-B2 2 / 10; M-B3 18 / 959; M-B4 9 / 959. Red names and counts **identical** to `b-round-356/mutants/mutant-m-b{1,2,3,4}.log`. `store/` status unchanged (diffed); scratch deleted | `a-round-357/mutant-m-b*.log`, `mutant-m-b*-red.txt`, `store-status-before-mutants.txt` |
| A-PERF | PASS (section below) | `a-round-357/perf.log`, `perf-rowcmp-vs-c356.txt` |
| A-REVIEW | **NOT PASSED** — one unruled Medium (STOP above) | reviewer result summarised below |
| A-DOC | written: l.4 `**სტატუსი:** In Progress (stage 1 of 3; C round 357 PASS)`; TEMPLATE's 7 `## ` headings in order; cites only PS1–PS3, RB-PB1, RB-PB2, FW-PB1 (grep-confirmed present). Its content assumes the round passes as dispatched; if B rules (b), doc 234 needs updating | `docs/implementation/2026/quarter-IV/234-perf-playback-store.md` |

## A-PERF
PASS on every A-PERF criterion (production build on :5188, run **alone**, nothing else running):
- `npx playwright test -c playwright.perf.config.ts perf/studio-lab-interactions.perf.spec.ts` rc 0, `1 passed (8.2m)`; `complete` true; `failures` []; 252 rows; asserted 84, asserted-pass 84; 0 NEW; **`durationMs` 480142** (≤ 540000).
- `python3 -I b-round-329/perf-rowcmp.py c-round-356/perf-results/latest-interactions.json a-round-357/perf-results/latest-interactions.json`: rc 0; **DIFF only** `interact.play.start-components`, `.6x`, `interact.play.stop-components`, `.6x`: 70 → **28** [28, 28, 28] (= B's sketch, §0.3); 177 EQUAL; `start-commits`/`stop-commits` 1, `start-sources` 1 (1× and 6×).
- Evidence: `a-round-357/perf.log`, `a-round-357/perf-results/latest-interactions.json`, `a-round-357/perf-rowcmp-vs-c356.txt`. `store/` status still 56 entries afterwards (`test-results/` is git-ignored).

## Code-reviewer (actual `code-reviewer` subagent, on the full diff; score 8/10; no Critical/High)
- **Medium:** remount status order / announcement → STOP above.
- **Low (latent):** outside React events, `useSyncExternalStore` renders the store write at SyncLane, apart from status dispatches. The early-return check then decides on the committed (possibly stale) status, and the preview branch's string write could overwrite a `pausePlaybackWithStatus` message if a matching preview existed. Reviewer checked current out-of-event stop callers (rAF end stop, async import paths, `pausePlaybackWithStatus`): unreachable today; a trap for future callers. Proposed id A-R357-REVIEW-SPLIT-RENDER-LATENT.
- **Low:** `describeSpaceStart()` evaluated at update-processing time, not effect time — equivalent today (info).
- **Low:** two read policies (MarkerRow `getState()` live vs StudioWorkspace committed ref) — already ruled as sketch-review finding 7 (accepted deviation); reviewer asks for one documented policy.
- **Low (tests):** FW-PB1 uses a real 50 ms wait with act off (flake risk); suggests asserting `statusSequence === before + 1` and a pending-preview variant. `useWorkspaceProbe` returns a new object per render, so `toBe` on `api.current` means "probe did not re-render" — worth a note next to the helper. Proposed id A-R357-REVIEW-FWPB1-TIMING.
- **Low (rules):** "no implementation doc" — moot: the reviewer read the diff snapshot taken before doc 234 was written. No code changed after the review, so no re-review is required.
- **Architecture note (proposal for B/root, not an instruction):** `isPlaying` moved from provider React state into a `lib/` store, following the position/range/preview/selection pattern; the leaf adds a lifecycle (ref mirror + effect callback) to `StudioWorkspace`. `ArrangementContext`/`StudioWorkspace` are again reworked for performance, and ~44 test files needed the probe switch. `.claude/references/architecture-checkpoint.md:33` lists the `useArrangement()` shape as an invariant; the task sanctions this change, but root/B should acknowledge it. Verdict: keep. Proposed bounded task: a Georgian architecture note on the split playback hooks and the "live vs committed `isPlaying`" read policy, `useWorkspaceProbe` as the documented test API, and a remount regression test. Alternative the reviewer weighed and rejected for now: a plain React context `value={isPlaying}` backed by provider `useState` (same isolation, same-render with status dispatches, no split-render issue); switch if more status logic starts depending on `isPlaying`.

## Known gaps
- Probe v1 read `data-status-key` (React keys are not DOM attributes), so it could not have observed the announcement half; probe v2 uses a node-identity marker instead (`spanSameAsPreviousRead`).
- The HEAD/A status difference itself was not reproduced in a browser (precondition not reached); HEAD was not run (no second dev server started).
- A-REVIEW not passed (STOP).
- A does not run full vitest / build / verify (gate rows).

## Next C checks (only after B's ruling)
- If B rules (a): all §2.2 rows as written, plus a new row WIDE → NARROW → WIDE (tempo-source clip present, stopped status before resize): record the status text and `statusSequence`/announcement on HEAD and on A's tree, and compare with B's accepted wording.
- If B rules (b): a re-dispatch with the changed form; the mutants and covering set re-run on the new tree.

# B round 446 → 447 planning report

**Date:** 2026-11-11 · **Decisions:** D-29z1586 … D-29z1588 (`backlog.json` v432 → v433; advisor follow-up `update-backlog-2.py`) · **Advisor:** available, consulted after orientation and before writing the task.

## 1. Round 446 accepted (D-29z1586)
- **C evidence:** `c-round-446.json` PASS, `browserVerified`/`realVerified` true, C1–C14 PASS, 1 Low.
- **Gate 446:** `published`, commit `5df7717` on both remotes (`gates/gate-round-446.json`). The baseline for round 447 is `5df7717`, the gate's `commit`. Its `head` field and `context/head-sha.txt` both still say `4bfebd7`.
- **STORE-2b-1 is done** (PD-REVIEW F4 / Saba Q3).
- **C-R446-01 ruling (L10).** Round 446's change 3 specified the error reset at hide time only. A submit still in flight is a gap in B's spec: A applied B's sketch unchanged, so the origin is B. It is the same issue as A-R446-REVIEW-L1, so C-R446-01 is recorded as `confirmedBy` there (L7). It is Low and goes to `deferred_low_polish`, attached to the next stage that touches `useLeadMagnet.ts`. Its acceptance row will be `c-round-446/tools/inflight.cjs`.
- **New deferred Lows:**
  - A-R446-REVIEW-L3-TEST-HYGIENE (A reviewer findings 2 and 3);
  - GATE446-L1-SCROLLLOCK-REF-IN-RENDER;
  - GATE446-L2-STUDIO-UNMOUNT-SCROLL (pre-existing);
  - GATE446-I1-ROUTER-CONTEXT (info).
- Gate finding 3 is recorded as `confirmedBy` on SIG-R446-LEADMAGNET-CAP-COMMENT.
- **Architecture notes.** A and the gate both say keep. B recorded them as signal SIG-R446-OVERLAY-ROUTE-POLICY, which is not scheduled. There is no checkpoint request, because no structural risk is accumulating on one owner.

## 2. What is next and why (D-29z1587)
- **Due dates:** regression is not due (on or after 2026-11-13). RETRO is round 450.
- **Open bugs:** no C bug above Low and no loop-runnable Critical or High is open. STEM-LANES is still `awaiting_user`.
- **Recount at `5df7717`:** 44 teal hits in 14 TS/TSX files. The old 24/9 count missed the `rgba(19, 217, 204 …)` and `hsl(175 …)` forms. The computed-style probe on HEAD found 34 hits on `/` and 1 on `/gift-cards` (`b-round-446/probe/teal-head-1440.json`). Of the 34 on `/`, 18 come from the CSS classes `hero-title-glow`, `text-glow` and `light-flicker-effect` (2b-3) and 16 from StudioMockup.
- **STORE-2b-2 split:**
  - **2b-2a (round 447):** 21 hits in 7 reachable files. The 2 stems-modal hits move to STORE-4: no mock product renders "Play Stems", and the SSR loader cannot be stubbed. STORE-4's D8 replaces that modal. Root is asked for a stems product in the mock API (ROOT-REQ-MOCK-API-STEMS).
  - **2b-2b (next):** 8 hits in e-mail HTML, with a rendered-HTML Chromium contrast row.
  - **Dead code:** `Timeline.tsx`, `CinemaCurtainLoader.tsx` and `PianoLoadingAnimation.tsx` have 0 importers. They go to LEGACY-DEAD-STORE-COMPONENTS for the next cleanup round, under Saba's legacy removal policy.
  - **Frozen:** `StudioTrack.tsx:155` (`components/studio/**` is forbidden) waits for the legacy Studio removal with SRW-21.
  - Nothing is dropped. Orange and buy-blue in TSX survive only in dead or frozen legacy files and in `SocialIcons` (third-party brand colours).
- **`product-designer` consult:**
  - Every glow is removed, and brass stays only on flat fills and strokes.
  - Solo uses the foreground fill, as in the real Studio (`ArrangementLane.tsx:946-947`). The loader wordmark becomes solid foreground.
  - The checkout ripple is removed by default and asked once as SABA-Q-CHECKOUT-RIPPLE (`awaiting_user`).
  - Spotted items outside this round (loader `font-bold`, the card's `scale-[1.02]` and 500 ms transitions, the mockup's red mute and window dots, StemControl `aria-pressed`) go to the 2c/2d notes and to PD-R447-STEMCONTROL-ARIA-PRESSED.
- **Non-teal glow blobs** in TSX and the CSS glow classes were added to 2b-3's inventory.

## 3. Round 447 = STORE-2b-2a (D-29z1588)
- **Grants:** `b-round-446/grants-447.txt` (7 code files, new test `store-teal-sweep.test.ts`, doc 292).
- **No B sketch.** A applies an exact per-hit token table.
- **Advisor follow-up.** B measured every HEAD control in real Chromium at 3 viewports (`probe/head-states.json`, K19): the loader has a gradient and a teal drop-shadow (3 teal elements); a home card on hover has 2 radial layers and computed `scale` 1.02 (`transform` none); SpecialOffers ×2, Newsletter and the selected gift amount have a teal box-shadow; the showcase has 8 teal paths; the checkout ripple has a teal shadow; 0 of 6 products show Play Stems.
- **Row types.** The tree-side asserts are absence checks, and C's own probe must first reproduce the measured HEAD values. Numbers B did not measure are WCAG thresholds or `record` rows. This is not a full L58 sketch run. The mutants M1–M5 are run by A and re-run by C.
- **Corrections from the follow-up.**
  - `ProductCard` renders on the home `ProductSection`, not on `/store`.
  - The loader's "Secondary glow" (l.141–158) is the teal halo that 6a removes.
  - Full-page screenshots at 3 viewports were added (C9).
- **Collision check (L23):** `store-focus-ring` (c) counts ProductCard hover-reveal wrappers that contain `<AudioPreviewButton`. The 2 spotlight tags are self-closing and not counted, so removing them keeps the count at 1. The other covering files that mention teal or these components are in `covering-files.txt`. B did **not** run them on a sketch, so a red covering file is a STOP for A (L11).
- **Claims:** `b-round-446/claims-447.sh` (K1–K18), with the planning output saved.

## 4. Ready for commit
Round 446 is published (`5df7717`). B has nothing else for root to publish. Round 447 is dispatched.

## 5. Notes for root
- The gate JSON's `head` field (`4bfebd7`) and `context/head-sha.txt` lag the published commit `5df7717`. This is informational.
- The mock API on `:5199` and the dev server on `:5173` were up during planning. C restarts them if they are down.

## Artifacts
`b-round-446/`:
- planning inputs: `grants-447.txt`, `covering-files.txt`, `claims-447.sh`, `claims-447-planning-output.txt`;
- HEAD probe: `probe/teal-scan.cjs`, `probe/teal-head-1440.json`, `probe/head-states.cjs`, `probe/head-states.json`;
- backlog update: `update-backlog.py` (+ `.done`);
- backups: `backlog-before-447.json`, `feature-status-before-447.md`, `b-next-before-447.json`.

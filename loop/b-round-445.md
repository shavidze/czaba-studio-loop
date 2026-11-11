# B round 445 → 446 planning report

**Date:** 2026-11-11 · **Decisions:** D-29z1582 … D-29z1585 (`backlog.json` v431 → v432) · **Advisor:** available; consulted after orientation (order, design constraints, environment, bookkeeping) and before hand-off.

## 1. Round 445 accepted (D-29z1582)
- Evidence: `c-round-445.json` PASS, `browserVerified`/`realVerified` true, 0 bugs; C5 tree ALL OK (14) vs HEAD 8 of 14 failing; C6 ALL OK ×3; C7 ALL SAME; gate rows left to the gate. L57 re-run by B: OK (`b-round-445/l57-check-c445.txt`).
- Gate 445: `published`, commit `4bfebd7` on both remotes (`gates/gate-round-445.json`). Baseline for round 446 = `4bfebd7` (the gate's `commit`, not its `head` field).
- **SYS-3 is done** (stages 1, 1-fix, 2a, 2b; published 4aa3c82, 1eefb4c, 616729c, 4bfebd7). Platform half stays on TLM-SYS3-IME-PLATFORMS (RETRO 450).
- Closed: TL-R443-G3-PLAIN-HELD-ROWS, A-R443-REVIEW-L1-IME6-WEAK-GAIN, A-R443-REVIEW-L2-IME6-ONE-IT, A-R444-REVIEW-I1-HELD-ESC-VIDEO, GATE443-L1-REPEAT-ESCAPE-BUBBLES; SIG-R442-INLINE-EDITOR-KEYS → implemented.
- New deferred Lows: A-R445-REVIEW-L1-IME12-229-FORM, A-R445-REVIEW-L2-DETAIL-TO-FIELD, A-R445-REVIEW-L3-IME14-SCAN-FORMS (+ `confirmedBy` on TL-R445-I1), GATE445-L3-PRESSCELL-FINALLY.
- Gate finding 1 (Low): no fix needed (idempotent guard, FV-HELD). Finding 2 → **SIG-R445-INTENT-RETURNS-KEY** (Architecture signal, not scheduled). Finding 4 (Info) → `confirmedBy`.
- Architecture notes (A and gate) agree: keep `inlineEditorKeyIntent`; no handler factory. Recorded as signals; no checkpoint request (no structural risk accumulating on one owner from this stage; ARCH-SPLIT already carries its root frontend-architect checkpoint).

## 2. What is next and why (D-29z1583)
- Regression not due (last 2026-11-10; due on or after 2026-11-13). RETRO round 450.
- No C bug and no loop-runnable Critical/High/Medium is open.
- 2026-10-27 order: STUDIO-PERFORMANCE → SYS-1…3 → STORE-2b…5. SYS-3 is now done. STEM-LANES (placed before SYS-1…3 by Saba) is still `awaiting_user` — `user-review/AGREE-STEM-LANES.md` has no answer — so it does not outrank STORE-2b. Direction A is decided (`direction-decision.md`).
- **STORE-2b split** into 2b-1 (LeadMagnet route exclusion, PD F4 / Saba Q3), 2b-2 (TS/TSX teal sweep), 2b-3 (`app/styles/app.css` glow/gradient; B narrow grant as in rounds 192/196/201/316), 2b-4 (F6 visual). 2b-1 first: Saba-approved behaviour, small, and it removes the auto-opening popup that interrupts C's product-page probes in STORE-4 (L1).

## 3. Round 446 = STORE-2b-1 (D-29z1584)
- `product-designer` consult: (a) suppress silently, count no view; (b) fresh window after an excluded page; (c) hide an open popup on an excluded route without a dismissal; (d) only Saba's list, whole path segments. One correction by B: HEAD's 8 s check is one-shot (keep-list), so the designer's "wait 8 s again" row became "exit intent after its own scroll" (LMR5) and "scroll right after return, then 8 s" (LMR6).
- Reference: Baymard #709 public summary (overlays in checkout distract at a critical moment); no primary source for product pages, Saba's Q3 is the authority. Ableton/YouTube/AGREE/screen budget not applicable (Store, Saba already decided, nothing persistent added).
- Sketch v1 (`sketch-446-v1.patch.txt`, sha 8ee8fdab…) → tech-lead approve-with-changes. **M1 reproduced in real Chromium** on the interim sketch: after Back the product page landed at y = 206 vs 0 in the no-popup control (`b-round-445/probe/sketch-back-1440.json`). v2 (sha e068c5c2…) adds the `useScrollLock` restore option (default `true`), the same-render mask, the error reset and router flags → tech-lead approve; one Low TL-R446-L1-POP-RESTORE-LOST deferred.
- Advisor follow-up (D-29z1585): **v3** (sha 685089e3…) adds only test row LMR13 (HEAD one-shot timer premise, green on the HEAD hook); tech-lead test-only delta: approve (title nit deferred). Mutant runner now takes tree, output and log dir. L50 grep: 12 hits, 4 rulings; header-link focus origin probed (sketch: focus returns to the header link = control at 3 viewports; HEAD: focus stays on the open popup's Close). HEAD-control server mode `none` tested. B's choices beyond Q3 (hide on navigation, re-arm after an excluded page) asked once as SABA-Q-LEADMAGNET-NAV-RULES (L44), defaults implemented.
- B pre-check on v3: typecheck 0, lint 205 warnings (= HEAD), Biome on the 4 paths rc 0; covering 4 files / 100 tests; full suite 278 files / 4105 tests rc 0; 14/14 mutants red (incl. M0 HEAD sources); real Chromium HEAD control 24/24 cells show the popup (excluded routes, exit intent, journey, Back keeps it open), sketch 30 cells with the popup only on the 6 home controls; Back: `scrollY` 0 = control, focus BODY = control, popup reopens on the offer step with `viewCount` 2.
- Grants (`b-round-445/grants-446.txt`): `app/hooks/useLeadMagnet.ts`, `app/hooks/useScrollLock.ts`, `app/components/marketing/LeadMagnetPopup.tsx`, new `app/lib/__tests__/store-lead-magnet-routes.test.tsx`, new doc 291. `app/root.tsx`, AuthModal and ui/Modal are not touched.
- New records: SABA-Q-LEADMAGNET-RECORDINGS-SCENES and SABA-Q-LEADMAGNET-NAV-RULES (`awaiting_user`), SIG-R446-LEADMAGNET-CAP-COMMENT (signal: cap 10 vs "Max 2" comment), TL-R446-L1-POP-RESTORE-LOST, TL-R446-L3-LOCAL-STATE, TL-R446-V3-TITLE (deferred Lows).

## 4. Teal recount for STORE-2b-2 (signal, not this round)
`grep -rnoiE "teal-[0-9]+|#(14b8a6|0d9488|2dd4bf|13d9cc)|hsl\(175" app --include=*.ts --include=*.tsx | grep -v __tests__` at `4bfebd7`: 24 hits in 9 files. The 2b-2 planning re-greps with `app/**` and `perf/**` roots and the brand rgb forms (L23/L29); this count is a starting point only.

## 5. Ready for commit
Round 445 is published (`4bfebd7`). Nothing else from B for root to publish; round 446 is dispatched.

## 6. Notes for root
- None blocking. The `app.css` work in STORE-2b-3 uses B's narrow-grant precedent, not a root request.
- Mock API on `:5199` was started by B for planning probes and stopped state is not relied on; C starts it if absent.

## Artifacts
`b-round-445/`: `sketch-446.patch.txt` v3 (+ `.sha256`, `sketch-paths.txt`, `sketch-files/`), `sketch-446-v1.patch.txt`, `sketch-446-v2.patch.txt`, `sketch-446-interim.patch.txt`, `sketch-446-v2-to-v3.diff.txt`, `sketch-review.md`, `grants-446.txt`, `covering-files.txt`, `mutants/` (14, v3) and `mutants-v1/` (9), `mutants-v2a/` (14, v2), `probe/` (`lm-routes.cjs`, `summarize.py`, `sketch-server.sh`, `head-1440.json`, `head-1280-375.json`, `head-back-1440.json`, `head-back-1280-375.json`, `sketch-back-1440.json`, `sketch-all.json` (v2 server; v3 source is identical), `sketch-header.json`, `head-header.json`), `logs/` (typecheck, lint, Biome, covering, full, `l50-focus-origins.txt`, `lmr13-on-head.txt`, `head-server-none-mode.txt`), `claims-446.sh` + planning/sketch outputs, `update-backlog.py`, `update-backlog-2.py`, `checkpoint.md`, pre-edit copies of the task, board and backlog.

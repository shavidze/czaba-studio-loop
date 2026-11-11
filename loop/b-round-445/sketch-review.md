sha256: 685089e36d6157a46af0c3c63d3a2ba3f9ecb51c49a35d6557d6352605cf3cad
verdict: approve (tech-lead, v3 test-only delta review; v2 approve)

# Round 446 sketch review (STORE-2b-1, LeadMagnet route exclusion)

Dispatched sketch: `b-round-445/sketch-446.patch.txt`, sha256 `685089e36d6157a46af0c3c63d3a2ba3f9ecb51c49a35d6557d6352605cf3cad` (v3). v2 is kept as `sketch-446-v2.patch.txt` (sha256 `e068c5c2a165aa76218b1c706efa2c5594e214910886e7daaa042dd379d67010`).
Reviewer: `tech-lead` (read-only; worked on the patch file and the scratch copy, no edits). The code-reviewer is not on B's consult list (L58: `tech-lead` while off B's list).

## Pass 1 — v1, sha256 `8ee8fdabc715ea3ae3a9a8d519cb4c1734a064e6caa6f74b87e51be04158b206` (`sketch-446-v1.patch.txt`)
Verdict: **approve-with-changes**. High: none.
- **M1 (Medium) — scroll after a route hide.** `useScrollLock.ts:35-48, 52-60` via `LeadMagnetPopup.tsx:31`: Remix `ScrollRestoration` runs while the body is still `position:fixed`; the unlock then calls `window.scrollTo(0, oldY)`, so the excluded page lands at the previous page's offset. **B reproduced it in real Chromium** on the interim sketch (v1 + M2/L3/L4, `sketch-446-interim.patch.txt`): product page `scrollY` 206 after Back vs 0 in the no-popup control (`probe/sketch-back-1440.json`). **Fixed in v2:** `useScrollLock(isLocked, { restoreScrollOnUnlock })` (default `true`), the popup passes `!isRouteExcluded`; rows LMR9 (no `scrollTo` on a route hide), LMR10 (Close still restores), SL1/SL2; mutants M10, M11, M12.
- **M2 (Medium) — one commit with the dialog on the excluded route.** `shouldShow` flipped only in the effect. **Fixed:** the hook returns `shouldShow && !isExcludedRoute`; row LMR11 (render log), mutant M9.
- **L3 (Low) — stale submit error after a hide.** **Fixed:** `setError(null)` in the excluded branch; row LMR12, mutant M13.
- **L4 (Low) — React Router future-flag warnings in the new test.** **Fixed:** `future={{ v7_startTransition: true, v7_relativeSplatPath: true }}` on both `MemoryRouter`s.
- Checked and sound: SSR/hydration (`useLocation` is provided by Remix on the server; `shouldShow` starts false on both sides); `useLocation` from `@remix-run/react` inside `react-router-dom`'s `MemoryRouter` shares one context (single `react-router-dom@6.30.0`); no double count or listener leak on a dep flip; focus on the hide path falls back like a plain navigation (the popup cleanup focuses only a connected element); an in-flight submit that resolves after a hide is harmless (`submitted` true).
- Note recorded: repeated Back/Forward through an excluded route can show the popup again, up to the 10-per-day cap (consequence of rulings b and c; stated in the task under Deviations, and asked once as SABA-Q-LEADMAGNET-NAV-RULES).

## Pass 2 — v2 delta, sha256 `e068c5c2a165aa76218b1c706efa2c5594e214910886e7daaa042dd379d67010`
Verdict: **approve**. No new Medium+.
- AuthModal (`AuthModal.tsx:35`) and `ui/Modal.tsx:66` call `useScrollLock` without options, so they keep the restore.
- The old effect's cleanup clears `top`, so the new effect's unlock branch does not scroll a second time.
- **Ref written during render:** acceptable; StrictMode double renders write the same value; a discarded concurrent render cannot reach an unlock without a committed render that rewrites the ref; a layout effect would need an isomorphic wrapper for SSR for no behaviour change. Keep.
- **Low — TL-R446-L1-POP-RESTORE-LOST:** a POP navigation (Back) to an excluded route while the popup is open loses Remix's saved scroll position for that page (restore happens in a layout effect while the body is still fixed); the page lands at its top. Better than the old-offset jump; recorded in the task ruling lines and in `deferred_low_polish`.

## Pass 3 — v3 delta (test-only), sha256 `685089e36d6157a46af0c3c63d3a2ba3f9ecb51c49a35d6557d6352605cf3cad`
Verdict: **approve**. The only change is test row LMR13 (pins HEAD's one-shot 8 s timer; green on the sketch and on the HEAD hook, `logs/lmr13-on-head.txt`). Diff of the two patch files: `sketch-446-v2-to-v3.diff.txt`.
- **Low — TL-R446-V3-TITLE:** the LMR13 title says "scroll plus 8 s" while the body waits 16 s (stronger than the title). Accepted; doc 291 may name it as written.
- Note: a late exit intent after the window passed is not pinned (HEAD behaviour unchanged; acceptable for this round).

## Ordering matrix
Not applicable: no concurrency or queue contract. The only ordering fact (layout-effect restore vs passive cleanup) is covered by the Pass 2 Low and C7.

## Mutants (all run with the new tests and the existing dialog file; logs `mutants/mutant-<id>.log`)
`mutants/results.jsonl` (re-run on v3 with the argument-taking runner): 14 lines, 14 red (M0-HEAD-SOURCES … M13-NO-ERROR-RESET). Pass-1 mutants (v1 code, 9 lines) are kept in `mutants-v1/`.

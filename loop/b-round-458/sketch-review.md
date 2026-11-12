# Sketch review — round 459 (SABA-B-13 entrance cover)

Reviewer: `tech-lead` (read-only), two passes, 2026-11-12.

## Review 1 — sha f34506fc61b69d91ecec8a3867221f70e7e54257e901974d2984f9fe4b1d557d (superseded)
Verdict: REQUEST CHANGES.
- High: the 2000 ms cap was broken at 4x CPU (elapsed sampled at claim; timers armed later). -> fixed: start-anchored timers, cap 1900 ms.
- Medium: raw useLayoutEffect logged "useLayoutEffect does nothing on the server" on every SSR of /. -> fixed: plain useEffect; L1 console spy; mutant M16.
- Low: clock definition unclear -> the task defines it (data-start / first covered rAF sample).
- Low: ENTRANCE_ONCE_PER_TAB constant true with dead branches -> removed; one-line sessionGate.
- Low: var(--color-black) depends on a utility using black -> C row reads the computed colour; deferred signal TL-R459-COLOR-BLACK-DEP.
- Low: client-nav fallback not probed -> probe mode "arrive" added.
- Low (pre-existing): hardcoded '#000' in SpotlightLoader -> deferred (2b-3d / STORE-5 owner).
- Mutants requested: useLayoutEffect swap (M16), fallback-with-cover (E12/M17), missing start (E13/M18). Added.

## Review 2 — dispatched sha f499b724240383adaa5ede24f377ae471d8112435bef59885088f2784eb6e164
Verdict: APPROVE.
- All review-1 findings resolved; new click race (found by B's browser probe) fixed by E14/M19.
- Remaining Lows (non-blocking): stale mutant log (deleted by B); click50 metric definition (task defines it: rows assert logo 0 and URL /, not coveredUntil); 'expired' path cuts the CSS fade instead of fading (cosmetic, TL-R459-EXPIRED-CUT); test nits: E2 isFinite line always passes (next line asserts non-null), redundant `let notPrevented` (TL-R459-TEST-NITS).
- 4x CPU: fresh rows may assert removal <= 2000 ms after data-start; clientnav 4x is record only.
- 1x: assert removal in [1400, 1700] ms after the first covered sample only for rows ending 'live' (fresh, clientnav); not for blockjs/delayjs (CSS failsafe), skip or rm rows.

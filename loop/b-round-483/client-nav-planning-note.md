# Note for the CLIENT-NAV-CONTRACT planning (round 485), gathered at the 483 -> 484 planning on HEAD 751e30e
Data only; re-verify every line at the planning of round 485 (L29 tags). Ruling source: D-29z1704, b-round-479/consult-tech-lead.md §3.
- app/root.tsx is in global_forbidden_files; AppContent renders `<Header>` only when `!location.pathname.startsWith('/studio')` (root.tsx ~l.136-143 at 751e30e). Header.tsx (296 lines) already imports useLocation (l.1, l.40).
- Store routes with no `meta` export at 751e30e (shell loop over app/routes/*.tsx): account.downloads (forbidden), account.orders, account.reset.$id.$token, account, account_.login, cart, search (+ api.subscribe, sitemap[.]xml, studio.$productId: not pages / Studio).
- Other speakers on Store pages: LeadMagnetPopup.tsx:240 role="alert"; store.tsx:351 role="alert"; AudioPlayer.tsx:64 role="alert"; recordings.$productId.tsx:154/165.
- app/lib/link-focus.ts (releaseLinkFocus) sets body tabIndex -1 without try/finally (GATE479-L2-TABINDEX-FINALLY, Low, deferred).
- Related deferred Lows the consult lists as closed by CLIENT-NAV-CONTRACT: GATE479-L2-TABINDEX-FINALLY, A-R479-L1-TARGET-BLANK, A-R479-L3-DEFAULTPREVENTED-UNTESTED, A-R479-L2-SLOW-LOADER-FOCUS, B-R479-LEADMAGNET-TIMER-CLIENT-NAV (all deferred_low_polish D-29z1701); RC-R479-CLIENT-NAV-FOCUS is NOT-FOUND by find-ids (it is a retro candidate, not a finding).
- Sketch pre-run still owed (D-29z1704): title timing, fallback on the meta-less routes (title, else main h1), Studio -> Store remount (module-level flag). Not run at this planning because round 484 is the regression remainder (D-29z1720).
- Mock API was not running at this planning (:5199 000); /studio-lab 200.

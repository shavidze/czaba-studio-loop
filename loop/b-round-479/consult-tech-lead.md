# tech-lead consult — RETRO 480 (returned 2026-11-12; saved by B, content as returned, lightly formatted)

Read-only; no edits. "Everything below is my opinion unless a file is cited."

## 1. Root causes (466, 469, 471, 472, 476)
| Round | Category | Cause and the one rule that would have prevented it |
|---|---|---|
| 466 FAIL | Missing test strength (B spec) | TS8 named a pre-check that no mutant removed (a-round-466.md, c-round-466.json C-R466-01). Rule: a row named after a branch gets a mutant that removes the branch, run on the sketch. Now in lessons.md l.41 (L58). |
| 469 BLOCKED | Environment, plus a missing acceptance row | HEAD control gave 2/1 slow frames against the required 5, three times; the scroll jank does not reproduce on this runner (c-round-469.json blocked[0]). C-R469-01: a mean-only band passed a flatter glow. Rule: a row that depends on a HEAD control is pre-run by B on this runner; if it does not reproduce, the row ships as `record`. Shape-row half now in l.41 (D-29z1654). |
| 471 FAIL | Sketch defect / missing test strength | FN4 scanned the whole of app.css, so the obsidian block alone supplied the font families and the store @theme was unguarded (a-round-471.md). Rule: each guarded token gets its own mutant, red on the sketch (L58). The L58 check was INCOMPLETE for task 471, so the existing rule did not fire. |
| 472 FAIL | Ambiguous task text (grant) | Doc 306 was granted by line numbers only and l.79 stayed false (a-round-472.md). Rule: l.49 (a doc fix-up grant allows A to correct any false line). |
| 476 FAIL | Sketch defect, unruled | Byte-exact sketch kept a duplicate background layer; no B ruling, so rows were not run (a-round-476.md). Rule: l.15 (L10, the tech-lead sketch review covers project-rule compliance). |

Pattern: 466, 471 and 476 were all a reviewer Medium on a byte-pinned sketch. l.41 already calls that a planning FAIL. The real issue is enforcement (l58-check.py was INCOMPLETE), not a missing rule.

## 2. Trimming lessons.md
Tier 1 (pure evidence, each quote occurs once, no id lost): l.16 607 B, l.41 228 B, l.24 588 B, l.58 475 B = 1,898 B (quotes listed in the returned report; applied list in b-round-479/edit-lessons.py).
Tier 2 (B's call; glosses, rationale, provenance): +876 B, total 2,774 B. Caution: keep the operative grep pattern `(counts.get('<X>') ?? 0).toBeGreaterThan(0)` in l.41.
New clauses (401 B together; re-measure after applying):
- (a) merge into l.28 (L47): " **Reload → client nav (RETRO 480):** the task carries a first-Tab row (L47 target) and a route-announcement row (live-region text = new document.title). Evidence: RC-R479-CLIENT-NAV-FOCUS, GATE479-M1-ROUTE-ANNOUNCE (1×)."
- (b) merge into l.15 (L10): " **One STOP threshold (RETRO 480):** a task states its STOP threshold in one clause (Medium+ or outside the grants); others cite it, never restate it. Evidence: C-R475-01 (1×)."
- (c) Saba's colour-sweep rules: no new clause; l.7 ("Colour migration (DPG, Saba 2026-11-12)") already covers them.

## 3. GATE479-M1-ROUTE-ANNOUNCE
Yes, conditionally, in store/app/components/layout/Header.tsx with a new sibling RouteAnnouncer.tsx.
- app/root.tsx:136-143 renders Header only when the path does not start with /studio (covers /studio-lab and /studio/$productId), so Studio is never double-announced.
- Header persists across Store-to-Store navigations and already calls useLocation; not in global_forbidden_files nor the protected manifest.
Risks the task must rule on:
1. Seven Store routes have no meta export and root.tsx has none: cart, search, account, account_.login, account.orders, account.reset, account.downloads. document.title will be empty or stale there; account.downloads.tsx is forbidden. Fallback needed (title, else first `main h1` text, else nothing), proven in a browser.
2. "Skip first render" per mount would silence Studio → Store because Header remounts; use a module-level hydrated flag, with a test reset.
3. Title timing: whether the effect sees the new title is unproven from source; B must run it in a browser on the sketch (L58).
4. Other speakers: LeadMagnet has role="alert" (LeadMagnetPopup.tsx:240) and can fire after navigation (L51).
One-round task only if 1–3 are pre-run on the sketch. Otherwise the root request is "add a RouteAnnouncer in root.tsx after <Outlet/> and add meta to the 7 routes".

## 4. Counters for RETRO 495
1. C FAIL + BLOCKED ≤ 2 of 15.
2. Rounds with a STOP ≤ 2, and 0 STOPs on an unruled sketch Medium.
3. l58-check 15/15 and l57-check ≥ 14/15.
4. lessons.md ≤ 57,500 B, no line over 4,800 B.
5. Fix-up chain length ≤ 1 (471→472→473 was 2).
6. New deferred Lows ≤ 35, and ≥ 10 closed.

## 5. Systemic task
Recommended: CLIENT-NAV-CONTRACT (loop-editable app/lib/link-focus.ts, the layout folder and LeadMagnetPopup). Closes: GATE479-M1-ROUTE-ANNOUNCE, GATE479-L2-TABINDEX-FINALLY, A-R479-L1-TARGET-BLANK, A-R479-L3-DEFAULTPREVENTED-UNTESTED, A-R479-L2-SLOW-LOADER-FOCUS (doc), B-R479-LEADMAGNET-TIMER-CLIENT-NAV, RC-R479-CLIENT-NAV-FOCUS.
The larger class (regex CSS/scanner gaps: TL-R465-L1..L6, A-R466-REVIEW-L1..L4, SR-472-L1/L2, A-R472-REVIEW-L4, A-R473-REVIEW-FN4-SOURCE-NOTES, TL-R464-*, A-R464-REVIEW-L3..L6) would need an AST reader; postcss is only transitive and package.json is forbidden, so the loop cannot close it honestly. C-R474-02 and B-R465-TEST-FIXTURE-CSS-LEAK need root changes.

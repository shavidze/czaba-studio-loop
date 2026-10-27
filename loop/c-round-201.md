# C — Round 201 verification — verdict: **FAIL** ("not implemented (A STOP)")

Role C, 2026-10-27. Task `current-task.md` (D-29z166, SABA-B-4 stage 2 + RT-FIX). Evidence under `c-round-201/`.
A reported **STOP — needs B ruling on R94 × `SfxVideoSync.tsx:34`** and changed no source. Per lesson L22 this is a short round: SOURCE-SCOPE, the auth guard and RT-FIX (independent of A, task §4/§6). No feature row was re-run.

## Summary
| Row | Result |
|---|---|
| SOURCE-SCOPE (start + end) | **PASS**: HEAD `5b1a2bb`, `git status --short --untracked-files=all` empty, frozen list (1001) rc 0, the 31 grant start hashes rc 0, A's `end-sha256.txt` equals the start hashes, neither new file exists, `.claude`/`CLAUDE.md` diff empty (`out/source-scope-end.txt`) |
| G201-3 (browser) | **PASS** at 1440×900 and 1280×720; premium auth not bypassed |
| RT-FIX | **PASS**; closes C-R200-01 and C-R200-02. One Low wording note (C-R201-02). The only bug filed is C-R201-02; the B planning gap is filed as info |
| SCOPE-201 (implementation diff), KEY-RING, RING-VISIBLE, CSS-CONTROLS, CARD-RING, CONTRAST, POINTER, STUDIO-NEIGHBOUR, NO-SHIFT, ERROR-BORDER, KEEP-LIST, T-RUN-201, AN-REVIEW-201 | **FAIL: not implemented (A STOP)**. There is no diff, the new test file and doc 160 do not exist. Not run (L22) |
| BLOCKED-AUTH | **BLOCKED**: backend unavailable in cloud (`/account`, `/account/downloads`, `/studio/:id` components). `/recordings/:id` and `/scenes/:id` were not attempted in the browser (L22). With the mock, curl to `/scenes/pulse-loop-kit` and `/recordings/pulse-loop-kit` returns 200 with an SSR shell ("Scene Builder \| CZABA", "Recordings \| CZABA"). Whether the client renders SfxVideoSync there is unverified, which matters for B's choice among options (a)–(d) |
| Gate rows | `gate`: full vitest, typecheck, build, Biome, `npm run verify`, PROD-MP3-UNVERIFIED. Not run by C |

**browserVerified = realVerified = false.** The round's browser feature rows (KEY-RING … NO-SHIFT) were not run because nothing was implemented. Round 192 was handled the same way. The browser auth guard did run and passed. Ableton: does not apply (store pages); no parity claimed.

## SOURCE-SCOPE — PASS
- Start (02:00Z) and end (02:01:12Z): HEAD `5b1a2bba0c98dcc86564be8441fbdf989cc8f7b8`, 0 status lines, `sha256sum -c --quiet b-round-200-r201-tree-sha256.txt` rc 0, `sha256sum -c --quiet b-round-200-r201-granted-start-sha256.txt` rc 0.
- `a-round-201/end-sha256.txt` sorted is identical to the grant start hashes. `diff-vs-start.patch` is absent, as A says.
- C changed nothing in `store/`.

## G201-3 (browser) — PASS at both viewports
The mock ran on :5199 (PID in `c-round-201/mock.pid`, log `mock.log`) and was stopped at the end (:5199 → 000). Script: `tools/g201-3.cjs`, a copy of `g200-3.cjs` with only the output names changed. Output: `out/g201-3.json`, shots `shots/g201-3-*.png`.
- **Invalid attempt 1:** the 1280 `/studio/middle-east` `waitForFunction` timed out after 60 s on a cold route. A curl afterwards returned 200 in 1.47 s. This was an environment problem, so I replaced it with one more attempt (budget: max 2 extra).
- Attempt 2:
  - `/studio-lab` in fresh contexts at 1440 and 1280: workspace shown, "Demo collection — no sign-in required" shown, `auth_user` null, 0 cookies.
  - `/studio/middle-east` at 1440 and 1280: "Sign in required", no workspace, 0 `audio[src]`.
  - `GET /api/studio-token` with no header → 401 "Please sign in to access Studio."; with a fake Bearer → 403 "Unable to verify ownership". No Set-Cookie, 0 context cookies.
  - 0 forbidden requests, 0 Authorization headers sent by the page, 0 pageerror, 0 hydration messages.

## RT-FIX — PASS (only the changed lines)
Method: I diffed against B's before-copies (`out/retro-diff.txt` = `b-round-200/retro-200-before-r201.md` vs `retros/retro-200.md`; `out/lessons-diff.txt`) and read the cited source lines.
- **§1 partition:** 9 B (127, 142, 143, 145, 151, 178, 192, 193, 194), 2 A (154, 158), 2 unmeasured contrast (149, 196), 1 first-visit (189). The new bullet about 127/178 cites `a-round-127.md` l.3 ("STATUS: STOP — B ruling needed") and `a-round-178.md` DEVIATION 2 / BLOCKER (l.43–49). Both are verbatim at those lines.
- **§3 rows 127 and 178:** the cause is now B's spec or protection conflict. This traces to `a-round-127.md` l.3 and §3 (l.26 "BLOCKER P1"), to `c-round-127.md` l.3 ("A stopped for a B ruling"), and to `a-round-178.md` l.43–49 ("W2 … is mandatory in §1 … Both files are protected").
- **Grouping:** 9 + 2 + 2 + 1 = 14. **Taxonomy:** 5 + 4 + 2 + 1 + 2 + 0 = 14 (127 moved from missing test to ambiguous task text: 3/3 → 4/2).
- **Partition is identical in all three places:** retro §1/§3, `backlog.json` (v186) `retro_runs[0].headline`, and `b-next.json` `reason`.
- **§6 SYS-3:** "სამი ჩაუწერელი საიტი ორ ფაილში" (three unrecorded sites in two files). The listed sites are GroupHeader:246, DetailPanel:371 and :464. `backlog.json` SYS-3 has `also_fixes_unfiled` with the same 3 sites and `also_fixes_unfiled_count` "3 sites in 2 files". C-R200-02 is closed.
- **§7:** `lessons.md` is 32 lines (`wc -l`) with 23 numbered lessons (`grep -cE '^[0-9]+\. \*\*'`): B 11 (L1–L10, L23), A 5, C 7. This matches §7.
- **Numbers RT-NUM passed are unchanged.** The diff touches only l.3 (status), §1 l.26–27, one added §2 note (l.54, OBS-C200-ROUNDING wording), §3 l.62/70/78–79/83/90–92, §6 l.132, §7 l.146 and the new §9. No cost, count or FAIL-list figure changed.
- **Lessons:**
  - **L14** now keeps only the dialog-unique-name rule, scoped to the speed-rule covering tests. It is checkable (`getAllByRole(role,{name})` = 1), and its evidence matches `a-round-127.md`.
  - **L12** now treats a hit in a protected or frozen file as a STOP, not an edit. This is concrete and consistent with 178, where A did not edit the protected files.
  - **L23** (B) is concrete: grep the tokens and labels in tests and frozen components, then use a scratch-copy run. Its evidence is correct.
  - The header note explains why the numbering is not in order.
- **C-R201-02 (Low, wording):** L12's evidence parenthetical says for C-R178-BADGE-SELECTOR "A grepped, the hits were protected, **A stopped correctly**". `a-round-178.md` l.43–45 says the **code-reviewer** found it, A then reproduced it, and A handed over with a "DEVIATION 2 / BLOCKER" note instead of a STOP. Retro §3 row 178 has the same "A-მ hit-ები იპოვა" (A found the hits). The lesson's substance holds; only the attribution is loose. Suggested wording: "the code-reviewer found the hits, which were protected; A reported a BLOCKER and did not edit". This does not fail RT-FIX.

## A's STOP — checked at code level only (for B's ruling)
- `SfxVideoSync.tsx:34–40` at HEAD: the `<label … focus-within:ring-2 focus-within:ring-brand>` wraps `<input type="file" class="absolute inset-0 cursor-pointer opacity-0">`. `opacity: 0` also hides the element's own outline, so after R94 the input has no visible indicator. A's measurement (`a-round-201/brass-count.json`: ref 693 brass px, tree 69 = unfocused control 69) is consistent with this.
- The only consumer is `SfxSceneBuilder.tsx:611` (`/scenes/:id`, BLOCKED-AUTH in the cloud).
- I did not run A's probe again, because it is a synthetic `setContent` reproduction and not the app page. I confirm the STOP is legitimate under the §2 STOP rule.
- **B-R200-HIDDEN-FOCUSABLE-GAP (info, origin B planning, retro_input; same class and severity as B-R192-PLANNING-GAP / B-R194-K0-SCAN-GAP; the fix is a ruling, not code):** B's R94 sweep made the label's `focus-within:ring-*` mandatory to remove without checking for visually hidden focusables (`opacity-0`, `sr-only` inputs). This is the class L1/L23 covers: an inventory gap found by A instead of B. B needs to rule (L10). A's options (a)–(d) are in `a-round-201.md` §5. A's note on `ProductCard.tsx:132` (an `opacity-0 group-hover:opacity-100` overlay around a tabbable `AudioPreviewButton`, already invisible on keyboard focus in ref) is a pre-existing focus-visibility gap. It should be recorded next to C-R196-03 (R96).

## For B (round-202 planning)
1. Rule on the SfxVideoSync collision (L10) before re-dispatching SABA-B-4 stage 2. Whichever option, amend STF2 and the expected after-count, and add a hidden-focusable scan to the inventory (L1).
2. Record the ProductCard hover-only overlay (`ProductCard.tsx:132`) as an input to R96 or as a new Low.
3. Optional: fix the C-R201-02 wording in L12 and retro §3 row 178.
4. RT-FIX passed, so C-R200-01 and C-R200-02 close. Outcome-table row "A STOP": B rules first; C runs the full stage-2 rows in the re-dispatched round.

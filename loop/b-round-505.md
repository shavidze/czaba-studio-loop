# B: planning from round 505 to round 506 (2026-11-14)

**Decision: CONTINUE.** The next task is round 506, DPG-BUTTON-CLEANUP-2 stage 2e (the LeadMagnet popup), in `current-task.md`.
- **Advisor:** available. I consulted it after orientation and at the closing check (D-29z1827): red-history check, AX-tree evidence for the email label, C's own offset data, pre-ruled Lows #8–#11 and `doc-ledger.md`.
- **Archive:** `tasks/round-505.md` is a byte-identical copy of the round-505 task (`cmp` rc 0).
- **Baseline:** gate 505 `published`, commit `d6903a7` on both remotes. `context/head-sha.txt` and the gate's `head` field still say `e3e9e49`, which is stale. The store worktree was clean at planning and is clean at the end.
- **Checkpoint:** `b-round-505/checkpoint.md`. I took snapshots before editing: `b-round-505/*-before-506.*`.

## 1. Round 505 acceptance (C's evidence only)
- **C's result** (`c-round-505.json`): PASS with `browserVerified` and `realVerified` true; C0–C14 passed; L57 OK. The chat rows after "Start Chat" are `-STUBBED`; the real backend half is CHAT-REAL-BACKEND.
- **Gate 505:** published `d6903a7`.
- **Stage 2d (`/support` chat) is verified (D-29z1823).** C7 closes B-R505-CHAT-SEND-FOCUS-LOST and B-R505-GUESTFORM-START-FOCUS-LOST.

## 2. A's STOP CR-1 and the follow-ups (L7, L10)
**CR-1 (code-reviewer Medium):** B2D-7 never focuses "Start Chat" before the guest form unmounts.
- I settled it by experiment instead of by opinion (`b-round-505/cr1/`): I added the `.focus()` line on a scratch copy and re-ran all 15 mutants. B2D-7 passes 10/10, and every mutant outcome equals round 505.
- **Ruled Low, deferred** as A-R505-CR-1-B2D7-NO-FOCUSED-BUTTON. Reason: jsdom moves focus to `body` when the focused button is removed, and C measured the browser path.

**Process misses (RETRO 510 input):**
- INFO-C505-UNRULED-STOP-PASS: C wrote PASS where L22 asks for a short FAIL.
- INFO-B505-SKETCH-REVIEWER-MEDIUM: my own sketch review missed a reviewer-class Medium (L58).

| Source | Item | Ruling |
|---|---|---|
| A CR-2 | session ends → guest form again keeps `focusOnMount` false | `confirmedBy` TL-R505-FOCUS-FLAG-AUTH-CHANGE (same captured-once flag) |
| A CR-3 | duplicated send logic | new deferred Low A-R505-CR-3-SEND-LOGIC-DUP |
| A CR-4 | null `activeElement` skips the mount focus | new info A-R505-CR-4-NULL-ACTIVE |
| A Architecture note | one chat focus point in ChatWindow | signal SIG-R505-CHAT-FOCUS-POINT (not scheduled) |
| A note | `DESIGN_TOKENS.md` still teal | `confirmedBy` ROOT-REQ-DPG-PRIMITIVES-PATCH |
| C limits | offset not re-measured; doc 326 not traced; 4 L57 nulls without a reason | INFO-C505-C3-OFFSET-UNMEASURED closed on C's own `c-round-505/after/after.json` (offset 2px ×6; round 506 C3 views two crops), INFO-C505-DOC326-LEDGER-PARTIAL, INFO-C505-L57-NULL-REASONS (round 506 C14 asks for reasons) |

## 3. Why stage 2e next
- **No open Critical/High/Medium on loop-owned Store code.** The open Mediums are root-only, Saba-only, device-only or `awaiting_user`. B-R492-PASSWORD-CHANGE-NOT-IMPLEMENTED (High) needs the backend and the protected `auth.ts`, so it stays with root.
- **REGRESSION** is due on or after 2026-11-16; today is 2026-11-14. **RETRO** is at round 510.
- **The DPG-FIX P1 order:** 2e → NONBRAND → stage-2 close-out → CSS-DEDUP / COLOR-CONSOLIDATE / FONT-RESOLVE → DP gate → P2.

## 4. Stage 2e planning summary
**Product-designer** (`b-round-505/consult-product-designer.md`):
- FREE DOWNLOAD and BACK TO SITE → `Button` `lg` `fullWidth` with `max-w-[320px] uppercase tracking-wide`.
- CONTINUE → `Button` primary, **brass instead of red**. Destructive is the error token, and the alert above the button is red too. This reverses the round-497 inventory line, which was B's own ruling: the December 2025 original painted all three actions red, and no Saba or spec decision exists. Saba is asked once (SABA-Q-506-LM-CONTINUE-COLOUR, `user-review/questions-round-506.md`, default brass).
- No `isLoading`, so SENDING... stays.
- The Close X goes to NONBRAND.

**Gate-bait findings, recorded but not fixed** (keep-list restyle only):
- B-R506-LM-EMAIL-NO-LABEL: product-designer said Medium. I rule it Low, consistent with B-R505-CHAT-TEXTAREA-NO-LABEL, because Chromium names the field from its placeholder (CDP AX tree, `b-round-505/probe/ax-email-head.out`).
- B-R506-LM-NATIVE-VALIDATION.
- B-R506-LM-WHITE-FIELD, -WORDMARK, -EMOJI-ICON, -SPLIT-HEADINGS (info), -ARBITRARY-VALUES (info).
- The two a11y classes (placeholder-only names; a native bubble before the styled message) now have two sites each. They are a RETRO 510 systemic-task candidate.

**HEAD vs sketch probes** (Chromium, 1440/1280/375, opened by exit intent; `b-round-505/probe/`):
- all three actions go 320×57.6 → 320×48;
- CONTINUE goes `rgb(210,119,106)` → brass, contrast 6.09 → 8.32;
- SENDING... `pointer-events` goes `auto` → `none`;
- equal on both trees: the focus targets (Close; the email field; the field after a failed unstubbed submit; BACK TO SITE), Esc, and the POST counts.

**Sketch v2 `b52088bd`:**
- tech-lead v1 `e859573c` was APPROVE WITH CONDITIONS. Its Medium was the doc artifacts plus the L28 line (resolved); its two doc Lows are fixed in v2; its two test Lows are pre-ruled.
- v2 is APPROVE WITH CONDITIONS. Its condition was M4's expectation, now corrected: ST5 also turns red, by design. Run 1 is kept.

**Pre-check on v2:**
- tsc rc 0, lint 179, Biome clean;
- covering 5/108 (max 214 ms);
- full suite 303/4,379 rc 0, build rc 0;
- mutants 14/14;
- scanner 94/33 → 92/31;
- fresh-archive apply passes checks 4 and 1;
- claims K1–K33 with no MISSING; L58 OK.

**Architecture:** no checkpoint. This is one owner and a component swap.

## 5. Files written by B
- `current-task.md` (round 506), `tasks/round-505.md` (archive).
- `backlog.json` v506 → v508 (`b-round-505/update-backlog-506.py`, D-29z1823…D-29z1826; `update-backlog-506b.py`, D-29z1827).
- `feature-status.md`: the header, the round 505/506 lines and the DPG-FIX row.
- `b-next.json`, `user-review/questions-round-506.md`.
- `b-round-505/`: the sketch (v1, v2), the review, the consult, the probe, mutants, claims, pre-check logs, the frozen lists `r506-*.txt`, `covering-files.txt` and `cr1/`.
- **Scratch trees outside `store/`:** `/home/runner/b505-scratch`, `/home/runner/b505-pg`, `/home/runner/b505-fresh` and `/home/runner/b505-mut`. The sketch dev server on :5174 is stopped.

## 6. Ready for commit
Root has nothing new to commit from B. Round 505 is already published at `d6903a7`.

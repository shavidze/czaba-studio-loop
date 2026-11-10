# tech-lead review v4.1 — condensed by B from the agent reply (the full reply was returned inline to B; key lines kept word for word: VERDICT, REVIEWED, L-new-1)
VERDICT: approve-with-lows
REVIEWED: delta 4596eec7f9ea8c88aa466b88cfa800231fe5431c4a298a2bb37fa7d4d8a4a7cb full adef90283d28d7224f80a5f7c66d7be1685a9fcf327b24dc65bfe3ce5d489ad4

- Both hashes checked with sha256sum; the delta applies cleanly to the working tree (it holds v3). No tests run by the reviewer; logs show tsc rc 0, covering 24/24, full 4029/4029, lint 205 = HEAD.
- v4 asks done: NF2 raw guard (M22, M23 red); jsxOpeningTags filters allJsxOpeningTags; SS9 pins name and type; H10 shows the helper is tested.
- M1 stays green: lookbehind skips data-input-type=, AST sets no type, both counts 0.
- False-red risk vs HEAD: Low, fails safe with a clear message. Guards now read .ts and subfolders; a JSDoc/comment mentioning <input or type="number" fails. No arrangement .ts contains <input today. HEAD's INPUT_TAG already counted comment/string <input text in top-level .tsx. `type: 'number'` and `?type=number` not counted.
- L-new-1 (Low): NF2 compares text against AST; `type={ "number" }` or `type = "number"` counts in AST but not regex (alone: false red). With a string '<input type="number">' in the same file the two cancel and the string passes. Needs two deliberate changes; no fix needed; a test comment would explain it.
- Remaining HEAD-red / v4.1-green: only M1, M2, M4, M5, M12 (accepted in v3). M10 green at both. M21 green on SF2 but red IN1 (M21b), so the full suite catches it. M20 moved from RD2 to IN1.
- Lowercase only, as at HEAD: <INPUT and <Progress markup in strings still pass.
- No new Medium. v3 N1/N2 still open, outside this delta.

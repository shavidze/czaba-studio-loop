# C round 471: STORE-2c-1 font family tokens — FAIL (short route, STOPPED — routed to B)

**Route (L22):** A stopped on an unruled Medium (A-R471-REVIEW-M1) with a diff. Per L22 "A STOP naming an unruled Medium+" this is a short FAIL even if rows pass; the gate must not publish before B rules. C ran SOURCE-SCOPE, CLAIMS, auth guard and the STOP's named check (mutants). C1–C9 feature rows were NOT run (browserVerified=false for those; not claimed).

| Row | Result | Evidence |
|---|---|---|
| C11 SOURCE-SCOPE | PASS | `c-round-471/scope.txt`: 3 paths (2 M, doc untracked); app.css hunks only l.122–124 and body line; `+` lines equal sketch |
| C14 CLAIMS | PASS with expected diffs | `c-round-471/claims.out`: only K1, K3, K4 and K10 (obsidian block shifted +1 line by the new `--font-mono`; content identical) differ; no MISSING |
| C13 AUTH | PASS | Real Chromium 1280/1440: `/studio-lab` anonymous opens, title "CZABA Studio — Demo collection", font Instrument Sans (shots `studio-lab-*.png`); `/studio/middle-east` "Sign in required", 0 audio src, Instrument Sans (`legacy-1280.png`); `GET /api/studio-token?product=middle-east&file=stem.mp3` → 401. Fake-bearer path BLOCKED (backend unavailable in cloud) |
| C10 MUTANT (STOP check) | CONFIRMS A's finding | Scratch copy of TREE (`git ls-files` + node_modules symlink, deleted afterwards): control 6 passed; `--font-serif: Georgia, serif` → 6 passed (should be red); deleting only app.css l.124 `--font-mono` → 6 passed (should be red). A also showed HEAD's FN4 goes red on the Georgia mutant. So the store `@theme` tokens are unguarded on TREE: regression in test strength vs HEAD for `--font-serif`, none for mono (new token) |
| C1–C9, C12 | NOT RUN | Short route; unverified, not passed |

## Bug
- **C-R471-01 / A-R471-REVIEW-M1** (medium, origin: B spec — sketch's FN4 scans the whole app.css and the obsidian block already supplies all three families). Fix options for B: make FN4 scan only the store `@theme` block, or pin in `store-theme-tokens.test.ts` (theme `--font-sans` == obsidian, `--font-mono` == obsidian, `--font-serif` == `--font-sans`), with grants and a sketch mutant run (L58). Doc 306 must be rewritten after B's ruling. Reviewer Lows (`.artist-title` serif rule at app.css:746, CommandPalette `<kbd>` mono/↵ fallback, FN6 brittleness) are for B's 2c-2 sweep, not verified by C.

Gate rows (typecheck/lint/full verify) are `gate`, not claimed. Nothing in source was edited by C.

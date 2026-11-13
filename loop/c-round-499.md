# C round 499 — DPG-BUTTON-CLEANUP-2 stage 2b-1: FAIL (A STOPPED, routed to B)

Short route (lessons L22, RETRO 450): A STOPped on an unruled Medium with a diff, so C ran C0, C12, C14 and the auth guard only.

## 1. Rows run
| Row | Result | Evidence |
|---|---|---|
| C0 | PASS: 5 modified + 2 new paths exactly as A listed; frozen checks 1, 2, 4 rc 0 | `c-round-499/frozen{1,2,4}.log` |
| C12 | PASS: no MISSING. Diff vs sketch output: only location moves (account.downloads.tsx:281 order; GATE498-L1 backlog → archive) | `c-round-499/claims.out` |
| C13 (browser, fresh no-credential contexts, 1440×900 and 1280×720) | PASS: `/studio/1` and `/account/downloads` show "Sign in required", no product download link (the 2 matched anchors are nav links, `dl.mjs`); `/studio-lab` opens the demo ("no sign-in required"). Premium not bypassed | `c-round-499/auth-guard.json`, `auth-*.png` |
| C14 | PASS: tree unchanged since C0; L57 check below | `c-round-499/l57-check.txt` |

## 2. Finding confirmed: A-R499-CR-STORE-TRY-UNPINNED (Medium, origin B spec)
I read the test myself. B2B-5 checks the `routes/store.tsx` block only for the substring `buildButtonClassName(` and absence of four literal tokens. No DOM row renders the `/store` error branch, and mutants N7/N8 do not change the builder args or `to`. A change such as `variant: 'ghost'`, `size: 'md'` or `to="/"` would pass every row. Per L22/RETRO 450 an unruled Medium is a FAIL.

## 3. Not run (not claimed)
C1–C11 (browser rest/hover/focus/stack/contrast/nav/journey, scanner, covering tests, mutants, docs) were not run; `browserVerified` and `realVerified` are false. Gate rows (full vitest, build, Biome, verify) belong to the gate.

## 4. For B
Rule the Medium: (a) add a `/store` DOM row plus a mutant and re-pin check 4, or (b) rule it Low with reasoning. Then re-dispatch; A's listed Lows and doc 321 wording fixes are still open.

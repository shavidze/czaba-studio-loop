# A round 481: B-R478-DEAD-MUSIC-LINK (account.orders half)

**Scope completed:** the task's A steps 1–6 only. The finding stays **open** because the protected `account.downloads.tsx` half is still pending (ROOT-REQ-DOWNLOADS-MUSIC-LINK).

## Step 1: STOP check
- `claims-481.sh` before the first edit → `a-round-481/claims-pre.txt`. `diff` against `b-round-480/claims-481-planning-output.txt`: identical, with empty stderr.
- No root commit was applied: HEAD is `bbb3193` and `cloud/root-commits/` is absent or empty. No STOP.

## Changed files (exactly the 3 grants)
| Path | Change |
|---|---|
| `app/routes/account.orders.tsx` | l.230 `href="/music"` → `href="/store"`. `git diff --stat`: 1 insertion, 1 deletion. Still an `<a>`; label, classes, imports and the l.59/l.188 warnings are untouched |
| `app/lib/__tests__/account-orders-empty-state.test.tsx` (new) | AO1 and AO2, applied byte-exactly from `sketch-481.patch.txt` (sha256 `8e1b7b6d…1362`, checked) |
| `docs/implementation/2026/quarter-IV/312-dead-music-link-orders.md` (new) | Uses the TEMPLATE headings in order. Line 4 is exact. It names D-29z1709, D-29z1710, D-29z1711 and ROOT-REQ-DOWNLOADS-MUSIC-LINK, cites only AO1 and AO2, and says the finding stays open |

## Checks (actually run)
| Check | Result |
|---|---|
| `npm run typecheck` | rc 0 (`a-round-481/typecheck.log`) |
| `npm run lint` | rc 0: 191 warnings and 1 info, repo-wide and pre-existing (`a-round-481/lint.log`) |
| Biome scoped to the 2 code paths | rc 0. 2 warnings, the pre-existing l.59/l.188 (K11), which belong to round 484 (`a-round-481/biome-scoped.log`) |
| `npx vitest run app/lib/__tests__/account-orders-empty-state.test.tsx` | 1 file, 2 tests, all passed (`a-round-481/vitest.log`) |
| Claims after the change | `a-round-481/claims.txt`, stderr empty. Lines: K1 `bbb3193`; K2 `href-music 0 href-store 1 browse-music-label 1 router-Link 0`; K5 `exists AO1 AO2`; K7 exactly the 3 granted paths; K8 rc 0 (1390); K9 rc 0; K10 `0`; K11 2 warnings |

- I did not re-run the mutants myself. B's M1 and M2 logs stand, and C3 re-runs M1.
- I did not run the full suite, verify or build: they belong to the gate.
- No browser run: the C4–C7 rows are C's.

## Code review (code-reviewer subagent, actually invoked)
- **Result:** 0 Critical, High or Medium. Score 9/10.
- **Lows:**
  1. A route test sits in `app/lib/__tests__/`. Not addressed: the grant fixes this path.
  2. The Mermaid labels used `/…/` parallelogram syntax. **Fixed:** the labels are now quoted in doc 312.
  3. Doc 312 cites external loop artifacts. Accepted as intended.
- **Confirmed by the reviewer:**
  - the asserts fail on a revert to `/music`;
  - the mocks do not leak (`clearAllMocks` and `cleanup` run per test);
  - the fetch and auth code is unchanged.

  The reviewer had no shell, so I confirmed the 1-line diff myself with `git diff`.
- **Architecture note:** none.

## Process notes (truthful)
- **Pre-flight** (`.claude/skills/pre-flight`) was not written out in chat before the patch was applied. I checked it after the fact:
  - **Assumptions:** only the href changes, and the link stays an `<a>`.
  - **Smallest version:** 1 line plus B's test.
  - **No-abstraction check:** nothing new is abstracted.
  - **Scope:** exactly the 3 grants.
  - **Success criteria:** K2/K5/K7–K10 and AO 2/2.

  All held.
- **`/check`** (`.claude/commands/check.md`) asks for `npm run verify` and the e2e smoke run. Under the speed rules those belong to the root gate and were not run. I ran Biome scoped to my 2 code paths, `npm run lint` and `npm run typecheck`.
- **`lessons.md`:** I read the A self-check section and L10/L11/L12/L26/L28/L29/L52/L58.
  - L11: the AO test file took 192 ms, far below the default timeout, so it is not a slow test and not a STOP.
  - L12: no class selectors in the tests.
  - L26/L28: the doc headings are an in-order match of TEMPLATE (`diff` empty), and l.4 is exact.
- **Doc 312 edits after the review:**
  - the Mermaid labels are now quoted;
  - an unsourced alternative URL sentence was replaced with B's wording ("no category filter is invented").

  `claims.txt` was re-run after both edits: identical values, empty stderr.

## Known gaps
- B-R478-DEAD-MUSIC-LINK stays open until root applies ROOT-REQ-DOWNLOADS-MUSIC-LINK (protected file).
- Ownership of real orders is backend-only and BLOCKED (backend unavailable in cloud).

## Next C checks
C1–C8 exactly as in `current-task.md` §2:
- the frozen and protected sha256 checks;
- `claims-481.sh`;
- AO on the tree, plus M1 on a scratch copy;
- the C4 stubbed browser row at 1440×900 and 1280×720 (CTA lands on `/store`, full load, first Tab on the logo, button box and ring equal `ring-probe-head.json`);
- the C5 guard;
- the C6 auth and `/studio-lab`;
- C7 records the protected `/account/downloads` target;
- C8 doc 312.

## B acceptance I can mark
- A steps 1–6 are done.
- The A-side expectations in step 4 match.
- No C row is claimed.

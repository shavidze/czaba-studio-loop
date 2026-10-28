# CURRENT TASK — Round 42: BLOCKED — waiting for Saba's decisions (no implementation this round)

Planner: B · Implementer: A · Verifier: C · Date: 2026-10-28

## Why this round
- **Round 41: C PASS** (R41-1…R41-5, realVerified=true, bugs `[]`). Root published `a5c6a6b`, and the review returned COMMIT OK with 0 critical/high/medium findings. TM-B43 is **done**.
- No C bug is open. No critical or high finding is open.
- The open medium findings (RR-R3-01, RR-R19-01) both wait on Saba. B-R26-01 is a root process item.
- **Every remaining scoped item waits on Saba**, either for a decision or for data:
  - requirements.md T-1 is open on D-07, TM-T1-DUP, D-12 and D-10;
  - T-2 is open on the UCS list and its licence;
  - the bug items TM-B05 and TM-B06 are open on a scope decision.
- The T-0 items (TM-T0, TM-T0-CI, TM-T0-CI-FU, TM-B14) also wait, but on **root**, not on Saba. They need a green Actions `Check` run on `7879ee0` or later; `a5c6a6b` qualifies. They are listed here as a root request, not as a cause of the block.
- One candidate round needs no Saba input: the cursor on fieldset-disabled buttons (B-R39-02 / A-R40-04(b)). B does not take it.
  - It is an info/low record, not a scoped item. It would not move any requirement (T-0/T-1/T-2) forward.
  - It is not dropped. It stays open in the backlog and is listed as Q15 below.

## Baseline
- HEAD `a5c6a6bd74488a99675d251275e850a684d55ce0`. The working tree is clean.
  - Exception (project release-commit rule): a root `chore(release): vX.Y.Z` commit directly on `a5c6a6b` that changes only the two `version` fields counts as the baseline.
- **Frozen:** the whole repository. Nothing may change this round.
- **Protected (never touch):**
  - `src/preload/index.ts`, `src/preload/index.d.ts`, `src/renderer/src/styles/app.css`;
  - `package.json`, `package-lock.json`, `.github/workflows/release.yml`;
  - `.claude/settings*`, `.claude/hooks/**`.

## Scope
**None for A.** If the loop starts A or C anyway, follow these steps:
- **A:** changes nothing in the repository. A writes `a-round-42.md` stating "BLOCKED: waiting for Saba (see current-task.md §Questions)". It also records `git rev-parse HEAD` and an empty `git status --porcelain --untracked-files=all`.
- **C:** confirms that HEAD is unchanged and the tree is clean. C writes `c-round-42.json` as `{"taskStatus":"BLOCKED","bugs":[],"passed":[],"blocked":["waiting for Saba decisions (current-task.md §Questions)"],"realVerified":false}`.
- **Root:** has nothing to publish.

## Questions for Saba (each has a proposed default; answering "yes" accepts it)

### 1. Decisions that unblock scoped items
| # | Item | Question | B's proposed default |
|---|---|---|---|
| Q1 | TM-T1-MIG / D-07 | An existing `schema.json` does not gain `category` automatically. It appears under Hidden Standard Fields, and C R3-7 confirmed it can be enabled there. Do you accept this behaviour? | Yes: no auto-migration, plus a docs note |
| Q2 | TM-T1-DUP / RR-R3-01 (medium) | An old custom field with key `category` (auto ID `CATE`), or one using RIFF ID `ICAT`, collides with the standard Category toggle. One value is then written to both `CATE` and `ICAT`, and React gets duplicate keys. What should happen? | Hide or reject the standard toggle while its key or RIFF ID is already used, and show a warning. A renderer test pins the behaviour. |
| Q3 | TM-B08 / D-12 (+ B-R6-01) | Are `artists` part of the K-4 import contract? Today they are written as one `ISTR` per value, and ffprobe `artist` shows only the first one. | No: K-4 = `ICAT`/`IKEY`/`ICMT` only, and artists stay as written today |
| Q4 | TM-B11 / D-10 (+ C-R27-02, RR-R3-03) | An empty text field is written as a size-0 INFO chunk (`IKEY=""`, `ICAT=""`, `RNOT=""`). An unset custom Number field is written as `'0'`. Should empty values be skipped? | Skip empty text and unset numbers (absent = empty for the importer). A meaningful `0` must stay expressible (RR-R5-03). |
| Q5 | TM-B05 | A WAV whose `data` chunk is empty cannot be tagged (node-taglib-sharp 6.0.1), and a read returns empty metadata silently. Which fix do you want? | Show a clear per-file error ("audio data is empty, cannot tag") and pin it with a test. No upstream patch. |
| Q6 | TM-B06 | Should Biome lint `tests/` too? It would be a one-time cleanup of quotes, empty catches and import order. | Yes: add `tests/**` with a relaxed override, as its own round |
| Q7 | TM-T2-DATA → TM-T2 | Please provide the UCS category list file (~750 CatIDs) with licence confirmation. Its sha256 must equal the czaba-api `tools/recording-import/ucs-categories.json` copy. | — (only you can provide this) |

### 2. Permission (one medium finding depends on it)
| # | Item | Question | B's proposed default |
|---|---|---|---|
| Q8 | RR-R19-01 (medium) / B-R18-01 | Every save waits for a full recursive folder rescan just to refresh Size/Date. That is slow on 1000+ files or a network drive. Fixing it needs a narrow `fs:stat-files` IPC, which means changing the **protected** `src/preload/index.ts` and `index.d.ts`. May the loop change them for this one channel? | Yes, for this channel only |

### 3. UX choices (reference-first study before any change; none blocks the scoped items)
- **Q9, B-R19-01 / RR-R20-01:** switching selection while a save is pending shows "Unsaved changes were discarded", although the edits are being written. Options: skip that toast, or lock the list during the save.
- **Q10, B-R21-02 / RR-R23-03:** the Shift-click anchor deviates from Explorer in 3 ways (D-31). Options: keep, or match Explorer.
- **Q11, RR-R35-02:** if the scan never settles, `Applying...`/`Saving...` stays forever. Option: add a timeout plus a toast.
- **Q12, B-R36-01 / B-R27-02:** the old list stays clickable while a scan is pending, and Rescan/Open stay enabled during a save. Option: lock them.
- **Q13, B-R7-02 / RR-R8-04:** validate `schema.json` at load time. Should a bad `riffChunkId` be rejected or flagged?
- **Q14, RR-R12-02:** retrying a partly failed batch rewrites the files that already saved. Option: retry the failed files only.
- **Q15, B-R39-02 / A-R40-04(b) / RR-R41-03:** fieldset-disabled icon buttons keep the default cursor. Option: `cursor-not-allowed` through a shared helper or `IconButton`.
- **Q16, RR-R1-07:** make `check.yml` a required status check, and add `needs: check` to `release.yml`.
- **Q17, RR-R41-01:** should `docs/design/*` stay in English, or move to Georgian?

### 4. Confirmations only (already implemented and verified; reversible)
D-15 (Tagged badge counts every field), D-16, D-18 (a bad RIFF ID fails the save), D-45 (busy buttons keep focus), D-46 (hover only on buttons that can act).

## Request for root (not a Saba question)
- Link a green Actions `Check` run on `7879ee0` or later (for example `a5c6a6b`).
- This closes the real acceptance line of TM-T0-CI, TM-T0-CI-FU and TM-B14. TM-T0 then closes with TM-T0-CI.

## File ownership (nothing else may change)
| May modify or create | Why |
|---|---|
| (none in the repository) | BLOCKED round |

A and C may write only their own loop-folder reports (`a-round-42.md`, `c-round-42.md`/`.json`).

## Acceptance (C)
| ID | Check | Evidence that means PASS |
|---|---|---|
| R42-0 unchanged | `git rev-parse HEAD`; `git status --porcelain --untracked-files=all` | HEAD is `a5c6a6b` (or the allowed release commit), and the status is empty. This round is not PASS. It is BLOCKED by design. |

## What could break (C re-checks)
Nothing changes. C only confirms that the tree is unchanged.

## Next (orientation only)
Each answer turns into a round, in this order:
1. Q2 (medium);
2. Q8 (medium);
3. Q4 / Q1;
4. Q5;
5. Q3;
6. Q6;
7. Q7 → T-2.

UX answers (Q9–Q17) each get a reference-first round.

# A round 368: PERF-9b-ii re-dispatch (join), C-R367-DEDUP-CANCELLED-WRITE

## NEEDS B RULING: severity of A-R368-REVIEW-L1 (possible L11 STOP if B rates it Medium)

The reviewer rated it Low. A measured a regression against HEAD of the same class as C-R367-DEDUP-CANCELLED-WRITE (Medium in round 367): HEAD stores the key and v3 does not.

The probe is a scratch copy of the final test file with one appended block, using SC32's helpers:
1. A hit 200 starts write W, with its body held.
2. A hit 404 arrives.
3. A storable hit 200 arrives.
4. The body is released, then `idle()`.

| Client | Result | Log |
|---|---|---|
| v3 (this tree) | `storedA=false putA=1`; log `…sweep,list,put:/a.mp3,delete:/a.mp3` | `a-round-368/l1-probe-v3.log` |
| HEAD `d53d113` (client swapped in temporarily) | `storedA=true putA=1`; log `…get,get,delete:/a.mp3,get,sweep,list,put:/a.mp3` | `a-round-368/l1-probe-head.log` |

- **Restore:** the scratch files were deleted. The client was restored, and `cmp` shows it equal; `git diff -- app` is still cmp-equal to `sketch.patch.txt` (`a-round-368/l1-restore-cmp.txt`).
- **What it contradicts:** the `sketch-review.md` claim "v3 stores in every ordering where HEAD stored". The ordering table has no row for 200 → 404 → joining 200.
- **Realism, for B:** it needs the server to answer 200 → 404 → 200 for one static preview path within a single body-read and commit window. That is a deploy race, unlike the StrictMode re-run behind (a).
- **Impact:** only a lost cache entry; the next load re-stores it.
- **Not fixed by A.** Both code options change the ruled "no replacement write" contract (L11), which is outside A's grants. The options are a per-key delete promise plus a chained fresh write with an identity check, or accepting it as ordering (f).
- **The tree stays consistent:** every §2.1 row is green.
- **RETRO-369 input:** the ordering table missed an interaction, the same family as B-R367-MUTANTS-MISSED-INTERACTION.

Apart from this, there is no STOP. The sketch was applied verbatim, and no code changed beyond B's v3 delta.

## Changed files (exactly the 3 in §1.1)
- `app/lib/arrangement/stem-cache.client.ts`: `b-round-367/sketch-delta.patch.txt`, verbatim.
- `app/lib/arrangement/__tests__/stem-cache.test.ts`: same delta, verbatim (SC22 title narrowed; SC30–SC33 appended).
- `docs/implementation/2026/quarter-IV/236-perf-stem-cache-v2.md`: §1.3, plus review fixes (below). Diff: `a-round-368/doc236-final.diff`.

**How the delta was applied.**
- The delta sha256 is `1838d603…` and the full sketch sha256 is `41a608ab…`, both equal to `sketch-dispatched.sha256`.
- `git apply` ran with no reset.
- `git diff -- app | cmp - b-round-367/sketch.patch.txt`: equal. That is still true after the mutant runs (`a-round-368/mutants/restore-cmp.txt`).

## §2.1 rows
| Row | Result | Evidence |
|---|---|---|
| A-CLAIMS pre | PASS: equal to `claims-368-planning-output.txt` | `a-round-368/claims-pre.txt` |
| A-CLAIMS final | PASS (detail below) | `a-round-368/claims-final.txt` (re-run after the doc review fixes) |
| A-TESTS | PASS: 2 files, 41/41 (stem-cache 35/35, source-fetch 6/6), 1.40 s; slowest row 484 ms against the 5 s default timeout (<10 %) | `a-round-368/tests.log`, `a-round-368/stem-cache-verbose.log` |
| A-TYPE | PASS: `npm run typecheck` rc 0 | `a-round-368/typecheck.log` |
| A-LINT | PASS: `npm run lint` rc 0, 205 warnings (≤ 205), 1 info | `a-round-368/lint.log` |
| /check (Biome, scoped) | PASS: `npx biome check` on the 2 code files, rc 0, no fixes | `a-round-368/biome-scoped.log` |
| A-MUTANTS | PASS: all 19 red on exactly their rows in `mutant-summary.txt`. Each was applied with `patch <client> < diff` from a copy at `a-round-368/stem-cache.client.ts.orig`. The client was restored afterwards, and `cmp` shows it equal. | `a-round-368/mutants/summary-rows.txt`, `mutant-<id>.log`, `restore-cmp.txt` |
| A-REVIEW | PASS: code-reviewer reported no Medium+ (4 Lows, below). The doc was edited after the review and re-sent (see "Re-review") | this file |
| A-DOC | PASS (detail below) | `a-round-368/claims-final.txt` K13 |

**A-CLAIMS final, by K row.**
- K2 = `d53d113 3`.
- K7: all 0.
- K18: `app-diff-vs-full-sketch equal`.
- K3, K5, K10 and K17 are equal to `claims-368-sketch-output.txt`. K5: `writes-has 0 join-push 1 abandoned-fn 2 every 1 pending-done-wait 1 signal-param 0`. K10: `sc-rows 35 new-rows 4 describes 3 sc22-title-narrowed 1`.
- K1, K11, K12, K14 and K19 are equal to the planning output.
- K13: l.4 = `**სტატუსი:** Completed (C round 368 PASS)`, `pending 0`, stage-hits = `232-perf-drag-preview.md` only, headings 7, `sc22-credit 0`, `sc30-33-named SC30 SC31 SC32 SC33`.
- K16: empty.

**A-DOC detail.**
- The 7 TEMPLATE headings are in order.
- Every SC id the doc names exists as `it('SCn ` in the test file.
- `grep -rl 'C round [0-9]* pending' docs/implementation` returns 0.
- Doc 232 is untouched.
- The quota retry is credited to SC33.
- The stage-1 limitation is marked as superseded by SC28.
- The stage-1 mermaid node now reads "network response first, then the delete on the chain (stage 3)".
- The import list names `type CompletableTransaction`.
- The `nosize` line says the delete-file redness is carry-over from truncate.
- The ordering table (a), (b), (b'), (b''), (c) is in მიდგომა.
- The Problem → Solution entry compares HEAD, v2 and v3, and does not call the join airtight (TL3-1).
- The 19 mutants are listed with their exact rows.
- "SC30 and SC31 are red on the v2 client" is stated.
- The TODO lists the 5 deferred Lows.

## code-reviewer findings (all Low) and handling
1. **A-R368-REVIEW-L1 (Low, not ruled by `sketch-review.md`, needs a B ruling).**
   - **Sequence:** a hit 200 starts write W. A hit 404 then queues a delete after `W.done`. A third storable 200 joins W. W lands, then the delete lands, so the key ends absent.
   - **HEAD:** the key stayed stored, because HEAD deleted inline and skipped load 3.
   - **Impact:** only a lost cache entry; the next load re-stores it.
   - **Code fix options:** per-key delete promise plus a fresh write with an identity check, or accept it as ordering (f). Either changes the ruled "no replacement write" contract, so I did not edit the code (L11). It is Low, not Medium+, so it is not a STOP.
   - **Doc:** I softened the over-claim in contract item 3: the delete "cannot beat a write that was already pending when it was queued". The case is listed in the TODO.
2. **A-R368-REVIEW-L2 (Low, doc).** The "a load without a signal keeps the write alive" claim had no row; `requestInit()` always passes a signal.
   - **Fixed in the doc:** the SC credit was removed and the claim is stated as the `every` contract, unreachable in production. `fetchAndDecodeSource` requires `signal: AbortSignal` (`source-fetch.ts:10`), and the only cache caller is `studio-lab-demo.ts:115`.
   - **Proposal for B:** a row with `{ credentials: 'omit' }`.
3. **A-R368-REVIEW-L3 (Low, coverage).** The chain-start `cancelled()` check has no mutant and is near-equivalent: a cancelled queued write still returns before `put`, after running sweep and list. Proposal for B: assert that `list` is not called for a write cancelled while queued, or record it as an accepted equivalent mutant. No code change.
4. **A-R368-REVIEW-L4 (Low, doc).** "putCalls=2" read like A being put twice. Fixed: "(A ერთხელ, B ერთხელ)".

**Architecture note (for B/root; no refactor in this round).**
- **Signal:** `createCachedSourceFetch` now holds several pieces of session state: disabled, sweep, commitChain, writes and their join signals, and deletes, plus the join, cancel and delete-after-write rules.
- **Reviewer's advice:** keep it this round. The public surface `{ fetchSource, idle }` is unchanged and all 35 rows target it.
- **Candidate for ARCH-CHECKPOINT-PERF9-STEM-CACHE:** a pure write coordinator (join, abandoned check, delete-after-write, idle) with its own rows.

## Re-review
The doc was edited after the review (L2, L4 and L1's softening). It was sent back to code-reviewer.

**Result: "No findings".**
- All four edits were checked against the client, `source-fetch.ts`, the tests and `dedup-probe-v3.log`.
- SC1–SC33 all exist.
- The reviewer could not check one point: that HEAD keeps the key in the L1 sequence. A verified it: `git show d53d113:…stem-cache.client.ts` l.394 awaits `store.delete` inline on 404/410, and l.351 skips load 3 through `writes.has(key)`.

No code changed after the first review.

**One wording-only doc change after the re-review:** the TODO label went from "Low, B-ის ruling-ს ელოდება" to "ღია", so l.4/L28 text stays valid after B's ruling. claims-final was re-run afterwards: K13 and K16 are unchanged, and K3/K5/K10/K17 still equal the sketch output.

**Lint:** 205 warnings, exactly the ≤ 205 limit. A did not separately confirm the gate-366 baseline count (no verify log found under `gates/round-366/`). The only lint-relevant changes are B's verbatim delta, which B's Biome run passed, and the scoped Biome run is rc 0.

## Not run by A (per task)
The full suite, `npm run verify`, `npm run build`, perf specs and browser probes were not run; they belong to the gate and C.

## Exact next C checks
These follow §2.2 in order:
1. CLAIMS (must equal `a-round-368/claims-final.txt`) and SOURCE-SCOPE (3 files; app diff cmp-equal to `b-round-367/sketch.patch.txt`; A made no code deltas).
2. UNIT 35/35.
3. DEDUP probe on a scratch copy: P1 and P2 `storedA=true storedB=true putCalls=2`, one `put:/a.mp3`.
4. MUTANT-OWN.
5. Production build on port 5189, then INTEGRITY and VALIDATOR at 1440×900 and 1280×720, PLAYBACK-EXPORT (record) and G368-AUTH.
6. DOCS row.
7. A-R368-REVIEW-L1: re-run the probe block (described at the top) for B's severity ruling, if B asks for it.

## Scope completed
Every §2.1 row PASSed. The C rows have not run, and PERF-9b-ii is not self-marked done.

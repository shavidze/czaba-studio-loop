# A round 419 — SYS-R369-STEM-CACHE-WRITE-COORDINATOR

**Scope completed (A's part):** sketch applied unchanged, doc 270 written, A1–A6 run. Not self-marked done; C verifies.

## Changed files (status: 2 ` M`, 1 `??` — exactly the 3 grants)
- `app/lib/arrangement/stem-cache.client.ts` — sketch only (`git apply --reverse --check` of `b-round-418/sketch-419.patch.txt`, sha256 fb665319…a1d02f5, OK → applied byte-exact; not edited afterwards).
- `app/lib/arrangement/__tests__/stem-cache.test.ts` — sketch only (same check).
- `docs/implementation/2026/quarter-IV/270-sys-stem-cache-write-coordinator.md` — new, Georgian.

## Checks (logs in `a-round-419/`)
| # | Result |
|---|---|
| A1 | `claims-start.txt` == `b-round-418/claims-419-planning-output.txt`, stderr 0 B (attempt 1) |
| A2 | `npx vitest run stem-cache.test.ts source-fetch.test.ts` rc 0, 2 files, 49/49 (`a2-vitest.log`) |
| A3 | `npm run typecheck` rc 0 (`a3-typecheck.log`); `npm run lint` rc 0, 205 warnings / 1 info = HEAD (`a3-lint.log`) |
| A4 | `npx biome check` on the 2 code files rc 0, no fixes (`a4-biome.log`) |
| A5 | `claims-end.txt`, stderr 0 B. Differs from the planning output only in K2 (`1 ?? 2 M total 3`), K5 `no`, K6 (doc 270, l.4 exact), K9, K10; K9/K10 equal `claims-419-sketch-output.txt` (vs sketch output only K1 scratch sha, K2, K6 differ). K3/K4 lines unchanged (rc 0). Note: doc 270 was edited after A5 (wording fixes below); K6 reads only l.4, unchanged |
| A6 | `code-reviewer` (real subagent) on 3 files: **no Critical/High/Medium**, score 9/10 |
| Doc self-check | l.4 byte-exact; 7 TEMPLATE headings in order; mutant block `cmp` == `b-round-418/mutants/summary.txt` (rerun after edits: equal) |

Full suite / build / verify not run by A (gate).

## Reviewer findings
- **R419-CR-1 (Low, code, not fixed — files frozen):** `stem-cache.client.ts:353-363` — after the chain-start `cancelled()` check, `await sweepPromise`, `list()` and `estimateQuota()` run without a new check; a load aborted during the sweep pays one list + quota estimate. Nothing stored, no record lost; same as HEAD. → B: `deferred_low_polish`.
- **R419-CR-2..5 (Low, doc) — fixed in doc 270:** diagram edge "all signals aborted" contradicted SC30 (now: `abandoned()` check closes); disabled-store `cancelled()` returns without closing + early exits now drawn; "per-session counter" → per-instance; `TL-R419-L2-L3` → full id `TL-R419-L2-L3-TWO-HOLDING-POINTS`.
- Reviewer verified: ordering/settle identity guard, no deadlock/leak, idle() terminates, removeIfCurrent single readwrite tx, name guard before any file op, each SC34–SC40 red under its mutant, SC26 strictly stronger, no any/ts-ignore/`as`, no security surface.

## For B
- **Architecture note (signal, not scheduled):** store (IndexedDB+OPFS, `:107-278`) and write coordinator (`:321-547`) share one module; rounds 366/367/368/419 all changed it and grew the fake harness (`stem-cache.test.ts:770-965`). Reviewer: keep now; re-evaluate ARCH-CHECKPOINT-PERF9-STEM-CACHE at STEM-LANES planning together with GATE368-L3.
- Reviewer considered a strict per-key queue (no join) and recommends keeping the join model (one buffer per key; queue worsens GATE368-L3 for stem sets).
- Known gaps (doc TODO): GATE368-L3 (both holding points), TL-R419-L4 (a)(b)(c).

## Exact next C checks
Rows 1–8 of `current-task.md` §6 in L59 order: row 3 mutants on a clean HEAD scratch (expect `summary.txt` equal) + loaded replicate 43/43; row 4 production-build probe both viewports `ALL EQUAL` with `time-counter-random` names; row 5 play/stop on :5173 both viewports; row 6 auth (fake-bearer BLOCKED, backend unavailable); row 7 doc 270 (l.4, headings, mutant block cmp, cited ids — note the diagram labels were reworded after review); rows 1/8 claims + L57. No browser check was run by A.

## Known gaps
- No browser verification by A (C's rows 4–6).
- Attempts 1–2 stopped on API rate limits; attempt 3 re-ran A2–A4 and recorded rc.

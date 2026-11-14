# A round 506: DPG-BUTTON-CLEANUP-2 stage 2e (LeadMagnet actions onto `Button`)

No STOP. B's sketch `b-round-505/sketch-506.patch.txt` (sha256 `b52088bd…073e0d`, verified) was applied unchanged. A wrote no other bytes.

## Changed files (exactly the 5 grants)
- M `app/components/marketing/LeadMagnetPopup.tsx`
- M `app/lib/__tests__/store-theme-tokens.test.ts`
- M `docs/design/DESIGN_SYSTEM.md`
- ?? `app/lib/__tests__/store-button-cleanup-2e.test.tsx`
- ?? `docs/implementation/2026/quarter-IV/327-dpg-button-cleanup-stage-2e.md`

`git status --short --untracked-files=all` shows these 5 paths and nothing else. Full diff: `a-round-506/diff-vs-d6903a7.patch.txt`.

## Checks run (logs in `a-round-506/`)
| Check | Result | B expected | Log |
|---|---|---|---|
| Frozen 1 / 2 / 3 before apply | rc 0 / 0 / 0 | rc 0 | `pre-checks.log` |
| `git apply --check`, then `git apply` | rc 0, rc 0 | clean | `pre-checks.log`, `apply.log` |
| Frozen 4 / 1 after apply | rc 0 / 0 | rc 0 | `apply.log` |
| `npm run typecheck` | rc 0 | rc 0 | `typecheck.log` |
| `npm run lint` | rc 0, "Found 179 warnings." | 179 | `lint.log` |
| Scoped Biome (3 files) | rc 0, "Checked 3 files … No fixes applied." | same | `biome-scoped.log` |
| Covering vitest (`b-round-505/covering-files.txt`) | 5 files, 108/108; B2E-1…B2E-6 present; slowest 211 ms | 108/108, < 2,500 ms | `covering.log` |
| Frozen 1 / 2 / 4 + status at end (after all checks) | rc 0 / 0 / 0; 3 M + 2 ?? | rc 0 | `final-checks.log` |
| code-reviewer (subagent, diff vs `d6903a7` + 2 untracked) | 9/10; 0 Critical/High/Medium; 4 Lows | — | `code-review.md` |

A did not run the full suite, the build, `npm run verify` or the browser. B pre-ran the first two on the sketch tree; the gate runs them, and C owns the browser rows.

## Contrast (L15), not measured by A
These values come from B's sketch probe, `b-round-505/probe/sketch/sketch.jsonl`. All three actions read `restContrast` 8.32 (9 entries) and `hoverContrast` 10.28 (9 entries). At HEAD, `probe/head/head.jsonl` reads 6.09 for CONTINUE (3 entries) and 8.32 for the other two (6 entries). A ran no browser; C4 measures them.

## Code-reviewer findings (all Low; none needs a code change this round)
- **For B, new Low A-R506-CR-1-HOOKS-MOCK-BARREL:** through the `~/components/ui` barrel, the popup now loads `Toast.tsx` (`useToast` from `~/hooks`). `store-button-cleanup-2e` and `store-lead-magnet-dialog` mock `~/hooks` with only `useScrollLock`/`useLeadMagnet`. Both pass today, but a barrel module that reads another `~/hooks` export at load time would break them. Suggested fix: `...await vi.importActual('~/hooks')` inside the mock. This is tied to pre-ruled Low #5 (GATE498-L2-BARREL-IMPORT).
- CR-2: confirms that ST5 still covers dark text on brand through `primaryTokens`.
- CR-3 is pre-ruled Low #1. CR-4 (doc 327 l.4 is a mixed status) is pre-ruled Low #3, in the L28 multi-stage form B pinned.

## Architecture note (for B)
code-reviewer: "None. No new state/effects/ownership; moving to the shared `Button` lowers coupling. Keep as is." A has no extraction proposal.

## Acceptance (A part of §3 only)
- [x] Step 1: frozen checks and patch apply, all rc 0
- [x] Step 2: only the 5 granted files changed, byte-equal to the sketch (check 4 rc 0)
- [x] Step 3: typecheck, lint (179), scoped Biome and covering tests (108/108) all match B; code-reviewer run
- [x] Step 4: this report
- C rows C0–C14 are not claimed by A.

## Known gaps
- The browser was not run by A. All visual, contrast and focus claims (C1–C7) wait for C.
- The real Brevo subscription is BLOCKED (backend unavailable in cloud), as the task already records.
- Saba question SABA-Q-506-LM-CONTINUE-COLOUR is open. The default is brass.

## Next C checks
Run the task's §4 as written, heaviest first:
1. The warm-up, then `lm-506.cjs` at 3 viewports (C1–C7, with C6 stubbed plus one unstubbed submit per viewport).
2. C10 mutants on a copy, then C8 scanner 92/31, C9 covering, C11 docs, C12 protection and `/studio-lab`, C13 claims, C0/C14 scope and L57.
3. Optionally, confirm A-R506-CR-1 by reading `app/components/ui/index.ts`. It is not a FAIL row.

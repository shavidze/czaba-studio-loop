# A round 415: SYS-R388-FAKE-WEB-AUDIO-HELPER (test-only)

No STOP. The sketch was applied byte for byte. The four code files were not edited afterwards. Doc 267 was written and then fixed once after the reviewer's Low.

## Changed files (`git status --short --untracked-files=all`: 3 M + 2 ??)
- `app/lib/arrangement/__tests__/helpers/fake-web-audio.ts`: new, from the sketch.
- `app/lib/arrangement/__tests__/schedule-failure-ui.test.tsx`: from the sketch.
- `app/lib/arrangement/__tests__/master-hold-tick.test.tsx`: from the sketch.
- `app/lib/arrangement/__tests__/decoded-buffer-eviction-ui.test.tsx`: from the sketch.
- `docs/implementation/2026/quarter-IV/267-sys-fake-web-audio-helper.md`: new.

No runtime, protected, auth, route, config or package file was touched.

## Checks (logs in `a-round-415/`)
| # | Check | Result |
|---|---|---|
| A1 | claims at start | rc 0, stderr empty. `claims-start.txt` equals `b-round-414/claims-415-planning-output.txt` (diff rc 0). K1 = `5be9294`. |
| sketch | sha256 and apply | sha256 `2d04d6eb…7e006b32` matches K12. `git apply --check` and `git apply` both rc 0. |
| A2 | vitest SF + HT + EV + AR | rc 0. 4 files, **54/54** (`vitest.log` verbose, `vitest-default.log`). File times: SF 1081 ms, HT 978 ms, EV 1453 ms, AR 7 ms. Slowest rows: HT1 657 ms, SF11 642 ms (verbose run: 640 ms), SF6 311 ms. All are well under the 5 s default; the highest is about 13 %. |
| A3 | `npm run typecheck`; `npm run lint` | typecheck rc 0 (`typecheck.log`). lint rc 0 with 205 warnings and 1 info, as expected (`lint.log`). |
| A4 | `npx biome check` on the 4 code paths | rc 0. 4 files checked, no fixes (`biome.log`). |
| A5 | claims at end | rc 0, stderr empty (`claims-end.txt`, `claims-start-vs-end.diff`). Compared with the start output, only these change: K2 `2 ?? 3 M total 5`, K5 `no`, K6 doc 267 l.4, K7 `yes`, K10 `fake-copies 0 helper-users 3 workspace-env-users 25`. K1 stays `5be9294`. K3 (1,311) and K4 lines are unchanged from the start. |
| Doc | doc 267 | l.4 is byte-exact `**სტატუსი:** Completed (C round 415 PASS)`. The 7 TEMPLATE headings are in order. The 14-line mutant block equals `b-round-414/mutants/summary.txt` (diff rc 0, 11 `MU-415-` lines). All cited row ids exist. Sweeps: `C round N pending` returns 0; `In Progress (stage` returns 7. |
| A6 | `code-reviewer` (real subagent) | 0 Critical, High or Medium; score 9/10. See below. |

I did not run the full suite, build or verify; those belong to the gate. I did not run the mutants either, because they are C's row 4.

## Reviewer findings
- **Low (doc and ruling 5 accuracy):** The `Object.is` guard only proves that the helper's stub replaced `window.setInterval`. If someone deletes `stubSetInterval: true` from SF11's `install({...})`, the guard never runs and SF11 stays green, which is the same situation as MU-415-GUARD-AND-STUB-REMOVED.
  - **What I changed:** doc 267 now states this limitation under "პრობლემები და გადაწყვეტები".
  - **What I left alone:** the code and the wording of ruling 5. I only added a pointer at the end of ruling 5 that refers to the limitation.
  - **Re-checked after the doc edits:** l.4 is byte-exact, there are 7 headings, the mutant block diff is rc 0, and the end claims are unchanged.
  - **For B:** decide whether A-R388-REVIEW-L3 really closes, or only partly closes (the helper is guarded, but the call site's flag is not asserted).
- **Info, fixed in the doc:** the mutant summary says `tests 49` while the checks say 54. The doc now explains that 49 is the three migrated suites and 54 adds AR1–AR5.
- **Info:** the guard checks `window.setInterval`. This is correct because `ArrangementContext.tsx:1871` calls `window.setInterval`, and it relies on jsdom's `window === globalThis`.
- **Confirmed by the reviewer:** each suite behaves as at HEAD (defaults, metering detection, `install()` reset, inert superset). It also found no `any`, ts-ignore or type assertions.

## For B
- **Architecture note (signal, keep):** three suites now depend on `fake-web-audio.ts:12`, and it returns members no suite uses yet; they are there for a later delegation from `createWorkspaceTestEnvironment` (SIG-R415-WORKSPACE-ENV-CONVERGENCE). The reviewer's verdict was to keep it: it is test-only and each call has its own state. Any merge stays a separate planner task.
- The L3 closure question above.

## Known gaps
- A-R388-REVIEW-L1, L2 and L4 are deferred as ruled.
- The real-browser checks (C rows 5 and 6) and the mutants (row 4) were not run by A.

## Next checks for C
Rows 1–8 of the task, in the L59 order: row 4 mutants (`OUT=<loop>/c-round-415/mutants`), then rows 5 and 6 in the browser, then the rest. The expected start claims are A's `a-round-415/claims-end.txt`.

## Scope completed
All task steps §2.1–§2.4 are done. A1–A6 passed as listed. C acceptance is not claimed.

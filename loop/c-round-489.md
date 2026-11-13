# C round 489: SABA-B-17-ENTRANCE-3-4S — verdict FAIL (one unruled Medium test-gap; product behaviour verified)

**Why FAIL:** A stopped on A-R489-REVIEW-NONZOOM-CLASSIFY (Medium). C reproduced it (MA and MB survive on a scratch clone, 61/61 green). The task's STOP rule says an unruled Medium+ blocks, so the round is not PASS. The product itself behaved correctly in every real-browser row.

## Source and claims
- HEAD `73f994d`; `git status`: 3 ` M` + 1 `??` (the 4 granted paths); `root.tsx` has no diff; sketch sha `4a15bff396cb6fb0`.
- Claims at start and end are identical; only K17 differs from the sketch output (B's two `.webm` are gitignored, absent on the fresh machine). Environment, not an app defect.

## Real browser (Chromium, production builds, tree :5191 vs HEAD :5190; `tree-table.txt`, `head-table.txt`)
| Row | Result |
|---|---|
| C5 fresh 1×, 1440/1280 | remDs 3525/3495, remFc 3518/3482, logo 1700/1717, tag 1022/1051, gaps 0. HEAD remFc 1596, tag 466 |
| C5b clientnav | 3492 / 3477; after Back no cover (covAfterMark 0) |
| C6 4× | remDs 3805/3932; logo 1531/1482; tag 828/850 |
| C7 slow first visit | net4g cpu1 live 1518/857, cpu4 live 1462/885, delay800 live 1501/840 (all ≤ 5000). HEAD: delayjs expired logo 0; net4g cpu4 tag 0 |
| C7b delay3000 | expired, logo/tag 0, remFc 2287/2285; HEAD 1294/1299 |
| C8 wheel | `wheel` 1440/1280 scrollY 0, removed ~950/890 ms, state live; `wheel50` scrollY 0, skipped. HEAD `wheel` scrollY 600 |
| C9/C10 | reload, rm: no cover; blockjs remFc 2303, logo 0 |
| C11 / C11b | esc/tab/click 50 ms: skipped, remFc ≤ 291, tab focus A; at 1.5 s: live, overlay gone ≤ 71 ms, tab focus A, URL `/` |
| C12 arrive | logo 1967, remFc 3478 |
| C14 | hydErr 0 in every row |
| C13 | before/after `.webm` + 3 stills each in `rec/`, webm copied to `user-review/img/`; after-2.0 s shows wordmark, before shows the page |
| Extra: real touch swipe (CDP, `touch-under-cover.txt`) | tree: 0 of 24 scroll events while covered, at 100 ms and 1200 ms; HEAD 23 and 7 scroll under the cover. Real phone remains TLM-R489-TOUCH-SWIPE |

## Other rows
- C4: covering 4 files / 92 tests green; the 22-line mutant summary equals B's (no NONE/BAD-ANCHOR).
- C15 (`auth.json`, both viewports): `/account` "Sign in required", no "Full Name"; `/studio/middle-east` gated, 0 `audio[src]`; `/studio-lab` opens anonymously (`auth_user` null). Demo playback was not exercised this round.
- C16: doc 316 l.4 exact, 7 headings in order, no "pending", all 10 cited row ids exist, measurement numbers appear in B's tables. C17: lessons.md 60 lines, "example number" present. C18: L57 OK.
- Gate rows (full suite, build, verify) belong to the root gate.

## For B
1. **C-R489-A-STOP-NONZOOM-TEST-GAP (Medium, B pre-check):** rule it. Proposal: `dispatchScrollGesture` sends a real `WheelEvent` (deltaY 100) and a `TouchEvent` with one touch, and MA–MD join `mutants-489.py`. Browser rows C8 and the touch probe already cover MA/MD for real input; MB/MC (one-finger) are covered only by my CDP touch probe, which is not an automated test.
2. A's Lows (L3 class selector, E8d literal, doc wording) and the zoom-rule duplication note (boot string vs `isZoomGesture`) are for B.
3. Ctrl+wheel zoom was not measurable headless (record only).

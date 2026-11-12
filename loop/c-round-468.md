# C round 468 — SABA-B-15 stage 1 (diagnosis). Verdict: PASS

Everything below was run by C in a real Chromium (Playwright). I did not reuse A's numbers.
HEAD `9ba13ac`. Scratch copies: `c-round-468/{head,fix,mut}`, each a `git archive` plus `node_modules` symlink. The probes ran one at a time (L38).

| Row | Result | Evidence |
|---|---|---|
| C1 REPRO-HEAD | PASS. Median slow frames on `/`: 1440 = **6** (6,8,6), 1280 = **4** (6,4,3). The row needs ≥ 5 at either viewport, and 1440 meets it. `/free-downloads` is 0 / 0, finalY 575 / 755 | `scroll-head.json`, `summ-head-fix.txt` |
| C2 CAUSE-CONFIRMED | PASS. `patch -p1 --dry-run` rc 0, then applied. The grep finds `scale-220` ×2 and `scale-175` ×1 landed, and no `blur-[120px]` or `blur-[100px]` is left on those 3 lines. Build rc 0. Probe: `/` 1440 = **0** (0,1,0), 1280 = **0** (0,0,0). Moving frames 167–179, finalY 2400. `/free-downloads` is 0 with finalY 575 / 755 | `build-fix.log`, `scroll-fix.json`, `summ-head-fix.txt` |
| C3 GUARD-MUTANT | PASS. With `lenis-off.diff.txt` on top of the proposal, `/` 1440 and 1280 have **20** moving frames (< 100), so the eased-scroll guard can fail | `scroll-mut.json`, `summ-mut.txt` |
| C4 VISUAL (record) | Before/after element screenshots at 1440 and 1280, from my own run. Pixel diff: mean \|Δ\| 0.90 / 0.90 (product section) and 1.17 / 1.29 (showcase). Max Δ 6–8 of 255. 0 % of pixels > 10. Mean luminance +0.9 to +1.3 (of 255). Page scrollWidth equals clientWidth and scrollHeight is unchanged. A's sentence matches what I saw: the same shape and position, a touch broader and brighter, with a more even falloff | `shots/`, `pixdiff.txt`, `visual.log` |
| C5 RULINGS | PASS. The diff touches only `ProductSection.tsx` and `StudioShowcase.tsx`. `useSmoothScroll.ts` is byte-identical to HEAD, so Lenis is untouched. `root.tsx` and `app/styles/**` are untouched. No keep-list component is touched | diff headers; `cmp` |
| C6 SOURCE-SCOPE | PASS. `git status --short --untracked-files=all` shows 0 lines at HEAD `9ba13ac`. Protected manifest rc 0 | — |
| C7 AUTH + STUDIO SMOKE | PASS at both viewports (dev server, fresh anonymous context, untimed warm-up). `Demo collection ready` was seen. `auth_user` is null. Clip testids rose 6 → 8 after adding a "Full mix" item with Enter. `/studio/middle-east` shows "Sign in required" with 0 `audio[src]`. `GET /api/studio-token` returns 401. The fake-bearer path is BLOCKED (backend unavailable in cloud) | `data/auth.json`, `auth.mjs`, `lab-added-*.png`, `premium-*.png` |
| C8 LESSON | PASS. `grep -c 'Scroll frames (D-29z1648)' lessons.md` = 1, and `wc -l` = 60 | — |
| C9 CLAIMS | PASS. `claims-468.sh` output is identical to the planning output (`diff` empty), with 0 `MISSING` | `claims-run.txt` |
| gate | Not claimed. No source change, so nothing is published | — |

## Caveats (not bugs)
- **The environment is software raster.** The measured cost is raster. A glow with `filter: blur()` costs far more here than on a GPU. The cause is confirmed here only. Saba's own device stays TLM-R468-SABA-SCROLL-DEVICE.
- **The ProductSection-only build is marginal.** A's 2-line variant sits at the ≤ 2 bound and leaves band 2 behind. I did not re-run that variant, so I make no claim about it. The 3-line proposal I did re-run, and it is clean.
- **One pass at 1440 had 1 slow frame** (0,1,0). The median is 0, within the ≤ 2 bound.
- **Look change for stage 2.** The 3-glow gradient swap changes how three brass glows look, slightly. B and product-designer rule on it in round 469. A also listed the same blur pattern in the Newsletter section, in SpecialOffers (keep-list) and on the gift-cards route. I did not measure those, because the frozen probe stops at scrollY 2400.
- **Scratch trees.** The loop folder holds `c-round-468/{head,fix,mut}`, about 325 MB each. Root can clear them. They rebuild from a `9ba13ac` archive plus the diffs.

## Bugs: none

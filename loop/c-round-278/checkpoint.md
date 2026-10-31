# C r278 checkpoint
- SOURCE-SCOPE: PASS (sha rc0, 17M+3?? all granted)

- HUNK-SCOPE: source + 5 sketch tests + perf cmp-same vs sketch-on-HEAD; 3 test files only additions (+import merge); held-enter +1 line; doc206 3 lines; doc207 7 headings, ids exist
- CLAIMS: claims.sh on HEAD archive == B output
- SWEEP: SW-A 47 files, consumer 9 all granted/ruled; SW-B 3 hits all ruled exclusions
- TESTS-TARGETED 14 files 195/195; mutant G red SD2,SD2b,SDU2,SDU4,LPA1,LPA4; UI12 mutant red UI12-14
- NEXT: browser rows
- ENV NOTE: a HEAD dev server on :5174 (symlinked node_modules) re-optimized the shared node_modules/.vite cache -> 504 Outdated Optimize Dep on :5173 for /studio/middle-east. HEAD server stopped. Do NOT start a 2nd server again; use B's probe/*.json for HEAD values.
- smoke both vp PASS (sha 1fea093b match, 16 s, nan 0, rms>0.001); auth@1280 pass in run1
- dev 5173 restarted (--force) at 23:00 to repair the cache; guarded route recovers
- variantx+cursor+titles+enable PASS both vp (c278-new-variantx_cursor.json)
- tab/ax/noop/deletename/handoff/keep PASS both vp; perf predicate ok (my auto-criterion too strict: neu false while add aria-disabled, true once available+wave; video neu false old true; audio true)
- look: V-LOOK-2 dE metro 1.57/1.76/1.57, add 2.83/2.31/1.88, boxes 77x16,128x34 equal; V-HOVER-2 rest=hover; V-PRESS-2 none; hover-enabled = HEAD (isolated head server :5174 cacheDir /tmp); budget equal; metro ring inset -2px, ring px 167,137,90 (outer-scan invalid, inner column ringpx-metro.json)
- REPORT WRITTEN c-round-278.md/json PASS

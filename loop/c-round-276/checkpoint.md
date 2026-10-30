# C round 276 checkpoint
- started; reading task, diff. Next: scope, browser rows.
- claims at a4c0e24 identical to B; manifest rc0; smoke+auth PASS both vp (c276-smoke.json). Running c276.cjs new/head (run-*.log).
- targeted 20 files 379 pass (scratch); M1 red SD2/SD2b; M3 red FL3-6,FL10,SD5. test diffs: no assertion lost.
- head server restarted on 5174 with own cacheDir (head-vite-cache). DOC-206 pass; RT-FIX lines verified true.
- NEW build rows done (c276-new.json): B-TAB/AX/NOOP/MOUSE/TITLES/HANDOFF*/EWF/SPACE/SHEET pass both vp; shortcuts statuses recorded; V-RING pass 5.43:1 (c276-ring-new.json); cursor pointer on 7 (V-HOVER-SOFT cursor half fails; HEAD native control also pointer). Pending: HEAD compare (run-head.log), 375 tab, write report.
- REPORT WRITTEN: c-round-276.md/.json (PASS; V-HOVER-SOFT cursor half FAIL Low C-R276-01; C-R276-02 Low). temp dirs removed, manifest rc0.
- DONE. gate reads taskStatus only; HEAD 375 tab = 7 stops.

# A round 251 — checkpoint (in progress)
- Step 1 start state: HEAD dcb7eb1, 13 M, frozen/root/grant-start hashes rc 0.
- Step 2: precheck-251.diff applied (rc 0); expected-final-sha256 rc 0. Grant 8 (doc 191) pending.
- Step 2b: doc 191 grant 8 written (l.4 = C round 251 PASS; round-251 parts in all 7 sections). Step 3: typecheck rc0, biome 7 files clean, lint rc0. Next: covering run.
- Step 4 covering: 123 files 1843/1843 rc0. Step 5 mutants: matches §0.2 (a-round-251/mutants/summary.txt), repo status identical. Next: Playwright.
- Step 7 Playwright: attempt1 cold-load timeout (kept: a-round-251/caption-a-attempt1-timeout.log); attempt2 rc0 matches Fix column both viewports (caption-a.json). Next: code-reviewer.

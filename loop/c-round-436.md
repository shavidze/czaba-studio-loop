# C round 436 — COPY-PD-VIS stage 1: PASS

Real Chromium (Playwright), fresh contexts, http://127.0.0.1:5173, 1440x900 and 1280x720. Evidence under `c-round-436/`.

| Row | Result | Evidence |
|---|---|---|
| C1/C14 scope | PASS: 11 paths (10 M + doc 283), frozen and protected manifests rc 0 | shell |
| C2 identity | PASS: 10 files cmp-identical to sketch applied to a HEAD archive | shell |
| C3 clip origin | PASS: probe JSON deep-equals B's sketch output (only base URL differs). Detail "Clip origin 00:00.000"; footer text/title "...clip origin..."; move and trim statuses say "clip origin" | `c-round-436/probe/copy-probe.json`, screenshots |
| C4 From/To | PASS: labels `From`/`To`; aria-labels unchanged | same |
| C5 old word | PASS: 0 hits in text/attributes in all 4 states | same |
| C6 boxes | PASS: same as sketch, overflow 0 | same |
| C7 screen budget | PASS: 138/168/118/144 records, JSON equal to B's sketch capture | `c-round-436/screens/screen435.json` |
| C8 mutants | PASS: M1–M5 red, sketch green | `c-round-436/mut/mutants/` |
| C9 unit | PASS: 8 files 208/208, typecheck rc 0, lint rc 0 | `c-round-436/unit.log`, `typecheck.log`, `lint.log` |
| C10 claims | PASS: only expected diffs | `c-round-436/claims.txt` |
| C11 doc | PASS: headings match TEMPLATE, l.4 exact, 14 cited ids exist | shell |
| C12 auth | PASS both viewports: auth_user null; Sign in required, 0 audio[src]; token API 401. Fake bearer BLOCKED (no backend) | `c-round-436/auth-smoke.json` |
| C13 smoke | PASS: play ~1.57 s then holds after Stop; Export opens and Esc closes | same |

Bugs: none. Gate rows (full vitest, build, Biome, verify) are not claimed.
Notes: "Clip origin" and bare From/To are deviations from Live (Saba-approved; Q4 still awaiting_user). The vitest run was not concurrent with browser rows (L38).

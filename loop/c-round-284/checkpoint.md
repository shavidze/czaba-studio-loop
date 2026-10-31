# C round 284 checkpoint
- step 1: orientation done; SOURCE-SCOPE start: git status 6M+1??, sha256 6/6 OK.
- TYPECHECK rc0; UNIT 9/171 pass; CLAIMS match (K1 archive); builds head+a done
- UNIT-MUTANTS: HEADCODE,Z1-Z5 all red at rows (mutants-c.txt)
- HEAD controls done (probe/head-*.json): in 60, out 300, env 180/90 both vp
- ZOOM-PATH in 0x3, out [0,0,30,0,0,0,0,30,0,0]x3 both vp; ENV 0/0 delta0 undo0 both vp; imgdiff within (max 5.001/6.057)
- G284-AUTH pass on 5302 prod (attempt 1 invalid: C probe sent no params -> 400) and 5173 see probe/auth-*.json
- auth dev attempt1 env-invalid (vite firebase optimize 07:51:01), attempt2 PASS; starting PERF-RUN
- DOC-212 checked PASS; perf running
e736808e4390296acc59e85182668d9e1b8ec9262a40ea51f5c3a6960f1281f1  docs/implementation/2026/quarter-IV/212-perf-zoom-waveform-columns.md
- PERF-RUN rc0 3/3, 0 problems, asserts 17+15+93 all within; ZOOM-ONE-COMMIT 1/1; end scope OK; NEG-LOOP repro rc124
- FINAL written: c-round-284.md/.json PASS
- lessons read, 1a pageErrors 0; DONE

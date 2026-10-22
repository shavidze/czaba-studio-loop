# C r84 checkpoint
- start: HEAD a68c81d, 6M+4??, frozen 478 OK, A end hashes OK, store 200 (13:xx UTC)
- tools copied from c-round-83 into c-round-84/tools
- r1 1440 done: all PASS except VF-PREVIEW-play = C oracle error (pre-clip expected 1); re-analysed ana.cjs -> PASS (maxErr 0, 90 ramp samples). r1 patched; running 1280
- r1 1280 done: all PASS except VF-AUDIO (1 LSB diff). r2 determinism (1280 a,b): unchanged-state exports differ by ±1 LSB only in 2-8 s (video own-sound span); hash set shared by faded/unfaded exports (3b30.. appears as faded and as unfaded) -> pre-existing export jitter, not fade. File Low C-R84-L1 (export not bit-reproducible over video sound). 
- next: r3 X1-ALIGN + EN re-run + P-M1; g84; vitest targeted; source end check; report
- r3 1440: X1-ALIGN 40 & 32 px/s PASS (0 px), EN short PASS; P-M1 REPRO: video (and audio) fade handle z-40/z-30 above sticky header; real drag at header spot edits hidden video fade 1->2 (pm1b). next: r3/pm1b 1280, g84, vitest
- r3 1280 PASS (rerun after vite reload), g84 both vp OK, fakeBearer 500/400 BLOCKED, vitest targeted 51/980 PASS, coverage 0 missing, end source = start
- DONE: c-round-84.md/.json written (PASS, M1+L1 bugs), advisor edits applied

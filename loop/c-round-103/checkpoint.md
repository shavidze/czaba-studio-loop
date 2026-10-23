# C round 103 checkpoint
- source baseline OK (HEAD b6c9716, 5M+1??, frozen 532 OK, A end hashes 6/6 OK, protected OK).
- DONE browser: stall1280 PASS (30008.7ms), stall1440 PASS (30009.4), err1280 PASS, mp3stall1280 PASS (30009.9, no unpkg). out/run103-*.json
- next: cancel1280, slow1280, wav1280, wav1440, mp31280, cancelreg1280, G103-3, offline rows
- DONE browser (all PASS): cancel1280, slow1280 (maxGap 145ms, CPU6 main-thread; worker throttle unconfirmed), wav1280, wav1440, mp31280, cancelreg1280, G103-3 both vps. errors 0, forbidden 0, auth 0 in all sessions.
- next: offline (scratch c-round-103/mut): fail-before, m1 m3 m5 m6, CU10 3x, PU-ALONE, body diff, targeted; then report
- DONE: all rows; c-round-103.md + c-round-103.json written (PASS). Final source recheck OK.

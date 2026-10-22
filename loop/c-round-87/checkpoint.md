# C round 87 checkpoint
- Start: HEAD 971141d, 7M+10??, frozen 490/490 OK, A end-hashes match (start-hashes.txt), ffmpeg.ts 0995ae78.
- Tools: tools/lib87.cjs (rAF+MO+worker), m5.cjs (5M), std.cjs (101.702), fail87.cjs (cdn/timeout-retry/x3).
- m5 attempt 1 (both vps): WAV5/PHASES-wav/WORKER/REUSE PASS; PX-MP35 oracle crashed page (in-page decode of 304 s MP3 + 87 MB WAV = harness OOM). Export itself succeeded. Logs: tools/m5-*.attempt1.log. Switched to oracleWin (WAV windows cut in Node).
- Next: rerun m5 both, std both, fail87 cdn,x3 1280 / cdn 1440 / timeout 1440, g87, then write report.
- DONE: all rows run; report written (FAIL, 1 medium bug R87-PROGRESS-BELOW-FOLD-1280). End source check OK.
- DONE: all rows run; c-round-87.md/json final (FAIL, 1 medium bug R87-PROGRESS-BELOW-FOLD-1280). End source check OK.

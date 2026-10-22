# C r86 checkpoint
- start 15:47 UTC: HEAD 51e024a, 6M+4??, frozen 487/487, A end hashes OK, ffmpeg 0995ae78, store 200; tools copied from c-round-85
- attempt2 16:5x UTC resumed: source OK; 1440 mp.cjs PASS 16 rows (log mp-1440.log); starting 1280 mp.cjs
- 1280 mp.cjs: 16/16 PASS (mp-1280.log). running fail.cjs 1440 cdn,x3
- fail 1440 cdn,x3: CDNFAIL PASS, X3 PASS; REG-HYD-CDN shows 2 induced ffmpeg.ts console.error (expected). next: timeout 1440, cdn,x3 1280, G86-3
- 16:57 timeout1440/cdn1280 run invalid: vite 'optimized dependencies changed. reloading' at 16:56:25/33 (env). G86-3 done (g86-*.json, tok 401, fakeBearer 500 => BLOCKED). rerunning
- 1280 cdn,x3 rerun valid: CDNFAIL PASS, X3 PASS, same 2 induced errors
- 17:01 final report + c-round-86.json written (PASS, browserVerified true)

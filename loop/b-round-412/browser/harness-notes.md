# B round 412 -> 413: browser harness experiments for the streamed-bytes cap (TL-R411-L4)

Probe: `probe/peaks-before-ready-413.mjs` (copy of `b-round-410/probe/peaks-before-ready-411.mjs` + experimental modes).

| Mode | Server | Result | Valid? |
|---|---|---|---|
| real | :5174 sketch, :5173 HEAD | held 96 rects, ready 96, middleEastBegins 0, 2 peaks requests, 0 page errors (both servers equal) | yes: `browser/real-5174-1440x900.json`, `browser/real-5173-1440x900.json` |
| nolength / nolength-small | `route.continue({url: http://127.0.0.1:5175/...})` to a local chunked server | held 0 on HEAD and sketch for BOTH sizes; the local server recorded sentBytes 0 (request never served) | **no**: the re-route did not reach the server, so neither the small control nor the big body was delivered |
| gzip-small / gzip-big | `route.fulfill` with `content-encoding: gzip` | held 0 on HEAD for BOTH sizes (the small, valid file also failed) | **no**: Chromium does not decode a fulfilled gzip body here |

Conclusion: no browser harness in this environment delivers a body without a trustworthy content-length to the page. The streamed cap is proved by the jsdom/undici rows PP10, PP11, PP12, PP12b, PP7d, PP7e with mutants (`mutants/summary.txt`). The browser rows of round 413 are the demo regression rows (real/404/8bit), whose values must stay equal to HEAD.
Note: the real-5174 run happened while `tech-lead` ran its own mutants on the v1 scratch; only the demo path (no adapter, no cap trigger) was exercised, and C repeats it on A's tree.

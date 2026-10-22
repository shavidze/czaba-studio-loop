# C r85 checkpoint
- start 14:xx UTC: HEAD 88b0262, 6M+4??, frozen 481/481 OK, A end hashes match, ArrangementClip 67166666, protected 4/4, store 200
- tools copied from c-round-84 (OUT -> c-round-85)
- xr 1440 PASS (overload/pastend split)
- xr 1440 rerun: all XR rows PASS (XR-WAV 0 LSB this run; run1 had 1-LSB variants w/o video -> extends C-R84-L1). overload/pastend moved to ov.cjs
- xr 1280 PASS all rows
- ov both vp: XR-OVERLOAD PASS (7.5 vs 7.48 dB, 5252=5252), PASTEND not reachable (clamped) + tail-to-end range exact 0 LSB
- m1 1440 PASS all (ghost: amber px in header 0/0, lane 654; Escape does not cancel move - preexisting, noted)
- report + json written 14:5x; pending advisor
- DONE: c-round-85.md/.json PASS (L1 Escape-cancel, L2 project radio disabled; L1-R84 jitter extended)

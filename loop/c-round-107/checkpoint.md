# C round 107 checkpoint
- SOURCE start OK: HEAD 35112cd, 6M+0??, frozen 536 OK, owned hashes = A end-hashes. Diff vs snapshots in out/diff-code.txt, all hunks in narrow ranges.
- Next: tools/kr107.cjs browser rows; sr106 regression; G107-3; AN-REVIEW mutations; targeted; DOC-092.
- HK rows: ctrl-l 1280/1440 PASS, ctrl-e PASS (recipe: ruler 10s + title-strip click at same x; first run clicked at 2.688 = my recipe), ctrl-shift-l, ctrl-c, undo-repeats PASS
- HE rows PASS: marker-prev 1280/1440, marker-next, marker-add 1280/1440, detail-apply; gain-literal not runnable (0 dB disabled at fresh clip); gain-reset (A corrected setup) PASS-with-deviation; gain-focus experiment: keyboard 0 dB reset drops focus to BODY, next Enter adds library clip (bug C-R107-01)
- NZ rows PASS: time0 1280/1440, moves, snapon-same (byte-identical), neighbour; time0-range: range kept (F2 observation)
- SR space/blocked PASS, textreg identical to r106 (only startedUtc differs)
- G107-3 PASS both vps; flow107 WAV export identical stats to r98 (101.702s, rms .174645)
- 11:03 offline rows PASS (AN-REVIEW mut h1/h5/h8/h10/h12, T107 69/1152, DOC-092), SOURCE end OK. Report + json written (PASS, bug C-R107-01). Pending: advisor final review.
- 11:05 DONE: end status 6M+0?? re-confirmed; inference wording added; final.

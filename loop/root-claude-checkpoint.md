# Root Claude checkpoint (2026-10-18 13:15Z)
- Servers up (root-servers/pids.txt). API 200, /studio-lab 200. DB: 014+015 applied after user backup; 016 SKIPPED by user decision.
- A60 crashed 11:38Z (claude session limit). Root restarted loop 13:13Z: StartRound 60 StartPhase A, PID 10768, via powershell.exe (pwsh not found on this machine now). Note root-r60-recovery-note.txt.
- cb12805 (r50-58) NOT published; bundle still in root-publish/pending/. root-publisher.cmd never ran (no publisher.log). It falls back to powershell if pwsh missing.
- User rule: never publish by hand; only root-publisher.cmd (user-started). Future gates: gate + bundle + manifest into root-publish/pending/.
- 14:5xZ: C60 FAIL (C-R60-01/02 low); B60 done; A61 implementing. Publisher still never started; cb12805 waits for round-61 boundary.
- Loop under powershell 5.1 writes *-result.json as UTF-16 (loop parses fine).
- Next: user starts publisher -> verify both remotes = cb12805 and loop resumed phase B -> gate next C PASS round on top of cb12805.

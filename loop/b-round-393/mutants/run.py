import subprocess, pathlib
root = pathlib.Path('/tmp/b394-scratch')
out = pathlib.Path('/home/runner/czaba-project/tmp/studio-real-loop/b-round-393/mutants')
P = 'app/lib/arrangement/preview.client.ts'
muts = {
 'MU-394-NO-WATCHDOG': [(P, "        element.currentTime = start;\n        armStall();\n", "        element.currentTime = start;\n")],
 'MU-394-PLAYING-NOT-DISARM': [(P, "      element.addEventListener('playing', disarmStall);\n", "")],
 'MU-394-NO-WAITING-REARM': [(P, "      element.addEventListener('waiting', armStall);\n", "")],
 'MU-394-PROGRESS-ARMS-ALWAYS': [(P, "        if (cancelStall) {\n          armStall();", "        if (true) {\n          armStall();")],
 'MU-394-NO-PROGRESS-CHECK': [(P, "if (active === preview && element.currentTime === armedAt) {", "if (active === preview) {")],
 'MU-394-STALL-SURVIVES-STOP': [(P, "        detach: () => {\n          disarmStall();\n", "        detach: () => {\n")],
 'MU-394-PAUSE-IGNORED': [(P, "      element.addEventListener('pause', handlePause);\n", "")],
 'MU-394-PAUSE-NO-ENDED-GUARD': [(P, "if (active === preview && !element.ended && !element.error) {", "if (active === preview && !element.error) {")],
 'MU-394-PAUSE-NO-ERROR-GUARD': [(P, "if (active === preview && !element.ended && !element.error) {", "if (active === preview && !element.ended) {")],
 'MU-394-SYNC-THROW-START': [(P, "      } catch {\n        handleError();\n      }", "      } catch (caught) {\n        throw caught;\n      }")],
 'MU-394-SYNC-THROW-SEEK': [(P, "        } catch {\n          active.fail();\n        }", "        } catch (caught) {\n          throw caught;\n        }")],
 'MU-394-DEFAULT-DELAY': [(P, "export const LIBRARY_PREVIEW_STREAM_STALL_MS = 8000;", "export const LIBRARY_PREVIEW_STREAM_STALL_MS = 4000;")],
}
T = 'app/lib/arrangement/__tests__/library-preview-stream.test.tsx'
summary = []
for mid, edits in muts.items():
    orig = {}
    for f, a, b in edits:
        p = root / f; orig.setdefault(f, p.read_text())
        s = p.read_text(); assert s.count(a) == 1, (mid, a); p.write_text(s.replace(a, b, 1))
    r = subprocess.run(['npx', 'vitest', 'run', T], cwd=root, capture_output=True, text=True)
    (out / f'mutant-{mid}.log').write_text(r.stdout + r.stderr)
    for f, s in orig.items(): (root / f).write_text(s)
    fails = sorted({l.split('PS')[1].split(' ')[0] for l in r.stdout.splitlines() if '×' in l and 'PS' in l})
    summary.append(f'{mid}: rc={r.returncode} {"RED" if r.returncode else "SURVIVED"} PS{fails}')
r = subprocess.run(['npx', 'vitest', 'run', T], cwd=root, capture_output=True, text=True)
(out / 'pristine.log').write_text(r.stdout + r.stderr)
summary.append(f'pristine: rc={r.returncode}')
(out / 'summary.txt').write_text('\n'.join(summary) + '\n')
print('\n'.join(summary))

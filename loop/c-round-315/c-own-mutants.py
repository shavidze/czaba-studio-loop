#!/usr/bin/env python3
# C round 315: C's own mutants on deliver / cold-start flag. Usage: python3 -I c-own-mutants.py <scratch-store-root>
import subprocess, sys, re
root = sys.argv[1]
PC = root + '/app/lib/arrangement/peaks.client.ts'
orig = open(PC).read()
M = {
 # rethrow on a microtask instead of a timer: still async, not on a timer
 'C-MU-DELIVER-MICROTASK': ("      window.setTimeout(() => {\n        throw error;\n      }, 0);\n", "      queueMicrotask(() => {\n        throw error;\n      });\n"),
 # cold-start budget value changed (5 s instead of 10 s)
 'C-MU-COLD-START-VALUE': ("PEAKS_WORKER_COLD_START_TIMEOUT_MS = 10_000;", "PEAKS_WORKER_COLD_START_TIMEOUT_MS = 5_000;"),
 # the flag is also set by an unparsable message
 'C-MU-REPLIED-ON-GARBAGE': ("    if (reply) {\n      workerReplied = true;\n    }\n", "    workerReplied = true;\n"),
 # main-thread fallback bypasses deliver
 'C-MU-FALLBACK-NO-DELIVER': ("      deliver(job, computePeaksOnMainThread(job.buffer));", "      job.onPeaks(computePeaksOnMainThread(job.buffer));"),
}
test = 'app/lib/arrangement/__tests__/peaks-worker.test.ts'
def run():
    r = subprocess.run(['npx', 'vitest', 'run', test], cwd=root, capture_output=True, text=True, timeout=600)
    out = re.sub(r'\x1b\[[0-9;]*m', '', r.stdout + r.stderr)
    failed = sorted(set(re.findall(r'FAIL .*> (PW[0-9a-z]+)', out)))
    m = re.search(r'Tests +(.*)', out)
    return failed, (m.group(1).strip() if m else '?')
try:
    for name, (a, b) in M.items():
        if orig.count(a) != 1:
            print(f'{name}: pattern count {orig.count(a)} (not applied)'); continue
        open(PC, 'w').write(orig.replace(a, b))
        failed, summary = run()
        open(PC, 'w').write(orig)
        print(f'{name}: red rows {failed} | {summary}', flush=True)
finally:
    open(PC, 'w').write(orig)
print('restored:', run()[1])

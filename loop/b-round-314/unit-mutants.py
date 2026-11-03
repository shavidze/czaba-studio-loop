#!/usr/bin/env python3
# B round 314->315: peaks client mutants. Usage: python3 -I unit-mutants.py <store-root>
# Each mutant replaces one exact text in peaks.client.ts (M) or ArrangementContext.tsx (C), runs peaks-worker.test.ts, restores.
import subprocess, sys, re
root = sys.argv[1]
PC = root + '/app/lib/arrangement/peaks.client.ts'
AC = root + '/app/contexts/ArrangementContext.tsx'
origs = {PC: open(PC).read(), AC: open(AC).read()}
DELIVER_CATCH = "    try {\n      job.onPeaks(peaks);\n    } catch (error) {\n      window.setTimeout(() => {\n        throw error;\n      }, 0);\n    }\n"
C = {
 'MU-BUFFER-BEFORE-PEAKS': ("          requestSourcePeaks(buffer, controller.signal, (peaks) => {\n            if (controller.signal.aborted) {\n              return;\n            }\n            buffersRef.current.set(source.id, buffer);\n", "          buffersRef.current.set(source.id, buffer);\n          requestSourcePeaks(buffer, controller.signal, (peaks) => {\n            if (controller.signal.aborted) {\n              return;\n            }\n"),
 'MU-NO-COLLECTION-RESYNC': ("            settle(false);\n            const present = historyRef.current.present;\n            if (present.clips.some((clip) => clip.sourceId === source.id)) {\n              syncPlayback(present, undefined, true);\n            }\n", "            settle(false);\n"),
}
M = {
 'MU-COLD-START-SAME': ("workerReplied ? PEAKS_WORKER_STALL_TIMEOUT_MS : PEAKS_WORKER_COLD_START_TIMEOUT_MS", "PEAKS_WORKER_STALL_TIMEOUT_MS"),
 'MU-NEVER-REPLIED': ("    if (reply) {\n      workerReplied = true;\n    }\n", ""),
 'MU-STALL-ONLY-AT-BEGIN': ("      return;\n    }\n    armStall();\n    if (reply.type === 'ack') {", "      return;\n    }\n    if (reply.type === 'ack') {"),
 'MU-DELIVER-NO-CATCH': (DELIVER_CATCH, "    job.onPeaks(peaks);\n"),
 'MU-DELIVER-SWALLOW': (DELIVER_CATCH, "    try {\n      job.onPeaks(peaks);\n    } catch {\n      return;\n    }\n"),
 'MU-DELIVER-SYNC-THROW': (DELIVER_CATCH, "    try {\n      job.onPeaks(peaks);\n    } catch (error) {\n      throw error;\n    }\n"),
 'MU-FAIL-KEEPS-TIMER': ("  const failWorker = () => {\n    window.clearTimeout(stallTimer);\n", "  const failWorker = () => {\n"),
 'MU-EMPTY-TO-WORKER': ("      if (buffer.length === 0 || !ensureWorker()) {", "      if (!ensureWorker()) {"),
 'MU-REPLIED-AFTER-FILTER': ("    if (reply) {\n      workerReplied = true;\n    }\n    const job = active;\n    if (!reply || !job || reply.jobId !== job.jobId) {\n      return;\n    }\n", "    const job = active;\n    if (!reply || !job || reply.jobId !== job.jobId) {\n      return;\n    }\n    workerReplied = true;\n"),
}
test = 'app/lib/arrangement/__tests__/peaks-worker.test.ts'
def run():
    r = subprocess.run(['npx', 'vitest', 'run', test], cwd=root, capture_output=True, text=True, timeout=600)
    out = re.sub(r'\x1b\[[0-9;]*m', '', r.stdout + r.stderr)
    failed = sorted(set(re.findall(r'FAIL .*> (PW[0-9a-z]+)', out)))
    m = re.search(r'Tests +(.*)', out)
    return failed, (m.group(1).strip() if m else '?')
jobs = [(PC, n, ab) for n, ab in M.items()] + [(AC, n, ab) for n, ab in C.items()]
try:
    for path, name, (a, b) in jobs:
        orig = origs[path]
        if orig.count(a) != 1:
            print(f'{name}: pattern count {orig.count(a)} (not applied)'); continue
        open(path, 'w').write(orig.replace(a, b))
        failed, summary = run()
        open(path, 'w').write(orig)
        print(f'{name}: red rows {failed} | {summary}')
finally:
    for path, orig in origs.items():
        open(path, 'w').write(orig)
failed, summary = run()
print(f'restored: {summary}')

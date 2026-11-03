# usage: python3 -I c-mutants.py <scratch-root> <out.txt>  (C round 312 own mutants; never run in store/)
import subprocess, sys, re, pathlib
root = pathlib.Path(sys.argv[1]); out = open(sys.argv[2], 'w')
C = 'app/lib/arrangement/peaks.client.ts'; K = 'app/lib/arrangement/peaks.ts'; P = 'app/lib/arrangement/peaks.worker-protocol.ts'; X = 'app/contexts/ArrangementContext.tsx'
M = [
 ('C-MU-STALE-CHUNK-FOLDED', P, 'if (job && job.jobId === request.jobId) {', 'if (job) {'),
 ('C-MU-KERNEL-TO-OFF-BY-ONE', K, 'chunkEnd) - chunkStart;', 'chunkEnd - 1) - chunkStart;'),
 ('C-MU-POOL-NOT-CLEARED', C, '    active = job;\n    pool.length = 0;\n', '    active = job;\n'),
 ('C-MU-VIDEO-GUARD-REMOVED', X, 'if (signal.aborted || !videoSourcesRef.current.has(sourceId)) {', 'if (signal.aborted) {'),
 ('C-MU-STALL-ONLY-AT-BEGIN', C, '      return;\n    }\n    armStall();\n    if (reply.type', '      return;\n    }\n    if (reply.type'),
 ('C-MU-LAST-CHUNK-DROPPED', C, 'if (job.next >= job.buffer.length && job.inFlight === 0) {', 'if (job.next + Math.round(job.buffer.sampleRate * PEAKS_CHUNK_SECONDS) >= job.buffer.length && job.inFlight === 0 && (job.next = job.buffer.length)) {'),
]
FILES = ['app/lib/arrangement/__tests__/peaks-worker.test.ts', 'app/lib/arrangement/__tests__/collection-load-status.test.tsx', 'app/lib/arrangement/__tests__/peaks.test.ts']
def run():
    r = subprocess.run(['npx', 'vitest', 'run', *FILES], cwd=root, capture_output=True, text=True, timeout=400)
    t = re.sub(r'\x1b\[[0-9;]*m', '', r.stdout + r.stderr)
    fails = sorted(set(re.findall(r'FAIL .*?> (?:[^>]*> )?([A-Z]+\d+[a-z]?)', t)))
    m = re.search(r'Tests\s+(.*)', t)
    return fails, (m.group(1).strip() if m else t[-300:]), t
for mid, f, a, b in M:
    p = root / f; src = p.read_text()
    assert src.count(a) == 1, (mid, src.count(a))
    p.write_text(src.replace(a, b))
    (pathlib.Path(sys.argv[2]).parent / f'{mid}.patch.txt').write_text(f'--- {f}\n- {a}\n+ {b}\n')
    try:
        fails, summ, t = run()
    finally:
        p.write_text(src)
    (pathlib.Path(sys.argv[2]).parent / f'{mid}.log').write_text(t[-4000:])
    line = f"{mid} -> {'RED ' + ' '.join(fails) if fails else 'GREEN (survived)'} | {summ}"
    print(line, flush=True); out.write(line + '\n'); out.flush()
fails, summ, t = run(); out.write(f'restored: {summ}\n'); print('restored', summ)

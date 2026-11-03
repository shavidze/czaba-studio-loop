# usage: python3 -I mutants.py <scratch-root> <out.txt>
import subprocess, sys, re, pathlib
root = pathlib.Path(sys.argv[1]); out = open(sys.argv[2], 'w')
C = 'app/lib/arrangement/peaks.client.ts'; K = 'app/lib/arrangement/peaks.ts'; P = 'app/lib/arrangement/peaks.worker-protocol.ts'
M = [
 ('MU-WORKER-PATH-DELETED', C, 'if (buffer.length === 0 || !ensureWorker()) {', 'if (buffer.length >= 0 || !ensureWorker()) {'),
 ('MU-FRESH-BUFFERS', C, 'const reused = pool.pop();', 'const reused = pool.pop() && undefined;'),
 ('MU-UNBOUNDED-INFLIGHT', C, 'while (job.inFlight < PEAKS_CHUNKS_IN_FLIGHT && job.next < job.buffer.length) {', 'while (job.next < job.buffer.length) {'),
 ('MU-KERNEL-INIT-ZERO', K, 'let max = peaks[bucket];', 'let max = 0;'),
 ('MU-KERNEL-CHUNK-END', K, 'const to = Math.min(Math.floor((bucket + 1) * samplesPerBucket), chunkEnd) - chunkStart;', 'const to = Math.floor((bucket + 1) * samplesPerBucket) - chunkStart;'),
 ('MU-ACK-NEW-ARRAYS', P, "{ type: 'ack', jobId: request.jobId, channels: request.channels }", "{ type: 'ack', jobId: request.jobId, channels: request.channels.map((c) => c.slice()) }"),
 ('MU-ABORT-DELIVERS', C, '    active = null;\n    if (!job.signal.aborted) {\n      job.onPeaks(reply.peaks);\n    }', '    active = null;\n    job.onPeaks(reply.peaks);'),
 ('MU-NO-FALLBACK-ON-ERROR', C, '    for (const job of pending) {\n      deliverOnMainThread(job);\n    }', '    void pending;'),
 ('MU-NO-STALL', C, '    stallTimer = window.setTimeout(failWorker, PEAKS_WORKER_STALL_TIMEOUT_MS);', '    stallTimer = 0;'),
 ('MU-PARALLEL-JOBS', C, '      queue.push(job);\n      if (!active) {\n        startNext();\n      }', '      queue.push(job);\n      startNext();'),
 ('MU-DISPOSE-NO-TERMINATE', C, '        worker.onmessageerror = null;\n        worker.terminate();\n        worker = null;\n      }\n    },', '        worker.onmessageerror = null;\n        worker = null;\n      }\n    },'),
 ('MU-NO-CANCEL', C, "      post({ type: 'cancel', jobId: job.jobId });\n", ''),
]
def run():
    r = subprocess.run(['npx', 'vitest', 'run', 'app/lib/arrangement/__tests__/peaks-worker.test.ts'], cwd=root, capture_output=True, text=True, timeout=300)
    t = re.sub(r'\x1b\[[0-9;]*m', '', r.stdout + r.stderr)
    fails = sorted(set(re.findall(r'FAIL .*?> (?:[^>]*> )?(PW\d+b?)', t)))
    m = re.search(r'Tests\s+(.*)', t)
    return fails, (m.group(1).strip() if m else t[-300:])
for mid, f, a, b in M:
    p = root / f; s = p.read_text()
    if s.count(a) != 1:
        out.write(f'{mid} -> CONTEXT-NOT-FOUND\n'); continue
    p.write_text(s.replace(a, b)); fails, summary = run(); p.write_text(s)
    out.write(f"{mid} -> {len(fails)} red {' '.join(fails)} | {summary}\n"); out.flush()
fails, summary = run(); out.write(f'restored: {summary}\n')

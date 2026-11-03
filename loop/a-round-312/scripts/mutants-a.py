# usage: python3 -I mutants-a.py <scratch-root> <out.txt>
# B's 12 mutants (b-round-311/sketch/mutants.py) + MU-CONTEXT-BYPASS + A's own MU-CONTEXT-READY-FIRST, MU-REENTRANT-STARTNEXT, MU-POST-UNGUARDED (review fixes) and MU-BUCKETCOUNT-NAN.
import subprocess, sys, re, pathlib, runpy
root = pathlib.Path(sys.argv[1]); out = open(sys.argv[2], 'w')
C = 'app/lib/arrangement/peaks.client.ts'; K = 'app/lib/arrangement/peaks.ts'; P = 'app/lib/arrangement/peaks.worker-protocol.ts'
X = 'app/contexts/ArrangementContext.tsx'
B = [
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
M = [(m, [(f, a, b)]) for m, f, a, b in B]
IMMEDIATE = "((onPeaks: (peaks: Float32Array) => void) => onPeaks(computePeaks(Array.from({ length: buffer.numberOfChannels }, (_, i) => buffer.getChannelData(i)), buffer.sampleRate, PEAK_BUCKETS_PER_SECOND)))((peaks) => {"
M.append(('MU-CONTEXT-BYPASS', [
 (X, "import {\n  createSourcePeaksComputer,", "import { computePeaks, PEAK_BUCKETS_PER_SECOND } from '~/lib/arrangement/peaks';\nimport {\n  createSourcePeaksComputer,"),
 (X, 'requestSourcePeaks(buffer, signal, (peaks) => {', IMMEDIATE),
 (X, 'requestSourcePeaks(buffer, controller.signal, (peaks) => {', IMMEDIATE),
]))
M.append(('MU-CONTEXT-READY-FIRST', [(X, 'requestSourcePeaks(buffer, controller.signal, (peaks) => {', "patchSourceState(source.id, { status: 'ready', duration: buffer.duration, error: null });\n          requestSourcePeaks(buffer, controller.signal, (peaks) => {")]))
M.append(('MU-REENTRANT-STARTNEXT', [(C, '    if (!active) {\n      startNext();\n    }\n  };', '    startNext();\n  };')]))
M.append(('MU-POST-UNGUARDED', [(C, '    try {\n      worker.postMessage(message, { transfer });\n      return true;\n    } catch {\n      failWorker();\n      return false;\n    }', '    worker.postMessage(message, { transfer });\n    return true;')]))
M.append(('MU-BUCKETCOUNT-NAN', [(K, '  return Number.isFinite(count) ? count : 0;', '  return count;')]))
def run():
    r = subprocess.run(['npx', 'vitest', 'run', 'app/lib/arrangement/__tests__/peaks-worker.test.ts'], cwd=root, capture_output=True, text=True, timeout=300)
    t = re.sub(r'\x1b\[[0-9;]*m', '', r.stdout + r.stderr)
    fails = sorted(set(re.findall(r'FAIL .*?> (?:[^>]*> )?(PW\d+b?)', t)))
    m = re.search(r'Tests\s+(.*)', t)
    return fails, (m.group(1).strip() if m else t[-300:]), t
for mid, edits in M:
    originals = {}
    ok = True
    for f, a, b in edits:
        p = root / f; s = originals.get(f) or p.read_text(); originals.setdefault(f, s)
        cur = p.read_text()
        if cur.count(a) != 1:
            ok = False; break
        p.write_text(cur.replace(a, b))
    if not ok:
        for f, s in originals.items(): (root / f).write_text(s)
        out.write(f'{mid} -> CONTEXT-NOT-FOUND\n'); continue
    fails, summary, text = run()
    if mid == 'MU-CONTEXT-BYPASS':
        open(str(pathlib.Path(sys.argv[2]).with_name('mu-context-bypass.log')), 'w').write(text)
        subprocess.run(['diff', '-u', str(pathlib.Path(sys.argv[2]).with_name('ctx-orig.tsx')), str(root / X)], stdout=open(str(pathlib.Path(sys.argv[2]).with_name('mu-context-bypass.patch.txt')), 'w'))
    for f, s in originals.items(): (root / f).write_text(s)
    out.write(f"{mid} -> {len(fails)} red {' '.join(fails)} | {summary}\n"); out.flush()
fails, summary, _ = run(); out.write(f'restored: {summary}\n')

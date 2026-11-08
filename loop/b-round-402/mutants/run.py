# B round 402->403 mutants on the PERF-14c-i sketch. Usage: python3 -I run.py <scratch-root> <out-dir>
import subprocess, sys, pathlib, re
root = pathlib.Path(sys.argv[1]); out = pathlib.Path(sys.argv[2])
SRC = 'app/lib/arrangement/peaks.client.ts'
TEST = 'app/lib/arrangement/__tests__/peaks-worker.test.ts'
MUTANTS = {
  'MU-403-NO-LOOP-CATCH': (SRC, """      try {
        deliverOnMainThread(job);
      } catch (error) {
        if (job === requesting) {
          requestingFailure = { error };
        } else {
          rethrowLater(error);
        }
      }
""", """      deliverOnMainThread(job);
""", ['PW27']),
  'MU-403-REQUESTING-DEFERRED': (SRC, """        if (job === requesting) {
          requestingFailure = { error };
        } else {
          rethrowLater(error);
        }""", """        rethrowLater(error);""", ['PW29']),
  'MU-403-CATCH-IN-DELIVER-MAIN': (SRC, """    if (!job.signal.aborted) {
      deliver(job, computePeaksOnMainThread(job.buffer));
    }""", """    if (!job.signal.aborted) {
      try {
        deliver(job, computePeaksOnMainThread(job.buffer));
      } catch (error) {
        rethrowLater(error);
      }
    }""", ['PW28']),
  'MU-403-NO-DISPOSE-RESET': (SRC, """      workerReplied = false;
""", "", ['PW25']),
  'MU-403-COLD-5000': (SRC, "PEAKS_WORKER_COLD_START_TIMEOUT_MS = 10_000", "PEAKS_WORKER_COLD_START_TIMEOUT_MS = 5_000", ['PW14b']),
  'MU-403-REPLIED-ON-GARBAGE': (SRC, """    if (reply) {
      workerReplied = true;
    }""", """    workerReplied = true;""", ['PW24b']),
  'MU-403-DELIVER-NO-TRY': (SRC, """    try {
      job.onPeaks(peaks);
    } catch (error) {
      rethrowLater(error);
    }""", """    job.onPeaks(peaks);""", ['PW26']),
  'MU-403-JUNK-REARMS': (SRC, """    const job = active;
    if (!reply || !job || reply.jobId !== job.jobId) {""", """    armStall();
    const job = active;
    if (!reply || !job || reply.jobId !== job.jobId) {""", ['PW24']),
}
def run(tag):
    r = subprocess.run(['npx', 'vitest', 'run', TEST], cwd=root, capture_output=True, text=True)
    text = re.sub(r'\x1b\[[0-9;]*m', '', r.stdout + r.stderr)
    (out / f'{tag}.log').write_text(text)
    return r.returncode, text
lines = []
rc, _ = run('pristine-before'); lines.append(f'pristine-before rc {rc}')
for name, (path, old, new, expect) in MUTANTS.items():
    f = root / path; orig = f.read_text()
    assert orig.count(old) == 1, (name, orig.count(old))
    f.write_text(orig.replace(old, new))
    try:
        rc, text = run(f'mutant-{name}')
    finally:
        f.write_text(orig)
    failed = sorted(set(re.findall(r'(?:×|FAIL)\s.*?(PW\d+b?)\b', text)))
    red = all(any(e == x for x in failed) for e in expect)
    lines.append(f"{name} {'RED' if rc != 0 and red else 'SURVIVED'} rc {rc} expected {','.join(expect)} failing {','.join(failed)}")
rc, _ = run('pristine-after'); lines.append(f'pristine-after rc {rc}')
(out / 'summary.txt').write_text('\n'.join(lines) + '\n'); print('\n'.join(lines))

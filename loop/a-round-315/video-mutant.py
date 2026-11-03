#!/usr/bin/env python3
# A round 315: MU-VIDEO-BUFFER-BEFORE-PEAKS. Usage: python3 -I video-mutant.py <scratch-store-root>
import subprocess, sys, re
root = sys.argv[1]
AC = root + '/app/contexts/ArrangementContext.tsx'
orig = open(AC).read()
a = ("        requestSourcePeaks(buffer, signal, (peaks) => {\n"
     "          if (signal.aborted || !videoSourcesRef.current.has(sourceId)) {\n"
     "            return;\n          }\n          buffersRef.current.set(sourceId, buffer);\n")
b = ("        buffersRef.current.set(sourceId, buffer);\n"
     "        requestSourcePeaks(buffer, signal, (peaks) => {\n"
     "          if (signal.aborted || !videoSourcesRef.current.has(sourceId)) {\n"
     "            return;\n          }\n")
test = 'app/lib/arrangement/__tests__/peaks-worker-video.test.tsx'
def run():
    r = subprocess.run(['npx', 'vitest', 'run', test], cwd=root, capture_output=True, text=True, timeout=600)
    out = re.sub(r'\x1b\[[0-9;]*m', '', r.stdout + r.stderr)
    m = re.search(r'Tests +(.*)', out)
    fail = re.findall(r'(AssertionError.*|expected .* to not include .*)', out)
    return (m.group(1).strip() if m else '?'), fail[:2], out
print('pattern count', orig.count(a))
try:
    open(AC, 'w').write(orig.replace(a, b))
    s, f, out = run()
    loc = re.findall(r'peaks-worker-video\.test\.tsx:(\d+):\d+', out)
    print('MU-VIDEO-BUFFER-BEFORE-PEAKS:', s, '| first failing line', loc[:1], '|', f)
finally:
    open(AC, 'w').write(orig)
s, _, _ = run()
print('restored:', s)

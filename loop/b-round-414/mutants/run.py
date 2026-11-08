import json, os, subprocess, sys
# env S = committed scratch with the sketch applied (clean tree), OUT = output folder
S = os.environ['S']; OUT = os.environ['OUT']
os.makedirs(OUT, exist_ok=True)
H = 'app/lib/arrangement/__tests__/helpers/fake-web-audio.ts'
FILES = ['app/lib/arrangement/__tests__/schedule-failure-ui.test.tsx',
         'app/lib/arrangement/__tests__/master-hold-tick.test.tsx',
         'app/lib/arrangement/__tests__/decoded-buffer-eviction-ui.test.tsx']
M = [
 ('MU-415-START-NO-FAIL', 'if (startFailure.armedAt > 0) {', 'if (startFailure.armedAt < 0) {', ['SF1', 'SF11']),
 ('MU-415-SOURCES-UNRECORDED', '      createdSources.push(source);\n', '', ['SF2', 'EV3']),
 ('MU-415-STOP-UNCOUNTED', 'this.stops += 1;', 'this.stops += 0;', ['SF2']),
 ('MU-415-ANALYSER-SILENT', 'target.fill(meterSignal.value);', 'target.fill(0);', ['HT1', 'SF11']),
 ('MU-415-NO-SETINTERVAL-STUB', "      vi.stubGlobal('setInterval', stub);\n", '', ['SF11']),
 ('MU-415-METERED-IGNORED', 'options.metered ? MeteredAudioContext : FakeAudioContext', 'FakeAudioContext', ['HT1', 'SF11']),
 ('MU-415-FRAMES-NOT-RUN', 'frames.splice(0, frames.length)', 'frames.splice(0, 0)', ['HT1', 'SF11']),
 ('MU-415-RESET-LEAK', '    startFailure.thrown = 0;\n', '', ['SF2']),
 ('MU-415-CLOCK-LEAD-IGNORED', "(options.clockLeadSeconds ?? 0)", '0', []),
 ('MU-415-CONTROL-METERED-ALWAYS', 'options.metered ? MeteredAudioContext : FakeAudioContext', 'MeteredAudioContext', []),
 ('MU-415-GUARD-AND-STUB-REMOVED', "      vi.stubGlobal('setInterval', stub);\n      if (!Object.is(window.setInterval, stub)) {\n        throw new Error('the setInterval stub did not replace window.setInterval');\n      }\n", '', []),
]
def run(tag):
    out = os.path.join(OUT, tag + '.json')
    r = subprocess.run(['npx', 'vitest', 'run', *FILES, '--reporter=json', '--outputFile=' + out], cwd=S, capture_output=True, text=True)
    d = json.load(open(out))
    failed = sorted({t['title'].split(':')[0] for f in d['testResults'] for t in f['assertionResults'] if t['status'] != 'passed'})
    return r.returncode, failed, d['numTotalTests']
lines = []
rc, failed, n = run('PRISTINE-BEFORE'); lines.append(f'PRISTINE-BEFORE rc {rc} failed {failed} tests {n}')
src = open(os.path.join(S, H)).read()
for name, old, new, expect in M:
    assert src.count(old) == 1, name
    open(os.path.join(S, H), 'w').write(src.replace(old, new))
    try:
        rc, failed, n = run(name)
    finally:
        open(os.path.join(S, H), 'w').write(src)
    verdict = 'RED' if failed else 'GREEN'
    ok = all(e in failed for e in expect)
    lines.append(f'{name} {verdict} expected-rows-red {ok} failed {failed}')
rc, failed, n = run('PRISTINE-AFTER'); lines.append(f'PRISTINE-AFTER rc {rc} failed {failed} tests {n}')
st = subprocess.run(['git', 'status', '--short'], cwd=S, capture_output=True, text=True).stdout.strip().splitlines()
lines.append(f'SCRATCH-STATUS {len(st)} lines')
open(os.path.join(OUT, 'summary.txt'), 'w').write('\n'.join(lines) + '\n')
print('\n'.join(lines))

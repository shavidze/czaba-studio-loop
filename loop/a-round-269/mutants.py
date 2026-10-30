import subprocess, shutil, sys, re
S='/tmp/a269-scratch'
ENV=S+'/app/lib/arrangement/envelope.ts'
CMP=S+'/app/components/arrangement/ArrangementClipEnvelope.tsx'
T='app/lib/arrangement/__tests__/'
mutants = {
 'M-LINEAR': (ENV, "        : interpolateEnvelopeGain(left.gain, right.gain, (sourceTime - left.time) / segment);",
              "        : left.gain + ((right.gain - left.gain) * (sourceTime - left.time)) / segment;", ['envelope.test.ts']),
 'M-NO-STEPS': (ENV, "const count = Math.max(1, Math.ceil(span / CLIP_ENVELOPE_RAMP_STEP_DB - 1e-9));",
              "const count = 1 + 0 * span;", ['envelope.test.ts','export-range.test.ts']),
 'M-DISPLAY': (CMP, "top: `${clipEnvelopeDepthFromGain(point.gain) * 100}%`,", "top: `${(1 - point.gain) * 100}%`,", ['clip-envelope-ui.test.tsx']),
 'M-DRAG': (CMP, """      depthDelta === 0
        ? gesture.originalGain
        : clipEnvelopeGainFromDepth(clipEnvelopeDepthFromGain(gesture.originalGain) + depthDelta),""",
              "      depthDelta === 0 ? gesture.originalGain : gesture.originalGain - depthDelta,", ['clip-envelope-ui.test.tsx']),
 'M-DY0': (CMP, """      depthDelta === 0
        ? gesture.originalGain
        : clipEnvelopeGainFromDepth(clipEnvelopeDepthFromGain(gesture.originalGain) + depthDelta),""",
              "      clipEnvelopeGainFromDepth(clipEnvelopeDepthFromGain(gesture.originalGain) + depthDelta),", ['clip-envelope-ui.test.tsx']),
 'M-FLOOR': (ENV, None, None, ['envelope.test.ts']),
}
for name,(path,old,new,files) in mutants.items():
    orig=open(path).read()
    if old is None:
        mut=re.sub(r'(?<!import \{ )TRACK_VOLUME_DB_MIN(?! \} from)', '(-40)', orig)
        assert mut.count('(-40)')>=4, mut.count('(-40)')
    else:
        assert orig.count(old)==1,(name,orig.count(old))
        mut=orig.replace(old,new)
    open(path,'w').write(mut)
    try:
        r=subprocess.run(['npx','vitest','run']+[T+f for f in files],cwd=S,capture_output=True,text=True,timeout=600)
        out=re.sub(r'\x1b\[[0-9;]*m','',r.stdout+r.stderr)
        fails=sorted(set(re.findall(r'FAIL\s+\S+ > (.+?)(?:\n|$)',out)))
        summary=[l.strip() for l in out.splitlines() if l.strip().startswith('Tests ')]
        print(f'== {name} rc={r.returncode} {summary}')
        for f in fails: print('   RED:',f[:160])
    finally:
        open(path,'w').write(orig)
r=subprocess.run(['npx','vitest','run',T+'envelope.test.ts',T+'clip-envelope-ui.test.tsx',T+'export-range.test.ts'],cwd=S,capture_output=True,text=True)
print('== UNMUTATED', [l.strip() for l in re.sub(r'\x1b\[[0-9;]*m','',r.stdout).splitlines() if l.strip().startswith('Tests ')], 'rc', r.returncode)

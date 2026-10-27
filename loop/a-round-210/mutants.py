import subprocess, sys, shutil, hashlib, re
STORE='/home/runner/czaba-project/store'
CTX=STORE+'/app/contexts/ArrangementContext.tsx'
TEST='app/lib/arrangement/__tests__/fader-pointer-preview.test.tsx'
MUTANTS=[
 ('M4 volume revert does not rewrite the stored live gains','FP(3|4):',
  "    if (takeMixOverride()) {\n      writeLiveMixGains('tracks');\n    }",
  "    takeMixOverride();"),
 ('M5 volume revert drops the override without clearing the draft','FP5',
  "  const revertVolumeTargetPreview = useCallback(() => {\n    if (takeMixOverride()) {",
  "  const revertVolumeTargetPreview = useCallback(() => {\n    if ((mixOverrideRef.current = null)) {"),
 ('M7 startGraph ignores the pointer override','FP(7|8):',
  "      const panOverride = panOverrideRef.current;\n      const mixed = withMixOverride(arrangement, mixOverrideRef.current);\n",
  "      const panOverride = panOverrideRef.current;\n      const mixed = arrangement;\n"),
 ('M9 group keyboard change forced onto the pointer path','FP9',
  "      if (volumeGestureRef.current?.targetKey === key) {",
  "      if (volumeGestureRef.current?.targetKey === key || target.kind === 'group') {"),
 ('M11 unmount does not clear the volume override draft','FP11',
  "      if (mixOverride) {\n        mixDraftStore.clear(mixOverrideDraftKey(mixOverride));\n      }\n",
  ""),
 ('M12 pointer override stored at float32 (AudioParam read-back) precision','FP12',
  "        const override: MixOverride = { kind: target.kind, id: target.id, volume: previewed };",
  "        const override: MixOverride = { kind: target.kind, id: target.id, volume: Math.fround(previewed) };"),
 ('M13 previewTrackPan gesture guard removed (l.2799)','FP13',
  "      if (panGestureRef.current?.trackId !== trackId || !Number.isFinite(pan)) {",
  "      if (!Number.isFinite(pan)) {"),
 ('M14ab cancelTrackPan does not restore the stored live pan','FP14',
  "      if (finishTrackPanGesture(trackId)) {\n        restoreStoredTrackPan(trackId);\n      }",
  "      finishTrackPanGesture(trackId);"),
 ('M14c stolen-claim abort does not restore the stored live pan','FP14',
  "        mixDraftStore.clear(trackPanDraftKey(trackId));\n        restoreStoredTrackPan(trackId);\n      });",
  "        mixDraftStore.clear(trackPanDraftKey(trackId));\n      });"),
 ('M14w restore writes centre (0) instead of the stored pan (review M1)','FP1[34]',
  "      handleRef.current?.setTrackPan(trackId, trackPanValue(track));\n    }\n  }, []);",
  "      handleRef.current?.setTrackPan(trackId, 0);\n    }\n  }, []);"),
]
orig=open(CTX).read()
h0=hashlib.sha256(orig.encode()).hexdigest()
try:
  for name,pat,old,new in MUTANTS:
    assert orig.count(old)==1,(name,orig.count(old))
    open(CTX,'w').write(orig.replace(old,new))
    r=subprocess.run(['npx','vitest','run',TEST,'-t',pat],cwd=STORE,capture_output=True,text=True)
    out=r.stdout+r.stderr
    out=re.sub(r'\x1b\[[0-9;]*m','',out)
    lines=[l.strip() for l in out.splitlines() if re.search(r'(✓|×) FP|AssertionError|Tests +\d',l)]
    print('==',name,'| pattern',pat,'| exit',r.returncode)
    for l in lines[:12]: print('   ',l[:220])
finally:
  open(CTX,'w').write(orig)
  assert hashlib.sha256(open(CTX).read().encode()).hexdigest()==h0
  print('restored',h0)

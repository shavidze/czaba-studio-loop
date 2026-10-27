import hashlib, re, subprocess, sys, os
STORE = '/home/runner/czaba-project/store'
CTX = 'app/contexts/ArrangementContext.tsx'
LEAF = 'app/components/arrangement/ArrangementDetailPanel.tsx'
PATH = 'app/components/arrangement/ArrangementClip.tsx'
TEST = 'app/lib/arrangement/__tests__/clip-gain-pointer-preview.test.tsx'
MUTANTS = [
  ('M2', CTX, 'commit applies the stored arrangement instead of the override',
   'withMixOverride(historyRef.current.present, pointerOverride)', 'historyRef.current.present', 'CP2'),
  ('M3', CTX, 'cancel skips the live clip gain restore',
   'if (override && isPlayingRef.current && handle) {', 'if (override && isPlayingRef.current && handle && override.clipIds.length === 0) {', 'CP3|CP4|CP5'),
  ('M4', CTX, 'stolen-claim abort does not revert the preview',
   '        clipGainGestureRef.current = null;\n        revertClipGainFaderPreview();\n      });', '        clipGainGestureRef.current = null;\n      });', 'CP4'),
  ('M5', CTX, 'fader blur during the gesture commits instead of cancelling',
   '      } else if (gesture.memberKey === memberKey) {\n        cancelClipGainFaderGesture();', '      } else if (gesture.memberKey === memberKey) {\n        commitClipGainPending(memberKey);', 'CP5'),
  ('M6', CTX, 'members status reads the pending member ids (null on the pointer path)',
   'const memberIds = pointerOverride ? pointerOverride.clipIds : clipGainMemberIdsRef.current;', 'const memberIds = clipGainMemberIdsRef.current;', 'CP6'),
  ('M7', CTX, 'startGraph reads the stored clip gains',
   'clipGains: clipLinearGains(mixed),', 'clipGains: clipLinearGains(arrangement),', 'CP7|CP8'),
  ('M7s', CTX, 'syncPlayback setter loop reads the stored clips',
   'for (const clip of mixed.clips) {', 'for (const clip of arrangement.clips) {', 'CP7|CP8'),
  ('M9', CTX, 'native change with no gesture takes the pointer path',
   'if (clipGainGestureRef.current?.memberKey === clipId) {', 'if (clipGainGestureRef.current?.memberKey === clipId || !clipGainGestureRef.current) {', 'CP9'),
  ('M10a', LEAF, 'pending marker ignores the draft',
   'const isPending = !drafted && reason === null && fieldText !== displayedText;', 'const isPending = reason === null && fieldText !== displayedText;', 'CP10'),
  ('M10b', LEAF, 'reset disabled reads the stored gain during a draft',
   'const singleGainDb = drafted ? (maxDb === 0 ? undefined : maxDb) : storedClipGainDb;', 'const singleGainDb = storedClipGainDb;', 'CP10'),
  ('M10c', LEAF, 'the draft is shown even when the selection has a reason',
   "const isDrafted = snapshot !== '' && clipIds !== null && reason === null;", "const isDrafted = snapshot !== '' && clipIds !== null;", 'CP10b'),
  ('M3d', CTX, 'cancel keeps the override and its drafts',
   '    const override = takeClipGainOverride();\n    const handle = handleRef.current;', "    const override = mixOverrideRef.current?.kind === 'clip-gain' ? mixOverrideRef.current : null;\n    const handle = handleRef.current;", 'CP3|CP4|CP5'),
  ('M11', CTX, 'unmount does not clear the override drafts',
   '      mixOverrideRef.current = null;\n      if (mixOverride) {\n        for (const key of mixOverrideDraftKeys(mixOverride)) {\n          mixDraftStore.clear(key);\n        }\n      }', '      mixOverrideRef.current = null;', 'CP11'),
  ('M12', CTX, 'pointer target read back as float32',
   "const target = next.clips.find((entry) => entry.id === clipId)?.gainDb ?? 0;", "const target = Math.fround(next.clips.find((entry) => entry.id === clipId)?.gainDb ?? 0);", 'CP12'),
  ('M13', PATH, 'the draft drawing drops the waveform zoom',
   '    isVideo,\n    zoom,\n  );', '    isVideo,\n    draftGainDb === undefined ? zoom : 1,\n  );', 'CP13'),
  ('M14', CTX, 'Trap 1: pointer path returns early at the stored value',
   "        const target = next.clips.find((entry) => entry.id === clipId)?.gainDb ?? 0;\n", "        const target = next.clips.find((entry) => entry.id === clipId)?.gainDb ?? 0;\n        if (next === present) {\n          return;\n        }\n", 'CP14'),
]
only = sys.argv[1:]
ansi = re.compile(r'\x1b\[[0-9;]*m')
for name, rel, what, old, new, pattern in MUTANTS:
    if only and name not in only:
        continue
    path = os.path.join(STORE, rel)
    original = open(path).read()
    digest = hashlib.sha256(original.encode()).hexdigest()
    assert original.count(old) == 1, (name, original.count(old))
    open(path, 'w').write(original.replace(old, new))
    try:
        out = subprocess.run(['npx', 'vitest', 'run', TEST, '-t', pattern], cwd=STORE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, timeout=900).stdout
    finally:
        open(path, 'w').write(original)
    assert hashlib.sha256(open(path).read().encode()).hexdigest() == digest
    out = ansi.sub('', out)
    red = [l.strip()[2:].split(':')[0] for l in out.splitlines() if l.strip().startswith('×')]
    green = [l.strip()[2:].split(':')[0] for l in out.splitlines() if l.strip().startswith('✓')]
    errs = [l.strip() for l in out.splitlines() if l.strip().startswith('AssertionError')][:3]
    print(f'{name} [{rel}] {what}\n  red: {red}\n  green: {green}\n  first assertion: {errs[:1]}', flush=True)

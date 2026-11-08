# B round 404 -> 405: SYS-R385 stage 2 mutants on the sketch scratch (git HEAD = sketch). Each mutant: apply, run its test file, record, git checkout.
# Env S = scratch repo whose HEAD is the tree under test (default B's sketch); OUT = output folder (default B's evidence; C uses c-round-405/mutants).
import os, subprocess, re
S = os.environ.get('S', '/tmp/b405-sketch')
OUT = os.environ.get('OUT', '/home/runner/czaba-project/tmp/studio-real-loop/b-round-404/mutants')
os.makedirs(OUT, exist_ok=True)
CTX = 'app/contexts/ArrangementContext.tsx'
SW = 'app/components/arrangement/StudioWorkspace.tsx'
LIB = 'app/components/arrangement/ArrangementLibrary.tsx'
T_AC = 'app/lib/arrangement/__tests__/actions-context.test.tsx'
T_FP = 'app/lib/arrangement/__tests__/fader-pointer-preview.test.tsx'
T_MU = 'app/lib/arrangement/__tests__/master-ui.test.tsx'
T_SW = 'app/lib/arrangement/__tests__/selection-wrappers-render.test.tsx'
T_RB = 'app/lib/arrangement/__tests__/render-budget.test.tsx'
MM = "    applyEdit(setMasterMix(arrangement, { mute: !arrangement.master.mute }), MASTER_MUTE_LABEL);\n  }, [applyEdit, refuseEditDuringGesture]);"
UNDO = "  }, [flushPendingClipGain, flushPendingMaster, flushPendingVolume, restoreHistory, setStatus]);\n\n  const redo = useCallback(() => {"
# (id, file, old, new, test file, expected red row prefix, rows that must stay green)
M = [
 ('MU-405-SELECTED-DEP', CTX, MM, MM.replace('refuseEditDuringGesture]', 'refuseEditDuringGesture, selectedSourceId]'), T_AC, 'AC7', ['AC1']),
 ('MU-405-SOURCESTATES-DEP', CTX, UNDO, UNDO.replace('setStatus]);', 'setStatus, sourceStates]);'), T_AC, 'AC7', ['AC1']),
 ('MU-405-PREVIEW-DEP', CTX, MM, MM.replace('refuseEditDuringGesture]', 'refuseEditDuringGesture, libraryPreviewSourceId]'), T_AC, 'AC7', ['AC1']),
 ('MU-405-SEEKTO-WRAP', CTX, "      seekTo,\n      selectSource,\n      setStatus,\n      splitSelection,\n      startLibraryPreview,\n      stepLoopRange,\n      stopLibraryPreview,\n      toggleLoopSelection,\n      toggleMasterMute,\n      togglePlayback,\n      undo,\n    }),", "      seekTo: (time: number) => seekTo(time),\n      selectSource,\n      setStatus,\n      splitSelection,\n      startLibraryPreview,\n      stepLoopRange,\n      stopLibraryPreview,\n      toggleLoopSelection,\n      toggleMasterMute,\n      togglePlayback,\n      undo,\n    }),", T_AC, 'AC7', ['AC2']),
 ('MU-405-FP-OLD-NAME', T_FP, "  'ArrangementMasterViewInner',\n  'PreviewProbe',", "  'ArrangementMaster',\n  'PreviewProbe',", T_FP, 'FP0', []),
 ('MU-405-MU-OLD-NAME', T_MU, "      expect(renderLog.counts.get('ArrangementMasterViewInner') ?? 0).toBeGreaterThan(0);", "      expect(renderLog.counts.get('ArrangementMaster') ?? 0).toBeGreaterThan(0);", T_MU, 'sits in the footer', []),
 ('MU-405-GH5-RECORDER', T_SW, "      expect(renderLog.groupHeaderIds).toEqual([muted[0].id]);", "      expect(renderLog.groupHeaderIds).toEqual(['g1']);", T_SW, 'GH5', []),
 ('MU-405-GH2-CANDIDATES-OBJECTIS', SW, "    activeCandidateTrackIds: sameTrackIdList,", "    activeCandidateTrackIds: Object.is,", T_SW, 'GH2', []),
 ('MU-405-GH2-OVERVIEW-OBJECTIS', SW, "    overviewClips: sameTrackGroupOverviewClips,\n  };", "    overviewClips: Object.is,\n  };", T_SW, 'GH2', []),
 ('MU-405-RBLEAF3-INLINE-WORKSPACE', SW, "          tracks={arrangement.tracks}\n          actions={libraryActions}\n        />", "          tracks={arrangement.tracks}\n          actions={{ ...libraryActions }}\n        />", T_RB, 'RB-LEAF3', []),
 ('MU-405-RBLEAF3-INLINE-LIBRARY', LIB, "            tracks={tracks}\n            actions={actions}\n          />\n        </div>\n      )}", "            tracks={tracks}\n            actions={{ ...actions }}\n          />\n        </div>\n      )}", T_RB, 'RB-LEAF3', []),
 ('MU-405-MARKERS-INPLACE', 'app/lib/arrangement/model.ts', "  patch: Partial<Pick<ArrangementTrack, 'volume' | 'mute'>>,\n): Arrangement {\n  return {\n    ...arrangement,\n", "  patch: Partial<Pick<ArrangementTrack, 'volume' | 'mute'>>,\n): Arrangement {\n  arrangement.markers?.push();\n  return {\n    ...arrangement,\n", T_AC, 'AC4', []),
 ('MU-405-MARKERS-COPY', 'app/lib/arrangement/model.ts', "  patch: Partial<Pick<ArrangementTrack, 'volume' | 'mute'>>,\n): Arrangement {\n  return {\n    ...arrangement,\n", "  patch: Partial<Pick<ArrangementTrack, 'volume' | 'mute'>>,\n): Arrangement {\n  return {\n    ...arrangement,\n    markers: arrangement.markers?.slice(),\n", T_AC, 'AC4', []),
 ('MU-405-MASTER-COMMIT-SKIP', CTX, "    if (before) {\n      applyEdit(historyRef.current.present, MASTER_VOLUME_LABEL, before);\n    }", "    if (before && Number.isNaN(0)) {\n      applyEdit(historyRef.current.present, MASTER_VOLUME_LABEL, before);\n    }", T_AC, 'AC7', []),
]
FILES = sorted({m[4] for m in M})
def run(test):
    r = subprocess.run(['npx', 'vitest', 'run', test, '--reporter=verbose'], cwd=S, capture_output=True, text=True)
    txt = re.sub(r'\x1b\[[0-9;]*m', '', r.stdout + r.stderr)
    failed = sorted(set(l.split('× ', 1)[1].strip() for l in txt.splitlines() if '× ' in l))
    return r.returncode, failed, txt
def hit(failed, prefix):
    return any(re.search(r'(^|\s)' + re.escape(prefix) + r'(\b|\s)', f) for f in failed)
lines = []
for test in FILES:
    rc, failed, txt = run(test); open(f'{OUT}/pristine-before-{os.path.basename(test)}.log', 'w').write(txt)
    lines.append(f'pristine-before {os.path.basename(test)} rc {rc} failed {len(failed)}')
for mid, f, a, b, test, want, keep in M:
    p = f'{S}/{f}'; s = open(p).read(); n = s.count(a)
    if n != 1:
        lines.append(f'{mid} SITE-COUNT {n} (not applied)'); continue
    open(p, 'w').write(s.replace(a, b, 1))
    rc, failed, txt = run(test); open(f'{OUT}/{mid}.log', 'w').write(txt)
    subprocess.run(['git', 'checkout', '--', f], cwd=S, check=True)
    verdict = 'RED' if hit(failed, want) else ('RED-OTHER' if failed else 'SURVIVED')
    kept = [k for k in keep if hit(failed, k)]
    extra = f' must-stay-green {keep} red {kept}' if keep else ''
    lines.append(f'{mid} {verdict} rc {rc} expected {want} failed-rows {len(failed)}{extra}')
for test in FILES:
    rc, failed, txt = run(test); open(f'{OUT}/pristine-after-{os.path.basename(test)}.log', 'w').write(txt)
    lines.append(f'pristine-after {os.path.basename(test)} rc {rc} failed {len(failed)}')
st = subprocess.run(['git', 'status', '--short'], cwd=S, capture_output=True, text=True).stdout
lines.append(f'scratch-status-lines {len(st.splitlines())}')
open(f'{OUT}/summary.txt', 'w').write('\n'.join(lines) + '\n'); print('\n'.join(lines))

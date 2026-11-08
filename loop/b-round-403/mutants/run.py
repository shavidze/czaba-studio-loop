# B round 403 -> 404 (v2 after tech-lead review): mutants on the sketch scratch (/tmp/b404-sketch, git HEAD = sketch). Each mutant: apply, run the test file, record, git checkout.
import os, subprocess, sys, re
# Env S = scratch git repo whose HEAD is the tree under test (default B's sketch); OUT = output folder (default B's evidence; C uses its own c-round-404/mutants).
S = os.environ.get('S', '/tmp/b404-sketch')
OUT = os.environ.get('OUT', '/home/runner/czaba-project/tmp/studio-real-loop/b-round-403/mutants')
os.makedirs(OUT, exist_ok=True)
CTX = 'app/contexts/ArrangementContext.tsx'
T = 'app/lib/arrangement/__tests__/actions-context.test.tsx'
M = [
 ('MU-404-ACTIONS-DEP-HISTORY', CTX, "    }),\n    [\n      addSourceToActiveTrack,\n      beginLibraryDrag,", "    }),\n    [\n      history,\n      addSourceToActiveTrack,\n      beginLibraryDrag,", 'AC1'),
 ('MU-404-ACTIONS-NO-MEMO', CTX, "    }),\n    [\n      addSourceToActiveTrack,\n      beginLibraryDrag,", "    }),\n    [\n      Math.random(),\n      addSourceToActiveTrack,\n      beginLibraryDrag,", 'AC1'),
 ('MU-404-MASTER-MUTE-DEP', CTX, "    applyEdit(setMasterMix(arrangement, { mute: !arrangement.master.mute }), MASTER_MUTE_LABEL);\n  }, [applyEdit, refuseEditDuringGesture]);", "    applyEdit(setMasterMix(arrangement, { mute: !arrangement.master.mute }), MASTER_MUTE_LABEL);\n  }, [applyEdit, refuseEditDuringGesture, history]);", 'AC2'),
 ('MU-404-ACTIONS-WRAPPER', CTX, "      toggleMasterMute,\n      togglePlayback,\n      undo,\n    }),", "      toggleMasterMute,\n      togglePlayback,\n      undo: () => undo(),\n    }),", 'AC2'),
 ('MU-404-GETARRANGEMENT-STALE', CTX, "const getArrangement = useCallback(() => historyRef.current.present, []);", "const getArrangement = useCallback(() => history.present, []);", 'AC3'),
 ('MU-404-LOOP-SPREAD', 'app/lib/arrangement/model.ts', "  patch: Partial<Pick<ArrangementTrack, 'volume' | 'mute'>>,\n): Arrangement {\n  return {\n    ...arrangement,\n", "  patch: Partial<Pick<ArrangementTrack, 'volume' | 'mute'>>,\n): Arrangement {\n  return {\n    ...arrangement,\n    loop: { ...arrangement.loop },\n", 'AC4'),
 ('MU-404-LOOP-INPLACE', 'app/lib/arrangement/model.ts', "  patch: Partial<Pick<ArrangementTrack, 'volume' | 'mute'>>,\n): Arrangement {\n  return {\n    ...arrangement,\n", "  patch: Partial<Pick<ArrangementTrack, 'volume' | 'mute'>>,\n): Arrangement {\n  if (arrangement.loop) {\n    arrangement.loop.enabled = arrangement.loop.enabled;\n  }\n  return {\n    ...arrangement,\n", 'AC4'),
 ('MU-404-TRANSITION', 'app/components/arrangement/ArrangementLoopBrace.tsx', "export function ArrangementLoopBrace(props: ArrangementLoopBraceProps) {\n", "import { useDeferredValue } from 'react';\nexport function ArrangementLoopBrace(props: ArrangementLoopBraceProps) {\n  useDeferredValue(props);\n", 'AC5'),
 ('MU-404-TRANSITION-COMMENTED', 'app/components/arrangement/ArrangementLoopBrace.tsx', "export function ArrangementLoopBrace(props: ArrangementLoopBraceProps) {\n", "// useDeferredValue is not used here\nexport function ArrangementLoopBrace(props: ArrangementLoopBraceProps) {\n", 'NONE'),
 ('MU-404-NO-THROW', CTX, "    throw new Error('useArrangementActions must be used within an ArrangementProvider');", "    console.warn('useArrangementActions must be used within an ArrangementProvider');", 'AC6'),
]
def run():
    r = subprocess.run(['npx', 'vitest', 'run', T, '--reporter=verbose'], cwd=S, capture_output=True, text=True)
    txt = re.sub(r'\x1b\[[0-9;]*m', '', r.stdout + r.stderr)
    failed = sorted(set(re.findall(r'× .*?(AC\d)', txt)))
    return r.returncode, failed, txt
lines = []
rc, failed, txt = run(); open(f'{OUT}/pristine-before.log', 'w').write(txt)
lines.append(f'pristine-before rc {rc} failed {failed}')
for mid, f, a, b, want in M:
    p = f'{S}/{f}'; s = open(p).read()
    n = s.count(a)
    if n != 1:
        lines.append(f'{mid} SITE-COUNT {n} (not applied)'); continue
    open(p, 'w').write(s.replace(a, b, 1))
    rc, failed, txt = run(); open(f'{OUT}/{mid}.log', 'w').write(txt)
    subprocess.run(['git', 'checkout', '--', f], cwd=S, check=True)
    verdict = ('GREEN-AS-EXPECTED' if not failed else 'RED-UNEXPECTED') if want == 'NONE' else ('RED' if want in failed else ('RED-OTHER' if failed else 'SURVIVED'))
    lines.append(f'{mid} {verdict} rc {rc} failed {failed} expected {want}')
rc, failed, txt = run(); open(f'{OUT}/pristine-after.log', 'w').write(txt)
lines.append(f'pristine-after rc {rc} failed {failed}')
st = subprocess.run(['git', 'status', '--short'], cwd=S, capture_output=True, text=True).stdout
lines.append(f'scratch-status-lines {len(st.splitlines())}')
open(f'{OUT}/summary.txt', 'w').write('\n'.join(lines) + '\n'); print('\n'.join(lines))

# B round 417 -> 418 mutant runner for SYS-R416-PREVIEW-CONTROLLER.
# Usage: python3 -I run.py <scratch> <bdir>
#   <scratch>: a git repo made from `git archive 061068d` (node_modules symlinked), committed, nothing applied.
#   <bdir>: a directory holding sketch-418.patch.txt; logs and summary.txt go to <bdir>/mutants/.
# Each mutant: reset scratch to its commit, apply the sketch, apply the mutation, run the stream test file,
# record which PC/PS rows are red. 'SKETCH' is the unmutated sketch (all green expected).
import os, re, subprocess, sys
scratch, bdir = sys.argv[1], sys.argv[2]
out = os.path.join(bdir, 'mutants'); os.makedirs(out, exist_ok=True)
patch = os.path.join(bdir, 'sketch-418.patch.txt')
C = 'app/contexts/ArrangementContext.tsx'
P = 'app/lib/arrangement/preview.client.ts'
TEST = 'app/lib/arrangement/__tests__/library-preview-stream.test.tsx'
def sh(cmd):
    return subprocess.run(cmd, cwd=scratch, shell=True, capture_output=True, text=True)
base = open(os.path.join(scratch, C), encoding='utf-8').read() if False else None
# HEAD-base guard: the unapplied scratch must still hold the HEAD previewRequestRef line.
sh('git checkout -q -- app && git clean -qfd -e node_modules -- app')
if 'const previewRequestRef = useRef<string | null>(null);' not in open(os.path.join(scratch, C), encoding='utf-8').read():
    sys.exit('scratch is not the HEAD base (previewRequestRef missing)')
MUTANTS = [
    ('SKETCH', []),
    ('MU-HEAD-SRC', 'revert-src'),
    ('MU-STREAM-NO-TOKEN', [(C, '        previewTokenRef.current += 1;\n        const token = previewTokenRef.current;\n        releasePreviewPin();', '        const token = previewTokenRef.current;\n        releasePreviewPin();')]),
    ('MU-SYNC-FALLBACK', [(C, '          queueMicrotask(() => {\n            if (previewTokenRef.current !== token) {', '          (() => {\n            if (previewTokenRef.current !== token) {'),
                          (C, '            startLibraryPreviewRef.current(sourceId, atSeconds);\n          });\n        });', '            startLibraryPreviewRef.current(sourceId, atSeconds);\n          })();\n        });')]),
    ('MU-FALLBACK-NO-TOKEN-CHECK', [(C, '          queueMicrotask(() => {\n            if (previewTokenRef.current !== token) {\n              return;\n            }\n', '          queueMicrotask(() => {\n')]),
    ('MU-STOP-BEFORE-OWNER', [(C, '        const owner = collectionControllerRef.current;\n        const controller = owner?.collection === collection ? owner.controller : null;\n        if (!controller) {\n          setStatus(studioLibraryStrings.sourceNotLoaded(source.title));\n          return;\n        }\n        stopLibraryPreview();\n        if (!ensureAudioContext()) {', '        stopLibraryPreview();\n        const owner = collectionControllerRef.current;\n        const controller = owner?.collection === collection ? owner.controller : null;\n        if (!controller) {\n          setStatus(studioLibraryStrings.sourceNotLoaded(source.title));\n          return;\n        }\n        if (!ensureAudioContext()) {')]),
    ('MU-DECODE-NO-TOKEN-CHECK', [(C, '          if (previewTokenRef.current !== token) {\n            return;\n          }\n          if (decodedBuffers.has(sourceId)) {', '          if (decodedBuffers.has(sourceId)) {')]),
    ('MU-SEEK-READS-ACTIVE', [(P, '          playing.restartArmedStall();\n        } catch {\n          playing.fail();', '          (active as ActiveStreamPreview).restartArmedStall();\n        } catch {\n          (active as ActiveStreamPreview).fail();')]),
    ('MU-SEEK-KEEPS-OLD-HANDLER', [(P, '        playing.setErrorHandler(onStreamError);\n', '')]),
    ('MU-STALL-READS-TWICE', [(P, '          if (now === armedAt) {\n            reportError(now);\n          }', '          if (now === armedAt) {\n            handleError();\n          }')]),
    ('MU-ERROR-RAW-READ', [(P, '        if (active === preview) {\n          reportError(readTime());\n        }', '        if (active === preview) {\n          reportError(element.currentTime);\n        }')]),
    ('MU-NEW-URL-NO-STOP', [(P, '      stopActive();\n      const element = createAudioElement();', '      const element = createAudioElement();')]),
]
summary = []
for name, edits in MUTANTS:
    sh('git checkout -q -- app && git clean -qfd -e node_modules -- app')
    r = sh(f'git apply {patch}')
    if r.returncode != 0:
        sys.exit('sketch does not apply: ' + r.stderr)
    if edits == 'revert-src':
        sh(f'git checkout -q -- {C} {P}')
    else:
        for path, old, new in edits:
            fp = os.path.join(scratch, path)
            s = open(fp, encoding='utf-8').read()
            if s.count(old) != 1:
                sys.exit(f'{name}: site not found once in {path}')
            open(fp, 'w', encoding='utf-8').write(s.replace(old, new))
    r = sh(f'timeout 600 npx vitest run {TEST} 2>&1')
    log = r.stdout + r.stderr
    open(os.path.join(out, f'{name}.log'), 'w', encoding='utf-8').write(log)
    red = sorted(set(re.findall(r'×\S*\s+(P[CS]\d+)\b', log)), key=lambda x: (x[:2], int(x[2:])))
    tests = re.search(r'Tests\s+.*', log)
    summary.append(f'{name}: red {",".join(red) if red else "none"} | {re.sub(chr(27)+r"\[[0-9;]*m", "", tests.group(0)) if tests else "no summary"}')
sh('git checkout -q -- app && git clean -qfd -e node_modules -- app')
open(os.path.join(out, 'summary.txt'), 'w', encoding='utf-8').write('\n'.join(summary) + '\n')
print('\n'.join(summary))

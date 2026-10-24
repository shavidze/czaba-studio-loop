import hashlib
import json
import re
import shutil
import subprocess
import sys

STORE = '/home/runner/czaba-project/store'
OUT = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-136'
STRINGS = 'app/lib/arrangement/strings.ts'
ROW = 'app/components/arrangement/ArrangementMarkerRow.tsx'
MENU = 'app/components/arrangement/ArrangementMarkerMenu.tsx'
TESTS = [
    'app/lib/arrangement/__tests__/strings.test.ts',
    'app/lib/arrangement/__tests__/markers-ui.test.tsx',
    'app/lib/arrangement/__tests__/marker-edge-nav-ui.test.tsx',
    'app/lib/arrangement/__tests__/markers-move-ui.test.tsx',
    'app/lib/arrangement/__tests__/status-announcement-ui.test.tsx',
    'app/lib/arrangement/__tests__/marker-strings-ui.test.tsx',
]

GEORGIAN_HINT = "'დაწკაპუნება: გადასვლა · ორმაგი დაწკაპუნება: დაკვრა აქედან · გადათრევა ან ← →: გადატანა · F2: სახელის შეცვლა · Delete: წაშლა · მარჯვენა ღილაკი ან Shift+F10: მენიუ'"

MUTATIONS = {
    'm38': [(STRINGS, 'A marker already exists at this time: “${name}”', 'A marker already exists at this time: “”')],
    'm39': [(ROW, 'direction === 1 ? studioMarkerStrings.noneAfter : studioMarkerStrings.noneBefore',
             'direction === 1 ? studioMarkerStrings.noneBefore : studioMarkerStrings.noneAfter')],
    'm40': [(ROW, 'studioMarkerStrings.added({\n          name: result.marker.name,\n          time: formatArrangementTime(result.marker.time),\n        })',
             'studioMarkerStrings.existsAtTime(result.marker.name)')],
    'm41': [(ROW, '      seekTo(target.time);\n', '      seekTo(target.time);\n      setStatus(studioMarkerStrings.noneAfter);\n')],
    'm42': [(STRINGS, '`Marker “${name}” — ${time}`', '`Marker «${name}» — ${time}`')],
    'm43': [(MENU, "{ action: 'play', label: studioMarkerStrings.menuPlay },\n  { action: 'delete', label: studioMarkerStrings.menuDelete },",
             "{ action: 'play', label: studioMarkerStrings.menuDelete },\n  { action: 'delete', label: studioMarkerStrings.menuPlay },")],
    'm44': [(ROW, 'const MARKER_FLAG_HINT = studioMarkerStrings.flagHint;', 'const MARKER_FLAG_HINT =\n  ' + GEORGIAN_HINT + ';')],
}


def sha(path):
    with open(f'{STORE}/{path}', 'rb') as handle:
        return hashlib.sha256(handle.read()).hexdigest()


def main(names):
    results = {}
    for name in names:
        edits = MUTATIONS[name]
        files = sorted({path for path, _, _ in edits})
        before = {path: sha(path) for path in files}
        for path in files:
            shutil.copyfile(f'{STORE}/{path}', f'{OUT}/mut-backup-{path.replace("/", "_")}')
        try:
            for path, old, new in edits:
                with open(f'{STORE}/{path}', encoding='utf8') as handle:
                    text = handle.read()
                assert text.count(old) == 1, (name, path, text.count(old))
                with open(f'{STORE}/{path}', 'w', encoding='utf8') as handle:
                    handle.write(text.replace(old, new))
            run = subprocess.run(
                ['npx', 'vitest', 'run', '--reporter=json', f'--outputFile={OUT}/mut-{name}.json', *TESTS],
                cwd=STORE, capture_output=True, text=True)
            with open(f'{OUT}/mut-{name}.json', encoding='utf8') as handle:
                report = json.load(handle)
            failed = []
            for suite in report['testResults']:
                for test in suite['assertionResults']:
                    if test['status'] == 'failed':
                        failed.append(suite['name'].split('__tests__/')[-1] + ' :: ' + test['title'])
            results[name] = {'exit': run.returncode, 'failed': failed,
                             'total_failed': report['numFailedTests'], 'total': report['numTotalTests']}
        finally:
            for path in files:
                shutil.copyfile(f'{OUT}/mut-backup-{path.replace("/", "_")}', f'{STORE}/{path}')
            after = {path: sha(path) for path in files}
            results.setdefault(name, {})['restored'] = after == before
            assert after == before, (name, 'restore failed')
    print(json.dumps(results, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main(sys.argv[1:] or list(MUTATIONS))

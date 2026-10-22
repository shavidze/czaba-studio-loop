import subprocess, sys, pathlib
M = pathlib.Path('/home/runner/czaba-project/tmp/studio-real-loop/a-round-86/mut/store')
S = pathlib.Path('/home/runner/czaba-project/store')
LOG = M.parent
CTX = 'app/contexts/ArrangementContext.tsx'
EXP = 'app/components/arrangement/ArrangementExportDialog.tsx'
RW = 'app/lib/arrangement/render-window.ts'
MX = 'app/lib/arrangement/__tests__/export-mp3.test.tsx'
RWT = 'app/lib/arrangement/__tests__/render-window.test.ts'
XU = 'app/lib/arrangement/__tests__/export-range-ui.test.tsx'
FO = 'app/lib/arrangement/__tests__/export-dialog-focus.test.tsx'
muts = {
 'a-no-timeout-race': (CTX, [('() => resolve(false),', '() => undefined,')], [MX]),
 'b-wav-before-conversion': (CTX, [
   ("      setExportState({\n        phase: 'rendering',\n        message: 'MP3 encoder", "      if (options?.includeWav) {\n        const early = document.createElement('a');\n        early.href = URL.createObjectURL(rendered.blob);\n        early.download = renderWindow ? 'czaba-studio-lab-range.wav' : 'czaba-studio-lab.wav';\n        document.body.appendChild(early);\n        early.click();\n        early.remove();\n      }\n      setExportState({\n        phase: 'rendering',\n        message: 'MP3 encoder"),
   ('...(options?.includeWav\n', '...(false\n')], [MX]),
 'c-mp3-name-ignores-range': (CTX, [("name: renderWindow ? 'czaba-studio-lab-range.mp3' : 'czaba-studio-lab.mp3',", "name: 'czaba-studio-lab.mp3',")], [MX]),
 'd-format-not-reset': (EXP, [("      setExportFormat('wav');\n", '')], [MX]),
 'e-project-radio-disabled': (EXP, [('checked={!isRangeScope}\n                disabled={isRendering}', 'checked={!isRangeScope}\n                disabled={!hasValidRange || isRendering}')], [MX, FO]),
 'f-describedby-removed': (EXP, [('                aria-describedby={hasValidRange ? undefined : rangeReasonId}\n', '')], [MX]),
 'g-strict-normalises-inverted': (RW, [('renderWindow.end - renderWindow.start >= ARRANGEMENT', 'Math.abs(renderWindow.end - renderWindow.start) >= ARRANGEMENT')], [RWT, XU]),
 'h-load-on-dialog-open': (EXP, [("    if (!isOpen) {\n      setScopeChoice(null);", "    if (isOpen) {\n      void import('~/utils/ffmpeg').then((encoder) => encoder.loadFFmpeg());\n    }\n    if (!isOpen) {\n      setScopeChoice(null);")], [MX]),
 'j-timer-not-cleared': (CTX, [('        window.clearTimeout(loadTimer);\n', '        void loadTimer;\n')], [MX]),
 'k-wav-file-gets-mp3-blob': (CTX, [('                  blob: rendered.blob,\n', '                  blob: mp3Blob,\n')], [MX]),
 'i-bitrate-argument': (CTX, [('encoder.convertWavToMp3(rendered.blob)', "encoder.convertWavToMp3(rendered.blob, '320k')")], [MX]),
}
only = sys.argv[1:]
summary = []
for name, (path, reps, tests) in muts.items():
    if only and name not in only: continue
    target = M / path
    original = (S / path).read_text()
    mutated = original
    for old, new in reps:
        assert mutated.count(old) == 1, (name, old[:40], mutated.count(old))
        mutated = mutated.replace(old, new)
    for t in tests + [path]:
        (M / t).write_text((S / t).read_text())
    target.write_text(mutated)
    try:
        r = subprocess.run(['npx', 'vitest', 'run', *tests], cwd=M, capture_output=True, text=True, timeout=900)
        out = r.stdout + r.stderr
        (LOG / f'{name}.log').write_text(out)
        failed = [l.strip() for l in out.splitlines() if '×' in l]
        summary.append(f"{name}: exit={r.returncode} red={len(failed)} :: " + ' | '.join(failed[:4]))
    finally:
        target.write_text(original)
    assert target.read_text() == original
print('\n'.join(summary))
(LOG / 'summary.txt').write_text('\n'.join(summary) + '\n')

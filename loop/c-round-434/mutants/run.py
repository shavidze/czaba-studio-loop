# Round 434 mutants (SABA-B-12 stage 3b, dialog scrollbar). usage: python3 -I run.py <base dir = HEAD + sketch-434 applied, node_modules linked> <out dir>
# Writes <out>/<name>.log and <out>/summary.txt; restores every touched file after every mutant.
import os, re, subprocess, sys
base, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
MODAL = 'app/components/ui/Modal.tsx'
SKIN = 'app/components/arrangement/studio-scrollbar.ts'
SHEET = 'app/components/arrangement/ArrangementShortcutSheet.tsx'
EXP = 'app/components/arrangement/ArrangementExportDialog.tsx'
LEGACY = 'app/components/studio/ExportDialog.tsx'
FILES = [MODAL, SKIN, SHEET, EXP, LEGACY]
TESTS = ['app/lib/arrangement/__tests__/studio-dialog-scrollbar.test.tsx']
good = {f: open(os.path.join(base, f), encoding='utf-8').read() for f in FILES}
PROP = '      scrollbarClassName={STUDIO_DIALOG_SCROLLBAR_CLASS}\n'
R = [
 ('M1-modal-ignores-prop', {MODAL: [("            scrollbarClassName,\n", "            'styled-scrollbar',\n")]}),
 ('M2-sheet-no-prop', {SHEET: [(PROP, '')]}),
 ('M3-export-no-prop', {EXP: [(PROP, '')]}),
 ('M4-styled-kept-plus-skin', {MODAL: [("'w-full mx-4 max-h-[90vh] overflow-auto overscroll-contain',", "'w-full mx-4 max-h-[90vh] overflow-auto overscroll-contain styled-scrollbar',")]}),
 ('M5-dialog-skin-keeps-gutter', {SKIN: [("export const STUDIO_DIALOG_SCROLLBAR_CLASS = [\n", "export const STUDIO_DIALOG_SCROLLBAR_CLASS = [\n  '[scrollbar-gutter:stable]',\n")]}),
 ('M6-lane-skin-loses-gutter', {SKIN: [("  '[scrollbar-gutter:stable]',\n  STUDIO_DIALOG_SCROLLBAR_CLASS,", "  STUDIO_DIALOG_SCROLLBAR_CLASS,")]}),
 ('M7-store-default-changed', {MODAL: [("scrollbarClassName = 'styled-scrollbar',", "scrollbarClassName = '',")]}),
 ('M8-legacy-opts-in', {LEGACY: [('    <Modal\n', '    <Modal scrollbarClassName="x"\n')]}),
 ('sketch-green', {}),
]
ansi = re.compile(r'\x1b\[[0-9;]*m')
lines = []
try:
    for name, edits in R:
        for f in FILES:
            src = good[f]
            for o, n in edits.get(f, []):
                assert src.count(o) == 1, (name, f, o[:40])
                src = src.replace(o, n)
            open(os.path.join(base, f), 'w', encoding='utf-8').write(src)
        p = subprocess.run(['npx', 'vitest', 'run', *TESTS], cwd=base, capture_output=True, text=True)
        log = ansi.sub('', p.stdout + p.stderr)
        open(os.path.join(out, name + '.log'), 'w', encoding='utf-8').write(log)
        red = sorted({m for l in log.splitlines() if re.match(r'^\s*×', l) for m in re.findall(r'\b(DS[0-9])\b', l)})
        tot = next((re.sub(r'\s*\(.*', '', l).strip() for l in log.splitlines() if re.match(r'^\s+Tests ', l)), 'no-tests-line')
        lines.append(f"{name} red: {' '.join(red) if red else 'none'} | {tot}")
finally:
    for f in FILES:
        open(os.path.join(base, f), 'w', encoding='utf-8').write(good[f])
open(os.path.join(out, 'summary.txt'), 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
print('\n'.join(lines))

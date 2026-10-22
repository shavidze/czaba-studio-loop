import subprocess, pathlib
M = pathlib.Path('/home/runner/czaba-project/tmp/studio-real-loop/a-round-83/mut/store')
S = pathlib.Path('/home/runner/czaba-project/store')
UI='app/components/arrangement/ArrangementClipEnvelope.tsx'; AC='app/components/arrangement/ArrangementClip.tsx'
EU='app/lib/arrangement/__tests__/clip-envelope-ui.test.tsx'
muts = {
 'k-line-hidden-when-points-outside': [(UI, "if ((clip.envelope?.length ?? 0) === 0 && !editing) {", "if (points.length === 0 && !editing) {")],
 'l-cancelled-fade-drag-does-not-arm': [(AC, "if (fadeEdge && gesture.moved) {", "if (fadeEdge && gesture.moved && false) {"), (AC, "      if (gesture.moved) {\n        lastFadeDragRef.current", "      if (gesture.moved && event.type !== 'pointercancel') {\n        lastFadeDragRef.current")],
 'm-editor-ignores-modifiers': [(UI, "    if (event.ctrlKey || event.metaKey) {\n      toggleClipSelection(clip.id, 'toggle');\n      return;\n    }\n", "")],
}
(M / EU).write_text((S / EU).read_text())
out=[]
for name, reps in muts.items():
    touched = {p for p,_,_ in reps}
    originals = {p: (S / p).read_text() for p in touched}
    texts = dict(originals)
    for p, a, b in reps:
        assert texts[p].count(a) == 1, (name, a)
        texts[p] = texts[p].replace(a, b)
    for p in touched: (M / p).write_text(texts[p])
    try:
        r = subprocess.run(['npx','vitest','run',EU], cwd=M, capture_output=True, text=True, timeout=600)
        log = r.stdout + r.stderr
        (M.parent / f'{name}.log').write_text(log)
        red = [l.strip() for l in log.splitlines() if '×' in l]
        out.append(f"{name}: exit={r.returncode} red={len(red)} :: " + ' | '.join(red[:3]))
    finally:
        for p in touched: (M / p).write_text(originals[p])
print('\n'.join(out))
with open(M.parent / 'summary.txt', 'a') as fh: fh.write('\n'.join(out) + '\n')

import sys
root=sys.argv[1]
f=root+'/app/lib/arrangement/__tests__/render-budget.test.tsx'; s=open(f).read()
o="    const detailPlayhead = view.getByTestId('arrangement-detail-playhead');\n    renderLog.counts.clear();\n"
assert s.count(o)==1
s=s.replace(o,"    const detailPlayhead = view.getByTestId('arrangement-detail-playhead');\n    console.log('NAMELIVE R11-P1e', JSON.stringify([...renderLog.counts].filter(([k]) => k.endsWith('Inner'))));\n    renderLog.counts.clear();\n"); open(f,'w').write(s)
f=root+'/app/lib/arrangement/__tests__/clip-gain-pointer-preview.test.tsx'; s=open(f).read()
o="    pressFader(fader(), 21);\n    renderLog.counts.clear();\n    const deltas = [-5, -10, -15, -20];"
assert s.count(o)==1
s=s.replace(o,"    pressFader(fader(), 21);\n    console.log('NAMELIVE CP1-setup', JSON.stringify([...renderLog.counts].filter(([k]) => k.endsWith('Inner'))));\n    renderLog.counts.clear();\n    const deltas = [-5, -10, -15, -20];"); open(f,'w').write(s)
print('ok')

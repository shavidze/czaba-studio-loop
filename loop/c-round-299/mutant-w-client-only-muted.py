import sys
p = sys.argv[1] + '/app/components/arrangement/ArrangementVideoDock.tsx'
s = open(p).read()
lines = s.split('\n')
idx = [i for i, l in enumerate(lines) if l.strip() == 'muted']
assert len(idx) == 2, idx
i = idx[1]
lines[i] = lines[i].replace('muted', 'muted={document.body.childElementCount > 0}')
open(p, 'w').write('\n'.join(lines)); print('mutant w (C): standby <video> muted only on the client; helper must not hide it')

#!/usr/bin/env bash
# C328 own mutants on a scratch copy. usage: c-mutants.sh <scratch>
set -u; S=$1; cd "$S"
C=app/contexts/ArrangementContext.tsx; T=app/lib/arrangement/__tests__/drag-preview-render.test.tsx
cp $C /tmp/c328-ctx.bak
run() { echo "== $1"; timeout 600 npx vitest run $T app/lib/arrangement/__tests__/status-preview-store.test.ts 2>&1 | grep -E "FAIL .*>|Tests " | sed 's/\x1b\[[0-9;]*m//g'; cp /tmp/c328-ctx.bak $C; }
python3 - $C <<'P'
import sys;p=sys.argv[1];s=open(p).read()
o="    committedStatusTextRef.current = status;\n"
assert s.count(o)==1; s=s.replace(o,"");open(p,'w').write(s)
P
run C-MU-NO-COMMITTED-SYNC
python3 - $C <<'P'
import sys;p=sys.argv[1];s=open(p).read()
o="    if (pending && pending.sequence <= adoptedPreviewSequenceRef.current) {"
assert s.count(o)==1; s=s.replace(o,"    if (pending) {");open(p,'w').write(s)
P
run C-MU-CLEAR-ANY-PREVIEW
echo "== restored"; cmp $C /home/runner/czaba-project/store/$C && echo CTX_EQ_STORE; timeout 600 npx vitest run $T app/lib/arrangement/__tests__/status-preview-store.test.ts 2>&1 | grep -E "Tests " | sed 's/\x1b\[[0-9;]*m//g'

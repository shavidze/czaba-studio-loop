#!/usr/bin/env bash
# B327 jsdom mutants on a scratch copy (never in store/). usage: run-mutants.sh <scratch-root>
set -u
S=${1:-/home/runner/b327-scratch}; cd "$S"
C=app/contexts/ArrangementContext.tsx; T=app/lib/arrangement/__tests__/drag-preview-render.test.tsx
cp $C /tmp/b327-ctx.bak
run() { echo "== $1"; timeout 600 npx vitest run $T app/lib/arrangement/__tests__/status-preview-store.test.ts 2>&1 | grep -E "^ +(×|✗)|FAIL .*>|Tests " | sed 's/\x1b\[[0-9;]*m//g'; cp /tmp/b327-ctx.bak $C; }
python3 - $C <<'P'
import sys;p=sys.argv[1];s=open(p).read()
o="    adoptedPreviewSequenceRef.current = pending.sequence;\n"
assert o in s; s=s.replace(o,o+"    statusPreviewStore.getState().clearPreview();\n");open(p,'w').write(s)
P
run MU-SYNC-CLEAR
python3 - $C <<'P'
import sys;p=sys.argv[1];s=open(p).read()
o="      if (pending === null && text === committedStatusTextRef.current) {"
assert o in s; s=s.replace(o,"      if (false) {");open(p,'w').write(s)
P
run MU-NO-SAME-TEXT-GUARD
python3 - $C <<'P'
import sys;p=sys.argv[1];s=open(p).read()
o="    if (!pending || pending.sequence <= adoptedPreviewSequenceRef.current) {"
assert o in s; s=s.replace(o,"    if (!pending) {");open(p,'w').write(s)
P
run MU-READOPT
python3 - $C <<'P'
import sys;p=sys.argv[1];s=open(p).read()
o="    if (pending && pending.sequence <= adoptedPreviewSequenceRef.current) {\n      statusPreviewStore.getState().clearPreview();"
assert o in s; s=s.replace(o,"    if (false) {\n      statusPreviewStore.getState().clearPreview();");open(p,'w').write(s)
P
run MU-NO-LAYOUT-CLEAR
echo "== restored"; timeout 600 npx vitest run $T app/lib/arrangement/__tests__/status-preview-store.test.ts 2>&1 | grep -E "Tests " | sed 's/\x1b\[[0-9;]*m//g'

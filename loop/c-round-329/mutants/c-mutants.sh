#!/usr/bin/env bash
# C329 own mutants. Usage: c-mutants.sh <scratch>
set -u
S="$1"; cd "$S" || exit 2
T=app/lib/arrangement/__tests__/drag-preview-render.test.tsx
W=app/components/arrangement/StudioWorkspace.tsx
R=app/components/arrangement/ArrangementTransport.tsx
run() { timeout 600 npx vitest run "$T" 2>&1 | grep -E "^.*(×|Tests )" | sed 's/\x1b\[[0-9;]*m//g'; }
mut() {
  local name="$1" file="$2"; cp "$file" "$file.orig"
  OLD="$3" NEW="$4" python3 -I -c "
import os,sys
p=sys.argv[1]; s=open(p).read(); o=os.environ['OLD']; n=os.environ['NEW']
c=s.count(o)
if c!=1: print('MUTANT-APPLY-FAIL count',c); sys.exit(3)
open(p,'w').write(s.replace(o,n))" "$file" || { mv "$file.orig" "$file"; echo "== $name: NOT APPLIED"; return; }
  echo "== $name"; run; mv "$file.orig" "$file"
}
mut C-MU-ENDTEXT-COMMITTED "$R" "  return <span data-testid=\"arrangement-project-end\">{formatArrangementTime(projectEnd)}</span>;" "  return <span data-testid=\"arrangement-project-end\">{formatArrangementTime(committedProjectEnd + projectEnd * 0)}</span>;"
mut C-MU-OVERVIEW-NO-LOOP "$W" "      extent={timelineExtent(projectEnd, arrangement.loop)}" "      extent={timelineExtent(projectEnd, null)}"
echo "== restored"; run

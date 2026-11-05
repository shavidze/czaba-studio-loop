#!/usr/bin/env bash
# Round 356 claims: PERF-CAND-VIDEO-MOVE-BUDGET (budgets-only + doc 232). Run from the loop root.
# CLAIMS_STORE may point at another tree (B's sketch /home/runner/b355-scratch/sc; K2/K7 read no-git there).
L=$(pwd); S=${CLAIMS_STORE:-/home/runner/czaba-project/store}
BJ=$S/perf/budgets.interactions.json
SPEC=$S/perf/studio-lab-interactions.perf.spec.ts
DOCK=$S/app/components/arrangement/ArrangementVideoDock.tsx
CTX=$S/app/contexts/ArrangementContext.tsx
D232=$S/docs/implementation/2026/quarter-IV/232-perf-drag-preview.md
c() { local n; n=$(grep -c -- "$1" "$2" 2>/dev/null); echo "${n:-0}"; }
echo "K1 $(python3 -I -c "import json;a=json.load(open('gates/gate-round-355.json'));print(a['status'],a['commit'][:7])")"
echo "K2 $(git -C $S rev-parse --short HEAD 2>/dev/null || echo no-git) $(git -C $S status --short --untracked-files=all 2>/dev/null | wc -l) outside-root-lanes-since-6588f08 $(git -C $S diff --name-only 6588f08 HEAD 2>/dev/null | grep -v '^app/components/studio/export/\|^app/components/studio/StudioToolbar.tsx$\|^docs/' | wc -l)"
echo "K3 $(python3 -I - "$BJ" <<'PY'
import json, sys
rows = json.load(open(sys.argv[1], encoding='utf-8'))
by = {r['id']: r for r in rows}
def f(i):
    r = by[i]; b = r['budget']
    return f"{r['mode']}/{r['kind']}/{(b['op'] + str(b['value'])) if b else 'none'}/{r['owner']}"
out = [f"rows {len(rows)}", f"assert {sum(r['mode'] == 'assert' for r in rows)}"]
for s in ('stopped.move-components-per-move', 'stopped.move-components-max', 'playing.move-components-max', 'playing.move-components-per-move'):
    out.append(f"video.{s} {f('interact.drag.video.' + s)}")
out.append(f"assert-notes-with-record-until {sum(1 for r in rows if r['mode'] == 'assert' and 'Record until' in (r.get('note') or ''))}")
out.append(f"notes-with-record-until-any {sum(1 for r in rows if 'Record until' in (r.get('note') or ''))}")
out.append(f"owner-video-move-budget {sum(1 for r in rows if r['owner'] == 'PERF-CAND-VIDEO-MOVE-BUDGET')}")
out.append(f"audio-move-max {by['interact.drag.move.stopped.move-components-max']['mode']}/{by['interact.drag.move.playing.move-components-max']['mode']}")
print(' '.join(out))
PY
) sha $(sha256sum $BJ | cut -c1-16)"
echo "K4 dock-sha $(sha256sum $DOCK | cut -c1-16) ctx-sha $(sha256sum $CTX | cut -c1-16)"
echo "K5 doc232 h2 $(c '^## ' $D232) pass-356 $(c 'dp-test-polish, video-move-budget; C round 356 PASS)' $D232) pass-355-left $(c 'dp-test-polish; C round 355 PASS)' $D232) section $(c '^### ეტაპი video-move-budget' $D232) d1147 $(c 'D-29z1147' $D232) pending-any-impl-docs $(grep -rl 'C round [0-9]* pending' $S/docs/implementation 2>/dev/null | wc -l) inprogress-stage-docs $(grep -rl 'In Progress (stage' $S/docs/implementation 2>/dev/null | wc -l)"
echo "K6 $(cd $S && sha256sum -c $L/b-round-318/protected-sha256.txt 2>/dev/null | grep -c ': OK$')"
echo "K7 diff-lines-outside-2 $(git -C $S diff --stat HEAD -- app perf e2e docs scripts 2>/dev/null | grep -v 'budgets.interactions.json\|232-perf-drag-preview.md\|files changed\|file changed' | wc -l) untracked $(git -C $S status --short --untracked-files=all 2>/dev/null | grep -c '^??')"
echo "K8 $(python3 -I -c "import json;print(json.load(open('regression-last.json'))['date'])")"
echo "K9 spec-sha $(sha256sum $SPEC | cut -c1-16) spec-reads-note $(c '\.note\b' $SPEC) lib-reads-note $(grep -rlE '\.note\b|\bnote:' $S/perf/lib 2>/dev/null | wc -l) lib-reads-owner $(grep -rlE '\.owner\b' $S/perf/lib 2>/dev/null | wc -l)"
echo "K10 budgets.patch-sha $(sha256sum $L/b-round-355/sketch/budgets.patch.txt | cut -c1-16) doc-patch-sha $(sha256sum $L/b-round-355/sketch/doc232.patch.txt | cut -c1-16)"
echo "K11 cited $(n=0; m=0; while read -r f; do n=$((n+1)); [ -f "$L/$f" ] || { m=$((m+1)); echo -n "MISSING:$f "; }; done < $L/b-round-355/cited-artifacts.txt; echo "$n listed, $m missing")"

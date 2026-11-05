#!/usr/bin/env bash
# B round 354 -> 355: mutant runs on the scratch tree. usage: run-mutants.sh <scratch> <outdir>
set -u
S=$1; O=$2; L=/home/runner/czaba-project/tmp/studio-real-loop
T=app/lib/arrangement/__tests__/drag-preview-render.test.tsx
D=app/components/arrangement/ArrangementVideoDock.tsx
C=app/contexts/ArrangementContext.tsx
cd "$S" || exit 2
cp $D /tmp/b354-dock.orig; cp $C /tmp/b354-ctx.orig; cp $T /tmp/b354-test.orig
restore() { cp /tmp/b354-dock.orig $D; cp /tmp/b354-ctx.orig $C; cp /tmp/b354-test.orig $T; }
late() { python3 -I - "$D" <<'PY'
import sys
p=sys.argv[1]; s=open(p).read()
old="""      waitForVideoSeekIdle(video, controller.signal)
        .then(() => seekSfxVideo(video, target.mediaTime, controller.signal))
        .catch(() => undefined);"""
new="""      window.setTimeout(() => {
        waitForVideoSeekIdle(video, controller.signal)
          .then(() => seekSfxVideo(video, target.mediaTime, controller.signal))
          .catch(() => undefined);
      }, 200);"""
assert s.count(old)==1; open(p,'w').write(s.replace(old,new))
PY
}
shortdrag() { python3 -I - "$T" <<'PY'
import sys
p=sys.argv[1]; s=open(p).read()
old="    pointerMoveTo(root, 10, pressX + 40, 50);\n    const shown = previewOf(api);"
new="    pointerMoveTo(root, 10, pressX + 0.3, 50);\n    const shown = previewOf(api);"
assert s.count(old)==1; s=s.replace(old,new)
s=s.replace("pointerUpAt(root, 10, pressX + 40, 50);","pointerUpAt(root, 10, pressX + 0.3, 50);")
open(p,'w').write(s)
PY
}
run() { # name testvariant
  local name=$1 variant=$2
  [ "$variant" = head ] && cp $O/drag-preview-render.test.head.tsx $T
  [ "$variant" = sketch ] && cp $O/drag-preview-render.test.sketch355.tsx $T
  case $name in
    control) ;;
    M-B1) patch -s $D < $L/b-round-351/mutant-M-B1.diff.txt ;;
    M-B1-LATE) patch -s $D < $L/b-round-351/mutant-M-B1.diff.txt; late ;;
    M-B3) patch -s $D < $L/a-round-350/mutant-M-B3.diff.txt ;;
    M-B4) patch -s $D < $L/a-round-350/mutant-M-B4.diff.txt ;;
    M-B6) patch -s $C < $L/b-round-351/mutant-M-B6.diff.txt ;;
    M-B7) patch -s $D < $L/b-round-351/mutant-M-B7.diff.txt ;;
    A-M5) patch -s $D < $L/b-round-350/mutant-A-M5.diff.txt ;;
    M-B8) patch -s $D < $L/b-round-354/sketch/mutant-M-B8.diff.txt ;;
    M-B9) patch -s $D < $L/b-round-354/sketch/mutant-M-B9.diff.txt ;;
    FX-SHORTDRAG) shortdrag ;;
  esac
  npx vitest run $T --reporter=json --outputFile=$O/mut-$name-$variant.json > $O/mut-$name-$variant.log 2>&1
  python3 -I - "$O/mut-$name-$variant.json" "$name" "$variant" >> $O/mutant-summary.txt <<'PY'
import json,sys,re
r=json.load(open(sys.argv[1]))
t=[a for f in r['testResults'] for a in f['assertionResults']]
bad=[a for a in t if a['status']!='passed']
out=[]
for a in bad:
    m=a['failureMessages'][0] if a['failureMessages'] else ''
    line=re.search(r'drag-preview-render\.test\.tsx:(\d+):',m)
    first=m.splitlines()[0][:110] if m else ''
    out.append(f"{a['title'].split(' ')[0]}@l.{line.group(1) if line else '?'} [{first}]")
print(f"{sys.argv[2]} {sys.argv[3]}: total {len(t)} passed {len(t)-len(bad)} red {len(bad)}: " + ('; '.join(out) if out else 'none'))
PY
  restore
}
: > $O/mutant-summary.txt
for m in M-B1-LATE; do
  for v in sketch head; do run $m $v; done
done
restore
sha256sum $D $C $T > $O/scratch-after.sha256

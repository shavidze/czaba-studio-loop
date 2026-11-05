#!/usr/bin/env bash
# B344 unit mutants on the final sketch. Usage: bash run-unit-mutants.sh <scratch-tree> <out-dir>. Never the store tree (refused). Restores the files after each mutant.
set -u
T=$1; O=$2; D=app/components/arrangement; TEST=app/lib/arrangement/__tests__/drag-preview-render.test.tsx
mkdir -p "$O" || exit 2
case "$T" in /home/runner/czaba-project/store|/home/runner/czaba-project/store/) echo "refusing to mutate the store tree; use a scratch copy" >&2; exit 2;; esac
cd "$T" || exit 2
cp $D/ArrangementClip.tsx /tmp/b344m-clip && cp $D/ArrangementVideoDock.tsx /tmp/b344m-dock
run() { timeout 900 npx vitest run $TEST 2>&1 | sed 's/\x1b\[[0-9;]*m//g' | grep -E '×|Tests ' > "$O/unit-mut-$1.log"; cp /tmp/b344m-clip $D/ArrangementClip.tsx; cp /tmp/b344m-dock $D/ArrangementVideoDock.tsx; echo "== $1"; cat "$O/unit-mut-$1.log"; }
git -C /home/runner/czaba-project/store show c79642c:$D/ArrangementClip.tsx > $D/ArrangementClip.tsx
git -C /home/runner/czaba-project/store show c79642c:$D/ArrangementVideoDock.tsx > $D/ArrangementVideoDock.tsx
run head-source
python3 -I - <<'PY'
import pathlib
p = pathlib.Path('app/components/arrangement/ArrangementVideoDock.tsx'); t = p.read_text()
for a, b in [('resolveVideoTarget(videoLaneArrangement,', 'resolveVideoTarget(arrangement,'), ('<ArrangementVideoFadeOverlay arrangement={videoLaneArrangement} />', '<ArrangementVideoFadeOverlay arrangement={arrangement} />'), ('<ArrangementVideoGapCaption arrangement={videoLaneArrangement} />', '<ArrangementVideoGapCaption arrangement={arrangement} />')]:
    assert t.count(a) == 1, a
    t = t.replace(a, b)
p.write_text(t)
PY
run dock-committed
python3 -I - <<'PY'
import pathlib
p = pathlib.Path('app/components/arrangement/ArrangementVideoDock.tsx'); t = p.read_text()
a = '  const videoLaneClips = useArrangementPreviewLaneClips(arrangement, videoTrackId);\n'
assert t.count(a) == 1
t = t.replace(a, '  const videoLaneClips = useArrangementPreview((state) => state.preview ?? arrangement).clips.filter(\n    (clip) => clip.trackId === videoTrackId,\n  );\n')
t = t.replace('  useArrangementPreviewLaneClips,\n', '  useArrangementPreview,\n  useArrangementPreviewLaneClips,\n', 1)
p.write_text(t)
PY
run dock-whole-preview
python3 -I - <<'PY'
import pathlib
p = pathlib.Path('app/components/arrangement/ArrangementClip.tsx'); t = p.read_text()
a = '      if (previewStatus) {\n'
assert t.count(a) == 1
p.write_text(t.replace(a, '      if (previewStatus && !isVideo) {\n'))
PY
run fade-status-committed
cmp $D/ArrangementClip.tsx /tmp/b344m-clip && cmp $D/ArrangementVideoDock.tsx /tmp/b344m-dock && echo restored

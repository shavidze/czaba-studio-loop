#!/bin/bash
# usage: run-mutants.sh <tree> <label> <logdir>   (scratch copies only; each mutant is restored after its run)
# One line per (mutant, suite): {"id","tree","suite","rc","fails"}; fails = red test titles (first 50 chars) read from the log.
T=$1; LBL=$2; LOG=$3; X=app/lib/arrangement/__tests__; mkdir -p "$LOG"
OV=app/components/arrangement/ArrangementOverview.tsx; DLG=app/components/arrangement/ArrangementExportDialog.tsx
m() { id=$1; file=$2; old=$3; new=$4; shift 4
  cp "$T/$file" "$T/$file.orig"
  if ! python3 -I -c "import sys;p,o,n=sys.argv[1:4];s=open(p,encoding='utf-8').read();assert s.count(o)==1,('miss',o);open(p,'w',encoding='utf-8').write(s.replace(o,n,1))" "$T/$file" "$old" "$new" 2>/dev/null; then
    for suite in "$@"; do echo "{\"id\":\"$id\",\"tree\":\"$LBL\",\"suite\":\"$suite\",\"rc\":\"apply-failed\",\"fails\":[]}"; done
    mv "$T/$file.orig" "$T/$file"; return; fi
  for suite in "$@"; do
    (cd "$T" && npx vitest run $X/$suite > "$LOG/$id-$LBL-$suite.log" 2>&1); rc=$?
    fails=$(python3 -I -c "import re,sys,json;t=re.sub(r'\x1b\[[0-9;]*m','',open(sys.argv[1],encoding='utf-8',errors='replace').read());print(json.dumps(sorted({l.split(' > ')[-1].strip()[:50] for l in t.splitlines() if l.startswith(' FAIL ') and ' > ' in l})))" "$LOG/$id-$LBL-$suite.log")
    echo "{\"id\":\"$id\",\"tree\":\"$LBL\",\"suite\":\"$suite\",\"rc\":$rc,\"fails\":$fails}"
  done
  mv "$T/$file.orig" "$T/$file"; }
# O1: outline overlay loses rounded-panel (radius regression)
m O1-OUTLINE-RADIUS $OV 'absolute inset-0 rounded-panel border border-outline' 'absolute inset-0 rounded-sm border border-outline' studio-theme-obsidian.test.tsx panel-radius-ui.test.tsx
# O2: outline overlay tokens reordered (no behaviour change)
m O2-OUTLINE-REORDER $OV 'absolute inset-0 rounded-panel border border-outline' 'absolute inset-0 border border-outline rounded-panel' studio-theme-obsidian.test.tsx
# O3: outline overlay loses border-outline (colour regression)
m O3-OUTLINE-NO-BORDER-COLOUR $OV 'absolute inset-0 rounded-panel border border-outline' 'absolute inset-0 rounded-panel border' panel-radius-ui.test.tsx
# D1: a new overlay div is inserted before the lanes container (GATE173 retarget case)
m D1-DECOY-BEFORE-LANES $OV '      <div
        className="pointer-events-none absolute inset-x-0 inset-y-1 flex flex-col gap-0.5"' '      <div className="pointer-events-none absolute inset-0" />
      <div
        className="pointer-events-none absolute inset-x-0 inset-y-1 flex flex-col gap-0.5"' panel-radius-ui.test.tsx content-colour-ui.test.tsx
m D1H-DECOY-BEFORE-LANES $OV '      <div className="pointer-events-none absolute inset-x-0 inset-y-1 flex flex-col gap-0.5">' '      <div className="pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 inset-y-1 flex flex-col gap-0.5">' panel-radius-ui.test.tsx content-colour-ui.test.tsx
# B1: clip bars lose rounded-xs
m B1-BAR-RADIUS $OV "'absolute inset-y-0 rounded-xs'," "'absolute inset-y-0 rounded-sm'," panel-radius-ui.test.tsx
# B2: first audio ladder token changes
m B2-BAR-LADDER $OV "const OVERVIEW_AUDIO_BAR_CLASSES = ['bg-foreground/80'," "const OVERVIEW_AUDIO_BAR_CLASSES = ['bg-brand/80'," content-colour-ui.test.tsx
# B3: lanes rendered in reverse order
m B3-LANE-ORDER $OV '        {arrangement.tracks.map((track) => (' '        {[...arrangement.tracks].reverse().map((track) => (' content-colour-ui.test.tsx
# H1: the bar hook is removed (sketch-only hook must be load-bearing)
m H1-BAR-HOOK-REMOVED $OV '                  data-overview-bar={clip.id}
' '' panel-radius-ui.test.tsx content-colour-ui.test.tsx
# U1: the dialog uses a track-only rule (not group-aware)
m U1-DIALOG-NOT-GROUP-AWARE $DLG 'const isVideoAudible = videoTrack ? isTrackAudibleWithGroups(videoTrack, arrangement) : false;' 'const isVideoAudible = videoTrack ? !videoTrack.mute && isTrackAudibleWithGroups(videoTrack, { ...arrangement, groups: [] }) : false;' track-group-mix-ui.test.tsx
# U2: the dialog swaps Included and Off (source text unchanged)
m U2-DIALOG-STATUS-SWAP $DLG 'return isAudible ? studioExportStrings.videoSoundIncluded : studioExportStrings.videoSoundOff;' 'return isAudible ? studioExportStrings.videoSoundOff : studioExportStrings.videoSoundIncluded;' track-group-mix-ui.test.tsx

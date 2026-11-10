#!/bin/bash
# usage: run-mutants.sh <tree> <label> <logdir>  (scratch copies only; each mutant restored after its run)
T=$1; LBL=$2; LOG=$3; X=app/lib/arrangement/__tests__
m() { id=$1; file=$2; old=$3; new=$4; suite=$5
  cp "$T/$file" "$T/$file.orig"
  python3 -I -c "import sys;p,o,n=sys.argv[1:4];s=open(p,encoding='utf-8').read();assert s.count(o)>=1,('miss',o);open(p,'w',encoding='utf-8').write(s.replace(o,n,1))" "$T/$file" "$old" "$new" || { echo "{\"id\":\"$id\",\"tree\":\"$LBL\",\"rc\":\"apply-failed\"}"; mv "$T/$file.orig" "$T/$file"; return; }
  (cd $T && npx vitest run $X/$suite > $LOG/$id-$LBL.log 2>&1); rc=$?
  mv "$T/$file.orig" "$T/$file"
  echo "{\"id\":\"$id\",\"tree\":\"$LBL\",\"suite\":\"$suite\",\"rc\":$rc}"; }
C=app/components/arrangement
m S1-START-NOT-SANS $C/ArrangementDetailPanel.tsx '<span className="font-sans text-dim">{studioDetailStrings.startLabel}' '<span className="text-dim">{studioDetailStrings.startLabel}' detail-panel-polish.test.tsx
m S2-LABEL-RENAMED app/lib/arrangement/strings.ts "sourceOffsetLabel: 'Clip origin'," "sourceOffsetLabel: 'Source offset'," detail-panel-strings-ui.test.tsx
m S3-TRACK-NOT-DIM $C/ArrangementDetailPanel.tsx '<span className="text-dim">{studioDetailStrings.trackLabel}' '<span className="text-muted">{studioDetailStrings.trackLabel}' detail-panel-strings-ui.test.tsx
m S4-TRACKS-NOT-DIM $C/ArrangementDetailPanel.tsx '<span className="text-dim">{studioDetailStrings.tracksLabel}' '<span className="text-muted">{studioDetailStrings.tracksLabel}' detail-panel-strings-ui.test.tsx
m S5-LANE-NAME-NOT-FOREGROUND $C/ArrangementLibraryPreview.tsx '        <span className="text-foreground">
          {activeLaneName}' '        <span className="text-muted">
          {activeLaneName}' library-preview.test.tsx
m S6-DURATION-NOT-MONO $C/ArrangementLibrary.tsx '<span className="font-mono">{formatArrangementTime(state.duration)}' '<span>{formatArrangementTime(state.duration)}' library-row-strings-ui.test.tsx
m S7-MARKER-DROPS-NOWRAP $C/ArrangementLibrary.tsx 'className="flex items-center gap-0.5 whitespace-nowrap text-xs text-foreground"' 'className="flex items-center gap-0.5 text-xs text-foreground"' library-row-strings-ui.test.tsx
m S8-META-DROPS-TABULAR $C/ArrangementLibrary.tsx '<span className="flex gap-2 text-xs tabular-nums text-muted">' '<span className="flex gap-2 text-xs text-muted">' library-row-strings-ui.test.tsx
m R1-MARKER-REORDER $C/ArrangementLibrary.tsx 'className="flex items-center gap-0.5 whitespace-nowrap text-xs text-foreground"' 'className="flex items-center gap-0.5 text-xs whitespace-nowrap text-foreground"' library-row-strings-ui.test.tsx
m R2-META-REORDER $C/ArrangementLibrary.tsx '<span className="flex gap-2 text-xs tabular-nums text-muted">' '<span className="flex gap-2 tabular-nums text-xs text-muted">' library-row-strings-ui.test.tsx
m V1-CANCELLED-TEXT app/lib/arrangement/strings.ts "exportCancelled: 'Export cancelled — no file was created.'," "exportCancelled: 'Export cancelled.'," export-cancel.test.ts
m V2-CANCELLED-ENCODER-TEXT app/lib/arrangement/strings.ts "The MP3 encoder will load again on the next MP3 export.'," "The encoder reloads.'," export-cancel.test.ts
m V3-STALLED-TEXT app/lib/arrangement/strings.ts '`Writing WAV stalled — the worker has not responded for ${seconds} seconds.`' '`Writing WAV stalled.`' export-wav.test.ts
m2() { id=$1; file=$2; suite=$3; shift 3
  cp "$T/$file" "$T/$file.orig"
  python3 -I -c "import sys;p=sys.argv[1];s=open(p,encoding='utf-8').read();pairs=sys.argv[2:]
for o,n in zip(pairs[0::2],pairs[1::2]):
    assert s.count(o)==1,('miss',o); s=s.replace(o,n)
open(p,'w',encoding='utf-8').write(s)" "$T/$file" "$@" || { echo "{\"id\":\"$id\",\"tree\":\"$LBL\",\"rc\":\"apply-failed\"}"; mv "$T/$file.orig" "$T/$file"; return; }
  (cd $T && npx vitest run $X/$suite > $LOG/$id-$LBL.log 2>&1); rc=$?
  mv "$T/$file.orig" "$T/$file"
  echo "{\"id\":\"$id\",\"tree\":\"$LBL\",\"suite\":\"$suite\",\"rc\":$rc}"; }
m2 S9-WRAPPER-TAKES-MONO $C/ArrangementLibrary.tsx library-row-strings-ui.test.tsx "        <span>
          {!state || state.status === 'loading' ? (" "        <span className=\"font-mono\">
          {!state || state.status === 'loading' ? (" "<span className=\"font-mono\">{formatArrangementTime(state.duration)}</span>" "formatArrangementTime(state.duration)"
m S10-DECOY-FOREGROUND-BEFORE-NAME $C/ArrangementLibraryPreview.tsx '        {studioLibraryPanelStrings.activeTrack}{'"'"' '"'"'}' '        <span className="text-foreground">x</span>{studioLibraryPanelStrings.activeTrack}{'"'"' '"'"'}' library-preview.test.tsx

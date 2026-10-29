import sys
root, name = sys.argv[1], sys.argv[2]
C = root + '/app/contexts/ArrangementContext.tsx'
W = root + '/app/components/arrangement/StudioWorkspace.tsx'
R = root + '/app/components/arrangement/ArrangementRuler.tsx'
M = root + '/app/components/arrangement/ArrangementMarkerRow.tsx'
def sub(p, o, n):
    s = open(p, encoding='utf8').read()
    if o not in s:
        raise SystemExit(f'{name}: pattern missing in {p}: {o[:70]!r}')
    open(p, 'w', encoding='utf8').write(s.replace(o, n, 1))
MUT = {
 'FIX-CONTROL': lambda: None,
 'MU-SPACE-FROM-POSITION': lambda: sub(C, "startPlaybackAt(range ? Math.min(range.start, range.end) : insertMarkerRef.current);", "startPlaybackAt(range ? positionRef.current : positionRef.current);"),
 'MU-NO-RANGE-START': lambda: sub(C, "startPlaybackAt(range ? Math.min(range.start, range.end) : insertMarkerRef.current);", "startPlaybackAt(range ? insertMarkerRef.current : insertMarkerRef.current);"),
 'MU-SHIFT-SAME-AS-SPACE': lambda: sub(W, "current.continuePlayback();", "current.togglePlayback();"),
 'MU-CLICK-SEEKS-PLAYING': lambda: sub(C, "        setStatus(studioPlaybackStrings.insertMarkerWhilePlaying(formatArrangementTime(target)));\n        return;", "        setStatus(studioPlaybackStrings.insertMarkerWhilePlaying(formatArrangementTime(target)));\n        updatePosition(target);\n        return;"),
 'MU-NO-STATUS-PLAYING': lambda: sub(C, "        setStatus(studioPlaybackStrings.insertMarkerWhilePlaying(formatArrangementTime(target)));\n", ""),
 'MU-NO-RANGE-CLEAR': lambda: sub(C, "      if (latestRef.current.range !== null) {\n        setRange(null);\n      }\n", ""),
 'MU-CTRL-SHIFT-NOOP': lambda: sub(W, "            current.moveInsertMarkerToPlayhead();\n", ""),
 'MU-HOME-MARKER-ONLY': lambda: sub(C, "    placeInsertMarker(0);\n    seekTo(0);\n", "    placeInsertMarker(0);\n    if (!isPlayingRef.current) {\n      seekTo(0);\n    }\n"),
 'MU-SEEKTO-NO-MARKER': lambda: sub(C, "      writeInsertMarker(target);\n      updatePosition(target);\n", "      updatePosition(target);\n"),
 'MU-SCRUBEND-NO-MARKER': lambda: sub(C, "      if (!isPlayingRef.current) {\n        placeInsertMarker(target);\n      }\n", ""),
 'MU-HANDLE-ONSEEK': lambda: sub(R, "    onScrubEnd(Math.max(0, Math.round((positionStore.getPosition() + delta) * 1000) / 1000));", "    onSeek(Math.max(0, Math.round((positionStore.getPosition() + delta) * 1000) / 1000));"),
 'MU-CUT-NO-REMAP': lambda: sub(C, "    writeInsertMarker(remapTime(insertMarkerRef.current, a, b));\n", ""),
 'MU-KEYUP-OLD': lambda: sub(W, "(!(event.ctrlKey || event.metaKey) || (event.shiftKey && !event.altKey))", "!(event.ctrlKey || event.metaKey)"),
 'MU-MARKER-PLAY-TOGGLE': lambda: (sub(M, "    seekTo,\n    playFrom,\n", "    seekTo,\n    playFrom,\n    togglePlayback,\n"), sub(M, "                playFrom(marker.time);\n                setSelectedMarkerId(marker.id);\n", "                jumpToMarker(marker);\n                togglePlayback();\n")),
}
MUT[name]()
print('applied', name)

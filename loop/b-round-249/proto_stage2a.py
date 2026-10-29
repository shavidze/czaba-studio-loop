import sys
root = sys.argv[1]


def sub(path, old, new, count=1):
    p = root + '/' + path
    s = open(p, encoding='utf8').read()
    n = s.count(old)
    if n != count:
        raise SystemExit(f'COUNT {n} != {count} in {path}: {old[:90]!r}')
    s = s.replace(old, new)
    open(p, 'w', encoding='utf8').write(s)


C = 'app/contexts/ArrangementContext.tsx'
S = 'app/lib/arrangement/strings.ts'
SW = 'app/components/arrangement/StudioWorkspace.tsx'
MR = 'app/components/arrangement/ArrangementMarkerRow.tsx'
TR = 'app/components/arrangement/ArrangementTransport.tsx'
SH = 'app/lib/arrangement/shortcuts.ts'

# --- strings ---
sub(S, "  splitMissesSelection: 'The playhead does not cross any selected clip.',\n",
    "  splitMissesSelection: 'The insert marker does not cross any selected clip.',\n")
sub(S, "  splitNeedsTarget:\n    'To split, select a clip and place the playhead inside it, or make a time selection.',\n  splitPlayheadOutside: 'The playhead must be inside the selected clip.',\n",
    "  splitNeedsTarget:\n    'To split, click inside a clip to select it and place the insert marker, or make a time selection.',\n  splitInsertMarkerOutside: 'The insert marker must be inside the selected clip.',\n")
sub(S, "  splitPlayheadTitle: studioShortcutTitle('Split at the playhead', 'split'),\n",
    "  splitAtInsertMarkerTitle: studioShortcutTitle('Split at the insert marker', 'split'),\n")
sub(S, "  playPastEnd: ({ position, end }: { position: string; end: string }): string =>\n    `Playhead (${position}) is past the end of the project (${end}) — there is nothing to play here. Home returns to 0.`,\n",
    "  playPastEnd: ({\n    subject,\n    position,\n    end,\n  }: {\n    subject: string;\n    position: string;\n    end: string;\n  }): string =>\n    `${subject} (${position}) is past the end of the project (${end}) — there is nothing to play here. Home returns to 0.`,\n  startPointInsertMarker: 'Insert marker',\n  startPointSelection: 'Time selection start',\n  startPointPlayhead: 'Playhead',\n")
sub(S, "  addTitle: 'Add a marker at the playhead or at the start of the time selection (M)',\n",
    "  addTitle:\n    'Add a marker at the time selection start, the insert marker, or the playback position while playing (M)',\n")
sub(SH, "        action: 'Split at the playhead or the selection',\n",
    "        action: 'Split at the insert marker or the selection',\n")
sub(SH, "      { id: 'marker', action: 'Add a marker at the playhead', keys: ['M'] },\n",
    "      { id: 'marker', action: 'Add a marker at the insert marker', keys: ['M'] },\n")
sub(SH, "        action: 'Add the selected sound at the playhead',\n",
    "        action: 'Add the selected sound at the insert marker',\n")
sub(TR, "studioEditStrings.splitPlayheadTitle", "studioEditStrings.splitAtInsertMarkerTitle")

# --- context ---
sub(C, "export function playPastEndMessage(position: number, end: number): string {\n  return studioPlaybackStrings.playPastEnd({\n",
    "export type PlaybackStartOrigin = 'insert-marker' | 'selection' | 'playhead';\n\n"
    "const PLAYBACK_START_SUBJECT: Record<PlaybackStartOrigin, string> = {\n"
    "  'insert-marker': studioPlaybackStrings.startPointInsertMarker,\n"
    "  selection: studioPlaybackStrings.startPointSelection,\n"
    "  playhead: studioPlaybackStrings.startPointPlayhead,\n"
    "};\n\n"
    "export function playPastEndMessage(\n  position: number,\n  end: number,\n  origin: PlaybackStartOrigin,\n): string {\n  return studioPlaybackStrings.playPastEnd({\n    subject: PLAYBACK_START_SUBJECT[origin],\n")
sub(C, "  const startPlaybackAt = useCallback(\n    (current: number) => {\n",
    "  const startPlaybackAt = useCallback(\n    (current: number, origin: PlaybackStartOrigin) => {\n")
sub(C, "        setStatus(playPastEndMessage(current, end));\n", "        setStatus(playPastEndMessage(current, end, origin));\n")
sub(C, "    const range = latestRef.current.range;\n    startPlaybackAt(range ? Math.min(range.start, range.end) : insertMarkerRef.current);\n",
    "    const range = latestRef.current.range;\n    if (range) {\n      startPlaybackAt(Math.min(range.start, range.end), 'selection');\n      return;\n    }\n    startPlaybackAt(insertMarkerRef.current, 'insert-marker');\n")
sub(C, "    startPlaybackAt(positionRef.current);\n  }, [startPlaybackAt, stopPlayback]);\n",
    "    startPlaybackAt(positionRef.current, 'playhead');\n  }, [startPlaybackAt, stopPlayback]);\n")
sub(C, "        setStatus(playPastEndMessage(target, end));\n", "        setStatus(playPastEndMessage(target, end, 'insert-marker'));\n")
sub(C, "      seekTo(target);\n      startPlaybackAt(target);\n", "      seekTo(target);\n      startPlaybackAt(target, 'insert-marker');\n")
# locator origin getter
sub(C, "  const moveInsertMarkerToPlayhead = useCallback(() => {\n",
    "  const getLocatorPosition = useCallback(\n    (): number => (isPlayingRef.current ? livePosition() : insertMarkerRef.current),\n    [livePosition],\n  );\n\n  const moveInsertMarkerToPlayhead = useCallback(() => {\n")
sub(C, "  getLivePosition: () => number;\n", "  getLivePosition: () => number;\n  getLocatorPosition: () => number;\n")
sub(C, "      getLivePosition: livePosition,\n", "      getLivePosition: livePosition,\n      getLocatorPosition,\n")
sub(C, "      livePosition,\n      getPlaybackClock,\n", "      livePosition,\n      getLocatorPosition,\n      getPlaybackClock,\n")
# edit commands read the insert marker
sub(C, "    if (!latest.range && latest.selectedClipIds.length >= 2) {\n      const time = livePosition();\n",
    "    if (!latest.range && latest.selectedClipIds.length >= 2) {\n      const time = insertMarkerRef.current;\n")
sub(C, "    const time = livePosition();\n    const clip = arrangement.clips.find((entry) => entry.id === primarySelectedClipId());\n",
    "    const time = insertMarkerRef.current;\n    const clip = arrangement.clips.find((entry) => entry.id === primarySelectedClipId());\n")
sub(C, "      setStatus(studioEditStrings.splitPlayheadOutside);\n", "      setStatus(studioEditStrings.splitInsertMarkerOutside);\n")
sub(C, "  }, [\n    applyEdit,\n    livePosition,\n    primarySelectedClipId,\n", "  }, [\n    applyEdit,\n    primarySelectedClipId,\n")
sub(C, "    const at = livePosition();\n    const plan = planClipboardPaste(", "    const at = insertMarkerRef.current;\n    const plan = planClipboardPaste(")
sub(C, "  }, [applyEdit, livePosition, refuseEditDuringGesture, setRange, setSelection, trackLabel]);\n",
    "  }, [applyEdit, refuseEditDuringGesture, setRange, setSelection, trackLabel]);\n")
sub(C, "      const desired = livePosition();\n      const result = addClip(", "      const desired = insertMarkerRef.current;\n      const result = addClip(")
sub(C, "    [\n      applyEdit,\n      collection.sources,\n      livePosition,\n      refuseEditDuringGesture,\n",
    "    [\n      applyEdit,\n      collection.sources,\n      refuseEditDuringGesture,\n")

# --- marker row: M uses the locator position ---
sub(MR, "    getLivePosition,\n    previewArrangement,", "    getLivePosition,\n    getLocatorPosition,\n    previewArrangement,")
sub(MR, "    const time = roundMarkerTime(range ? Math.min(range.start, range.end) : getLivePosition());\n",
    "    const time = roundMarkerTime(range ? Math.min(range.start, range.end) : getLocatorPosition());\n")
sub(MR, "  }, [focusMarkerTarget, getArrangement, getLivePosition, openEditor, range, setStatus]);\n",
    "  }, [focusMarkerTarget, getArrangement, getLocatorPosition, openEditor, range, setStatus]);\n")

# --- workspace: gesture guard (GATE249-S6) ---
sub(SW, "          if (!event.repeat) {\n            current.moveInsertMarkerToPlayhead();\n          }\n",
    "          if (!event.repeat && !current.isPointerGestureActive()) {\n            current.moveInsertMarkerToPlayhead();\n          }\n")
sub(SW, "        if (!isSeparatorTarget(event.target)) {\n          current.returnToStart();\n        }\n",
    "        if (!isSeparatorTarget(event.target) && !current.isPointerGestureActive()) {\n          current.returnToStart();\n        }\n")
print('applied')

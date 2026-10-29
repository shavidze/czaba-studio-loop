import sys
root, name = sys.argv[1], sys.argv[2]
C = 'app/contexts/ArrangementContext.tsx'
SW = 'app/components/arrangement/StudioWorkspace.tsx'


def sub(path, old, new, count=1):
    p = root + '/' + path
    s = open(p, encoding='utf8').read()
    n = s.count(old)
    if n != count:
        raise SystemExit(f'{name}: COUNT {n} != {count} in {path}: {old[:90]!r}')
    open(p, 'w', encoding='utf8').write(s.replace(old, new))


M = {
    'FIX-CONTROL': [],
    'MU-PASTE-LIVE': [(C, '    const at = insertMarkerRef.current;\n', '    const at = livePosition();\n')],
    'MU-ADD-LIVE': [(C, '      const desired = insertMarkerRef.current;\n', '      const desired = livePosition();\n')],
    'MU-SPLIT-MULTI-LIVE': [(C, '    if (!latest.range && latest.selectedClipIds.length >= 2) {\n      const time = insertMarkerRef.current;\n',
                             '    if (!latest.range && latest.selectedClipIds.length >= 2) {\n      const time = livePosition();\n')],
    'MU-SPLIT-ONE-LIVE': [(C, '    const time = insertMarkerRef.current;\n    const clip = arrangement.clips.find(',
                           '    const time = livePosition();\n    const clip = arrangement.clips.find(')],
    'MU-M-LIVE': [(C, '(isPlayingRef.current ? livePosition() : insertMarkerRef.current)', 'livePosition()')],
    'MU-M-MARKER': [(C, '(isPlayingRef.current ? livePosition() : insertMarkerRef.current)', 'insertMarkerRef.current')],
    'MU-PASTEND-ONE-SUBJECT': [(C, '    subject: PLAYBACK_START_SUBJECT[origin],\n', "    subject: PLAYBACK_START_SUBJECT.playhead,\n")],
    'MU-SELECTION-AS-MARKER': [(C, "      startPlaybackAt(Math.min(range.start, range.end), 'selection');\n",
                                "      startPlaybackAt(Math.min(range.start, range.end), 'insert-marker');\n")],
    'MU-NO-GESTURE-GUARD-CS': [(SW, '          if (!event.repeat && !current.isPointerGestureActive()) {\n            current.moveInsertMarkerToPlayhead();\n',
                                '          if (!event.repeat) {\n            current.moveInsertMarkerToPlayhead();\n')],
    'MU-NO-GESTURE-GUARD-HOME': [(SW, '        if (!isSeparatorTarget(event.target) && !current.isPointerGestureActive()) {\n',
                                  '        if (!isSeparatorTarget(event.target)) {\n')],
    'A-MU-CTRL-ONLY': [(SW, '        if (modifier && event.shiftKey && !event.altKey) {\n',
                        '        if (event.ctrlKey && event.shiftKey && !event.altKey) {\n')],
    'C-MU-LEAK-CS': [(SW, "        exportKeyEventRef.current === event ||\n        isTypingTarget(event.target)\n      ) {\n",
                      "        exportKeyEventRef.current === event ||\n        (isTypingTarget(event.target) &&\n          !(event.key === ' ' && event.shiftKey && (event.ctrlKey || event.metaKey)))\n      ) {\n")],
    'C-MU-LEAK-SHIFT': [(SW, "        exportKeyEventRef.current === event ||\n        isTypingTarget(event.target)\n      ) {\n",
                         "        exportKeyEventRef.current === event ||\n        (isTypingTarget(event.target) && !(event.key === ' ' && event.shiftKey))\n      ) {\n")],
    'MU-SCRUBEND-NO-RANGE-CLEAR': [(C, '      if (!isPlayingRef.current) {\n        placeInsertMarker(target);\n      }\n      const ctx = audioContextRef.current;\n',
                                    '      if (!isPlayingRef.current) {\n        writeInsertMarker(target);\n      }\n      const ctx = audioContextRef.current;\n')],
    'MU-STARTAT-PLAYHEAD-SUBJECT': [(C, '        setStatus(playPastEndMessage(current, end, origin));\n', "        setStatus(playPastEndMessage(current, end, 'playhead'));\n")],
    'MU-PLAYFROM-PLAYHEAD-SUBJECT': [(C, "        setStatus(playPastEndMessage(target, end, 'insert-marker'));\n", "        setStatus(playPastEndMessage(target, end, 'playhead'));\n")],
    'MU-SHIFT-AS-MARKER': [(C, "    startPlaybackAt(positionRef.current, 'playhead');\n", "    startPlaybackAt(positionRef.current, 'insert-marker');\n")],
}
for path, old, new in M[name]:
    sub(path, old, new)
print(name, 'applied', len(M[name]))

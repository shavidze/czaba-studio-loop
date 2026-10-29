# Usage: python3 -I mutate252.py <scratch-root> <MUTANT>
import sys, pathlib
root = pathlib.Path(sys.argv[1]); m = sys.argv[2]
def sub(path, old, new):
    p = root / path; t = p.read_text(encoding='utf-8')
    assert t.count(old) == 1, (m, path, old[:60], t.count(old)); p.write_text(t.replace(old, new), encoding='utf-8')
LP = 'app/components/arrangement/ArrangementLibraryPreview.tsx'
SW = 'app/components/arrangement/StudioWorkspace.tsx'
MR = 'app/components/arrangement/ArrangementMarkerRow.tsx'
ST = 'app/lib/arrangement/strings.ts'
IMT = 'app/lib/arrangement/__tests__/insert-marker-ui.test.tsx'
def caption_position():
    sub(LP, "  useArrangementInsertMarkerStore,\n} from '~/contexts/ArrangementContext';", "  useArrangementInsertMarkerStore,\n  useArrangementPositionStore,\n} from '~/contexts/ArrangementContext';")
    sub(LP, "  const insertMarkerStore = useArrangementInsertMarkerStore();\n  const textRef", "  useArrangementInsertMarkerStore();\n  const insertMarkerStore = useArrangementPositionStore();\n  const textRef")
def drop_im22_stopped():
    sub(IMT, "      expect(positionOf(mounted.api)).toBeGreaterThan(4);\n      expect(caption.textContent).toBe('00:03.000');\n      expect(caption.closest('p')?.textContent).toContain('· insert marker 00:03.000');\n      expect(caption.closest('p')?.textContent).not.toContain('playhead');\n", "      expect(positionOf(mounted.api)).toBeGreaterThan(4);\n")
if m == 'FIX-CONTROL':
    pass
elif m == 'MU-IM22-REDPROOF':
    caption_position(); drop_im22_stopped()
elif m == 'MU-IM22-REDPROOF-HEAD-ROW':
    caption_position(); drop_im22_stopped()
    sub(IMT, "      act(() => mounted.api.position?.setPosition(live(mounted.api).getLivePosition()));\n      expect(positionOf(mounted.api)).toBeGreaterThan(3.5);\n", "")
elif m == 'MU-FW-NO-PAUSE':
    sub(SW, "      setInsertMarker(time);\n      if (pausing) {\n        setFollowMode('paused');\n        current.setStatus(\n          studioPlaybackStrings.insertMarkerWhilePlayingFollowPaused(\n            formatArrangementTime(Math.max(0, time)),\n          ),\n        );\n      }\n", "      setInsertMarker(time);\n      if (pausing) {\n        void current;\n      }\n")
elif m == 'MU-FW-NO-SETMARKER':
    sub(SW, "      const pausing = current.isPlaying && followModeRef.current === 'on';\n      setInsertMarker(time);\n", "      const pausing = current.isPlaying && followModeRef.current === 'on';\n")
elif m == 'MU-FW-SECONDS-RAW':
    sub(SW, "                    onSeek={placeInsertMarkerFromRuler}\n", "                    onSeek={setInsertMarker}\n")
elif m == 'MU-FW-NO-RESUME':
    sub(SW, "      current.playFrom(time);\n      if (resuming) {\n        setFollowMode('on');\n        current.setStatus(studioViewStrings.followResumed);\n      }\n", "      current.playFrom(time);\n")
elif m == 'MU-FW-RESUME-ANY':
    sub(SW, "      const resuming = current.isPlaying && followModeRef.current === 'paused';", "      const resuming = current.isPlaying && followModeRef.current !== 'on';")
elif m == 'MU-FW-PAUSE-STOPPED':
    sub(SW, "      const pausing = current.isPlaying && followModeRef.current === 'on';", "      const pausing = followModeRef.current === 'on';")
elif m == 'MU-FW-NO-STOP-RESUME':
    sub(SW, "    if (!isPlaying) {\n      if (followModeRef.current === 'paused') {\n        setFollowMode('on');\n      }\n      return;\n    }", "    if (!isPlaying) {\n      return;\n    }")
elif m == 'MU-NAV-LIVE-ORIGIN':
    sub(MR, "    getLocatorPosition,\n    isPlaying,\n", "    getLocatorPosition,\n    getLivePosition,\n    isPlaying,\n")
    sub(MR, "        getArrangement(),\n        getLocatorPosition(),\n        direction,", "        getArrangement(),\n        getLivePosition(),\n        direction,")
elif m == 'MU-NONE-PLAYHEAD-STOPPED':
    sub(MR, "        const message = isPlaying\n", "        const message = true\n")
elif m == 'MU-NONE-INSERT-PLAYING':
    sub(MR, "        const message = isPlaying\n", "        const message = false\n")
elif m == 'MU-FW-NO-AUTOSCROLL-RESET':
    sub(SW, "      if (resuming) {\n        autoScrollLeftRef.current = scrollerRef.current?.scrollLeft ?? 0;\n      }\n", "")
elif m == 'MU-PASTEND-ALWAYS-PAST':
    sub(ST, "    position === end\n      ? `${subject} (${position}) is at the end", "    false\n      ? `${subject} (${position}) is at the end")
else:
    raise SystemExit('unknown ' + m)
print('mutated', m)

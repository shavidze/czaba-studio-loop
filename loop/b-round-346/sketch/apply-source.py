# B round 346 -> 347 sketch: c6-ii (MixFader memo + stable lane handlers). Usage: python3 -I apply-source.py <tree>
import pathlib, sys
T = pathlib.Path(sys.argv[1])

def sub(path, old, new, count=1):
    p = T / path
    s = p.read_text()
    n = s.count(old)
    assert n == count, (path, old[:60], n)
    p.write_text(s.replace(old, new))

(T / 'app/hooks/useStableHandler.ts').write_text("""import { useCallback, useRef } from 'react';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

export function useStableHandler<Args extends unknown[], Result>(
  handler: (...args: Args) => Result,
): (...args: Args) => Result {
  const handlerRef = useRef(handler);
  useIsomorphicLayoutEffect(() => {
    handlerRef.current = handler;
  });
  return useCallback((...args: Args) => handlerRef.current(...args), []);
}
""")

F = 'app/components/arrangement/ArrangementMixFader.tsx'
sub(F, "  forwardRef,\n  type InputHTMLAttributes,\n", "  forwardRef,\n  type InputHTMLAttributes,\n  memo,\n")
sub(F, "const ArrangementMixFader = forwardRef<HTMLInputElement, ArrangementMixFaderProps>(", "const ArrangementMixFaderInner = forwardRef<HTMLInputElement, ArrangementMixFaderProps>(")
sub(F, "ArrangementMixFader.displayName = 'ArrangementMixFader';\n", "ArrangementMixFaderInner.displayName = 'ArrangementMixFader';\n\nconst ArrangementMixFader = memo(ArrangementMixFaderInner);\n")

L = 'app/components/arrangement/ArrangementLane.tsx'
sub(L, "import { useRelativeFaderDrag } from '~/hooks/useRelativeFaderDrag';\n", "import { useRelativeFaderDrag } from '~/hooks/useRelativeFaderDrag';\nimport { useStableHandler } from '~/hooks/useStableHandler';\n")
sub(L, "  const resetTrackVolume = () => {", "  const resetTrackVolume = useStableHandler(() => {")
sub(L, "    previewTrackVolume(track.id, trackVolumeFromDb(TRACK_VOLUME_DB_DEFAULT));\n    commitTrackVolume(track.id);\n  };\n", "    previewTrackVolume(track.id, trackVolumeFromDb(TRACK_VOLUME_DB_DEFAULT));\n    commitTrackVolume(track.id);\n  });\n")
sub(L, "  const handlePanChange = (event: ChangeEvent<HTMLInputElement>) => {", "  const handlePanChange = useStableHandler((event: ChangeEvent<HTMLInputElement>) => {")
sub(L, "    panDragCleanupRef.current?.();\n    setTrackPan(track.id, pan);\n  };\n", "    panDragCleanupRef.current?.();\n    setTrackPan(track.id, pan);\n  });\n")
sub(L, "  const handlePanPointerEnd = (event: PointerEvent<HTMLInputElement>) => {", "  const handlePanPointerEnd = useStableHandler((event: PointerEvent<HTMLInputElement>) => {")
sub(L, "    commitTrackPan(track.id);\n    panDragCleanupRef.current?.();\n  };\n", "    commitTrackPan(track.id);\n    panDragCleanupRef.current?.();\n  });\n")
sub(L, "  const handlePanBlur = () => {", "  const handlePanBlur = useStableHandler(() => {")
sub(L, "      cancelTrackPan(track.id);\n      panDragCleanupRef.current();\n    }\n  };\n", "      cancelTrackPan(track.id);\n      panDragCleanupRef.current();\n    }\n  });\n")
sub(L, "  const handlePanKeyDown = () => {\n    panBlurSuppressionCleanupRef.current?.();\n  };\n", "  const handlePanKeyDown = useStableHandler(() => {\n    panBlurSuppressionCleanupRef.current?.();\n  });\n\n  const handlePanDoubleClick = useStableHandler(() => {\n    setTrackPan(track.id, 0);\n  });\n")
sub(L, "  const renderPanReadout = (pan: number) => (\n", "  const trackId = track.id;\n  const trackName = track.name;\n  const isPanCentred = storedPan === 0;\n  const renderPanReadout = useCallback(\n    (pan: number) => (\n")
sub(L, """      onClick={() => {
        if (setTrackPan(track.id, 0)) {
          panSliderRef.current?.focus();
        }
      }}
      disabled={storedPan === 0}
      aria-label={studioLaneStrings.panResetLabel(track.name)}""", """      onClick={() => {
        if (setTrackPan(trackId, 0)) {
          panSliderRef.current?.focus();
        }
      }}
      disabled={isPanCentred}
      aria-label={studioLaneStrings.panResetLabel(trackName)}""")
sub(L, "      {formatTrackPan(pan)}\n    </button>\n  );\n", "      {formatTrackPan(pan)}\n    </button>\n    ),\n    [isPanCentred, setTrackPan, trackId, trackName],\n  );\n\n  const handleVolumeChange = useStableHandler((event: ChangeEvent<HTMLInputElement>) => {\n    previewTrackVolume(track.id, trackVolumeFromDb(Number(event.target.value)));\n  });\n\n  const handleVolumePointerEnd = useStableHandler(() => {\n    commitTrackVolume(track.id);\n  });\n\n  const handleVolumeKeyUp = useStableHandler(() => {\n    if (!isPointerGestureActive()) {\n      commitTrackVolume(track.id);\n    }\n  });\n\n  const handleVolumeBlur = useStableHandler(() => {\n    blurTrackVolume(track.id);\n  });\n")
sub(L, "              onDoubleClick={() => setTrackPan(track.id, 0)}\n", "              onDoubleClick={handlePanDoubleClick}\n")
sub(L, """              onChange={(event) =>
                previewTrackVolume(track.id, trackVolumeFromDb(Number(event.target.value)))
              }
              onPointerDown={volumeFaderDrag.onPointerDown}
              onDoubleClick={resetTrackVolume}
              onPointerUp={() => commitTrackVolume(track.id)}
              onLostPointerCapture={() => commitTrackVolume(track.id)}
              onKeyUp={() => {
                if (!isPointerGestureActive()) {
                  commitTrackVolume(track.id);
                }
              }}
              onBlur={() => blurTrackVolume(track.id)}
""", """              onChange={handleVolumeChange}
              onPointerDown={volumeFaderDrag.onPointerDown}
              onDoubleClick={resetTrackVolume}
              onPointerUp={handleVolumePointerEnd}
              onLostPointerCapture={handleVolumePointerEnd}
              onKeyUp={handleVolumeKeyUp}
              onBlur={handleVolumeBlur}
""")
print('applied')

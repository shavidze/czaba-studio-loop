import sys
tree, mid = sys.argv[1], sys.argv[2]
ctx = tree + '/app/contexts/ArrangementContext.tsx'
M = {
 'MU-386-NO-CATCH': (ctx, """      try {
        syncPlayback(present, undefined, true);
      } catch {
        stopPlayback();
        setStatus(studioPlaybackStrings.scheduleFailed);
      }
""", """      syncPlayback(present, undefined, true);
"""),
 'MU-386-NO-OWNER-GUARD': (ctx, "const controller = owner?.collection === collection ? owner.controller : null;", "const controller = owner ? owner.controller : null;"),
 'MU-386-CLICK-STOP': (ctx, """        previewRequestRef.current = sourceId;
        decodedBuffers.setPinned('preview', [sourceId]);
        void ensureDecoded""", """        if (isPlayingRef.current) {
          stopPlayback();
        }
        previewRequestRef.current = sourceId;
        decodedBuffers.setPinned('preview', [sourceId]);
        void ensureDecoded"""),
 'MU-386-LOAD-PATH-DIRECT': (ctx, """            settle(false);
            resyncAfterDecode(source.id);""", """            settle(false);
            if (historyRef.current.present.clips.some((clip) => clip.sourceId === source.id)) {
              syncPlayback(historyRef.current.present, undefined, true);
            }"""),
 'MU-386-UNSTABLE-RESYNC': (ctx, "    [setStatus, stopPlayback, syncPlayback],\n  );\n\n  const ensureDecoded", "    [setStatus, stopPlayback, syncPlayback, history],\n  );\n\n  const ensureDecoded"),
 'MU-386-VIDEO-PATH-DIRECT': (ctx, """          settle({ audio: 'ready', audioNote: null });
          resyncAfterDecode(sourceId);""", """          settle({ audio: 'ready', audioNote: null });
          if (historyRef.current.present.clips.some((clip) => clip.sourceId === sourceId)) {
            syncPlayback(historyRef.current.present, undefined, true);
          }"""),
 'MU-386-REPLAY-STATUS': (ctx, " || text === studioPlaybackStrings.scheduleFailed", ""),
}
f, a, b = M[mid]
s = open(f).read()
assert s.count(a) == 1, (mid, s.count(a))
open(f, 'w').write(s.replace(a, b))
print('applied', mid)

import sys
tree, mid = sys.argv[1], sys.argv[2]
ctx = tree + '/app/contexts/ArrangementContext.tsx'
gc = tree + '/app/lib/arrangement/graph.client.ts'
M = {
 'MU-387-NO-ROLLBACK-STOP': (gc, """    for (const state of [...sources, ...clickSources]) {
      try {
        state.source.stop();
      } catch {
        state.ended = true;
      }
    }
    releaseNodes();""", "    releaseNodes();"),
 'MU-387-NO-RELEASE': (gc, """    releaseNodes();
    throw error;""", "    throw error;"),
 'MU-387-REPLACE-ERROR': (gc, """    releaseNodes();
    throw error;""", """    releaseNodes();
    throw new Error(`rollback: ${String(error)}`);"""),
 'MU-387-NO-ITEM-DETACH': (gc, """      } catch (error) {
        source.disconnect();
        fadeGain?.disconnect();
        envelopeGain?.disconnect();
        clipGain.disconnect();
        throw error;
      }""", """      } catch (error) {
        throw error;
      }"""),
 'MU-387-PLAY-NO-GUARD': (ctx, """      if (!startGraphOrStop(arrangement, createPlaybackAnchor(from, startAt), from)) {
        return;
      }""", """      startGraph(arrangement, createPlaybackAnchor(from, startAt));"""),
 'MU-387-PLAY-NO-STOPAT': (ctx, "if (!startGraphOrStop(arrangement, createPlaybackAnchor(from, startAt), from)) {", "if (!startGraphOrStop(arrangement, createPlaybackAnchor(from, startAt))) {"),
 'MU-387-SYNC-DIRECT': (ctx, "        startGraphOrStop(arrangement, anchor);\n        return;", "        startGraph(arrangement, anchor);\n        return;"),
 'MU-387-SEEK-DIRECT': (ctx, """      if (isPlayingRef.current && ctx) {
        startGraphOrStop(
          historyRef.current.present,
          createPlaybackAnchor(target, ctx.currentTime + PLAYBACK_LOOKAHEAD),
        );
      }
      writeInsertMarker(target);""", """      if (isPlayingRef.current && ctx) {
        startGraph(
          historyRef.current.present,
          createPlaybackAnchor(target, ctx.currentTime + PLAYBACK_LOOKAHEAD),
        );
      }
      writeInsertMarker(target);"""),
 'MU-387-SCRUB-DIRECT': (ctx, """        lastScrubRescheduleRef.current = ctx.currentTime;
        startGraphOrStop(""", """        lastScrubRescheduleRef.current = ctx.currentTime;
        startGraph("""),
 'MU-387-ENDSCRUB-DIRECT': (ctx, """      if (isPlayingRef.current && ctx) {
        startGraphOrStop(
          historyRef.current.present,
          createPlaybackAnchor(target, ctx.currentTime + PLAYBACK_LOOKAHEAD),
          target,
        );
      }
    },
    [placeInsertMarker""", """      if (isPlayingRef.current && ctx) {
        startGraph(
          historyRef.current.present,
          createPlaybackAnchor(target, ctx.currentTime + PLAYBACK_LOOKAHEAD),
        );
      }
    },
    [placeInsertMarker"""),
 'MU-387-PUMP-NO-CATCH': (ctx, """    try {
      if (fillLoopIterations()) {
        resyncLoopRef.current();
      }
      fillMetronomeHorizon();
    } catch {
      stopForScheduleFailure();
      return;
    }""", """    if (fillLoopIterations()) {
      resyncLoopRef.current();
    }
    fillMetronomeHorizon();"""),
 'MU-387-STATUS-SYNC': (ctx, "      queueMicrotask(() => setStatus(studioPlaybackStrings.scheduleFailed));", "      setStatus(studioPlaybackStrings.scheduleFailed);"),
}
f, a, b = M[mid]
s = open(f).read()
assert s.count(a) == 1, (mid, s.count(a))
open(f, 'w').write(s.replace(a, b))
print('applied', mid)

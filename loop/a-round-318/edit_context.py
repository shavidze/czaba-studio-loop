import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count:
        raise SystemExit(f'expected {count} got {n}: {old[:80]!r}')
    s = s.replace(old, new)
rep("""import {
  type ArrangementPositionStore,
  createArrangementPositionStore,
} from '~/lib/arrangement/position-store';
""", """import {
  type ArrangementPositionStore,
  createArrangementPositionStore,
} from '~/lib/arrangement/position-store';
import {
  type ArrangementRangeState,
  type ArrangementRangeStore,
  createArrangementRangeStore,
} from '~/lib/arrangement/range-store';
""")
rep("""  selectedSourceId: string | null;
  range: TimeRange | null;
  activeTrackId: string | null;
""", """  selectedSourceId: string | null;
  activeTrackId: string | null;
""")
rep("""  const [range, setRangeState] = useState<TimeRange | null>(null);
""", "")
rep("""  const [mixDraftStore] = useState(() => createArrangementMixDraftStore());
""", """  const [mixDraftStore] = useState(() => createArrangementMixDraftStore());
  const [rangeStore] = useState(() => createArrangementRangeStore());
""")
rep("""    selectedSourceId,
    range,
    activeTrackId,
    sourceStates,
  });""", """    selectedSourceId,
    activeTrackId,
    sourceStates,
  });""")
rep("""      range: latestRef.current.range,
""", """      range: rangeStore.getState().range,
""", 2)
rep("""  }, []);
  const rewriteStoppedTruth""", """  }, [rangeStore]);
  const rewriteStoppedTruth""")
rep("""      latestRef.current.range = next;
      setRangeState(next);
      if (gestureCountRef.current === 0) {
        setStatus(rewriteStoppedTruth);
      }
    },
    [rewriteStoppedTruth],""", """      rangeStore.getState().setRange(next);
      if (gestureCountRef.current === 0) {
        setStatus(rewriteStoppedTruth);
      }
    },
    [rangeStore, rewriteStoppedTruth],""")
rep("""      if (latestRef.current.range !== null) {
        setRange(null);
      }
    },
    [setRange, writeInsertMarker],""", """      if (rangeStore.getState().range !== null) {
        setRange(null);
      }
    },
    [rangeStore, setRange, writeInsertMarker],""")
open(p, 'w', encoding='utf-8').write(s)
print('ok')

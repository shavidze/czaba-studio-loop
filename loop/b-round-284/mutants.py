# B round 284 planning: named mutants for PERF-3b. Run inside a copy of the final tree.
import sys, shutil, os
n = sys.argv[1]
HEAD = os.environ.get('HEAD_TREE', '/tmp/b284/head')
def sub(p, a, b):
    s = open(p).read(); assert a in s, (n, p, a[:60]); open(p, 'w').write(s.replace(a, b, 1))
R = 'app/components/arrangement/ArrangementRuler.tsx'
V = 'app/lib/arrangement/view.ts'
W = 'app/components/arrangement/StudioWorkspace.tsx'
T = 'app/components/arrangement/ArrangementTempoRow.tsx'
if n == 'HEADRULER':
    shutil.copy(HEAD + '/' + R, R)
    sub(R, "          style={{ left: mark.time * pxPerSecond }}\n        >",
        "          style={{ left: mark.time * pxPerSecond }}\n          data-testid=\"arrangement-ruler-tick\"\n          data-time={String(Math.round(mark.time * 1e6) / 1e6)}\n        >")
elif n == 'W1':
    sub(R, "fromPx === null || toPx === null ? undefined : { fromPx, toPx },", "undefined,")
elif n == 'W2':
    sub(V, "      (rulerWindow === undefined ||\n", "      (true ||\n")
elif n == 'W3':
    sub(V, "Math.max(0, Math.floor(rulerWindow.fromPx / stepPx) - 1)", "Math.max(0, Math.floor(rulerWindow.fromPx / stepPx) + 1)")
elif n == 'W4':
    s = open(W).read()
    a = "                    getSnapMarkerTimes={getRulerSnapMarkerTimes}\n                    getTimelineViewportPx={getTimelineViewportPx}\n                    subscribeTimelineScroll={subscribeTimelineScroll}\n"
    assert a in s, 'W4'
    open(W, 'w').write(s.replace(a, "                    getSnapMarkerTimes={getRulerSnapMarkerTimes}\n", 1))
elif n == 'W5':
    sub(R, "() => timelinePageKey(readTimelinePage(getTimelineView, getTimelineViewportPx)),",
        "() => `${getTimelineView().scrollLeft}|${timelinePageKey(readTimelinePage(getTimelineView, getTimelineViewportPx))}`,")
    sub(V, "  const [pageText, viewportText] = key.split(':');", "  const [pageText, viewportText] = key.split('|').at(-1)?.split(':') ?? [];")
elif n == 'W6':
    sub(V, "toPx: (timelinePage.page + 2) * timelinePage.viewportPx,", "toPx: (timelinePage.page + 1) * timelinePage.viewportPx,")
elif n == 'W7':
    sub(W, "        autoScrollLeftRef.current = target;\n        notifyTimelineScroll();\n", "        autoScrollLeftRef.current = target;\n")
else:
    raise SystemExit('unknown ' + n)

# C339 own mutant MU-ENTRY-LATE: the entry ghost read happens after the cross moves, so (e) cannot advance. Predicted: only (e) fails.
import sys, pathlib
p = pathlib.Path(sys.argv[1]) / 'perf/studio-lab-interactions.perf.spec.ts'
s = p.read_text()
old = """      const entry = await readLaneGhosts(page, target.trackId);
      await page.mouse.move(grab.x + 2 * laneSegmentPx, target.y, { steps: laneSegmentSteps });
"""
new = """      await page.mouse.move(grab.x + 2 * laneSegmentPx, target.y, { steps: laneSegmentSteps });
      const entry = await readLaneGhosts(page, target.trackId);
"""
assert s.count(old) == 2
i = s.rindex(old)
p.write_text(s[:i] + new + s[i+len(old):])
print('MU-ENTRY-LATE applied')

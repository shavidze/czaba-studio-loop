import io

p = 'current-task.md'
s = io.open(p, encoding='utf-8').read()


def rep(old, new):
    global s
    assert s.count(old) == 1, old[:90]
    s = s.replace(old, new)


rep('''   - **Unmount (closes A round-26 gap M2c):**
     - after unmount, the master store **and** the track store have 0 listeners;
     - a publish after unmount writes nothing and throws nothing.''',
    '''   - **Unmount (closes A round-26 gap M2c).** Neither store exposes a listener count, and after unmount the refs are null, so "writes nothing" alone would be vacuous. Observe it like this, with no source change:
     1. mount the provider with a probe only and capture both stores (`useMasterMeterStore()` and the track store);
     2. replace the subscribe function on each plain store object with a wrapper that records a `vi.fn` around every returned unsubscribe;
     3. `rerender` to add `ArrangementMaster` and a lane (with its `ArrangementTrackMeter`);
     4. `unmount()`;
     5. assert that every recorded unsubscribe spy was called exactly once, and that a publish after unmount throws nothing.''')

rep('''  - (e) the track tap connected **before** `panner.connect(master)`. Frozen `graph.test.ts` or a new test must fail.''',
    '''  - (e) the track tap connected **before** `panner.connect(master)`. Frozen `graph.test.ts` or a new test must fail;
  - (f) the writer effect's cleanup removed (the subscription is never unsubscribed). The §2.6 unmount test must fail.''')

rep('''### 4.8 R27-TF: densities

At 1440 with `lay11`:
- fold the SFX lane (36 px) and play 4–6 s: the folded SFX meter moves (`data-level-db` > −60) and is visible in a screenshot;
- set one lane to tight (53 px) and one to regular (61 px): the meters move at both.''',
    '''### 4.8 R27-TF: densities

Which density is reachable where: tight is a height under 60 px, and audio lanes clamp at 60, so **tight exists only on the video lane** (min 52).
- **Full (81):** 1440 with `lay11`; every lane is 81. Play 8–12 s: the music and stems meters move.
- **Tight and regular:** 1280 with the detail panel open (the round-26 `53/61/61/61` layout). The video lane is 53 (tight), and the audio lanes are 61 (regular). Play 0–2 s: the video meter moves. Play 8–12 s: the music meter moves.
- **Folded (36):** fold the SFX lane with its fold button and play 4–6 s: the folded SFX meter moves (`data-level-db` > −60) and is visible in a screenshot.''')

rep('''- Every header control rect is identical to round 26 (C records them before any interaction, and compares with round 26 where recorded or with the `.sr-only`-free DOM math).
- The meter rect lies inside its header's bottom 6 px band and intersects no control, at folded/tight/regular/full.''',
    '''- **Header control rects (self-contained check):**
  1. C records every header control rect;
  2. C checks that the meter's computed `position` is `absolute`;
  3. C removes the meter elements from the live DOM (`element.remove()`, runtime only, no source change) and records the rects again.

  Every other rect must be identical.
- The meter rect lies inside its header's bottom 6 px band and intersects no control. Check all four densities as reached in R27-TF: full at 1440; tight (video) and regular (audio) at 1280 with the detail panel open; folded.''')

io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('ok')

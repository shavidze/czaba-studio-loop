import subprocess, shutil, sys, pathlib
M = pathlib.Path('/home/runner/czaba-project/tmp/studio-real-loop/a-round-83/mut/store')
S = pathlib.Path('/home/runner/czaba-project/store')
LOG = M.parent
G='app/lib/arrangement/graph.client.ts'; E='app/lib/arrangement/envelope.ts'; C='app/lib/arrangement/clipboard.ts'
UI='app/components/arrangement/ArrangementClipEnvelope.tsx'; AC='app/components/arrangement/ArrangementClip.tsx'
EV='app/lib/arrangement/__tests__/envelope.test.ts'; EU='app/lib/arrangement/__tests__/clip-envelope-ui.test.tsx'
muts = {
 'a-ramps-on-clipGain': (G, 'scheduleClipEnvelopeGain(envelopeGain, envelopeShape', 'scheduleClipEnvelopeGain(clipGain, envelopeShape', 1, [EV]),
 'b-initial-ignores-from': (G, 'const initial = clipEnvelopeGainAtSource(shape.points, firstSource);', 'const initial = shape.points[0]?.gain ?? 1;', 1, [EV]),
 'c-no-final-ramp': (G, """  envelopeGain.gain.linearRampToValueAtTime?.(
    clipEnvelopeGainAtSource(shape.points, lastSource),
    at(item.when + item.duration),
  );
""", '', 1, [EV]),
 'd1-materialInWindow-drops': (C, "        ...(clip.envelope === undefined ? {} : { envelope: clip.envelope }),\n", '', 1, [EV]),
 'd2-copyClips-drops': (C, "        ...(clip.envelope === undefined ? {} : { envelope: clip.envelope }),\n", '', 2, [EV]),
 'd3-paste-drops': (C, "      ...(item.envelope === undefined ? {} : { envelope: item.envelope }),\n", '', 1, [EV]),
 'e-export-omits': (G, "    clipEnvelopes: clipEnvelopeShapes(arrangement),\n", '', 1, [EV]),
 'f-move-ignores-neighbours': (E, "previous ? roundEnvelopeMs(previous.time + CLIP_ENVELOPE_MIN_GAP_SECONDS) : bounds.first", "bounds.first", 1, [EV, EU]),
 'f2-move-ignores-next-neighbour': (E, "following ? roundEnvelopeMs(following.time - CLIP_ENVELOPE_MIN_GAP_SECONDS) : bounds.last", "bounds.last", 1, [EV, EU]),
 'g-pointercancel-commits': (UI, "const cancelled = event.type === 'pointercancel';", "const cancelled = false;", 1, [EU]),
 'h-x1-guard-removed': (AC, "performance.now() - lastFadeDrag.at < CLIP_DRAG_DOUBLE_CLICK_GUARD_MS", "performance.now() - lastFadeDrag.at < 0", 1, [EU]),
 'i-add-uses-pointer-y': (UI, """    const next = addClipEnvelopePoint(
      before,
      clip.id,
      clip.start + (event.clientX - left) / pxPerSecond,
    );
""", """    const rect = event.currentTarget.parentElement?.getBoundingClientRect();
    const addedTime = clip.start + (event.clientX - left) / pxPerSecond;
    const withPoint = addClipEnvelopePoint(before, clip.id, addedTime);
    const next =
      withPoint === before
        ? before
        : moveClipEnvelopePoint(
            withPoint,
            clip.id,
            Math.round((clip.sourceOffset + addedTime - clip.start) * 1000) / 1000,
            addedTime,
            1 - (event.clientY - (rect?.top ?? 0)) / (rect?.height || 1),
          );
""", 1, [EU]),
 'j-unmount-keeps-preview': (UI, """        if (gesture.moved) {
          gesture.revert();
        }
        gesture.release();
      }
    },
    [],""", """        gesture.release();
      }
    },
    [],""", 1, [EU]),
}
only = sys.argv[1:]
summary = []
for name, (path, old, new, occurrence, tests) in muts.items():
    if only and name not in only: continue
    target = M / path
    original = (S / path).read_text()
    idx = -1
    for _ in range(occurrence):
        idx = original.index(old, idx + 1)
    mutated = original[:idx] + new + original[idx + len(old):]
    target.write_text(mutated)
    try:
        r = subprocess.run(['npx', 'vitest', 'run', *tests], cwd=M, capture_output=True, text=True, timeout=600)
        out = r.stdout + r.stderr
        (LOG / f'{name}.log').write_text(out)
        failed = [l.strip() for l in out.splitlines() if '×' in l]
        summary.append(f"{name}: exit={r.returncode} red={len(failed)} :: " + ' | '.join(failed[:4]))
    finally:
        target.write_text(original)
    assert target.read_text() == original
print('\n'.join(summary))
(LOG / 'summary.txt').write_text('\n'.join(summary) + '\n')

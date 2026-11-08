import subprocess, sys, os, json

# usage: python3 -I run.py <scratch> <loopdir>/b-round-416
S, B = sys.argv[1], sys.argv[2]
T = 'app/lib/arrangement/__tests__/'
MK = B + '/make-sketch.py'
OUT = B + '/mutants'


def reset(state):
    subprocess.run(['git', '-C', S, 'checkout', '-q', '.'], check=True)
    if state == 'sketch':
        subprocess.run(['python3', '-I', MK, S], check=True, capture_output=True)


def edit(path, old, new):
    p = S + '/' + path
    t = open(p).read()
    assert t.count(old) == 1, (path, old[:60], t.count(old))
    open(p, 'w').write(t.replace(old, new))


SLEEP = "      await act(async () => {\n        await new Promise((resolve) => setTimeout(resolve, {ms}));\n      });\n"

MUTANTS = {
    # wall-clock delay between the jump and the read (simulates a loaded runner)
    'MU-EN10-SLEEP600': (T + 'marker-edge-nav-ui.test.tsx', 'EN10', [
        (T + 'marker-edge-nav-ui.test.tsx',
         "      pressStep('ArrowRight');\n      expect(live(api).isPlaying).toBe(true);\n      expect(live(api).getLivePosition()).toBe",
         "      pressStep('ArrowRight');\n" + SLEEP.replace('{ms}', '600') + "      expect(live(api).isPlaying).toBe(true);\n      expect(live(api).getLivePosition()).toBe"),
        (T + 'marker-edge-nav-ui.test.tsx',
         "      pressStep('ArrowRight');\n      expect(live(api).isPlaying).toBe(true);\n      expect(live(api).getLivePosition()).toBeGreaterThanOrEqual(2.25);",
         "      pressStep('ArrowRight');\n" + SLEEP.replace('{ms}', '600') + "      expect(live(api).isPlaying).toBe(true);\n      expect(live(api).getLivePosition()).toBeGreaterThanOrEqual(2.25);"),
    ]),
    # wall-clock delay right after Play, before the first frame
    'MU-VDS3-SLEEP200': (T + 'video-dock-strings-ui.test.tsx', 'VDS3', [
        (T + 'video-dock-strings-ui.test.tsx',
         "    act(() => live(api).togglePlayback());\n    expect(live(api).isPlaying).toBe(true);\n    flushFrames();",
         "    act(() => live(api).togglePlayback());\n    expect(live(api).isPlaying).toBe(true);\n" + SLEEP.replace('      ', '    ').replace('{ms}', '200') + "    flushFrames();"),
        (T + 'video-dock-strings-ui.test.tsx',
         "    act(() => live(api).togglePlayback());\n    expect(live(api).isPlaying).toBe(true);\n    await waitFor(() => {",
         "    act(() => live(api).togglePlayback());\n    expect(live(api).isPlaying).toBe(true);\n" + SLEEP.replace('      ', '    ').replace('{ms}', '200') + "    await waitFor(() => {"),
    ]),
    # stalled wall clock after Play: the row must not need real time to pass
    'MU-SF11-STALL': (T + 'schedule-failure-ui.test.tsx', 'SF11', [
        (T + 'schedule-failure-ui.test.tsx',
         "    act(() => live(api).togglePlayback());\n    expect(live(api).isPlaying).toBe(true);\n    meterSignal.value",
         "    act(() => live(api).togglePlayback());\n    expect(live(api).isPlaying).toBe(true);\n    vi.spyOn(Date, 'now').mockReturnValue(Date.now());\n    meterSignal.value"),
    ]),
    # A-R415-REVIEW-L1: dropping the stub flag must turn SF11 red
    'MU-SF11-NOFLAG': (T + 'schedule-failure-ui.test.tsx', 'SF11', [
        (T + 'schedule-failure-ui.test.tsx',
         "      captureFrames: true,\n      stubSetInterval: true,\n      resizeObserver: true,",
         "      captureFrames: true,\n      resizeObserver: true,"),
    ]),
    # source mutant: full build instead of the window walk
    'MU-BW5-FULLBUILD': ('app/lib/arrangement/tempo.ts', 'BW5', [
        ('app/lib/arrangement/tempo.ts',
         "  const firstBar = Math.max(0, (Math.floor(windowBar / barStep) - 1) * barStep);",
         "  const firstBar = 0 * windowBar;"),
        ('app/lib/arrangement/tempo.ts',
         "    if (rulerWindow !== undefined && barTime * pxPerSecond > rulerWindow.toPx) {\n      break;\n    }\n",
         ""),
    ]),
    # source mutant: the end-stop in the rAF tick never fires (C-R326-01)
    'MU-IM24-NO-ENDSTOP': ('app/contexts/ArrangementContext.tsx', 'IM24', [
        ('app/contexts/ArrangementContext.tsx',
         "    if (!loopScheduleRef.current && current >= end) {",
         "    if (!loopScheduleRef.current && current >= end && end < 0) {"),
    ]),
}

FILES = {'EN10': 'marker-edge-nav-ui.test.tsx', 'VDS3': 'video-dock-strings-ui.test.tsx',
         'SF11': 'schedule-failure-ui.test.tsx', 'BW5': 'tempo-window.test.ts', 'IM24': 'insert-marker-ui.test.tsx'}

reset('head')
guard = open(S + '/' + T + 'marker-edge-nav-ui.test.tsx').read().count('toBeLessThan(2.75)')
assert guard == 1, 'scratch base is not HEAD 344a59f (K10 EN10-window must be 1): extract git archive HEAD, commit, apply nothing'

summary = []
for name, (_, row, edits) in MUTANTS.items():
    for state in ('head', 'sketch'):
        reset(state)
        applied = 0
        for path, old, new in edits:
            t = open(S + '/' + path).read()
            if t.count(old) == 1:
                open(S + '/' + path, 'w').write(t.replace(old, new))
                applied += 1
        log = f'{OUT}/{name}-{state}.log'
        r = subprocess.run(['npx', 'vitest', 'run', T + FILES[row], '-t', row], cwd=S,
                           capture_output=True, text=True, timeout=600)
        open(log, 'w').write(r.stdout + r.stderr)
        result = 'green' if r.returncode == 0 else 'red'
        summary.append(f'{name} {state} applied={applied} {result} rc={r.returncode}')
        print(summary[-1], flush=True)
reset('head')
open(OUT + '/summary.txt', 'w').write('\n'.join(summary) + '\n')

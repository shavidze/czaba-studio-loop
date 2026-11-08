import sys, re
root = sys.argv[1] + '/app/lib/arrangement/__tests__/'

def cut(text, start, end, repl=''):
    i = text.index(start)
    j = text.index(end, i) + len(end)
    return text[:i] + repl + text[j:]

def sub(text, old, new):
    assert text.count(old) == 1, (old[:60], text.count(old))
    return text.replace(old, new)

IMPORT = "import { createFakeWebAudio } from './helpers/fake-web-audio';\n"

# schedule-failure-ui
p = root + 'schedule-failure-ui.test.tsx'
t = open(p).read()
t = sub(t, "import { useWorkspaceProbe, type WorkspaceProbeValue } from './helpers/workspace-probe';\n",
        IMPORT + "import { useWorkspaceProbe, type WorkspaceProbeValue } from './helpers/workspace-probe';\n")
t = cut(t, "const fakeClock = { base: 0 };\n", "    return new Float32Array(this.length);\n  }\n}\n",
        "const { startFailure, createdSources, meterSignal, frames, armStartFailure, install, runFrames } =\n  createFakeWebAudio();\n")
t = sub(t, "function armStartFailure(nth: number) {\n  startFailure.armedAt = nth;\n  startFailure.calls = 0;\n}\n\n", "")
t = sub(t, """    errors.length = 0;
    createdSources.length = 0;
    startFailure.armedAt = 0;
    startFailure.calls = 0;
    startFailure.thrown = 0;
    fakeClock.base = Date.now() / 1000 - 5;
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
    vi.stubGlobal('requestAnimationFrame', () => 1);
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
""", """    errors.length = 0;
    install({ clockLeadSeconds: 5 });
""")
t = cut(t, "const meterSignal = { value: 0 };\n\n", "class FakeResizeObserver {\n  observe() {}\n  disconnect() {}\n}\n\n")
t = sub(t, "  const errors: unknown[] = [];\n  const frames: FrameRequestCallback[] = [];\n", "  const errors: unknown[] = [];\n")
t = sub(t, """    errors.length = 0;
    frames.length = 0;
    createdSources.length = 0;
    startFailure.armedAt = 0;
    startFailure.calls = 0;
    startFailure.thrown = 0;
    meterSignal.value = 0;
    fakeClock.base = Date.now() / 1000 - 5;
    vi.stubGlobal('AudioContext', MeteredFailureAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
    vi.stubGlobal('setInterval', () => 0);
""", """    errors.length = 0;
    install({
      metered: true,
      captureFrames: true,
      stubSetInterval: true,
      resizeObserver: true,
      clockLeadSeconds: 5,
    });
""")
t = sub(t, """  function runFrames(count: number) {
    for (let index = 0; index < count; index++) {
      const pending = frames.splice(0, frames.length);
      act(() => {
        for (const frame of pending) {
          frame(performance.now());
        }
      });
    }
  }

""", "")
open(p, 'w').write(t)

# master-hold-tick
p = root + 'master-hold-tick.test.tsx'
t = open(p).read()
t = sub(t, "import { useWorkspaceProbe, type WorkspaceProbeValue } from './helpers/workspace-probe';\n",
        IMPORT + "import { useWorkspaceProbe, type WorkspaceProbeValue } from './helpers/workspace-probe';\n")
t = cut(t, "const fakeClock = { base: 0 };\nconst meterSignal = { value: 0 };\n",
        "class FakeResizeObserver {\n  observe() {}\n  disconnect() {}\n}\n",
        "const { meterSignal, install, runFrames } = createFakeWebAudio();\n")
t = sub(t, """  const frames: FrameRequestCallback[] = [];

  beforeEach(() => {
    frames.length = 0;
    meterSignal.value = 0;
    fakeClock.base = Date.now() / 1000;
    vi.stubGlobal('AudioContext', MeteredAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
""", """  beforeEach(() => {
    install({ metered: true, captureFrames: true, resizeObserver: true });
""")
t = sub(t, """  function runFrames(count = 1) {
    for (let index = 0; index < count; index++) {
      const pending = frames.splice(0, frames.length);
      act(() => {
        for (const frame of pending) {
          frame(performance.now());
        }
      });
    }
  }

""", "")
open(p, 'w').write(t)

# decoded-buffer-eviction-ui
p = root + 'decoded-buffer-eviction-ui.test.tsx'
t = open(p).read()
t = sub(t, "import { useWorkspaceProbe, type WorkspaceProbeValue } from './helpers/workspace-probe';\n",
        IMPORT + "import { useWorkspaceProbe, type WorkspaceProbeValue } from './helpers/workspace-probe';\n")
t = cut(t, "const fakeClock = { base: 0 };\n", "    return new Float32Array(this.length);\n  }\n}\n",
        "const { createdSources, install } = createFakeWebAudio();\n")
t = sub(t, """    createdSources.length = 0;
    fakeClock.base = Date.now() / 1000;
""", "")
t = sub(t, """    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
    vi.stubGlobal('requestAnimationFrame', () => 1);
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
""", "    install();\n")
open(p, 'w').write(t)
print('ok')

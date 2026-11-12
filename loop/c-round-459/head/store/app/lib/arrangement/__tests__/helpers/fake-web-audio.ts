import { act } from '@testing-library/react';
import { vi } from 'vitest';

export interface FakeWebAudioInstallOptions {
  metered?: boolean;
  captureFrames?: boolean;
  stubSetInterval?: boolean;
  resizeObserver?: boolean;
  clockLeadSeconds?: number;
}

export function createFakeWebAudio() {
  const fakeClock = { base: 0 };
  const meterSignal = { value: 0 };
  const startFailure = { armedAt: 0, calls: 0, thrown: 0 };
  const frames: FrameRequestCallback[] = [];

  class FakeParam {
    value = 0;
    setTargetAtTime(target: number) {
      this.value = target;
    }
    setValueAtTime() {}
    linearRampToValueAtTime() {}
  }

  class FakeNode {
    connect(destination: FakeNode) {
      return destination;
    }
    disconnect() {}
  }

  class FakeGain extends FakeNode {
    gain = new FakeParam();
  }

  class FakePanner extends FakeNode {
    pan = new FakeParam();
  }

  class FakeSource extends FakeNode {
    buffer: unknown = null;
    onended: (() => void) | null = null;
    started = false;
    stops = 0;
    start() {
      if (startFailure.armedAt > 0) {
        startFailure.calls += 1;
        if (startFailure.calls === startFailure.armedAt) {
          startFailure.armedAt = 0;
          startFailure.calls = 0;
          startFailure.thrown += 1;
          throw new Error('injected start failure');
        }
      }
      this.started = true;
    }
    stop() {
      this.stops += 1;
    }
  }

  const createdSources: FakeSource[] = [];

  class FakeAudioContext {
    state = 'running';
    destination = new FakeNode();
    sampleRate = 48000;
    get currentTime() {
      return Date.now() / 1000 - fakeClock.base;
    }
    resume() {
      return Promise.resolve();
    }
    close() {
      return Promise.resolve();
    }
    createGain() {
      return new FakeGain();
    }
    createStereoPanner() {
      return new FakePanner();
    }
    createBufferSource() {
      const source = new FakeSource();
      createdSources.push(source);
      return source;
    }
  }

  class FakeAnalyser extends FakeNode {
    fftSize = 2048;
    getFloatTimeDomainData(target: Float32Array) {
      target.fill(meterSignal.value);
    }
  }

  class FakeSplitter extends FakeNode {}

  class MeteredAudioContext extends FakeAudioContext {
    createChannelSplitter() {
      return new FakeSplitter();
    }
    createAnalyser() {
      return new FakeAnalyser();
    }
  }

  class FakeOfflineAudioContext {}

  class FakeAudioBuffer {
    readonly length: number;
    readonly numberOfChannels: number;
    readonly sampleRate: number;
    constructor(options: { length: number; numberOfChannels: number; sampleRate: number }) {
      this.length = options.length;
      this.numberOfChannels = options.numberOfChannels;
      this.sampleRate = options.sampleRate;
    }
    get duration() {
      return this.length / this.sampleRate;
    }
    getChannelData() {
      return new Float32Array(this.length);
    }
  }

  class FakeResizeObserver {
    observe() {}
    disconnect() {}
  }

  function armStartFailure(nth: number) {
    startFailure.armedAt = nth;
    startFailure.calls = 0;
  }

  function install(options: FakeWebAudioInstallOptions = {}) {
    frames.length = 0;
    createdSources.length = 0;
    startFailure.armedAt = 0;
    startFailure.calls = 0;
    startFailure.thrown = 0;
    meterSignal.value = 0;
    fakeClock.base = Date.now() / 1000 - (options.clockLeadSeconds ?? 0);
    vi.stubGlobal('AudioContext', options.metered ? MeteredAudioContext : FakeAudioContext);
    vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
    vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
    if (options.resizeObserver) {
      vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    }
    if (options.captureFrames) {
      vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
        frames.push(callback);
        return frames.length;
      });
    } else {
      vi.stubGlobal('requestAnimationFrame', () => 1);
    }
    vi.stubGlobal('cancelAnimationFrame', () => undefined);
    if (options.stubSetInterval) {
      const stub = () => 0;
      vi.stubGlobal('setInterval', stub);
      if (!Object.is(window.setInterval, stub)) {
        throw new Error('the setInterval stub did not replace window.setInterval');
      }
    }
  }

  function runFrames(count = 1) {
    for (let index = 0; index < count; index++) {
      const pending = frames.splice(0, frames.length);
      act(() => {
        for (const frame of pending) {
          frame(performance.now());
        }
      });
    }
  }

  return {
    fakeClock,
    FakeAudioContext,
    MeteredAudioContext,
    FakeOfflineAudioContext,
    FakeAudioBuffer,
    FakeResizeObserver,
    meterSignal,
    startFailure,
    frames,
    createdSources,
    armStartFailure,
    install,
    runFrames,
  };
}

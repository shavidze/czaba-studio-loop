import { act, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import { ArrangementProvider } from '~/contexts/ArrangementContext';
import type { WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';
import { OVERVIEW_HIDDEN_STORAGE_KEY } from '../overview-visibility';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

class FakeParam {
  value = 0;
  setTargetAtTime(target: number) {
    this.value = target;
  }
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
  start() {}
  stop() {}
}

class FakeAudioContext {
  state = 'running';
  destination = new FakeNode();
  sampleRate = 48000;
  currentTime = 0;
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
    return new FakeSource();
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

const persistCollection: WorkspaceCollection = {
  id: 'overview-persist',
  label: 'overview-persist',
  origin: 'demo',
  sources: [
    {
      id: 'song',
      title: 'Song',
      collectionLabel: 'overview-persist',
      kind: 'music',
      origin: 'demo',
    },
  ],
  loadSource: () =>
    Promise.resolve(new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 })),
};

function persistWorkspace() {
  return (
    <ArrangementProvider
      collection={persistCollection}
      initialArrangement={createArrangement([
        { id: 'video', kind: 'video', name: 'Video' },
        { id: 'music', kind: 'audio', name: 'Music' },
      ])}
    >
      <StudioWorkspace />
    </ArrangementProvider>
  );
}

beforeEach(() => {
  window.localStorage.clear();
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  vi.stubGlobal('requestAnimationFrame', () => 1);
  vi.stubGlobal('cancelAnimationFrame', () => undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
});

afterEach(() => {
  window.localStorage.clear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('CALM-3 remembered Overview visibility (SABA-B-8)', () => {
  it('OV-T3: the server renders the Overview; a client mount reads the remembered hidden choice', async () => {
    window.localStorage.setItem(OVERVIEW_HIDDEN_STORAGE_KEY, '1');
    const serverError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const html = renderToString(persistWorkspace());
    serverError.mockRestore();
    expect(html).toContain('data-testid="arrangement-overview"');
    expect(html).not.toContain('data-testid="arrangement-overview-hidden-slot"');
    const view = render(persistWorkspace());
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(view.queryByTestId('arrangement-overview')).toBeNull();
    expect(view.getByTestId('arrangement-overview-hidden-slot').getAttribute('aria-hidden')).toBe(
      'true',
    );
  });
});

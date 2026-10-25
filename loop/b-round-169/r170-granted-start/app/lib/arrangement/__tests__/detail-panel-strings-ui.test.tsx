import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const fakeClock = { base: 0 };

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

const stringsCollection: WorkspaceCollection = {
  id: 'detail-strings',
  label: 'detail-strings',
  origin: 'demo',
  sources: [
    { id: 'song', title: 'Song', collectionLabel: 'detail-strings', kind: 'music', origin: 'demo' },
    { id: 'hit', title: 'Hit', collectionLabel: 'detail-strings', kind: 'sfx', origin: 'demo' },
  ],
  loadSource: async () => new AudioBuffer({ length: 2000, numberOfChannels: 1, sampleRate: 100 }),
};

function stringsArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'Video' },
    { id: 'music', kind: 'audio', name: 'Music' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
  ]);
  return {
    ...base,
    clips: [
      { id: 'music-1', trackId: 'music', sourceId: 'song', start: 2, sourceOffset: 1, duration: 8 },
      { id: 'hit-1', trackId: 'sfx', sourceId: 'hit', start: 12, sourceOffset: 0, duration: 2 },
    ],
  };
}

interface StringsApiRef {
  current: ArrangementContextValue | null;
}

function StringsProbe({ api }: { api: StringsApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: StringsApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function mountStringsWorkspace() {
  const api: StringsApiRef = { current: null };
  const view = render(
    <ArrangementProvider collection={stringsCollection} initialArrangement={stringsArrangement()}>
      <StudioWorkspace />
      <StringsProbe api={api} />
    </ArrangementProvider>,
  );
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  const panel = view.getByTestId('arrangement-detail-panel');
  const separator = view.getByTestId('arrangement-detail-separator');
  const toggle = view.getByTestId('arrangement-detail-toggle');
  return { api, view, panel, separator, toggle };
}

function openDetailPanel(panel: HTMLElement, toggle: HTMLElement) {
  if (panel.dataset.collapsed === 'true') {
    fireEvent.click(toggle);
  }
}

function detailInputByTestId(view: ReturnType<typeof render>, testId: string): HTMLInputElement {
  const input = view.getByTestId(testId);
  if (!(input instanceof HTMLInputElement)) {
    throw new Error(`${testId} is not an input`);
  }
  return input;
}

describe('Clip Detail panel English strings (V-0.4e, D-29z107)', () => {
  beforeEach(() => {
    fakeClock.base = Date.now() / 1000;
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
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('DPS1: nothing selected — panel name, header, hint, separator and toggle in both states', async () => {
    const { view, panel, separator, toggle } = await mountStringsWorkspace();
    expect(panel.getAttribute('aria-label')).toBe('Clip details');
    expect(panel.querySelector('h2')?.textContent).toBe('Clip details');
    expect(view.getByTestId('arrangement-detail-header-label').textContent).toBe(
      'Nothing selected',
    );
    expect(separator.getAttribute('aria-label')).toBe('Details height');
    const height = separator.getAttribute('aria-valuenow');
    expect(height).toBeTruthy();
    const assertOpen = () => {
      expect(panel.dataset.collapsed).toBe('false');
      expect(toggle.getAttribute('aria-label')).toBe('Collapse details');
      expect(toggle.textContent).toBe('Collapse');
      expect(separator.getAttribute('aria-valuetext')).toBe(`${height} px`);
      expect(view.getByTestId('arrangement-detail-hint').textContent).toBe(
        'Select a clip to see its details',
      );
    };
    const assertCollapsed = () => {
      expect(panel.dataset.collapsed).toBe('true');
      expect(toggle.getAttribute('aria-label')).toBe('Expand details');
      expect(toggle.textContent).toBe('Expand');
      expect(separator.getAttribute('aria-valuetext')).toBe(`collapsed · ${height} px`);
    };
    if (panel.dataset.collapsed === 'true') {
      assertCollapsed();
      fireEvent.click(toggle);
      assertOpen();
    } else {
      assertOpen();
      fireEvent.click(toggle);
      assertCollapsed();
    }
  });

  it('DPS2: one audio clip — info labels, source note, range labels, apply and reset in English', async () => {
    const { api, view, panel, toggle } = await mountStringsWorkspace();
    act(() => live(api).selectClip('music-1'));
    openDetailPanel(panel, toggle);
    const content = view.getByTestId('arrangement-detail-content');
    const info = content.firstElementChild;
    if (!info) {
      throw new Error('info column missing');
    }
    expect(
      Array.from(info.querySelectorAll('span.text-dim')).map((span) => span.textContent),
    ).toEqual(['Track', 'Start', 'Length', 'Source offset']);
    expect(content.textContent).toContain('The source file stays unchanged');
    const start = detailInputByTestId(view, 'arrangement-detail-start');
    const end = detailInputByTestId(view, 'arrangement-detail-end');
    expect(start.closest('label')?.firstChild?.textContent).toBe('From, s');
    expect(end.closest('label')?.firstChild?.textContent).toBe('To, s');
    expect(start.getAttribute('aria-label')).toBe('Time selection start (seconds)');
    expect(end.getAttribute('aria-label')).toBe('Time selection end (seconds)');
    expect(view.getByTestId('arrangement-detail-apply').textContent).toBe('Set selection');
    expect(view.getByTestId('arrangement-detail-clip-gain-reset').getAttribute('aria-label')).toBe(
      'Reset Clip Gain (0 dB)',
    );
  });

  it('DPS3: an uncommitted Clip Gain shows the English pending label with the full hint', async () => {
    const { api, view, panel, toggle } = await mountStringsWorkspace();
    act(() => live(api).selectClip('music-1'));
    openDetailPanel(panel, toggle);
    fireEvent.change(detailInputByTestId(view, 'arrangement-detail-clip-gain-input'), {
      target: { value: '3' },
    });
    const pending = view.getByTestId('arrangement-detail-clip-gain-pending');
    expect(pending.getAttribute('title')).toBe('Unsaved — Enter saves, Esc reverts');
    expect(pending.childNodes[0]?.nodeType).toBe(Node.TEXT_NODE);
    expect(pending.childNodes[0]?.nodeValue).toBe('Unsaved');
    expect(pending.querySelector('.sr-only')?.textContent).toBe(' — Enter saves, Esc reverts');
    expect(pending.textContent).toBe('Unsaved — Enter saves, Esc reverts');
  });

  it('DPS4: two clips — header, group block, Tracks label, note and range reason in English', async () => {
    const { api, view, panel, toggle } = await mountStringsWorkspace();
    act(() => live(api).selectClips(['music-1', 'hit-1']));
    openDetailPanel(panel, toggle);
    expect(view.getByTestId('arrangement-detail-header-label').textContent).toBe('2 clips');
    const group = view.getByTestId('arrangement-detail-group');
    expect(group.firstElementChild?.textContent).toBe('2 clips');
    expect(
      Array.from(group.querySelectorAll('span.text-dim')).map((span) => span.textContent),
    ).toContain('Tracks');
    expect(group.textContent).toContain(
      'The selected clips move together · Delete deletes them · Ctrl+D duplicates them',
    );
    expect(detailInputByTestId(view, 'arrangement-detail-start').title).toBe(
      'A time selection is set on one clip — select only one',
    );
    expect(detailInputByTestId(view, 'arrangement-detail-end').title).toBe(
      'A time selection is set on one clip — select only one',
    );
  });

  it('DPS5: the detail toggle shows the word plus a ChevronDown or ChevronRight icon (D-29z131)', async () => {
    const { panel, toggle } = await mountStringsWorkspace();
    expect(toggle.className.split(' ')).toEqual(
      expect.arrayContaining(['inline-flex', 'items-center', 'gap-0.5', 'pl-2', 'pr-1']),
    );
    expect(toggle.className.split(' ')).not.toContain('px-2');
    const assertIcon = (expected: string, absent: string) => {
      const icons = toggle.querySelectorAll('svg');
      expect(icons).toHaveLength(1);
      const icon = icons[0];
      expect(icon.classList.contains(expected)).toBe(true);
      expect(toggle.querySelector(`svg.${absent}`)).toBeNull();
      expect(icon.getAttribute('aria-hidden')).toBe('true');
      expect(icon.classList.contains('size-2.5')).toBe(true);
      expect(icon.classList.contains('shrink-0')).toBe(true);
      expect(icon.getAttribute('stroke-width')).toBe('2.4');
    };
    const assertOpen = () => {
      expect(panel.dataset.collapsed).toBe('false');
      assertIcon('lucide-chevron-down', 'lucide-chevron-right');
      expect(toggle.textContent).toBe('Collapse');
      expect(toggle.getAttribute('aria-label')).toBe('Collapse details');
    };
    const assertCollapsed = () => {
      expect(panel.dataset.collapsed).toBe('true');
      assertIcon('lucide-chevron-right', 'lucide-chevron-down');
      expect(toggle.textContent).toBe('Expand');
      expect(toggle.getAttribute('aria-label')).toBe('Expand details');
    };
    if (panel.dataset.collapsed === 'true') {
      assertCollapsed();
      fireEvent.click(toggle);
      assertOpen();
    } else {
      assertOpen();
      fireEvent.click(toggle);
      assertCollapsed();
    }
  });
});

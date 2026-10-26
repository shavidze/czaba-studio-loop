import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type {
  Arrangement,
  ArrangementClip,
  WorkspaceCollection,
  WorkspaceSource,
} from '~/types/arrangement';
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

class ControlledResizeObserver {
  observe() {}
  disconnect() {}
}

const SOURCE_LENGTHS: Record<string, number> = { song: 4000, stem: 1000, hit: 200 };

const mixerOnstateCollection: WorkspaceCollection = {
  id: 'mixer-onstate-colour',
  label: 'mixer-onstate-colour',
  origin: 'demo',
  sources: [
    {
      id: 'song',
      title: 'Song',
      collectionLabel: 'mixer-onstate-colour',
      kind: 'music',
      origin: 'demo',
    },
    {
      id: 'stem',
      title: 'Stem',
      collectionLabel: 'mixer-onstate-colour',
      kind: 'stem',
      origin: 'demo',
    },
    {
      id: 'hit',
      title: 'Hit',
      collectionLabel: 'mixer-onstate-colour',
      kind: 'sfx',
      origin: 'demo',
    },
  ],
  loadSource: async (source: WorkspaceSource) =>
    new AudioBuffer({
      length: SOURCE_LENGTHS[source.id] ?? 100,
      numberOfChannels: 1,
      sampleRate: 100,
    }),
};

const MIXER_CLIPS: ArrangementClip[] = [
  { id: 'cm', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 10 },
  { id: 'cs', trackId: 'stems', sourceId: 'stem', start: 2, sourceOffset: 0, duration: 6 },
  { id: 'cx', trackId: 'sfx', sourceId: 'hit', start: 4, sourceOffset: 0, duration: 2 },
];

function mixerOnstateArrangement(): Arrangement {
  return {
    ...createArrangement([
      { id: 'video', kind: 'video', name: 'ვიდეო' },
      { id: 'music', kind: 'audio', name: 'მუსიკა' },
      { id: 'stems', kind: 'audio', name: 'სტემები' },
      { id: 'sfx', kind: 'audio', name: 'SFX' },
    ]),
    clips: MIXER_CLIPS,
  };
}

interface MixerApiRef {
  current: ArrangementContextValue | null;
}

function MixerProbe({ api }: { api: MixerApiRef }) {
  api.current = useArrangement();
  return null;
}

function liveMixer(api: MixerApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

async function mountMixerOnstateWorkspace() {
  const api: MixerApiRef = { current: null };
  const view = render(
    <ArrangementProvider
      collection={mixerOnstateCollection}
      initialArrangement={mixerOnstateArrangement()}
    >
      <StudioWorkspace />
      <MixerProbe api={api} />
    </ArrangementProvider>,
  );
  for (
    let tick = 0;
    tick < 10 && ['song', 'stem', 'hit'].some((id) => !liveMixer(api).sourceDurations.has(id));
    tick++
  ) {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  }
  act(() => liveMixer(api).setPxPerSecond(40));
  return view;
}

type MixerView = ReturnType<typeof render>;

const MUTE_ON_TOKENS = [
  'border-muted',
  'bg-muted',
  'text-background',
  'enabled:hover:bg-muted',
  'enabled:active:bg-muted',
];
const SOLO_ON_TOKENS = [
  'border-foreground',
  'bg-foreground',
  'text-background',
  'enabled:hover:bg-foreground',
  'enabled:active:bg-foreground',
];
const MIXED_SOLO_TOKENS = [
  'border-foreground',
  'bg-gradient-to-r',
  'from-foreground/40',
  'from-50%',
  'to-transparent',
  'to-50%',
  'text-foreground',
];
const OFF_TOKENS = ['bg-foreground/5', 'border-transparent', 'text-muted'];
const ON_DROPPED_TOKENS = [
  'bg-foreground/5',
  'border-transparent',
  'enabled:hover:bg-foreground/8',
  'enabled:active:bg-foreground/12',
];

const APP_ROOT = resolve(__dirname, '../../..');
const LANE_PATH = 'components/arrangement/ArrangementLane.tsx';
const GROUP_HEADER_PATH = 'components/arrangement/ArrangementGroupHeader.tsx';
const MASTER_PATH = 'components/arrangement/ArrangementMaster.tsx';
const DETAIL_PATH = 'components/arrangement/ArrangementDetailPanel.tsx';
const MUTE_ON_SOURCE =
  'border-muted bg-muted text-background enabled:hover:bg-muted enabled:active:bg-muted';
const SOLO_ON_SOURCE =
  'border-foreground bg-foreground text-background enabled:hover:bg-foreground enabled:active:bg-foreground';
const MIXED_SOLO_SOURCE =
  'border-foreground bg-gradient-to-r from-foreground/40 from-50% to-transparent to-50% text-foreground';

function mixerTokens(element: Element | null | undefined, label: string): string[] {
  if (!element) {
    throw new Error(`${label} missing`);
  }
  return (element.getAttribute('class') ?? '').split(/\s+/).filter((token) => token.length > 0);
}

function brassTokens(tokens: string[]): string[] {
  return tokens.filter(
    (token) =>
      (token.includes('brand') || token.includes('accent')) && token !== 'focus-visible:ring-brand',
  );
}

function expectMixerTokens(
  element: HTMLElement,
  label: string,
  expected: string[],
  excluded: string[],
) {
  const tokens = mixerTokens(element, label);
  expect(tokens, label).toEqual(expect.arrayContaining(expected));
  for (const token of excluded) {
    expect(tokens, `${label} keeps ${token}`).not.toContain(token);
  }
  expect(brassTokens(tokens), `${label} brass`).toStrictEqual([]);
  return tokens;
}

function readMixerSource(path: string): string {
  return readFileSync(resolve(APP_ROOT, path), 'utf8');
}

function countMixerOccurrences(source: string, needle: string): number {
  return source.split(needle).length - 1;
}

function escapeMixerRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function laneButton(view: MixerView, prefix: 'Mute' | 'Solo', track: string): HTMLElement {
  return view.getByRole('button', {
    name: new RegExp(`^${prefix} — ${escapeMixerRegExp(track)}`),
  });
}

function laneNameButton(view: MixerView, name: string): HTMLElement {
  return view.getByRole('button', {
    name: new RegExp(`^${escapeMixerRegExp(name)} — set as the active track`),
  });
}

function groupNameButton(view: MixerView, name: string): HTMLElement {
  return view.getByRole('button', { name: new RegExp(`^${escapeMixerRegExp(name)} — group`) });
}

function groupMixControl(
  view: MixerView,
  name: string,
  testId: 'arrangement-group-mute' | 'arrangement-group-solo',
): HTMLElement {
  const row = groupNameButton(view, name).closest<HTMLElement>('[data-group-id]');
  if (!row) {
    throw new Error(`group row ${name} missing`);
  }
  const control = row.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
  if (!control) {
    throw new Error(`${testId} missing on ${name}`);
  }
  return control;
}

function pressGroupShortcut() {
  fireEvent.keyDown(document.body, { key: 'g', code: 'KeyG', ctrlKey: true });
}

beforeEach(() => {
  fakeClock.base = Date.now() / 1000;
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  vi.stubGlobal('AudioBuffer', FakeAudioBuffer);
  vi.stubGlobal('ResizeObserver', ControlledResizeObserver);
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

describe('DUX-R-5b-2a mixer on-states are neutral and distinct', { timeout: 20_000 }, () => {
  it('DXM1: track Mute on is a filled muted grey, off is unchanged, a second click turns it off', async () => {
    const view = await mountMixerOnstateWorkspace();
    const mute = laneButton(view, 'Mute', 'მუსიკა');
    expect(mute.getAttribute('aria-pressed')).toBe('false');
    expectMixerTokens(mute, 'track Mute off', OFF_TOKENS, []);

    fireEvent.click(mute);
    expect(mute.getAttribute('aria-pressed')).toBe('true');
    expectMixerTokens(mute, 'track Mute on', MUTE_ON_TOKENS, ON_DROPPED_TOKENS);

    fireEvent.click(mute);
    expect(mute.getAttribute('aria-pressed')).toBe('false');
    expectMixerTokens(mute, 'track Mute off again', OFF_TOKENS, MUTE_ON_TOKENS);
  });

  it('DXM2: track Solo on is a filled light, distinct from Mute on in bg', async () => {
    const view = await mountMixerOnstateWorkspace();
    const solo = laneButton(view, 'Solo', 'მუსიკა');
    expect(solo.getAttribute('aria-pressed')).toBe('false');
    expectMixerTokens(solo, 'track Solo off', OFF_TOKENS, []);

    fireEvent.click(solo);
    expect(solo.getAttribute('aria-pressed')).toBe('true');
    const soloOn = expectMixerTokens(solo, 'track Solo on', SOLO_ON_TOKENS, [
      ...ON_DROPPED_TOKENS,
      'text-brand-foreground',
    ]);

    const mute = laneButton(view, 'Mute', 'მუსიკა');
    fireEvent.click(mute);
    expect(mute.getAttribute('aria-pressed')).toBe('true');
    const muteOn = mixerTokens(mute, 'track Mute on');
    const bgOf = (tokens: string[]) =>
      tokens.filter((token) => token.startsWith('bg-') && !token.startsWith('bg-gradient'));
    expect(bgOf(muteOn)).toStrictEqual(['bg-muted']);
    expect(bgOf(soloOn)).toStrictEqual(['bg-foreground']);
    expect(bgOf(muteOn)).not.toStrictEqual(bgOf(soloOn));

    fireEvent.click(solo);
    expect(solo.getAttribute('aria-pressed')).toBe('false');
    expectMixerTokens(solo, 'track Solo off again', OFF_TOKENS, SOLO_ON_TOKENS);
  });

  it('DXM3: group Mute / Solo on follow the track recipe and the mixed parent Solo is a light half', async () => {
    const view = await mountMixerOnstateWorkspace();
    fireEvent.click(laneNameButton(view, 'სტემები'));
    fireEvent.click(laneNameButton(view, 'SFX'), { shiftKey: true });
    pressGroupShortcut();

    const groupMute = groupMixControl(view, 'Group 1', 'arrangement-group-mute');
    expectMixerTokens(groupMute, 'group Mute off', OFF_TOKENS, []);
    fireEvent.click(groupMute);
    const groupMuteOn = groupMixControl(view, 'Group 1', 'arrangement-group-mute');
    expect(groupMuteOn.getAttribute('aria-pressed')).toBe('true');
    expectMixerTokens(groupMuteOn, 'group Mute on', MUTE_ON_TOKENS, ON_DROPPED_TOKENS);
    fireEvent.click(groupMuteOn);
    expect(groupMixControl(view, 'Group 1', 'arrangement-group-mute').dataset.mute).toBe('off');

    fireEvent.click(groupMixControl(view, 'Group 1', 'arrangement-group-solo'));
    const groupSoloOn = groupMixControl(view, 'Group 1', 'arrangement-group-solo');
    expect(groupSoloOn.getAttribute('aria-pressed')).toBe('true');
    expectMixerTokens(groupSoloOn, 'group Solo on', SOLO_ON_TOKENS, [
      ...ON_DROPPED_TOKENS,
      'text-brand-foreground',
    ]);
    fireEvent.click(groupSoloOn);
    expect(groupMixControl(view, 'Group 1', 'arrangement-group-solo').dataset.solo).toBe('off');

    fireEvent.click(laneNameButton(view, 'მუსიკა'));
    fireEvent.click(groupNameButton(view, 'Group 1'), { shiftKey: true });
    pressGroupShortcut();
    fireEvent.click(groupMixControl(view, 'Group 1', 'arrangement-group-solo'));
    const mixed = groupMixControl(view, 'Group 2', 'arrangement-group-solo');
    expect(mixed.getAttribute('aria-pressed')).toBe('mixed');
    expect(mixed.dataset.solo).toBe('mixed');
    expectMixerTokens(mixed, 'group Solo mixed', MIXED_SOLO_TOKENS, [
      'from-brand',
      'bg-foreground',
    ]);
  });

  it('DXM4: Master Mute on is the filled muted grey', async () => {
    const view = await mountMixerOnstateWorkspace();
    const master = view.getByRole('button', { name: 'Master Mute' });
    expect(master.getAttribute('aria-pressed')).toBe('false');
    expectMixerTokens(master, 'Master Mute off', OFF_TOKENS, []);
    fireEvent.click(master);
    expect(master.getAttribute('aria-pressed')).toBe('true');
    expectMixerTokens(master, 'Master Mute on', MUTE_ON_TOKENS, ON_DROPPED_TOKENS);
  });

  it('DXM5: the Clip-details separator hovers neutral and keeps the brand focus ring', async () => {
    const view = await mountMixerOnstateWorkspace();
    const separator = mixerTokens(
      view.getByTestId('arrangement-detail-separator'),
      'detail separator',
    );
    expect(separator).toContain('hover:bg-foreground/50');
    expect(separator).toContain('focus-visible:ring-brand');
    expect(separator.filter((token) => token.includes('accent'))).toStrictEqual([]);
  });

  it('DXM6: source locks for the retired brass on-states and the kept brass sites', () => {
    const lane = readMixerSource(LANE_PATH);
    const groupHeader = readMixerSource(GROUP_HEADER_PATH);
    const master = readMixerSource(MASTER_PATH);
    const detail = readMixerSource(DETAIL_PATH);
    for (const [label, source] of [
      ['Lane', lane],
      ['GroupHeader', groupHeader],
      ['Master', master],
    ] as const) {
      for (const retired of [
        "'border-accent bg-accent text-background",
        'border-brand bg-brand text-brand-foreground',
        'from-brand',
      ]) {
        expect(countMixerOccurrences(source, retired), `${retired} in ${label}`).toBe(0);
      }
      expect(countMixerOccurrences(source, MUTE_ON_SOURCE), `Mute on in ${label}`).toBe(1);
    }
    expect(countMixerOccurrences(lane, SOLO_ON_SOURCE)).toBe(1);
    expect(countMixerOccurrences(groupHeader, SOLO_ON_SOURCE)).toBe(1);
    expect(countMixerOccurrences(groupHeader, MIXED_SOLO_SOURCE)).toBe(1);
    expect(countMixerOccurrences(detail, 'hover:bg-accent/60')).toBe(0);
    expect(countMixerOccurrences(detail, 'hover:bg-foreground/50')).toBe(1);
    expect(countMixerOccurrences(groupHeader, "'border-brand bg-brand/60'")).toBe(1);
    expect(countMixerOccurrences(groupHeader, "'border-l-brand'")).toBe(1);
    expect(countMixerOccurrences(lane, "'border-l-brand'")).toBe(1);
    expect(countMixerOccurrences(lane, "'bg-brand/5'")).toBe(1);
    expect(countMixerOccurrences(detail, 'w-px bg-accent')).toBe(1);
  });
});

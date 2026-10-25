import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import { STUDIO_SCROLLBAR_CLASS } from '~/components/arrangement/studio-scrollbar';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import { studioClipStrings } from '~/lib/arrangement/strings';
import type { Arrangement, ArrangementLoop, WorkspaceCollection } from '~/types/arrangement';
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

class FakeAffordanceAudioBuffer {
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

const PX_PER_SECOND = 40;
const FADE_HANDLE_TEST_IDS = [
  'arrangement-clip-fade-in-handle',
  'arrangement-clip-fade-out-handle',
] as const;
const VIDEO_FADE_HANDLE_TEST_IDS = [
  'arrangement-video-fade-in-handle',
  'arrangement-video-fade-out-handle',
] as const;
const ENVELOPE_POINT = 'arrangement-clip-envelope-point';
const ENVELOPE_TOGGLE = 'arrangement-envelope-toggle';

const APP_ROOT = resolve(__dirname, '../../..');
const ARRANGEMENT_DIR = 'components/arrangement';
const CLIP_PATH = `${ARRANGEMENT_DIR}/ArrangementClip.tsx`;
const LANE_PATH = `${ARRANGEMENT_DIR}/ArrangementLane.tsx`;
const DETAIL_PATH = `${ARRANGEMENT_DIR}/ArrangementDetailPanel.tsx`;
const LIBRARY_PATH = `${ARRANGEMENT_DIR}/ArrangementLibrary.tsx`;
const GROUP_HEADER_PATH = `${ARRANGEMENT_DIR}/ArrangementGroupHeader.tsx`;
const EXPORT_DIALOG_PATH = `${ARRANGEMENT_DIR}/ArrangementExportDialog.tsx`;

const GRANTED_COMPONENT_PATHS = [
  CLIP_PATH,
  `${ARRANGEMENT_DIR}/ArrangementLoopBrace.tsx`,
  LANE_PATH,
  DETAIL_PATH,
  `${ARRANGEMENT_DIR}/ArrangementMaster.tsx`,
  GROUP_HEADER_PATH,
  `${ARRANGEMENT_DIR}/ArrangementTransport.tsx`,
  LIBRARY_PATH,
  `${ARRANGEMENT_DIR}/studio-scrollbar.ts`,
] as const;

const RETIRED_AFFORDANCE_TOKENS = [
  'accent-brand',
  'hover:bg-accent/60',
  "'bg-accent/60'",
  'hover:bg-brand/40',
  'bg-brand/25',
  '-thumb:hover]:bg-brand',
  '-thumb:active]:bg-brand',
] as const;

// TODO(A-R175-DETAIL-SEP-ACCENT): the Clip-details height separator keeps hover:bg-accent/60; it is outside the round-175 §1 list and waits for B's ruling.
const DETAIL_SEPARATOR_ACCENT_GAP_R175 = {
  path: DETAIL_PATH,
  token: 'hover:bg-accent/60',
  count: 1,
};

const KEPT_BRASS_SITES: ReadonlyArray<[string, string]> = [
  [CLIP_PATH, "'z-10 border-brand ring-2 ring-brand'"],
  [LIBRARY_PATH, 'focus-visible:bg-brand'],
  [GROUP_HEADER_PATH, "'border-brand bg-brand/60'"],
];

const affordanceCollection: WorkspaceCollection = {
  id: 'affordance-colour',
  label: 'affordance-colour',
  origin: 'demo',
  sources: [
    {
      id: 'song',
      title: 'Song',
      collectionLabel: 'affordance-colour',
      kind: 'music',
      origin: 'demo',
    },
  ],
  loadSource: async () => new AudioBuffer({ length: 3000, numberOfChannels: 1, sampleRate: 100 }),
};

function affordanceArrangement(loop: ArrangementLoop | null): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
    { id: 'ambience', kind: 'audio', name: 'Ambience' },
  ]);
  return {
    ...base,
    loop,
    groups: [{ id: 'g1', name: 'Group', parentId: null }],
    tracks: base.tracks.map((track) =>
      track.id === 'sfx' || track.id === 'ambience' ? { ...track, groupId: 'g1' } : track,
    ),
    clips: [
      { id: 'v1', trackId: 'video', sourceId: 'film', start: 0, sourceOffset: 0, duration: 6 },
      {
        id: 'a1',
        trackId: 'music',
        sourceId: 'song',
        start: 0,
        sourceOffset: 0,
        duration: 10,
        envelope: [
          { time: 2, gain: 0.5 },
          { time: 6, gain: 0.8 },
        ],
      },
      { id: 'a2', trackId: 'sfx', sourceId: 'song', start: 2, sourceOffset: 0, duration: 4 },
      { id: 'a3', trackId: 'ambience', sourceId: 'song', start: 4, sourceOffset: 0, duration: 6 },
    ],
  };
}

interface AffordanceApiRef {
  current: ArrangementContextValue | null;
}

function AffordanceProbe({ api }: { api: AffordanceApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: AffordanceApiRef): ArrangementContextValue {
  if (!api.current) {
    throw new Error('provider not mounted');
  }
  return api.current;
}

function tokensOf(element: Element | null | undefined, label: string): string[] {
  if (!element) {
    throw new Error(`${label} missing`);
  }
  return (element.getAttribute('class') ?? '').split(/\s+/).filter((token) => token.length > 0);
}

function readAppSource(path: string): string {
  return readFileSync(resolve(APP_ROOT, path), 'utf8');
}

function countOccurrences(source: string, needle: string): number {
  return source.split(needle).length - 1;
}

function stubCapture(element: HTMLElement) {
  Object.defineProperty(element, 'setPointerCapture', { configurable: true, value: () => {} });
  Object.defineProperty(element, 'hasPointerCapture', { configurable: true, value: () => false });
  Object.defineProperty(element, 'releasePointerCapture', { configurable: true, value: () => {} });
}

async function mountAffordanceWorkspace(loop: ArrangementLoop | null = null) {
  const api: AffordanceApiRef = { current: null };
  const view = render(
    <ArrangementProvider
      collection={affordanceCollection}
      initialArrangement={affordanceArrangement(loop)}
    >
      <StudioWorkspace />
      <AffordanceProbe api={api} />
    </ArrangementProvider>,
  );
  for (let tick = 0; tick < 10 && live(api).sourceDurations.get('song') === undefined; tick++) {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  }
  act(() => live(api).setPxPerSecond(PX_PER_SECOND));
  const byTestId = (testId: string, label: string) => {
    const element = view.container.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
    if (!element) {
      throw new Error(`${label} missing`);
    }
    return element;
  };
  const clipRoot = (clipId: string) => {
    const root = view.container.querySelector<HTMLElement>(`[data-clip-id="${clipId}"]`);
    if (!root) {
      throw new Error(`clip ${clipId} not rendered`);
    }
    return root;
  };
  const inClip = (clipId: string, testId: string) => {
    const element = clipRoot(clipId).querySelector<HTMLElement>(`[data-testid="${testId}"]`);
    if (!element) {
      throw new Error(`${testId} missing on ${clipId}`);
    }
    return element;
  };
  const byTitle = (clipId: string, title: string) => {
    const element = Array.from(clipRoot(clipId).querySelectorAll<HTMLElement>('[title]')).find(
      (candidate) => candidate.title === title,
    );
    if (!element) {
      throw new Error(`"${title}" missing on ${clipId}`);
    }
    return element;
  };
  const rangeByLabel = (label: RegExp, name: string) => {
    const element = Array.from(
      view.container.querySelectorAll<HTMLInputElement>('input[type="range"]'),
    ).find((input) => label.test(input.getAttribute('aria-label') ?? ''));
    if (!element) {
      throw new Error(`${name} range missing`);
    }
    return element;
  };
  const trackPart = (trackId: string, testId: string) => {
    const row = view.container.querySelector<HTMLElement>(`[data-track-id="${trackId}"]`);
    const element = row?.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
    if (!element) {
      throw new Error(`${testId} missing on ${trackId}`);
    }
    return element;
  };
  return { api, view, byTestId, clipRoot, inClip, byTitle, rangeByLabel, trackPart };
}

function expectNeutralThumb(element: HTMLElement, label: string) {
  const tokens = tokensOf(element, label);
  expect(tokens, label).toContain('accent-foreground');
  expect(
    tokens.filter((token) => token.startsWith('accent-brand')),
    label,
  ).toStrictEqual([]);
  expect(tokens, label).toContain('focus-visible:ring-brand');
}

function expectNeutralHover(element: HTMLElement, label: string) {
  const tokens = tokensOf(element, label);
  expect(tokens, label).toContain('hover:bg-foreground/50');
  expect(
    tokens.filter(
      (token) =>
        token.includes('accent') || (token.startsWith('hover:') && token.includes('brand')),
    ),
    label,
  ).toStrictEqual([]);
}

beforeEach(() => {
  fakeClock.base = Date.now() / 1000;
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('OfflineAudioContext', FakeOfflineAudioContext);
  vi.stubGlobal('AudioBuffer', FakeAffordanceAudioBuffer);
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

describe('DUX-R-5b-1 affordance colour (D-29z140, R34, K4/K6/K7/K10)', () => {
  it('DXA1: the six range thumbs use accent-foreground and keep the brass focus ring', async () => {
    const { api, byTestId, trackPart, rangeByLabel } = await mountAffordanceWorkspace();
    act(() => live(api).selectClip('a1'));
    const thumbs: ReadonlyArray<[HTMLElement, string]> = [
      [byTestId('arrangement-detail-clip-gain-fader', 'clip gain fader'), 'clip gain fader'],
      [rangeByLabel(/^Master Volume$/, 'Master Volume'), 'Master Volume'],
      [trackPart('music', 'arrangement-track-pan'), 'music pan'],
      [rangeByLabel(/^Volume — /, 'track volume'), 'track volume'],
      [byTestId('arrangement-group-volume', 'group volume'), 'group volume'],
      [byTestId('arrangement-zoom', 'zoom'), 'zoom'],
    ];
    for (const [element, label] of thumbs) {
      expect(element.getAttribute('type'), label).toBe('range');
      expectNeutralThumb(element, label);
    }
  });

  it('DXA2: fade handles are hollow (bg-background, border-foreground); Env mode keeps the K6 point and hides them', async () => {
    const { api, view, clipRoot, inClip } = await mountAffordanceWorkspace();
    act(() => live(api).selectClips(['a1', 'v1']));
    const handles: ReadonlyArray<[string, string]> = [
      ...FADE_HANDLE_TEST_IDS.map((testId): [string, string] => ['a1', testId]),
      ...VIDEO_FADE_HANDLE_TEST_IDS.map((testId): [string, string] => ['v1', testId]),
    ];
    for (const [clipId, testId] of handles) {
      const tokens = tokensOf(inClip(clipId, testId), `${testId} on ${clipId}`);
      expect(tokens, testId).toEqual(
        expect.arrayContaining(['bg-background', 'border-foreground']),
      );
      expect(tokens, testId).not.toContain('bg-brand');
    }
    fireEvent.click(view.getByTestId(ENVELOPE_TOGGLE));
    const point = clipRoot('a1').querySelector(`[data-testid="${ENVELOPE_POINT}"]`);
    const pointTokens = tokensOf(point, 'envelope point on a1');
    expect(pointTokens).toEqual(expect.arrayContaining(['bg-foreground', 'border-background']));
    for (const [clipId, testId] of handles) {
      expect(
        clipRoot(clipId).querySelector(`[data-testid="${testId}"]`),
        `${testId} on ${clipId} in Env mode`,
      ).toBeNull();
    }
  });

  it('DXA3: both clip trim edges hover in foreground/50 with no accent token', async () => {
    const { byTitle } = await mountAffordanceWorkspace();
    for (const clipId of ['a1', 'v1']) {
      expectNeutralHover(byTitle(clipId, studioClipStrings.trimStartLabel), `${clipId} trim start`);
      expectNeutralHover(byTitle(clipId, studioClipStrings.trimEndLabel), `${clipId} trim end`);
    }
  });

  it('DXA4: loop edges hover in foreground/50 whether the loop is enabled or disabled', async () => {
    for (const enabled of [true, false]) {
      const { byTestId, view } = await mountAffordanceWorkspace({ start: 1, end: 5, enabled });
      expect(byTestId('arrangement-loop-brace', 'loop brace').dataset.loopEnabled).toBe(
        enabled ? 'true' : 'false',
      );
      for (const edge of ['arrangement-loop-start-edge', 'arrangement-loop-end-edge']) {
        expectNeutralHover(byTestId(edge, `${edge} (enabled=${enabled})`), `${edge} ${enabled}`);
      }
      view.unmount();
    }
  });

  it('DXA5: the track-height handle hovers in foreground/50 and fills foreground/50 only while dragging', async () => {
    const { trackPart } = await mountAffordanceWorkspace();
    const handle = trackPart('music', 'arrangement-track-height');
    stubCapture(handle);
    expectNeutralHover(handle, 'music height handle');
    expect(tokensOf(handle, 'music height handle at rest')).not.toContain('bg-foreground/50');
    fireEvent.pointerDown(handle, { button: 0, buttons: 1, pointerId: 7, clientY: 300 });
    const dragging = tokensOf(trackPart('music', 'arrangement-track-height'), 'dragging handle');
    expect(dragging).toContain('bg-foreground/50');
    expect(dragging.filter((token) => token.includes('accent'))).toStrictEqual([]);
    fireEvent.pointerUp(window, { pointerId: 7, clientY: 300 });
    expect(
      tokensOf(trackPart('music', 'arrangement-track-height'), 'released handle'),
    ).not.toContain('bg-foreground/50');
  });

  it('DXA6: scrollbar thumb, Library resize hover and collapsed-group blocks are neutral; selection and focus keep the brass', async () => {
    const scrollbar = STUDIO_SCROLLBAR_CLASS.split(/\s+/);
    expect(scrollbar).toEqual(
      expect.arrayContaining([
        '[&::-webkit-scrollbar-thumb:hover]:bg-foreground',
        '[&::-webkit-scrollbar-thumb:active]:bg-foreground',
      ]),
    );
    expect(scrollbar.filter((token) => token.includes('bg-brand'))).toStrictEqual([]);

    const { api, view, byTestId } = await mountAffordanceWorkspace();
    const separator = tokensOf(
      byTestId('arrangement-library-separator', 'library separator'),
      'library separator',
    );
    expect(separator).toEqual(
      expect.arrayContaining(['hover:bg-foreground/50', 'focus-visible:bg-brand']),
    );
    expect(separator).not.toContain('hover:bg-brand/40');

    fireEvent.click(byTestId('arrangement-group-fold', 'group fold'));
    act(() => live(api).selectClip('a2'));
    const overview = byTestId('arrangement-group-overview', 'collapsed group overview');
    const blockOf = (clipId: string) =>
      overview.querySelector<HTMLElement>(`[data-overview-clip-id="${clipId}"]`);
    const selected = tokensOf(blockOf('a2'), 'selected group block');
    const unselected = tokensOf(blockOf('a3'), 'unselected group block');
    expect(selected).toEqual(expect.arrayContaining(['border-brand', 'bg-brand/60']));
    expect(unselected).toEqual(
      expect.arrayContaining(['border-outline-hover', 'bg-foreground/25']),
    );
    expect(unselected.filter((token) => token.includes('brand'))).toStrictEqual([]);
    expect(view.container.querySelectorAll('[data-overview-selected="true"]')).toHaveLength(1);
  });

  it('DXA7: retired affordance tokens are gone, kept brass and later-stage sites are intact', () => {
    for (const path of GRANTED_COMPONENT_PATHS) {
      const source = readAppSource(path);
      for (const token of RETIRED_AFFORDANCE_TOKENS) {
        const expected =
          path === DETAIL_SEPARATOR_ACCENT_GAP_R175.path &&
          token === DETAIL_SEPARATOR_ACCENT_GAP_R175.token
            ? DETAIL_SEPARATOR_ACCENT_GAP_R175.count
            : 0;
        expect(countOccurrences(source, token), `${token} in ${path}`).toBe(expected);
      }
    }
    const clipSource = readAppSource(CLIP_PATH);
    expect(countOccurrences(clipSource, 'border border-foreground bg-background')).toBe(1);
    expect(countOccurrences(clipSource, 'border border-foreground bg-brand')).toBe(0);
    expect(
      countOccurrences(clipSource, '"relative min-h-0 flex-1 cursor-text text-muted/70"'),
    ).toBe(1);
    expect(
      countOccurrences(
        clipSource,
        '"pointer-events-none absolute inset-0 h-full w-full text-foreground"',
      ),
    ).toBe(1);
    for (const [path, site] of KEPT_BRASS_SITES) {
      expect(countOccurrences(readAppSource(path), site), `${site} in ${path}`).toBe(1);
    }
    expect(countOccurrences(readAppSource(EXPORT_DIALOG_PATH), 'accent-brand')).toBe(6);
    expect(
      countOccurrences(readAppSource(LANE_PATH), "'border-accent bg-accent/20 text-accent'"),
    ).toBe(2);
  });
});

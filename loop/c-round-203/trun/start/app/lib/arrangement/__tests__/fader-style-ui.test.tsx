import { act, fireEvent, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StudioWorkspace } from '~/components/arrangement/StudioWorkspace';
import {
  STUDIO_LEVEL_FADER_CLASS,
  STUDIO_NEUTRAL_SLIDER_CLASS,
  STUDIO_SLIDER_THUMB_CLASS,
  STUDIO_SLIDER_TRACK_CLASS,
  studioLevelFaderFillFraction,
  studioLevelFaderFillStyle,
} from '~/components/arrangement/studio-fader';
import {
  type ArrangementContextValue,
  ArrangementProvider,
  useArrangement,
} from '~/contexts/ArrangementContext';
import type { Arrangement, WorkspaceCollection } from '~/types/arrangement';
import { createArrangement } from '../model';
import { createWorkspaceTestEnvironment } from './helpers/workspace-test-environment';

vi.mock('@remix-run/react', () => ({
  Link: ({ to, children, className }: { to: string; children: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

const {
  fakeClock,
  FakeAudioContext,
  FakeOfflineAudioContext,
  FakeAudioBuffer,
  FakeResizeObserver,
} = createWorkspaceTestEnvironment();

const PX_PER_SECOND = 40;
const FILL_PROPERTY = '--studio-fader-fill';
const FILL_TOLERANCE = 0.005;
const OLD_RING_TOKENS: ReadonlyArray<string> = ['focus-visible:ring-2', 'focus-visible:ring-brand'];

type LevelFaderName = 'track volume' | 'group volume' | 'Master Volume' | 'clip gain fader';
const LEVEL_FADER_NAMES: ReadonlyArray<LevelFaderName> = [
  'track volume',
  'group volume',
  'Master Volume',
  'clip gain fader',
];

const faderStyleCollection: WorkspaceCollection = {
  id: 'fader-style',
  label: 'fader-style',
  origin: 'demo',
  sources: [
    {
      id: 'song',
      title: 'Song',
      collectionLabel: 'fader-style',
      kind: 'music',
      origin: 'demo',
    },
  ],
  loadSource: async () => new AudioBuffer({ length: 3000, numberOfChannels: 1, sampleRate: 100 }),
};

function faderStyleArrangement(): Arrangement {
  const base = createArrangement([
    { id: 'video', kind: 'video', name: 'ვიდეო' },
    { id: 'music', kind: 'audio', name: 'მუსიკა' },
    { id: 'sfx', kind: 'audio', name: 'SFX' },
    { id: 'ambience', kind: 'audio', name: 'Ambience' },
  ]);
  return {
    ...base,
    groups: [{ id: 'g1', name: 'Group', parentId: null }],
    tracks: base.tracks.map((track) =>
      track.id === 'sfx' || track.id === 'ambience' ? { ...track, groupId: 'g1' } : track,
    ),
    clips: [
      { id: 'a1', trackId: 'music', sourceId: 'song', start: 0, sourceOffset: 0, duration: 10 },
      { id: 'a2', trackId: 'sfx', sourceId: 'song', start: 2, sourceOffset: 0, duration: 4 },
    ],
  };
}

interface FaderStyleApiRef {
  current: ArrangementContextValue | null;
}

function FaderStyleProbe({ api }: { api: FaderStyleApiRef }) {
  api.current = useArrangement();
  return null;
}

function live(api: FaderStyleApiRef): ArrangementContextValue {
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

function recipeTokens(recipe: string): string[] {
  return recipe.split(/\s+/).filter((token) => token.length > 0);
}

function fillOf(input: HTMLInputElement): number {
  const raw = input.style.getPropertyValue(FILL_PROPERTY).trim();
  if (raw === '') {
    return Number.NaN;
  }
  return Number(raw);
}

function expectedFill(input: HTMLInputElement): number {
  const min = Number(input.min);
  const max = Number(input.max);
  return (Number(input.value) - min) / (max - min);
}

function expectFillMatchesValue(input: HTMLInputElement, label: string) {
  const fill = fillOf(input);
  expect(Number.isFinite(fill), `${label}: ${FILL_PROPERTY} is set`).toBe(true);
  expect(Math.abs(fill - expectedFill(input)), `${label}: fill ${fill}`).toBeLessThanOrEqual(
    FILL_TOLERANCE,
  );
}

function previewValue(input: HTMLInputElement, value: string) {
  act(() => {
    fireEvent.change(input, { target: { value } });
  });
}

function commitValue(input: HTMLInputElement, value: string) {
  act(() => {
    input.focus();
    fireEvent.change(input, { target: { value } });
    fireEvent.keyUp(input, { key: 'ArrowLeft', code: 'ArrowLeft' });
  });
}

function keyboardStep(input: HTMLInputElement, key: 'ArrowLeft' | 'ArrowRight') {
  const step = Number(input.step);
  const next = Number(input.value) + (key === 'ArrowRight' ? step : -step);
  const clamped = Math.min(Number(input.max), Math.max(Number(input.min), next));
  act(() => {
    input.focus();
    fireEvent.keyDown(input, { key, code: key });
    fireEvent.change(input, { target: { value: String(Number(clamped.toFixed(4))) } });
    fireEvent.keyUp(input, { key, code: key });
  });
}

async function mountFaderStyleWorkspace() {
  const api: FaderStyleApiRef = { current: null };
  const view = render(
    <ArrangementProvider
      collection={faderStyleCollection}
      initialArrangement={faderStyleArrangement()}
    >
      <StudioWorkspace />
      <FaderStyleProbe api={api} />
    </ArrangementProvider>,
  );
  for (let tick = 0; tick < 10 && live(api).sourceDurations.get('song') === undefined; tick++) {
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
  }
  act(() => live(api).setPxPerSecond(PX_PER_SECOND));
  const rangeBy = (selector: string, label: string) => {
    const element = view.container.querySelector<HTMLInputElement>(selector);
    if (!element || element.type !== 'range') {
      throw new Error(`${label} range missing`);
    }
    return element;
  };
  const levelFader = (name: LevelFaderName): HTMLInputElement => {
    switch (name) {
      case 'track volume':
        return rangeBy('[data-track-id="music"] input[aria-label^="Volume — "]', name);
      case 'group volume':
        return rangeBy('[data-testid="arrangement-group-volume"]', name);
      case 'Master Volume':
        return rangeBy('input[aria-label="Master Volume"]', name);
      case 'clip gain fader':
        return rangeBy('[data-testid="arrangement-detail-clip-gain-fader"]', name);
    }
  };
  const pan = () => rangeBy('[data-track-id="music"] [data-testid="arrangement-track-pan"]', 'pan');
  const zoom = () => rangeBy('[data-testid="arrangement-zoom"]', 'zoom');
  return { api, view, levelFader, pan, zoom };
}

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

describe('SABA-B-3 studio fader look (D-29z156, R68–R71)', () => {
  it('FS0: studioLevelFaderFillFraction clamps, guards a zero or non-finite span and the style carries it', () => {
    expect(studioLevelFaderFillFraction({ value: -60, min: -60, max: 0 })).toBe(0);
    expect(studioLevelFaderFillFraction({ value: 0, min: -60, max: 0 })).toBe(1);
    expect(studioLevelFaderFillFraction({ value: -30, min: -60, max: 0 })).toBe(0.5);
    expect(studioLevelFaderFillFraction({ value: -90, min: -60, max: 0 })).toBe(0);
    expect(studioLevelFaderFillFraction({ value: 12, min: -60, max: 6 })).toBe(1);
    expect(studioLevelFaderFillFraction({ value: 3, min: 3, max: 3 })).toBe(0);
    expect(studioLevelFaderFillFraction({ value: Number.NaN, min: -60, max: 0 })).toBe(0);
    expect(
      studioLevelFaderFillFraction({ value: Number.POSITIVE_INFINITY, min: -60, max: 0 }),
    ).toBe(1);
    expect(
      studioLevelFaderFillFraction({ value: Number.NEGATIVE_INFINITY, min: -60, max: 0 }),
    ).toBe(0);
    expect(studioLevelFaderFillFraction({ value: 0, min: Number.NEGATIVE_INFINITY, max: 0 })).toBe(
      0,
    );
    expect(studioLevelFaderFillStyle({ value: 0, min: -60, max: 24 })[FILL_PROPERTY]).toBe(
      String(Number((60 / 84).toFixed(4))),
    );
  });

  it('FS7: the shared recipes carry the exact one-thumb, one-track and level-fill tokens and no focus recipe (SABA-B-4 R86)', () => {
    expect(recipeTokens(STUDIO_SLIDER_THUMB_CLASS)).toStrictEqual([
      '[&::-webkit-slider-thumb]:-mt-1.25',
      '[&::-webkit-slider-thumb]:size-3.5',
      '[&::-webkit-slider-thumb]:appearance-none',
      '[&::-webkit-slider-thumb]:rounded-full',
      '[&::-webkit-slider-thumb]:border-0',
      '[&::-webkit-slider-thumb]:bg-foreground',
      '[&::-moz-range-thumb]:size-3.5',
      '[&::-moz-range-thumb]:appearance-none',
      '[&::-moz-range-thumb]:rounded-full',
      '[&::-moz-range-thumb]:border-0',
      '[&::-moz-range-thumb]:bg-foreground',
    ]);
    expect(recipeTokens(STUDIO_SLIDER_TRACK_CLASS)).toStrictEqual([
      '[&::-webkit-slider-runnable-track]:h-1',
      '[&::-webkit-slider-runnable-track]:rounded-full',
      '[&::-webkit-slider-runnable-track]:bg-outline-hover',
      '[&::-moz-range-track]:h-1',
      '[&::-moz-range-track]:rounded-full',
      '[&::-moz-range-track]:bg-outline-hover',
    ]);
    const level = recipeTokens(STUDIO_LEVEL_FADER_CLASS);
    expect(level).toEqual(
      expect.arrayContaining([
        ...recipeTokens(STUDIO_NEUTRAL_SLIDER_CLASS),
        'appearance-none',
        'bg-transparent',
        'rounded-full',
        '[&::-webkit-slider-runnable-track]:bg-linear-to-r',
        '[&::-webkit-slider-runnable-track]:from-brand',
        '[&::-webkit-slider-runnable-track]:to-brand',
        '[&::-webkit-slider-runnable-track]:bg-no-repeat',
        '[&::-webkit-slider-runnable-track]:bg-size-[calc(var(--spacing)*1.75+(100%-var(--spacing)*3.5)*var(--studio-fader-fill,0))_100%]',
        '[&::-moz-range-progress]:bg-brand',
        'forced-colors:appearance-auto',
      ]),
    );
    for (const recipe of [level, recipeTokens(STUDIO_NEUTRAL_SLIDER_CLASS)]) {
      expect(
        recipe.filter((token) => token.includes('focus') || token.includes('ring-')),
      ).toStrictEqual([]);
      expect(recipe.filter((token) => token.includes('size-3.75'))).toStrictEqual([]);
    }
  });

  it('FS1: all six range controls share one h-4 box, one thumb and one track, carry no focus recipe and none keeps the old ring-2 (SABA-B-4)', async () => {
    const { api, levelFader, pan, zoom } = await mountFaderStyleWorkspace();
    act(() => live(api).selectClip('a1'));
    const sharedTokens = recipeTokens(STUDIO_NEUTRAL_SLIDER_CLASS);
    const ranges: ReadonlyArray<[HTMLInputElement, string]> = [
      ...LEVEL_FADER_NAMES.map((name): [HTMLInputElement, string] => [levelFader(name), name]),
      [zoom(), 'zoom'],
      [pan(), 'pan'],
    ];
    for (const [input, label] of ranges) {
      const tokens = tokensOf(input, label);
      for (const token of sharedTokens) {
        expect(tokens, `${label} has ${token}`).toContain(token);
      }
      expect(tokens, `${label} box height`).toContain('h-4');
      expect(tokens, label).not.toContain('accent-foreground');
      expect(
        tokens.filter(
          (token) => token.includes('focus') || token.includes('ring-') || token === 'peer',
        ),
        label,
      ).toStrictEqual([]);
      for (const token of OLD_RING_TOKENS) {
        expect(tokens, label).not.toContain(token);
      }
    }
    const panInput = pan();
    expect(tokensOf(panInput, 'pan'), 'the ring width follows the Pan width').toContain('w-12');
    const panRow = panInput.parentElement;
    expect(panRow?.children).toHaveLength(4);
    expect(tokensOf(panRow, 'pan row'), 'the row gap is kept').toContain('gap-1');
    const panReset = panInput.nextElementSibling;
    expect(panReset?.getAttribute('data-testid')).toBe('arrangement-track-pan-reset');
    const panResetTokens = tokensOf(panReset, 'pan reset');
    expect(panResetTokens).toContain('rounded-md');
    expect(
      panResetTokens.filter(
        (token) => token.includes('focus') || token.includes('before:') || token.includes('ring-'),
      ),
      'the Pan reset carries no delegated or own ring recipe',
    ).toStrictEqual([]);
  });

  it('FS2: the four level faders carry the level recipe and the fill is 0 at min, 1 at max and proportional between', async () => {
    const { api, levelFader } = await mountFaderStyleWorkspace();
    act(() => live(api).selectClip('a1'));
    const levelTokens = recipeTokens(STUDIO_LEVEL_FADER_CLASS);
    for (const name of LEVEL_FADER_NAMES) {
      const tokens = tokensOf(levelFader(name), name);
      for (const token of levelTokens) {
        expect(tokens, `${name} has ${token}`).toContain(token);
      }
      expectFillMatchesValue(levelFader(name), `${name} initial`);
      for (const value of [levelFader(name).min, levelFader(name).max]) {
        commitValue(levelFader(name), value);
        const input = levelFader(name);
        const expected = value === input.min ? 0 : 1;
        expect(input.value, `${name} value`).toBe(value);
        expect(fillOf(input), `${name} fill at ${value}`).toBe(expected);
      }
      const input = levelFader(name);
      const mid = Number(input.min) + (Number(input.max) - Number(input.min)) * 0.25;
      commitValue(input, String(Math.round(mid)));
      expectFillMatchesValue(levelFader(name), `${name} at ${Math.round(mid)}`);
      expect(fillOf(levelFader(name)), `${name} mid`).toBeGreaterThan(0);
      expect(fillOf(levelFader(name)), `${name} mid`).toBeLessThan(1);
    }
    commitValue(levelFader('track volume'), '-60');
    expect(live(api).arrangement.tracks.find((track) => track.id === 'music')?.volume).toBe(0);
    expect(fillOf(levelFader('track volume'))).toBe(0);
  });

  it('FS3: ArrowRight and ArrowLeft move each level fader fill with the new value', async () => {
    const { api, levelFader } = await mountFaderStyleWorkspace();
    act(() => live(api).selectClip('a1'));
    for (const name of LEVEL_FADER_NAMES) {
      commitValue(levelFader(name), String(Math.round((Number(levelFader(name).min) * 2) / 3)));
      const before = fillOf(levelFader(name));
      keyboardStep(levelFader(name), 'ArrowRight');
      const afterRight = fillOf(levelFader(name));
      expect(afterRight, `${name} ArrowRight`).toBeGreaterThan(before);
      expectFillMatchesValue(levelFader(name), `${name} after ArrowRight`);
      keyboardStep(levelFader(name), 'ArrowLeft');
      keyboardStep(levelFader(name), 'ArrowLeft');
      expect(fillOf(levelFader(name)), `${name} ArrowLeft`).toBeLessThan(afterRight);
      expectFillMatchesValue(levelFader(name), `${name} after ArrowLeft`);
    }
  });

  it('FS4: a preview value from onChange (no commit) moves the fill', async () => {
    const { api, levelFader } = await mountFaderStyleWorkspace();
    act(() => live(api).selectClip('a1'));
    for (const name of LEVEL_FADER_NAMES) {
      const input = levelFader(name);
      const before = fillOf(input);
      const target = String(Math.round((Number(input.min) + Number(input.max)) / 2));
      previewValue(input, target);
      const after = levelFader(name);
      expect(after.value, `${name} preview value`).toBe(target);
      expect(fillOf(after), `${name} preview fill`).not.toBe(before);
      expectFillMatchesValue(after, `${name} preview`);
    }
  });

  it('FS5: Pan and Zoom take the shared neutral thumb and track and carry no level fill', async () => {
    const { pan, zoom } = await mountFaderStyleWorkspace();
    const neutral = recipeTokens(STUDIO_NEUTRAL_SLIDER_CLASS);
    const levelOnly = recipeTokens(STUDIO_LEVEL_FADER_CLASS).filter(
      (token) => !neutral.includes(token),
    );
    expect(levelOnly.length).toBeGreaterThan(0);
    const neutralControls: ReadonlyArray<[HTMLInputElement, string]> = [
      [pan(), 'pan'],
      [zoom(), 'zoom'],
    ];
    for (const [input, label] of neutralControls) {
      const tokens = tokensOf(input, label);
      expect(tokens, label).toEqual(expect.arrayContaining(neutral));
      expect(
        tokens.filter((token) => token.includes('brand')),
        label,
      ).toStrictEqual([]);
      expect(
        tokens.filter((token) => levelOnly.includes(token)),
        label,
      ).toStrictEqual([]);
      expect(input.style.getPropertyValue(FILL_PROPERTY), label).toBe('');
    }
  });

  it('FS6: the disabled Clip Gain fader stays disabled, dims and still shows its fill at its value', async () => {
    const { api, levelFader } = await mountFaderStyleWorkspace();
    act(() => live(api).selectClip(null));
    const input = levelFader('clip gain fader');
    expect(input.disabled).toBe(true);
    expect(tokensOf(input, 'clip gain fader')).toContain('disabled:opacity-50');
    expectFillMatchesValue(input, 'disabled clip gain');
    expect(fillOf(input)).toBeGreaterThan(0);
  });
});

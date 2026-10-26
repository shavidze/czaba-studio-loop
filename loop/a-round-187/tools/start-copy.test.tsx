import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, fireEvent, render } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioPlayer } from '/home/runner/work/czaba-studio-loop/czaba-studio-loop/loop/b-round-186/r187-granted-start/app/components/audio/AudioPlayer';
import { AudioPreviewButton } from '/home/runner/work/czaba-studio-loop/czaba-studio-loop/loop/b-round-186/r187-granted-start/app/components/audio/AudioPreviewButton';
import type { Track } from '~/contexts/AudioContext';

interface MockAudioState {
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  volume: number;
  currentTime: number;
  duration: number;
  queue: Track[];
  queueIndex: number;
}

const audioMock = vi.hoisted(() => {
  const state: MockAudioState = {
    currentTrack: null,
    isPlaying: false,
    isLoading: false,
    error: null,
    volume: 0.7,
    currentTime: 0,
    duration: 0,
    queue: [],
    queueIndex: -1,
  };
  return {
    state,
    play: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    togglePlayPause: vi.fn(),
    seek: vi.fn(),
    setVolume: vi.fn(),
    addToQueue: vi.fn(),
    skipNext: vi.fn(),
    skipPrevious: vi.fn(),
    clearQueue: vi.fn(),
    closePlayer: vi.fn(),
  };
});

vi.mock('~/contexts/AudioContext', () => ({
  useAudio: () => audioMock,
}));
vi.mock('~/lib/analytics', () => ({ trackPlayButtonClicked: vi.fn() }));
vi.mock('~/lib/facebook-pixel', () => ({ trackFBPlayButtonClicked: vi.fn() }));

const previewTrack: Track = {
  id: 'track-middle-east',
  title: 'Middle East',
  artist: 'CZABA',
  audioUrl: '/audio/middle-east-preview.mp3',
  imageUrl: '/images/middle-east.jpg',
  productHandle: 'middle-east',
};

const PLAY_PATH = 'M8 5v14l11-7z';
const VARIANTS = ['overlay', 'inline'] as const;

function resetAudioState() {
  audioMock.state.currentTrack = null;
  audioMock.state.isPlaying = false;
  audioMock.state.isLoading = false;
  audioMock.state.error = null;
  audioMock.state.volume = 0.7;
  audioMock.state.currentTime = 0;
  audioMock.state.duration = 0;
}

async function renderHydratedButton(variant: 'overlay' | 'inline') {
  const view = render(<AudioPreviewButton track={previewTrack} variant={variant} />);
  await act(async () => {});
  return view;
}

describe('AudioPreviewButton — one markup on server and client (STORE-1b K2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetAudioState();
  });

  const hydrationCleanups: Array<() => void> = [];

  afterEach(() => {
    for (const cleanupHydration of hydrationCleanups.splice(0)) cleanupHydration();
    vi.restoreAllMocks();
  });

  for (const variant of VARIANTS) {
    it(`renders the same idle markup after mount as on the server (${variant})_REGRESSION`, async () => {
      const serverMarkup = renderToStaticMarkup(
        <AudioPreviewButton track={previewTrack} variant={variant} />,
      );
      const { container } = await renderHydratedButton(variant);
      expect(container.innerHTML).toBe(serverMarkup);
    });

    it(`server markup is the interactive icon-only button without a "Preview" label (${variant})`, () => {
      const host = document.createElement('div');
      host.innerHTML = renderToStaticMarkup(
        <AudioPreviewButton track={previewTrack} variant={variant} />,
      );
      const button = host.querySelector('button');
      expect(button).not.toBeNull();
      expect(button?.getAttribute('type')).toBe('button');
      expect(button?.getAttribute('aria-label')).toBe('Play preview');
      expect(button?.querySelector(`path[d="${PLAY_PATH}"]`)).not.toBeNull();
      expect(host.textContent ?? '').not.toContain('Preview');
      expect(host.querySelector('.audio-preview-overlay-text')).toBeNull();
    });

    it(`hydrates the server markup without recoverable errors or console errors (${variant})_REGRESSION`, async () => {
      const serverHtml = renderToString(
        <AudioPreviewButton track={previewTrack} variant={variant} />,
      );
      const expectedMarkup = renderToStaticMarkup(
        <AudioPreviewButton track={previewTrack} variant={variant} />,
      );
      const host = document.createElement('div');
      host.innerHTML = serverHtml;
      document.body.appendChild(host);
      const recoverableErrorSpy = vi.fn();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      let root: ReturnType<typeof hydrateRoot> | undefined;
      hydrationCleanups.push(() => {
        act(() => root?.unmount());
        host.remove();
      });
      await act(async () => {
        root = hydrateRoot(host, <AudioPreviewButton track={previewTrack} variant={variant} />, {
          onRecoverableError: recoverableErrorSpy,
        });
      });
      await act(async () => {});

      expect(recoverableErrorSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(host.innerHTML).toBe(expectedMarkup);
    });
  }

  it('click plays the track once and does not bubble to a parent card link', async () => {
    const parentClick = vi.fn();
    const { getByRole } = render(
      <a href="/products/middle-east" onClick={parentClick}>
        <AudioPreviewButton track={previewTrack} variant="overlay" />
      </a>,
    );
    await act(async () => {});
    const notPrevented = fireEvent.click(getByRole('button', { name: 'Play preview' }));
    expect(notPrevented).toBe(false);
    expect(audioMock.play).toHaveBeenCalledTimes(1);
    expect(audioMock.play).toHaveBeenCalledWith(previewTrack);
    expect(audioMock.pause).not.toHaveBeenCalled();
    expect(parentClick).not.toHaveBeenCalled();
  });

  it('shows "Pause preview" while this track plays and a click pauses it', async () => {
    audioMock.state.currentTrack = previewTrack;
    audioMock.state.isPlaying = true;
    const { getByRole } = await renderHydratedButton('overlay');
    fireEvent.click(getByRole('button', { name: 'Pause preview' }));
    expect(audioMock.pause).toHaveBeenCalledTimes(1);
    expect(audioMock.play).not.toHaveBeenCalled();
  });

  it('marks the button busy with "Cancel loading preview" while this track loads', async () => {
    audioMock.state.currentTrack = previewTrack;
    audioMock.state.isLoading = true;
    for (const variant of VARIANTS) {
      const { getByRole, unmount } = await renderHydratedButton(variant);
      const button = getByRole('button', { name: 'Cancel loading preview' });
      expect(button.getAttribute('aria-busy')).toBe('true');
      expect(button.getAttribute('type')).toBe('button');
      unmount();
    }
  });
});

describe('AudioPlayer — progress and volume fill use a defined token (STORE-1b K1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetAudioState();
  });

  it('draws the played and set parts with var(--color-brand)_REGRESSION', () => {
    audioMock.state.currentTrack = previewTrack;
    audioMock.state.currentTime = 30;
    audioMock.state.duration = 120;
    audioMock.state.volume = 0.7;
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <AudioPlayer />
      </MemoryRouter>,
    );
    const host = document.createElement('div');
    host.innerHTML = markup;
    const progress = host.querySelector('input[aria-label="Preview position"]');
    const volume = host.querySelector('input[aria-label="Preview volume"]');
    expect(progress?.getAttribute('style') ?? '').toContain('var(--color-brand) 25%');
    expect(volume?.getAttribute('style') ?? '').toContain('var(--color-brand) 70%');
    expect(markup).not.toContain('--color-primary');
  });

  it('declares --color-brand in the @theme block and --color-primary nowhere', () => {
    const css = readFileSync(resolve(process.cwd(), 'app/styles/app.css'), 'utf8');
    const themeStart = css.indexOf('@theme {');
    const themeEnd = css.indexOf('\n}', themeStart);
    const brandDeclaration = css.indexOf('--color-brand:', themeStart);
    expect(themeStart).toBeGreaterThanOrEqual(0);
    expect(brandDeclaration).toBeGreaterThan(themeStart);
    expect(brandDeclaration).toBeLessThan(themeEnd);
    expect(css).not.toMatch(/--color-primary\s*:/);
  });

  it('renders nothing without a current track', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <AudioPlayer />
      </MemoryRouter>,
    );
    expect(markup).toBe('');
  });
});

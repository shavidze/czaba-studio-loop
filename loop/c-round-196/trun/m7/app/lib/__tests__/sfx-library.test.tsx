import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SfxSceneBuilder } from '~/components/recordings/SfxSceneBuilder';
import { loadSfxOriginal } from '~/lib/sfx-original.client';
import { renderSfxScene, type SfxScene } from '~/lib/sfx-scene';
import type { ProductRecordingCatalog } from '~/services/api/client';
import { openAccountScene, saveAccountScene } from '~/services/sfx-scene.client';

vi.mock('~/lib/sfx-original.client', () => ({ loadSfxOriginal: vi.fn() }));
vi.mock('~/services/sfx-scene.client', () => ({
  listAccountScenes: vi.fn().mockResolvedValue([]),
  saveAccountScene: vi.fn(),
  openAccountScene: vi.fn(),
}));
const recordings = [1, 2, 3].map((id) => ({
  id,
  title: ['Hall', 'Checkout', 'Entrance'][id - 1],
  durationMs: 20000,
  sampleRateHz: 10,
  bitDepth: 24,
  channels: 1,
  position: id,
}));
const catalogs: ProductRecordingCatalog[] = [
  {
    productId: 1004,
    productTitle: 'Mall',
    licenseType: 'Universal',
    tags: 'ambience,shopping',
    recordings: recordings.slice(0, 2),
  },
  {
    productId: 1005,
    productTitle: 'City',
    licenseType: 'Universal',
    tags: 'street,door',
    recordings: recordings.slice(2),
  },
];
const audio = { sampleRate: 10, channels: [new Float32Array(200).fill(0.1)] };
let saved: SfxScene | undefined;
beforeEach(() => {
  saved = undefined;
  localStorage.clear();
  vi.mocked(loadSfxOriginal).mockResolvedValue(audio);
  vi.mocked(saveAccountScene).mockImplementation(async (scene) => {
    saved = structuredClone(scene);
    return structuredClone(scene);
  });
  vi.mocked(openAccountScene).mockImplementation(async () => {
    if (!saved) throw new Error('Scene missing');
    return structuredClone(saved);
  });
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    this.dispatchEvent(new Event('playing'));
    return Promise.resolve();
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});
function mountScene() {
  return render(
    <SfxSceneBuilder
      catalog={catalogs[0]}
      library={catalogs}
      accountId="7"
      token="test"
      onPlaybackStart={() => {}}
    />,
  );
}
async function addSound(name: string, offset: number) {
  fireEvent.change(screen.getByLabelText('Exact scene position (seconds)'), {
    target: { value: String(offset) },
  });
  fireEvent.click(screen.getByRole('button', { name: `Add ${name} at current position` }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: `Add ${name} at current position` })).toHaveProperty(
      'disabled',
      false,
    ),
  );
}
describe('Purchased SFX library', { timeout: 15_000 }, () => {
  it('searches tags, filters collections and keeps filters and favorites across close/open', async () => {
    mountScene();
    fireEvent.change(screen.getByLabelText('Search sounds'), { target: { value: 'door' } });
    expect(screen.getByRole('button', { name: 'Preview Entrance' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Preview Hall' })).toBeNull();
    fireEvent.change(screen.getByLabelText('Collection filter'), { target: { value: '1005' } });
    fireEvent.click(screen.getByRole('button', { name: 'Favorite Entrance' }));
    fireEvent.click(screen.getByRole('button', { name: 'Favorites' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close library' }));
    fireEvent.click(screen.getByRole('button', { name: 'Open library' }));
    expect(screen.getByLabelText('Search sounds')).toHaveProperty('value', 'door');
    expect(screen.getByLabelText('Collection filter')).toHaveProperty('value', '1005');
    await waitFor(() => expect(localStorage.getItem('czaba:sfx-favorites:7')).toBe('[3]'));
  });
  it('adds three sounds from two collections at exact positions and preserves their export after save/open', async () => {
    mountScene();
    await addSound('Hall', 0);
    await addSound('Checkout', 12);
    await addSound('Entrance', 25);
    fireEvent.click(screen.getByRole('button', { name: /Save scene/ }));
    await waitFor(() => expect(saved?.clips).toHaveLength(3));
    expect(saved?.clips.map((clip) => [clip.recordingId, clip.offset, clip.length])).toEqual([
      [1, 0, 12],
      [2, 12, 12],
      [3, 25, 5],
    ]);
    expect(loadSfxOriginal).toHaveBeenCalledWith(1005, 3, 'test', expect.any(AbortSignal));
    if (!saved) throw new Error('Missing saved scene');
    const before = renderSfxScene(
      saved,
      new Map([
        [1, audio],
        [2, audio],
        [3, audio],
      ]),
    ).audio;
    const savedId = saved.id;
    fireEvent.click(screen.getByRole('button', { name: 'New scene' }));
    fireEvent.change(screen.getByLabelText('Saved account scenes'), {
      target: { value: savedId },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Open scene' }));
    await waitFor(() => expect(openAccountScene).toHaveBeenCalled());
    await waitFor(() =>
      expect(
        screen.getAllByLabelText('Starts in scene (s)').map((input) => input.getAttribute('value')),
      ).toEqual(['0', '12', '25']),
    );
    expect(
      screen.getAllByLabelText('Sound length (s)').map((input) => input.getAttribute('value')),
    ).toEqual(['12', '12', '5']);
    fireEvent.click(screen.getByRole('button', { name: /Save scene/ }));
    await waitFor(() => expect(saveAccountScene).toHaveBeenCalledTimes(2));
    const after = renderSfxScene(
      saved,
      new Map([
        [1, audio],
        [2, audio],
        [3, audio],
      ]),
    ).audio;
    expect(after.channels).toEqual(before.channels);
  });
  it('stops a pending preview when closing the library and keeps the scene playhead', async () => {
    let resolveGrant: ((value: Response) => void) | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            resolveGrant = resolve;
          }),
      ),
    );
    mountScene();
    fireEvent.change(screen.getByLabelText('Exact scene position (seconds)'), {
      target: { value: '7.24' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Preview Hall' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close library' }));
    resolveGrant?.(
      new Response(
        JSON.stringify({ streamUrl: 'https://audio.test/preview', expiresAt: Date.now() + 120000 }),
      ),
    );
    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Exact scene position (seconds)')).toHaveProperty('value', '7.24');
  });
});

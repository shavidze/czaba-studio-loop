import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SfxSceneBuilder } from '~/components/recordings/SfxSceneBuilder';

vi.mock('~/services/sfx-scene.client', () => ({
  listAccountScenes: vi.fn().mockResolvedValue([]),
}));

const sources: {
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
}[] = [];
class TestAudioContext {
  currentTime = 0;
  destination = {};
  resume = vi.fn().mockResolvedValue(undefined);
  close = vi.fn().mockResolvedValue(undefined);
  createBuffer() {
    return { copyToChannel: vi.fn() };
  }
  createBufferSource() {
    const source = {
      start: vi.fn(),
      stop: vi.fn(),
      disconnect: vi.fn(),
      connect: vi.fn(),
      onended: null,
    };
    sources.push(source);
    return source;
  }
}

beforeEach(() => {
  sources.length = 0;
  vi.stubGlobal('AudioContext', TestAudioContext);
  vi.stubGlobal(
    'URL',
    class extends URL {
      static createObjectURL() {
        return 'blob:local-video';
      }
      static revokeObjectURL = vi.fn();
    },
  );
  vi.spyOn(HTMLMediaElement.prototype, 'readyState', 'get').mockReturnValue(2);
  vi.spyOn(HTMLMediaElement.prototype, 'seeking', 'get').mockReturnValue(false);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, 'src', 'set').mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    Object.defineProperty(this, 'duration', { value: 30 });
    Object.defineProperty(this, 'videoWidth', { value: 1920 });
    Object.defineProperty(this, 'videoHeight', { value: 1080 });
    queueMicrotask(() => this.dispatchEvent(new Event('loadedmetadata')));
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function chooseVideo() {
  render(
    <SfxSceneBuilder
      catalog={{ productId: 1004, productTitle: 'Mall', licenseType: 'Universal', recordings: [] }}
      token="test"
      onPlaybackStart={() => {}}
    />,
  );
  fireEvent.change(screen.getByLabelText('Choose local video'), {
    target: { files: [new File(['test'], 'Mall.mp4', { type: 'video/mp4' })] },
  });
  await waitFor(() =>
    expect(screen.getByLabelText('Scene length (seconds)')).toHaveProperty('disabled', true),
  );
}

describe('Video Sync unified playback', () => {
  it('keeps sound stopped and shows a recoverable error when video playback is rejected', async () => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockRejectedValue(
      new Error('Video playback blocked'),
    );
    await chooseVideo();
    fireEvent.click(screen.getByRole('button', { name: 'Play scene' }));
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain('Video playback blocked'),
    );
    expect(sources).toHaveLength(0);
    expect(screen.queryByRole('button', { name: 'Pause scene' })).toBeNull();
  });
  it('anchors sound to the actual video time after the play promise resolves and pauses both', async () => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (
      this: HTMLMediaElement,
    ) {
      this.currentTime = 0.045;
      return Promise.resolve();
    });
    await chooseVideo();
    fireEvent.click(screen.getByRole('button', { name: 'Play scene' }));
    await waitFor(() => expect(sources[0]?.start).toHaveBeenCalledWith(0, 0.045));
    fireEvent.click(screen.getByRole('button', { name: 'Pause scene' }));
    expect(sources[0].stop).toHaveBeenCalledOnce();
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
  });
});

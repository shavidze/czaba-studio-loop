import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SfxVideoSync } from '~/components/recordings/SfxVideoSync';

interface VideoSyncHandlers {
  onChoose: ReturnType<typeof vi.fn>;
}

function renderVideoSync(busy: boolean): VideoSyncHandlers {
  const onChoose = vi.fn();
  render(
    <SfxVideoSync
      url=""
      position={0}
      busy={busy}
      onChoose={onChoose}
      onUpdate={vi.fn()}
      onSeek={vi.fn()}
      onBuffering={vi.fn()}
      onError={vi.fn()}
    />,
  );
  return { onChoose };
}

function fileInputOf(): HTMLInputElement {
  const input = screen.getByLabelText('Choose local video');
  if (!(input instanceof HTMLInputElement)) {
    throw new Error('Choose local video is not an input');
  }
  return input;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('SfxVideoSync "Choose video" button (R98)', () => {
  it('SV1: exactly one "Choose video" button is exposed', () => {
    renderVideoSync(false);
    expect(screen.getAllByRole('button', { name: 'Choose video' })).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Choose video' }).matches(':disabled')).toBe(false);
  });

  it('SV2: clicking the button opens the hidden file input once', () => {
    renderVideoSync(false);
    const contexts: HTMLInputElement[] = [];
    const click = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(function (
      this: HTMLInputElement,
    ) {
      contexts.push(this);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Choose video' }));
    expect(click).toHaveBeenCalledTimes(1);
    expect(contexts).toHaveLength(1);
    expect(contexts[0]).toBe(fileInputOf());
  });

  it('SV3: the file input accepts video and is out of the tab order', () => {
    renderVideoSync(false);
    const input = fileInputOf();
    expect(input.type).toBe('file');
    expect(input.accept).toBe('video/*');
    expect(input.tabIndex).toBe(-1);
  });

  it('SV4: choosing a file calls onChoose once with that file and resets the input', () => {
    const { onChoose } = renderVideoSync(false);
    const input = fileInputOf();
    const file = new File(['video'], 'Scene.mp4', { type: 'video/mp4' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(onChoose).toHaveBeenCalledTimes(1);
    expect(onChoose).toHaveBeenCalledWith(file);
    expect(input.value).toBe('');
  });

  it('SV5: while busy, the button is disabled through the fieldset', () => {
    renderVideoSync(true);
    expect(screen.getByRole('button', { name: 'Choose video' }).matches(':disabled')).toBe(true);
  });
});

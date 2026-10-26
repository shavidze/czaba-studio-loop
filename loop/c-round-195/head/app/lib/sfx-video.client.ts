export function getSfxSyncPosition(
  time: number,
  duration: number,
  loop?: { start: number; end: number; enabled: boolean },
) {
  if (loop?.enabled && loop.end > loop.start && time >= loop.end)
    return loop.start + ((time - loop.start) % (loop.end - loop.start));
  return Math.max(0, Math.min(duration, time));
}

export async function seekSfxVideo(video: HTMLVideoElement, time: number, signal: AbortSignal) {
  if (signal.aborted) throw new Error('Playback cancelled.');
  if (Math.abs(video.currentTime - time) < 0.001 && !video.seeking && video.readyState >= 2) return;
  await new Promise<void>((resolve, reject) => {
    const finish = (error?: Error) => {
      clearTimeout(timeout);
      video.removeEventListener('seeked', ready);
      video.removeEventListener('loadeddata', ready);
      video.removeEventListener('error', failed);
      signal.removeEventListener('abort', cancelled);
      if (error) reject(error);
      else resolve();
    };
    const ready = () => {
      if (!video.seeking && video.readyState >= 2) finish();
    };
    const failed = () =>
      finish(new Error('This video cannot be played. Choose a supported video file.'));
    const cancelled = () => finish(new Error('Playback cancelled.'));
    const timeout = window.setTimeout(
      () => finish(new Error('Video is not ready. Try playback again.')),
      10000,
    );
    video.addEventListener('seeked', ready);
    video.addEventListener('loadeddata', ready);
    video.addEventListener('error', failed);
    signal.addEventListener('abort', cancelled, { once: true });
    video.currentTime = time;
    ready();
  });
}

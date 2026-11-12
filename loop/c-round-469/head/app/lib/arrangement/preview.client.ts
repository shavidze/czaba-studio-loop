export interface LibraryPreviewPlayer {
  playLibraryPreview: (buffer: AudioBuffer, offset: number) => void;
  playLibraryPreviewStream: (
    url: string,
    offset: number,
    onStreamError: (atSeconds: number) => void,
  ) => void;
  stopLibraryPreview: () => void;
  getLibraryPreviewOffset: () => number | null;
}

export interface LibraryPreviewPlayerOptions {
  createAudioElement?: () => HTMLAudioElement;
  scheduleStallTimeout?: (callback: () => void, ms: number) => () => void;
  streamStallTimeoutMs?: number;
}

export const LIBRARY_PREVIEW_STREAM_STALL_MS = 8000;

const scheduleWindowTimeout = (callback: () => void, ms: number) => {
  const id = window.setTimeout(callback, ms);
  return () => window.clearTimeout(id);
};

interface ActiveBufferPreview {
  kind: 'buffer';
  source: AudioBufferSourceNode;
  startedAt: number;
  offset: number;
  duration: number;
}

interface ActiveStreamPreview {
  kind: 'stream';
  element: HTMLAudioElement;
  url: string;
  detach: () => void;
  fail: () => void;
  restartArmedStall: () => void;
  setErrorHandler: (handler: (atSeconds: number) => void) => void;
  setStart: (atSeconds: number) => void;
  readTime: () => number;
}

type ActivePreview = ActiveBufferPreview | ActiveStreamPreview;

export function createLibraryPreviewPlayer(
  ctx: AudioContext,
  onEnded: () => void,
  {
    createAudioElement = () => new Audio(),
    scheduleStallTimeout = scheduleWindowTimeout,
    streamStallTimeoutMs = LIBRARY_PREVIEW_STREAM_STALL_MS,
  }: LibraryPreviewPlayerOptions = {},
): LibraryPreviewPlayer {
  let active: ActivePreview | null = null;

  const stopActive = () => {
    const current = active;
    active = null;
    if (!current) {
      return;
    }
    if (current.kind === 'stream') {
      current.detach();
      current.element.pause();
      current.element.removeAttribute('src');
      current.element.load();
      return;
    }
    current.source.onended = null;
    try {
      current.source.stop();
    } catch {
      current.source.onended = null;
    }
    current.source.disconnect();
  };

  return {
    playLibraryPreview(buffer, offset) {
      stopActive();
      const start = Math.min(Math.max(0, offset), Math.max(0, buffer.duration - 0.001));
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      const preview: ActiveBufferPreview = {
        kind: 'buffer',
        source,
        startedAt: ctx.currentTime,
        offset: start,
        duration: buffer.duration,
      };
      source.onended = () => {
        if (active === preview) {
          active = null;
          source.disconnect();
          onEnded();
        }
      };
      source.start(ctx.currentTime, start);
      active = preview;
    },
    playLibraryPreviewStream(url, offset, onStreamError) {
      let start = Math.max(0, offset);
      const playing = active;
      if (playing?.kind === 'stream' && playing.url === url) {
        playing.setErrorHandler(onStreamError);
        playing.setStart(start);
        try {
          playing.element.currentTime = start;
          playing.restartArmedStall();
        } catch {
          playing.fail();
        }
        return;
      }
      stopActive();
      const element = createAudioElement();
      element.crossOrigin = 'anonymous';
      let errorHandler = onStreamError;
      const handleEnded = () => {
        if (active === preview) {
          stopActive();
          onEnded();
        }
      };
      const readTime = (fallback = start) => {
        try {
          return element.currentTime;
        } catch {
          return fallback;
        }
      };
      const reportError = (at: number) => {
        if (active === preview) {
          stopActive();
          errorHandler(at);
        }
      };
      const handleError = () => {
        if (active === preview) {
          reportError(readTime());
        }
      };
      let cancelStall: (() => void) | null = null;
      const disarmStall = () => {
        cancelStall?.();
        cancelStall = null;
      };
      const armStall = () => {
        disarmStall();
        const armedAt = readTime();
        cancelStall = scheduleStallTimeout(() => {
          cancelStall = null;
          if (active !== preview) {
            return;
          }
          const now = readTime(armedAt);
          if (now === armedAt) {
            reportError(now);
          }
        }, streamStallTimeoutMs);
      };
      const restartArmedStall = () => {
        if (cancelStall) {
          armStall();
        }
      };
      const handlePause = () => {
        if (active === preview && !element.ended && !element.error) {
          stopActive();
          onEnded();
        }
      };
      element.addEventListener('ended', handleEnded);
      element.addEventListener('error', handleError);
      element.addEventListener('waiting', armStall);
      element.addEventListener('playing', disarmStall);
      element.addEventListener('progress', restartArmedStall);
      element.addEventListener('pause', handlePause);
      const preview: ActiveStreamPreview = {
        kind: 'stream',
        element,
        url,
        detach: () => {
          disarmStall();
          element.removeEventListener('ended', handleEnded);
          element.removeEventListener('error', handleError);
          element.removeEventListener('waiting', armStall);
          element.removeEventListener('playing', disarmStall);
          element.removeEventListener('progress', restartArmedStall);
          element.removeEventListener('pause', handlePause);
        },
        fail: handleError,
        restartArmedStall,
        setErrorHandler: (handler) => {
          errorHandler = handler;
        },
        setStart: (atSeconds) => {
          start = atSeconds;
        },
        readTime: () => readTime(),
      };
      active = preview;
      try {
        element.src = url;
        if (active !== preview) {
          return;
        }
        element.currentTime = start;
        armStall();
        void Promise.resolve(element.play()).catch(handleError);
      } catch {
        handleError();
      }
    },
    stopLibraryPreview() {
      stopActive();
    },
    getLibraryPreviewOffset() {
      if (!active) {
        return null;
      }
      if (active.kind === 'stream') {
        return active.readTime();
      }
      return Math.min(
        active.duration,
        active.offset + Math.max(0, ctx.currentTime - active.startedAt),
      );
    },
  };
}

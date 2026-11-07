export interface LibraryPreviewPlayer {
  playLibraryPreview: (buffer: AudioBuffer, offset: number) => void;
  stopLibraryPreview: () => void;
  getLibraryPreviewOffset: () => number | null;
}

interface ActivePreview {
  source: AudioBufferSourceNode;
  startedAt: number;
  offset: number;
  duration: number;
}

export function createLibraryPreviewPlayer(
  ctx: AudioContext,
  onEnded: () => void,
): LibraryPreviewPlayer {
  let active: ActivePreview | null = null;

  const stopActive = () => {
    const current = active;
    active = null;
    if (!current) {
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
      const preview: ActivePreview = {
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
    stopLibraryPreview() {
      stopActive();
    },
    getLibraryPreviewOffset() {
      if (!active) {
        return null;
      }
      return Math.min(
        active.duration,
        active.offset + Math.max(0, ctx.currentTime - active.startedAt),
      );
    },
  };
}

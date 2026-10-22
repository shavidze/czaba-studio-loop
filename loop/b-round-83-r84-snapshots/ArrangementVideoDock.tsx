import {
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  type ArrangementPlaybackClock,
  formatArrangementTime,
  useArrangement,
  useArrangementPositionStore,
  useArrangementPositionWriter,
} from '~/contexts/ArrangementContext';
import {
  clampFloatingVideoRect,
  type FloatingVideoRect,
  type FloatingVideoViewport,
  stepFloatingVideoRect,
} from '~/lib/arrangement/panels';
import { findVideoClipAt, resolveVideoTarget } from '~/lib/arrangement/video';
import {
  canEscalateAfterSeeked,
  createVideoSettleState,
  createVideoStallWindow,
  holdRelease,
  nextPredictableDiscontinuity,
  shouldHardSeek,
  VIDEO_DEFAULT_FRAME_SECONDS,
  VIDEO_DISCONTINUITY_SECONDS,
  VIDEO_HARD_SEEK_INTERVAL_MS,
  VIDEO_HOLD_SEEK_LEAD_SECONDS,
  VIDEO_SEEK_PENDING_TIMEOUT_MS,
  VIDEO_STANDBY_HORIZON_SECONDS,
  type VideoSettleState,
  type VideoStallWindow,
} from '~/lib/arrangement/video-sync';
import { seekSfxVideo } from '~/lib/sfx-video.client';
import { cn } from '~/lib/utils';
import type { Arrangement, ArrangementClip, WorkspaceVideoSource } from '~/types/arrangement';

const VIDEO_END_GUARD_SECONDS = 1 / 30;
const VIDEO_POSITIONED_SECONDS = 0.04;
const VIDEO_MAX_FRAME_SECONDS = 0.1;
const VIDEO_LATE_SWAP_SECONDS = 0.1;
const HAVE_METADATA = 1;
const HAVE_CURRENT_DATA = 2;
const VIDEO_PLAY_FAILED_MESSAGE = 'ვიდეოს დაკვრა ვერ მოხერხდა — სცადე MP4 (H.264) ან WebM.';
const VIDEO_ELEMENT_CLASS = 'absolute inset-0 h-full w-full object-contain';
const VIDEO_RETURN_LABEL = 'ვიდეოს პატარა ხედზე დაბრუნება';
const VIDEO_FLOAT_BUTTON_CLASS =
  'flex h-6 w-6 items-center justify-center rounded-sm bg-background/80 text-xs text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

function readFloatingVideoViewport(): FloatingVideoViewport {
  return { viewportWidth: window.innerWidth, viewportHeight: window.innerHeight };
}

interface DockVideoSlot {
  element: HTMLVideoElement;
  pendingSince: number | null;
  lastSeekAt: number;
  playPending: boolean;
  wantsPlay: boolean;
  hold: boolean;
  seekWanted: boolean;
  preparedKey: string | null;
  clipId: string | null;
  seekedAt: number;
  escalatedAt: number | null;
}

interface DockSyncSample {
  ctxTime: number;
  unclamped: number;
}

interface ArmedVideoSwap {
  key: string;
  clipId: string;
  mediaTime: number;
  atCtx: number;
}

interface DockSyncState {
  slots: [DockVideoSlot, DockVideoSlot];
  activeIndex: 0 | 1;
  lastSample: DockSyncSample | null;
  armed: ArmedVideoSwap | null;
  wasPlaying: boolean;
  lastFrameAt: number | null;
  frameInterval: number;
  swaps: number;
  fallbacks: number;
  hardSeeks: number;
  escalations: number;
  postSwapSettles: number;
  stall: VideoStallWindow;
  postSwapSettle: VideoSettleState;
}

function createDockSlot(element: HTMLVideoElement): DockVideoSlot {
  element.preservesPitch = false;
  return {
    element,
    pendingSince: null,
    lastSeekAt: Number.NEGATIVE_INFINITY,
    playPending: false,
    wantsPlay: false,
    hold: false,
    seekWanted: false,
    preparedKey: null,
    clipId: null,
    seekedAt: Number.NEGATIVE_INFINITY,
    escalatedAt: null,
  };
}

function canEscalateVideoSlot(slot: DockVideoSlot, now: number): boolean {
  return canEscalateAfterSeeked({ escalatedAt: slot.escalatedAt, seekedAt: slot.seekedAt, now });
}

function writeVideoRate(slot: DockVideoSlot, rate: number) {
  if (slot.element.playbackRate !== rate) {
    slot.element.playbackRate = rate;
  }
}

function isSlotSeekBusy(slot: DockVideoSlot, now: number): boolean {
  if (slot.pendingSince !== null && now - slot.pendingSince > VIDEO_SEEK_PENDING_TIMEOUT_MS) {
    slot.pendingSince = null;
  }
  return slot.element.seeking || slot.pendingSince !== null;
}

function writeSlotSeek(slot: DockVideoSlot, time: number, now: number) {
  slot.pendingSince = now;
  slot.lastSeekAt = now;
  slot.element.currentTime = Math.max(0, time);
}

function pauseSlot(slot: DockVideoSlot) {
  slot.wantsPlay = false;
  if (!slot.element.paused) {
    slot.element.pause();
  }
  writeVideoRate(slot, 1);
}

function clampToClipMedia(clip: ArrangementClip, element: HTMLVideoElement, time: number): number {
  const clipEnd = clip.sourceOffset + clip.duration;
  const mediaEnd = Number.isFinite(element.duration)
    ? Math.min(element.duration, clipEnd)
    : clipEnd;
  const upper = Math.max(clip.sourceOffset, mediaEnd - VIDEO_END_GUARD_SECONDS);
  return Math.min(upper, Math.max(clip.sourceOffset, time));
}

function waitForVideoSeekIdle(video: HTMLVideoElement, signal: AbortSignal): Promise<void> {
  if (!video.seeking) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const finish = () => {
      video.removeEventListener('seeked', finish);
      video.removeEventListener('emptied', finish);
      signal.removeEventListener('abort', cancel);
      resolve();
    };
    const cancel = () => {
      video.removeEventListener('seeked', finish);
      video.removeEventListener('emptied', finish);
      reject(new Error('Playback cancelled.'));
    };
    video.addEventListener('seeked', finish);
    video.addEventListener('emptied', finish);
    signal.addEventListener('abort', cancel, { once: true });
  });
}

interface ArrangementVideoCaptionProps {
  arrangement: Arrangement;
  videoSources: ReadonlyMap<string, WorkspaceVideoSource>;
}

function useVideoSourceIdAtPlayhead(arrangement: Arrangement): string | null {
  const positionStore = useArrangementPositionStore();
  const readSourceId = () =>
    findVideoClipAt(arrangement, positionStore.getPosition())?.clip.sourceId ?? null;
  return useSyncExternalStore(positionStore.subscribePosition, readSourceId, readSourceId);
}

function ArrangementVideoCaption({ arrangement, videoSources }: ArrangementVideoCaptionProps) {
  const sourceId = useVideoSourceIdAtPlayhead(arrangement);
  const source = sourceId === null ? undefined : videoSources.get(sourceId);
  return (
    <p className="min-w-0 flex-1 truncate text-right" data-testid="arrangement-video-caption">
      {source ? source.name : 'ვიდეო'}{' '}
      <span className="text-dim">· ხმა ვიდეოხაზიდან (M/S/Volume)</span>
    </p>
  );
}

function ArrangementVideoGapCaption({ arrangement }: { arrangement: Arrangement }) {
  const positionStore = useArrangementPositionStore();
  const sourceId = useVideoSourceIdAtPlayhead(arrangement);
  const timeRef = useRef<HTMLSpanElement>(null);
  const writeGapTime = useCallback((position: number) => {
    if (timeRef.current) {
      timeRef.current.textContent = formatArrangementTime(position);
    }
  }, []);
  useArrangementPositionWriter(writeGapTime);
  if (sourceId !== null) {
    return null;
  }
  return (
    <p
      className="absolute inset-0 z-20 flex items-center justify-center bg-background p-2 text-center text-xs tabular-nums text-muted"
      data-testid="arrangement-video-gap"
    >
      ვიდეო არ არის ·{' '}
      <span ref={timeRef}>{formatArrangementTime(positionStore.getPosition())}</span>
    </p>
  );
}

interface ArrangementVideoDockProps {
  overview?: ReactNode;
  isVideoExpanded: boolean;
  videoFloatAnchor: FloatingVideoRect | null;
  onVideoExpandedChange: (expanded: boolean) => void;
  claimPointerGesture: (pointerId: number, abort: () => void) => (() => void) | null;
}

export function ArrangementVideoDock({
  overview,
  isVideoExpanded,
  videoFloatAnchor,
  onVideoExpandedChange,
  claimPointerGesture,
}: ArrangementVideoDockProps) {
  const {
    arrangement,
    isPlaying,
    videoSources,
    pausePlaybackWithStatus,
    getLivePosition,
    getPlaybackClock,
    getArrangement,
  } = useArrangement();
  const rootRef = useRef<HTMLElement>(null);
  const firstVideoRef = useRef<HTMLVideoElement>(null);
  const secondVideoRef = useRef<HTMLVideoElement>(null);
  const syncRef = useRef<DockSyncState | null>(null);
  const stoppedSeekRef = useRef<AbortController | null>(null);
  const stoppedKeyRef = useRef<string | null>(null);
  const positionStore = useArrangementPositionStore();
  const videoSourcesRef = useRef(videoSources);
  videoSourcesRef.current = videoSources;
  const pauseWithStatusRef = useRef(pausePlaybackWithStatus);
  pauseWithStatusRef.current = pausePlaybackWithStatus;

  const videoTrackId = arrangement.tracks.find((track) => track.kind === 'video')?.id;
  const hasVideoClips = arrangement.clips.some((clip) => clip.trackId === videoTrackId);

  useEffect(() => {
    const first = firstVideoRef.current;
    const second = secondVideoRef.current;
    if (!first || !second) {
      return;
    }
    const state: DockSyncState = {
      slots: [createDockSlot(first), createDockSlot(second)],
      activeIndex: 0,
      lastSample: null,
      armed: null,
      wasPlaying: false,
      lastFrameAt: null,
      frameInterval: VIDEO_DEFAULT_FRAME_SECONDS,
      swaps: 0,
      fallbacks: 0,
      hardSeeks: 0,
      escalations: 0,
      postSwapSettles: 0,
      stall: createVideoStallWindow(),
      postSwapSettle: createVideoSettleState(),
    };
    syncRef.current = state;
    const settles = state.slots.map((slot) => {
      const settle = (event: Event) => {
        slot.pendingSince = null;
        if (event.type === 'seeked') {
          slot.seekedAt = performance.now();
        }
      };
      for (const type of ['seeked', 'abort', 'emptied'] as const) {
        slot.element.addEventListener(type, settle);
      }
      return settle;
    });

    const publishCounters = () => {
      const root = rootRef.current;
      if (root) {
        root.dataset.videoSwaps = String(state.swaps);
        root.dataset.videoFallbacks = String(state.fallbacks);
        root.dataset.videoHardSeeks = String(state.hardSeeks);
        root.dataset.videoEscalations = String(state.escalations);
        root.dataset.videoSettles = String(state.postSwapSettles);
      }
    };

    const applyRoles = () => {
      state.slots.forEach((slot, index) => {
        const isActive = index === state.activeIndex;
        slot.element.dataset.videoRole = isActive ? 'active' : 'standby';
        slot.element.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        slot.element.classList.toggle('opacity-0', !isActive);
        slot.element.classList.toggle('pointer-events-none', !isActive);
        slot.element.classList.toggle('z-10', isActive);
      });
    };

    const startSlotPlayback = (slot: DockVideoSlot) => {
      slot.wantsPlay = true;
      if (!slot.element.paused || slot.playPending) {
        return;
      }
      const attempt = (retry: boolean) => {
        slot.playPending = true;
        slot.element.play().then(
          () => {
            slot.playPending = false;
            if (!slot.wantsPlay) {
              slot.element.pause();
              writeVideoRate(slot, 1);
            }
          },
          (error: unknown) => {
            slot.playPending = false;
            if (error instanceof DOMException && error.name === 'AbortError') {
              if (retry && slot.wantsPlay && slot.element.paused) {
                attempt(false);
              }
              return;
            }
            if (slot.wantsPlay) {
              pauseWithStatusRef.current(VIDEO_PLAY_FAILED_MESSAGE);
            }
          },
        );
      };
      attempt(true);
    };

    const issueHoldSeek = (slot: DockVideoSlot, time: number, now: number) => {
      state.stall.resetStallWindow();
      state.postSwapSettle.endSettle();
      pauseSlot(slot);
      slot.hold = true;
      slot.seekWanted = false;
      writeSlotSeek(slot, time, now);
      state.hardSeeks += 1;
      publishCounters();
    };

    const stopAllSlots = () => {
      for (const slot of state.slots) {
        pauseSlot(slot);
        slot.hold = false;
        slot.seekWanted = false;
        slot.clipId = null;
      }
      state.lastSample = null;
      state.armed = null;
      state.stall.resetStallWindow();
      state.postSwapSettle.endSettle();
    };

    const prepareStandby = (
      slot: DockVideoSlot,
      url: string,
      mediaTime: number,
      key: string,
      now: number,
    ) => {
      pauseSlot(slot);
      if (slot.element.getAttribute('src') !== url) {
        slot.element.src = url;
        slot.pendingSince = null;
        slot.preparedKey = null;
      }
      if (
        slot.preparedKey === key ||
        slot.element.readyState < HAVE_METADATA ||
        isSlotSeekBusy(slot, now) ||
        now - slot.lastSeekAt < VIDEO_HARD_SEEK_INTERVAL_MS
      ) {
        return;
      }
      slot.preparedKey = key;
      writeSlotSeek(slot, mediaTime, now);
    };

    const isStandbyReady = (slot: DockVideoSlot, key: string, mediaTime: number, now: number) =>
      slot.preparedKey === key &&
      !isSlotSeekBusy(slot, now) &&
      slot.element.readyState >= HAVE_CURRENT_DATA &&
      Math.abs(slot.element.currentTime - mediaTime) <= VIDEO_POSITIONED_SECONDS;

    const runPlayingStep = (clock: ArrangementPlaybackClock, now: number) => {
      const current = getArrangement();
      const sources = videoSourcesRef.current;
      const live = getLivePosition();
      const audioLead = clock.scrubbing ? 0 : Math.max(0, clock.holdUntil - clock.ctxTime);
      const active = state.slots[state.activeIndex];
      const standby = state.slots[state.activeIndex === 0 ? 1 : 0];
      const target = resolveVideoTarget(current, live);
      const due = state.armed;
      if (due && clock.ctxTime >= due.atCtx) {
        state.armed = null;
        const lateBy = clock.ctxTime - due.atCtx;
        const stillMapped =
          target !== null &&
          target.clip.id === due.clipId &&
          Math.abs(target.mediaTime - (due.mediaTime + lateBy)) <= VIDEO_POSITIONED_SECONDS;
        if (
          stillMapped &&
          lateBy <= VIDEO_LATE_SWAP_SECONDS &&
          isStandbyReady(standby, due.key, due.mediaTime, now)
        ) {
          writeVideoRate(standby, 1);
          standby.hold = false;
          standby.seekWanted = false;
          standby.clipId = due.clipId;
          startSlotPlayback(standby);
          pauseSlot(active);
          active.hold = false;
          active.seekWanted = false;
          active.clipId = null;
          active.preparedKey = null;
          state.activeIndex = state.activeIndex === 0 ? 1 : 0;
          applyRoles();
          state.stall.resetStallWindow();
          state.postSwapSettle.armSettle(due.atCtx);
          state.postSwapSettles += 1;
          state.lastSample = { ctxTime: due.atCtx, unclamped: due.mediaTime };
          state.swaps += 1;
          publishCounters();
          return;
        }
        if (stillMapped) {
          state.fallbacks += 1;
          publishCounters();
        }
      }
      const upcoming = nextPredictableDiscontinuity(
        current,
        clock.loop,
        live,
        VIDEO_STANDBY_HORIZON_SECONDS,
      );
      const upcomingUrl = upcoming ? sources.get(upcoming.sourceId)?.url : undefined;
      if (upcoming && upcomingUrl) {
        const key = `${upcoming.clipId}|${upcomingUrl}|${upcoming.mediaTime.toFixed(4)}`;
        prepareStandby(standby, upcomingUrl, upcoming.mediaTime, key, now);
        state.armed = {
          key,
          clipId: upcoming.clipId,
          mediaTime: upcoming.mediaTime,
          atCtx: clock.ctxTime + upcoming.delay + audioLead,
        };
      } else {
        state.armed = null;
      }
      const source = target ? sources.get(target.clip.sourceId) : undefined;
      if (!target || !source) {
        state.stall.resetStallWindow();
        state.postSwapSettle.endSettle();
        pauseSlot(active);
        active.hold = false;
        active.seekWanted = false;
        active.clipId = null;
        state.lastSample = null;
        return;
      }
      const unclamped = target.mediaTime - audioLead;
      const previous = state.lastSample;
      const mappingJump = previous
        ? Math.abs(unclamped - (previous.unclamped + (clock.ctxTime - previous.ctxTime)))
        : 0;
      state.lastSample = { ctxTime: clock.ctxTime, unclamped };
      let sourceChanged = false;
      if (active.element.getAttribute('src') !== source.url) {
        active.element.src = source.url;
        active.pendingSince = null;
        active.preparedKey = null;
        sourceChanged = true;
      }
      const busy = isSlotSeekBusy(active, now);
      const canSeek = !busy && now - active.lastSeekAt >= VIDEO_HARD_SEEK_INTERVAL_MS;
      const frame = active.element.currentTime;
      if (sourceChanged) {
        active.hold = false;
        state.stall.resetStallWindow();
      }
      if (active.hold) {
        state.stall.resetStallWindow();
        if (mappingJump > VIDEO_DISCONTINUITY_SECONDS) {
          active.seekWanted = true;
        }
        if (busy) {
          return;
        }
        if (active.seekWanted) {
          if (canSeek) {
            issueHoldSeek(
              active,
              clampToClipMedia(
                target.clip,
                active.element,
                unclamped + VIDEO_HOLD_SEEK_LEAD_SECONDS,
              ),
              now,
            );
          }
          return;
        }
        if (holdRelease(frame, unclamped, state.frameInterval) === 'play') {
          active.hold = false;
          active.clipId = target.clip.id;
          startSlotPlayback(active);
        }
        return;
      }
      if (active.element.paused && !active.playPending) {
        state.stall.resetStallWindow();
        if (busy || active.element.readyState < HAVE_METADATA || active.element.ended) {
          return;
        }
        const inStartHold = audioLead > 0;
        const offset = frame - unclamped;
        const positioned =
          !sourceChanged &&
          (inStartHold
            ? Math.abs(frame - target.mediaTime) <= VIDEO_POSITIONED_SECONDS
            : offset >= -VIDEO_POSITIONED_SECONDS &&
              offset <= VIDEO_HOLD_SEEK_LEAD_SECONDS + VIDEO_POSITIONED_SECONDS);
        if (!positioned) {
          if (canSeek) {
            const seekTo = inStartHold
              ? target.mediaTime
              : unclamped + VIDEO_HOLD_SEEK_LEAD_SECONDS;
            issueHoldSeek(active, clampToClipMedia(target.clip, active.element, seekTo), now);
          }
          return;
        }
        if (holdRelease(frame, unclamped, state.frameInterval) === 'play') {
          active.clipId = target.clip.id;
          startSlotPlayback(active);
        }
        return;
      }
      const drift = frame - unclamped;
      if (
        sourceChanged ||
        shouldHardSeek({
          clipChanged: active.clipId !== null && active.clipId !== target.clip.id,
          continuous: target.continuous,
          mappingJump,
          drift,
        })
      ) {
        active.seekWanted = true;
      }
      if (active.seekWanted) {
        if (canSeek) {
          issueHoldSeek(
            active,
            clampToClipMedia(target.clip, active.element, unclamped + VIDEO_HOLD_SEEK_LEAD_SECONDS),
            now,
          );
        }
        return;
      }
      active.clipId = target.clip.id;
      if (!busy && !active.playPending) {
        const { rate } = state.postSwapSettle.settleRate(clock.ctxTime, drift);
        state.stall.pushStallSample({ ctxTime: clock.ctxTime, drift, rate });
        if (canSeek && canEscalateVideoSlot(active, now) && state.stall.shouldEscalateStall()) {
          active.escalatedAt = now;
          state.escalations += 1;
          issueHoldSeek(
            active,
            clampToClipMedia(target.clip, active.element, unclamped + VIDEO_HOLD_SEEK_LEAD_SECONDS),
            now,
          );
          return;
        }
        writeVideoRate(active, rate);
      }
    };

    let frameId = 0;
    const step = (timestamp: number) => {
      if (state.lastFrameAt !== null) {
        const interval = (timestamp - state.lastFrameAt) / 1000;
        if (interval > 0 && interval <= VIDEO_MAX_FRAME_SECONDS) {
          state.frameInterval = interval;
        }
      }
      state.lastFrameAt = timestamp;
      for (const slot of state.slots) {
        slot.element.muted = true;
      }
      const clock = getPlaybackClock();
      if (!clock) {
        if (state.wasPlaying) {
          state.wasPlaying = false;
          stopAllSlots();
        }
      } else {
        if (!state.wasPlaying) {
          state.wasPlaying = true;
          stoppedSeekRef.current?.abort();
          for (const slot of state.slots) {
            slot.hold = false;
            slot.seekWanted = false;
            slot.clipId = null;
          }
          state.lastSample = null;
          state.stall.resetStallWindow();
          state.postSwapSettle.endSettle();
        }
        runPlayingStep(clock, performance.now());
      }
      frameId = requestAnimationFrame(step);
    };
    applyRoles();
    publishCounters();
    frameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frameId);
      stoppedSeekRef.current?.abort();
      state.slots.forEach((slot, index) => {
        for (const type of ['seeked', 'abort', 'emptied'] as const) {
          slot.element.removeEventListener(type, settles[index]);
        }
        pauseSlot(slot);
      });
      syncRef.current = null;
    };
  }, [getArrangement, getLivePosition, getPlaybackClock]);

  useEffect(() => {
    if (isPlaying) {
      stoppedKeyRef.current = null;
      return;
    }
    const syncStoppedVideo = () => {
      const state = syncRef.current;
      if (!state) {
        return;
      }
      const active = state.slots[state.activeIndex];
      const video = active.element;
      const target = resolveVideoTarget(arrangement, positionStore.getPosition());
      const url = target ? (videoSources.get(target.clip.sourceId)?.url ?? null) : null;
      const key = target && url ? `${url}|${target.mediaTime}` : 'none';
      if (key === stoppedKeyRef.current) {
        return;
      }
      stoppedKeyRef.current = key;
      stoppedSeekRef.current?.abort();
      pauseSlot(active);
      if (!target || !url) {
        return;
      }
      if (video.getAttribute('src') !== url) {
        video.src = url;
        active.pendingSince = null;
        active.preparedKey = null;
      }
      const controller = new AbortController();
      stoppedSeekRef.current = controller;
      waitForVideoSeekIdle(video, controller.signal)
        .then(() => seekSfxVideo(video, target.mediaTime, controller.signal))
        .catch(() => undefined);
    };
    syncStoppedVideo();
    return positionStore.subscribePosition(syncStoppedVideo);
  }, [arrangement, isPlaying, positionStore, videoSources]);

  const [floatRect, setFloatRect] = useState<FloatingVideoRect | null>(videoFloatAnchor);
  const [floatAnchor, setFloatAnchor] = useState<FloatingVideoRect | null>(videoFloatAnchor);
  if (floatAnchor !== videoFloatAnchor) {
    setFloatAnchor(videoFloatAnchor);
    setFloatRect(videoFloatAnchor);
  }
  const isVideoFloating = isVideoExpanded && floatRect !== null;
  const floatDragCleanupRef = useRef<((commit: boolean) => void) | null>(null);
  const expandButtonRef = useRef<HTMLButtonElement>(null);
  const floatFocusRef = useRef(false);

  useEffect(() => {
    if (!isVideoFloating) {
      return;
    }
    const reclampFloatingVideo = () => {
      if (floatDragCleanupRef.current) {
        return;
      }
      setFloatRect((current) =>
        current ? clampFloatingVideoRect(current, readFloatingVideoViewport()) : current,
      );
    };
    window.addEventListener('resize', reclampFloatingVideo);
    return () => {
      window.removeEventListener('resize', reclampFloatingVideo);
      floatDragCleanupRef.current?.(false);
      if (
        floatFocusRef.current &&
        (document.activeElement === null || document.activeElement === document.body)
      ) {
        expandButtonRef.current?.focus();
      }
      floatFocusRef.current = false;
    };
  }, [isVideoFloating]);

  const handleFloatFocus = () => {
    floatFocusRef.current = true;
  };

  const handleFloatBlur = (event: ReactFocusEvent<HTMLDivElement>) => {
    if (
      !(event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget))
    ) {
      floatFocusRef.current = false;
    }
  };

  const handleFloatPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = floatRect;
    if (!isVideoFloating || !start || event.button !== 0) {
      return;
    }
    if (event.target instanceof Element && event.target.closest('[data-video-float-action]')) {
      return;
    }
    const box = event.currentTarget;
    const pointerId = event.pointerId;
    const startX = event.clientX;
    const startY = event.clientY;
    const releaseClaim = claimPointerGesture(pointerId, () => cleanup(true));
    if (!releaseClaim) {
      return;
    }
    event.preventDefault();
    if (event.target instanceof Element) {
      const handle = event.target.closest('[data-video-float-handle]');
      if (handle instanceof HTMLElement) {
        handle.focus({ preventScroll: true });
      }
    }
    let latest = start;
    const handleMove = (move: globalThis.PointerEvent) => {
      if (move.pointerId !== pointerId) {
        return;
      }
      latest = clampFloatingVideoRect(
        {
          ...start,
          left: start.left + move.clientX - startX,
          top: start.top + move.clientY - startY,
        },
        readFloatingVideoViewport(),
      );
      box.style.left = `${latest.left}px`;
      box.style.top = `${latest.top}px`;
    };
    const finish = (end: globalThis.PointerEvent) => {
      if (end.pointerId === pointerId) {
        cleanup(true);
      }
    };
    const cleanup = (commit: boolean) => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', finish);
      if (typeof box.hasPointerCapture === 'function' && box.hasPointerCapture(pointerId)) {
        box.releasePointerCapture(pointerId);
      }
      if (floatDragCleanupRef.current === cleanup) {
        floatDragCleanupRef.current = null;
      }
      releaseClaim();
      if (commit) {
        setFloatRect(clampFloatingVideoRect(latest, readFloatingVideoViewport()));
      }
    };
    floatDragCleanupRef.current = cleanup;
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);
    if (typeof box.setPointerCapture === 'function') {
      box.setPointerCapture(pointerId);
    }
  };

  const handleFloatHandleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (!floatRect) {
      return;
    }
    const next = stepFloatingVideoRect(floatRect, event.key, readFloatingVideoViewport());
    if (!next) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (!floatDragCleanupRef.current) {
      const viewport = readFloatingVideoViewport();
      setFloatRect((current) =>
        current ? (stepFloatingVideoRect(current, event.key, viewport) ?? current) : current,
      );
    }
  };

  return (
    <section
      ref={rootRef}
      aria-label="ვიდეო"
      className="flex shrink-0 items-end justify-end gap-3 border-b border-outline bg-surface px-3 py-2"
      data-testid="arrangement-video-dock"
    >
      <div className="flex min-w-0 flex-1 flex-col justify-end gap-1 self-stretch">
        <div className="flex items-baseline justify-between gap-2 text-xs leading-4 text-muted">
          <span className="shrink-0">
            Arrangement <span className="text-dim">· მთლიანი პროექტი</span>
          </span>
          <ArrangementVideoCaption arrangement={arrangement} videoSources={videoSources} />
        </div>
        {overview}
      </div>
      {isVideoFloating ? (
        <div
          className="flex aspect-video w-40 shrink-0 flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-outline bg-background p-2 text-center text-xs text-muted"
          onFocus={handleFloatFocus}
          onBlur={handleFloatBlur}
          data-testid="arrangement-video-placeholder"
        >
          <span>ვიდეო გაფართოებულია</span>
          <button
            type="button"
            onClick={() => onVideoExpandedChange(false)}
            aria-label={VIDEO_RETURN_LABEL}
            className="rounded-sm px-2 py-0.5 text-foreground hover:bg-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            data-testid="arrangement-video-placeholder-return"
          >
            დაბრუნება
          </button>
        </div>
      ) : null}
      <div
        className={cn(
          'aspect-video shrink-0 overflow-hidden rounded-sm bg-background',
          isVideoFloating
            ? 'fixed z-40 cursor-move touch-none shadow-lg ring-1 ring-outline'
            : 'relative w-40',
        )}
        style={
          isVideoFloating && floatRect
            ? { left: floatRect.left, top: floatRect.top, width: floatRect.width }
            : undefined
        }
        onPointerDown={handleFloatPointerDown}
        data-testid="arrangement-video-box"
        data-video-expanded={isVideoExpanded ? 'true' : 'false'}
        data-video-floating={isVideoFloating ? 'true' : 'false'}
        onFocus={handleFloatFocus}
        onBlur={handleFloatBlur}
      >
        <video
          ref={firstVideoRef}
          muted
          playsInline
          preload="auto"
          aria-label="ვიდეოს პრევიუ"
          className={`${VIDEO_ELEMENT_CLASS} z-10`}
          data-testid="arrangement-video"
          data-video-role="active"
        />
        <video
          ref={secondVideoRef}
          muted
          playsInline
          preload="auto"
          aria-label="ვიდეოს პრევიუ (მომზადება)"
          className={`${VIDEO_ELEMENT_CLASS} pointer-events-none opacity-0`}
          data-testid="arrangement-video"
          data-video-role="standby"
        />
        {hasVideoClips ? null : (
          <p className="absolute inset-0 z-20 flex items-center justify-center bg-background p-2 text-center text-xs text-muted">
            ვიდეო ჯერ არ დაგიმატებია
          </p>
        )}
        {hasVideoClips ? <ArrangementVideoGapCaption arrangement={arrangement} /> : null}
        <div className="absolute top-1 right-1 z-30 flex gap-1">
          {isVideoFloating ? (
            <button
              type="button"
              onKeyDown={handleFloatHandleKeyDown}
              aria-label="ვიდეოს გადატანა (ისრებით 16 px)"
              title="ვიდეოს გადატანა"
              className={cn(VIDEO_FLOAT_BUTTON_CLASS, 'cursor-grab')}
              data-testid="arrangement-video-drag"
              data-video-float-handle
            >
              ⠿
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onVideoExpandedChange(!isVideoExpanded)}
            aria-label={isVideoExpanded ? VIDEO_RETURN_LABEL : 'ვიდეოს გაფართოება'}
            title={isVideoExpanded ? VIDEO_RETURN_LABEL : 'ვიდეოს გაფართოება'}
            className={cn(VIDEO_FLOAT_BUTTON_CLASS, 'cursor-pointer')}
            ref={expandButtonRef}
            data-testid="arrangement-video-expand"
            data-video-float-action
          >
            ⤢
          </button>
          {isVideoFloating ? (
            <button
              type="button"
              onClick={() => onVideoExpandedChange(false)}
              aria-label="გაფართოებული ვიდეოს დახურვა"
              title="დახურვა (Esc)"
              className={cn(VIDEO_FLOAT_BUTTON_CLASS, 'cursor-pointer')}
              data-testid="arrangement-video-close"
              data-video-float-action
            >
              ✕
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

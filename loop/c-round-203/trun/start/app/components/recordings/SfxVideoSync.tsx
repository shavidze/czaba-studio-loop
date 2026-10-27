import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { forwardRef, useId, useRef, useState } from 'react';
import { Button } from '~/components/ui/Button';
import type { SfxSceneVideo } from '~/lib/sfx-scene';

interface Props {
  video?: SfxSceneVideo;
  url: string;
  position: number;
  busy: boolean;
  onChoose: (file: File) => void;
  onUpdate: (video: SfxSceneVideo) => void;
  onSeek: (time: number) => void;
  onBuffering: () => void;
  onError: () => void;
}

export const SfxVideoSync = forwardRef<HTMLVideoElement, Props>(
  ({ video, url, position, busy, onChoose, onUpdate, onSeek, onBuffering, onError }, ref) => {
    const id = useId();
    const reduceMotion = useReducedMotion();
    const [tab, setTab] = useState<'markers' | 'settings'>('markers');
    const [markerName, setMarkerName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputClass =
      'mt-1 min-h-11 w-full rounded-lg border border-outline-strong bg-background px-3 text-foreground';
    return (
      <fieldset
        disabled={busy}
        className="rounded-xl border border-outline bg-surface p-4 sm:p-6 [overflow-anchor:none]"
      >
        <legend className="sr-only">Video Sync</legend>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-xl text-foreground">Video Sync</h2>
          <button
            type="button"
            className="relative inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-outline px-4 text-sm text-foreground"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose video
          </button>
          <input
            ref={fileInputRef}
            aria-label="Choose local video"
            type="file"
            accept="video/*"
            tabIndex={-1}
            className="hidden"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) onChoose(file);
              event.currentTarget.value = '';
            }}
          />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-2">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-background">
              <video
                ref={ref}
                src={url || undefined}
                preload="auto"
                playsInline
                muted={video?.muted ?? true}
                aria-label="Local video preview"
                className="absolute inset-0 h-full w-full object-contain"
                onWaiting={onBuffering}
                onError={onError}
              />
              <AnimatePresence initial={false}>
                {!url && (
                  <motion.div
                    key={video?.fileName ?? 'empty'}
                    initial={{ opacity: 0, y: reduceMotion ? 0 : 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.33, 1, 0.68, 1] }}
                    className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-muted"
                  >
                    {video
                      ? `Choose ${video.fileName} again to preview your saved scene.`
                      : 'Choose a video to place your sounds against the picture.'}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <p className="mt-3 h-10 line-clamp-2 break-all overflow-hidden text-xs text-muted">
              Video stays on this device.{' '}
              {video
                ? `${video.fileName} · ${video.duration.toFixed(3)} s`
                : 'Up to 5 minutes. Use a video format supported by your browser.'}
            </p>
          </div>
          <div className="flex h-96 min-w-0 flex-col rounded-lg border border-outline bg-background p-3">
            <div
              className="mb-3 flex gap-2"
              role="tablist"
              aria-label="Video tools"
              onKeyDown={(event) => {
                if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                event.preventDefault();
                const next =
                  event.key === 'Home'
                    ? 'markers'
                    : event.key === 'End'
                      ? 'settings'
                      : tab === 'markers'
                        ? 'settings'
                        : 'markers';
                setTab(next);
                event.currentTarget.querySelectorAll('button')[next === 'markers' ? 0 : 1]?.focus();
              }}
            >
              <button
                type="button"
                role="tab"
                id={`${id}-markers`}
                aria-selected={tab === 'markers'}
                tabIndex={tab === 'markers' ? 0 : -1}
                aria-controls={`${id}-panel`}
                onClick={() => setTab('markers')}
                className={`min-h-11 flex-1 rounded-lg px-3 text-sm ${tab === 'markers' ? 'bg-surface text-brand' : 'text-muted'}`}
              >
                Moments
              </button>
              <button
                type="button"
                role="tab"
                id={`${id}-settings`}
                aria-selected={tab === 'settings'}
                tabIndex={tab === 'settings' ? 0 : -1}
                aria-controls={`${id}-panel`}
                onClick={() => setTab('settings')}
                className={`min-h-11 flex-1 rounded-lg px-3 text-sm ${tab === 'settings' ? 'bg-surface text-brand' : 'text-muted'}`}
              >
                Video sound & repeat
              </button>
            </div>
            <div
              id={`${id}-panel`}
              role="tabpanel"
              aria-labelledby={`${id}-${tab}`}
              className="min-h-0 flex-1 overflow-y-auto"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.33, 1, 0.68, 1] }}
                  className="space-y-3"
                >
                  {!video ? (
                    <p className="text-sm text-muted">
                      Choose your video to mark moments and repeat a section.
                    </p>
                  ) : tab === 'markers' ? (
                    <>
                      <label className="block text-xs text-muted">
                        Moment name
                        <input
                          maxLength={100}
                          value={markerName}
                          onChange={(event) => setMarkerName(event.currentTarget.value)}
                          className={inputClass}
                        />
                      </label>
                      <Button
                        variant="secondary"
                        disabled={!markerName.trim() || video.markers.length >= 100}
                        onClick={() => {
                          onUpdate({
                            ...video,
                            markers: [
                              ...video.markers,
                              { id: crypto.randomUUID(), time: position, name: markerName.trim() },
                            ].sort((a, b) => a.time - b.time),
                          });
                          setMarkerName('');
                        }}
                      >
                        Mark this moment
                      </Button>
                      {video.markers.map((marker) => (
                        <div
                          key={marker.id}
                          className="flex items-center gap-2 border-t border-outline pt-2"
                        >
                          <button
                            type="button"
                            onClick={() => onSeek(marker.time)}
                            className="min-h-11 min-w-0 flex-1 break-words text-left text-sm text-foreground"
                          >
                            {marker.name}
                            <span className="block font-mono text-xs tabular-nums text-brand">
                              {marker.time.toFixed(3)} s
                            </span>
                          </button>
                          <button
                            type="button"
                            aria-label={`Remove moment ${marker.name}`}
                            onClick={() =>
                              onUpdate({
                                ...video,
                                markers: video.markers.filter((item) => item.id !== marker.id),
                              })
                            }
                            className="min-h-11 px-3 text-sm text-muted"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      <label className="flex min-h-11 items-center gap-2 text-sm text-foreground">
                        <input
                          type="checkbox"
                          checked={video.muted}
                          onChange={(event) =>
                            onUpdate({ ...video, muted: event.currentTarget.checked })
                          }
                          className="h-5 w-5 accent-brand"
                        />
                        Mute video sound
                      </label>
                      <label className="block text-xs text-muted">
                        Video sound level · {Math.round(video.volume * 100)}%
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={video.volume}
                          onChange={(event) =>
                            onUpdate({ ...video, volume: Number(event.currentTarget.value) })
                          }
                          className="block h-11 w-full accent-brand"
                        />
                      </label>
                      <p className="text-xs text-muted">
                        For preview only. WAV contains scene sounds.
                      </p>
                      <label className="flex min-h-11 items-center gap-2 text-sm text-foreground">
                        <input
                          type="checkbox"
                          checked={video.loop.enabled}
                          onChange={(event) =>
                            onUpdate({
                              ...video,
                              loop: { ...video.loop, enabled: event.currentTarget.checked },
                            })
                          }
                          className="h-5 w-5 accent-brand"
                        />
                        Repeat section
                      </label>
                      {(['start', 'end'] satisfies ('start' | 'end')[]).map((boundary) => (
                        <label key={boundary} className="block text-xs text-muted">
                          Repeat {boundary} (s)
                          <input
                            type="number"
                            min="0"
                            max={video.duration}
                            step="0.001"
                            value={video.loop[boundary]}
                            onChange={(event) =>
                              onUpdate({
                                ...video,
                                loop: {
                                  ...video.loop,
                                  [boundary]: Number(event.currentTarget.value),
                                },
                              })
                            }
                            className={inputClass}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              onUpdate({ ...video, loop: { ...video.loop, [boundary]: position } })
                            }
                            className="min-h-11 text-xs text-brand"
                          >
                            Use current time for {boundary}
                          </button>
                        </label>
                      ))}
                      <p className="text-xs text-muted">
                        Repeat affects playback. WAV keeps the full video duration from zero.
                      </p>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </fieldset>
    );
  },
);
SfxVideoSync.displayName = 'SfxVideoSync';

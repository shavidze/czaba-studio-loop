import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '~/components/ui/Button';
import type { SfxAudio } from '~/lib/sfx-edit';
import {
  planSfxExport,
  type SfxExportMode,
  type SfxExportProgress,
  sfxExportName,
} from '~/lib/sfx-export';
import { runSfxExport } from '~/lib/sfx-export.client';
import type { SfxScene } from '~/lib/sfx-scene';

interface Props {
  scene: SfxScene;
  originals: Map<number, SfxAudio>;
  titles: ReadonlyMap<number, string>;
  onClose: () => void;
}

export function SfxSceneExport({ scene, originals, titles, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const job = useRef<AbortController | null>(null);
  const [mode, setMode] = useState<SfxExportMode>('mix');
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState<SfxExportProgress>({
    fraction: 0,
    label: 'Ready to prepare',
  });
  const reduceMotion = useReducedMotion();
  const files = useMemo(() => planSfxExport(scene, mode, titles), [scene, mode, titles]);
  useEffect(() => {
    dialog.current?.showModal();
    return () => {
      job.current?.abort();
      dialog.current?.close();
    };
  }, []);
  const close = () => {
    job.current?.abort();
    onClose();
  };
  const prepare = async () => {
    if (working) return;
    const abort = new AbortController();
    job.current = abort;
    setWorking(true);
    setError('');
    setMessage('');
    setProgress({ fraction: 0, label: 'Reading original recordings' });
    try {
      const result = await runSfxExport(
        { scene, originals, files, mode },
        abort.signal,
        setProgress,
      );
      if (abort.signal.aborted) return;
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download =
        mode === 'mix' ? files[0].name : `${sfxExportName(scene.name)}_${mode}_CZABA.zip`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setProgress({ fraction: 1, label: 'Download prepared' });
      setMessage(
        result.overloaded
          ? 'WAV downloaded. Lower sound levels to avoid distortion, then export again.'
          : `${files.length} WAV ${files.length === 1 ? 'file' : 'files'} downloaded${mode === 'mix' ? '.' : ' in one ZIP.'}`,
      );
    } catch (reason) {
      if (dialog.current?.open) {
        if (abort.signal.aborted) {
          setProgress({ fraction: 0, label: 'Cancelled' });
          setMessage('Export cancelled. Your scene is unchanged.');
        } else
          setError(
            reason instanceof Error
              ? reason.message
              : 'Export failed. Your scene is preserved. Please retry.',
          );
      }
    } finally {
      if (dialog.current?.open) setWorking(false);
    }
  };
  return (
    <dialog
      ref={dialog}
      aria-labelledby="sfx-export-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      className="fixed inset-0 m-auto w-full max-w-2xl max-h-[90dvh] overflow-hidden rounded-xl border border-outline bg-surface p-0 text-foreground shadow-xl backdrop:bg-background/90"
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex max-h-[90dvh] flex-col"
      >
        <header className="flex shrink-0 items-center justify-between gap-4 p-4 sm:p-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-brand">Ready for your edit</p>
            <h2 id="sfx-export-title" className="mt-2 font-serif text-2xl">
              Export audio
            </h2>
          </div>
          <Button variant="secondary" onClick={close}>
            Close
          </Button>
        </header>
        <div className="min-h-0 space-y-5 overflow-y-auto px-4 sm:px-6">
          <fieldset disabled={working} className="space-y-3">
            <legend className="mb-3 text-sm text-muted">Choose what to download</legend>
            {(
              [
                ['mix', 'One combined WAV', 'The full scene, exactly as it plays in Studio.'],
                [
                  'aligned',
                  'Separate sounds · Video sync',
                  'One ZIP. Place every WAV at zero in your video editor.',
                ],
                [
                  'compact',
                  'Separate sounds · Used segments',
                  'One ZIP. Only each sound’s used section, ready to edit.',
                ],
              ] satisfies [SfxExportMode, string, string][]
            ).map(([value, label, description]) => (
              <label
                key={value}
                className={`flex min-h-16 cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors duration-300 ${mode === value ? 'border-brand bg-brand/5' : 'border-outline hover:border-outline-hover'}`}
              >
                <input
                  type="radio"
                  name="sfx-export-mode"
                  value={value}
                  checked={mode === value}
                  onChange={() => {
                    setMode(value);
                    setError('');
                    setMessage('');
                    setProgress({ fraction: 0, label: 'Ready to prepare' });
                  }}
                  className="mt-1 accent-brand focus-visible:ring-2 focus-visible:ring-brand"
                />
                <span className="text-sm">
                  <span className="block">{label}</span>
                  <span className="mt-1 block text-xs text-muted">{description}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <section
            aria-label="Download contents"
            className="rounded-lg border border-outline bg-background p-3"
          >
            <p className="text-sm">
              {files.length} WAV {files.length === 1 ? 'file' : 'files'}
              {mode === 'mix' ? '' : ' · One ZIP'}
            </p>
            <p className="mt-1 text-xs text-muted">
              Stereo · 24-bit WAV · Original recording quality. Mute and Solo are respected.
            </p>
            <ul className="mt-3 h-24 space-y-2 overflow-y-auto text-xs">
              {files.map((file) => (
                <li key={file.name} className="flex items-start justify-between gap-3">
                  <span className="min-w-0 break-all text-muted">{file.name}</span>
                  <span className="shrink-0 tabular-nums">{file.duration.toFixed(3)} s</span>
                </li>
              ))}
              {!files.length && (
                <li className="text-accent">Unmute a sound or clear Solo to include it.</li>
              )}
            </ul>
          </section>
          <div className="h-20 overflow-y-auto" aria-live="polite" aria-atomic="true">
            {working && (
              <div>
                <p className="mb-2 text-sm text-muted">
                  {progress.label} · {Math.floor(progress.fraction * 100)}%
                </p>
                <progress
                  aria-label="Export preparation"
                  max="1"
                  value={progress.fraction}
                  className="h-2 w-full accent-brand"
                />
              </div>
            )}
            {error && (
              <p role="alert" className="text-sm text-accent">
                {error}
              </p>
            )}
            {message && <output className="block text-sm text-brand">{message}</output>}
          </div>
        </div>
        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-outline p-4 sm:p-6">
          <p className="max-w-48 text-xs text-muted">Your scene and originals stay unchanged.</p>
          {working ? (
            <Button variant="secondary" onClick={() => job.current?.abort()}>
              Cancel preparation
            </Button>
          ) : (
            <Button disabled={!files.length} onClick={() => void prepare()}>
              Download {mode === 'mix' ? 'WAV' : 'ZIP'}
            </Button>
          )}
        </footer>
      </motion.div>
    </dialog>
  );
}

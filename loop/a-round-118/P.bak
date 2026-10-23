import { useCallback, useRef, useSyncExternalStore } from 'react';
import {
  GESTURE_EDIT_BLOCKED_MESSAGE,
  useArrangement,
  useMasterMeterStore,
  useMasterMeterWriter,
} from '~/contexts/ArrangementContext';
import { useRelativeFaderDrag } from '~/hooks/useRelativeFaderDrag';
import { FADER_SHIFT_FINE_DIVISOR } from '~/lib/arrangement/fader';
import {
  formatMeterDbAttribute,
  formatPeakDbfs,
  type MasterMeterStore,
  METER_CEILING_DB,
  METER_FLOOR_DB,
  meterDbToFraction,
} from '~/lib/arrangement/meter';
import {
  formatMasterGainDb,
  MASTER_GAIN_MAX_DB,
  MASTER_GAIN_MIN_DB,
} from '~/lib/arrangement/model';
import { cn } from '~/lib/utils';

const MASTER_GAIN_STEP_DB = 0.5;
const MASTER_GAIN_DEFAULT_DB = 0;
const MASTER_HOLD_CLAMP_FROM_DB = METER_CEILING_DB - 1;
const MASTER_HOLD_TOP_TRANSFORM = 'translateX(calc(100% - 1px))';

function masterPeakLabel(text: string, over: boolean): string {
  return over
    ? `Master Peak ${text} dBFS — გადატვირთვა (Clip). გასასუფთავებლად დააჭირე`
    : `Master Peak ${text} dBFS — გასასუფთავებლად დააჭირე`;
}

function ArrangementMasterMeter({ onResetPeak }: { onResetPeak: () => void }) {
  const store = useMasterMeterStore();
  const over = useSyncExternalStore(store.subscribeMeter, store.getMeterOver, () => false);
  const meterRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLSpanElement>(null);
  const holdRef = useRef<HTMLSpanElement>(null);
  const peakRef = useRef<HTMLButtonElement>(null);
  const writtenPeakRef = useRef('');
  const frame = store.getMeterFrame();
  const peakText = formatPeakDbfs(frame.maxPeak, frame.over);

  const writeMeter = useCallback((meterStore: MasterMeterStore) => {
    const meter = meterRef.current;
    const cover = coverRef.current;
    const hold = holdRef.current;
    const peak = peakRef.current;
    if (!meter || !cover || !hold || !peak) {
      return;
    }
    const next = meterStore.getMeterFrame();
    meter.setAttribute('data-level-db', formatMeterDbAttribute(next.levelDb));
    meter.setAttribute('data-hold-db', formatMeterDbAttribute(next.holdDb));
    cover.style.transform = `scaleX(${1 - meterDbToFraction(next.levelDb)})`;
    hold.style.transform =
      next.holdDb > MASTER_HOLD_CLAMP_FROM_DB
        ? MASTER_HOLD_TOP_TRANSFORM
        : `translateX(${meterDbToFraction(next.holdDb) * 100}%)`;
    hold.style.visibility = next.holdDb > METER_FLOOR_DB ? 'visible' : 'hidden';
    const text = formatPeakDbfs(next.maxPeak, next.over);
    const labelKey = `${text}|${next.over}`;
    if (writtenPeakRef.current !== labelKey) {
      writtenPeakRef.current = labelKey;
      peak.textContent = text;
      peak.setAttribute('aria-label', masterPeakLabel(text, next.over));
    }
  }, []);

  useMasterMeterWriter(writeMeter);

  return (
    <>
      <div
        ref={meterRef}
        aria-hidden="true"
        data-testid="arrangement-master-meter"
        data-level-db={formatMeterDbAttribute(frame.levelDb)}
        data-hold-db={formatMeterDbAttribute(frame.holdDb)}
        className="relative h-1.5 w-20 shrink-0 overflow-hidden rounded-full"
      >
        <span className="absolute inset-0 flex">
          <span className="flex-9 bg-positive/80" />
          <span className="flex-1 bg-warning/80" />
          <span className="flex-1 bg-destructive" />
        </span>
        <span ref={coverRef} className="absolute inset-0 origin-right bg-outline" />
        <span className="absolute inset-0 flex">
          <span className="flex-10" />
          <span className="flex-1 border-l border-foreground/70" />
        </span>
        <span ref={holdRef} className="invisible absolute inset-0">
          <span className="absolute inset-y-0 left-0 -ml-px w-0.5 bg-foreground" />
        </span>
      </div>
      <button
        ref={peakRef}
        type="button"
        data-testid="arrangement-master-peak"
        data-state={over ? 'over' : 'clear'}
        aria-label={masterPeakLabel(peakText, frame.over)}
        onClick={onResetPeak}
        className={cn(
          'h-5 w-14 shrink-0 rounded-sm border px-1 text-right text-xs tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
          over
            ? 'border-destructive bg-destructive/15 font-medium text-destructive'
            : 'border-outline text-muted hover:border-outline-hover hover:text-foreground',
        )}
      >
        {peakText}
      </button>
    </>
  );
}

export function ArrangementMaster() {
  const {
    master,
    toggleMasterMute,
    previewMasterGain,
    commitMasterGain,
    beginMasterGainGesture,
    blurMasterGain,
    isPointerGestureActive,
    resetMasterPeak,
    getArrangement,
    setStatus,
  } = useArrangement();
  const readout = formatMasterGainDb(master.gainDb);
  const masterFaderDrag = useRelativeFaderDrag({
    min: MASTER_GAIN_MIN_DB,
    max: MASTER_GAIN_MAX_DB,
    step: MASTER_GAIN_STEP_DB,
    fineDivisor: FADER_SHIFT_FINE_DIVISOR,
    readStoredValue: () => getArrangement().master.gainDb,
    isPointerGestureActive,
    beginGesture: beginMasterGainGesture,
    previewValue: previewMasterGain,
    refuseGesture: () => setStatus(GESTURE_EDIT_BLOCKED_MESSAGE),
  });

  const resetMasterGain = () => {
    previewMasterGain(MASTER_GAIN_DEFAULT_DB);
    commitMasterGain();
  };

  return (
    <fieldset
      aria-label="Master"
      className="flex items-center gap-2 border-l border-outline pl-3"
      data-testid="arrangement-master"
    >
      <span className="text-xs font-medium text-muted" aria-hidden="true">
        Master
      </span>
      <button
        type="button"
        aria-pressed={master.mute}
        aria-label="Master Mute"
        title="Master Mute"
        onClick={toggleMasterMute}
        className={cn(
          'h-5 w-5 shrink-0 rounded-sm border text-xs font-bold leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
          master.mute
            ? 'border-accent bg-accent text-background'
            : 'border-outline text-muted hover:text-foreground',
        )}
      >
        M
      </button>
      <input
        ref={masterFaderDrag.ref}
        type="range"
        min={MASTER_GAIN_MIN_DB}
        max={MASTER_GAIN_MAX_DB}
        step={MASTER_GAIN_STEP_DB}
        value={master.gainDb}
        aria-label="Master Volume"
        aria-valuetext={readout}
        onChange={(event) => previewMasterGain(Number(event.target.value))}
        onPointerDown={masterFaderDrag.onPointerDown}
        onDoubleClick={resetMasterGain}
        onPointerUp={commitMasterGain}
        onLostPointerCapture={commitMasterGain}
        onKeyUp={() => {
          if (!isPointerGestureActive()) {
            commitMasterGain();
          }
        }}
        onBlur={blurMasterGain}
        className="h-1 w-24 shrink-0 touch-none accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      />
      <span
        className="w-16 shrink-0 text-right text-xs tabular-nums text-foreground"
        data-testid="arrangement-master-readout"
      >
        {readout}
      </span>
      <ArrangementMasterMeter onResetPeak={resetMasterPeak} />
    </fieldset>
  );
}

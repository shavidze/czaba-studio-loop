import { useCallback, useRef, useSyncExternalStore } from 'react';
import { useTrackMeterStore, useTrackMeterWriter } from '~/contexts/ArrangementContext';
import {
  formatMeterDbAttribute,
  formatPeakDbfs,
  type MasterMeterState,
  METER_FLOOR_DB,
  meterDbToFraction,
} from '~/lib/arrangement/meter';
import { studioMeterStrings } from '~/lib/arrangement/strings';

interface ArrangementTrackMeterProps {
  trackId: string;
  trackName: string;
}

function trackMeterTitle(trackName: string, peakText: string, over: boolean): string {
  return over
    ? studioMeterStrings.trackPeakOverTitle({ name: trackName, peak: peakText })
    : studioMeterStrings.trackPeakTitle({ name: trackName, peak: peakText });
}

export function ArrangementTrackMeter({ trackId, trackName }: ArrangementTrackMeterProps) {
  const store = useTrackMeterStore();
  const over = useSyncExternalStore(
    store.subscribeTrackMeters,
    () => store.getTrackMeterOver(trackId),
    () => false,
  );
  const meterRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLSpanElement>(null);
  const holdRef = useRef<HTMLSpanElement>(null);
  const writtenLabelRef = useRef('');
  const writtenLevelDbRef = useRef(Number.NaN);
  const writtenHoldDbRef = useRef(Number.NaN);

  const writeMeter = useCallback(
    (frame: MasterMeterState) => {
      const meter = meterRef.current;
      const cover = coverRef.current;
      const hold = holdRef.current;
      if (!meter || !cover || !hold) {
        return;
      }
      if (
        writtenLevelDbRef.current !== frame.levelDb ||
        writtenHoldDbRef.current !== frame.holdDb
      ) {
        writtenLevelDbRef.current = frame.levelDb;
        writtenHoldDbRef.current = frame.holdDb;
        meter.setAttribute('data-level-db', formatMeterDbAttribute(frame.levelDb));
        meter.setAttribute('data-hold-db', formatMeterDbAttribute(frame.holdDb));
        cover.style.transform = `scaleX(${1 - meterDbToFraction(frame.levelDb)})`;
        hold.style.transform = `translateX(${meterDbToFraction(frame.holdDb) * 100}%)`;
        hold.style.visibility = frame.holdDb > METER_FLOOR_DB ? 'visible' : 'hidden';
      }
      const peakText = formatPeakDbfs(frame.maxPeak, frame.over);
      const labelKey = `${trackName}|${peakText}|${frame.over}`;
      if (writtenLabelRef.current !== labelKey) {
        writtenLabelRef.current = labelKey;
        meter.setAttribute('data-peak', peakText);
        meter.setAttribute('data-state', frame.over ? 'over' : 'clear');
        meter.setAttribute('title', trackMeterTitle(trackName, peakText, frame.over));
      }
    },
    [trackName],
  );

  useTrackMeterWriter(trackId, writeMeter);

  return (
    <>
      <div
        ref={meterRef}
        aria-hidden="true"
        data-testid="arrangement-track-meter"
        data-state={over ? 'over' : 'clear'}
        className="absolute inset-x-2 bottom-px h-1"
      >
        <span className="absolute inset-y-0 left-0 right-1.5 overflow-hidden rounded-l-full">
          <span className="absolute inset-0 flex">
            <span className="flex-9 bg-positive/80" />
            <span className="flex-1 bg-warning/80" />
            <span className="flex-1 bg-destructive" />
          </span>
          <span ref={coverRef} className="absolute inset-0 origin-right bg-outline" />
          <span className="absolute inset-0 flex">
            <span className="flex-10" />
            <span className="flex-1 border-l border-foreground/50" />
          </span>
          <span ref={holdRef} className="invisible absolute inset-y-0 left-0 right-0.5">
            <span className="absolute inset-y-0 left-0 w-0.5 bg-foreground" />
          </span>
        </span>
        {over ? (
          <span
            data-testid="arrangement-track-meter-over"
            className="absolute inset-y-0 right-0 w-1 bg-warning"
          />
        ) : null}
      </div>
      {over ? (
        <span className="sr-only">{studioMeterStrings.trackOverAnnouncement(trackName)}</span>
      ) : null}
    </>
  );
}

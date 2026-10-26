import { useStudio } from '~/contexts/StudioContext';

/**
 * Global Playhead - Ableton-style vertical line spanning ruler and all tracks
 *
 * This component should be placed inside a container that:
 * 1. Has position: relative
 * 2. Contains both the ruler and tracks
 * 3. The playhead will span the full height of this container
 *
 * The trackControlsWidth should match the width of the track controls panel (w-56 = 224px)
 */
interface GlobalPlayheadProps {
  trackControlsWidth?: number;
}

export function GlobalPlayhead({ trackControlsWidth = 224 }: GlobalPlayheadProps) {
  const { state, loopEnabled, loopRegion } = useStudio();

  if (!state.allLoaded || state.masterDuration === 0) {
    return null;
  }

  // Calculate playhead position as percentage of the waveform area
  const playheadPercent = (state.currentTime / state.masterDuration) * 100;

  // Check if playhead is inside the global loop region (for color change)
  const isInLoopRegion =
    loopEnabled &&
    loopRegion.end > loopRegion.start &&
    state.currentTime >= loopRegion.start &&
    state.currentTime <= loopRegion.end;

  // Dynamic left position - this must be inline as it's calculated
  const leftPosition = `calc(${trackControlsWidth}px + (100% - ${trackControlsWidth}px) * ${playheadPercent / 100})`;

  return (
    <div
      className={`absolute top-0 bottom-0 w-0.5 pointer-events-none z-10 ${
        isInLoopRegion
          ? 'bg-amber-400 shadow-[0_0_10px_theme(colors.amber.400),0_0_20px_theme(colors.amber.400/40)]'
          : 'bg-brand shadow-glow'
      }`}
      style={{ left: leftPosition }}
    >
      {/* Triangle Handle at Top */}
      <div className="absolute -top-0.5 left-1/2 -translate-x-1/2">
        <div
          className={`w-0 h-0 border-l-[7px] border-r-[7px] border-t-[9px] border-l-transparent border-r-transparent drop-shadow-lg ${
            isInLoopRegion ? 'border-t-amber-400' : 'border-t-brand'
          }`}
        />
      </div>
    </div>
  );
}

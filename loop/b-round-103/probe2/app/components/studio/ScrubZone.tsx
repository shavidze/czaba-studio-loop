import { useEffect, useRef, useState } from 'react';
import { useStudio } from '~/contexts/StudioContext';

/**
 * ScrubZone - Drag area for playhead scrubbing
 *
 * Positioned between Video Sync and Tracks.
 * Click to seek, drag to scrub through timeline.
 */
export function ScrubZone() {
  const { state, seek } = useStudio();
  const zoneRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Convert mouse X position to time
  const getTimeFromMouseX = (clientX: number): number => {
    if (!zoneRef.current) return 0;
    const rect = zoneRef.current.getBoundingClientRect();
    // Account for the left panel (w-56 = 224px)
    const leftPanelWidth = 224;
    const x = clientX - rect.left - leftPanelWidth;
    const availableWidth = rect.width - leftPanelWidth;
    const percentage = Math.max(0, Math.min(1, x / availableWidth));
    return percentage * state.masterDuration;
  };

  // Handle click/drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!state.allLoaded) return;
    e.preventDefault();

    const time = getTimeFromMouseX(e.clientX);
    seek(time);
    setIsDragging(true);
  };

  // Handle drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const time = getTimeFromMouseX(e.clientX);
      seek(time);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, seek, getTimeFromMouseX]);

  if (!state.allLoaded) return null;

  // Calculate playhead position
  const playheadPercent = (state.currentTime / state.masterDuration) * 100;

  return (
    <div
      ref={zoneRef}
      className={`relative h-6 bg-surface/50 border-b border-outline flex items-stretch ${
        state.allLoaded ? 'cursor-ew-resize' : 'cursor-not-allowed'
      } ${isDragging ? 'bg-elevated/50' : 'hover:bg-elevated/30'}`}
      onMouseDown={handleMouseDown}
    >
      {/* Left panel spacer (matches track controls width) */}
      <div className="w-56 bg-surface border-r border-outline flex items-center px-3">
        <span className="text-[10px] text-muted font-mono">Scrub</span>
      </div>

      {/* Scrub area */}
      <div className="flex-1 relative">
        {/* Subtle grid lines */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-px bg-outline"
              style={{ left: `${(i + 1) * 10}%` }}
            />
          ))}
        </div>

        {/* Current position indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-brand pointer-events-none z-10"
          style={{ left: `${playheadPercent}%` }}
        />

        {/* Drag hint */}
        {!isDragging && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[10px] text-dim">Drag to scrub</span>
          </div>
        )}
      </div>
    </div>
  );
}

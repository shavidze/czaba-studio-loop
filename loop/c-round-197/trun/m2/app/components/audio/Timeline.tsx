import { useEffect, useRef, useState } from 'react';

interface TimelineProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  isPlaying: boolean;
}

export function Timeline({ currentTime, duration, onSeek, isPlaying }: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Format time as MM:SS:ms
  const formatTime = (seconds: number): string => {
    if (!Number.isFinite(seconds)) return '00:00:000';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(3, '0')}`;
  };

  // Handle click/drag on timeline
  const handleTimelineInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * duration;

    onSeek(newTime);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handleTimelineInteraction(e);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      const newTime = percentage * duration;
      onSeek(newTime);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Calculate playhead position
  const playheadPosition = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full bg-elevated border-b border-outline">
      {/* Time Display */}
      <div className="flex items-center justify-between px-6 py-2 text-xs font-mono">
        <span className="text-teal-400 font-semibold">{formatTime(currentTime)}</span>
        <span className="text-dim">{formatTime(duration)}</span>
      </div>

      {/* Timeline Bar */}
      <div
        ref={timelineRef}
        className="relative h-12 bg-surface cursor-pointer hover:bg-elevated transition-colors"
        onMouseDown={handleMouseDown}
      >
        {/* Progress Bar */}
        <div
          className="absolute top-0 left-0 h-full bg-teal-500/20 pointer-events-none"
          style={{ width: `${playheadPosition}%` }}
        />

        {/* Playhead Cursor */}
        <div
          className="absolute top-0 h-full w-0.5 bg-teal-400 pointer-events-none shadow-lg shadow-teal-500/50"
          style={{ left: `${playheadPosition}%` }}
        >
          {/* Playhead Handle */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-teal-400 rounded-full shadow-md" />
        </div>

        {/* Time Markers (every 5 seconds for demo) */}
        {Array.from({ length: Math.floor(duration / 5) + 1 }).map((_, i) => {
          const time = i * 5;
          const position = (time / duration) * 100;

          return (
            <div
              key={i}
              className="absolute top-0 h-full w-px bg-outline"
              style={{ left: `${position}%` }}
            >
              <span className="absolute top-full mt-1 -translate-x-1/2 text-[10px] text-dim font-mono">
                {formatTime(time).slice(0, 5)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

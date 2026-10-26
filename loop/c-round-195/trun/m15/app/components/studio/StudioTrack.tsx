import { Download } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type WaveSurfer from 'wavesurfer.js';
import { useStudio } from '~/contexts/StudioContext';
import { debug } from '~/lib/debug';
import type { StudioStemState } from '~/types/studio';

interface StudioTrackProps {
  stem: StudioStemState;
}

export function StudioTrack({ stem }: StudioTrackProps) {
  const {
    toggleMute,
    toggleSolo,
    setVolume,
    registerWaveform,
    unregisterWaveform,
    exportAudio,
    state,
    selectedStemIds,
    selectStem,
    setTimeSelection,
    clearTimeSelection,
    timeSelection,
    seek,
    loopRegion,
    loopEnabled,
  } = useStudio();

  // Check if this stem is selected
  const isSelected = selectedStemIds.has(stem.id);

  const waveformRef = useRef<HTMLDivElement>(null);
  const waveformContainerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  // Time selection drag state
  const [isSelecting, setIsSelecting] = useState(false);
  const selectionStartRef = useRef<number>(0);

  // Convert mouse X position to time
  const getTimeFromMouseX = (clientX: number): number => {
    if (!waveformContainerRef.current) return 0;
    const rect = waveformContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    return percentage * stem.duration;
  };

  // Handle waveform selection start (mouse down)
  const handleSelectionStart = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't start selection if clicking on controls
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.closest('button')) {
      return;
    }

    e.preventDefault();
    const time = getTimeFromMouseX(e.clientX);
    selectionStartRef.current = time;
    setIsSelecting(true);

    // Clear any existing selection when starting new
    clearTimeSelection();
  };

  // Handle waveform selection move
  useEffect(() => {
    if (!isSelecting) return;

    const handleMouseMove = (e: MouseEvent) => {
      const currentTime = getTimeFromMouseX(e.clientX);
      setTimeSelection(selectionStartRef.current, currentTime);
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsSelecting(false);

      // Check if this was just a click (no drag)
      const currentTime = getTimeFromMouseX(e.clientX);
      const selectionDuration = Math.abs(currentTime - selectionStartRef.current);

      if (selectionDuration < 0.1) {
        // Was a click - seek to that position
        clearTimeSelection();
        seek(currentTime);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isSelecting, setTimeSelection, clearTimeSelection, seek, getTimeFromMouseX]);

  // Check if track is implicitly muted due to solo mode
  const anySoloed = state.stems.some((s) => s.isSoloed);
  const isImplicitlyMuted = anySoloed && !stem.isSoloed;

  // Download individual stem
  const handleDownloadStem = async () => {
    if (!state.allLoaded) return;

    try {
      debug.log(`📥 Downloading stem: ${stem.name}`);

      // Call export function for single stem
      const blob = await exportAudio({
        format: 'wav',
        quality: 'high',
        includedStemIds: [stem.id],
        normalize: false,
      });

      // Download the file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = `${stem.name.replace(/\s+/g, '-')}-${stem.trimStart.toFixed(1)}s-${stem.trimEnd.toFixed(1)}s.wav`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      debug.log(`✅ Downloaded: ${fileName}`);
    } catch (error) {
      console.error('Failed to download stem:', error);
      alert(`Failed to download ${stem.name}`);
    }
  };

  // Initialize Wavesurfer (clean, no regions overlay)
  useEffect(() => {
    if (!waveformRef.current) return;

    let wavesurfer: WaveSurfer | null = null;
    let isMounted = true;

    // Dynamic import for client-side only
    const initWaveSurfer = async () => {
      const WaveSurferModule = await import('wavesurfer.js');
      const WaveSurfer = WaveSurferModule.default;

      // Check if still mounted after async import
      if (!isMounted || !waveformRef.current) return;

      wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'hsl(220, 15%, 22%)',
        progressColor: 'hsl(175, 85%, 46%)',
        cursorColor: 'transparent',
        cursorWidth: 0,
        barWidth: 2,
        barGap: 1,
        height: stem.trackHeight,
        normalize: true,
        interact: false,
        backend: 'WebAudio',
      });

      wavesurfer.load(stem.audioUrl);

      wavesurfer.on('ready', () => {
        // Only register if still mounted
        if (isMounted && wavesurfer) {
          registerWaveform(stem.id, wavesurfer);
        }
      });

      wavesurfer.on('error', (error) => {
        // Ignore AbortErrors - they happen during cleanup (React Strict Mode)
        if (error instanceof Error && error.name === 'AbortError') return;
        console.error(`Failed to load waveform for ${stem.name}:`, error);
      });

      wavesurferRef.current = wavesurfer;
    };

    initWaveSurfer();

    return () => {
      isMounted = false;
      unregisterWaveform(stem.id);
      if (wavesurfer) wavesurfer.destroy();
    };
  }, [stem.id, stem.audioUrl, registerWaveform, unregisterWaveform, stem.name, stem.trackHeight]);

  // Handle track selection click
  const handleTrackClick = (e: React.MouseEvent) => {
    // Don't select if clicking on buttons or sliders
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.closest('button')) {
      return;
    }

    if (e.shiftKey) {
      selectStem(stem.id, 'range');
    } else if (e.ctrlKey || e.metaKey) {
      selectStem(stem.id, 'toggle');
    } else {
      selectStem(stem.id, 'replace');
    }
  };

  return (
    <div
      className={`flex items-stretch border-b transition-all cursor-pointer ${
        isSelected
          ? 'border-brand bg-brand/10 ring-1 ring-inset ring-brand/50'
          : 'border-surface hover:bg-surface/30'
      } ${isImplicitlyMuted ? 'opacity-50' : ''}`}
      onClick={handleTrackClick}
    >
      {/* Track Controls - Fixed Left Panel */}
      <div
        className={`w-56 bg-surface border-r border-outline p-3 flex flex-col gap-3 transition-opacity ${
          isImplicitlyMuted ? 'opacity-60' : ''
        } ${isSelected ? 'bg-surface/80' : ''}`}
      >
        {/* Track Name & Download Button */}
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3
              className={`font-medium text-sm truncate ${isSelected ? 'text-brand' : 'text-foreground'}`}
            >
              {stem.name}
            </h3>
            <p className="text-muted text-xs mt-1">
              {stem.isLoaded ? `${stem.duration.toFixed(1)}s` : '...'}
            </p>
          </div>
          <button
            onClick={handleDownloadStem}
            disabled={!state.allLoaded || state.isExporting}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded bg-elevated hover:bg-brand hover:text-brand-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title={`Download ${stem.name} (${stem.trimStart.toFixed(1)}s - ${stem.trimEnd.toFixed(1)}s)`}
          >
            <Download size={14} />
          </button>
        </div>

        {/* Solo & Mute Buttons */}
        <div className="flex gap-1.5">
          <button
            onClick={(e) => {
              const isMultiSelect = e.ctrlKey || e.metaKey; // Ctrl on Windows, Cmd on Mac
              toggleSolo(stem.id, isMultiSelect);
            }}
            disabled={!state.allLoaded}
            title={`Solo (Hold Ctrl/Cmd for multi-solo)`}
            className={`flex-1 h-7 rounded font-bold text-xs transition-all ${
              stem.isSoloed
                ? 'bg-yellow-500 text-black shadow-lg'
                : 'bg-elevated text-muted hover:bg-muted-bg hover:text-foreground'
            } ${!state.allLoaded ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            S
          </button>
          <button
            onClick={() => toggleMute(stem.id)}
            disabled={!state.allLoaded}
            title="Mute"
            className={`flex-1 h-7 rounded font-bold text-xs transition-all ${
              stem.isMuted
                ? 'bg-red-500 text-foreground shadow-lg'
                : 'bg-elevated text-muted hover:bg-muted-bg hover:text-foreground'
            } ${!state.allLoaded ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            M
          </button>
        </div>

        {/* Volume Fader */}
        <div className="flex items-center gap-2">
          <span className="text-muted text-xs w-8 flex-shrink-0">Vol</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={stem.volume}
            onChange={(e) => setVolume(stem.id, parseFloat(e.target.value))}
            disabled={!state.allLoaded}
            className={`flex-1 h-1 bg-elevated rounded-full appearance-none ${
              state.allLoaded ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
            }
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-brand
              [&::-webkit-slider-thumb]:shadow-md
              [&::-webkit-slider-thumb]:cursor-pointer
              [&::-moz-range-thumb]:w-3
              [&::-moz-range-thumb]:h-3
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-brand
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:shadow-md
              [&::-moz-range-thumb]:cursor-pointer`}
          />
          <span className="text-muted text-xs w-8 text-right font-mono flex-shrink-0">
            {Math.round(stem.volume * 100)}
          </span>
        </div>
      </div>

      {/* Waveform Area - Right Panel */}
      <div
        ref={waveformContainerRef}
        className={`flex-1 bg-background p-2 min-w-0 relative transition-all cursor-text ${
          isImplicitlyMuted ? 'opacity-40' : ''
        } ${isSelecting ? 'select-none' : ''}`}
        onMouseDown={handleSelectionStart}
      >
        <div ref={waveformRef} className="w-full studio-track-waveform" />

        {/* Loop Region Mask - Grays out waveform progress outside of loop */}
        {loopEnabled && loopRegion.end > loopRegion.start && (
          <>
            {/* Pre-loop mask (0 to loopStart) */}
            {loopRegion.start > 0 && (
              <div
                className="absolute top-2 bottom-2 pointer-events-none z-[5]"
                style={{
                  left: '8px',
                  width: `${(loopRegion.start / stem.duration) * 100}%`,
                  backgroundColor: 'rgba(23, 23, 23, 0.75)',
                }}
              />
            )}
            {/* Post-loop mask (loopEnd to end) */}
            {loopRegion.end < stem.duration && (
              <div
                className="absolute top-2 bottom-2 pointer-events-none z-[5]"
                style={{
                  left: `calc(8px + ${(loopRegion.end / stem.duration) * 100}%)`,
                  right: '8px',
                  backgroundColor: 'rgba(23, 23, 23, 0.75)',
                }}
              />
            )}
          </>
        )}

        {/* Time Selection Overlay (for setting loop via Ctrl+L) */}
        {timeSelection.isActive && (
          <div
            className="absolute top-0 bottom-0 bg-brand/30 border-x-2 border-brand pointer-events-none z-10"
            style={{
              left: `calc(8px + ${(timeSelection.start / stem.duration) * 100}%)`,
              width: `${((timeSelection.end - timeSelection.start) / stem.duration) * 100}%`,
            }}
          >
            {/* Selection duration label */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-brand text-brand-foreground text-[10px] px-1.5 py-0.5 rounded font-mono whitespace-nowrap">
              {(timeSelection.end - timeSelection.start).toFixed(1)}s
            </div>
            {/* Hint to use Ctrl+L */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-surface/90 text-brand text-[9px] px-1.5 py-0.5 rounded font-mono whitespace-nowrap">
              Ctrl+L → Loop
            </div>
          </div>
        )}

        {/* Implicit Mute Indicator */}
        {isImplicitlyMuted && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-dim text-xs font-mono bg-surface/80 px-2 py-1 rounded">
              Implicitly Muted
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

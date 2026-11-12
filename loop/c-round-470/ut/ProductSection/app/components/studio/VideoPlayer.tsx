import {
  AlertTriangle,
  Link as LinkIcon,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture,
  Play,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { VideoMetadata } from '~/types/studio';

interface VideoPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  blobUrl: string;
  metadata: VideoMetadata;
  onRemove: () => void;
  videoDuration: number;
  stemsDuration: number;
  startOffset: number;
  onOffsetChange: (offset: number) => void;
}

export function VideoPlayer({
  videoRef,
  blobUrl,
  metadata,
  onRemove,
  videoDuration,
  stemsDuration,
  startOffset,
  onOffsetChange,
}: VideoPlayerProps) {
  const [showPlayPauseIcon, setShowPlayPauseIcon] = useState(false);
  const [videoVolume, setVideoVolume] = useState(0); // Default: muted
  const [isVideoMuted, setIsVideoMuted] = useState(true); // Default: muted
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Track video current time and play state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      if (!isSeeking) {
        setVideoCurrentTime(video.currentTime);
      }
    };

    const handlePlay = () => setIsVideoPlaying(true);
    const handlePause = () => setIsVideoPlaying(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [videoRef, isSeeking]);

  // Apply volume and muted state to video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = videoVolume / 100;
      videoRef.current.muted = isVideoMuted;
    }
  }, [videoVolume, isVideoMuted, videoRef]);
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hasDurationMismatch = Math.abs(videoDuration - stemsDuration) > 1;
  const isVideoShorter = videoDuration < stemsDuration;

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setShowPlayPauseIcon(true);
      setTimeout(() => setShowPlayPauseIcon(false), 600);
    }
  };

  const _handleOffsetSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!Number.isNaN(value)) {
      onOffsetChange(Math.max(0, Math.min(value, stemsDuration)));
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = async () => {
    if (!videoRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await videoRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  // Picture-in-Picture toggle
  const togglePictureInPicture = async () => {
    if (!videoRef.current) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error('Picture-in-Picture error:', err);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Check if it's a YouTube embed
  const isYouTubeEmbed = blobUrl.includes('youtube.com/embed/');

  return (
    <div className="w-full bg-background rounded-lg overflow-hidden border border-outline">
      {/* Video Player */}
      <div
        className="relative aspect-video bg-black cursor-pointer group"
        onClick={isYouTubeEmbed ? undefined : handleVideoClick}
      >
        {isYouTubeEmbed ? (
          <iframe
            src={blobUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube video player"
          />
        ) : (
          <video ref={videoRef} src={blobUrl} className="w-full h-full object-contain" />
        )}

        {/* YouTube-style Play/Pause Icon Overlay - Only for regular videos */}
        {!isYouTubeEmbed && showPlayPauseIcon && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/60 rounded-full p-6 animate-fade-in-scale">
              {isVideoPlaying ? (
                <Pause size={64} className="text-foreground fill-foreground" />
              ) : (
                <Play size={64} className="text-foreground fill-foreground" />
              )}
            </div>
          </div>
        )}

        {/* Hover Play/Pause Indicator - Only for regular videos */}
        {!isYouTubeEmbed && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-black/40 rounded-full p-4">
              {isVideoPlaying ? (
                <Pause size={48} className="text-foreground/80" />
              ) : (
                <Play size={48} className="text-foreground/80" />
              )}
            </div>
          </div>
        )}

        {/* Duration Mismatch Warning Badge */}
        {hasDurationMismatch && (
          <div className="absolute top-3 right-3 bg-amber-500/90 text-black px-3 py-1.5 rounded-md flex items-center gap-2 text-xs font-medium">
            <AlertTriangle size={14} />
            {isVideoShorter ? 'Video shorter than stems' : 'Video longer than stems'}
          </div>
        )}
      </div>

      {/* YouTube-Style Video Controls - Only for regular videos */}
      {!isYouTubeEmbed && (
        <div className="bg-surface border-t border-outline">
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              {/* Play/Pause Button - Controls only video */}
              <button
                onClick={() => {
                  if (videoRef.current) {
                    if (isVideoPlaying) {
                      videoRef.current.pause();
                    } else {
                      videoRef.current.play().catch(() => {});
                    }
                  }
                }}
                className="w-9 h-9 rounded-full bg-elevated hover:bg-muted-bg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                title={isVideoPlaying ? 'Pause video' : 'Play video'}
              >
                {isVideoPlaying ? (
                  <Pause size={18} className="text-foreground fill-foreground" />
                ) : (
                  <Play size={18} className="text-foreground fill-foreground ml-0.5" />
                )}
              </button>

              {/* Video Scrubber */}
              <div className="flex-1 flex items-center gap-3">
                {/* Current Time */}
                <span className="text-xs font-mono text-muted w-12 text-right">
                  {formatDuration(videoCurrentTime)}
                </span>

                {/* Scrubber */}
                <input
                  type="range"
                  min="0"
                  max={videoDuration}
                  step="0.01"
                  value={videoCurrentTime}
                  onChange={(e) => {
                    const time = parseFloat(e.target.value);
                    setVideoCurrentTime(time);
                    setIsSeeking(true);
                    if (videoRef.current) {
                      videoRef.current.currentTime = time;
                    }
                  }}
                  onMouseUp={() => setIsSeeking(false)}
                  onTouchEnd={() => setIsSeeking(false)}
                  className="flex-1 h-1.5 bg-elevated rounded-full appearance-none cursor-pointer slider-thumb-teal"
                  style={{
                    background: `linear-gradient(to right, var(--color-video-progress) 0%, var(--color-video-progress) ${(videoCurrentTime / videoDuration) * 100}%, var(--color-video-track) ${(videoCurrentTime / videoDuration) * 100}%, var(--color-video-track) 100%)`,
                  }}
                />

                {/* Duration */}
                <span className="text-xs font-mono text-muted w-12">
                  {formatDuration(videoDuration)}
                </span>
              </div>

              {/* Volume Control */}
              <button
                onClick={() => {
                  if (isVideoMuted) {
                    setIsVideoMuted(false);
                    setVideoVolume(50);
                  } else {
                    setIsVideoMuted(true);
                  }
                }}
                className="p-1.5 rounded hover:bg-muted-bg transition-colors"
                title={isVideoMuted ? 'Unmute' : 'Mute'}
              >
                {isVideoMuted ? (
                  <VolumeX size={18} className="text-muted" />
                ) : (
                  <Volume2 size={18} className="text-foreground" />
                )}
              </button>

              {/* Volume Slider */}
              <input
                type="range"
                min="0"
                max="100"
                value={videoVolume}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  setVideoVolume(value);
                  setIsVideoMuted(value === 0);
                }}
                className="w-20 h-1.5 bg-muted-bg rounded-lg appearance-none cursor-pointer slider-thumb-teal"
                style={{
                  background: `linear-gradient(to right, var(--color-video-volume) 0%, var(--color-video-volume) ${videoVolume}%, var(--color-video-track) ${videoVolume}%, var(--color-video-track) 100%)`,
                }}
              />

              {/* Picture-in-Picture Button */}
              <button
                onClick={togglePictureInPicture}
                className="p-1.5 rounded hover:bg-muted-bg transition-colors"
                title="Picture-in-Picture"
              >
                <PictureInPicture
                  size={18}
                  className="text-muted hover:text-foreground transition-colors"
                />
              </button>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded hover:bg-muted-bg transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize size={18} className="text-foreground" />
                ) : (
                  <Maximize
                    size={18}
                    className="text-muted hover:text-foreground transition-colors"
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YouTube Info - Only for YouTube embeds */}
      {isYouTubeEmbed && (
        <div className="bg-surface border-t border-outline px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-blue-400">
            <LinkIcon size={16} />
            <span>YouTube video - Use YouTube player controls to play/pause</span>
          </div>
        </div>
      )}

      {/* Sync Point Control */}
      <div className="bg-surface/50 border-t border-outline backdrop-blur-sm">
        <div className="px-4 py-3"></div>
      </div>

      {/* Metadata Bar */}
      <div className="p-3 bg-surface flex items-center justify-between border-t border-outline">
        <div className="flex items-center gap-4 text-sm text-muted">
          {metadata.resolution && (
            <span className="font-medium text-secondary">{metadata.resolution}</span>
          )}
          <span>{formatFileSize(metadata.size)}</span>
          <span>{formatDuration(videoDuration)}</span>
          {metadata.size > 500 * 1024 * 1024 && (
            <span className="text-amber-500 text-xs">(Large file)</span>
          )}
        </div>

        <button
          onClick={onRemove}
          className="flex items-center gap-2 px-3 py-1.5 rounded bg-elevated text-red-500 hover:bg-red-500 hover:text-foreground transition-colors text-sm font-medium"
          title="Remove video"
        >
          <X size={16} />
          <span>Remove</span>
        </button>
      </div>
    </div>
  );
}

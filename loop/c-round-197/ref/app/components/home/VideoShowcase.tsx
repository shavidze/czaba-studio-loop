import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useRef, useState } from 'react';
import { PageContainer } from '../layout';

export function VideoShowcase() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const vol = parseFloat(e.target.value);
    videoRef.current.volume = vol;
    setVolume(vol);
    if (vol === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (Number.isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section className="bg-background py-16 md:py-24">
      <PageContainer>
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Music <span className="text-glow">In Action</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted">
            See how our tracks bring projects to life
          </p>
        </div>

        {/* Video Player */}
        <div className="max-w-5xl mx-auto">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-card border border-outline group">
            {/* Video Element - placeholder for now, will use actual video later */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              poster="/hero-bg.jpg"
            >
              <source src="/middle-east.mp3" type="audio/mpeg" />
              Your browser does not support the video tag.
            </video>

            {/* Play Overlay */}
            {!isPlaying && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                <button
                  onClick={togglePlay}
                  className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-110 transition-transform shadow-glow"
                >
                  <Play className="h-10 w-10 ml-1" />
                </button>
              </div>
            )}

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              {/* Progress Bar */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs text-muted font-mono">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="video-player-slider flex-1"
                  style={
                    {
                      '--progress': `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                    } as React.CSSProperties
                  }
                />
                <span className="text-xs text-muted font-mono">{formatTime(duration)}</span>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Play/Pause */}
                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-foreground/10 hover:bg-foreground/20 flex items-center justify-center transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5 text-foreground" />
                    ) : (
                      <Play className="h-5 w-5 text-foreground ml-0.5" />
                    )}
                  </button>

                  {/* Volume */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleMute}
                      className="w-10 h-10 rounded-full bg-foreground/10 hover:bg-foreground/20 flex items-center justify-center transition-colors"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="h-5 w-5 text-foreground" />
                      ) : (
                        <Volume2 className="h-5 w-5 text-foreground" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="video-volume-slider"
                      style={
                        {
                          '--volume-progress': `${volume * 100}%`,
                        } as React.CSSProperties
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Video Info */}
          <div className="mt-6 text-center">
            <h3 className="mb-2 text-xl font-semibold text-foreground">Middle East - Demo Track</h3>
            <p className="text-muted">Premium License Available • Perfect for cinematic projects</p>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}

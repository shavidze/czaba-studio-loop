import { AlertCircle, Link as LinkIcon, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

interface VideoUploadZoneProps {
  onVideoSelect: (file: File) => void;
  isUploading: boolean;
  uploadProgress: number;
}

export function VideoUploadZone({
  onVideoSelect,
  isUploading,
  uploadProgress,
}: VideoUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const validTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'];
  const maxFileSize = 2 * 1024 * 1024 * 1024; // 2GB

  const validateFile = (file: File): boolean => {
    setError(null);

    if (!validTypes.includes(file.type)) {
      setError('Invalid video format. Please use MP4, MOV, WebM, or AVI.');
      return false;
    }

    if (file.size > maxFileSize) {
      setError('File too large. Maximum file size is 2GB.');
      return false;
    }

    // Warn if file is large (> 500MB)
    if (file.size > 500 * 1024 * 1024) {
      console.warn('Large file detected:', (file.size / 1024 / 1024).toFixed(0), 'MB');
    }

    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      onVideoSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const _formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    return (bytes / 1024 / 1024 / 1024).toFixed(1) + ' GB';
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,video/x-msvideo"
        onChange={handleFileInput}
        className="hidden"
      />

      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer
          ${
            isDragOver
              ? 'border-brand bg-brand/10'
              : 'border-outline bg-surface hover:border-brand/50 hover:bg-elevated'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
        `}
      >
        {isUploading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Upload size={48} className="text-brand animate-pulse" />
            </div>
            <p className="text-secondary font-medium">Uploading video...</p>
            <div className="w-full max-w-xs mx-auto bg-elevated rounded-full h-2">
              <div
                className="bg-brand h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-muted text-sm">{uploadProgress}%</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <Upload size={48} className="text-dim" />
            </div>
            <div>
              <p className="text-secondary text-lg mb-2">Drop video here or click to browse</p>
              <p className="text-muted text-sm">Supported: MP4, MOV, WebM, AVI (max 2GB)</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-500 font-medium">Upload Error</p>
            <p className="text-red-400 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* YouTube URL Option */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-px bg-outline"></div>
          <span className="text-muted text-xs uppercase tracking-wider">Or</span>
          <div className="flex-1 h-px bg-outline"></div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm text-secondary font-medium">
            <div className="flex items-center gap-2 mb-2">
              <LinkIcon size={16} className="text-muted" />
              <span>YouTube Video URL</span>
            </div>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-4 py-2.5 bg-surface border border-outline rounded-lg text-foreground placeholder-dim focus:outline-none focus:border-brand transition-colors"
            />
          </label>

          {/* Load from YouTube Button */}
          <button
            onClick={() => {
              if (!youtubeUrl) {
                setError('Please enter a YouTube URL');
                return;
              }

              // Validate and extract YouTube video ID
              const youtubeRegex =
                /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
              const match = youtubeUrl.match(youtubeRegex);

              if (!match || !match[4]) {
                setError('Invalid YouTube URL. Please use format: https://youtube.com/watch?v=...');
                return;
              }

              const videoId = match[4];
              const embedUrl = `https://www.youtube.com/embed/${videoId}`;

              // Create a fake "file" object for YouTube embed
              const youtubeFile = new File([], `youtube-${videoId}.mp4`, { type: 'video/youtube' });

              // Store embed URL in a custom property
              (youtubeFile as any).embedUrl = embedUrl;
              (youtubeFile as any).isYouTube = true;
              (youtubeFile as any).youtubeId = videoId;

              setError(null);
              onVideoSelect(youtubeFile);
            }}
            className="w-full px-4 py-2.5 bg-brand hover:bg-brand-hover text-brand-foreground rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <LinkIcon size={16} />
            <span>Load YouTube Video</span>
          </button>

          {/* Info Note */}
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-green-400 text-xs">
              <strong>YouTube Embed:</strong> Videos will play directly from YouTube in an embedded
              player. This works for most public YouTube videos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

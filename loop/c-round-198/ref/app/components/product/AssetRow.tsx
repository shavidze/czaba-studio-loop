import { Link } from '@remix-run/react';
import { WaveForm } from '~/components/audio';
import { useAudio } from '~/hooks';
import type { Asset, MusicAsset, PresetAsset, SFXAsset } from '~/types';
import type { Track } from '~/types/audio';

interface AssetRowProps {
  asset: Asset;
  index: number;
}

export function AssetRow({ asset, index }: AssetRowProps) {
  const { state, play, pause } = useAudio();
  const isCurrentTrack = state.currentTrack?.id === asset.id;
  const isPlaying = isCurrentTrack && state.isPlaying;
  const progress = isCurrentTrack ? (state.currentTime / state.duration) * 100 : 0;

  const hasAudioPreview = Boolean(asset.audioUrl);

  const audioTrack: Track | null = hasAudioPreview
    ? {
        id: asset.id,
        title: asset.title,
        artist:
          asset.type === 'music'
            ? (asset as MusicAsset).artist
            : asset.type === 'preset'
              ? (asset as PresetAsset).software
              : 'SFX',
        audioUrl: asset.audioUrl!,
        imageUrl: asset.image,
        productHandle: asset.handle,
      }
    : null;

  const handlePlayClick = () => {
    if (!audioTrack) return;
    if (isPlaying) {
      pause();
    } else {
      play(audioTrack);
    }
  };

  // Get metadata based on asset type
  const getMetadata = () => {
    switch (asset.type) {
      case 'music': {
        const music = asset as MusicAsset;
        const allGenres = [music.genre, ...music.subGenres].join(', ');
        return {
          primary: music.artist,
          secondary: music.featuredArtist,
          tags: allGenres,
        };
      }
      case 'sfx': {
        const sfx = asset as SFXAsset;
        return {
          primary: sfx.category,
          secondary: null,
          tags: sfx.tags.join(', '),
        };
      }
      case 'preset': {
        const preset = asset as PresetAsset;
        return {
          primary: preset.software,
          secondary: preset.category,
          tags: preset.tags.join(', '),
        };
      }
    }
  };

  const metadata = getMetadata();

  return (
    <div className={`track-row ${isCurrentTrack ? 'track-row-active' : ''}`}>
      {/* Artwork & Play Button */}
      <div className="track-artwork-container">
        <img src={asset.image} alt={asset.title} className="track-artwork" />
        {hasAudioPreview && (
          <button onClick={handlePlayClick} className="track-play-button cursor-pointer">
            {isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Asset Info */}
      <div className="track-info">
        <div className="track-title-row">
          <Link to={`/products/${asset.handle}`} className="track-title cursor-pointer">
            {asset.title}
          </Link>
          {asset.isNew && <span className="track-badge track-badge-new">NEW</span>}
          {asset.isPremium && <span className="track-badge track-badge-premium">PRO</span>}
        </div>
        <div className="track-artist">
          {metadata.primary}
          {metadata.secondary && (
            <span className="track-featured">
              {asset.type === 'music' ? ' feat. ' : ' • '}
              {metadata.secondary}
            </span>
          )}
        </div>
      </div>

      {/* Tags/Genres */}
      <div className="track-genres">
        <span className="track-genre-text">{metadata.tags}</span>
      </div>

      {/* Similar Button */}
      <button className="track-similar-button cursor-pointer" title="Find similar">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="4" y1="9" x2="20" y2="9" />
          <line x1="4" y1="15" x2="20" y2="15" />
          <line x1="10" y1="3" x2="8" y2="21" />
          <line x1="16" y1="3" x2="14" y2="21" />
        </svg>
      </button>

      {/* Duration (hide for presets) */}
      <div className="track-duration">
        {asset.type !== 'preset' && asset.duration ? asset.duration : '—'}
      </div>

      {/* Waveform (show for music and sfx) */}
      <div className="track-waveform">
        {asset.type !== 'preset' && hasAudioPreview ? (
          <WaveForm isPlaying={isPlaying} progress={progress} waveIndex={index} />
        ) : (
          <div className="waveform-placeholder">
            {asset.type === 'preset' && (
              <span className="preset-software-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M8 10h8M8 14h5" />
                </svg>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="track-actions">
        <button className="track-action-button cursor-pointer" title="Download">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
        <button className="track-action-button cursor-pointer" title="Add to collection">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </button>
        <button className="track-action-button cursor-pointer" title="Add to favorites">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
        <button className="track-action-button cursor-pointer" title="More options">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="6" r="1.5" />
            <circle cx="12" cy="18" r="1.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

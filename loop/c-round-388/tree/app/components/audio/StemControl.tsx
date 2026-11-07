import { useStems } from '~/contexts/StemsContext';

interface StemControlProps {
  stemId: string;
  name: string;
  isMuted: boolean;
  isSoloed: boolean;
}

export function StemControl({ stemId, name, isMuted, isSoloed }: StemControlProps) {
  const { toggleMute, toggleSolo } = useStems();

  return (
    <div className="flex items-center gap-4 py-4 px-2 border-b border-outline/30 last:border-b-0">
      {/* Stem Name */}
      <span className="flex-1 text-foreground font-medium text-lg">{name}</span>

      {/* Solo Button */}
      <button
        onClick={() => toggleSolo(stemId)}
        className={`w-9 h-9 rounded-md transition-all cursor-pointer font-bold text-sm ${
          isSoloed
            ? 'bg-teal-500 text-foreground shadow-md'
            : 'bg-elevated text-muted hover:bg-muted-bg'
        }`}
        aria-label={isSoloed ? 'Unsolo' : 'Solo'}
        title={isSoloed ? 'Unsolo' : 'Solo'}
      >
        S
      </button>

      {/* Mute Button */}
      <button
        onClick={() => toggleMute(stemId)}
        className={`w-9 h-9 rounded-md transition-all cursor-pointer font-bold text-sm ${
          isMuted
            ? 'bg-red-500 text-foreground shadow-md'
            : 'bg-elevated text-muted hover:bg-muted-bg'
        }`}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        M
      </button>
    </div>
  );
}

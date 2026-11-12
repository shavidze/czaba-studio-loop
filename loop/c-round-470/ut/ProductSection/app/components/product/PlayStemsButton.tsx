import { Layers } from 'lucide-react';
import { useStems } from '~/contexts/StemsContext';
import type { Track } from '~/types/audio';

interface PlayStemsButtonProps {
  track: Track;
}

export function PlayStemsButton({ track }: PlayStemsButtonProps) {
  const { openStemsPlayer } = useStems();

  // Don't render if no stems available
  if (!track.stems || track.stems.length === 0) {
    return null;
  }

  return (
    <button
      onClick={() => openStemsPlayer(track)}
      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-elevated border border-outline text-foreground font-semibold hover:bg-elevated/80 hover:border-brand transition-colors cursor-pointer"
    >
      <Layers size={20} />
      <span>Play Stems ({track.stems.length} tracks)</span>
    </button>
  );
}

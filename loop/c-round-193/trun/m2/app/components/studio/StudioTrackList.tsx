import { useStudio } from '~/contexts/StudioContext';
import { StudioTrack } from './StudioTrack';

export function StudioTrackList() {
  const { state } = useStudio();

  if (!state.allLoaded) {
    return null;
  }

  return (
    <div>
      {state.stems.map((stem) => (
        <StudioTrack key={stem.id} stem={stem} />
      ))}
    </div>
  );
}

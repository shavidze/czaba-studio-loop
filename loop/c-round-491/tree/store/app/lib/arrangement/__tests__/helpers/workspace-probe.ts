import {
  type ArrangementContextValue,
  useArrangement,
  useArrangementActiveTrackId,
  useArrangementIsPlaying,
  useArrangementStatusPreview,
} from '~/contexts/ArrangementContext';

export interface WorkspaceStatusValue {
  status: string;
  statusSequence: number;
  statusKey: string;
}

export type WorkspaceStatusProbeValue = ArrangementContextValue & WorkspaceStatusValue;

export type WorkspaceProbeValue = WorkspaceStatusProbeValue & {
  isPlaying: boolean;
  activeTrackId: string | null;
};

export function useWorkspaceStatus(): WorkspaceStatusValue {
  const committed = useArrangementStatusPreview((state) => state.committed);
  return { status: committed.text, statusSequence: committed.sequence, statusKey: committed.key };
}

export function useWorkspaceStatusProbe(): WorkspaceStatusProbeValue {
  return { ...useArrangement(), ...useWorkspaceStatus() };
}

export function useWorkspaceProbe(): WorkspaceProbeValue {
  return {
    ...useWorkspaceStatusProbe(),
    isPlaying: useArrangementIsPlaying(),
    activeTrackId: useArrangementActiveTrackId(),
  };
}

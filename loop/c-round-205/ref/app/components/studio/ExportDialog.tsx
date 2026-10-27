import { Check, Download, Music } from 'lucide-react';
import { useState } from 'react';
import { Button } from '~/components/ui/Button';
import {
  Modal,
  ModalBody,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '~/components/ui/Modal';
import { useStudio } from '~/contexts/StudioContext';
import type { ExportConfig } from '~/types/studio';
import { downloadAbletonLiveSet, exportToAbletonLiveSet } from '~/utils/ableton-export';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
  const { state, exportAudio } = useStudio();
  const [exportType, setExportType] = useState<'audio' | 'ableton'>('audio');
  const [format, setFormat] = useState<'mp3' | 'wav'>('wav');
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('high');
  const [normalize, setNormalize] = useState(true);
  const [isExportingAbleton, setIsExportingAbleton] = useState(false);
  const [selectedStems, setSelectedStems] = useState<Set<string>>(
    new Set(state.stems.map((s) => s.id)),
  );

  const toggleStem = (stemId: string) => {
    const newSet = new Set(selectedStems);
    if (newSet.has(stemId)) {
      newSet.delete(stemId);
    } else {
      newSet.add(stemId);
    }
    setSelectedStems(newSet);
  };

  const toggleAll = () => {
    if (selectedStems.size === state.stems.length) {
      setSelectedStems(new Set());
    } else {
      setSelectedStems(new Set(state.stems.map((s) => s.id)));
    }
  };

  const handleExport = async () => {
    const config: ExportConfig = {
      format,
      quality,
      includedStemIds: Array.from(selectedStems),
      normalize,
    };

    try {
      const blob = await exportAudio(config);

      // Download the file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${state.productTitle || 'mix'}-export.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const handleAbletonExport = async () => {
    setIsExportingAbleton(true);

    try {
      // Prepare stems for export
      const stemsForExport = state.stems
        .filter((stem) => selectedStems.has(stem.id))
        .map((stem) => ({
          id: stem.id,
          name: stem.name,
          audioUrl: stem.audioUrl || '',
          volume: stem.volume,
          isMuted: stem.isMuted,
          isSoloed: stem.isSoloed,
        }));

      const blob = await exportToAbletonLiveSet({
        projectName: state.productTitle || 'Untitled',
        bpm: 120, // TODO: Get from product metadata
        stems: stemsForExport,
      });

      downloadAbletonLiveSet(blob, `${state.productTitle || 'Project'}.als`);
      onClose();
    } catch (error) {
      console.error('Ableton export failed:', error);
      alert('Ableton export failed. Please try again.');
    } finally {
      setIsExportingAbleton(false);
    }
  };

  const isAudioTab = exportType === 'audio';
  const _accentColor = isAudioTab ? 'brand' : 'accent';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      showCloseButton={!state.isExporting && !isExportingAbleton}
    >
      <ModalHeader className="pb-0">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${isAudioTab ? 'bg-brand/20' : 'bg-accent/20'}`}
          >
            {isAudioTab ? (
              <Download size={20} className="text-brand" />
            ) : (
              <Music size={20} className="text-accent" />
            )}
          </div>
          <div>
            <ModalTitle>Export Your Mix</ModalTitle>
            <ModalDescription>Choose your export format and settings</ModalDescription>
          </div>
        </div>
      </ModalHeader>

      {/* Tab Navigation */}
      <div className="px-8 pt-6">
        <div className="flex gap-2 p-1 bg-elevated rounded-lg">
          <button
            onClick={() => setExportType('audio')}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
              isAudioTab
                ? 'bg-surface text-foreground shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <Download size={16} className="inline mr-2 -mt-0.5" />
            Audio Export
          </button>
          <button
            onClick={() => setExportType('ableton')}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
              !isAudioTab
                ? 'bg-surface text-foreground shadow-sm'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <Music size={16} className="inline mr-2 -mt-0.5" />
            Ableton Live
          </button>
        </div>
      </div>

      <ModalBody className="space-y-6">
        {/* Audio Export Options */}
        {isAudioTab && (
          <>
            {/* Format Selection */}
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">Format</label>
              <div className="flex gap-3">
                {(['wav', 'mp3'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all border ${
                      format === f
                        ? 'bg-brand/10 border-brand text-brand'
                        : 'bg-elevated border-outline text-muted hover:border-outline-hover hover:text-foreground'
                    }`}
                  >
                    {f.toUpperCase()}
                    {f === 'wav' && (
                      <span className="block text-xs opacity-70 mt-0.5">Lossless</span>
                    )}
                    {f === 'mp3' && (
                      <span className="block text-xs opacity-70 mt-0.5">Compressed</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Selection */}
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">Quality</label>
              <div className="flex gap-3">
                {(['low', 'medium', 'high'] as const).map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuality(q)}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all border ${
                      quality === q
                        ? 'bg-brand/10 border-brand text-brand'
                        : 'bg-elevated border-outline text-muted hover:border-outline-hover hover:text-foreground'
                    }`}
                  >
                    {q.charAt(0).toUpperCase() + q.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Normalize Toggle */}
            <div className="flex items-center justify-between py-3 px-4 bg-elevated rounded-lg border border-outline">
              <div>
                <label className="text-sm font-medium text-foreground">Normalize Audio</label>
                <p className="text-xs text-muted mt-0.5">Optimize volume levels</p>
              </div>
              <button
                onClick={() => setNormalize(!normalize)}
                className={`w-11 h-6 rounded-full transition-all relative ${
                  normalize ? 'bg-brand' : 'bg-dim'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    normalize ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </>
        )}

        {/* Ableton Export Options */}
        {!isAudioTab && (
          <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
            <h3 className="text-accent font-medium mb-2">Ableton Live Set</h3>
            <p className="text-muted text-sm mb-3">Export an .als project file that includes:</p>
            <ul className="text-muted text-sm space-y-1.5">
              <li className="flex items-center gap-2">
                <Check size={14} className="text-accent" />
                Track names and arrangement
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-accent" />
                Volume and pan settings
              </li>
              <li className="flex items-center gap-2">
                <Check size={14} className="text-accent" />
                Mute/Solo states preserved
              </li>
            </ul>
          </div>
        )}

        {/* Stem Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-foreground">
              {isAudioTab ? 'Include Stems' : 'Include Tracks'}
            </label>
            <button
              onClick={toggleAll}
              className={`text-xs font-medium ${isAudioTab ? 'text-brand hover:text-brand-hover' : 'text-accent hover:brightness-110'}`}
            >
              {selectedStems.size === state.stems.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1 bg-background rounded-lg p-2 border border-outline styled-scrollbar">
            {state.stems.map((stem) => (
              <label
                key={stem.id}
                className="flex items-center gap-3 p-2.5 hover:bg-elevated rounded-md cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedStems.has(stem.id)}
                  onChange={() => toggleStem(stem.id)}
                  className={`w-4 h-4 rounded border-outline ${isAudioTab ? 'text-brand' : 'text-accent'}`}
                />
                <span className="text-foreground text-sm flex-1">{stem.name}</span>
                {stem.isMuted && (
                  <span className="text-xs text-dim px-1.5 py-0.5 bg-elevated rounded">Muted</span>
                )}
                {stem.isSoloed && (
                  <span className="text-xs text-accent px-1.5 py-0.5 bg-accent/20 rounded">
                    Solo
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Export Progress */}
        {state.isExporting && (
          <div className="space-y-2 p-4 bg-elevated rounded-lg border border-outline">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground font-medium">Exporting...</span>
              <span className="text-brand font-mono">{state.exportProgress}%</span>
            </div>
            <div className="w-full bg-background rounded-full h-2 overflow-hidden">
              <div
                className="bg-brand h-full rounded-full transition-all duration-300"
                style={{ width: `${state.exportProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Ableton Note */}
        {!isAudioTab && (
          <p className="text-xs text-dim">
            <strong className="text-muted">Note:</strong> After opening in Ableton, drag the WAV
            files onto the corresponding tracks.
          </p>
        )}
      </ModalBody>

      <ModalFooter>
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={state.isExporting || isExportingAbleton}
        >
          Cancel
        </Button>

        {isAudioTab ? (
          <Button
            variant="primary"
            onClick={handleExport}
            disabled={state.isExporting || selectedStems.size === 0}
            isLoading={state.isExporting}
          >
            <Download size={16} />
            Export Audio
          </Button>
        ) : (
          <Button
            variant="accent"
            onClick={handleAbletonExport}
            disabled={isExportingAbleton || selectedStems.size === 0}
            isLoading={isExportingAbleton}
          >
            <Music size={16} />
            Download .als
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}

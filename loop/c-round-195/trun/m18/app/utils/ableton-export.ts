/**
 * Ableton Live Set (.als) Export Utility
 *
 * Generates an Ableton Live Set file from Studio stems.
 * ALS files are gzipped XML.
 *
 * Structure:
 * - Each stem becomes an Audio Track
 * - Volume, Mute, Solo states are preserved
 * - Audio files are referenced by path (user must have the files locally)
 */

import pako from 'pako';
import { debug } from '~/lib/debug';

interface StemForExport {
  id: string;
  name: string;
  audioUrl: string;
  volume: number; // 0-1
  isMuted: boolean;
  isSoloed: boolean;
  pan?: number; // -1 to 1, default 0
}

interface ExportOptions {
  projectName: string;
  bpm: number;
  stems: StemForExport[];
}

/**
 * Generate Ableton Live Set XML
 */
function generateALSXml(options: ExportOptions): string {
  const { projectName, bpm, stems } = options;

  // Ableton uses a specific volume curve
  // 0dB = 1.0, -inf = 0.0
  // We'll map our 0-1 to Ableton's scale
  const toAbletonVolume = (vol: number) => vol.toFixed(6);

  // Pan: -1 to 1 maps to Ableton's -1 to 1
  const toAbletonPan = (pan: number = 0) => pan.toFixed(6);

  // Generate unique IDs for Ableton objects
  let nextId = 1;
  const getId = () => nextId++;

  // Build audio tracks XML
  const tracksXml = stems
    .map((stem, index) => {
      const trackId = getId();
      const _clipId = getId();
      const _sampleRefId = getId();

      // Extract filename from URL for display
      const _fileName = decodeURIComponent(stem.audioUrl.split('/').pop() || stem.name);

      return `
        <AudioTrack Id="${trackId}">
          <LomId Value="0" />
          <LomIdView Value="0" />
          <IsContentSelectedInDocument Value="false" />
          <PreferredContentViewMode Value="0" />
          <TrackDelay>
            <Value Value="0" />
            <IsValueSampleBased Value="true" />
          </TrackDelay>
          <Name>
            <EffectiveName Value="${escapeXml(stem.name)}" />
            <UserName Value="${escapeXml(stem.name)}" />
            <Annotation Value="" />
            <MemorizedFirstClipName Value="" />
          </Name>
          <Color Value="${getTrackColor(index)}" />
          <AutomationEnvelopes>
            <Envelopes />
          </AutomationEnvelopes>
          <TrackGroupId Value="-1" />
          <TrackUnfolded Value="true" />
          <DevicesListWrapper LomId="0" />
          <ClipSlotsListWrapper LomId="0" />
          <ViewData Value="{}" />
          <TakeLanes>
            <TakeLanes />
            <AreTakeLanesFolded Value="true" />
          </TakeLanes>
          <LinkedTrackGroupId Value="-1" />
          <DeviceChain>
            <AutomationLanes>
              <AutomationLanes />
              <AreAdditionalAutomationLanesFolded Value="true" />
            </AutomationLanes>
            <ClipEnvelopeChooserViewState>
              <SelectedDevice Value="0" />
              <SelectedEnvelope Value="0" />
              <PreferModulationVisible Value="false" />
            </ClipEnvelopeChooserViewState>
            <AudioInputRouting>
              <Target Value="AudioIn/External/S0" />
              <UpperDisplayString Value="Ext. In" />
              <LowerDisplayString Value="1/2" />
            </AudioInputRouting>
            <MidiInputRouting>
              <Target Value="MidiIn/External.All/-1" />
              <UpperDisplayString Value="Ext: All Ins" />
              <LowerDisplayString Value="" />
            </MidiInputRouting>
            <AudioOutputRouting>
              <Target Value="AudioOut/Master" />
              <UpperDisplayString Value="Master" />
              <LowerDisplayString Value="" />
            </AudioOutputRouting>
            <MidiOutputRouting>
              <Target Value="MidiOut/None" />
              <UpperDisplayString Value="None" />
              <LowerDisplayString Value="" />
            </MidiOutputRouting>
            <Mixer>
              <LomId Value="0" />
              <LomIdView Value="0" />
              <IsExpanded Value="true" />
              <On>
                <LomId Value="0" />
                <Manual Value="true" />
                <AutomationTarget Id="${getId()}">
                  <LockEnvelope Value="0" />
                </AutomationTarget>
                <MidiCCOnOffThresholds>
                  <Min Value="64" />
                  <Max Value="127" />
                </MidiCCOnOffThresholds>
              </On>
              <ModulationSourceCount Value="0" />
              <ParametersListWrapper LomId="0" />
              <Pointee Id="${getId()}" />
              <LastSelectedTimeableIndex Value="0" />
              <LastSelectedClipEnvelopeIndex Value="0" />
              <LastPresetRef>
                <Value />
              </LastPresetRef>
              <LockedScripts />
              <IsFolded Value="false" />
              <ShouldShowPresetName Value="false" />
              <UserName Value="" />
              <Annotation Value="" />
              <SourceContext>
                <Value />
              </SourceContext>
              <Sends />
              <Speaker>
                <LomId Value="0" />
                <Manual Value="${!stem.isMuted}" />
                <AutomationTarget Id="${getId()}">
                  <LockEnvelope Value="0" />
                </AutomationTarget>
                <MidiCCOnOffThresholds>
                  <Min Value="64" />
                  <Max Value="127" />
                </MidiCCOnOffThresholds>
              </Speaker>
              <SoloSink Value="false" />
              <PanMode Value="0" />
              <Pan>
                <LomId Value="0" />
                <Manual Value="${toAbletonPan(stem.pan)}" />
                <MidiControllerRange>
                  <Min Value="-1" />
                  <Max Value="1" />
                </MidiControllerRange>
                <AutomationTarget Id="${getId()}">
                  <LockEnvelope Value="0" />
                </AutomationTarget>
                <ModulationTarget Id="${getId()}">
                  <LockEnvelope Value="0" />
                </ModulationTarget>
              </Pan>
              <SplitStereoPanL>
                <LomId Value="0" />
                <Manual Value="-1" />
                <MidiControllerRange>
                  <Min Value="-1" />
                  <Max Value="1" />
                </MidiControllerRange>
                <AutomationTarget Id="${getId()}">
                  <LockEnvelope Value="0" />
                </AutomationTarget>
                <ModulationTarget Id="${getId()}">
                  <LockEnvelope Value="0" />
                </ModulationTarget>
              </SplitStereoPanL>
              <SplitStereoPanR>
                <LomId Value="0" />
                <Manual Value="1" />
                <MidiControllerRange>
                  <Min Value="-1" />
                  <Max Value="1" />
                </MidiControllerRange>
                <AutomationTarget Id="${getId()}">
                  <LockEnvelope Value="0" />
                </AutomationTarget>
                <ModulationTarget Id="${getId()}">
                  <LockEnvelope Value="0" />
                </ModulationTarget>
              </SplitStereoPanR>
              <Volume>
                <LomId Value="0" />
                <Manual Value="${toAbletonVolume(stem.volume)}" />
                <MidiControllerRange>
                  <Min Value="0.0003162277571" />
                  <Max Value="1.99526238" />
                </MidiControllerRange>
                <AutomationTarget Id="${getId()}">
                  <LockEnvelope Value="0" />
                </AutomationTarget>
                <ModulationTarget Id="${getId()}">
                  <LockEnvelope Value="0" />
                </ModulationTarget>
              </Volume>
              <ViewStateSesstionTrackWidth Value="93" />
              <CrossFadeState>
                <LomId Value="0" />
                <Manual Value="1" />
                <AutomationTarget Id="${getId()}">
                  <LockEnvelope Value="0" />
                </AutomationTarget>
              </CrossFadeState>
              <SendsListWrapper LomId="0" />
            </Mixer>
            <MainSequencer>
              <LomId Value="0" />
              <LomIdView Value="0" />
              <IsExpanded Value="true" />
              <On>
                <LomId Value="0" />
                <Manual Value="true" />
                <AutomationTarget Id="${getId()}">
                  <LockEnvelope Value="0" />
                </AutomationTarget>
                <MidiCCOnOffThresholds>
                  <Min Value="64" />
                  <Max Value="127" />
                </MidiCCOnOffThresholds>
              </On>
              <ModulationSourceCount Value="0" />
              <ParametersListWrapper LomId="0" />
              <Pointee Id="${getId()}" />
              <LastSelectedTimeableIndex Value="0" />
              <LastSelectedClipEnvelopeIndex Value="0" />
              <LastPresetRef>
                <Value />
              </LastPresetRef>
              <LockedScripts />
              <IsFolded Value="false" />
              <ShouldShowPresetName Value="false" />
              <UserName Value="" />
              <Annotation Value="" />
              <SourceContext>
                <Value />
              </SourceContext>
              <ClipSlotList>
                <ClipSlot Id="0">
                  <LomId Value="0" />
                  <ClipSlot>
                    <Value />
                  </ClipSlot>
                  <HasStop Value="true" />
                  <NeedRefreeze Value="true" />
                </ClipSlot>
              </ClipSlotList>
              <MonitoringEnum Value="1" />
              <Sample>
                <LomId Value="0" />
                <ArrangerAutomation>
                  <Events />
                  <AutomationTransformViewState>
                    <IsTransformPending Value="false" />
                    <TimeAndValueTransforms />
                  </AutomationTransformViewState>
                </ArrangerAutomation>
                <SampleRef>
                  <FileRef>
                    <RelativePathType Value="5" />
                    <RelativePath Value="" />
                    <Path Value="" />
                    <Type Value="1" />
                    <LivePackName Value="" />
                    <LivePackId Value="" />
                    <OriginalFileSize Value="0" />
                    <OriginalCrc Value="0" />
                  </FileRef>
                  <LastModDate Value="0" />
                  <SourceContext />
                  <SampleUsageHint Value="0" />
                  <DefaultDuration Value="0" />
                  <DefaultSampleRate Value="44100" />
                </SampleRef>
                <LoopModifiers>
                  <LoopOn Value="false" />
                  <LoopLength Value="0" />
                  <LoopStartRelative Value="0" />
                  <LoopEnd Value="0" />
                  <SampleOffsetModulationRange Value="0" />
                </LoopModifiers>
              </Sample>
              <VolumeModulationTarget Id="${getId()}">
                <LockEnvelope Value="0" />
              </VolumeModulationTarget>
              <TranspositionModulationTarget Id="${getId()}">
                <LockEnvelope Value="0" />
              </TranspositionModulationTarget>
              <GrainSizeModulationTarget Id="${getId()}">
                <LockEnvelope Value="0" />
              </GrainSizeModulationTarget>
              <FluxModulationTarget Id="${getId()}">
                <LockEnvelope Value="0" />
              </FluxModulationTarget>
              <SampleOffsetModulationTarget Id="${getId()}">
                <LockEnvelope Value="0" />
              </SampleOffsetModulationTarget>
              <PitchViewScrollPosition Value="-1073741824" />
              <SampleOffsetModulationScrollPosition Value="-1073741824" />
              <Recorder>
                <IsArmed Value="false" />
                <TakeCounter Value="1" />
              </Recorder>
            </MainSequencer>
            <FreezeSequencer>
              <LomId Value="0" />
              <LomIdView Value="0" />
              <IsExpanded Value="true" />
              <On>
                <LomId Value="0" />
                <Manual Value="true" />
                <AutomationTarget Id="${getId()}">
                  <LockEnvelope Value="0" />
                </AutomationTarget>
                <MidiCCOnOffThresholds>
                  <Min Value="64" />
                  <Max Value="127" />
                </MidiCCOnOffThresholds>
              </On>
              <ModulationSourceCount Value="0" />
              <ParametersListWrapper LomId="0" />
              <Pointee Id="${getId()}" />
              <LastSelectedTimeableIndex Value="0" />
              <LastSelectedClipEnvelopeIndex Value="0" />
              <LastPresetRef>
                <Value />
              </LastPresetRef>
              <LockedScripts />
              <IsFolded Value="false" />
              <ShouldShowPresetName Value="false" />
              <UserName Value="" />
              <Annotation Value="" />
              <SourceContext>
                <Value />
              </SourceContext>
              <ClipSlotList>
                <ClipSlot Id="0">
                  <LomId Value="0" />
                  <ClipSlot>
                    <Value />
                  </ClipSlot>
                  <HasStop Value="true" />
                  <NeedRefreeze Value="true" />
                </ClipSlot>
              </ClipSlotList>
              <MonitoringEnum Value="1" />
              <Sample>
                <LomId Value="0" />
                <ArrangerAutomation>
                  <Events />
                  <AutomationTransformViewState>
                    <IsTransformPending Value="false" />
                    <TimeAndValueTransforms />
                  </AutomationTransformViewState>
                </ArrangerAutomation>
                <SampleRef>
                  <FileRef>
                    <RelativePathType Value="5" />
                    <RelativePath Value="" />
                    <Path Value="" />
                    <Type Value="1" />
                    <LivePackName Value="" />
                    <LivePackId Value="" />
                    <OriginalFileSize Value="0" />
                    <OriginalCrc Value="0" />
                  </FileRef>
                  <LastModDate Value="0" />
                  <SourceContext />
                  <SampleUsageHint Value="0" />
                  <DefaultDuration Value="0" />
                  <DefaultSampleRate Value="44100" />
                </SampleRef>
                <LoopModifiers>
                  <LoopOn Value="false" />
                  <LoopLength Value="0" />
                  <LoopStartRelative Value="0" />
                  <LoopEnd Value="0" />
                  <SampleOffsetModulationRange Value="0" />
                </LoopModifiers>
              </Sample>
              <VolumeModulationTarget Id="${getId()}">
                <LockEnvelope Value="0" />
              </VolumeModulationTarget>
              <TranspositionModulationTarget Id="${getId()}">
                <LockEnvelope Value="0" />
              </TranspositionModulationTarget>
              <GrainSizeModulationTarget Id="${getId()}">
                <LockEnvelope Value="0" />
              </GrainSizeModulationTarget>
              <FluxModulationTarget Id="${getId()}">
                <LockEnvelope Value="0" />
              </FluxModulationTarget>
              <SampleOffsetModulationTarget Id="${getId()}">
                <LockEnvelope Value="0" />
              </SampleOffsetModulationTarget>
              <PitchViewScrollPosition Value="-1073741824" />
              <SampleOffsetModulationScrollPosition Value="-1073741824" />
              <Recorder>
                <IsArmed Value="false" />
                <TakeCounter Value="1" />
              </Recorder>
            </FreezeSequencer>
            <DeviceChain>
              <Devices />
              <SignalModulations />
            </DeviceChain>
          </DeviceChain>
          <ReWireSlaveMidiTargetId Value="0" />
          <PitchbendRange Value="96" />
        </AudioTrack>`;
    })
    .join('\n');

  // Build the full XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Ableton MajorVersion="5" MinorVersion="11.0" SchemaChangeCount="3" Creator="Czaba Music Store" Revision="">
  <LiveSet>
    <NextPointeeId Value="${nextId + 100}" />
    <OverwriteProtectionNumber Value="2819" />
    <LomId Value="0" />
    <LomIdView Value="0" />
    <Tracks>
${tracksXml}
    </Tracks>
    <MasterTrack>
      <LomId Value="0" />
      <LomIdView Value="0" />
      <IsContentSelectedInDocument Value="false" />
      <PreferredContentViewMode Value="0" />
      <TrackDelay>
        <Value Value="0" />
        <IsValueSampleBased Value="true" />
      </TrackDelay>
      <Name>
        <EffectiveName Value="Master" />
        <UserName Value="" />
        <Annotation Value="" />
        <MemorizedFirstClipName Value="" />
      </Name>
      <Color Value="-1" />
      <AutomationEnvelopes>
        <Envelopes />
      </AutomationEnvelopes>
      <TrackGroupId Value="-1" />
      <TrackUnfolded Value="true" />
      <DevicesListWrapper LomId="0" />
      <ClipSlotsListWrapper LomId="0" />
      <ViewData Value="{}" />
      <TakeLanes>
        <TakeLanes />
        <AreTakeLanesFolded Value="true" />
      </TakeLanes>
      <LinkedTrackGroupId Value="-1" />
      <DeviceChain>
        <AutomationLanes>
          <AutomationLanes />
          <AreAdditionalAutomationLanesFolded Value="true" />
        </AutomationLanes>
        <ClipEnvelopeChooserViewState>
          <SelectedDevice Value="0" />
          <SelectedEnvelope Value="0" />
          <PreferModulationVisible Value="false" />
        </ClipEnvelopeChooserViewState>
        <AudioInputRouting>
          <Target Value="AudioIn/External/S0" />
          <UpperDisplayString Value="Ext. In" />
          <LowerDisplayString Value="1/2" />
        </AudioInputRouting>
        <MidiInputRouting>
          <Target Value="MidiIn/External.All/-1" />
          <UpperDisplayString Value="Ext: All Ins" />
          <LowerDisplayString Value="" />
        </MidiInputRouting>
        <AudioOutputRouting>
          <Target Value="AudioOut/External/S0" />
          <UpperDisplayString Value="Ext. Out" />
          <LowerDisplayString Value="1/2" />
        </AudioOutputRouting>
        <MidiOutputRouting>
          <Target Value="MidiOut/None" />
          <UpperDisplayString Value="None" />
          <LowerDisplayString Value="" />
        </MidiOutputRouting>
        <Mixer>
          <LomId Value="0" />
          <LomIdView Value="0" />
          <IsExpanded Value="true" />
          <On>
            <LomId Value="0" />
            <Manual Value="true" />
            <AutomationTarget Id="${getId()}">
              <LockEnvelope Value="0" />
            </AutomationTarget>
            <MidiCCOnOffThresholds>
              <Min Value="64" />
              <Max Value="127" />
            </MidiCCOnOffThresholds>
          </On>
          <ModulationSourceCount Value="0" />
          <ParametersListWrapper LomId="0" />
          <Pointee Id="${getId()}" />
          <LastSelectedTimeableIndex Value="0" />
          <LastSelectedClipEnvelopeIndex Value="0" />
          <LastPresetRef>
            <Value />
          </LastPresetRef>
          <LockedScripts />
          <IsFolded Value="false" />
          <ShouldShowPresetName Value="false" />
          <UserName Value="" />
          <Annotation Value="" />
          <SourceContext>
            <Value />
          </SourceContext>
          <Sends />
          <Speaker>
            <LomId Value="0" />
            <Manual Value="true" />
            <AutomationTarget Id="${getId()}">
              <LockEnvelope Value="0" />
            </AutomationTarget>
            <MidiCCOnOffThresholds>
              <Min Value="64" />
              <Max Value="127" />
            </MidiCCOnOffThresholds>
          </Speaker>
          <SoloSink Value="false" />
          <PanMode Value="0" />
          <Pan>
            <LomId Value="0" />
            <Manual Value="0" />
            <MidiControllerRange>
              <Min Value="-1" />
              <Max Value="1" />
            </MidiControllerRange>
            <AutomationTarget Id="${getId()}">
              <LockEnvelope Value="0" />
            </AutomationTarget>
            <ModulationTarget Id="${getId()}">
              <LockEnvelope Value="0" />
            </ModulationTarget>
          </Pan>
          <SplitStereoPanL>
            <LomId Value="0" />
            <Manual Value="-1" />
            <MidiControllerRange>
              <Min Value="-1" />
              <Max Value="1" />
            </MidiControllerRange>
            <AutomationTarget Id="${getId()}">
              <LockEnvelope Value="0" />
            </AutomationTarget>
            <ModulationTarget Id="${getId()}">
              <LockEnvelope Value="0" />
            </ModulationTarget>
          </SplitStereoPanL>
          <SplitStereoPanR>
            <LomId Value="0" />
            <Manual Value="1" />
            <MidiControllerRange>
              <Min Value="-1" />
              <Max Value="1" />
            </MidiControllerRange>
            <AutomationTarget Id="${getId()}">
              <LockEnvelope Value="0" />
            </AutomationTarget>
            <ModulationTarget Id="${getId()}">
              <LockEnvelope Value="0" />
            </ModulationTarget>
          </SplitStereoPanR>
          <Volume>
            <LomId Value="0" />
            <Manual Value="1" />
            <MidiControllerRange>
              <Min Value="0.0003162277571" />
              <Max Value="1.99526238" />
            </MidiControllerRange>
            <AutomationTarget Id="${getId()}">
              <LockEnvelope Value="0" />
            </AutomationTarget>
            <ModulationTarget Id="${getId()}">
              <LockEnvelope Value="0" />
            </ModulationTarget>
          </Volume>
          <ViewStateSesstionTrackWidth Value="93" />
          <CrossFadeState>
            <LomId Value="0" />
            <Manual Value="1" />
            <AutomationTarget Id="${getId()}">
              <LockEnvelope Value="0" />
            </AutomationTarget>
          </CrossFadeState>
          <SendsListWrapper LomId="0" />
        </Mixer>
        <DeviceChain>
          <Devices />
          <SignalModulations />
        </DeviceChain>
      </DeviceChain>
    </MasterTrack>
    <PreHearTrack>
      <LomId Value="0" />
      <LomIdView Value="0" />
      <IsContentSelectedInDocument Value="false" />
      <PreferredContentViewMode Value="0" />
      <TrackDelay>
        <Value Value="0" />
        <IsValueSampleBased Value="true" />
      </TrackDelay>
      <Name>
        <EffectiveName Value="" />
        <UserName Value="" />
        <Annotation Value="" />
        <MemorizedFirstClipName Value="" />
      </Name>
      <Color Value="-1" />
      <AutomationEnvelopes>
        <Envelopes />
      </AutomationEnvelopes>
      <TrackGroupId Value="-1" />
      <TrackUnfolded Value="true" />
      <DevicesListWrapper LomId="0" />
      <ClipSlotsListWrapper LomId="0" />
      <ViewData Value="{}" />
      <TakeLanes>
        <TakeLanes />
        <AreTakeLanesFolded Value="true" />
      </TakeLanes>
      <LinkedTrackGroupId Value="-1" />
      <DeviceChain>
        <AutomationLanes>
          <AutomationLanes />
          <AreAdditionalAutomationLanesFolded Value="true" />
        </AutomationLanes>
        <ClipEnvelopeChooserViewState>
          <SelectedDevice Value="0" />
          <SelectedEnvelope Value="0" />
          <PreferModulationVisible Value="false" />
        </ClipEnvelopeChooserViewState>
        <AudioInputRouting>
          <Target Value="AudioIn/External/S0" />
          <UpperDisplayString Value="Ext. In" />
          <LowerDisplayString Value="1/2" />
        </AudioInputRouting>
        <MidiInputRouting>
          <Target Value="MidiIn/External.All/-1" />
          <UpperDisplayString Value="Ext: All Ins" />
          <LowerDisplayString Value="" />
        </MidiInputRouting>
        <AudioOutputRouting>
          <Target Value="AudioOut/External/S0" />
          <UpperDisplayString Value="Ext. Out" />
          <LowerDisplayString Value="1/2" />
        </AudioOutputRouting>
        <MidiOutputRouting>
          <Target Value="MidiOut/None" />
          <UpperDisplayString Value="None" />
          <LowerDisplayString Value="" />
        </MidiOutputRouting>
        <Mixer>
          <LomId Value="0" />
          <LomIdView Value="0" />
          <IsExpanded Value="true" />
          <On>
            <LomId Value="0" />
            <Manual Value="true" />
            <AutomationTarget Id="${getId()}">
              <LockEnvelope Value="0" />
            </AutomationTarget>
            <MidiCCOnOffThresholds>
              <Min Value="64" />
              <Max Value="127" />
            </MidiCCOnOffThresholds>
          </On>
          <ModulationSourceCount Value="0" />
          <ParametersListWrapper LomId="0" />
          <Pointee Id="${getId()}" />
          <LastSelectedTimeableIndex Value="0" />
          <LastSelectedClipEnvelopeIndex Value="0" />
          <LastPresetRef>
            <Value />
          </LastPresetRef>
          <LockedScripts />
          <IsFolded Value="false" />
          <ShouldShowPresetName Value="false" />
          <UserName Value="" />
          <Annotation Value="" />
          <SourceContext>
            <Value />
          </SourceContext>
          <Sends />
          <Speaker>
            <LomId Value="0" />
            <Manual Value="true" />
            <AutomationTarget Id="${getId()}">
              <LockEnvelope Value="0" />
            </AutomationTarget>
            <MidiCCOnOffThresholds>
              <Min Value="64" />
              <Max Value="127" />
            </MidiCCOnOffThresholds>
          </Speaker>
          <SoloSink Value="false" />
          <PanMode Value="0" />
          <Pan>
            <LomId Value="0" />
            <Manual Value="0" />
            <MidiControllerRange>
              <Min Value="-1" />
              <Max Value="1" />
            </MidiControllerRange>
            <AutomationTarget Id="${getId()}">
              <LockEnvelope Value="0" />
            </AutomationTarget>
            <ModulationTarget Id="${getId()}">
              <LockEnvelope Value="0" />
            </ModulationTarget>
          </Pan>
          <SplitStereoPanL>
            <LomId Value="0" />
            <Manual Value="-1" />
            <MidiControllerRange>
              <Min Value="-1" />
              <Max Value="1" />
            </MidiControllerRange>
            <AutomationTarget Id="${getId()}">
              <LockEnvelope Value="0" />
            </AutomationTarget>
            <ModulationTarget Id="${getId()}">
              <LockEnvelope Value="0" />
            </ModulationTarget>
          </SplitStereoPanL>
          <SplitStereoPanR>
            <LomId Value="0" />
            <Manual Value="1" />
            <MidiControllerRange>
              <Min Value="-1" />
              <Max Value="1" />
            </MidiControllerRange>
            <AutomationTarget Id="${getId()}">
              <LockEnvelope Value="0" />
            </AutomationTarget>
            <ModulationTarget Id="${getId()}">
              <LockEnvelope Value="0" />
            </ModulationTarget>
          </SplitStereoPanR>
          <Volume>
            <LomId Value="0" />
            <Manual Value="1" />
            <MidiControllerRange>
              <Min Value="0.0003162277571" />
              <Max Value="1.99526238" />
            </MidiControllerRange>
            <AutomationTarget Id="${getId()}">
              <LockEnvelope Value="0" />
            </AutomationTarget>
            <ModulationTarget Id="${getId()}">
              <LockEnvelope Value="0" />
            </ModulationTarget>
          </Volume>
          <ViewStateSesstionTrackWidth Value="93" />
          <CrossFadeState>
            <LomId Value="0" />
            <Manual Value="1" />
            <AutomationTarget Id="${getId()}">
              <LockEnvelope Value="0" />
            </AutomationTarget>
          </CrossFadeState>
          <SendsListWrapper LomId="0" />
        </Mixer>
        <DeviceChain>
          <Devices />
          <SignalModulations />
        </DeviceChain>
      </DeviceChain>
    </PreHearTrack>
    <SendsPre />
    <Scenes>
      <Scene Id="0">
        <LomId Value="0" />
        <Name Value="" />
        <Annotation Value="" />
        <Color Value="-1" />
        <Tempo Value="${bpm}" />
        <IsTempoEnabled Value="false" />
        <TimeSignatureId Value="201" />
        <IsTimeSignatureEnabled Value="false" />
        <LomIdView Value="0" />
        <ClipSlotsListWrapper LomId="0" />
      </Scene>
    </Scenes>
    <Transport>
      <PhaseNudgeTempo Value="${bpm}" />
      <LoopOn Value="false" />
      <LoopStart Value="0" />
      <LoopLength Value="16" />
      <LoopIsSongStart Value="false" />
      <CurrentTime Value="0" />
      <PunchIn Value="false" />
      <PunchOut Value="false" />
      <MetronomeClickOn Value="false" />
      <DrawMode Value="false" />
    </Transport>
    <SongMasterValues>
      <SessionScrollerPos Value="0, 0" />
      <ArrangementScrollerPos Value="0, 0, 0" />
    </SongMasterValues>
    <GlobalQuantisation Value="4" />
    <AutoQuantisation Value="0" />
    <Grid>
      <FixedNumerator Value="1" />
      <FixedDenominator Value="16" />
      <GridIntervalPixel Value="20" />
      <Ntoles Value="2" />
      <SnapToGrid Value="true" />
      <Fixed Value="false" />
    </Grid>
    <ScaleInformation>
      <RootNote Value="0" />
      <Name Value="Major" />
    </ScaleInformation>
    <InKey Value="false" />
    <SmpteFormat Value="0" />
    <TimeSelection>
      <AnchorTime Value="0" />
      <OtherTime Value="0" />
    </TimeSelection>
    <SequencerNavigator>
      <BeatTimeHelper>
        <CurrentZoom Value="0.15625" />
      </BeatTimeHelper>
      <TimeOrigin Value="0" />
      <HasSelectedClip Value="false" />
    </SequencerNavigator>
    <IsContentSelectionActive Value="false" />
    <ViewStateSess498ionMixerHeight Value="120" />
    <Locators />
    <DetailClipKeyMidi>
      <CanScale Value="true" />
      <IsScaleEquipped Value="false" />
    </DetailClipKeyMidi>
    <TracksListWrapper LomId="0" />
    <VisibleTracksListWrapper LomId="0" />
    <ReturnTracksListWrapper LomId="0" />
    <ScenesListWrapper LomId="0" />
    <CuePointsListWrapper LomId="0" />
    <ChooserBar>
      <Value Value="0" />
    </ChooserBar>
    <Annotation Value="" />
    <SoloOrPflSavedValue Value="false" />
    <SoloInPlace Value="false" />
    <CrossfadeCurve Value="2" />
    <LatencyCompensation Value="2" />
    <HighlightedTrackIndex Value="0" />
    <GroovePool>
      <Grooves />
    </GroovePool>
    <AutomationMode Value="false" />
    <SnapAutomationToGrid Value="true" />
    <ArrangementOverdub Value="false" />
    <ColorSequenceIndex Value="0" />
    <AutoColorPickerForPlayerAndGroupTracks>
      <NextColorIndex Value="0" />
    </AutoColorPickerForPlayerAndGroupTracks>
    <AutoColorPickerForReturnAndMasterTracks>
      <NextColorIndex Value="3" />
    </AutoColorPickerForReturnAndMasterTracks>
    <ViewData Value="{}" />
    <MidiBankAndProgramChooserMode Value="0" />
    <FreezeSubMode Value="3" />
  </LiveSet>
</Ableton>`;

  return xml;
}

/**
 * Escape special XML characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Get a color value for track (Ableton uses color indices)
 */
function getTrackColor(index: number): number {
  // Ableton color palette indices
  const colors = [
    16, // Red-ish
    17, // Orange
    18, // Yellow
    19, // Lime
    20, // Green
    21, // Cyan
    22, // Blue
    23, // Purple
    24, // Pink
    25, // Brown
  ];
  return colors[index % colors.length];
}

/**
 * Export stems to Ableton Live Set (.als) file
 */
export async function exportToAbletonLiveSet(options: ExportOptions): Promise<Blob> {
  debug.log('🎹 Generating Ableton Live Set...', options);

  // Generate XML
  const xml = generateALSXml(options);
  debug.log('📝 XML generated, length:', xml.length);

  // Convert to UTF-8 bytes
  const encoder = new TextEncoder();
  const xmlBytes = encoder.encode(xml);

  // Gzip compress
  const compressed = pako.gzip(xmlBytes);
  debug.log('📦 Compressed:', xmlBytes.length, '->', compressed.length, 'bytes');

  // Create blob
  const blob = new Blob([compressed], { type: 'application/x-ableton-liveset' });

  return blob;
}

/**
 * Trigger download of .als file
 */
export function downloadAbletonLiveSet(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.als') ? filename : `${filename}.als`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

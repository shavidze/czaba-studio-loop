/**
 * StudioMockup - Static visual representation of Personal Mixdown Studio
 * For homepage showcase - no functionality, just the look
 */

// Mock stem data
const MOCK_STEMS = [
  { name: 'Drums', duration: '2:34', volume: 85, isSoloed: false, isMuted: false },
  { name: 'Bass', duration: '2:34', volume: 72, isSoloed: true, isMuted: false },
  { name: 'Synth Lead', duration: '2:34', volume: 90, isMuted: true, isSoloed: false },
  { name: 'Atmosphere', duration: '2:34', volume: 65, isSoloed: false, isMuted: false },
];

// SVG Waveform patterns (different for each track)
const WAVEFORM_PATTERNS = [
  // Drums - punchy, high peaks
  'M0,25 Q5,5 10,25 Q15,45 20,25 Q25,10 30,25 Q35,40 40,25 Q45,8 50,25 Q55,42 60,25 Q65,12 70,25 Q75,38 80,25 Q85,10 90,25 Q95,40 100,25',
  // Bass - smooth, low frequency
  'M0,25 Q10,15 20,25 Q30,35 40,25 Q50,18 60,25 Q70,32 80,25 Q90,20 100,25',
  // Synth Lead - medium complexity
  'M0,25 Q8,10 16,25 Q24,40 32,25 Q40,15 48,25 Q56,35 64,25 Q72,12 80,25 Q88,38 96,25 L100,25',
  // Atmosphere - subtle, flowing
  'M0,25 Q15,20 30,25 Q45,30 60,25 Q75,22 90,25 L100,25',
];

function MockWaveform({ pattern, color = 'teal' }: { pattern: string; color?: string }) {
  const colorMap = {
    teal: '#13D9CC', // --color-brand
    yellow: '#F9A80C', // --color-accent
    neutral: '#525252',
  };

  return (
    <svg
      viewBox="0 0 100 50"
      preserveAspectRatio="none"
      className="w-full h-full"
      style={{ filter: 'drop-shadow(0 0 2px rgba(20, 184, 166, 0.3))' }}
    >
      {/* Waveform fill */}
      <path
        d={pattern}
        fill="none"
        stroke={colorMap[color as keyof typeof colorMap] || colorMap.teal}
        strokeWidth="2"
        opacity="0.8"
      />
      {/* Mirror waveform for bottom half */}
      <path
        d={pattern}
        fill="none"
        stroke={colorMap[color as keyof typeof colorMap] || colorMap.teal}
        strokeWidth="2"
        opacity="0.4"
        transform="scale(1, -1) translate(0, -50)"
      />
    </svg>
  );
}

function MockTrack({
  stem,
  pattern,
  index,
}: {
  stem: (typeof MOCK_STEMS)[0];
  pattern: string;
  index: number;
}) {
  const isImplicitlyMuted = MOCK_STEMS.some((s) => s.isSoloed) && !stem.isSoloed;

  return (
    <div
      className={`flex items-stretch border-b border-neutral-900 ${
        isImplicitlyMuted ? 'opacity-50' : ''
      }`}
    >
      {/* Track Controls - Left Panel */}
      <div className="w-44 md:w-56 bg-neutral-900 border-r border-neutral-800 p-2 md:p-3 flex flex-col gap-2 md:gap-3">
        {/* Track Name */}
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-xs md:text-sm text-white truncate">{stem.name}</h3>
            <p className="text-neutral-500 text-[10px] md:text-xs mt-0.5">{stem.duration}</p>
          </div>
          {/* Download icon */}
          <div className="flex-shrink-0 w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded bg-neutral-800 text-neutral-400">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
          </div>
        </div>

        {/* Solo & Mute Buttons */}
        <div className="flex gap-1.5">
          <div
            className={`flex-1 h-6 md:h-7 rounded font-bold text-[10px] md:text-xs flex items-center justify-center ${
              stem.isSoloed ? 'bg-yellow-500 text-black' : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            S
          </div>
          <div
            className={`flex-1 h-6 md:h-7 rounded font-bold text-[10px] md:text-xs flex items-center justify-center ${
              stem.isMuted ? 'bg-red-500 text-white' : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            M
          </div>
        </div>

        {/* Volume Fader */}
        <div className="flex items-center gap-2">
          <span className="text-neutral-500 text-[10px] md:text-xs w-6 md:w-8 flex-shrink-0">
            Vol
          </span>
          <div className="flex-1 h-1 bg-neutral-800 rounded-full relative">
            <div
              className="absolute top-0 left-0 h-full bg-teal-500 rounded-full"
              style={{ width: `${stem.volume}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 md:w-3 md:h-3 bg-teal-500 rounded-full shadow-md"
              style={{ left: `calc(${stem.volume}% - 6px)` }}
            />
          </div>
          <span className="text-neutral-400 text-[10px] md:text-xs w-6 md:w-8 text-right font-mono flex-shrink-0">
            {stem.volume}
          </span>
        </div>
      </div>

      {/* Waveform Area - Right Panel */}
      <div
        className={`flex-1 bg-neutral-950 p-2 min-w-0 h-16 md:h-20 ${
          isImplicitlyMuted ? 'opacity-40' : ''
        }`}
      >
        <MockWaveform
          pattern={pattern}
          color={stem.isMuted ? 'neutral' : stem.isSoloed ? 'yellow' : 'teal'}
        />
      </div>
    </div>
  );
}

export function StudioMockup() {
  return (
    <div className="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 shadow-2xl">
      {/* Header Bar */}
      <div className="bg-neutral-900 border-b border-neutral-800 px-3 md:px-4 py-2 md:py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          {/* Window controls (macOS style) */}
          <div className="flex gap-1.5 md:gap-2">
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500" />
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-neutral-400 text-xs md:text-sm font-medium ml-2">
            Personal Mixdown Studio
          </span>
        </div>

        {/* Transport Controls */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Stop */}
          <div className="text-neutral-600 p-1 md:p-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          </div>

          {/* Play Button */}
          <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-teal-500 text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>

          {/* Time */}
          <div className="flex items-center gap-1 md:gap-2">
            <span className="text-neutral-300 font-mono text-xs md:text-sm">1:24</span>
            <span className="text-neutral-600">/</span>
            <span className="text-neutral-500 font-mono text-xs md:text-sm">2:34</span>
          </div>
        </div>
      </div>

      {/* Tracks */}
      <div>
        {MOCK_STEMS.map((stem, index) => (
          <MockTrack key={stem.name} stem={stem} pattern={WAVEFORM_PATTERNS[index]} index={index} />
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="bg-neutral-900 border-t border-neutral-800 px-3 md:px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] md:text-xs text-neutral-500">4 stems loaded</span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="text-[10px] md:text-xs px-2 py-1 rounded bg-neutral-800 text-neutral-400">
            Loop: Off
          </div>
          <div className="text-[10px] md:text-xs px-2 md:px-3 py-1 rounded bg-teal-500/20 text-teal-400 font-medium">
            Export Mix
          </div>
        </div>
      </div>
    </div>
  );
}

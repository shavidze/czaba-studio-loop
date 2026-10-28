import sys, pathlib
root = pathlib.Path(sys.argv[1]) / 'app/lib/arrangement/__tests__'
def sub(rel, old, new, count=1):
    p = root / rel; s = p.read_text(); n = s.count(old)
    if n != count: raise SystemExit(f'{rel}: expected {count} of {old!r}, found {n}')
    p.write_text(s.replace(old, new))
S='strings.test.ts'
sub(S, "import { TEMPO_EMPTY_HINT, TEMPO_INVALID_MESSAGE, tempoStatusMessage } from '../tempo';", "import { TEMPO_INVALID_MESSAGE, tempoStatusMessage } from '../tempo';")
sub(S, "    toggleTitle: 'Loop on / off (Ctrl+L)',\n    braceHint: 'Loop: make a time selection and press Loop (Ctrl+L)',\n", "    toggleTitle: 'Loop on / off (Ctrl+L)',\n    needsSelectionTitle: 'Loop: make a time selection first (Ctrl+L)',\n")
sub(S, "    emptyHint: 'Bars: set a BPM — grid only, audio is not stretched',\n", '')
sub(S, "  studioTempoStrings: ['cleared', 'emptyHint', 'fieldLabel', 'fieldTitle', 'invalid', 'set'],", "  studioTempoStrings: ['cleared', 'fieldLabel', 'fieldTitle', 'invalid', 'set'],")
sub(S, "    expect(TEMPO_EMPTY_HINT).toBe(studioTempoStrings.emptyHint);\n", '')
sub(S, "  videoMixLabel: 'Original video sound',\n  videoImportLabel:", "  videoMixLabel: 'Original video sound',\n  videoMuteTitle: 'Mute — Original video sound',\n  videoImportLabel:")
sub(S, "  overviewNote: '· Overview',\n", '')
sub(S, "  captionFallback: 'Video',\n", '')
sub(S, "  captionSoundNote: '· sound from the video track (M/S/Volume)',\n", '')
sub(S, "  empty: 'No video added yet',\n", '')
sub(S, "        'captionFallback',\n        'captionSoundNote',\n", '')
sub(S, "        'empty',\n        'expandLabel',", "        'expandLabel',")
sub(S, "        'overviewNote',\n", '')
sub(S, "    expect(Object.keys(EXPECTED_VIDEO_DOCK_STRINGS)).toHaveLength(17);", "    expect(Object.keys(EXPECTED_VIDEO_DOCK_STRINGS)).toHaveLength(13);")
sub(S, "    expect(vd.overviewNote.startsWith(middleDot)).toBe(true);\n    expect(vd.captionSoundNote.startsWith(middleDot)).toBe(true);\n", '')
T='tempo.test.ts'
sub(T, "  TEMPO_EMPTY_HINT,\n", '')
sub(T, "    expect(TEMPO_EMPTY_HINT).toBe(studioTempoStrings.emptyHint);\n", '')
U='tempo-ui.test.tsx'
sub(U, "import { TEMPO_EMPTY_HINT, TEMPO_INVALID_MESSAGE, tempoStatusMessage } from '../tempo';", "import { TEMPO_INVALID_MESSAGE, tempoStatusMessage } from '../tempo';")
sub(U, "    expect(strip.textContent).toContain(TEMPO_EMPTY_HINT);\n", "    expect(strip.textContent).toBe('');\n")
sub(U, "    expect(barsStrip(view).textContent).toContain(TEMPO_EMPTY_HINT);\n    expect(barsStrip(view).textContent).toContain(\n      'Bars: set a BPM — grid only, audio is not stretched',\n    );\n", "    expect(barsStrip(view).textContent).toBe('');\n")
W='tempo-window-ui.test.tsx'
sub(W, "import { TEMPO_EMPTY_HINT } from '~/lib/arrangement/tempo';\n", '')
sub(W, "    expect(strip.textContent).toContain(TEMPO_EMPTY_HINT);\n", "    expect(strip.textContent).toBe('');\n")
N='navigation-strings-ui.test.tsx'
sub(N, "    expect(view.getByTestId('arrangement-loop-strip').textContent).toBe(\n      'Loop: make a time selection and press Loop (Ctrl+L)',\n    );\n", "    expect(view.getByTestId('arrangement-loop-strip').textContent).toBe('');\n")
V='video-dock-strings-ui.test.tsx'
sub(V, "    const overviewLabel = caption.previousElementSibling;\n    expect(overviewLabel?.textContent).toBe('Arrangement · Overview');\n    expect(caption.textContent).toBe('Video · sound from the video track (M/S/Volume)');\n    expect(view.getByText('No video added yet')).toBeTruthy();\n",
  "    expect(caption.previousElementSibling).toBeNull();\n    expect(caption.textContent).toBe('');\n    expect(view.queryByText('No video added yet')).toBeNull();\n    expect(view.getByTestId('arrangement-video-empty').textContent).toBe('');\n")
O='studio-theme-obsidian.test.tsx'
print('applied tests')
# TH9 (studio-theme-obsidian.test.tsx), applied by B in the same pre-check:
#  title 'six' -> 'five'; toHaveLength(6) -> 5; labelTexts without 'Arrangement';
#  the caption/overview slice block replaced by:
#    expect(html).not.toContain('· Overview'); expect(html).not.toContain('>Arrangement<');

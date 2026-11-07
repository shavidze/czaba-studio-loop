import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent
TREE = ROOT / 'tree'
CTX = TREE / 'app/contexts/ArrangementContext.tsx'
TEST = 'app/lib/arrangement/__tests__/decoded-buffer-eviction-ui.test.tsx'

PLAY_WARNING = (
    "      const failedClip = arrangement.clips.find(\n"
    "        (clip) => latestRef.current.sourceStates[clip.sourceId]?.status === 'error',\n"
    "      );\n"
    "      if (failedClip) {\n"
    "        const failedSource = collection.sources.find((entry) => entry.id === failedClip.sourceId);\n"
    "        setStatus(librarySourceFailedMessage(failedSource?.title ?? failedClip.sourceId));\n"
    "      }\n"
)
PLAYING_FROM = (
    "      setStatus((text) =>\n"
    "        insertMarkerStatusKind(text) === 'stopped' || text === studioPlaybackStrings.scheduleFailed\n"
    "          ? studioPlaybackStrings.playingFrom(formatArrangementTime(from))\n"
    "          : text,\n"
    "      );\n"
)
PLAY_SWAP = (
    "            setStatus((text) =>\n"
    "              text === loadingText ? studioLibraryStrings.sourceReady(title) : text,\n"
    "            );\n"
)

MUTANTS = [
    ('MU-391-OLD-PLAY-TEXT', 'EV3: Play is refused',
     "        const loadingText = studioLibraryStrings.sourceDecoding(title);\n",
     "        const loadingText = studioLibraryStrings.sourceNotLoaded(title);\n"),
    ('MU-391-NO-SETTLE-SWAP-PLAY', 'EV3: Play is refused', PLAY_SWAP, ''),
    ('MU-391-NO-SETTLE-SWAP-PREVIEW', 'EV18',
     "          if (latestRef.current.sourceStates[sourceId]?.status === 'error') {\n"
     "            setStatus(librarySourceFailedMessage(source.title));\n"
     "          } else if (decodedBuffers.has(sourceId)) {\n",
     "          if (decodedBuffers.has(sourceId)) {\n"),
    ('MU-391-UNCONDITIONAL-SWAP', 'EV16: a status written', PLAY_SWAP,
     "            setStatus(studioLibraryStrings.sourceReady(title));\n"),
    ('MU-391-CONDITIONAL-FAILURE', 'EV16: a failed settle',
     "            setStatus(librarySourceFailedMessage(sourceTitle(failedId)));\n",
     "            setStatus((text) =>\n"
     "              text === loadingText ? librarySourceFailedMessage(sourceTitle(failedId)) : text,\n"
     "            );\n"),
    ('MU-391-READY-ON-FIRST', 'EV17',
     "        void ensureDecoded(awaiting).then(() => {\n"
     "          const failedId = awaiting.find(\n",
     "        void ensureDecoded(awaiting);\n"
     "        void ensureDecoded([awaiting[0]]).then(() => {\n"
     "          const failedId = [awaiting[0]].find(\n"),
    ('MU-391-READY-ON-SOME', 'EV17: when every awaited source decodes',
     "          if (awaiting.every((id) => decodedBuffers.has(id))) {\n",
     "          if (awaiting.some((id) => decodedBuffers.has(id))) {\n"),
    ('MU-391-PREVIEW-NO-LOADING', 'EV9: a preview plays',
     "        const loadingText = studioLibraryStrings.sourceDecoding(source.title);\n"
     "        setStatus(loadingText);\n",
     "        const loadingText = studioLibraryStrings.sourceDecoding(source.title);\n"),
    ('MU-391-EXPORT-NO-ERROR-CHECK', 'EV19',
     "          latestRef.current.sourceStates[clip.sourceId]?.status === 'error' &&\n"
     "          (!renderWindow ||\n",
     "          false &&\n"
     "          (!renderWindow ||\n"),
    ('MU-391-ERROR-CHECK-IGNORES-WINDOW', 'EV20',
     "          (!renderWindow ||\n",
     "          (true ||\n"),
    ('MU-391-PLAY-NO-WARNING', 'EV21', PLAY_WARNING, ''),
    ('MU-391-WARNING-BEFORE-PLAYINGFROM', 'EV21',
     PLAYING_FROM + PLAY_WARNING, PLAY_WARNING + PLAYING_FROM),
]


def run_row(row: str, log: pathlib.Path) -> int:
    with log.open('w') as handle:
        return subprocess.run(
            ['npx', 'vitest', 'run', TEST, '-t', row],
            cwd=TREE, stdout=handle, stderr=subprocess.STDOUT,
        ).returncode


def main() -> None:
    out = ROOT / 'out'
    out.mkdir(exist_ok=True)
    original = CTX.read_text()
    summary = []
    selected = set(sys.argv[1:])
    for mutant_id, row, old, new in MUTANTS:
        if selected and mutant_id not in selected:
            continue
        if original.count(old) != 1:
            summary.append(f'{mutant_id}: SITE-NOT-UNIQUE count={original.count(old)}')
            continue
        pristine = run_row(row, out / f'pristine.{mutant_id}.log')
        CTX.write_text(original.replace(old, new))
        try:
            rc = run_row(row, out / f'{mutant_id}.log')
        finally:
            CTX.write_text(original)
        verdict = 'RED' if rc != 0 else 'SURVIVED'
        summary.append(f'{mutant_id}: row="{row}" pristine_rc={pristine} mutant_rc={rc} {verdict} restored')
    (out / 'summary.txt').write_text('\n'.join(summary) + '\n')
    print('\n'.join(summary))


main()

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
PLAY_SWAP = (
    "            setStatus((text) =>\n"
    "              text === loadingText ? studioLibraryStrings.sourceReady(title) : text,\n"
    "            );\n"
)
PREVIEW_SWAP = (
    "            setStatus((text) =>\n"
    "              text === loadingText ? studioLibraryStrings.sourceReady(source.title) : text,\n"
    "            );\n"
)
PREVIEW_FAILURE = (
    "          if (settle.kind === 'failed') {\n"
    "            setStatus(librarySourceFailedMessage(source.title));\n"
    "          } else if (settle.kind === 'ready') {\n"
)
PREVIEW_NULL_OWNER = (
    "        if (!controller) {\n"
    "          setStatus(studioLibraryStrings.sourceNotLoaded(source.title));\n"
    "          return;\n"
    "        }\n"
)
PLAY_FAILURE = "            setStatus(librarySourceFailedMessage(sourceTitle(settle.sourceId)));\n"

MUTANTS = [
    ('MU-392-SUCCESS-BY-CACHE', 'EV9: a (superseded|preview stopped)',
     PREVIEW_FAILURE,
     PREVIEW_FAILURE.replace("settle.kind === 'ready'", 'decodedBuffers.has(sourceId)')),
    ('MU-392-LOADING-ON-NULL-OWNER', 'EV12',
     PREVIEW_NULL_OWNER,
     "        if (!controller) {\n"
     "          previewRequestRef.current = sourceId;\n"
     "          decodedBuffers.setPinned('preview', [sourceId]);\n"
     "          setStatus(studioLibraryStrings.sourceDecoding(source.title));\n"
     "          return;\n"
     "        }\n"),
    ('MU-392-SUPERSEDED-FAILURE-SILENT', 'EV23',
     PREVIEW_FAILURE,
     PREVIEW_FAILURE.replace(
         "if (settle.kind === 'failed') {",
         "if (settle.kind === 'failed' && previewRequestRef.current === sourceId) {")),
    ('MU-392-MP3-DROPS-WINDOW', 'EV24',
     "          const failedSource = await prepareExportSources(arrangement, controller, renderWindow);\n",
     "          const failedSource = await prepareExportSources(arrangement, controller);\n"),
    ('MU-392-IGNORE-ABORT', 'EV25',
     "  return signal.aborted ? { kind: 'none' } : { kind: 'ready' };\n",
     "  return { kind: 'ready' };\n"),
    ('MU-392-FAILURE-FIRST-ONLY', 'EV17: Play waits for every',
     "  const failedId = awaiting.find((id) => sourceStates[id]?.status === 'error');\n",
     "  const failedId = awaiting.slice(0, 1).find((id) => sourceStates[id]?.status === 'error');\n"),
    ('MU-391-NO-SETTLE-SWAP-PLAY', 'EV3: Play is refused', PLAY_SWAP, ''),
    ('MU-391-NO-SETTLE-SWAP-PREVIEW', 'EV9: a preview plays', PREVIEW_SWAP, ''),
    ('MU-392-PREVIEW-NO-FAILURE-WRITE', 'EV18',
     PREVIEW_FAILURE,
     "          if (settle.kind === 'failed') {\n"
     "          } else if (settle.kind === 'ready') {\n"),
    ('MU-391-UNCONDITIONAL-SWAP', 'EV16: a status written', PLAY_SWAP,
     "            setStatus(studioLibraryStrings.sourceReady(title));\n"),
    ('MU-391-CONDITIONAL-FAILURE', 'EV16: a failed settle', PLAY_FAILURE,
     "            setStatus((text) =>\n"
     "              text === loadingText ? librarySourceFailedMessage(sourceTitle(settle.sourceId)) : text,\n"
     "            );\n"),
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
        summary.append(
            f'{mutant_id}: row="{row}" pristine_rc={pristine} mutant_rc={rc} {verdict} restored')
    (out / 'summary.txt').write_text('\n'.join(summary) + '\n')
    print('\n'.join(summary))


main()

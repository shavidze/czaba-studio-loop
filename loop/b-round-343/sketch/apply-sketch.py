"""B343 sketch for PERF-DRAG-PREVIEW c5-i: a video clip move drag in the interactions perf harness (1x only, record).
Usage: python3 -I apply-sketch.py <store-tree>
Edits perf/studio-lab-interactions.perf.spec.ts and perf/budgets.interactions.json of <store-tree> in place."""
import json
import sys
from pathlib import Path

tree = Path(sys.argv[1])
spec_path = tree / 'perf' / 'studio-lab-interactions.perf.spec.ts'
spec = spec_path.read_text()


def once(text: str, old: str, new: str) -> str:
    if text.count(old) != 1:
        raise SystemExit(f'anchor count {text.count(old)} != 1: {old[:80]!r}')
    return text.replace(old, new)


spec = once(
    spec,
    "const clipById = (page: Page, clipId: string): Locator =>\n"
    "  page.locator(`[data-clip-kind=\"audio\"][data-clip-id=${quotedAttributeValue(clipId)}]`);\n",
    "const clipById = (page: Page, clipId: string): Locator =>\n"
    "  page.locator(`[data-clip-kind=\"audio\"][data-clip-id=${quotedAttributeValue(clipId)}]`);\n"
    "\n"
    "const videoClips = (page: Page): Locator => page.locator('[data-clip-kind=\"video\"]');\n"
    "\n"
    "const videoClipById = (page: Page, clipId: string): Locator =>\n"
    "  page.locator(`[data-clip-kind=\"video\"][data-clip-id=${quotedAttributeValue(clipId)}]`);\n"
    "\n"
    "const videoFixturePath = path.join(storeRoot, 'public', 'videos', 'hero', '1.mp4');\n"
    "const videoGrabWidthPx = 480;\n"
    "const videoZoomInKeyLimit = 16;\n"
    "const videoZoomSettleMs = 150;\n",
)

spec = once(spec, "  rows: 'all' | 'thirty';\n", "  rows: 'all' | 'all-but-ratio' | 'thirty';\n")

spec = once(
    spec,
    "    if (measure.rows === 'all') {\n"
    "      put('commits-per-move', {\n"
    "        value: roundTo(moves.length ? inWindow.length / moves.length : 0, 3),\n"
    "        detail: windowDetail,\n"
    "      });\n",
    "    if (measure.rows !== 'thirty') {\n"
    "      if (measure.rows === 'all') {\n"
    "        put('commits-per-move', {\n"
    "          value: roundTo(moves.length ? inWindow.length / moves.length : 0, 3),\n"
    "          detail: windowDetail,\n"
    "        });\n"
    "      }\n",
)

spec = once(
    spec,
    "async function measureGroupDrag(\n",
    "interface VideoClip {\n"
    "  clip: Locator;\n"
    "  undoBefore: string | null;\n"
    "  zoomKeys: number;\n"
    "}\n"
    "\n"
    "async function setupVideoClip(\n"
    "  page: Page,\n"
    "  result: InteractionPassResult,\n"
    "): Promise<VideoClip | null> {\n"
    "  if ((await videoClips(page).count()) !== 0) {\n"
    "    result.problems.push('video setup: the video lane is not empty');\n"
    "    return null;\n"
    "  }\n"
    "  const undoBefore = await undoTitle(page);\n"
    "  const from = await nowIn(page);\n"
    "  await page.getByTestId('arrangement-video-input').setInputFiles(videoFixturePath);\n"
    "  await expect(videoClips(page)).toHaveCount(1, { timeout: 30_000 });\n"
    "  await waitForQuiet(page, from, settleMs);\n"
    "  const clipId = await videoClips(page).first().getAttribute('data-clip-id');\n"
    "  if (clipId === null) {\n"
    "    result.problems.push('video setup: the imported video clip has no data-clip-id');\n"
    "    return null;\n"
    "  }\n"
    "  const clip = videoClipById(page, clipId);\n"
    "  const moveTarget = dragTarget(clip, 'move');\n"
    "  await blurActive(page);\n"
    "  let zoomKeys = 0;\n"
    "  while (\n"
    "    zoomKeys < videoZoomInKeyLimit &&\n"
    "    ((await moveTarget.boundingBox())?.width ?? 0) < videoGrabWidthPx\n"
    "  ) {\n"
    "    const fromKey = await nowIn(page);\n"
    "    await page.keyboard.press('=');\n"
    "    await waitForQuiet(page, fromKey, videoZoomSettleMs);\n"
    "    zoomKeys += 1;\n"
    "  }\n"
    "  const width = (await moveTarget.boundingBox())?.width ?? 0;\n"
    "  if (width < videoGrabWidthPx) {\n"
    "    result.problems.push(\n"
    "      `video setup: name bar ${roundTo(width, 1)} px wide after ${zoomKeys} zoom-in keys; want ${videoGrabWidthPx}`,\n"
    "    );\n"
    "    return null;\n"
    "  }\n"
    "  return { clip, undoBefore, zoomKeys };\n"
    "}\n"
    "\n"
    "async function teardownVideoClip(\n"
    "  page: Page,\n"
    "  video: VideoClip,\n"
    "  result: InteractionPassResult,\n"
    "): Promise<void> {\n"
    "  await blurActive(page);\n"
    "  let presses = 0;\n"
    "  while (presses < 3 && (presses === 0 || (await undoTitle(page)) !== video.undoBefore)) {\n"
    "    const from = await nowIn(page);\n"
    "    await page.keyboard.press('Control+z');\n"
    "    await waitForQuiet(page, from, settleMs);\n"
    "    presses += 1;\n"
    "  }\n"
    "  if (presses > 1) {\n"
    "    result.problems.push(\n"
    "      `video teardown: ${presses} Ctrl+Z presses to reach the start entry; want 1`,\n"
    "    );\n"
    "  }\n"
    "  await expect(videoClips(page)).toHaveCount(0);\n"
    "  if ((await undoTitle(page)) !== video.undoBefore) {\n"
    "    result.problems.push('video teardown: Undo history not back at its start entry');\n"
    "  }\n"
    "}\n"
    "\n"
    "async function measureGroupDrag(\n",
)

spec = once(
    spec,
    "      step = `select same lane with ${clipsTarget} clips`;\n"
    "      await measureSelectSameLane(page, result);\n"
    "    }\n",
    "      step = `select same lane with ${clipsTarget} clips`;\n"
    "      await measureSelectSameLane(page, result);\n"
    "      step = 'video setup';\n"
    "      const video = await setupVideoClip(page, result);\n"
    "      if (video !== null) {\n"
    "        setLive(result, 'interact.harness.drag-video-live', true, { zoomKeys: video.zoomKeys });\n"
    "        step = 'drag video stopped';\n"
    "        await measureDrag(\n"
    "          page,\n"
    "          {\n"
    "            drag: 'move',\n"
    "            state: 'stopped',\n"
    "            clip: video.clip,\n"
    "            baseId: 'interact.drag.video.stopped',\n"
    "            liveId: 'interact.harness.drag-video-live',\n"
    "            rows: 'all-but-ratio',\n"
    "          },\n"
    "          result,\n"
    "        );\n"
    "        step = 'play for the video drag';\n"
    "        await setPlayback(page, true);\n"
    "        await waitForPlaybackSettled(page, result.problems, 'play for the video drag');\n"
    "        step = 'drag video playing';\n"
    "        await measureDrag(\n"
    "          page,\n"
    "          {\n"
    "            drag: 'move',\n"
    "            state: 'playing',\n"
    "            clip: video.clip,\n"
    "            baseId: 'interact.drag.video.playing',\n"
    "            liveId: 'interact.harness.drag-video-live',\n"
    "            rows: 'all-but-ratio',\n"
    "          },\n"
    "          result,\n"
    "        );\n"
    "        step = 'stop after the video drag';\n"
    "        await setPlayback(page, false);\n"
    "        step = 'video teardown';\n"
    "        await teardownVideoClip(page, video, result);\n"
    "      } else {\n"
    "        setLive(result, 'interact.harness.drag-video-live', false, { setup: 'failed' });\n"
    "      }\n"
    "    }\n",
)

spec = once(
    spec,
    "  `1x only, measured last: \"-\" until 2 clip name bars are visible",
    "  `1x only, after the 30-clip block: \"-\" until 2 clip name bars are visible",
)
spec = once(
    spec,
    "interact.harness.select-same-lane-live)`,\n];\n",
    "interact.harness.select-same-lane-live)`,\n"
    "  '1x only, measured last: import public/videos/hero/1.mp4 through the video lane input (1 video clip at 0, Undo \"Add video\"), \"=\" until its name bar is at least 480 px wide (at most 16 keys), move drag on the video clip name bar stopped, then Space and the same drag after Home (seek to 0), Space; reset after each with Ctrl+Z; teardown Ctrl+Z (0 video clips, Undo back at its start entry) (interact.drag.video.*, interact.harness.drag-video-live)',\n"
    "];\n",
)
spec_path.write_text(spec)

budget_path = tree / 'perf' / 'budgets.interactions.json'
rows = json.loads(budget_path.read_text())
by_id = {row['id']: row for row in rows}
note = (
    "1x only, measured last (after the 30-clip block). Video clip name bar move drag "
    "(public/videos/hero/1.mp4 imported through the video lane input): same windows and "
    "definition as interact.drag.move.<state>.<metric>. Record until c5-ii moves the video "
    "preview off history (PERF-DRAG-PREVIEW c5-i, L58)."
)
added = []
for state in ('stopped', 'playing'):
    metrics = ['move-components-per-move', 'move-components-max', 'release-commits', 'move-to-paint-p95']
    if state == 'playing':
        metrics += ['move-restarts', 'release-restarts']
    for metric in metrics:
        source = by_id[f'interact.drag.move.{state}.{metric}']
        playing_ratio = state == 'playing' and metric == 'move-components-per-move'
        added.append({
            'id': f'interact.drag.video.{state}.{metric}',
            'scenario': f'video clip name bar move drag, {state}, 30 audio clips',
            'metric': metric,
            'unit': source['unit'],
            'kind': 'wallclock' if playing_ratio else source['kind'],
            'mode': 'record',
            'budget': None,
            'owner': 'PERF-DRAG-PREVIEW-c5-i',
            'note': note + (
                ' Wallclock: sketch v2 summed 5903, 5901, 5903 components over 60 moves '
                '(b-round-343/perf-sketch-v2.log); playback ticks inside the window (L37).'
                if playing_ratio else ''
            ),
        })
live_source = by_id['interact.harness.drag-move-live']
added.append({
    'id': 'interact.harness.drag-video-live',
    'scenario': 'video clip name bar move drag',
    'metric': 'drag-video-live',
    'unit': live_source['unit'],
    'kind': live_source['kind'],
    'mode': 'record',
    'budget': None,
    'owner': 'PERF-DRAG-PREVIEW-c5-i',
    'note': (
        "1x only. 1 only when both the stopped and the playing video drag were live: the video "
        "clip's data-clip-start changes from the start to mid-drag and from mid-drag to the end; "
        "0 when the video setup failed. Record until C measures it (L58)."
    ),
})
budget_path.write_text(json.dumps(rows + added, indent=2, ensure_ascii=False) + '\n')
print(f'spec ok; budgets {len(rows)} -> {len(rows) + len(added)}')

# Trace summary, round 468 (HEAD 9ba13ac prod build, / at 1440x900, one 20-tick wheel sequence; trace-head.json.gz; renderer SwiftShader software raster)

Window per slow frame = [mark startTime, startTime + dt]: the mark is created with startTime = the previous rAF timestamp, i.e. the start of the slow frame (an earlier draft of trace-sum.cjs used [ts - dt, ts], one frame early; corrected and re-run). Slow frames seen (dt ms, scrollY): 50@366 50@468 33@501 50@526 67@600 33@639 67@708 50@773 83@1952.

## Totals inside the slow frames (ms, thread | event)
```
TOTALS over slow frames:
918.4 ThreadPoolForegroundWorker | DisplayItemList::Raster
906.7 ThreadPoolForegroundWorker | RasterizerTaskImpl::RunOnWorkerThread
904.6 ThreadPoolForegroundWorker | RasterTask
902.5 ThreadPoolForegroundWorker | ZeroCopyRasterBuffer::Playback
403.2 CrRendererMain | ProxyMain::BeginMainFrame
373.3 CrRendererMain | LayerTreeHost::WaitForCommitCompletion
248.2 CrRendererMain | Commit
247.0 CrRendererMain | ProxyMain::BeginMainFrame::commit
227.7 VizCompositorThread | Graphics.Pipeline
222.1 VizCompositorThread | DisplayScheduler::OnBeginFrameDeadline
222.0 VizCompositorThread | DisplayScheduler::DrawAndSwap
221.9 VizCompositorThread | Display::DrawAndSwap
217.3 VizCompositorThread | DirectRenderer::DrawFrame
128.9 VizCompositorThread | DirectRenderer::DrawRenderPass
117.6 CrRendererMain | FunctionCall
117.1 CrRendererMain | FireAnimationFrame
114.6 CrRendererMain | ScrollLayer
31.9 ThreadPoolForegroundWorker | SoftwareImageDecodeTaskImpl::RunOnWorkerThread
31.9 ThreadPoolForegroundWorker | ImageDecodeTask
31.8 ThreadPoolForegroundWorker | SoftwareImageDecodeCache::DecodeImageInTask
26.4 ThreadPoolForegroundWorker | Decode LazyPixelRef
26.3 ThreadPoolForegroundWorker | ImageFrameGenerator::decode
26.3 ThreadPoolForegroundWorker | Decode Image
```

Main-thread Paint / Layout / UpdateLayoutTree are small; the time is tile raster on ThreadPoolForegroundWorker (DisplayItemList::Raster ~918 ms) and the main thread waiting in LayerTreeHost::WaitForCommitCompletion (~373 ms). Script (FireAnimationFrame / FunctionCall, Lenis raf) is ~117 ms over all 9 frames. ImageDecodeTask ~32 ms. The trace names Paint nodeIds only, not DOM nodes; the invalidation trace (invalidations.txt, trace-inv.json.gz) names per-frame style mutations (hero Ken Burns IMG 260x, StudioShowcase cards). The raster cost is attributed to the blur glows by screening (bisect.md s2-s7) and the proposal build, not by the trace.

## Per slow frame (top events)
```
[
 {
  "y": 366,
  "dt": 50,
  "top": [
   "ThreadPoolForegroundWorker | DisplayItemList::Raster=59.9",
   "ThreadPoolForegroundWorker | RasterizerTaskImpl::RunOnWorkerThread=59.9",
   "ThreadPoolForegroundWorker | RasterTask=59.7",
   "ThreadPoolForegroundWorker | ZeroCopyRasterBuffer::Playback=59.5",
   "CrRendererMain | ProxyMain::BeginMainFrame=37.7",
   "CrRendererMain | Commit=34.5",
   "CrRendererMain | ProxyMain::BeginMainFrame::commit=34.3",
   "CrRendererMain | LayerTreeHost::WaitForCommitCompletion=34.3",
   "ThreadPoolForegroundWorker | SoftwareImageDecodeTaskImpl::RunOnWorkerThread=31.9",
   "ThreadPoolForegroundWorker | ImageDecodeTask=31.9",
   "ThreadPoolForegroundWorker | SoftwareImageDecodeCache::DecodeImageInTask=31.8",
   "ThreadPoolForegroundWorker | Decode LazyPixelRef=26.4",
   "ThreadPoolForegroundWorker | ImageFrameGenerator::decode=26.3",
   "ThreadPoolForegroundWorker | Decode Image=26.3"
  ],
  "paintNodes": [
   "[9,0,[0,0,1440,0,1440,5021,0,5021]]",
   "[34,0,[16,9,1424,9,1424,890,16,890]]",
   "[48,0,[0,-994,1440,-994,1440,4028,0,4028]]",
   "[39,0,[-80,-182,1360,-182,1360,719,-80,719]]",
   "[67,0,[-8388608,-8388608,8388607,-8388608,8388607,8388607,-8388608,8388607]]"
  ]
 },
 {
  "y": 468,
  "dt": 50,
  "top": [
   "ThreadPoolForegroundWorker | DisplayItemList::Raster=99.7",
   "ThreadPoolForegroundWorker | RasterizerTaskImpl::RunOnWorkerThread=97.6",
   "ThreadPoolForegroundWorker | RasterTask=97.4",
   "ThreadPoolForegroundWorker | ZeroCopyRasterBuffer::Playback=97.2",
   "CrRendererMain | ProxyMain::BeginMainFrame=34.4",
   "CrRendererMain | FunctionCall=32.6",
   "CrRendererMain | FireAnimationFrame=32.5",
   "CrRendererMain | ScrollLayer=31.7",
   "CrRendererMain | LayerTreeHost::WaitForCommitCompletion=31.6",
   "VizCompositorThread | Graphics.Pipeline=18.4",
   "VizCompositorThread | DisplayScheduler::OnBeginFrameDeadline=17.8",
   "VizCompositorThread | DisplayScheduler::DrawAndSwap=17.8",
   "VizCompositorThread | Display::DrawAndSwap=17.8",
   "VizCompositorThread | DirectRenderer::DrawFrame=17.2"
  ],
  "paintNodes": [
   "[9,0,[0,0,1440,0,1440,5021,0,5021]]",
   "[48,0,[0,-986,1440,-986,1440,4036,0,4036]]"
  ]
 },
 {
  "y": 501,
  "dt": 33,
  "top": [
   "ThreadPoolForegroundWorker | DisplayItemList::Raster=67.1",
   "ThreadPoolForegroundWorker | RasterizerTaskImpl::RunOnWorkerThread=65.2",
   "ThreadPoolForegroundWorker | RasterTask=65.1",
   "ThreadPoolForegroundWorker | ZeroCopyRasterBuffer::Playback=65.0",
   "CrRendererMain | ProxyMain::BeginMainFrame=33.3",
   "CrRendererMain | Commit=32.3",
   "CrRendererMain | ProxyMain::BeginMainFrame::commit=32.2",
   "CrRendererMain | LayerTreeHost::WaitForCommitCompletion=32.2",
   "VizCompositorThread | Graphics.Pipeline=11.3",
   "VizCompositorThread | DisplayScheduler::OnBeginFrameDeadline=10.9",
   "VizCompositorThread | DisplayScheduler::DrawAndSwap=10.9",
   "VizCompositorThread | Display::DrawAndSwap=10.9",
   "VizCompositorThread | DirectRenderer::DrawFrame=10.5",
   "VizCompositorThread | DirectRenderer::DrawRenderPass=10.3"
  ],
  "paintNodes": [
   "[9,0,[0,0,1440,0,1440,5021,0,5021]]"
  ]
 },
 {
  "y": 526,
  "dt": 50,
  "top": [
   "ThreadPoolForegroundWorker | DisplayItemList::Raster=103.6",
   "ThreadPoolForegroundWorker | RasterizerTaskImpl::RunOnWorkerThread=101.7",
   "ThreadPoolForegroundWorker | RasterTask=101.5",
   "ThreadPoolForegroundWorker | ZeroCopyRasterBuffer::Playback=101.2",
   "CrRendererMain | ProxyMain::BeginMainFrame=35.0",
   "CrRendererMain | Commit=32.8",
   "CrRendererMain | ProxyMain::BeginMainFrame::commit=32.5",
   "CrRendererMain | LayerTreeHost::WaitForCommitCompletion=32.4",
   "VizCompositorThread | Graphics.Pipeline=21.2",
   "VizCompositorThread | DisplayScheduler::OnBeginFrameDeadline=20.5",
   "VizCompositorThread | DisplayScheduler::DrawAndSwap=20.5",
   "VizCompositorThread | Display::DrawAndSwap=20.5",
   "VizCompositorThread | DirectRenderer::DrawFrame=20.0",
   "VizCompositorThread | DirectRenderer::DrawRenderPass=19.7"
  ],
  "paintNodes": [
   "[9,0,[0,0,1440,0,1440,5021,0,5021]]",
   "[34,0,[14,8,1426,8,1426,891,14,891]]",
   "[48,0,[0,-983,1440,-983,1440,4039,0,4039]]",
   "[48,0,[0,-982,1440,-982,1440,4040,0,4040]]"
  ]
 },
 {
  "y": 600,
  "dt": 67,
  "top": [
   "ThreadPoolForegroundWorker | DisplayItemList::Raster=129.8",
   "ThreadPoolForegroundWorker | RasterizerTaskImpl::RunOnWorkerThread=128.4",
   "ThreadPoolForegroundWorker | RasterTask=128.2",
   "ThreadPoolForegroundWorker | ZeroCopyRasterBuffer::Playback=128.0",
   "CrRendererMain | ProxyMain::BeginMainFrame=50.5",
   "CrRendererMain | FunctionCall=47.2",
   "CrRendererMain | FireAnimationFrame=47.0",
   "CrRendererMain | ScrollLayer=46.4",
   "CrRendererMain | LayerTreeHost::WaitForCommitCompletion=46.2",
   "VizCompositorThread | Graphics.Pipeline=35.3",
   "VizCompositorThread | DisplayScheduler::OnBeginFrameDeadline=34.2",
   "VizCompositorThread | DisplayScheduler::DrawAndSwap=34.2",
   "VizCompositorThread | Display::DrawAndSwap=34.2",
   "VizCompositorThread | DirectRenderer::DrawFrame=33.4"
  ],
  "paintNodes": [
   "[9,0,[0,0,1440,0,1440,5021,0,5021]]",
   "[34,0,[14,7,1426,7,1426,892,14,892]]",
   "[34,0,[13,7,1427,7,1427,892,13,892]]"
  ]
 },
 {
  "y": 639,
  "dt": 33,
  "top": [
   "ThreadPoolForegroundWorker | DisplayItemList::Raster=66.3",
   "ThreadPoolForegroundWorker | RasterizerTaskImpl::RunOnWorkerThread=64.5",
   "ThreadPoolForegroundWorker | RasterTask=64.4",
   "ThreadPoolForegroundWorker | ZeroCopyRasterBuffer::Playback=64.2",
   "CrRendererMain | ProxyMain::BeginMainFrame=33.3",
   "CrRendererMain | Commit=31.1",
   "CrRendererMain | ProxyMain::BeginMainFrame::commit=30.9",
   "CrRendererMain | LayerTreeHost::WaitForCommitCompletion=30.8",
   "VizCompositorThread | Graphics.Pipeline=16.9",
   "VizCompositorThread | DisplayScheduler::OnBeginFrameDeadline=16.5",
   "VizCompositorThread | DisplayScheduler::DrawAndSwap=16.5",
   "VizCompositorThread | Display::DrawAndSwap=16.5",
   "VizCompositorThread | DirectRenderer::DrawFrame=16.1",
   "VizCompositorThread | DirectRenderer::DrawRenderPass=16.0"
  ],
  "paintNodes": [
   "[9,0,[0,0,1440,0,1440,5021,0,5021]]",
   "[34,0,[12,6,1428,6,1428,893,12,893]]"
  ]
 },
 {
  "y": 708,
  "dt": 67,
  "top": [
   "ThreadPoolForegroundWorker | DisplayItemList::Raster=134.6",
   "ThreadPoolForegroundWorker | RasterizerTaskImpl::RunOnWorkerThread=130.6",
   "ThreadPoolForegroundWorker | RasterTask=130.3",
   "ThreadPoolForegroundWorker | ZeroCopyRasterBuffer::Playback=130.1",
   "CrRendererMain | ProxyMain::BeginMainFrame=53.0",
   "CrRendererMain | LayerTreeHost::WaitForCommitCompletion=48.6",
   "CrRendererMain | FunctionCall=37.8",
   "CrRendererMain | FireAnimationFrame=37.6",
   "VizCompositorThread | Graphics.Pipeline=37.4",
   "CrRendererMain | ScrollLayer=36.6",
   "VizCompositorThread | DisplayScheduler::OnBeginFrameDeadline=36.5",
   "VizCompositorThread | DisplayScheduler::DrawAndSwap=36.5",
   "VizCompositorThread | Display::DrawAndSwap=36.5",
   "VizCompositorThread | DirectRenderer::DrawFrame=35.9"
  ],
  "paintNodes": []
 },
 {
  "y": 773,
  "dt": 50,
  "top": [
   "ThreadPoolForegroundWorker | DisplayItemList::Raster=100.9",
   "ThreadPoolForegroundWorker | RasterizerTaskImpl::RunOnWorkerThread=98.7",
   "ThreadPoolForegroundWorker | RasterTask=98.5",
   "ThreadPoolForegroundWorker | ZeroCopyRasterBuffer::Playback=98.3",
   "CrRendererMain | ProxyMain::BeginMainFrame=49.9",
   "CrRendererMain | Commit=47.0",
   "CrRendererMain | ProxyMain::BeginMainFrame::commit=46.8",
   "CrRendererMain | LayerTreeHost::WaitForCommitCompletion=46.8",
   "VizCompositorThread | Graphics.Pipeline=23.6",
   "VizCompositorThread | DisplayScheduler::OnBeginFrameDeadline=23.0",
   "VizCompositorThread | DisplayScheduler::DrawAndSwap=22.9",
   "VizCompositorThread | Display::DrawAndSwap=22.9",
   "VizCompositorThread | DirectRenderer::DrawFrame=22.3",
   "VizCompositorThread | DirectRenderer::DrawRenderPass=21.9"
  ],
  "paintNodes": [
   "[9,0,[0,0,1440,0,1440,5021,0,5021]]",
   "[76,0,[0,0,1440,0,1440,5021,0,5021]]"
  ]
 },
 {
  "y": 1952,
  "dt": 83,
  "top": [
   "ThreadPoolForegroundWorker | RasterizerTaskImpl::RunOnWorkerThread=160.1",
   "ThreadPoolForegroundWorker | RasterTask=159.6",
   "ThreadPoolForegroundWorker | ZeroCopyRasterBuffer::Playback=159.0",
   "ThreadPoolForegroundWorker | DisplayItemList::Raster=156.6",
   "CrRendererMain | ProxyMain::BeginMainFrame=76.1",
   "CrRendererMain | Commit=70.6",
   "CrRendererMain | ProxyMain::BeginMainFrame::commit=70.3",
   "CrRendererMain | LayerTreeHost::WaitForCommitCompletion=70.3",
   "VizCompositorThread | Graphics.Pipeline=63.6",
   "VizCompositorThread | DisplayScheduler::OnBeginFrameDeadline=62.7",
   "VizCompositorThread | DisplayScheduler::DrawAndSwap=62.7",
   "VizCompositorThread | Display::DrawAndSwap=62.6",
   "VizCompositorThread | DirectRenderer::DrawFrame=61.9",
   "VizCompositorThread | DirectRenderer::DrawRenderPass=60.9"
  ],
  "paintNodes": [
   "[9,0,[0,0,1440,0,1440,5021,0,5021]]",
   "[112,0,[61,37,1379,37,1379,862,61,862]]",
   "[103,0,[-208,-393,1232,-393,1232,1062,-208,1062]]"
  ]
 }
]
```

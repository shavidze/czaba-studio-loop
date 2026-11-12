const d=JSON.parse(require("fs").readFileSync(process.argv[2]));const ev=d.traceEvents||d;
const th={};for(const e of ev)if(e.name==="thread_name")th[e.pid+":"+e.tid]=e.args.name;
const marks=ev.filter(e=>e.name==="slow");
const want=/^(Paint|Layout|UpdateLayoutTree|RecalculateStyles|UpdateLayerTree|Layerize|PrePaint|Commit|RasterTask|DecodeImage|ImageDecodeTask|FunctionCall|EvaluateScript|TimerFire|FireAnimationFrame|RunTask|ScrollLayer|PaintImage|CompositeLayers|ProxyMain::BeginMainFrame::commit|LayerTreeHostImpl::PrepareToDraw|DrawFrame|Display::DrawAndSwap|SkiaOutputSurfaceImplOnGpu::SwapBuffers|TileManager::FlushAndIssueSignals|RasterizerTaskImpl|GpuTask|DisplayScheduler::DrawAndSwap|Graphics.Pipeline|SkiaOutputSurfaceImplOnGpu::FinishPaintCurrentFrame|ThreadControllerImpl::RunTask|ProxyImpl::ScheduledActionDraw|Scheduler::BeginFrame)$/;
const rows=[];const totAll={};
for(const m of marks){const det=JSON.parse(m.args.data.detail);const start=m.ts;const end=m.ts+det.dt*1000; // mark startTime = start of the slow frame
 const sum={};const nodes=new Set();
 for(const e of ev){if(e.ph!=="X"||!e.dur)continue;const a=Math.max(start,e.ts),b=Math.min(end,e.ts+e.dur);if(b<=a)continue;
  const k=(th[e.pid+":"+e.tid]||e.tid)+" | "+e.name;sum[k]=(sum[k]||0)+(b-a)/1000;
  if(e.name==="Paint"&&e.args&&e.args.data){nodes.add(JSON.stringify([e.args.data.nodeId,e.args.data.layerId,e.args.data.clip&&e.args.data.clip.slice(0,8).map(Math.round)]));}
 }
 const top=Object.entries(sum).filter(([k])=>!/ThreadControllerImpl|RunTask|PerfettoTrace|Perfetto|Scheduler::BeginFrame|Swapper|DevTools/.test(k)).sort((a,b)=>b[1]-a[1]).slice(0,14);
 for(const [k,v] of top) totAll[k]=(totAll[k]||0)+v;
 rows.push({y:det.y,dt:Math.round(det.dt),top:top.map(([k,v])=>k+"="+v.toFixed(1)),paintNodes:[...nodes].slice(0,6)});}
console.log(JSON.stringify(rows,null,1));console.log("TOTALS over slow frames:");for(const [k,v] of Object.entries(totAll).sort((a,b)=>b[1]-a[1]).slice(0,25))console.log(v.toFixed(1),k);

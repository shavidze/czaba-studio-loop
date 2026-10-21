import json,time,subprocess,datetime,tempfile
from pathlib import Path
ROOT=Path('C:/Apps/czaba-project/tmp/studio-real-loop')
SESSIONS=Path('C:/Users/sshav/.claude/projects/C--Apps-czaba-project-store')
ACTIVE={'A_IMPLEMENTING':'A','C_VERIFYING':'C','B_PLANNING_NEXT':'B'}
LIMIT=650000

def powershell(code):
    with tempfile.TemporaryFile() as output, tempfile.TemporaryFile() as errors:
        subprocess.run(['pwsh','-NoLogo','-NoProfile','-Command',code],stdout=output,stderr=errors,check=True,timeout=60)
        output.seek(0)
        return output.read().decode('utf-8',errors='replace')

def session_info(phase,round_no,started):
    needles={'A':'You are A. Read and IMPLEMENT ONLY','C':f'You are C. Independently verify A round {round_no}.','B':f'You are B. Read current-task.md, a-round-{round_no}.md'}
    start_ts=datetime.datetime.fromisoformat(started.replace('Z','+00:00')).timestamp()
    candidates=[p for p in SESSIONS.glob('*.jsonl') if start_ts-2 <= p.stat().st_ctime <= time.time()+2]
    for p in sorted(candidates,key=lambda x:abs(x.stat().st_ctime-start_ts)):
        found=False;tokens=0;compacted=False;last_text=''
        with p.open(encoding='utf-8') as f:
            for line in f:
                try:row=json.loads(line)
                except json.JSONDecodeError:continue
                if row.get('type')=='user' and not found:
                    content=row.get('message',{}).get('content','')
                    text=content if isinstance(content,str) else '\n'.join(b.get('text','') for b in content if b.get('type')=='text')
                    found=needles[phase] in text
                if row.get('type')=='system' and 'compact' in str(row.get('subtype','')):compacted=True
                if row.get('type')=='assistant':
                    message=row.get('message',{});usage=message.get('usage',{})
                    if usage:tokens=sum(usage.get(k,0) or 0 for k in ['input_tokens','cache_creation_input_tokens','cache_read_input_tokens','output_tokens'])
                    for b in message.get('content',[]):
                        if b.get('type')=='text':last_text=b.get('text','')[-1600:]
        if found:return p,tokens,compacted,last_text
    return None,0,False,''

while True:
    try:
        state=json.loads((ROOT/'status.json').read_text(encoding='utf-8-sig'))
        phase=ACTIVE.get(state.get('phase'))
        if not phase:
            time.sleep(20);continue
        session,tokens,compacted,last_text=session_info(phase,state['round'],state['updatedUtc'])
        now=datetime.datetime.now(datetime.timezone.utc).isoformat()
        (ROOT/'context-watch-status.json').write_text(json.dumps({'updatedUtc':now,'phase':phase,'round':state['round'],'session':session.stem if session else None,'contextTokens':tokens,'restartThreshold':LIMIT,'compactionDetected':compacted},indent=2),encoding='utf-8')
        if session and (compacted or tokens>=LIMIT):
            old_pid=int((ROOT/'loop.pid').read_text(encoding='utf-8-sig').strip())
            latest=json.loads((ROOT/'status.json').read_text(encoding='utf-8-sig'))
            if latest.get('phase')!=state.get('phase') or latest.get('round')!=state.get('round'):
                time.sleep(5);continue
            stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
            checkpoint=ROOT/f'context-restart-{stamp}.md'
            checkpoint.write_text(f'# Fresh-session checkpoint\n\nRound: {state["round"]}; phase: {phase}; session: {session.stem}; observed context: {tokens}; compact detected: {compacted}.\n\nPreserve all partial app edits. Inspect current-task.md, reports, git diff and actual files before continuing. No revert or duplicate implementation. Only the same phase will restart.\n\nLast agent update (source material):\n\n{last_text}\n',encoding='utf-8')
            stop_code=f"$all=Get-CimInstance Win32_Process; $root=$all | Where-Object ProcessId -eq {old_pid}; if (-not $root -or $root.CommandLine -notmatch 'studio-real-loop') {{ throw 'Loop identity mismatch' }}; $ids=@({old_pid}); do {{ $added=@($all | Where-Object {{ $_.ParentProcessId -in $ids -and $_.ProcessId -notin $ids }} | Select-Object -ExpandProperty ProcessId); $ids+= $added }} while ($added.Count -gt 0); foreach ($idValue in @($ids | Select-Object -Last ($ids.Count-1))) {{ Stop-Process -Id $idValue -Force -ErrorAction SilentlyContinue }}; Stop-Process -Id {old_pid} -Force -ErrorAction SilentlyContinue"
            powershell(stop_code)
            start_code=f"$p=Start-Process pwsh -ArgumentList @('-NoLogo','-NoProfile','-File','C:/Apps/czaba-project/tmp/studio-real-loop/run-loop.ps1','-RoundLimit','64','-StartRound','{state['round']}','-StartPhase','{phase}') -WorkingDirectory 'C:/Apps/czaba-project/store' -WindowStyle Hidden -RedirectStandardOutput 'C:/Apps/czaba-project/tmp/studio-real-loop/restart-{stamp}-output.log' -RedirectStandardError 'C:/Apps/czaba-project/tmp/studio-real-loop/restart-{stamp}-error.log' -PassThru; $p.Id | Set-Content -LiteralPath 'C:/Apps/czaba-project/tmp/studio-real-loop/loop.pid'; $p.Id"
            new_pid=powershell(start_code).strip()
            with (ROOT/'context-restarts.jsonl').open('a',encoding='utf-8') as f:f.write(json.dumps({'timeUtc':now,'round':state['round'],'phase':phase,'session':session.stem,'tokens':tokens,'compacted':compacted,'newLoopPid':new_pid,'checkpoint':str(checkpoint)})+'\n')
            time.sleep(40)
        else:time.sleep(20)
    except Exception as exc:
        with (ROOT/'context-watch-errors.log').open('a',encoding='utf-8') as f:f.write(f'{datetime.datetime.now(datetime.timezone.utc).isoformat()} {type(exc).__name__}: {exc}\n')
        time.sleep(20)

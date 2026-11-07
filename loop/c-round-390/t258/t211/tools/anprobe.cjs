const f = process.argv[2]; const d = require(f);
const lin = (db) => 10 ** (db / 20);
for (const [k, r] of Object.entries(d.runs)) {
  const playing = k.includes('playing');
  const s = r.samples.map((x) => {
    const db = Number(x.field !== '' ? x.field : x.value);
    const live = Object.values(x.liveParams);
    // AUDIO(a): a live param whose last value equals 10**(fader/20) (single), or both members' expected values (members)
    const exp = lin(Number(x.value));
    const hit = live.some((v) => Math.abs(v - exp) < 1e-9);
    return `${x.at}%: value=${x.value} field="${x.field}" vt="${x.vt}" range=${x.range} pend=${x.fieldPending} warn=${x.fieldWarn} marker=${x.pendingMarker} reset=${x.resetDisabled} lane=${x.laneD.join('/')} detail=${x.detailD} liveHit=${playing ? hit : '-'} meters=${(x.meters || []).join('|')}`;
  });
  console.log(`== ${k}: before vt=${r.before.vt} field=${r.before.field} lane=${r.before.laneD.join('/')} detail=${r.before.detailD} reset=${r.before.resetDisabled}`);
  s.forEach((x) => console.log('  ' + x));
  console.log(`  after: value=${r.after.value} field=${r.after.field} vt=${r.after.vt} pend=${r.after.fieldPending} lane=${r.after.laneD.join('/')} detail=${r.after.detailD} reset=${r.after.resetDisabled} undo=${r.undoAfter && r.undoAfter.title} status=${JSON.stringify(r.statusAfter).slice(0, 80)} statusDuring=${r.statusDuring.length} statusPost=${JSON.stringify(r.statusPost).slice(0, 120)}`);
  const rw = r.release || {};
  const fr = (rw.frames || []).map((x) => `${x.field}|${x.fader}|${x.pend}|${x.marker}`);
  console.log(`  release: atUp=${JSON.stringify(rw.atUp)} frames=${[...new Set(fr)].join(' ; ')} muts=${(rw.muts || []).filter((m) => m.t >= rw.upAt).map((m) => `${m.type}:${m.attr || ''}:${m.tid}:${m.snap.field}|${m.snap.pend}|${m.snap.marker}`).join(' ; ').slice(0, 600)}`);
  console.log(`  gainWrites=${r.gainWritesDuringDrag} paramIds=${r.gainParamIds} lastDuring=${JSON.stringify(r.lastGainDuring)} lastAfter=${JSON.stringify(r.lastGainAfter)}`);
}
for (const k of ['undoPlaying', 'undoBelowPlaying', 'undoMembersBelow']) if (d[k]) console.log(k, JSON.stringify({ vt: d[k].afterUndo.vt, field: d[k].afterUndo.field, lane: d[k].afterUndo.laneD, undo: d[k].undo, redo: d[k].redo, gw: d[k].gainWritesAfterUndo }));
console.log('members', JSON.stringify(d.members), 'errors', JSON.stringify(d.errorsSingle), JSON.stringify(d.errorsMembers), d.crash || '');

const fs = require('fs'); const { execSync } = require('child_process');
function renderers() {
  const out = execSync("pgrep -f -- '--type=renderer' || true").toString().trim().split(/\s+/).filter(Boolean);
  return out.map((pid) => { try { const s = fs.readFileSync(`/proc/${pid}/status`, 'utf8'); const kb = (k) => +(new RegExp(k + ':\\s+(\\d+)').exec(s) || [0, 0])[1]; return { pid: +pid, rssMB: Math.round(kb('VmRSS') / 1024), hwmMB: Math.round(kb('VmHWM') / 1024) }; } catch { return null; } }).filter(Boolean);
}
const main = (rs) => rs.slice().sort((a, b) => b.rssMB - a.rssMB)[0];
module.exports = { renderers, main };

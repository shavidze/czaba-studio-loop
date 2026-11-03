import hashlib
import json
import os
import re
import sys
import urllib.request

fonts_css_path = sys.argv[1]
fonts_dir = sys.argv[2]
urls_path = sys.argv[3]
ua_path = sys.argv[4]
out_dir = sys.argv[5]

with open(ua_path, encoding='utf-8') as f:
    ua = f.read().strip()


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': ua})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def faces(css):
    out = []
    for block in re.findall(r'@font-face\s*\{(.*?)\}', css, re.S):
        fam = re.search(r"font-family:\s*'([^']+)'", block).group(1)
        wt = re.search(r'font-weight:\s*(\d+)', block).group(1)
        rng = re.search(r'unicode-range:\s*([^;]+);', block).group(1).strip()
        url = re.search(r'url\(([^)]+)\)', block).group(1).strip("'\"")
        out.append((fam, wt, rng, url))
    return out


with open(fonts_css_path, encoding='utf-8') as f:
    local = {(fam, wt, rng): url.split('/')[-1] for fam, wt, rng, url in faces(f.read())}

with open(urls_path, encoding='utf-8') as f:
    css_urls = [u.strip() for u in f if u.strip()]

os.makedirs(out_dir, exist_ok=True)
mapping = {}
kit = 0
remote_faces = 0
for i, cu in enumerate(css_urls):
    css = get(cu).decode('utf-8')
    with open(os.path.join(out_dir, f'chrome-ua-{i + 1}.css'), 'w', encoding='utf-8') as f:
        f.write(css)
    kit += css.count('/l/font?kit=')
    for fam, wt, rng, url in faces(css):
        remote_faces += 1
        key = (fam, wt, rng)
        if key not in local:
            print('UNMAPPED', fam, wt, url)
            continue
        mapping.setdefault(local[key], set()).add(url)

lines = []
same = 0
for name in sorted(mapping):
    urls = sorted(mapping[name])
    if len(urls) != 1:
        print('MULTI', name, urls)
        continue
    remote = get(urls[0])
    with open(os.path.join(fonts_dir, name), 'rb') as f:
        mine = f.read()
    ok = remote == mine
    same += ok
    lines.append(f"{'IDENTICAL' if ok else 'DIFFERS'} {name} {len(mine)} {len(remote)} {urls[0]} {hashlib.sha256(remote).hexdigest()}")

for line in lines:
    print(line)
print(f'css {len(css_urls)} faces-local {len(local)} faces-remote {remote_faces} files {len(mapping)} identical {same} kit-urls {kit}')
with open(os.path.join(out_dir, 'mapping.json'), 'w', encoding='utf-8') as f:
    json.dump({k: sorted(v) for k, v in sorted(mapping.items())}, f, indent=1)

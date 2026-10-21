Set-Location C:/Apps/czaba-project
Get-Content C:/Apps/czaba-project/tmp/studio-real-loop/all-files-security-prompt.txt -Raw | claude -p --agent security-reviewer --model claude-opus-5-5 --permission-mode acceptEdits --allowedTools 'Read,Glob,Grep,Bash' --output-format json > C:/Apps/czaba-project/tmp/studio-real-loop/all-files-security-result.json

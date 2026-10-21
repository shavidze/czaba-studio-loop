Set-Location C:/Apps/czaba-project/store
Get-Content C:/Apps/czaba-project/tmp/studio-real-loop/checkpoint-r6-review-prompt.txt -Raw | claude -p --agent code-reviewer --model claude-opus-5-5 --permission-mode acceptEdits --allowedTools 'Read,Glob,Grep' --output-format json > C:/Apps/czaba-project/tmp/studio-real-loop/checkpoint-r6-review-result.json

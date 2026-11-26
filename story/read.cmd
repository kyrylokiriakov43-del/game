@echo off
setlocal
set "draft=%~dp0drafts\seven-minutes.json"
if not "%~1"=="" set "draft=%~f1"
python "%~dp0..\tools\story.py" draft "%draft%" --play
pause

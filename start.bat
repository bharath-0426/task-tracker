@echo off
set NODE_PATH=%~dp0node
set PATH=%NODE_PATH%;%PATH%
cd /d "%~dp0task-tracker"
npm run dev
pause

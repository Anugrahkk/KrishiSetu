@echo off
title KrishiSetu Local Web Server
echo ========================================================
echo   Starting KrishiSetu (Kerala Agriculture Direct Bridge)
echo ========================================================
powershell -ExecutionPolicy Bypass -File "%~dp0start_server.ps1"
pause


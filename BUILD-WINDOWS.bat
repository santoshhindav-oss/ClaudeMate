@echo off
setlocal
cd /d "%~dp0"
echo ==========================================
echo ClaudeMate - Windows installer builder
echo ==========================================
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install Node.js 20 LTS or newer from https://nodejs.org/ and rerun this file.
  pause
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo npm was not found. Reinstall Node.js from https://nodejs.org/ and ensure npm is included.
  pause
  exit /b 1
)
node -e "const v=process.versions.node.split('.')[0]; if (+v < 20) process.exit(1)"
if errorlevel 1 (
  echo Node.js 20 or newer is required.
  pause
  exit /b 1
)
echo Installing application dependencies. Internet access is required on the first build...
call npm install --no-audit --no-fund
if errorlevel 1 goto failed
echo Building the Windows installer...
call npm run dist:win
if errorlevel 1 goto failed
echo.
echo Build complete. Open the release folder to find ClaudeMate-Setup-0.4.0-x64.exe
if exist "release\ClaudeMate-Setup-0.4.0-x64.exe" start "" "release"
pause
exit /b 0
:failed
echo.
echo Build failed. Copy the full error above and share it for troubleshooting.
pause
exit /b 1

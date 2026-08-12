@echo off
echo Creating directories...
mkdir "node_modules\electron\dist" 2>nul

echo Downloading Electron binary from mirror (this might take a minute)...
powershell -Command "Invoke-WebRequest -Uri 'https://npmmirror.com/mirrors/electron/v31.7.7/electron-v31.7.7-win32-x64.zip' -OutFile 'electron.zip'"

echo Extracting zip...
powershell -Command "Expand-Archive -Path 'electron.zip' -DestinationPath 'node_modules\electron\dist' -Force"

echo Setting path...
echo dist\electron.exe > node_modules\electron\path.txt

echo Cleaning up...
del electron.zip

echo Fix Applied Successfully! Now run 'npm run dev'.

# Troubleshooting Guide

## 1. Electron Failed to Install Correctly
**Error**: `throw new Error('Electron failed to install correctly, please delete node_modules/electron and try installing again');`

**Solution**: This happens when Windows antivirus or network issues corrupt the Electron binary download during `npm install`.
1. Open an Administrator PowerShell.
2. Run: `npx rimraf node_modules/electron`
3. Run: `npm cache clean --force`
4. Run: `npm install`

## 2. Voice Features Disabled
**Error**: The UI displays a red banner stating "Microphone access denied or pending."

**Solution**: NOVA enforces strict local privacy. If Windows OS-level microphone permissions are not granted to desktop apps, NOVA physically cannot record audio.
1. Go to Windows Settings -> Privacy -> Microphone.
2. Allow desktop apps to access your microphone.
3. Restart NOVA.

## 3. AI Access Denied (PathValidator)
**Error**: "Security Exception: Access to protected file blocked"

**Solution**: The AI attempted to read or modify a file that is on the strict security blocklist (e.g., `.env`, `.git`). This is expected behavior and proves the security sandbox is working. If you need the AI to read a secret, you must manually copy the necessary parts into a non-secret text file for it to read.

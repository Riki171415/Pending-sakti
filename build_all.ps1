$ErrorActionPreference = "Stop"
Write-Host "Starting build for ClaimAuditApp..."
npm run build
Write-Host "Building Windows and Linux executables..."
npx electron-builder --win --linux
Write-Host "Syncing Android Capacitor..."
npx cap sync android
Write-Host "Syncing iOS Capacitor..."
npx cap sync ios
Write-Host "Building Android APK..."
.\build_apk.ps1
Write-Host "All ClaimAuditApp builds finished."

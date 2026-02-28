@echo off
echo ========================================
echo   Claim Audit App - Windows Build Tool
echo ========================================
echo.

REM Cek apakah node_modules ada
if not exist "node_modules" (
    echo [1/3] Menginstal dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Gagal menginstal dependencies!
        pause
        exit /b 1
    )
) else (
    echo [1/3] Dependencies sudah tersedia.
)

echo.
echo [2/3] Build React app...
call npm run build
if errorlevel 1 (
    echo ERROR: Gagal build React app!
    pause
    exit /b 1
)

echo.
echo [3/3] Membuat installer Windows...
call npx electron-builder --win
if errorlevel 1 (
    echo ERROR: Gagal membuat installer!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   BUILD SELESAI!
echo   File installer ada di folder: dist-electron\
echo ========================================
echo.
pause

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
$SdkPath = "$env:LOCALAPPDATA\Android\Sdk"
$CmdLineToolsPath = "$SdkPath\cmdline-tools"
New-Item -ItemType Directory -Force -Path $CmdLineToolsPath | Out-Null
$ZipPath = "$env:TEMP\cmdlinetools.zip"

Write-Host "Downloading commandlinetools..."
Invoke-WebRequest -Uri "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip" -OutFile $ZipPath

Write-Host "Extracting..."
Expand-Archive -Path $ZipPath -DestinationPath $CmdLineToolsPath -Force
if (Test-Path "$CmdLineToolsPath\latest") {
    Remove-Item -Recurse -Force "$CmdLineToolsPath\latest"
}
Rename-Item -Path "$CmdLineToolsPath\cmdline-tools" -NewName "latest" -Force

$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = $SdkPath
[Environment]::SetEnvironmentVariable("JAVA_HOME", $env:JAVA_HOME, "User")
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $env:ANDROID_HOME, "User")

$SdkManager = "$CmdLineToolsPath\latest\bin\sdkmanager.bat"

Write-Host "Accepting licenses..."
1..30 | ForEach-Object { "y" } | & $SdkManager --licenses

Write-Host "Installing components..."
& $SdkManager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
Write-Host "Installation Complete!"

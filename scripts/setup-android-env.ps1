# Script to setup Android development environment
# Usage: .\scripts\setup-android-env.ps1

Write-Host "Setting up Android development environment..." -ForegroundColor Cyan

# Common Android SDK locations on Windows
$possibleSdkPaths = @(
    "$env:LOCALAPPDATA\Android\Sdk",
    "$env:USERPROFILE\AppData\Local\Android\Sdk",
    "C:\Android\Sdk",
    "$env:ANDROID_HOME"
)

$sdkPath = $null

# Check if ANDROID_HOME is already set
if ($env:ANDROID_HOME) {
    if (Test-Path $env:ANDROID_HOME) {
        $sdkPath = $env:ANDROID_HOME
        Write-Host "Found ANDROID_HOME: $sdkPath" -ForegroundColor Green
    }
}

# If not found, search in common locations
if (-not $sdkPath) {
    Write-Host "Searching for Android SDK..." -ForegroundColor Yellow
    foreach ($path in $possibleSdkPaths) {
        if ($path -and (Test-Path $path)) {
            $sdkPath = $path
            Write-Host "Found Android SDK at: $sdkPath" -ForegroundColor Green
            break
        }
    }
}

# If still not found, ask user
if (-not $sdkPath) {
    Write-Host "`nAndroid SDK not found automatically." -ForegroundColor Red
    Write-Host "Please provide the path to your Android SDK:" -ForegroundColor Yellow
    Write-Host "Common locations:" -ForegroundColor Cyan
    Write-Host "  - C:\Users\YourUsername\AppData\Local\Android\Sdk" -ForegroundColor Gray
    Write-Host "  - C:\Android\Sdk" -ForegroundColor Gray
    $sdkPath = Read-Host "Enter Android SDK path"
    
    if (-not (Test-Path $sdkPath)) {
        Write-Host "Path does not exist: $sdkPath" -ForegroundColor Red
        exit 1
    }
}

# Create local.properties file
$localPropertiesPath = "android\local.properties"
$sdkDir = $sdkPath -replace '\\', '\\'

Write-Host "`nCreating local.properties file..." -ForegroundColor Cyan
$content = "sdk.dir=$sdkDir`n"
Set-Content -Path $localPropertiesPath -Value $content -Encoding UTF8

Write-Host "Created $localPropertiesPath" -ForegroundColor Green
Write-Host "  sdk.dir=$sdkPath" -ForegroundColor Gray

# Check for adb
$adbPath = Join-Path $sdkPath "platform-tools\adb.exe"
if (Test-Path $adbPath) {
    Write-Host "`nADB found at: $adbPath" -ForegroundColor Green
    
    # Check if adb is in PATH
    $adbInPath = Get-Command adb -ErrorAction SilentlyContinue
    if (-not $adbInPath) {
        Write-Host "`nADB is not in PATH. Adding to current session..." -ForegroundColor Yellow
        $platformToolsPath = Join-Path $sdkPath "platform-tools"
        $env:Path += ";$platformToolsPath"
        Write-Host "  Added: $platformToolsPath" -ForegroundColor Gray
        Write-Host "`nTo make this permanent, add to System Environment Variables:" -ForegroundColor Cyan
        Write-Host "  $platformToolsPath" -ForegroundColor Gray
    } else {
        Write-Host "ADB is already in PATH" -ForegroundColor Green
    }
} else {
    Write-Host "`nADB not found. Make sure Android SDK Platform-Tools is installed." -ForegroundColor Yellow
}

# Suggest setting ANDROID_HOME
Write-Host "`nTip: Set ANDROID_HOME environment variable permanently:" -ForegroundColor Cyan
Write-Host "  1. Open System Properties > Environment Variables" -ForegroundColor Gray
Write-Host "  2. Add new System Variable:" -ForegroundColor Gray
Write-Host "     Name: ANDROID_HOME" -ForegroundColor Gray
Write-Host "     Value: $sdkPath" -ForegroundColor Gray
Write-Host "  3. Add to Path: %ANDROID_HOME%\platform-tools" -ForegroundColor Gray

Write-Host "`nAndroid environment setup complete!" -ForegroundColor Green


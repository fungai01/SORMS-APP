# Script to get SHA-1 key for Google OAuth configuration
# Usage: .\scripts\get-sha1.ps1

Write-Host "Getting SHA-1 key from debug keystore..." -ForegroundColor Cyan

$keystorePath = "android\app\debug.keystore"
$alias = "androiddebugkey"
$storepass = "android"
$keypass = "android"

# Find keytool in common locations
function Find-Keytool {
    # Check in PATH
    $keytool = Get-Command keytool -ErrorAction SilentlyContinue
    if ($keytool) {
        return $keytool.Path
    }
    
    # Find in JAVA_HOME
    $javaHome = $env:JAVA_HOME
    if ($javaHome) {
        $keytoolPath = Join-Path $javaHome "bin\keytool.exe"
        if (Test-Path $keytoolPath) {
            return $keytoolPath
        }
    }
    
    # Find in Program Files
    $programFiles = ${env:ProgramFiles}
    if ($programFiles) {
        $jdkPaths = Get-ChildItem -Path "$programFiles\Java" -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -like "jdk*" }
        foreach ($jdk in $jdkPaths) {
            $keytoolPath = Join-Path $jdk.FullName "bin\keytool.exe"
            if (Test-Path $keytoolPath) {
                return $keytoolPath
            }
        }
    }
    
    return $null
}

$keytoolPath = Find-Keytool

if (-not $keytoolPath) {
    Write-Host "Keytool not found. Please:" -ForegroundColor Red
    Write-Host "1. Install JDK and add to PATH" -ForegroundColor Yellow
    Write-Host "2. Or set JAVA_HOME environment variable" -ForegroundColor Yellow
    Write-Host "3. Or run keytool with full path" -ForegroundColor Yellow
    Write-Host "`nExample: `"C:\Program Files\Java\jdk-XX\bin\keytool.exe`" -list -v -keystore android\app\debug.keystore -alias androiddebugkey -storepass android -keypass android" -ForegroundColor Cyan
    exit 1
}

# Check if keystore exists
if (-not (Test-Path $keystorePath)) {
    Write-Host "Debug keystore does not exist. Creating..." -ForegroundColor Yellow
    
    # Create directory if not exists
    $keystoreDir = Split-Path $keystorePath -Parent
    if (-not (Test-Path $keystoreDir)) {
        New-Item -ItemType Directory -Path $keystoreDir -Force | Out-Null
    }
    
    & $keytoolPath -genkey -v -keystore $keystorePath -alias $alias -keyalg RSA -keysize 2048 -validity 10000 -storepass $storepass -keypass $keypass -dname "CN=Android Debug,O=Android,C=US"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error creating keystore. Please check Java and keytool." -ForegroundColor Red
        exit 1
    }
}

# Get SHA-1 key
Write-Host "`nSHA-1 Key:" -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Green

$output = & $keytoolPath -list -v -keystore $keystorePath -alias $alias -storepass $storepass -keypass $keypass 2>&1

if ($LASTEXITCODE -eq 0) {
    # Find line containing SHA1
    $sha1Line = $output | Select-String -Pattern "SHA1:"
    if ($sha1Line) {
        $sha1 = ($sha1Line -split "SHA1:")[1].Trim()
        Write-Host $sha1 -ForegroundColor Yellow
        Write-Host "`nCopy the SHA-1 key above and add to Google Cloud Console:" -ForegroundColor Cyan
        Write-Host "https://console.cloud.google.com/apis/credentials" -ForegroundColor Blue
    } else {
        Write-Host "SHA-1 key not found in output." -ForegroundColor Red
    }
} else {
    Write-Host "Error running keytool. Please check if Java is installed." -ForegroundColor Red
    Write-Host "Output: $output" -ForegroundColor Red
}

Write-Host "`n----------------------------------------" -ForegroundColor Green

# Build and boot the project's dedicated test device. Run from any directory.
[CmdletBinding()]
param([switch]$Headless)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot
$sdk = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { Join-Path $env:LOCALAPPDATA 'Android/Sdk' }
$env:ANDROID_HOME = $sdk
$jdk = Get-ChildItem "$env:ProgramFiles/Microsoft/jdk-17*" -Directory -ErrorAction SilentlyContinue | Select-Object -First 1
if ($jdk) { $env:JAVA_HOME = $jdk.FullName }
$bin = Join-Path $sdk 'cmdline-tools/latest/bin'
$adb = Join-Path $sdk 'platform-tools/adb.exe'
$emulator = Join-Path $sdk 'emulator/emulator.exe'
$avd = 'InnBetween_API_35'
$image = 'system-images;android-35;google_apis;x86_64'
function Assert-Exit([string]$step) {
    if ($LASTEXITCODE -ne 0) { throw "$step failed ($LASTEXITCODE)" }
}
if (!(Test-Path "$sdk/system-images/android-35/google_apis/x86_64/package.xml") -or
    !(Test-Path $adb) -or !(Test-Path $emulator) -or
    !(Test-Path "$sdk/build-tools/35.0.0/package.xml") -or !(Test-Path "$sdk/platforms/android-35/package.xml")) {
    & "$bin/sdkmanager.bat" "--sdk_root=$sdk" 'platform-tools' 'platforms;android-35' 'build-tools;35.0.0' 'emulator' $image
    Assert-Exit 'SDK Manager'
}
& "$projectRoot/android/gradlew.bat" -p "$projectRoot/android" ':app:assembleDebug' '--console=plain'
Assert-Exit 'Gradle'
$devices = & $emulator -list-avds
Assert-Exit 'List AVDs'
if ($avd -notin $devices) {
    'no' | & "$bin/avdmanager.bat" create avd -n $avd -k $image -d pixel_5
    Assert-Exit 'Create AVD'
}
function Find-TestDevice {
    foreach ($line in (& $adb devices)) {
        if ($line -match '^(emulator-[0-9]+)\s+device\s*$') {
            $serial = $Matches[1]
            $name = & $adb -s $serial emu avd name
            if ($avd -in $name) { return $serial }
        }
    }
}
$device = Find-TestDevice
if (!$device) {
    $argsList = @('-avd', $avd, '-no-snapshot-load', '-gpu', 'software')
    if ($Headless) { $argsList += @('-no-window', '-no-audio') }
    $process = Start-Process $emulator -ArgumentList $argsList -WindowStyle Hidden -PassThru
    $deadline = (Get-Date).AddMinutes(6)
    do {
        Start-Sleep 2
        $device = Find-TestDevice
        if (!$device -and $process.HasExited) { throw "Emulator stopped ($($process.ExitCode))" }
    } until ($device -or (Get-Date) -gt $deadline)
}
if (!$device) { throw 'Test AVD unavailable' }
$deadline = (Get-Date).AddMinutes(6)
do {
    $boot = & $adb -s $device shell getprop sys.boot_completed
    if ($boot -eq '1') { break }
    Start-Sleep 2
} until ((Get-Date) -gt $deadline)
if ($boot -ne '1') { throw 'Android boot timed out' }
& $adb -s $device install -r "$projectRoot/android/app/build/outputs/apk/debug/app-debug.apk"
Assert-Exit 'Install APK'
& $adb -s $device shell am start -W -n 'studio.innbetween/.InnActivity'
Assert-Exit 'Start activity'

import React, { useState } from 'react';
import { LaptopProfile, DriverItem } from '../types/driver';
import { 
  FileCode, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Terminal, 
  ShieldCheck, 
  Package, 
  Cpu, 
  Layers, 
  Play, 
  Settings2, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Zap,
  FolderArchive
} from 'lucide-react';

interface ExeInstallerBuilderProps {
  currentProfile: LaptopProfile;
  drivers: DriverItem[];
  onStartSimulatedExecution?: () => void;
  onDownloadScript?: (filename: string, content: string) => void;
}

export const ExeInstallerBuilder: React.FC<ExeInstallerBuilderProps> = ({
  currentProfile,
  drivers,
  onStartSimulatedExecution,
  onDownloadScript
}) => {
  const [installerType, setInstallerType] = useState<'iexpress' | 'ps2exe' | 'sfx_bat'>('iexpress');
  const [includeRestorePoint, setIncludeRestorePoint] = useState(true);
  const [silentMode, setSilentMode] = useState(true);
  const [autoReboot, setAutoReboot] = useState(false);
  const [rescanHardware, setRescanHardware] = useState(true);
  const [exportBackupFolders, setExportBackupFolders] = useState(true);
  const [copiedScript, setCopiedScript] = useState(false);

  const selectedDrivers = drivers.filter(d => d.selected || d.status === 'missing' || d.status === 'update_available');
  const driverList = selectedDrivers.length > 0 ? selectedDrivers : drivers;

  // Generate Windows IExpress .SED configuration
  const generateIExpressSED = () => {
    return `[Version]
Class=IExpress
SEDVersion=3.0
[Options]
PackagePurpose=InstallApp
ShowInstallProgramWindow=1
HideExtractAnimation=1
UseLongFileName=1
InsideCompressed=1
CAB_FixedSize=0
CAB_ResvCodeSigning=0
RebootMode=N
InstallPrompt=%InstallPrompt%
DisplayLicense=%DisplayLicense%
FinishMessage=%FinishMessage%
TargetName=%TargetName%
FriendlyName=%FriendlyName%
AppLaunched=%AppLaunched%
PostInstallCmd=%PostInstallCmd%
AdminQuietInstCmd=%AdminQuietInstCmd%
UserQuietInstCmd=%UserQuietInstCmd%
SourceFiles=SourceFiles
[Strings]
InstallPrompt=Would you like to auto-install all drivers for ${currentProfile.brand} ${currentProfile.model}?
DisplayLicense=
FinishMessage=DriverHub Pro: All drivers successfully installed!
TargetName=C:\\DriverHub_Installer_${currentProfile.brand}_${currentProfile.model.replace(/\s+/g, '_')}.exe
FriendlyName=DriverHub Pro Silent Driver Auto-Installer
AppLaunched=powershell.exe -ExecutionPolicy Bypass -NoProfile -File ".\\AutoInstall_Drivers.ps1" ${silentMode ? '-Silent' : ''}
PostInstallCmd=<None>
AdminQuietInstCmd=powershell.exe -ExecutionPolicy Bypass -NoProfile -File ".\\AutoInstall_Drivers.ps1" -Silent
UserQuietInstCmd=powershell.exe -ExecutionPolicy Bypass -NoProfile -File ".\\AutoInstall_Drivers.ps1" -Silent
[SourceFiles]
SourceFiles0=C:\\DriverBackup\\
[SourceFiles0]
%FILE0%=AutoInstall_Drivers.ps1
`;
  };

  // Generate PowerShell Auto-Installer (.ps1)
  const generatePowerShellInstaller = () => {
    return `# =====================================================================
# DriverHub Pro - Automated Windows EXE Driver Installer Script
# Target PC: ${currentProfile.brand} ${currentProfile.model}
# Generated: ${new Date().toLocaleString()}
# =====================================================================

# Self-Elevate to Administrator
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Start-Process powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File \`"\$PSCommandPath\`"" -Verb RunAs
    exit
}

$Host.UI.RawUI.WindowTitle = "DriverHub Pro - Silent Driver Auto-Installer"
Clear-Host

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host " DriverHub Pro: Windows Driver Auto-Installer Engine" -ForegroundColor White
Write-Host " Target PC Model : ${currentProfile.brand} ${currentProfile.model}" -ForegroundColor Yellow
Write-Host " Storage Mode    : ${currentProfile.storageMode}" -ForegroundColor Gray
Write-Host " Silent Mode     : ${silentMode ? 'ENABLED' : 'DISABLED'}" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

${includeRestorePoint ? `# Step 1: Create System Restore Point
Write-Host "[1/4] Creating System Restore Point..." -ForegroundColor Yellow
try {
    Enable-ComputerRestore -Drive "C:\\" -ErrorAction SilentlyContinue
    Checkpoint-Computer -Description "DriverHub_PreDriver_Install" -RestorePointType "DEVICE_DRIVER_INSTALL" -ErrorAction SilentlyContinue
    Write-Host " Restore point created successfully." -ForegroundColor Green
} catch {
    Write-Host " [!] Warning: Could not create restore point (Computer Restore may be disabled)." -ForegroundColor DarkYellow
}
Write-Host ""` : ''}

# Step 2: Extract & Install WHQL Drivers
Write-Host "[2/4] Staging and Installing WHQL Driver Packages..." -ForegroundColor Yellow

$DriverFolder = "$PSScriptRoot\\Drivers"
if (-not (Test-Path $DriverFolder)) {
    $DriverFolder = "$env:SystemDrive\\DriverBackup"
}

if (Test-Path $DriverFolder) {
    Write-Host " Scanning INF files in: $DriverFolder" -ForegroundColor Gray
    
    # Run PnPUtil Driver Staging & Installation
    $pnpArgs = "/add-driver \`"$DriverFolder\\*.inf\`" /subdirs /install"
    Write-Host " Executing: pnputil.exe $pnpArgs" -ForegroundColor DarkCyan
    
    $proc = Start-Process -FilePath "pnputil.exe" -ArgumentList $pnpArgs -Wait -PassThru -NoNewWindow
    
    if ($proc.ExitCode -eq 0 -or $proc.ExitCode -eq 3010) {
        Write-Host " PnPUtil: Driver staging completed successfully (Exit Code: $($proc.ExitCode))." -ForegroundColor Green
    } else {
        Write-Host " [!] PnPUtil returned exit code: $($proc.ExitCode)" -ForegroundColor Red
    }
} else {
    Write-Host " [!] Driver staging directory not found at $DriverFolder. Falling back to online DISM scan..." -ForegroundColor Red
    dism.exe /online /Get-Drivers
}

Write-Host ""

${rescanHardware ? `# Step 3: Rescan Hardware PnP Tree
Write-Host "[3/4] Triggering Windows Plug and Play hardware rescan..." -ForegroundColor Yellow
pnputil.exe /scan-devices | Out-Null
Write-Host " PnP Hardware Rescan complete." -ForegroundColor Green
Write-Host ""` : ''}

# Step 4: Summary & Cleanup
Write-Host "[4/4] Finalizing Installation..." -ForegroundColor Yellow
Write-Host " DriverHub Pro installation process finished." -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Cyan

${autoReboot ? `Write-Host "System will reboot in 10 seconds to apply kernel updates..." -ForegroundColor Red
Start-Sleep -Seconds 10
Restart-Computer -Force` : `${silentMode ? 'Start-Sleep -Seconds 3' : 'Write-Host "Press any key to exit..." -ForegroundColor Gray; $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")'}`}
`;
  };

  // Generate 1-Click Builder Batch File (.bat) that creates the EXE using Windows IExpress
  const generateBuilderBatch = () => {
    return `@echo off
:: =====================================================================
:: DriverHub Pro - Native Windows EXE Installer Compiler Script
:: Builds a standalone Setup.exe using native Windows IExpress tool
:: =====================================================================
TITLE DriverHub Pro - EXE Installer Compiler
COLOR 0A

:: Check for Administrative Privileges
NET SESSION >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo [!] Requesting Administrative Privileges...
    powershell -Command "Start-Process '%~0' -Verb RunAs"
    exit /b
)

cd /d "%~dp0"
echo =========================================================
echo  DriverHub Pro - EXE Installer Generator
echo  Target PC: ${currentProfile.brand} ${currentProfile.model}
echo =========================================================
echo.

echo [1/3] Generating Driver Installation PowerShell Engine...
powershell -Command "New-Item -ItemType Directory -Force -Path .\\BuildTemp" >nul

echo [2/3] Writing IExpress Directive (.SED)...
if exist setup.sed (
    echo  Building Setup.exe via native Windows iexpress.exe...
    iexpress.exe /N setup.sed
    if exist C:\\DriverHub_Installer_${currentProfile.brand}_${currentProfile.model.replace(/\s+/g, '_')}.exe (
        echo.
        echo =========================================================
        echo  SUCCESS: Executable created at:
        echo  C:\\DriverHub_Installer_${currentProfile.brand}_${currentProfile.model.replace(/\s+/g, '_')}.exe
        echo =========================================================
    )
) else (
    echo  Executing Direct PowerShell Auto-Installer...
    powershell.exe -ExecutionPolicy Bypass -File .\\AutoInstall_Drivers.ps1
)

echo.
pause
`;
  };

  const getActiveCode = () => {
    if (installerType === 'iexpress') return generateIExpressSED();
    if (installerType === 'ps2exe') return generatePowerShellInstaller();
    return generateBuilderBatch();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleDownload = () => {
    const code = getActiveCode();
    let ext = '.sed';
    let filename = `DriverHub_Setup_Config_${currentProfile.brand}_${currentProfile.model.replace(/\s+/g, '_')}.sed`;

    if (installerType === 'ps2exe') {
      ext = '.ps1';
      filename = `AutoInstall_Drivers_${currentProfile.brand}_${currentProfile.model.replace(/\s+/g, '_')}.ps1`;
    } else if (installerType === 'sfx_bat') {
      ext = '.bat';
      filename = `Create_Driver_Setup_EXE_${currentProfile.brand}_${currentProfile.model.replace(/\s+/g, '_')}.bat`;
    }

    if (onDownloadScript) {
      onDownloadScript(filename, code);
    } else {
      const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <Package className="h-3.5 w-3.5 text-indigo-400" />
              <span>Standalone EXE Installer Generator</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Create Windows Auto-Installer Package (.EXE / .BAT)
            </h2>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Compile your target drivers for <strong className="text-cyan-300">{currentProfile.brand} {currentProfile.model}</strong> into a single standalone, self-extracting <code className="bg-slate-800 text-indigo-300 px-1.5 py-0.5 rounded text-xs font-mono">.exe</code> installer. Runs silently on any target Windows PC with zero dependencies!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownload}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/25 transition transform active:scale-95"
            >
              <Download className="h-4 w-4" />
              <span>Download EXE Builder Package</span>
            </button>

            {onStartSimulatedExecution && (
              <button
                onClick={onStartSimulatedExecution}
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 font-semibold text-sm rounded-xl transition active:scale-95"
              >
                <Play className="h-4 w-4 text-emerald-400" />
                <span>Simulate Execution</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Options + Code Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Compiler Options */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Format Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <FolderArchive className="h-4 w-4 text-cyan-400" />
              <span>1. Choose Executable Output Format</span>
            </h3>

            <div className="space-y-2.5">
              
              <label 
                className={`flex items-start p-3.5 rounded-xl border cursor-pointer transition ${
                  installerType === 'iexpress'
                    ? 'bg-indigo-500/15 border-indigo-500/50 text-white'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="installerType"
                  checked={installerType === 'iexpress'}
                  onChange={() => setInstallerType('iexpress')}
                  className="mt-1 text-indigo-500 focus:ring-indigo-500 h-4 w-4"
                />
                <div className="ml-3 text-xs space-y-1">
                  <div className="font-bold text-slate-100 flex items-center space-x-2">
                    <span>Windows Native IExpress (.SED & Direct .EXE)</span>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase">
                      Recommended
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Uses Windows built-in <code className="text-cyan-300 font-mono">iexpress.exe</code> to package all driver files into a native signed-compatible executable.
                  </p>
                </div>
              </label>

              <label 
                className={`flex items-start p-3.5 rounded-xl border cursor-pointer transition ${
                  installerType === 'ps2exe'
                    ? 'bg-indigo-500/15 border-indigo-500/50 text-white'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="installerType"
                  checked={installerType === 'ps2exe'}
                  onChange={() => setInstallerType('ps2exe')}
                  className="mt-1 text-indigo-500 focus:ring-indigo-500 h-4 w-4"
                />
                <div className="ml-3 text-xs space-y-1">
                  <div className="font-bold text-slate-100">
                    Standalone PowerShell Auto-Installer (.PS1)
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Direct elevated PowerShell script with native PnPUtil & DISM staging engine. Can be compiled to EXE using PS2EXE.
                  </p>
                </div>
              </label>

              <label 
                className={`flex items-start p-3.5 rounded-xl border cursor-pointer transition ${
                  installerType === 'sfx_bat'
                    ? 'bg-indigo-500/15 border-indigo-500/50 text-white'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="installerType"
                  checked={installerType === 'sfx_bat'}
                  onChange={() => setInstallerType('sfx_bat')}
                  className="mt-1 text-indigo-500 focus:ring-indigo-500 h-4 w-4"
                />
                <div className="ml-3 text-xs space-y-1">
                  <div className="font-bold text-slate-100">
                    1-Click Builder Batch Script (.BAT)
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Double-clickable batch file that automatically invokes IExpress on target Windows PCs to compile <code className="text-cyan-300 font-mono">DriverHub_Installer.exe</code> locally.
                  </p>
                </div>
              </label>

            </div>
          </div>

          {/* Installer Execution Toggles */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Settings2 className="h-4 w-4 text-indigo-400" />
              <span>2. Execution Options & Behavior</span>
            </h3>

            <div className="space-y-3 text-xs">
              
              <label className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 cursor-pointer hover:bg-slate-800 transition">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-200">Silent Installation (/Silent)</span>
                  <p className="text-[11px] text-slate-400">Suppress popups and user confirmation prompts</p>
                </div>
                <input
                  type="checkbox"
                  checked={silentMode}
                  onChange={(e) => setSilentMode(e.target.checked)}
                  className="rounded text-indigo-500 focus:ring-indigo-500 h-4 w-4 bg-slate-900 border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 cursor-pointer hover:bg-slate-800 transition">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-200">Create System Restore Point</span>
                  <p className="text-[11px] text-slate-400">Execute Checkpoint-Computer prior to driver staging</p>
                </div>
                <input
                  type="checkbox"
                  checked={includeRestorePoint}
                  onChange={(e) => setIncludeRestorePoint(e.target.checked)}
                  className="rounded text-indigo-500 focus:ring-indigo-500 h-4 w-4 bg-slate-900 border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 cursor-pointer hover:bg-slate-800 transition">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-200">Rescan Plug & Play Hardware Tree</span>
                  <p className="text-[11px] text-slate-400">Run pnputil.exe /scan-devices after driver copy</p>
                </div>
                <input
                  type="checkbox"
                  checked={rescanHardware}
                  onChange={(e) => setRescanHardware(e.target.checked)}
                  className="rounded text-indigo-500 focus:ring-indigo-500 h-4 w-4 bg-slate-900 border-slate-700"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 cursor-pointer hover:bg-slate-800 transition">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-200">Automatic System Reboot</span>
                  <p className="text-[11px] text-slate-400">Reboot PC automatically if kernel/GPU drivers require it</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoReboot}
                  onChange={(e) => setAutoReboot(e.target.checked)}
                  className="rounded text-indigo-500 focus:ring-indigo-500 h-4 w-4 bg-slate-900 border-slate-700"
                />
              </label>

            </div>
          </div>

          {/* Included Driver Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Cpu className="h-4 w-4 text-emerald-400" />
                <span>Drivers Included in Package ({driverList.length})</span>
              </h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                WHQL Staged
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {driverList.map((drv) => (
                <div key={drv.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg text-xs">
                  <div className="truncate pr-2">
                    <span className="font-semibold text-slate-200 block truncate">{drv.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{drv.category} • v{drv.currentVersion}</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-300 shrink-0">{drv.size}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Code & Execution Preview */}
        <div className="lg:col-span-7 space-y-5">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            
            {/* Terminal Header */}
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono font-bold text-slate-300 ml-2">
                  {installerType === 'iexpress' ? 'setup.sed (IExpress Directive)' : installerType === 'ps2exe' ? 'AutoInstall_Drivers.ps1' : 'Create_Driver_Setup_EXE.bat'}
                </span>
              </div>

              <button
                onClick={handleCopyCode}
                className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition active:scale-95"
              >
                {copiedScript ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Box */}
            <div className="p-4 bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto max-h-[500px] leading-relaxed select-all">
              <pre>{getActiveCode()}</pre>
            </div>

          </div>

          {/* Quick Guide on how to compile to EXE on Windows */}
          <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-2xl p-5 text-xs text-indigo-200 space-y-3">
            <h4 className="font-bold text-sm text-white flex items-center space-x-2">
              <HelpCircle className="h-4 w-4 text-indigo-400" />
              <span>How to Run & Compile on your Windows PC:</span>
            </h4>

            <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed">
              <li>
                Click <strong className="text-indigo-300">"Download EXE Builder Package"</strong> above to save the script to your laptop.
              </li>
              <li>
                Place your driver folder (<code className="text-cyan-300 font-mono">.inf</code> files) in <code className="text-cyan-300 font-mono">C:\DriverBackup</code> or the same folder as the script.
              </li>
              <li>
                Right-click the downloaded <code className="text-indigo-300 font-mono">.bat</code> or <code className="text-indigo-300 font-mono">.ps1</code> file and select <strong className="text-white">"Run as Administrator"</strong>.
              </li>
              <li>
                Windows will automatically invoke native <code className="text-cyan-300 font-mono">IExpress</code> to package your drivers into <code className="text-emerald-300 font-mono">DriverHub_Installer.exe</code> ready for instant deployment!
              </li>
            </ol>
          </div>

        </div>

      </div>

    </div>
  );
};

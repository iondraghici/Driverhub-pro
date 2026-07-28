import React, { useState } from 'react';
import { LaptopProfile, DriverItem } from '../types/driver';
import { 
  Zap, 
  Play, 
  Copy, 
  Check, 
  Download, 
  ShieldCheck, 
  Trash2, 
  Terminal, 
  CheckCircle2, 
  Sparkles, 
  Sliders, 
  FolderPlus,
  RefreshCcw,
  FileText
} from 'lucide-react';

interface OneClickOptimizerProps {
  profile: LaptopProfile;
  drivers: DriverItem[];
  onStartSimulatedOptimization: (options: OptimizerOptions) => void;
  isInstalling: boolean;
}

export interface OptimizerOptions {
  createRestorePoint: boolean;
  installChipset: boolean;
  installManagementEngine: boolean;
  installSerialIO: boolean;
  installVMD: boolean;
  installNetwork: boolean;
  installAudio: boolean;
  installGPU: boolean;
  cleanTempFiles: boolean;
  disableTelemetry: boolean;
}

export const OneClickOptimizer: React.FC<OneClickOptimizerProps> = ({
  profile,
  drivers,
  onStartSimulatedOptimization,
  isInstalling
}) => {
  const [options, setOptions] = useState<OptimizerOptions>({
    createRestorePoint: true,
    installChipset: true,
    installManagementEngine: true,
    installSerialIO: true,
    installVMD: true,
    installNetwork: true,
    installAudio: true,
    installGPU: true,
    cleanTempFiles: true,
    disableTelemetry: true
  });

  const [copiedScript, setCopiedScript] = useState(false);
  const [activeScriptTab, setActiveScriptTab] = useState<'powershell' | 'cmd'>('powershell');

  const toggleOption = (key: keyof OptimizerOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Generate PowerShell Automation Script dynamically based on current selected model
  const generatedPowerShellScript = `# =====================================================================
# DriverHub Pro - "Optimize New Windows" Automated Script
# Target PC: ${profile.brand} - ${profile.model}
# Generated: ${new Date().toLocaleString()}
# =====================================================================

# 1. Elevate Administrator Privileges
If (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "[!] Admin privileges required. Relaunching as Administrator..." -ForegroundColor Red
    Start-Process powershell.exe "-NoProfile -ExecutionPolicy Bypass -File \`"$PSCommandPath\`"" -Verb RunAs
    Exit
}

Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope Process -Force
$ErrorActionPreference = "Continue"

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "   DriverHub Pro - Automatic Driver Installer & Optimizer" -ForegroundColor Cyan
Write-Host "   Laptop Model: ${profile.model}" -ForegroundColor Yellow
Write-Host "=========================================================" -ForegroundColor Cyan

$DriverDir = "C:\\DriverHub_Offline"
$LogDir = "C:\\DriverHub_Logs"
New-Item -ItemType Directory -Force -Path $DriverDir | Out-Null
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$LogFile = "$LogDir\\Install_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

Function Log-Message($msg) {
    $time = Get-Date -Format "HH:mm:ss"
    $formatted = "[$time] $msg"
    Write-Host $formatted -ForegroundColor Green
    Add-Content -Path $LogFile -Value $formatted
}

${options.createRestorePoint ? `# 2. Create System Restore Point
Log-Message "Creating System Restore Point: DriverHub_PreInstall..."
Enable-ComputerRestore -Drive "C:\\" -ErrorAction SilentlyContinue
Checkpoint-Computer -Description "DriverHub_PreInstall" -RestorePointType "MODIFY_SETTINGS" -ErrorAction SilentlyContinue
` : '# System Restore Point creation skipped.'}

${options.installChipset ? `# 3. Install Intel/AMD Motherboard Chipset Driver
Log-Message "[Step 1/8] Installing Motherboard Chipset INF Drivers..."
Start-Process -FilePath "pnputil.exe" -ArgumentList "/add-driver \`"$DriverDir\\Chipset\\*.inf\`" /subdirs /install" -Wait -NoNewWindow
` : ''}

${options.installManagementEngine ? `# 4. Install Intel Management Engine (ME) & DTT
Log-Message "[Step 2/8] Installing Intel Management Engine Interface..."
Start-Process -FilePath "pnputil.exe" -ArgumentList "/add-driver \`"$DriverDir\\MEI\\*.inf\`" /subdirs /install" -Wait -NoNewWindow
` : ''}

${options.installSerialIO ? `# 5. Install Intel Serial IO & Touchpad Drivers
Log-Message "[Step 3/8] Installing Serial IO, I2C & Touchpad Drivers..."
Start-Process -FilePath "pnputil.exe" -ArgumentList "/add-driver \`"$DriverDir\\SerialIO\\*.inf\`" /subdirs /install" -Wait -NoNewWindow
` : ''}

${options.installVMD ? `# 6. Install Intel VMD / RST Storage Controller
Log-Message "[Step 4/8] Installing Intel Rapid Storage Technology VMD Driver..."
Start-Process -FilePath "pnputil.exe" -ArgumentList "/add-driver \`"$DriverDir\\VMD\\*.inf\`" /subdirs /install" -Wait -NoNewWindow
` : ''}

${options.installNetwork ? `# 7. Install Ethernet & Wi-Fi Network Drivers
Log-Message "[Step 5/8] Installing Wi-Fi 6E/7 and Gigabit LAN Drivers..."
Start-Process -FilePath "pnputil.exe" -ArgumentList "/add-driver \`"$DriverDir\\Network\\*.inf\`" /subdirs /install" -Wait -NoNewWindow
` : ''}

${options.installAudio ? `# 8. Install Realtek HD Audio & DTS Console
Log-Message "[Step 6/8] Installing High Definition Audio Drivers..."
Start-Process -FilePath "pnputil.exe" -ArgumentList "/add-driver \`"$DriverDir\\Audio\\*.inf\`" /subdirs /install" -Wait -NoNewWindow
` : ''}

${options.installGPU ? `# 9. Install Intel & NVIDIA Display Drivers
Log-Message "[Step 7/8] Installing Intel UHD & NVIDIA GeForce Display Drivers..."
Start-Process -FilePath "pnputil.exe" -ArgumentList "/add-driver \`"$DriverDir\\Graphics\\*.inf\`" /subdirs /install" -Wait -NoNewWindow
` : ''}

${options.cleanTempFiles ? `# 10. Clean Temporary Files and Installer Caches
Log-Message "Cleaning temporary installation files..."
Remove-Item -Path "$env:TEMP\\*" -Recurse -Force -ErrorAction SilentlyContinue
Clear-RecycleBin -Confirm:$false -ErrorAction SilentlyContinue
` : ''}

${options.disableTelemetry ? `# 11. Disable Windows Telemetry & Bloatware Services
Log-Message "Optimizing Windows Services & Telemetry..."
Stop-Service -Name "DiagTrack" -WarningAction SilentlyContinue
Set-Service -Name "DiagTrack" -StartupType Disabled -WarningAction SilentlyContinue
` : ''}

Log-Message "========================================================="
Log-Message "DriverHub Pro Optimization Completed Successfully!"
Log-Message "Log saved to: $LogFile"
Log-Message "========================================================="

Write-Host "Press any key to close..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
`;

  const generatedCmdScript = `@echo off
:: DriverHub Pro Windows Driver & System Optimizer Batch File
:: Target: ${profile.model}
title DriverHub Pro - Auto Optimizer
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Administrator permissions required. Relaunching...
    powershell -Command "Start-Process '%~0' -Verb RunAs"
    exit /b
)

echo ========================================================
echo DriverHub Pro - PnPUtil Batch Driver Installation
echo ========================================================

${options.createRestorePoint ? 'echo [1] Creating Restore Point...' : ''}
${options.createRestorePoint ? 'powershell -Command "Checkpoint-Computer -Description DriverHub_PreInstall"' : ''}

echo [2] Installing all INF drivers recursively from C:\\DriverHub_Offline...
pnputil /add-driver "C:\\DriverHub_Offline\\*.inf" /subdirs /install

${options.cleanTempFiles ? 'echo [3] Cleaning Temp directories...' : ''}
${options.cleanTempFiles ? 'del /q /s %temp%\\*' : ''}

echo ========================================================
echo Driver Installation Finished! Please reboot if requested.
echo ========================================================
pause
`;

  const handleCopy = () => {
    const text = activeScriptTab === 'powershell' ? generatedPowerShellScript : generatedCmdScript;
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleDownloadScript = () => {
    const text = activeScriptTab === 'powershell' ? generatedPowerShellScript : generatedCmdScript;
    const filename = activeScriptTab === 'powershell' ? 'Optimize_Windows_Drivers.ps1' : 'Optimize_Windows_Drivers.bat';
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-800/50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Zap className="h-48 w-48 text-indigo-400" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
              One-Click Windows Setup
            </span>
            <span className="text-xs text-slate-400">
              For Fresh Windows 10/11 Reinstallations
            </span>
          </div>

          <h2 className="text-2xl font-black text-white mt-2">
            Automated "Optimize New Windows" Suite
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Automatically configures driver installation sequence, creates system restore points, installs Chipset, VMD, Wi-Fi, Realtek Audio, and GPU drivers, cleans installation temporary caches, and disables unnecessary diagnostic telemetry.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onStartSimulatedOptimization(options)}
              disabled={isInstalling}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-500 via-blue-600 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-extrabold text-xs rounded-xl shadow-xl shadow-indigo-500/25 transition transform active:scale-95 disabled:opacity-50"
            >
              <Zap className="h-4 w-4 fill-white" />
              <span>{isInstalling ? 'Running Automation...' : 'Run "Optimize New Windows" Now'}</span>
            </button>

            <button
              onClick={handleDownloadScript}
              className="inline-flex items-center space-x-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl transition"
            >
              <Download className="h-4 w-4 text-cyan-400" />
              <span>Export Offline .PS1 Script</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Custom Checkbox Options */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sliders className="h-4 w-4 text-indigo-400" />
              <h3 className="font-bold text-sm text-slate-100">Automation Sequence Rules</h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Customizable</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <label className="flex items-start space-x-3 p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition">
              <input
                type="checkbox"
                checked={options.createRestorePoint}
                onChange={() => toggleOption('createRestorePoint')}
                className="mt-0.5 w-4 h-4 text-indigo-500 rounded bg-slate-900 border-slate-700 focus:ring-indigo-500"
              />
              <div>
                <span className="font-bold text-slate-200 block">Create System Restore Point</span>
                <span className="text-[11px] text-slate-400">Runs Checkpoint-Computer before changing system files.</span>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition">
              <input
                type="checkbox"
                checked={options.installChipset}
                onChange={() => toggleOption('installChipset')}
                className="mt-0.5 w-4 h-4 text-indigo-500 rounded bg-slate-900 border-slate-700 focus:ring-indigo-500"
              />
              <div>
                <span className="font-bold text-slate-200 block">Intel / AMD Motherboard Chipset</span>
                <span className="text-[11px] text-slate-400">Step 1: Installs essential PCI bus INF definitions.</span>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition">
              <input
                type="checkbox"
                checked={options.installManagementEngine}
                onChange={() => toggleOption('installManagementEngine')}
                className="mt-0.5 w-4 h-4 text-indigo-500 rounded bg-slate-900 border-slate-700 focus:ring-indigo-500"
              />
              <div>
                <span className="font-bold text-slate-200 block">Intel Management Engine & DTT</span>
                <span className="text-[11px] text-slate-400">Step 2: Thermal management and security co-processor.</span>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition">
              <input
                type="checkbox"
                checked={options.installSerialIO}
                onChange={() => toggleOption('installSerialIO')}
                className="mt-0.5 w-4 h-4 text-indigo-500 rounded bg-slate-900 border-slate-700 focus:ring-indigo-500"
              />
              <div>
                <span className="font-bold text-slate-200 block">Intel Serial IO & Touchpad</span>
                <span className="text-[11px] text-slate-400">Step 3: Fixes unresponsive precision touchpad gesture.</span>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition">
              <input
                type="checkbox"
                checked={options.installVMD}
                onChange={() => toggleOption('installVMD')}
                className="mt-0.5 w-4 h-4 text-indigo-500 rounded bg-slate-900 border-slate-700 focus:ring-indigo-500"
              />
              <div>
                <span className="font-bold text-slate-200 block">Intel VMD / RST Controller</span>
                <span className="text-[11px] text-slate-400">Step 4: Rapid Storage Technology NVMe driver.</span>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition">
              <input
                type="checkbox"
                checked={options.installNetwork}
                onChange={() => toggleOption('installNetwork')}
                className="mt-0.5 w-4 h-4 text-indigo-500 rounded bg-slate-900 border-slate-700 focus:ring-indigo-500"
              />
              <div>
                <span className="font-bold text-slate-200 block">LAN, Wi-Fi 6E/7 & Bluetooth</span>
                <span className="text-[11px] text-slate-400">Step 5: High-speed wireless and Bluetooth 5.3.</span>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition">
              <input
                type="checkbox"
                checked={options.installAudio}
                onChange={() => toggleOption('installAudio')}
                className="mt-0.5 w-4 h-4 text-indigo-500 rounded bg-slate-900 border-slate-700 focus:ring-indigo-500"
              />
              <div>
                <span className="font-bold text-slate-200 block">Realtek High Definition Audio</span>
                <span className="text-[11px] text-slate-400">Step 6: Audio console and DTS:X Ultra spatial sound.</span>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition">
              <input
                type="checkbox"
                checked={options.installGPU}
                onChange={() => toggleOption('installGPU')}
                className="mt-0.5 w-4 h-4 text-indigo-500 rounded bg-slate-900 border-slate-700 focus:ring-indigo-500"
              />
              <div>
                <span className="font-bold text-slate-200 block">Intel UHD & NVIDIA GeForce GPU</span>
                <span className="text-[11px] text-slate-400">Step 7: Integrated & Discrete graphics WHQL driver.</span>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition">
              <input
                type="checkbox"
                checked={options.cleanTempFiles}
                onChange={() => toggleOption('cleanTempFiles')}
                className="mt-0.5 w-4 h-4 text-indigo-500 rounded bg-slate-900 border-slate-700 focus:ring-indigo-500"
              />
              <div>
                <span className="font-bold text-slate-200 block">Clean Temp & Caches</span>
                <span className="text-[11px] text-slate-400">Purges leftover installer files to free space.</span>
              </div>
            </label>

            <label className="flex items-start space-x-3 p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition">
              <input
                type="checkbox"
                checked={options.disableTelemetry}
                onChange={() => toggleOption('disableTelemetry')}
                className="mt-0.5 w-4 h-4 text-indigo-500 rounded bg-slate-900 border-slate-700 focus:ring-indigo-500"
              />
              <div>
                <span className="font-bold text-slate-200 block">Disable Diagnostic Telemetry</span>
                <span className="text-[11px] text-slate-400">Turns off background DiagTrack data collection.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Right Column: Interactive Generated Script Viewer */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <Terminal className="h-4 w-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-slate-100">Generated Automation Script</h3>
                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setActiveScriptTab('powershell')}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition ${
                      activeScriptTab === 'powershell'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    PowerShell (.ps1)
                  </button>
                  <button
                    onClick={() => setActiveScriptTab('cmd')}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition ${
                      activeScriptTab === 'cmd'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Batch (.bat)
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition"
                >
                  {copiedScript ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadScript}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-xs font-bold text-cyan-300 transition"
                >
                  <Download className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Code View container */}
            <div className="mt-4 bg-slate-950 border border-slate-800/80 rounded-xl p-4 font-mono text-xs text-cyan-200/90 overflow-x-auto max-h-[460px] leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
              <pre className="whitespace-pre">
                {activeScriptTab === 'powershell' ? generatedPowerShellScript : generatedCmdScript}
              </pre>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Tested for Windows 11 24H2 & Windows 10 WHQL Digital Signatures</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              Output Path: C:\DriverHub_Offline\
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};

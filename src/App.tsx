import React, { useState } from 'react';
import { LaptopProfile, DriverItem, LogMessage } from './types/driver';
import { LAPTOP_PROFILES } from './data/mockHardware';
import { Header } from './components/Header';
import { DriverManager } from './components/DriverManager';
import { OneClickOptimizer, OptimizerOptions } from './components/OneClickOptimizer';
import { BackupRestore } from './components/BackupRestore';
import { AIDiagnosticAssistant } from './components/AIDiagnosticAssistant';
import { HardwareProfiler } from './components/HardwareProfiler';
import { ExecutionConsole } from './components/ExecutionConsole';

export default function App() {
  const [currentProfile, setCurrentProfile] = useState<LaptopProfile>(LAPTOP_PROFILES[0]);
  const [drivers, setDrivers] = useState<DriverItem[]>(LAPTOP_PROFILES[0].drivers);
  const [activeTab, setActiveTab] = useState<'manager' | 'optimizer' | 'backup' | 'ai' | 'hardware' | 'logs'>('manager');
  const [isScanning, setIsScanning] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);

  const [logs, setLogs] = useState<LogMessage[]>([
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'info',
      message: 'DriverHub Pro v1.0.4 Enterprise initialized.'
    },
    {
      id: 'log-2',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'info',
      message: `System Profile Detected: ${LAPTOP_PROFILES[0].brand} ${LAPTOP_PROFILES[0].model} (${LAPTOP_PROFILES[0].cpu})`
    },
    {
      id: 'log-3',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'success',
      message: 'Plug and Play (PnP) hardware bus query complete. 11 devices identified.'
    }
  ]);

  const addLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' | 'cmd' = 'info') => {
    const newLog: LogMessage = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
      message
    };
    setLogs((prev) => [...prev, newLog]);
  };

  const handleSelectProfile = (profile: LaptopProfile) => {
    setCurrentProfile(profile);
    setDrivers(profile.drivers);
    addLog(`Switched target laptop hardware profile to: ${profile.brand} ${profile.model}`, 'info');
  };

  const handleToggleSelect = (id: string) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === id ? { ...d, selected: !d.selected } : d))
    );
  };

  const handleSelectAll = (select: boolean) => {
    setDrivers((prev) => prev.map((d) => ({ ...d, selected: select })));
  };

  const handleRefreshHardware = () => {
    setIsScanning(true);
    addLog('Scanning Windows Device Manager and PnP hardware bus...', 'cmd');
    setTimeout(() => {
      setIsScanning(false);
      addLog('Hardware rescan finished. Device instance paths refreshed.', 'success');
    }, 1500);
  };

  const handleStartInstallSequence = (selectedDrivers: DriverItem[]) => {
    if (selectedDrivers.length === 0 || isInstalling) return;

    setIsInstalling(true);
    setInstallProgress(0);
    setActiveTab('logs');

    addLog('=========================================================', 'cmd');
    addLog(`Initiating DriverHub Pro Batch Installation Sequence...`, 'cmd');
    addLog(`Creating System Restore Point: Checkpoint-Computer "DriverHub_PreInstall"...`, 'info');

    // Sort by sequence priority
    const sorted = [...selectedDrivers].sort((a, b) => a.installOrder - b.installOrder);

    let currentStep = 0;
    const totalSteps = sorted.length;

    const interval = setInterval(() => {
      if (currentStep < totalSteps) {
        const drv = sorted[currentStep];
        addLog(`[Step ${currentStep + 1}/${totalSteps}] Installing: ${drv.name} (${drv.vendor} ${drv.category})...`, 'cmd');
        addLog(`Running PnPUtil: pnputil /add-driver "${drv.infFileName}" /install`, 'cmd');
        addLog(`Verifying digital signature (WHQL SHA-256)... OK`, 'success');
        addLog(`Driver ${drv.name} installed successfully.`, 'success');

        // Update driver status in state
        setDrivers((prev) =>
          prev.map((item) =>
            item.id === drv.id
              ? { ...item, status: 'Installed', installedVersion: item.latestVersion, selected: false }
              : item
          )
        );

        currentStep++;
        const prog = Math.round((currentStep / totalSteps) * 100);
        setInstallProgress(prog);
      } else {
        clearInterval(interval);
        setIsInstalling(false);
        addLog('=========================================================', 'success');
        addLog('All selected drivers installed successfully in the correct sequence!', 'success');
        addLog('System optimization complete. Hardware reboot is recommended if GPU/Chipset was updated.', 'info');
      }
    }, 1200);
  };

  const handleStartSimulatedOptimization = (options: OptimizerOptions) => {
    if (isInstalling) return;

    const selected = drivers.filter((d) => d.selected);
    handleStartInstallSequence(selected.length > 0 ? selected : drivers);
  };

  const updateCount = drivers.filter((d) => d.status === 'Update Available').length;
  const missingCount = drivers.filter((d) => d.status === 'Missing').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top sticky header */}
      <Header
        currentProfile={currentProfile}
        onSelectProfile={handleSelectProfile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        updateCount={updateCount}
        missingCount={missingCount}
        onRefreshHardware={handleRefreshHardware}
        isScanning={isScanning}
      />

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'manager' && (
          <DriverManager
            profile={currentProfile}
            drivers={drivers}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onStartInstallSequence={handleStartInstallSequence}
            onDownloadDriver={(drv) => {
              addLog(`Started download for ${drv.name} from ${drv.downloadUrl}`, 'info');
            }}
            isInstalling={isInstalling}
          />
        )}

        {activeTab === 'optimizer' && (
          <OneClickOptimizer
            profile={currentProfile}
            drivers={drivers}
            onStartSimulatedOptimization={handleStartSimulatedOptimization}
            isInstalling={isInstalling}
          />
        )}

        {activeTab === 'backup' && (
          <BackupRestore onAddLog={addLog} />
        )}

        {activeTab === 'ai' && (
          <AIDiagnosticAssistant profile={currentProfile} />
        )}

        {activeTab === 'hardware' && (
          <HardwareProfiler profile={currentProfile} />
        )}

        {activeTab === 'logs' && (
          <ExecutionConsole
            logs={logs}
            onClearLogs={() => setLogs([])}
            isInstalling={isInstalling}
            installProgress={installProgress}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-400">DriverHub Pro</span>
            <span>•</span>
            <span>Windows PnP Driver Manager & Diagnostic Suite</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-emerald-400 font-mono">WHQL Verified</span>
            <span>•</span>
            <span>PnPUtil & DISM Integrated</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

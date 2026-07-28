import React, { useState, useEffect } from 'react';
import { LaptopProfile, DriverItem, LogMessage } from './types/driver';
import { ToastMessage, ToastType } from './types/toast';
import { LAPTOP_PROFILES } from './data/mockHardware';
import { Header } from './components/Header';
import { DriverManager } from './components/DriverManager';
import { OneClickOptimizer, OptimizerOptions } from './components/OneClickOptimizer';
import { ExeInstallerBuilder } from './components/ExeInstallerBuilder';
import { BackupRestore } from './components/BackupRestore';
import { AIDiagnosticAssistant } from './components/AIDiagnosticAssistant';
import { HardwareProfiler } from './components/HardwareProfiler';
import { ExecutionConsole } from './components/ExecutionConsole';
import { ToastContainer } from './components/ToastContainer';
import { AutoUpdatePromptModal } from './components/AutoUpdatePromptModal';
import { 
  getNotificationPermission, 
  requestWebNotificationPermission, 
  dispatchWebNotification 
} from './utils/notifications';

export default function App() {
  const [currentProfile, setCurrentProfile] = useState<LaptopProfile>(LAPTOP_PROFILES[0]);
  const [drivers, setDrivers] = useState<DriverItem[]>(LAPTOP_PROFILES[0].drivers);
  const [activeTab, setActiveTab] = useState<'manager' | 'optimizer' | 'exe' | 'backup' | 'ai' | 'hardware' | 'logs'>('manager');
  const [isScanning, setIsScanning] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);

  // Auto-Update Permission State
  const [autoInstallPromptEnabled, setAutoInstallPromptEnabled] = useState(true);
  const [showAutoUpdateModal, setShowAutoUpdateModal] = useState(false);

  // Toasts & Web Notification Permission State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    setPermissionStatus(getNotificationPermission());
  }, []);

  const addToast = (title: string, message: string, type: ToastType = 'info', duration: number = 6000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = {
      id,
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      duration
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleRequestNotificationPermission = async () => {
    const status = await requestWebNotificationPermission();
    setPermissionStatus(status);

    if (status === 'granted') {
      addToast(
        'Desktop Notifications Active',
        'You will now receive native desktop browser alerts when driver installations complete or fail.',
        'success'
      );
      dispatchWebNotification('DriverHub Pro Desktop Alerts', {
        body: 'Desktop notifications successfully enabled!'
      });
    } else if (status === 'denied') {
      addToast(
        'Notifications Blocked',
        'Browser desktop alerts are blocked. Please unblock notifications in your browser settings.',
        'warning'
      );
    }
  };

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

      // Check for new/outdated drivers
      const pending = drivers.filter(
        (d) => d.status === 'Update Available' || d.status === 'Missing'
      );

      if (pending.length > 0 && autoInstallPromptEnabled) {
        setShowAutoUpdateModal(true);
        addLog(
          `[System Analysis] Identified ${pending.length} new/outdated driver package(s). Prompting user for auto-installation permission.`,
          'info'
        );
        addToast(
          'New Driver Updates Found',
          `System scan identified ${pending.length} driver update(s). Requesting permission...`,
          'info',
          6000
        );
        dispatchWebNotification('DriverHub Pro: Driver Updates Identified', {
          body: `Found ${pending.length} driver package update(s) for ${currentProfile.model}.`
        });
      } else if (pending.length === 0) {
        addToast(
          'System Up to Date',
          'All installed drivers are WHQL verified and up to date.',
          'success',
          4000
        );
      }
    }, 1500);
  };

  const handleApproveAutoInstall = (driversToInstall: DriverItem[]) => {
    setShowAutoUpdateModal(false);
    addLog(
      `[Permission Granted] User approved auto-installation of ${driversToInstall.length} driver package(s).`,
      'success'
    );
    
    // Mark those drivers as selected
    setDrivers((prev) =>
      prev.map((d) =>
        d.status === 'Update Available' || d.status === 'Missing'
          ? { ...d, selected: true }
          : d
      )
    );

    // Trigger batch installation
    handleStartInstallSequence(driversToInstall);
  };

  const handleReviewManually = () => {
    setShowAutoUpdateModal(false);
    setActiveTab('manager');
    addLog('User chose to review driver updates manually.', 'info');
  };

  const handleStartInstallSequence = (selectedDrivers: DriverItem[]) => {
    if (selectedDrivers.length === 0 || isInstalling) return;

    setIsInstalling(true);
    setInstallProgress(0);
    setActiveTab('logs');

    addToast(
      'Installation Started',
      `Installing ${selectedDrivers.length} driver package(s) in WHQL sequence...`,
      'info'
    );

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

        // Trigger Toast Notification
        addToast(
          'Driver Installation Complete 🚀',
          `Successfully installed ${totalSteps} driver(s) on ${currentProfile.model}. System verified WHQL compliant.`,
          'success',
          8000
        );

        // Trigger Native Web Notification API
        dispatchWebNotification('DriverHub Pro: Driver Installation Complete 🚀', {
          body: `All ${totalSteps} driver packages were successfully installed on ${currentProfile.model}.`
        });
      }
    }, 1200);
  };

  const handleSimulateError = () => {
    addToast(
      'Driver Installation Failed ⚠️',
      `Error installing Intel VMD Storage Controller driver: Device Manager Code 10 (Device cannot start).`,
      'error',
      9000
    );

    addLog('ERROR: PnPUtil returned exit code 10 for Intel VMD Controller.', 'error');
    addLog('Device Manager reported: Code 10 - This device cannot start.', 'error');

    dispatchWebNotification('DriverHub Pro: Driver Installation Error ⚠️', {
      body: `Error installing Intel VMD Storage Controller driver (Device Manager Code 10).`
    });
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
        notificationPermission={permissionStatus}
        onRequestNotificationPermission={handleRequestNotificationPermission}
        autoInstallPromptEnabled={autoInstallPromptEnabled}
        onToggleAutoInstallPrompt={() => setAutoInstallPromptEnabled((prev) => !prev)}
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
              addToast('Download Initiated', `Downloading ${drv.name} package...`, 'info', 4000);
            }}
            isInstalling={isInstalling}
            onSimulateError={handleSimulateError}
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

        {activeTab === 'exe' && (
          <ExeInstallerBuilder
            currentProfile={currentProfile}
            drivers={drivers}
            onStartSimulatedExecution={() => {
              setActiveTab('logs');
              handleStartInstallSequence(drivers);
            }}
            onDownloadScript={(filename) => {
              addToast('EXE Builder Script Downloaded', `Downloaded ${filename} successfully.`, 'success', 5000);
              addLog(`Downloaded EXE installer script: ${filename}`, 'success');
            }}
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

      {/* Permission Modal for Auto Driver Updates */}
      <AutoUpdatePromptModal
        isOpen={showAutoUpdateModal}
        onClose={() => setShowAutoUpdateModal(false)}
        onApproveAndInstall={handleApproveAutoInstall}
        onReviewManually={handleReviewManually}
        profile={currentProfile}
        drivers={drivers}
      />

      {/* Toast Notification Layer */}
      <ToastContainer
        toasts={toasts}
        onDismiss={handleDismissToast}
        permissionStatus={permissionStatus}
        onRequestPermission={handleRequestNotificationPermission}
      />

    </div>
  );
}

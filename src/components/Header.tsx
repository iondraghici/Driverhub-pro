import React from 'react';
import { LaptopProfile } from '../types/driver';
import { LAPTOP_PROFILES } from '../data/mockHardware';
import { 
  Laptop, 
  Cpu, 
  HardDrive, 
  CheckCircle2, 
  AlertTriangle, 
  DownloadCloud, 
  Wrench, 
  ShieldCheck, 
  Bot, 
  Cpu as CpuIcon, 
  Terminal,
  RefreshCw,
  Zap,
  Bell,
  BellOff,
  Package
} from 'lucide-react';

interface HeaderProps {
  currentProfile: LaptopProfile;
  onSelectProfile: (profile: LaptopProfile) => void;
  activeTab: 'manager' | 'optimizer' | 'exe' | 'backup' | 'ai' | 'hardware' | 'logs';
  setActiveTab: (tab: 'manager' | 'optimizer' | 'exe' | 'backup' | 'ai' | 'hardware' | 'logs') => void;
  updateCount: number;
  missingCount: number;
  onRefreshHardware: () => void;
  isScanning: boolean;
  notificationPermission: NotificationPermission | 'unsupported';
  onRequestNotificationPermission: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProfile,
  onSelectProfile,
  activeTab,
  setActiveTab,
  updateCount,
  missingCount,
  onRefreshHardware,
  isScanning,
  notificationPermission,
  onRequestNotificationPermission
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-xl text-slate-100">
      {/* Top Bar: Logo & Active PC Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-3 gap-3">
          
          {/* Logo & App Title */}
          <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center space-x-2.5">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
                <Wrench className="h-5 w-5 text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
                    DriverHub Pro
                  </span>
                  <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-cyan-500/20 uppercase tracking-wider">
                    v1.0.4 Enterprise
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Windows PnP & OEM Driver Management Suite
                </p>
              </div>
            </div>

            {/* Quick Mobile Model Selector Trigger */}
            <div className="md:hidden">
              <select
                className="bg-slate-800 border border-slate-700 text-xs text-cyan-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                value={currentProfile.id}
                onChange={(e) => {
                  const p = LAPTOP_PROFILES.find((x) => x.id === e.target.value);
                  if (p) onSelectProfile(p);
                }}
              >
                {LAPTOP_PROFILES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.model}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Model Switcher Dropdown & Hardware Quick Summary */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            
            {/* Notification API Toggle */}
            <button
              onClick={onRequestNotificationPermission}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition active:scale-95 ${
                notificationPermission === 'granted'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                  : notificationPermission === 'denied'
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25'
                  : 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/25'
              }`}
              title={
                notificationPermission === 'granted'
                  ? 'Desktop Web Notifications Enabled'
                  : notificationPermission === 'denied'
                  ? 'Desktop Notifications Blocked in Browser Settings'
                  : 'Enable Desktop Web Notifications'
              }
            >
              {notificationPermission === 'granted' ? (
                <>
                  <Bell className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Alerts Active</span>
                </>
              ) : notificationPermission === 'denied' ? (
                <>
                  <BellOff className="h-3.5 w-3.5 text-rose-400" />
                  <span>Alerts Blocked</span>
                </>
              ) : (
                <>
                  <Bell className="h-3.5 w-3.5 text-indigo-400 animate-bounce" />
                  <span>Enable Desktop Alerts</span>
                </>
              )}
            </button>

            {/* Rescan Button */}
            <button
              onClick={onRefreshHardware}
              disabled={isScanning}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg text-xs font-medium text-slate-200 transition shadow-sm active:scale-95 disabled:opacity-50"
              title="Rescan PnP hardware bus and Device Manager"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning PnP Bus...' : 'Rescan Hardware'}</span>
            </button>

            {/* Desktop Model Selector */}
            <div className="hidden md:flex items-center space-x-2 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5">
              <Laptop className="h-4 w-4 text-cyan-400" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Detected Laptop/PC:</span>
                <select
                  className="bg-transparent text-xs font-bold text-cyan-300 focus:outline-none cursor-pointer hover:text-white transition"
                  value={currentProfile.id}
                  onChange={(e) => {
                    const p = LAPTOP_PROFILES.find((x) => x.id === e.target.value);
                    if (p) onSelectProfile(p);
                  }}
                >
                  {LAPTOP_PROFILES.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-slate-100">
                      {p.brand} - {p.model}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex items-center space-x-2">
              {missingCount > 0 && (
                <div className="flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2.5 py-1 rounded-lg text-xs font-semibold">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400 animate-bounce" />
                  <span>{missingCount} Missing</span>
                </div>
              )}

              {updateCount > 0 ? (
                <div className="flex items-center space-x-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 px-2.5 py-1 rounded-lg text-xs font-semibold">
                  <DownloadCloud className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{updateCount} Updates Available</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-lg text-xs font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>All Drivers Updated</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Bottom Navigation Tabs */}
        <div className="flex overflow-x-auto space-x-1 scrollbar-none border-t border-slate-800/80 pt-2 pb-1">
          
          <button
            onClick={() => setActiveTab('manager')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'manager'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Wrench className="h-4 w-4 text-cyan-400" />
            <span>Driver Catalog & Updates</span>
            {updateCount + missingCount > 0 && (
              <span className="bg-cyan-500/20 text-cyan-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1">
                {updateCount + missingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('optimizer')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'optimizer'
                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Zap className="h-4 w-4 text-indigo-400" />
            <span>One-Click "Optimize Windows"</span>
            <span className="bg-indigo-500/20 text-indigo-300 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
              Auto Script
            </span>
          </button>

          <button
            onClick={() => setActiveTab('exe')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'exe'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Package className="h-4 w-4 text-cyan-400" />
            <span>EXE Auto-Installer Builder</span>
            <span className="bg-cyan-500/20 text-cyan-300 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
              .EXE / .BAT
            </span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'backup'
                ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-blue-400" />
            <span>Driver Store Backup & OEM Clean</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'ai'
                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Bot className="h-4 w-4 text-purple-400" />
            <span>AI Hardware Diagnostics</span>
            <span className="bg-purple-500/20 text-purple-300 text-[10px] px-1.5 py-0.5 rounded font-bold">
              Gemini
            </span>
          </button>

          <button
            onClick={() => setActiveTab('hardware')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'hardware'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <CpuIcon className="h-4 w-4 text-amber-400" />
            <span>Hardware Specs & Hardware IDs</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="h-4 w-4 text-emerald-400" />
            <span>PnP Execution Console</span>
          </button>

        </div>
      </div>
    </header>
  );
};

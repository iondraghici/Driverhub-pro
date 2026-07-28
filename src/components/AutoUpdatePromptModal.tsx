import React from 'react';
import { DriverItem, LaptopProfile } from '../types/driver';
import { 
  Sparkles, 
  Download, 
  Play, 
  ShieldCheck, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Cpu, 
  HardDrive, 
  Zap, 
  ListChecks
} from 'lucide-react';

interface AutoUpdatePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApproveAndInstall: (driversToInstall: DriverItem[]) => void;
  onReviewManually: () => void;
  profile: LaptopProfile;
  drivers: DriverItem[];
}

export const AutoUpdatePromptModal: React.FC<AutoUpdatePromptModalProps> = ({
  isOpen,
  onClose,
  onApproveAndInstall,
  onReviewManually,
  profile,
  drivers
}) => {
  if (!isOpen) return null;

  const pendingDrivers = drivers.filter(
    (d) => d.status === 'Update Available' || d.status === 'Missing'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      
      {/* Modal Card */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 border border-indigo-500/40 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden relative transform transition-all">
        
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between relative z-10">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 rounded-2xl">
              <Sparkles className="h-6 w-6 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>System Scan Complete</span>
              </div>
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                New Driver Updates Available!
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 relative z-10 text-xs">
          
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl space-y-2">
            <p className="text-slate-200 text-sm leading-relaxed">
              System analysis identified <strong className="text-cyan-300">{pendingDrivers.length} WHQL driver update(s)</strong> required for maximum stability and performance on <strong className="text-white">{profile.brand} {profile.model}</strong>.
            </p>
            <p className="text-slate-400 text-xs">
              Would you like DriverHub Pro to automatically download, stage, and install these drivers now?
            </p>
          </div>

          {/* Driver List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-400 font-medium px-1">
              <span>Detected Drivers ({pendingDrivers.length})</span>
              <span className="text-emerald-400 font-mono text-[11px]">WHQL Signed</span>
            </div>

            <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
              {pendingDrivers.map((drv) => (
                <div
                  key={drv.id}
                  className="flex items-center justify-between p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl"
                >
                  <div className="flex items-center space-x-3 truncate pr-2">
                    <div className="p-2 bg-slate-900 border border-slate-700/80 rounded-lg text-indigo-400 shrink-0">
                      <Cpu className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <span className="font-bold text-slate-100 block truncate">{drv.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {drv.category} • Current: {drv.installedVersion} → <strong className="text-cyan-300">Latest: {drv.latestVersion}</strong>
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono shrink-0 ${
                    drv.status === 'Missing' 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {drv.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center space-x-2 text-slate-400 bg-indigo-950/30 border border-indigo-500/20 p-3 rounded-xl">
            <ShieldCheck className="h-4 w-4 text-indigo-400 shrink-0" />
            <span className="text-[11px] leading-tight">
              Includes automatic System Restore Point creation (<code className="text-indigo-300">Checkpoint-Computer</code>) before installation.
            </span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3 relative z-10">
          
          <button
            onClick={onReviewManually}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition active:scale-95"
          >
            Review Drivers Manually
          </button>

          <button
            onClick={() => onApproveAndInstall(pendingDrivers)}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition transform active:scale-95"
          >
            <Download className="h-4 w-4" />
            <span>Approve & Install Automatically ({pendingDrivers.length})</span>
          </button>

        </div>

      </div>

    </div>
  );
};

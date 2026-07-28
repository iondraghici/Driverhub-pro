import React, { useState, useRef, useEffect } from 'react';
import { LogMessage } from '../types/driver';
import { 
  Terminal, 
  Trash2, 
  Download, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Play, 
  RefreshCcw 
} from 'lucide-react';

interface ExecutionConsoleProps {
  logs: LogMessage[];
  onClearLogs: () => void;
  isInstalling: boolean;
  installProgress: number;
}

export const ExecutionConsole: React.FC<ExecutionConsoleProps> = ({
  logs,
  onClearLogs,
  isInstalling,
  installProgress
}) => {
  const [copiedConsole, setCopiedConsole] = useState(false);
  const [logFilter, setLogFilter] = useState<'all' | 'cmd' | 'success' | 'warning' | 'error'>('all');
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const filteredLogs = logs.filter((l) => {
    if (logFilter === 'all') return true;
    return l.type === logFilter;
  });

  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedConsole(true);
    setTimeout(() => setCopiedConsole(false), 2000);
  };

  const handleDownloadLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DriverHub_Execution_${new Date().toISOString().slice(0, 10)}.log`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner & Progress */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                Terminal Diagnostics
              </span>
              <span className="text-xs text-slate-400">
                PnPUtil & DISM Live Execution Output
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Real-Time Installation & System Execution Logs
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
              Monitors Windows PnP device manager events, driver package staging, digital signature verification, and system restore point progress.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyLogs}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
            >
              {copiedConsole ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-cyan-400" />}
              <span>{copiedConsole ? 'Copied Logs' : 'Copy All Logs'}</span>
            </button>

            <button
              onClick={handleDownloadLogs}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-300 text-xs font-bold rounded-xl transition"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Log File</span>
            </button>

            <button
              onClick={onClearLogs}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 rounded-xl text-xs font-semibold transition"
              title="Clear terminal history"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Installation Progress Bar if Active */}
        {isInstalling && (
          <div className="mt-5 pt-4 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-cyan-300 font-bold flex items-center space-x-2">
                <RefreshCcw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                <span>Batch Driver Installation in Progress...</span>
              </span>
              <span className="text-emerald-400 font-extrabold">{installProgress}%</span>
            </div>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${installProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 text-xs">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Filter:</span>
        <button
          onClick={() => setLogFilter('all')}
          className={`px-3 py-1 rounded-lg font-semibold transition ${
            logFilter === 'all'
              ? 'bg-slate-200 text-slate-900 font-bold'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          All ({logs.length})
        </button>
        <button
          onClick={() => setLogFilter('cmd')}
          className={`px-3 py-1 rounded-lg font-semibold transition ${
            logFilter === 'cmd'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          Commands
        </button>
        <button
          onClick={() => setLogFilter('success')}
          className={`px-3 py-1 rounded-lg font-semibold transition ${
            logFilter === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          Success
        </button>
        <button
          onClick={() => setLogFilter('warning')}
          className={`px-3 py-1 rounded-lg font-semibold transition ${
            logFilter === 'warning'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          Warnings
        </button>
      </div>

      {/* Terminal View */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs shadow-2xl h-[480px] overflow-y-auto space-y-2 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
        {filteredLogs.length === 0 ? (
          <div className="text-slate-600 text-center py-20 font-sans">
            Terminal output is currently empty.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isCmd = log.type === 'cmd';
            const isSuccess = log.type === 'success';
            const isWarning = log.type === 'warning';
            const isError = log.type === 'error';

            return (
              <div
                key={log.id}
                className={`flex items-start space-x-2 py-0.5 border-b border-slate-900/60 ${
                  isCmd
                    ? 'text-cyan-300 font-bold'
                    : isSuccess
                    ? 'text-emerald-400'
                    : isWarning
                    ? 'text-amber-400'
                    : isError
                    ? 'text-rose-400 font-bold'
                    : 'text-slate-300'
                }`}
              >
                <span className="text-slate-600 shrink-0 text-[10px]">[{log.timestamp}]</span>
                <span className="shrink-0 uppercase font-bold text-[10px] w-14">
                  [{log.type}]
                </span>
                <span className="break-all">{log.message}</span>
              </div>
            );
          })
        )}
        <div ref={consoleEndRef} />
      </div>

    </div>
  );
};

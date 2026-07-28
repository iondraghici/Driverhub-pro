import React, { useState } from 'react';
import { MOCK_DRIVER_STORE_ENTRIES } from '../data/mockHardware';
import { DriverStoreEntry } from '../types/driver';
import { 
  ShieldCheck, 
  Download, 
  Trash2, 
  RefreshCcw, 
  Archive, 
  FolderDown, 
  HardDrive, 
  FileCode, 
  Check, 
  Copy, 
  AlertTriangle,
  Play
} from 'lucide-react';

interface BackupRestoreProps {
  onAddLog: (msg: string, type?: 'info' | 'success' | 'warning' | 'error' | 'cmd') => void;
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({ onAddLog }) => {
  const [storeEntries, setStoreEntries] = useState<DriverStoreEntry[]>(MOCK_DRIVER_STORE_ENTRIES);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState('C:\\DriverBackup_2026');

  const exportCommand = `pnputil /export-driver * "${selectedFolder}"`;
  const restoreCommand = `pnputil /add-driver "${selectedFolder}\\*.inf" /subdirs /install`;

  const handleExportBackup = () => {
    onAddLog(`Initiating Driver Store Export...`, 'cmd');
    onAddLog(`Running command: ${exportCommand}`, 'cmd');
    onAddLog(`Exporting oem0.inf [Intel Rapid Storage Technology]... Success`, 'success');
    onAddLog(`Exporting oem1.inf [Intel Management Engine]... Success`, 'success');
    onAddLog(`Exporting oem2.inf [NVIDIA GeForce Graphics]... Success`, 'success');
    onAddLog(`Exporting oem3.inf [Realtek Gigabit Ethernet]... Success`, 'success');
    onAddLog(`Exporting oem4.inf [Intel Wi-Fi 6E AX211]... Success`, 'success');
    onAddLog(`Successfully exported ${storeEntries.length} OEM driver packages to "${selectedFolder}".`, 'success');
  };

  const handleRemoveEntry = (oemName: string) => {
    onAddLog(`Running command: pnputil /delete-driver ${oemName} /uninstall /force`, 'cmd');
    setStoreEntries((prev) => prev.filter((item) => item.oemName !== oemName));
    onAddLog(`Driver package ${oemName} uninstalled and purged from DriverStore.`, 'success');
  };

  const handleCopyCmd = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const totalStoreSize = storeEntries.reduce((acc, curr) => acc + curr.sizeMB, 0).toFixed(1);

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                Driver Store Management
              </span>
              <span className="text-xs text-slate-400">
                PnPUtil & DISM Tooling
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Driver Backup, Offline Restore & Driver Store Cleaner
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
              Back up all third-party OEM drivers (.INF, .SYS, .CAT) directly from Windows DriverStore prior to clean OS installation, or purge old duplicate graphic drivers.
            </p>
          </div>

          <button
            onClick={handleExportBackup}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition active:scale-95 shrink-0"
          >
            <Archive className="h-4 w-4" />
            <span>Export Driver Store Now</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Backup Commands Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <FolderDown className="h-4 w-4 text-blue-400" />
              <h3 className="font-bold text-sm text-slate-100">Backup Directory & Commands</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">PnPUtil Native</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Backup Destination Folder:
              </label>
              <input
                type="text"
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Export Command */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Export All Drivers Command:</span>
                <button
                  onClick={() => handleCopyCmd(exportCommand, 'export')}
                  className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] flex items-center space-x-1"
                >
                  {copiedCmd === 'export' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedCmd === 'export' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="font-mono text-xs text-cyan-300 bg-slate-900/80 p-2 rounded border border-slate-800 break-all">
                {exportCommand}
              </div>
            </div>

            {/* Restore Command */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Offline Restore Command:</span>
                <button
                  onClick={() => handleCopyCmd(restoreCommand, 'restore')}
                  className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] flex items-center space-x-1"
                >
                  {copiedCmd === 'restore' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedCmd === 'restore' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="font-mono text-xs text-indigo-300 bg-slate-900/80 p-2 rounded border border-slate-800 break-all">
                {restoreCommand}
              </div>
            </div>
          </div>
        </div>

        {/* Offline USB Package Generator */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <HardDrive className="h-4 w-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-slate-100">Offline USB Driver Pack Generator</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">Portable</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Create an offline self-extracting USB drive or ISO package containing essential Windows setup drivers (specifically Intel VMD/RST for drive detection, Wi-Fi 6E, and LAN drivers).
          </p>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold">Includes Crucial Boot Drivers:</span>
              <span className="text-emerald-400 font-mono font-bold">~ 185 MB Total</span>
            </div>

            <ul className="text-xs text-slate-400 space-y-1.5 font-mono">
              <li className="flex items-center space-x-2">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Intel VMD F6 Flpy Driver (iaStorVD.inf)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Intel Chipset & Serial IO (I2C/GPIO)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Realtek LAN & Intel Wi-Fi 6E Wireless</span>
              </li>
            </ul>

            <button
              onClick={() => {
                onAddLog(`Generating Offline USB Driver Pack ISO...`, 'cmd');
                onAddLog(`Adding iaStorVD.inf, Netwtw6e.inf, rt640x64.inf to USB package...`, 'info');
                onAddLog(`Offline USB Driver Pack created successfully!`, 'success');
              }}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-cyan-300 transition"
            >
              Build Offline USB Driver Pack (.ZIP)
            </button>
          </div>
        </div>

      </div>

      {/* Driver Store Inspector & Stale Driver Cleaner Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-base text-slate-100">
              Windows DriverStore Package Inspector ({storeEntries.length} OEM packages)
            </h3>
            <p className="text-xs text-slate-400">
              Scans `C:\Windows\System32\DriverStore\FileRepository` for installed OEM .inf manifests.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
            <span>Total Size: </span>
            <span className="text-cyan-400 font-bold">{totalStoreSize} MB</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <th className="p-2.5 font-bold">OEM INF</th>
                <th className="p-2.5 font-bold">Original Name</th>
                <th className="p-2.5 font-bold">Provider / Device Class</th>
                <th className="p-2.5 font-bold">Version</th>
                <th className="p-2.5 font-bold">Date</th>
                <th className="p-2.5 font-bold">Size</th>
                <th className="p-2.5 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {storeEntries.map((entry) => {
                const isOld = entry.provider.includes('(Stale)') || entry.version.includes('Old');

                return (
                  <tr key={entry.oemName} className={`hover:bg-slate-800/50 transition ${isOld ? 'bg-amber-500/5' : ''}`}>
                    <td className="p-2.5 font-bold text-cyan-300">{entry.oemName}</td>
                    <td className="p-2.5 text-slate-200">{entry.originalName}</td>
                    <td className="p-2.5 text-slate-400">
                      <div>{entry.provider}</div>
                      <div className="text-[10px] text-slate-500">{entry.class}</div>
                    </td>
                    <td className="p-2.5 text-slate-300">{entry.version}</td>
                    <td className="p-2.5 text-slate-400">{entry.date}</td>
                    <td className="p-2.5 text-slate-300">{entry.sizeMB} MB</td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => handleRemoveEntry(entry.oemName)}
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-sans font-bold transition ${
                          isOld
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                            : 'bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700'
                        }`}
                        title={`Remove ${entry.oemName} from DriverStore`}
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>{isOld ? 'Purge Stale' : 'Remove'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

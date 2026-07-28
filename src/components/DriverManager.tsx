import React, { useState } from 'react';
import { DriverItem, DriverCategory, LaptopProfile } from '../types/driver';
import { 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Layers, 
  Search, 
  Filter, 
  ShieldAlert, 
  ArrowRight, 
  ExternalLink, 
  FileCode, 
  Copy, 
  Check, 
  Zap,
  Info,
  Sliders,
  Play
} from 'lucide-react';

interface DriverManagerProps {
  profile: LaptopProfile;
  drivers: DriverItem[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (select: boolean) => void;
  onStartInstallSequence: (selectedDrivers: DriverItem[]) => void;
  onDownloadDriver: (driver: DriverItem) => void;
  isInstalling: boolean;
}

export const DriverManager: React.FC<DriverManagerProps> = ({
  profile,
  drivers,
  onToggleSelect,
  onSelectAll,
  onStartInstallSequence,
  onDownloadDriver,
  isInstalling
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DriverCategory | 'All'>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [createRestorePoint, setCreateRestorePoint] = useState(true);

  // Categories list
  const categories: (DriverCategory | 'All')[] = [
    'All',
    'Chipset',
    'Storage/VMD',
    'Graphics',
    'Audio',
    'Network',
    'Wireless',
    'Bluetooth',
    'System Utility',
    'BIOS/Firmware'
  ];

  // Filtered drivers
  const filteredDrivers = drivers.filter((drv) => {
    const matchesCategory = selectedCategory === 'All' || drv.category === selectedCategory;
    const matchesSearch = 
      drv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drv.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drv.hardwareId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drv.infFileName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort by recommended install order priority
  const sortedDrivers = [...filteredDrivers].sort((a, b) => a.installOrder - b.installOrder);

  const selectedCount = drivers.filter((d) => d.selected).length;
  const totalSelectedSize = drivers
    .filter((d) => d.selected)
    .reduce((acc, curr) => acc + curr.sizeMB, 0)
    .toFixed(1);

  const handleCopyHardwareId = (hwId: string, id: string) => {
    navigator.clipboard.writeText(hwId);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls & Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                PnP Order Sequencing
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {profile.model} Hardware Catalog
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Official Driver Manager & Batch Installer
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
              Installs motherboard, chipset, VMD storage, wireless, and discrete GPU drivers in the strictly recommended Windows execution sequence to prevent system instability.
            </p>
          </div>

          {/* Quick Action Button Box */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
            <div className="flex items-center space-x-2 pr-2 border-r border-slate-800">
              <input
                type="checkbox"
                id="restorePointCheck"
                checked={createRestorePoint}
                onChange={(e) => setCreateRestorePoint(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-cyan-500 focus:ring-offset-slate-900 cursor-pointer"
              />
              <label htmlFor="restorePointCheck" className="text-xs font-medium text-slate-300 cursor-pointer">
                Create Restore Point
              </label>
            </div>

            <button
              onClick={() => {
                const selected = drivers.filter((d) => d.selected);
                if (selected.length > 0) {
                  onStartInstallSequence(selected);
                }
              }}
              disabled={selectedCount === 0 || isInstalling}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>
                {isInstalling
                  ? 'Installing Sequence...'
                  : `Install Selected (${selectedCount} items - ${totalSelectedSize} MB)`}
              </span>
            </button>
          </div>
        </div>

        {/* Recommended Order Sequence Strip */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center overflow-x-auto gap-2 pb-1 text-[11px] text-slate-400 font-medium scrollbar-none">
          <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] whitespace-nowrap flex items-center gap-1">
            <Info className="h-3.5 w-3.5 text-cyan-400" />
            Execution Order:
          </span>
          <span className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded font-mono text-[10px] whitespace-nowrap">#1 Chipset</span>
          <ArrowRight className="h-3 w-3 text-slate-600 shrink-0" />
          <span className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded font-mono text-[10px] whitespace-nowrap">#2 Intel ME</span>
          <ArrowRight className="h-3 w-3 text-slate-600 shrink-0" />
          <span className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded font-mono text-[10px] whitespace-nowrap">#3 Serial IO</span>
          <ArrowRight className="h-3 w-3 text-slate-600 shrink-0" />
          <span className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded font-mono text-[10px] whitespace-nowrap">#4 Storage VMD</span>
          <ArrowRight className="h-3 w-3 text-slate-600 shrink-0" />
          <span className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded font-mono text-[10px] whitespace-nowrap">#5 LAN/WiFi</span>
          <ArrowRight className="h-3 w-3 text-slate-600 shrink-0" />
          <span className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded font-mono text-[10px] whitespace-nowrap">#6 Audio</span>
          <ArrowRight className="h-3 w-3 text-slate-600 shrink-0" />
          <span className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded font-mono text-[10px] whitespace-nowrap">#7 iGPU</span>
          <ArrowRight className="h-3 w-3 text-slate-600 shrink-0" />
          <span className="bg-slate-800 font-bold text-indigo-300 px-2 py-0.5 rounded font-mono text-[10px] whitespace-nowrap">#8 Discrete GPU</span>
        </div>
      </div>

      {/* Filter and Category Navigation */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Category Pills */}
        <div className="flex items-center overflow-x-auto space-x-1.5 w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-200 text-slate-900 shadow-md font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input & Select All */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
          
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <button
              onClick={() => onSelectAll(true)}
              className="hover:text-cyan-400 font-semibold transition underline underline-offset-2"
            >
              Select All
            </button>
            <span>/</span>
            <button
              onClick={() => onSelectAll(false)}
              className="hover:text-cyan-400 font-semibold transition underline underline-offset-2"
            >
              Deselect All
            </button>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search driver name, INF, HW ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
            />
          </div>
        </div>

      </div>

      {/* Driver List Table / Cards */}
      <div className="space-y-3">
        {sortedDrivers.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <Filter className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-300">No matching drivers found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search query or switching categories.
            </p>
          </div>
        ) : (
          sortedDrivers.map((drv) => {
            const isInstalled = drv.status === 'Installed';
            const isMissing = drv.status === 'Missing';
            const isUpdate = drv.status === 'Update Available';
            const isOEM = drv.status === 'OEM Recommended';

            return (
              <div
                key={drv.id}
                className={`bg-slate-900 border rounded-2xl p-4 transition-all hover:border-slate-700 shadow-md ${
                  drv.selected
                    ? 'border-cyan-500/50 bg-slate-900/90 shadow-cyan-500/5'
                    : 'border-slate-800/80'
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  
                  {/* Left: Checkbox, Icon, Info */}
                  <div className="flex items-start space-x-3.5 w-full md:w-auto">
                    
                    <input
                      type="checkbox"
                      checked={!!drv.selected}
                      onChange={() => onToggleSelect(drv.id)}
                      className="mt-1 w-4 h-4 rounded text-cyan-500 bg-slate-950 border-slate-700 focus:ring-cyan-500 cursor-pointer"
                    />

                    {/* Order Sequence Badge */}
                    <div className="flex flex-col items-center justify-center bg-slate-950 border border-slate-800 px-2 py-1.5 rounded-xl text-center min-w-[50px] shrink-0">
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Step</span>
                      <span className="text-sm font-black text-cyan-400 font-mono">#{drv.installOrder}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">{drv.name}</span>
                        
                        {/* Vendor Tag */}
                        <span className="bg-slate-800 text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-700">
                          {drv.vendor}
                        </span>

                        {/* Category Tag */}
                        <span className="bg-slate-950 text-cyan-400 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-800">
                          {drv.category}
                        </span>

                        {/* Status Tag */}
                        {isMissing && (
                          <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded">
                            Missing Driver
                          </span>
                        )}

                        {isUpdate && (
                          <span className="bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold px-2 py-0.5 rounded">
                            Update Available
                          </span>
                        )}

                        {isOEM && (
                          <span className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold px-2 py-0.5 rounded">
                            OEM Recommended
                          </span>
                        )}

                        {isInstalled && (
                          <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded">
                            Up to Date
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-1">{drv.description}</p>

                      {/* Technical Specs Details Row */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-slate-400 font-mono">
                        <div>
                          <span className="text-slate-500">Installed: </span>
                          <span className={drv.installedVersion ? 'text-slate-300 font-semibold' : 'text-amber-400 italic'}>
                            {drv.installedVersion || 'None'}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500">Available: </span>
                          <span className="text-cyan-300 font-bold">{drv.latestVersion}</span>
                        </div>

                        <div>
                          <span className="text-slate-500">INF: </span>
                          <span className="text-slate-300">{drv.infFileName}</span>
                        </div>

                        <div>
                          <span className="text-slate-500">Size: </span>
                          <span className="text-slate-300">{drv.sizeMB} MB</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full md:w-auto justify-end border-t md:border-t-0 border-slate-800/80 pt-2 md:pt-0">
                    
                    {/* Hardware ID copy */}
                    <button
                      onClick={() => handleCopyHardwareId(drv.hardwareId, drv.id)}
                      className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] text-slate-400 hover:text-slate-200 transition font-mono"
                      title={drv.hardwareId}
                    >
                      {copiedId === drv.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400 font-sans">Copied HW ID!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 text-slate-500" />
                          <span>HW ID</span>
                        </>
                      )}
                    </button>

                    {/* Download button */}
                    <a
                      href={drv.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 transition"
                      title="Direct vendor package download"
                    >
                      <Download className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Download</span>
                    </a>

                    {/* Single Install */}
                    <button
                      onClick={() => onStartInstallSequence([drv])}
                      disabled={isInstalling}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-bold transition active:scale-95 disabled:opacity-50"
                    >
                      <Zap className="h-3.5 w-3.5 text-cyan-400 fill-cyan-400/30" />
                      <span>Install PnP</span>
                    </button>

                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

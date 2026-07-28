import React, { useState } from 'react';
import { LaptopProfile } from '../types/driver';
import { 
  Cpu, 
  HardDrive, 
  Laptop, 
  Copy, 
  Check, 
  Layers, 
  ShieldCheck, 
  Search, 
  ExternalLink,
  Zap,
  Info
} from 'lucide-react';

interface HardwareProfilerProps {
  profile: LaptopProfile;
}

export const HardwareProfiler: React.FC<HardwareProfilerProps> = ({ profile }) => {
  const [copiedHwId, setCopiedHwId] = useState<string | null>(null);

  const handleCopy = (hwId: string, key: string) => {
    navigator.clipboard.writeText(hwId);
    setCopiedHwId(key);
    setTimeout(() => setCopiedHwId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                System Hardware Profiler
              </span>
              <span className="text-xs text-slate-400">
                Plug and Play (PnP) PCI & USB Bus Diagnostics
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              {profile.brand} - {profile.model} Hardware Specifications
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
              Inspect raw PCI Vendor (VEN), Device (DEV), Subsystem (SUBSYS), and ACPI IDs for manual driver search on Microsoft Update Catalog.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 p-3 rounded-xl">
            <Laptop className="h-6 w-6 text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">VMD Storage Mode:</div>
              <div className={profile.vmdEnabled ? 'text-amber-300 font-bold text-xs' : 'text-slate-400 text-xs'}>
                {profile.vmdEnabled ? 'VMD Enabled (RST Required)' : 'Standard AHCI / NVMe'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Core Specs & Hardware IDs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Hardware Components */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Cpu className="h-4 w-4 text-amber-400" />
              <h3 className="font-bold text-sm text-slate-100">System Hardware Summary</h3>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Processor (CPU):</span>
              <span className="font-bold text-slate-200 mt-0.5 block">{profile.cpu}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Graphics Accelerator (GPU):</span>
              <span className="font-bold text-cyan-300 mt-0.5 block">{profile.gpu}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Motherboard Chipset:</span>
              <span className="font-bold text-slate-200 mt-0.5 block">{profile.chipset}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">System BIOS Firmware:</span>
              <span className="font-bold text-indigo-300 mt-0.5 block">{profile.biosVersion}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Memory & Storage:</span>
              <span className="font-bold text-slate-200 mt-0.5 block">{profile.ram} | {profile.storage}</span>
            </div>
          </div>
        </div>

        {/* Hardware IDs Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-slate-100">PCI / USB Hardware Instance IDs</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">PNP Device List</span>
          </div>

          <div className="space-y-3">
            {profile.drivers.map((drv) => (
              <div
                key={drv.id}
                className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-200">{drv.name}</span>
                    <span className="bg-slate-900 text-slate-400 text-[10px] px-2 py-0.5 rounded border border-slate-800">
                      {drv.vendor}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-cyan-300/90 mt-1 break-all">
                    {drv.hardwareId}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleCopy(drv.hardwareId, drv.id)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 transition"
                  >
                    {copiedHwId === drv.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-sans font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Copy ID</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`https://www.catalog.update.microsoft.com/Search.aspx?q=${encodeURIComponent(drv.hardwareId)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-bold transition"
                    title="Search on Microsoft Update Catalog"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>MS Catalog</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

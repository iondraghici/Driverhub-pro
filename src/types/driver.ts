export type DriverCategory = 
  | 'Chipset'
  | 'Storage/VMD'
  | 'Graphics'
  | 'Audio'
  | 'Network'
  | 'Wireless'
  | 'Bluetooth'
  | 'System Utility'
  | 'BIOS/Firmware';

export type DriverStatus = 
  | 'Installed'
  | 'Update Available'
  | 'Missing'
  | 'OEM Recommended'
  | 'Downloading'
  | 'Installing';

export interface DriverItem {
  id: string;
  name: string;
  category: DriverCategory;
  vendor: 'Intel' | 'NVIDIA' | 'AMD' | 'Realtek' | 'Acer' | 'ASUS' | 'Dell' | 'Lenovo' | 'HP' | 'Killer' | 'MediaTek';
  installedVersion: string | null;
  latestVersion: string;
  releaseDate: string;
  sizeMB: number;
  installOrder: number; // 1 to 10 sequence priority
  status: DriverStatus;
  hardwareId: string;
  downloadUrl: string;
  checksumSHA256: string;
  infFileName: string;
  description: string;
  isCritical: boolean;
  selected?: boolean;
  progress?: number;
}

export interface LaptopProfile {
  id: string;
  brand: 'Acer' | 'ASUS' | 'Dell' | 'Lenovo' | 'HP' | 'MSI' | 'Custom PC';
  model: string;
  series: string;
  cpu: string;
  gpu: string;
  chipset: string;
  biosVersion: string;
  ram: string;
  storage: string;
  vmdEnabled: boolean;
  drivers: DriverItem[];
}

export interface LogMessage {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'cmd';
  message: string;
  source?: string;
}

export interface DriverStoreEntry {
  oemName: string; // e.g. "oem12.inf"
  originalName: string; // e.g. "iastorvd.inf"
  provider: string; // e.g. "Intel Corporation"
  class: string; // e.g. "SCSIAdapter"
  version: string;
  date: string;
  sizeMB: number;
}

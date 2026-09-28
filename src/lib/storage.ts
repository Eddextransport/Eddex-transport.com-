import type { AppData, ServiceOption, ServiceType } from '@/types';

const STORAGE_KEY = 'eddex_data_v1';

export const SERVICES: ServiceOption[] = [
  { id: 'oto_prive', label: 'Private Car', labelKr: 'Oto Prive', category: 'passenger', icon: 'Car', description: 'Comfortable private car ride' },
  { id: 'kamyonet', label: 'Van', labelKr: 'Kamyonèt', category: 'passenger', icon: 'Van', description: 'Group or family transport' },
  { id: 'bus', label: 'Bus', labelKr: 'Bus / Otobis', category: 'passenger', icon: 'Bus', description: 'Large group transport' },
  { id: 'moto', label: 'Motorcycle', labelKr: 'Moto Regilye', category: 'passenger', icon: 'Bike', description: 'Quick motorcycle ride' },
  { id: 'kamyon', label: 'Heavy Truck', labelKr: 'Kamyon', category: 'cargo', icon: 'Truck', description: 'Sand, rocks, heavy materials' },
  { id: 'moto_3wheel', label: '3-Wheel Moto', labelKr: 'Moto 3 Rou', category: 'cargo', icon: 'Bike', description: 'Small cargo deliveries' },
];

export function getService(id: ServiceType): ServiceOption | undefined {
  return SERVICES.find((s) => s.id === id);
}

const emptyData: AppData = { drivers: [], trips: [] };

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyData;
    const parsed = JSON.parse(raw) as AppData;
    return {
      drivers: parsed.drivers ?? [],
      trips: parsed.trips ?? [],
    };
  } catch {
    return emptyData;
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function formatHTG(amount: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount) + ' HTG';
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function isToday(ts: number): boolean {
  const d = new Date(ts);
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

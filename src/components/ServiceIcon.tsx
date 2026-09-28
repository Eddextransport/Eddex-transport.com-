import type { ServiceType } from '@/types';
import {
  Car, Caravan, Bus, Bike, Truck,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Car, Van: Caravan, Bus, Bike, Truck,
};

export function ServiceIcon({ type, className, size }: { type: string; className?: string; size?: number }) {
  const Icon = iconMap[type] ?? Car;
  return <Icon className={className} size={size} />;
}

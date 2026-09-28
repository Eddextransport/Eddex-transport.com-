export type ServiceCategory = 'passenger' | 'cargo';
export type ServiceType =
  | 'oto_prive'
  | 'kamyonet'
  | 'bus'
  | 'moto'
  | 'kamyon'
  | 'moto_3wheel';

export type TripStatus = 'pending' | 'accepted' | 'in_progress' | 'finished';

export interface ServiceOption {
  id: ServiceType;
  label: string;
  labelKr: string;
  category: ServiceCategory;
  icon: string;
  description: string;
}

export interface Customer {
  name: string;
  phone: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  active: boolean;
  debt: number;
  createdAt: number;
  idPhoto: string | null;
  selfiePhoto: string | null;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'driver';
  text: string;
  type: 'text' | 'audio';
  audioDuration?: number;
  timestamp: number;
}

export interface FeedbackReport {
  id: string;
  tripId: string;
  rating: 'good' | 'bad';
  message: string;
  createdAt: number;
}

export interface Trip {
  id: string;
  serviceType: ServiceType;
  customer: Customer;
  pickup: string;
  destination: string;
  status: TripStatus;
  driverId: string | null;
  driverName: string | null;
  price: number | null;
  commission: number | null;
  createdAt: number;
  acceptedAt: number | null;
  finishedAt: number | null;
  messages: ChatMessage[];
  customerPhoto: string | null;
  feedback: FeedbackReport | null;
}

export interface AppData {
  drivers: Driver[];
  trips: Trip[];
}

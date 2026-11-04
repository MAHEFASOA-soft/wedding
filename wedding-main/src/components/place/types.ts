export type PlaceType = 'Salle' | 'Domaine' | 'Hôtel' | 'Résidence' | 'Extérieur' | 'Autre';
export type PlaceStatus = 'Disponible' | 'Occupé' | 'Maintenance' | 'Indisponible';
export type EventStatus = 'Confirmé' | 'En préparation' | 'En cours' | 'Planifié' | 'Terminé' | 'Annulé';
export type TabKey = 'informations' | 'galerie' | 'localisation' | 'agenda';
export type ViewMode = 'grille' | 'tableau';
export type SortKey = 'recent' | 'nom' | 'prix-asc' | 'prix-desc' | 'capacite';

export interface PlaceEvent {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  client: string;
  guests: number;
  status: EventStatus;
}

export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  address: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  capacity: number;
  pricePerDay: number;
  phone: string;
  email: string;
  website: string;
  description: string;
  amenities: string[];
  mainImage: string;
  gallery: string[];
  status: PlaceStatus;
  events: PlaceEvent[];
}

export interface PlaceFormData {
  name: string;
  type: PlaceType;
  address: string;
  city: string;
  district: string;
  latitude: string;
  longitude: string;
  capacity: string;
  pricePerDay: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  amenities: string[];
  mainImage: string;
  gallery: string[];
  status: PlaceStatus;
}

export type FormErrors = Partial<Record<keyof PlaceFormData, string>>;

export const PLACE_TYPES: PlaceType[] = ['Salle', 'Domaine', 'Hôtel', 'Résidence', 'Extérieur', 'Autre'];
export const FORM_STATUSES: PlaceStatus[] = ['Disponible', 'Maintenance', 'Indisponible'];

export const AMENITIES = [
  { name: 'Parking', icon: 'Car' },
  { name: 'Climatisation', icon: 'Snowflake' },
  { name: 'Cuisine', icon: 'Utensils' },
  { name: 'Toilettes', icon: 'Bath' },
  { name: 'Électricité', icon: 'Zap' },
  { name: 'Wi-Fi', icon: 'Wifi' },
  { name: 'Sécurité', icon: 'ShieldCheck' },
  { name: 'Terrasse', icon: 'Building2' },
  { name: 'Jardin', icon: 'TreePine' },
  { name: 'Sonorisation', icon: 'Volume2' },
  { name: 'Éclairage', icon: 'Lightbulb' },
] as const;

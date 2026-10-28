import type { LucideIcon } from 'lucide-react';

export type NavigationTab =
  | 'dashboard'
  | 'reservations'
  | 'appointments'
  | 'events'
  | 'clients'
  | 'services'
  | 'pricing'
  | 'servers'
  | 'tasks'
  | 'quotes'
  | 'invoices'
  | 'payments'
  | 'finances'
  |  'places'
  | 'planning'
  | 'team'
  | 'statistics'
  | 'users'
  | 'roles-permissions'
  | 'settings'
  | 'equipment'
  | 'logistics';

export type PageKey =
  | 'dashboard'
  | 'transactions'
  | 'comptes'
  | 'projets'
  | 'clients'
  | 'revenus'
  | 'depenses'
  | 'facturation'
  | 'tresorerie'
  | 'planning'
  | 'budgets'
  | 'fournisseurs'
  | 'commissions'
  | 'rapports'
  | 'alertes'
  | 'cloture'
  | 'parametres'
  | 'comptabilite'
  | 'ecarts'
  | 'previsions';

export type NavigationItem = {
  key: PageKey;
  label: string;
  icon: LucideIcon;
};

export type EventStatus = 'Confirmé' | 'En cours' | 'Planifié' | 'Terminé' | 'Annulé';



export type EventType =
  | 'Mariage'
  | 'Fiançailles'
  | 'Anniversaire'
  | 'Cocktail / Réception'
  | 'Gala / Soirée'
  | 'Baptême';

export type MealType = 'Service' | 'Semi-buffet' | 'Buffet';

export interface EventItem {
  id: string;
  code: string;
  name: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  location: string;
  type: EventType;
  packId?: string;
  packName?: string;
  mealType?: MealType;
  includedServices?: string[];
  guestCount: number;
  totalPrice: number; // in Ariary
  amountReceived: number; // in Ariary
  status: EventStatus;
  coordinator: string;
  assignedServers: string[]; // server IDs or names
  notes?: string;
  image?: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes?: string;
  eventsCount: number;
  totalSpent: number;
  createdAt: string;
}

export interface Reservation {
  id: string;
  code: string;
  clientName: string;
  eventType: EventType;
  requestedDate: string;
  guestCount: number;
  estimatedBudget: number;
  contactPhone: string;
  contactEmail: string;
  status: 'En attente' | 'Validée' | 'Refusée';
  notes?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  date: string;
  time: string;
  purpose: 'Première consultation' | 'Visite de salle' | 'Validation devis' | 'Dégustation & Déco' | 'Bilan final';
  location: string;
  status: 'À venir' | 'Effectué' | 'Reporté' | 'Annulé';
  notes?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  category:
    | 'Organisation & Coordination'
    | 'Décoration & Art de table'
    | 'Cortège & Voitures'
    | 'Sonorisation & Lumière'
    | 'Photographie & Vidéo'
    | 'Mobilier & Tentes'
    | 'Traiteur & Cocktails'
    | 'Animations & Musique'
    | string;
  description: string;
  unitPrice: number;
  unit: string;
  isPopular?: boolean;
  image?: string;
  features?: string[];
  duration?: string;
}

export interface ServerStaff {
  id: string;
  name: string;
  phone: string;
  role: 'Maître d’hôtel' | 'Chef de rang' | 'Serveur' | 'Barman' | 'Hôtesse d’accueil';
  status: 'Disponible' | 'Assigné' | 'En congé';
  hourlyRate: number;
  assignedEventsCount: number;
  rating: number;
  dailyRate?: number;
  experience?: string;
  avatar?: string;
}

export type TaskPriority = 'Haute' | 'Moyenne' | 'Basse';
export type TaskStatus = 'À faire' | 'En cours' | 'Terminé';

export interface TaskItem {
  id: string;
  eventId?: string;
  eventName?: string;
  title: string;
  description?: string;
  assignedTo: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
}

export interface QuoteInvoice {
  id: string;
  number: string;
  type: 'devis' | 'facture';
  date: string;
  dueDate: string;
  clientName: string;
  eventName?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  totalAmount: number;
  status: 'Brouillon' | 'Envoyé' | 'Accepté' | 'Payé';
}

export interface ServicePackage {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: string;
  description: string;
  features: string[];
}

export interface QuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  version: number;
  parentQuoteId: string | null;
  eventId: string | null;
  createdAt: string;
  updatedAt: string;
  changeReason: string | null;
  clientName: string;
  eventName: string;
  date: string;
  validUntil: string;
  totalAmount: number;
  status: 'Brouillon' | 'Envoyé' | 'Accepté' | 'Refusé' | 'Remplacé';
  items: QuoteItem[];
}

export type QuoteCreationInput = Omit<Quote,
  'id' | 'quoteNumber' | 'version' | 'parentQuoteId' | 'eventId' | 'createdAt' | 'updatedAt' | 'changeReason'
> & Partial<Pick<Quote,
  'version' | 'parentQuoteId' | 'eventId' | 'createdAt' | 'updatedAt' | 'changeReason'
>>;

export type QuoteVersionInput = Omit<Pick<Quote,
  'clientName' | 'eventName' | 'date' | 'validUntil' | 'totalAmount' | 'items' | 'changeReason'
>, 'changeReason'> & { changeReason: string };

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  eventName: string;
  date: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  status: 'Payée' | 'Partiellement payée' | 'En attente' | 'En retard';
  items: QuoteItem[];
}

export type PaymentMethod = 'Espèces' | 'Virement bancaire' | 'Mobile Money' | 'Autre';

export type ReceiptCategory =
  | 'Paiement événement'
  | 'Acompte'
  | 'Solde événement'
  | 'Prestation'
  | 'Location'
  | 'Autre recette';

export interface FinanceReceipt {
  id: string;
  number: string;
  date: string;
  client: string;
  eventId?: string;
  eventName: string;
  description: string;
  category: ReceiptCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  comment?: string;
}

export type ExpenseCategory =
  | 'Aliments'
  | 'Transport'
  | 'Matériel'
  | 'Décoration'
  | 'Location'
  | 'Salaires'
  | 'Communication'
  | 'Fournitures'
  | 'Carburant'
  | 'Entretien'
  | 'Autres dépenses';

export interface FinanceExpense {
  id: string;
  number: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  supplier: string;
  eventId?: string;
  eventName?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  comment?: string;
}

export type SalaryStatus = 'À payer' | 'Partiellement payé' | 'Payé';

export interface SalaryRecord {
  id: string;
  employeeName: string;
  role: string;
  month: string; // e.g., "Septembre 2026"
  baseSalary: number;
  bonus: number;
  deduction: number;
  netPaid: number;
  paymentDate: string;
  status: SalaryStatus;
  comment?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  phone: string;
  email: string;
  status: 'Actif' | 'En mission' | 'En congé';
  avatar: string;
  monthlySalary?: number;
}

export interface EmployeeProfile {
  id: string;
  employeeType: 'Permanent' | 'Vacation' | 'Extra';
  department: string;
  experience: string;
  skills: string[];
  hireDate: string;
  availability: 'Disponible' | 'Affecté' | 'Indisponible';
  teamIds: string[];
  assignedEventIds: string[];
  notes: string;
  languages: string[];
  emergencyContact?: string;
}

export interface EventTeam {
  id: string;
  name: string;
  description: string;
  specialization: string;
  leaderId: string;
  memberIds: string[];
  assignedEventIds: string[];
  status: string;
  color: string;
  notes: string;
}

export interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  availableQuantity: number;
  condition: 'Excellent' | 'Bon' | 'À réparer' | 'Hors service';
  unitPrice: number;
  location: string;
}

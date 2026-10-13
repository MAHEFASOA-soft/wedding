import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  NavigationTab,
  EventItem,
  Client,
  Reservation,
  Appointment,
  ServiceItem,
  ServerStaff,
  TaskItem,
  Quote,
  QuoteCreationInput,
  QuoteVersionInput,
  Invoice,
  FinanceReceipt,
  FinanceExpense,
  SalaryRecord,
  TeamMember,
  EmployeeProfile,
  EventTeam,
  EquipmentItem,
  PaymentMethod,
} from '../types';
import {
  initialSalaries,
  initialReservations,
  initialAppointments,
  initialEquipment,
} from '../data/mockData';
import { api } from '../lib/api';
import type { PackPricing } from '../components/pricing1/pricingPackTypes';

const ensureWeddingPack = (event: EventItem, packs: PackPricing[]): EventItem => {
  const pack = packs.find((item) => item.id === event.packId);
  if (pack) {
    return {
      ...event,
      packName: pack.name,
    };
  }

  return event;
};

const normalizeEvents = (items: EventItem[], packs: PackPricing[] = []) =>
  items.map((event) => ensureWeddingPack(event, packs));

interface AppContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;

  // Search & Navigation
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Selected event modal
  selectedEventForModal: EventItem | null;
  setSelectedEventForModal: (event: EventItem | null) => void;
  eventToEdit: EventItem | null;
  setEventToEdit: (event: EventItem | null) => void;
  isEventEditModalOpen: boolean;
  setIsEventEditModalOpen: (open: boolean) => void;
  openCreateEventModal: () => void;
  openCreateEventModalFromQuote: (quote: Quote) => void;
  quoteForEventCreation: Quote | null;
  openEditEventModal: (event: EventItem) => void;
  closeEventEditModal: () => void;

  // Selected task modal (URL: /tasks/:id and /tasks/:id/edit)
  selectedTaskForModal: TaskItem | null;
  setSelectedTaskForModal: (task: TaskItem | null) => void;
  taskToEdit: TaskItem | null;
  isTaskEditModalOpen: boolean;
  openEditTaskModal: (task: TaskItem) => void;
  closeTaskEditModal: () => void;

  // Data collections
  events: EventItem[];
  eventsLoading: boolean;
  eventsLoadError: string | null;
  clients: Client[];
  clientsLoading: boolean;
  clientsLoadError: string | null;
  receipts: FinanceReceipt[];
  expenses: FinanceExpense[];
  salaries: SalaryRecord[];
  reservations: Reservation[];
  appointments: Appointment[];
  services: ServiceItem[];
  servicesLoading: boolean;
  servicesLoadError: string | null;
  pricingPacks: PackPricing[];
  pricingPacksLoading: boolean;
  pricingPacksLoadError: string | null;
  servers: ServerStaff[];
  tasks: TaskItem[];
  quotes: Quote[];
  quotesLoading: boolean;
  quotesLoadError: string | null;
  invoices: Invoice[];
  invoicesLoading: boolean;
  invoicesLoadError: string | null;
  team: TeamMember[];
  employeeProfiles: EmployeeProfile[];
  teamDataLoading: boolean;
  teamDataLoadError: string | null;
  equipment: EquipmentItem[];

  // Services actions
  addService: (service: Omit<ServiceItem, 'id'>) => Promise<boolean>;
  updateService: (service: ServiceItem) => Promise<boolean>;
  deleteService: (id: string) => Promise<boolean>;

  addPricingPack: (pack: Omit<PackPricing, 'id'>) => Promise<boolean>;
  updatePricingPack: (pack: PackPricing) => Promise<boolean>;
  deletePricingPack: (id: string) => Promise<boolean>;

  // CRUD actions
  addEvent: (event: Omit<EventItem, 'id' | 'code'>) => Promise<EventItem | null>;
  updateEvent: (event: EventItem) => Promise<boolean>;
  deleteEvent: (id: string) => Promise<boolean>;
  refreshEvents: () => Promise<boolean>;

  addReceipt: (receipt: Omit<FinanceReceipt, 'id' | 'number'>) => void;
  deleteReceipt: (id: string) => void;

  addExpense: (expense: Omit<FinanceExpense, 'id' | 'number'>) => void;
  deleteExpense: (id: string) => void;

  addSalary: (salary: Omit<SalaryRecord, 'id'>) => void;
  updateSalaryStatus: (id: string, newStatus: SalaryRecord['status'], paymentDate?: string) => void;
  deleteSalary: (id: string) => void;

  addClient: (client: Omit<Client, 'id' | 'eventsCount' | 'totalSpent' | 'createdAt'>) => Promise<boolean>;
  updateClient: (client: Client) => Promise<boolean>;
  deleteClient: (id: string) => Promise<boolean>;

  updateReservationStatus: (id: string, status: Reservation['status']) => void;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;

  addTask: (task: Omit<TaskItem, 'id'>) => void;
  updateTask: (task: TaskItem) => void;
  toggleTaskStatus: (id: string) => void;
  deleteTask: (id: string) => void;

  updateServerStatus: (id: string, status: ServerStaff['status']) => void;
  addServer: (server: Omit<ServerStaff, 'id'>) => Promise<ServerStaff | null>;
  updateServer: (server: ServerStaff) => Promise<boolean>;
  deleteServer: (id: string) => Promise<boolean>;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => Promise<TeamMember | null>;
  updateTeamMember: (member: TeamMember) => Promise<boolean>;
  deleteTeamMember: (id: string) => Promise<boolean>;
  eventTeams: EventTeam[];
  saveEmployeeProfile: (profile: EmployeeProfile) => Promise<boolean>;
  addEventTeam: (team: Omit<EventTeam, 'id'>) => Promise<EventTeam | null>;
  updateEventTeam: (team: EventTeam) => Promise<boolean>;
  deleteEventTeam: (id: string) => Promise<boolean>;
  addEquipment: (item: Omit<EquipmentItem, 'id'>) => void;
  deleteEquipment: (id: string) => void;
  updateTaskStatus: (id: string, status: TaskItem['status']) => void;

  addQuote: (quote: QuoteCreationInput) => Promise<Quote | null>;
  updateQuoteStatus: (id: string, status: Quote['status']) => Promise<boolean>;
  updateQuote: (quote: Quote) => Promise<boolean>;
  deleteQuote: (id: string) => Promise<boolean>;
  createQuoteVersion: (parentId: string, quote: QuoteVersionInput) => Promise<Quote | null>;
  updateQuoteEventId: (id: string, eventId: string) => Promise<boolean>;

  addInvoice: (
    invoice: Omit<Invoice, 'id' | 'invoiceNumber'>,
    initialPayment?: { amount: number; paymentMethod: PaymentMethod; comment?: string }
  ) => Promise<Invoice | null>;
  updateInvoice: (invoice: Invoice) => Promise<boolean>;
  deleteInvoice: (id: string) => Promise<boolean>;
  recordInvoicePayment: (
    id: string,
    payment: { amount: number; paymentMethod: PaymentMethod; comment?: string }
  ) => Promise<boolean>;

  // Financial calculations
  totalReceipts: number;
  totalExpenses: number;
  netProfit: number;
  pendingSalariesTotal: number;
  monthExpensesTotal: number;

  getEventFinancials: (eventId: string) => {
    totalPrice: number;
    amountReceived: number;
    amountRemaining: number;
    totalExpenses: number;
    netMargin: number;
    receipts: FinanceReceipt[];
    expenses: FinanceExpense[];
  };

  resetAllData: () => void;
  resetData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // The active tab is simply the first segment of the URL, e.g. /tasks/abc/edit -> 'tasks'
  const activeTab = (location.pathname.split('/').filter(Boolean)[0] ||
    'dashboard') as NavigationTab;

  // Changing tabs is now a real navigation, giving every menu item its own URL
  // (/dashboard, /finances, /tasks, ...)
  const setActiveTab = (tab: NavigationTab) => {
    navigate(`/${tab}`);
  };

  const [searchQuery, setSearchQuery] = useState<string>('');

  // --- Event detail/edit modal state, addressable via /events/:id and /events/:id/edit ---
  const [selectedEventForModal, setSelectedEventForModalState] = useState<EventItem | null>(null);
  const [eventToEdit, setEventToEdit] = useState<EventItem | null>(null);
  const [isEventEditModalOpen, setIsEventEditModalOpen] = useState<boolean>(false);
  const [quoteForEventCreation, setQuoteForEventCreation] = useState<Quote | null>(null);

  const setSelectedEventForModal = (event: EventItem | null) => {
    setSelectedEventForModalState(event);
    if (event) {
      navigate(`/events/${event.id}`);
    } else if (/^\/events\/[^/]+$/.test(location.pathname)) {
      // Only step back in the URL if we're actually on a detail URL
      navigate('/events');
    }
  };

  const showCreateEventModal = (quote?: Quote) => {
    if (quote && (quote.status !== 'Accepté' || quote.eventId)) return;
    setQuoteForEventCreation(quote ?? null);
    setEventToEdit(null);
    setIsEventEditModalOpen(true);
    navigate('/events/new');
  };

  const openCreateEventModal = () => showCreateEventModal();
  const openCreateEventModalFromQuote = (quote: Quote) => showCreateEventModal(quote);

  const openEditEventModal = (event: EventItem) => {
    setQuoteForEventCreation(null);
    setEventToEdit(event);
    setSelectedEventForModalState(null);
    setIsEventEditModalOpen(true);
    navigate(`/events/${event.id}/edit`);
  };

  const closeEventEditModal = () => {
    setIsEventEditModalOpen(false);
    setQuoteForEventCreation(null);
    const wasEditing = eventToEdit;
    setEventToEdit(null);
    if (/^\/events\/[^/]+\/edit$/.test(location.pathname) && wasEditing) {
      navigate(`/events/${wasEditing.id}`);
    } else if (location.pathname === '/events/new') {
      navigate('/events');
    }
  };

  // --- Task detail/edit modal state, addressable via /tasks/:id and /tasks/:id/edit ---
  const [selectedTaskForModal, setSelectedTaskForModalState] = useState<TaskItem | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<TaskItem | null>(null);
  const [isTaskEditModalOpen, setIsTaskEditModalOpen] = useState<boolean>(false);

  const setSelectedTaskForModal = (task: TaskItem | null) => {
    setSelectedTaskForModalState(task);
    if (task) {
      navigate(`/tasks/${task.id}`);
    } else if (/^\/tasks\/[^/]+$/.test(location.pathname)) {
      navigate('/tasks');
    }
  };

  const openEditTaskModal = (task: TaskItem) => {
    setTaskToEdit(task);
    setSelectedTaskForModalState(null);
    setIsTaskEditModalOpen(true);
    navigate(`/tasks/${task.id}/edit`);
  };

  const closeTaskEditModal = () => {
    setIsTaskEditModalOpen(false);
    const wasEditing = taskToEdit;
    setTaskToEdit(null);
    if (/^\/tasks\/[^/]+\/edit$/.test(location.pathname) && wasEditing) {
      navigate(`/tasks/${wasEditing.id}`);
    }
  };

  const [isLoadingApi, setIsLoadingApi] = useState(true);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsLoadError, setEventsLoadError] = useState<string | null>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientsLoadError, setClientsLoadError] = useState<string | null>(null);

  const [receipts, setReceipts] = useState<FinanceReceipt[]>([]);

  const [expenses, setExpenses] = useState<FinanceExpense[]>([]);

  const [salaries, setSalaries] = useState<SalaryRecord[]>(initialSalaries);

  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);

  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesLoadError, setServicesLoadError] = useState<string | null>(null);
  const [pricingPacks, setPricingPacks] = useState<PackPricing[]>([]);
  const [pricingPacksLoading, setPricingPacksLoading] = useState(true);
  const [pricingPacksLoadError, setPricingPacksLoadError] = useState<string | null>(null);

  const [servers, setServers] = useState<ServerStaff[]>([]);

  const [tasks, setTasks] = useState<TaskItem[]>([]);

  // Keep the event modals in sync with the URL: typing /events/EVT-123/edit,
  // using the browser back/forward buttons, or opening a bookmarked link all
  // need to open the right modal without any button click.
  useEffect(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts[0] !== 'events') return;

    if (parts[1] === 'new') {
      setEventToEdit(null);
      setIsEventEditModalOpen(true);
      setSelectedEventForModalState(null);
      return;
    }

    if (parts[1]) {
      const found = events.find((e) => e.id === parts[1]) || null;
      if (parts[2] === 'edit') {
        setEventToEdit(found);
        setIsEventEditModalOpen(Boolean(found));
        setSelectedEventForModalState(null);
      } else {
        setSelectedEventForModalState(found);
        setIsEventEditModalOpen(false);
        setEventToEdit(null);
      }
    } else {
      setSelectedEventForModalState(null);
      setIsEventEditModalOpen(false);
      setEventToEdit(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, events]);

  // Same idea for tasks: /tasks/:id opens the detail view, /tasks/:id/edit opens edit.
  useEffect(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts[0] !== 'tasks' || !parts[1]) {
      if (parts[0] !== 'tasks') {
        setSelectedTaskForModalState(null);
        setIsTaskEditModalOpen(false);
        setTaskToEdit(null);
      }
      return;
    }

    const found = tasks.find((t) => t.id === parts[1]) || null;
    if (parts[2] === 'edit') {
      setTaskToEdit(found);
      setIsTaskEditModalOpen(Boolean(found));
      setSelectedTaskForModalState(null);
    } else {
      setSelectedTaskForModalState(found);
      setIsTaskEditModalOpen(false);
      setTaskToEdit(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, tasks]);

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(true);
  const [quotesLoadError, setQuotesLoadError] = useState<string | null>(null);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [invoicesLoadError, setInvoicesLoadError] = useState<string | null>(null);

  const [team, setTeam] = useState<TeamMember[]>([]);
  const [employeeProfiles, setEmployeeProfiles] = useState<EmployeeProfile[]>([]);
  const [eventTeams, setEventTeams] = useState<EventTeam[]>([]);
  const [teamDataLoading, setTeamDataLoading] = useState(true);
  const [teamDataLoadError, setTeamDataLoadError] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<EquipmentItem[]>(initialEquipment);

  // Sync to local storage
  useEffect(() => {
    if (location.pathname === '/statistics') {
      setIsLoadingApi(false);
      return;
    }

    let mounted = true;

    const bootstrapFromApi = async () => {
      const [
        apiEvents,
        apiClients,
        apiReservations,
        apiAppointments,
        apiServices,
        apiPricingPacks,
        apiTasks,
        apiQuotes,
        apiInvoices,
        apiTeam,
        apiEquipment,
        apiServers,
        apiReceipts,
        apiExpenses,
        apiSalaries,
        apiEventTeams,
        apiEmployeeProfiles,
      ] = await Promise.all([
        api.get<EventItem[]>('/events'),
        api.get<Client[]>('/clients'),
        api.get<Reservation[]>('/reservations'),
        api.get<Appointment[]>('/appointments'),
        api.get<ServiceItem[]>('/services'),
        api.get<PackPricing[]>('/pricing-packs'),
        api.get<TaskItem[]>('/tasks'),
        api.get<Quote[]>('/quotes'),
        api.get<Invoice[]>('/invoices'),
        api.get<TeamMember[]>('/team'),
        api.get<EquipmentItem[]>('/equipment'),
        api.get<ServerStaff[]>('/servers'),
        api.get<FinanceReceipt[]>('/receipts'),
        api.get<FinanceExpense[]>('/expenses'),
        api.get<SalaryRecord[]>('/salaries'),
        api.get<EventTeam[]>('/event-teams'),
        api.get<EmployeeProfile[]>('/employee-profiles'),
      ]);

      if (!mounted) return;

      if (apiPricingPacks) {
        setPricingPacks(apiPricingPacks);
        setPricingPacksLoadError(null);
      } else {
        setPricingPacks([]);
        setPricingPacksLoadError('Impossible de charger les tarifs depuis le serveur.');
      }
      setPricingPacksLoading(false);
      if (apiEvents) {
        setEvents(normalizeEvents(apiEvents, apiPricingPacks || []));
        setEventsLoadError(null);
      } else {
        setEvents([]);
        setEventsLoadError('Impossible de charger les événements depuis le serveur.');
      }
      setEventsLoading(false);
      if (apiClients) {
        setClients(apiClients.map((client) => ({
          ...client,
          phone: client.phone ?? '',
          email: client.email ?? '',
          address: client.address ?? '',
        })));
        setClientsLoadError(null);
      } else {
        setClients([]);
        setClientsLoadError('Impossible de charger les clients depuis le serveur.');
      }
      setClientsLoading(false);
      if (apiReservations && apiReservations.length > 0) setReservations(apiReservations);
      if (apiAppointments && apiAppointments.length > 0) setAppointments(apiAppointments);
      if (apiServices) {
        setServices(apiServices.map((service) => ({
          ...service,
          isPopular: service.isPopular ?? false,
          image: service.image ?? '',
          features: service.features ?? [],
          duration: service.duration ?? '',
        })));
        setServicesLoadError(null);
      } else {
        setServices([]);
        setServicesLoadError('Impossible de charger le catalogue depuis le serveur.');
      }
      setServicesLoading(false);
      setTasks(apiTasks ?? []);
      if (apiQuotes) {
        setQuotes(apiQuotes);
        setQuotesLoadError(null);
      } else {
        setQuotes([]);
        setQuotesLoadError('Impossible de charger les devis depuis le serveur.');
      }
      setQuotesLoading(false);
      if (apiInvoices) {
        setInvoices(apiInvoices);
        setInvoicesLoadError(null);
      } else {
        setInvoices([]);
        setInvoicesLoadError('Impossible de charger les factures depuis le serveur.');
      }
      setInvoicesLoading(false);
      setTeam(apiTeam ?? []);
      setEmployeeProfiles(apiEmployeeProfiles ?? []);
      if (apiEquipment && apiEquipment.length > 0) setEquipment(apiEquipment);
      setServers(apiServers ?? []);
      setEventTeams(apiEventTeams ?? []);
      setTeamDataLoadError(apiTeam && apiServers && apiEventTeams && apiEmployeeProfiles
        ? null
        : 'Impossible de charger tout le personnel et les équipes depuis le serveur.');
      setTeamDataLoading(false);
      setReceipts(apiReceipts ?? []);
      setExpenses(apiExpenses ?? []);
      if (apiSalaries && apiSalaries.length > 0) setSalaries(apiSalaries);

      setIsLoadingApi(false);
    };

    bootstrapFromApi();

    return () => {
      mounted = false;
    };
  }, []);

  // Global Financial Totals
  const totalReceipts = receipts.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const netProfit = totalReceipts - totalExpenses;

  const pendingSalariesTotal = salaries
    .filter((s) => s.status === 'À payer' || s.status === 'Partiellement payé')
    .reduce((acc, curr) => acc + (curr.netPaid || 0), 0);

  const monthExpensesTotal = expenses
    .filter((e) => {
      const now = new Date();
      const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return e.date?.startsWith(currentMonthStr) || e.date?.startsWith('2026-08');
    })
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  // Helper to compute event financials
  const getEventFinancials = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) {
      return {
        totalPrice: 0,
        amountReceived: 0,
        amountRemaining: 0,
        totalExpenses: 0,
        netMargin: 0,
        receipts: [],
        expenses: [],
      };
    }

    const eventReceipts = receipts.filter((r) => r.eventId === eventId);
    const eventExpenses = expenses.filter((e) => e.eventId === eventId);

    const received = eventReceipts.length > 0
      ? eventReceipts.reduce((acc, curr) => acc + curr.amount, 0)
      : event.amountReceived;

    const remaining = Math.max(0, event.totalPrice - received);
    const eventExpTotal = eventExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    const netMargin = received - eventExpTotal;

    return {
      totalPrice: event.totalPrice,
      amountReceived: received,
      amountRemaining: remaining,
      totalExpenses: eventExpTotal,
      netMargin,
      receipts: eventReceipts,
      expenses: eventExpenses,
    };
  };

  const refreshEvents = async (): Promise<boolean> => {
    setEventsLoading(true);
    setEventsLoadError(null);
    const result = await api.get<EventItem[]>('/events');
    if (!result) {
      setEvents([]);
      setEventsLoadError('Impossible de charger les événements depuis le serveur.');
      setEventsLoading(false);
      return false;
    }

    setEvents(normalizeEvents(result, pricingPacks));
    setEventsLoading(false);
    return true;
  };

  // Event Actions
  const addEvent = async (newEventData: Omit<EventItem, 'id' | 'code'>): Promise<EventItem | null> => {
    const saved = await api.post<EventItem>('/events', newEventData);
    if (!saved) return null;

    const savedEvent = ensureWeddingPack(saved, pricingPacks);
    setEvents((prev) => [savedEvent, ...prev.filter((event) => event.id !== savedEvent.id)]);
    setEventsLoadError(null);
    setEventsLoading(false);
    if (savedEvent.amountReceived > 0) {
      const newRec: FinanceReceipt = {
        id: `rec-${Date.now()}`,
        number: `REC-2026-${String(receipts.length + 1).padStart(3, '0')}`,
        date: savedEvent.date,
        client: savedEvent.clientName,
        eventId: savedEvent.id,
        eventName: savedEvent.name,
        description: `Acompte initial d'enregistrement pour ${savedEvent.name}`,
        category: 'Acompte',
        amount: newEvent.amountReceived,
        paymentMethod: 'Virement bancaire',
        comment: 'Enregistré automatiquement lors de la création de l’événement',
      };
      const savedReceipt = await api.post<FinanceReceipt>('/receipts', newRec);
      if (savedReceipt) setReceipts((prev) => [savedReceipt, ...prev]);
    }
    return savedEvent;
  };

  const updateEvent = async (updated: EventItem): Promise<boolean> => {
    const normalizedEvent = ensureWeddingPack(updated, pricingPacks);
    const saved = await api.put<EventItem>(`/events/${normalizedEvent.id}`, normalizedEvent);
    if (!saved) return false;

    const finalEvent = ensureWeddingPack(saved, pricingPacks);
    setEvents((prev) => prev.map((e) => (e.id === finalEvent.id ? finalEvent : e)));
    if (selectedEventForModal?.id === finalEvent.id) setSelectedEventForModal(finalEvent);
    return true;
  };

  const deleteEvent = async (id: string): Promise<boolean> => {
    const result = await api.del<{ success: boolean }>(`/events/${id}`);
    if (!result?.success) return false;
    setEvents((prev) => prev.filter((e) => e.id !== id));
    if (selectedEventForModal?.id === id) setSelectedEventForModal(null);
    return true;
  };

  // Receipt Actions
  const addReceipt = (receiptData: Omit<FinanceReceipt, 'id' | 'number'>) => {
    const nextNum = `REC-2026-${String(receipts.length + 1).padStart(3, '0')}`;
    const newReceipt: FinanceReceipt = {
      ...receiptData,
      id: `rec-${Date.now()}`,
      number: nextNum,
    };
    void api.post<FinanceReceipt>('/receipts', newReceipt).then((saved) => {
      if (saved) {
        setReceipts((prev) => [saved, ...prev.filter((r) => r.id !== saved.id)]);
      } else {
        setReceipts((prev) => [newReceipt, ...prev]);
      }
    });
    setReceipts((prev) => [newReceipt, ...prev]);

    // Automatically update event amountReceived if linked to an event
    if (receiptData.eventId) {
      setEvents((prev) =>
        prev.map((e) => {
          if (e.id === receiptData.eventId) {
            const updatedReceived = (e.amountReceived || 0) + receiptData.amount;
            return {
              ...e,
              amountReceived: updatedReceived,
            };
          }
          return e;
        })
      );
    }
  };

  const deleteReceipt = (id: string) => {
    const toDelete = receipts.find((r) => r.id === id);
    if (toDelete && toDelete.eventId) {
      // Adjust event amount received
      setEvents((prev) =>
        prev.map((e) => {
          if (e.id === toDelete.eventId) {
            return {
              ...e,
              amountReceived: Math.max(0, (e.amountReceived || 0) - toDelete.amount),
            };
          }
          return e;
        })
      );
    }
    void api.del<{ success: boolean }>(`/receipts/${id}`);
    setReceipts((prev) => prev.filter((r) => r.id !== id));
  };

  // Expense Actions
  const addExpense = (expenseData: Omit<FinanceExpense, 'id' | 'number'>) => {
    const nextNum = `DEP-2026-${String(expenses.length + 1).padStart(3, '0')}`;
    const newExpense: FinanceExpense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      number: nextNum,
    };
    void api.post<FinanceExpense>('/expenses', newExpense).then((saved) => {
      if (saved) {
        setExpenses((prev) => [saved, ...prev.filter((e) => e.id !== saved.id)]);
      } else {
        setExpenses((prev) => [newExpense, ...prev]);
      }
    });
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const deleteExpense = (id: string) => {
    void api.del<{ success: boolean }>(`/expenses/${id}`);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Salary Actions
  const addSalary = (salaryData: Omit<SalaryRecord, 'id'>) => {
    const newSal: SalaryRecord = {
      ...salaryData,
      id: `sal-${Date.now()}`,
    };
    void api.post<SalaryRecord>('/salaries', newSal).then((saved) => {
      if (saved) {
        setSalaries((prev) => [saved, ...prev.filter((s) => s.id !== saved.id)]);
      } else {
        setSalaries((prev) => [newSal, ...prev]);
      }
    });
    setSalaries((prev) => [newSal, ...prev]);

    // If marked as paid, automatically log as an enterprise expense
    if (newSal.status === 'Payé') {
      const nextNum = `DEP-2026-${String(expenses.length + 1).padStart(3, '0')}`;
      const expenseItem: FinanceExpense = {
        id: `exp-${Date.now()}`,
        number: nextNum,
        date: newSal.paymentDate || new Date().toISOString().split('T')[0],
        category: 'Salaires',
        description: `Paiement salaire ${newSal.month} — ${newSal.employeeName} (${newSal.role})`,
        supplier: newSal.employeeName,
        amount: newSal.netPaid,
        paymentMethod: 'Virement bancaire',
        comment: 'Comptabilisation automatique de paie',
      };
      void api.post<FinanceExpense>('/expenses', expenseItem);
      setExpenses((prev) => [expenseItem, ...prev]);
    }
  };

  const updateSalaryStatus = (id: string, newStatus: SalaryRecord['status'], paymentDate?: string) => {
    const target = salaries.find((s) => s.id === id);
    if (!target) return;

    const updated: SalaryRecord = {
      ...target,
      status: newStatus,
      paymentDate: paymentDate || (newStatus === 'Payé' ? new Date().toISOString().split('T')[0] : target.paymentDate),
    };

    void api.put<SalaryRecord>(`/salaries/${id}`, updated).then((saved) => {
      const finalSalary = saved ?? updated;
      setSalaries((prev) => prev.map((s) => (s.id === finalSalary.id ? finalSalary : s)));
    });
    setSalaries((prev) => prev.map((s) => (s.id === id ? updated : s)));

    // If changed to Payé, auto log expense
    if (newStatus === 'Payé' && target.status !== 'Payé') {
      const nextNum = `DEP-2026-${String(expenses.length + 1).padStart(3, '0')}`;
      const expenseItem: FinanceExpense = {
        id: `exp-${Date.now()}`,
        number: nextNum,
        date: updated.paymentDate,
        category: 'Salaires',
        description: `Paiement salaire ${updated.month} — ${updated.employeeName}`,
        supplier: updated.employeeName,
        amount: updated.netPaid,
        paymentMethod: 'Virement bancaire',
        comment: 'Génération automatique suite au paiement du salaire',
      };
      void api.post<FinanceExpense>('/expenses', expenseItem);
      setExpenses((prevExp) => [expenseItem, ...prevExp]);
    }
  };

  const deleteSalary = (id: string) => {
    void api.del<{ success: boolean }>(`/salaries/${id}`);
    setSalaries((prev) => prev.filter((s) => s.id !== id));
  };

  // Client Actions
  const addClient = async (data: Omit<Client, 'id' | 'eventsCount' | 'totalSpent' | 'createdAt'>): Promise<boolean> => {
    const saved = await api.post<Client>('/clients', data);
    if (!saved) return false;

    setClients((prev) => [saved, ...prev.filter((client) => client.id !== saved.id)]);
    return true;
  };

  const updateClient = async (updated: Client): Promise<boolean> => {
    const saved = await api.put<Client>(`/clients/${updated.id}`, updated);
    if (!saved) return false;

    setClients((prev) => prev.map((client) => (client.id === saved.id ? saved : client)));
    setEvents((prev) => prev.map((event) => event.clientId === saved.id
      ? { ...event, clientName: saved.name, clientPhone: saved.phone }
      : event));
    return true;
  };

  const deleteClient = async (id: string): Promise<boolean> => {
    const result = await api.del<{ success: boolean }>(`/clients/${id}`);
    if (!result?.success) return false;

    setClients((prev) => prev.filter((c) => c.id !== id));
    return true;
  };

  // Reservation Actions
  const updateReservationStatus = (id: string, status: Reservation['status']) => {
    const target = reservations.find((r) => r.id === id);
    if (!target) return;

    const updated: Reservation = { ...target, status };
    void api.put<Reservation>(`/reservations/${id}`, updated).then((saved) => {
      const finalReservation = saved ?? updated;
      setReservations((prev) => prev.map((r) => (r.id === finalReservation.id ? finalReservation : r)));
    });
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  // Appointment Actions
  const addAppointment = (data: Omit<Appointment, 'id'>) => {
    const newApt: Appointment = {
      ...data,
      id: `apt-${Date.now()}`,
    };
    void api.post<Appointment>('/appointments', newApt).then((saved) => {
      if (saved) {
        setAppointments((prev) => [saved, ...prev.filter((a) => a.id !== saved.id)]);
      } else {
        setAppointments((prev) => [newApt, ...prev]);
      }
    });
    setAppointments((prev) => [newApt, ...prev]);
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    const target = appointments.find((a) => a.id === id);
    if (!target) return;

    const updated: Appointment = { ...target, status };
    void api.put<Appointment>(`/appointments/${id}`, updated).then((saved) => {
      const finalAppointment = saved ?? updated;
      setAppointments((prev) => prev.map((a) => (a.id === finalAppointment.id ? finalAppointment : a)));
    });
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  // Task Actions
  const addTask = (data: Omit<TaskItem, 'id'>) => {
    const newTask: TaskItem = {
      ...data,
      id: `tsk-${Date.now()}`,
    };
    void api.post<TaskItem>('/tasks', newTask).then((saved) => {
      if (saved) {
        setTasks((prev) => [saved, ...prev.filter((t) => t.id !== saved.id)]);
      } else {
        setTasks((prev) => [newTask, ...prev]);
      }
    });
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (updated: TaskItem) => {
    void api.put<TaskItem>(`/tasks/${updated.id}`, updated).then((saved) => {
      const finalTask = saved ?? updated;
      setTasks((prev) => prev.map((t) => (t.id === finalTask.id ? finalTask : t)));
      setSelectedTaskForModalState((prev) => (prev?.id === finalTask.id ? finalTask : prev));
    });
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTaskForModalState((prev) => (prev?.id === updated.id ? updated : prev));
  };

  const toggleTaskStatus = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;
    const nextStatus: TaskItem['status'] = target.status === 'Terminé' ? 'À faire' : 'Terminé';
    void api.patch<TaskItem>(`/tasks/${id}`, { status: nextStatus }).then((saved) => {
      if (saved) {
        setTasks((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
      }
    });
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t)));
  };

  const updateTaskStatus = (id: string, status: TaskItem['status']) => {
    void api.patch<TaskItem>(`/tasks/${id}`, { status }).then((saved) => {
      if (saved) {
        setTasks((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
      }
    });
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, status } : task)));
  };

  const deleteTask = (id: string) => {
    void api.del<{ success: boolean }>(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshEmployeeProfiles = async () => {
    const profiles = await api.get<EmployeeProfile[]>('/employee-profiles');
    if (profiles) setEmployeeProfiles(profiles);
  };

  // Server Actions
  const updateServerStatus = (id: string, status: ServerStaff['status']) => {
    void api.patch<ServerStaff>(`/servers/${id}`, { status }).then((saved) => {
      if (saved) {
        setServers((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));
      }
    });
    setServers((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const addServer = async (data: Omit<ServerStaff, 'id'>): Promise<ServerStaff | null> => {
    const newSrv: ServerStaff = {
      ...data,
      id: `srv-${Date.now()}`,
    };
    const saved = await api.post<ServerStaff>('/servers', newSrv);
    if (!saved) return null;
    setServers((prev) => [saved, ...prev.filter((server) => server.id !== saved.id)]);
    await refreshEmployeeProfiles();
    return saved;
  };

  const updateServer = async (server: ServerStaff): Promise<boolean> => {
    const saved = await api.put<ServerStaff>(`/servers/${server.id}`, server);
    if (!saved) return false;
    setServers((current) => current.map((item) => item.id === saved.id ? saved : item));
    setEmployeeProfiles((current) => current.map((profile) => profile.id === saved.id
      ? { ...profile, department: saved.role === 'Barman' ? 'Cocktail & Bar' : saved.role === 'Hôtesse d’accueil' ? 'Accueil & Protocole' : 'Service', experience: saved.experience ?? '', availability: saved.status === 'Disponible' ? 'Disponible' : saved.status === 'En congé' ? 'Indisponible' : 'Affecté' }
      : profile));
    return true;
  };

  const deleteServer = async (id: string): Promise<boolean> => {
    const result = await api.del<{ success: boolean }>(`/servers/${id}`);
    if (!result?.success) return false;
    setServers((current) => current.filter((server) => server.id !== id));
    setEmployeeProfiles((current) => current.filter((profile) => profile.id !== id));
    return true;
  };

  const addTeamMember = async (data: Omit<TeamMember, 'id'>): Promise<TeamMember | null> => {
    const newMember: TeamMember = { ...data, id: `team-${Date.now()}` };
    const saved = await api.post<TeamMember>('/team', newMember);
    if (!saved) return null;
    setTeam((prev) => [saved, ...prev.filter((member) => member.id !== saved.id)]);
    await refreshEmployeeProfiles();
    return saved;
  };

  const updateTeamMember = async (member: TeamMember): Promise<boolean> => {
    const saved = await api.put<TeamMember>(`/team/${member.id}`, member);
    if (!saved) return false;
    setTeam((current) => current.map((item) => item.id === saved.id ? saved : item));
    setEmployeeProfiles((current) => current.map((profile) => profile.id === saved.id
      ? { ...profile, department: saved.department, availability: saved.status === 'Actif' ? 'Disponible' : 'Affecté' }
      : profile));
    return true;
  };

  const deleteTeamMember = async (id: string): Promise<boolean> => {
    const result = await api.del<{ success: boolean }>(`/team/${id}`);
    if (!result?.success) return false;
    setTeam((current) => current.filter((member) => member.id !== id));
    setEmployeeProfiles((current) => current.filter((profile) => profile.id !== id));
    return true;
  };

  const addEventTeam = async (data: Omit<EventTeam, 'id'>): Promise<EventTeam | null> => {
    const saved = await api.post<EventTeam>('/event-teams', { ...data, id: `team-${Date.now()}` });
    if (!saved) return null;
    setEventTeams((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
    return saved;
  };

  const saveEmployeeProfile = async (profile: EmployeeProfile): Promise<boolean> => {
    const saved = await api.put<EmployeeProfile>(`/employee-profiles/${profile.id}`, profile);
    if (!saved) return false;
    setEmployeeProfiles((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
    return true;
  };

  const updateEventTeam = async (team: EventTeam): Promise<boolean> => {
    const saved = await api.put<EventTeam>(`/event-teams/${team.id}`, team);
    if (!saved) return false;
    setEventTeams((current) => current.map((item) => item.id === saved.id ? saved : item));
    return true;
  };

  const deleteEventTeam = async (id: string): Promise<boolean> => {
    const result = await api.del<{ success: boolean }>(`/event-teams/${id}`);
    if (!result?.success) return false;
    setEventTeams((current) => current.filter((item) => item.id !== id));
    return true;
  };

  const addEquipment = (data: Omit<EquipmentItem, 'id'>) => {
    const newItem: EquipmentItem = { ...data, id: `equipment-${Date.now()}` };
    void api.post<EquipmentItem>('/equipment', newItem).then((saved) => {
      if (saved) {
        setEquipment((prev) => [saved, ...prev.filter((item) => item.id !== saved.id)]);
      } else {
        setEquipment((prev) => [newItem, ...prev]);
      }
    });
    setEquipment((prev) => [newItem, ...prev]);
  };

  const deleteEquipment = (id: string) => {
    void api.del<{ success: boolean }>(`/equipment/${id}`);
    setEquipment((prev) => prev.filter((item) => item.id !== id));
  };

  // Quote & Invoice Actions
  const addQuote = async (data: QuoteCreationInput): Promise<Quote | null> => {
    const saved = await api.post<Quote>('/quotes', data);
    if (!saved) return null;

    setQuotes((current) => [saved, ...current.filter((quote) => quote.id !== saved.id)]);
    return saved;
  };

  const updateQuoteStatus = async (id: string, status: Quote['status']): Promise<boolean> => {
    const current = quotes.find((quote) => quote.id === id);
    if (
      !current ||
      status === 'Remplacé' ||
      ['Refusé', 'Remplacé'].includes(current.status) ||
      (current.status === 'Accepté' && status !== 'Accepté')
    ) return false;

    const saved = await api.patch<Quote>(`/quotes/${id}`, { status });
    if (!saved) return false;
    setQuotes((previous) => previous.map((quote) => quote.id === saved.id ? saved : quote));
    return true;
  };

  const updateQuote = async (updated: Quote): Promise<boolean> => {
    if (updated.status !== 'Brouillon') return false;
    const saved = await api.put<Quote>(`/quotes/${updated.id}`, updated);
    if (!saved) return false;
    setQuotes((current) => current.map((quote) => quote.id === saved.id ? saved : quote));
    return true;
  };

  const deleteQuote = async (id: string): Promise<boolean> => {
    const result = await api.del<{ success: boolean }>(`/quotes/${id}`);
    if (!result?.success) return false;
    setQuotes((current) => current.filter((quote) => quote.id !== id));
    return true;
  };

  const createQuoteVersion = async (parentId: string, data: QuoteVersionInput): Promise<Quote | null> => {
    const parent = quotes.find((quote) => quote.id === parentId);
    if (!parent || parent.status !== 'Envoyé' || !data.changeReason.trim()) return null;

    const saved = await api.post<Quote>(`/quotes/${parent.id}/versions`, data);
    if (!saved) return null;

    setQuotes((current) => [
      saved,
      ...current.map((quote) => quote.id === parent.id
        ? { ...quote, status: 'Remplacé' as const, updatedAt: saved.updatedAt }
        : quote),
    ]);
    return saved;
  };

  const updateQuoteEventId = async (id: string, eventId: string): Promise<boolean> => {
    const quote = quotes.find((item) => item.id === id);
    if (!quote || quote.status !== 'Accepté' || quote.eventId) return false;

    const saved = await api.patch<Quote>(`/quotes/${id}/event`, { eventId });
    if (!saved) return false;
    setQuotes((current) => current.map((item) => item.id === id ? saved : item));
    return true;
  };

  const addInvoice = async (
    data: Omit<Invoice, 'id' | 'invoiceNumber'>,
    initialPayment?: { amount: number; paymentMethod: PaymentMethod; comment?: string }
  ): Promise<Invoice | null> => {
    const result = await api.post<{ invoice: Invoice; receipt: FinanceReceipt | null }>('/invoices', {
      ...data,
      initialPayment: initialPayment ?? null,
    });
    if (!result?.invoice) return null;

    setInvoices((current) => [result.invoice, ...current.filter((invoice) => invoice.id !== result.invoice.id)]);
    if (result.receipt) {
      setReceipts((current) => [result.receipt!, ...current.filter((receipt) => receipt.id !== result.receipt!.id)]);
    }
    return result.invoice;
  };

  const updateInvoice = async (updated: Invoice): Promise<boolean> => {
    const saved = await api.put<Invoice>(`/invoices/${updated.id}`, updated);
    if (!saved) return false;
    setInvoices((current) => current.map((invoice) => invoice.id === saved.id ? saved : invoice));
    return true;
  };

  const deleteInvoice = async (id: string): Promise<boolean> => {
    const result = await api.del<{ success: boolean }>(`/invoices/${id}`);
    if (!result?.success) return false;
    setInvoices((current) => current.filter((invoice) => invoice.id !== id));
    return true;
  };

  const recordInvoicePayment = async (
    id: string,
    payment: { amount: number; paymentMethod: PaymentMethod; comment?: string }
  ): Promise<boolean> => {
    const result = await api.post<{ invoice: Invoice; receipt: FinanceReceipt }>(`/invoices/${id}/payments`, payment);
    if (!result?.invoice || !result.receipt) return false;
    setInvoices((current) => current.map((invoice) => invoice.id === result.invoice.id ? result.invoice : invoice));
    setReceipts((current) => [result.receipt, ...current.filter((receipt) => receipt.id !== result.receipt.id)]);
    return true;
  };

  // Service Actions
  const addService = async (data: Omit<ServiceItem, 'id'>): Promise<boolean> => {
    const saved = await api.post<ServiceItem>('/services', data);
    if (!saved) return false;

    setServices((prev) => [saved, ...prev.filter((service) => service.id !== saved.id)]);
    return true;
  };

  const updateService = async (updated: ServiceItem): Promise<boolean> => {
    const saved = await api.put<ServiceItem>(`/services/${updated.id}`, updated);
    if (!saved) return false;

    setServices((prev) => prev.map((service) => (service.id === saved.id ? saved : service)));
    return true;
  };

  const deleteService = async (id: string): Promise<boolean> => {
    const result = await api.del<{ success: boolean }>(`/services/${id}`);
    if (!result?.success) return false;

    setServices((prev) => prev.filter((s) => s.id !== id));
    return true;
  };

  const addPricingPack = async (data: Omit<PackPricing, 'id'>): Promise<boolean> => {
    const saved = await api.post<PackPricing>('/pricing-packs', data);
    if (!saved) return false;

    setPricingPacks((current) => [saved, ...current.filter((pack) => pack.id !== saved.id)]);
    return true;
  };

  const updatePricingPack = async (updated: PackPricing): Promise<boolean> => {
    const saved = await api.put<PackPricing>(`/pricing-packs/${updated.id}`, updated);
    if (!saved) return false;

    setPricingPacks((current) => current.map((pack) => pack.id === saved.id ? saved : pack));
    setEvents((current) => current.map((event) => event.packId === saved.id
      ? { ...event, packName: saved.name }
      : event));
    return true;
  };

  const deletePricingPack = async (id: string): Promise<boolean> => {
    const result = await api.del<{ success: boolean }>(`/pricing-packs/${id}`);
    if (!result?.success) return false;

    setPricingPacks((current) => current.filter((pack) => pack.id !== id));
    return true;
  };

  // Reset to initial mock data
  const resetAllData = () => {
    setEvents([]);
    setClients([]);
    setReceipts([]);
    setExpenses([]);
    setSalaries(initialSalaries);
    setReservations(initialReservations);
    setAppointments(initialAppointments);
    setServers([]);
    setEmployeeProfiles([]);
    setTasks([]);
    setQuotes([]);
    setInvoices([]);
    setServices([]);
    setPricingPacks([]);
    setTeam([]);
    setEmployeeProfiles([]);
    setEventTeams([]);
    setEquipment(initialEquipment);
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        selectedEventForModal,
        setSelectedEventForModal,
        eventToEdit,
        setEventToEdit,
        isEventEditModalOpen,
        setIsEventEditModalOpen,
        openCreateEventModal,
        openCreateEventModalFromQuote,
        quoteForEventCreation,
        openEditEventModal,
        closeEventEditModal,
        selectedTaskForModal,
        setSelectedTaskForModal,
        taskToEdit,
        isTaskEditModalOpen,
        openEditTaskModal,
        closeTaskEditModal,
        events,
        eventsLoading,
        eventsLoadError,
        refreshEvents,
        clients,
        clientsLoading,
        clientsLoadError,
        receipts,
        expenses,
        salaries,
        reservations,
        appointments,
        services,
        servicesLoading,
        servicesLoadError,
        pricingPacks,
        pricingPacksLoading,
        pricingPacksLoadError,
        servers,
        tasks,
        quotes,
        quotesLoading,
        quotesLoadError,
        invoices,
        invoicesLoading,
        invoicesLoadError,
        team,
        employeeProfiles,
        teamDataLoading,
        teamDataLoadError,
        equipment,
        addEvent,
        updateEvent,
        deleteEvent,
        addReceipt,
        deleteReceipt,
        addExpense,
        deleteExpense,
        addSalary,
        updateSalaryStatus,
        deleteSalary,
        addClient,
        updateClient,
        deleteClient,
        updateReservationStatus,
        addAppointment,
        updateAppointmentStatus,
        addTask,
        updateTask,
        toggleTaskStatus,
        deleteTask,
        updateServerStatus,
        addServer,
        updateServer,
        deleteServer,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        eventTeams,
        saveEmployeeProfile,
        addEventTeam,
        updateEventTeam,
        deleteEventTeam,
        addEquipment,
        deleteEquipment,
        updateTaskStatus,
        addQuote,
        updateQuoteStatus,
        updateQuote,
        deleteQuote,
        createQuoteVersion,
        updateQuoteEventId,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        recordInvoicePayment,
        addService,
        updateService,
        deleteService,
        addPricingPack,
        updatePricingPack,
        deletePricingPack,
        totalReceipts,
        totalExpenses,
        netProfit,
        pendingSalariesTotal,
        monthExpensesTotal,
        getEventFinancials,
        resetAllData,
        resetData: resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

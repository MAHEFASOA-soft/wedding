import React, { useState, useEffect } from 'react';
import { X, Save, Sparkles, User, Calendar, MapPin, Users, DollarSign, CheckCircle2, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EventItem, EventStatus, EventType, MealType } from '../../types';
import { pricingPacks } from '../pricing1/dataPricing';
import { getAllIncludedItems } from '../pricing1/pricingPackHelpers';
import { getPackBasePrice, getPackSupplement } from '../pricing1/pricingUtils';

export const EventEditModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  eventToEdit: EventItem | null;
}> = ({ isOpen, onClose, eventToEdit }) => {
  const { addEvent, updateEvent, servers, clients, events, team, services } = useApp();

  const isEditing = Boolean(eventToEdit);

  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [isClientSearchFocused, setIsClientSearchFocused] = useState(false);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('22:00');
  const [location, setLocation] = useState('Carlton Anosy, Antananarivo');
  const [locationQuery, setLocationQuery] = useState('');
  const [isLocationSearchFocused, setIsLocationSearchFocused] = useState(false);
  const [type, setType] = useState<EventType>('Mariage');
  const [packId, setPackId] = useState('');
  const [mealType, setMealType] = useState<MealType>('Service');
  const [includedServices, setIncludedServices] = useState<string[]>([]);
  const [selectedServiceNames, setSelectedServiceNames] = useState<string[]>([]);
  const [serviceSearch, setServiceSearch] = useState('');
  const [isServiceSearchFocused, setIsServiceSearchFocused] = useState(false);
  const [guestCount, setGuestCount] = useState<number>(150);
  const [totalPrice, setTotalPrice] = useState<number>(20000000);
  const [amountReceived, setAmountReceived] = useState<number>(5000000);
  const [status, setStatus] = useState<EventStatus>('Planifié');
  const [coordinator, setCoordinator] = useState('Miora Randria (Lead Planner)');
  const [coordinatorQuery, setCoordinatorQuery] = useState('');
  const [isCoordinatorSearchFocused, setIsCoordinatorSearchFocused] = useState(false);
  const [assignedServers, setAssignedServers] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Convertit une valeur stockée (ID ou nom) vers le nom utilisé par le formulaire.
  const getServiceName = (value: string): string => {
    const catalogService = services.find(
      (service) => service.id === value || service.name === value
    );
    return catalogService?.name || value;
  };

  // Convertit une valeur du formulaire vers l'ID du catalogue pour la sauvegarde.
  const getServiceId = (value: string): string => {
    const catalogService = services.find(
      (service) => service.id === value || service.name === value
    );
    return catalogService?.id || value;
  };

  // Sync state whenever eventToEdit changes or when the modal opens
  useEffect(() => {
    if (isOpen) {
      setSuccessToast(null);
      setClientSearch('');
      setIsClientSearchFocused(false);
      setLocationQuery('');
      setIsLocationSearchFocused(false);
      setCoordinatorQuery('');
      setIsCoordinatorSearchFocused(false);
      setServiceSearch('');
      setIsServiceSearchFocused(false);
      setSelectedServiceNames([]);
      if (eventToEdit) {
        setName(eventToEdit.name || '');
        setClientId(eventToEdit.clientId || '');
        setClientName(eventToEdit.clientName || '');
        setClientSearch(eventToEdit.clientName || '');
        setClientPhone(eventToEdit.clientPhone || '+261 34 00 000 00');
        setDate(eventToEdit.date || new Date().toISOString().split('T')[0]);
        setStartTime(eventToEdit.startTime || '10:00');
        setEndTime(eventToEdit.endTime || '22:00');
        setLocation(eventToEdit.location || '');
        setType(eventToEdit.type || 'Mariage');
        const eventPackId = eventToEdit.type === 'Mariage'
          ? eventToEdit.packId || 'pack-mesure'
          : eventToEdit.packId || '';
        setPackId(eventPackId);
        setMealType(eventToEdit.mealType || 'Service');
        const eventPack = pricingPacks.find((pack) => pack.id === eventPackId);
        const existingServices =
          eventToEdit.includedServices?.length
            ? eventToEdit.includedServices
            : eventPack
              ? getAllIncludedItems(eventPack, pricingPacks)
              : [];

        const uniqueExistingServices = Array.from(new Set(existingServices));
        const existingServiceNames = Array.from(
          new Set(uniqueExistingServices.map(getServiceName))
        );
        setIncludedServices(uniqueExistingServices);
        setSelectedServiceNames(existingServiceNames);
        setGuestCount(eventToEdit.guestCount || 100);
        setTotalPrice(eventToEdit.totalPrice ?? 0);
        setAmountReceived(eventToEdit.amountReceived ?? 0);
        setStatus(eventToEdit.status || 'Planifié');
        setCoordinator(eventToEdit.coordinator || 'Miora Randria (Lead Planner)');
        setAssignedServers(eventToEdit.assignedServers || []);
        setNotes(eventToEdit.notes || '');
      } else {
        // Defaults for adding a new event
        setName('');
        setClientId('');
        setClientName('');
        setClientPhone('+261 34 ');
        setDate(new Date().toISOString().split('T')[0]);
        setStartTime('10:00');
        setEndTime('22:00');
        setLocation('Carlton Anosy, Antananarivo');
        setType('Mariage');
        setPackId(pricingPacks[0]?.id || '');
        setMealType('Service');
        setIncludedServices(pricingPacks[0]?.includedItems || []);
        setGuestCount(150);
        setTotalPrice(22000000);
        setAmountReceived(8000000);
        setStatus('Planifié');
        setCoordinator('Miora Randria (Lead Planner)');
        setAssignedServers([]);
        setNotes('');
      }
    }
  }, [eventToEdit, isOpen]);

  const selectedPack = pricingPacks.find((pack) => pack.id === packId);

  const filteredClients = clients.filter((client) => {
    const search = clientSearch.trim().toLowerCase();
    return (
      !search ||
      `${client.id} ${client.name} ${client.phone} ${client.email || ''}`.toLowerCase().includes(search)
    );
  }).slice(0, 8);

  const filteredServices = services.filter((service) => {
    const search = serviceSearch.trim().toLowerCase();
    return (
      !includedServices.includes(service.id) &&
      !includedServices.includes(service.name) &&
      !selectedServiceNames.includes(service.name) &&
      (!search || `${service.name} ${service.category} ${service.description}`.toLowerCase().includes(search))
    );
  }).slice(0, 8);

  const packServices = selectedPack ? getAllIncludedItems(selectedPack, pricingPacks) : [];
  const displayedPackServices = packServices.map((service) =>
    services.find((catalogService) => catalogService.id === service)?.name || service
  );
  const displayedEventServices = includedServices.map((service) =>
    services.find((catalogService) => catalogService.id === service)?.name || service
  );

  const locationSuggestions = Array.from(
    new Set(events.map((event) => event.location.trim()).filter(Boolean))
  );
  const coordinatorSuggestions = Array.from(
    new Set(events.map((event) => event.coordinator.trim()).filter(Boolean))
  );
  const filteredLocations = locationSuggestions.filter((suggestion) =>
    suggestion.toLowerCase().includes(locationQuery.trim().toLowerCase())
  ).slice(0, 8);
  const filteredCoordinators = coordinatorSuggestions.filter((suggestion) =>
    suggestion.toLowerCase().includes(coordinatorQuery.trim().toLowerCase())
  ).slice(0, 8);

  const getSelectedMealPrice = (pack: typeof selectedPack, meal: MealType, guests: number) => {
    if (!pack) return 0;
    const row = pack.pricingGrid?.rows.find((item) => item.label.toLowerCase() === meal.toLowerCase());
    if (!row || !pack.pricingGrid) return pack.basePrice || 0;
    const guestColumn = pack.pricingGrid.headers.reduce((closest, header, index) => {
      const current = Number(header.match(/\d+/)?.[0] || 0);
      const previous = Number(pack.pricingGrid!.headers[closest].match(/\d+/)?.[0] || 0);
      return Math.abs(current - guests) < Math.abs(previous - guests) ? index : closest;
    }, 0);
    return row.values[guestColumn] || pack.basePrice || 0;
  };

  const handlePackChange = (nextPackId: string) => {
    setPackId(nextPackId);
    const pack = pricingPacks.find((item) => item.id === nextPackId);
    if (pack) {
      const packServices = Array.from(new Set(getAllIncludedItems(pack, pricingPacks)));
      const packServiceNames = Array.from(
        new Set(packServices.map(getServiceName))
      );
      setIncludedServices(packServices);
      setSelectedServiceNames(packServiceNames);
      setType(pack.category === 'Fiançailles' ? 'Fiançailles' : 'Mariage');
      setTotalPrice(getPackBasePrice(pack, guestCount) + getPackSupplement(pack));
    }
  };

  const addServiceToEvent = (serviceName: string) => {
    setSelectedServiceNames((current) =>
      current.includes(serviceName)
        ? current
        : [...current, serviceName]
    );

    setIncludedServices((current) => {
      const serviceId = getServiceId(serviceName);
      return current.some(
        (item) => getServiceId(item) === serviceId
      )
        ? current
        : [...current, serviceId];
    });

    setServiceSearch('');
  };

  const removeServiceFromEvent = (serviceName: string) => {
    const serviceId = getServiceId(serviceName);

    setSelectedServiceNames((current) =>
      current.filter((item) => item !== serviceName)
    );

    setIncludedServices((current) =>
      current.filter((item) => getServiceId(item) !== serviceId)
    );
  };

  if (!isOpen) return null;

  // Handle client selection from existing directory
  const handleSelectExistingClient = (selectedId: string) => {
    setClientId(selectedId);
    const foundClient = clients.find((c) => c.id === selectedId);
    if (selectedId) {
      if (foundClient) {
        setClientName(foundClient.name);
        setClientPhone(foundClient.phone || '');
        setClientSearch(foundClient.name);
      }
    } else {
      setClientSearch('');
    }
    setIsClientSearchFocused(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !clientName.trim()) {
      alert('Veuillez renseigner au moins le nom de l’événement et le nom du client.');
      return;
    }

    if (type === 'Mariage' && !packId) {
      alert('Un événement de mariage doit obligatoirement être associé à un pack. Sélectionnez un pack ou PACK SUR MESURE.');
      return;
    }

    if (isEditing && eventToEdit) {
      const updatedEvent: EventItem = {
        ...eventToEdit,
        name: name.trim(),
        clientId: clientId || eventToEdit.clientId || 'cli-custom',
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        date,
        startTime,
        endTime,
        location: location.trim(),
        type,
        packId: packId || undefined,
        packName: selectedPack?.name,
        mealType,
        includedServices: Array.from(
          new Set(selectedServiceNames.map(getServiceId))
        ),
        guestCount: Number(guestCount) || 0,
        totalPrice: Number(totalPrice) || 0,
        amountReceived: Number(amountReceived) || 0,
        status,
        coordinator: coordinator.trim(),
        assignedServers,
        notes: notes.trim(),
      };

      const saved = await updateEvent(updatedEvent);
      if (!saved) {
        alert("La modification n'a pas pu être enregistrée dans la base de données.");
        return;
      }
      setSuccessToast(`L'événement « ${updatedEvent.name} » a été modifié avec succès !`);
      setTimeout(() => {
        onClose();
      }, 500);
    } else {
      const created = await addEvent({
        name: name.trim(),
        clientId: clientId || `cli-${Date.now()}`,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        date,
        startTime,
        endTime,
        location: location.trim(),
        type,
        packId: packId || undefined,
        packName: selectedPack?.name,
        mealType,
        includedServices: Array.from(new Set([...includedServices, ...selectedServiceNames])),
        guestCount: Number(guestCount) || 0,
        totalPrice: Number(totalPrice) || 0,
        amountReceived: Number(amountReceived) || 0,
        status,
        coordinator: coordinator.trim(),
        assignedServers,
        notes: notes.trim(),
        image:
          type === 'Mariage'
            ? 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80'
            : type === 'Fiançailles'
            ? 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80'
            : 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
      });
      if (!created) {
        alert("La création n'a pas pu être enregistrée dans la base de données.");
        return;
      }
      setSuccessToast(`L'événement « ${name.trim()} » a été créé avec succès !`);
      setTimeout(() => {
        onClose();
      }, 500);
    }
  };

  const toggleAssignment = (assignmentId: string) => {
    if (assignedServers.includes(assignmentId)) {
      setAssignedServers(assignedServers.filter((id) => id !== assignmentId));
    } else {
      setAssignedServers([...assignedServers, assignmentId]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        id="event-edit-modal-box"
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                {isEditing ? `Modifier l'événement : ${eventToEdit?.name}` : 'Créer un Nouvel Événement'}
              </h3>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {isEditing
                  ? `Code : ${eventToEdit?.code || ''} • Toutes les données actuelles sont pré-remplies`
                  : 'Remplissez les informations pour enregistrer une nouvelle cérémonie'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {successToast && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 flex items-center gap-2 text-emerald-800 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Information banner when editing */}
          {isEditing && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
              <span className="font-medium">
                Vous modifiez actuellement la fiche de <strong>{eventToEdit?.name}</strong>. Modifiez les champs ci-dessous puis cliquez sur « Enregistrer les modifications ».
              </span>
              <span className="font-mono font-bold text-[11px] bg-amber-200/80 px-2 py-0.5 rounded text-amber-950 shrink-0 ml-2">
                {eventToEdit?.code}
              </span>
            </div>
          )}

          {/* Row 1: Name & Event Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Intitulé de l'événement *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Mariage Princier Sitraka & Hery"
                required
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Type de cérémonie *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as EventType)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden bg-white font-medium"
              >
                <option value="Mariage">Mariage</option>
                <option value="Fiançailles">Fiançailles (Vodiondry)</option>
                <option value="Anniversaire">Anniversaire</option>
                <option value="Cocktail / Réception">Cocktail / Réception</option>
                <option value="Gala / Soirée">Gala / Soirée</option>
                <option value="Baptême">Baptême</option>
              </select>
            </div>
          </div>

          {/* Row 2: Client Selection / Creation */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-600" />
                <span>Client & Coordonnées</span>
              </label>

              {/* Quick Select Client from database */}
              {clients.length > 0 && (
                <div className="relative w-full sm:w-80">
                  <span className="text-[11px] text-slate-500 block mb-1">Ou rechercher un client existant :</span>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="search"
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      onFocus={() => setIsClientSearchFocused(true)}
                      onBlur={() => setTimeout(() => setIsClientSearchFocused(false), 150)}
                      placeholder="Rechercher par nom, téléphone ou ID..."
                      className="w-full text-xs pl-8 pr-2.5 py-1.5 bg-white border border-slate-300 rounded-md focus:border-amber-500 outline-hidden"
                    />
                  </div>
                  {(isClientSearchFocused || clientSearch.trim()) && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg divide-y divide-slate-100">
                      {filteredClients.length > 0 ? (
                        filteredClients.map((client) => (
                          <button
                            type="button"
                            key={client.id}
                            onClick={() => handleSelectExistingClient(client.id)}
                            className="w-full px-3 py-2 text-left hover:bg-amber-50 transition-colors"
                          >
                            <span className="block text-[10px] font-mono text-slate-400">{client.id}</span>
                            <span className="block text-xs font-semibold text-slate-800">{client.name}</span>
                            <span className="block text-[10px] text-slate-500">{client.phone}{client.email ? ` · ${client.email}` : ''}</span>
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-[11px] text-slate-500">Aucun client trouvé.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Nom du client (Mariés / Famille) *
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: M. Rakoto & Mme Fitia"
                  required
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Numéro de téléphone
                </label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+261 34 00 000 00"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Date, Hours, Guests */}
          <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Pack événementiel</label>
                <select value={packId} onChange={(e) => handlePackChange(e.target.value)} className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg outline-hidden">
                  <option value="">Sans pack</option>
                  {pricingPacks.map((pack) => <option key={pack.id} value={pack.id}>{pack.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nombre d'invités</label>
                <input type="number" min="1" value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg outline-hidden" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Type de repas</label>
                <select value={mealType} onChange={(e) => { const next = e.target.value as MealType; setMealType(next); if (selectedPack) setTotalPrice(getSelectedMealPrice(selectedPack, next, guestCount) + getPackSupplement(selectedPack)); }} className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg outline-hidden">
                  <option value="Service">Service</option>
                  <option value="Semi-buffet">Semi-buffet</option>
                  <option value="Buffet">Buffet</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Prestations du pack</label>
              <textarea rows={4} value={displayedPackServices.join('\n')} readOnly className="w-full text-xs px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg outline-hidden text-slate-600" />
              <p className="text-[10px] text-slate-500 mt-1">Ces prestations proviennent du pack sélectionné.</p>
            </div>
          </div>

          {/* Row 3: Date, Hours, Guests */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Date de l'événement *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Heure de début
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Heure de fin
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
              />
            </div>


          </div>

          {/* Row 4: Location & Coordinator */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Lieu de réception
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="search"
                  value={location}
                  onChange={(e) => {
                    setLocationQuery(e.target.value);
                    setLocation(e.target.value);
                  }}
                  onFocus={() => {
                    setLocationQuery('');
                    setIsLocationSearchFocused(true);
                  }}
                  onBlur={() => setTimeout(() => setIsLocationSearchFocused(false), 150)}
                  placeholder="Rechercher ou saisir un lieu"
                  className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                />
                {(isLocationSearchFocused || locationQuery.trim()) && filteredLocations.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-40 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg divide-y divide-slate-100">
                    {filteredLocations.map((suggestion) => (
                      <button
                        type="button"
                        key={suggestion}
                        onClick={() => {
                          setLocation(suggestion);
                          setLocationQuery('');
                          setIsLocationSearchFocused(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-amber-50 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Coordinateur / Responsable
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="search"
                  value={coordinator}
                  onChange={(e) => {
                    setCoordinatorQuery(e.target.value);
                    setCoordinator(e.target.value);
                  }}
                  onFocus={() => {
                    setCoordinatorQuery('');
                    setIsCoordinatorSearchFocused(true);
                  }}
                  onBlur={() => setTimeout(() => setIsCoordinatorSearchFocused(false), 150)}
                  placeholder="Rechercher ou saisir un responsable"
                  className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                />
                {(isCoordinatorSearchFocused || coordinatorQuery.trim()) && filteredCoordinators.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-40 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg divide-y divide-slate-100">
                    {filteredCoordinators.map((suggestion) => (
                      <button
                        type="button"
                        key={suggestion}
                        onClick={() => {
                          setCoordinator(suggestion);
                          setCoordinatorQuery('');
                          setIsCoordinatorSearchFocused(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-amber-50 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Financials Section */}
          <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-3">
            <h4 className="text-xs font-bold uppercase text-amber-900 tracking-wider flex items-center justify-between">
              <span>Chiffrage Financier de l'Événement (en Ariary)</span>
              <span className="text-[11px] font-normal text-amber-700">Calcul automatique du reste à payer</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Prix Total Facturé (Ar) *
                </label>
                <input
                  type="number"
                  step="50000"
                  value={totalPrice}
                  onChange={(e) => setTotalPrice(Number(e.target.value))}
                  required
                  className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Montant Reçu / Acompte (Ar)
                </label>
                <input
                  type="number"
                  step="50000"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(Number(e.target.value))}
                  className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden text-emerald-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Montant Restant (Calculé)
                </label>
                <div className="w-full text-xs font-extrabold px-3 py-2 bg-white border border-slate-300 rounded-lg text-amber-800 flex items-center h-8.5">
                  {Math.max(0, totalPrice - amountReceived).toLocaleString('fr-MG')} Ar
                </div>
              </div>
            </div>
          </div>

          {/* Status & Assigned Staff */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Statut de l'événement
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EventStatus)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden bg-white font-semibold"
              >
                <option value="Planifié">Planifié</option>
                <option value="Confirmé">Confirmé</option>
                <option value="En cours">En cours</option>
                <option value="Terminé">Terminé</option>
                <option value="Annulé">Annulé</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Affectation de l'équipe ({assignedServers.length} assigné{assignedServers.length > 1 ? 's' : ''})
              </label>
              <div className="max-h-32 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">Équipe interne</p>
                  <div className="flex flex-wrap gap-1.5">
                    {team.map((member) => {
                      const assignmentId = `team:${member.id}`;
                      const isSelected = assignedServers.includes(assignmentId);
                      return (
                        <button
                          type="button"
                          key={assignmentId}
                          onClick={() => toggleAssignment(assignmentId)}
                          className={`text-[10px] px-2.5 py-1 rounded-md font-medium transition-colors ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected ? '✓ ' : ''}{member.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">Serveurs et extras</p>
                  <div className="flex flex-wrap gap-1.5">
                    {servers.map((server) => {
                      const isSelected = assignedServers.includes(server.id);
                      return (
                        <button
                          type="button"
                          key={server.id}
                          onClick={() => toggleAssignment(server.id)}
                          className={`text-[10px] px-2.5 py-1 rounded-md font-medium transition-colors ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected ? '✓ ' : ''}{server.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Instructions & Notes spécifiques
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Demande de violoniste à l'entrée, fleurs blanches pures, pas de retard sur le cortège..."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
            />
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Ajouter des prestations du catalogue</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="search"
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  onFocus={() => setIsServiceSearchFocused(true)}
                  // onBlur={() => setTimeout(() => setIsServiceSearchFocused(false), 150)}
                  onBlur={() => setTimeout(() => {setIsServiceSearchFocused(false);}, 300)}
                  placeholder="Rechercher une prestation..."
                  className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>
            {(isServiceSearchFocused || serviceSearch.trim()) && (
              <div className="max-h-40 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-sm divide-y divide-slate-100">
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <button
                      type="button"
                      key={service.id}
                      onClick={() => addServiceToEvent(service.name)}
                      className="w-full px-3 py-2 text-left hover:bg-amber-50 transition-colors"
                    >
                      <span className="block text-[10px] font-mono text-slate-400">{service.id}</span>
                      <span className="block text-xs font-semibold text-slate-800">{service.name}</span>
                      <span className="block text-[10px] text-slate-500">{service.category} · {service.unitPrice.toLocaleString('fr-MG')} Ar</span>
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-2 text-[11px] text-slate-500">Aucune prestation disponible pour cette recherche.</p>
                )}
              </div>
            )}
            <div className="flex flex-wrap gap-1.5">
              {selectedServiceNames.map((serviceName) => {
                const catalogService = services.find((service) => service.name === serviceName);
                return (
                  <span key={serviceName} className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 border border-amber-200 rounded-md text-[10px] text-amber-900">
                    {catalogService && <span className="font-mono text-[9px] text-amber-700">{catalogService.id}</span>}
                    <span>{serviceName}</span>
                    <button
                      type="button"
                      onClick={() => removeServiceFromEvent(serviceName)}
                      className="text-amber-700 hover:text-red-600"
                      title="Retirer cette prestation"
                      aria-label={`Retirer ${serviceName}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Form Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              id="btn-save-event"
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg transition-colors shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Enregistrer les modifications' : 'Créer l’événement'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
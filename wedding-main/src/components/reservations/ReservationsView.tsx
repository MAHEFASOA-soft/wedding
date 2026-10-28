import React, { useState } from 'react';
import {
  CalendarCheck,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Phone,
  Mail,
  Users,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Reservation, EventType } from '../../types';
import { formatAriary, formatShortDateFr, formatDateFr } from '../../utils/formatters';

export const ReservationsView: React.FC = () => {
  const { reservations, updateReservationStatus, addEvent, setActiveTab } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = reservations.filter((r) => {
    const matchesSearch =
      r.code.toLowerCase().includes(search.toLowerCase()) ||
      r.clientName.toLowerCase().includes(search.toLowerCase()) ||
      r.contactPhone.toLowerCase().includes(search.toLowerCase()) ||
      (r.notes && r.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleValidateAndCreateEvent = (res: Reservation) => {
    updateReservationStatus(res.id, 'Validée');
    // Convert to event
    addEvent({
      name: `${res.eventType} ${res.clientName}`,
      clientId: 'cli-1',
      clientName: res.clientName,
      clientPhone: res.contactPhone,
      date: res.requestedDate,
      startTime: '10:00',
      endTime: '23:00',
      location: 'À convenir avec le client',
      type: res.eventType,
      guestCount: res.guestCount,
      totalPrice: res.estimatedBudget,
      amountReceived: 0,
      status: 'Confirmé',
      coordinator: 'Miora Randria',
      assignedServers: [],
      notes: res.notes,
    });
    alert(`La réservation ${res.code} a été validée et transformée en événement au planning !`);
    setActiveTab('events');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/80 shadow-xs">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Demandes de Réservations en Ligne & Prospects
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Traitement des demandes entrantes, validation des dates et conversion en contrats
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Demandes en Attente</span>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {reservations.filter((r) => r.status === 'En attente').length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">À contacter sous 24h</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Validées & Converties</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            {reservations.filter((r) => r.status === 'Validée').length}
          </p>
          <p className="text-[11px] text-emerald-600 mt-0.5">Planning confirmé</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Budget Total Prévisionnel</span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {formatAriary(reservations.reduce((sum, r) => sum + r.estimatedBudget, 0))}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Potentiel commercial</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par code, client, téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg outline-hidden focus:border-amber-500 bg-slate-50 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white outline-hidden text-slate-700 font-medium cursor-pointer"
          >
            <option value="all">Tous les statuts</option>
            <option value="En attente">En attente de traitement</option>
            <option value="Validée">Validée</option>
            <option value="Refusée">Refusée</option>
          </select>
        </div>
      </div>

      {/* Reservations Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((res) => (
          <div
            key={res.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {res.code}
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    res.status === 'Validée'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : res.status === 'En attente'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}
                >
                  {res.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-2.5">{res.clientName}</h3>
              <p className="text-xs font-semibold text-amber-800">{res.eventType}</p>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{res.contactPhone}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{res.contactEmail}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{res.guestCount} invités prévus</span>
                </p>
                <p className="flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-slate-900">Budget : {formatAriary(res.estimatedBudget)}</span>
                </p>
              </div>

              {res.notes && (
                <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 italic">
                  « {res.notes} »
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Demandé pour le {formatShortDateFr(res.requestedDate)}</span>
              {res.status === 'En attente' && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateReservationStatus(res.id, 'Refusée')}
                    className="px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                  >
                    Refuser
                  </button>
                  <button
                    onClick={() => handleValidateAndCreateEvent(res)}
                    className="px-3 py-1 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Valider</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

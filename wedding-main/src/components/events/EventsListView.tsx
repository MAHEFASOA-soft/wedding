import React, { useState } from 'react';
import {
  Search,
  Plus,
  Calendar,
  MapPin,
  Users,
  Edit2,
  Trash2,
  Eye,
  Sparkles,
  FileDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EventItem } from '../../types';
import { formatAriary, formatDateFr, getStatusColor } from '../../utils/formatters';
import { downloadEventPdf } from './eventPdf';

export const EventsListView: React.FC = () => {
  const {
    events,
    eventsLoading,
    eventsLoadError,
    refreshEvents,
    deleteEvent,
    setSelectedEventForModal,
    openCreateEventModal,
    openEditEventModal,
    getEventFinancials,
  } = useApp();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.name.toLowerCase().includes(search.toLowerCase()) ||
      ev.clientName.toLowerCase().includes(search.toLowerCase()) ||
      ev.location.toLowerCase().includes(search.toLowerCase()) ||
      ev.code.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || ev.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || ev.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleOpenAdd = () => {
    openCreateEventModal();
  };

  const handleOpenEdit = (e: React.MouseEvent, ev: EventItem) => {
    e.stopPropagation();
    openEditEventModal(ev);
  };

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (confirm(`Confirmez-vous la suppression de l'événement « ${name} » ?`)) {
      const deleted = await deleteEvent(id);
      if (!deleted) alert("La suppression n'a pas pu être effectuée dans la base de données.");
    }
  };

  const handleDownloadPdf = (e: React.MouseEvent, event: EventItem) => {
    e.stopPropagation();
    downloadEventPdf(event, getEventFinancials(event.id));
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Gestion des Événements & Cérémonies</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {events.length} événement{events.length === 1 ? '' : 's'} enregistré{events.length === 1 ? '' : 's'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvel Événement</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, client, lieu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-hidden focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white outline-hidden text-slate-700"
          >
            <option value="all">Tous les types</option>
            <option value="Mariage">Mariage</option>
            <option value="Fiançailles">Fiançailles (Vodiondry)</option>
            <option value="Anniversaire">Anniversaire</option>
            <option value="Cocktail / Réception">Cocktail / Réception</option>
            <option value="Gala / Soirée">Gala / Soirée</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white outline-hidden text-slate-700"
          >
            <option value="all">Tous les statuts</option>
            <option value="Planifié">Planifié</option>
            <option value="Confirmé">Confirmé</option>
            <option value="En cours">En cours</option>
            <option value="Terminé">Terminé</option>
            <option value="Annulé">Annulé</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {eventsLoading ? (
          <p role="status" className="col-span-full py-12 text-center text-sm text-slate-500">
            Chargement des événements...
          </p>
        ) : eventsLoadError ? (
          <div role="alert" className="col-span-full flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
            <p>{eventsLoadError}</p>
            <button type="button" onClick={() => void refreshEvents()} className="rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100">
              Réessayer
            </button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <p className="text-sm font-semibold text-slate-700">
              {events.length === 0 ? 'Aucun événement enregistré' : 'Aucun événement ne correspond aux filtres'}
            </p>
            {events.length === 0 && (
              <button type="button" onClick={handleOpenAdd} className="mt-3 text-sm font-semibold text-amber-700 hover:text-amber-900">
                Créer un événement
              </button>
            )}
          </div>
        ) : filteredEvents.map((ev) => {
          const statusSt = getStatusColor(ev.status);
          const fin = getEventFinancials(ev.id);

          return (
            <div
              key={ev.id || ev.code || `${ev.name}-${ev.clientName}-${ev.date}`}
              onClick={() => setSelectedEventForModal(ev)}
              className="bg-white rounded-2xl border border-slate-200 hover:border-amber-400 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {ev.code}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusSt.bg} ${statusSt.text} ${statusSt.border}`}
                  >
                    {ev.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-900 transition-colors leading-snug">
                  {ev.name}
                </h3>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  Client : {ev.clientName}
                </p>
                {ev.packName && (
                  <p className="text-[11px] text-amber-800 mt-1.5 font-semibold">
                    {ev.packName} · {ev.mealType || 'Repas à définir'}
                  </p>
                )}

                {/* Details List */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      {formatDateFr(ev.date)} ({ev.startTime} - {ev.endTime})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{ev.location}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {ev.guestCount} convives • {ev.assignedServers?.length ?? 0} membres assignés
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Box */}
              <div className="pt-3 border-t border-slate-100 bg-slate-50/70 p-3 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Prix Total :</span>
                  <span className="font-bold text-slate-900">{formatAriary(fin.totalPrice)}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Montant Reçu :</span>
                  <span className="font-bold text-emerald-700">
                    {formatAriary(fin.amountReceived)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                  <span className="font-semibold text-slate-700">Montant Restant :</span>
                  <span className="font-black text-amber-700">
                    {formatAriary(fin.amountRemaining)}
                  </span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEventForModal(ev);
                  }}
                  className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Détails & Bilan</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => handleDownloadPdf(e, ev)}
                    title="Télécharger la fiche PDF client"
                    className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleOpenEdit(e, ev)}
                    title="Modifier l'événement"
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, ev.id, ev.name)}
                    title="Supprimer l'événement"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

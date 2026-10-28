import React from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  UserCheck,
  CheckSquare,
  Sparkles,
  Phone,
  Edit,
  ExternalLink,
  Receipt,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatAriary, formatDateFr, getStatusColor } from '../../utils/formatters';
import { getAllIncludedItems } from '../pricing1/pricingPackHelpers';

export const EventDetailModal: React.FC = () => {
  
  const {
    selectedEventForModal,
    setSelectedEventForModal,
    openEditEventModal,
    setActiveTab,
    getEventFinancials,
    servers,
    team,
    tasks,
    services,
    pricingPacks,
  } = useApp();

  if (!selectedEventForModal) return null;

  const event = selectedEventForModal;
  const eventPack = pricingPacks.find((pack) => pack.id === event.packId);
  const displayedPackServices = eventPack ? getAllIncludedItems(eventPack, pricingPacks) : [];
  const packServiceItems = new Set(displayedPackServices);
  const displayedEventServices = Array.from(new Set(
    (event.includedServices || []).flatMap((service) => {
      if (packServiceItems.has(service)) return [];
      const catalogService = services.find(
        (item) => item.id === service || item.name === service,
      );
      return catalogService ? [catalogService.name] : [];
    }),
  ));
  const financials = getEventFinancials(event.id, event);
  const statusStyle = getStatusColor(event.status);

  // Assigned servers and team members
  const assignedServerObjects = servers.filter((s) => event.assignedServers?.includes(s.id));
  const assignedTeamMembers = team.filter((member) =>
    event.assignedServers?.includes(`team:${member.id}`)
  );
  const assignedPeopleCount = assignedServerObjects.length + assignedTeamMembers.length;

  // Linked tasks
  const linkedTasks = tasks.filter((t) => t.eventId === event.id);

  const handleEditClick = () => {
    openEditEventModal(event);
  };

  const handleViewFullDetails = () => {
    setSelectedEventForModal(null);
    setActiveTab('events');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        id="event-detail-modal"
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 relative">
          <button
            onClick={() => setSelectedEventForModal(null)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-400 text-slate-950">
              {event.code}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
            >
              {event.status}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {event.type}
            </span>
          </div>

          <h3 className="text-xl font-bold text-white tracking-tight leading-snug">
            {event.name}
          </h3>
          <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
            <span className="font-semibold text-amber-300">Client :</span> {event.clientName}
            {event.clientPhone && (
              <span className="inline-flex items-center gap-1 ml-2 text-slate-400">
                <Phone className="w-3 h-3" /> {event.clientPhone}
              </span>
            )}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Key Schedule & Venue Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Date de l'événement
              </span>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-800">
                <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{formatDateFr(event.date)}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Horaires
              </span>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-800">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{event.startTime || '10:00'} — {event.endTime || '22:00'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Nombre de personnes
              </span>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-slate-800">
                <Users className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{event.guestCount} invités</span>
              </div>
            </div>
          </div>

          {/* Venue & Coordinator */}
          {(event.packName || eventPack || event.mealType || displayedEventServices.length) && (
            <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-2 text-xs">
              <div className="flex flex-wrap gap-x-5 gap-y-1">
                {(event.packName || eventPack) && <span><strong className="text-slate-700">Pack :</strong> {event.packName || eventPack?.name}</span>}
                {event.mealType && <span><strong className="text-slate-700">Repas :</strong> {event.mealType}</span>}
                <span><strong className="text-slate-700">Invités :</strong> {event.guestCount}</span>
              </div>
              {displayedPackServices.length ? <div><strong className="text-slate-700">Prestations du pack :</strong><ul className="list-disc pl-5 mt-1 text-slate-600">{displayedPackServices.map((service, index) => <li key={`pack-${service}-${index}`}>{service}</li>)}</ul></div> : null}
              {displayedEventServices.length ? <div className="mt-3"><strong className="text-slate-700">Prestations spécifiques de l'événement :</strong><ul className="list-disc pl-5 mt-1 text-slate-600">{displayedEventServices.map((service, index) => <li key={`event-${service}-${index}`}>{service}</li>)}</ul></div> : null}
            </div>
          )}

          {/* Venue & Coordinator */}
          <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-slate-700">Lieu de réception : </span>
                <span className="text-slate-900 font-medium">{event.location}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-slate-700">Responsable / Coordinateur : </span>
                <span className="text-slate-900 font-medium">{event.coordinator || 'Direction Efficiency Wedding'}</span>
              </div>
            </div>
          </div>

          {/* Financial Breakdown (Section 9 & 14 & 16) */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-900 text-white">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center justify-between">
              <span>Bilan Financier de l'événement</span>
              <span className="text-[11px] font-normal text-slate-300">Devise : Ariary (Ar)</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700/80">
                <span className="text-[10px] text-slate-400 block font-medium">Prix Total</span>
                <span className="text-sm font-extrabold text-white mt-0.5 block">
                  {formatAriary(financials.totalPrice)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60">
                <span className="text-[10px] text-emerald-400 block font-medium">Montant Reçu</span>
                <span className="text-sm font-extrabold text-emerald-300 mt-0.5 block">
                  {formatAriary(financials.amountReceived)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60">
                <span className="text-[10px] text-amber-400 block font-medium">Reste à Payer</span>
                <span className="text-sm font-extrabold text-amber-300 mt-0.5 block">
                  {formatAriary(financials.amountRemaining)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60">
                <span className="text-[10px] text-rose-400 block font-medium">Dépenses engagées</span>
                <span className="text-sm font-extrabold text-rose-300 mt-0.5 block">
                  {formatAriary(financials.totalExpenses)}
                </span>
              </div>
            </div>

            {/* Event Net Profit / Margin */}
            <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-300">Marge brute prévisionnelle :</span>
              <span className={`font-bold ${financials.netMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatAriary(financials.netMargin)}
              </span>
            </div>
          </div>

          {/* Assigned Waiter Staff (Section 14) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>Équipe & Brigade Assignées ({assignedPeopleCount})</span>
            </h4>
            {assignedPeopleCount > 0 ? (
              <div className="flex flex-wrap gap-2">
                {assignedTeamMembers.map((member) => (
                  <span
                    key={`team:${member.id}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-xs font-medium text-slate-800"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    {member.name} <span className="text-[10px] text-slate-500 font-normal">({member.role})</span>
                  </span>
                ))}
                {assignedServerObjects.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {s.name} <span className="text-[10px] text-slate-500 font-normal">({s.role})</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Aucun membre d'équipe ou serveur assigné pour l'instant.</p>
            )}
          </div>

          {/* Linked Tasks (Section 14) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-slate-600" />
              <span>Tâches Opérationnelles Associées ({linkedTasks.length})</span>
            </h4>
            {linkedTasks.length > 0 ? (
              <div className="space-y-1.5">
                {linkedTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                  >
                    <span className={`font-medium ${t.status === 'Terminé' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {t.title}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        t.status === 'Terminé'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Aucune tâche spécifique liée pour le moment.</p>
            )}
          </div>

          {/* Notes */}
          {event.notes && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <span className="font-semibold text-slate-700 block mb-0.5">Notes internes :</span>
              {event.notes}
            </div>
          )}
        </div>

        {/* Modal Actions (Section 14: « Voir les détails » et « Modifier l'événement ») */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            id="btn-close-event-modal"
            onClick={() => setSelectedEventForModal(null)}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            Fermer
          </button>

          <div className="flex items-center gap-2">
            <button
              id="btn-view-event-full-details"
              onClick={handleViewFullDetails}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg transition-colors shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Voir les détails</span>
            </button>

            <button
              id="btn-edit-event-from-modal"
              onClick={handleEditClick}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg transition-colors shadow-xs"
            >
              <Edit className="w-3.5 h-3.5 text-slate-950" />
              <span>Modifier l'événement</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

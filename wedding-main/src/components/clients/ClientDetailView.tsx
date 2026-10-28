import React from 'react';
import { ArrowLeft, Calendar, ChevronRight, Mail, MapPin, Phone, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatAriary, formatDateFr, getStatusColor } from '../../utils/formatters';

export const ClientDetailView: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { clients, clientsLoading, clientsLoadError, events, setSelectedEventForModal } = useApp();

  const client = clients.find((item) => item.id === clientId);
  if (clientsLoading) {
    return <div className="py-12 text-center text-xs text-slate-500">Chargement de la fiche client…</div>;
  }

  if (!client) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <h2 className="text-lg font-bold text-slate-900">{clientsLoadError ? 'Fiche client indisponible' : 'Client introuvable'}</h2>
        <p className="text-sm text-slate-500 mt-1">
          {clientsLoadError || "Ce client n'existe plus ou son identifiant est invalide."}
        </p>
        <button
          type="button"
          onClick={() => navigate('/clients')}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux clients
        </button>
      </div>
    );
  }

  const clientEvents = events.filter((event) => event.clientId === client.id);

  return (
    <div className="space-y-5 pb-12">
      <button
        type="button"
        onClick={() => navigate('/clients')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux clients
      </button>

      <section className="bg-slate-900 text-white rounded-2xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xl shrink-0">
              {client.name.charAt(0)}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-amber-300 font-bold">Fiche client</p>
              <h1 className="text-xl sm:text-2xl font-black mt-1">{client.name}</h1>
              <p className="text-xs text-slate-300 mt-1">Client depuis le {formatDateFr(client.createdAt)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-right">
            <div>
              <span className="text-[10px] uppercase text-slate-400 block">Événements</span>
              <strong className="text-xl text-amber-300">{clientEvents.length}</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 block">Budget engagé</span>
              <strong className="text-sm text-emerald-300">{formatAriary(client.totalSpent)}</strong>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900">Coordonnées</h2>
          <div className="mt-4 space-y-3 text-xs text-slate-600">
            <div className="flex items-start gap-2"><Phone className="w-4 h-4 text-amber-600 shrink-0" /><span>{client.phone || 'Non renseigné'}</span></div>
            <div className="flex items-start gap-2"><Mail className="w-4 h-4 text-amber-600 shrink-0" /><span className="break-all">{client.email || 'Non renseigné'}</span></div>
            <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-amber-600 shrink-0" /><span>{client.address || 'Adresse non renseignée'}</span></div>
          </div>
          {client.notes && <p className="mt-5 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600 italic">{client.notes}</p>}
        </section>

        <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900">Historique des événements</h2>
            <span className="text-[11px] font-semibold text-slate-500">{clientEvents.length} événement(s)</span>
          </div>

          {clientEvents.length > 0 ? (
            <div className="mt-4 space-y-2">
              {clientEvents.map((event) => {
                const statusStyle = getStatusColor(event.status);
                return (
                  <button
                    type="button"
                    key={event.id}
                    onClick={() => setSelectedEventForModal(event)}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-slate-900 truncate">{event.name}</h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-500">
                          <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDateFr(event.date)}</span>
                          <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" />{event.guestCount} invités</span>
                          {event.packName && <span className="text-amber-800 font-semibold">{event.packName}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>{event.status}</span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-xs text-slate-400 italic">Aucun événement associé à ce client.</p>
          )}
        </section>
      </div>
    </div>
  );
};

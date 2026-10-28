import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Phone, Mail, MapPin, Plus, Search, Calendar, Trash2, Pencil } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Client } from '../../types';
import { formatAriary } from '../../utils/formatters';
import { api } from '../../lib/api';
import { PaginatedResponse, PaginationControls } from '../PaginationControls';
import { createPaginationCache } from '../paginationCache';

interface ClientsListState {
  search: string;
  page: number;
  perPage: number;
}

const clientsPageCache = createPaginationCache<PaginatedResponse<Client>, ClientsListState>({
  search: '',
  page: 1,
  perPage: 10,
});

const getClientsPageKey = (state: ClientsListState) => {
  const params = new URLSearchParams({
    page: String(state.page),
    perPage: String(state.perPage),
  });
  if (state.search) params.set('search', state.search);
  return params.toString();
};

export const ClientsView: React.FC = () => {
  const navigate = useNavigate();
  const {
    events,
    addClient,
    updateClient,
    deleteClient,
    setSelectedEventForModal,
  } = useApp();
  const [initialState] = useState(() => clientsPageCache.getState());
  const [search, setSearch] = useState(initialState.search);
  const [debouncedSearch, setDebouncedSearch] = useState(initialState.search);
  const [page, setPage] = useState(initialState.page);
  const [perPage, setPerPage] = useState(initialState.perPage);
  const [initialPage] = useState(() => clientsPageCache.getPage(getClientsPageKey(initialState)));
  const [pageClients, setPageClients] = useState(initialPage?.items ?? []);
  const [totalClients, setTotalClients] = useState(initialPage?.total ?? 0);
  const [isLoadingPage, setIsLoadingPage] = useState(!initialPage);
  const [pageLoadError, setPageLoadError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientBeingEdited, setClientBeingEdited] = useState<Client | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [actionError, setActionError] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    clientsPageCache.setState({ search, page, perPage });
  }, [search, page, perPage]);

  useEffect(() => {
    if (!search.trim()) {
      setDebouncedSearch('');
      return;
    }
    const timeout = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({
      page: String(page),
      perPage: String(perPage),
    });
    if (debouncedSearch) params.set('search', debouncedSearch);
    const pageKey = params.toString();
    const cachedPage = clientsPageCache.getPage(pageKey);

    if (cachedPage) {
      setPageClients(cachedPage.items);
      setTotalClients(cachedPage.total);
    }
    setIsLoadingPage(!cachedPage);
    setPageLoadError(null);
    void api.get<PaginatedResponse<Client>>(`/clients?${params.toString()}`).then((result) => {
      if (!active) return;
      if (!result) {
        if (!cachedPage) {
          setPageClients([]);
          setTotalClients(0);
          setPageLoadError('Impossible de charger les clients depuis le serveur.');
        }
        return;
      }
      if (page > Math.max(result.totalPages, 1)) {
        setPage(Math.max(result.totalPages, 1));
        return;
      }
      clientsPageCache.setPage(pageKey, result);
      setPageClients(result.items);
      setTotalClients(result.total);
    }).finally(() => {
      if (active) setIsLoadingPage(false);
    });

    return () => {
      active = false;
    };
  }, [page, perPage, debouncedSearch, refreshKey]);

  const resetForm = () => {
    setClientBeingEdited(null);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNotes('');
    setFormError('');
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setClientBeingEdited(client);
    setName(client.name);
    setPhone(client.phone);
    setEmail(client.email);
    setAddress(client.address);
    setNotes(client.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
    resetForm();
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSaving(true);

    const values = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      notes: notes.trim(),
    };

    try {
      const saved = clientBeingEdited
        ? await updateClient({ ...clientBeingEdited, ...values })
        : await addClient(values);

      if (!saved) {
        setFormError('Enregistrement impossible. Vérifiez la connexion au serveur puis réessayez.');
        return;
      }

      setRefreshKey((key) => key + 1);
      setIsModalOpen(false);
      resetForm();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5 pb-12">
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            <span>Répertoire des Clients & Mariés</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi des coordonnées, historiques et budgets des clients
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Client</span>
        </button>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone, e-mail..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-hidden focus:border-amber-500"
          />
        </div>
      </div>

      {pageLoadError && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
          <span>{pageLoadError}</span>
          <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="font-bold underline">
            Réessayer
          </button>
        </div>
      )}

      {actionError && (
        <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
          {actionError}
        </div>
      )}

      {/* Clients Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {!isLoadingPage && pageClients.map((client) => {
          const clientEvents = events.filter((event) => event.clientId === client.id);

          return (
            <div
              key={client.id}
              onClick={() => navigate(`/clients/${client.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') navigate(`/clients/${client.id}`);
              }}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-sm">
                    {client.name.charAt(0)}
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      openEditModal(client);
                    }}
                    aria-label={`Modifier ${client.name}`}
                    title="Modifier le client"
                    className="p-1 text-slate-400 hover:text-amber-700 rounded transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (confirm(`Supprimer le client ${client.name} ?`)) {
                        setActionError('');
                        void deleteClient(client.id).then((deleted) => {
                          if (!deleted) {
                            setActionError('Suppression refusée : vérifiez que ce client n’a plus d’événement associé et que le serveur est disponible.');
                          } else {
                            setRefreshKey((key) => key + 1);
                          }
                        });
                      }
                    }}
                    aria-label={`Supprimer ${client.name}`}
                    title="Supprimer le client"
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2">{client.name}</h3>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{client.address || 'Adresse non renseignée'}</span>
                  </div>
                </div>

                {client.notes && (
                  <p className="mt-2.5 p-2 rounded-lg bg-slate-50 text-[11px] text-slate-500 italic border border-slate-100">
                    "{client.notes}"
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-500 font-medium">Budget Engagé :</span>
                  <span className="font-extrabold text-slate-900">
                    {formatAriary(client.totalSpent)}
                  </span>
                </div>

                {clientEvents.length > 0 ? (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Événement rattaché :
                    </span>
                    {clientEvents.map((ev) => (
                      <button
                        key={ev.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedEventForModal(ev);
                        }}
                        className="w-full text-left p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold truncate transition-colors flex items-center justify-between"
                      >
                        <span className="truncate">{ev.name}</span>
                        <span className="text-[10px] text-amber-700 shrink-0">Voir →</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">Aucun événement associé</span>
                )}
              </div>
            </div>
          );
        })}
        {isLoadingPage && (
          <p className="col-span-full py-12 text-center text-xs text-slate-500">Chargement des clients…</p>
        )}
        {!isLoadingPage && !pageLoadError && pageClients.length === 0 && (
          <p className="col-span-full py-12 text-center text-xs text-slate-500">
            {debouncedSearch ? 'Aucun client ne correspond à la recherche.' : 'Aucun client enregistré.'}
          </p>
        )}
      </div>
      {!isLoadingPage && !pageLoadError && totalClients > 0 && (
        <PaginationControls
          page={page}
          perPage={perPage}
          total={totalClients}
          onPageChange={setPage}
          onPerPageChange={(size) => {
            setPerPage(size);
            setPage(1);
          }}
        />
      )}

      {/* Add Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">{clientBeingEdited ? 'Modifier le client' : 'Nouveau Client'}</h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="p-5 space-y-3 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nom complet du client *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Riana & Mialy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Numéro de téléphone
                </label>
                <input
                  type="text"
                  placeholder="+261 34 00 000 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  placeholder="contact@exemple.mg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  placeholder="Adresse du client"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Notes & Préférences
                </label>
                <textarea
                  rows={2}
                  placeholder="Attentes, style souhaité, recommandation..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                />
              </div>

              {formError && <p role="alert" className="text-xs text-rose-700">{formError}</p>}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-600"
                >
                  {isSaving ? 'Enregistrement…' : clientBeingEdited ? 'Enregistrer les modifications' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

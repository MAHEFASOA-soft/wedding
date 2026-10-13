import React, { useState } from 'react';
import { X, PlusCircle, DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, ReceiptCategory } from '../../types';

export const ReceiptModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { addReceipt, events, clients } = useApp();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Client (recherche/select)
  const [client, setClient] = useState(clients[0]?.name || '');
  const [clientId, setClientId] = useState<string>(clients[0]?.id || '');
  const [clientSearch, setClientSearch] = useState(clients[0]?.name || '');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

  // Événement (recherche/select, filtré par client si sélectionné)
  const [eventId, setEventId] = useState<string>('');
  const [eventSearch, setEventSearch] = useState('');
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);

  const [description, setDescription] = useState('Paiement acompte de réservation');
  const [category, setCategory] = useState<ReceiptCategory>('Acompte');
  const [amount, setAmount] = useState<number>(5000000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Virement bancaire');
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  // Suggestions clients (nom, téléphone, email)
  const clientMatches = clients
    .filter((c) =>
      `${c.id} ${c.name} ${c.phone} ${c.email}`.toLowerCase().includes(clientSearch.toLowerCase())
    )
    .slice(0, 6);

  // Suggestions événements : si un client est choisi, on ne montre que ses événements
  const eventMatches = events
    .filter((ev) => (clientId ? ev.clientId === clientId : true))
    .filter((ev) =>
      `${ev.id} ${ev.name} ${ev.clientName} ${ev.location || ''}`.toLowerCase().includes(eventSearch.toLowerCase())
    )
    .slice(0, 6);

  const handleSelectClient = (selected: (typeof clients)[number]) => {
    setClient(selected.name);
    setClientId(selected.id);
    setClientSearch(selected.name);
    setIsClientDropdownOpen(false);
    // On change de client : on réinitialise l'événement s'il ne correspond plus au client
    const currentEvent = events.find((ev) => ev.id === eventId);
    if (currentEvent && currentEvent.clientId !== selected.id) {
      setEventId('');
      setEventSearch('');
    }
  };

  const handleSelectEvent = (selected: (typeof events)[number]) => {
    setEventId(selected.id);
    setEventSearch(selected.name);
    setIsEventDropdownOpen(false);
    // Auto-remplissage du client à partir de l'événement choisi
    setClient(selected.clientName);
    const matchedClient = clients.find((c) => c.id === selected.clientId);
    if (matchedClient) {
      setClientId(matchedClient.id);
      setClientSearch(matchedClient.name);
    } else {
      setClientId('');
      setClientSearch(selected.clientName);
    }
  };

  const handleClearEvent = () => {
    setEventId('');
    setEventSearch('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedEvent = events.find((ev) => ev.id === eventId);

    addReceipt({
      date,
      client,
      eventId: eventId || undefined,
      eventName: selectedEvent ? selectedEvent.name : 'Hors événement',
      description,
      category,
      amount: Number(amount) || 0,
      paymentMethod,
      comment,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-emerald-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-300" />
            <h3 className="text-base font-bold text-white">
              Enregistrer une Recette (Argent Reçu)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Date de réception *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Catégorie *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ReceiptCategory)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden bg-white"
              >
                <option value="Paiement événement">Paiement événement</option>
                <option value="Acompte">Acompte</option>
                <option value="Solde événement">Solde événement</option>
                <option value="Prestation">Prestation</option>
                <option value="Location">Location</option>
                <option value="Autre recette">Autre recette</option>
              </select>
            </div>
          </div>

          {/* Recherche Client */}
          <div className="relative">
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Client / Payeur *
            </label>
            <input
              type="text"
              required
              value={clientSearch}
              onChange={(e) => {
                setClientSearch(e.target.value);
                setClient(e.target.value);
                setClientId('');
              }}
              onFocus={() => setIsClientDropdownOpen(true)}
              onBlur={() => setTimeout(() => setIsClientDropdownOpen(false), 150)}
              placeholder="Rechercher un client par nom, tél, email..."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden"
            />
            {isClientDropdownOpen && clientMatches.length > 0 && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {clientMatches.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onMouseDown={() => handleSelectClient(c)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 cursor-pointer border-b border-slate-100 last:border-0"
                  >
                    <p className="font-bold text-slate-900">
                      <span className="font-mono text-emerald-700">{c.id}</span> — {c.name}
                    </p>
                    <p className="text-[10px] text-slate-400">{c.phone} • {c.email}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Recherche Événement (filtré par client si sélectionné) */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 block">
                Événement associé (optionnel)
              </label>
              {eventId && (
                <button
                  type="button"
                  onClick={handleClearEvent}
                  className="text-[10px] font-semibold text-slate-400 hover:text-rose-600 cursor-pointer"
                >
                  Retirer
                </button>
              )}
            </div>
            <input
              type="text"
              value={eventSearch}
              onChange={(e) => {
                setEventSearch(e.target.value);
                setEventId('');
              }}
              onFocus={() => setIsEventDropdownOpen(true)}
              onBlur={() => setTimeout(() => setIsEventDropdownOpen(false), 150)}
              placeholder={clientId ? 'Rechercher un événement du client...' : 'Rechercher un événement (tous clients)...'}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden"
            />
            {isEventDropdownOpen && eventMatches.length > 0 && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {eventMatches.map((ev) => (
                  <button
                    type="button"
                    key={ev.id}
                    onMouseDown={() => handleSelectEvent(ev)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 cursor-pointer border-b border-slate-100 last:border-0"
                  >
                    <p className="font-bold text-slate-900">
                      <span className="font-mono text-emerald-700">{ev.id}</span> — {ev.name}
                    </p>
                    <p className="text-[10px] text-slate-400">{ev.clientName}{ev.location ? ` • ${ev.location}` : ''}</p>
                  </button>
                ))}
              </div>
            )}
            {isEventDropdownOpen && eventSearch && eventMatches.length === 0 && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-[11px] text-slate-400">
                Aucun événement trouvé{clientId ? ' pour ce client' : ''}.
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Description de la recette *
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Ex: Acompte 50% signature contrat"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Montant reçu (Ar) *
              </label>
              <input
                type="number"
                step="10000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                className="w-full text-xs font-bold px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden text-emerald-700"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Mode de paiement *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden bg-white"
              >
                <option value="Espèces">Espèces</option>
                <option value="Virement bancaire">Virement bancaire</option>
                <option value="Mobile Money">Mobile Money (MVola, Orange, Airtel)</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Commentaire / Référence
            </label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ex: Ref BNI-28491 ou Reçu N°83"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Valider la Recette</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
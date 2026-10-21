import React, { useState } from 'react';
import { X, PlusCircle, TrendingDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ExpenseCategory, PaymentMethod } from '../../types';

export const ExpenseModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { addExpense, events } = useApp();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>('Aliments');
  const [description, setDescription] = useState('');
  const [supplier, setSupplier] = useState('');
  const [eventId, setEventId] = useState<string>('');
  const [amount, setAmount] = useState<number>(1500000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Virement bancaire');
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedEvent = events.find((ev) => ev.id === eventId);

    addExpense({
      date,
      category,
      description: description.trim() || `Dépense ${category}`,
      supplier: supplier.trim() || 'Fournisseur local',
      eventId: eventId || undefined,
      eventName: selectedEvent ? selectedEvent.name : undefined,
      amount: Number(amount) || 0,
      paymentMethod,
      comment,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-rose-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-rose-300" />
            <h3 className="text-base font-bold text-white">
              Enregistrer une Dépense (Argent Sorti)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-rose-200 hover:text-white p-1 rounded-lg hover:bg-rose-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Date de dépense *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Catégorie de dépense *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-hidden bg-white"
              >
                <option value="Aliments">Aliments (Traiteur, Viandes, Boissons)</option>
                <option value="Transport">Transport & Cortège</option>
                <option value="Matériel">Matériel (Chaises, Tables, Nappage)</option>
                <option value="Décoration">Décoration & Fleurs fraîches</option>
                <option value="Location">Location de salle / Espaces</option>
                <option value="Salaires">Salaires & Vacations</option>
                <option value="Communication">Communication & Publicité</option>
                <option value="Fournitures">Fournitures de bureau</option>
                <option value="Carburant">Carburant</option>
                <option value="Entretien">Entretien & Maintenance</option>
                <option value="Autres dépenses">Autres dépenses</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Événement associé (optionnel)
            </label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-hidden bg-white"
            >
              <option value="">-- Dépense générale de l'entreprise --</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} ({ev.clientName})
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Si associé, cette dépense sera imputée à la rentabilité de l'événement.
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Description de la dépense *
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Ex: Achat viandes fines, fleurs fraîches d'Anosibe..."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Fournisseur / Prestataire *
            </label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              required
              placeholder="Ex: Fleuriste Anosibe, Traiteur Mahamasina..."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Montant payé (Ar) *
              </label>
              <input
                type="number"
                step="10000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                className="w-full text-xs font-bold px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-hidden text-rose-700"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Mode de paiement *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-hidden bg-white"
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
              Commentaire / Facture justificative
            </label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ex: Facture fournisseur N° 1083"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-hidden"
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
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Enregistrer la Dépense</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

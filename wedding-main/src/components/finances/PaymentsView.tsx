import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Receipt as ReceiptIcon,
  DollarSign,
  Printer,
  Trash2,
  Eye,
  Smartphone,
  Building2,
  Coins,
  FileCheck,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FinanceReceipt, PaymentMethod, ReceiptCategory } from '../../types';
import { formatAriary, formatDateFr, formatShortDateFr } from '../../utils/formatters';
import { ReceiptModal } from '../modals/ReceiptModal';

export const PaymentsView: React.FC = () => {
  const { receipts, deleteReceipt, totalReceipts, events } = useApp();

  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<FinanceReceipt | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Statistics calculation
  const currentMonthStr = '2026-08'; // Base month for demo data
  const currentMonthReceipts = receipts.filter((r) => r.date.startsWith('2026-08') || r.date.startsWith('2026-09'));
  const currentMonthTotal = currentMonthReceipts.reduce((sum, r) => sum + r.amount, 0);

  const acomptesTotal = receipts
    .filter((r) => r.category === 'Acompte')
    .reduce((sum, r) => sum + r.amount, 0);

  const soldesTotal = receipts
    .filter((r) => r.category === 'Solde événement' || r.category === 'Paiement événement')
    .reduce((sum, r) => sum + r.amount, 0);

  const mobileMoneyTotal = receipts
    .filter((r) => r.paymentMethod === 'Mobile Money')
    .reduce((sum, r) => sum + r.amount, 0);

  const bankTotal = receipts
    .filter((r) => r.paymentMethod === 'Virement bancaire')
    .reduce((sum, r) => sum + r.amount, 0);

  const cashTotal = receipts
    .filter((r) => r.paymentMethod === 'Espèces')
    .reduce((sum, r) => sum + r.amount, 0);

  // Filtering
  const filteredReceipts = receipts.filter((r) => {
    const matchesSearch =
      r.number.toLowerCase().includes(search.toLowerCase()) ||
      r.client.toLowerCase().includes(search.toLowerCase()) ||
      r.eventName.toLowerCase().includes(search.toLowerCase()) ||
      (r.comment && r.comment.toLowerCase().includes(search.toLowerCase())) ||
      r.description.toLowerCase().includes(search.toLowerCase());

    const matchesMethod = methodFilter === 'all' || r.paymentMethod === methodFilter;
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;

    return matchesSearch && matchesMethod && matchesCategory;
  });

  const handleDelete = (id: string, number: string) => {
    if (confirm(`Confirmez-vous la suppression du reçu de paiement ${number} ? Cette action mettra à jour le solde de l'événement lié.`)) {
      deleteReceipt(id);
      if (selectedReceipt?.id === id) {
        setSelectedReceipt(null);
      }
    }
  };

  const getMethodBadge = (method: PaymentMethod) => {
    switch (method) {
      case 'Mobile Money':
        return {
          icon: <Smartphone className="w-3.5 h-3.5 text-amber-600" />,
          label: 'Mobile Money (MVola / Orange)',
          bg: 'bg-amber-50 text-amber-900 border-amber-200',
        };
      case 'Virement bancaire':
        return {
          icon: <Building2 className="w-3.5 h-3.5 text-blue-600" />,
          label: 'Virement bancaire',
          bg: 'bg-blue-50 text-blue-900 border-blue-200',
        };
      case 'Espèces':
        return {
          icon: <Coins className="w-3.5 h-3.5 text-emerald-600" />,
          label: 'Espèces (Agence)',
          bg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
        };
      default:
        return {
          icon: <CreditCard className="w-3.5 h-3.5 text-slate-600" />,
          label: method,
          bg: 'bg-slate-50 text-slate-800 border-slate-200',
        };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Gestion des Règlements & Paiements Clients
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Suivi des encaissements réels, acomptes, quittances officielles et ventilations (MVola, Banque, Espèces)
              </p>
            </div>
          </div>
        </div>

        <button
          id="btn-new-payment"
          onClick={() => setIsReceiptModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Encaisser un Paiement</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Encaissé */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Encaissé</span>
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-slate-900 mt-2">
            {formatAriary(totalReceipts)}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            {receipts.length} règlements enregistrés
          </p>
        </div>

        {/* Card 2: Acomptes & Avances */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Acomptes Confirmés</span>
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-amber-900 mt-2">
            {formatAriary(acomptesTotal)}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Réservations de dates et confirmations
          </p>
        </div>

        {/* Card 3: Soldes & Tranches */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Soldes & Prestations</span>
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-800">
              <ReceiptIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-blue-900 mt-2">
            {formatAriary(soldesTotal)}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Paiements finaux & régularisations
          </p>
        </div>

        {/* Card 4: Mobile Money (Madagascar) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mobile Money</span>
            <div className="p-1.5 rounded-lg bg-orange-100 text-orange-800">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-black text-orange-950 mt-2">
            {formatAriary(mobileMoneyTotal)}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium mt-1">
            <span>Banque : {formatAriary(bankTotal)}</span>
            <span>•</span>
            <span>Espèces : {formatAriary(cashTotal)}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par N° reçu, client, référence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Filter by Method */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white outline-hidden text-slate-700 font-medium cursor-pointer"
          >
            <option value="all">Tous les modes de paiement</option>
            <option value="Mobile Money">Mobile Money (MVola / Orange)</option>
            <option value="Virement bancaire">Virement bancaire (BNI, BMOI, etc.)</option>
            <option value="Espèces">Espèces (Agence)</option>
            <option value="Autre">Autre</option>
          </select>

          {/* Filter by Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white outline-hidden text-slate-700 font-medium cursor-pointer"
          >
            <option value="all">Toutes catégories</option>
            <option value="Acompte">Acomptes (50%)</option>
            <option value="Solde événement">Soldes finaux</option>
            <option value="Paiement événement">Tranches intermédiaires</option>
            <option value="Prestation">Prestations additionnelles</option>
          </select>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5">N° Reçu</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Client</th>
                <th className="px-4 py-3.5">Événement rattaché</th>
                <th className="px-4 py-3.5">Type & Libellé</th>
                <th className="px-4 py-3.5">Mode de Paiement</th>
                <th className="px-4 py-3.5 text-right">Montant Encaissé</th>
                <th className="px-4 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Aucun paiement trouvé</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Ajustez vos filtres de recherche ou enregistrez un nouvel encaissement.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((rec) => {
                  const badge = getMethodBadge(rec.paymentMethod);
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <span className="px-2 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          {rec.number}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                        {formatShortDateFr(rec.date)}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        {rec.client}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate">
                        {rec.eventName || '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 mb-0.5">
                          {rec.category}
                        </span>
                        <p className="text-slate-500 text-[11px] truncate max-w-xs">
                          {rec.description}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.bg}`}
                        >
                          {badge.icon}
                          <span>{rec.paymentMethod}</span>
                        </span>
                        {rec.comment && (
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[160px]">
                            {rec.comment}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right font-black text-emerald-700 text-sm whitespace-nowrap">
                        +{formatAriary(rec.amount)}
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedReceipt(rec)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Voir et imprimer la quittance"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(rec.id, rec.number)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Supprimer le reçu"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Payment Receipt Slip Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header Modal */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ReceiptIcon className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold">
                  Quittance de Paiement Officielle — {selectedReceipt.number}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer</span>
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Receipt Body */}
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                <div>
                  <h2 className="text-base font-black text-slate-950 tracking-wider">
                    EFFICIENCY WEDDING MADAGASCAR
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Agence Événementielle & Wedding Planner de Prestige
                    <br />
                    Antanimena, Antananarivo 101, Madagascar
                    <br />
                    Tél : +261 34 11 000 01 • direction@efficiencywedding.mg
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                    REÇU OFFICIEL
                  </span>
                  <h3 className="text-sm font-mono font-bold text-slate-900 mt-2">
                    {selectedReceipt.number}
                  </h3>
                  <p className="text-xs text-slate-500">Date : {formatDateFr(selectedReceipt.date)}</p>
                </div>
              </div>

              {/* Client and Event Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Reçu de :</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedReceipt.client}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Événement :</span>
                    <p className="font-semibold text-slate-800 text-sm mt-0.5">{selectedReceipt.eventName}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Nature du versement :</span>
                    <p className="font-medium text-slate-700 mt-0.5">{selectedReceipt.category} — {selectedReceipt.description}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Mode de paiement :</span>
                    <p className="font-bold text-slate-900 mt-0.5">{selectedReceipt.paymentMethod}</p>
                    {selectedReceipt.comment && (
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5">{selectedReceipt.comment}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Amount Box */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-1">
                <span className="text-xs font-bold uppercase text-emerald-800">
                  Somme totale perçue et acquittée
                </span>
                <p className="text-2xl font-black text-emerald-900 tracking-tight">
                  {formatAriary(selectedReceipt.amount)}
                </p>
              </div>

              {/* Stamp and Signatures */}
              <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Lieu d'encaissement :</p>
                  <p className="font-semibold text-slate-700">Antananarivo, Madagascar</p>
                  <p className="text-[10px] text-slate-400 mt-3">Mention : Pour Acquit et Remise de quittance</p>
                </div>
                <div className="text-right">
                  <div className="w-32 h-16 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-[10px] font-bold uppercase">
                    Cachet & Signature
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 font-semibold">Direction Financière</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Payment Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />
    </div>
  );
};

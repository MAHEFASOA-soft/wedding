import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Filter,
  Search,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  PieChart,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatAriary, formatDateFr, formatShortDateFr, getStatusColor } from '../../utils/formatters';
import { ReceiptModal } from '../modals/ReceiptModal';
import { ExpenseModal } from '../modals/ExpenseModal';
import { SalaryModal } from '../modals/SalaryModal';

type FinanceSubTab = 'overview' | 'receipts' | 'expenses' | 'salaries' | 'profitability';

export const FinancesView: React.FC = () => {
  const {
    receipts,
    expenses,
    salaries,
    events,
    totalReceipts,
    totalExpenses,
    netProfit,
    pendingSalariesTotal,
    monthExpensesTotal,
    deleteReceipt,
    deleteExpense,
    updateSalaryStatus,
    deleteSalary,
    getEventFinancials,
    setSelectedEventForModal,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<FinanceSubTab>('overview');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [financeSearch, setFinanceSearch] = useState<string>('');

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);

  // Filtered Receipts
  const filteredReceipts = receipts.filter((r) => {
    const matchesSearch =
      r.client.toLowerCase().includes(financeSearch.toLowerCase()) ||
      r.eventName.toLowerCase().includes(financeSearch.toLowerCase()) ||
      r.number.toLowerCase().includes(financeSearch.toLowerCase()) ||
      r.description.toLowerCase().includes(financeSearch.toLowerCase());
    const matchesCat = filterCategory === 'all' || r.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  // Filtered Expenses
  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.description.toLowerCase().includes(financeSearch.toLowerCase()) ||
      e.supplier.toLowerCase().includes(financeSearch.toLowerCase()) ||
      e.number.toLowerCase().includes(financeSearch.toLowerCase()) ||
      (e.eventName && e.eventName.toLowerCase().includes(financeSearch.toLowerCase()));
    const matchesCat = filterCategory === 'all' || e.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  // Categories breakdown for expenses
  const expensesByCategory = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  // Food / Aliments total specifically (Section 10)
  const foodExpensesTotal = expenses
    .filter((e) => e.category === 'Aliments')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Profit Margin ratio
  const profitMarginPercent = totalReceipts > 0 ? ((netProfit / totalReceipts) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & KPI Cards (Section 11) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Recettes */}
        <div className="p-5 rounded-2xl bg-white border border-emerald-100 shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              💰 Total Recettes
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 relative z-10">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {formatAriary(totalReceipts)}
            </h3>
            <p className="text-xs text-emerald-700 font-medium mt-1 flex items-center gap-1">
              <span>{receipts.length} encaissements validés</span>
            </p>
          </div>
        </div>

        {/* Dépenses */}
        <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
              💸 Total Dépenses
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 relative z-10">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {formatAriary(totalExpenses)}
            </h3>
            <p className="text-xs text-rose-700 font-medium mt-1 flex items-center gap-1">
              <span>Inclut aliments ({formatAriary(foodExpensesTotal)}) & salaires</span>
            </p>
          </div>
        </div>

        {/* Bénéfice / Résultat */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              📈 Bénéfice Net (Résultat)
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 relative z-10">
            <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${netProfit >= 0 ? 'text-white' : 'text-rose-400'}`}>
              {formatAriary(netProfit)}
            </h3>
            <p className="text-xs text-slate-300 font-medium mt-1 flex items-center gap-1">
              <span>Marge nette globale : </span>
              <span className="text-amber-400 font-bold">{profitMarginPercent}%</span>
            </p>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            id="tab-finance-overview"
            onClick={() => {
              setActiveSubTab('overview');
              setFilterCategory('all');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
              activeSubTab === 'overview'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Vue Générale
          </button>

          <button
            id="tab-finance-receipts"
            onClick={() => {
              setActiveSubTab('receipts');
              setFilterCategory('all');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 ${
              activeSubTab === 'receipts'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>Argent reçu ({receipts.length})</span>
          </button>

          <button
            id="tab-finance-expenses"
            onClick={() => {
              setActiveSubTab('expenses');
              setFilterCategory('all');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 ${
              activeSubTab === 'expenses'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>💸 Dépenses ({expenses.length})</span>
          </button>

          <button
            id="tab-finance-salaries"
            onClick={() => {
              setActiveSubTab('salaries');
              setFilterCategory('all');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 ${
              activeSubTab === 'salaries'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>👥 Salaires ({salaries.length})</span>
          </button>

          <button
            id="tab-finance-profitability"
            onClick={() => {
              setActiveSubTab('profitability');
              setFilterCategory('all');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 ${
              activeSubTab === 'profitability'
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>🎯 Rentabilité par Événement</span>
          </button>
        </div>

        {/* Action Buttons to Add Transactions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-open-receipt-modal"
            onClick={() => setIsReceiptModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Recette</span>
          </button>

          <button
            id="btn-open-expense-modal"
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Dépense</span>
          </button>

          <button
            id="btn-open-salary-modal"
            onClick={() => setIsSalaryModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Salaire</span>
          </button>
        </div>
      </div>

      {/* 1. OVERVIEW SUBTAB */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Indicator Strip */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                Salaires en attente
              </span>
              <span className="text-lg font-bold text-amber-700 mt-0.5 block">
                {formatAriary(pendingSalariesTotal)}
              </span>
              <span className="text-[10px] text-slate-400">À régler fin de mois</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                Coûts Aliments & Traiteur
              </span>
              <span className="text-lg font-bold text-slate-800 mt-0.5 block">
                {formatAriary(foodExpensesTotal)}
              </span>
              <span className="text-[10px] text-slate-400">Viandes, fruits & boissons</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                Dépenses du mois
              </span>
              <span className="text-lg font-bold text-rose-700 mt-0.5 block">
                {formatAriary(monthExpensesTotal)}
              </span>
              <span className="text-[10px] text-slate-400">Août - Septembre 2026</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                Événements financés
              </span>
              <span className="text-lg font-bold text-emerald-700 mt-0.5 block">
                {events.length} événements
              </span>
              <span className="text-[10px] text-slate-400">Suivis en temps réel</span>
            </div>
          </div>

          {/* Dépenses par catégorie & Événements rentables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Breakdown by Category */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-amber-600" />
                  <span>Répartition des Dépenses par Catégorie</span>
                </h4>
                <span className="text-xs text-slate-500 font-medium">
                  Total : {formatAriary(totalExpenses)}
                </span>
              </div>

              <div className="space-y-3">
                {(Object.entries(expensesByCategory) as [string, number][])
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, amount]) => {
                    const pct = totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : '0';
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700">{cat}</span>
                          <span className="font-bold text-slate-900">
                            {formatAriary(amount)}{' '}
                            <span className="text-[10px] text-slate-400 font-normal">({pct}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Top Events by Margin */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Rentabilité des Événements Récents</span>
                </h4>
                <button
                  onClick={() => setActiveSubTab('profitability')}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800"
                >
                  Voir tout →
                </button>
              </div>

              <div className="space-y-2.5">
                {events.slice(0, 5).map((ev) => {
                  const fin = getEventFinancials(ev.id);
                  const marginPct =
                    fin.amountReceived > 0
                      ? ((fin.netMargin / fin.amountReceived) * 100).toFixed(0)
                      : '0';

                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEventForModal(ev)}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-amber-50/40 border border-slate-200 hover:border-amber-300/60 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-3">
                        <h5 className="text-xs font-bold text-slate-900 truncate">{ev.name}</h5>
                        <p className="text-[11px] text-slate-500 truncate">
                          {ev.clientName} • {formatShortDateFr(ev.date)}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-extrabold text-emerald-700 block">
                          +{formatAriary(fin.netMargin)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          Marge : {marginPct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ARGENT REÇU / RECETTES (Section 6) */}
      {activeSubTab === 'receipts' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher numéro, client, événement..."
                value={financeSearch}
                onChange={(e) => setFinanceSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Catégorie :</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white outline-hidden"
              >
                <option value="all">Toutes les catégories</option>
                <option value="Paiement événement">Paiement événement</option>
                <option value="Acompte">Acompte</option>
                <option value="Solde événement">Solde événement</option>
                <option value="Prestation">Prestation</option>
                <option value="Location">Location</option>
                <option value="Autre recette">Autre recette</option>
              </select>
            </div>
          </div>

          {/* Receipts Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Numéro</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Événement</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Catégorie</th>
                    <th className="px-4 py-3">Paiement</th>
                    <th className="px-4 py-3 text-right">Montant (Ar)</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReceipts.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {r.number}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {formatShortDateFr(r.date)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{r.client}</td>
                      <td className="px-4 py-3 text-slate-700 max-w-xs truncate">
                        {r.eventName || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                        {r.description}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {r.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {r.paymentMethod}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-emerald-700 whitespace-nowrap">
                        {formatAriary(r.amount)}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => deleteReceipt(r.id)}
                          title="Supprimer la recette"
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Receipts Footer (Section 6) */}
            <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="text-xs uppercase font-bold text-slate-300">
                TOTAL DES RECETTES ENREGISTRÉES ({filteredReceipts.length} lignes)
              </span>
              <span className="text-xl font-black text-emerald-400">
                {formatAriary(
                  filteredReceipts.reduce((acc, curr) => acc + curr.amount, 0)
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. ARGENT QUI SORT / DÉPENSES (Section 7) */}
      {activeSubTab === 'expenses' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher dépense, fournisseur, événement..."
                value={financeSearch}
                onChange={(e) => setFinanceSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-hidden focus:border-rose-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Catégorie :</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white outline-hidden"
              >
                <option value="all">Toutes les catégories</option>
                <option value="Aliments">Aliments</option>
                <option value="Transport">Transport</option>
                <option value="Matériel">Matériel</option>
                <option value="Décoration">Décoration</option>
                <option value="Location">Location</option>
                <option value="Salaires">Salaires</option>
                <option value="Communication">Communication</option>
                <option value="Fournitures">Fournitures</option>
                <option value="Carburant">Carburant</option>
                <option value="Entretien">Entretien</option>
                <option value="Autres dépenses">Autres dépenses</option>
              </select>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Numéro</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Catégorie</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Fournisseur</th>
                    <th className="px-4 py-3">Événement Associé</th>
                    <th className="px-4 py-3">Mode Paiement</th>
                    <th className="px-4 py-3 text-right">Montant (Ar)</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {exp.number}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {formatShortDateFr(exp.date)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800 max-w-xs truncate">
                        {exp.description}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{exp.supplier}</td>
                      <td className="px-4 py-3 text-slate-700 max-w-xs truncate">
                        {exp.eventName ? (
                          <span className="text-amber-700 font-medium">{exp.eventName}</span>
                        ) : (
                          <span className="text-slate-400 italic">Général</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {exp.paymentMethod}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-rose-700 whitespace-nowrap">
                        {formatAriary(exp.amount)}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => deleteExpense(exp.id)}
                          title="Supprimer la dépense"
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Expenses Footer (Section 7) */}
            <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="text-xs uppercase font-bold text-slate-300">
                TOTAL DES DÉPENSES ENREGISTRÉES ({filteredExpenses.length} lignes)
              </span>
              <span className="text-xl font-black text-rose-400">
                {formatAriary(
                  filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0)
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. SALAIRES DES EMPLOYÉS (Section 8) */}
      {activeSubTab === 'salaries' && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-xl flex items-center justify-between">
            <div className="text-xs text-amber-900">
              <span className="font-bold">Comptabilisation automatique : </span>
              Tout salaire enregistré avec le statut <span className="font-semibold text-emerald-800">« Payé »</span> est immédiatement imputé dans le total des dépenses de l’entreprise.
            </div>
            <button
              onClick={() => setIsSalaryModalOpen(true)}
              className="px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg shadow-xs transition-colors shrink-0"
            >
              + Nouveau Salaire
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Employé</th>
                    <th className="px-4 py-3">Fonction</th>
                    <th className="px-4 py-3">Mois</th>
                    <th className="px-4 py-3 text-right">Salaire Base</th>
                    <th className="px-4 py-3 text-right">Prime</th>
                    <th className="px-4 py-3 text-right">Retenue</th>
                    <th className="px-4 py-3 text-right">Net Payé</th>
                    <th className="px-4 py-3">Date Paiement</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {salaries.map((sal) => {
                    const statusSt = getStatusColor(sal.status);
                    return (
                      <tr key={sal.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-900">{sal.employeeName}</td>
                        <td className="px-4 py-3 text-slate-600">{sal.role}</td>
                        <td className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap">
                          {sal.month}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-700 whitespace-nowrap">
                          {formatAriary(sal.baseSalary)}
                        </td>
                        <td className="px-4 py-3 text-right text-emerald-700 font-medium whitespace-nowrap">
                          +{formatAriary(sal.bonus)}
                        </td>
                        <td className="px-4 py-3 text-right text-rose-700 font-medium whitespace-nowrap">
                          -{formatAriary(sal.deduction)}
                        </td>
                        <td className="px-4 py-3 text-right font-black text-slate-900 whitespace-nowrap">
                          {formatAriary(sal.netPaid)}
                        </td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                          {formatShortDateFr(sal.paymentDate) || '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusSt.bg} ${statusSt.text} ${statusSt.border}`}
                          >
                            {sal.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap space-x-1">
                          {sal.status !== 'Payé' && (
                            <button
                              onClick={() => updateSalaryStatus(sal.id, 'Payé')}
                              className="px-2 py-0.5 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
                            >
                              Régler
                            </button>
                          )}
                          <button
                            onClick={() => deleteSalary(sal.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="text-xs uppercase font-bold text-slate-300">
                MASSE SALARIALE ENREGISTRÉE ({salaries.length} fiches)
              </span>
              <span className="text-xl font-black text-amber-400">
                {formatAriary(salaries.reduce((acc, curr) => acc + curr.netPaid, 0))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 5. RENTABILITÉ PAR ÉVÉNEMENT (Section 9, 10 & 16) */}
      {activeSubTab === 'profitability' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Analyse de Rentabilité Événement par Événement
            </h4>
            <p className="text-xs text-slate-500">
              Formule : <span className="font-semibold text-slate-700">Prix Total</span> — <span className="font-semibold text-emerald-700">Montant Reçu</span> = <span className="font-semibold text-amber-700">Montant Restant</span>. La marge nette est calculée en déduisant toutes les dépenses affectées (aliments, transport, décoration, matériel, etc.).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((ev) => {
              const fin = getEventFinancials(ev.id);
              const marginPct =
                fin.amountReceived > 0
                  ? ((fin.netMargin / fin.amountReceived) * 100).toFixed(1)
                  : '0';

              return (
                <div
                  key={ev.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-amber-400/50 transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                          {ev.code}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {ev.type}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{ev.name}</h4>
                      <p className="text-xs text-slate-500">
                        {ev.clientName} • {formatDateFr(ev.date)} • {ev.guestCount} invités
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedEventForModal(ev)}
                      className="px-2.5 py-1 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors shrink-0"
                    >
                      Détails →
                    </button>
                  </div>

                  {/* Financial Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-medium">Prix Total</span>
                      <span className="font-bold text-slate-900 mt-0.5 block">
                        {formatAriary(fin.totalPrice)}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                      <span className="text-[10px] text-emerald-700 block font-medium">Reçu</span>
                      <span className="font-bold text-emerald-800 mt-0.5 block">
                        {formatAriary(fin.amountReceived)}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-100">
                      <span className="text-[10px] text-amber-700 block font-medium">Reste</span>
                      <span className="font-bold text-amber-800 mt-0.5 block">
                        {formatAriary(fin.amountRemaining)}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-rose-50 border border-rose-100">
                      <span className="text-[10px] text-rose-700 block font-medium">Dépenses</span>
                      <span className="font-bold text-rose-800 mt-0.5 block">
                        {formatAriary(fin.totalExpenses)}
                      </span>
                    </div>
                  </div>

                  {/* Profit summary bar */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Bénéfice Net Actuel :</span>
                    <div className="text-right">
                      <span
                        className={`font-black text-sm ${
                          fin.netMargin >= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {formatAriary(fin.netMargin)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Marge : {marginPct}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      <ReceiptModal isOpen={isReceiptModalOpen} onClose={() => setIsReceiptModalOpen(false)} />
      <ExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} />
      <SalaryModal isOpen={isSalaryModalOpen} onClose={() => setIsSalaryModalOpen(false)} />
    </div>
  );
};

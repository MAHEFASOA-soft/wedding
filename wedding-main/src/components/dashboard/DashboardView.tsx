import React from 'react';
import {
  Sparkles,
  TrendingUp,
  DollarSign,
  Calendar,
  CheckSquare,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  MapPin,
  ChevronRight,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatAriary, formatDateFr, formatShortDateFr, getStatusColor } from '../../utils/formatters';
import FinancialSummary from './FinancialSummary';

export const DashboardView: React.FC = () => {
  const {
    events,
    tasks,
    receipts,
    expenses,
    salaries,
    totalReceipts,
    totalExpenses,
    netProfit,
    pendingSalariesTotal,
    monthExpensesTotal,
    setActiveTab,
    setSelectedEventForModal,
  } = useApp();

  // Upcoming events
  const upcomingEvents = [...events]
    .filter((e) => e.status !== 'Terminé' && e.status !== 'Annulé')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  // Urgent/High priority tasks
  const importantTasks = tasks
    .filter((t) => t.status !== 'Terminé')
    .sort((a, b) => (a.priority === 'Haute' ? -1 : 1))
    .slice(0, 4);

  // Recent Receipts
  const recentReceipts = [...receipts].slice(-4).reverse();

  return (
    <div className="space-y-6 pb-12">
      {/* 1. FINANCIAL SUMMARY BANNER (Section 17: RECETTES, DÉPENSES, BÉNÉFICE) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-5 sm:p-6 rounded-2xl border border-slate-800 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                ERP FINANCES & GESTION
              </span>
              <span className="text-xs text-slate-400">Efficiency Wedding Madagascar</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1.5">
              Synthèse Financière & Activité de l'Agence
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Suivi automatisé du chiffre d'affaires, des encaissements clients et des dépenses
            </p>
          </div>

          <button
            onClick={() => setActiveTab('finances')}
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-colors shadow-sm"
          >
            <span>Ouvrir Module Finances</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Core Financial Cards: RECETTES, DÉPENSES, BÉNÉFICE */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
          {/* Recettes */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
               Argent Reçu (Recettes)
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                {formatAriary(totalReceipts)}
              </h3>
              <span className="text-[10px] text-slate-400">
                Chiffre d'affaires encaissé
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>

          {/* Dépenses */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 block">
               Argent Dépensé (Dépenses)
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                {formatAriary(totalExpenses)}
              </h3>
              <span className="text-[10px] text-slate-400">
                Aliments, déco, logistique, salaires
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>

          {/* Bénéfice */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-amber-500/30 flex items-center justify-between relative overflow-hidden">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block">
              Bénéfice Net Réalisé
              </span>
              <h3 className={`text-xl sm:text-2xl font-black mt-1 ${netProfit >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                {formatAriary(netProfit)}
              </h3>
              <span className="text-[10px] text-slate-300">
                Recettes — Dépenses
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

        {/* <FinancialSummary
  onOpenFinances={() => setActiveTab("finances")}
/> */}

      {/* 2. SECONDARY KPI STRIP (Section 17: Salaires à payer, Dépenses du mois, etc.) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Salaires à Payer
          </span>
          <span className="text-base font-extrabold text-amber-700 mt-1 block">
            {formatAriary(pendingSalariesTotal)}
          </span>
          <span className="text-[10px] text-slate-500">Fin de mois</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Dépenses du Mois
          </span>
          <span className="text-base font-extrabold text-slate-900 mt-1 block">
            {formatAriary(monthExpensesTotal)}
          </span>
          <span className="text-[10px] text-slate-500">Mois en cours</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Événements Actifs
          </span>
          <span className="text-base font-extrabold text-emerald-700 mt-1 block">
            {upcomingEvents.length} événements
          </span>
          <span className="text-[10px] text-slate-500">En cours / planifiés</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Tâches Restantes
          </span>
          <span className="text-base font-extrabold text-indigo-700 mt-1 block">
            {tasks.filter((t) => t.status !== 'Terminé').length} tâches
          </span>
          <span className="text-[10px] text-slate-500">À traiter</span>
        </div>
      </div>

      {/* 3. MAIN SECTION: UPCOMING EVENTS & URGENT TASKS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Événements à venir (Section 17) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Événements à Venir & Cérémonies Planifiées
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('planning')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <span>Voir planning complet</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {upcomingEvents.map((ev) => {
              const statusSt = getStatusColor(ev.status);
              const remainingAmount = Math.max(0, ev.totalPrice - ev.amountReceived);

              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEventForModal(ev)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-amber-400/80 bg-slate-50/50 hover:bg-amber-50/20 transition-all cursor-pointer space-y-3 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                        {ev.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusSt.bg} ${statusSt.text} ${statusSt.border}`}
                      >
                        {ev.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-900 transition-colors leading-snug">
                      {ev.name}
                    </h4>

                    <p className="text-[11px] text-slate-500 mt-1">
                      Client : <span className="font-semibold text-slate-700">{ev.clientName}</span>
                    </p>

                    <div className="mt-2 space-y-1 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{formatDateFr(ev.date)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{ev.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Prix Total</span>
                      <span className="font-bold text-slate-800">{formatAriary(ev.totalPrice)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Reste à payer</span>
                      <span className="font-bold text-amber-700">{formatAriary(remainingAmount)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tâches Importantes (Section 17) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Tâches Prioritaires</h3>
              </div>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800"
              >
                Tout voir →
              </button>
            </div>

            <div className="space-y-2.5 mt-3">
              {importantTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        t.priority === 'Haute'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {t.priority}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Échéance : {formatShortDateFr(t.dueDate)}
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-slate-900 leading-tight">{t.title}</h5>

                  <p className="text-[10px] text-slate-500">
                    Assigné à : <span className="font-medium text-slate-700">{t.assignedTo}</span>
                    {t.eventName && ` • ${t.eventName}`}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('tasks')}
              className="w-full py-2 text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center block"
            >
              Gérer la checklist opérationnelle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

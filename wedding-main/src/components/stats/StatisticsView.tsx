import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  PieChart,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { api } from '../../lib/api';
import { formatAriary } from '../../utils/formatters';

interface StatisticsData {
  totals: {
    receipts: number;
    expenses: number;
    netProfit: number;
    profitMarginPercent: number;
  };
  monthly: Array<{
    key: string;
    month: string;
    receipts: number;
    expenses: number;
  }>;
  expensesByCategory: Array<{
    category: string;
    amount: number;
    percent: number;
  }>;
  eventsByMargin: Array<{
    id: string;
    name: string;
    clientName: string;
    amountReceived: number;
    totalExpenses: number;
    netMargin: number;
    marginPercent: number;
  }>;
}

export const StatisticsView: React.FC = () => {
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.get<StatisticsData>('/statistics').then((result) => {
      if (!active) return;
      setData(result);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  if (loading) {
    return <p role="status" className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Chargement des statistiques…</p>;
  }

  if (!data) {
    return <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">Impossible de charger les statistiques depuis la base de données.</p>;
  }

  const { totals, monthly: monthlyData, expensesByCategory, eventsByMargin } = data;
  const maxMonthlyAmount = Math.max(1, ...monthlyData.flatMap((month) => [month.receipts, month.expenses]));

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-500" />
            <span>Statistiques & Analyses Financières</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Indicateurs calculés à partir des recettes, dépenses et événements enregistrés
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <span>Taux de Marge Globale :</span>
          <span className="text-amber-700 font-black">{totals.profitMarginPercent.toFixed(1)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Recettes enregistrées</p>
          <p className="mt-1 text-lg font-bold tabular-nums text-emerald-700">{formatAriary(totals.receipts)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Dépenses enregistrées</p>
          <p className="mt-1 text-lg font-bold tabular-nums text-rose-700">{formatAriary(totals.expenses)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Résultat net</p>
          <p className={`mt-1 text-lg font-bold tabular-nums ${totals.netProfit >= 0 ? 'text-slate-900' : 'text-red-700'}`}>{formatAriary(totals.netProfit)}</p>
        </div>
      </div>

      {/* Recettes vs Dépenses par Mois (Section 12) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>Évolution Mensuelle : Recettes vs Dépenses (en Ariary)</span>
          </h3>
          <span className="text-xs text-slate-400">6 derniers mois</span>
        </div>

        <div className="space-y-3 pt-2">
          {monthlyData.map((m) => {
            const recWidth = (m.receipts / maxMonthlyAmount) * 100;
            const expWidth = (m.expenses / maxMonthlyAmount) * 100;

            return (
              <div key={m.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">{m.month}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-700 font-bold">
                      Recettes: {formatAriary(m.receipts)}
                    </span>
                    <span className="text-rose-700 font-bold">
                      Dépenses: {formatAriary(m.expenses)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${recWidth}%` }}
                    ></div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-rose-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${expWidth}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Categories & Top Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dépenses par catégorie */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-600" />
              <span>Dépenses par Catégorie de Coût</span>
            </h3>
            <span className="text-xs text-slate-500">Total : {formatAriary(totals.expenses)}</span>
          </div>

          <div className="space-y-3">
            {expensesByCategory.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">Aucune dépense enregistrée.</p>
            ) : expensesByCategory.map(({ category, amount, percent }) => (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{category}</span>
                      <span className="font-bold text-slate-900">
                        {formatAriary(amount)}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">({percent.toFixed(1)}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-2 rounded-full"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
          </div>
        </div>

        {/* Événements les plus rentables (Section 12) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Événements les Plus Rentables</span>
            </h3>
            <span className="text-xs text-slate-500">Classement par marge</span>
          </div>

          <div className="space-y-2.5">
            {eventsByMargin.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">Aucun événement enregistré.</p>
            ) : eventsByMargin.map((event, idx) => (
              <div
                key={event.id}
                className="p-3 rounded-xl border border-slate-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </span>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{event.name}</h4>
                    <span className="text-[10px] text-slate-500">{event.clientName}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                    <span className={`text-xs font-black block ${event.netMargin >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {formatAriary(event.netMargin)}
                  </span>
                  <span className="text-[10px] text-slate-500">Marge {event.marginPercent.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

interface FinancialSummaryProps {
  onOpenFinances?: () => void;
}

const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  onOpenFinances,
}) => {
  // ============================================================
  // DONNÉES
  // À remplacer ensuite par tes vraies données
  // ============================================================

  const currentMonthReceipts = 12500000;
  const currentMonthExpenses = 4800000;

  const previousMonthReceipts = 9800000;
  const previousMonthExpenses = 5200000;

  // ============================================================
  // DATES
  // ============================================================

  const today = new Date();

  const currentMonthDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  const previousMonthDate = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    1
  );

  // ============================================================
  // NOM DES MOIS
  // ============================================================

  const formatMonth = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      month: "long",
    }).format(date);
  };

  const currentMonthName = formatMonth(currentMonthDate);
  const previousMonthName = formatMonth(previousMonthDate);

  // ============================================================
  // BÉNÉFICES
  // ============================================================

  const currentMonthProfit =
    currentMonthReceipts - currentMonthExpenses;

  const previousMonthProfit =
    previousMonthReceipts - previousMonthExpenses;

  // ============================================================
  // FORMAT ARIARY
  // ============================================================

  const formatAriary = (value: number) => {
    return (
      new Intl.NumberFormat("fr-FR", {
        maximumFractionDigits: 0,
      }).format(value) + " Ar"
    );
  };

  // ============================================================
  // VARIATION
  // ============================================================

  const getVariation = (
    current: number,
    previous: number
  ) => {
    if (previous === 0) {
      return current === 0 ? 0 : 100;
    }

    return ((current - previous) / Math.abs(previous)) * 100;
  };

  const receiptsVariation = getVariation(
    currentMonthReceipts,
    previousMonthReceipts
  );

  const expensesVariation = getVariation(
    currentMonthExpenses,
    previousMonthExpenses
  );

  const profitVariation = getVariation(
    currentMonthProfit,
    previousMonthProfit
  );

  // ============================================================
  // COMPOSANT VARIATION
  // ============================================================

  const Variation = ({
    value,
    inverse = false,
  }: {
    value: number;
    inverse?: boolean;
  }) => {
    const positive = value >= 0;

    const good =
      inverse ? !positive : positive;

    return (
      <span
        className={`text-[10px] font-bold ${
          good
            ? "text-emerald-400"
            : "text-rose-400"
        }`}
      >
        {positive ? "+" : ""}
        {value.toFixed(1)}%
      </span>
    );
  };

  // ============================================================
  // CARTE INDICATEUR
  // ============================================================

  const FinancialCard = ({
    label,
    currentValue,
    previousValue,
    variation,
    type,
    inverseVariation = false,
  }: {
    label: string;
    currentValue: number;
    previousValue: number;
    variation: number;
    type: "receipt" | "expense" | "profit";
    inverseVariation?: boolean;
  }) => {
    const isReceipt = type === "receipt";
    const isExpense = type === "expense";

    const labelColor = isReceipt
      ? "text-emerald-400"
      : isExpense
      ? "text-rose-400"
      : "text-amber-300";

    const iconBackground = isReceipt
      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
      : isExpense
      ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
      : "bg-amber-400/10 border-amber-400/20 text-amber-300";

    const Icon = isReceipt
      ? ArrowUpRight
      : isExpense
      ? ArrowDownRight
      : TrendingUp;

    return (
      <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">

        {/* HEADER */}
        <div className="flex items-center justify-between">

          <span
            className={`text-[11px] font-bold uppercase tracking-wider ${labelColor}`}
          >
            {label}
          </span>

          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center border ${iconBackground}`}
          >
            <Icon className="w-4 h-4" />
          </div>

        </div>

        {/* MOIS ACTUEL */}
        <div className="mt-4">

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">
              {currentMonthName}
            </span>

            <span className="text-[9px] font-bold text-amber-400">
              ACTUEL
            </span>
          </div>

          <p
            className={`text-xl font-black mt-1 ${
              type === "profit"
                ? currentValue >= 0
                  ? "text-amber-400"
                  : "text-rose-400"
                : "text-white"
            }`}
          >
            {formatAriary(currentValue)}
          </p>

        </div>

        {/* MOIS PRÉCÉDENT */}
        <div className="mt-3 pt-3 border-t border-slate-700/60">

          <div className="flex items-center justify-between">

            <span className="text-[10px] text-slate-500 uppercase font-semibold">
              {previousMonthName}
            </span>

            <span className="text-[9px] text-slate-500">
              PRÉCÉDENT
            </span>

          </div>

          <div className="flex items-center justify-between mt-1">

            <p className="text-sm font-bold text-slate-300">
              {formatAriary(previousValue)}
            </p>

            <Variation
              value={variation}
              inverse={inverseVariation}
            />

          </div>

        </div>

      </div>
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-5 sm:p-6 rounded-2xl border border-slate-800 text-white shadow-lg">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">

        <div>

          <div className="flex items-center gap-2 flex-wrap">

            <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950">
              ERP FINANCES & GESTION
            </span>

            <span className="text-xs text-slate-400">
              Efficiency Wedding Madagascar
            </span>

          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1.5">
            Synthèse Financière & Activité de l'Agence
          </h2>

          <p className="text-xs text-slate-400 mt-0.5">
            Comparaison des performances financières sur deux mois
          </p>

        </div>

        <button
          onClick={onOpenFinances}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-colors shadow-sm"
        >
          <span>Ouvrir Module Finances</span>
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>

      {/* ======================================================
          LÉGENDE DES MOIS
      ====================================================== */}

      <div className="flex items-center gap-5 pt-4">

        <div className="flex items-center gap-2">

          <span className="w-2 h-2 rounded-full bg-amber-400" />

          <span className="text-[10px] font-semibold text-slate-300 capitalize">
            {currentMonthName}
          </span>

          <span className="text-[9px] text-amber-400 uppercase">
            actuel
          </span>

        </div>

        <div className="flex items-center gap-2">

          <span className="w-2 h-2 rounded-full bg-slate-500" />

          <span className="text-[10px] font-semibold text-slate-400 capitalize">
            {previousMonthName}
          </span>

          <span className="text-[9px] text-slate-500 uppercase">
            précédent
          </span>

        </div>

      </div>

      {/* ======================================================
          3 INDICATEURS COMBINÉS
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">

        {/* RECETTES */}

        <FinancialCard
          label="Argent reçu"
          currentValue={currentMonthReceipts}
          previousValue={previousMonthReceipts}
          variation={receiptsVariation}
          type="receipt"
        />

        {/* DÉPENSES */}

        <FinancialCard
          label="Argent dépensé"
          currentValue={currentMonthExpenses}
          previousValue={previousMonthExpenses}
          variation={expensesVariation}
          type="expense"
          inverseVariation
        />

        {/* BÉNÉFICE */}

        <FinancialCard
          label="Bénéfice net"
          currentValue={currentMonthProfit}
          previousValue={previousMonthProfit}
          variation={profitVariation}
          type="profit"
        />

      </div>

      {/* ======================================================
          RÉSUMÉ
      ====================================================== */}

      <div className="mt-4 pt-4 border-t border-slate-800/80">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Comparaison mensuelle
            </span>

            <p className="text-xs text-slate-400 mt-0.5">
              Évolution par rapport au mois précédent
            </p>

          </div>

          <div className="flex items-center gap-5">

            <div className="text-right">

              <span className="block text-[9px] text-slate-500 uppercase">
                Recettes
              </span>

              <Variation value={receiptsVariation} />

            </div>

            <div className="text-right">

              <span className="block text-[9px] text-slate-500 uppercase">
                Dépenses
              </span>

              <Variation
                value={expensesVariation}
                inverse
              />

            </div>

            <div className="text-right">

              <span className="block text-[9px] text-slate-500 uppercase">
                Bénéfice
              </span>

              <Variation value={profitVariation} />

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default FinancialSummary;
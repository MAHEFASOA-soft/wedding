// src/components/pricing1/PricingPackDetailView.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Crown,
  Check,
  Info,
  Calculator,
  FileText,
  Layers,
  Pencil,
  Sparkles,
  PackageX,
  Plus,
  ChevronDown,
} from 'lucide-react';

import {
  getAllIncludedItems,
  getReferencePack,
  getOwnIncludedItems,
} from './pricingPackHelpers';

import { useApp } from '../../context/AppContext';
import { formatAriary } from '../../utils/formatters';

import {
  findClosestColumnIndex,
  getGuestCountFromHeader,
  getPackBasePrice,
  getPackSupplement,
} from './pricingUtils';

export const PricingPackDetailView: React.FC = () => {
  const { packId } = useParams<{
    packId: string;
  }>();

  const navigate = useNavigate();

  const {
    addQuote,
    setActiveTab,
    clients,
    pricingPacks,
    pricingPacksLoading,
    pricingPacksLoadError,
  } = useApp();

  const pack =
    pricingPacks.find(
      (item) => item.id === packId
    ) ?? null;

  const referencePack = pack
    ? getReferencePack(pack, pricingPacks)
    : undefined;

  const allIncludedItems = pack
    ? getAllIncludedItems(
        pack,
        pricingPacks
      )
    : [];

  const ownIncludedItems = pack
    ? getOwnIncludedItems(pack)
    : [];

  const inheritedItems = pack
    ? allIncludedItems.slice(
        0,
        allIncludedItems.length -
          ownIncludedItems.length
      )
    : [];

  const grid = pack?.pricingGrid;

  const [guestCount, setGuestCount] =
    useState<number>(200);

  useEffect(() => {
    if (!grid || grid.headers.length === 0) {
      return;
    }

    const preferredIndex = Math.min(
      2,
      grid.headers.length - 1
    );

    setGuestCount(
      getGuestCountFromHeader(
        grid.headers[preferredIndex]
      ) || 200
    );
  }, [packId, grid]);

  if (!pack && pricingPacksLoading) {
    return <div className="py-12 text-center text-xs text-slate-500">Chargement du pack…</div>;
  }

  if (!pack) {
    return (
      <div className="space-y-6 pb-12">

        <button
          type="button"
          onClick={() =>
            navigate('/pricing')
          }
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl transition-colors shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />

          <span>
            Retour à la grille tarifaire
          </span>
        </button>

        <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-xs text-center">

          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto">
            <PackageX className="w-7 h-7 text-slate-300" />
          </div>

          <h2 className="text-lg font-black text-slate-900 mt-4">
            {pricingPacksLoadError ? 'Catalogue indisponible' : 'Pack introuvable'}
          </h2>

          <p className="text-xs text-slate-500 mt-1.5">
            {pricingPacksLoadError || <>Aucun pack ne correspond à l'identifiant <span className="font-mono font-bold text-slate-700">« {packId} »</span>.</>}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate('/pricing')
            }
            className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl transition-colors cursor-pointer"
          >
            <span>
              Voir tous les packs
            </span>

            <ArrowRight className="w-3.5 h-3.5" />
          </button>

        </div>
      </div>
    );
  }

  const columnIndex = grid
    ? findClosestColumnIndex(
        grid.headers,
        guestCount
      )
    : -1;

  const supplement =
    getPackSupplement(pack);

  const basePrice =
    getPackBasePrice(
      pack,
      guestCount
    );

  const totalForSelected =
    basePrice + supplement;

  const handleGenerateQuote = () => {
    if (clients.length === 0) {
      alert('Ajoutez un client avant de générer un devis depuis ce pack.');
      return;
    }

    addQuote({
      clientName: clients[0].name,

      eventName:
        `${pack.name} (${guestCount} invités)`,

      date:
        new Date()
          .toISOString()
          .split('T')[0],

      validUntil:
        new Date(
          Date.now() +
            30 * 86400000
        )
          .toISOString()
          .split('T')[0],

      totalAmount:
        totalForSelected,

      status: 'Brouillon',

      items: [
        {
          description:
            `Base : ${pack.name} - Servis (${guestCount} pers.)`,
          quantity: 1,
          unitPrice: basePrice,
          total: basePrice,
        },

        ...(supplement > 0
          ? [
              {
                description:
                  `Supplément ${pack.name}`,
                quantity: 1,
                unitPrice: supplement,
                total: supplement,
              },
            ]
          : []),
      ],
    });

    alert(
      'Le devis a été généré à partir de la fiche détaillée du pack !'
    );

    setActiveTab('quotes');
  };

  const handleOpenInSimulator = () => {
    navigate('/pricing', {
      state: {
        simulatePackId: pack.id,
      },
    });
  };

  return (
    <div className="space-y-6 pb-12">

      {/* RETOUR / FIL D'ARIANE */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

        <button
          type="button"
          onClick={() =>
            navigate('/pricing')
          }
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl transition-colors shadow-xs cursor-pointer w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />

          <span>
            Retour à la grille tarifaire
          </span>
        </button>

        <nav className="flex items-center gap-1.5 text-[11px] text-slate-400">

          <span>
            Grille Tarifaire & Packs
          </span>

          <ChevronRight className="w-3 h-3" />

          <span className="font-semibold text-slate-700 truncate max-w-[240px]">
            {pack.name}
          </span>

        </nav>
      </div>

      {/* HEADER */}

      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-7 shadow-lg">

        <div className="flex flex-wrap items-center gap-2 mb-3">

          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
            {pack.category}
          </span>

          {pack.popular && (
            <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded bg-amber-500 text-slate-950 uppercase tracking-wider">

              <Crown className="w-3 h-3" />

              <span>
                {pack.badge ||
                  'Pack Le Plus Prisé'}
              </span>

            </span>
          )}

          {referencePack && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              Inclut un pack de référence
            </span>
          )}

        </div>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">

          <div className="max-w-2xl">

            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
              {pack.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              {pack.description}
            </p>

          </div>

          <div className="shrink-0 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3">

            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Tarif de départ
            </span>

            <p className="text-xl font-black text-amber-400 font-mono mt-0.5">
              {formatAriary(
                pack.basePrice
              )}
            </p>

            {supplement > 0 && (
              <p className="text-[10px] text-amber-200 mt-0.5">
                + supplément de{' '}
                {formatAriary(
                  supplement
                )}
              </p>
            )}

          </div>
        </div>

        {pack.extraInfo && (
          <div className="mt-4 p-3 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-start gap-2">

            <Info className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />

            <p className="text-[11px] text-amber-100 font-medium leading-relaxed">
              {pack.extraInfo}
            </p>

          </div>
        )}

      </div>

      {/* INDICATEURS */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">

          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Tarif de départ
          </span>

          <p className="text-lg font-black text-slate-900 mt-1 font-mono">
            {formatAriary(
              pack.basePrice
            )}
          </p>

          {supplement > 0 && (
            <p className="text-[10px] text-amber-700 font-semibold mt-0.5">
              + supplément de{' '}
              {formatAriary(
                supplement
              )}
            </p>
          )}

        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">

          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Capacité couverte
          </span>

          <p className="text-lg font-black text-slate-900 mt-1">

            {grid &&
            grid.headers.length > 0
              ? `${getGuestCountFromHeader(
                  grid.headers[0]
                )} → ${getGuestCountFromHeader(
                  grid.headers[
                    grid.headers.length - 1
                  ]
                )} pers.`
              : 'Sur mesure'}

          </p>

        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">

          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Prestations
          </span>

          <p className="text-lg font-black text-slate-900 mt-1">
            {allIncludedItems.length}{' '}
            prestations
          </p>

          {referencePack && (
            <p className="text-[10px] text-slate-500 mt-0.5">
              dont {inheritedItems.length}{' '}
              héritées
            </p>
          )}

        </div>

      </div>

      {/* ========================================================
          PACK DE REFERENCE - FERME PAR DEFAUT
      ======================================================== */}

      {referencePack && (
        <details className="group bg-white rounded-2xl border border-amber-200 shadow-xs overflow-hidden">

          <summary className="list-none cursor-pointer select-none">

            <div className="flex items-center justify-between gap-4 p-5 hover:bg-amber-50/50 transition-colors">

              <div className="flex items-center gap-3 min-w-0">

                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4 text-amber-700" />
                </div>

                <div className="min-w-0">

                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                    Pack inclus par référence
                  </p>

                  <h3 className="text-sm font-black text-slate-900 truncate">
                    {referencePack.name}
                  </h3>

                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {inheritedItems.length}{' '}
                    prestations héritées
                  </p>

                </div>

              </div>

              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 transition-transform group-open:rotate-180" />

            </div>

          </summary>

          <div className="border-t border-amber-100 bg-amber-50/30 p-5">

            <div className="flex items-start justify-between gap-4 mb-4">

              <div>

                <p className="text-xs font-bold text-slate-800">
                  {referencePack.name}
                </p>

                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {pack.referenceText ||
                    `Ce pack reprend les prestations du ${referencePack.name}.`}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/pricing/${referencePack.id}`
                  )
                }
                className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Voir le pack
                <ArrowRight className="w-3 h-3" />
              </button>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

              {inheritedItems.map(
                (item, index) => (
                  <div
                    key={`inherited-${index}`}
                    className="flex items-start gap-2 p-2 rounded-lg bg-white border border-amber-100"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />

                    <span className="text-[11px] text-slate-600 leading-relaxed">
                      {item}
                    </span>
                  </div>
                )
              )}

            </div>

          </div>

        </details>
      )}

      {/* ========================================================
          PRESTATIONS PROPRES AU PACK
      ======================================================== */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">

        <div className="flex items-center justify-between gap-3 mb-5">

          <div>

            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">

              <Layers className="w-4 h-4 text-slate-500" />

              <span>
                Prestations propres au pack
              </span>

              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                {ownIncludedItems.length}
              </span>

            </h2>

            {referencePack && (
              <p className="text-[10px] text-slate-400 mt-1">
                Les prestations du pack de référence
                sont disponibles dans la section
                déroulante ci-dessus.
              </p>
            )}

          </div>

        </div>

        {ownIncludedItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">

            {ownIncludedItems.map(
              (item, index) => (
                <div
                  key={`own-${index}`}
                  className="flex items-start gap-2 text-xs text-slate-600"
                >
                  <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />

                  <span className="leading-relaxed">
                    {item}
                  </span>
                </div>
              )
            )}

          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            Aucune prestation propre à ce pack.
          </div>
        )}

      </div>

      {/* ========================================================
          GRILLE TARIFAIRE
      ======================================================== */}

      {grid ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3">

            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">

              <Calculator className="w-4 h-4 text-slate-500" />

              Grille tarifaire détaillée

            </h2>

            <span className="text-[11px] text-slate-500">
              Colonne sélectionnée :{' '}
              <span className="font-bold text-amber-700">
                {guestCount} invités
              </span>
            </span>

          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">

            {grid.headers.map(
              (header, index) => {
                const guests =
                  getGuestCountFromHeader(
                    header
                  );

                const isActive =
                  index === columnIndex;

                return (
                  <button
                    key={`${header}-${index}`}
                    type="button"
                    onClick={() =>
                      setGuestCount(guests)
                    }
                    className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {header}
                  </button>
                );
              }
            )}

          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">

            <table className="w-full text-[11px] border-collapse">

              <thead>

                <tr className="bg-slate-50">

                  <th className="text-left font-bold text-slate-500 px-3 py-2.5 border-b border-slate-200 whitespace-nowrap">
                    Type de service
                  </th>

                  {grid.headers.map(
                    (header, index) => (
                      <th
                        key={`${header}-${index}`}
                        className={`text-right font-bold px-3 py-2.5 border-b border-slate-200 whitespace-nowrap ${
                          index === columnIndex
                            ? 'bg-amber-100 text-amber-900'
                            : 'text-slate-500'
                        }`}
                      >
                        {header}
                      </th>
                    )
                  )}

                </tr>

              </thead>

              <tbody>

                {grid.rows.map(
                  (row) => (
                    <tr
                      key={row.label}
                      className="border-b border-slate-100 last:border-0"
                    >

                      <td className="px-3 py-2.5 font-semibold text-slate-700 whitespace-nowrap">
                        {row.label}
                      </td>

                      {grid.headers.map(
                        (header, index) => (
                          <td
                            key={`${row.label}-${header}`}
                            className={`px-3 py-2.5 text-right font-mono whitespace-nowrap ${
                              index === columnIndex
                                ? 'bg-amber-50 font-bold text-slate-900'
                                : 'text-slate-600'
                            }`}
                          >
                            {row.values[
                              index
                            ] !== undefined
                              ? formatAriary(
                                  row.values[
                                    index
                                  ]
                                )
                              : '—'}
                          </td>
                        )
                      )}

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

          <p className="text-[10px] text-slate-400 mt-3 italic leading-relaxed">
            Tarifs indicatifs en Ariary (Ar).
            Le mode « Servis » sert de référence
            pour l'estimation.
          </p>

        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex items-start gap-3">

          <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />

          <div>

            <p className="text-sm font-bold text-slate-800">
              Grille tarifaire sur mesure
            </p>

            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Ce pack n'applique pas de grille
              standard.
            </p>

          </div>

        </div>
      )}

      {/* ========================================================
          ESTIMATION / ACTIONS
      ======================================================== */}

      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-lg">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-center">

          <div>

            <div className="flex items-center gap-2 text-amber-400 text-[10px] font-bold uppercase tracking-wider">

              <Calculator className="w-3.5 h-3.5" />

              <span>
                {grid
                  ? `Estimation pour ${guestCount} invités`
                  : 'Chiffrage sur mesure'}
              </span>

            </div>

            {grid ? (
              <>
                <p className="text-3xl font-black text-amber-400 tracking-tight mt-2">
                  {formatAriary(
                    totalForSelected
                  )}
                </p>

                <p className="text-[11px] text-slate-400 mt-1">
                  Acompte de réservation (50%) :{' '}
                  {formatAriary(
                    Math.round(
                      totalForSelected * 0.5
                    )
                  )}
                </p>

                {supplement > 0 && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    dont supplément{' '}
                    {formatAriary(
                      supplement
                    )}
                  </p>
                )}
              </>
            ) : (
              <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-md">
                Ce pack s'adapte au budget et
                aux besoins du client.
              </p>
            )}

          </div>

          <div className="flex flex-col sm:flex-row lg:justify-end gap-2">

            <button
              type="button"
              onClick={
                handleOpenInSimulator
              }
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5 text-amber-400" />

              <span>
                Ouvrir dans le simulateur
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/pricing/${pack.id}/edit`
                )
              }
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />

              <span>
                Modifier
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/pricing/new')
              }
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />

              <span>
                Ajouter un service
              </span>
            </button>

            <button
              type="button"
              onClick={
                handleGenerateQuote
              }
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />

              <span>
                Convertir en Devis
              </span>
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};
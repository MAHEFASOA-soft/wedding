// src/components/pricing1/PricingPackEditView.tsx

import React, {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Sparkles,
  Check,
  X,
  Table2,
  Settings2,
  Package,
  Layers,
  ChevronDown,
} from 'lucide-react';

import {
  formatAriary,
} from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import type { PackPricing } from './pricingPackTypes';

import {
  getReferencePack,
  canReferencePack,
} from './pricingPackHelpers';

const clonePack = (
  source: PackPricing
): PackPricing => ({
  ...source,

  includedItems: [
    ...source.includedItems,
  ],

  pricingGrid:
    source.pricingGrid
      ? {
          headers: [
            ...source.pricingGrid.headers,
          ],

          rows:
            source.pricingGrid.rows.map(
              (row) => ({
                ...row,
                values: [
                  ...row.values,
                ],
              })
            ),
        }
      : undefined,
});

export const PricingPackEditView: React.FC =
  () => {
    const {
      packId,
    } = useParams<{
      packId: string;
    }>();

    const navigate = useNavigate();
    const { pricingPacks, pricingPacksLoading, pricingPacksLoadError, updatePricingPack } = useApp();

    const [
      pack,
      setPack,
    ] = useState<PackPricing | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    useEffect(() => {
      const found = pricingPacks.find((item) => item.id === packId) ?? null;
      setPack(found ? clonePack(found) : null);
    }, [packId, pricingPacks]);

    const [
      activeSection,
      setActiveSection,
    ] = useState<
      'general' |
      'prestations' |
      'grille'
    >('general');

    if (!pack && pricingPacksLoading) {
      return <div className="py-12 text-center text-xs text-slate-500">Chargement du pack…</div>;
    }

    if (!pack) {
      return (
        <div className="space-y-6 pb-12">

          <button
            type="button"
            onClick={() =>
              navigate(
                ''
              )
            }
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />

            Retour aux services
          </button>

          <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center">

            <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />

            <h2 className="text-lg font-black text-slate-900 mt-4">
              {pricingPacksLoadError ? 'Catalogue indisponible' : 'Pack introuvable'}
            </h2>

            <p className="text-xs text-slate-500 mt-2">
              {pricingPacksLoadError || <>Aucun pack ne correspond à l'identifiant <span className="font-mono font-bold">{packId}</span>.</>}
            </p>

          </div>

        </div>
      );
    }

    const updateField = <
      K extends keyof PackPricing
    >(
      field: K,
      value: PackPricing[K]
    ) => {
      setPack(
        (current) =>
          current
            ? {
                ...current,
                [field]: value,
              }
            : current
      );
    };

    /* ============================================================
       REFERENCE
    ============================================================ */

    const handleReferenceChange = (
      value: string
    ) => {
      if (!value) {
        updateField(
          'referencePackId',
          undefined
        );

        return;
      }

      const allowed =
        canReferencePack(
          pack.id,
          value,
          pricingPacks
        );

      if (!allowed) {
        alert(
          'Cette référence créerait une référence circulaire. Choisissez un autre pack.'
        );

        return;
      }

      updateField(
        'referencePackId',
        value
      );
    };

    const referencePack =
      getReferencePack(
        pack,
        pricingPacks
      );

    /* ============================================================
       PRESTATIONS
    ============================================================ */

    const updateIncludedItem = (
      index: number,
      value: string
    ) => {
      setPack(
        (current) => {
          if (!current) {
            return current;
          }

          const items = [
            ...current.includedItems,
          ];

          items[index] = value;

          return {
            ...current,
            includedItems: items,
          };
        }
      );
    };

    const addIncludedItem = () => {
      setPack(
        (current) =>
          current
            ? {
                ...current,
                includedItems: [
                  ...current.includedItems,
                  'Nouvelle prestation',
                ],
              }
            : current
      );
    };

    const removeIncludedItem = (
      index: number
    ) => {
      setPack(
        (current) =>
          current
            ? {
                ...current,
                includedItems:
                  current.includedItems.filter(
                    (_, i) =>
                      i !== index
                  ),
              }
            : current
      );
    };

    /* ============================================================
       GRILLE
    ============================================================ */

    const updateGrid = (
      updater: (
        grid: NonNullable<
          PackPricing['pricingGrid']
        >
      ) => NonNullable<
        PackPricing['pricingGrid']
      >
    ) => {
      setPack(
        (current) => {
          if (
            !current?.pricingGrid
          ) {
            return current;
          }

          return {
            ...current,
            pricingGrid:
              updater(
                current.pricingGrid
              ),
          };
        }
      );
    };

    const addGridColumn = () => {
      updateGrid((grid) => ({
        ...grid,

        headers: [
          ...grid.headers,
          `${
            (grid.headers.length + 1) *
            50
          } pers.`,
        ],

        rows: grid.rows.map(
          (row) => ({
            ...row,
            values: [
              ...row.values,
              0,
            ],
          })
        ),
      }));
    };

    const removeGridColumn = (
      index: number
    ) => {
      updateGrid((grid) => {
        if (
          grid.headers.length <= 1
        ) {
          alert(
            'La grille doit conserver au moins une capacité.'
          );

          return grid;
        }

        return {
          ...grid,

          headers:
            grid.headers.filter(
              (_, i) =>
                i !== index
            ),

          rows:
            grid.rows.map(
              (row) => ({
                ...row,
                values:
                  row.values.filter(
                    (_, i) =>
                      i !== index
                  ),
              })
            ),
        };
      });
    };

    const updateHeader = (
      index: number,
      value: string
    ) => {
      updateGrid((grid) => ({
        ...grid,

        headers:
          grid.headers.map(
            (header, i) =>
              i === index
                ? value
                : header
          ),
      }));
    };

    const updateRowLabel = (
      rowIndex: number,
      value: string
    ) => {
      updateGrid((grid) => ({
        ...grid,

        rows:
          grid.rows.map(
            (row, index) =>
              index === rowIndex
                ? {
                    ...row,
                    label: value,
                  }
                : row
          ),
      }));
    };

    const updatePrice = (
      rowIndex: number,
      columnIndex: number,
      value: number
    ) => {
      updateGrid((grid) => ({
        ...grid,

        rows:
          grid.rows.map(
            (row, index) => {
              if (
                index !==
                rowIndex
              ) {
                return row;
              }

              const values = [
                ...row.values,
              ];

              values[
                columnIndex
              ] = value;

              return {
                ...row,
                values,
              };
            }
          ),
      }));
    };

    const addPricingRow = () => {
      updateGrid((grid) => ({
        ...grid,

        rows: [
          ...grid.rows,
          {
            label:
              'Nouveau service',
            values:
              grid.headers.map(
                () => 0
              ),
          },
        ],
      }));
    };

    const removePricingRow = (
      rowIndex: number
    ) => {
      updateGrid((grid) => {
        if (
          grid.rows.length <= 1
        ) {
          alert(
            'La grille doit conserver au moins une ligne.'
          );

          return grid;
        }

        return {
          ...grid,

          rows:
            grid.rows.filter(
              (_, index) =>
                index !== rowIndex
            ),
        };
      });
    };

    const createGrid = () => {
      setPack(
        (current) =>
          current
            ? {
                ...current,

                pricingGrid: {
                  headers: [
                    '100 pers.',
                    '150 pers.',
                    '200 pers.',
                    '250 pers.',
                  ],

                  rows: [
                    {
                      label:
                        'Servis',
                      values: [
                        0,
                        0,
                        0,
                        0,
                      ],
                    },
                  ],
                },
              }
            : current
      );
    };

    const removeGrid = () => {
      setPack(
        (current) =>
          current
            ? {
                ...current,
                pricingGrid:
                  undefined,
              }
            : current
      );
    };

    /* ============================================================
       SAUVEGARDE
    ============================================================ */

    const handleSave = async () => {
      if (!pack.name.trim()) {
        alert(
          'Veuillez saisir le nom du service.'
        );

        return;
      }

      setSaveError('');
      setIsSaving(true);
      try {
        const saved = await updatePricingPack(pack);
        if (!saved) {
          setSaveError('Les modifications n’ont pas pu être enregistrées. Vérifiez le serveur puis réessayez.');
          return;
        }
        navigate(`/pricing/${pack.id}`);
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <div className="space-y-6 pb-12">

        {/* HEADER ACTIONS */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <button
            type="button"
            onClick={() =>
              navigate(
                `/pricing/${pack.id}`
              )
            }
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl transition-colors cursor-pointer w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />

            Retour au détail
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-md cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />

            {isSaving ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>

        </div>

        {/* HEADER */}

        <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-7 shadow-lg">

          {saveError && <p role="alert" className="mb-4 rounded-lg border border-rose-400/40 bg-rose-500/10 p-3 text-xs text-rose-200">{saveError}</p>}

          <div className="flex items-center gap-2 text-amber-300 text-[10px] font-bold uppercase tracking-wider">

            <Settings2 className="w-3.5 h-3.5" />

            Modification du service
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-2">
            {pack.name}
          </h1>

          <p className="text-xs text-slate-400 mt-1">
            Modifiez les informations, les
            prestations, la référence et la
            grille tarifaire.
          </p>

        </div>

        {/* NAVIGATION */}

        <div className="bg-white border border-slate-200 rounded-2xl p-2 flex flex-wrap gap-2">

          {[
            {
              id: 'general',
              label:
                'Informations générales',
              icon: Package,
            },
            {
              id: 'prestations',
              label:
                'Prestations incluses',
              icon: Check,
            },
            {
              id: 'grille',
              label:
                'Grille tarifaire',
              icon: Table2,
            },
          ].map(
            ({
              id,
              label,
              icon: Icon,
            }) => (
              <button
                key={id}
                type="button"
                onClick={() =>
                  setActiveSection(
                    id as
                      | 'general'
                      | 'prestations'
                      | 'grille'
                  )
                }
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-colors ${
                  activeSection ===
                  id
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />

                {label}
              </button>
            )
          )}

        </div>

        {/* ========================================================
            INFORMATIONS GENERALES
        ======================================================== */}

        {activeSection ===
          'general' && (
          <div className="space-y-6">

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Nom du service
                  </label>

                  <input
                    value={pack.name}
                    onChange={(e) =>
                      updateField(
                        'name',
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Catégorie
                  </label>

                  <input
                    value={
                      pack.category
                    }
                    onChange={(e) =>
                      updateField(
                        'category',
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Tarif de départ
                  </label>

                  <input
                    type="number"
                    min={0}
                    value={
                      pack.basePrice
                    }
                    onChange={(e) =>
                      updateField(
                        'basePrice',
                        Number(
                          e.target.value
                        ) || 0
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-mono outline-none focus:border-amber-400 focus:bg-white"
                  />

                  <p className="text-[10px] text-slate-400 mt-1">
                    Aperçu :{' '}
                    {formatAriary(
                      pack.basePrice
                    )}
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Description
                  </label>

                  <textarea
                    value={
                      pack.description
                    }
                    onChange={(e) =>
                      updateField(
                        'description',
                        e.target.value
                      )
                    }
                    rows={5}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:bg-white resize-none"
                  />
                </div>

              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">

                <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">

                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Service populaire
                    </p>

                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Afficher ce service comme
                      pack populaire.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        'popular',
                        !pack.popular
                      )
                    }
                    className={`relative w-11 h-6 rounded-full ${
                      pack.popular
                        ? 'bg-amber-500'
                        : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        pack.popular
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>

                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Badge
                  </label>

                  <input
                    value={
                      pack.badge ?? ''
                    }
                    onChange={(e) =>
                      updateField(
                        'badge',
                        e.target.value
                      )
                    }
                    placeholder="Ex : Pack Le Plus Prisé"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Informations supplémentaires
                  </label>

                  <textarea
                    value={
                      pack.extraInfo ??
                      ''
                    }
                    onChange={(e) =>
                      updateField(
                        'extraInfo',
                        e.target.value
                      )
                    }
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:bg-white resize-none"
                  />
                </div>

              </div>

            </div>

            {/* REFERENCE */}

            <div className="bg-white rounded-2xl border border-amber-200 p-5 sm:p-6">

              <div className="flex items-start gap-3 mb-5">

                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4 text-amber-700" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Pack de référence
                  </h2>

                  <p className="text-[11px] text-slate-500 mt-1">
                    Le pack sélectionné ici sera
                    automatiquement inclus dans ce
                    service.
                  </p>
                </div>

              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                <div>

                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Référence
                  </label>

                  <select
                    value={
                      pack.referencePackId ??
                      ''
                    }
                    onChange={(e) =>
                      handleReferenceChange(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:bg-white"
                  >

                    <option value="">
                      Aucun pack de référence
                    </option>

                    {pricingPacks
                      .filter(
                        (item) =>
                          item.id !==
                          pack.id
                      )
                      .map(
                        (item) => (
                          <option
                            key={item.id}
                            value={
                              item.id
                            }
                          >
                            {item.name}
                          </option>
                        )
                      )}

                  </select>

                </div>

                <div>

                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Description de l'héritage
                  </label>

                  <textarea
                    value={
                      pack.referenceText ??
                      ''
                    }
                    onChange={(e) =>
                      updateField(
                        'referenceText',
                        e.target.value
                      )
                    }
                    rows={3}
                    placeholder="Ex : Ce pack reprend toutes les prestations du Pack Mariage de Rêve avec des prestations supplémentaires."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:bg-white resize-none"
                  />

                </div>

              </div>

              {referencePack && (
                <details className="group mt-5 border border-slate-200 rounded-xl overflow-hidden">

                  <summary className="list-none cursor-pointer">

                    <div className="flex items-center justify-between gap-3 p-3 bg-slate-50">

                      <div>

                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Pack sélectionné
                        </p>

                        <p className="text-xs font-bold text-slate-800 mt-0.5">
                          {referencePack.name}
                        </p>

                      </div>

                      <ChevronDown className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180" />

                    </div>

                  </summary>

                  <div className="p-4">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

                      {referencePack.includedItems.map(
                        (
                          item,
                          index
                        ) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 text-[11px] text-slate-600"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />

                            <span>
                              {item}
                            </span>
                          </div>
                        )
                      )}

                    </div>

                  </div>

                </details>
              )}

            </div>

          </div>
        )}

        {/* ========================================================
            PRESTATIONS
        ======================================================== */}

        {activeSection ===
          'prestations' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Prestations propres au pack
                </h2>

                <p className="text-[11px] text-slate-500 mt-1">
                  Ces prestations appartiennent
                  directement à ce pack.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  addIncludedItem
                }
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-bold bg-slate-900 text-white rounded-xl"
              >
                <Plus className="w-3.5 h-3.5" />

                Ajouter une prestation
              </button>

            </div>

            <div className="space-y-2">

              {pack.includedItems.map(
                (item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50"
                  >

                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>

                    <input
                      value={item}
                      onChange={(e) =>
                        updateIncludedItem(
                          index,
                          e.target.value
                        )
                      }
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeIncludedItem(
                          index
                        )
                      }
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                  </div>
                )
              )}

            </div>

          </div>
        )}

        {/* ========================================================
            GRILLE
        ======================================================== */}

        {activeSection ===
          'grille' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5">

              <div>

                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">

                  <Table2 className="w-4 h-4 text-slate-500" />

                  Grille tarifaire
                </h2>

                <p className="text-[11px] text-slate-500 mt-1">
                  Modifiez les capacités et les
                  tarifs.
                </p>

              </div>

              {pack.pricingGrid && (
                <div className="flex flex-wrap gap-2">

                  <button
                    type="button"
                    onClick={
                      addGridColumn
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold bg-slate-900 text-white rounded-xl"
                  >
                    <Plus className="w-3.5 h-3.5" />

                    Ajouter une capacité
                  </button>

                  <button
                    type="button"
                    onClick={
                      addPricingRow
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold bg-amber-500 text-slate-950 rounded-xl"
                  >
                    <Plus className="w-3.5 h-3.5" />

                    Ajouter un mode
                  </button>

                  <button
                    type="button"
                    onClick={
                      removeGrid
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold bg-red-50 text-red-600 border border-red-200 rounded-xl"
                  >
                    <Trash2 className="w-3.5 h-3.5" />

                    Supprimer la grille
                  </button>

                </div>
              )}

            </div>

            {!pack.pricingGrid ? (
              <div className="border border-dashed border-slate-300 rounded-2xl p-10 text-center">

                <Table2 className="w-8 h-8 text-slate-300 mx-auto" />

                <h3 className="text-sm font-bold text-slate-800 mt-3">
                  Aucune grille tarifaire
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Ce service fonctionne avec un
                  tarif sur mesure.
                </p>

                <button
                  type="button"
                  onClick={
                    createGrid
                  }
                  className="mt-5 inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-black bg-amber-500 text-slate-950 rounded-xl"
                >
                  <Plus className="w-3.5 h-3.5" />

                  Créer une grille
                </button>

              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">

                <table className="w-full border-collapse text-[11px]">

                  <thead>

                    <tr className="bg-slate-50">

                      <th className="sticky left-0 z-10 bg-slate-50 text-left font-bold text-slate-500 px-3 py-3 border-b border-slate-200 min-w-[180px]">
                        Mode de service
                      </th>

                      {pack.pricingGrid.headers.map(
                        (
                          header,
                          index
                        ) => (
                          <th
                            key={index}
                            className="px-2 py-2 border-b border-slate-200 min-w-[145px]"
                          >

                            <div className="flex items-center gap-1">

                              <input
                                value={
                                  header
                                }
                                onChange={(
                                  e
                                ) =>
                                  updateHeader(
                                    index,
                                    e.target.value
                                  )
                                }
                                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-bold text-center outline-none focus:border-amber-400"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  removeGridColumn(
                                    index
                                  )
                                }
                                className="p-1 text-red-400 hover:bg-red-50 rounded"
                              >
                                <X className="w-3 h-3" />
                              </button>

                            </div>

                          </th>
                        )
                      )}

                    </tr>

                  </thead>

                  <tbody>

                    {pack.pricingGrid.rows.map(
                      (
                        row,
                        rowIndex
                      ) => (
                        <tr
                          key={rowIndex}
                          className="border-b border-slate-100 last:border-0"
                        >

                          <td className="sticky left-0 bg-white px-3 py-2">

                            <div className="flex items-center gap-1">

                              <input
                                value={
                                  row.label
                                }
                                onChange={(
                                  e
                                ) =>
                                  updateRowLabel(
                                    rowIndex,
                                    e.target.value
                                  )
                                }
                                className="flex-1 min-w-[120px] rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-bold outline-none focus:border-amber-400"
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  removePricingRow(
                                    rowIndex
                                  )
                                }
                                className="p-1.5 text-red-400 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>

                            </div>

                          </td>

                          {pack.pricingGrid.headers.map(
                            (
                              _,
                              columnIndex
                            ) => (
                              <td
                                key={
                                  columnIndex
                                }
                                className="px-2 py-2"
                              >

                                <input
                                  type="number"
                                  min={0}
                                  value={
                                    row.values[
                                      columnIndex
                                    ] ??
                                    0
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    updatePrice(
                                      rowIndex,
                                      columnIndex,
                                      Number(
                                        e.target
                                          .value
                                      ) ||
                                        0
                                    )
                                  }
                                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-mono text-right outline-none focus:border-amber-400"
                                />

                                <p className="text-[9px] text-slate-400 text-right mt-1">
                                  {formatAriary(
                                    row.values[
                                      columnIndex
                                    ] ??
                                      0
                                  )}
                                </p>

                              </td>
                            )
                          )}

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </div>
        )}

      </div>
    );
  };
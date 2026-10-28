// src/components/pricing1/PricingPackCreateView.tsx

import React, {
  useState,
} from 'react';

import {
  useNavigate,
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
  Package,
  Settings2,
  Layers,
} from 'lucide-react';

import {
  formatAriary,
} from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

import {
  canReferencePack,
} from './pricingPackHelpers';

type PricingRow = {
  label: string;
  values: number[];
};

export const PricingPackCreateView: React.FC =
  () => {
    const navigate = useNavigate();
    const { pricingPacks, pricingPacksLoading, addPricingPack } = useApp();

    /* ============================================================
       INFORMATIONS
    ============================================================ */

    const [name, setName] =
      useState('');

    const [category, setCategory] =
      useState('Mariage');

    const [description, setDescription] =
      useState('');

    const [basePrice, setBasePrice] =
      useState(0);

    const [popular, setPopular] =
      useState(false);

    const [badge, setBadge] =
      useState('');

    const [extraInfo, setExtraInfo] =
      useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    /* ============================================================
       REFERENCE
    ============================================================ */

    const [
      referencePackId,
      setReferencePackId,
    ] = useState<
      string | undefined
    >(undefined);

    const [
      referenceText,
      setReferenceText,
    ] = useState('');

    /* ============================================================
       PRESTATIONS PROPRES
    ============================================================ */

    const [
      includedItems,
      setIncludedItems,
    ] = useState<string[]>([
      'Lieu de réception',
      'Décoration de la salle',
      'Menu complet',
      'Boisson hygiénique et champagne',
      'Gâteau',
    ]);

    /* ============================================================
       GRILLE
    ============================================================ */

    const [
      headers,
      setHeaders,
    ] = useState<string[]>([
      '100 pers.',
      '150 pers.',
      '200 pers.',
      '250 pers.',
      '300 pers.',
      '350 pers.',
      '500 pers.',
    ]);

    const [
      rows,
      setRows,
    ] = useState<PricingRow[]>([
      {
        label: 'Servis',
        values: [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
        ],
      },
      {
        label: 'Semi-buffet',
        values: [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
        ],
      },
      {
        label: 'Buffet',
        values: [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
        ],
      },
    ]);

    /* ============================================================
       REFERENCE
    ============================================================ */

    const handleReferenceChange = (
      value: string
    ) => {
      if (!value) {
        setReferencePackId(
          undefined
        );
        return;
      }

      /*
       * Le nouvel ID n'existe pas encore dans
       * pricingPacks. On utilise un ID temporaire
       * uniquement pour vérifier que le pack
       * sélectionné n'est pas lui-même.
       */
      const temporaryId =
        '__new_pack__';

      if (
        !canReferencePack(
          temporaryId,
          value,
          pricingPacks
        )
      ) {
        alert(
          'Cette référence n’est pas valide.'
        );

        return;
      }

      setReferencePackId(value);
    };

    const referencePack =
      pricingPacks.find(
        (pack) =>
          pack.id ===
          referencePackId
      );

    /* ============================================================
       PRESTATIONS
    ============================================================ */

    const addIncludedItem = () => {
      setIncludedItems(
        (current) => [
          ...current,
          'Nouvelle prestation',
        ]
      );
    };

    const updateIncludedItem = (
      index: number,
      value: string
    ) => {
      setIncludedItems(
        (current) =>
          current.map(
            (item, i) =>
              i === index
                ? value
                : item
          )
      );
    };

    const removeIncludedItem = (
      index: number
    ) => {
      setIncludedItems(
        (current) =>
          current.filter(
            (_, i) =>
              i !== index
          )
      );
    };

    /* ============================================================
       GRILLE
    ============================================================ */

    const addColumn = () => {
      setHeaders(
        (current) => [
          ...current,
          `${
            (current.length + 1) *
            50
          } pers.`,
        ]
      );

      setRows(
        (current) =>
          current.map(
            (row) => ({
              ...row,
              values: [
                ...row.values,
                0,
              ],
            })
          )
      );
    };

    const removeColumn = (
      index: number
    ) => {
      if (
        headers.length <= 1
      ) {
        alert(
          'La grille doit conserver au moins une capacité.'
        );

        return;
      }

      setHeaders(
        (current) =>
          current.filter(
            (_, i) =>
              i !== index
          )
      );

      setRows(
        (current) =>
          current.map(
            (row) => ({
              ...row,
              values:
                row.values.filter(
                  (_, i) =>
                    i !== index
                ),
            })
          )
      );
    };

    const updateHeader = (
      index: number,
      value: string
    ) => {
      setHeaders(
        (current) =>
          current.map(
            (header, i) =>
              i === index
                ? value
                : header
          )
      );
    };

    const addPricingRow = () => {
      setRows(
        (current) => [
          ...current,
          {
            label:
              'Nouveau service',
            values:
              headers.map(
                () => 0
              ),
          },
        ]
      );
    };

    const removePricingRow = (
      index: number
    ) => {
      if (
        rows.length <= 1
      ) {
        alert(
          'La grille doit conserver au moins un mode de service.'
        );

        return;
      }

      setRows(
        (current) =>
          current.filter(
            (_, i) =>
              i !== index
          )
      );
    };

    const updateRowLabel = (
      index: number,
      value: string
    ) => {
      setRows(
        (current) =>
          current.map(
            (row, i) =>
              i === index
                ? {
                    ...row,
                    label: value,
                  }
                : row
          )
      );
    };

    const updatePrice = (
      rowIndex: number,
      columnIndex: number,
      value: number
    ) => {
      setRows(
        (current) =>
          current.map(
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
          )
      );
    };

    /* ============================================================
       SAUVEGARDE
    ============================================================ */

    const handleSave = async () => {
      if (!name.trim()) {
        alert(
          'Veuillez saisir le nom du service.'
        );

        return;
      }

      setSaveError('');
      setIsSaving(true);
      try {
        const saved = await addPricingPack({
        name: name.trim(),

        category:
          category.trim() ||
          'Autre',

        description:
          description.trim(),

        basePrice,

        popular,

        badge:
          badge.trim() ||
          undefined,

        extraInfo:
          extraInfo.trim() ||
          undefined,

        referencePackId: referencePackId || null,

        referenceText:
          referenceText.trim() ||
          undefined,

        /*
         * IMPORTANT :
         * On ne copie pas les prestations
         * du pack de référence.
         *
         * Elles seront héritées automatiquement
         * dans getAllIncludedItems().
         */
        includedItems:
          includedItems.filter(
            (item) =>
              item.trim() !== ''
          ),

        pricingGrid: {
          headers,
          rows,
        },
        });

        if (!saved) {
          setSaveError('Le pack n’a pas pu être enregistré. Vérifiez le serveur et réessayez.');
          return;
        }

        navigate('/pricing');
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <div className="space-y-6 pb-12">

        {/* HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <button
            type="button"
            onClick={() =>
              navigate(
                '/pricing'
              )
            }
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl cursor-pointer w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />

            Retour aux services
          </button>

          <button
            type="button"
            onClick={
              handleSave
            }
            disabled={isSaving || pricingPacksLoading}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-md cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />

            {isSaving ? 'Enregistrement…' : 'Enregistrer le pack'}
          </button>

        </div>

        {/* TITRE */}

        <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-7 shadow-lg">

          <div className="flex items-center gap-2 text-amber-300 text-[10px] font-bold uppercase tracking-wider">

            <Settings2 className="w-3.5 h-3.5" />

            Nouveau service
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-2">
            Créer un nouveau pack
          </h1>

          <p className="text-xs text-slate-400 mt-1.5 max-w-2xl">
            Configurez les informations,
            les prestations, le pack de
            référence et les tarifs.
          </p>

        </div>

        {/* INFORMATIONS GENERALES */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">

          <div className="flex items-center gap-2 mb-5">

            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <Package className="w-4 h-4 text-slate-600" />
            </div>

            <div>

              <h2 className="text-sm font-bold text-slate-900">
                Informations générales
              </h2>

              <p className="text-[11px] text-slate-500">
                Informations principales du
                service.
              </p>

            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            <div className="lg:col-span-2">

              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Nom du service *
              </label>

              <input
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                placeholder="Ex : Pack Mariage en Or"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none focus:border-amber-400 focus:bg-white"
              />

            </div>

            <div>

              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Catégorie
              </label>

              <input
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
                placeholder="Mariage"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none focus:border-amber-400 focus:bg-white"
              />

            </div>

            <div>

              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Tarif de départ
              </label>

              <div className="relative">

                <input
                  type="number"
                  min={0}
                  value={
                    basePrice
                  }
                  onChange={(e) =>
                    setBasePrice(
                      Number(
                        e.target
                          .value
                      ) || 0
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 pr-12 text-sm font-mono outline-none focus:border-amber-400 focus:bg-white"
                />

                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                  Ar
                </span>

              </div>

              <p className="text-[10px] text-slate-400 mt-1.5">
                Aperçu :{' '}
                {formatAriary(
                  basePrice
                )}
              </p>

            </div>

            <div className="lg:col-span-2">

              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Description
              </label>

              <textarea
                value={
                  description
                }
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                rows={4}
                placeholder="Décrivez le contenu général du pack..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none focus:border-amber-400 focus:bg-white resize-none"
              />

            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">

              <div>

                <p className="text-xs font-bold text-slate-800">
                  Service populaire
                </p>

                <p className="text-[10px] text-slate-500 mt-0.5">
                  Afficher ce pack comme
                  recommandé.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setPopular(
                    !popular
                  )
                }
                className={`relative w-11 h-6 rounded-full ${
                  popular
                    ? 'bg-amber-500'
                    : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    popular
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
                value={badge}
                onChange={(e) =>
                  setBadge(
                    e.target.value
                  )
                }
                placeholder="Ex : Pack Le Plus Prisé"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:bg-white"
              />

            </div>

            <div className="lg:col-span-2">

              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Informations supplémentaires
              </label>

              <textarea
                value={
                  extraInfo
                }
                onChange={(e) =>
                  setExtraInfo(
                    e.target.value
                  )
                }
                rows={3}
                placeholder="Ex : Ce pack comprend des prestations supplémentaires..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-amber-400 focus:bg-white resize-none"
              />

            </div>

          </div>

        </div>

        {/* ========================================================
            PACK DE REFERENCE
        ======================================================== */}

        <div className="bg-white rounded-2xl border border-amber-200 shadow-xs p-5 sm:p-6">

          <div className="flex items-start gap-3 mb-5">

            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <Layers className="w-4 h-4 text-amber-700" />
            </div>

            <div>

              <h2 className="text-sm font-bold text-slate-900">
                Pack de référence
              </h2>

              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Vous pouvez faire hériter ce nouveau
                pack des prestations d'un autre pack.
                Les prestations ne seront pas copiées :
                elles resteront liées au pack de référence.
              </p>

            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            <div>

              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Pack de référence
              </label>

              <select
                value={
                  referencePackId ??
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

                {pricingPacks.map(
                  (pack) => (
                    <option
                      key={pack.id}
                      value={
                        pack.id
                      }
                    >
                      {pack.name}
                    </option>
                  )
                )}

              </select>

            </div>

            <div>

              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Texte explicatif
              </label>

              <textarea
                value={
                  referenceText
                }
                onChange={(e) =>
                  setReferenceText(
                    e.target.value
                  )
                }
                rows={3}
                placeholder="Ex : Ce pack comprend toutes les prestations du Pack Mariage de Rêve avec des prestations supplémentaires."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-amber-400 focus:bg-white resize-none"
              />

            </div>

          </div>

          {pricingPacksLoading && <p className="mt-2 text-xs text-slate-500">Chargement des packs…</p>}
          {referencePack && (
            <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200">

              <div className="flex items-center justify-between gap-3">

                <div>

                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                    Héritage activé
                  </p>

                  <p className="text-sm font-black text-slate-900 mt-0.5">
                    {referencePack.name}
                  </p>

                  <p className="text-[11px] text-slate-500 mt-1">
                    {referencePack.includedItems.length}{' '}
                    prestations seront héritées
                    automatiquement.
                  </p>

                </div>

                <Check className="w-5 h-5 text-emerald-600" />

              </div>

            </div>
          )}

        </div>

        {/* ========================================================
            PRESTATIONS
        ======================================================== */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

            <div>

              <h2 className="text-sm font-bold text-slate-900">
                Prestations propres au pack
              </h2>

              <p className="text-[11px] text-slate-500 mt-1">
                Ajoutez uniquement les prestations
                supplémentaires de ce pack.
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

            {includedItems.map(
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
                    className="flex-1 min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-amber-400"
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

        {/* ========================================================
            GRILLE
        ======================================================== */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5">

            <div>

              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">

                <Table2 className="w-4 h-4 text-slate-500" />

                Grille tarifaire
              </h2>

              <p className="text-[11px] text-slate-500 mt-1">
                Définissez les prix selon le nombre
                d'invités et le mode de service.
              </p>

            </div>

            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={
                  addColumn
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

            </div>

          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">

            <table className="w-full border-collapse text-[11px]">

              <thead>

                <tr className="bg-slate-50">

                  <th className="sticky left-0 z-10 bg-slate-50 text-left font-bold text-slate-500 px-3 py-3 border-b border-slate-200 min-w-[180px]">
                    Mode de service
                  </th>

                  {headers.map(
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
                              removeColumn(
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

                {rows.map(
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

                      {headers.map(
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
                                ] ?? 0
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
                                  ) || 0
                                )
                              }
                              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-mono text-right outline-none focus:border-amber-400"
                            />

                            <p className="text-[9px] text-slate-400 text-right mt-1">
                              {formatAriary(
                                row.values[
                                  columnIndex
                                ] ?? 0
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

          <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">

            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />

            <p className="text-[11px] text-amber-800 leading-relaxed">
              Les colonnes correspondent au
              nombre de personnes. Les lignes
              correspondent aux différents modes
              de prestation.
            </p>

          </div>

        </div>

        {/* RESUME */}

        <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-lg">

          {saveError && <p role="alert" className="mb-4 rounded-lg border border-rose-400/40 bg-rose-500/10 p-3 text-xs text-rose-200">{saveError}</p>}

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div>

              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Aperçu du nouveau service
              </p>

              <h2 className="text-lg font-black mt-1">
                {name ||
                  'Nouveau service'}
              </h2>

              <p className="text-[11px] text-slate-400 mt-1">
                {includedItems.length}{' '}
                prestations propres ·{' '}
                {headers.length}{' '}
                capacités ·{' '}
                {rows.length}{' '}
                modes de service
              </p>

              {referencePack && (
                <p className="text-[11px] text-amber-300 mt-1">
                  + héritage de{' '}
                  {referencePack.name}
                </p>
              )}

            </div>

            <div className="flex flex-col sm:flex-row gap-2">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    '/pricing'
                  )
                }
                className="px-4 py-2.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={
                  handleSave
                }
                disabled={isSaving || pricingPacksLoading}
                className="flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl"
              >
                <Save className="w-3.5 h-3.5" />

                {isSaving ? 'Enregistrement…' : 'Créer le pack'}
              </button>

            </div>

          </div>

        </div>

      </div>
    );
  };
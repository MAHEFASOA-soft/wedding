// src/components/pricing1/PricingCatalogView.tsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Check,
  Crown,
  Calculator,
  Plus,
  ArrowRight,
  Info,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatAriary } from '../../utils/formatters';
import { getPackBasePrice, getPackSupplement } from './pricingUtils';

export const PricingCatalogView1: React.FC = () => {
  const {
    pricingPacks,
    pricingPacksLoading,
    pricingPacksLoadError,
    services,
    servicesLoading,
    addQuote,
    setActiveTab,
    clients,
    addPricingPack,
    deletePricingPack,
  } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Simulator state
  const [guestCount, setGuestCount] = useState<number>(200);
  const [selectedPackId, setSelectedPackId] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('Servis');
  const [customBasePrice, setCustomBasePrice] = useState(0);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [serviceQuantities, setServiceQuantities] = useState<Record<string, number>>({});
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (!pricingPacks.length) {
      setSelectedPackId('');
      return;
    }
    if (!pricingPacks.some((pack) => pack.id === selectedPackId)) {
      setSelectedPackId(pricingPacks[0].id);
    }
  }, [pricingPacks, selectedPackId]);

  useEffect(() => {
    if (clients.some((client) => client.id === selectedClientId)) return;
    setSelectedClientId(clients[0]?.id || '');
  }, [clients, selectedClientId]);

  const selectedClient = clients.find((client) => client.id === selectedClientId);
  const optionalServices = services.filter((service) => service.unitPrice > 0);

  // Retour depuis la page de détail : ouverture directe du pack dans le simulateur
  useEffect(() => {
    const state = location.state as { simulatePackId?: string } | null;
    if (!state?.simulatePackId || !pricingPacks.some((pack) => pack.id === state.simulatePackId)) return;
    setSelectedPackId(state.simulatePackId);
    const timer = window.setTimeout(() => {
      document.getElementById('pricing-simulator')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [location.state, pricingPacks]);

  const currentPack = pricingPacks.find((pack) => pack.id === selectedPackId);

  useEffect(() => {
    if (!currentPack) return;
    const defaultMeal = currentPack.pricingGrid?.rows.find(
      (row) => ['servis', 'service'].includes(row.label.toLowerCase())
    )?.label || currentPack.pricingGrid?.rows[0]?.label || 'Servis';
    setSelectedMealType(defaultMeal);
    setCustomBasePrice(currentPack.basePrice);
  }, [selectedPackId]);

  const filteredPacks = pricingPacks.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  const gridBasePrice = currentPack ? getPackBasePrice(currentPack, guestCount, selectedMealType) : 0;
  const isCustomPrice = Boolean(currentPack && !currentPack.pricingGrid && !currentPack.referencePackId && currentPack.basePrice === 0);
  const basePrice = isCustomPrice ? customBasePrice : gridBasePrice;
  const supplement = currentPack ? getPackSupplement(currentPack) : 0;
  const chosenServices = optionalServices.filter((service) => (serviceQuantities[service.id] || 0) > 0);
  const serviceTotal = chosenServices.reduce(
    (total, service) => total + service.unitPrice * (serviceQuantities[service.id] || 0),
    0
  );
  const estimatedTotal = basePrice + supplement + serviceTotal;

  const handleDeletePack = async (packId: string, packName: string) => {
    if (!confirm(`Supprimer le pack « ${packName} » ?`)) return;
    setDeleteError('');
    const deleted = await deletePricingPack(packId);
    if (!deleted) {
      setDeleteError('Suppression refusée : le pack est peut-être utilisé par un événement ou référencé par un autre pack.');
    }
  };

  const handleGenerateQuoteFromSimulator = () => {
    if (!currentPack || !selectedClient) return;
    const items = [
      ...(basePrice > 0 ? [{ description: `${currentPack.name} - ${selectedMealType} (${guestCount} pers.)`, quantity: 1, unitPrice: basePrice, total: basePrice }] : []),
      ...(supplement > 0 ? [{ description: `Supplément ${currentPack.name}`, quantity: 1, unitPrice: supplement, total: supplement }] : []),
      ...chosenServices.map((service) => {
        const quantity = serviceQuantities[service.id] || 0;
        return {
          description: `${service.name} (${service.unit})`,
          quantity,
          unitPrice: service.unitPrice,
          total: service.unitPrice * quantity,
        };
      }),
    ];
    addQuote({
      clientName: selectedClient.name,
      eventName: `${currentPack.name} (${guestCount} invités)`,
      date: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      totalAmount: estimatedTotal,
      status: 'Brouillon',
      items,
    });
    alert('Le devis a été généré à partir de votre simulation !');
    setActiveTab('quotes');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/80 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Grille Tarifaire & Packs d'Événements
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Packs officiels Efficiency Wedding Madagascar, inclusions détaillées et simulateur de chiffrage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <button
            type="button"
            onClick={() => navigate('/pricing/new')}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-md transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter un service</span>
          </button>
          {['all', ...Array.from(new Set(pricingPacks.map((pack) => pack.category)))].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'Tous les Packs' : cat}
            </button>
          ))}
        </div>
      </div>

      {pricingPacksLoadError && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
          <span>{pricingPacksLoadError}</span>
          <button type="button" onClick={() => window.location.reload()} className="font-bold underline">Réessayer</button>
        </div>
      )}
      {deleteError && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">{deleteError}</div>}

      {/* Pricing Packs Grid */}
      {pricingPacksLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-xs text-slate-500">Chargement des packs tarifaires…</div>
      ) : pricingPacks.length === 0 && !pricingPacksLoadError ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-xs text-slate-500">Aucun pack tarifaire enregistré. Créez le premier pack pour démarrer.</div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredPacks.map((pack) => {
          const isPopular = pack.popular;
          const hasGrid = !!pack.pricingGrid;

          return (
            <div
              key={pack.id}
              className={`relative bg-white rounded-2xl border ${
                isPopular
                  ? 'border-amber-400 shadow-lg ring-1 ring-amber-400'
                  : 'border-slate-200 shadow-xs'
              } p-5 flex flex-col justify-between hover:shadow-md transition-all`}
            >
              <div className="flex justify-end gap-1 mb-3">
                <button type="button" onClick={() => navigate(`/pricing/${pack.id}/edit`)} title="Modifier le pack" aria-label={`Modifier ${pack.name}`} className="rounded-lg p-1.5 text-slate-500 hover:bg-amber-50 hover:text-amber-800">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => void handleDeletePack(pack.id, pack.name)} title="Supprimer le pack" aria-label={`Supprimer ${pack.name}`} className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-700">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-black text-[10px] px-3 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Crown className="w-3 h-3" />
                  <span>{pack.badge || 'Pack Le Plus Prisé'}</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                    {pack.category}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">All-Inclusive</span>
                </div>

                <h3 className="text-base font-black text-slate-900 mt-2">{pack.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{pack.description}</p>

                {pack.extraInfo && (
                  <div className="mt-3 p-2 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-800 font-medium">{pack.extraInfo}</p>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Tarif de base (Servis)</span>
                  <p className="text-xl font-black text-slate-950 mt-0.5">
                    {formatAriary(getPackBasePrice(pack, 200))}
                    {getPackSupplement(pack) > 0 && <span className="text-xs font-normal text-slate-500 ml-1">+ {formatAriary(getPackSupplement(pack))}</span>}
                  </p>
                </div>

                {/* Affichage de la grille tarifaire si disponible */}
                {hasGrid && (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-[10px]">
                      <thead>
                        <tr>
                          <th className="text-left font-bold text-slate-500 pb-1 pr-2"></th>
                          {pack.pricingGrid!.headers.map(h => (
                            <th key={h} className="text-right font-bold text-slate-500 pb-1 px-1">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {pack.pricingGrid!.rows.map(row => (
                          <tr key={row.label} className="border-t border-slate-50">
                            <td className="py-1 pr-2 font-medium text-slate-700">{row.label}</td>
                            {row.values.map((val, idx) => (
                              <td key={idx} className="py-1 px-1 text-right font-mono text-slate-600">
                                {formatAriary(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="mt-4 space-y-2">
                  <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">Inclusions du pack :</p>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {pack.includedItems.slice(0, 5).map((inc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-[11px]">{inc}</span>
                      </li>
                    ))}
                    {pack.includedItems.length > 5 && (
                      <li className="text-[10px] text-slate-400 italic pl-5">
                        + {pack.includedItems.length - 5} autres inclusions...
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2">
                <button
                  onClick={() => navigate(`/pricing/${pack.id}`)}
                  className="py-2 px-3 text-xs font-bold rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Détail</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedPackId(pack.id);
                    const el = document.getElementById('pricing-simulator');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`py-2 px-3 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    isPopular
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <span>Simuler</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Simulator Section */}
      {pricingPacksLoading ? (
        <div id="pricing-simulator" className="rounded-xl border border-slate-200 bg-white py-12 text-center text-xs text-slate-500">Chargement du simulateur…</div>
      ) : !currentPack ? (
        <div id="pricing-simulator" className="rounded-xl border border-slate-200 bg-white py-12 text-center text-xs text-slate-500">Le simulateur sera disponible dès qu’un pack est enregistré.</div>
      ) : (
      <div id="pricing-simulator" className="bg-slate-900 text-white rounded-3xl p-6 lg:p-8 shadow-xl">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Calculator className="w-4 h-4" />
            <span>Simulateur Financier & Devis Express</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black mt-2">
            Calculez une estimation personnalisée en Ariary
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            Adaptez les prestations pour votre client et générez immédiatement un devis officiel dans le logiciel.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          {/* Controls */}
          <div className="lg:col-span-7 space-y-5">
            {/* Pack Selector */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">1. Choisir le Pack de base</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pricingPacks.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPackId(p.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedPackId === p.id
                        ? 'border-amber-400 bg-amber-400/10 text-white font-bold'
                        : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <p className="text-xs font-bold text-white">{p.name}</p>
                    <p className="text-[11px] text-amber-400 mt-1 font-mono">{formatAriary(p.basePrice)}</p>
                  </button>
                ))}
              </div>
            </div>

            {currentPack.pricingGrid && (
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">2. Mode de service</label>
                <select value={selectedMealType} onChange={(event) => setSelectedMealType(event.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white">
                  {currentPack.pricingGrid.rows.map((row) => <option key={row.label} value={row.label}>{row.label}</option>)}
                </select>
              </div>
            )}

            {isCustomPrice && (
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">Tarif personnalisé du pack (Ar)</label>
                <input type="number" min={0} step={50000} value={customBasePrice} onChange={(event) => setCustomBasePrice(Number(event.target.value) || 0)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-mono text-white" />
              </div>
            )}

            {/* Guest Count Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-300">3. Nombre d'invités attendus</label>
                <span className="text-xs font-bold text-amber-400 font-mono">{guestCount} convives</span>
              </div>
              <input
                type="range"
                min="50"
                max="600"
                step="25"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>50 pers. (Intime)</span>
                <span>200 pers. (Standard)</span>
                <span>600 pers. (Grand Mariage)</span>
              </div>
            </div>

            {/* Options additionnelles */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">4. Prestations complémentaires du catalogue</label>
              <div className="space-y-2">
                {servicesLoading ? <p className="text-xs text-slate-400">Chargement des prestations…</p> : null}
                {!servicesLoading && optionalServices.length === 0 ? <p className="text-xs text-slate-400">Aucune prestation tarifée n’est disponible dans le catalogue.</p> : null}
                {optionalServices.map((service) => {
                  const quantity = serviceQuantities[service.id] || 0;
                  return (
                    <div key={service.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-800/60 p-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white">{service.name}</p>
                        <p className="text-[10px] text-slate-400">{service.unit} · {formatAriary(service.unitPrice)}</p>
                      </div>
                      <input aria-label={`Quantité ${service.name}`} type="number" min={0} step={1} value={quantity} onChange={(event) => setServiceQuantities((current) => ({ ...current, [service.id]: Math.max(0, Number(event.target.value) || 0) }))} className="w-20 rounded-md border border-slate-600 bg-slate-900 px-2 py-1.5 text-right text-xs font-mono text-white" />
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">5. Client destinataire</label>
              <select value={selectedClientId} onChange={(event) => setSelectedClientId(event.target.value)} disabled={clients.length === 0} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white disabled:opacity-60">
                {clients.length === 0 ? <option value="">Aucun client enregistré</option> : clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
              </select>
            </div>
          </div>

          {/* Simulation Output Card */}
          <div className="lg:col-span-5 bg-slate-800 rounded-2xl p-6 border border-slate-700 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Récapitulatif de Simulation
              </span>

              <div className="space-y-2 text-xs border-b border-slate-700 pb-4">
                <div className="flex justify-between text-slate-300">
                  <span>{currentPack.name} (Base {guestCount} pers.) :</span>
                  <span className="font-mono text-white">{formatAriary(basePrice)}</span>
                </div>
                {supplement > 0 && (
                  <div className="flex justify-between text-slate-300">
                    <span>Supplément {currentPack.name} :</span>
                    <span className="font-mono text-white">{formatAriary(supplement)}</span>
                  </div>
                )}
                {chosenServices.map((service) => <div key={service.id} className="flex justify-between gap-3 text-slate-300"><span className="truncate">{service.name} × {serviceQuantities[service.id]}</span><span className="font-mono text-white">{formatAriary(service.unitPrice * (serviceQuantities[service.id] || 0))}</span></div>)}
              </div>

              <div className="pt-2">
                <span className="text-xs text-slate-400 block uppercase font-bold">Total Estimation Net :</span>
                <p className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight mt-1">
                  {formatAriary(estimatedTotal)}
                </p>
              </div>
            </div>

            <button
              onClick={handleGenerateQuoteFromSimulator}
              disabled={!selectedClient || estimatedTotal <= 0}
              className="mt-6 w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Convertir en Devis Officiel</span>
            </button>
          </div>
        </div>
      </div>
      )}

    </div>
  );
};
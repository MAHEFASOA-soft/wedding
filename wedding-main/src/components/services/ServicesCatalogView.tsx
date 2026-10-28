import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Check,
  Clock,
  Layers,
  Search,
  SlidersHorizontal,
  Edit2,
  Trash2,
  FileText,
  Eye,
  Star,
  DollarSign,
  Tag,
  ArrowRight,
  Info,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ServiceItem, Client, Quote } from '../../types';
import { formatAriary } from '../../utils/formatters';
import { api } from '../../lib/api';
import { PaginatedResponse, PaginationControls } from '../PaginationControls';
import { createPaginationCache } from '../paginationCache';

interface ServicePageResponse extends PaginatedResponse<ServiceItem> {
  stats: {
    totalCount: number;
    popularCount: number;
    avgPrice: number;
    categoriesCount: number;
    categoryCounts: Record<string, number>;
  };
}

interface ServicesListState {
  search: string;
  selectedCategory: string;
  sortBy: 'popular' | 'price-asc' | 'price-desc' | 'name';
  page: number;
  perPage: number;
}

const servicesPageCache = createPaginationCache<ServicePageResponse, ServicesListState>({
  search: '',
  selectedCategory: 'all',
  sortBy: 'popular',
  page: 1,
  perPage: 10,
});

const getServicesPageKey = (state: ServicesListState) => {
  const params = new URLSearchParams({
    page: String(state.page),
    perPage: String(state.perPage),
    sort: state.sortBy,
  });
  if (state.search) params.set('search', state.search);
  if (state.selectedCategory !== 'all') params.set('category', state.selectedCategory);
  return params.toString();
};

const PRESET_IMAGES = [
  { label: 'Wedding Planning VIP', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80' },
  { label: 'Décoration & Fleurs', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80' },
  { label: 'Cortège & Limousine', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80' },
  { label: 'Sonorisation & Éclairage', url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80' },
  { label: 'Photographie & Drone', url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80' },
  { label: 'Mobilier & Tente Cristal', url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80' },
  { label: 'Traiteur & Cocktails', url: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80' },
  { label: 'Pyrotechnie & Étincelles', url: 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=800&q=80' },
  { label: 'Musique & Orchestre Live', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80' },
];

const CATEGORIES = [
  'Organisation & Coordination',
  'Décoration & Art de table',
  'Cortège & Voitures',
  'Sonorisation & Lumière',
  'Photographie & Vidéo',
  'Mobilier & Tentes',
  'Traiteur & Cocktails',
  'Animations & Musique',
];

export const ServicesCatalogView: React.FC = () => {
  const {
    addService,
    updateService,
    deleteService,
    quotes,
    addQuote,
    clients,
    setActiveTab,
  } = useApp();

  // Filters & Search
  const [initialState] = useState(() => servicesPageCache.getState());
  const [searchQuery, setSearchQuery] = useState(initialState.search);
  const [debouncedSearch, setDebouncedSearch] = useState(initialState.search);
  const [selectedCategory, setSelectedCategory] = useState(initialState.selectedCategory);
  const [sortBy, setSortBy] = useState<ServicesListState['sortBy']>(initialState.sortBy);
  const [page, setPage] = useState(initialState.page);
  const [perPage, setPerPage] = useState(initialState.perPage);
  const [initialPage] = useState(() => servicesPageCache.getPage(getServicesPageKey(initialState)));
  const [pageServices, setPageServices] = useState(initialPage?.items ?? []);
  const [totalServices, setTotalServices] = useState(initialPage?.total ?? 0);
  const [serviceStats, setServiceStats] = useState<ServicePageResponse['stats']>(initialPage?.stats ?? {
    totalCount: 0,
    popularCount: 0,
    avgPrice: 0,
    categoriesCount: 0,
    categoryCounts: {},
  });
  const [isLoadingPage, setIsLoadingPage] = useState(!initialPage);
  const [pageLoadError, setPageLoadError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [detailService, setDetailService] = useState<ServiceItem | null>(null);
  const [quoteService, setQuoteService] = useState<ServiceItem | null>(null);
  const [isSavingService, setIsSavingService] = useState(false);
  const [serviceFormError, setServiceFormError] = useState('');
  const [serviceActionError, setServiceActionError] = useState('');

  useEffect(() => {
    servicesPageCache.setState({
      search: searchQuery,
      selectedCategory,
      sortBy,
      page,
      perPage,
    });
  }, [searchQuery, selectedCategory, sortBy, page, perPage]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setDebouncedSearch('');
      return;
    }
    const timeout = window.setTimeout(() => setDebouncedSearch(searchQuery.trim()), 250);
    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({
      page: String(page),
      perPage: String(perPage),
      sort: sortBy,
    });
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    const pageKey = params.toString();
    const cachedPage = servicesPageCache.getPage(pageKey);

    if (cachedPage) {
      setPageServices(cachedPage.items);
      setTotalServices(cachedPage.total);
      setServiceStats(cachedPage.stats);
    }
    setIsLoadingPage(!cachedPage);
    setPageLoadError(null);
    void api.get<ServicePageResponse>(`/services?${params.toString()}`).then((result) => {
      if (!active) return;
      if (!result) {
        if (!cachedPage) {
          setPageServices([]);
          setTotalServices(0);
          setPageLoadError('Impossible de charger le catalogue depuis le serveur.');
        }
        return;
      }
      if (page > Math.max(result.totalPages, 1)) {
        setPage(Math.max(result.totalPages, 1));
        return;
      }
      servicesPageCache.setPage(pageKey, result);
      setPageServices(result.items);
      setTotalServices(result.total);
      setServiceStats(result.stats);
    }).finally(() => {
      if (active) setIsLoadingPage(false);
    });

    return () => {
      active = false;
    };
  }, [page, perPage, debouncedSearch, selectedCategory, sortBy, refreshKey]);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    category: 'Organisation & Coordination',
    unitPrice: 3000000,
    unit: 'par événement',
    duration: 'Journée complète',
    description: '',
    featuresText: '',
    isPopular: false,
    image: PRESET_IMAGES[0].url,
  });

  // Quote integration state
  const [quoteTargetType, setQuoteTargetType] = useState<'new' | 'existing'>('new');
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>(quotes[0]?.id || '');
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [quoteQuantity, setQuoteQuantity] = useState<number>(1);
  const [quoteEventName, setQuoteEventName] = useState<string>('');

  // Open modal for new service
  const handleOpenNew = () => {
    setEditingService(null);
    setFormData({
      name: '',
      category: 'Organisation & Coordination',
      unitPrice: 3000000,
      unit: 'par événement',
      duration: 'Journée complète',
      description: '',
      featuresText: 'Coordination complète, Réunions préparatoires, Gestion des imprévus',
      isPopular: false,
      image: PRESET_IMAGES[0].url,
    });
    setIsFormModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (svc: ServiceItem) => {
    setEditingService(svc);
    setFormData({
      name: svc.name,
      category: svc.category,
      unitPrice: svc.unitPrice,
      unit: svc.unit || 'par événement',
      duration: svc.duration || 'Journée complète',
      description: svc.description,
      featuresText: svc.features ? svc.features.join('\n') : '',
      isPopular: !!svc.isPopular,
      image: svc.image || PRESET_IMAGES[0].url,
    });
    setIsFormModalOpen(true);
  };

  // Save Service
  const handleSubmitService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setServiceFormError('');
    setIsSavingService(true);

    const featuresList = formData.featuresText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const saved = editingService
        ? await updateService({
        ...editingService,
        name: formData.name.trim(),
        category: formData.category,
        unitPrice: Number(formData.unitPrice) || 0,
        unit: formData.unit,
        duration: formData.duration,
        description: formData.description,
        features: featuresList,
        isPopular: formData.isPopular,
        image: formData.image,
      })
        : await addService({
        name: formData.name.trim(),
        category: formData.category,
        unitPrice: Number(formData.unitPrice) || 0,
        unit: formData.unit,
        duration: formData.duration,
        description: formData.description,
        features: featuresList,
        isPopular: formData.isPopular,
        image: formData.image,
      });

      if (!saved) {
        setServiceFormError('Enregistrement impossible. Vérifiez la connexion au serveur puis réessayez.');
        return;
      }

      setRefreshKey((key) => key + 1);
      setIsFormModalOpen(false);
    } finally {
      setIsSavingService(false);
    }
  };

  // Delete Service
  const handleDeleteService = async (id: string, name: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la prestation "${name}" du catalogue ?`)) {
      setServiceActionError('');
      const deleted = await deleteService(id);
      if (!deleted) {
        setServiceActionError('Suppression impossible. Cette prestation peut être utilisée par un événement, ou le serveur est indisponible.');
      } else {
        setRefreshKey((key) => key + 1);
      }
    }
  };

  // Integration to Devis
  const handleOpenQuoteIntegration = (svc: ServiceItem) => {
    setQuoteService(svc);
    setQuoteQuantity(1);
    setQuoteTargetType('new');
    const client = clients[0];
    setQuoteEventName(`Mariage ${client?.name || 'Client'}`);
  };

  const handleConfirmAddToQuote = () => {
    if (!quoteService) return;

    const unitPrice = quoteService.unitPrice || 0;
    const totalLine = unitPrice * quoteQuantity;

    if (quoteTargetType === 'new') {
      const client = clients.find((c) => c.id === selectedClientId) || clients[0];
      const nextNum = `DEV-2026-${String(quotes.length + 1).padStart(3, '0')}`;
      addQuote({
        clientName: client?.name || 'Nouveau Client',
        eventName: quoteEventName || `Prestation ${quoteService.name}`,
        date: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        totalAmount: totalLine,
        status: 'Brouillon',
        items: [
          {
            description: `${quoteService.name} (${quoteService.unit})`,
            quantity: quoteQuantity,
            unitPrice: unitPrice,
            total: totalLine,
          },
        ],
      });
      alert(`Le devis ${nextNum} a été créé avec succès avec la prestation ${quoteService.name} !`);
    } else {
      // Existing quote
      const targetQuote = quotes.find((q) => q.id === selectedQuoteId);
      if (targetQuote) {
        // In a real app we'd update the quote items, for now we add an enriched copy
        addQuote({
          clientName: targetQuote.clientName,
          eventName: targetQuote.eventName,
          date: targetQuote.date,
          validUntil: targetQuote.validUntil,
          totalAmount: targetQuote.totalAmount + totalLine,
          status: targetQuote.status,
          items: [
            ...targetQuote.items,
            {
              description: `${quoteService.name} (${quoteService.unit})`,
              quantity: quoteQuantity,
              unitPrice: unitPrice,
              total: totalLine,
            },
          ],
        });
        alert(`La prestation a été ajoutée au devis ${targetQuote.quoteNumber} !`);
      }
    }

    setQuoteService(null);
    setActiveTab('quotes');
  };

  const totalCount = serviceStats.totalCount;
  const popularCount = serviceStats.popularCount;
  const avgPrice = serviceStats.avgPrice;
  const categoriesCount = serviceStats.categoriesCount;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Action */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/80 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Catalogue des Prestations & Services
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Nomenclature officielle des prestations Efficiency Wedding Madagascar • Chiffrage en Ariary (Ar)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pricing')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <Tag className="w-4 h-4 text-amber-600" />
            <span>Voir les Packs All-Inclusive</span>
          </button>

          <button
            onClick={handleOpenNew}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Prestation</span>
          </button>
        </div>
      </div>

      {pageLoadError && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
          <span>{pageLoadError}</span>
          <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="font-bold underline">
            Réessayer
          </button>
        </div>
      )}
      {serviceActionError && (
        <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
          {serviceActionError}
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Prestations</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-black text-slate-900">{totalCount}</p>
          <span className="text-[10px] text-slate-400">Offres référencées</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pôles d'Expertise</span>
            <Tag className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-black text-slate-900">{categoriesCount}</p>
          <span className="text-[10px] text-slate-400">Catégories actives</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tarif Moyen Unitaire</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-black text-slate-900">{formatAriary(avgPrice)}</p>
          <span className="text-[10px] text-slate-400">Par prestation</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Prestations Stars</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <p className="text-xl font-black text-slate-900">{popularCount}</p>
          <span className="text-[10px] text-slate-400">Les plus plébiscitées</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher une prestation (décoration, limousine, orchestre, zébu...)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Trier par :</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as 'popular' | 'price-asc' | 'price-desc' | 'name');
                setPage(1);
              }}
              className="text-xs font-bold text-slate-700 border border-slate-200 rounded-xl px-2.5 py-2 outline-hidden focus:border-amber-400 bg-white"
            >
              <option value="popular">⭐ Populaire d'abord</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="price-asc">Prix croissant</option>
              <option value="name">Nom alphabétique</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Toutes ({totalCount})
          </button>
          {CATEGORIES.map((cat) => {
            const count = serviceStats.categoryCounts[cat] ?? 0;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedCategory === cat ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Services Grid */}
      {isLoadingPage ? (
        <div className="rounded-xl border border-slate-200 bg-white py-12 text-center text-xs text-slate-500">
          Chargement du catalogue…
        </div>
      ) : pageServices.length === 0 && !pageLoadError ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {totalServices === 0 ? 'Catalogue vide' : 'Aucune prestation trouvée'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {totalServices === 0
              ? 'Aucune prestation n’est encore enregistrée dans le catalogue.'
              : "Aucune prestation ne correspond à vos filtres actuels. Essayez d'effacer la recherche ou créez une nouvelle prestation."}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setPage(1);
            }}
            className="mt-4 px-4 py-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : !pageLoadError ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pageServices.map((svc) => {
            const hasFeatures = svc.features && svc.features.length > 0;
            return (
              <div
                key={svc.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all group"
              >
                {/* Image & Header Overlay */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={svc.image || PRESET_IMAGES[0].url}
                    alt={svc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                  {/* Badges on Image */}
                  <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-xs text-amber-300 border border-amber-400/30">
                      {svc.category}
                    </span>
                    {svc.isPopular && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 shadow-xs flex items-center gap-1">
                        <Star className="w-3 h-3 fill-slate-950" />
                        <span>Populaire</span>
                      </span>
                    )}
                  </div>

                  {svc.duration && (
                    <div className="absolute bottom-3 left-3 text-white text-[11px] font-medium flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{svc.duration}</span>
                    </div>
                  )}

                  {/* Action icons on top right */}
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(svc)}
                      title="Modifier la prestation"
                      className="p-1.5 rounded-lg bg-white/90 text-slate-700 hover:bg-white hover:text-amber-600 transition-colors shadow-xs"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(svc.id, svc.name)}
                      title="Supprimer du catalogue"
                      className="p-1.5 rounded-lg bg-white/90 text-slate-700 hover:bg-rose-500 hover:text-white transition-colors shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-800 transition-colors leading-snug">
                      {svc.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                      {svc.description}
                    </p>

                    {/* Features checklist */}
                    {hasFeatures && (
                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Inclusions de la prestation :
                        </span>
                        {svc.features!.slice(0, 3).map((feat, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="text-[11px] leading-tight line-clamp-1">{feat}</span>
                          </div>
                        ))}
                        {svc.features!.length > 3 && (
                          <p className="text-[10px] font-bold text-amber-600 pt-0.5">
                            + {svc.features!.length - 3} autres prestations incluses
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Price & Action Bottom */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        Tarif catalogue ({svc.unit || 'par événement'})
                      </span>
                      <span className="text-lg font-black text-slate-950 tracking-tight">
                        {formatAriary(svc.unitPrice)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setDetailService(svc)}
                        title="Voir la fiche technique complète"
                        className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenQuoteIntegration(svc)}
                        className="flex items-center gap-1 px-3 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl transition-colors shadow-xs cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Au Devis</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
      {!isLoadingPage && !pageLoadError && totalServices > 0 && (
        <PaginationControls
          page={page}
          perPage={perPage}
          total={totalServices}
          onPageChange={setPage}
          onPerPageChange={(size) => {
            setPerPage(size);
            setPage(1);
          }}
        />
      )}

      {/* MODAL 1: ADD / EDIT PRESTATION */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500 text-slate-950">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold">
                  {editingService ? 'Modifier la Prestation' : 'Ajouter une Prestation au Catalogue'}
                </h3>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitService} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Intitulé de la prestation *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Bar à cocktails & Mixologie VIP"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Catégorie
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tarif unitaire (Ar) *
                  </label>
                  <input
                    type="number"
                    step="50000"
                    required
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-bold"
                  />
                  <span className="text-[10px] text-amber-700 font-medium block mt-0.5">
                    Soit {formatAriary(formData.unitPrice)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Unité de facturation
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: par événement, forfait 200 pers."
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Durée / Délai estimé
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Journée complète, 8 à 10 minutes"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Description détaillée
                </label>
                <textarea
                  rows={2}
                  placeholder="Décrivez les spécificités et la valeur ajoutée pour les mariés..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Inclusions clés (1 par ligne)
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex:&#10;Service au plateau par maîtres d'hôtel&#10;Vaisselle complète porcelaine fine&#10;Nettoyage avant livraison"
                  value={formData.featuresText}
                  onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 font-mono text-[11px]"
                />
              </div>

              {/* Photo presets */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Photo d'illustration
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 mb-2"
                />
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_IMAGES.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData({ ...formData, image: preset.url })}
                      className={`text-[10px] px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                        formData.image === preset.url
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-600'
                          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="accent-amber-500 rounded"
                  />
                  <span>Mettre en avant comme "Prestation Populaire / VIP"</span>
                </label>
              </div>

              {serviceFormError && <p role="alert" className="text-xs text-rose-700">{serviceFormError}</p>}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  disabled={isSavingService}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingService}
                  className="px-5 py-2 text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {isSavingService ? 'Enregistrement…' : editingService ? 'Enregistrer les modifications' : 'Enregistrer au catalogue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FICHE TECHNIQUE & SIMULATEUR EXPRESS */}
      {detailService && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header with image */}
            <div className="relative h-48 w-full bg-slate-900">
              <img
                src={detailService.image || PRESET_IMAGES[0].url}
                alt={detailService.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
              <button
                onClick={() => setDetailService(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full w-8 h-8 flex items-center justify-center text-sm backdrop-blur-xs"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-5 right-5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                  {detailService.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{detailService.name}</h3>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Description de la prestation
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">{detailService.description}</p>
              </div>

              {detailService.features && detailService.features.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Inclusions contractuelles & logistiques
                  </span>
                  <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    {detailService.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Unité & Durée</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                    {detailService.unit} • {detailService.duration || 'Sur mesure'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Tarif Forfaitaire</span>
                  <p className="text-base font-black text-slate-950 mt-0.5">
                    {formatAriary(detailService.unitPrice)}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    const toEdit = detailService;
                    setDetailService(null);
                    handleOpenEdit(toEdit);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Modifier cette prestation
                </button>

                <button
                  onClick={() => {
                    const toQuote = detailService;
                    setDetailService(null);
                    handleOpenQuoteIntegration(toQuote);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Intégrer à un Devis</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: INTEGRER AU DEVIS */}
      {quoteService && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500 text-slate-950">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Ajouter au Devis</h3>
                  <p className="text-[10px] text-slate-400">Émission de proposition commerciale en Ariary</p>
                </div>
              </div>
              <button
                onClick={() => setQuoteService(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl">
                <span className="text-[10px] font-bold text-amber-800 uppercase">Prestation sélectionnée</span>
                <p className="text-xs font-black text-slate-900 mt-0.5">{quoteService.name}</p>
                <p className="text-xs font-mono font-bold text-amber-900 mt-1">
                  {formatAriary(quoteService.unitPrice)} <span className="text-[11px] font-normal text-slate-600">({quoteService.unit})</span>
                </p>
              </div>

              {/* Target Quote Choice */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Destination de la prestation
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setQuoteTargetType('new')}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-colors ${
                      quoteTargetType === 'new'
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    + Nouveau Devis
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuoteTargetType('existing')}
                    disabled={quotes.length === 0}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-colors ${
                      quoteTargetType === 'existing'
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 disabled:opacity-50'
                    }`}
                  >
                    Devis Existant ({quotes.length})
                  </button>
                </div>
              </div>

              {quoteTargetType === 'new' ? (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Client destinataire *
                    </label>
                    <select
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 bg-white font-medium"
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Intitulé de l'événement
                    </label>
                    <input
                      type="text"
                      value={quoteEventName}
                      onChange={(e) => setQuoteEventName(e.target.value)}
                      placeholder="Ex: Mariage Princier au Domaine d'Ambohimanga"
                      className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Sélectionner le devis cible *
                  </label>
                  <select
                    value={selectedQuoteId}
                    onChange={(e) => setSelectedQuoteId(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 bg-white font-medium"
                  >
                    {quotes.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.quoteNumber} — {q.clientName} ({q.eventName})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Quantité / Nombre d'unités
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={quoteQuantity}
                    onChange={(e) => setQuoteQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-24 text-xs font-bold px-3 py-2.5 border border-slate-200 rounded-xl outline-hidden focus:border-amber-400 text-center"
                  />
                  <div className="text-xs text-slate-600">
                    Total chiffré :{' '}
                    <span className="font-black text-slate-950 font-mono">
                      {formatAriary((quoteService.unitPrice || 0) * quoteQuantity)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setQuoteService(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAddToQuote}
                  className="px-5 py-2.5 text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmer & Ouvrir le Devis</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

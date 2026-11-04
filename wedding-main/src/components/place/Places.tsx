import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search, Plus, MapPin, Users, CalendarDays, ChevronDown, CheckCircle2, Eye,
  Pencil, Trash2, ChevronLeft, ChevronRight, X, Phone, Mail, Globe,
  Building2, Car, Snowflake, Utensils, Wifi, ShieldCheck, TreePine, Volume2,
  Lightbulb, Bath, Zap, Navigation, RotateCcw, Image as ImageIcon, Save,
  LayoutGrid, List, AlertCircle, Check, ExternalLink, Sparkles, MapPin as MapPinIcon,
  TrendingUp,
} from 'lucide-react';
import PlacesTable from './PlacesTable';
import { api } from '../../lib/api';
import type {
  Place, PlaceEvent, PlaceType, PlaceStatus, EventStatus, TabKey, ViewMode,
  SortKey, PlaceFormData, FormErrors,
} from './types';
import { PLACE_TYPES, FORM_STATUSES, AMENITIES } from './types';

/* =========================================================

/* =========================================================
   ICON RESOLVER
========================================================= */

const ICON_MAP: Record<string, React.ElementType> = {
  Car, Snowflake, Utensils, Bath, Zap, Wifi, ShieldCheck,
  Building2, TreePine, Volume2, Lightbulb,
};

function getAmenityIcon(name: string): React.ElementType {
  return ICON_MAP[name] ?? CheckCircle2;
}

/* =========================================================
   HELPERS
========================================================= */

const formatPrice = (value: number) =>
  new Intl.NumberFormat('fr-FR').format(value) + ' Ar';

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(value));

const statusClasses: Record<PlaceStatus, string> = {
  Disponible: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Occupé: 'bg-blue-50 text-blue-700 ring-blue-200',
  Maintenance: 'bg-amber-50 text-amber-800 ring-amber-200',
  Indisponible: 'bg-red-50 text-red-700 ring-red-200',
};

const statusDotClasses: Record<PlaceStatus, string> = {
  Disponible: 'bg-emerald-500',
  Occupé: 'bg-blue-500',
  Maintenance: 'bg-amber-500',
  Indisponible: 'bg-red-500',
};

const eventStatusClasses: Record<EventStatus, string> = {
  Confirmé: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'En préparation': 'bg-amber-50 text-amber-800 ring-amber-200',
  'En cours': 'bg-blue-50 text-blue-700 ring-blue-200',
  Planifié: 'bg-blue-50 text-blue-700 ring-blue-200',
  Terminé: 'bg-slate-100 text-slate-600 ring-slate-200',
  Annulé: 'bg-red-50 text-red-700 ring-red-200',
};

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2';

const btnPrimary =
  `inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-slate-800 hover:shadow-md active:scale-[0.98] ${focusRing}`;

const btnSecondary =
  `inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-sm active:scale-[0.98] ${focusRing}`;

const btnDanger =
  `inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition-all duration-200 hover:bg-red-50 active:scale-[0.98] ${focusRing}`;

const cardClass =
  'rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow duration-200';

const fieldClass =
  'h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5';

const emptyForm: PlaceFormData = {
  name: '', type: 'Salle', address: '', city: '', district: '', latitude: '', longitude: '',
  capacity: '', pricePerDay: '', phone: '', email: '', website: '', description: '',
  amenities: [], mainImage: '', gallery: [], status: 'Disponible',
};

const normalizeUrl = (url: string) => (/^https?:\/\//.test(url) ? url : `https://${url}`);

function validate(form: PlaceFormData): FormErrors {
  const e: FormErrors = {};
  if (!form.name.trim()) e.name = 'Indiquez le nom du lieu.';
  if (!form.address.trim()) e.address = "Indiquez l'adresse du lieu.";
  if (!form.city.trim()) e.city = 'Indiquez la ville.';
  if (!form.capacity || Number(form.capacity) <= 0) e.capacity = 'La capacité doit être supérieure à 0.';
  if (form.pricePerDay === '' || Number(form.pricePerDay) < 0) e.pricePerDay = 'Indiquez un prix valide (0 ou plus).';
  if (form.latitude && (isNaN(Number(form.latitude)) || Math.abs(Number(form.latitude)) > 90))
    e.latitude = 'Latitude comprise entre -90 et 90.';
  if (form.longitude && (isNaN(Number(form.longitude)) || Math.abs(Number(form.longitude)) > 180))
    e.longitude = 'Longitude comprise entre -180 et 180.';
  if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Saisissez une adresse e-mail valide.';
  return e;
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Places() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'Tous' | PlaceType>('Tous');
  const [statusFilter, setStatusFilter] = useState<'Tous' | PlaceStatus>('Tous');
  const [capacityFilter, setCapacityFilter] = useState('Tous');
  const [sortKey, setSortKey] = useState<SortKey>('recent');
  const [view, setView] = useState<ViewMode>('grille');
  const PAGE_SIZE = 8;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedPlace = places.find((p) => p.id === selectedId) ?? null;

  const [showForm, setShowForm] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [form, setForm] = useState<PlaceFormData>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});

  const [placeToDelete, setPlaceToDelete] = useState<Place | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('informations');
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [availabilityStart, setAvailabilityStart] = useState('');
  const [availabilityEnd, setAvailabilityEnd] = useState('');
  const [availablePlaceIds, setAvailablePlaceIds] = useState<string[] | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    let active = true;
    api.get<Place[]>('/places').then((result) => {
      if (!active) return;
      setPlaces(result ?? []);
      setLoadError(result === null);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    places.forEach((p) => { counts[p.type] = (counts[p.type] ?? 0) + 1; });
    return counts;
  }, [places]);
  const typeChips = PLACE_TYPES.filter((t) => (typeCounts[t] ?? 0) > 0 || typeFilter === t);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [search, typeFilter, statusFilter, capacityFilter, sortKey]);

  const hasActiveFilters =
    search !== '' || typeFilter !== 'Tous' || statusFilter !== 'Tous' || capacityFilter !== 'Tous' || availablePlaceIds !== null;

  const filteredPlaces = useMemo(() => {
    const q = search.toLowerCase().trim();
    const list = places.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q);
      const matchesType = typeFilter === 'Tous' || p.type === typeFilter;
      const matchesStatus = statusFilter === 'Tous' || p.status === statusFilter;
      const matchesAvailability = availablePlaceIds === null || availablePlaceIds.includes(p.id);
      const matchesCapacity =
        capacityFilter === 'Tous' ||
        (capacityFilter === '0-100' && p.capacity <= 100) ||
        (capacityFilter === '101-300' && p.capacity >= 101 && p.capacity <= 300) ||
        (capacityFilter === '301-500' && p.capacity >= 301 && p.capacity <= 500) ||
        (capacityFilter === '500+' && p.capacity > 500);
      return matchesSearch && matchesType && matchesStatus && matchesCapacity && matchesAvailability;
    });

    const sorted = [...list];
    if (sortKey === 'nom') sorted.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    if (sortKey === 'prix-asc') sorted.sort((a, b) => a.pricePerDay - b.pricePerDay);
    if (sortKey === 'prix-desc') sorted.sort((a, b) => b.pricePerDay - a.pricePerDay);
    if (sortKey === 'capacite') sorted.sort((a, b) => b.capacity - a.capacity);
    return sorted;
  }, [places, search, typeFilter, statusFilter, capacityFilter, sortKey, availablePlaceIds]);

  const resetFilters = () => {
    setSearch(''); setTypeFilter('Tous'); setStatusFilter('Tous'); setCapacityFilter('Tous');
    setAvailabilityStart(''); setAvailabilityEnd(''); setAvailablePlaceIds(null);
  };

  const searchAvailability = async () => {
    if (!availabilityStart || !availabilityEnd || availabilityStart > availabilityEnd) {
      setToast('Indiquez une période valide.');
      return;
    }
    const query = new URLSearchParams({ startDate: availabilityStart, endDate: availabilityEnd });
    const result = await api.get<Place[]>(`/places/available?${query.toString()}`);
    if (!result) {
      setToast('La disponibilité n’a pas pu être vérifiée auprès du serveur.');
      return;
    }
    setAvailablePlaceIds(result.map((place) => place.id));
  };

  /* Stats for hero header */
  const stats = useMemo(() => {
    const total = places.length;
    const available = places.filter((p) => p.status === 'Disponible').length;
    const totalCapacity = places.reduce((sum, p) => sum + p.capacity, 0);
    const avgPrice = total > 0 ? Math.round(places.reduce((sum, p) => sum + p.pricePerDay, 0) / total) : 0;
    return { total, available, totalCapacity, avgPrice };
  }, [places]);

  /* Form handlers */
  const openCreateForm = () => {
    setEditingPlace(null); setForm(emptyForm); setErrors({}); setShowForm(true);
  };

  const openEditForm = (place: Place) => {
    setEditingPlace(place);
    setForm({
      name: place.name, type: place.type, address: place.address, city: place.city,
      district: place.district, latitude: String(place.latitude), longitude: String(place.longitude),
      capacity: String(place.capacity), pricePerDay: String(place.pricePerDay),
      phone: place.phone, email: place.email, website: place.website,
      description: place.description, amenities: place.amenities,
      mainImage: place.mainImage, gallery: place.gallery,
      status: place.status === 'Occupé' ? 'Disponible' : place.status,
    });
    setErrors({});
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditingPlace(null); setErrors({}); };

  const updateForm = (field: keyof PlaceFormData, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const toggleAmenity = (amenity: string) =>
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));

  const uploadMainImage = async (file?: File) => {
    if (!file) return;
    setUploadingImages(true);
    const url = await api.upload(file);
    setUploadingImages(false);
    if (url) updateForm('mainImage', url);
    else setToast('La photo n’a pas pu être envoyée. Vérifiez son format et sa taille.');
  };

  const uploadGalleryImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploadingImages(true);
    const urls = await Promise.all(Array.from(files).map((file) => api.upload(file)));
    setUploadingImages(false);
    const uploaded = urls.filter((url): url is string => Boolean(url));
    if (uploaded.length !== files.length) setToast('Certaines photos n’ont pas pu être envoyées.');
    if (uploaded.length) setForm((current) => ({ ...current, gallery: [...current.gallery, ...uploaded] }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const found = validate(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      const first = Object.keys(found)[0];
      requestAnimationFrame(() => document.getElementById(`field-${first}`)?.focus());
      return;
    }

    const data = {
      name: form.name.trim(), type: form.type, address: form.address.trim(), city: form.city.trim(),
      district: form.district.trim(), latitude: Number(form.latitude) || 0,
      longitude: Number(form.longitude) || 0, capacity: Number(form.capacity),
      pricePerDay: Number(form.pricePerDay), phone: form.phone, email: form.email,
      website: form.website, description: form.description, amenities: form.amenities,
      status: form.status, mainImage: form.mainImage,
      gallery: form.gallery.length ? form.gallery : form.mainImage ? [form.mainImage] : [],
    };

    if (editingPlace) {
      const saved = await api.put<Place>(`/places/${editingPlace.id}`, data);
      if (!saved) {
        setToast('La modification du lieu a échoué.');
        return;
      }
      setPlaces((current) => current.map((place) => place.id === saved.id ? saved : place));
      setToast(`« ${saved.name} » a été mis à jour.`);
    } else {
      const saved = await api.post<Place>('/places', data);
      if (!saved) {
        setToast('La création du lieu a échoué.');
        return;
      }
      setPlaces((current) => [saved, ...current]);
      setToast(`« ${saved.name} » a été créé.`);
    }
    closeForm();
  };

  const confirmDelete = async () => {
    if (!placeToDelete) return;
    const result = await api.del<{ success: boolean }>(`/places/${placeToDelete.id}`);
    if (!result?.success) {
      setToast('La suppression du lieu a échoué.');
      return;
    }
    setPlaces((prev) => prev.filter((p) => p.id !== placeToDelete.id));
    if (selectedId === placeToDelete.id) setSelectedId(null);
    setToast(`« ${placeToDelete.name} » a été supprimé.`);
    setPlaceToDelete(null);
  };

  const openDetails = (place: Place) => {
    setSelectedId(place.id); setActiveTab('informations'); setGalleryIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Subtle decorative gradient */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[420px] bg-gradient-to-b from-slate-100/80 via-slate-50/40 to-transparent" />

      <div className="relative mx-auto max-w-[1400px] p-4 md:p-6 lg:p-8">
        {!selectedPlace && (
          <>
            {/* Top bar */}
            <div className="mb-10 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-sm font-bold tracking-tight text-slate-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md shadow-slate-900/10">
                  <Building2 size={17} aria-hidden />
                </span>
                <span className="hidden sm:inline">Lieux</span>
              </div>
              <button onClick={openCreateForm} className={btnPrimary}>
                <Plus size={16} aria-hidden /> Nouveau lieu
              </button>
            </div>

            {/* Hero header */}
            <header className="mb-10 text-center">
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                <StatCard label="Lieux totaux" value={String(stats.total)} icon={Building2} />
                <StatCard label="Disponibles" value={String(stats.available)} icon={CheckCircle2} accent="emerald" />
                <StatCard label="Capacité totale" value={stats.totalCapacity.toLocaleString('fr-FR')} icon={Users} />
                <StatCard label="Prix moyen" value={formatPrice(stats.avgPrice)} icon={TrendingUp} />
              </div>
            </header>

            <section aria-label="Disponibilité des lieux" className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <label className="grid gap-1 text-xs font-semibold text-slate-600">
                Du
                <input type="date" value={availabilityStart}
                  onChange={(e) => { setAvailabilityStart(e.target.value); setAvailablePlaceIds(null); }}
                  className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-normal text-slate-800" />
              </label>
              <label className="grid gap-1 text-xs font-semibold text-slate-600">
                Au
                <input type="date" min={availabilityStart || undefined} value={availabilityEnd}
                  onChange={(e) => { setAvailabilityEnd(e.target.value); setAvailablePlaceIds(null); }}
                  className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-normal text-slate-800" />
              </label>
              <button type="button" onClick={searchAvailability} className={btnPrimary + ' h-10 px-4'}>
                <Search size={15} aria-hidden /> Chercher les lieux disponibles
              </button>
              {availablePlaceIds !== null && <span className="pb-2 text-sm text-slate-600">{availablePlaceIds.length} résultat{availablePlaceIds.length > 1 ? 's' : ''}</span>}
            </section>

            {/* Filters */}
            <section aria-label="Filtres" className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <FilterSelect label="Capacité" value={capacityFilter} onChange={setCapacityFilter}>
                  <option value="Tous">Toutes</option>
                  <option value="0-100">Jusqu'à 100</option>
                  <option value="101-300">101 à 300</option>
                  <option value="301-500">301 à 500</option>
                  <option value="500+">Plus de 500</option>
                </FilterSelect>
                <FilterSelect label="Statut" value={statusFilter}
                  onChange={(v) => setStatusFilter(v as 'Tous' | PlaceStatus)}>
                  <option value="Tous">Tous</option>
                  <option>Disponible</option><option>Occupé</option>
                  <option>Maintenance</option><option>Indisponible</option>
                </FilterSelect>
                <FilterSelect label="Tri" value={sortKey} onChange={(v) => setSortKey(v as SortKey)}>
                  <option value="recent">Plus récents</option>
                  <option value="nom">Nom (A à Z)</option>
                  <option value="prix-asc">Prix croissant</option>
                  <option value="prix-desc">Prix décroissant</option>
                  <option value="capacite">Capacité</option>
                </FilterSelect>
                {hasActiveFilters && (
                  <button onClick={resetFilters}
                    className={`inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 ${focusRing}`}>
                    <X size={14} aria-hidden /> Effacer
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={16} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
                    aria-label="Rechercher un lieu" placeholder="Rechercher un lieu"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 sm:w-64" />
                </div>
                <div role="group" aria-label="Mode d'affichage"
                  className="inline-flex rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm">
                  {([['grille', LayoutGrid, 'Grille'], ['tableau', List, 'Tableau']] as const).map(
                    ([key, Icon, label]) => (
                      <button key={key} onClick={() => setView(key)} aria-pressed={view === key}
                        aria-label={`Affichage ${label.toLowerCase()}`}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 ${focusRing} ${
                          view === key ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                        }`}>
                        <Icon size={16} aria-hidden />
                      </button>
                    ),
                  )}
                </div>
              </div>
            </section>

            {/* Category chips */}
            <div role="group" aria-label="Filtrer par type"
              className="no-scrollbar -mx-1 mb-7 flex gap-2 overflow-x-auto px-1 py-1">
              {([['Tous', places.length], ...typeChips.map((t) => [t, typeCounts[t] ?? 0])] as [string, number][]).map(
                ([label, count]) => {
                  const active = typeFilter === label;
                  return (
                    <button key={label} onClick={() => setTypeFilter(label as 'Tous' | PlaceType)}
                      aria-pressed={active}
                      className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${focusRing} ${
                        active
                          ? 'border-slate-900 bg-slate-900 text-white shadow-md shadow-slate-900/10'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}>
                      {label}
                      <span className={`text-xs tabular-nums ${active ? 'text-white/60' : 'text-slate-400'}`}>{count}</span>
                    </button>
                  );
                },
              )}
            </div>

            <p className="sr-only" aria-live="polite">
              {filteredPlaces.length} {filteredPlaces.length > 1 ? 'lieux trouvés' : 'lieu trouvé'}
            </p>

            {/* Results */}
            {loading ? (
              <div role="status" className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">Chargement des lieux…</div>
            ) : loadError ? (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">Impossible de charger les lieux depuis le serveur.</div>
            ) : filteredPlaces.length === 0 ? (
              <EmptyState filtered={hasActiveFilters} onReset={resetFilters} onCreate={openCreateForm} />
            ) : view === 'grille' ? (
              <>
                <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredPlaces.slice(0, visibleCount).map((place, i) => (
                    <div key={place.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}>
                      <PlaceCard place={place}
                        onView={() => openDetails(place)}
                        onEdit={() => openEditForm(place)}
                        onDelete={() => setPlaceToDelete(place)} />
                    </div>
                  ))}
                </div>
                {visibleCount < filteredPlaces.length && (
                  <div className="mt-10 flex justify-center">
                    <button onClick={() => setVisibleCount((c) => c + PAGE_SIZE)} className={btnSecondary + ' px-8'}>
                      Charger plus
                    </button>
                  </div>
                )}
              </>
            ) : (
              <PlacesTable
                places={filteredPlaces}
                totalPlaces={places.length}
                onView={openDetails}
                onEdit={openEditForm}
                onDelete={(p: Place) => setPlaceToDelete(p)}
              />
            )}
          </>
        )}

        {selectedPlace && (
          <PlaceDetails
            place={selectedPlace}
            onBack={() => setSelectedId(null)}
            onEdit={() => openEditForm(selectedPlace)}
            onDelete={() => setPlaceToDelete(selectedPlace)}
            activeTab={activeTab} setActiveTab={setActiveTab}
            galleryIndex={galleryIndex} setGalleryIndex={setGalleryIndex}
          />
        )}
      </div>

      {showForm && (
        <PlaceFormModal
          form={form} errors={errors} editingPlace={editingPlace}
          onClose={closeForm} onChange={updateForm}
          onToggleAmenity={toggleAmenity} onSubmit={handleSubmit}
          onUploadMain={uploadMainImage} onUploadGallery={uploadGalleryImages} uploadingImages={uploadingImages}
        />
      )}

      {placeToDelete && (
        <DeleteModal place={placeToDelete} onCancel={() => setPlaceToDelete(null)} onConfirm={confirmDelete} />
      )}

      {/* Toast */}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-[70] flex justify-center px-4">
        {toast && (
          <div className="pointer-events-auto flex items-center gap-2.5 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl shadow-slate-900/20 animate-fade-in-up">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
              <Check size={12} className="text-white" aria-hidden />
            </span>
            {toast}
            <button onClick={() => setToast(null)} aria-label="Fermer la notification"
              className="ml-2 rounded p-0.5 text-slate-400 transition hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label, value, icon: Icon, accent,
}: { label: string; value: string; icon: React.ElementType; accent?: 'emerald' }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3.5 text-left shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-2.5">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${
          accent === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
        }`}>
          <Icon size={16} aria-hidden />
        </span>
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="text-lg font-bold tabular-nums tracking-tight text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SMALL BUILDING BLOCKS
========================================================= */

function StatusBadge({ status, className = '' }: { status: PlaceStatus; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClasses[status]} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${statusDotClasses[status]}`} aria-hidden />
      {status}
    </span>
  );
}

function FilterSelect({
  label, value, onChange, children,
}: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <label className="relative inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white pl-4 pr-3 text-sm shadow-sm transition focus-within:border-slate-900 focus-within:ring-4 focus-within:ring-slate-900/5 hover:border-slate-300 hover:shadow-sm">
      <span className="text-slate-500">{label} :</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none bg-transparent pr-5 font-medium text-slate-900 outline-none">
        {children}
      </select>
      <ChevronDown size={14} aria-hidden className="pointer-events-none absolute right-3 text-slate-400" />
    </label>
  );
}

function PlaceCard({
  place, onView, onEdit, onDelete,
}: { place: Place; onView: () => void; onEdit: () => void; onDelete: () => void }) {
  const reveal =
    'opacity-0 translate-y-2 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100 [@media(hover:none)]:translate-y-0';
  const roundBtn =
    'flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-md transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900';

  return (
    <article className="group h-full">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 transition-all duration-300 group-hover:border-slate-300 group-hover:shadow-xl group-hover:shadow-slate-900/5">
        <button onClick={onView} aria-label={`Voir ${place.name}`} className={`block h-full w-full ${focusRing}`}>
          <img src={place.mainImage} alt="" loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.05]" />
        </button>

        {/* Gradient overlay on hover */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <StatusBadge status={place.status} className="absolute left-3 top-3 shadow-sm" />

        {/* Capacity badge */}
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
          <Users size={11} aria-hidden />
          {place.capacity.toLocaleString('fr-FR')}
        </div>

        <div className={`absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 ${reveal}`}>
          <button onClick={onView}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-md transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900">
            <Eye size={15} aria-hidden /> Voir
          </button>
          <div className="flex gap-1.5">
            <button onClick={onEdit} aria-label={`Modifier ${place.name}`} className={roundBtn}>
              <Pencil size={15} />
            </button>
            <button onClick={onDelete} aria-label={`Supprimer ${place.name}`}
              className={roundBtn.replace('text-slate-700 shadow-md transition hover:bg-slate-100', 'text-red-600 shadow-md transition hover:bg-red-50')}>
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3.5 px-0.5">
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">{place.type}</span>
          <span className="flex items-center gap-0.5 truncate text-slate-500">
            <MapPinIcon size={11} className="shrink-0" />
            {place.district ? `${place.district}, ` : ''}{place.city}
          </span>
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-3">
          <h3 className="truncate text-base font-bold tracking-tight text-slate-900">{place.name}</h3>
        </div>
        <p className="mt-1 text-sm font-medium text-slate-600">{formatPrice(place.pricePerDay)} <span className="text-slate-400">/ jour</span></p>
      </div>
    </article>
  );
}

function EmptyState({
  filtered, onReset, onCreate,
}: { filtered: boolean; onReset: () => void; onCreate: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Building2 size={28} aria-hidden />
      </div>
      <h3 className="text-lg font-bold text-slate-900">
        {filtered ? 'Aucun lieu ne correspond' : 'Aucun lieu pour le moment'}
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
        {filtered
          ? 'Modifiez ou retirez des filtres pour afficher plus de résultats.'
          : 'Ajoutez votre premier lieu pour commencer à planifier des événements.'}
      </p>
      <button onClick={filtered ? onReset : onCreate} className={btnPrimary + ' mt-6'}>
        {filtered ? <RotateCcw size={15} aria-hidden /> : <Plus size={16} aria-hidden />}
        {filtered ? 'Réinitialiser les filtres' : 'Ajouter un lieu'}
      </button>
    </div>
  );
}

/* =========================================================
   DETAILS
========================================================= */

const TABS: [TabKey, string][] = [
  ['informations', 'Informations'], ['galerie', 'Galerie'],
  ['localisation', 'Localisation'], ['agenda', 'Agenda'],
];

function PlaceDetails({
  place, onBack, onEdit, onDelete, activeTab, setActiveTab, galleryIndex, setGalleryIndex,
}: {
  place: Place; onBack: () => void; onEdit: () => void; onDelete: () => void;
  activeTab: TabKey; setActiveTab: (v: TabKey) => void;
  galleryIndex: number; setGalleryIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const currentImage = place.gallery[galleryIndex] || place.mainImage;

  const onTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = (index + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length;
    setActiveTab(TABS[next][0]);
    document.getElementById(`tab-${TABS[next][0]}`)?.focus();
  };

  return (
    <div className="animate-fade-in-up">
      <button onClick={onBack}
        className={`mb-5 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-slate-500 transition hover:text-slate-900 ${focusRing}`}>
        <ChevronLeft size={17} aria-hidden /> Retour aux lieux
      </button>

      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">{place.name}</h1>
            <StatusBadge status={place.status} />
          </div>
          <p className="mt-1.5 flex items-center gap-1 text-sm text-slate-500">
            <MapPinIcon size={13} />
            {place.type} à {place.city}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={onEdit} className={btnSecondary}><Pencil size={16} aria-hidden /> Modifier</button>
          <button onClick={onDelete} className={btnDanger}><Trash2 size={16} aria-hidden /> Supprimer</button>
        </div>
      </header>

      {/* Hero image with overlay */}
      <div className={`${cardClass} mb-6 overflow-hidden`}>
        <div className="relative h-60 md:h-80">
          <img src={place.mainImage} alt={place.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
            <dl className="flex flex-wrap items-end gap-x-12 gap-y-4 text-white">
              <div>
                <dt className="flex items-center gap-1.5 text-sm text-white/70">
                  <Users size={14} /> Capacité maximale
                </dt>
                <dd className="mt-1 text-2xl font-bold md:text-3xl">{place.capacity.toLocaleString('fr-FR')} <span className="text-base font-medium text-white/70">personnes</span></dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-sm text-white/70">
                  <CalendarDays size={14} /> Tarif journalier
                </dt>
                <dd className="mt-1 text-2xl font-bold md:text-3xl">{formatPrice(place.pricePerDay)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label="Sections du lieu"
        className="mb-6 flex overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-sm">
        {TABS.map(([key, label], i) => (
          <button key={key} id={`tab-${key}`} role="tab" aria-selected={activeTab === key}
            aria-controls={`panel-${key}`} tabIndex={activeTab === key ? 0 : -1}
            onClick={() => setActiveTab(key)} onKeyDown={(e) => onTabKeyDown(e, i)}
            className={`whitespace-nowrap border-b-2 px-5 py-3.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:bg-slate-50 ${
              activeTab === key ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}>
            {label}
            {key === 'agenda' && place.events.length > 0 && (
              <span className="ml-2 rounded-full bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">{place.events.length}</span>
            )}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
        {activeTab === 'informations' && <InformationTab place={place} />}
        {activeTab === 'galerie' && (
          <GalleryTab place={place} currentImage={currentImage}
            galleryIndex={galleryIndex} setGalleryIndex={setGalleryIndex} />
        )}
        {activeTab === 'localisation' && <LocationTab place={place} />}
        {activeTab === 'agenda' && <CalendarTab place={place} />}
      </div>
    </div>
  );
}

function InformationTab({ place }: { place: Place }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-5">
        <section className={`${cardClass} p-5`}>
          <h2 className="mb-4 text-base font-bold text-slate-900">Informations générales</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoItem label="Type" value={place.type} icon={Building2} />
            <InfoItem label="Capacité" value={`${place.capacity.toLocaleString('fr-FR')} personnes`} icon={Users} />
            <InfoItem label="Prix par jour" value={formatPrice(place.pricePerDay)} icon={CalendarDays} />
            <InfoItem label="Adresse" value={`${place.address}, ${place.city}`} icon={MapPin} />
          </div>
        </section>

        <section className={`${cardClass} p-5`}>
          <h2 className="mb-3 text-base font-bold text-slate-900">Description</h2>
          <p className="max-w-prose text-sm leading-7 text-slate-600">
            {place.description || 'Aucune description renseignée.'}
          </p>
        </section>

        <section className={`${cardClass} p-5`}>
          <h2 className="mb-4 text-base font-bold text-slate-900">Équipements</h2>
          {place.amenities.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun équipement renseigné.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {place.amenities.map((name) => {
                const Icon = getAmenityIcon(name);
                return (
                  <li key={name} className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
                    <Icon size={15} className="text-slate-500" aria-hidden /> {name}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <div className="space-y-5">
        <section className={`${cardClass} p-5`}>
          <h2 className="mb-4 text-base font-bold text-slate-900">Contact</h2>
          <div className="space-y-4">
            <ContactItem icon={Phone} label="Téléphone" value={place.phone}
              href={place.phone ? `tel:${place.phone.replace(/\s/g, '')}` : undefined} />
            <ContactItem icon={Mail} label="E-mail" value={place.email}
              href={place.email ? `mailto:${place.email}` : undefined} />
            <ContactItem icon={Globe} label="Site web" value={place.website}
              href={place.website ? normalizeUrl(place.website) : undefined} external />
          </div>
        </section>

        <section className={`${cardClass} p-5`}>
          <h2 className="mb-2 text-base font-bold text-slate-900">Événements</h2>
          <p className="text-3xl font-extrabold tabular-nums text-slate-900">{place.events.length}</p>
          <p className="mt-1 text-sm text-slate-500">programmé{place.events.length > 1 ? 's' : ''} dans ce lieu</p>
        </section>
      </div>
    </div>
  );
}

function GalleryTab({
  place, currentImage, galleryIndex, setGalleryIndex,
}: {
  place: Place; currentImage: string; galleryIndex: number;
  setGalleryIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const total = place.gallery.length;
  return (
    <section className={`${cardClass} p-5`}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Galerie</h2>
          <p className="mt-0.5 text-sm text-slate-500">{total} photo{total > 1 ? 's' : ''}</p>
        </div>
        <ImageIcon size={20} className="text-slate-400" aria-hidden />
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-slate-100">
        <img src={currentImage} alt={`${place.name}, photo ${galleryIndex + 1} sur ${total}`}
          className="h-72 w-full object-cover md:h-[420px]" />
        {total > 1 && (
          <>
            <button onClick={() => setGalleryIndex((c) => (c === 0 ? total - 1 : c - 1))}
              aria-label="Photo précédente"
              className={`absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-lg backdrop-blur-sm transition hover:bg-white ${focusRing}`}>
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => setGalleryIndex((c) => (c === total - 1 ? 0 : c + 1))}
              aria-label="Photo suivante"
              className={`absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-lg backdrop-blur-sm transition hover:bg-white ${focusRing}`}>
              <ChevronRight size={20} />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-slate-900/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {galleryIndex + 1} / {total}
            </span>
          </>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-5">
        {place.gallery.map((image, index) => (
          <button key={image + index} onClick={() => setGalleryIndex(index)}
            aria-label={`Afficher la photo ${index + 1}`} aria-current={galleryIndex === index}
            className={`h-20 overflow-hidden rounded-xl border-2 transition-all duration-200 md:h-24 ${focusRing} ${
              galleryIndex === index ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-transparent opacity-60 hover:opacity-100'
            }`}>
            <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </section>
  );
}

function LocationTab({ place }: { place: Place }) {
  const hasCoords = place.latitude !== 0 || place.longitude !== 0;
  const dLon = 0.01, dLat = 0.006;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${place.longitude - dLon}%2C${place.latitude - dLat}%2C${place.longitude + dLon}%2C${place.latitude + dLat}&layer=mapnik&marker=${place.latitude}%2C${place.longitude}`;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.5fr]">
      <section className={`${cardClass} p-5`}>
        <h2 className="mb-5 text-base font-bold text-slate-900">Localisation</h2>
        <div className="space-y-5">
          <InfoItem label="Adresse" value={place.address} icon={MapPin} />
          <InfoItem label="Ville" value={place.city} icon={Building2} />
          <InfoItem label="Quartier" value={place.district || 'Non renseigné'} icon={MapPin} />
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="Latitude" value={String(place.latitude)} icon={Navigation} />
            <InfoItem label="Longitude" value={String(place.longitude)} icon={Navigation} />
          </div>
          {hasCoords && (
            <a href={`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`}
              target="_blank" rel="noopener noreferrer" className={btnPrimary + ' w-full py-3'}>
              <Navigation size={17} aria-hidden /> Ouvrir dans Maps
            </a>
          )}
        </div>
      </section>

      <section className={`${cardClass} relative min-h-[320px] overflow-hidden md:min-h-[450px]`}>
        {hasCoords ? (
          <iframe title={`Carte de ${place.name}`} src={mapSrc} loading="lazy"
            className="absolute inset-0 h-full w-full border-0" />
        ) : (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center p-6 text-center">
            <MapPin size={28} className="text-slate-300" aria-hidden />
            <p className="mt-3 font-semibold text-slate-700">Coordonnées manquantes</p>
            <p className="mt-1 max-w-xs text-sm text-slate-500">
              Ajoutez la latitude et la longitude en modifiant ce lieu pour afficher la carte.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function CalendarTab({ place }: { place: Place }) {
  const today = new Date().toISOString().slice(0, 10);
  const sorted = [...place.events].sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = sorted.filter((e) => e.date >= today);
  const past = sorted.filter((e) => e.date < today).reverse();

  const renderEvent = (event: PlaceEvent) => (
    <li key={event.id} className="rounded-xl border border-slate-200/80 p-4 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50/60 hover:shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
            <CalendarDays size={19} className="text-slate-700" aria-hidden />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">{event.name}</h4>
            <p className="mt-0.5 text-sm text-slate-500">{event.client}</p>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div><dt className="text-xs text-slate-500">Date</dt><dd className="mt-1 font-medium text-slate-700">{formatDate(event.date)}</dd></div>
          <div><dt className="text-xs text-slate-500">Horaire</dt><dd className="mt-1 font-medium text-slate-700">{event.startTime} – {event.endTime}</dd></div>
          <div><dt className="text-xs text-slate-500">Invités</dt><dd className="mt-1 font-medium text-slate-700">{event.guests}</dd></div>
          <div>
            <dt className="text-xs text-slate-500">Statut</dt>
            <dd className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${eventStatusClasses[event.status]}`}>
              {event.status}
            </dd>
          </div>
        </dl>
      </div>
    </li>
  );

  return (
    <section className={`${cardClass} p-5`}>
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Agenda</h2>
          <p className="mt-0.5 text-sm text-slate-500">Événements prévus à {place.name}</p>
        </div>
        <button className={btnPrimary}><Plus size={16} aria-hidden /> Créer un événement</button>
      </div>

      {place.events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <CalendarDays size={30} className="mx-auto text-slate-300" aria-hidden />
          <p className="mt-3 font-semibold text-slate-700">Aucun événement programmé</p>
          <p className="mt-1 text-sm text-slate-500">Ce lieu est libre pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-700">À venir</h3>
              <ul className="space-y-3">{upcoming.map(renderEvent)}</ul>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-700">Passés</h3>
              <ul className="space-y-3">{past.map(renderEvent)}</ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function InfoItem({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-slate-500">{label}</p>
      <div className="flex items-start gap-2 text-sm font-medium text-slate-800">
        <Icon size={16} className="mt-0.5 shrink-0 text-slate-400" aria-hidden />
        <span>{value}</span>
      </div>
    </div>
  );
}

function ContactItem({
  icon: Icon, label, value, href, external,
}: { icon: React.ElementType; label: string; value: string; href?: string; external?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
        <Icon size={16} className="text-slate-600" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        {value && href ? (
          <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className={`mt-0.5 inline-flex items-center gap-1 break-all rounded text-sm font-medium text-slate-800 underline-offset-2 transition hover:text-slate-600 hover:underline ${focusRing}`}>
            {value}{external && <ExternalLink size={12} aria-hidden />}
          </a>
        ) : (
          <p className="mt-0.5 text-sm text-slate-400">Non renseigné</p>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   MODALS
========================================================= */

function Modal({
  labelledBy, onClose, className = 'max-w-md', children,
}: { labelledBy: string; onClose: () => void; className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab' || !ref.current) return;
      const items = ref.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (items.length === 0) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={labelledBy} tabIndex={-1}
        className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl outline-none sm:rounded-3xl ${className}`}>
        {children}
      </div>
    </div>
  );
}

function PlaceFormModal({
  form, errors, editingPlace, onClose, onChange, onToggleAmenity, onSubmit,
  onUploadMain, onUploadGallery, uploadingImages,
}: {
  form: PlaceFormData; errors: FormErrors; editingPlace: Place | null; onClose: () => void;
  onChange: (field: keyof PlaceFormData, value: string | string[]) => void;
  onToggleAmenity: (amenity: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  onUploadMain: (file?: File) => void;
  onUploadGallery: (files: FileList | null) => void;
  uploadingImages: boolean;
}) {
  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <Modal labelledBy="place-form-title" onClose={onClose} className="max-w-4xl">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h2 id="place-form-title" className="text-lg font-bold text-slate-900">
            {editingPlace ? 'Modifier le lieu' : 'Nouveau lieu'}
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {editingPlace ? 'Mettez à jour les informations du lieu.' : "Les champs marqués d'un * sont obligatoires."}
          </p>
        </div>
        <button onClick={onClose} aria-label="Fermer"
          className={`rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 ${focusRing}`}>
          <X size={20} />
        </button>
      </div>

      <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
        <div className="space-y-7 overflow-y-auto p-5">
          {errorCount > 0 && (
            <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
              <AlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden />
              {errorCount === 1 ? 'Un champ est à corriger.' : `${errorCount} champs sont à corriger.`}
            </div>
          )}

          <FormSection title="Informations générales" description="Présentation du lieu.">
            <div className="grid gap-4 md:grid-cols-2">
              <FormInput name="name" label="Nom du lieu" required value={form.name} error={errors.name}
                onChange={(v) => onChange('name', v)} placeholder="Ex. Domaine des Palmiers" />
              <FormSelect name="type" label="Type" value={form.type} onChange={(v) => onChange('type', v)} options={PLACE_TYPES} />
              <FormInput name="address" label="Adresse" required value={form.address} error={errors.address}
                onChange={(v) => onChange('address', v)} placeholder="Numéro et rue" />
              <FormInput name="city" label="Ville" required value={form.city} error={errors.city}
                onChange={(v) => onChange('city', v)} placeholder="Antananarivo" />
              <FormInput name="district" label="Quartier" value={form.district}
                onChange={(v) => onChange('district', v)} placeholder="Ex. Ivandry" />
            </div>
          </FormSection>

          <FormSection title="Capacité et tarif" description="Caractéristiques commerciales du lieu.">
            <div className="grid gap-4 md:grid-cols-3">
              <FormInput name="capacity" label="Capacité maximale" required type="number" suffix="pers."
                value={form.capacity} error={errors.capacity} onChange={(v) => onChange('capacity', v)} placeholder="250" />
              <FormInput name="pricePerDay" label="Prix par jour" required type="number" suffix="Ar"
                value={form.pricePerDay} error={errors.pricePerDay} onChange={(v) => onChange('pricePerDay', v)} placeholder="850000"
                hint={Number(form.pricePerDay) > 0 ? formatPrice(Number(form.pricePerDay)) : undefined} />
              <FormSelect name="status" label="Statut" value={form.status} onChange={(v) => onChange('status', v)} options={FORM_STATUSES} />
            </div>
          </FormSection>

          <FormSection title="Localisation" description="Les coordonnées permettent d'afficher la carte du lieu.">
            <div className="grid gap-4 md:grid-cols-2">
              <FormInput name="latitude" label="Latitude" value={form.latitude} error={errors.latitude}
                onChange={(v) => onChange('latitude', v)} placeholder="-18.8792" />
              <FormInput name="longitude" label="Longitude" value={form.longitude} error={errors.longitude}
                onChange={(v) => onChange('longitude', v)} placeholder="47.5079" />
            </div>
          </FormSection>

          <FormSection title="Contact" description="Comment joindre le lieu.">
            <div className="grid gap-4 md:grid-cols-3">
              <FormInput name="phone" label="Téléphone" type="tel" value={form.phone}
                onChange={(v) => onChange('phone', v)} placeholder="+261 34 00 000 00" />
              <FormInput name="email" label="E-mail" type="email" value={form.email} error={errors.email}
                onChange={(v) => onChange('email', v)} placeholder="contact@exemple.com" />
              <FormInput name="website" label="Site web" value={form.website}
                onChange={(v) => onChange('website', v)} placeholder="www.exemple.com" />
            </div>
          </FormSection>

          <FormSection title="Description" description="Atouts et particularités du lieu.">
            <textarea id="field-description" aria-label="Description" value={form.description}
              onChange={(e) => onChange('description', e.target.value)} rows={4}
              placeholder="Décrivez le lieu, son ambiance, ses espaces…"
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-200 hover:border-slate-300 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5" />
          </FormSection>

          <FormSection title="Équipements" description="Sélectionnez ce qui est disponible sur place.">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
              {AMENITIES.map(({ name, icon: iconName }) => {
                const Icon = ICON_MAP[iconName] ?? CheckCircle2;
                const selected = form.amenities.includes(name);
                return (
                  <button type="button" key={name} onClick={() => onToggleAmenity(name)} aria-pressed={selected}
                    className={`flex items-center gap-2 rounded-xl border p-3 text-left text-sm transition-all duration-200 ${focusRing} ${
                      selected ? 'border-slate-900 bg-slate-900 text-white shadow-md shadow-slate-900/10' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}>
                    <Icon size={16} aria-hidden /> {name}
                  </button>
                );
              })}
            </div>
          </FormSection>

          <FormSection title="Images" description="Sélectionnez les photos sur votre appareil (8 Mo maximum par image).">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-xs font-semibold text-slate-700">
                Photo principale
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploadingImages}
                  onChange={(e) => { void onUploadMain(e.target.files?.[0]); e.currentTarget.value = ''; }}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2" />
              </label>
              <label className="grid gap-2 text-xs font-semibold text-slate-700">
                Photos de la galerie
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple disabled={uploadingImages}
                  onChange={(e) => { void onUploadGallery(e.target.files); e.currentTarget.value = ''; }}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2" />
              </label>
            </div>
            {uploadingImages && <p role="status" className="mt-3 text-xs text-slate-500">Envoi des photos…</p>}
            {form.mainImage && (
              <div className="mt-4 h-40 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <img src={form.mainImage} alt="Aperçu de la photo principale" className="h-full w-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  onLoad={(e) => { e.currentTarget.style.display = 'block'; }} />
              </div>
            )}
            {form.gallery.length > 0 && <p className="mt-2 text-xs text-slate-500">{form.gallery.length} photo{form.gallery.length > 1 ? 's' : ''} dans la galerie</p>}
          </FormSection>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={btnSecondary}>Annuler</button>
          <button type="submit" disabled={uploadingImages} className={btnPrimary + ' disabled:cursor-not-allowed disabled:opacity-60'}>
            <Save size={16} aria-hidden /> {editingPlace ? 'Enregistrer les modifications' : 'Créer le lieu'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function FormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

function FormInput({
  name, label, required, value, onChange, placeholder, type = 'text', error, hint, suffix,
}: {
  name: string; label: string; required?: boolean; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; error?: string; hint?: string; suffix?: string;
}) {
  const id = `field-${name}`;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}{required && <span className="ml-0.5 text-red-500" aria-hidden> *</span>}
      </label>
      <div className="relative">
        <input id={id} type={type} value={value} required={required}
          inputMode={type === 'number' ? 'numeric' : undefined}
          onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          aria-invalid={!!error} aria-describedby={describedBy}
          className={`${fieldClass} ${suffix ? 'pr-14' : ''} ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : ''}`} />
        {suffix && (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">{suffix}</span>
        )}
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
          <AlertCircle size={13} aria-hidden /> {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

function FormSelect({
  name, label, value, onChange, options,
}: { name: string; label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  const id = `field-${name}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-slate-700">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={fieldClass}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function DeleteModal({ place, onCancel, onConfirm }: { place: Place; onCancel: () => void; onConfirm: () => void }) {
  const hasEvents = place.events.length > 0;
  return (
    <Modal labelledBy="delete-title" onClose={onCancel}>
      <div className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <Trash2 size={21} aria-hidden />
        </div>
        <h2 id="delete-title" className="text-lg font-bold text-slate-900">Supprimer ce lieu ?</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          <strong className="text-slate-800">{place.name}</strong> sera supprimé définitivement.
          {hasEvents && ` Les ${place.events.length} événement${place.events.length > 1 ? 's' : ''} associé${place.events.length > 1 ? 's' : ''} seront aussi retiré${place.events.length > 1 ? 's' : ''} de l'agenda.`}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button onClick={onCancel} className={btnSecondary}>Annuler</button>
          <button onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-red-700 hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2">
            <Trash2 size={16} aria-hidden /> Supprimer le lieu
          </button>
        </div>
      </div>
    </Modal>
  );
}

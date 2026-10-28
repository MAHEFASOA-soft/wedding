import {
  Eye, Pencil, Trash2, Users, MapPin,
} from 'lucide-react';
import type { Place } from './types';

interface PlacesTableProps {
  places: Place[];
  totalPlaces: number;
  onView: (place: Place) => void;
  onEdit: (place: Place) => void;
  onDelete: (place: Place) => void;
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat('fr-FR').format(value) + ' Ar';

const statusClasses: Record<Place['status'], string> = {
  Disponible: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Occupé: 'bg-blue-50 text-blue-700 ring-blue-200',
  Maintenance: 'bg-amber-50 text-amber-800 ring-amber-200',
  Indisponible: 'bg-red-50 text-red-700 ring-red-200',
};

const statusDotClasses: Record<Place['status'], string> = {
  Disponible: 'bg-emerald-500',
  Occupé: 'bg-blue-500',
  Maintenance: 'bg-amber-500',
  Indisponible: 'bg-red-500',
};

export default function PlacesTable({
  places, totalPlaces, onView, onEdit, onDelete,
}: PlacesTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3.5">Lieu</th>
              <th className="px-5 py-3.5">Type</th>
              <th className="px-5 py-3.5">Localisation</th>
              <th className="px-5 py-3.5 text-right">Capacité</th>
              <th className="px-5 py-3.5 text-right">Prix / jour</th>
              <th className="px-5 py-3.5">Statut</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {places.map((place) => (
              <tr key={place.id} className="group transition hover:bg-slate-50/60">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      <img
                        src={place.mainImage}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{place.name}</p>
                      <p className="truncate text-xs text-slate-500">{place.phone || '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {place.type}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <MapPin size={14} className="shrink-0 text-slate-400" />
                    <span className="truncate">{place.district ? `${place.district}, ` : ''}{place.city}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                    <Users size={14} className="text-slate-400" />
                    {place.capacity.toLocaleString('fr-FR')}
                  </span>
                </td>
                <td className="px-5 py-4 text-right font-semibold text-slate-700">
                  {formatPrice(place.pricePerDay)}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClasses[place.status]}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusDotClasses[place.status]}`} />
                    {place.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onView(place)}
                      aria-label={`Voir ${place.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => onEdit(place)}
                      aria-label={`Modifier ${place.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(place)}
                      aria-label={`Supprimer ${place.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200 bg-slate-50/60 text-xs text-slate-500">
              <td colSpan={7} className="px-5 py-3">
                {places.length} lieu{places.length > 1 ? 'x' : ''} affiché{places.length > 1 ? 's' : ''} sur {totalPlaces}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

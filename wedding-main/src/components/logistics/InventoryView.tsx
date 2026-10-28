import React, { useState } from 'react';
import { Package, Plus, Search, CheckCircle, AlertTriangle, Trash2, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatAriary } from '../../utils/formatters';

export const InventoryView: React.FC = () => {
  const { equipment, addEquipment, deleteEquipment } = useApp();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New item form
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Mobilier');
  const [quantity, setQuantity] = useState(100);
  const [unitPrice, setUnitPrice] = useState(5000);
  const [location, setLocation] = useState('Entrepôt Central Ankorondrano');

  const filtered = equipment.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addEquipment({
      name,
      category,
      quantity: Number(quantity) || 1,
      availableQuantity: Number(quantity) || 1,
      condition: 'Excellent',
      unitPrice: Number(unitPrice) || 0,
      location,
    });

    setName('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5 pb-12">
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-500" />
            <span>Parc Matériel & Logistique Événementielle</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Inventaire des chaises Chiavari, tables de banquet, arches florales, nappes et matériel audio
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Ajouter Matériel</span>
        </button>
      </div>

      <div className="bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher équipement, catégorie, lieu de stockage..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-hidden focus:border-amber-500"
          />
        </div>
      </div>

      {/* Equipment Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Matériel</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3 text-center">Quantité Totale</th>
                <th className="px-4 py-3 text-center">Disponible</th>
                <th className="px-4 py-3">État</th>
                <th className="px-4 py-3 text-right">Tarif Loc. Unité (Ar)</th>
                <th className="px-4 py-3">Emplacement Stock</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900">{item.name}</td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-slate-900">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-center font-extrabold text-emerald-700">
                    {item.availableQuantity}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {item.condition}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-black text-slate-800">
                    {formatAriary(item.unitPrice)}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{item.location}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => deleteEquipment(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">Nouveau Matériel en Stock</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nom du matériel *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Assiettes de présentation dorées"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Catégorie
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden bg-white"
                >
                  <option value="Mobilier">Mobilier (Chaises, Tables)</option>
                  <option value="Décoration">Décoration (Arches, Vases, Tapis)</option>
                  <option value="Art de la table">Art de la table (Verrerie, Nappage)</option>
                  <option value="Audiovisuel">Audiovisuel (Sonorisation, Spots)</option>
                  <option value="Structure">Structure & Chapiteaux</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Quantité
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Prix Unitaire Loc. (Ar)
                  </label>
                  <input
                    type="number"
                    step="500"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Lieu de stockage
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-600"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

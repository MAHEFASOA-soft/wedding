import React, { useEffect, useState } from 'react';
import { Settings, Building, CheckCircle } from 'lucide-react';
import { api } from '../../lib/api';

interface AgencySettings {
  agencyName: string;
  address: string;
  phone: string;
  email: string;
  nif: string;
  stat: string;
  currency: string;
}

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<AgencySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [error, setError] = useState('');

  const loadSettings = async () => {
    setIsLoading(true);
    setError('');
    const result = await api.get<AgencySettings>('/settings');
    if (result) setSettings(result);
    else setError('Impossible de charger les paramètres depuis le serveur.');
    setIsLoading(false);
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  const updateField = (field: keyof AgencySettings, value: string) => {
    setSettings((previous) => previous ? { ...previous, [field]: value } : previous);
    setSavedMessage(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    setError('');
    setSavedMessage(false);
    const saved = await api.patch<AgencySettings>('/settings', settings);
    setIsSaving(false);

    if (!saved) {
      setError('Enregistrement impossible. Vérifiez les champs et la connexion au serveur.');
      return;
    }

    setSettings(saved);
    setSavedMessage(true);
    window.setTimeout(() => setSavedMessage(false), 3000);
  };

  if (isLoading) {
    return <p className="p-6 text-sm text-slate-500">Chargement des paramètres...</p>;
  }

  if (!settings) {
    return (
      <div className="max-w-4xl space-y-4">
        <p role="alert" className="text-sm text-red-700">{error}</p>
        <button type="button" onClick={() => void loadSettings()} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-500" />
            <span>Paramètres du Logiciel & Informations Entreprise</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configuration institutionnelle, devise de comptabilité et sauvegarde des données
          </p>
        </div>

        {savedMessage && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-in fade-in">
            <CheckCircle className="w-4 h-4" />
            <span>Paramètres enregistrés</span>
          </span>
        )}
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Building className="w-4 h-4 text-amber-600" />
          <span>Fiche d'Identité de l'Agence</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Raison Sociale / Nom d'enseigne
            </label>
            <input
              type="text"
              required
              maxLength={180}
              value={settings.agencyName}
              onChange={(e) => updateField('agencyName', e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Devise Principale du Système
            </label>
            <input
              type="text"
              disabled
              value={settings.currency}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 font-extrabold text-amber-700 outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Adresse du siège à Antananarivo
            </label>
            <input
              type="text"
              required
              maxLength={255}
              value={settings.address}
              onChange={(e) => updateField('address', e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Téléphone officiel
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={settings.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Adresse email officielle
            </label>
            <input
              type="email"
              required
              maxLength={180}
              value={settings.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Numéro d'Identification Fiscale (NIF)
            </label>
            <input
              type="text"
              maxLength={40}
              value={settings.nif}
              onChange={(e) => updateField('nif', e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Numéro Statistique (STAT)
            </label>
            <input
              type="text"
              maxLength={60}
              value={settings.stat}
              onChange={(e) => updateField('stat', e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden font-mono"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
              disabled={isSaving}
            className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-xs transition-colors"
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer les informations'}
          </button>
        </div>
      </form>

      
    </div>
  );
};

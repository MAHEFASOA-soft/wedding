
import React, { useEffect, useRef, useState } from 'react';

import {
  Menu,
  Search,
  PlusCircle,
  TrendingUp,
  User,
  LogOut,
  ChevronDown,
} from 'lucide-react';

import { useApp } from '../../context/AppContext';
import { formatAriary } from '../../utils/formatters';

const titlesMap: Record<string, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Tableau de bord',
    subtitle: 'Vue d’ensemble des activités, indicateurs clés et rentabilité',
  },
  reservations: {
    title: 'Réservations',
    subtitle: 'Demandes de réservation et pré-engagements des futurs mariés',
  },
  appointments: {
    title: 'Rendez-vous',
    subtitle: 'Consultations, visites de salles et séances de cadrage',
  },
  events: {
    title: 'Événements',
    subtitle: 'Mariages, réceptions et célébrations privées à Madagascar',
  },
  clients: {
    title: 'Répertoire Clients',
    subtitle: 'Base de données des mariés, familles et entreprises clientes',
  },
  services: {
    title: 'Prestations & Services',
    subtitle: 'Catalogue des prestations Efficiency Wedding Madagascar',
  },
  pricing: {
    title: 'Activités & Prix',
    subtitle: 'Grille tarifaire officielle, packs mariage et forfaits exclusifs',
  },
  servers: {
    title: 'Gestion des Serveurs',
    subtitle: 'Brigade de salle, maîtres d’hôtel, barmans et affectations',
  },
  tasks: {
    title: 'Suivi des Tâches',
    subtitle: 'Checklists opérationnelles, rétroplannings et assignations',
  },
  quotes: {
    title: 'Devis & Propositions',
    subtitle: 'Chiffrages détaillés, estimations et propositions commerciales',
  },
  invoices: {
    title: 'Facturation',
    subtitle: 'Factures d’acomptes et soldes clients avec suivi des règlements',
  },
  payments: {
    title: 'Paiements Reçus',
    subtitle: 'Historique des règlements : Espèces, Virements et Mobile Money',
  },
  finances: {
    title: 'Gestion Financière & Trésorerie',
    subtitle: 'Suivi de l’argent qui entre, sort, salaires et marge bénéficiaire',
  },
  planning: {
    title: 'Planning Interactif',
    subtitle: 'Calendrier synchronisé de tous les événements avec fiches détaillées',
  },
  team: {
    title: 'Équipe Permanente',
    subtitle: 'Coordonnateurs, régisseurs, directeurs artistiques et staff',
  },
  statistics: {
    title: 'Analyses & Statistiques',
    subtitle: 'Performances mensuelles, marges réelles et rentabilité des événements',
  },
  settings: {
    title: 'Paramètres du Logiciel',
    subtitle: 'Configuration du système, sauvegarde locale et réinitialisation',
  },
};

export const Header: React.FC<{
  onToggleSidebar?: () => void;
  onOpenNewEvent?: () => void;
  onOpenNewReceipt?: () => void;
  onOpenNewExpense?: () => void;
  onOpenProfile?: () => void;
  onLogout?: () => void;
}> = ({
  onToggleSidebar,
  onOpenNewEvent,
  onOpenNewReceipt,
  onOpenProfile,
  onLogout,
}) => {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    netProfit,
    openCreateEventModal,
  } = useApp();

  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  const currentInfo = titlesMap[activeTab] || {
    title: 'Logiciel de Gestion',
    subtitle: 'Efficiency Wedding Madagascar',
  };

  const currentDateFormatted = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Fermer le menu lorsqu'on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfile = () => {
    setProfileOpen(false);

    if (onOpenProfile) {
      onOpenProfile();
    } else {
      setActiveTab('settings');
    }
  };

  const handleLogout = () => {
    setProfileOpen(false);

    if (onLogout) {
      onLogout();
      return;
    }

    // À remplacer par votre vraie logique de déconnexion
    console.log('Déconnexion...');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-6 py-3 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">

        {/* Left Side */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            id="mobile-menu-btn"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            title="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-tight truncate">
                {currentInfo.title}
              </h2>

              {activeTab === 'finances' && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Résultat : {formatAriary(netProfit)}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 hidden sm:block truncate">
              {currentInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">

          {/* Search */}
          <div className="relative w-44 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />

            <input
              type="text"
              placeholder="Rechercher client, événement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
            />
          </div>

          {/* New Event */}
          <button
            id="btn-quick-new-event"
            onClick={onOpenNewEvent || openCreateEventModal}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-xs transition-colors cursor-pointer"
            title="Créer un nouvel événement"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Événement</span>
          </button>

          {/* Finances */}
          <button
            id="btn-quick-finances"
            onClick={
              onOpenNewReceipt ||
              (() => setActiveTab('finances'))
            }
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 rounded-lg transition-colors cursor-pointer"
            title="Encaisser ou consulter les finances"
          >
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Finances</span>
          </button>

          {/* Profile Dropdown */}
          <div
            ref={profileRef}
            className="relative flex items-center pl-2 border-l border-slate-200"
          >
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                MR
              </div>

              {/* User Info */}
              <div className="hidden xl:block text-left text-xs leading-tight">
                <span className="font-semibold text-slate-800 block">
                  Miora Randria
                </span>

                <span className="text-[10px] text-slate-500 block">
                  Direction Générale
                </span>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  profileOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {profileOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/50 overflow-hidden z-50"
                role="menu"
              >
                {/* User header */}
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-700 text-white font-bold text-sm flex items-center justify-center">
                      MR
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        Miora Randria
                      </p>

                      <p className="text-[11px] text-slate-500 truncate">
                        Direction Générale
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profile */}
                <div className="p-1.5">
                  <button
                    type="button"
                    onClick={handleProfile}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition-colors text-left"
                    role="menuitem"
                  >
                    <User className="w-4 h-4 text-slate-500" />

                    <div>
                      <span className="font-medium block">
                        Mon profil
                      </span>

                      <span className="text-[10px] text-slate-400">
                        Voir et modifier mon profil
                      </span>
                    </div>
                  </button>
                </div>

                <div className="border-t border-slate-100" />

                {/* Logout */}
                <div className="p-1.5">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                    role="menuitem"
                  >
                    <LogOut className="w-4 h-4" />

                    <div>
                      <span className="font-medium block">
                        Se déconnecter
                      </span>

                      <span className="text-[10px] text-red-400">
                        Quitter votre session
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};


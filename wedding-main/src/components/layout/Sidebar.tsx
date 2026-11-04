
// import React from 'react';
// import { NavLink } from 'react-router-dom';
// import {
//   LayoutDashboard,
//   CalendarCheck,
//   CalendarDays,
//   Sparkles,
//   Users,
//   Layers,
//   Tag,
//   CheckSquare,
//   FileText,
//   Receipt,
//   CreditCard,
//   Calendar,
//   Users2,
//   BarChart3,
//   Settings,
//   ChevronRight,
//   Crown,
//   ShieldCheck,
//   WalletCards,
//   ChevronDown,
//   PlaneIcon,
//   Map,
// } from 'lucide-react';

// import { useApp } from '../../context/AppContext';
// import { NavigationTab } from '../../types';

// type UserRole = 'admin' | 'manager' | 'finance' | 'staff';

// interface NavItem {
//   id: NavigationTab;
//   label: string;
//   icon: React.ComponentType<{ className?: string }>;
//   badge?: string | number;
//   highlight?: boolean;
//   roles: UserRole[];
//   children?: {
//     id: NavigationTab;
//     label: string;
//     icon: React.ComponentType<{ className?: string }>;
//     roles: UserRole[];
//   }[];
// }

// const roleLabels: Record<UserRole, string> = {
//   admin: 'Administrateur',
//   manager: 'Manager événementiel',
//   finance: 'Responsable financier',
//   staff: 'Personnel',
// };

// const roleColors: Record<UserRole, string> = {
//   admin: 'text-amber-300 bg-amber-400/10 border-amber-400/20',
//   manager: 'text-blue-300 bg-blue-400/10 border-blue-400/20',
//   finance: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20',
//   staff: 'text-violet-300 bg-violet-400/10 border-violet-400/20',
// };

// const getAuthData = () => {
//   try {
//     const localAuth = localStorage.getItem('admin_auth');
//     const sessionAuth = sessionStorage.getItem('admin_auth');

//     const authData = localAuth || sessionAuth;

//     if (!authData) return null;

//     return JSON.parse(authData);
//   } catch {
//     localStorage.removeItem('admin_auth');
//     sessionStorage.removeItem('admin_auth');

//     return null;
//   }
// };

// export const Sidebar: React.FC<{
//   isOpen?: boolean;
//   onCloseMobile?: () => void;
// }> = ({ isOpen = false, onCloseMobile }) => {
//   const { events, tasks, reservations } = useApp();

//   const pendingReservationsCount = reservations.filter(
//     (r) => r.status === 'En attente',
//   ).length;

//   const pendingTasksCount = tasks.filter(
//     (t) => t.status !== 'Terminé',
//   ).length;

//   /**
//    * Récupération du rôle connecté
//    */
//   const auth = getAuthData();

//   const currentRole: UserRole =
//     auth?.role &&
//     ['admin', 'manager', 'finance', 'staff'].includes(auth.role)
//       ? auth.role
//       : 'staff';

//   /**
//    * Tous les menus + permissions
//    */
//   const allNavItems: NavItem[] = [
//     {
//       id: 'dashboard',
//       label: 'Tableau de bord',
//       icon: LayoutDashboard,
//       roles: ['admin', 'manager', 'finance', 'staff'],
//     },

//     // {
//     //   id: 'reservations',
//     //   label: 'Réservations',
//     //   icon: CalendarCheck,
//     //   badge:
//     //     pendingReservationsCount > 0
//     //       ? pendingReservationsCount
//     //       : undefined,
//     //   roles: ['admin', 'manager'],
//     // },

//     // {
//     //   id: 'appointments',
//     //   label: 'Rendez-vous',
//     //   icon: CalendarDays,
//     //   roles: ['admin', 'manager'],
//     // },

//     {
//       id: 'events',
//       label: 'Événements',
//       icon: Sparkles,
//       badge: events.length,
//       roles: ['admin', 'manager', 'finance', 'staff'],
//     },

//     {
//       id: 'clients',
//       label: 'Clients',
//       icon: Users,
//       roles: ['admin', 'manager', 'finance'],
//     },

//     {
//       id: 'services',
//       label: 'Prestations',
//       icon: Layers,
//       roles: ['admin', 'manager', 'staff'],
//     },

//     {
//       id: 'pricing',
//       label: 'Activités & Prix',
//       icon: Tag,
//       roles: ['admin', 'manager', 'finance'],
//     },

//     {
//       id: 'tasks',
//       label: 'Tâches',
//       icon: CheckSquare,
//       badge:
//         pendingTasksCount > 0
//           ? pendingTasksCount
//           : undefined,
//       roles: ['admin', 'manager', 'staff'],
//     },

//     {
//       id: 'quotes',
//       label: 'Devis',
//       icon: FileText,
//       roles: ['admin', 'manager', 'finance'],
//     },

//     {
//       id: 'invoices',
//       label: 'Factures',
//       icon: Receipt,
//       roles: ['admin', 'finance'],
//     },

//     {
//       id: 'payments',
//       label: 'Paiements',
//       icon: CreditCard,
//       roles: ['admin', 'finance'],
//     },

//     {
//       id: 'finances',
//       label: 'Finances',
//       icon: WalletCards,
//       highlight: true,
//       roles: ['admin', 'finance'],
//     },
//     {
//       id: 'places',
//       label: 'Lieux',
//       icon: Map,
//       highlight: true,
//       roles: ['admin', 'finance'],
//     },
//     {
//       id: 'planning',
//       label: 'Planning',
//       icon: Calendar,
//       highlight: true,
//       roles: ['admin', 'manager', 'staff'],
//     },

//     {
//       id: 'team',
//       label: 'Personnel & Équipes',
//       icon: Users2,
//       roles: ['admin', 'manager'],
//     },

//     {
//       id: 'statistics',
//       label: 'Statistiques',
//       icon: BarChart3,
//       roles: ['admin', 'manager', 'finance'],
//     },

//     {
//       id: 'users',
//       label: 'Administration',
//       icon: ShieldCheck,
//       roles: ['admin'],
//       children: [
//         {
//           id: 'users',
//           label: 'Utilisateurs',
//           icon: Users,
//           roles: ['admin'],
//         },
//         {
//           id: 'roles-permissions',
//           label: 'Rôles & Permissions',
//           icon: ShieldCheck,
//           roles: ['admin'],
//         },
//       ],
//     },


//     {
//       id: 'settings',
//       label: 'Paramètres',
//       icon: Settings,
//       roles: ['admin'],
//     },
//   ];

//   /**
//    * On garde uniquement les menus autorisés
//    * pour le rôle connecté.
//    */
//   const navItems = allNavItems.filter((item) =>
//     item.roles.includes(currentRole),
//   );

//   return (
//     <aside
//       id="main-sidebar"
//       className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-800 bg-slate-900 text-slate-200 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
//         isOpen ? 'translate-x-0' : '-translate-x-full'
//       }`}
//     >
//       {/* ================= BRAND ================= */}
//       <div className="border-b border-slate-800/80 bg-slate-950/40 p-4">
//         <div className="flex items-center gap-3">
//           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20 ring-1 ring-amber-300/30">
//             <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
//               <Crown className="h-5 w-5 text-amber-400" />
//             </div>
//           </div>

//           <div>
//             <h1 className="flex items-center gap-1.5 text-sm font-bold tracking-wide text-white">
//               EFFICIENCY
//             </h1>

//             <p className="text-[11px] font-medium tracking-tight text-slate-400">
//               WEDDING MADAGASCAR
//             </p>
//           </div>
//         </div>

//         {/* ================= STATUS ================= */}
//         <div className="mt-2.5 flex items-center justify-between rounded border border-slate-700/50 bg-slate-800/60 px-2 py-1">
//           <span className="text-[10px] font-semibold uppercase text-slate-400">
//             Logiciel Interne
//           </span>

//           <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400">
//             <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
//             Connecté
//           </span>
//         </div>

//         {/* ================= ROLE ================= */}
//         <div
//           className={`mt-2 flex items-center gap-2 rounded-lg border px-2.5 py-2 ${roleColors[currentRole]}`}
//         >
//           <ShieldCheck className="h-3.5 w-3.5 shrink-0" />

//           <div className="min-w-0">
//             <p className="truncate text-[10px] font-bold uppercase tracking-wide">
//               {roleLabels[currentRole]}
//             </p>

//             <p className="truncate text-[9px] opacity-70">
//               Accès personnalisé
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* ================= NAVIGATION ================= */}
//       <nav className="scrollbar-thin scrollbar-thumb-slate-800 flex-1 space-y-0.5 overflow-y-auto px-3 py-3">

//         {navItems.map((item) => {
//           const Icon = item.icon;

//           const visibleChildren = item.children?.filter((child) =>
//             child.roles.includes(currentRole),
//           );

//           const hasChildren =
//             visibleChildren && visibleChildren.length > 0;

//           const isAdministration =
//             item.id === 'users';

//           return (
//             <React.Fragment key={item.id}>
//               {/* MENU SIMPLE */}
//               {!hasChildren && (
//                 <NavLink
//                   to={`/${item.id}`}
//                   onClick={onCloseMobile}
//                   className={({ isActive }) =>
//                     `group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all ${
//                       isActive
//                         ? 'bg-amber-500 font-bold text-slate-950 shadow-md shadow-amber-500/25'
//                         : item.highlight
//                           ? 'text-amber-200/90 hover:bg-slate-800/80 hover:text-white'
//                           : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
//                     }`
//                   }
//                 >
//                   {({ isActive }) => (
//                     <>
//                       <div className="flex min-w-0 items-center gap-2.5">
//                         <Icon
//                           className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
//                             isActive
//                               ? 'text-slate-950'
//                               : item.highlight
//                                 ? 'text-amber-400'
//                                 : 'text-slate-400'
//                           }`}
//                         />

//                         <span className="truncate">
//                           {item.label}
//                         </span>
//                       </div>

//                       <div className="flex items-center gap-1.5">
//                         {item.badge !== undefined && (
//                           <span className="rounded-full bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-300">
//                             {item.badge}
//                           </span>
//                         )}

//                         {isActive && (
//                           <ChevronRight className="h-3.5 w-3.5" />
//                         )}
//                       </div>
//                     </>
//                   )}
//                 </NavLink>
//               )}

//               {/* MENU AVEC SOUS-MENUS */}
//               {hasChildren && (
//                 <div className="pt-1">
//                   {/* TITRE DU GROUPE */}
//                   <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400">
//                     <Icon className="h-4 w-4 text-slate-400" />

//                     <span className="flex-1">
//                       {item.label}
//                     </span>

//                     <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
//                   </div>

//                   {/* SOUS-MENUS */}
//                   <div className="ml-3 space-y-0.5 border-l border-slate-800 pl-2">
//                     {visibleChildren.map((child) => {
//                       const ChildIcon = child.icon;

//                       return (
//                         <NavLink
//                           key={child.id}
//                           to={`/${child.id}`}
//                           onClick={onCloseMobile}
//                           className={({ isActive }) =>
//                             `group flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
//                               isActive
//                                 ? 'bg-amber-500 font-bold text-slate-950 shadow-sm'
//                                 : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
//                             }`
//                           }
//                         >
//                           {({ isActive }) => (
//                             <>
//                               <ChildIcon
//                                 className={`h-3.5 w-3.5 shrink-0 ${
//                                   isActive
//                                     ? 'text-slate-950'
//                                     : 'text-slate-500 group-hover:text-slate-300'
//                                 }`}
//                               />

//                               <span className="truncate">
//                                 {child.label}
//                               </span>

//                               {isActive && (
//                                 <ChevronRight className="ml-auto h-3 w-3" />
//                               )}
//                             </>
//                           )}
//                         </NavLink>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}
//             </React.Fragment>
//           );
//         })}
//       </nav>

//       {/* ================= FOOTER ================= */}
//       <div className="border-t border-slate-800/80 bg-slate-950/60 p-3 text-[11px] text-slate-400">
//         <div className="flex items-center justify-between">
//           <span className="font-medium text-slate-300">
//             Antananarivo, MG
//           </span>

//           <span className="text-[10px] text-amber-400/80">
//             Devise : Ariary (Ar)
//           </span>
//         </div>

//         <p className="mt-0.5 truncate text-[10px] text-slate-500">
//           Efficiency Wedding Management
//         </p>
//       </div>
//     </aside>
//   );
// };

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  Sparkles,
  Users,
  Layers,
  Tag,
  CheckSquare,
  FileText,
  Receipt,
  CreditCard,
  Calendar,
  Users2,
  BarChart3,
  Settings,
  ChevronRight,
  Crown,
  ShieldCheck,
  WalletCards,
  ChevronDown,
  Map,
} from 'lucide-react';

import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';

type UserRole = 'admin' | 'manager' | 'finance' | 'staff';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  highlight?: boolean;
  roles: UserRole[];
  children?: {
    id: NavigationTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    roles: UserRole[];
  }[];
}

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrateur',
  manager: 'Manager événementiel',
  finance: 'Responsable financier',
  staff: 'Personnel',
};

const roleColors: Record<UserRole, string> = {
  admin: 'text-amber-300 bg-amber-400/10 border-amber-400/20',
  manager: 'text-blue-300 bg-blue-400/10 border-blue-400/20',
  finance: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20',
  staff: 'text-violet-300 bg-violet-400/10 border-violet-400/20',
};

const getAuthData = () => {
  try {
    const localAuth = localStorage.getItem('admin_auth');
    const sessionAuth = sessionStorage.getItem('admin_auth');

    const authData = localAuth || sessionAuth;

    if (!authData) return null;

    return JSON.parse(authData);
  } catch {
    localStorage.removeItem('admin_auth');
    sessionStorage.removeItem('admin_auth');

    return null;
  }
};

export const Sidebar: React.FC<{
  isOpen?: boolean;
  onCloseMobile?: () => void;
}> = ({ isOpen = false, onCloseMobile }) => {
  const { eventsTotalCount, tasks, reservations } = useApp();

  const pendingReservationsCount = reservations.filter(
    (r) => r.status === 'En attente',
  ).length;

  const pendingTasksCount = tasks.filter(
    (t) => t.status !== 'Terminé',
  ).length;

  const auth = getAuthData();

  const currentRole: UserRole =
    auth?.role &&
    ['admin', 'manager', 'finance', 'staff'].includes(auth.role)
      ? auth.role
      : 'staff';

  const allNavItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      roles: ['admin', 'manager', 'finance', 'staff'],
    },

    // Réservations
    // {
    //   id: 'reservations',
    //   label: 'Réservations',
    //   icon: CalendarCheck,
    //   badge:
    //     pendingReservationsCount > 0
    //       ? pendingReservationsCount
    //       : undefined,
    //   roles: ['admin', 'manager'],
    // },

    // Rendez-vous
    // {
    //   id: 'appointments',
    //   label: 'Rendez-vous',
    //   icon: CalendarDays,
    //   roles: ['admin', 'manager'],
    // },

    {
      id: 'events',
      label: 'Événements',
      icon: Sparkles,
      badge: eventsTotalCount,
      roles: ['admin', 'manager', 'finance', 'staff'],
    },

    {
      id: 'clients',
      label: 'Clients',
      icon: Users,
      roles: ['admin', 'manager', 'finance'],
    },

    {
      id: 'services',
      label: 'Prestations',
      icon: Layers,
      roles: ['admin', 'manager', 'staff'],
    },

    {
      id: 'pricing',
      label: 'Activités & Prix',
      icon: Tag,
      roles: ['admin', 'manager', 'finance'],
    },

    {
      id: 'tasks',
      label: 'Tâches',
      icon: CheckSquare,
      badge:
        pendingTasksCount > 0
          ? pendingTasksCount
          : undefined,
      roles: ['admin', 'manager', 'staff'],
    },

    {
      id: 'quotes',
      label: 'Devis',
      icon: FileText,
      roles: ['admin', 'manager', 'finance'],
    },

    {
      id: 'invoices',
      label: 'Factures',
      icon: Receipt,
      roles: ['admin', 'finance'],
    },

    {
      id: 'payments',
      label: 'Paiements',
      icon: CreditCard,
      roles: ['admin', 'finance'],
    },

    {
      id: 'finances',
      label: 'Finances',
      icon: WalletCards,
      highlight: true,
      roles: ['admin', 'finance'],
    },

    {
      id: 'places',
      label: 'Lieux',
      icon: Map,
      highlight: true,
      roles: ['admin', 'finance'],
    },

    {
      id: 'planning',
      label: 'Planning',
      icon: Calendar,
      highlight: true,
      roles: ['admin', 'manager', 'staff'],
    },

    {
      id: 'team',
      label: 'Personnel & Équipes',
      icon: Users2,
      roles: ['admin', 'manager'],
    },

    {
      id: 'statistics',
      label: 'Statistiques',
      icon: BarChart3,
      roles: ['admin', 'manager', 'finance'],
    },

    {
      id: 'users',
      label: 'Administration',
      icon: ShieldCheck,
      roles: ['admin'],
      children: [
        {
          id: 'users',
          label: 'Utilisateurs',
          icon: Users,
          roles: ['admin'],
        },
        {
          id: 'roles-permissions',
          label: 'Rôles & Permissions',
          icon: ShieldCheck,
          roles: ['admin'],
        },
      ],
    },

    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings,
      roles: ['admin'],
    },
  ];

  const navItems = allNavItems.filter((item) =>
    item.roles.includes(currentRole),
  );

  return (
    <aside
      id="main-sidebar"
      className={`
        fixed inset-y-0 left-0 z-40
        flex w-64 shrink-0 flex-col
        border-r border-slate-800
        bg-slate-900 text-slate-200
        transition-transform duration-200 ease-in-out
        lg:static lg:translate-x-0
        ${
          isOpen
            ? 'translate-x-0'
            : '-translate-x-full'
        }
      `}
    >
      {/* =====================================================
          BRAND
      ====================================================== */}
      <div className="border-b border-slate-800/80 bg-slate-950/40 px-3 pb-3 pt-3">
        <div className="flex items-center gap-2.5">
          <div
            className="
              flex h-9 w-9 shrink-0 items-center justify-center
              rounded-xl
              bg-gradient-to-br from-amber-400 to-amber-600
              p-0.5
              shadow-lg shadow-amber-500/20
              ring-1 ring-amber-300/30
            "
          >
            <div
              className="
                flex h-full w-full items-center justify-center
                rounded-[10px]
                bg-slate-950
              "
            >
              <Crown className="h-4.5 w-4.5 text-amber-400" />
            </div>
          </div>

          <div className="min-w-0">
            <h1 className="flex items-center gap-1 text-[12px] font-bold tracking-wide text-white">
              EFFICIENCY
            </h1>

            <p className="truncate text-[9px] font-medium tracking-tight text-slate-400">
              WEDDING MADAGASCAR
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          NAVIGATION
      ====================================================== */}
      <nav
        className="
          scrollbar-thin
          scrollbar-thumb-slate-800
          flex-1
          space-y-0.5
          overflow-y-auto
          px-2.5
          py-2
        "
        aria-label="Navigation principale"
      >
        {/* Groupe principal */}
        <div className="mb-2">
          <p
            className="
              px-2
              pb-1
              pt-1.5
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.08em]
              text-slate-500
            "
          >
            Navigation
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;

            const visibleChildren = item.children?.filter((child) =>
              child.roles.includes(currentRole),
            );

            const hasChildren =
              visibleChildren && visibleChildren.length > 0;

            return (
              <React.Fragment key={item.id}>
                {/* =================================================
                    MENU SIMPLE
                ================================================== */}
                {!hasChildren && (
                  <NavLink
                    to={`/${item.id}`}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `
                      group flex h-8 w-full
                      items-center justify-between
                      rounded-[5px]
                      px-2
                      text-[11px]
                      font-medium
                      transition-all duration-150
                      ${
                        isActive
                          ? 'bg-amber-500 font-semibold text-slate-950 shadow-sm shadow-amber-500/20'
                          : item.highlight
                            ? 'text-amber-200/90 hover:bg-slate-800/80 hover:text-white'
                            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }
                      `
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex min-w-0 items-center gap-2.5">
                          <Icon
                            className={`
                              h-3.5 w-3.5 shrink-0
                              transition-transform duration-150
                              group-hover:scale-105
                              ${
                                isActive
                                  ? 'text-slate-950'
                                  : item.highlight
                                    ? 'text-amber-400'
                                    : 'text-slate-400'
                              }
                            `}
                          />

                          <span className="truncate">
                            {item.label}
                          </span>
                        </div>

                        <div className="flex shrink-0 items-center gap-1.5">
                          {item.badge !== undefined && (
                            <span
                              className={`
                                min-w-[18px]
                                rounded-full
                                px-1.5
                                py-0.5
                                text-center
                                text-[9px]
                                font-bold
                                ${
                                  isActive
                                    ? 'bg-slate-950/10 text-slate-950'
                                    : 'bg-slate-800 text-slate-300'
                                }
                              `}
                            >
                              {item.badge}
                            </span>
                          )}

                          {isActive && (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </div>
                      </>
                    )}
                  </NavLink>
                )}

                {/* =================================================
                    MENU AVEC SOUS-MENUS
                ================================================== */}
                {hasChildren && (
                  <div className="pt-1">
                    {/* Titre du groupe */}
                    <div
                      className="
                        flex h-8 items-center gap-2
                        rounded-[5px]
                        px-2
                        text-[11px]
                        font-semibold
                        text-slate-400
                      "
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                      <span className="flex-1 truncate">
                        {item.label}
                      </span>

                      <ChevronDown className="h-3 w-3 text-slate-500" />
                    </div>

                    {/* Sous-menus */}
                    <div
                      className="
                        ml-3
                        space-y-0.5
                        border-l
                        border-slate-800
                        pl-1.5
                      "
                    >
                      {visibleChildren?.map((child) => {
                        const ChildIcon = child.icon;

                        return (
                          <NavLink
                            key={child.id}
                            to={`/${child.id}`}
                            onClick={onCloseMobile}
                            className={({ isActive }) =>
                              `
                              group flex h-7
                              items-center gap-2
                              rounded-[5px]
                              px-2
                              text-[10px]
                              font-medium
                              transition-all duration-150
                              ${
                                isActive
                                  ? 'bg-amber-500 font-semibold text-slate-950 shadow-sm'
                                  : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                              }
                              `
                            }
                          >
                            {({ isActive }) => (
                              <>
                                <ChildIcon
                                  className={`
                                    h-3 w-3 shrink-0
                                    ${
                                      isActive
                                        ? 'text-slate-950'
                                        : 'text-slate-500 group-hover:text-slate-300'
                                    }
                                  `}
                                />

                                <span className="truncate">
                                  {child.label}
                                </span>

                                {isActive && (
                                  <ChevronRight className="ml-auto h-2.5 w-2.5" />
                                )}
                              </>
                            )}
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </nav>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <div
        className="
          border-t border-slate-800/80
          bg-slate-950/60
          px-3 py-2.5
          text-[10px]
          text-slate-400
        "
      >
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-medium text-slate-300">
            Antananarivo, MG
          </span>

          <span className="shrink-0 text-[9px] text-amber-400/80">
            Ariary (Ar)
          </span>
        </div>

        <p className="mt-0.5 truncate text-[9px] text-slate-500">
          Efficiency Wedding Management
        </p>
      </div>
    </aside>
  );
};

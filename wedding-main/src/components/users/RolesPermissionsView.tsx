// src/components/users/RolesPermissionsView.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api';
import {
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Check,
  Eye,
  FilePlus2,
  Edit3,
  Ban,
  Lock,
  Users,
  CalendarDays,
  UserRound,
  Layers,
  Tag,
  CheckSquare,
  FileText,
  Receipt,
  CreditCard,
  WalletCards,
  Calendar,
  BarChart3,
  Settings,
} from 'lucide-react';

type PermissionAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete';

interface Permission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  system: boolean;
  permissions: Record<string, Permission>;
}

interface ModuleDefinition {
  id: string;
  label: string;
  icon: React.ElementType;
}

const modules: ModuleDefinition[] = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    icon: BarChart3,
  },
  {
    id: 'events',
    label: 'Événements',
    icon: CalendarDays,
  },
  {
    id: 'clients',
    label: 'Clients',
    icon: Users,
  },
  {
    id: 'services',
    label: 'Prestations',
    icon: Layers,
  },
  {
    id: 'pricing',
    label: 'Activités & Prix',
    icon: Tag,
  },
  {
    id: 'tasks',
    label: 'Tâches',
    icon: CheckSquare,
  },
  {
    id: 'quotes',
    label: 'Devis',
    icon: FileText,
  },
  {
    id: 'invoices',
    label: 'Factures',
    icon: Receipt,
  },
  {
    id: 'payments',
    label: 'Paiements',
    icon: CreditCard,
  },
  {
    id: 'finances',
    label: 'Finances',
    icon: WalletCards,
  },
  {
    id: 'planning',
    label: 'Planning',
    icon: Calendar,
  },
  {
    id: 'team',
    label: 'Personnel & Équipes',
    icon: UserRound,
  },
  {
    id: 'statistics',
    label: 'Statistiques',
    icon: BarChart3,
  },
  {
    id: 'users',
    label: 'Utilisateurs',
    icon: Users,
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: Settings,
  },
];

const emptyPermission = (): Permission => ({
  view: false,
  create: false,
  edit: false,
  delete: false,
});

const createPermissionSet = (
  allowedModules: string[],
  full = false,
): Record<string, Permission> => {
  return Object.fromEntries(
    modules.map((module) => [
      module.id,
      allowedModules.includes(module.id)
        ? full
          ? {
              view: true,
              create: true,
              edit: true,
              delete: true,
            }
          : {
              view: true,
              create: false,
              edit: false,
              delete: false,
            }
        : emptyPermission(),
    ]),
  );
};

const actionLabels: Record<
  PermissionAction,
  string
> = {
  view: 'Voir',
  create: 'Créer',
  edit: 'Modifier',
  delete: 'Supprimer',
};

const roleColorClasses: Record<
  string,
  string
> = {
  amber:
    'bg-amber-50 text-amber-700 border-amber-200',
  blue:
    'bg-blue-50 text-blue-700 border-blue-200',
  emerald:
    'bg-emerald-50 text-emerald-700 border-emerald-200',
  violet:
    'bg-violet-50 text-violet-700 border-violet-200',
  slate:
    'bg-slate-100 text-slate-700 border-slate-200',
};

const RolesPermissionsView: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);

  const [selectedRoleId, setSelectedRoleId] =
    useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');

  const [isRoleModalOpen, setIsRoleModalOpen] =
    useState(false);

  const [editingRole, setEditingRole] =
    useState<Role | null>(null);

  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] =
    useState('');

  useEffect(() => {
    let isMounted = true;

    const loadRoles = async () => {
      const result = await api.get<Role[]>('/roles');
      if (!isMounted) return;
      if (result) {
        setRoles(result);
        setSelectedRoleId(result[0]?.id ?? '');
      } else {
        setError('Impossible de charger les rôles depuis le serveur.');
      }
      setIsLoading(false);
    };

    void loadRoles();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedRole = useMemo(
    () =>
      roles.find(
        (role) => role.id === selectedRoleId,
      ) ?? null,
    [roles, selectedRoleId],
  );

  const filteredModules = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return modules;

    return modules.filter((module) =>
      module.label.toLowerCase().includes(value),
    );
  }, [search]);

  const permissionSummary = useMemo(() => {
    if (!selectedRole) {
      return {
        modules: 0,
        permissions: 0,
        total: modules.length * 4,
      };
    }

    let permissions = 0;

    Object.values(selectedRole.permissions).forEach(
      (permission) => {
        if (permission.view) permissions++;
        if (permission.create) permissions++;
        if (permission.edit) permissions++;
        if (permission.delete) permissions++;
      },
    );

    return {
      modules: Object.values(
        selectedRole.permissions,
      ).filter(
        (permission) =>
          permission.view ||
          permission.create ||
          permission.edit ||
          permission.delete,
      ).length,
      permissions,
      total: modules.length * 4,
    };
  }, [selectedRole]);

  const savePermissions = async (
    role: Role,
    permissions: Record<string, Permission>,
  ) => {
    setIsSaving(true);
    setError('');
    const saved = await api.patch<Role>(`/roles/${role.id}`, { permissions });
    setIsSaving(false);
    if (!saved) {
      setError('Impossible d’enregistrer les permissions.');
      return;
    }
    setRoles((previous) => previous.map((item) => item.id === saved.id ? saved : item));
  };

  const updatePermission = (
    moduleId: string,
    action: PermissionAction,
    value: boolean,
  ) => {
    if (!selectedRole) return;

    void savePermissions(selectedRole, {
      ...selectedRole.permissions,
      [moduleId]: {
        ...(selectedRole.permissions[moduleId] ?? emptyPermission()),
        [action]: value,
      },
    });
  };

  const toggleModule = (
    moduleId: string,
    value: boolean,
  ) => {
    if (!selectedRole) return;

    void savePermissions(selectedRole, {
      ...selectedRole.permissions,
      [moduleId]: {
        view: value,
        create: value,
        edit: value,
        delete: value,
      },
    });
  };

  const openCreateRole = () => {
    setEditingRole(null);
    setRoleName('');
    setRoleDescription('');
    setIsRoleModalOpen(true);
  };

  const openEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description);
    setIsRoleModalOpen(true);
  };

  const closeRoleModal = () => {
    setIsRoleModalOpen(false);
    setEditingRole(null);
    setRoleName('');
    setRoleDescription('');
  };

  const saveRole = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!roleName.trim()) return;

    setIsSaving(true);
    setError('');
    const payload = {
      name: roleName.trim(),
      description: roleDescription.trim(),
      color: editingRole?.color ?? 'slate',
      permissions: editingRole?.permissions ?? createPermissionSet([]),
    };
    const saved = editingRole
      ? await api.put<Role>(`/roles/${editingRole.id}`, payload)
      : await api.post<Role>('/roles', payload);
    setIsSaving(false);

    if (!saved) {
      setError('Impossible d’enregistrer ce rôle. Vérifiez son nom et la connexion au serveur.');
      return;
    }

    setRoles((previous) => editingRole
      ? previous.map((role) => role.id === saved.id ? saved : role)
      : [...previous, saved]);
    setSelectedRoleId(saved.id);

    closeRoleModal();
  };

  const deleteRole = async (role: Role) => {
    if (role.system) return;

    const confirmed = window.confirm(
      `Supprimer le rôle "${role.name}" ?`,
    );

    if (!confirmed) return;

    const result = await api.del<{ success: boolean }>(`/roles/${role.id}`);
    if (!result?.success) {
      setError('Impossible de supprimer ce rôle. Il est peut-être encore attribué à un utilisateur.');
      return;
    }
    setRoles((previous) => previous.filter((item) => item.id !== role.id));

    if (selectedRoleId === role.id) {
      setSelectedRoleId(roles.find((item) => item.id !== role.id)?.id ?? '');
    }
  };

  const selectAllPermissions = () => {
    if (!selectedRole) return;

    const permissions = createPermissionSet(modules.map((module) => module.id), true);
    void savePermissions(selectedRole, permissions);
  };

  const clearAllPermissions = () => {
    if (!selectedRole) return;

    void savePermissions(selectedRole, createPermissionSet([]));
  };

  if (isLoading) {
    return <p className="p-6 text-sm text-slate-500">Chargement des rôles...</p>;
  }

  if (!selectedRole) {
    return (
      <div className="space-y-4 p-6">
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {!error && <p className="text-sm text-slate-500">Aucun rôle disponible.</p>}
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50/60 p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">

        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>Administration</span>
              <span>/</span>
              <span className="text-slate-700">
                Rôles & Permissions
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Rôles & Permissions
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Configurez les droits d'accès des utilisateurs.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateRole}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus size={17} />
            Créer un rôle
          </button>
        </div>

        {/* ROLE CARDS */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {roles.map((role) => {
            const isSelected =
              selectedRoleId === role.id;

            const rolePermissions = Object.values(
              role.permissions,
            ).reduce((count, permission) => {
              return (
                count +
                Number(permission.view) +
                Number(permission.create) +
                Number(permission.edit) +
                Number(permission.delete)
              );
            }, 0);

            return (
              <button
                key={role.id}
                type="button"
                onClick={() =>
                  setSelectedRoleId(role.id)
                }
                disabled={isSaving}
                className={`rounded-xl border bg-white p-4 text-left shadow-sm transition ${
                  isSelected
                    ? 'border-slate-400 ring-2 ring-slate-100'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
                      roleColorClasses[role.color] ?? roleColorClasses.slate
                    }`}
                  >
                    <ShieldCheck size={19} />
                  </div>

                  {role.system && (
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
                      Système
                    </span>
                  )}
                </div>

                <h3 className="mt-3 text-sm font-bold text-slate-900">
                  {role.name}
                </h3>

                <p className="mt-1 line-clamp-2 min-h-[32px] text-xs text-slate-500">
                  {role.description}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-[11px] text-slate-400">
                    Permissions
                  </span>

                  <span className="text-xs font-bold text-slate-700">
                    {rolePermissions}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* PERMISSION PANEL */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          {/* PANEL HEADER */}
          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                    roleColorClasses[selectedRole.color] ?? roleColorClasses.slate
                  }`}
                >
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">
                      {selectedRole.name}
                    </h2>

                    {selectedRole.system && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                        Rôle système
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {selectedRole.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="mr-2 flex items-center gap-4 text-xs text-slate-500">
                  <span>
                    <strong className="text-slate-800">
                      {permissionSummary.modules}
                    </strong>{' '}
                    modules
                  </span>

                  <span>
                    <strong className="text-slate-800">
                      {permissionSummary.permissions}
                    </strong>{' '}
                    permissions
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    openEditRole(selectedRole)
                  }
                  disabled={isSaving}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Pencil size={14} />
                  Modifier le rôle
                </button>

                {!selectedRole.system && (
                  <button
                    type="button"
                    onClick={() =>
                      deleteRole(selectedRole)
                    }
                    disabled={isSaving}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* TOOLBAR */}
          <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/50 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Rechercher un module..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAllPermissions}
                disabled={isSaving}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Tout autoriser
              </button>

              <button
                type="button"
                onClick={clearAllPermissions}
                disabled={isSaving}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Tout retirer
              </button>
            </div>
          </div>

          {/* PERMISSION TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-white">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Module
                  </th>

                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Voir
                  </th>

                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Créer
                  </th>

                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Modifier
                  </th>

                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Supprimer
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Module
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredModules.map((module) => {
                  const Icon = module.icon;

                  const permission =
                    selectedRole.permissions[
                      module.id
                    ] ?? emptyPermission();

                  const moduleEnabled =
                    permission.view ||
                    permission.create ||
                    permission.edit ||
                    permission.delete;

                  return (
                    <tr
                      key={module.id}
                      className="transition hover:bg-slate-50/60"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                            <Icon size={15} />
                          </div>

                          <span className="text-sm font-semibold text-slate-700">
                            {module.label}
                          </span>
                        </div>
                      </td>

                      {(
                        [
                          'view',
                          'create',
                          'edit',
                          'delete',
                        ] as PermissionAction[]
                      ).map((action) => (
                        <td
                          key={action}
                          className="px-5 py-3.5 text-center"
                        >
                          <PermissionCheckbox
                            checked={
                              permission?.[action] ?? false
                            }
                            disabled={isSaving}
                            onChange={(value) =>
                              updatePermission(
                                module.id,
                                action,
                                value,
                              )
                            }
                          />
                        </td>
                      ))}

                      <td className="px-5 py-3.5 text-right">
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() =>
                            toggleModule(
                              module.id,
                              !moduleEnabled,
                            )
                          }
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            moduleEnabled
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {moduleEnabled
                            ? 'Autorisé'
                            : 'Bloqué'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* FOOTER INFO */}
          <div className="flex items-center gap-2 border-t border-slate-200 bg-slate-50/60 px-5 py-3 text-[11px] text-slate-500">
            <Lock size={13} />

            <span>
              Les rôles système peuvent être modifiés,
              mais ne peuvent pas être supprimés.
            </span>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT ROLE MODAL */}
      {isRoleModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeRoleModal();
            }
          }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingRole
                    ? 'Modifier le rôle'
                    : 'Créer un rôle'}
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Définissez le nom et la description du rôle.
                </p>
              </div>

              <button
                type="button"
                onClick={closeRoleModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={saveRole}>
              {error && (
                <div role="alert" className="mx-6 mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              <div className="space-y-5 px-6 py-5">

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Nom du rôle
                  </label>

                  <input
                    type="text"
                    required
                    value={roleName}
                    onChange={(event) =>
                      setRoleName(event.target.value)
                    }
                    placeholder="Ex. Responsable logistique"
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Description
                  </label>

                  <textarea
                    rows={3}
                    value={roleDescription}
                    onChange={(event) =>
                      setRoleDescription(
                        event.target.value,
                      )
                    }
                    placeholder="Décrivez les responsabilités de ce rôle..."
                    className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                  <div className="flex gap-2">
                    <ShieldCheck
                      size={16}
                      className="mt-0.5 shrink-0 text-blue-600"
                    />

                    <div>
                      <p className="text-xs font-semibold text-blue-800">
                        Permissions
                      </p>

                      <p className="mt-0.5 text-[11px] leading-relaxed text-blue-600">
                        Le nouveau rôle sera créé sans
                        permission. Vous pourrez ensuite
                        sélectionner les accès dans le tableau.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50/60 px-6 py-4">
                <button
                  type="button"
                  onClick={closeRoleModal}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="h-9 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  {editingRole
                    ? 'Enregistrer'
                    : 'Créer le rôle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

interface PermissionCheckboxProps {
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}

const PermissionCheckbox: React.FC<
  PermissionCheckboxProps
> = ({ checked, disabled = false, onChange }) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`mx-auto flex h-7 w-7 items-center justify-center rounded-md border transition ${
        checked
          ? 'border-emerald-500 bg-emerald-500 text-white'
          : 'border-slate-200 bg-white text-transparent hover:border-slate-300'
      }`}
      title={
        checked
          ? 'Permission activée'
          : 'Permission désactivée'
      }
    >
      <Check size={14} strokeWidth={3} />
    </button>
  );
};

export default RolesPermissionsView;
// src/components/users/UsersView.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api';
import {
  Plus,
  Search,
  Users,
  ShieldCheck,
  BriefcaseBusiness,
  WalletCards,
  UserRound,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

type UserStatus = 'active' | 'inactive';

interface RoleOption {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  lastLogin: string | null;
  phone?: string;
}

interface UserForm {
  name: string;
  email: string;
  phone: string;
  role: string;
  password: string;
  status: UserStatus;
}

const emptyForm: UserForm = {
  name: '',
  email: '',
  phone: '',
  role: 'staff',
  password: '',
  status: 'active',
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
};

const roleColorClasses: Record<string, string> = {
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  violet: 'bg-violet-50 text-violet-700 border-violet-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
};

const getRoleBadgeClass = (role: string, color?: string) => {
  const legacyColors: Record<string, string> = {
    admin: 'slate',
    manager: 'amber',
    finance: 'emerald',
    staff: 'blue',
  };

  return roleColorClasses[color ?? legacyColors[role] ?? 'slate'];
};

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'admin':
      return ShieldCheck;

    case 'manager':
      return BriefcaseBusiness;

    case 'finance':
      return WalletCards;

    case 'staff':
      return UserRound;

    default:
      return UserRound;
  }
};

const UsersView: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>(
    'all',
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  const [form, setForm] = useState<UserForm>(emptyForm);
  const [showPassword, setShowPassword] = useState(false);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      const [usersResult, rolesResult] = await Promise.all([
        api.get<UserItem[]>('/users'),
        api.get<RoleOption[]>('/roles'),
      ]);
      if (!isMounted) return;
      if (usersResult) setUsers(usersResult);
      if (rolesResult) {
        setRoles(rolesResult);
        setForm((previous) => ({
          ...previous,
          role: rolesResult.find((role) => role.id === previous.role)?.id ?? rolesResult[0]?.id ?? '',
        }));
      }
      if (!usersResult || !rolesResult) setError('Impossible de charger les utilisateurs et leurs rôles depuis le serveur.');
      setIsLoading(false);
    };

    void loadUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch) ||
        user.phone?.toLowerCase().includes(normalizedSearch);

      const matchesRole =
        roleFilter === 'all' || user.role === roleFilter;

      const matchesStatus =
        statusFilter === 'all' || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((user) => user.status === 'active').length,
      inactive: users.filter((user) => user.status === 'inactive').length,
    };
  }, [users]);

  const openCreateModal = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setShowPassword(false);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const openEditModal = (user: UserItem) => {
    setEditingUser(user);

    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      password: '',
      status: user.status,
    });

    setShowPassword(false);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setForm(emptyForm);
    setShowPassword(false);
  };

  const handleFormChange = (
    field: keyof UserForm,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      return;
    }

    setIsSaving(true);
    setError('');
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      role: form.role,
      status: form.status,
      password: form.password,
    };
    const saved = editingUser
      ? await api.put<UserItem>(`/users/${editingUser.id}`, payload)
      : await api.post<UserItem>('/users', payload);
    setIsSaving(false);

    if (!saved) {
      setError('Enregistrement impossible. Vérifiez les informations et la connexion au serveur.');
      return;
    }

    setUsers((previous) => editingUser
      ? previous.map((user) => user.id === saved.id ? saved : user)
      : [saved, ...previous]);
    closeModal();
  };

  const toggleStatus = async (userId: string) => {
    const user = users.find((item) => item.id === userId);
    if (!user) return;
    const saved = await api.patch<UserItem>(`/users/${userId}`, {
      status: user.status === 'active' ? 'inactive' : 'active',
    });
    if (!saved) {
      setError('Impossible de modifier le statut de cet utilisateur.');
      setOpenMenuId(null);
      return;
    }
    setUsers((previous) => previous.map((item) => item.id === saved.id ? saved : item));
    setOpenMenuId(null);
  };

  const deleteUser = async (userId: string) => {
    const user = users.find((item) => item.id === userId);

    if (!user) return;

    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer l'utilisateur "${user.name}" ?`,
    );

    if (!confirmed) return;

    const result = await api.del<{ success: boolean }>(`/users/${userId}`);
    if (!result?.success) {
      setError('Impossible de supprimer cet utilisateur.');
      setOpenMenuId(null);
      return;
    }
    setUsers((previous) => previous.filter((item) => item.id !== userId));

    setOpenMenuId(null);
  };

  return (
    <div className="min-h-full bg-slate-50/60 p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">

        {/* HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-500">
              <span>Administration</span>
              <span>/</span>
              <span className="text-slate-700">Utilisateurs</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Gestion des utilisateurs
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Gérez les comptes, les rôles et les accès à la plateforme.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus size={17} />
            Ajouter un utilisateur
          </button>
        </div>

        {error && !isModalOpen && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* KPI */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">

          <KpiCard
            label="Total utilisateurs"
            value={stats.total}
            icon={Users}
            iconClass="bg-slate-100 text-slate-700"
          />

          {roles.map((role) => (
            <KpiCard
              key={role.id}
              label={role.name}
              value={users.filter((user) => user.role === role.id).length}
              icon={getRoleIcon(role.id)}
              iconClass={roleColorClasses[role.color] ?? roleColorClasses.slate}
            />
          ))}

          <KpiCard
            label="Actifs"
            value={stats.active}
            icon={UserCheck}
            iconClass="bg-green-50 text-green-700"
          />

        </div>

        {/* TABLE CARD */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          {/* FILTER BAR */}
          <div className="border-b border-slate-200 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

              {/* SEARCH */}
              <div className="relative w-full lg:max-w-md">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Rechercher un nom, email..."
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">

                {/* ROLE FILTER */}
                <select
                  value={roleFilter}
                  onChange={(event) =>
                    setRoleFilter(event.target.value)
                  }
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 outline-none focus:border-slate-400"
                >
                  <option value="all">Tous les rôles</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>

                {/* STATUS FILTER */}
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value as
                        | 'all'
                        | UserStatus,
                    )
                  }
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 outline-none focus:border-slate-400"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actifs</option>
                  <option value="inactive">Inactifs</option>
                </select>

              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                {filteredUsers.length} utilisateur
                {filteredUsers.length > 1 ? 's' : ''} affiché
                {filteredUsers.length > 1 ? 's' : ''}
              </p>

              {(search ||
                roleFilter !== 'all' ||
                statusFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setRoleFilter('all');
                    setStatusFilter('all');
                  }}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Utilisateur
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Rôle
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Statut
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Dernière connexion
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center text-sm text-slate-500">
                      Chargement des utilisateurs...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-16 text-center"
                    >
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <Users size={22} />
                      </div>

                      <p className="mt-3 text-sm font-semibold text-slate-700">
                        Aucun utilisateur trouvé
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Modifiez vos critères de recherche.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const RoleIcon = getRoleIcon(user.role);

                    return (
                      <tr
                        key={user.id}
                        className="group transition hover:bg-slate-50/70"
                      >
                        {/* USER */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                              {getInitials(user.name)}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {user.name}
                              </p>

                              <div className="mt-0.5 flex items-center gap-1.5">
                                <Mail
                                  size={12}
                                  className="text-slate-400"
                                />

                                <p className="truncate text-xs text-slate-500">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* ROLE */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${getRoleBadgeClass(
                              user.role,
                              roles.find((role) => role.id === user.role)?.color,
                            )}`}
                          >
                            <RoleIcon size={13} />
                            {roles.find((role) => role.id === user.role)?.name ?? user.role}
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-4">
                          {user.status === 'active' ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Actif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                              Inactif
                            </span>
                          )}
                        </td>

                        {/* LAST LOGIN */}
                        <td className="px-5 py-4">
                          <span className="text-sm text-slate-500">
                            {user.lastLogin
                              ? new Date(user.lastLogin).toLocaleString('fr-FR')
                              : 'Jamais connecté'}
                          </span>
                        </td>

                        {/* ACTIONS */}
                        <td className="relative px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId === user.id
                                  ? null
                                  : user.id,
                              )
                            }
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          >
                            <MoreHorizontal size={18} />
                          </button>

                          {openMenuId === user.id && (
                            <div className="absolute right-5 top-12 z-30 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-left shadow-xl">

                              <button
                                type="button"
                                onClick={() =>
                                  openEditModal(user)
                                }
                                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                              >
                                <Pencil size={15} />
                                Modifier
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  toggleStatus(user.id)
                                }
                                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                              >
                                {user.status === 'active' ? (
                                  <>
                                    <UserX size={15} />
                                    Désactiver
                                  </>
                                ) : (
                                  <>
                                    <UserCheck size={15} />
                                    Activer
                                  </>
                                )}
                              </button>

                              <div className="my-1 border-t border-slate-100" />

                              <button
                                type="button"
                                onClick={() =>
                                  deleteUser(user.id)
                                }
                                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
                              >
                                <Trash2 size={15} />
                                Supprimer
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-5 py-3">
            <p className="text-xs text-slate-500">
              {stats.active} actif{stats.active > 1 ? 's' : ''} ·{' '}
              {stats.inactive} inactif
              {stats.inactive > 1 ? 's' : ''}
            </p>

            <p className="text-xs font-medium text-slate-400">
              {filteredUsers.length} / {users.length}
            </p>
          </div>
        </div>
      </div>

      {/* MODAL ADD / EDIT */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingUser
                    ? 'Modifier l’utilisateur'
                    : 'Ajouter un utilisateur'}
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  {editingUser
                    ? 'Modifiez les informations et les accès du compte.'
                    : 'Créez un nouveau compte utilisateur.'}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit}>
              {error && (
                <div role="alert" className="mx-6 mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              <div className="space-y-5 px-6 py-5">

                {/* NAME + PHONE */}
                <div className="grid gap-4 sm:grid-cols-2">

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Nom complet
                    </label>

                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(event) =>
                        handleFormChange(
                          'name',
                          event.target.value,
                        )
                      }
                      placeholder="Ex. Miora Randria"
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Téléphone
                    </label>

                    <input
                      type="text"
                      value={form.phone}
                      onChange={(event) =>
                        handleFormChange(
                          'phone',
                          event.target.value,
                        )
                      }
                      placeholder="+261 34..."
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>

                </div>

                {/* EMAIL */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Adresse email
                  </label>

                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(event) =>
                        handleFormChange(
                          'email',
                          event.target.value,
                        )
                      }
                      placeholder="utilisateur@efficiencywedding.mg"
                      className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />
                  </div>
                </div>

                {/* ROLE */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Rôle
                  </label>

                  {roles.length === 0 && (
                    <p role="alert" className="mb-2 text-xs text-red-600">
                      Aucun rôle disponible. Créez d’abord un rôle.
                    </p>
                  )}

                  <select
                    required
                    disabled={roles.length === 0}
                    value={form.role}
                    onChange={(event) =>
                      handleFormChange(
                        'role',
                        event.target.value,
                      )
                    }
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>

                  <p className="mt-1.5 text-xs text-slate-400">
                    {roles.find((role) => role.id === form.role)?.description ?? ''}
                  </p>
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    {editingUser
                      ? 'Nouveau mot de passe'
                      : 'Mot de passe'}
                  </label>

                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={!editingUser}
                      minLength={8}
                      value={form.password}
                      onChange={(event) =>
                        handleFormChange(
                          'password',
                          event.target.value,
                        )
                      }
                      placeholder={
                        editingUser
                          ? 'Laisser vide pour conserver'
                          : '••••••••'
                      }
                      className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-10 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((previous) => !previous)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* STATUS */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Statut du compte
                  </label>

                  <div className="grid grid-cols-2 gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        setForm((previous) => ({
                          ...previous,
                          status: 'active',
                        }))
                      }
                      className={`rounded-lg border px-3 py-2.5 text-left transition ${
                        form.status === 'active'
                          ? 'border-emerald-300 bg-emerald-50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-semibold text-slate-700">
                          Actif
                        </span>
                      </div>

                      <p className="mt-1 text-[11px] text-slate-400">
                        L'utilisateur peut se connecter.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setForm((previous) => ({
                          ...previous,
                          status: 'inactive',
                        }))
                      }
                      className={`rounded-lg border px-3 py-2.5 text-left transition ${
                        form.status === 'inactive'
                          ? 'border-slate-300 bg-slate-50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-slate-400" />
                        <span className="text-xs font-semibold text-slate-700">
                          Inactif
                        </span>
                      </div>

                      <p className="mt-1 text-[11px] text-slate-400">
                        L'accès au compte est désactivé.
                      </p>
                    </button>

                  </div>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50/60 px-6 py-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="h-9 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {isSaving
                    ? 'Enregistrement...'
                    : editingUser
                    ? 'Enregistrer les modifications'
                    : 'Créer l’utilisateur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLICK OUTSIDE MENU */}
      {openMenuId && (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-20 cursor-default"
          onClick={() => setOpenMenuId(null)}
        />
      )}
    </div>
  );
};

interface KpiCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  iconClass: string;
}

const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  icon: Icon,
  iconClass,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
};

export default UsersView;
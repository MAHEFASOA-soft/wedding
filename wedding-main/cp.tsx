//D:\1-1-15-09-2016\efficiency-wedding\back-wedding\migrations\Version20261002040709.php
<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20261002040709 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE appointment (id VARCHAR(64) NOT NULL, client_name VARCHAR(255) NOT NULL, client_phone VARCHAR(100) NOT NULL, date VARCHAR(20) NOT NULL, time VARCHAR(20) NOT NULL, purpose VARCHAR(120) NOT NULL, location VARCHAR(255) NOT NULL, status VARCHAR(40) NOT NULL, notes TEXT DEFAULT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE client (id VARCHAR(64) NOT NULL, name VARCHAR(255) NOT NULL, phone VARCHAR(100) DEFAULT NULL, email VARCHAR(180) DEFAULT NULL, address VARCHAR(255) DEFAULT NULL, notes TEXT DEFAULT NULL, events_count INT DEFAULT 0 NOT NULL, total_spent BIGINT DEFAULT 0 NOT NULL, created_at VARCHAR(20) NOT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE employee_profile (id VARCHAR(64) NOT NULL, employee_type VARCHAR(30) NOT NULL, department VARCHAR(160) NOT NULL, experience TEXT NOT NULL, skills JSON NOT NULL, hire_date VARCHAR(20) NOT NULL, availability VARCHAR(30) NOT NULL, team_ids JSON NOT NULL, assigned_event_ids JSON NOT NULL, notes TEXT NOT NULL, languages JSON NOT NULL, emergency_contact VARCHAR(80) DEFAULT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE equipment_item (id VARCHAR(64) NOT NULL, name VARCHAR(180) NOT NULL, category VARCHAR(120) NOT NULL, quantity INT NOT NULL, available_quantity INT NOT NULL, item_condition VARCHAR(40) NOT NULL, unit_price BIGINT NOT NULL, location VARCHAR(180) NOT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE event (id VARCHAR(64) NOT NULL, code VARCHAR(120) NOT NULL, name VARCHAR(255) NOT NULL, client_id VARCHAR(64) NOT NULL, client_name VARCHAR(255) NOT NULL, client_phone VARCHAR(100) DEFAULT NULL, date VARCHAR(20) NOT NULL, start_time VARCHAR(20) NOT NULL, end_time VARCHAR(20) NOT NULL, location VARCHAR(255) NOT NULL, type VARCHAR(80) NOT NULL, pack_id VARCHAR(80) DEFAULT NULL, pack_name VARCHAR(255) DEFAULT NULL, meal_type VARCHAR(30) DEFAULT NULL, included_services JSON DEFAULT NULL, guest_count INT NOT NULL, total_price BIGINT NOT NULL, amount_received BIGINT NOT NULL, status VARCHAR(40) NOT NULL, coordinator VARCHAR(255) DEFAULT NULL, assigned_servers TEXT DEFAULT NULL, notes TEXT DEFAULT NULL, image TEXT DEFAULT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE event_team (id VARCHAR(64) NOT NULL, name VARCHAR(160) NOT NULL, description TEXT NOT NULL, specialization VARCHAR(80) NOT NULL, leader_id VARCHAR(64) NOT NULL, member_ids JSON NOT NULL, assigned_event_ids JSON NOT NULL, status VARCHAR(40) NOT NULL, color VARCHAR(40) NOT NULL, notes TEXT NOT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE finance_expense (id VARCHAR(64) NOT NULL, number VARCHAR(80) NOT NULL, date VARCHAR(20) NOT NULL, category VARCHAR(80) NOT NULL, description VARCHAR(200) NOT NULL, supplier VARCHAR(180) NOT NULL, event_id VARCHAR(64) DEFAULT NULL, event_name VARCHAR(255) DEFAULT NULL, amount BIGINT NOT NULL, payment_method VARCHAR(60) NOT NULL, comment TEXT DEFAULT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE finance_receipt (id VARCHAR(64) NOT NULL, number VARCHAR(80) NOT NULL, date VARCHAR(20) NOT NULL, client VARCHAR(180) NOT NULL, event_id VARCHAR(64) DEFAULT NULL, event_name VARCHAR(255) DEFAULT NULL, description VARCHAR(160) NOT NULL, category VARCHAR(80) NOT NULL, amount BIGINT NOT NULL, payment_method VARCHAR(60) NOT NULL, comment TEXT DEFAULT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE invoice (id VARCHAR(64) NOT NULL, invoice_number VARCHAR(80) NOT NULL, client_name VARCHAR(255) NOT NULL, event_name VARCHAR(255) NOT NULL, date VARCHAR(20) NOT NULL, due_date VARCHAR(20) NOT NULL, total_amount BIGINT NOT NULL, paid_amount BIGINT NOT NULL, status VARCHAR(40) NOT NULL, items JSON DEFAULT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE place (id VARCHAR(64) NOT NULL, name VARCHAR(180) NOT NULL, type VARCHAR(40) NOT NULL, address VARCHAR(255) NOT NULL, city VARCHAR(120) NOT NULL, district VARCHAR(120) NOT NULL, latitude DOUBLE PRECISION NOT NULL, longitude DOUBLE PRECISION NOT NULL, capacity INT NOT NULL, price_per_day BIGINT NOT NULL, phone VARCHAR(80) NOT NULL, email VARCHAR(180) NOT NULL, website VARCHAR(255) NOT NULL, description TEXT NOT NULL, amenities JSON NOT NULL, main_image TEXT NOT NULL, gallery JSON NOT NULL, status VARCHAR(40) NOT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE pricing_pack (id VARCHAR(64) NOT NULL, category VARCHAR(120) NOT NULL, name VARCHAR(255) NOT NULL, description TEXT NOT NULL, badge VARCHAR(255) DEFAULT NULL, popular BOOLEAN DEFAULT false NOT NULL, base_price BIGINT NOT NULL, reference_pack_id VARCHAR(64) DEFAULT NULL, reference_text TEXT DEFAULT NULL, included_items JSON NOT NULL, pricing_grid JSON DEFAULT NULL, extra_info TEXT DEFAULT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE quote (id VARCHAR(64) NOT NULL, quote_number VARCHAR(80) NOT NULL, version INT DEFAULT 1 NOT NULL, parent_quote_id VARCHAR(64) DEFAULT NULL, event_id VARCHAR(64) DEFAULT NULL, created_at VARCHAR(40) DEFAULT \'\' NOT NULL, updated_at VARCHAR(40) DEFAULT \'\' NOT NULL, change_reason TEXT DEFAULT NULL, client_name VARCHAR(255) NOT NULL, event_name VARCHAR(255) NOT NULL, date VARCHAR(20) NOT NULL, valid_until VARCHAR(20) NOT NULL, total_amount BIGINT NOT NULL, status VARCHAR(40) NOT NULL, items JSON DEFAULT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE reservation (id VARCHAR(64) NOT NULL, code VARCHAR(120) NOT NULL, client_name VARCHAR(255) NOT NULL, event_type VARCHAR(80) NOT NULL, requested_date VARCHAR(20) NOT NULL, guest_count INT NOT NULL, estimated_budget BIGINT NOT NULL, contact_phone VARCHAR(100) NOT NULL, contact_email VARCHAR(180) NOT NULL, status VARCHAR(40) NOT NULL, notes TEXT DEFAULT NULL, created_at VARCHAR(20) NOT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE salary_record (id VARCHAR(64) NOT NULL, employee_name VARCHAR(180) NOT NULL, role VARCHAR(180) NOT NULL, month VARCHAR(80) NOT NULL, base_salary BIGINT NOT NULL, bonus BIGINT NOT NULL, deduction BIGINT NOT NULL, net_paid BIGINT NOT NULL, payment_date VARCHAR(20) NOT NULL, status VARCHAR(40) NOT NULL, comment TEXT DEFAULT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE server_staff (id VARCHAR(64) NOT NULL, name VARCHAR(120) NOT NULL, phone VARCHAR(60) NOT NULL, role VARCHAR(40) NOT NULL, status VARCHAR(40) NOT NULL, hourly_rate BIGINT NOT NULL, assigned_events_count INT NOT NULL, rating DOUBLE PRECISION NOT NULL, daily_rate BIGINT DEFAULT NULL, experience VARCHAR(80) DEFAULT NULL, avatar TEXT DEFAULT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE service (id VARCHAR(64) NOT NULL, name VARCHAR(255) NOT NULL, category VARCHAR(120) NOT NULL, description TEXT NOT NULL, unit_price BIGINT NOT NULL, unit VARCHAR(80) NOT NULL, is_popular BOOLEAN DEFAULT NULL, image TEXT DEFAULT NULL, features JSON DEFAULT NULL, duration VARCHAR(60) DEFAULT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE task_item (id VARCHAR(64) NOT NULL, event_id VARCHAR(64) DEFAULT NULL, event_name VARCHAR(255) DEFAULT NULL, title VARCHAR(255) NOT NULL, description TEXT DEFAULT NULL, assigned_to VARCHAR(120) NOT NULL, due_date VARCHAR(20) NOT NULL, priority VARCHAR(40) NOT NULL, status VARCHAR(40) NOT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE team_member (id VARCHAR(64) NOT NULL, name VARCHAR(120) NOT NULL, role VARCHAR(180) NOT NULL, department VARCHAR(160) NOT NULL, phone VARCHAR(80) NOT NULL, email VARCHAR(160) NOT NULL, status VARCHAR(40) NOT NULL, avatar TEXT DEFAULT NULL, monthly_salary BIGINT DEFAULT NULL, PRIMARY KEY (id))');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE appointment');
        $this->addSql('DROP TABLE client');
        $this->addSql('DROP TABLE employee_profile');
        $this->addSql('DROP TABLE equipment_item');
        $this->addSql('DROP TABLE event');
        $this->addSql('DROP TABLE event_team');
        $this->addSql('DROP TABLE finance_expense');
        $this->addSql('DROP TABLE finance_receipt');
        $this->addSql('DROP TABLE invoice');
        $this->addSql('DROP TABLE place');
        $this->addSql('DROP TABLE pricing_pack');
        $this->addSql('DROP TABLE quote');
        $this->addSql('DROP TABLE reservation');
        $this->addSql('DROP TABLE salary_record');
        $this->addSql('DROP TABLE server_staff');
        $this->addSql('DROP TABLE service');
        $this->addSql('DROP TABLE task_item');
        $this->addSql('DROP TABLE team_member');
    }
}



//D:\1-1-15-09-2016\efficiency-wedding\wedding-main\src\components\users\UsersView.tsx
import React, { useMemo, useState } from 'react';
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

type UserRole = 'admin' | 'manager' | 'finance' | 'staff';

type UserStatus = 'active' | 'inactive';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
  phone?: string;
}

interface UserForm {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  password: string;
  status: UserStatus;
}

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrateur',
  manager: 'Manager événementiel',
  finance: 'Responsable financier',
  staff: 'Personnel',
};

const roleDescriptions: Record<UserRole, string> = {
  admin: 'Accès complet à la plateforme',
  manager: 'Gestion des événements et opérations',
  finance: 'Gestion financière et facturation',
  staff: 'Accès aux tâches et événements assignés',
};

const initialUsers: UserItem[] = [
  {
    id: 'USR-001',
    name: 'Miora Randria',
    email: 'miora@efficiencywedding.mg',
    role: 'admin',
    status: 'active',
    lastLogin: "Aujourd'hui, 09:42",
    phone: '+261 34 00 000 01',
  },
  {
    id: 'USR-002',
    name: 'Jean Rakoto',
    email: 'jean@efficiencywedding.mg',
    role: 'manager',
    status: 'active',
    lastLogin: 'Hier, 16:20',
    phone: '+261 34 00 000 02',
  },
  {
    id: 'USR-003',
    name: 'Sarah Andria',
    email: 'sarah@efficiencywedding.mg',
    role: 'finance',
    status: 'active',
    lastLogin: '20 sept. 2026, 14:15',
    phone: '+261 34 00 000 03',
  },
  {
    id: 'USR-004',
    name: 'Paul Rabe',
    email: 'paul@efficiencywedding.mg',
    role: 'staff',
    status: 'active',
    lastLogin: '19 sept. 2026, 08:30',
    phone: '+261 34 00 000 04',
  },
  {
    id: 'USR-005',
    name: 'Hery Rakoto',
    email: 'hery@efficiencywedding.mg',
    role: 'manager',
    status: 'inactive',
    lastLogin: '15 sept. 2026, 11:05',
    phone: '+261 34 00 000 05',
  },
  {
    id: 'USR-006',
    name: 'Nadia Andriam',
    email: 'nadia@efficiencywedding.mg',
    role: 'staff',
    status: 'active',
    lastLogin: '18 sept. 2026, 17:40',
    phone: '+261 34 00 000 06',
  },
];

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

const getRoleBadgeClass = (role: UserRole) => {
  switch (role) {
    case 'admin':
      return 'bg-slate-100 text-slate-700 border-slate-200';

    case 'manager':
      return 'bg-amber-50 text-amber-700 border-amber-200';

    case 'finance':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';

    case 'staff':
      return 'bg-blue-50 text-blue-700 border-blue-200';

    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const getRoleIcon = (role: UserRole) => {
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
  const [users, setUsers] = useState<UserItem[]>(initialUsers);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>(
    'all',
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  const [form, setForm] = useState<UserForm>(emptyForm);
  const [showPassword, setShowPassword] = useState(false);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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
      admin: users.filter((user) => user.role === 'admin').length,
      manager: users.filter((user) => user.role === 'manager').length,
      finance: users.filter((user) => user.role === 'finance').length,
      staff: users.filter((user) => user.role === 'staff').length,
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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      return;
    }

    if (editingUser) {
      setUsers((previous) =>
        previous.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                role: form.role,
                status: form.status,
              }
            : user,
        ),
      );
    } else {
      const newUser: UserItem = {
        id: `USR-${String(users.length + 1).padStart(3, '0')}`,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role,
        status: form.status,
        lastLogin: 'Jamais connecté',
      };

      setUsers((previous) => [newUser, ...previous]);
    }

    closeModal();
  };

  const toggleStatus = (userId: string) => {
    setUsers((previous) =>
      previous.map((user) =>
        user.id === userId
          ? {
              ...user,
              status:
                user.status === 'active' ? 'inactive' : 'active',
            }
          : user,
      ),
    );

    setOpenMenuId(null);
  };

  const deleteUser = (userId: string) => {
    const user = users.find((item) => item.id === userId);

    if (!user) return;

    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer l'utilisateur "${user.name}" ?`,
    );

    if (!confirmed) return;

    setUsers((previous) =>
      previous.filter((item) => item.id !== userId),
    );

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

        {/* KPI */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">

          <KpiCard
            label="Total utilisateurs"
            value={stats.total}
            icon={Users}
            iconClass="bg-slate-100 text-slate-700"
          />

          <KpiCard
            label="Administrateurs"
            value={stats.admin}
            icon={ShieldCheck}
            iconClass="bg-slate-100 text-slate-700"
          />

          <KpiCard
            label="Managers"
            value={stats.manager}
            icon={BriefcaseBusiness}
            iconClass="bg-amber-50 text-amber-700"
          />

          <KpiCard
            label="Finance"
            value={stats.finance}
            icon={WalletCards}
            iconClass="bg-emerald-50 text-emerald-700"
          />

          <KpiCard
            label="Personnel"
            value={stats.staff}
            icon={UserRound}
            iconClass="bg-blue-50 text-blue-700"
          />

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
                    setRoleFilter(
                      event.target.value as 'all' | UserRole,
                    )
                  }
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 outline-none focus:border-slate-400"
                >
                  <option value="all">Tous les rôles</option>
                  <option value="admin">Administrateur</option>
                  <option value="manager">
                    Manager événementiel
                  </option>
                  <option value="finance">
                    Responsable financier
                  </option>
                  <option value="staff">Personnel</option>
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
                {filteredUsers.length === 0 ? (
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
                            )}`}
                          >
                            <RoleIcon size={13} />
                            {roleLabels[user.role]}
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
                            {user.lastLogin}
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

                  <select
                    value={form.role}
                    onChange={(event) =>
                      handleFormChange(
                        'role',
                        event.target.value,
                      )
                    }
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  >
                    <option value="admin">
                      Administrateur
                    </option>

                    <option value="manager">
                      Manager événementiel
                    </option>

                    <option value="finance">
                      Responsable financier
                    </option>

                    <option value="staff">
                      Personnel
                    </option>
                  </select>

                  <p className="mt-1.5 text-xs text-slate-400">
                    {roleDescriptions[form.role]}
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
                  className="h-9 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {editingUser
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


//D:\1-1-15-09-2016\efficiency-wedding\wedding-main\.env
# Frontend environment variables
VITE_API_BASE_URL=http://127.0.0.1:8000/api

# Optional: public app URL for generated links
APP_URL=http://localhost:5173

//D:\1-1-15-09-2016\efficiency-wedding\wedding-main\src\lib\api.ts

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api').replace(/\/+$/, '');

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

async function request<T>(path: string, method: HttpMethod = 'GET', body?: unknown): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (response.status === 204) {
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const responseText = await response.text();
    return responseText ? (JSON.parse(responseText) as T) : null;
  } catch (error) {
    console.warn(`API unavailable for ${path} (${method}):`, error);
    return null;
  }
}

export const api = {
  get: <T,>(path: string) => request<T>(path, 'GET'),
  post: <T,>(path: string, body: unknown) => request<T>(path, 'POST', body),
  put: <T,>(path: string, body: unknown) => request<T>(path, 'PUT', body),
  patch: <T,>(path: string, body: unknown) => request<T>(path, 'PATCH', body),
  del: <T,>(path: string) => request<T>(path, 'DELETE'),
  upload: async (file: File): Promise<string | null> => {
    const body = new FormData();
    body.append('file', file);
    try {
      const response = await fetch(`${API_BASE_URL}/uploads`, { method: 'POST', body });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      const result = (await response.json()) as { url: string };
      return `${API_BASE_URL.replace(/\/api$/, '')}${result.url}`;
    } catch (error) {
      console.warn('Image upload failed:', error);
      return null;
    }
  },
};

import React, { useMemo, useState } from 'react';
import {
  Award,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Star,
  Users,
  UserRound,
  Trash2,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import type { EmployeeProfile, EventTeam } from '../../types';

type EmployeeRecord = {
  id: string;
  name: string;
  role: string;
  department: string;
  phone: string;
  email?: string;
  status: string;
  type: 'Permanent' | 'Service';
  avatar?: string;
};

type ViewTab = 'employees' | 'teams' | 'assignments';

type EmployeeFilter =
  | 'all'
  | 'permanent'
  | 'service'
  | 'assigned'
  | 'available';

const roleLabels: Record<string, string> = {
  'Maître d’hôtel': 'Maître d’hôtel',
  'Chef de rang': 'Chef de rang',
  Serveur: 'Serveur',
  Barman: 'Barman',
  'Hôtesse d’accueil': 'Hôtesse d’accueil',
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const formatDate = (date?: string) => {
  if (!date) return '—';

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
};

export const TeamView: React.FC<{
  defaultSubTab?: 'team' | 'servers';
}> = ({ defaultSubTab = 'team' }) => {
  const {
    team, servers, addTeamMember, addServer, updateTeamMember, updateServer,
    deleteTeamMember, deleteServer, events, eventTeams, addEventTeam,
    updateEventTeam, deleteEventTeam, employeeProfiles, saveEmployeeProfile,
    teamDataLoading, teamDataLoadError,
  } = useApp();

  const [activeTab, setActiveTab] = useState<ViewTab>('employees');

  const [employeeFilter, setEmployeeFilter] =
    useState<EmployeeFilter>('all');

  const [search, setSearch] = useState('');

  const [selectedEmployeeId, setSelectedEmployeeId] =
    useState<string | null>(null);

  const [selectedTeamId, setSelectedTeamId] =
    useState<string | null>(null);

  const [isEmployeeModalOpen, setIsEmployeeModalOpen] =
    useState(false);

  const [isTeamModalOpen, setIsTeamModalOpen] =
    useState(false);

  const [employeeType, setEmployeeType] =
    useState<'team' | 'server'>(
      defaultSubTab === 'servers' ? 'server' : 'team'
    );

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('+261 ');
  const [dailyRate, setDailyRate] = useState(40000);
  const [avatar, setAvatar] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeRecord | null>(null);
  const [profileEmployeeType, setProfileEmployeeType] = useState<EmployeeProfile['employeeType']>('Permanent');
  const [department, setDepartment] = useState('Wedding Planning');
  const [experience, setExperience] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [hireDate, setHireDate] = useState(new Date().toISOString().slice(0, 10));
  const [availability, setAvailability] = useState<EmployeeProfile['availability']>('Disponible');
  const [languagesText, setLanguagesText] = useState('Français, Malgache');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [profileNotes, setProfileNotes] = useState('');

  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [teamSpecialization, setTeamSpecialization] = useState('Planning');
  const [teamLeaderId, setTeamLeaderId] = useState('');
  const [teamMemberIds, setTeamMemberIds] = useState<string[]>([]);
  const [teamAssignedEventIds, setTeamAssignedEventIds] = useState<string[]>([]);
  const [editingTeam, setEditingTeam] = useState<EventTeam | null>(null);

  /*
   * ---------------------------------------------------------
   * Tous les personnels
   * ---------------------------------------------------------
   */

  const allEmployees = useMemo(
    () => [
      ...team.map((member) => ({
        id: member.id,
        name: member.name,
        role: member.role,
        department: member.department,
        phone: member.phone,
        email: member.email,
        status: member.status,
        type: 'Permanent' as const,
        avatar: member.avatar,
      })),

      ...servers.map((server) => ({
        id: server.id,
        name: server.name,
        role: roleLabels[server.role] ?? server.role,
        department:
          server.role === 'Barman'
            ? 'Cocktail & Bar'
            : 'Service',
        phone: server.phone,
        email: undefined,
        status: server.status,
        type: 'Service' as const,
        avatar: server.avatar,
      })),
    ],
    [team, servers]
  );

  const profileById = useMemo(
    () => Object.fromEntries(employeeProfiles.map((profile) => [profile.id, profile])),
    [employeeProfiles]
  );

  /*
   * ---------------------------------------------------------
   * Événements
   * ---------------------------------------------------------
   */

  const eventById = useMemo(
    () =>
      Object.fromEntries(
        events.map((event) => [event.id, event])
      ),
    [events]
  );

  /*
   * ---------------------------------------------------------
   * Fonction permettant de récupérer la disponibilité
   * ---------------------------------------------------------
   */

  const getEmployeeAvailability = (
    employee: (typeof allEmployees)[number]
  ) => {
    const profile = profileById[employee.id];
    if (profile) return profile.availability;
    if (employee.status === 'Disponible' || employee.status === 'Actif') return 'Disponible';
    if (employee.status === 'Assigné' || employee.status === 'En mission') return 'Affecté';
    return employee.status;
  };

  /*
   * ---------------------------------------------------------
   * Filtrage des personnels
   * ---------------------------------------------------------
   */

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();

    return allEmployees.filter((employee) => {
      const availability = getEmployeeAvailability(employee);

      let matchesFilter = true;

      switch (employeeFilter) {
        case 'permanent':
          matchesFilter = employee.type === 'Permanent';
          break;

        case 'service':
          matchesFilter = employee.type === 'Service';
          break;

        case 'assigned':
          matchesFilter = availability === 'Affecté';
          break;

        case 'available':
          matchesFilter = availability === 'Disponible';
          break;

        case 'all':
        default:
          matchesFilter = true;
      }

      const matchesSearch =
        !q ||
        employee.name.toLowerCase().includes(q) ||
        employee.role.toLowerCase().includes(q) ||
        employee.department.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [
    allEmployees,
    employeeFilter,
    search,
    profileById,
  ]);

  /*
   * ---------------------------------------------------------
   * Statistiques
   * ---------------------------------------------------------
   */

  const stats = useMemo(() => {
    const assigned = allEmployees.filter(
      (employee) =>
        getEmployeeAvailability(employee) === 'Affecté'
    ).length;

    const available = allEmployees.filter(
      (employee) =>
        getEmployeeAvailability(employee) === 'Disponible'
    ).length;

    return {
      total: allEmployees.length,
      permanent: team.length,
      service: servers.length,
      teams: eventTeams.length,
      assigned,
      available,
    };
  }, [
    allEmployees,
    team.length,
    servers.length,
    eventTeams.length,
    profileById,
  ]);

  /*
   * ---------------------------------------------------------
   * Sélections
   * ---------------------------------------------------------
   */

  const selectedEmployee = selectedEmployeeId
    ? allEmployees.find(
        (employee) => employee.id === selectedEmployeeId
      )
    : undefined;

  const selectedTeam = selectedTeamId
    ? eventTeams.find((item) => item.id === selectedTeamId)
    : undefined;
  const selectedEmployeeProfile = selectedEmployee
    ? profileById[selectedEmployee.id]
    : undefined;
  const selectedEmployeeEventIds = selectedEmployee
    ? selectedEmployeeProfile?.assignedEventIds ?? [...new Set(eventTeams.filter((item) => item.memberIds.includes(selectedEmployee.id)).flatMap((item) => item.assignedEventIds))]
    : [];

  /*
   * ---------------------------------------------------------
   * Ouvrir le formulaire d'ajout
   * ---------------------------------------------------------
   */

  const openEmployeeModal = (employee?: EmployeeRecord) => {
    const profile = employee ? profileById[employee.id] : undefined;
    setEditingEmployee(employee ?? null);
    setEmployeeType(employee?.type === 'Service' || (!employee && defaultSubTab === 'servers') ? 'server' : 'team');
    setName(employee?.name ?? '');
    setRole(employee?.role ?? '');
    setPhone(employee?.phone ?? '+261 ');
    setAvatar(employee?.avatar ?? '');
    setDailyRate(employee
      ? team.find((member) => member.id === employee.id)?.monthlySalary ?? servers.find((server) => server.id === employee.id)?.dailyRate ?? 40000
      : 40000);
    setProfileEmployeeType(profile?.employeeType ?? (employee?.type === 'Service' || defaultSubTab === 'servers' ? 'Vacation' : 'Permanent'));
    setDepartment(profile?.department ?? employee?.department ?? 'Wedding Planning');
    setExperience(profile?.experience ?? '');
    setSkillsText(profile?.skills.join(', ') ?? '');
    setHireDate(profile?.hireDate ?? new Date().toISOString().slice(0, 10));
    setAvailability(profile?.availability ?? 'Disponible');
    setLanguagesText(profile?.languages.join(', ') ?? 'Français, Malgache');
    setEmergencyContact(profile?.emergencyContact ?? '');
    setProfileNotes(profile?.notes ?? '');
    setIsEmployeeModalOpen(true);
  };

  /*
   * ---------------------------------------------------------
   * Cliquer sur un KPI
   * ---------------------------------------------------------
   */

  const handleKpiClick = (
    type:
      | 'all'
      | 'permanent'
      | 'service'
      | 'teams'
      | 'assigned'
      | 'available'
  ) => {
    if (type === 'teams') {
      setActiveTab('teams');
      setEmployeeFilter('all');
      setSearch('');
      return;
    }

    setActiveTab('employees');
    setEmployeeFilter(type);
    setSearch('');
  };

  /*
   * ---------------------------------------------------------
   * Fermer modal employé
   * ---------------------------------------------------------
   */

  const closeEmployeeModal = () => {
    setIsEmployeeModalOpen(false);
    setName('');
    setRole('');
    setPhone('+261 ');
    setDailyRate(40000);
    setAvatar('');
    setEditingEmployee(null);
    setEmployeeType('team');
    setProfileEmployeeType('Permanent');
    setDepartment('Wedding Planning');
    setExperience('');
    setSkillsText('');
    setHireDate(new Date().toISOString().slice(0, 10));
    setAvailability('Disponible');
    setLanguagesText('Français, Malgache');
    setEmergencyContact('');
    setProfileNotes('');
  };

  /*
   * ---------------------------------------------------------
   * Création personnel
   * ---------------------------------------------------------
   */

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    let saved = false;
    let employeeId = editingEmployee?.id ?? '';
    if (editingEmployee?.type === 'Permanent') {
      const existing = team.find((member) => member.id === editingEmployee.id);
      if (existing) saved = await updateTeamMember({
        ...existing, name: name.trim(), role: role.trim() || existing.role,
        phone: phone.trim(), department: department.trim(), avatar, monthlySalary: dailyRate,
      });
    } else if (editingEmployee?.type === 'Service') {
      const existing = servers.find((server) => server.id === editingEmployee.id);
      if (existing) saved = await updateServer({
        ...existing, name: name.trim(), role: (role.trim() || existing.role) as typeof existing.role,
        phone: phone.trim(), avatar, dailyRate,
      });
    } else if (employeeType === 'team') {
      const created = await addTeamMember({
        name: name.trim(), role: role.trim() || 'Coordinateur adjoint', phone: phone.trim(),
        email: `${name.toLowerCase().trim().replace(/\s+/g, '.')}@efficiencywedding.mg`,
        department: department.trim(), status: 'Actif', avatar, monthlySalary: dailyRate,
      });
      saved = Boolean(created);
      employeeId = created?.id ?? '';
    } else {
      const created = await addServer({
        name: name.trim(),
        phone: phone.trim(),
        role: (role.trim() || 'Serveur') as 'Maître d’hôtel' | 'Chef de rang' | 'Serveur' | 'Barman' | 'Hôtesse d’accueil',
        status: 'Disponible',
        hourlyRate: 0,
        assignedEventsCount: 0,
        rating: 0,
        dailyRate: Number(dailyRate) || 40000,
        experience:
          '2 ans en hôtellerie / réceptions événementielles',
        avatar,
      });
      saved = Boolean(created);
      employeeId = created?.id ?? '';
    }

    if (!saved) {
      window.alert('Le personnel n’a pas pu être enregistré. Vérifiez la connexion au serveur.');
      return;
    }
    const previousProfile = profileById[employeeId];
    const profileSaved = await saveEmployeeProfile({
      id: employeeId,
      employeeType: profileEmployeeType,
      department: department.trim(),
      experience: experience.trim(),
      skills: skillsText.split(',').map((item) => item.trim()).filter(Boolean),
      hireDate,
      availability,
      teamIds: previousProfile?.teamIds ?? [],
      assignedEventIds: previousProfile?.assignedEventIds ?? [],
      notes: profileNotes.trim(),
      languages: languagesText.split(',').map((item) => item.trim()).filter(Boolean),
      emergencyContact: emergencyContact.trim() || undefined,
    });
    if (!profileSaved) {
      window.alert('Le personnel est enregistré, mais son profil RH n’a pas pu être sauvegardé. Réessayez.');
      return;
    }
    closeEmployeeModal();
  };

  const removeEmployee = async (employee: EmployeeRecord) => {
    if (!window.confirm(`Supprimer ${employee.name} ?`)) return;
    const removed = employee.type === 'Permanent'
      ? await deleteTeamMember(employee.id)
      : await deleteServer(employee.id);
    if (!removed) {
      window.alert('La suppression a échoué.');
      return;
    }
    setSelectedEmployeeId(null);
  };

  const uploadAvatar = async (file?: File) => {
    if (!file) return;
    setAvatarUploading(true);
    const url = await api.upload(file);
    setAvatarUploading(false);
    if (url) setAvatar(url);
    else window.alert('La photo n’a pas pu être envoyée. Vérifiez son format et sa taille.');
  };

  /*
   * ---------------------------------------------------------
   * Création équipe
   * ---------------------------------------------------------
   */

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamName.trim()) return;

    const teamData = {
      name: teamName.trim(),
      description: teamDescription.trim() || 'Nouvelle équipe opérationnelle.',
      specialization: teamSpecialization,
      leaderId: teamLeaderId,
      memberIds: teamMemberIds,
      assignedEventIds: teamAssignedEventIds,
      status: editingTeam?.status ?? 'Disponible',
      color: editingTeam?.color ?? 'amber',
      notes: editingTeam?.notes ?? 'Équipe gérée depuis le module Personnel & Équipes.',
    };
    const saved = editingTeam
      ? await updateEventTeam({ ...editingTeam, ...teamData })
      : await addEventTeam(teamData);
    if (!saved) {
      window.alert('L’équipe n’a pas pu être enregistrée.');
      return;
    }

    setTeamName('');
    setTeamDescription('');
    setTeamSpecialization('Planning');
    setTeamLeaderId('');
    setTeamMemberIds([]);
    setTeamAssignedEventIds([]);
    setEditingTeam(null);
    setIsTeamModalOpen(false);
  };

  const openTeamModal = (item?: EventTeam) => {
    setEditingTeam(item ?? null);
    setTeamName(item?.name ?? '');
    setTeamDescription(item?.description ?? '');
    setTeamSpecialization(item?.specialization ?? 'Planning');
    setTeamLeaderId(item?.leaderId ?? '');
    setTeamMemberIds(item?.memberIds ?? []);
    setTeamAssignedEventIds(item?.assignedEventIds ?? []);
    setIsTeamModalOpen(true);
  };

  const removeTeam = async (item: EventTeam) => {
    if (!window.confirm(`Supprimer l’équipe « ${item.name} » ?`)) return;
    if (!await deleteEventTeam(item.id)) {
      window.alert('La suppression de l’équipe a échoué.');
      return;
    }
    setSelectedTeamId(null);
  };

  /*
   * ---------------------------------------------------------
   * Render
   * ---------------------------------------------------------
   */

  return (
    <div className="space-y-5 pb-12">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <div className="flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Users className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                  Personnel & Équipes
                </h2>

                <p className="text-xs text-slate-500">
                  Employés, brigades, disponibilités et affectations aux événements.
                </p>
              </div>

            </div>
          </div>

          {/* UN SEUL BOUTON */}

          <button
            onClick={openEmployeeModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Ajouter un personnel
          </button>

        </div>
      </div>

      {teamDataLoading && <p role="status" className="text-xs text-slate-500">Chargement du personnel et des équipes…</p>}
      {teamDataLoadError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{teamDataLoadError}</p>}

      {/* =====================================================
          KPI
      ===================================================== */}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">

        {[
          ['Personnel', stats.total, Users, 'all'],
          ['Permanents', stats.permanent, UserRound, 'permanent'],
          ['Service', stats.service, Award, 'service'],
          ['Équipes', stats.teams, ShieldCheck, 'teams'],
          ['Affectés', stats.assigned, CheckCircle2, 'assigned'],
          ['Disponibles', stats.available, Clock3, 'available'],
        ].map(
          ([label, value, Icon, filter]) => {
            const StatIcon = Icon as React.ElementType;

            const isActive =
              filter === 'teams'
                ? activeTab === 'teams'
                : activeTab === 'employees' &&
                  employeeFilter === filter;

            return (
              <button
                key={String(label)}
                type="button"
                onClick={() =>
                  handleKpiClick(
                    filter as
                      | 'all'
                      | 'permanent'
                      | 'service'
                      | 'teams'
                      | 'assigned'
                      | 'available'
                  )
                }
                className={`group rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md ${
                  isActive
                    ? 'border-amber-400 bg-amber-50 ring-1 ring-amber-300'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="mb-2 flex items-center justify-between">

                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wide ${
                      isActive
                        ? 'text-amber-700'
                        : 'text-slate-500'
                    }`}
                  >
                    {label}
                  </span>

                  <StatIcon
                    className={`h-4 w-4 transition ${
                      isActive
                        ? 'text-amber-600'
                        : 'text-amber-500 group-hover:scale-110'
                    }`}
                  />

                </div>

                <div
                  className={`text-2xl font-black ${
                    isActive
                      ? 'text-amber-800'
                      : 'text-slate-900'
                  }`}
                >
                  {value as number}
                </div>

                <p className="mt-1 text-[10px] text-slate-400">
                  Cliquer pour afficher
                </p>
              </button>
            );
          }
        )}

      </div>

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">

        {[
          ['employees', 'Tous les employés'],
          ['teams', 'Équipes'],
          ['assignments', 'Affectations'],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() =>
              setActiveTab(value as ViewTab)
            }
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === value
                ? 'bg-slate-900 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}

      </div>

      {/* =====================================================
          EMPLOYEES
      ===================================================== */}

      {activeTab === 'employees' && (
        <section className="space-y-4">

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex flex-wrap gap-2">

              {[
                ['all', 'Tous'],
                ['permanent', 'Permanents'],
                ['service', 'Service & Extras'],
                ['assigned', 'Affectés'],
                ['available', 'Disponibles'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() =>
                    setEmployeeFilter(
                      value as EmployeeFilter
                    )
                  }
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    employeeFilter === value
                      ? 'bg-amber-100 text-amber-800'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {label}
                </button>
              ))}

            </div>

            <div className="relative w-full sm:w-72">

              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Rechercher un employé..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs outline-none focus:border-amber-400 focus:bg-white"
              />

            </div>

          </div>

          {/* Nombre de résultats */}

          <div className="flex items-center justify-between px-1">

            <p className="text-xs text-slate-500">
              <strong className="text-slate-800">
                {filteredEmployees.length}
              </strong>{' '}
              personnel
              {filteredEmployees.length > 1 ? 's' : ''}
              {' '}affiché
              {filteredEmployees.length > 1 ? 's' : ''}
            </p>

            {employeeFilter !== 'all' && (
              <button
                onClick={() =>
                  setEmployeeFilter('all')
                }
                className="text-xs font-semibold text-amber-700 hover:text-amber-800"
              >
                Réinitialiser le filtre
              </button>
            )}

          </div>

          {/* Cartes employés */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

            {filteredEmployees.map((employee) => {
              const eventCount = profileById[employee.id]?.assignedEventIds.length
                ?? (employee.type === 'Service'
                  ? servers.find((server) => server.id === employee.id)?.assignedEventsCount ?? 0
                  : new Set(eventTeams.filter((item) => item.memberIds.includes(employee.id)).flatMap((item) => item.assignedEventIds)).size);

              const availability =
                getEmployeeAvailability(employee);

              return (
                <button
                  key={employee.id}
                  onClick={() =>
                    setSelectedEmployeeId(employee.id)
                  }
                  className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div className="flex min-w-0 items-center gap-3">

                      {employee.avatar ? (
                        <img
                          src={employee.avatar}
                          alt={employee.name}
                          className="h-12 w-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-black text-white">
                          {getInitials(employee.name)}
                        </div>
                      )}

                      <div className="min-w-0">

                        <h3 className="truncate text-sm font-bold text-slate-900">
                          {employee.name}
                        </h3>

                        <p className="truncate text-xs font-semibold text-amber-700">
                          {employee.role}
                        </p>

                      </div>

                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${
                        availability === 'Disponible'
                          ? 'bg-emerald-50 text-emerald-700'
                          : availability === 'Affecté'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {availability}
                    </span>

                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">

                    <div className="rounded-xl bg-slate-50 p-2.5">
                      <p className="text-[10px] text-slate-400">
                        Département
                      </p>

                      <p className="mt-0.5 truncate text-xs font-semibold text-slate-700">
                        {employee.department}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-2.5">
                      <p className="text-[10px] text-slate-400">
                        Événements
                      </p>

                      <p className="mt-0.5 text-xs font-semibold text-slate-700">
                        {eventCount}
                      </p>
                    </div>

                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">

                    <span className="text-[11px] text-slate-400">
                      {employee.type === 'Permanent'
                        ? 'Équipe permanente'
                        : 'Vacation / Extra'}
                    </span>

                    <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-amber-500" />

                  </div>

                </button>
              );
            })}

          </div>

          {filteredEmployees.length === 0 && !teamDataLoading && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">

              <Users className="mx-auto h-8 w-8 text-slate-300" />

              <p className="mt-3 text-sm font-bold text-slate-700">
                Aucun personnel trouvé
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Aucun personnel ne correspond au filtre sélectionné.
              </p>

            </div>
          )}

        </section>
      )}

      {/* =====================================================
          TEAMS
      ===================================================== */}

      {activeTab === 'teams' && (
        <section className="space-y-4">

          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Équipes opérationnelles
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                Regroupez les collaborateurs par fonction et affectez-les aux événements.
              </p>
            </div>

            <button
              onClick={() => openTeamModal()}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
            >
              <Plus className="h-4 w-4" />
              Nouvelle équipe
            </button>

          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

            {eventTeams.map((item) => {
              const leader = allEmployees.find(
                (employee) =>
                  employee.id === item.leaderId
              );

              return (
                <button
                  key={item.id}
                  onClick={() =>
                    setSelectedTeamId(item.id)
                  }
                  className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-amber-300 hover:shadow-md"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div>

                      <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase text-amber-700">
                        {item.specialization}
                      </span>

                      <h3 className="mt-3 text-sm font-bold text-slate-900">
                        {item.name}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {item.description}
                      </p>

                    </div>

                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />

                  </div>

                  <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                      {leader
                        ? getInitials(leader.name)
                        : '?'}
                    </div>

                    <div>

                      <p className="text-[10px] text-slate-400">
                        Responsable
                      </p>

                      <p className="text-xs font-bold text-slate-800">
                        {leader?.name ?? 'Non défini'}
                      </p>

                    </div>

                  </div>

                  <div className="mt-3 flex justify-between text-[11px] text-slate-500">
                    <span>
                      {item.memberIds.length} membres
                    </span>

                    <span>
                      {item.assignedEventIds.length} événements
                    </span>
                  </div>

                </button>
              );
            })}

          </div>

        </section>
      )}

      {/* =====================================================
          ASSIGNMENTS
      ===================================================== */}

      {activeTab === 'assignments' && (
        <section className="space-y-3">

          {events.map((event) => {
            const assignedTeams = eventTeams.filter((item) => item.assignedEventIds.includes(event.id));

            return (
              <div
                key={event.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                  <div>

                    <div className="flex items-center gap-2">

                      <CalendarDays className="h-4 w-4 text-amber-500" />

                      <h3 className="text-sm font-bold text-slate-900">
                        {event.name}
                      </h3>

                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(event.date)} ·{' '}
                      {event.guestCount} invités ·{' '}
                      {event.location}
                    </p>

                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-600">
                    {assignedTeams.length} équipe
                    {assignedTeams.length > 1 ? 's' : ''}
                  </span>

                </div>

                <div className="mt-4 flex flex-wrap gap-2">

                  {assignedTeams.map((item) => (
                    <button
                      key={item.id}
                      onClick={() =>
                        setSelectedTeamId(item.id)
                      }
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left hover:border-amber-300 hover:bg-amber-50"
                    >

                      <p className="text-xs font-bold text-slate-800">
                        {item.name}
                      </p>

                      <p className="mt-0.5 text-[10px] text-slate-500">
                        {item.memberIds.length} membres ·{' '}
                        {item.specialization}
                      </p>

                    </button>
                  ))}

                </div>

              </div>
            );
          })}

        </section>
      )}

      {/* =====================================================
          EMPLOYEE DETAIL MODAL
      ===================================================== */}

      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="flex items-start justify-between border-b border-slate-200 p-5">

              <div className="flex items-center gap-3">

                {selectedEmployee.avatar ? (
                  <img src={selectedEmployee.avatar} alt={selectedEmployee.name} className="h-12 w-12 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white">
                    {getInitials(selectedEmployee.name)}
                  </div>
                )}

                <div>

                  <h3 className="text-base font-bold text-slate-900">
                    {selectedEmployee.name}
                  </h3>

                  <p className="text-xs font-semibold text-amber-700">
                    {selectedEmployee.role}
                  </p>

                </div>

              </div>

              <div className="flex gap-1">
                <button type="button" onClick={() => openEmployeeModal(selectedEmployee)} aria-label="Modifier le personnel" className="rounded-lg p-2 hover:bg-slate-100"><Pencil className="h-4 w-4" /></button>
                <button type="button" onClick={() => void removeEmployee(selectedEmployee)} aria-label="Supprimer le personnel" className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                <button type="button" onClick={() => setSelectedEmployeeId(null)} aria-label="Fermer" className="rounded-lg p-2 hover:bg-slate-100"><X className="h-4 w-4" /></button>
              </div>

            </div>

            <div className="grid gap-4 p-5 md:grid-cols-2">

              <div className="space-y-2 rounded-xl bg-slate-50 p-4">

                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {selectedEmployee.phone}
                </div>

                {selectedEmployee.email && (
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {selectedEmployee.email}
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {selectedEmployee.department}
                </div>

              </div>

              {selectedEmployeeProfile ? (
                <>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-[10px] uppercase tracking-wide text-slate-400">Expérience</p>
                    <p className="mt-2 text-xs leading-5 font-medium text-slate-700">
                      {selectedEmployeeProfile.experience || 'Non renseignée'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-[10px] uppercase tracking-wide text-slate-400">Compétences</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selectedEmployeeProfile.skills.map((skill) => (
                        <span key={skill} className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-800">{skill}</span>
                      ))}
                      {selectedEmployeeProfile.skills.length === 0 && <span className="text-xs text-slate-500">Aucune compétence renseignée.</span>}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-[10px] uppercase tracking-wide text-slate-400">Informations RH</p>
                    <div className="mt-2 space-y-1 text-xs text-slate-600">
                      <p>Type : <strong>{selectedEmployeeProfile.employeeType}</strong></p>
                      <p>Depuis : <strong>{formatDate(selectedEmployeeProfile.hireDate)}</strong></p>
                      <p>Disponibilité : <strong>{selectedEmployeeProfile.availability}</strong></p>
                      <p>Langues : <strong>{selectedEmployeeProfile.languages.join(', ') || 'Non renseignées'}</strong></p>
                      {selectedEmployeeProfile.emergencyContact && <p>Urgence : <strong>{selectedEmployeeProfile.emergencyContact}</strong></p>}
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">Informations RH</p>
                  <p className="mt-2 text-xs text-slate-500">Profil RH non renseigné.</p>
                </div>
              )}

              <div className="md:col-span-2 rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900">Événements affectés</p>
                  <span className="text-[10px] font-semibold text-slate-400">{selectedEmployeeEventIds.length} affectation(s)</span>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {selectedEmployeeEventIds.map((eventId) => {
                    const event = eventById[eventId];
                    return <div key={eventId} className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs font-bold text-slate-800">{event?.name ?? eventId}</p>
                      {event && <p className="mt-1 text-[10px] text-slate-500">{formatDate(event.date)} · {event.guestCount} invités</p>}
                    </div>;
                  })}
                  {selectedEmployeeEventIds.length === 0 && <p className="text-xs text-slate-500">Aucune affectation enregistrée.</p>}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          TEAM DETAIL MODAL
      ===================================================== */}

      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="flex items-start justify-between border-b border-slate-200 p-5">

              <div>

                <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase text-amber-700">
                  {selectedTeam.specialization}
                </span>

                <h3 className="mt-2 text-base font-bold text-slate-900">
                  {selectedTeam.name}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {selectedTeam.description}
                </p>

              </div>

              <div className="flex gap-1">
                <button type="button" onClick={() => openTeamModal(selectedTeam)} aria-label="Modifier l’équipe" className="rounded-lg p-2 hover:bg-slate-100"><Pencil className="h-4 w-4" /></button>
                <button type="button" onClick={() => void removeTeam(selectedTeam)} aria-label="Supprimer l’équipe" className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                <button type="button" onClick={() => setSelectedTeamId(null)} aria-label="Fermer" className="rounded-lg p-2 hover:bg-slate-100"><X className="h-4 w-4" /></button>
              </div>

            </div>

            <div className="space-y-5 p-5">

              <div>

                <p className="mb-2 text-xs font-bold text-slate-900">
                  Membres ({selectedTeam.memberIds.length})
                </p>

                <div className="grid gap-2 md:grid-cols-2">

                  {selectedTeam.memberIds.map(
                    (memberId) => {
                      const member =
                        allEmployees.find(
                          (employee) =>
                            employee.id === memberId
                        );

                      if (!member) return null;

                      return (
                        <div
                          key={memberId}
                          className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"
                        >

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-[10px] font-bold text-white">
                            {getInitials(member.name)}
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-xs font-bold text-slate-800">
                              {member.name}
                            </p>

                            <p className="truncate text-[10px] text-slate-500">
                              {member.role}
                            </p>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>

              <div>

                <p className="mb-2 text-xs font-bold text-slate-900">
                  Événements affectés
                </p>

                <div className="grid gap-2">

                  {selectedTeam.assignedEventIds.map(
                    (eventId) => {
                      const event =
                        eventById[eventId];

                      return (
                        <div
                          key={eventId}
                          className="rounded-xl bg-slate-50 p-3"
                        >

                          <p className="text-xs font-bold text-slate-800">
                            {event?.name ?? eventId}
                          </p>

                          {event && (
                            <p className="mt-1 text-[10px] text-slate-500">
                              {formatDate(event.date)} ·{' '}
                              {event.guestCount} invités ·{' '}
                              {event.location}
                            </p>
                          )}

                        </div>
                      );
                    }
                  )}

                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          ADD EMPLOYEE MODAL
      ===================================================== */}

      {isEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">

          <form
            onSubmit={handleCreateEmployee}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >

            <div className="flex items-center justify-between border-b border-slate-200 p-5">

              <div>

                <h3 className="text-base font-bold text-slate-900">
                  {editingEmployee ? 'Modifier le personnel' : 'Ajouter un personnel'}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Ajoutez un nouveau collaborateur au registre.
                </p>

              </div>

              <button
                type="button"
                onClick={closeEmployeeModal}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>

            </div>

            <div className="grid gap-4 p-5">

              {/* TYPE */}

              <div>

                <p className="mb-2 text-xs font-semibold text-slate-700">
                  Type de personnel
                </p>

                <div className="grid grid-cols-2 gap-2">

                  <button
                    type="button"
                    disabled={Boolean(editingEmployee)}
                    onClick={() =>
                      { setEmployeeType('team'); setProfileEmployeeType('Permanent'); setDepartment('Wedding Planning'); }
                    }
                    className={`rounded-xl border px-3 py-3 text-left transition ${
                      employeeType === 'team'
                        ? 'border-amber-400 bg-amber-50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >

                    <p className="text-xs font-bold text-slate-900">
                      Employé permanent
                    </p>

                    <p className="mt-1 text-[10px] text-slate-500">
                      Personnel interne
                    </p>

                  </button>

                  <button
                    type="button"
                    disabled={Boolean(editingEmployee)}
                    onClick={() =>
                      { setEmployeeType('server'); setProfileEmployeeType('Vacation'); setDepartment('Service'); }
                    }
                    className={`rounded-xl border px-3 py-3 text-left transition ${
                      employeeType === 'server'
                        ? 'border-amber-400 bg-amber-50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >

                    <p className="text-xs font-bold text-slate-900">
                      Personnel de service
                    </p>

                    <p className="mt-1 text-[10px] text-slate-500">
                      Serveur / Extra
                    </p>

                  </button>

                </div>

              </div>

              {/* NOM */}

              <label className="text-xs font-semibold text-slate-700">

                Nom complet

                <input
                  required
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                  placeholder="Ex. Hery Randrianarisoa"
                />

              </label>

              <label className="text-xs font-semibold text-slate-700">
                Département
                <input value={department} onChange={(e) => setDepartment(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400" />
              </label>

              <label className="text-xs font-semibold text-slate-700">
                Photo du personnel
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={avatarUploading}
                  onChange={(e) => void uploadAvatar(e.target.files?.[0])}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2" />
              </label>

              <label className="text-xs font-semibold text-slate-700">
                Type de contrat RH
                <select value={profileEmployeeType} onChange={(e) => setProfileEmployeeType(e.target.value as EmployeeProfile['employeeType'])}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                  <option value="Permanent">Permanent</option>
                  <option value="Vacation">Vacation</option>
                  <option value="Extra">Extra</option>
                </select>
              </label>

              <label className="text-xs font-semibold text-slate-700">
                Expérience
                <textarea value={experience} onChange={(e) => setExperience(e.target.value)} rows={3}
                  className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400" />
              </label>

              <label className="text-xs font-semibold text-slate-700">
                Compétences
                <input value={skillsText} onChange={(e) => setSkillsText(e.target.value)} placeholder="Service, accueil, coordination"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400" />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-semibold text-slate-700">
                  Date d’embauche
                  <input type="date" value={hireDate} onChange={(e) => setHireDate(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                </label>
                <label className="text-xs font-semibold text-slate-700">
                  Disponibilité
                  <select value={availability} onChange={(e) => setAvailability(e.target.value as EmployeeProfile['availability'])}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                    <option value="Disponible">Disponible</option>
                    <option value="Affecté">Affecté</option>
                    <option value="Indisponible">Indisponible</option>
                  </select>
                </label>
              </div>

              <label className="text-xs font-semibold text-slate-700">
                Langues
                <input value={languagesText} onChange={(e) => setLanguagesText(e.target.value)} placeholder="Français, Malgache"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400" />
              </label>

              <label className="text-xs font-semibold text-slate-700">
                Contact d’urgence
                <input value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400" />
              </label>

              <label className="text-xs font-semibold text-slate-700">
                Notes RH
                <textarea value={profileNotes} onChange={(e) => setProfileNotes(e.target.value)} rows={3}
                  className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400" />
              </label>
              {avatarUploading && <p role="status" className="text-xs text-slate-500">Envoi de la photo…</p>}
              {avatar && <img src={avatar} alt="Aperçu du portrait" className="h-24 w-24 rounded-xl object-cover" />}

              {/* FONCTION */}

              <label className="text-xs font-semibold text-slate-700">

                Fonction

                <input
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value)
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                  placeholder={
                    employeeType === 'team'
                      ? 'Ex. Coordinateur événementiel'
                      : 'Ex. Serveur'
                  }
                />

              </label>

              {/* TELEPHONE */}

              <label className="text-xs font-semibold text-slate-700">

                Téléphone

                <input
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                />

              </label>

              {/* TARIF */}

              <label className="text-xs font-semibold text-slate-700">

                {employeeType === 'team'
                  ? 'Salaire mensuel estimé (Ar)'
                  : 'Tarif journalier (Ar)'}

                <input
                  type="number"
                  min={0}
                  value={dailyRate}
                  onChange={(e) =>
                    setDailyRate(
                      Number(e.target.value)
                    )
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                />

              </label>

            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 p-5">

              <button
                type="button"
                onClick={closeEmployeeModal}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={avatarUploading}
                className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-60"
              >
                {editingEmployee ? 'Enregistrer' : 'Ajouter le personnel'}
              </button>

            </div>

          </form>

        </div>
      )}

      {/* =====================================================
          TEAM CREATION MODAL
      ===================================================== */}

      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">

          <form
            onSubmit={handleCreateTeam}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >

            <div className="flex items-center justify-between border-b border-slate-200 p-5">

              <div>

                <h3 className="text-base font-bold text-slate-900">
                  {editingTeam ? 'Modifier une équipe' : 'Créer une équipe'}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Préparez un groupe opérationnel pour vos prochains événements.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setIsTeamModalOpen(false)
                }
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>

            </div>

            <div className="grid gap-4 p-5">

              <label className="text-xs font-semibold text-slate-700">

                Nom de l’équipe

                <input
                  required
                  value={teamName}
                  onChange={(e) =>
                    setTeamName(e.target.value)
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                  placeholder="Ex. Brigade Mariage VIP"
                />

              </label>

              <label className="text-xs font-semibold text-slate-700">

                Description

                <textarea
                  value={teamDescription}
                  onChange={(e) =>
                    setTeamDescription(e.target.value)
                  }
                  rows={4}
                  className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                  placeholder="Décrivez la mission de cette équipe..."
                />

              </label>

              <label className="text-xs font-semibold text-slate-700">
                Spécialité
                <input value={teamSpecialization} onChange={(e) => setTeamSpecialization(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-400" />
              </label>

              <label className="text-xs font-semibold text-slate-700">
                Responsable
                <select value={teamLeaderId} onChange={(e) => setTeamLeaderId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                  <option value="">Non défini</option>
                  {allEmployees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
                </select>
              </label>

              <fieldset className="rounded-xl border border-slate-200 p-3">
                <legend className="px-1 text-xs font-semibold text-slate-700">Membres</legend>
                <div className="grid max-h-36 gap-2 overflow-y-auto sm:grid-cols-2">
                  {allEmployees.map((employee) => <label key={employee.id} className="flex items-center gap-2 text-xs text-slate-600">
                    <input type="checkbox" checked={teamMemberIds.includes(employee.id)} onChange={(e) => setTeamMemberIds((current) => e.target.checked ? [...current, employee.id] : current.filter((id) => id !== employee.id))} />
                    <span className="truncate">{employee.name}</span>
                  </label>)}
                </div>
              </fieldset>

              <fieldset className="rounded-xl border border-slate-200 p-3">
                <legend className="px-1 text-xs font-semibold text-slate-700">Événements affectés</legend>
                <div className="grid max-h-36 gap-2 overflow-y-auto">
                  {events.map((event) => <label key={event.id} className="flex items-center gap-2 text-xs text-slate-600">
                    <input type="checkbox" checked={teamAssignedEventIds.includes(event.id)} onChange={(e) => setTeamAssignedEventIds((current) => e.target.checked ? [...current, event.id] : current.filter((id) => id !== event.id))} />
                    <span className="truncate">{event.name} · {formatDate(event.date)}</span>
                  </label>)}
                </div>
              </fieldset>

            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 p-5">

              <button
                type="button"
                onClick={() => { setIsTeamModalOpen(false); setEditingTeam(null); }}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Annuler
              </button>

              <button
                type="submit"
                className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
              >
                {editingTeam ? 'Enregistrer' : 'Créer l’équipe'}
              </button>

            </div>

          </form>

        </div>
      )}

    </div>
  );
};

export default TeamView;
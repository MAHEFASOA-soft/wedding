import React, { useState } from 'react';
import { CheckSquare, Plus, Filter, Calendar, User, Trash2, CheckCircle2, Clock, Edit } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskItem, TaskPriority, TaskStatus } from '../../types';
import { formatDateFr, formatShortDateFr, getStatusColor } from '../../utils/formatters';

export const TasksView: React.FC = () => {
  const {
    tasks,
    addTask,
    updateTaskStatus,
    deleteTask,
    events,
    team,
    setSelectedTaskForModal,
    openEditTaskModal,
  } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New task state
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState(team[0]?.name || 'Miora Randria');
  const [eventId, setEventId] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<TaskPriority>('Moyenne');

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
    return matchesStatus && matchesPriority;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const ev = events.find((e) => e.id === eventId);
    addTask({
      title,
      assignedTo,
      eventId: eventId || undefined,
      eventName: ev ? ev.name : undefined,
      dueDate,
      priority,
      status: 'À faire',
    });

    setTitle('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5 pb-12">
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-amber-500" />
            <span>Tâches & Checklists Opérationnelles</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Suivi des actions indispensables pour chaque cérémonie et mariage
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Tâche</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Statut :</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white outline-hidden"
          >
            <option value="all">Tous les statuts</option>
            <option value="À faire">À faire</option>
            <option value="En cours">En cours</option>
            <option value="Terminé">Terminé</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Priorité :</span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white outline-hidden"
          >
            <option value="all">Toutes les priorités</option>
            <option value="Haute">Haute</option>
            <option value="Moyenne">Moyenne</option>
            <option value="Basse">Basse</option>
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">État</th>
                <th className="px-4 py-3">Tâche</th>
                <th className="px-4 py-3">Événement Associé</th>
                <th className="px-4 py-3">Responsable</th>
                <th className="px-4 py-3">Priorité</th>
                <th className="px-4 py-3">Échéance</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((task) => {
                const statusSt = getStatusColor(task.status);
                const isCompleted = task.status === 'Terminé';

                return (
                  <tr
                    key={task.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isCompleted ? 'bg-slate-50/40 text-slate-400' : ''
                    }`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() =>
                          updateTaskStatus(task.id, isCompleted ? 'À faire' : 'Terminé')
                        }
                        className={`p-1 rounded transition-colors ${
                          isCompleted
                            ? 'text-emerald-600 hover:text-slate-400'
                            : 'text-slate-300 hover:text-emerald-600'
                        }`}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>
                    </td>

                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <button
                        onClick={() => setSelectedTaskForModal(task)}
                        className={`text-left hover:text-amber-600 hover:underline transition-colors ${
                          isCompleted ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </button>
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {task.eventName || <span className="text-slate-400 italic">Interne</span>}
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-800">{task.assignedTo}</td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          task.priority === 'Haute'
                            ? 'bg-rose-100 text-rose-800'
                            : task.priority === 'Moyenne'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {formatShortDateFr(task.dueDate)}
                    </td>

                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditTaskModal(task)}
                          className="p-1 text-slate-400 hover:text-amber-600 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">Nouvelle Tâche</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Intitulé de la tâche *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Confirmer le gâteau avec le pâtissier"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Événement rattaché
                </label>
                <select
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden bg-white"
                >
                  <option value="">-- Aucun (Tâche interne agence) --</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Responsable
                  </label>
                  <input
                    type="text"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Priorité
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden bg-white"
                  >
                    <option value="Haute">Haute</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Basse">Basse</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Date d'échéance
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
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
                  Créer la tâche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

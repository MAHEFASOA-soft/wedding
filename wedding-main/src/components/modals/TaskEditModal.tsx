import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskPriority, TaskStatus } from '../../types';

export const TaskEditModal: React.FC = () => {
  const { isTaskEditModalOpen, taskToEdit, closeTaskEditModal, updateTask, events, team } =
    useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [eventId, setEventId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Moyenne');
  const [status, setStatus] = useState<TaskStatus>('À faire');

  // Sync the form whenever the task being edited changes
  useEffect(() => {
    if (isTaskEditModalOpen && taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setAssignedTo(taskToEdit.assignedTo);
      setEventId(taskToEdit.eventId || '');
      setDueDate(taskToEdit.dueDate);
      setPriority(taskToEdit.priority);
      setStatus(taskToEdit.status);
    }
  }, [isTaskEditModalOpen, taskToEdit]);

  if (!isTaskEditModalOpen || !taskToEdit) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const ev = events.find((e) => e.id === eventId);
    updateTask({
      ...taskToEdit,
      title,
      description,
      assignedTo,
      eventId: eventId || undefined,
      eventName: ev ? ev.name : undefined,
      dueDate,
      priority,
      status,
    });

    closeTaskEditModal();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <h3 className="text-sm font-bold">Modifier la tâche</h3>
          <button
            onClick={closeTaskEditModal}
            className="text-slate-400 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Intitulé de la tâche *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden resize-none"
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
              <label className="text-xs font-bold text-slate-700 block mb-1">Responsable</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden bg-white"
              >
                {team.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Priorité</label>
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

          <div className="grid grid-cols-2 gap-3">
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

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Statut</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden bg-white"
              >
                <option value="À faire">À faire</option>
                <option value="En cours">En cours</option>
                <option value="Terminé">Terminé</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeTaskEditModal}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-600"
            >
              <Save className="w-3.5 h-3.5" />
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

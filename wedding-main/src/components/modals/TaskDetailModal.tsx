import React from 'react';
import {
  X,
  CheckSquare,
  Calendar,
  User,
  Sparkles,
  Edit,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDateFr, getStatusColor } from '../../utils/formatters';

export const TaskDetailModal: React.FC = () => {
  const {
    selectedTaskForModal,
    setSelectedTaskForModal,
    openEditTaskModal,
    toggleTaskStatus,
    deleteTask,
  } = useApp();

  if (!selectedTaskForModal) return null;

  const task = selectedTaskForModal;
  const statusStyle = getStatusColor(task.status);
  const isCompleted = task.status === 'Terminé';

  const handleClose = () => setSelectedTaskForModal(null);

  const handleDelete = () => {
    deleteTask(task.id);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        id="task-detail-modal"
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
            >
              {task.status}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                task.priority === 'Haute'
                  ? 'bg-rose-500/20 text-rose-300'
                  : task.priority === 'Moyenne'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-slate-500/20 text-slate-300'
              }`}
            >
              Priorité {task.priority}
            </span>
          </div>

          <h2 className="text-lg font-bold flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-amber-400" />
            <span className={isCompleted ? 'line-through text-slate-400' : ''}>{task.title}</span>
          </h2>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {task.description && (
            <p className="text-sm text-slate-600 leading-relaxed">{task.description}</p>
          )}

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <User className="w-4 h-4 text-slate-400" />
              <span>{task.assignedTo}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Échéance : {formatDateFr(task.dueDate)}</span>
            </div>
            {task.eventName && (
              <div className="flex items-center gap-2 text-slate-600 col-span-2">
                <Sparkles className="w-4 h-4 text-slate-400" />
                <span>Événement : {task.eventName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Supprimer
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleTaskStatus(task.id)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isCompleted ? 'Rouvrir' : 'Marquer terminée'}
            </button>
            <button
              onClick={() => openEditTaskModal(task)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              Modifier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

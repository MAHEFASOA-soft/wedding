import React, { useState } from 'react';
import { X, PlusCircle, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SalaryStatus } from '../../types';

export const SalaryModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { addSalary, team } = useApp();

  const [employeeName, setEmployeeName] = useState(team[0]?.name || '');
  const [role, setRole] = useState(team[0]?.role || '');
  const [month, setMonth] = useState('Septembre 2026');
  const [baseSalary, setBaseSalary] = useState<number>(1200000);
  const [bonus, setBonus] = useState<number>(100000);
  const [deduction, setDeduction] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<SalaryStatus>('Payé');
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  const netCalculated = Math.max(0, Number(baseSalary) + Number(bonus) - Number(deduction));

  const handleEmployeeChange = (name: string) => {
    setEmployeeName(name);
    const member = team.find((t) => t.name === name);
    if (member) {
      setRole(member.role);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSalary({
      employeeName,
      role,
      month,
      baseSalary: Number(baseSalary) || 0,
      bonus: Number(bonus) || 0,
      deduction: Number(deduction) || 0,
      netPaid: netCalculated,
      paymentDate,
      status,
      comment,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              Enregistrer une Fiche de Salaire
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Employé *
              </label>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                required
                placeholder="Nom complet"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Fonction / Poste *
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                placeholder="Ex: Coordinatrice / Régisseur"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Mois concerné *
              </label>
              <input
                type="text"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                required
                placeholder="Ex: Septembre 2026"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Date de paiement
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Salaire Base (Ar)
                </label>
                <input
                  type="number"
                  step="50000"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(Number(e.target.value))}
                  required
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Prime (Ar)
                </label>
                <input
                  type="number"
                  step="10000"
                  value={bonus}
                  onChange={(e) => setBonus(Number(e.target.value))}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Retenue (Ar)
                </label>
                <input
                  type="number"
                  step="10000"
                  value={deduction}
                  onChange={(e) => setDeduction(Number(e.target.value))}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg outline-hidden"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Net Payé (Calculé) :</span>
              <span className="text-sm font-extrabold text-amber-700">
                {netCalculated.toLocaleString('fr-MG')} Ar
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Statut du paiement *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SalaryStatus)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden bg-white"
              >
                <option value="Payé">Payé (Comptabilisé en dépense)</option>
                <option value="À payer">À payer</option>
                <option value="Partiellement payé">Partiellement payé</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Commentaire
              </label>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ex: Prime mission réussie"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-hidden"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            * Les salaires validés avec statut « Payé » s’imputent immédiatement dans le total des dépenses de l’entreprise.
          </p>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg transition-colors shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Enregistrer le Salaire</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

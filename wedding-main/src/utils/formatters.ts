// Utility functions for formatting Ariary (Ar), dates, numbers, and badges

export function formatAriary(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0 Ar';
  }
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('fr-MG').format(rounded).replace(/,/g, ' ');
  return `${formatted} Ar`;
}

export function formatDateFr(dateString: string): string {
  if (!dateString) return '';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatShortDateFr(dateString: string): string {
  if (!dateString) return '';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  } catch {
    return dateString;
  }
}

export function getStatusColor(status: string): { bg: string; text: string; border: string } {
  switch (status) {
    case 'Confirmé':
    case 'Payée':
    case 'Payé':
    case 'Validée':
    case 'Validé':
    case 'Terminé':
    case 'Disponible':
    case 'Actif':
    case 'Effectué':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };

    case 'En cours':
    case 'Partiellement payée':
    case 'Partiellement payé':
    case 'Assigné':
    case 'En mission':
    case 'Moyenne':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };

    case 'Planifié':
    case 'En attente':
    case 'À faire':
    case 'À payer':
    case 'À venir':
    case 'Brouillon':
    case 'Envoyé':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };

    case 'Annulé':
    case 'Refusée':
    case 'Refusé':
    case 'En retard':
    case 'Haute':
    case 'En congé':
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };

    default:
      return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
  }
}

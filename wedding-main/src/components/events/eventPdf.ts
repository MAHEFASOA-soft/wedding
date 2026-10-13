import { jsPDF } from 'jspdf';
import { EventItem } from '../../types';
import { formatAriary, formatDateFr } from '../../utils/formatters';

interface EventFinancials {
  totalPrice: number;
  amountReceived: number;
  amountRemaining: number;
  totalExpenses: number;
  netMargin: number;
}

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 18;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const sanitizeFileName = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

const addPageIfNeeded = (pdf: jsPDF, y: number, requiredHeight = 10): number => {
  if (y + requiredHeight <= PAGE_HEIGHT - MARGIN) return y;
  pdf.addPage();
  return MARGIN;
};

const addWrappedText = (
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight = 5
): number => {
  const lines = pdf.splitTextToSize(text || '-', maxWidth) as string[];
  pdf.text(lines, x, y);
  return y + lines.length * lineHeight;
};

const addSectionTitle = (pdf: jsPDF, title: string, y: number): number => {
  const nextY = addPageIfNeeded(pdf, y, 12);
  pdf.setFillColor(245, 158, 11);
  pdf.rect(MARGIN, nextY - 5, CONTENT_WIDTH, 7, 'F');
  pdf.setTextColor(15, 23, 42);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text(title.toUpperCase(), MARGIN + 3, nextY);
  return nextY + 9;
};

export const downloadEventPdf = (event: EventItem, financials: EventFinancials): void => {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = MARGIN;

  pdf.setFillColor(15, 23, 42);
  pdf.rect(0, 0, PAGE_WIDTH, 35, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text('EFFICIENCY WEDDING', MARGIN, 15);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('FICHE CLIENT - DETAILS DE L\'EVENEMENT', MARGIN, 22);
  pdf.setTextColor(251, 191, 36);
  pdf.setFont('helvetica', 'bold');
  pdf.text(event.code || 'EVENEMENT', PAGE_WIDTH - MARGIN, 15, { align: 'right' });
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'normal');
  pdf.text(formatDateFr(new Date().toISOString().split('T')[0]), PAGE_WIDTH - MARGIN, 22, { align: 'right' });
  y = 47;

  pdf.setTextColor(15, 23, 42);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  y = addWrappedText(pdf, event.name, MARGIN, y, CONTENT_WIDTH, 7) + 3;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(71, 85, 105);
  pdf.text(`Statut : ${event.status}  |  Type : ${event.type}`, MARGIN, y);
  y += 10;

  y = addSectionTitle(pdf, 'Client', y);
  pdf.setFontSize(10);
  pdf.setTextColor(15, 23, 42);
  pdf.setFont('helvetica', 'bold');
  pdf.text(event.clientName, MARGIN, y);
  pdf.setFont('helvetica', 'normal');
  y += 6;
  if (event.clientPhone) {
    pdf.text(`Telephone : ${event.clientPhone}`, MARGIN, y);
    y += 5;
  }
  y += 5;

  y = addSectionTitle(pdf, 'Organisation de la ceremonie', y);
  pdf.setFontSize(10);
  pdf.setTextColor(15, 23, 42);
  const details = [
    `Date : ${formatDateFr(event.date)}`,
    `Horaires : ${event.startTime || '-'} - ${event.endTime || '-'}`,
    `Lieu : ${event.location || '-'}`,
    `Nombre d'invites : ${event.guestCount}`,
    `Coordinateur : ${event.coordinator || '-'}`,
    `Repas : ${event.mealType || '-'}`,
  ];
  details.forEach((detail) => {
    y = addPageIfNeeded(pdf, y, 6);
    pdf.text(detail, MARGIN, y);
    y += 5;
  });
  y += 5;

  y = addSectionTitle(pdf, 'Pack et prestations incluses', y);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text(event.packName || 'Pack sur mesure', MARGIN, y);
  y += 7;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  const services = event.includedServices?.length ? event.includedServices : ['Prestations a definir avec le client'];
  services.forEach((service, index) => {
    y = addPageIfNeeded(pdf, y, 8);
    pdf.setFillColor(245, 158, 11);
    pdf.circle(MARGIN + 1.5, y - 1.2, 1, 'F');
    y = addWrappedText(pdf, `${index + 1}. ${service}`, MARGIN + 5, y, CONTENT_WIDTH - 5, 4.5) + 1.5;
  });
  y += 5;

  y = addSectionTitle(pdf, 'Recapitulatif financier', y);
  pdf.setFontSize(10);
  const financialLines = [
    ['Prix total', formatAriary(financials.totalPrice)],
    ['Montant recu', formatAriary(financials.amountReceived)],
    ['Reste a payer', formatAriary(financials.amountRemaining)],
    ['Depenses engagees', formatAriary(financials.totalExpenses)],
    ['Marge previsionnelle', formatAriary(financials.netMargin)],
  ];
  financialLines.forEach(([label, value]) => {
    y = addPageIfNeeded(pdf, y, 7);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    pdf.text(label, MARGIN, y);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text(value, PAGE_WIDTH - MARGIN, y, { align: 'right' });
    y += 6;
  });

  if (event.notes) {
    y += 5;
    y = addSectionTitle(pdf, 'Notes', y);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    pdf.setFontSize(9);
    addWrappedText(pdf, event.notes, MARGIN, y, CONTENT_WIDTH, 4.5);
  }

  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text('Document remis au client - Efficiency Wedding Madagascar', MARGIN, PAGE_HEIGHT - 10);
  pdf.text('Document genere automatiquement', PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 10, { align: 'right' });

  const fileName = `fiche-${sanitizeFileName(event.name || event.code || 'evenement')}.pdf`;
  pdf.save(fileName);
};

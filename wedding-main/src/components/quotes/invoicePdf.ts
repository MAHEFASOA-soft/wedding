import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Quote, Invoice, QuoteItem } from '../../types';

// ─────────────── Identité de l'agence ───────────────
const COMPANY = {
  name: 'EFFICIENCY WEDDING MADAGASCAR',
  tagline: 'Agence Événementielle & Wedding Planner de Prestige',
  address: 'Antanimena, Antananarivo 101, Madagascar',
  phone: '+261 34 11 000 01',
  email: 'contact@efficiencywedding.mg',
  legal: 'NIF : 4001293847  •  STAT : 93290 11 2019 0 04821',
};

const PAYMENT_INFO = [
  'BNI Madagascar : Agence Antanimena - Compte N° 00004 01234 56789012345 67',
  'MVola : 034 11 000 01 (Efficiency Wedding)',
  'Orange Money : 032 11 000 01',
];

const QUOTE_TERMS = [
  'Acompte de réservation : 50% à la signature du contrat.',
  "Tranche intermédiaire : 30% un mois avant l'événement.",
  'Solde final : 20% au plus tard le jour J, avant le début de la réception.',
  "Modes acceptés : MVola, Orange Money, virement BNI, espèces à l'agence.",
];

// ─────────────── Couleurs ───────────────
type RGB = [number, number, number];
const SLATE_900: RGB = [15, 23, 42];
const SLATE_600: RGB = [71, 85, 105];
const SLATE_400: RGB = [148, 163, 184];
const SLATE_100: RGB = [241, 245, 249];
const SLATE_50: RGB = [248, 250, 252];
const AMBER: RGB = [217, 119, 6];
const EMERALD: RGB = [5, 150, 105];
const ROSE: RGB = [190, 18, 60];

// ─────────────── Utilitaires ───────────────
// IMPORTANT : jsPDF ne gère pas les espaces insécables fines (U+202F / U+00A0)
// produites par toLocaleString('fr-FR') : elles s'afficheraient comme "/".
const clean = (s: string) => s.replace(/[\u202f\u00a0]/g, ' ');
const ar = (n: number) => `${clean(Math.round(n || 0).toLocaleString('fr-FR'))} Ar`;
const fmtDate = (iso: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return clean(d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }));
};

interface PdfDocOptions {
  kind: 'devis' | 'facture';
  number: string;
  badge: string;
  accent: RGB;
  dates: { label: string; value: string }[];
  clientName: string;
  eventName: string;
  items: QuoteItem[];
  total: number;
  paid?: number;
  stamp?: { text: string; color: RGB };
  notesTitle: string;
  notes: string[];
  signatures?: boolean;
}

// ─────────────── Moteur de rendu ───────────────
function buildPdf(o: PdfDocOptions): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 15;

  // ── En-tête page 1 ──
  doc.setFillColor(...SLATE_900);
  doc.rect(0, 0, W, 38, 'F');
  doc.setFillColor(...o.accent);
  doc.rect(0, 38, W, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(COMPANY.name, M, 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(COMPANY.tagline, M, 22);
  doc.text(COMPANY.address, M, 27);
  doc.text(`Tél : ${COMPANY.phone}  •  ${COMPANY.email}`, M, 32);

  // Bloc titre (à droite)
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(o.kind === 'devis' ? 'DEVIS' : 'FACTURE', W - M, 17, { align: 'right' });
  doc.setFontSize(10);
  doc.setFont('courier', 'bold');
  doc.text(o.number, W - M, 24, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(o.badge, W - M, 30, { align: 'right' });

  // ── Cartes client / dates ──
  let y = 48;
  const cardH = 26;
  const leftW = (W - 2 * M) * 0.62;

  doc.setFillColor(...SLATE_50);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(M, y, leftW - 3, cardH, 2, 2, 'FD');
  doc.roundedRect(M + leftW, y, W - 2 * M - leftW, cardH, 2, 2, 'FD');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...SLATE_400);
  doc.text(o.kind === 'devis' ? 'CLIENT' : 'FACTURÉ À', M + 4, y + 6);
  doc.text('ÉVÉNEMENT', M + 4, y + 16);

  doc.setFontSize(10);
  doc.setTextColor(...SLATE_900);
  doc.text(doc.splitTextToSize(o.clientName, leftW - 12)[0], M + 4, y + 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...SLATE_600);
  doc.text(doc.splitTextToSize(o.eventName, leftW - 12)[0], M + 4, y + 21);

  let dy = y + 7;
  o.dates.forEach((d) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...SLATE_400);
    doc.text(d.label.toUpperCase(), M + leftW + 4, dy);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...SLATE_900);
    doc.text(d.value, M + leftW + 4, dy + 4.5);
    dy += 10;
  });

  y += cardH + 8;

  // ── Tableau des prestations (multi-pages) ──
  autoTable(doc, {
    startY: y,
    margin: { top: 30, left: M, right: M, bottom: 24 },
    head: [['N°', 'Désignation', 'Qté', 'Prix unitaire', 'Total']],
    body: o.items.map((it, i) => [
      String(i + 1),
      it.description,
      String(it.quantity),
      ar(it.unitPrice),
      ar(it.total),
    ]),
    theme: 'plain',
    styles: { font: 'helvetica', fontSize: 9, cellPadding: { top: 3.2, bottom: 3.2, left: 3, right: 3 }, textColor: SLATE_900, lineColor: [226, 232, 240], lineWidth: { bottom: 0.2 } },
    headStyles: { fillColor: SLATE_900, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: SLATE_50 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center', textColor: SLATE_400 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 14, halign: 'center' },
      3: { cellWidth: 34, halign: 'right', textColor: SLATE_600 },
      4: { cellWidth: 36, halign: 'right', fontStyle: 'bold' },
    },
    showHead: 'everyPage',
    rowPageBreak: 'avoid',
    didDrawPage: (data) => {
      // En-tête réduit sur les pages 2+
      if (data.pageNumber > 1) {
        doc.setFillColor(...SLATE_900);
        doc.rect(0, 0, W, 16, 'F');
        doc.setFillColor(...o.accent);
        doc.rect(0, 16, W, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(COMPANY.name, M, 10);
        doc.setFont('courier', 'bold');
        doc.text(`${o.kind === 'devis' ? 'Devis' : 'Facture'} ${o.number}`, W - M, 10, { align: 'right' });
      }
    },
  });

  // ── Totaux (ne jamais couper en deux) ──
  let fy = (doc as any).lastAutoTable.finalY + 8;
  const totalsH = o.paid !== undefined ? 34 : 18;
  if (fy + totalsH + 60 > H - 24) {
    doc.addPage();
    fy = 30;
  }

  const boxW = 88;
  const bx = W - M - boxW;
  doc.setFillColor(...SLATE_50);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(bx, fy, boxW, totalsH, 2, 2, 'FD');

  if (o.paid !== undefined) {
    const remaining = Math.max(0, o.total - o.paid);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...SLATE_600);
    doc.text('Total facturé', bx + 4, fy + 7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...SLATE_900);
    doc.text(ar(o.total), bx + boxW - 4, fy + 7, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...SLATE_600);
    doc.text('Déjà réglé', bx + 4, fy + 13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...EMERALD);
    doc.text(`- ${ar(o.paid)}`, bx + boxW - 4, fy + 13, { align: 'right' });

    doc.setFillColor(...(remaining > 0 ? ROSE : EMERALD));
    doc.roundedRect(bx, fy + 18, boxW, 16, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(remaining > 0 ? 'RESTE NET À PAYER' : 'FACTURE SOLDÉE', bx + 4, fy + 24);
    doc.setFontSize(12);
    doc.text(ar(remaining), bx + boxW - 4, fy + 30, { align: 'right' });
  } else {
    doc.setFillColor(...o.accent);
    doc.roundedRect(bx, fy, boxW, totalsH, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('TOTAL NET PROPOSÉ', bx + 4, fy + 7);
    doc.setFontSize(13);
    doc.text(ar(o.total), bx + boxW - 4, fy + 14, { align: 'right' });
  }

  // Nombre de lignes à gauche des totaux
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...SLATE_400);
  doc.text(`${o.items.length} ligne(s) de prestation`, M, fy + 6);

  // ── Notes / conditions / coordonnées de paiement ──
  let ny = fy + totalsH + 10;
  const lines = o.notes.map((n) => doc.splitTextToSize(`•  ${n}`, W - 2 * M - 10) as string[]);
  const notesH = 12 + lines.reduce((s, l) => s + l.length * 4.4, 0);
  if (ny + notesH > H - 24) {
    doc.addPage();
    ny = 30;
  }
  doc.setFillColor(...SLATE_100);
  doc.roundedRect(M, ny, W - 2 * M, notesH, 2, 2, 'F');
  doc.setFillColor(...o.accent);
  doc.rect(M, ny, 1.5, notesH, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...SLATE_900);
  doc.text(o.notesTitle, M + 6, ny + 6.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...SLATE_600);
  let ty = ny + 12;
  lines.forEach((l) => {
    doc.text(l, M + 6, ty);
    ty += l.length * 4.4;
  });

  // ── Signatures (devis) ──
  if (o.signatures) {
    let sy = ny + notesH + 10;
    if (sy + 34 > H - 24) {
      doc.addPage();
      sy = 30;
    }
    const sw = 70;
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...SLATE_400);
    doc.text('POUR LE CLIENT', M, sy);
    doc.text('EFFICIENCY WEDDING MADAGASCAR', W - M - sw, sy);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...SLATE_600);
    doc.text('« Bon pour accord et commande »', M, sy + 4.5);
    doc.text('La Direction - Cachet & signature', W - M - sw, sy + 4.5);
    doc.setDrawColor(...SLATE_400);
    doc.setLineDashPattern([1.5, 1.5], 0);
    doc.roundedRect(M, sy + 7, sw, 22, 2, 2, 'S');
    doc.roundedRect(W - M - sw, sy + 7, sw, 22, 2, 2, 'S');
    doc.setLineDashPattern([], 0);
  }

  // ── Tampon diagonal (PAYÉE / PARTIEL...) sur la 1re page ──
  if (o.stamp) {
    doc.setPage(1);
    doc.saveGraphicsState();
    doc.setGState(new (doc as any).GState({ opacity: 0.16 }));
    doc.setTextColor(...o.stamp.color);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(56);
    doc.text(o.stamp.text, W / 2, H / 2 + 10, { align: 'center', angle: 28 });
    doc.restoreGraphicsState();
  }

  // ── Pied de page + pagination sur toutes les pages ──
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(M, H - 16, W - M, H - 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...SLATE_400);
    doc.text(`${COMPANY.name}  •  ${COMPANY.legal}`, M, H - 11);
    doc.text(`${COMPANY.address}  •  ${COMPANY.phone}  •  ${COMPANY.email}`, M, H - 7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...SLATE_600);
    doc.text(`Page ${i} / ${total}`, W - M, H - 9, { align: 'right' });
  }

  return doc;
}

// ─────────────── Builders ───────────────
const buildInvoiceDoc = (inv: Invoice) => {
  const remaining = Math.max(0, inv.totalAmount - inv.paidAmount);
  const stamp =
    remaining <= 0
      ? { text: 'PAYÉE', color: EMERALD }
      : inv.paidAmount > 0
        ? { text: 'PARTIEL', color: AMBER }
        : inv.status === 'En retard'
          ? { text: 'EN RETARD', color: ROSE }
          : undefined;

  return buildPdf({
    kind: 'facture',
    number: inv.invoiceNumber,
    badge: 'FACTURE DÉFINITIVE',
    accent: EMERALD,
    dates: [
      { label: 'Date d\'émission', value: fmtDate(inv.date) },
      { label: 'Échéance', value: fmtDate(inv.dueDate) },
    ],
    clientName: inv.clientName,
    eventName: inv.eventName,
    items: inv.items,
    total: inv.totalAmount,
    paid: inv.paidAmount,
    stamp,
    notesTitle: 'Coordonnées de règlement',
    notes: PAYMENT_INFO,
  });
};

const buildQuoteDoc = (q: Quote) =>
  buildPdf({
    kind: 'devis',
    number: `${q.quoteNumber}${q.version ? ` (v${q.version})` : ''}`,
    badge: 'PROPOSITION COMMERCIALE',
    accent: AMBER,
    dates: [
      { label: 'Date', value: fmtDate(q.date) },
      { label: 'Valable jusqu\'au', value: fmtDate(q.validUntil) },
    ],
    clientName: q.clientName,
    eventName: q.eventName,
    items: q.items,
    total: q.totalAmount,
    notesTitle: 'Modalités de règlement',
    notes: QUOTE_TERMS,
    signatures: true,
  });

// ─────────────── API publique ───────────────
export const downloadInvoicePdf = (inv: Invoice) =>
  buildInvoiceDoc(inv).save(`Facture-${inv.invoiceNumber}.pdf`);

export const downloadQuotePdf = (q: Quote) =>
  buildQuoteDoc(q).save(`Devis-${q.quoteNumber}${q.version ? `-v${q.version}` : ''}.pdf`);

// Partage direct (WhatsApp, Mail...) depuis un téléphone ; sinon téléchargement
const shareOrSave = async (doc: jsPDF, filename: string, title: string) => {
  const file = new File([doc.output('blob')], filename, { type: 'application/pdf' });
  const nav = navigator as any;
  if (nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title });
      return;
    } catch {
      /* annulé par l'utilisateur */
    }
  }
  doc.save(filename);
};

export const shareInvoicePdf = (inv: Invoice) =>
  shareOrSave(buildInvoiceDoc(inv), `Facture-${inv.invoiceNumber}.pdf`, `Facture ${inv.invoiceNumber}`);

export const shareQuotePdf = (q: Quote) =>
  shareOrSave(buildQuoteDoc(q), `Devis-${q.quoteNumber}.pdf`, `Devis ${q.quoteNumber}`);
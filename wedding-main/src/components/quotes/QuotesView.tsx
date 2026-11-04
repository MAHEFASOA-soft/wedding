import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Printer,
  CheckCircle,
  Trash2,
  Eye,
  Receipt,
  DollarSign,
  Calendar,
  Layers,
  Download,
  Share2,
  Pencil,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Quote, Invoice, QuoteItem, ServiceItem, PaymentMethod } from '../../types';
import { formatAriary, formatDateFr, formatShortDateFr, getStatusColor } from '../../utils/formatters';
import { downloadInvoicePdf, downloadQuotePdf, shareInvoicePdf, shareQuotePdf } from './invoicePdf';

interface QuotesViewProps {
  defaultType?: 'devis' | 'facture';
}

export const QuotesView: React.FC<QuotesViewProps> = ({ defaultType = 'devis' }) => {
  const {
    quotes,
    addQuote,
    updateQuoteStatus,
    createQuoteVersion,
    invoices,
    addInvoice,
    updateQuote,
    deleteQuote,
    updateInvoice,
    deleteInvoice,
    recordInvoicePayment,
    quotesLoading,
    quotesLoadError,
    invoicesLoading,
    invoicesLoadError,
    events,
    clients,
    services,
    setActiveTab,
    openCreateEventModalFromQuote,
  } = useApp();

  // Active view: 'devis' or 'facture'
  const [activeSubTab, setActiveSubTab] = useState<'devis' | 'facture'>(defaultType);

  useEffect(() => {
    if (defaultType) {
      setActiveSubTab(defaultType);
    }
  }, [defaultType]);

  // Search and filters
  const [search, setSearch] = useState('');
  const [quoteStatusFilter, setQuoteStatusFilter] = useState<string>('all');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>('all');

  // Preview & Print modals
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // New Quote Modal
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteBeingRevised, setQuoteBeingRevised] = useState<Quote | null>(null);
  const [quoteBeingEdited, setQuoteBeingEdited] = useState<Quote | null>(null);
  const [quoteChangeReason, setQuoteChangeReason] = useState('');
  const [quoteClient, setQuoteClient] = useState(clients[0]?.name || '');
  const [quoteEvent, setQuoteEvent] = useState(events[0]?.name || '');
  const [quoteValidity, setQuoteValidity] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [quoteServiceSearch, setQuoteServiceSearch] = useState('');
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [isSavingQuote, setIsSavingQuote] = useState(false);
  const [quoteFormError, setQuoteFormError] = useState('');
  const [quoteActionError, setQuoteActionError] = useState('');

  const filteredCatalogServices = services
    .filter((service) => {
      const search = quoteServiceSearch.trim().toLowerCase();
      return (
        !search ||
        `${service.name} ${service.category} ${service.description}`.toLowerCase().includes(search)
      );
    })
    .slice(0, 8);

  const addServiceToQuote = (service: ServiceItem) => {
    setQuoteItems((current) => {
      const exists = current.some(
        (item) => item.description.toLowerCase() === service.name.toLowerCase()
      );

      if (exists) {
        return current;
      }

      return [
        ...current,
        {
          description: service.name,
          quantity: 1,
          unitPrice: service.unitPrice || 0,
          total: (service.unitPrice || 0) * 1,
        },
      ];
    });
    setQuoteServiceSearch('');
  };

  // New Invoice Modal
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceClient, setInvoiceClient] = useState(clients[0]?.name || '');
  const [invoiceEvent, setInvoiceEvent] = useState(events[0]?.name || '');
  const [invoiceClientSearch, setInvoiceClientSearch] = useState(clients[0]?.name || '');
  const [invoiceEventSearch, setInvoiceEventSearch] = useState(events[0]?.name || '');
  const [invoiceClientId, setInvoiceClientId] = useState(clients[0]?.id || '');
  const [invoiceEventId, setInvoiceEventId] = useState(events[0]?.id || '');
  const [isInvoiceClientDropdownOpen, setIsInvoiceClientDropdownOpen] = useState(false);
  const [isInvoiceEventDropdownOpen, setIsInvoiceEventDropdownOpen] = useState(false);
  const [invoiceDueDate, setInvoiceDueDate] = useState(
    new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );
  const [invoiceItems, setInvoiceItems] = useState<QuoteItem[]>([]);
  const [invoiceBeingEdited, setInvoiceBeingEdited] = useState<Invoice | null>(null);
  const [isSavingInvoice, setIsSavingInvoice] = useState(false);
  const [invoiceFormError, setInvoiceFormError] = useState('');
  const [invoiceActionError, setInvoiceActionError] = useState('');
  const [invoiceInitialPaid, setInvoiceInitialPaid] = useState<number>(0);
  const [invoiceTaxRate, setInvoiceTaxRate] = useState(20);
  const [invoicePaymentMethod, setInvoicePaymentMethod] = useState<'Mobile Money' | 'Virement bancaire' | 'Espèces'>('Virement bancaire');
  const [invoicePaymentTerms, setInvoicePaymentTerms] = useState('50% a la commande, solde avant la reception.');

  // Quick Payment Modal on Invoice
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Mobile Money');
  const [paymentComment, setPaymentComment] = useState('MVola Réf: ');
  const [paymentError, setPaymentError] = useState('');
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  // Calculations for Devis
  const totalQuotesAmount = quotes.reduce((acc, q) => acc + q.totalAmount, 0);
  const acceptedQuotes = quotes.filter((q) => q.status === 'Accepté');
  const acceptedQuotesTotal = acceptedQuotes.reduce((acc, q) => acc + q.totalAmount, 0);
  const conversionRate = quotes.length > 0 ? Math.round((acceptedQuotes.length / quotes.length) * 100) : 0;

  // Calculations for Factures
  const totalInvoicedAmount = invoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const totalPaidInvoices = invoices.reduce((acc, i) => acc + i.paidAmount, 0);
  const totalRemainingToCollect = totalInvoicedAmount - totalPaidInvoices;
  const overdueInvoicesCount = invoices.filter((i) => i.status === 'En retard').length;

  // Filtered lists
  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      q.quoteNumber.toLowerCase().includes(search.toLowerCase()) ||
      q.clientName.toLowerCase().includes(search.toLowerCase()) ||
      (q.eventName && q.eventName.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = quoteStatusFilter === 'all' || q.status === quoteStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
      (inv.eventName && inv.eventName.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = invoiceStatusFilter === 'all' || inv.status === invoiceStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const invoiceClientMatches = clients.filter((client) =>
    `${client.id} ${client.name} ${client.phone} ${client.email}`.toLowerCase().includes(invoiceClientSearch.toLowerCase())
  ).slice(0, 6);
  const invoiceEventMatches = events.filter((event) =>
    event.clientId === invoiceClientId && `${event.id} ${event.name} ${event.location}`.toLowerCase().includes(invoiceEventSearch.toLowerCase())
  ).slice(0, 6);
  const invoiceSubtotal = invoiceItems.reduce((sum, item) => sum + (item.total || 0), 0);
  const invoiceTax = Math.round(invoiceSubtotal * invoiceTaxRate / 100);
  const invoiceGrandTotal = invoiceSubtotal + invoiceTax;
  const invoiceItemsWithTax: QuoteItem[] = invoiceTax > 0
    ? [...invoiceItems, { description: `TVA (${invoiceTaxRate}%)`, quantity: 1, unitPrice: invoiceTax, total: invoiceTax }]
    : invoiceItems;

  useEffect(() => {
    if (!quoteClient && clients[0]) setQuoteClient(clients[0].name);
    if (!quoteEvent && events[0]) setQuoteEvent(events[0].name);
  }, [clients, events, quoteClient, quoteEvent]);

  // Handle create Quote
  const handleSaveQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = quoteItems.reduce((sum, it) => sum + (it.total || 0), 0);
    setQuoteFormError('');
    setIsSavingQuote(true);
    try {
      let saved = false;
      if (quoteBeingRevised) {
        saved = Boolean(await createQuoteVersion(quoteBeingRevised.id, {
          clientName: quoteClient.trim(),
          eventName: quoteEvent.trim(),
          date: new Date().toISOString().split('T')[0],
          validUntil: quoteValidity,
          totalAmount: total,
          items: quoteItems,
          changeReason: quoteChangeReason,
        }));
      } else if (quoteBeingEdited) {
        saved = await updateQuote({
          ...quoteBeingEdited,
          clientName: quoteClient.trim(),
          eventName: quoteEvent.trim(),
          validUntil: quoteValidity,
          totalAmount: total,
          items: quoteItems,
        });
      } else {
        saved = Boolean(await addQuote({
          clientName: quoteClient.trim(),
          eventName: quoteEvent.trim(),
          date: new Date().toISOString().split('T')[0],
          validUntil: quoteValidity,
          totalAmount: total,
          status: 'Envoyé',
          items: quoteItems,
        }));
      }

      if (!saved) {
        setQuoteFormError('Le devis n’a pas été enregistré. Vérifiez le serveur puis réessayez.');
        return;
      }

      setIsQuoteModalOpen(false);
      setQuoteBeingRevised(null);
      setQuoteBeingEdited(null);
      setQuoteChangeReason('');
    } finally {
      setIsSavingQuote(false);
    }
  };

  const openQuoteVersionModal = (quote: Quote) => {
    setQuoteBeingRevised(quote);
    setQuoteBeingEdited(null);
    setQuoteClient(quote.clientName);
    setQuoteEvent(quote.eventName);
    setQuoteValidity(quote.validUntil);
    setQuoteItems(quote.items.map((item) => ({ ...item })));
    setQuoteChangeReason('');
    setIsQuoteModalOpen(true);
  };

  const openQuoteEditModal = (quote: Quote) => {
    setQuoteBeingRevised(null);
    setQuoteBeingEdited(quote);
    setQuoteClient(quote.clientName);
    setQuoteEvent(quote.eventName);
    setQuoteValidity(quote.validUntil);
    setQuoteItems(quote.items.map((item) => ({ ...item })));
    setQuoteFormError('');
    setIsQuoteModalOpen(true);
  };

  const closeQuoteModal = () => {
    setIsQuoteModalOpen(false);
    setQuoteBeingRevised(null);
    setQuoteBeingEdited(null);
    setQuoteChangeReason('');
    setQuoteFormError('');
  };

  const openQuoteCreateModal = () => {
    setQuoteBeingEdited(null);
    setQuoteBeingRevised(null);
    setQuoteChangeReason('');
    setQuoteClient(clients[0]?.name || '');
    setQuoteEvent(events[0]?.name || '');
    setQuoteItems([{ description: '', quantity: 1, unitPrice: 0, total: 0 }]);
    setQuoteFormError('');
    setIsQuoteModalOpen(true);
  };

  const handleDeleteQuote = async (quote: Quote) => {
    if (!confirm(`Supprimer le brouillon ${quote.quoteNumber} ?`)) return;
    setQuoteActionError('');
    const deleted = await deleteQuote(quote.id);
    if (!deleted) setQuoteActionError('Ce devis ne peut pas être supprimé : il est peut-être déjà envoyé, lié à un événement ou possède des versions.');
  };

  // Handle create Invoice
  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = invoiceGrandTotal;
    const paid = Number(invoiceInitialPaid) || 0;
    setInvoiceFormError('');
    setIsSavingInvoice(true);
    try {
      const saved = invoiceBeingEdited
        ? await updateInvoice({
            ...invoiceBeingEdited,
            clientName: invoiceClient.trim(),
            eventName: invoiceEvent.trim(),
            dueDate: invoiceDueDate,
            totalAmount: total,
            items: invoiceItemsWithTax,
          })
        : Boolean(await addInvoice({
            clientName: invoiceClient.trim(),
            eventName: invoiceEvent.trim(),
            date: new Date().toISOString().split('T')[0],
            dueDate: invoiceDueDate,
            totalAmount: total,
            paidAmount: 0,
            status: 'En attente',
            items: invoiceItemsWithTax,
          }, paid > 0 ? {
            amount: paid,
            paymentMethod: invoicePaymentMethod,
            comment: 'Paiement initial à la création de facture',
          } : undefined));

      if (!saved) {
        setInvoiceFormError('La facture n’a pas été enregistrée. Vérifiez le serveur et le montant encaissé.');
        return;
      }

      setIsInvoiceModalOpen(false);
      setInvoiceBeingEdited(null);
      setInvoiceInitialPaid(0);
    } finally {
      setIsSavingInvoice(false);
    }
  };

  // Convert Quote to Invoice
  const handleConvertQuoteToInvoice = async (quote: Quote) => {
    if (!['Brouillon', 'Envoyé'].includes(quote.status)) return;
    const invoice = await addInvoice({
      clientName: quote.clientName,
      eventName: quote.eventName,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      totalAmount: quote.totalAmount,
      paidAmount: 0,
      status: 'En attente',
      items: quote.items,
    });
    if (!invoice) {
      setQuoteActionError('La facture n’a pas pu être créée. Le devis reste inchangé.');
      return;
    }
    const accepted = await updateQuoteStatus(quote.id, 'Accepté');
    if (!accepted) {
      await deleteInvoice(invoice.id);
      setQuoteActionError('La validation du devis a échoué. La facture a été annulée, réessayez.');
      return;
    }
    setQuoteActionError('');
    setActiveSubTab('facture');
  };

  // Handle Record Payment on Invoice
  const handleRecordInvoicePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentInvoice || paymentAmount <= 0) return;
    setPaymentError('');
    setIsRecordingPayment(true);
    try {
      const saved = await recordInvoicePayment(paymentInvoice.id, {
        amount: paymentAmount,
        paymentMethod,
        comment: paymentComment,
      });
      if (!saved) {
        setPaymentError('Le paiement n’a pas été enregistré. Vérifiez le montant restant et réessayez.');
        return;
      }
      setPaymentInvoice(null);
      setPaymentAmount(0);
      setPaymentComment('MVola Réf: ');
    } finally {
      setIsRecordingPayment(false);
    }
  };

  // Items row handlers for quote modal
  const addQuoteItemRow = () => {
    setQuoteItems((current) => [...current, { description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const updateQuoteItemRow = (index: number, field: keyof QuoteItem, value: any) => {
    const updated = [...quoteItems];
    const row = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      row.total = (Number(row.quantity) || 0) * (Number(row.unitPrice) || 0);
    }
    updated[index] = row;
    setQuoteItems(updated);
  };

  const removeQuoteItemRow = (index: number) => {
    setQuoteItems((current) => current.length > 1 ? current.filter((_, i) => i !== index) : current);
  };

  const addInvoiceItemRow = () => {
    setInvoiceItems((current) => [...current, { description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const updateInvoiceItemRow = (index: number, field: keyof QuoteItem, value: string | number) => {
    setInvoiceItems((current) => current.map((item, itemIndex) => {
      if (itemIndex !== index) return item;
      const updated = { ...item, [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        updated.total = (Number(updated.quantity) || 0) * (Number(updated.unitPrice) || 0);
      }
      return updated;
    }));
  };

  const removeInvoiceItemRow = (index: number) => {
    setInvoiceItems((current) => current.length > 1 ? current.filter((_, itemIndex) => itemIndex !== index) : current);
  };

  const openInvoiceEditModal = (invoice: Invoice) => {
    setInvoiceBeingEdited(invoice);
    const matchingClient = clients.find((client) => client.name === invoice.clientName);
    const matchingEvent = events.find((event) => event.clientId === matchingClient?.id && event.name === invoice.eventName);
    setInvoiceClient(invoice.clientName);
    setInvoiceClientSearch(invoice.clientName);
    setInvoiceClientId(matchingClient?.id || '');
    setInvoiceEvent(invoice.eventName);
    setInvoiceEventSearch(invoice.eventName);
    setInvoiceEventId(matchingEvent?.id || '');
    setInvoiceDueDate(invoice.dueDate);
    const taxItem = invoice.items.find((item) => /^TVA \(\d+(?:\.\d+)?%\)$/.test(item.description));
    const taxRate = taxItem && invoice.totalAmount - taxItem.total > 0
      ? Math.round(taxItem.total / (invoice.totalAmount - taxItem.total) * 100)
      : 0;
    setInvoiceTaxRate(taxRate);
    setInvoiceItems(invoice.items.filter((item) => item !== taxItem).map((item) => ({ ...item })));
    setInvoiceInitialPaid(0);
    setInvoiceFormError('');
    setIsInvoiceModalOpen(true);
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
    if (!confirm(`Supprimer la facture ${invoice.invoiceNumber} ?`)) return;
    setInvoiceActionError('');
    const deleted = await deleteInvoice(invoice.id);
    if (!deleted) setInvoiceActionError('La facture ne peut pas être supprimée car un paiement a déjà été enregistré.');
  };

  // Open invoice modal with a fresh search state
  const handleOpenInvoiceModal = () => {
    setInvoiceBeingEdited(null);
    setInvoiceClientSearch(clients[0]?.name || '');
    setInvoiceClientId(clients[0]?.id || '');
    setInvoiceClient(clients[0]?.name || '');
    setInvoiceEventSearch('');
    setInvoiceEventId('');
    setInvoiceEvent('');
    setInvoiceItems([{ description: '', quantity: 1, unitPrice: 0, total: 0 }]);
    setInvoiceInitialPaid(0);
    setInvoiceTaxRate(20);
    setInvoiceFormError('');
    setIsInvoiceModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header with Tab Switcher */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/80 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Devis & Factures Officielles
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Édition, chiffrage en Ariary, suivi d'acceptation et recouvrement pour Efficiency Wedding Madagascar
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Switcher + Action Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              id="tab-btn-devis"
              onClick={() => setActiveSubTab('devis')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeSubTab === 'devis'
                  ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Devis ({quotes.length})
            </button>
            <button
              id="tab-btn-factures"
              onClick={() => setActiveSubTab('facture')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeSubTab === 'facture'
                  ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Factures ({invoices.length})
            </button>
          </div>

          {activeSubTab === 'devis' ? (
            <button
              id="btn-new-quote"
              onClick={openQuoteCreateModal}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Créer un Devis</span>
            </button>
          ) : (
            <button
              id="btn-new-invoice"
              onClick={handleOpenInvoiceModal}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Émettre une Facture</span>
            </button>
          )}
        </div>
      </div>

      {activeSubTab === 'devis' && quotesLoadError && (
        <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">{quotesLoadError}</div>
      )}
      {activeSubTab === 'facture' && invoicesLoadError && (
        <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">{invoicesLoadError}</div>
      )}
      {quoteActionError && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">{quoteActionError}</div>}
      {invoiceActionError && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">{invoiceActionError}</div>}

      {/* KPI Stats Bar */}
      {activeSubTab === 'devis' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Volume Devisé</span>
            <p className="text-xl font-black text-slate-900 mt-2">{formatAriary(totalQuotesAmount)}</p>
            <p className="text-[11px] text-slate-500 mt-1">{quotes.length} propositions émises</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Devis Acceptés</span>
            <p className="text-xl font-black text-emerald-800 mt-2">{formatAriary(acceptedQuotesTotal)}</p>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">{acceptedQuotes.length} contrats validés</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Taux de Conversion</span>
            <p className="text-xl font-black text-amber-600 mt-2">{conversionRate}%</p>
            <p className="text-[11px] text-slate-500 mt-1">Ratio signatures / propositions</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">En Négociation</span>
            <p className="text-xl font-black text-blue-900 mt-2">
              {quotes.filter((q) => q.status === 'Envoyé').length} en attente
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Relances en cours</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Facturé</span>
            <p className="text-xl font-black text-slate-900 mt-2">{formatAriary(totalInvoicedAmount)}</p>
            <p className="text-[11px] text-slate-500 mt-1">{invoices.length} factures générées</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Déjà Encaissé</span>
            <p className="text-xl font-black text-emerald-700 mt-2">{formatAriary(totalPaidInvoices)}</p>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">Trésorerie perçue</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reste à Recouvrer</span>
            <p className="text-xl font-black text-amber-700 mt-2">{formatAriary(totalRemainingToCollect)}</p>
            <p className="text-[11px] text-slate-500 mt-1">Soldes et tranches dus</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Factures en Retard</span>
            <p className="text-xl font-black text-rose-700 mt-2">{overdueInvoicesCount}</p>
            <p className="text-[11px] text-slate-500 mt-1">Nécessite relance urgente</p>
          </div>
        </div>
      )}

      {/* Search & Status Filters */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeSubTab === 'devis'
                ? 'Rechercher par N° devis, client, événement...'
                : 'Rechercher par N° facture, client, événement...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg outline-hidden focus:border-amber-500 bg-slate-50 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {activeSubTab === 'devis' ? (
            <select
              value={quoteStatusFilter}
              onChange={(e) => setQuoteStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white outline-hidden text-slate-700 font-medium cursor-pointer"
            >
              <option value="all">Tous les statuts de devis</option>
              <option value="Accepté">Accepté (Contrat signé)</option>
              <option value="Envoyé">Envoyé au client</option>
              <option value="Brouillon">Brouillon</option>
              <option value="Refusé">Refusé / Annulé</option>
              <option value="Remplacé">Remplacé</option>
            </select>
          ) : (
            <select
              value={invoiceStatusFilter}
              onChange={(e) => setInvoiceStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white outline-hidden text-slate-700 font-medium cursor-pointer"
            >
              <option value="all">Tous les statuts de facture</option>
              <option value="Payée">Entièrement Payée</option>
              <option value="Partiellement payée">Partiellement Payée</option>
              <option value="En attente">En attente de paiement</option>
              <option value="En retard">Échéance dépassée</option>
            </select>
          )}
        </div>
      </div>

      {/* TAB CONTENT: DEVIS */}
      {activeSubTab === 'devis' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">N° Devis</th>
                  <th className="px-4 py-3.5">Client</th>
                  <th className="px-4 py-3.5">Événement & Prestations</th>
                  <th className="px-4 py-3.5">Date Émission</th>
                  <th className="px-4 py-3.5">Validité Jusqu'au</th>
                  <th className="px-4 py-3.5 text-right">Montant Total</th>
                  <th className="px-4 py-3.5">Statut</th>
                  <th className="px-4 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotesLoading ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-500">Chargement des devis…</td></tr>
                ) : filteredQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-slate-600">Aucun devis trouvé</p>
                      <p className="text-xs text-slate-400 mt-1">Créez votre première proposition financière ci-dessus.</p>
                    </td>
                  </tr>
                ) : (
                  filteredQuotes.map((q) => {
                    const statusSt = getStatusColor(q.status);
                    return (
                      <tr key={q.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-4 py-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                          <span className="px-2 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200 font-bold">
                            {q.quoteNumber}
                          </span>
                          <span className="ml-1 text-[10px] text-slate-500">v{q.version}</span>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-900">{q.clientName}</td>
                        <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate">
                          <p className="font-medium text-slate-800">{q.eventName}</p>
                          <p className="text-[11px] text-slate-400">{q.items.length} lignes de prestations</p>
                          {q.changeReason && (
                            <p className="text-[11px] text-slate-500" title={q.changeReason}>
                              Motif : {q.changeReason}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                          {formatShortDateFr(q.date)}
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                          {formatShortDateFr(q.validUntil)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-black text-slate-950 text-sm whitespace-nowrap">
                          {formatAriary(q.totalAmount)}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusSt.bg} ${statusSt.text} ${statusSt.border}`}
                          >
                            {q.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setSelectedQuote(q)}
                              className="p-1.5 text-slate-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="Voir et imprimer le devis"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => downloadQuotePdf(q)}
                              className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg cursor-pointer"
                              title="Télécharger le PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            {q.status === 'Brouillon' && (
                              <>
                                <button type="button" onClick={() => openQuoteEditModal(q)} className="p-1.5 text-slate-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg" title="Modifier le brouillon" aria-label={`Modifier ${q.quoteNumber}`}>
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button type="button" onClick={() => void handleDeleteQuote(q)} className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg" title="Supprimer le brouillon" aria-label={`Supprimer ${q.quoteNumber}`}>
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            {q.status === 'Envoyé' && (
                              <button
                                onClick={() => openQuoteVersionModal(q)}
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                                title="Créer une nouvelle version de ce devis"
                              >
                                <Layers className="w-3 h-3" />
                                <span>Réviser</span>
                              </button>
                            )}
                            {['Brouillon', 'Envoyé'].includes(q.status) ? (
                              <button
                                onClick={() => void handleConvertQuoteToInvoice(q)}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                                title="Valider et convertir en Facture"
                              >
                                <CheckCircle className="w-3 h-3" />
                                <span>Facturer</span>
                              </button>
                            ) : q.status === 'Accepté' ? (
                              q.eventId ? (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Événement créé
                              </span>
                              ) : (
                                <button
                                  onClick={() => openCreateEventModalFromQuote(q)}
                                  className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                                  title="Créer un événement à partir de cette version acceptée"
                                >
                                  <Calendar className="w-3 h-3" />
                                  <span>Créer événement</span>
                                </button>
                              )
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: FACTURES */}
      {activeSubTab === 'facture' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">N° Facture</th>
                  <th className="px-4 py-3.5">Client</th>
                  <th className="px-4 py-3.5">Événement</th>
                  <th className="px-4 py-3.5">Date Émission</th>
                  <th className="px-4 py-3.5">Échéance</th>
                  <th className="px-4 py-3.5 text-right">Total Facturé</th>
                  <th className="px-4 py-3.5 text-right">Déjà Payé</th>
                  <th className="px-4 py-3.5 text-right">Reste Dû</th>
                  <th className="px-4 py-3.5">Statut</th>
                  <th className="px-4 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoicesLoading ? (
                  <tr><td colSpan={10} className="px-4 py-12 text-center text-slate-500">Chargement des factures…</td></tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-slate-400">
                      <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-slate-600">Aucune facture trouvée</p>
                      <p className="text-xs text-slate-400 mt-1">Créez votre première facture ci-dessus.</p>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const remaining = Math.max(0, inv.totalAmount - inv.paidAmount);
                    const statusSt = getStatusColor(inv.status);
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-4 py-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                          <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold">
                            {inv.invoiceNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-900">{inv.clientName}</td>
                        <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate">{inv.eventName}</td>
                        <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                          {formatShortDateFr(inv.date)}
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                          {formatShortDateFr(inv.dueDate)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                          {formatAriary(inv.totalAmount)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-emerald-700 whitespace-nowrap">
                          {formatAriary(inv.paidAmount)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-black text-rose-700 whitespace-nowrap">
                          {remaining > 0 ? formatAriary(remaining) : 'Soldé'}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusSt.bg} ${statusSt.text} ${statusSt.border}`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setSelectedInvoice(inv)}
                              className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Voir et imprimer la facture"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {inv.paidAmount === 0 && (
                              <>
                                <button type="button" onClick={() => openInvoiceEditModal(inv)} className="p-1.5 text-slate-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg" title="Modifier la facture non encaissée" aria-label={`Modifier ${inv.invoiceNumber}`}>
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button type="button" onClick={() => void handleDeleteInvoice(inv)} className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg" title="Supprimer la facture non encaissée" aria-label={`Supprimer ${inv.invoiceNumber}`}>
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            {remaining > 0 && (
                              <button
                                onClick={() => {
                                  setPaymentInvoice(inv);
                                  setPaymentAmount(remaining);
                                  setPaymentError('');
                                  setPaymentComment('MVola Réf: ');
                                }}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                                title="Encaisser un paiement sur cette facture"
                              >
                                <DollarSign className="w-3 h-3" />
                                <span>Encaisser</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRINT & PREVIEW MODAL FOR QUOTE */}
      {selectedQuote && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-xs">
          <div className="flex min-h-full items-start justify-center p-3 sm:p-6">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-2 sm:my-6 border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-5 h-5 text-amber-400 shrink-0" />
                  <h3 className="text-sm font-bold truncate">Devis Officiel — {selectedQuote.quoteNumber}</h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimer Devis</span>
                  </button>
                  <button
                    onClick={() => setSelectedQuote(null)}
                    className="text-slate-400 hover:text-white p-1 text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-base font-black text-slate-950 tracking-wider">
                      EFFICIENCY WEDDING MADAGASCAR
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Agence Événementielle & Wedding Planner de Prestige
                      <br />
                      Antanimena, Antananarivo 101, Madagascar
                      <br />
                      Tél : +261 34 11 000 01 • contact@efficiencywedding.mg
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded bg-amber-100 text-amber-900 border border-amber-200">
                      DEVIS PROPOSITION
                    </span>
                    <h3 className="text-sm font-mono font-bold text-slate-900 mt-2">
                      {selectedQuote.quoteNumber}
                    </h3>
                    <p className="text-xs text-slate-500">Date : {formatDateFr(selectedQuote.date)}</p>
                    <p className="text-xs text-slate-500">Validité : {formatDateFr(selectedQuote.validUntil)}</p>
                  </div>
                </div>

                {/* Client and Event */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Client :</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedQuote.clientName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Événement :</span>
                    <p className="font-semibold text-slate-800 text-sm mt-0.5">{selectedQuote.eventName}</p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Désignation des Prestations</th>
                        <th className="p-2.5 text-center">Qté</th>
                        <th className="p-2.5 text-right whitespace-nowrap">Prix Unitaire</th>
                        <th className="p-2.5 text-right whitespace-nowrap">Total Ariary</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedQuote.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-medium text-slate-800 break-words">{it.description}</td>
                          <td className="p-2.5 text-center">{it.quantity}</td>
                          <td className="p-2.5 text-right text-slate-600 whitespace-nowrap">{formatAriary(it.unitPrice)}</td>
                          <td className="p-2.5 text-right font-bold text-slate-900 whitespace-nowrap">{formatAriary(it.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total Ariary */}
                <div className="pt-4 border-t border-slate-200 flex justify-between items-center bg-amber-50/50 p-3 rounded-xl border border-amber-200/60">
                  <span className="text-sm font-extrabold text-slate-900">TOTAL PROPOSITION NET (Ariary) :</span>
                  <span className="text-xl font-black text-amber-700">
                    {formatAriary(selectedQuote.totalAmount)}
                  </span>
                </div>

                {/* Payment conditions */}
                <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-700">Modalités de règlement :</p>
                  <p>• Acompte de réservation : 50% à la signature de contrat.</p>
                  <p>• Tranche intermédiaire : 30% un mois avant l'événement.</p>
                  <p>• Solde final : 20% au plus tard le jour J avant le début de la réception.</p>
                  <p>• Modes acceptés : MVola, Orange Money, Virement BNI Madagascar, Espèces à l'agence.</p>
                </div>

                {/* Signatures */}
                <div className="pt-3 border-t border-slate-200 flex justify-between items-end text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Pour le Client :</p>
                    <p className="text-[10px] text-slate-500 mt-1">« Bon pour accord et commande »</p>
                    <div className="w-36 h-12 border border-dashed border-slate-300 rounded mt-1"></div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Efficiency Wedding Madagascar :</p>
                    <p className="text-[10px] text-slate-500 mt-1">La Direction</p>
                    <div className="w-36 h-12 border border-dashed border-slate-300 rounded mt-1 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                      Cachet & Signature
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT & PREVIEW MODAL FOR INVOICE */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-xs">
          <div className="flex min-h-full items-start justify-center p-3 sm:p-6">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-2 sm:my-6 border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Receipt className="w-5 h-5 text-emerald-400 shrink-0" />
                  <h3 className="text-sm font-bold truncate">Facture Officielle — {selectedInvoice.invoiceNumber}</h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimer Facture</span>
                  </button> */}
                  <button
                    onClick={() => downloadInvoicePdf(selectedInvoice)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Télécharger PDF</span>
                  </button>
                  <button
                    onClick={() => shareInvoicePdf(selectedInvoice)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 bg-slate-700 text-white font-bold rounded-lg cursor-pointer"
                    title="Partager (WhatsApp, e-mail...)"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="text-slate-400 hover:text-white p-1 text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-base font-black text-slate-950 tracking-wider">
                      EFFICIENCY WEDDING MADAGASCAR
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Agence Événementielle & Wedding Planner de Prestige
                      <br />
                      Antanimena, Antananarivo 101, Madagascar
                      <br />
                      NIF: 4001293847 • STAT: 93290 11 2019 0 04821
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                      FACTURE PRO-FORMA / DEFINITIVE
                    </span>
                    <h3 className="text-sm font-mono font-bold text-slate-900 mt-2">
                      {selectedInvoice.invoiceNumber}
                    </h3>
                    <p className="text-xs text-slate-500">Émission : {formatDateFr(selectedInvoice.date)}</p>
                    <p className="text-xs text-slate-500">Échéance : {formatDateFr(selectedInvoice.dueDate)}</p>
                  </div>
                </div>

                {/* Client Info */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Facturé à :</span>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedInvoice.clientName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Objet / Événement :</span>
                    <p className="font-semibold text-slate-800 text-sm mt-0.5">{selectedInvoice.eventName}</p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Désignation</th>
                        <th className="p-2.5 text-center">Qté</th>
                        <th className="p-2.5 text-right whitespace-nowrap">Prix Unitaire</th>
                        <th className="p-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedInvoice.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-medium text-slate-800 break-words">{it.description}</td>
                          <td className="p-2.5 text-center">{it.quantity}</td>
                          <td className="p-2.5 text-right text-slate-600 whitespace-nowrap">{formatAriary(it.unitPrice)}</td>
                          <td className="p-2.5 text-right font-bold text-slate-900 whitespace-nowrap">{formatAriary(it.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Balance */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between font-medium text-slate-600">
                    <span>Montant Total Facturé :</span>
                    <span className="font-bold text-slate-900">{formatAriary(selectedInvoice.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-emerald-700">
                    <span>Montant Déjà Réglé / Encaissé :</span>
                    <span className="font-bold">-{formatAriary(selectedInvoice.paidAmount)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-black">
                    <span className="text-slate-900">RESTE NET À PAYER (Ariary) :</span>
                    <span className="text-lg text-rose-700">
                      {formatAriary(Math.max(0, selectedInvoice.totalAmount - selectedInvoice.paidAmount))}
                    </span>
                  </div>
                </div>

                {/* Bank Transfer Details */}
                <div className="text-[11px] text-slate-600 bg-emerald-50/60 p-3 rounded-xl border border-emerald-200 space-y-1">
                  <p className="font-bold text-emerald-950">Coordonnées de règlement à Madagascar :</p>
                  <p>• <strong>BNI Madagascar</strong> : Agence Antanimena — Compte N° 00004 01234 56789012345 67</p>
                  <p>• <strong>MVola</strong> : 034 11 000 01 (Efficiency Wedding)</p>
                  <p>• <strong>Orange Money</strong> : 032 11 000 01</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW QUOTE */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>{quoteBeingRevised ? `Créer la version ${quoteBeingRevised.version + 1}` : quoteBeingEdited ? `Modifier ${quoteBeingEdited.quoteNumber}` : 'Créer un Nouveau Devis'}</span>
              </h3>
              <button
                onClick={closeQuoteModal}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuote} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nom du Client *</label>
                  <input
                    type="text"
                    required
                    value={quoteClient}
                    onChange={(e) => setQuoteClient(e.target.value)}
                    placeholder="M. & Mme..."
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Intitulé de l'Événement *</label>
                  <input
                    type="text"
                    required
                    value={quoteEvent}
                    onChange={(e) => setQuoteEvent(e.target.value)}
                    placeholder="Mariage, Jubilé..."
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              {quoteBeingRevised && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Motif de la modification *</label>
                  <textarea
                    required
                    value={quoteChangeReason}
                    onChange={(e) => setQuoteChangeReason(e.target.value)}
                    placeholder="Précisez les changements convenus avec le client..."
                    rows={2}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:border-amber-500"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Validité jusqu'au</label>
                <input
                  type="date"
                  value={quoteValidity}
                  onChange={(e) => setQuoteValidity(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                />
              </div>

              {/* Service selection from catalog */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">Ajouter une prestation depuis le catalogue</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="search"
                    value={quoteServiceSearch}
                    onChange={(e) => setQuoteServiceSearch(e.target.value)}
                    placeholder="Rechercher une prestation..."
                    className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-lg bg-white outline-hidden focus:border-amber-500"
                  />
                </div>
                {quoteServiceSearch.trim() && filteredCatalogServices.length > 0 && (
                  <div className="max-h-40 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-sm divide-y divide-slate-100">
                    {filteredCatalogServices.map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => addServiceToQuote(service)}
                        className="w-full px-3 py-2 text-left hover:bg-amber-50 transition-colors"
                      >
                        <span className="block text-[10px] font-mono text-slate-400">{service.category}</span>
                        <span className="block text-xs font-semibold text-slate-800">{service.name}</span>
                        <span className="block text-[10px] text-slate-500">{service.unitPrice.toLocaleString('fr-MG')} Ar · {service.unit}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">Lignes de prestations & tarifs (Ariary)</label>
                  <button
                    type="button"
                    onClick={addQuoteItemRow}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
                  >
                    + Ajouter une ligne
                  </button>
                </div>

                <div className="space-y-2">
                  {quoteItems.map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6">
                        <input
                          type="text"
                          required
                          placeholder="Désignation"
                          value={item.description}
                          onChange={(e) => updateQuoteItemRow(idx, 'description', e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qté"
                          value={item.quantity}
                          onChange={(e) => updateQuoteItemRow(idx, 'quantity', Number(e.target.value))}
                          className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded-md bg-white text-center"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          step="50000"
                          placeholder="Prix Unitaire (Ar)"
                          value={item.unitPrice}
                          onChange={(e) => updateQuoteItemRow(idx, 'unitPrice', Number(e.target.value))}
                          className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded-md bg-white text-right font-mono"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeQuoteItemRow(idx)}
                          className="text-slate-400 hover:text-rose-600 text-xs p-1"
                          title="Supprimer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950">Total Calculé du Devis :</span>
                <span className="text-base font-black text-amber-900">
                  {formatAriary(quoteItems.reduce((sum, it) => sum + (it.total || 0), 0))}
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                {quoteFormError && <p role="alert" className="mr-auto self-center text-xs text-rose-700">{quoteFormError}</p>}
                <button
                  type="button"
                  onClick={closeQuoteModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingQuote}
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSavingQuote ? 'Enregistrement…' : quoteBeingRevised ? 'Créer la nouvelle version' : quoteBeingEdited ? 'Enregistrer les modifications' : 'Enregistrer le Devis'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW INVOICE */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>{invoiceBeingEdited ? `Modifier ${invoiceBeingEdited.invoiceNumber}` : 'Créer une Facture Officielle'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsInvoiceModalOpen(false);
                  setInvoiceBeingEdited(null);
                }}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Recherche Client */}
                <div className="relative">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Client à Facturer *</label>
                  <input
                    type="text"
                    required
                    value={invoiceClientSearch}
                    onChange={(e) => {
                      setInvoiceClientSearch(e.target.value);
                      setInvoiceClient(e.target.value);
                      setInvoiceClientId('');
                    }}
                    onFocus={() => setIsInvoiceClientDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsInvoiceClientDropdownOpen(false), 150)}
                    placeholder="Rechercher un client par nom, tél, email..."
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:border-emerald-500"
                  />
                  {isInvoiceClientDropdownOpen && invoiceClientMatches.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {invoiceClientMatches.map((client) => (
                        <button
                          type="button"
                          key={client.id}
                          onMouseDown={() => {
                            setInvoiceClient(client.name);
                            setInvoiceClientId(client.id);
                            setInvoiceClientSearch(client.name);
                            // On change de client, on réinitialise l'événement sélectionné
                            setInvoiceEvent('');
                            setInvoiceEventId('');
                            setInvoiceEventSearch('');
                            setIsInvoiceClientDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 cursor-pointer border-b border-slate-100 last:border-0"
                        >
                          <p className="font-bold text-slate-900">
                            <span className="font-mono text-emerald-700">{client.id}</span> — {client.name}
                          </p>
                          <p className="text-[10px] text-slate-400">{client.phone} • {client.email}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recherche Événement (filtré par client sélectionné) */}
                <div className="relative">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Événement *</label>
                  <input
                    type="text"
                    required
                    value={invoiceEventSearch}
                    onChange={(e) => {
                      setInvoiceEventSearch(e.target.value);
                      setInvoiceEvent(e.target.value);
                      setInvoiceEventId('');
                    }}
                    onFocus={() => setIsInvoiceEventDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsInvoiceEventDropdownOpen(false), 150)}
                    placeholder={invoiceClientId ? 'Rechercher un événement...' : "Sélectionnez d'abord un client"}
                    disabled={!invoiceBeingEdited && !invoiceClientId}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden focus:border-emerald-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                  {isInvoiceEventDropdownOpen && invoiceEventMatches.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {invoiceEventMatches.map((event) => (
                        <button
                          type="button"
                          key={event.id}
                          onMouseDown={() => {
                            setInvoiceEvent(event.name);
                            setInvoiceEventId(event.id);
                            setInvoiceEventSearch(event.name);
                            setIsInvoiceEventDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 cursor-pointer border-b border-slate-100 last:border-0"
                        >
                          <p className="font-bold text-slate-900">
                            <span className="font-mono text-emerald-700">{event.id}</span> — {event.name}
                          </p>
                          <p className="text-[10px] text-slate-400">{event.location}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Date d'Échéance *</label>
                  <input
                    type="date"
                    required
                    value={invoiceDueDate}
                    onChange={(e) => setInvoiceDueDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden"
                  />
                </div>
                <div>
                  {!invoiceBeingEdited && (
                    <>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Montant Encaissé Immédiat (Ariary)</label>
                      <input
                        type="number"
                        min="0"
                        max={invoiceGrandTotal}
                        step="100000"
                        value={invoiceInitialPaid}
                        onChange={(e) => setInvoiceInitialPaid(Number(e.target.value))}
                        placeholder="0 si aucun acompte encaissé"
                        className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden font-mono"
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">Détails de la facturation</label>
                  <button type="button" onClick={addInvoiceItemRow} className="text-xs font-bold text-emerald-700 hover:text-emerald-800">+ Ajouter une ligne</button>
                </div>
                {invoiceItems.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <input
                        type="text"
                        required
                        value={item.description}
                        onChange={(e) => updateInvoiceItemRow(idx, 'description', e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateInvoiceItemRow(idx, 'quantity', Number(e.target.value))}
                        className="w-full text-xs px-2 py-1.5 border border-slate-300 rounded-md bg-white text-center"
                      />
                    </div>
                    <div className="col-span-4">
                      <input
                        type="number"
                        min="0"
                        step="50000"
                        value={item.unitPrice}
                        onChange={(e) => updateInvoiceItemRow(idx, 'unitPrice', Number(e.target.value))}
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white font-mono text-right"
                      />
                    </div>
                    <div className="col-span-1 text-center">
                      <button type="button" onClick={() => removeInvoiceItemRow(idx)} aria-label="Supprimer cette ligne" className="p-1 text-slate-400 hover:text-rose-600">×</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-900">
                <span>Sous-total</span><span>{formatAriary(invoiceSubtotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-xs">
                <label htmlFor="invoice-tax-rate" className="font-semibold text-slate-600">Taux de taxe (%)</label>
                <input id="invoice-tax-rate" type="number" min="0" max="100" value={invoiceTaxRate} onChange={(e) => setInvoiceTaxRate(Number(e.target.value) || 0)} className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-right" />
                <strong className="text-slate-900">Total : {formatAriary(invoiceGrandTotal)}</strong>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                {invoiceFormError && <p role="alert" className="mr-auto self-center text-xs text-rose-700">{invoiceFormError}</p>}
                <button
                  type="button"
                  onClick={() => {
                    setIsInvoiceModalOpen(false);
                    setInvoiceBeingEdited(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingInvoice || invoiceItems.length === 0}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSavingInvoice ? 'Enregistrement…' : invoiceBeingEdited ? 'Enregistrer les modifications' : 'Générer la Facture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK PAYMENT MODAL ON INVOICE */}
      {paymentInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Encaisser un Versement — {paymentInvoice.invoiceNumber}</span>
              </h3>
              <button
                onClick={() => {
                  setPaymentInvoice(null);
                  setPaymentError('');
                }}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordInvoicePayment} className="p-5 space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
                <p className="text-slate-500">Client : <strong className="text-slate-900">{paymentInvoice.clientName}</strong></p>
                <p className="text-slate-500">Facture : <strong className="text-slate-900">{paymentInvoice.eventName}</strong></p>
                <p className="text-slate-500">Reste net à régler : <strong className="text-rose-700 font-bold">{formatAriary(paymentInvoice.totalAmount - paymentInvoice.paidAmount)}</strong></p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Montant du Paiement (Ariary) *</label>
                <input
                  type="number"
                  min="1"
                  max={Math.max(0, paymentInvoice.totalAmount - paymentInvoice.paidAmount)}
                  step="50000"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden font-bold font-mono text-emerald-800 text-base"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mode de Paiement *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden bg-white font-medium"
                >
                  <option value="Mobile Money">Mobile Money (MVola / Orange Money)</option>
                  <option value="Virement bancaire">Virement bancaire (BNI / BMOI)</option>
                  <option value="Espèces">Espèces (En agence Antanimena)</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Référence / Reçu</label>
                <input
                  type="text"
                  value={paymentComment}
                  onChange={(e) => setPaymentComment(e.target.value)}
                  placeholder="Réf MVola, Réf Virement..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-hidden font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                {paymentError && <p role="alert" className="mr-auto self-center text-xs text-rose-700">{paymentError}</p>}
                <button
                  type="button"
                  onClick={() => {
                    setPaymentInvoice(null);
                    setPaymentError('');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isRecordingPayment || paymentAmount <= 0 || paymentAmount > paymentInvoice.totalAmount - paymentInvoice.paidAmount}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isRecordingPayment ? 'Enregistrement…' : 'Valider & Encaisser'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
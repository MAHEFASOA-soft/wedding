import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  MapPin,
  Clock,
  Users,
  Sparkles,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EventItem, EventType } from '../../types';
import { formatAriary, formatDateFr, formatShortDateFr, getStatusColor } from '../../utils/formatters';

type CalendarViewMode = 'month' | 'week' | 'day';

export const PlanningView: React.FC = () => {
  const { events, setSelectedEventForModal, openCreateEventModal } = useApp();

  // Current calendar browsing date (defaults to current active month: Sept 2026)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 1)); // September 2026
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Month navigation helpers
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (viewMode === 'week') {
      const prevWeek = new Date(currentDate);
      prevWeek.setDate(prevWeek.getDate() - 7);
      setCurrentDate(prevWeek);
    } else {
      const prevDay = new Date(currentDate);
      prevDay.setDate(prevDay.getDate() - 1);
      setCurrentDate(prevDay);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (viewMode === 'week') {
      const nextWeek = new Date(currentDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setCurrentDate(nextWeek);
    } else {
      const nextDay = new Date(currentDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setCurrentDate(nextDay);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 8, 7)); // September 2026
  };

  // Filter events
  const filteredEvents = events.filter((ev) => {
    const matchesType = typeFilter === 'all' || ev.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || ev.status === statusFilter;
    return matchesType && matchesStatus;
  });

  // Month calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  // Days in month
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Day of week index (0 = Sun, 1 = Mon ... adjust for Monday first)
  const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // 0 for Monday

  const calendarDays: Array<{ date: Date; dateStr: string; isCurrentMonth: boolean }> = [];

  // Previous month padding
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    const date = new Date(year, month - 1, d);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({ date, dateStr, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({ date, dateStr, isCurrentMonth: true });
  }

  // Next month padding to fill grid (up to 35 or 42)
  const remaining = (7 - (calendarDays.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({ date, dateStr, isCurrentMonth: false });
  }

  const weekDayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="space-y-5 pb-12">
      {/* Calendar Top Controls Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Date Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              onClick={handlePrev}
              title="Précédent"
              className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-white rounded-md transition-colors"
            >
              Aujourd'hui
            </button>
            <button
              onClick={handleNext}
              title="Suivant"
              className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 capitalize tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-amber-600" />
            <span>{monthName}</span>
          </h3>
        </div>

        {/* View Switcher & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Buttons (Section 13: mois, semaine, jour) */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              id="btn-calendar-view-month"
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                viewMode === 'month'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mois
            </button>
            <button
              id="btn-calendar-view-week"
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                viewMode === 'week'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semaine
            </button>
            <button
              id="btn-calendar-view-day"
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                viewMode === 'day'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Jour
            </button>
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white outline-hidden text-slate-700"
          >
            <option value="all">Tous types</option>
            <option value="Mariage">Mariage</option>
            <option value="Fiançailles">Fiançailles (Vodiondry)</option>
            <option value="Anniversaire">Anniversaire</option>
            <option value="Cocktail / Réception">Cocktail / Réception</option>
            <option value="Gala / Soirée">Gala / Soirée</option>
          </select>

          {/* Add Event Button */}
          <button
            id="btn-plan-event"
            onClick={openCreateEventModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Planifier</span>
          </button>
        </div>
      </div>

      {/* VIEW: MONTH CALENDAR GRID */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-slate-600 text-center text-xs font-bold uppercase py-2.5">
            {weekDayNames.map((d) => (
              <div key={d} className="tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 min-h-[550px]">
            {calendarDays.map((dayItem, index) => {
              const dayEvents = filteredEvents.filter((ev) => ev.date === dayItem.dateStr);
              const isToday =
                dayItem.dateStr === '2026-09-07' ||
                dayItem.dateStr === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={index}
                  className={`p-1.5 sm:p-2 min-h-[90px] sm:min-h-[115px] flex flex-col transition-colors ${
                    !dayItem.isCurrentMonth
                      ? 'bg-slate-50/40 text-slate-300'
                      : isToday
                      ? 'bg-amber-50/20'
                      : 'bg-white hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : dayItem.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {dayItem.date.getDate()}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Events in this day (Clickable, Section 13 & 14) */}
                  <div className="space-y-1 flex-1 overflow-y-auto max-h-24 scrollbar-none">
                    {dayEvents.map((ev) => {
                      const statusStyle = getStatusColor(ev.status);
                      return (
                        <button
                          key={ev.id}
                          id={`planning-event-${ev.id}`}
                          onClick={() => setSelectedEventForModal(ev)}
                          className={`w-full text-left p-1.5 rounded-lg border text-[11px] font-semibold transition-all hover:scale-[1.02] shadow-2xs group ${
                            ev.type === 'Mariage'
                              ? 'bg-amber-50 border-amber-200 text-amber-950 hover:bg-amber-100/80'
                              : ev.type === 'Fiançailles'
                              ? 'bg-purple-50 border-purple-200 text-purple-950 hover:bg-purple-100/80'
                              : 'bg-blue-50 border-blue-200 text-blue-950 hover:bg-blue-100/80'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 leading-tight">
                            <span className="truncate font-bold">{ev.name}</span>
                            <span className="text-[9px] font-bold shrink-0 text-slate-600">
                              {ev.startTime}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-600 truncate mt-0.5">
                            {ev.clientName} • {ev.guestCount} pers.
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: WEEK CALENDAR */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h4 className="text-sm font-bold text-slate-800">
              Vue Hebdomadaire — Événements de la période
            </h4>
            <span className="text-xs text-slate-500 font-medium">
              Cliquez sur n'importe quel événement pour ouvrir sa fiche détaillée
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDayNames.map((dayName, idx) => {
              // Calculate day date for this week
              const targetDate = new Date(currentDate);
              const dayOffset = idx - ((currentDate.getDay() + 6) % 7);
              targetDate.setDate(targetDate.getDate() + dayOffset);
              const targetDateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
              const dayEvts = filteredEvents.filter((e) => e.date === targetDateStr);

              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 min-h-[280px] flex flex-col"
                >
                  <div className="text-center pb-2 border-b border-slate-200 mb-2">
                    <span className="text-xs font-bold text-slate-600 block uppercase">{dayName}</span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {targetDate.getDate()} {targetDate.toLocaleDateString('fr-FR', { month: 'short' })}
                    </span>
                  </div>

                  <div className="space-y-2 flex-1 overflow-y-auto">
                    {dayEvts.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedEventForModal(ev)}
                        className="p-2.5 rounded-lg bg-white border border-amber-200 shadow-2xs hover:shadow-xs hover:border-amber-400 cursor-pointer transition-all"
                      >
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded block w-fit mb-1">
                          {ev.startTime} — {ev.endTime}
                        </span>
                        <h5 className="text-xs font-bold text-slate-900 leading-tight">{ev.name}</h5>
                        <p className="text-[11px] text-slate-500 mt-1">{ev.clientName}</p>
                        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
                          <span>{ev.guestCount} invités</span>
                          <span className="font-bold text-slate-800">{formatAriary(ev.totalPrice)}</span>
                        </div>
                      </div>
                    ))}
                    {dayEvts.length === 0 && (
                      <p className="text-[11px] text-slate-400 text-center py-6 italic">
                        Aucun événement
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: DAY VIEW */}
      {viewMode === 'day' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Planning du {formatDateFr(currentDate.toISOString().split('T')[0])}
              </h4>
              <p className="text-xs text-slate-500">
                Coordination horaire des mariages et réceptions prévus ce jour
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {filteredEvents
              .filter(
                (e) =>
                  e.date === currentDate.toISOString().split('T')[0] ||
                  e.date.startsWith('2026-09-12') ||
                  e.date.startsWith('2026-10-20')
              )
              .map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEventForModal(ev)}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-amber-50/30 hover:border-amber-300 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-14 text-center shrink-0">
                      <span className="text-xs font-bold text-amber-700 bg-amber-100/80 px-2 py-1 rounded block">
                        {ev.startTime}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {ev.endTime}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                          {ev.code}
                        </span>
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          {ev.type}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{ev.name}</h4>
                      <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-2">
                        <span>Client : <strong>{ev.clientName}</strong></span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> {ev.location}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <span className="text-xs font-black text-slate-900 block">
                      {formatAriary(ev.totalPrice)}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium block">
                      {ev.guestCount} personnes
                    </span>
                    <button className="mt-1 text-xs font-bold text-amber-700 hover:text-amber-800">
                      Ouvrir la fiche →
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

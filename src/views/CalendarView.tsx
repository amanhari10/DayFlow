/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Gift,
  CheckSquare,
  Repeat,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CalendarEvent, CalendarViewType, Task } from '../types';
import { getTodayDateString, calculateBirthdayInfo, formatReadableDate, formatTime12h } from '../utils/helpers';
import { EventModal } from '../components/modals/EventModal';

export const CalendarView: React.FC = () => {
  const {
    events,
    tasks,
    birthdays,
    setEditingEvent,
    setEditingTask,
    settings,
  } = useApp();

  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [calendarView, setCalendarView] = useState<CalendarViewType>(settings.defaultCalendarView || 'month');
  const [selectedDateStr, setSelectedDateStr] = useState<string>(getTodayDateString());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalDate, setCreateModalDate] = useState<string>(getTodayDateString());

  const todayStr = getTodayDateString();

  // Navigation handlers
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (calendarView === 'month') {
      next.setMonth(next.getMonth() - 1);
    } else if (calendarView === 'week') {
      next.setDate(next.getDate() - 7);
    } else {
      next.setDate(next.getDate() - 1);
    }
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (calendarView === 'month') {
      next.setMonth(next.getMonth() + 1);
    } else if (calendarView === 'week') {
      next.setDate(next.getDate() + 7);
    } else {
      next.setDate(next.getDate() + 1);
    }
    setCurrentDate(next);
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(getTodayDateString());
  };

  // Month grid calculation
  const monthGridData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const firstDayIndex =
      settings.firstDayOfWeek === 'monday'
        ? (firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1)
        : firstDayOfMonth.getDay();

    const daysInMonth = lastDayOfMonth.getDate();

    const cells: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    // Prev month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, d);
      const y = prevDate.getFullYear();
      const m = String(prevDate.getMonth() + 1).padStart(2, '0');
      const dateNum = String(d).padStart(2, '0');
      const dStr = `${y}-${m}-${dateNum}`;
      cells.push({
        dateStr: dStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const m = String(month + 1).padStart(2, '0');
      const dateNum = String(d).padStart(2, '0');
      const dStr = `${year}-${m}-${dateNum}`;
      cells.push({
        dateStr: dStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dStr === todayStr,
      });
    }

    // Next month padding to fill 35 or 42 cells
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      const y = nextDate.getFullYear();
      const m = String(nextDate.getMonth() + 1).padStart(2, '0');
      const dateNum = String(d).padStart(2, '0');
      const dStr = `${y}-${m}-${dateNum}`;
      cells.push({
        dateStr: dStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dStr === todayStr,
      });
    }

    return cells;
  }, [currentDate, settings.firstDayOfWeek, todayStr]);

  // Map of date -> events, birthdays, and tasks
  const itemsByDate = useMemo(() => {
    const map = new Map<
      string,
      {
        events: CalendarEvent[];
        tasks: Task[];
        birthdays: Array<{ name: string; ageText?: string; relationship: string }>;
      }
    >();

    const getEntry = (d: string) => {
      if (!map.has(d)) {
        map.set(d, { events: [], tasks: [], birthdays: [] });
      }
      return map.get(d)!;
    };

    // Add Events
    events.forEach((e) => {
      getEntry(e.date).events.push(e);
    });

    // Add Task Deadlines
    tasks.forEach((t) => {
      getEntry(t.dueDate).tasks.push(t);
    });

    // Add Birthdays
    birthdays.forEach((b) => {
      const [by, bm, bd] = b.birthdate.split('-');
      const monthStr = bm || by;
      const dayStr = bd || bm;
      // Match with current year view
      const targetDate = `${currentDate.getFullYear()}-${monthStr.padStart(2, '0')}-${dayStr.padStart(2, '0')}`;
      const entry = getEntry(targetDate);
      const info = calculateBirthdayInfo(b);
      entry.birthdays.push({
        name: b.name,
        ageText: info.turningAge ? `(${info.turningAge})` : '',
        relationship: b.relationship,
      });
    });

    return map;
  }, [events, tasks, birthdays, currentDate]);

  // Week View calculation
  const weekDays = useMemo(() => {
    const now = new Date(currentDate);
    const day = now.getDay();
    const diff = settings.firstDayOfWeek === 'monday' ? (day === 0 ? -6 : 1 - day) : -day;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() + diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dateNum = String(d.getDate()).padStart(2, '0');
      const dStr = `${y}-${m}-${dateNum}`;
      days.push({
        date: d,
        dateStr: dStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: d.getDate(),
        isToday: dStr === todayStr,
      });
    }
    return days;
  }, [currentDate, settings.firstDayOfWeek, todayStr]);

  // Agenda items: sorted chronologically
  const agendaItems = useMemo(() => {
    const list: Array<{
      id: string;
      date: string;
      timeStr: string;
      title: string;
      type: 'event' | 'task' | 'birthday';
      category?: string;
      location?: string;
      raw?: CalendarEvent | Task;
    }> = [];

    events.forEach((e) => {
      list.push({
        id: e.id,
        date: e.date,
        timeStr: e.allDay ? 'All Day' : `${formatTime12h(e.startTime)} - ${formatTime12h(e.endTime)}`,
        title: e.title,
        type: 'event',
        category: e.category,
        location: e.location,
        raw: e,
      });
    });

    tasks.forEach((t) => {
      list.push({
        id: t.id,
        date: t.dueDate,
        timeStr: t.dueTime ? formatTime12h(t.dueTime) : 'Due Today',
        title: t.title,
        type: 'task',
        category: t.priority,
        raw: t,
      });
    });

    birthdays.forEach((b) => {
      const info = calculateBirthdayInfo(b);
      const [by, bm, bd] = b.birthdate.split('-');
      const monthStr = bm || by;
      const dayStr = bd || bm;
      const dateStr = `${currentDate.getFullYear()}-${monthStr.padStart(2, '0')}-${dayStr.padStart(2, '0')}`;
      list.push({
        id: b.id,
        date: dateStr,
        timeStr: 'All Day',
        title: `🎂 ${b.name}'s Birthday ${info.turningAge ? `(turns ${info.turningAge})` : ''}`,
        type: 'birthday',
      });
    });

    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [events, tasks, birthdays, currentDate]);

  const handleCellClick = (dStr: string) => {
    setSelectedDateStr(dStr);
  };

  const handleCellDoubleClick = (dStr: string) => {
    setCreateModalDate(dStr);
    setIsCreateModalOpen(true);
  };

  const weekdayHeaders =
    settings.firstDayOfWeek === 'monday'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5">
      {/* Calendar Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-theme">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-primary-theme">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <p className="text-xs text-secondary-theme">
              {events.length} events · {birthdays.length} birthdays tracked
            </p>
          </div>
        </div>

        {/* View Switchers & Nav */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Month / Week / Day / Agenda tabs */}
          <div className="flex items-center p-1 bg-secondary-theme rounded-xl border border-theme text-xs font-semibold">
            {(['month', 'week', 'day', 'agenda'] as CalendarViewType[]).map((v) => (
              <button
                key={v}
                onClick={() => setCalendarView(v)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                  calendarView === v
                    ? 'bg-card-theme text-primary-theme shadow-xs font-bold'
                    : 'text-secondary-theme hover:text-primary-theme'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 border border-theme rounded-xl bg-card-theme p-0.5">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg text-secondary-theme hover:bg-card-hover transition-colors"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold text-secondary-theme hover:text-primary-theme transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg text-secondary-theme hover:bg-card-hover transition-colors"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setCreateModalDate(selectedDateStr || todayStr);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Event
          </button>
        </div>
      </div>

      {/* VIEW: MONTH */}
      {calendarView === 'month' && (
        <div className="bg-card-theme rounded-2xl border border-theme shadow-xs overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-theme bg-secondary-theme/50 text-center text-xs font-bold text-secondary-theme py-2.5">
            {weekdayHeaders.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-theme">
            {monthGridData.map((cell) => {
              const dayData = itemsByDate.get(cell.dateStr);
              const isSelected = selectedDateStr === cell.dateStr;

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => handleCellClick(cell.dateStr)}
                  onDoubleClick={() => handleCellDoubleClick(cell.dateStr)}
                  className={`min-h-[110px] sm:min-h-[130px] p-2 flex flex-col justify-between transition-colors cursor-pointer group ${
                    !cell.isCurrentMonth
                      ? 'bg-secondary-theme/20 text-muted-theme'
                      : 'bg-card-theme hover:bg-card-hover'
                  } ${isSelected ? 'ring-2 ring-accent-theme ring-inset' : ''}`}
                >
                  {/* Date number header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        cell.isToday
                          ? 'bg-accent-theme text-white'
                          : cell.isCurrentMonth
                          ? 'text-primary-theme'
                          : 'text-muted-theme'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCreateModalDate(cell.dateStr);
                        setIsCreateModalOpen(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-theme hover:text-accent-theme rounded-md transition-opacity"
                      title="Add event on this date"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Items pills */}
                  <div className="mt-1 space-y-1 flex-1 overflow-hidden">
                    {/* Birthdays badge */}
                    {dayData?.birthdays.map((b, idx) => (
                      <div
                        key={`b-${idx}`}
                        className="px-1.5 py-0.5 rounded-md bg-pink-500/15 border border-pink-500/30 text-pink-500 text-[10px] font-semibold truncate flex items-center gap-1"
                        title={`${b.name}'s Birthday ${b.ageText}`}
                      >
                        <Gift className="w-3 h-3 shrink-0" />
                        <span className="truncate">{b.name} {b.ageText}</span>
                      </div>
                    ))}

                    {/* Events badges */}
                    {dayData?.events.slice(0, 3).map((e) => (
                      <div
                        key={e.id}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setEditingEvent(e);
                        }}
                        className="px-1.5 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-400 text-[10px] font-medium truncate hover:opacity-80 transition-opacity flex items-center gap-1"
                        title={`${e.title} (${e.allDay ? 'All Day' : e.startTime})`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                        <span className="truncate">{e.title}</span>
                      </div>
                    ))}

                    {/* Task deadlines badge */}
                    {dayData?.tasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setEditingTask(t);
                        }}
                        className="px-1.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-medium truncate hover:opacity-80 transition-opacity flex items-center gap-1"
                        title={`Task: ${t.title}`}
                      >
                        <CheckSquare className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{t.title}</span>
                      </div>
                    ))}

                    {/* Count overflow */}
                    {dayData &&
                      dayData.events.length + dayData.tasks.length + dayData.birthdays.length > 5 && (
                        <span className="text-[9px] text-muted-theme block text-right font-medium">
                          +{dayData.events.length + dayData.tasks.length + dayData.birthdays.length - 5} more
                        </span>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: WEEK */}
      {calendarView === 'week' && (
        <div className="bg-card-theme rounded-2xl border border-theme shadow-xs overflow-hidden">
          <div className="grid grid-cols-7 divide-x divide-theme border-b border-theme text-center py-3 bg-secondary-theme/50">
            {weekDays.map((w) => (
              <div key={w.dateStr} className="px-2">
                <span className="text-xs text-secondary-theme uppercase font-semibold block">
                  {w.dayName}
                </span>
                <span
                  className={`inline-block mt-1 text-sm font-bold w-7 h-7 rounded-full leading-7 ${
                    w.isToday ? 'bg-accent-theme text-white' : 'text-primary-theme'
                  }`}
                >
                  {w.dayNumber}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 divide-x divide-theme min-h-[450px]">
            {weekDays.map((w) => {
              const dayData = itemsByDate.get(w.dateStr);
              return (
                <div
                  key={w.dateStr}
                  onClick={() => handleCellClick(w.dateStr)}
                  className="p-2 space-y-2 hover:bg-card-hover/40 transition-colors"
                >
                  {/* Birthdays */}
                  {dayData?.birthdays.map((b, idx) => (
                    <div
                      key={`wb-${idx}`}
                      className="p-2 rounded-xl bg-pink-500/15 border border-pink-500/30 text-pink-500 text-xs font-semibold"
                    >
                      🎁 {b.name} {b.ageText}
                    </div>
                  ))}

                  {/* Events */}
                  {dayData?.events.map((e) => (
                    <div
                      key={e.id}
                      onClick={() => setEditingEvent(e)}
                      className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs cursor-pointer hover:bg-purple-500/25 transition-colors"
                    >
                      <p className="font-bold text-primary-theme truncate">{e.title}</p>
                      <p className="text-[10px] text-secondary-theme mt-0.5">
                        {e.allDay ? 'All Day' : `${formatTime12h(e.startTime)} - ${formatTime12h(e.endTime)}`}
                      </p>
                      {e.location && (
                        <p className="text-[10px] text-muted-theme truncate mt-1">📍 {e.location}</p>
                      )}
                    </div>
                  ))}

                  {/* Tasks */}
                  {dayData?.tasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setEditingTask(t)}
                      className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs cursor-pointer hover:bg-blue-500/20 transition-colors"
                    >
                      <span className="font-medium text-primary-theme truncate block">✓ {t.title}</span>
                      <span className="text-[10px] text-secondary-theme capitalize">{t.priority} priority</span>
                    </div>
                  ))}

                  {(!dayData || (dayData.events.length === 0 && dayData.tasks.length === 0 && dayData.birthdays.length === 0)) && (
                    <div className="h-full flex items-center justify-center text-[11px] text-muted-theme opacity-40">
                      Empty
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: DAY */}
      {calendarView === 'day' && (
        <div className="bg-card-theme rounded-2xl border border-theme shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-theme">
            <div>
              <h3 className="text-lg font-bold text-primary-theme">
                {formatReadableDate(selectedDateStr)}
              </h3>
              <p className="text-xs text-secondary-theme">Day breakdown & timeline</p>
            </div>
            <button
              onClick={() => {
                setCreateModalDate(selectedDateStr);
                setIsCreateModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:bg-accent-hover transition-colors"
            >
              + Add Event
            </button>
          </div>

          <div className="space-y-3">
            {/* Birthdays on this date */}
            {itemsByDate.get(selectedDateStr)?.birthdays.map((b, idx) => (
              <div
                key={`day-b-${idx}`}
                className="p-4 rounded-xl bg-pink-500/15 border border-pink-500/30 text-pink-500 flex items-center gap-3 font-semibold text-sm"
              >
                <Gift className="w-5 h-5" />
                <span>Today is {b.name}&apos;s Birthday {b.ageText}! 🎉</span>
              </div>
            ))}

            {/* Events on this date */}
            {itemsByDate.get(selectedDateStr)?.events.map((e) => (
              <div
                key={e.id}
                onClick={() => setEditingEvent(e)}
                className="p-4 rounded-2xl bg-card-theme border border-theme hover:border-strong-theme cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <h4 className="font-bold text-base text-primary-theme group-hover:text-accent-theme">
                      {e.title}
                    </h4>
                  </div>
                  <span className="text-xs uppercase font-bold px-2 py-0.5 rounded-md bg-secondary-theme text-secondary-theme">
                    {e.category}
                  </span>
                </div>
                <div className="mt-2 text-xs text-secondary-theme flex items-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    {e.allDay ? 'All Day' : `${formatTime12h(e.startTime)} - ${formatTime12h(e.endTime)}`}
                  </span>
                  {e.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {e.location}
                    </span>
                  )}
                  {e.recurrence !== 'none' && (
                    <span className="flex items-center gap-1">
                      <Repeat className="w-3.5 h-3.5" /> Repeats {e.recurrence}
                    </span>
                  )}
                </div>
                {e.description && (
                  <p className="mt-2 text-xs text-secondary-theme border-t border-subtle-theme pt-2">
                    {e.description}
                  </p>
                )}
              </div>
            ))}

            {/* Tasks due on this date */}
            {itemsByDate.get(selectedDateStr)?.tasks.map((t) => (
              <div
                key={t.id}
                onClick={() => setEditingTask(t)}
                className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/20 hover:border-blue-500/40 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-semibold text-primary-theme">{t.title}</span>
                  </div>
                  <span className="text-xs uppercase font-bold text-blue-500">{t.priority}</span>
                </div>
              </div>
            ))}

            {(!itemsByDate.get(selectedDateStr) ||
              (itemsByDate.get(selectedDateStr)!.events.length === 0 &&
                itemsByDate.get(selectedDateStr)!.tasks.length === 0 &&
                itemsByDate.get(selectedDateStr)!.birthdays.length === 0)) && (
              <div className="py-12 text-center text-secondary-theme">
                <CalendarIcon className="w-8 h-8 mx-auto text-muted-theme opacity-30 mb-2" />
                <p className="text-sm font-medium">No events or tasks on {formatReadableDate(selectedDateStr)}</p>
                <button
                  onClick={() => {
                    setCreateModalDate(selectedDateStr);
                    setIsCreateModalOpen(true);
                  }}
                  className="mt-3 text-xs font-semibold text-accent-theme hover:underline"
                >
                  + Schedule an event
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: AGENDA */}
      {calendarView === 'agenda' && (
        <div className="bg-card-theme rounded-2xl border border-theme shadow-xs p-6 space-y-4">
          <h3 className="font-bold text-lg text-primary-theme pb-2 border-b border-theme">
            Upcoming Chronological Agenda
          </h3>

          <div className="space-y-3">
            {agendaItems.length === 0 ? (
              <div className="py-12 text-center text-secondary-theme">
                <CalendarIcon className="w-8 h-8 mx-auto text-muted-theme opacity-30 mb-2" />
                <p className="text-sm font-medium">Your agenda is empty</p>
              </div>
            ) : (
              agendaItems.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => {
                    if (item.type === 'event') setEditingEvent(item.raw as CalendarEvent);
                    if (item.type === 'task') setEditingTask(item.raw as Task);
                  }}
                  className="p-3.5 rounded-xl border border-theme hover:border-strong-theme bg-card-theme flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group transition-all"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className="text-xs font-mono font-bold text-accent-theme w-28 shrink-0">
                      {formatReadableDate(item.date)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-primary-theme group-hover:text-accent-theme truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-secondary-theme">
                        {item.timeStr} {item.location ? `· 📍 ${item.location}` : ''}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md shrink-0 self-start sm:self-auto ${
                      item.type === 'event'
                        ? 'bg-purple-500/10 text-purple-500'
                        : item.type === 'birthday'
                        ? 'bg-pink-500/10 text-pink-500'
                        : 'bg-blue-500/10 text-blue-500'
                    }`}
                  >
                    {item.type}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Quick Event Create Modal */}
      {isCreateModalOpen && (
        <EventModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          defaultDate={createModalDate}
        />
      )}
    </div>
  );
};

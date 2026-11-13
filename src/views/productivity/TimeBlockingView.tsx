/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTodayDateString } from '../../utils/helpers';

export const TimeBlockingView: React.FC = () => {
  const { events, tasks, addEvent, setEditingEvent } = useApp();

  const [currentDate, setCurrentDate] = useState(getTodayDateString());

  // Hours 06:00 to 22:00
  const hours = useMemo(() => {
    return Array.from({ length: 17 }, (_, i) => i + 6);
  }, []);

  const changeDay = (offset: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + offset);
    setCurrentDate(d.toISOString().slice(0, 10));
  };

  const dayEvents = useMemo(() => {
    return events.filter((e) => e.date === currentDate);
  }, [events, currentDate]);

  const dayTasks = useMemo(() => {
    return tasks.filter((t) => t.dueDate === currentDate);
  }, [tasks, currentDate]);

  const handleBlockClick = async (hour: number) => {
    const formattedHour = `${String(hour).padStart(2, '0')}:00`;
    const nextHour = `${String(hour + 1).padStart(2, '0')}:00`;

    const title = prompt(`Add time block for ${formattedHour} - ${nextHour}:`, 'Deep Work Block');
    if (!title || !title.trim()) return;

    await addEvent({
      title: title.trim(),
      date: currentDate,
      startTime: formattedHour,
      endTime: nextHour,
      allDay: false,
      category: 'work',
      reminder: false,
      recurrence: 'none',
    });
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-accent-theme uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4" />
            <span>Productivity & Focus</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme">
            Time Blocking Schedule
          </h1>
          <p className="text-xs sm:text-sm text-secondary-theme mt-1">
            Dedicate specific hours of your day to single-task focus blocks. Click any slot to schedule.
          </p>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-2 bg-card p-1.5 rounded-2xl border border-theme">
          <button
            onClick={() => changeDay(-1)}
            className="p-1.5 rounded-xl hover:bg-card-hover text-secondary-theme"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-primary-theme px-3">
            {currentDate === getTodayDateString() ? `Today (${currentDate})` : currentDate}
          </span>
          <button
            onClick={() => changeDay(1)}
            className="p-1.5 rounded-xl hover:bg-card-hover text-secondary-theme"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hourly Schedule Table */}
      <div className="bg-card rounded-2xl border border-theme shadow-xs overflow-hidden">
        <div className="p-4 border-b border-theme bg-app/50 flex items-center justify-between">
          <span className="text-xs font-bold text-secondary-theme uppercase tracking-wider">
            Hourly Docket (06:00 - 22:00)
          </span>
          <span className="text-xs text-secondary-theme">
            {dayEvents.length} events • {dayTasks.length} tasks scheduled
          </span>
        </div>

        <div className="divide-y divide-theme">
          {hours.map((hour) => {
            const timeStr = `${String(hour).padStart(2, '0')}:00`;
            const matchingEvents = dayEvents.filter((e) => {
              if (!e.startTime) return false;
              const eventHour = parseInt(e.startTime.split(':')[0], 10);
              return eventHour === hour;
            });

            return (
              <div
                key={hour}
                className="flex items-start group min-h-16 hover:bg-card-hover/40 transition-colors"
              >
                {/* Hour Label */}
                <div className="w-20 sm:w-28 p-3 text-right text-xs font-mono font-bold text-secondary-theme border-r border-theme shrink-0 select-none">
                  {timeStr}
                </div>

                {/* Slot Content */}
                <div
                  onClick={() => handleBlockClick(hour)}
                  className="flex-1 p-2 sm:p-3 cursor-pointer flex flex-wrap items-center gap-2 relative min-h-16"
                >
                  {matchingEvents.length === 0 ? (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-secondary-theme flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5 text-accent-theme" />
                      <span>Click to schedule focus block</span>
                    </div>
                  ) : (
                    matchingEvents.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingEvent(evt);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-accent-light-theme border border-accent-light-theme text-accent-theme text-xs font-bold flex items-center gap-2 shadow-xs hover:scale-[1.01] transition-transform"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{evt.title}</span>
                        {evt.startTime && evt.endTime && (
                          <span className="text-[10px] font-normal opacity-80">
                            ({evt.startTime} - {evt.endTime})
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

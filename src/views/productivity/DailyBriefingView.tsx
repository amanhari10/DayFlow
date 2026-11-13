/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect } from 'react';
import {
  Sun,
  CheckCircle2,
  Calendar,
  Gift,
  Flame,
  ArrowRight,
  Sparkles,
  Timer,
  Quote,
  CheckSquare,
  Square,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTodayDateString, calculateBirthdayInfo } from '../../utils/helpers';
import { getNextQuote } from '../../data/quotes';
import type { DayFlowQuote } from '../../data/quotes';

export const DailyBriefingView: React.FC = () => {
  const [todayQuote, setTodayQuote] = useState<DayFlowQuote | null>(null);

  useEffect(() => {
    setTodayQuote(getNextQuote());
  }, []);

  const {
    settings,
    tasks,
    events,
    birthdays,
    habits,
    habitCheckins,
    toggleTaskComplete,
    toggleHabitCheckin,
    setActiveView,
    startTimer,
  } = useApp();

  const todayStr = getTodayDateString();

  // Tasks for today
  const todayTasks = useMemo(() => {
    return tasks
      .filter((t) => t.dueDate === todayStr)
      .sort((a, b) => (b.priority === 'urgent' ? 1 : a.priority === 'high' ? 1 : -1));
  }, [tasks, todayStr]);

  const completedTodayCount = useMemo(
    () => todayTasks.filter((t) => t.status === 'completed').length,
    [todayTasks]
  );

  // Today's events
  const todayEvents = useMemo(() => {
    return events
      .filter((e) => e.date === todayStr)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  }, [events, todayStr]);

  // Birthdays within 2 days
  const urgentBirthdays = useMemo(() => {
    return birthdays.filter((b) => {
      const info = calculateBirthdayInfo(b);
      return info.daysUntil <= 2;
    });
  }, [birthdays]);

  // Daily habits
  const dailyHabits = useMemo(() => {
    return habits.filter((h) => h.frequency === 'daily');
  }, [habits]);

  const habitsDoneToday = useMemo(() => {
    return dailyHabits.filter((h) =>
      habitCheckins.some((c) => c.habitId === h.id && c.date === todayStr && c.completed)
    ).length;
  }, [dailyHabits, habitCheckins, todayStr]);

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* Hero Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-accent-light-theme via-card to-card border border-accent-light-theme shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-accent-theme uppercase tracking-wider mb-2">
              <Sun className="w-4 h-4" />
              <span>Good Morning, {settings.name}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-primary-theme">
              Here is your Daily Command Briefing
            </h1>
            <p className="text-xs sm:text-sm text-secondary-theme mt-1">
              {new Date().toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                startTimer();
                setActiveView('focus');
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-accent-theme text-white text-xs font-bold shadow-sm hover:opacity-95 transition-all shrink-0"
            >
              <Timer className="w-4 h-4" />
              <span>Deep Flow</span>
            </button>
          </div>
        </div>

        {/* Quote of the Day */}
        <div className="mt-6 pt-4 border-t border-theme/60 flex items-start gap-3 text-xs text-secondary-theme">
          <Quote className="w-4 h-4 text-accent-theme shrink-0 mt-0.5" />
          <p className="italic">
            {todayQuote ? `“${todayQuote.text}” — ` : ''}
            {todayQuote && <span className="font-semibold text-primary-theme">{todayQuote.author}</span>}
          </p>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-card border border-theme shadow-xs">
          <div className="flex items-center justify-between text-secondary-theme text-xs font-medium">
            <span>Tasks Due Today</span>
            <CheckCircle2 className="w-4 h-4 text-accent-theme" />
          </div>
          <p className="text-2xl font-black text-primary-theme mt-2">
            {completedTodayCount} / {todayTasks.length}
          </p>
          <span className="text-[11px] text-emerald-500 font-semibold">
            {todayTasks.length > 0 ? `${Math.round((completedTodayCount / todayTasks.length) * 100)}% finished` : 'All clear'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-theme shadow-xs">
          <div className="flex items-center justify-between text-secondary-theme text-xs font-medium">
            <span>Calendar Events</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-primary-theme mt-2">{todayEvents.length}</p>
          <span className="text-[11px] text-secondary-theme">Scheduled on docket</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-theme shadow-xs">
          <div className="flex items-center justify-between text-secondary-theme text-xs font-medium">
            <span>Habits Check-in</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-2xl font-black text-primary-theme mt-2">
            {habitsDoneToday} / {dailyHabits.length}
          </p>
          <span className="text-[11px] text-orange-500 font-semibold">Daily consistency</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-theme shadow-xs">
          <div className="flex items-center justify-between text-secondary-theme text-xs font-medium">
            <span>Celebrations</span>
            <Gift className="w-4 h-4 text-pink-500" />
          </div>
          <p className="text-2xl font-black text-primary-theme mt-2">{urgentBirthdays.length}</p>
          <span className="text-[11px] text-secondary-theme">Next 48 hours</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Priorities Today */}
        <div className="p-6 rounded-3xl bg-card border border-theme shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-primary-theme flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent-theme" />
              Priorities For Today
            </h2>
            <button
              onClick={() => setActiveView('tasks')}
              className="text-xs text-accent-theme font-semibold hover:underline flex items-center gap-1"
            >
              All Tasks <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayTasks.length === 0 ? (
            <div className="p-6 text-center text-xs text-secondary-theme">
              <Sparkles className="w-8 h-8 text-secondary-theme/40 mx-auto mb-2" />
              No tasks scheduled for today. You are completely on track!
            </div>
          ) : (
            <div className="space-y-2">
              {todayTasks.slice(0, 6).map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTaskComplete(task.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border text-xs cursor-pointer transition-colors ${
                    task.status === 'completed'
                      ? 'bg-app/50 border-theme text-secondary-theme line-through'
                      : 'bg-app border-theme hover:border-accent-theme text-primary-theme'
                  }`}
                >
                  {task.status === 'completed' ? (
                    <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-secondary-theme shrink-0" />
                  )}
                  <span className="font-semibold flex-1 truncate">{task.title}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                      task.priority === 'urgent'
                        ? 'bg-rose-500/10 text-rose-500'
                        : task.priority === 'high'
                        ? 'bg-orange-500/10 text-orange-500'
                        : 'bg-card-hover text-secondary-theme'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schedule & Habits */}
        <div className="space-y-6">
          {/* Today's Agenda */}
          <div className="p-6 rounded-3xl bg-card border border-theme shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-primary-theme flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                Today's Schedule
              </h2>
              <button
                onClick={() => setActiveView('calendar')}
                className="text-xs text-accent-theme font-semibold hover:underline flex items-center gap-1"
              >
                Calendar <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todayEvents.length === 0 ? (
              <p className="text-xs text-secondary-theme py-2">
                No events or meetings booked today. Perfect for uninterrupted focus blocks!
              </p>
            ) : (
              <div className="space-y-2">
                {todayEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-app border border-theme text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-primary-theme">{evt.title}</h4>
                      {evt.startTime && (
                        <p className="text-secondary-theme text-[11px] mt-0.5">
                          {evt.startTime} {evt.endTime ? `- ${evt.endTime}` : ''}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 uppercase">
                      {evt.category}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Habit Streaks */}
          <div className="p-6 rounded-3xl bg-card border border-theme shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-primary-theme flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                Daily Habits
              </h2>
              <button
                onClick={() => setActiveView('habits')}
                className="text-xs text-accent-theme font-semibold hover:underline flex items-center gap-1"
              >
                Habit Board <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {dailyHabits.slice(0, 4).map((habit) => {
                const isDone = habitCheckins.some(
                  (c) => c.habitId === habit.id && c.date === todayStr && c.completed
                );
                return (
                  <button
                    key={habit.id}
                    onClick={() => toggleHabitCheckin(habit.id, todayStr)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                      isDone
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                        : 'bg-app border-theme text-primary-theme hover:border-accent-theme'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Flame className="w-4 h-4 text-secondary-theme shrink-0" />
                    )}
                    <span className="truncate">{habit.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

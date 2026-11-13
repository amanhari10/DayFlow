/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Gift,
  Flame,
  FileText,
  Timer,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Plus,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Target,
  DollarSign,
  GraduationCap,
  Dumbbell,
  CheckSquare,
  Square,
  Quote,
  MapPin,
  ArrowUp,
  ArrowDown,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DashboardWidgetConfig, Task, WidgetSize } from '../types';
import { getTodayDateString, calculateBirthdayInfo, formatReadableDate } from '../utils/helpers';
import { formatCurrency } from '../utils/currency';
import { DayFlowQuote, getNextQuote } from '../data/quotes';

const DEFAULT_WIDGETS: DashboardWidgetConfig[] = [
  { id: 'todayTasks', label: "Today's Tasks", visible: true, order: 0, size: 'wide' },
  { id: 'dailyProgress', label: 'Daily Progress Ring', visible: true, order: 1, size: 'normal' },
  { id: 'dailyQuote', label: 'Daily Inspiration Quote', visible: true, order: 2, size: 'normal' },
  { id: 'upcomingEvents', label: 'Upcoming Events', visible: true, order: 3, size: 'normal' },
  { id: 'upcomingBirthdays', label: 'Upcoming Birthdays', visible: true, order: 4, size: 'normal' },
  { id: 'habitOverview', label: 'Habit Streaks', visible: true, order: 5, size: 'normal' },
  { id: 'goalProgress', label: 'Life Goals Progress', visible: true, order: 6, size: 'normal' },
  { id: 'budgetOverview', label: 'Monthly Budget Summary', visible: true, order: 7, size: 'normal' },
  { id: 'fitnessSummary', label: 'Fitness & Workouts', visible: true, order: 8, size: 'normal' },
  { id: 'dailyChecklist', label: 'Daily Quick Checklist', visible: true, order: 9, size: 'normal' },
  { id: 'upcomingTrips', label: 'Upcoming Trips & Travel', visible: true, order: 10, size: 'normal' },
  { id: 'focusTimer', label: 'Focus Pomodoro Widget', visible: true, order: 11, size: 'normal' },
  { id: 'overdueTasks', label: 'Overdue Alerts', visible: true, order: 12, size: 'wide' },
  { id: 'quickNotes', label: 'Scratchpad Note', visible: true, order: 13, size: 'normal' },
];

// Wraps each dashboard widget so the saved order and width are actually applied.
const WidgetSlot: React.FC<{ order: number; wide: boolean; children: React.ReactNode }> = ({ order, wide, children }) => (
  <div style={{ order }} className={`flex flex-col [&>*]:flex-1 ${wide ? 'lg:col-span-2' : ''}`}>
    {children}
  </div>
);

export const MyDayView: React.FC = () => {
  const {
    tasks,
    events,
    birthdays,
    habits,
    habitCheckins,
    goals,
    expenses,
    studentCourses,
    workouts,
    tripPlans,
    toggleTaskComplete,
    toggleHabitCheckin,
    setEditingTask,
    openQuickAddWithTab,
    setActiveView,
    timerMode,
    timeLeft,
    isTimerRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    addNote,
    settings,
    updateSettings,
  } = useApp();

  const todayStr = getTodayDateString();
  const [scratchpadText, setScratchpadText] = useState('');
  const [scratchpadSaved, setScratchpadSaved] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [quote, setQuote] = useState<DayFlowQuote | null>(null);

  useEffect(() => {
    setQuote(getNextQuote());
  }, []);

  // Daily scratch checklist in state
  const [dailyChecklist, setDailyChecklist] = useState<Array<{ id: string; text: string; done: boolean }>>([
    { id: '1', text: 'Drink 500ml water', done: true },
    { id: '2', text: 'Clear desktop distractions', done: true },
    { id: '3', text: 'Review top 3 priorities', done: false },
    { id: '4', text: 'Take a 10m walk outdoors', done: false },
  ]);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  // Today's tasks
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => t.dueDate === todayStr);
  }, [tasks, todayStr]);

  const completedTodayTasks = useMemo(() => {
    return todayTasks.filter((t) => t.status === 'completed');
  }, [todayTasks]);

  const overdueTasks = useMemo(() => {
    return tasks.filter((t) => t.status !== 'completed' && t.dueDate < todayStr);
  }, [tasks, todayStr]);

  // Completion percentage
  const completionPercentage = useMemo(() => {
    if (todayTasks.length === 0) return 0;
    return Math.round((completedTodayTasks.length / todayTasks.length) * 100);
  }, [todayTasks.length, completedTodayTasks.length]);

  // Upcoming events
  const upcomingEvents = useMemo(() => {
    return events
      .filter((e) => e.date >= todayStr)
      .sort((a, b) => (a.date === b.date ? (a.startTime || '').localeCompare(b.startTime || '') : a.date.localeCompare(b.date)))
      .slice(0, 5);
  }, [events, todayStr]);

  // Next 5 birthdays
  const nextBirthdays = useMemo(() => {
    return birthdays
      .map((b) => ({ ...b, info: calculateBirthdayInfo(b) }))
      .sort((a, b) => a.info.daysUntil - b.info.daysUntil)
      .slice(0, 5);
  }, [birthdays]);

  // Habits overview
  const todayHabitStatuses = useMemo(() => {
    return habits.map((habit) => {
      const isCompleted = habitCheckins.some((c) => c.habitId === habit.id && c.date === todayStr && c.completed);
      return { habit, isCompleted };
    });
  }, [habits, habitCheckins, todayStr]);

  // Weekly tasks data
  const weeklyTaskData = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay();
    const startOffset = settings.firstDayOfWeek === 'monday' ? (currentDay === 0 ? -6 : 1 - currentDay) : -currentDay;

    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + startOffset + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dateNum = String(d.getDate()).padStart(2, '0');
      const dStr = `${y}-${m}-${dateNum}`;

      const completedCount = tasks.filter(
        (t) => t.status === 'completed' && t.completedAt && t.completedAt.startsWith(dStr)
      ).length;

      days.push({
        dayName: dayNames[d.getDay()],
        dateStr: dStr,
        isToday: dStr === todayStr,
        count: completedCount,
      });
    }

    const maxCount = Math.max(...days.map((d) => d.count), 4);
    return { days, maxCount };
  }, [tasks, settings.firstDayOfWeek, todayStr]);

  // Expenses calculations
  const monthlyExpensesTotal = useMemo(() => {
    const currentMonth = todayStr.slice(0, 7);
    return expenses
      .filter((e) => e.date.startsWith(currentMonth))
      .reduce((acc, e) => acc + (e.type === 'expense' ? e.amount : -e.amount), 0);
  }, [expenses, todayStr]);

  // Formatted timer
  const formattedTimer = useMemo(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  }, [timeLeft]);

  const handleSaveScratchpad = async () => {
    if (!scratchpadText.trim()) return;
    await addNote({
      title: `Quick Note – ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      content: scratchpadText,
      category: 'personal',
      pinned: false,
      tags: ['scratchpad'],
    });
    setScratchpadSaved(true);
    setTimeout(() => setScratchpadSaved(false), 2500);
  };

  // Widget Marketplace Handlers
  const activeWidgets = useMemo(() => {
    const known = new Set(DEFAULT_WIDGETS.map((w) => w.id));
    const stored = (settings.dashboardWidgets || []).filter((w) => known.has(w.id));
    const storedIds = new Set(stored.map((w) => w.id));
    const missing = DEFAULT_WIDGETS.filter((w) => !storedIds.has(w.id));
    return [...stored].sort((a, b) => a.order - b.order).concat(missing).map((w, i) => ({ ...w, order: i }));
  }, [settings.dashboardWidgets]);

  const getWidgetOrder = (id: string) => {
    const w = activeWidgets.find((item) => item.id === id);
    return w ? w.order : 999;
  };

  const isWidgetVisible = (id: string) => {
    const w = activeWidgets.find((item) => item.id === id);
    return w ? w.visible : false;
  };

  const getWidgetSize = (id: string): WidgetSize => {
    const w = activeWidgets.find((item) => item.id === id);
    return w?.size || 'normal';
  };

  const toggleWidget = async (id: string) => {
    const updated = activeWidgets.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w));
    await updateSettings({ dashboardWidgets: updated });
  };

  const toggleWidgetSize = async (id: string) => {
    const updated = activeWidgets.map((w) =>
      w.id === id ? { ...w, size: (w.size === 'wide' ? 'normal' : 'wide') as WidgetSize } : w
    );
    await updateSettings({ dashboardWidgets: updated });
  };

  const moveWidget = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= activeWidgets.length) return;

    const copy = [...activeWidgets];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    const reordered = copy.map((w, idx) => ({ ...w, order: idx }));
    await updateSettings({ dashboardWidgets: reordered });
  };

  const resetWidgets = async () => {
    await updateSettings({ dashboardWidgets: DEFAULT_WIDGETS });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Customizer Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme">
            My Day
          </h2>
          <p className="text-xs sm:text-sm text-secondary-theme mt-1">
            Personalized modular command center with customizable Widget Marketplace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCustomizeOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-theme text-secondary-theme hover:text-primary-theme text-xs font-semibold hover:bg-card-hover transition-colors shadow-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> Widget Marketplace
          </button>
          <button
            onClick={() => openQuickAddWithTab('task')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:opacity-95 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> New Task
          </button>
        </div>
      </div>

      {/* OVERDUE TASKS BANNER */}
      {isWidgetVisible('overdueTasks') && overdueTasks.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-500 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold">
                {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''} Need Attention
              </h3>
              <p className="text-xs text-rose-500/80 mt-0.5">
                Earliest: &ldquo;{overdueTasks[0].title}&rdquo; (due {formatReadableDate(overdueTasks[0].dueDate)})
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveView('tasks')}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition-colors shrink-0"
          >
            View in Tasks →
          </button>
        </div>
      )}

      {/* MAIN DYNAMIC GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* WIDGET: TODAY'S TASKS */}
        {isWidgetVisible('todayTasks') && (
          <WidgetSlot order={getWidgetOrder('todayTasks')} wide={getWidgetSize('todayTasks') === 'wide'}>
          <div
            className={`${
              getWidgetSize('todayTasks') === 'wide' ? 'lg:col-span-2' : ''
            } bg-card rounded-2xl border border-theme p-5 shadow-xs flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-theme mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-accent-light-theme text-accent-theme">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-primary-theme">
                    Today&apos;s Focus Tasks
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-app border border-theme text-secondary-theme">
                    {completedTodayTasks.length}/{todayTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => openQuickAddWithTab('task')}
                  className="p-1 rounded-lg text-secondary-theme hover:text-accent-theme"
                  title="Add task for today"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {todayTasks.length === 0 ? (
                <div className="py-8 text-center text-secondary-theme">
                  <Sparkles className="w-8 h-8 mx-auto text-secondary-theme/40 mb-2" />
                  <p className="text-xs font-medium">No tasks scheduled for today.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayTasks.slice(0, 6).map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                        task.status === 'completed'
                          ? 'bg-app/50 border-theme text-secondary-theme line-through'
                          : 'bg-app border-theme hover:border-accent-theme text-primary-theme'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <button
                          onClick={() => toggleTaskComplete(task.id)}
                          className="shrink-0 text-secondary-theme hover:text-accent-theme"
                        >
                          {task.status === 'completed' ? (
                            <CheckSquare className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                        <span
                          onClick={() => setEditingTask(task)}
                          className="text-xs font-semibold truncate cursor-pointer hover:underline"
                        >
                          {task.title}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase shrink-0 ${
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

            <button
              onClick={() => setActiveView('tasks')}
              className="mt-3 pt-3 border-t border-theme text-xs font-semibold text-accent-theme hover:underline flex items-center justify-between"
            >
              Open Full Task Manager <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          </WidgetSlot>
        )}

        {/* WIDGET: DAILY PROGRESS RING */}
        {isWidgetVisible('dailyProgress') && (
          <WidgetSlot order={getWidgetOrder('dailyProgress')} wide={getWidgetSize('dailyProgress') === 'wide'}>
          <div className="bg-card rounded-2xl border border-theme p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-theme mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-primary-theme">
                    Daily Progress
                  </h3>
                </div>
              </div>

              <div className="py-4 flex flex-col items-center justify-center">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-app stroke-current"
                      strokeWidth="3.5"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-accent-theme stroke-current transition-all duration-700"
                      strokeWidth="3.5"
                      strokeDasharray={`${completionPercentage}, 100`}
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-xl font-black text-primary-theme">
                      {completionPercentage}%
                    </span>
                    <span className="block text-[9px] uppercase font-bold text-secondary-theme">
                      Complete
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                  <div className="text-center">
                    <p className="font-bold text-primary-theme">{completedTodayTasks.length}</p>
                    <p className="text-[10px] text-secondary-theme">Completed</p>
                  </div>
                  <div className="w-px h-6 bg-theme" />
                  <div className="text-center">
                    <p className="font-bold text-primary-theme">{todayTasks.length - completedTodayTasks.length}</p>
                    <p className="text-[10px] text-secondary-theme">Remaining</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-secondary-theme text-center mt-2 italic">
              {completionPercentage === 100
                ? 'All today tasks completed! Outstanding job.'
                : 'Keep steady momentum throughout the day.'}
            </p>
          </div>
          </WidgetSlot>
        )}

        {/* WIDGET: DAILY QUOTE */}
        {isWidgetVisible('dailyQuote') && (
          <WidgetSlot order={getWidgetOrder('dailyQuote')} wide={getWidgetSize('dailyQuote') === 'wide'}>
          <div className="bg-card rounded-2xl border border-theme p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-theme mb-3">
                <Quote className="w-4 h-4 text-accent-theme" />
                <h3 className="font-bold text-sm text-primary-theme">Daily Reflection</h3>
              </div>
              <blockquote className="text-xs sm:text-sm text-primary-theme italic font-serif leading-relaxed mt-2">
                {quote ? `“${quote.text}”` : 'Choose one small step that moves you forward.'}
              </blockquote>
              {quote && <p className="text-xs font-bold text-accent-theme mt-2">— DayFlow · {quote.category}</p>}
            </div>
            <span className="text-[10px] text-secondary-theme uppercase tracking-wider block mt-4">
              {quote ? `${quote.category} · Mindset & Focus` : 'Mindset & Focus'}
            </span>
          </div>
          </WidgetSlot>
        )}

        {/* WIDGET: GOAL PROGRESS */}
        {isWidgetVisible('goalProgress') && (
          <WidgetSlot order={getWidgetOrder('goalProgress')} wide={getWidgetSize('goalProgress') === 'wide'}>
          <div className="bg-card rounded-2xl border border-theme p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-theme mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-500" />
                  <h3 className="font-bold text-sm text-primary-theme">Active Goals</h3>
                </div>
                <button
                  onClick={() => setActiveView('goals')}
                  className="text-xs text-accent-theme hover:underline font-semibold"
                >
                  View All
                </button>
              </div>
              <div className="space-y-2.5">
                {goals.slice(0, 3).map((g) => (
                  <div key={g.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-primary-theme truncate">{g.title}</span>
                      <span className="text-accent-theme font-bold">{g.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-app overflow-hidden">
                      <div className="h-full bg-accent-theme" style={{ width: `${g.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => setActiveView('goals')}
              className="mt-3 pt-3 border-t border-theme text-xs font-semibold text-accent-theme hover:underline flex items-center justify-between"
            >
              Manage Milestones <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          </WidgetSlot>
        )}

        {/* WIDGET: BUDGET OVERVIEW */}
        {isWidgetVisible('budgetOverview') && (
          <WidgetSlot order={getWidgetOrder('budgetOverview')} wide={getWidgetSize('budgetOverview') === 'wide'}>
          <div className="bg-card rounded-2xl border border-theme p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-theme mb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <h3 className="font-bold text-sm text-primary-theme">Monthly Finances</h3>
                </div>
                <button
                  onClick={() => setActiveView('finances')}
                  className="text-xs text-accent-theme hover:underline font-semibold"
                >
                  Log
                </button>
              </div>
              <div className="py-2">
                <span className="text-2xl font-black text-primary-theme">
                  {formatCurrency(Math.abs(monthlyExpensesTotal), settings.currency)}
                </span>
                <p className="text-xs text-secondary-theme mt-1">Logged expenses this month</p>
              </div>
            </div>
            <button
              onClick={() => setActiveView('finances')}
              className="mt-3 pt-3 border-t border-theme text-xs font-semibold text-accent-theme hover:underline flex items-center justify-between"
            >
              Open Budget & Transactions <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          </WidgetSlot>
        )}

        {/* WIDGET: FITNESS SUMMARY */}
        {isWidgetVisible('fitnessSummary') && (
          <WidgetSlot order={getWidgetOrder('fitnessSummary')} wide={getWidgetSize('fitnessSummary') === 'wide'}>
          <div className="bg-card rounded-2xl border border-theme p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-theme mb-3">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-orange-500" />
                  <h3 className="font-bold text-sm text-primary-theme">Fitness Volume</h3>
                </div>
                <button
                  onClick={() => setActiveView('fitness')}
                  className="text-xs text-accent-theme hover:underline font-semibold"
                >
                  Log
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs py-1">
                <div className="p-3 rounded-xl bg-app border border-theme">
                  <span className="text-[10px] text-secondary-theme uppercase font-bold">Total Workouts</span>
                  <p className="text-2xl font-black text-primary-theme mt-1">{workouts.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-app border border-theme">
                  <span className="text-[10px] text-secondary-theme uppercase font-bold">Active Mins</span>
                  <p className="text-2xl font-black text-primary-theme mt-1">
                    {workouts.reduce((acc, w) => acc + w.durationMinutes, 0)}m
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveView('fitness')}
              className="mt-3 pt-3 border-t border-theme text-xs font-semibold text-accent-theme hover:underline flex items-center justify-between"
            >
              Workout Logger <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          </WidgetSlot>
        )}

        {/* WIDGET: DAILY CHECKLIST */}
        {isWidgetVisible('dailyChecklist') && (
          <WidgetSlot order={getWidgetOrder('dailyChecklist')} wide={getWidgetSize('dailyChecklist') === 'wide'}>
          <div className="bg-card rounded-2xl border border-theme p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-theme mb-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-accent-theme" />
                  <h3 className="font-bold text-sm text-primary-theme">Daily Quick Checklist</h3>
                </div>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {dailyChecklist.map((item) => (
                  <button
                    key={item.id}
                    onClick={() =>
                      setDailyChecklist((prev) =>
                        prev.map((i) => (i.id === item.id ? { ...i, done: !i.done } : i))
                      )
                    }
                    className={`w-full flex items-center gap-2 p-2 rounded-xl text-xs text-left transition-colors ${
                      item.done ? 'line-through text-secondary-theme bg-app/40' : 'text-primary-theme bg-app'
                    }`}
                  >
                    {item.done ? (
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-secondary-theme shrink-0" />
                    )}
                    <span className="truncate">{item.text}</span>
                  </button>
                ))}
              </div>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newChecklistItem.trim()) return;
                setDailyChecklist((prev) => [
                  ...prev,
                  { id: `chk-${Date.now()}`, text: newChecklistItem.trim(), done: false },
                ]);
                setNewChecklistItem('');
              }}
              className="mt-3 flex items-center gap-1.5"
            >
              <input
                type="text"
                placeholder="Add checklist item..."
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-app border border-theme text-xs text-primary-theme focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 rounded-lg bg-accent-theme text-white text-xs font-semibold"
              >
                +
              </button>
            </form>
          </div>
          </WidgetSlot>
        )}

        {/* WIDGET: UPCOMING TRIPS */}
        {isWidgetVisible('upcomingTrips') && (
          <WidgetSlot order={getWidgetOrder('upcomingTrips')} wide={getWidgetSize('upcomingTrips') === 'wide'}>
          <div className="bg-card rounded-2xl border border-theme p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-theme mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <h3 className="font-bold text-sm text-primary-theme">Upcoming Travel</h3>
                </div>
                <button
                  onClick={() => setActiveView('travel')}
                  className="text-xs text-accent-theme hover:underline font-semibold"
                >
                  Itineraries
                </button>
              </div>
              {tripPlans.length === 0 ? (
                <p className="text-xs text-secondary-theme py-4 text-center">No trips booked yet.</p>
              ) : (
                <div className="space-y-2">
                  {tripPlans.slice(0, 2).map((t) => (
                    <div key={t.id} className="p-3 rounded-xl bg-app border border-theme">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-primary-theme">{t.destination}</span>
                        <span className="text-[10px] uppercase font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">
                          {t.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-secondary-theme mt-1">
                        {t.startDate} to {t.endDate}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setActiveView('travel')}
              className="mt-3 pt-3 border-t border-theme text-xs font-semibold text-accent-theme hover:underline flex items-center justify-between"
            >
              Open Travel Planner <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          </WidgetSlot>
        )}

        {/* WIDGET: UPCOMING EVENTS */}
        {isWidgetVisible('upcomingEvents') && (
          <WidgetSlot order={getWidgetOrder('upcomingEvents')} wide={getWidgetSize('upcomingEvents') === 'wide'}>
          <div className="bg-card rounded-2xl border border-theme p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-theme mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <h3 className="font-bold text-sm text-primary-theme">Upcoming Events</h3>
                </div>
                <button
                  onClick={() => openQuickAddWithTab('event')}
                  className="p-1 rounded-lg text-secondary-theme hover:text-accent-theme"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-secondary-theme py-4 text-center">No upcoming events.</p>
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.map((e) => (
                    <div key={e.id} className="p-2.5 rounded-xl bg-app border border-theme text-xs">
                      <p className="font-bold text-primary-theme truncate">{e.title}</p>
                      <p className="text-[11px] text-secondary-theme mt-0.5">
                        {e.date} {e.startTime ? `at ${e.startTime}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setActiveView('calendar')}
              className="mt-3 pt-3 border-t border-theme text-xs font-semibold text-accent-theme hover:underline flex items-center justify-between"
            >
              View Full Calendar <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          </WidgetSlot>
        )}

        {/* WIDGET: UPCOMING BIRTHDAYS */}
        {isWidgetVisible('upcomingBirthdays') && (
          <WidgetSlot order={getWidgetOrder('upcomingBirthdays')} wide={getWidgetSize('upcomingBirthdays') === 'wide'}>
          <div className="bg-card rounded-2xl border border-theme p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-theme mb-3">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-pink-500" />
                  <h3 className="font-bold text-sm text-primary-theme">Upcoming Birthdays</h3>
                </div>
                <button
                  onClick={() => openQuickAddWithTab('birthday')}
                  className="p-1 rounded-lg text-secondary-theme hover:text-accent-theme"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {nextBirthdays.slice(0, 4).map((b) => (
                  <div
                    key={b.id}
                    onClick={() => setActiveView('birthdays')}
                    className="flex items-center justify-between p-2 rounded-xl bg-app border border-theme text-xs cursor-pointer hover:border-accent-theme transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-primary-theme truncate">{b.name}</p>
                      <p className="text-[10px] text-secondary-theme">{b.info.formattedDate}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-500">
                      {b.info.daysUntil === 0 ? 'Today 🎉' : `${b.info.daysUntil}d`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => setActiveView('birthdays')}
              className="mt-3 pt-3 border-t border-theme text-xs font-semibold text-accent-theme hover:underline flex items-center justify-between"
            >
              All Birthdays <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          </WidgetSlot>
        )}

        {/* WIDGET: HABIT OVERVIEW */}
        {isWidgetVisible('habitOverview') && (
          <WidgetSlot order={getWidgetOrder('habitOverview')} wide={getWidgetSize('habitOverview') === 'wide'}>
          <div className="bg-card rounded-2xl border border-theme p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-theme mb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <h3 className="font-bold text-sm text-primary-theme">Daily Habits</h3>
                </div>
                <button
                  onClick={() => openQuickAddWithTab('habit')}
                  className="p-1 rounded-lg text-secondary-theme hover:text-accent-theme"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {todayHabitStatuses.slice(0, 4).map(({ habit, isCompleted }) => (
                  <div
                    key={habit.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                      isCompleted ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-app border-theme'
                    }`}
                  >
                    <span className={`font-semibold truncate ${isCompleted ? 'text-emerald-500' : 'text-primary-theme'}`}>
                      {habit.title}
                    </span>
                    <button
                      onClick={() => toggleHabitCheckin(habit.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        isCompleted ? 'bg-emerald-500 text-white' : 'bg-card border border-theme text-secondary-theme hover:text-primary-theme'
                      }`}
                    >
                      {isCompleted ? 'Done ✓' : 'Check In'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => setActiveView('habits')}
              className="mt-3 pt-3 border-t border-theme text-xs font-semibold text-accent-theme hover:underline flex items-center justify-between"
            >
              Habits Board <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          </WidgetSlot>
        )}

        {/* WIDGET: POMODORO TIMER */}
        {isWidgetVisible('focusTimer') && (
          <WidgetSlot order={getWidgetOrder('focusTimer')} wide={getWidgetSize('focusTimer') === 'wide'}>
          <div className="bg-card rounded-2xl border border-theme p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-theme mb-3">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-accent-theme" />
                  <h3 className="font-bold text-sm text-primary-theme">Pomodoro Focus</h3>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-accent-light-theme text-accent-theme">
                  {timerMode.replace('_', ' ')}
                </span>
              </div>
              <div className="py-3 text-center">
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-wider text-primary-theme">
                  {formattedTimer}
                </span>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <button
                    onClick={isTimerRunning ? pauseTimer : startTimer}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-bold hover:opacity-95 shadow-xs"
                  >
                    {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {isTimerRunning ? 'Pause' : 'Start'}
                  </button>
                  <button
                    onClick={resetTimer}
                    className="p-2 rounded-xl bg-app border border-theme text-secondary-theme hover:text-primary-theme"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveView('focus')}
              className="mt-3 pt-3 border-t border-theme text-xs font-semibold text-accent-theme hover:underline flex items-center justify-between"
            >
              Full Focus Mode <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          </WidgetSlot>
        )}

        {/* WIDGET: QUICK SCRATCHPAD NOTE */}
        {isWidgetVisible('quickNotes') && (
          <WidgetSlot order={getWidgetOrder('quickNotes')} wide={getWidgetSize('quickNotes') === 'wide'}>
          <div className="bg-card rounded-2xl border border-theme p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-theme mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-500" />
                  <h3 className="font-bold text-sm text-primary-theme">Quick Scratchpad</h3>
                </div>
                {scratchpadSaved && (
                  <span className="text-[10px] text-emerald-500 font-bold">Saved to Notes ✓</span>
                )}
              </div>
              <textarea
                rows={4}
                value={scratchpadText}
                onChange={(e) => setScratchpadText(e.target.value)}
                placeholder="Jot down quick thoughts, links, phone numbers, or ideas..."
                className="w-full p-3 rounded-xl bg-app border border-theme text-xs resize-none focus:outline-hidden focus:border-accent-theme"
              />
            </div>
            <div className="mt-3 pt-3 border-t border-theme flex items-center justify-between">
              <button
                onClick={handleSaveScratchpad}
                className="px-3 py-1.5 rounded-lg bg-accent-theme text-white text-xs font-semibold hover:opacity-95"
              >
                Save to Notes
              </button>
              <button
                onClick={() => setActiveView('notes')}
                className="text-xs font-semibold text-accent-theme hover:underline"
              >
                All Notes →
              </button>
            </div>
          </div>
          </WidgetSlot>
        )}
      </div>

      {/* WIDGET MARKETPLACE CUSTOMIZATION MODAL */}
      {isCustomizeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-card rounded-3xl border border-theme shadow-2xl p-6 text-primary-theme max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-theme shrink-0">
              <div>
                <h3 className="font-bold text-lg">Dashboard Widget Marketplace</h3>
                <p className="text-xs text-secondary-theme mt-0.5">
                  Toggle visibility, resize columns, and reorder widgets to customize your layout.
                </p>
              </div>
              <button
                onClick={() => setIsCustomizeOpen(false)}
                className="p-1.5 rounded-xl text-secondary-theme hover:bg-card-hover"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-2">
              {activeWidgets.map((widget, index) => (
                <div
                  key={widget.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    widget.visible ? 'bg-app border-theme' : 'bg-app/40 border-theme/40 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={widget.visible}
                      onChange={() => toggleWidget(widget.id)}
                      className="rounded text-accent-theme focus:ring-accent-theme cursor-pointer w-4 h-4"
                    />
                    <span className="text-xs font-bold text-primary-theme">{widget.label}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Size toggle */}
                    <button
                      onClick={() => toggleWidgetSize(widget.id)}
                      className="p-1.5 rounded-lg text-secondary-theme hover:text-primary-theme hover:bg-card-hover text-xs flex items-center gap-1 font-semibold"
                      title={widget.size === 'wide' ? 'Make standard width (1 column)' : 'Make wide (2 columns)'}
                    >
                      {widget.size === 'wide' ? (
                        <>
                          <Minimize2 className="w-3.5 h-3.5 text-accent-theme" />
                          <span className="text-[10px] text-accent-theme">Wide</span>
                        </>
                      ) : (
                        <>
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Normal</span>
                        </>
                      )}
                    </button>

                    {/* Move Up */}
                    <button
                      disabled={index === 0}
                      onClick={() => moveWidget(index, 'up')}
                      className="p-1.5 rounded-lg text-secondary-theme hover:text-primary-theme hover:bg-card-hover disabled:opacity-30"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Down */}
                    <button
                      disabled={index === activeWidgets.length - 1}
                      onClick={() => moveWidget(index, 'down')}
                      className="p-1.5 rounded-lg text-secondary-theme hover:text-primary-theme hover:bg-card-hover disabled:opacity-30"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-theme flex items-center justify-between shrink-0">
              <button
                onClick={resetWidgets}
                className="text-xs font-semibold text-rose-500 hover:underline"
              >
                Reset Layout
              </button>
              <button
                onClick={() => setIsCustomizeOpen(false)}
                className="px-5 py-2 rounded-xl bg-accent-theme text-white text-xs font-bold hover:opacity-95 shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

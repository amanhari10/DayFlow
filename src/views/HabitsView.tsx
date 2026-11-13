/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Flame,
  Plus,
  Check,
  Calendar,
  Award,
  Trash2,
  Edit2,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Habit } from '../types';
import { getTodayDateString, formatReadableDate } from '../utils/helpers';
import { HabitModal } from '../components/modals/HabitModal';

export const HabitsView: React.FC = () => {
  const {
    habits,
    habitCheckins,
    toggleHabitCheckin,
    deleteHabit,
    setEditingHabit,
    editingHabit,
    settings,
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0); // 0 = current month

  const todayStr = getTodayDateString();

  // Past 7 days for the quick daily check-in row
  const last7Days = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
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
  }, [todayStr]);

  // Compute habit statistics for each habit (Current streak, Longest streak, 30-day rate)
  const habitStats = useMemo(() => {
    const now = new Date();

    return habits.map((habit) => {
      // 1. Current streak calculation
      let currentStreak = 0;
      let checkDate = new Date(now);

      // Check today first
      const y = checkDate.getFullYear();
      const m = String(checkDate.getMonth() + 1).padStart(2, '0');
      const d = String(checkDate.getDate()).padStart(2, '0');
      const todayKey = `${y}-${m}-${d}`;
      const hasToday = habitCheckins.some((c) => c.habitId === habit.id && c.date === todayKey && c.completed);

      if (hasToday) {
        currentStreak++;
      }

      // Check backwards from yesterday
      for (let i = 1; i <= 60; i++) {
        const past = new Date(now);
        past.setDate(now.getDate() - i);
        const py = past.getFullYear();
        const pm = String(past.getMonth() + 1).padStart(2, '0');
        const pd = String(past.getDate()).padStart(2, '0');
        const pastKey = `${py}-${pm}-${pd}`;
        const hasPast = habitCheckins.some((c) => c.habitId === habit.id && c.date === pastKey && c.completed);

        if (hasPast) {
          currentStreak++;
        } else {
          // If we didn't complete today, yesterday missing means 0 streak. Otherwise broke streak.
          break;
        }
      }

      // 2. Longest streak (scan last 90 days)
      let longestStreak = 0;
      let tempStreak = 0;
      for (let i = 89; i >= 0; i--) {
        const past = new Date(now);
        past.setDate(now.getDate() - i);
        const py = past.getFullYear();
        const pm = String(past.getMonth() + 1).padStart(2, '0');
        const pd = String(past.getDate()).padStart(2, '0');
        const pastKey = `${py}-${pm}-${pd}`;
        const hasPast = habitCheckins.some((c) => c.habitId === habit.id && c.date === pastKey && c.completed);

        if (hasPast) {
          tempStreak++;
          if (tempStreak > longestStreak) longestStreak = tempStreak;
        } else {
          tempStreak = 0;
        }
      }

      // 3. Last 30 days completion rate
      let past30Count = 0;
      for (let i = 0; i < 30; i++) {
        const past = new Date(now);
        past.setDate(now.getDate() - i);
        const py = past.getFullYear();
        const pm = String(past.getMonth() + 1).padStart(2, '0');
        const pd = String(past.getDate()).padStart(2, '0');
        const pastKey = `${py}-${pm}-${pd}`;
        if (habitCheckins.some((c) => c.habitId === habit.id && c.date === pastKey && c.completed)) {
          past30Count++;
        }
      }
      const monthlyRate = Math.round((past30Count / 30) * 100);

      // Check today's status
      const isTodayDone = hasToday;

      return {
        habit,
        currentStreak,
        longestStreak: Math.max(longestStreak, currentStreak),
        monthlyRate,
        isTodayDone,
      };
    });
  }, [habits, habitCheckins]);

  // Overall average habit score
  const overallConsistency = useMemo(() => {
    if (habitStats.length === 0) return 0;
    const sum = habitStats.reduce((acc, h) => acc + h.monthlyRate, 0);
    return Math.round(sum / habitStats.length);
  }, [habitStats]);

  // Monthly heatmap days (last 28 days grid for all habits)
  const heatmapDays = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dateNum = String(d.getDate()).padStart(2, '0');
      days.push(`${y}-${m}-${dateNum}`);
    }
    return days;
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme">
            Habit Tracker
          </h2>
          <p className="text-xs sm:text-sm text-secondary-theme mt-1">
            Build consistency through continuous daily check-ins, streaks, and monthly completion matrices.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> New Habit
        </button>
      </div>

      {/* High-level stats banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-card-theme border border-theme shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-secondary-theme">Active Habits</span>
            <p className="text-xl font-extrabold text-primary-theme font-mono">{habits.length}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card-theme border border-theme shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-accent-light-theme text-accent-theme">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-secondary-theme">30-Day Consistency</span>
            <p className="text-xl font-extrabold text-primary-theme font-mono">{overallConsistency}%</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-card-theme border border-theme shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-secondary-theme">Longest Current Streak</span>
            <p className="text-xl font-extrabold text-primary-theme font-mono">
              {Math.max(...habitStats.map((h) => h.currentStreak), 0)} Days
            </p>
          </div>
        </div>
      </div>

      {/* Main Habits List with 7-Day Quick Check-in Matrix */}
      <div className="bg-card-theme rounded-2xl border border-theme shadow-xs overflow-hidden">
        <div className="p-4 border-b border-theme flex items-center justify-between">
          <h3 className="font-bold text-sm sm:text-base text-primary-theme">
            Weekly Progress Matrix
          </h3>
          <span className="text-xs text-muted-theme">Click any day circle to toggle check-in</span>
        </div>

        {habits.length === 0 ? (
          <div className="py-16 text-center text-secondary-theme">
            <Flame className="w-10 h-10 mx-auto text-muted-theme opacity-30 mb-3" />
            <p className="text-base font-semibold text-primary-theme">No habits tracked yet</p>
            <p className="text-xs text-muted-theme mt-1">Start tracking daily routines like reading, hydration, or exercise.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs"
            >
              + Create First Habit
            </button>
          </div>
        ) : (
          <div className="divide-y divide-theme">
            {habitStats.map(({ habit, currentStreak, longestStreak, monthlyRate, isTodayDone }) => (
              <div key={habit.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-card-hover/40 transition-colors">
                {/* Habit title & streak badges */}
                <div className="min-w-0 md:w-64">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent-theme shrink-0" />
                    <h4 className="font-bold text-sm text-primary-theme truncate">
                      {habit.title}
                    </h4>
                  </div>
                  {habit.description && (
                    <p className="text-xs text-secondary-theme truncate mt-0.5">
                      {habit.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-secondary-theme flex-wrap">
                    <span className="flex items-center gap-1 font-bold text-amber-500">
                      <Flame className="w-3.5 h-3.5 fill-amber-500" /> {currentStreak}d streak
                    </span>
                    <span>·</span>
                    <span>Best: {longestStreak}d</span>
                    <span>·</span>
                    <span className="font-mono text-accent-theme font-bold">{monthlyRate}% monthly</span>
                  </div>
                </div>

                {/* 7-Day interactive check-in circles */}
                <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-1">
                  {last7Days.map((d) => {
                    const isChecked = habitCheckins.some(
                      (c) => c.habitId === habit.id && c.date === d.dateStr && c.completed
                    );

                    return (
                      <button
                        key={d.dateStr}
                        onClick={() => toggleHabitCheckin(habit.id, d.dateStr)}
                        className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all cursor-pointer ${
                          d.isToday ? 'bg-secondary-theme ring-1 ring-accent-theme' : 'hover:bg-secondary-theme'
                        }`}
                        title={`${d.dayName}, ${formatReadableDate(d.dateStr)} - Click to toggle`}
                      >
                        <span className={`text-[10px] font-bold ${d.isToday ? 'text-accent-theme' : 'text-muted-theme'}`}>
                          {d.dayName}
                        </span>
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                            isChecked
                              ? 'bg-emerald-500 text-white shadow-xs font-bold'
                              : 'border-2 border-theme text-transparent hover:border-accent-theme'
                          }`}
                        >
                          {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>
                        <span className="text-[9px] font-mono text-muted-theme">{d.dayNumber}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Today 1-Click Action & Edit/Delete */}
                <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-subtle-theme">
                  <button
                    onClick={() => toggleHabitCheckin(habit.id, todayStr)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                      isTodayDone
                        ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                        : 'bg-accent-theme text-white hover:bg-accent-hover'
                    }`}
                  >
                    {isTodayDone ? 'Completed Today ✓' : 'Check In Today'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingHabit(habit)}
                      className="p-1.5 rounded-lg text-secondary-theme hover:text-primary-theme hover:bg-secondary-theme"
                      title="Edit habit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-1.5 rounded-lg text-secondary-theme hover:text-rose-500 hover:bg-secondary-theme"
                      title="Delete habit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly Habit Heatmap Matrix */}
      {habits.length > 0 && (
        <div className="bg-card-theme rounded-2xl border border-theme shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-theme">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-primary-theme flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-theme" /> 28-Day Consistency Heatmap
              </h3>
              <p className="text-xs text-secondary-theme mt-0.5">
                Visualizing habit streaks over the past 4 weeks
              </p>
            </div>
          </div>

          <div className="space-y-3 overflow-x-auto pb-2">
            {habits.map((h) => (
              <div key={`heat-${h.id}`} className="flex items-center gap-3">
                <span className="text-xs font-semibold text-secondary-theme w-36 truncate shrink-0">
                  {h.title}
                </span>
                <div className="flex items-center gap-1.5">
                  {heatmapDays.map((dStr) => {
                    const done = habitCheckins.some(
                      (c) => c.habitId === h.id && c.date === dStr && c.completed
                    );
                    return (
                      <button
                        key={dStr}
                        onClick={() => toggleHabitCheckin(h.id, dStr)}
                        className={`w-4 h-4 rounded-xs transition-colors cursor-pointer ${
                          done ? 'bg-emerald-500 shadow-xs' : 'bg-secondary-theme hover:bg-secondary-theme/80'
                        }`}
                        title={`${formatReadableDate(dStr)}: ${done ? 'Completed' : 'Missed'}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Habit Modal */}
      {(isAddModalOpen || editingHabit) && (
        <HabitModal
          isOpen={isAddModalOpen || !!editingHabit}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingHabit(null);
          }}
          habit={editingHabit}
        />
      )}
    </div>
  );
};

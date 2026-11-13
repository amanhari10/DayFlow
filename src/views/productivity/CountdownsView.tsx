/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Hourglass,
  Plus,
  Trash2,
  Calendar,
  Gift,
  Compass,
  Target,
  Sparkles,
  Flame,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTodayDateString, calculateBirthdayInfo } from '../../utils/helpers';
import { DateTimePicker } from '../../components/DateTimePicker';

interface CustomCountdown {
  id: string;
  title: string;
  targetDate: string; // YYYY-MM-DD
  category: 'Event' | 'Launch' | 'Personal' | 'Celebration';
}

export const CountdownsView: React.FC = () => {
  const { birthdays, tripPlans, goals, specialDates } = useApp();

  const [customList, setCustomList] = useState<CustomCountdown[]>(() => {
    try {
      const stored = localStorage.getItem('dayflow_custom_countdowns');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      { id: 'cd-1', title: 'New Year Milestone', targetDate: `${new Date().getFullYear() + 1}-01-01`, category: 'Celebration' },
    ];
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState(getTodayDateString());
  const [category, setCategory] = useState<CustomCountdown['category']>('Launch');

  const todayStr = getTodayDateString();

  const saveCustom = (items: CustomCountdown[]) => {
    setCustomList(items);
    try {
      localStorage.setItem('dayflow_custom_countdowns', JSON.stringify(items));
    } catch {}
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const newItem: CustomCountdown = {
      id: `cd-${Date.now()}`,
      title: title.trim(),
      targetDate,
      category,
    };
    saveCustom([...customList, newItem]);
    setTitle('');
    setModalOpen(false);
  };

  const handleDeleteCustom = (id: string) => {
    saveCustom(customList.filter((c) => c.id !== id));
  };

  // Compile all unified countdown items
  const allCountdowns = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      targetDate: string;
      daysRemaining: number;
      type: 'trip' | 'birthday' | 'goal' | 'custom';
      icon: any;
      color: string;
    }> = [];

    const todayMs = new Date(todayStr).getTime();

    // Trips
    tripPlans.forEach((t) => {
      const diff = Math.ceil((new Date(t.startDate).getTime() - todayMs) / (1000 * 60 * 60 * 24));
      if (diff >= 0) {
        list.push({
          id: t.id,
          title: `Trip: ${t.destination}`,
          targetDate: t.startDate,
          daysRemaining: diff,
          type: 'trip',
          icon: Compass,
          color: 'text-blue-500 bg-blue-500/10',
        });
      }
    });

    // Birthdays
    birthdays.forEach((b) => {
      const info = calculateBirthdayInfo(b);
      list.push({
        id: b.id,
        title: info.turningAge ? `${b.name}'s Birthday (${info.turningAge} yo)` : `${b.name}'s Birthday`,
        targetDate: info.formattedDate,
        daysRemaining: info.daysUntil,
        type: 'birthday',
        icon: Gift,
        color: 'text-pink-500 bg-pink-500/10',
      });
    });

    // Goals with deadlines
    goals.forEach((g) => {
      if (g.targetDate) {
        const diff = Math.ceil((new Date(g.targetDate).getTime() - todayMs) / (1000 * 60 * 60 * 24));
        if (diff >= 0 && g.status !== 'completed') {
          list.push({
            id: g.id,
            title: `Goal: ${g.title}`,
            targetDate: g.targetDate,
            daysRemaining: diff,
            type: 'goal',
            icon: Target,
            color: 'text-emerald-500 bg-emerald-500/10',
          });
        }
      }
    });

    // Custom
    customList.forEach((c) => {
      const diff = Math.ceil((new Date(c.targetDate).getTime() - todayMs) / (1000 * 60 * 60 * 24));
      list.push({
        id: c.id,
        title: c.title,
        targetDate: c.targetDate,
        daysRemaining: diff,
        type: 'custom',
        icon: Hourglass,
        color: 'text-accent-theme bg-accent-light-theme',
      });
    });

    return list.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [tripPlans, birthdays, goals, customList, todayStr]);

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-accent-theme uppercase tracking-wider mb-1">
            <Hourglass className="w-4 h-4" />
            <span>Milestones & Deadlines</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme">
            Countdown Center
          </h1>
          <p className="text-xs sm:text-sm text-secondary-theme mt-1">
            Anticipate big life events, product launches, trips, and birthdays in one unified timeline.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-theme text-white text-sm font-semibold hover:opacity-95 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Custom Countdown</span>
        </button>
      </div>

      {/* Grid of countdown cards */}
      {allCountdowns.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl border border-theme">
          <Hourglass className="w-10 h-10 mx-auto text-secondary-theme/40 mb-3" />
          <h3 className="text-sm font-semibold text-primary-theme">No active countdowns</h3>
          <p className="text-xs text-secondary-theme mt-1">Create custom milestones or add birthdays & trips.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allCountdowns.map((cd) => {
            const Icon = cd.icon;
            const isToday = cd.daysRemaining === 0;

            return (
              <div
                key={cd.id}
                className="p-5 rounded-3xl bg-card border border-theme hover:border-accent-light-theme transition-all shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${cd.color}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {cd.type}
                    </span>

                    {cd.type === 'custom' && (
                      <button
                        onClick={() => handleDeleteCustom(cd.id)}
                        className="p-1 rounded text-secondary-theme hover:text-rose-500"
                        title="Delete custom countdown"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-primary-theme mt-3 line-clamp-2">{cd.title}</h3>

                  <div className="flex items-center gap-1.5 text-xs text-secondary-theme mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Target: {cd.targetDate}</span>
                  </div>
                </div>

                {/* Big Number Pill */}
                <div className="p-4 rounded-2xl bg-app border border-theme text-center">
                  {isToday ? (
                    <div>
                      <p className="text-2xl font-black text-accent-theme animate-bounce">TODAY! 🎉</p>
                      <p className="text-[11px] text-secondary-theme font-medium mt-0.5">The wait is over!</p>
                    </div>
                  ) : cd.daysRemaining < 0 ? (
                    <div>
                      <p className="text-xl font-bold text-secondary-theme">Past Date</p>
                      <p className="text-[11px] text-secondary-theme mt-0.5">{Math.abs(cd.daysRemaining)} days ago</p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl font-black tracking-tight text-primary-theme">
                        {cd.daysRemaining}
                      </div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-secondary-theme mt-0.5">
                        {cd.daysRemaining === 1 ? 'Day Left' : 'Days Remaining'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for custom countdown */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-theme rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-primary-theme">Create Custom Countdown</h3>

            <form onSubmit={handleAddCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-secondary-theme mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marathon Day or Product Launch V1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-secondary-theme mb-1">Target Date</label>
                <DateTimePicker
                  type="date"
                  required
                  value={targetDate}
                  onChange={setTargetDate}
                  ariaLabel="Countdown target date"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-secondary-theme mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                >
                  <option value="Event">Event</option>
                  <option value="Launch">Launch</option>
                  <option value="Personal">Personal</option>
                  <option value="Celebration">Celebration</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-secondary-theme hover:bg-card-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:opacity-95"
                >
                  Create Countdown
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

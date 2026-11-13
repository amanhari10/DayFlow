/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Flame, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Habit, HabitFrequency } from '../../types';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit?: Habit | null;
}

const HABIT_CATEGORIES = ['Health', 'Productivity', 'Fitness', 'Learning', 'Mindset', 'Finance', 'Lifestyle'];

const HABIT_COLORS = [
  { name: 'emerald', bg: 'bg-emerald-500' },
  { name: 'blue', bg: 'bg-blue-500' },
  { name: 'purple', bg: 'bg-purple-500' },
  { name: 'amber', bg: 'bg-amber-500' },
  { name: 'rose', bg: 'bg-rose-500' },
  { name: 'indigo', bg: 'bg-indigo-500' },
  { name: 'cyan', bg: 'bg-cyan-500' },
];

export const HabitModal: React.FC<HabitModalProps> = ({ isOpen, onClose, habit }) => {
  const { addHabit, updateHabit } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Productivity');
  const [color, setColor] = useState('emerald');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [targetPerWeek, setTargetPerWeek] = useState(5);
  const [error, setError] = useState('');

  useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setDescription(habit.description || '');
      setCategory(habit.category);
      setColor(habit.color);
      setFrequency(habit.frequency);
      setTargetPerWeek(habit.targetPerWeek || 5);
    } else {
      setTitle('');
      setDescription('');
      setCategory('Productivity');
      setColor('emerald');
      setFrequency('daily');
      setTargetPerWeek(5);
    }
    setError('');
  }, [habit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Habit name is required');
      return;
    }

    if (habit) {
      await updateHabit({
        ...habit,
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        color,
        frequency,
        targetPerWeek: frequency === 'weekly_target' ? targetPerWeek : undefined,
      });
    } else {
      await addHabit({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        color,
        frequency,
        targetPerWeek: frequency === 'weekly_target' ? targetPerWeek : undefined,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-modal-theme rounded-2xl border border-theme shadow-2xl p-6 text-primary-theme"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-4 border-b border-theme">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-accent-light-theme text-accent-theme">
              <Flame className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              {habit ? 'Edit Habit' : 'Build New Habit'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-secondary-theme hover:bg-card-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
              Habit Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Morning 20m Reading, Meditate, Drink 2L"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-input-theme border border-theme focus:outline-hidden focus:ring-2 ring-accent-theme text-sm font-medium"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
              Why it matters / Motivation
            </label>
            <textarea
              rows={2}
              placeholder="Keep mind sharp and reduce stress before sleep..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme focus:outline-hidden focus:ring-2 ring-accent-theme text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme focus:outline-hidden focus:ring-2 ring-accent-theme text-sm"
              >
                {HABIT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
                Target Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as HabitFrequency)}
                className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme focus:outline-hidden focus:ring-2 ring-accent-theme text-sm"
              >
                <option value="daily">Every day</option>
                <option value="weekdays">Weekdays only (Mon-Fri)</option>
                <option value="weekends">Weekends only (Sat-Sun)</option>
                <option value="weekly_target">Custom days per week</option>
              </select>
            </div>
          </div>

          {frequency === 'weekly_target' && (
            <div>
              <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1">
                Days per week target: {targetPerWeek} days
              </label>
              <input
                type="range"
                min="1"
                max="6"
                value={targetPerWeek}
                onChange={(e) => setTargetPerWeek(parseInt(e.target.value, 10))}
                className="w-full accent-accent-theme cursor-pointer"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-secondary-theme uppercase tracking-wider mb-1.5">
              Highlight Color
            </label>
            <div className="flex items-center gap-2">
              {HABIT_COLORS.map((c) => (
                <button
                  type="button"
                  key={c.name}
                  onClick={() => setColor(c.name)}
                  className={`w-7 h-7 rounded-full ${c.bg} transition-transform ${
                    color === c.name ? 'ring-2 ring-offset-2 ring-accent-theme scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  aria-label={`Select ${c.name}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-theme">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-secondary-theme hover:bg-card-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-accent-theme text-white hover:bg-accent-hover transition-colors shadow-sm"
            >
              {habit ? 'Save Habit' : 'Start Tracking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

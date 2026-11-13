/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Target, Plus, CheckCircle2, Circle, Trash2, Calendar, Flag, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LifeGoal, Milestone } from '../../types';
import { formatReadableDate, getTodayDateString } from '../../utils/helpers';
import { DateTimePicker } from '../../components/DateTimePicker';

export const GoalsView: React.FC = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<LifeGoal | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<LifeGoal['category']>('Career');
  const [targetDate, setTargetDate] = useState(getTodayDateString());
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

  const openCreateModal = () => {
    setEditingGoal(null);
    setTitle('');
    setDescription('');
    setCategory('Career');
    setTargetDate(getTodayDateString());
    setMilestones([]);
    setIsModalOpen(true);
  };

  const openEditModal = (goal: LifeGoal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setDescription(goal.description);
    setCategory(goal.category);
    setTargetDate(goal.targetDate);
    setMilestones(goal.milestones || []);
    setIsModalOpen(true);
  };

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) return;
    setMilestones([
      ...milestones,
      {
        id: `m-${Date.now()}`,
        title: newMilestoneTitle.trim(),
        completed: false,
      },
    ]);
    setNewMilestoneTitle('');
  };

  const handleToggleMilestone = async (goal: LifeGoal, milestoneId: string) => {
    const updatedMilestones = goal.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    const completedCount = updatedMilestones.filter((m) => m.completed).length;
    const progress = updatedMilestones.length > 0 ? Math.round((completedCount / updatedMilestones.length) * 100) : 0;
    const status = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started';

    await updateGoal({
      ...goal,
      milestones: updatedMilestones,
      progress,
      status,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const completedCount = milestones.filter((m) => m.completed).length;
    const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;
    const status = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started';

    if (editingGoal) {
      await updateGoal({
        ...editingGoal,
        title: title.trim(),
        description: description.trim(),
        category,
        targetDate,
        milestones,
        progress,
        status,
      });
    } else {
      await addGoal({
        title: title.trim(),
        description: description.trim(),
        category,
        targetDate,
        milestones,
        progress,
        status,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme flex items-center gap-2">
            <Target className="w-7 h-7 text-accent-theme" /> Life Goals & Milestones
          </h2>
          <p className="text-xs sm:text-sm text-secondary-theme mt-1">
            Turn your long-term aspirations into actionable, trackable milestones.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> New Life Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="py-16 text-center text-secondary-theme bg-card-theme rounded-2xl border border-theme">
          <Target className="w-10 h-10 mx-auto text-muted-theme opacity-30 mb-3" />
          <p className="text-base font-semibold text-primary-theme">No Life Goals Defined</p>
          <p className="text-xs text-muted-theme mt-1">Set big-picture milestones for career, health, or finance.</p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold"
          >
            + Create First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((g) => (
            <div
              key={g.id}
              className="bg-card-theme rounded-2xl border border-theme p-5 shadow-xs flex flex-col justify-between hover:border-strong-theme transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-secondary-theme text-secondary-theme">
                    {g.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      g.status === 'completed'
                        ? 'bg-emerald-500/15 text-emerald-500'
                        : g.status === 'in_progress'
                        ? 'bg-amber-500/15 text-amber-500'
                        : 'bg-secondary-theme text-secondary-theme'
                    }`}
                  >
                    {g.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-base font-bold text-primary-theme mt-2 leading-snug">
                  {g.title}
                </h3>
                {g.description && (
                  <p className="text-xs text-secondary-theme mt-1 line-clamp-2">
                    {g.description}
                  </p>
                )}

                {/* Progress Bar */}
                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-secondary-theme">Progress</span>
                    <span className="text-accent-theme font-mono">{g.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-secondary-theme overflow-hidden">
                    <div
                      style={{ width: `${g.progress}%` }}
                      className="h-full bg-accent-theme rounded-full transition-all duration-500"
                    />
                  </div>
                </div>

                {/* Milestones Checklist */}
                {g.milestones.length > 0 && (
                  <div className="mt-4 space-y-1.5 border-t border-subtle-theme pt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-theme block mb-1">
                      Milestones ({g.milestones.filter((m) => m.completed).length}/{g.milestones.length})
                    </span>
                    {g.milestones.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleToggleMilestone(g, m.id)}
                        className="flex items-center gap-2 text-xs text-secondary-theme hover:text-primary-theme cursor-pointer"
                      >
                        {m.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-theme shrink-0" />
                        )}
                        <span className={`truncate ${m.completed ? 'line-through text-muted-theme' : ''}`}>
                          {m.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-theme flex items-center justify-between text-xs text-secondary-theme">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-accent-theme" />
                  Target: {formatReadableDate(g.targetDate)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(g)}
                    className="p-1 rounded-md text-secondary-theme hover:text-primary-theme hover:bg-secondary-theme"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteGoal(g.id)}
                    className="p-1 rounded-md text-secondary-theme hover:text-rose-500 hover:bg-secondary-theme"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-modal-theme rounded-2xl border border-theme p-6 text-primary-theme shadow-2xl space-y-4">
            <h3 className="font-bold text-lg">{editingGoal ? 'Edit Goal' : 'New Life Goal'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Run a half marathon"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Why this goal matters..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-sm"
                  >
                    <option value="Career">Career</option>
                    <option value="Financial">Financial</option>
                    <option value="Health">Health</option>
                    <option value="Personal">Personal</option>
                    <option value="Education">Education</option>
                    <option value="Spiritual">Spiritual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Target Date</label>
                  <DateTimePicker
                    type="date"
                    required
                    value={targetDate}
                    onChange={setTargetDate}
                    ariaLabel="Goal target date"
                  />
                </div>
              </div>

              {/* Milestones list in modal */}
              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Key Milestones</label>
                <div className="space-y-1.5 mb-2 max-h-32 overflow-y-auto">
                  {milestones.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-card-theme border border-theme text-xs">
                      <span>{m.title}</span>
                      <button
                        type="button"
                        onClick={() => setMilestones(milestones.filter((item) => item.id !== m.id))}
                        className="text-rose-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a milestone..."
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-input-theme border border-theme text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddMilestone}
                    className="px-3 py-1.5 rounded-lg bg-card-hover border border-theme text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-theme">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-secondary-theme hover:bg-card-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:bg-accent-hover"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Grid,
  Plus,
  CheckSquare,
  Square,
  AlertCircle,
  Calendar,
  Sparkles,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Task, Priority } from '../../types';
import { getTodayDateString } from '../../utils/helpers';

export const EisenhowerMatrixView: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskComplete } = useApp();

  const [quickInput, setQuickInput] = useState<{ [key: string]: string }>({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
  });

  // Assign tasks to quadrants based on priority and urgency
  // Q1: Urgent (priority === 'urgent')
  // Q2: Important / High (priority === 'high')
  // Q3: Medium (priority === 'medium')
  // Q4: Low (priority === 'low')
  const activeTasks = useMemo(() => tasks.filter((t) => t.status !== 'completed'), [tasks]);

  const quadrants = useMemo(() => {
    return {
      q1: activeTasks.filter((t) => t.priority === 'urgent'),
      q2: activeTasks.filter((t) => t.priority === 'high'),
      q3: activeTasks.filter((t) => t.priority === 'medium'),
      q4: activeTasks.filter((t) => t.priority === 'low'),
    };
  }, [activeTasks]);

  const handleQuickAdd = async (qKey: 'q1' | 'q2' | 'q3' | 'q4', priority: Priority) => {
    const title = quickInput[qKey]?.trim();
    if (!title) return;

    await addTask({
      title,
      description: '',
      priority,
      status: 'todo',
      dueDate: getTodayDateString(),
      category: 'General',
      subtasks: [],
      tags: ['eisenhower'],
      recurrence: 'none',
      reminder: false,
    });

    setQuickInput((prev) => ({ ...prev, [qKey]: '' }));
  };

  const handleMovePriority = async (task: Task, newPriority: Priority) => {
    await updateTask({ ...task, priority: newPriority });
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-accent-theme uppercase tracking-wider mb-1">
            <Grid className="w-4 h-4" />
            <span>Productivity Frameworks</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme">
            Eisenhower Decision Matrix
          </h1>
          <p className="text-xs sm:text-sm text-secondary-theme mt-1">
            Prioritize high-impact execution by sorting urgency versus strategic importance.
          </p>
        </div>
      </div>

      {/* 4 Quadrants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Q1: Do First (Urgent & Important) */}
        <div className="p-5 rounded-2xl bg-card border-2 border-rose-500/30 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <h3 className="font-bold text-sm text-primary-theme">Quadrant 1: Do First</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 uppercase">
                Urgent & Important ({quadrants.q1.length})
              </span>
            </div>
            <p className="text-[11px] text-secondary-theme mt-2">
              Crises, pressing deadlines, and bottleneck problems demanding immediate focus.
            </p>

            <div className="mt-4 space-y-2 max-h-72 overflow-y-auto">
              {quadrants.q1.length === 0 ? (
                <p className="text-xs text-secondary-theme italic py-4 text-center">No urgent crises right now.</p>
              ) : (
                quadrants.q1.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-app border border-theme text-xs"
                  >
                    <button onClick={() => toggleTaskComplete(t.id)}>
                      <Square className="w-4 h-4 text-secondary-theme hover:text-emerald-500" />
                    </button>
                    <span className="font-semibold text-primary-theme flex-1 truncate">{t.title}</span>
                    <button
                      onClick={() => handleMovePriority(t, 'high')}
                      className="text-[10px] text-secondary-theme hover:text-accent-theme flex items-center gap-0.5"
                      title="Move to Plan"
                    >
                      Plan <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleQuickAdd('q1', 'urgent');
            }}
            className="flex items-center gap-2 pt-2"
          >
            <input
              type="text"
              placeholder="Add urgent task..."
              value={quickInput.q1 || ''}
              onChange={(e) => setQuickInput((prev) => ({ ...prev, q1: e.target.value }))}
              className="flex-1 px-3 py-1.5 rounded-xl bg-app border border-theme text-xs text-primary-theme focus:outline-hidden"
            />
            <button
              type="submit"
              className="p-1.5 rounded-xl bg-rose-500 text-white hover:opacity-95"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Q2: Schedule / Plan (Not Urgent & Important) */}
        <div className="p-5 rounded-2xl bg-card border-2 border-accent-theme/40 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-accent-theme/20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-theme" />
                <h3 className="font-bold text-sm text-primary-theme">Quadrant 2: Schedule & Plan</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-accent-light-theme text-accent-theme uppercase">
                Important / Strategic ({quadrants.q2.length})
              </span>
            </div>
            <p className="text-[11px] text-secondary-theme mt-2">
              High-leverage growth, skill building, prevention, relationship cultivation.
            </p>

            <div className="mt-4 space-y-2 max-h-72 overflow-y-auto">
              {quadrants.q2.length === 0 ? (
                <p className="text-xs text-secondary-theme italic py-4 text-center">Schedule your highest leverage goals.</p>
              ) : (
                quadrants.q2.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-app border border-theme text-xs"
                  >
                    <button onClick={() => toggleTaskComplete(t.id)}>
                      <Square className="w-4 h-4 text-secondary-theme hover:text-emerald-500" />
                    </button>
                    <span className="font-semibold text-primary-theme flex-1 truncate">{t.title}</span>
                    <button
                      onClick={() => handleMovePriority(t, 'urgent')}
                      className="text-[10px] text-secondary-theme hover:text-rose-500 flex items-center gap-0.5"
                      title="Make Urgent"
                    >
                      Urgent <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleQuickAdd('q2', 'high');
            }}
            className="flex items-center gap-2 pt-2"
          >
            <input
              type="text"
              placeholder="Add strategic priority..."
              value={quickInput.q2 || ''}
              onChange={(e) => setQuickInput((prev) => ({ ...prev, q2: e.target.value }))}
              className="flex-1 px-3 py-1.5 rounded-xl bg-app border border-theme text-xs text-primary-theme focus:outline-hidden"
            />
            <button
              type="submit"
              className="p-1.5 rounded-xl bg-accent-theme text-white hover:opacity-95"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Q3: Delegate / Automate (Urgent & Not Important) */}
        <div className="p-5 rounded-2xl bg-card border border-theme shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-theme">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <h3 className="font-bold text-sm text-primary-theme">Quadrant 3: Delegate / Streamline</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 uppercase">
                Urgent, Low Impact ({quadrants.q3.length})
              </span>
            </div>
            <p className="text-[11px] text-secondary-theme mt-2">
              Interruptions, ad-hoc administrative requests, non-critical meetings.
            </p>

            <div className="mt-4 space-y-2 max-h-72 overflow-y-auto">
              {quadrants.q3.length === 0 ? (
                <p className="text-xs text-secondary-theme italic py-4 text-center">No low-impact urgencies.</p>
              ) : (
                quadrants.q3.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-app border border-theme text-xs"
                  >
                    <button onClick={() => toggleTaskComplete(t.id)}>
                      <Square className="w-4 h-4 text-secondary-theme hover:text-emerald-500" />
                    </button>
                    <span className="font-semibold text-primary-theme flex-1 truncate">{t.title}</span>
                    <button
                      onClick={() => handleMovePriority(t, 'high')}
                      className="text-[10px] text-secondary-theme hover:text-accent-theme flex items-center gap-0.5"
                    >
                      Promote <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleQuickAdd('q3', 'medium');
            }}
            className="flex items-center gap-2 pt-2"
          >
            <input
              type="text"
              placeholder="Add delegate task..."
              value={quickInput.q3 || ''}
              onChange={(e) => setQuickInput((prev) => ({ ...prev, q3: e.target.value }))}
              className="flex-1 px-3 py-1.5 rounded-xl bg-app border border-theme text-xs text-primary-theme focus:outline-hidden"
            />
            <button
              type="submit"
              className="p-1.5 rounded-xl bg-amber-500 text-white hover:opacity-95"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Q4: Eliminate / Delete (Not Urgent & Not Important) */}
        <div className="p-5 rounded-2xl bg-card border border-theme shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-theme">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <h3 className="font-bold text-sm text-primary-theme">Quadrant 4: Eliminate</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-secondary-theme/10 text-secondary-theme uppercase">
                Low Priority ({quadrants.q4.length})
              </span>
            </div>
            <p className="text-[11px] text-secondary-theme mt-2">
              Time wasters, excessive busywork, non-productive habits.
            </p>

            <div className="mt-4 space-y-2 max-h-72 overflow-y-auto">
              {quadrants.q4.length === 0 ? (
                <p className="text-xs text-secondary-theme italic py-4 text-center">Quadrant clear.</p>
              ) : (
                quadrants.q4.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-app border border-theme text-xs"
                  >
                    <button onClick={() => toggleTaskComplete(t.id)}>
                      <Square className="w-4 h-4 text-secondary-theme hover:text-emerald-500" />
                    </button>
                    <span className="font-medium text-secondary-theme flex-1 truncate line-through">{t.title}</span>
                    <button
                      onClick={() => deleteTask(t.id)}
                      className="p-1 text-secondary-theme hover:text-rose-500"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleQuickAdd('q4', 'low');
            }}
            className="flex items-center gap-2 pt-2"
          >
            <input
              type="text"
              placeholder="Add low priority item..."
              value={quickInput.q4 || ''}
              onChange={(e) => setQuickInput((prev) => ({ ...prev, q4: e.target.value }))}
              className="flex-1 px-3 py-1.5 rounded-xl bg-app border border-theme text-xs text-primary-theme focus:outline-hidden"
            />
            <button
              type="submit"
              className="p-1.5 rounded-xl bg-secondary-theme text-white hover:opacity-95"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

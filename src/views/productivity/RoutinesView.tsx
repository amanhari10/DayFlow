/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sunrise,
  Sunset,
  CheckCircle2,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  RotateCcw,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { triggerCelebration } from '../../utils/helpers';

export const RoutinesView: React.FC = () => {
  const {
    settings,
    updateSettings,
    toggleMorningRoutineItem,
    toggleEveningRoutineItem,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'morning' | 'evening'>('morning');
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepDuration, setNewStepDuration] = useState(10);

  const morningItems = settings.morningRoutine || [];
  const eveningItems = settings.eveningRoutine || [];

  const morningCompleted = morningItems.filter((i) => i.completed).length;
  const morningTotalMins = morningItems.reduce((acc, i) => acc + (i.durationMins || 0), 0);

  const eveningCompleted = eveningItems.filter((i) => i.completed).length;
  const eveningTotalMins = eveningItems.reduce((acc, i) => acc + (i.durationMins || 0), 0);

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepTitle.trim()) return;

    const newItem = {
      id: `step-${Date.now()}`,
      title: newStepTitle.trim(),
      durationMins: Number(newStepDuration) || 5,
      completed: false,
    };

    if (activeTab === 'morning') {
      await updateSettings({
        morningRoutine: [...morningItems, newItem],
      });
    } else {
      await updateSettings({
        eveningRoutine: [...eveningItems, newItem],
      });
    }

    setNewStepTitle('');
    setNewStepDuration(10);
  };

  const handleDeleteStep = async (id: string, type: 'morning' | 'evening') => {
    if (type === 'morning') {
      await updateSettings({
        morningRoutine: morningItems.filter((i) => i.id !== id),
      });
    } else {
      await updateSettings({
        eveningRoutine: eveningItems.filter((i) => i.id !== id),
      });
    }
  };

  const handleReset = async (type: 'morning' | 'evening') => {
    if (type === 'morning') {
      await updateSettings({
        morningRoutine: morningItems.map((i) => ({ ...i, completed: false })),
      });
    } else {
      await updateSettings({
        eveningRoutine: eveningItems.map((i) => ({ ...i, completed: false })),
      });
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-accent-theme uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Habits & Systems</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme">
            Morning & Evening Routines
          </h1>
          <p className="text-xs sm:text-sm text-secondary-theme mt-1">
            Build bulletproof rituals to bookend your days with intention, clarity, and calmness.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-card p-1 rounded-2xl border border-theme">
          <button
            onClick={() => setActiveTab('morning')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'morning'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-secondary-theme hover:text-primary-theme'
            }`}
          >
            <Sunrise className="w-4 h-4" />
            <span>Morning ({morningCompleted}/{morningItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('evening')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'evening'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-secondary-theme hover:text-primary-theme'
            }`}
          >
            <Sunset className="w-4 h-4" />
            <span>Evening ({eveningCompleted}/{eveningItems.length})</span>
          </button>
        </div>
      </div>

      {/* Routine Container */}
      <div className="p-6 rounded-3xl bg-card border border-theme shadow-xs space-y-6">
        {/* Progress header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-theme">
          <div>
            <h2 className="text-lg font-bold text-primary-theme flex items-center gap-2">
              {activeTab === 'morning' ? (
                <>
                  <Sunrise className="w-5 h-5 text-amber-500" />
                  Morning Wake-up Ritual
                </>
              ) : (
                <>
                  <Sunset className="w-5 h-5 text-indigo-400" />
                  Evening Digital Sunset & Wind-down
                </>
              )}
            </h2>
            <p className="text-xs text-secondary-theme mt-0.5">
              Est. Duration: {activeTab === 'morning' ? morningTotalMins : eveningTotalMins} minutes
            </p>
          </div>

          <button
            onClick={() => handleReset(activeTab)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-theme text-xs font-semibold text-secondary-theme hover:bg-card-hover hover:text-primary-theme transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Ritual for Today</span>
          </button>
        </div>

        {/* Steps List */}
        <div className="space-y-2.5">
          {(activeTab === 'morning' ? morningItems : eveningItems).map((step) => (
            <div
              key={step.id}
              onClick={() =>
                activeTab === 'morning'
                  ? toggleMorningRoutineItem(step.id)
                  : toggleEveningRoutineItem(step.id)
              }
              className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                step.completed
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 line-through'
                  : 'bg-app border-theme hover:border-accent-theme text-primary-theme'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  step.completed ? 'bg-emerald-500 text-white' : 'border border-theme'
                }`}
              >
                {step.completed && <Check className="w-4 h-4" />}
              </div>

              <span className="font-semibold text-sm flex-1">{step.title}</span>

              {step.durationMins && (
                <span className="flex items-center gap-1 text-xs text-secondary-theme">
                  <Clock className="w-3 h-3" />
                  {step.durationMins}m
                </span>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteStep(step.id, activeTab);
                }}
                className="p-1 rounded text-secondary-theme hover:text-rose-500 ml-2"
                title="Remove step"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Step Form */}
        <form
          onSubmit={handleAddStep}
          className="pt-4 border-t border-theme flex flex-col sm:flex-row items-center gap-2"
        >
          <input
            type="text"
            required
            placeholder={`Add new step to ${activeTab} routine...`}
            value={newStepTitle}
            onChange={(e) => setNewStepTitle(e.target.value)}
            className="flex-1 w-full sm:w-auto px-3.5 py-2 rounded-xl bg-app border border-theme text-xs text-primary-theme focus:outline-hidden focus:border-accent-theme"
          />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="number"
              min="1"
              max="120"
              placeholder="Mins"
              value={newStepDuration}
              onChange={(e) => setNewStepDuration(Number(e.target.value))}
              className="w-20 px-3 py-2 rounded-xl bg-app border border-theme text-xs text-primary-theme text-center focus:outline-hidden"
            />
            <button
              type="submit"
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:opacity-95 shadow-sm"
            >
              Add Step
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

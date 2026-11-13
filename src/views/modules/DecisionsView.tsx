/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Scale,
  Plus,
  Trash2,
  Calendar,
  CheckCircle,
  Edit2,
  Star,
  BrainCircuit,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DecisionItem } from '../../types';
import { getTodayDateString } from '../../utils/helpers';

export const DecisionsView: React.FC = () => {
  const { decisionItems, addDecision, updateDecision, deleteDecision } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDecision, setEditingDecision] = useState<DecisionItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [decisionDate, setDecisionDate] = useState(getTodayDateString());
  const [context, setContext] = useState('');
  const [optionsConsidered, setOptionsConsidered] = useState<string[]>(['Option A', 'Option B']);
  const [chosenOption, setChosenOption] = useState('');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [actualOutcome, setActualOutcome] = useState('');
  const [reflectionRating, setReflectionRating] = useState<number | undefined>(undefined);

  const openAddModal = () => {
    setEditingDecision(null);
    setTitle('');
    setDecisionDate(getTodayDateString());
    setContext('');
    setOptionsConsidered(['Option A', 'Option B']);
    setChosenOption('');
    setExpectedOutcome('');
    setActualOutcome('');
    setReflectionRating(undefined);
    setModalOpen(true);
  };

  const openEditModal = (item: DecisionItem) => {
    setEditingDecision(item);
    setTitle(item.title);
    setDecisionDate(item.decisionDate);
    setContext(item.context);
    setOptionsConsidered(item.optionsConsidered || ['']);
    setChosenOption(item.chosenOption);
    setExpectedOutcome(item.expectedOutcome);
    setActualOutcome(item.actualOutcome || '');
    setReflectionRating(item.reflectionRating);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOptions = optionsConsidered.map((o) => o.trim()).filter((o) => o.length > 0);

    if (editingDecision) {
      await updateDecision({
        ...editingDecision,
        title: title.trim(),
        decisionDate,
        context: context.trim(),
        optionsConsidered: cleanOptions,
        chosenOption: chosenOption.trim(),
        expectedOutcome: expectedOutcome.trim(),
        actualOutcome: actualOutcome.trim() || undefined,
        reflectionRating: reflectionRating ? Number(reflectionRating) : undefined,
      });
    } else {
      await addDecision({
        title: title.trim(),
        decisionDate,
        context: context.trim(),
        optionsConsidered: cleanOptions,
        chosenOption: chosenOption.trim(),
        expectedOutcome: expectedOutcome.trim(),
        actualOutcome: actualOutcome.trim() || undefined,
        reflectionRating: reflectionRating ? Number(reflectionRating) : undefined,
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-accent-theme uppercase tracking-wider mb-1">
            <Scale className="w-4 h-4" />
            <span>Wisdom & Mental Models</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme">
            Decision Journal
          </h1>
          <p className="text-xs sm:text-sm text-secondary-theme mt-1">
            Capture reasoning in the moment, combat hindsight bias, and evaluate outcomes over time.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-theme text-white text-sm font-semibold hover:opacity-95 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Record Decision</span>
        </button>
      </div>

      {/* Decisions List */}
      {decisionItems.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl border border-theme">
          <BrainCircuit className="w-10 h-10 mx-auto text-secondary-theme/40 mb-3" />
          <h3 className="text-sm font-semibold text-primary-theme">No decisions recorded yet</h3>
          <p className="text-xs text-secondary-theme mt-1">
            Document key strategic choices, career pivots, and life determinations.
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:opacity-95"
          >
            Record First Decision
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {decisionItems.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-card border border-theme hover:border-accent-light-theme transition-all shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-secondary-theme">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Decided on {item.decisionDate}</span>
                    {item.reflectionRating && (
                      <div className="flex items-center gap-1 text-amber-400 ml-2">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="font-bold text-xs">{item.reflectionRating}/5 Reflection</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-primary-theme mt-1">{item.title}</h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg text-secondary-theme hover:bg-card-hover hover:text-primary-theme"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteDecision(item.id)}
                    className="p-1.5 rounded-lg text-secondary-theme hover:bg-rose-500/10 hover:text-rose-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Context */}
              <div className="p-3 rounded-xl bg-app border border-theme text-xs text-secondary-theme">
                <span className="font-bold text-primary-theme uppercase tracking-wider block text-[10px] mb-1">
                  Context & Stakes:
                </span>
                {item.context}
              </div>

              {/* Options & Chosen */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-app border border-theme">
                  <span className="font-bold text-secondary-theme uppercase tracking-wider block text-[10px] mb-2">
                    Options Considered:
                  </span>
                  <ul className="space-y-1 list-disc list-inside text-secondary-theme">
                    {item.optionsConsidered.map((opt, i) => (
                      <li key={i} className={opt === item.chosenOption ? 'font-bold text-accent-theme' : ''}>
                        {opt} {opt === item.chosenOption && '✓ (Chosen)'}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-accent-light-theme/40 border border-accent-light-theme">
                  <span className="font-bold text-accent-theme uppercase tracking-wider block text-[10px] mb-1">
                    Chosen Strategy & Expected Outcome:
                  </span>
                  <p className="font-bold text-primary-theme">{item.chosenOption}</p>
                  <p className="text-secondary-theme mt-1 italic">"{item.expectedOutcome}"</p>
                </div>
              </div>

              {/* Actual Outcome Reflection */}
              {item.actualOutcome ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-500 font-bold mb-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Actual Outcome & Hindsight Reflection:</span>
                  </div>
                  <p className="text-primary-theme">{item.actualOutcome}</p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-card-hover/50 text-xs text-secondary-theme">
                  <span>Outcome not reviewed yet. Follow up after 3-6 months.</span>
                  <button
                    onClick={() => openEditModal(item)}
                    className="text-accent-theme font-semibold hover:underline"
                  >
                    Add Outcome Review
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-theme rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-primary-theme">
              {editingDecision ? 'Edit Decision Record' : 'Record New Decision'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-secondary-theme mb-1">Decision Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Accept Job Offer at TechCorp vs Stay at Current Firm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-secondary-theme mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={decisionDate}
                  onChange={(e) => setDecisionDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-secondary-theme mb-1">
                  Context & Motivation
                </label>
                <textarea
                  rows={2}
                  required
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="What is the situation? Why is this decision necessary right now?"
                  className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme resize-none"
                />
              </div>

              {/* Options */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-secondary-theme">Options Considered</label>
                  <button
                    type="button"
                    onClick={() => setOptionsConsidered((prev) => [...prev, ''])}
                    className="text-xs text-accent-theme font-medium hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Option
                  </button>
                </div>
                <div className="space-y-2">
                  {optionsConsidered.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        value={opt}
                        onChange={(e) =>
                          setOptionsConsidered((prev) =>
                            prev.map((item, i) => (i === idx ? e.target.value : item))
                          )
                        }
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-app border border-theme text-xs text-primary-theme focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setOptionsConsidered((prev) => prev.filter((_, i) => i !== idx))}
                        className="p-1 text-secondary-theme hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-secondary-theme mb-1">Chosen Option</label>
                <input
                  type="text"
                  required
                  placeholder="Which option did you choose and why?"
                  value={chosenOption}
                  onChange={(e) => setChosenOption(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-secondary-theme mb-1">Expected Outcome</label>
                <textarea
                  rows={2}
                  required
                  value={expectedOutcome}
                  onChange={(e) => setExpectedOutcome(e.target.value)}
                  placeholder="What do you predict will happen in 3 to 12 months?"
                  className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-secondary-theme mb-1">
                  Actual Outcome (Post-Mortem Review)
                </label>
                <textarea
                  rows={2}
                  value={actualOutcome}
                  onChange={(e) => setActualOutcome(e.target.value)}
                  placeholder="Fill in later: What actually took place? What was unexpected?"
                  className="w-full px-3 py-2 rounded-xl bg-app border border-theme text-sm text-primary-theme focus:outline-hidden focus:border-accent-theme resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-secondary-theme mb-1">
                  Reflection Score ({reflectionRating || '-'}/5)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReflectionRating(reflectionRating === star ? undefined : star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= (reflectionRating || 0)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-secondary-theme/40'
                        }`}
                      />
                    </button>
                  ))}
                </div>
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
                  {editingDecision ? 'Save Changes' : 'Record Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

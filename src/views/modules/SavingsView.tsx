/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PiggyBank, Plus, TrendingUp, Calendar, Trash2, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SavingsGoal } from '../../types';
import { formatReadableDate, triggerCelebration } from '../../utils/helpers';
import { formatCurrency } from '../../utils/currency';

export const SavingsView: React.FC = () => {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, settings } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState<number | ''>('');
  const [currentAmount, setCurrentAmount] = useState<number | ''>('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('Safety');

  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<number | ''>('');

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoalId || depositAmount === '' || Number(depositAmount) <= 0) return;
    const goal = savingsGoals.find((g) => g.id === depositGoalId);
    if (!goal) return;

    const newCurrent = goal.currentAmount + Number(depositAmount);
    await updateSavingsGoal({
      ...goal,
      currentAmount: newCurrent,
    });

    if (newCurrent >= goal.targetAmount) {
      triggerCelebration();
    }

    setDepositGoalId(null);
    setDepositAmount('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || targetAmount === '') return;

    await addSavingsGoal({
      title: title.trim(),
      targetAmount: Number(targetAmount),
      currentAmount: currentAmount === '' ? 0 : Number(currentAmount),
      deadline: deadline || undefined,
      category,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme flex items-center gap-2">
            <PiggyBank className="w-7 h-7 text-accent-theme" /> Savings Goals & Reserves
          </h2>
          <p className="text-xs sm:text-sm text-secondary-theme mt-1">
            Build liquid buffers, fund dream projects, and monitor savings milestones.
          </p>
        </div>

        <button
          onClick={() => {
            setTitle('');
            setTargetAmount('');
            setCurrentAmount('');
            setDeadline('');
            setCategory('Safety');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:bg-accent-hover transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> New Savings Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {savingsGoals.map((g) => {
          const percent = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
          const isFunded = g.currentAmount >= g.targetAmount;

          return (
            <div
              key={g.id}
              className="bg-card-theme rounded-2xl border border-theme p-5 shadow-xs flex flex-col justify-between hover:border-strong-theme transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-secondary-theme text-secondary-theme">
                    {g.category}
                  </span>
                  {isFunded && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> 100% Funded
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-primary-theme mt-2">{g.title}</h3>

                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-extrabold text-lg text-primary-theme font-mono">
                      {formatCurrency(g.currentAmount, settings.currency)}
                    </span>
                    <span className="text-muted-theme font-mono">
                      of {formatCurrency(g.targetAmount, settings.currency)}
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-secondary-theme overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className={`h-full rounded-full transition-all duration-700 ${
                        isFunded ? 'bg-emerald-500' : 'bg-accent-theme'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-secondary-theme">
                    <span>{percent}% Saved</span>
                    <span>{formatCurrency(Math.max(0, g.targetAmount - g.currentAmount), settings.currency)} to go</span>
                  </div>
                </div>

                {g.deadline && (
                  <p className="text-[11px] text-secondary-theme mt-3 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-accent-theme" /> Target Date: {formatReadableDate(g.deadline)}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-theme flex items-center justify-between">
                <button
                  onClick={() => {
                    setDepositGoalId(g.id);
                    setDepositAmount('');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-accent-light-theme text-accent-theme text-xs font-semibold hover:bg-accent-theme hover:text-white transition-colors"
                >
                  + Add Deposit
                </button>

                <button
                  onClick={() => deleteSavingsGoal(g.id)}
                  className="p-1.5 rounded text-secondary-theme hover:text-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: New Goal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-modal-theme rounded-2xl border border-theme p-6 text-primary-theme shadow-2xl space-y-4">
            <h3 className="font-bold text-lg">Create Savings Goal</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rainy Day Fund or Down Payment"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-input-theme border border-theme text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Target Amount ({settings.currency})</label>
                  <input
                    type="number"
                    required
                    placeholder="10000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Current Saved ({settings.currency})</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Target Date</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-input-theme border border-theme text-xs"
                  />
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

      {/* Modal: Quick Deposit */}
      {depositGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-modal-theme rounded-2xl border border-theme p-6 text-primary-theme shadow-2xl space-y-4">
            <h3 className="font-bold text-base">Add Deposit to Goal</h3>
            <form onSubmit={handleDeposit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-secondary-theme uppercase mb-1">Deposit Amount ({settings.currency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  autoFocus
                  placeholder="250.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-input-theme border border-theme text-base font-bold font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDepositGoalId(null)}
                  className="px-3.5 py-1.5 rounded-xl text-xs text-secondary-theme hover:bg-card-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-accent-theme text-white text-xs font-semibold hover:bg-accent-hover"
                >
                  Confirm Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
